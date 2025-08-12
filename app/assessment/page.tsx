'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { sdqQuestions, responseOptions } from '../../constants/sdqQuestions';
import { toast } from 'sonner';
import { LoadingSpinner } from '../../components/LazyComponents';
import { useProgressiveLoading } from '../../components/LazyWrapper';

// Question Component with enhanced animations
const QuestionCard = ({ 
  question, 
  currentValue, 
  onResponse, 
  isVisible = true 
}: {
  question: any;
  currentValue?: number;
  onResponse: (value: number) => void;
  isVisible?: boolean;
}) => {
  const [selectedValue, setSelectedValue] = useState<number | undefined>(currentValue);

  useEffect(() => {
    setSelectedValue(currentValue);
  }, [currentValue]);

  const handleSelect = (value: number) => {
    setSelectedValue(value);
    onResponse(value);
  };

  if (!isVisible) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="h-6 bg-slate-300 rounded mb-6 w-3/4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <h2 className="text-lg sm:text-xl font-medium text-slate-800 mb-6 leading-relaxed">
        {question.text}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {responseOptions.map((option, index) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 ${
              selectedValue === option.value
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: isVisible ? 'slideInUp 0.5s ease-out forwards' : 'none'
            }}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                selectedValue === option.value
                  ? 'border-blue-500 bg-blue-500 scale-110'
                  : 'border-slate-300'
              }`}>
                {selectedValue === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="font-medium text-sm sm:text-base">{option.label}</span>
            </div>
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Progress Bar Component with enhanced animations
const ProgressBar = ({ progress, currentQuestion, totalQuestions }: {
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <span className="text-sm font-medium text-slate-600">
          คำถามที่ {currentQuestion + 1} จาก {totalQuestions}
        </span>
        <span className="text-sm font-medium text-slate-600">
          {Math.round(animatedProgress)}%
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${animatedProgress}%` }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Navigation Buttons Component
const NavigationButtons = ({
  onPrev,
  onNext,
  onFinish,
  canPrev,
  canNext,
  canFinish,
  isLastQuestion
}: {
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  canPrev: boolean;
  canNext: boolean;
  canFinish: boolean;
  isLastQuestion: boolean;
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3">
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
      >
        ก่อนหน้า
      </button>

      {isLastQuestion ? (
        <button
          onClick={onFinish}
          disabled={!canFinish}
          className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
        >
          ไปยังคำถามเพิ่มเติม
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canNext}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
        >
          ถัดไป
        </button>
      )}
    </div>
  );
};

const AssessmentPage: React.FC = () => {
  const router = useRouter();
  const { currentAssessment, setCurrentAssessment, getCurrentClassroom } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [questionVisible, setQuestionVisible] = useState(false);
  
  // Use progressive loading
  const { currentStep, isComplete } = useProgressiveLoading(2);

  // Redirect if no current assessment
  useEffect(() => {
    if (!currentAssessment) {
      router.push('/students');
      return;
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setQuestionVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentAssessment, router]);

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

  // Handle question changes with animation
  useEffect(() => {
    setQuestionVisible(false);
    const timer = setTimeout(() => setQuestionVisible(true), 200);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex]);

  if (!currentAssessment || isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <LoadingSpinner message="กำลังเตรียมแบบประเมิน..." />
      </div>
    );
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
    toast.success('SDQ เสร็จสิ้น กำลังไปยังคำถามเพิ่มเติม');
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
          <Suspense fallback={<div className="h-16 bg-slate-100 animate-pulse rounded mb-6"></div>}>
            <ProgressBar 
              progress={progress}
              currentQuestion={currentQuestionIndex}
              totalQuestions={sdqQuestions.length}
            />
          </Suspense>

          {/* Question Section */}
          <Suspense fallback={<LoadingSpinner />}>
            <QuestionCard
              question={currentQuestion}
              currentValue={currentAssessment.responses[currentQuestion.id]}
              onResponse={handleResponse}
              isVisible={questionVisible && isComplete}
            />
          </Suspense>

          {/* Navigation Buttons */}
          <Suspense fallback={<div className="h-12 bg-slate-100 animate-pulse rounded"></div>}>
            <NavigationButtons
              onPrev={prevQuestion}
              onNext={nextQuestion}
              onFinish={moveToImpactAssessment}
              canPrev={currentQuestionIndex > 0}
              canNext={currentAssessment.responses[currentQuestion.id] !== undefined}
              canFinish={canFinish}
              isLastQuestion={isLastQuestion}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;