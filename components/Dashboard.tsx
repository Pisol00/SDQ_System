import React from 'react';
import { Users, ClipboardList, BarChart3, Calendar, PlusCircle, PieChart } from 'lucide-react';
import { Classroom, Student, Assessment, PageType } from './types';

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
    <div className={`${bgColor} p-4 sm:p-6 rounded-lg border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${iconColor} text-xs sm:text-sm font-medium mb-1`}>{title}</p>
          <p className={`text-xl sm:text-2xl font-bold ${iconColor.replace('text-', 'text-').replace('-600', '-800')}`}>
            {value}
          </p>
        </div>
        <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor}`} />
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">ระบบประเมิน SDQ</h1>
            <p className="text-sm sm:text-base text-gray-600">แบบประเมินพฤติกรรมนักเรียน ( SDQ ) ฉบับครูประเมินนักเรียน</p>
          </div>
          <div className="text-left lg:text-right p-4 bg-blue-50 rounded-lg lg:bg-transparent lg:p-0">
            <p className="text-xs sm:text-sm text-gray-500">ห้องเรียนปัจจุบัน</p>
            <p className="text-lg sm:text-xl font-bold text-blue-600">{currentClassroom.name}</p>
            <p className="text-xs sm:text-sm text-gray-500">ปีการศึกษา {currentClassroom.year}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="นักเรียนในห้อง"
          value={classroomStudents.length}
          icon={Users}
          bgColor="bg-blue-50 border-blue-200"
          iconColor="text-blue-600"
        />
        
        <StatCard
          title="การประเมินเสร็จแล้ว"
          value={classroomAssessments.length}
          icon={ClipboardList}
          bgColor="bg-green-50 border-green-200"
          iconColor="text-green-600"
        />
        
        <StatCard
          title="ต้องติดตาม"
          value={needFollowUp}
          icon={BarChart3}
          bgColor="bg-orange-50 border-orange-200"
          iconColor="text-orange-600"
        />
        
        <StatCard
          title="เดือนนี้"
          value={thisMonth}
          icon={Calendar}
          bgColor="bg-purple-50 border-purple-200"
          iconColor="text-purple-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assessments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
              การประเมินล่าสุดในห้อง {currentClassroom.name}
            </h2>
            {classroomAssessments.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">ยังไม่มีการประเมินในห้องนี้</p>
            ) : (
              <div className="space-y-3">
                {recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{assessment.studentName}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {new Date(assessment.completedDate || '').toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-700">
                        คะแนนรวม: {assessment.scores?.totalDifficulties}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        assessment.interpretations?.totalDifficulties === 'ปกติ' ? 'bg-green-100 text-green-800' :
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

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => setCurrentPage('students')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            จัดการนักเรียน
          </button>
          
          <button
            onClick={() => setCurrentPage('results')}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            ดูผลประเมิน
          </button>

          <button
            onClick={() => setCurrentPage('reports')}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
            รายงานสรุป
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;