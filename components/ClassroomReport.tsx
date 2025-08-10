import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { Classroom, Student, Assessment, PageType } from './types';
import { FileText } from 'lucide-react';

interface ClassroomReportProps {
  getCurrentClassroom: () => Classroom;
  getClassroomStudents: () => Student[];
  getClassroomAssessments: () => Assessment[];
  setCurrentPage: (page: PageType) => void;
}

const ClassroomReport: React.FC<ClassroomReportProps> = ({
  getCurrentClassroom,
  getClassroomStudents,
  getClassroomAssessments,
  setCurrentPage
}) => {
  const currentClassroom = getCurrentClassroom();
  const students = getClassroomStudents();
  const assessments = getClassroomAssessments();

  // คำนวณข้อมูลสำหรับกราฟ
  const reportData = useMemo(() => {
    // 1. นับจำนวนนักเรียนในแต่ละระดับสำหรับคะแนนรวม
    const totalDifficultiesCount = {
      ปกติ: 0,
      เสี่ยง: 0,
      มีปัญหา: 0
    };

    // 2. นับจำนวนในแต่ละด้าน (4 ด้านหลัก - ไม่รวมสังคม)
    const categoryCount = {
      emotional: { ปกติ: 0, เสี่ยง: 0, มีปัญหา: 0 },
      conduct: { ปกติ: 0, เสี่ยง: 0, มีปัญหา: 0 },
      hyperactivity: { ปกติ: 0, เสี่ยง: 0, มีปัญหา: 0 },
      peer: { ปกติ: 0, เสี่ยง: 0, มีปัญหา: 0 }
    };

    if (assessments.length > 0) {
      // นับจำนวน
      assessments.forEach(assessment => {
        if (assessment.interpretations && assessment.scores) {
          // นับคะแนนรวม
          totalDifficultiesCount[assessment.interpretations.totalDifficulties as keyof typeof totalDifficultiesCount]++;
          
          // นับแต่ละด้าน (4 ด้านหลัก)
          categoryCount.emotional[assessment.interpretations.emotional as keyof typeof categoryCount.emotional]++;
          categoryCount.conduct[assessment.interpretations.conduct as keyof typeof categoryCount.conduct]++;
          categoryCount.hyperactivity[assessment.interpretations.hyperactivity as keyof typeof categoryCount.hyperactivity]++;
          categoryCount.peer[assessment.interpretations.peer as keyof typeof categoryCount.peer]++;
        }
      });
    }

    return {
      totalDifficultiesCount,
      categoryCount,
      totalAssessments: assessments.length,
      totalStudents: students.length
    };
  }, [assessments, students]);

  // ข้อมูลสำหรับกราฟที่ 1 - สรุปการพฤติกรรมการประเมิน SDQ 4 ด้าน
  const categoryBarData = [
    {
      name: 'อารมณ์',
      ปกติ: reportData.categoryCount.emotional.ปกติ,
      เสี่ยง: reportData.categoryCount.emotional.เสี่ยง,
      มีปัญหา: reportData.categoryCount.emotional.มีปัญหา,
    },
    {
      name: 'ประพฤติ',
      ปกติ: reportData.categoryCount.conduct.ปกติ,
      เสี่ยง: reportData.categoryCount.conduct.เสี่ยง,
      มีปัญหา: reportData.categoryCount.conduct.มีปัญหา,
    },
    {
      name: 'ไม่อยู่นิ่ง',
      ปกติ: reportData.categoryCount.hyperactivity.ปกติ,
      เสี่ยง: reportData.categoryCount.hyperactivity.เสี่ยง,
      มีปัญหา: reportData.categoryCount.hyperactivity.มีปัญหา,
    },
    {
      name: 'เพื่อน',
      ปกติ: reportData.categoryCount.peer.ปกติ,
      เสี่ยง: reportData.categoryCount.peer.เสี่ยง,
      มีปัญหา: reportData.categoryCount.peer.มีปัญหา,
    }
  ];

  // ข้อมูลสำหรับกราฟที่ 2 - กราฟสรุปแสดงกลุ่มปกติ กลุ่มเสี่ยง และกลุ่มมีปัญหา
  const summaryBarData = [
    {
      name: 'ปกติ',
      จำนวน: reportData.totalDifficultiesCount.ปกติ
    },
    {
      name: 'เสี่ยง/มีปัญหา',
      จำนวน: reportData.totalDifficultiesCount.เสี่ยง + reportData.totalDifficultiesCount.มีปัญหา
    },
    {
      name: 'มีปัญหา',
      จำนวน: reportData.totalDifficultiesCount.มีปัญหา
    }
  ];

  if (reportData.totalAssessments === 0) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">รายงานสรุปห้อง {currentClassroom.name}</h1>
          <p className="text-sm sm:text-base text-gray-700">สรุปผลการประเมิน SDQ ของนักเรียนในห้องเรียน</p>
        </div>

        <div className="text-center py-12">
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4 text-sm sm:text-base">ยังไม่มีผลการประเมินในห้องนี้</p>
          <button
            onClick={() => setCurrentPage('students')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base cursor-pointer"
          >
            เริ่มประเมิน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">รายงานสรุปห้อง {currentClassroom.name}</h1>
        <p className="text-sm sm:text-base text-gray-700">สรุปผลการประเมิน SDQ ของนักเรียนในห้องเรียน</p>
      </div>

      {/* สถิติพื้นฐาน */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
          <h3 className="text-blue-700 text-xs sm:text-sm font-medium">นักเรียนทั้งหมด</h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-900">{reportData.totalStudents}</p>
        </div>
        <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200">
          <h3 className="text-green-700 text-xs sm:text-sm font-medium">ประเมินแล้ว</h3>
          <p className="text-xl sm:text-2xl font-bold text-green-900">{reportData.totalAssessments}</p>
        </div>
        <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-yellow-200">
          <h3 className="text-yellow-700 text-xs sm:text-sm font-medium">เสี่ยง</h3>
          <p className="text-xl sm:text-2xl font-bold text-yellow-800">{reportData.totalDifficultiesCount.เสี่ยง}</p>
        </div>
        <div className="bg-red-50 p-4 sm:p-6 rounded-lg border border-red-200">
          <h3 className="text-red-700 text-xs sm:text-sm font-medium">มีปัญหา</h3>
          <p className="text-xl sm:text-2xl font-bold text-red-800">{reportData.totalDifficultiesCount.มีปัญหา}</p>
        </div>
      </div>

      {/* กราฟที่ 1 - สรุปการพฤติกรรมการประเมิน SDQ 4 ด้าน */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 mb-4 sm:mb-8">
        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4 text-center">
          สรุปการพฤติกรรมการประเมิน SDQ 4 ด้าน
        </h2>
        <ResponsiveContainer width="100%" height={250} className="sm:!h-[350px]">
          <BarChart data={categoryBarData} margin={{ top: 10, right: 15, left: 15, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              axisLine={true}
              tickLine={true}
              tick={{ fill: '#374151', fontSize: 10 }}
              className="sm:text-xs"
            />
            <YAxis 
              label={{ value: 'จำนวน', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151', fontSize: 10 } }}
              axisLine={true}
              tickLine={true}
              tick={{ fill: '#374151', fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                color: '#374151',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="ปกติ" fill="#22c55e" name="ปกติ" />
            <Bar dataKey="เสี่ยง" fill="#eab308" name="เสี่ยง" />
            <Bar dataKey="มีปัญหา" fill="#ef4444" name="มีปัญหา" />
          </BarChart>
        </ResponsiveContainer>
        
        {/* ตารางข้อมูล - แสดงแบบ compact บนมือถือ */}
        <div className="mt-3 sm:mt-6">
          <div className="block sm:hidden">
            {/* มุมมองมือถือ - แสดงเฉพาะข้อมูลสำคัญ */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-green-100 p-2 rounded text-center">
                <div className="font-semibold">ปกติ</div>
                <div>อ:{reportData.categoryCount.emotional.ปกติ} ป:{reportData.categoryCount.conduct.ปกติ}</div>
                <div>น:{reportData.categoryCount.hyperactivity.ปกติ} พ:{reportData.categoryCount.peer.ปกติ}</div>
              </div>
              <div className="bg-yellow-100 p-2 rounded text-center">
                <div className="font-semibold">เสี่ยง</div>
                <div>อ:{reportData.categoryCount.emotional.เสี่ยง} ป:{reportData.categoryCount.conduct.เสี่ยง}</div>
                <div>น:{reportData.categoryCount.hyperactivity.เสี่ยง} พ:{reportData.categoryCount.peer.เสี่ยง}</div>
              </div>
              <div className="bg-red-100 p-2 rounded text-center">
                <div className="font-semibold">มีปัญหา</div>
                <div>อ:{reportData.categoryCount.emotional.มีปัญหา} ป:{reportData.categoryCount.conduct.มีปัญหา}</div>
                <div>น:{reportData.categoryCount.hyperactivity.มีปัญหา} พ:{reportData.categoryCount.peer.มีปัญหา}</div>
              </div>
            </div>
          </div>
          
          {/* มุมมองเดสก์ท็อป - ตารางเต็ม */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-4 py-2 text-left text-gray-900 font-semibold text-sm">พฤติกรรม</th>
                  <th className="border border-gray-400 px-4 py-2 text-center text-gray-900 font-semibold text-sm">อารมณ์</th>
                  <th className="border border-gray-400 px-4 py-2 text-center text-gray-900 font-semibold text-sm">ประพฤติ</th>
                  <th className="border border-gray-400 px-4 py-2 text-center text-gray-900 font-semibold text-sm">ไม่อยู่นิ่ง</th>
                  <th className="border border-gray-400 px-4 py-2 text-center text-gray-900 font-semibold text-sm">เพื่อน</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-4 py-2 bg-green-100 text-gray-900 font-medium text-sm">ปกติ</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.emotional.ปกติ}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.conduct.ปกติ}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.hyperactivity.ปกติ}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.peer.ปกติ}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-4 py-2 bg-yellow-100 text-gray-900 font-medium text-sm">เสี่ยง</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.emotional.เสี่ยง}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.conduct.เสี่ยง}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.hyperactivity.เสี่ยง}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.peer.เสี่ยง}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-4 py-2 bg-red-100 text-gray-900 font-medium text-sm">มีปัญหา</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.emotional.มีปัญหา}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.conduct.มีปัญหา}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.hyperactivity.มีปัญหา}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.categoryCount.peer.มีปัญหา}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* กราฟที่ 2 - กราฟสรุปแสดงกลุ่มปกติ กลุ่มเสี่ยง และกลุ่มมีปัญหา */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4 text-center">
          กราฟสรุป แสดงกลุ่มปกติ กลุ่มเสี่ยง และกลุ่มมีปัญหา
        </h2>
        <ResponsiveContainer width="100%" height={200} className="sm:!h-[300px]">
          <BarChart data={summaryBarData} margin={{ top: 10, right: 15, left: 15, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              axisLine={true}
              tickLine={true}
              tick={{ fill: '#374151', fontSize: 10 }}
            />
            <YAxis 
              label={{ value: 'จำนวน', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151', fontSize: 10 } }}
              axisLine={true}
              tickLine={true}
              tick={{ fill: '#374151', fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                color: '#374151',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="จำนวน" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>

        {/* ตารางข้อมูลสรุป */}
        <div className="mt-3 sm:mt-6">
          <div className="block sm:hidden">
            {/* มุมมองมือถือ - แสดงแบบ card */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-blue-100 p-2 rounded text-center">
                <div className="font-semibold text-gray-900">ปกติ</div>
                <div className="text-lg font-bold text-gray-900">{reportData.totalDifficultiesCount.ปกติ}</div>
              </div>
              <div className="bg-yellow-100 p-2 rounded text-center">
                <div className="font-semibold text-gray-900">เสี่ยง/มีปัญหา</div>
                <div className="text-lg font-bold text-gray-900">{reportData.totalDifficultiesCount.เสี่ยง + reportData.totalDifficultiesCount.มีปัญหา}</div>
              </div>
              <div className="bg-red-100 p-2 rounded text-center">
                <div className="font-semibold text-gray-900">มีปัญหา</div>
                <div className="text-lg font-bold text-gray-900">{reportData.totalDifficultiesCount.มีปัญหา}</div>
              </div>
            </div>
          </div>
          
          {/* มุมมองเดสก์ท็อป - ตารางเต็ม */}
          <div className="hidden sm:block">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-4 py-2 text-left text-gray-900 font-semibold text-sm">พฤติกรรม</th>
                  <th className="border border-gray-400 px-4 py-2 text-center text-gray-900 font-semibold text-sm">ปกติ</th>
                  <th className="border border-gray-400 px-4 py-2 text-center text-gray-900 font-semibold text-sm">เสี่ยง/มีปัญหา</th>
                  <th className="border border-gray-400 px-4 py-2 text-center text-gray-900 font-semibold text-sm">มีปัญหา</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-4 py-2 bg-blue-100 text-gray-900 font-medium text-sm">จำนวน</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.totalDifficultiesCount.ปกติ}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.totalDifficultiesCount.เสี่ยง + reportData.totalDifficultiesCount.มีปัญหา}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center text-gray-900 text-sm">{reportData.totalDifficultiesCount.มีปัญหา}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomReport;