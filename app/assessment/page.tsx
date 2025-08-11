'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { sdqQuestions, responseOptions } from '../../constants/sdqQuestions';

const AssessmentPage: React.FC = () => {
  const router = useRouter();
  const { currentAssessment, setCurrentAssessment, getCurrentClassroom } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  const currentQuestion = sdqQuestions[currentQuestionIndex];
  
  const handleResponse = (value: number) => {
    setCurrentAssessment({
      ...currentAssessment,
      responses: {
        ...currentAssessment.responses,
        [currentQuestion.id]: value
      }
    });
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

  const moveToImpactAssessment = () => {
    router.push('/assessment/impact');
  };

  const isLastQuestion = currentQuestionIndex === sdqQuestions.length - 1;
  const canFinish = Object.keys(currentAssessment.responses).length === sdqQuestions.length;
  const progress = ((currentQuestionIndex + 1) / sdqQuestions.length) * 100;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">แบบประเมิน SDQ</h1>
              <div className="text-slate-600 space-y-1 sm:space-y-0">
                <p className="sm:inline">
                  <span className="font-medium">นักเรียน:</span> {currentAssessment.studentName}
                </p>
                <p className="sm:inline sm:ml-4">
                  <span className="font-medium">ห้อง:</span> {getCurrentClassroom().name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <span className="text-sm font-medium text-slate-600">
                คำถามที่ {currentQuestionIndex + 1} จาก {sdqQuestions.length}
              </span>
              <span className="text-sm font-medium text-slate-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Section */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-medium text-slate-800 mb-6 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {responseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleResponse(option.value)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 active:scale-95 ${
                    currentAssessment.responses[currentQuestion.id] === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      currentAssessment.responses[currentQuestion.id] === option.value
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
                onClick={moveToImpactAssessment}
                disabled={!canFinish}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ไปยังคำถามเพิ่มเติม
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={currentAssessment.responses[currentQuestion.id] === undefined}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;