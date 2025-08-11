'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, ArrowLeft } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Assessment } from '../../contexts/AppContext';
import { impactQuestions } from '../../constants/impactQuestion';
import ScoreCard from '../../components/ScoreCard';

const ResultsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getClassroomAssessments, getCurrentClassroom } = useApp();
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  
  const classroomAssessments = getClassroomAssessments();
  const currentClassroom = getCurrentClassroom();
  
  // Filter by student if specified in URL
  const studentFilter = searchParams.get('student');
  const filteredAssessments = studentFilter 
    ? classroomAssessments.filter(a => a.studentId.toString() === studentFilter)
    : classroomAssessments;

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

  if (selectedAssessment) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors text-sm sm:text-base"
              >
                <ArrowLeft className="h-4 w-4" />
                กลับไปรายการผล
              </button>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">ผลการประเมิน SDQ</h1>
                  <div className="text-slate-600 space-y-1 sm:space-y-0">
                    <p className="sm:inline">
                      <span className="font-medium">นักเรียน:</span> {selectedAssessment.studentName}
                    </p>
                    <p className="sm:inline sm:ml-4">
                      <span className="font-medium">ห้อง:</span> {currentClassroom.name}
                    </p>
                    <p className="sm:inline sm:ml-4">
                      <span className="font-medium">วันที่ประเมิน:</span> {new Date(selectedAssessment.completedDate || '').toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
                <div className="text-left lg:text-right">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-sm text-slate-600">ห้องเรียนปัจจุบัน </p>
                      <p className="text-sm text-blue-700">{currentClassroom.name}</p>
                    </div>
                    <p className="text-sm text-slate-600">ปีการศึกษา {currentClassroom.year}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <ScoreCard 
              title="ด้านอารมณ์" 
              score={selectedAssessment.scores?.emotional || 0} 
              interpretation={selectedAssessment.interpretations?.emotional || ''}
              maxScore={10}
            />
            <ScoreCard 
              title="ด้านความประพฤติ/เกเร" 
              score={selectedAssessment.scores?.conduct || 0} 
              interpretation={selectedAssessment.interpretations?.conduct || ''}
              maxScore={10}
            />
            <ScoreCard 
              title="ด้านพฤติกรรมไม่อยู่นิ่ง/สมาธิสั้น" 
              score={selectedAssessment.scores?.hyperactivity || 0} 
              interpretation={selectedAssessment.interpretations?.hyperactivity || ''}
              maxScore={10}
            />
            <ScoreCard 
              title="ด้านความสัมพันธ์กับเพื่อน" 
              score={selectedAssessment.scores?.peer || 0} 
              interpretation={selectedAssessment.interpretations?.peer || ''}
              maxScore={10}
            />
            <ScoreCard 
              title="ด้านสัมพันธภาพทางสังคม" 
              score={selectedAssessment.scores?.prosocial || 0} 
              interpretation={selectedAssessment.interpretations?.prosocial || ''}
              maxScore={10}
            />
            <ScoreCard 
              title="คะแนนปัญหารวม" 
              score={selectedAssessment.scores?.totalDifficulties || 0} 
              interpretation={selectedAssessment.interpretations?.totalDifficulties || ''}
              maxScore={40}
            />
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 hover:shadow-md transition-shadow duration-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">คำแนะนำ</h2>
            <div className="space-y-4">
              <RecommendationCard 
                interpretation={selectedAssessment.interpretations?.totalDifficulties || ''} 
                type="total" 
              />
            </div>
          </div>

          {/* Impact Assessment Results */}
          {selectedAssessment.impactResponses && selectedAssessment.impactResponses.hasProblems !== -1 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">ประเมินผลกระทบ</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-1">มีปัญหาหรือไม่</p>
                  <p className="text-slate-900 text-sm sm:text-base">
                    {impactQuestions.mainQuestion.options.find(
                      o => o.value === selectedAssessment.impactResponses?.hasProblems
                    )?.label}
                  </p>
                </div>

                {selectedAssessment.impactResponses.hasProblems > 0 && (
                  <>
                    {selectedAssessment.impactResponses.duration !== undefined && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-medium text-slate-700 mb-1">ระยะเวลาที่เกิดปัญหา</p>
                        <p className="text-slate-900 text-sm sm:text-base">
                          {impactQuestions.followUpQuestions.find(q => q.id === 'duration')?.options.find(
                            o => o.value === selectedAssessment.impactResponses?.duration
                          )?.label}
                        </p>
                      </div>
                    )}

                    {selectedAssessment.impactResponses.distress !== undefined && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-medium text-slate-700 mb-1">ความไม่สบายใจของนักเรียน</p>
                        <p className="text-slate-900 text-sm sm:text-base">
                          {impactQuestions.followUpQuestions.find(q => q.id === 'distress')?.options.find(
                            o => o.value === selectedAssessment.impactResponses?.distress
                          )?.label}
                        </p>
                      </div>
                    )}

                    {selectedAssessment.impactResponses.impactFriends !== undefined && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-medium text-slate-700 mb-1">ผลกระทบต่อการคบเพื่อน</p>
                        <p className="text-slate-900 text-sm sm:text-base">
                          {impactQuestions.followUpQuestions.find(q => q.id === 'impactFriends')?.options.find(
                            o => o.value === selectedAssessment.impactResponses?.impactFriends
                          )?.label}
                        </p>
                      </div>
                    )}

                    {selectedAssessment.impactResponses.impactLearning !== undefined && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-medium text-slate-700 mb-1">ผลกระทบต่อการเรียน</p>
                        <p className="text-slate-900 text-sm sm:text-base">
                          {impactQuestions.followUpQuestions.find(q => q.id === 'impactLearning')?.options.find(
                            o => o.value === selectedAssessment.impactResponses?.impactLearning
                          )?.label}
                        </p>
                      </div>
                    )}

                    {selectedAssessment.impactResponses.burdenOthers !== undefined && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-medium text-slate-700 mb-1">ความยุ่งยากต่อผู้อื่น</p>
                        <p className="text-slate-900 text-sm sm:text-base">
                          {impactQuestions.followUpQuestions.find(q => q.id === 'burdenOthers')?.options.find(
                            o => o.value === selectedAssessment.impactResponses?.burdenOthers
                          )?.label}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">ผลการประเมิน SDQ</h1>
                <p className="text-slate-600">
                  รายการผลการประเมินในห้อง {currentClassroom.name}
                  {studentFilter && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      กรองตามนักเรียน
                    </span>
                  )}
                </p>
              </div>
              <div className="text-left lg:text-right">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm text-slate-600">ห้องเรียนปัจจุบัน </p>
                    <p className="text-sm text-blue-700">{currentClassroom.name}</p>
                  </div>
                  <p className="text-sm text-slate-600">ปีการศึกษา {currentClassroom.year}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredAssessments.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg mb-2">
                {studentFilter ? 'ไม่พบผลการประเมินของนักเรียนคนนี้' : 'ยังไม่มีผลการประเมินในห้องนี้'}
              </p>
              <p className="text-slate-400 text-sm mb-4">เริ่มต้นด้วยการเพิ่มนักเรียนและทำการประเมิน</p>
              <div className="flex gap-3 justify-center">
                {studentFilter && (
                  <button
                    onClick={() => router.push('/results')}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm cursor-pointer"
                  >
                    ดูทั้งหมด
                  </button>
                )}
                <button
                  onClick={() => router.push('/students')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer"
                >
                  เริ่มประเมิน
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {studentFilter && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-blue-800 text-sm">
                    กำลังแสดงผลการประเมินของนักเรียน 1 คน
                  </p>
                  <button
                    onClick={() => router.push('/results')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ดูทั้งหมด
                  </button>
                </div>
              </div>
            )}
            
            {filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{assessment.studentName}</h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      วันที่ประเมิน: {new Date(assessment.completedDate || '').toLocaleDateString('th-TH')}
                    </p>
                    {assessment.impactResponses && assessment.impactResponses.hasProblems !== -1 && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        ✓ ประเมินผลกระทบแล้ว
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-slate-600">คะแนนปัญหารวม</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl font-bold text-slate-800">
                          {assessment.scores?.totalDifficulties}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          assessment.interpretations?.totalDifficulties === 'ปกติ' ? 'bg-green-100 text-green-800' :
                          assessment.interpretations?.totalDifficulties === 'เสี่ยง' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {assessment.interpretations?.totalDifficulties}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAssessment(assessment)}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base cursor-pointer"
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;