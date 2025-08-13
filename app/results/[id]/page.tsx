'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Calendar, BarChart3, AlertTriangle } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import ScoreCard from '../../../components/ScoreCard';

interface AssessmentDetailsPageProps {
  params: {
    id: string;
  };
}

const AssessmentDetailsPage: React.FC<AssessmentDetailsPageProps> = ({ params }) => {
  const router = useRouter();
  const { assessments, getCurrentClassroom } = useApp();
  const currentClassroom = getCurrentClassroom();
  
  const assessment = assessments.find(a => a.id.toString() === params.id);

  // ข้อมูลคำถามเพิ่มเติม (impact questions) - คุณอาจต้องย้ายไปไฟล์ constants
  const impactQuestions = {
    mainQuestion: {
      text: "โดยรวมแล้ว คุณคิดว่านักเรียนคนนี้มีปัญหาในด้านใดด้านหนึ่งหรือมากกว่านั้นเกี่ยวกับอารมณ์ ความเข้มข้น การมีสมาธิ พฤติกรรม หรือการเข้ากับคนอื่น?"
    },
    followUpQuestions: [
      {
        id: 'duration',
        text: "ปัญหาเหล่านี้เกิดขึ้นมานานแค่ไหน?",
        options: [
          { value: 0, label: "น้อยกว่า 1 เดือน" },
          { value: 1, label: "1-5 เดือน" },
          { value: 2, label: "6-12 เดือน" },
          { value: 3, label: "มากกว่า 1 ปี" }
        ]
      },
      {
        id: 'distress',
        text: "ปัญหาเหล่านี้ทำให้นักเรียนผิดหวัง หรือเศร้าใจหรือไม่?",
        options: [
          { value: 0, label: "ไม่เลย" },
          { value: 1, label: "เพียงเล็กน้อย" },
          { value: 2, label: "ปานกลาง" },
          { value: 3, label: "มาก" }
        ]
      },
      {
        id: 'impactFriends',
        text: "ปัญหาเหล่านี้ส่งผลต่อมิตรภาพของนักเรียนหรือไม่?",
        options: [
          { value: 0, label: "ไม่เลย" },
          { value: 1, label: "เพียงเล็กน้อย" },
          { value: 2, label: "ปานกลาง" },
          { value: 3, label: "มาก" }
        ]
      },
      {
        id: 'impactLearning',
        text: "ปัญหาเหล่านี้ส่งผลต่อการเรียนของนักเรียนหรือไม่?",
        options: [
          { value: 0, label: "ไม่เลย" },
          { value: 1, label: "เพียงเล็กน้อย" },
          { value: 2, label: "ปานกลาง" },
          { value: 3, label: "มาก" }
        ]
      },
      {
        id: 'burdenOthers',
        text: "ปัญหาเหล่านี้เป็นภาระต่อคุณหรือครอบครัวโดยรวมหรือไม่?",
        options: [
          { value: 0, label: "ไม่เลย" },
          { value: 1, label: "เพียงเล็กน้อย" },
          { value: 2, label: "ปานกลาง" },
          { value: 3, label: "มาก" }
        ]
      }
    ]
  };

  if (!assessment) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">ไม่พบผลการประเมิน</h2>
              <p className="text-slate-500 mb-4">ผลการประเมินที่คุณต้องการดูอาจถูกลบแล้วหรือไม่มีอยู่</p>
              <button
                onClick={() => router.push('/results')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                กลับไปรายการผลการประเมิน
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const RecommendationCard = ({ interpretation, type }: { interpretation: string; type: string }) => {
    if (interpretation === 'มีปัญหา') {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium text-sm sm:text-base">ควรส่งต่อเพื่อการประเมินเพิ่มเติม</p>
          <p className="text-red-700 text-xs sm:text-sm mt-1">
            นักเรียนมีคะแนนในระดับที่ต้องได้รับการดูแลเป็นพิเศษ ควรปรึกษานักจิตวิทยาโรงเรียนหรือผู้เชี่ยวชาญ
          </p>
        </div>
      );
    }
    
    if (interpretation === 'เสี่ยง') {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium text-sm sm:text-base">ควรติดตามอย่างใกล้ชิด</p>
          <p className="text-yellow-700 text-xs sm:text-sm mt-1">
            นักเรียนอยู่ในกลุ่มเสี่ยง ควรมีการติดตามและสังเกตพฤติกรรมอย่างต่อเนื่อง
          </p>
        </div>
      );
    }

    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium text-sm sm:text-base">อยู่ในเกณฑ์ปกติ</p>
        <p className="text-green-700 text-xs sm:text-sm mt-1">
          นักเรียนมีพัฒนาการทางจิตใจในเกณฑ์ปกติ ควรส่งเสริมจุดแข็งต่อไป
        </p>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับ
            </button>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  ผลการประเมิน SDQ
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{assessment.studentName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(assessment.completedDate || '').toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>ห้อง {currentClassroom.name}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/results/student/${assessment.studentId}`)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  ดูประวัติทั้งหมด
                </button>
                <button
                  onClick={() => router.push('/results')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  ดูรายการทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scores Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* SDQ Scores */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">คะแนน SDQ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ScoreCard
                  title="ปัญหาทางอารมณ์"
                  score={assessment.scores?.emotional || 0}
                  interpretation={assessment.interpretations?.emotional || ''}
                />
                <ScoreCard
                  title="ปัญหาความประพฤติ"
                  score={assessment.scores?.conduct || 0}
                  interpretation={assessment.interpretations?.conduct || ''}
                />
                <ScoreCard
                  title="ไม่อยู่นิ่ง/ไม่ตั้งใจ"
                  score={assessment.scores?.hyperactivity || 0}
                  interpretation={assessment.interpretations?.hyperactivity || ''}
                />
                <ScoreCard
                  title="ปัญหาเพื่อน"
                  score={assessment.scores?.peer || 0}
                  interpretation={assessment.interpretations?.peer || ''}
                />
              </div>
              
              {/* Total Difficulties Score */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-slate-600 text-sm mb-2">คะแนนปัญหารวม</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl font-bold text-slate-800">
                        {assessment.scores?.totalDifficulties}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        assessment.interpretations?.totalDifficulties === 'ปกติ' ? 'bg-green-100 text-green-800' :
                        assessment.interpretations?.totalDifficulties === 'เสี่ยง' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {assessment.interpretations?.totalDifficulties}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Prosocial Score */}
              <div className="mt-4">
                <ScoreCard
                  title="พฤติกรรมช่วยเหลือสังคม"
                  score={assessment.scores?.prosocial || 0}
                  interpretation={assessment.interpretations?.prosocial || ''}
                />
              </div>
            </div>

            {/* Impact Assessment */}
            {assessment.impactResponses && assessment.impactResponses.hasProblems !== -1 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">การประเมินผลกระทบ</h3>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">
                      {impactQuestions.mainQuestion.text}
                    </p>
                    <p className="font-medium text-slate-800">
                      {assessment.impactResponses.hasProblems === 1 ? 'มีปัญหา' : 'ไม่มีปัญหา'}
                    </p>
                  </div>

                  {assessment.impactResponses.hasProblems === 1 && (
                    <>
                      {impactQuestions.followUpQuestions.map((question) => (
                        <div key={question.id} className="bg-slate-50 p-4 rounded-lg">
                          <p className="text-sm text-slate-600 mb-2">{question.text}</p>
                          <p className="font-medium text-slate-800">
                            {question.options.find(
                              o => o.value === assessment.impactResponses?.[question.id as keyof typeof assessment.impactResponses]
                            )?.label}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">คำแนะนำ</h3>
              
              <div className="space-y-4">
                <RecommendationCard 
                  interpretation={assessment.interpretations?.totalDifficulties || ''} 
                  type="total" 
                />
                
                {assessment.interpretations?.emotional === 'มีปัญหา' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 font-medium text-sm">ปัญหาทางอารมณ์</p>
                    <p className="text-blue-700 text-xs mt-1">
                      สังเกตอาการเศร้า กังวล หรือความกลัวผิดปกติ
                    </p>
                  </div>
                )}
                
                {assessment.interpretations?.conduct === 'มีปัญหา' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 font-medium text-sm">ปัญหาความประพฤติ</p>
                    <p className="text-blue-700 text-xs mt-1">
                      ติดตามพฤติกรรมก้าวร้าวหรือการแสดงออกที่ไม่เหมาะสม
                    </p>
                  </div>
                )}
                
                {assessment.interpretations?.hyperactivity === 'มีปัญหา' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 font-medium text-sm">ไม่อยู่นิ่ง/ไม่ตั้งใจ</p>
                    <p className="text-blue-700 text-xs mt-1">
                      จัดกิจกรรมที่ช่วยในการโฟกัสและควบคุมตนเอง
                    </p>
                  </div>
                )}
                
                {assessment.interpretations?.peer === 'มีปัญหา' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 font-medium text-sm">ปัญหาเพื่อน</p>
                    <p className="text-blue-700 text-xs mt-1">
                      ส่งเสริมทักษะสังคมและการทำงานเป็นทีม
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetailsPage;