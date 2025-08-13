import React from 'react';

interface ScoreCardProps {
  title: string;
  score: number;
  interpretation: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, interpretation }) => {
  const getScoreColor = (interpretation: string) => {
    switch (interpretation) {
      case 'ปกติ': return 'text-green-600 bg-green-50 border-green-200';
      case 'เสี่ยง': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'มีปัญหา': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getInterpretationBadge = (interpretation: string) => {
    switch (interpretation) {
      case 'ปกติ': return 'bg-green-100 text-green-800';
      case 'เสี่ยง': return 'bg-yellow-100 text-yellow-800';
      case 'มีปัญหา': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getScoreColor(interpretation)}`}>
      <div className="text-center">
        <h4 className="text-sm font-medium text-slate-700 mb-2">{title}</h4>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-bold text-slate-800">{score}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInterpretationBadge(interpretation)}`}>
            {interpretation}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;