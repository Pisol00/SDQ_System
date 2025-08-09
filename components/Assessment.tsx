import React, { useState } from 'react';
import { sdqQuestions, responseOptions } from './constants/sdqQuestions';
import { Assessment, Classroom } from './types';

interface AssessmentPageProps {
  currentAssessment: Assessment;
  setCurrentAssessment: (assessment: Assessment) => void;
  getCurrentClassroom: () => Classroom;
  onMoveToImpactAssessment: () => void;
}

const AssessmentPage: React.FC<AssessmentPageProps> = ({
  currentAssessment,
  setCurrentAssessment,
  getCurrentClassroom,
  onMoveToImpactAssessment
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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

  const isLastQuestion = currentQuestionIndex === sdqQuestions.length - 1;
  const canFinish = Object.keys(currentAssessment.responses).length === sdqQuestions.length;
  const progress = ((currentQuestionIndex + 1) / sdqQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 md:bg-white">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">แบบประเมิน SDQ</h1>
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
          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <span className="text-sm font-medium text-gray-500">
                คำถามที่ {currentQuestionIndex + 1} จาก {sdqQuestions.length}
              </span>
              <span className="text-sm font-medium text-gray-500">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-medium text-gray-800 mb-4 sm:mb-6 leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {responseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleResponse(option.value)}
                  className={`w-full p-3 sm:p-4 text-left border-2 rounded-lg transition-colors active:scale-95 ${
                    currentAssessment.responses[currentQuestion.id] === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      currentAssessment.responses[currentQuestion.id] === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
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
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ก่อนหน้า
            </button>

            {isLastQuestion ? (
              <button
                onClick={onMoveToImpactAssessment}
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