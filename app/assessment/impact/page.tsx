'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../../contexts/AppContext';
import { impactQuestions } from '../../../constants/impactQuestion';
import { calculateScores, getInterpretation } from '../../../utils/sdqCalculations';

const ImpactAssessmentPage: React.FC = () => {
  const router = useRouter();
  const { 
    currentAssessment, 
    setCurrentAssessment, 
    getCurrentClassroom,
    saveAssessment 
  } = useApp();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);

  // Redirect if no current assessment
  useEffect(() => {
    if (!currentAssessment) {
      router.push('/students');
      return;
    }
  }, [currentAssessment, router]);

  // Prevent navigation away from assessment
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'การประเมินยังไม่เสร็จสิ้น ข้อมูลอาจสูญหาย';
    };

    const handlePopState = (e: PopStateEvent) => {
      const confirmLeave = confirm('การประเมินยังไม่เสร็จสิ้น ต้องการออกจากหน้านี้หรือไม่?');
      if (!confirmLeave) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      }
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

  if (!currentAssessment) {
    return null; // Will redirect
  }

  const impactResponses = currentAssessment.impactResponses || { hasProblems: -1 };

  const handleMainResponse = (value: number) => {
    const newImpactResponses = {
      hasProblems: value,
      ...(value > 0 ? {} : {}) // เคลียร์คำตอบอื่นๆ ถ้าตอบ "ไม่"
    };

    setCurrentAssessment({
      ...currentAssessment,
      impactResponses: newImpactResponses
    });

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

    setCurrentAssessment({
      ...currentAssessment,
      impactResponses: newImpactResponses
    });
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
    router.push('/results');
  };

  const handleBackToAssessment = () => {
    router.push('/assessment');
  };

  const currentFollowUpQuestion = impactQuestions.followUpQuestions[currentQuestionIndex];
  const isLastFollowUpQuestion = currentQuestionIndex === impactQuestions.followUpQuestions.length - 1;

  const getProgress = () => {
    if (impactResponses.hasProblems === -1) return 0;
    if (impactResponses.hasProblems === 0) return 100;
    
    const answeredFollowUps = impactQuestions.followUpQuestions.filter(q => 
      impactResponses[q.id as keyof typeof impactResponses] !== undefined
    ).length;
    
    return ((1 + answeredFollowUps) / (1 + impactQuestions.followUpQuestions.length)) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 md:bg-white">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">คำถามเพิ่มเติม - ประเมินผลกระทบ</h1>
          <div className="text-sm sm:text-base text-gray-600">
            <p className="mb-1 sm:mb-0">
              <span className="font-medium">นักเรียน:</span> {currentAssessment.studentName}
            </p>
            <p className="sm:inline sm:ml-4">
              <span className="font-medium">ห้อง:</span> {getCurrentClassroom().name}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <span className="text-sm font-medium text-gray-500">
                ความคืบหน้า
              </span>
              <span className="text-sm font-medium text-gray-500">
                {Math.round(getProgress())}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Main Question */}
          {impactResponses.hasProblems === -1 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-medium text-gray-800 mb-4 sm:mb-6 leading-relaxed">
                {impactQuestions.mainQuestion.text}
              </h2>

              <div className="space-y-3">
                {impactQuestions.mainQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMainResponse(option.value)}
                    className="w-full p-3 sm:p-4 text-left border-2 rounded-lg transition-colors border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95"
                  >
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-3"></div>
                      <span className="font-medium text-sm sm:text-base">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Show selected main answer */}
          {impactResponses.hasProblems !== -1 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-600 font-medium">คำตอบที่เลือก:</p>
              <p className="text-blue-800 text-sm sm:text-base">
                {impactQuestions.mainQuestion.options.find(o => o.value === impactResponses.hasProblems)?.label}
              </p>
            </div>
          )}

          {/* Follow-up Questions */}
          {showFollowUp && currentFollowUpQuestion && (
            <div className="mb-6 sm:mb-8">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">
                  คำถามที่ {currentQuestionIndex + 2} จาก {impactQuestions.followUpQuestions.length + 1}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-medium text-gray-800 mb-4 sm:mb-6 leading-relaxed">
                {currentFollowUpQuestion.text}
              </h2>

              <div className="space-y-3">
                {currentFollowUpQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFollowUpResponse(currentFollowUpQuestion.id, option.value)}
                    className={`w-full p-3 sm:p-4 text-left border-2 rounded-lg transition-colors active:scale-95 ${
                      impactResponses[currentFollowUpQuestion.id as keyof typeof impactResponses] === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        impactResponses[currentFollowUpQuestion.id as keyof typeof impactResponses] === option.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {impactResponses[currentFollowUpQuestion.id as keyof typeof impactResponses] === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="font-medium text-sm sm:text-base">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            {showFollowUp ? (
              <>
                <button
                  onClick={currentQuestionIndex === 0 ? () => {
                    setShowFollowUp(false);
                    setCurrentAssessment({
                      ...currentAssessment,
                      impactResponses: { hasProblems: -1 }
                    });
                  } : prevFollowUpQuestion}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {currentQuestionIndex === 0 ? 'กลับไปคำถามแรก' : 'ย้อนกลับ'}
                </button>

                {isLastFollowUpQuestion ? (
                  <button
                    onClick={handleSaveAssessment}
                    disabled={!isCompleted()}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    เสร็จสิ้น
                  </button>
                ) : (
                  <button
                    onClick={nextFollowUpQuestion}
                    disabled={impactResponses[currentFollowUpQuestion.id as keyof typeof impactResponses] === undefined}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ถัดไป
                  </button>
                )}
              </>
            ) : (
              <>
                {/* ปุ่มย้อนกลับ - แสดงเมื่อตอบคำถามหลักแล้ว */}
                {impactResponses.hasProblems !== -1 ? (
                  <button
                    onClick={() => {
                      setCurrentAssessment({
                        ...currentAssessment,
                        impactResponses: { hasProblems: -1 }
                      });
                    }}
                    className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ย้อนกลับ
                  </button>
                ) : (
                  <button
                    onClick={handleBackToAssessment}
                    className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    กลับไปแก้ไข SDQ
                  </button>
                )}

                {impactResponses.hasProblems === 0 && (
                  <button
                    onClick={handleSaveAssessment}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    เสร็จสิ้น
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactAssessmentPage;