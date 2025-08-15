'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Calendar, BarChart3, AlertTriangle } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import ScoreCard from '../../../components/ScoreCard';

interface AssessmentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const AssessmentDetailsPage: React.FC<AssessmentDetailsPageProps> = ({ params }) => {
  const router = useRouter();
  const { assessments, getCurrentClassroom } = useApp();
  const currentClassroom = getCurrentClassroom();
  
  // Unwrap params using React.use()
  const { id } = React.use(params);
  const assessment = assessments.find(a => a.id.toString() === id);

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

  const RecommendationCard = ({ interpretation, type }: { interpretation: string; type: string }) => {
    const getRecommendation = () => {
      if (type === 'total') {
        switch (interpretation) {
          case 'ปกติ':
            return {
              title: "ภาพรวม: ปกติ",
              message: "นักเรียนมีพัฒนาการที่ดี ควรสนับสนุนต่อไป",
              color: "green"
            };
          case 'เสี่ยง':
            return {
              title: "ภาพรวม: เสี่ยง",
              message: "ควรติดตามอย่างใกล้ชิดและให้การสนับสนุน",
              color: "yellow"
            };
          case 'มีปัญหา':
            return {
              title: "ภาพรวม: มีปัญหา",
              message: "ควรได้รับการช่วยเหลือจากผู้เชี่ยวชาญ",
              color: "red"
            };
          default:
            return {
              title: "ไม่มีข้อมูล",
              message: "ยังไม่มีการประเมิน",
              color: "gray"
            };
        }
      }
      return { title: "", message: "", color: "gray" };
    };

    const rec = getRecommendation();
    
    return (
      <div className={`p-4 rounded-lg border ${
        rec.color === 'green' ? 'bg-green-50 border-green-200' :
        rec.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
        rec.color === 'red' ? 'bg-red-50 border-red-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <h4 className={`font-medium text-sm mb-2 ${
          rec.color === 'green' ? 'text-green-800' :
          rec.color === 'yellow' ? 'text-yellow-800' :
          rec.color === 'red' ? 'text-red-800' :
          'text-gray-800'
        }`}>
          {rec.title}
        </h4>
        <p className={`text-xs ${
          rec.color === 'green' ? 'text-green-700' :
          rec.color === 'yellow' ? 'text-yellow-700' :
          rec.color === 'red' ? 'text-red-700' :
          'text-gray-700'
        }`}>
          {rec.message}
        </p>
      </div>
    );
  };

  if (!assessment) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">ไม่พบข้อมูลการประเมิน</h2>
              <p className="text-slate-500 mb-4">การประเมินที่คุณต้องการดูอาจถูกลบแล้วหรือไม่มีอยู่</p>
              <button
                onClick={() => router.push('/students')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                กลับไปรายการนักเรียน
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                กลับ
              </button>
            </div>
            
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">ผลการประเมิน SDQ</h1>
              <div className="flex flex-wrap gap-4 text-slate-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span className="font-medium">นักเรียน:</span>
                  <span className="ml-1">{assessment.studentName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="font-medium">วันที่ประเมิน:</span>
                  <span className="ml-1">{new Date(assessment.completedDate || assessment.date).toLocaleDateString('th-TH')}</span>
                </div>
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  <span className="font-medium">ห้อง:</span>
                  <span className="ml-1">{currentClassroom.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">คะแนนและการแปลผล</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ScoreCard
                  title="พฤติกรรมช่วยเหลือ"
                  score={assessment.scores?.prosocial || 0}
                  interpretation={assessment.interpretations?.prosocial || ''}
                />
                <ScoreCard
                  title="คะแนนรวมปัญหา"
                  score={assessment.scores?.totalDifficulties || 0}
                  interpretation={assessment.interpretations?.totalDifficulties || ''}
                />
              </div>
            </div>

            {/* Impact Assessment Results */}
            {assessment.impactResponses && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">ผลการประเมินผลกระทบ</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-slate-700 mb-2">{impactQuestions.mainQuestion.text}</p>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <strong>คำตอบ:</strong> {assessment.impactResponses?.hasProblems === 1 ? 'มีปัญหา' : 'ไม่มีปัญหา'}
                    </p>
                  </div>

                  {assessment.impactResponses?.hasProblems === 1 && (
                    <>
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-slate-700 mb-3">คำถามเพิ่มเติม:</h4>
                      </div>
                      {impactQuestions.followUpQuestions.map((question) => (
                        <div key={question.id} className="bg-slate-50 p-3 rounded-lg">
                          <p className="font-medium text-slate-700 mb-2">{question.text}</p>
                          <p className="text-slate-600">
                            <strong>คำตอบ:</strong> {question.options.find(opt => 
                              opt.value === assessment.impactResponses?.[question.id as keyof typeof assessment.impactResponses]
                            )?.label || 'ไม่มีข้อมูล'}
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