import React from 'react';
import { Users, ClipboardList, BarChart3, Calendar, PlusCircle, PieChart, TrendingUp, AlertTriangle } from 'lucide-react';
import { Classroom, Student, Assessment, PageType } from '../types';

interface DashboardProps {
  getCurrentClassroom: () => Classroom;
  getClassroomStudents: () => Student[];
  getClassroomAssessments: () => Assessment[];
  setCurrentPage: (page: PageType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  getCurrentClassroom,
  getClassroomStudents,
  getClassroomAssessments,
  setCurrentPage
}) => {
  const classroomStudents = getClassroomStudents();
  const classroomAssessments = getClassroomAssessments();
  const currentClassroom = getCurrentClassroom();

  // Calculate statistics
  const needFollowUp = classroomAssessments.filter(a =>
    a.interpretations?.totalDifficulties === 'มีปัญหา' ||
    a.interpretations?.totalDifficulties === 'เส่ียง'
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
          <div className="bg-white rounded-lg border border-slate-200  p-6">
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
                    <p className="text-sm text-slate-600">ห้องเรียนปัจจุบัน </p>
                    <p className="text-sm text-blue-700">{currentClassroom.name}</p>
                  </div>
                  <p className="text-sm text-slate-600">ปีการศึกษา {currentClassroom.year}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="นักเรียนในห้อง"
            value={classroomStudents.length}
            icon={Users}
            bgColor="bg-white"
            iconColor="text-blue-600"
          />

          <StatCard
            title="การประเมินเสร็จแล้ว"
            value={classroomAssessments.length}
            icon={ClipboardList}
            bgColor="bg-white"
            iconColor="text-green-600"
          />

          <StatCard
            title="ต้องติดตาม"
            value={needFollowUp}
            icon={AlertTriangle}
            bgColor="bg-white"
            iconColor="text-orange-600"
          />

          <StatCard
            title="เดือนนี้"
            value={thisMonth}
            icon={Calendar}
            bgColor="bg-white"
            iconColor="text-purple-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Recent Assessments - ขยายให้เต็มความกว้าง */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-slate-200  p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">
                การประเมินล่าสุดในห้อง {currentClassroom.name}
              </h2>

              {classroomAssessments.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg mb-2">ยังไม่มีการประเมินในห้องนี้</p>
                  <p className="text-slate-400 text-sm">เริ่มต้นด้วยการเพิ่มนักเรียนและทำการประเมิน</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors duration-200"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800 mb-1">{assessment.studentName}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(assessment.completedDate || '').toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0 mt-3 sm:mt-0">
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          คะแนนรวม: {assessment.scores?.totalDifficulties}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${assessment.interpretations?.totalDifficulties === 'ปกติ' ? 'bg-green-100 text-green-800' :
                          assessment.interpretations?.totalDifficulties === 'เส่ียง' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {assessment.interpretations?.totalDifficulties}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - ลดขนาดลง */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200  p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                การจัดการ
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => setCurrentPage('students')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                >
                  <Users className="h-5 w-5" />
                  จัดการนักเรียน
                </button>

                <button
                  onClick={() => setCurrentPage('results')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                >
                  <BarChart3 className="h-5 w-5" />
                  ดูผลประเมิน
                </button>

                <button
                  onClick={() => setCurrentPage('reports')}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                >
                  <PieChart className="h-5 w-5" />
                  รายงานสรุป
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;