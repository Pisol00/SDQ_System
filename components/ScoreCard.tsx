import React from 'react';

interface ScoreCardProps {
  title: string;
  score: number;
  interpretation: string;
  maxScore: number;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, interpretation, maxScore }) => {
  const getInterpretationStyle = (interpretation: string) => {
    switch (interpretation) {
      case 'ปกติ':
        return 'bg-green-100 text-green-800';
      case 'เสี่ยง':
        return 'bg-yellow-100 text-yellow-800';
      case 'มีปัญหา':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-800 mb-2 text-sm sm:text-base leading-tight">{title}</h3>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl sm:text-2xl font-bold text-gray-900">{score}</span>
        <span className="text-xs sm:text-sm text-gray-500">/ {maxScore}</span>
      </div>
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getInterpretationStyle(interpretation)}`}>
        {interpretation}
      </span>
    </div>
  );
};

export default ScoreCard;