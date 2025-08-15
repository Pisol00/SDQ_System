'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, ClipboardList, BarChart3, Calendar, PieChart, AlertTriangle, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const {
    getCurrentClassroom,
    getClassroomStudents,
    getClassroomAssessments,
    cleanupDuplicateAssessments
  } = useApp();

  const classroomStudents = getClassroomStudents();
  const classroomAssessments = getClassroomAssessments();
  const currentClassroom = getCurrentClassroom();

  // Calculate statistics
  const needFollowUp = classroomAssessments.filter(a =>
    a.interpretations?.totalDifficulties === 'มีปัญหา' ||
    a.interpretations?.totalDifficulties === 'เสี่ยง'
  ).length;

  const thisMonth = classroomAssessments.filter(a =>
    new Date(a.completedDate || '').getMonth() === new Date().getMonth()
  ).length;

  const recentAssessments = classroomAssessments.slice(-5).reverse();

  const StatCard = ({ title, value, icon: Icon, bgColor, iconColor }: {
    title: string;
    value: number;
    icon: React.ElementType;
    bgColor: string;
    iconColor: string;
  }) => (
    <div className={`${bgColor} border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  ระบบประเมิน SDQ
                </h1>
                <p className="text-slate-600">แบบประเมินพฤติกรรมนักเรียน (SDQ) ฉบับครูประเมินนักเรียน</p>
              </div>
              <div className="text-left lg:text-right">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm text-slate-600">ห้องเรียนปัจจุบัน</p>
                    <p className="text-sm text-blue-700">{currentClassroom.name}</p>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <p className="text-sm text-slate-600">ปีการศึกษา</p>
                    <p className="text-sm text-blue-700">{currentClassroom.year}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="นักเรียนทั้งหมด"
            value={classroomStudents.length}
            icon={Users}
            bgColor="bg-white"
            iconColor="text-blue-500"
          />
          <StatCard
            title="การประเมินทั้งหมด"
            value={classroomAssessments.length}
            icon={ClipboardList}
            bgColor="bg-white"
            iconColor="text-green-500"
          />
          <StatCard
            title="ต้องติดตาม"
            value={needFollowUp}
            icon={AlertTriangle}
            bgColor="bg-white"
            iconColor="text-orange-500"
          />
          <StatCard
            title="เดือนนี้"
            value={thisMonth}
            icon={Calendar}
            bgColor="bg-white"
            iconColor="text-purple-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Assessments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">การประเมินล่าสุด</h3>
              
              {recentAssessments.length > 0 ? (
                <div className="space-y-3">
                  {recentAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {assessment.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{assessment.studentName}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(assessment.completedDate || assessment.date).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assessment.interpretations?.totalDifficulties === 'ปกติ' ? 'bg-green-100 text-green-800' :
                        assessment.interpretations?.totalDifficulties === 'เสี่ยง' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {assessment.interpretations?.totalDifficulties}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p>ยังไม่มีการประเมิน</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                การจัดการ
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/students')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                >
                  <Users className="h-5 w-5" />
                  จัดการนักเรียน
                </button>

                <button
                  onClick={() => router.push('/results')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                >
                  <BarChart3 className="h-5 w-5" />
                  ดูผลประเมิน
                </button>

                <button
                  onClick={() => router.push('/reports')}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                >
                  <PieChart className="h-5 w-5" />
                  รายงานสรุป
                </button>
              </div>
            </div>

            {/* Tools Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                🛠 เครื่องมือ
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={cleanupDuplicateAssessments}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                  title="ลบแบบประเมินที่ซ้ำซ้อนหรือไม่จำเป็น"
                >
                  <Trash2 className="h-4 w-4" />
                  ทำความสะอาดข้อมูล
                </button>
                
                <p className="text-xs text-slate-500 text-center">
                  ลบแบบประเมินที่ซ้ำซ้อนหรือไม่สมบูรณ์
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;