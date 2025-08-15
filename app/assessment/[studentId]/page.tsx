'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { sdqQuestions, responseOptions } from '@/constants/sdqQuestions';
import { toast } from 'sonner';

interface AssessmentPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

const AssessmentPage: React.FC<AssessmentPageProps> = ({ params }) => {
  const router = useRouter();
  const {
    students,
    assessments,
    getCurrentClassroom,
    getOrCreateAssessment,
    updateAssessment
  } = useApp();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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

    setStudent(foundStudent);

    // ✅ เช็คก่อนว่ามี assessment ที่เสร็จแล้วหรือยัง
    const completedAssessment = assessments.find(a =>
      a.studentId === foundStudent.id && a.completed
    );

    if (completedAssessment) {
      // ถ้ามี assessment ที่เสร็จแล้ว ให้ไปหน้า results
      toast.success(`${foundStudent.name} ได้ทำการประเมินเรียบร้อยแล้ว`);
      router.push(`/results/${completedAssessment.id}`);
      return;
    }

    // ✅ ใช้ getOrCreateAssessment แทนการสร้างเอง
    const assessment = getOrCreateAssessment(foundStudent);
    setCurrentAssessmentLocal(assessment);

  }, [studentId, students, assessments, router, getOrCreateAssessment]);

  // Prevent navigation away from assessment
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'การประเมินยังไม่เสร็จสิ้น ข้อมูลอาจสูญหาย';
    };

    const handlePopState = (e: PopStateEvent) => {
      toast('การประเมินยังไม่เสร็จสิ้น', {
        description: 'ต้องการออกจากหน้านี้หรือไม่?',
        action: {
          label: 'ออกจากหน้า',
          onClick: () => {
            // ปล่อยให้ navigation เกิดขึ้น
          }
        },
        cancel: {
          label: 'ยกเลิก',
          onClick: () => {
            e.preventDefault();
            window.history.pushState(null, '', window.location.href);
          }
        }
      });
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

  const currentQuestion = sdqQuestions[currentQuestionIndex];

  const handleResponse = (value: number) => {
    const updatedAssessment = {
      ...currentAssessment,
      responses: {
        ...currentAssessment.responses,
        [currentQuestion.id]: value
      }
    };

    setCurrentAssessmentLocal(updatedAssessment);
    updateAssessment(updatedAssessment);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < sdqQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isAnswered = currentAssessment.responses[currentQuestion.id] !== undefined;
  const isLastQuestion = currentQuestionIndex === sdqQuestions.length - 1;
  const allQuestionsAnswered = sdqQuestions.every(q =>
    currentAssessment.responses[q.id] !== undefined
  );

  const progress = ((currentQuestionIndex + (isAnswered ? 1 : 0)) / sdqQuestions.length) * 100;

  const handleFinishSDQ = () => {
    if (allQuestionsAnswered) {
      router.push(`/assessment/${studentId}/impact`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">แบบประเมิน SDQ</h1>
              <div className="text-slate-600 space-y-1 sm:space-y-0">
                <p className="sm:inline">
                  <span className="font-medium">นักเรียน:</span> {student.name}
                </p>
                <p className="sm:inline sm:ml-4">
                  <span className="font-medium">ห้อง:</span> {getCurrentClassroom().name}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">ความคืบหน้า</span>
                <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                คำถามที่ {currentQuestionIndex + 1}
              </h2>
              <span className="text-sm text-slate-500">
                {currentQuestionIndex + 1} จาก {sdqQuestions.length}
              </span>
            </div>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              {currentQuestion.text}
            </p>

            {/* Answer Options */}
            <div className="space-y-3">
              {responseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleResponse(option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${currentAssessment.responses[currentQuestion.id] === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${currentAssessment.responses[currentQuestion.id] === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-300'
                      }`}>
                      {currentAssessment.responses[currentQuestion.id] === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium text-sm sm:text-base">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ก่อนหน้า
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleFinishSDQ}
                disabled={!allQuestionsAnswered}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${allQuestionsAnswered
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
              >
                ไปคำถามเพิ่มเติม
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={!isAnswered}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${isAnswered
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
              >
                ถัดไป
              </button>
            )}
          </div>

          {/* Question Counter */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="text-center text-sm text-slate-600">
              ตอบแล้ว {Object.keys(currentAssessment.responses).length} จาก {sdqQuestions.length} คำถาม
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;