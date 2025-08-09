import { sdqQuestions } from '../constants/sdqQuestions';
import { SDQScores, SDQInterpretations } from '../types';

// Calculate SDQ scores
export const calculateScores = (responses: Record<number, number>): SDQScores => {
  const scores: SDQScores = {
    emotional: 0,
    conduct: 0,
    hyperactivity: 0,
    peer: 0,
    prosocial: 0,
    totalDifficulties: 0
  };

  sdqQuestions.forEach(question => {
    const response = responses[question.id] || 0;
    const score = question.reverse ? 2 - response : response;
    
    if (question.category === 'prosocial') {
      scores.prosocial += score;
    } else {
      scores[question.category as keyof Omit<SDQScores, 'prosocial' | 'totalDifficulties'>] += score;
    }
  });

  scores.totalDifficulties = scores.emotional + scores.conduct + scores.hyperactivity + scores.peer;
  return scores;
};

// Get interpretation for scores (Updated Thai SDQ Criteria - Final Version)
export const getInterpretation = (scores: SDQScores): SDQInterpretations => {
  const interpretations: SDQInterpretations = {
    // 1. คะแนนพฤติกรรมด้านอารมณ์: 0-3 (ปกติ), 4 (เสี่ยง), 5-10 (มีปัญหา)
    emotional: scores.emotional <= 3 ? 'ปกติ' : scores.emotional === 4 ? 'เสี่ยง' : 'มีปัญหา',
    
    // 2. คะแนนพฤติกรรมเกเร/ความประพฤติ: 0-3 (ปกติ), 4 (เสี่ยง), 5-10 (มีปัญหา)
    conduct: scores.conduct <= 3 ? 'ปกติ' : scores.conduct === 4 ? 'เสี่ยง' : 'มีปัญหา',
    
    // 3. คะแนนพฤติกรรมไม่อยู่นิ่ง/สมาธิสั้น: 0-5 (ปกติ), 6 (เสี่ยง), 7-10 (มีปัญหา)
    hyperactivity: scores.hyperactivity <= 5 ? 'ปกติ' : scores.hyperactivity === 6 ? 'เสี่ยง' : 'มีปัญหา',
    
    // 4. คะแนนพฤติกรรมด้านความสัมพันธ์กับเพื่อน: 0-5 (ปกติ), 6 (เสี่ยง), 7-10 (มีปัญหา)
    peer: scores.peer <= 5 ? 'ปกติ' : scores.peer === 6 ? 'เสี่ยง' : 'มีปัญหา',
    
    // 5. คะแนนพฤติกรรมด้านสัมพันธภาพทางสังคม: 4-10 (ปกติ), 3 (เสี่ยง), 0-2 (มีปัญหา)
    prosocial: scores.prosocial >= 4 ? 'ปกติ' : scores.prosocial === 3 ? 'เสี่ยง' : 'มีปัญหา',
    
    // คะแนนรวมพฤติกรรมแต่ละด้าน: 0-15 (ปกติ), 16-17 (เสี่ยง), 18-40 (มีปัญหา)
    totalDifficulties: scores.totalDifficulties <= 15 ? 'ปกติ' : scores.totalDifficulties <= 17 ? 'เสี่ยง' : 'มีปัญหา'
  };
  return interpretations;
};

// Calculate age from birth date
export const calculateAge = (birthDateStr: any): string => {
  if (!birthDateStr) return '';
  
  try {
    let birthDate: Date | null = null;
    
    // Check if it's a string format (DD/MM/YYYY)
    if (typeof birthDateStr === 'string' && birthDateStr.includes('/')) {
      const parts = birthDateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const yearBE = parseInt(parts[2]); // ปี พ.ศ.
        const yearAD = yearBE - 543; // แปลงเป็น ค.ศ.
        birthDate = new Date(yearAD, month - 1, day);
      }
    } else {
      // If it's already a Date object or timestamp
      birthDate = new Date(birthDateStr);
    }
    
    if (birthDate && !isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age.toString();
    }
  } catch (error) {
    console.log('Error calculating age for:', birthDateStr);
  }
  
  return '';
};