// app/assessment/[studentId]/impact/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { impactQuestions } from '@/constants/impactQuestion';
import { calculateScores, getInterpretation } from '@/utils/sdqCalculations';
import { showToast } from '@/utils/toast';

interface ImpactAssessmentPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

const ImpactAssessmentPage: React.FC<ImpactAssessmentPageProps> = ({ params }) => {
  const router = useRouter();
  const { 
    students,
    getCurrentClassroom,
    getAssessmentByStudentId,
    updateAssessment,
    saveAssessment 
  } = useApp();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [currentAssessment, setCurrentAssessmentLocal] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);

  // Unwrap params
  const { studentId } = React.use(params);

  // Load student and assessment data
  useEffect(() => {
    const foundStudent = students.find(s => s.id.toString() === studentId);
    if (!foundStudent) {
      router.push('/students');
      return;
    }

    const assessment = getAssessmentByStudentId(foundStudent.id);
    if (!assessment) {
      router.push(`/assessment/${studentId}`);
      return;
    }

    setStudent(foundStudent);
    setCurrentAssessmentLocal(assessment);
  }, [studentId, students, getAssessmentByStudentId, router]);

  // Prevent navigation away from assessment
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'การประเมินยังไม่เสร็จสิ้น ข้อมูลอาจสูญหาย';
    };

    const handlePopState = (e: PopStateEvent) => {
      showToast.navConfirm(() => {
        // ปล่อยให้ navigation เกิดขึ้น
      });
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // Add state to prevent back navigation
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (!currentAssessment || !student) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const impactResponses = currentAssessment.impactResponses || { hasProblems: -1 };

  const handleMainResponse = (value: number) => {
    const newImpactResponses = {
      hasProblems: value,
      ...(value > 0 ? {} : {}) // เคลียร์คำตอบอื่นๆ ถ้าตอบ "ไม่"
    };

    const updatedAssessment = {
      ...currentAssessment,
      impactResponses: newImpactResponses
    };

    setCurrentAssessmentLocal(updatedAssessment);
    updateAssessment(updatedAssessment);

    if (value === 0) {
      // ถ้าตอบ "ไม่" ให้เสร็จสิ้นทันที
      setShowFollowUp(false);
    } else {
      // ถ้าตอบ "ใช่" ให้แสดงคำถามต่อเนื่อง
      setShowFollowUp(true);
      setCurrentQuestionIndex(0);
    }
  };

  const handleFollowUpResponse = (questionId: string, value: number) => {
    const newImpactResponses = {
      ...impactResponses,
      [questionId]: value
    };

    const updatedAssessment = {
      ...currentAssessment,
      impactResponses: newImpactResponses
    };

    setCurrentAssessmentLocal(updatedAssessment);
    updateAssessment(updatedAssessment);
  };

  const nextFollowUpQuestion = () => {
    if (currentQuestionIndex < impactQuestions.followUpQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevFollowUpQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isCompleted = () => {
    if (impactResponses.hasProblems === 0) {
      return true; // ถ้าตอบ "ไม่" ถือว่าเสร็จ
    }
    if (impactResponses.hasProblems > 0) {
      // ตรวจสอบว่าตอบครบทุกข้อหรือยัง
      return impactQuestions.followUpQuestions.every(q => 
        impactResponses[q.id as keyof typeof impactResponses] !== undefined
      );
    }
    return false;
  };

  const handleSaveAssessment = () => {
    if (!currentAssessment) return;

    // Calculate scores and interpretations
    const scores = calculateScores(currentAssessment.responses);
    const interpretations = getInterpretation(scores);

    const completedAssessment = {
      ...currentAssessment,
      completed: true,
      scores,
      interpretations,
      completedDate: new Date().toISOString()
    };

    saveAssessment(completedAssessment);
    router.push(`/results/${completedAssessment.id}`);
  };

  const getProgress = () => {
    if (impactResponses.hasProblems === -1) return 0;
    if (impactResponses.hasProblems === 0) return 100;
    
    const answeredQuestions = impactQuestions.followUpQuestions.filter(q => 
      impactResponses[q.id as keyof typeof impactResponses] !== undefined
    ).length;
    
    return ((answeredQuestions + 1) / (impactQuestions.followUpQuestions.length + 1)) * 100;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">คำถามเพิ่มเติม</h1>
              <div className="text-slate-600 space-y-1 sm:space-y-0">
                <p className="sm:inline">
                  <span className="font-medium">นักเรียน:</span> {student.name}
                </p>
                <p className="sm:inline sm:ml-4">
                  <span className="font-medium">ห้อง:</span> {getCurrentClassroom().name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <span className="text-sm font-medium text-slate-600">
                ความคืบหน้า
              </span>
              <span className="text-sm font-medium text-slate-600">
                {Math.round(getProgress())}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Main Question */}
          {impactResponses.hasProblems === -1 && (
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl font-medium text-slate-800 mb-6 leading-relaxed">
                {impactQuestions.mainQuestion.text}
              </h2>

              <div className="space-y-3">
                {impactQuestions.mainQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMainResponse(option.value)}
                    className="w-full p-4 text-left border-2 rounded-lg transition-all duration-200 active:scale-95 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 mr-3"></div>
                      <span className="font-medium text-sm sm:text-base">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Questions */}
          {showFollowUp && (
            <div className="mb-8">
              <div className="mb-4">
                <span className="text-sm font-medium text-slate-600">
                  คำถามที่ {currentQuestionIndex + 2} จาก {impactQuestions.followUpQuestions.length + 1}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-medium text-slate-800 mb-6 leading-relaxed">
                {impactQuestions.followUpQuestions[currentQuestionIndex].text}
              </h2>

              <div className="space-y-3">
                {impactQuestions.followUpQuestions[currentQuestionIndex].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFollowUpResponse(
                      impactQuestions.followUpQuestions[currentQuestionIndex].id, 
                      option.value
                    )}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 active:scale-95 ${
                      impactResponses[impactQuestions.followUpQuestions[currentQuestionIndex].id as keyof typeof impactResponses] === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        impactResponses[impactQuestions.followUpQuestions[currentQuestionIndex].id as keyof typeof impactResponses] === option.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                      }`}>
                        {impactResponses[impactQuestions.followUpQuestions[currentQuestionIndex].id as keyof typeof impactResponses] === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="font-medium text-sm sm:text-base">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Follow-up Navigation */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                <button
                  onClick={prevFollowUpQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ก่อนหน้า
                </button>

                {currentQuestionIndex === impactQuestions.followUpQuestions.length - 1 ? (
                  <button
                    onClick={handleSaveAssessment}
                    disabled={!isCompleted()}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    เสร็จสิ้นการประเมิน
                  </button>
                ) : (
                  <button
                    onClick={nextFollowUpQuestion}
                    disabled={impactResponses[impactQuestions.followUpQuestions[currentQuestionIndex].id as keyof typeof impactResponses] === undefined}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ถัดไป
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Complete Assessment Button for "No Problems" */}
          {impactResponses.hasProblems === 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveAssessment}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                เสร็จสิ้นการประเมิน
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImpactAssessmentPage;