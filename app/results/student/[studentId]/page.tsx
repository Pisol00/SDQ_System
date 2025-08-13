'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Calendar, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { useApp } from '../../../../contexts/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StudentResultsPageProps {
  params: {
    studentId: string;
  };
}

const StudentResultsPage: React.FC<StudentResultsPageProps> = ({ params }) => {
  const router = useRouter();
  const { students, assessments, getCurrentClassroom } = useApp();
  const currentClassroom = getCurrentClassroom();
  
  const student = students.find(s => s.id.toString() === params.studentId);
  const studentAssessments = assessments
    .filter(a => a.studentId.toString() === params.studentId)
    .sort((a, b) => new Date(a.completedDate || '').getTime() - new Date(b.completedDate || '').getTime());

  if (!student) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-center py-12">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">ไม่พบข้อมูลนักเรียน</h2>
              <p className="text-slate-500 mb-4">นักเรียนที่คุณต้องการดูอาจถูกลบแล้วหรือไม่มีอยู่</p>
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

  // Prepare data for trend chart
  const trendData = studentAssessments.map((assessment, index) => ({
    assessment: `ครั้งที่ ${index + 1}`,
    date: new Date(assessment.completedDate || '').toLocaleDateString('th-TH', { 
      month: 'short', 
      day: 'numeric' 
    }),
    emotional: assessment.scores?.emotional || 0,
    conduct: assessment.scores?.conduct || 0,
    hyperactivity: assessment.scores?.hyperactivity || 0,
    peer: assessment.scores?.peer || 0,
    totalDifficulties: assessment.scores?.totalDifficulties || 0,
    prosocial: assessment.scores?.prosocial || 0
  }));

  const getScoreColor = (interpretation: string) => {
    switch (interpretation) {
      case 'ปกติ': return 'text-green-600';
      case 'เสี่ยง': return 'text-yellow-600';
      case 'มีปัญหา': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getScoreBg = (interpretation: string) => {
    switch (interpretation) {
      case 'ปกติ': return 'bg-green-50 border-green-200';
      case 'เสี่ยง': return 'bg-yellow-50 border-yellow-200';
      case 'มีปัญหา': return 'bg-red-50 border-red-200';
      default: return 'bg-slate-50 border-slate-200';
    }
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
                  ประวัติการประเมิน SDQ
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{student.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>รหัส: {student.studentId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>อายุ: {student.age} ปี</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>ห้อง: {currentClassroom.name}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/results')}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  ดูรายการทั้งหมด
                </button>
                <button
                  onClick={() => {
                    // Start new assessment for this student
                    router.push(`/students`);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  ประเมินใหม่
                </button>
              </div>
            </div>
          </div>
        </div>

        {studentAssessments.length === 0 ? (
          /* No Assessments */
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">ยังไม่มีผลการประเมิน</h2>
              <p className="text-slate-500 mb-4">นักเรียนคนนี้ยังไม่เคยได้รับการประเมิน SDQ</p>
              <button
                onClick={() => router.push('/students')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                เริ่มประเมิน
              </button>
            </div>
          </div>
        ) : (
          /* Has Assessments */
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">จำนวนครั้งที่ประเมิน</p>
                    <p className="text-2xl font-bold text-slate-800">{studentAssessments.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">ประเมินล่าสุด</p>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(studentAssessments[studentAssessments.length - 1]?.completedDate || '').toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">ผลล่าสุด</p>
                    <p className={`text-sm font-medium ${getScoreColor(studentAssessments[studentAssessments.length - 1]?.interpretations?.totalDifficulties || '')}`}>
                      {studentAssessments[studentAssessments.length - 1]?.interpretations?.totalDifficulties || 'ไม่ระบุ'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">คะแนนล่าสุด</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {studentAssessments[studentAssessments.length - 1]?.scores?.totalDifficulties || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Chart */}
            {studentAssessments.length > 1 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">แนวโน้มคะแนน</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="assessment" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any, name: string) => {
                          const nameMap: Record<string, string> = {
                            emotional: 'อารมณ์',
                            conduct: 'ประพฤติ', 
                            hyperactivity: 'ไม่อยู่นิ่ง',
                            peer: 'เพื่อน',
                            totalDifficulties: 'ปัญหารวม',
                            prosocial: 'ช่วยเหลือสังคม'
                          };
                          return [value, nameMap[name] || name];
                        }}
                      />
                      <Legend 
                        formatter={(value: string) => {
                          const nameMap: Record<string, string> = {
                            emotional: 'อารมณ์',
                            conduct: 'ประพฤติ', 
                            hyperactivity: 'ไม่อยู่นิ่ง',
                            peer: 'เพื่อน',
                            totalDifficulties: 'ปัญหารวม',
                            prosocial: 'ช่วยเหลือสังคม'
                          };
                          return nameMap[value] || value;
                        }}
                      />
                      <Line type="monotone" dataKey="emotional" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="conduct" stroke="#f97316" strokeWidth={2} />
                      <Line type="monotone" dataKey="hyperactivity" stroke="#eab308" strokeWidth={2} />
                      <Line type="monotone" dataKey="peer" stroke="#8b5cf6" strokeWidth={2} />
                      <Line type="monotone" dataKey="totalDifficulties" stroke="#1f2937" strokeWidth={3} />
                      <Line type="monotone" dataKey="prosocial" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Assessment History */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">ประวัติการประเมิน</h2>
              
              <div className="space-y-4">
                {studentAssessments.map((assessment, index) => (
                  <div key={assessment.id} className={`border rounded-lg p-4 ${getScoreBg(assessment.interpretations?.totalDifficulties || '')}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-slate-800">ครั้งที่ {index + 1}</span>
                          <span className="text-sm text-slate-600">
                            {new Date(assessment.completedDate || '').toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                          <div>
                            <span className="text-slate-600">อารมณ์:</span>
                            <span className={`ml-1 font-medium ${getScoreColor(assessment.interpretations?.emotional || '')}`}>
                              {assessment.scores?.emotional}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">ประพฤติ:</span>
                            <span className={`ml-1 font-medium ${getScoreColor(assessment.interpretations?.conduct || '')}`}>
                              {assessment.scores?.conduct}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">ไม่อยู่นิ่ง:</span>
                            <span className={`ml-1 font-medium ${getScoreColor(assessment.interpretations?.hyperactivity || '')}`}>
                              {assessment.scores?.hyperactivity}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">เพื่อน:</span>
                            <span className={`ml-1 font-medium ${getScoreColor(assessment.interpretations?.peer || '')}`}>
                              {assessment.scores?.peer}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">ช่วยเหลือ:</span>
                            <span className={`ml-1 font-medium ${getScoreColor(assessment.interpretations?.prosocial || '')}`}>
                              {assessment.scores?.prosocial}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-slate-600">คะแนนรวม</p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-800">
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
                          onClick={() => router.push(`/results/${assessment.id}`)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          ดูรายละเอียด
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResultsPage;