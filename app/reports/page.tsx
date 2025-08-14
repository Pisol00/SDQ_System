'use client';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const router = useRouter();
  const { 
    students, 
    assessments, 
    getCurrentClassroom, 
    getClassroomStudents, 
    getClassroomAssessments 
  } = useApp();

  const currentClassroom = getCurrentClassroom();
  const classroomStudents = getClassroomStudents();
  const classroomAssessments = getClassroomAssessments();

  // คำนวณข้อมูลรายงาน - นับจาก assessment ล่าสุดของนักเรียนแต่ละคน
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

    // ตัวแปรสำหรับนับจำนวนนักเรียนที่มี assessment และที่ไม่มี
    let studentsWithAssessments = 0;

    if (classroomAssessments.length > 0) {
      // หา assessment ล่าสุดของนักเรียนแต่ละคน
      const studentLatestAssessments = new Map<number, any>();
      
      // วนลูปหา assessment ที่เสร็จสมบูรณ์แล้ว
      classroomAssessments.forEach(assessment => {
        if (assessment.interpretations && assessment.scores && assessment.completed) {
          const existingAssessment = studentLatestAssessments.get(assessment.studentId);
          
          // เปรียบเทียบวันที่เพื่อหาผลล่าสุด
          const currentDate = new Date(assessment.completedDate || assessment.date);
          const existingDate = existingAssessment ? new Date(existingAssessment.completedDate || existingAssessment.date) : null;
          
          // ถ้ายังไม่มี assessment สำหรับนักเรียนคนนี้ หรือ assessment นี้ใหม่กว่า
          if (!existingAssessment || currentDate > existingDate) {
            studentLatestAssessments.set(assessment.studentId, assessment);
          }
        }
      });

      // นับจาก assessment ล่าสุดของแต่ละนักเรียน (1 นักเรียน = 1 ผลประเมิน)
      studentLatestAssessments.forEach(assessment => {
        // นับคะแนนรวม
        const totalLevel = assessment.interpretations.totalDifficulties;
        if (totalLevel in totalDifficultiesCount) {
          totalDifficultiesCount[totalLevel as keyof typeof totalDifficultiesCount]++;
        }
        
        // นับแต่ละด้าน (4 ด้านหลัก)
        const emotionalLevel = assessment.interpretations.emotional;
        const conductLevel = assessment.interpretations.conduct;
        const hyperactivityLevel = assessment.interpretations.hyperactivity;
        const peerLevel = assessment.interpretations.peer;

        if (emotionalLevel in categoryCount.emotional) {
          categoryCount.emotional[emotionalLevel as keyof typeof categoryCount.emotional]++;
        }
        if (conductLevel in categoryCount.conduct) {
          categoryCount.conduct[conductLevel as keyof typeof categoryCount.conduct]++;
        }
        if (hyperactivityLevel in categoryCount.hyperactivity) {
          categoryCount.hyperactivity[hyperactivityLevel as keyof typeof categoryCount.hyperactivity]++;
        }
        if (peerLevel in categoryCount.peer) {
          categoryCount.peer[peerLevel as keyof typeof categoryCount.peer]++;
        }
      });

      studentsWithAssessments = studentLatestAssessments.size;
    }

    return {
      totalDifficultiesCount,
      categoryCount,
      totalAssessments: classroomAssessments.length, // จำนวน assessments ทั้งหมด (รวมซ้ำ)
      totalStudents: classroomStudents.length, // จำนวนนักเรียนทั้งหมด
      studentsWithAssessments, // จำนวนนักเรียนที่มี assessment (ไม่ซ้ำ)
      studentsWithoutAssessments: classroomStudents.length - studentsWithAssessments // นักเรียนที่ยังไม่ได้ประเมิน
    };
  }, [classroomAssessments, classroomStudents]);

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
  const summaryPieData = [
    {
      name: 'ปกติ',
      value: reportData.totalDifficultiesCount.ปกติ,
      color: '#10b981'
    },
    {
      name: 'เสี่ยง',
      value: reportData.totalDifficultiesCount.เสี่ยง,
      color: '#f59e0b'
    },
    {
      name: 'มีปัญหา',
      value: reportData.totalDifficultiesCount.มีปัญหา,
      color: '#ef4444'
    }
  ];

  // สีสำหรับกราห
  const COLORS = {
    ปกติ: '#10b981',
    เสี่ยง: '#f59e0b', 
    มีปัญหา: '#ef4444'
  };

  // Custom tooltip สำหรับ Bar Chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800 mb-2">{`ด้าน${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: pld.color }}
              ></div>
              <span className="text-sm text-slate-600">
                {pld.dataKey}: {pld.value} คน
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip สำหรับ Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800">
            {data.name}: {data.value} คน
          </p>
          <p className="text-sm text-slate-600">
            {((data.value / reportData.studentsWithAssessments) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // ถ้าไม่มีข้อมูลการประเมิน
  if (reportData.studentsWithAssessments === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">รายงานสรุปห้อง {currentClassroom.name}</h1>
                  <p className="text-slate-600">สรุปผลการประเมิน SDQ ของนักเรียนในห้องเรียน</p>
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

          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg mb-2">ยังไม่มีผลการประเมินในห้องนี้</p>
              <p className="text-slate-400 text-sm mb-4">เริ่มต้นด้วยการเพิ่มนักเรียนและทำการประเมิน</p>
              <button
                onClick={() => router.push('/students')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base cursor-pointer"
              >
                เริ่มประเมิน
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">รายงานสรุปห้อง {currentClassroom.name}</h1>
                <p className="text-slate-600">สรุปผลการประเมิน SDQ ของนักเรียนในห้องเรียน (ตามผลประเมินล่าสุดของแต่ละคน)</p>
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

        {/* สถิติพื้นฐาน */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-blue-700 text-xs sm:text-sm font-medium">นักเรียนทั้งหมด</h3>
            <p className="text-xl sm:text-2xl font-bold text-slate-800">{reportData.totalStudents}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-green-700 text-xs sm:text-sm font-medium">ประเมินแล้ว</h3>
            <p className="text-xl sm:text-2xl font-bold text-slate-800">{reportData.studentsWithAssessments}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-orange-700 text-xs sm:text-sm font-medium">ยังไม่ประเมิน</h3>
            <p className="text-xl sm:text-2xl font-bold text-slate-800">{reportData.studentsWithoutAssessments}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-yellow-700 text-xs sm:text-sm font-medium">เสี่ยง</h3>
            <p className="text-xl sm:text-2xl font-bold text-slate-800">{reportData.totalDifficultiesCount.เสี่ยง}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-red-700 text-xs sm:text-sm font-medium">มีปัญหา</h3>
            <p className="text-xl sm:text-2xl font-bold text-slate-800">{reportData.totalDifficultiesCount.มีปัญหา}</p>
          </div>
        </div>

        {/* กราฟแสดงผล */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* กราฟที่ 1 - Bar Chart สำหรับ 4 ด้าน */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">สรุปการประเมิน SDQ 4 ด้าน</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={categoryBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#64748b"
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend />
                <Bar dataKey="ปกติ" fill={COLORS.ปกติ} radius={[2, 2, 0, 0]} />
                <Bar dataKey="เสี่ยง" fill={COLORS.เสี่ยง} radius={[2, 2, 0, 0]} />
                <Bar dataKey="มีปัญหา" fill={COLORS.มีปัญหา} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* กราฟที่ 2 - Pie Chart สำหรับสรุปรวม */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">สรุปผลการประเมินรวม</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={summaryPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} คน (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {summaryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ตารางสรุปข้อมูล */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">ตารางสรุปผลการประเมิน</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">ด้านการประเมิน</th>
                  <th className="text-center py-3 px-4 font-medium text-green-700">ปกติ</th>
                  <th className="text-center py-3 px-4 font-medium text-yellow-700">เสี่ยง</th>
                  <th className="text-center py-3 px-4 font-medium text-red-700">มีปัญหา</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700">รวม</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">ด้านอารมณ์</td>
                  <td className="text-center py-3 px-4 text-green-700">{reportData.categoryCount.emotional.ปกติ}</td>
                  <td className="text-center py-3 px-4 text-yellow-700">{reportData.categoryCount.emotional.เสี่ยง}</td>
                  <td className="text-center py-3 px-4 text-red-700">{reportData.categoryCount.emotional.มีปัญหา}</td>
                  <td className="text-center py-3 px-4 text-slate-700 font-medium">
                    {reportData.categoryCount.emotional.ปกติ + reportData.categoryCount.emotional.เสี่ยง + reportData.categoryCount.emotional.มีปัญหา}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">ด้านประพฤติ</td>
                  <td className="text-center py-3 px-4 text-green-700">{reportData.categoryCount.conduct.ปกติ}</td>
                  <td className="text-center py-3 px-4 text-yellow-700">{reportData.categoryCount.conduct.เสี่ยง}</td>
                  <td className="text-center py-3 px-4 text-red-700">{reportData.categoryCount.conduct.มีปัญหา}</td>
                  <td className="text-center py-3 px-4 text-slate-700 font-medium">
                    {reportData.categoryCount.conduct.ปกติ + reportData.categoryCount.conduct.เสี่ยง + reportData.categoryCount.conduct.มีปัญหา}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">ด้านไม่อยู่นิ่ง</td>
                  <td className="text-center py-3 px-4 text-green-700">{reportData.categoryCount.hyperactivity.ปกติ}</td>
                  <td className="text-center py-3 px-4 text-yellow-700">{reportData.categoryCount.hyperactivity.เสี่ยง}</td>
                  <td className="text-center py-3 px-4 text-red-700">{reportData.categoryCount.hyperactivity.มีปัญหา}</td>
                  <td className="text-center py-3 px-4 text-slate-700 font-medium">
                    {reportData.categoryCount.hyperactivity.ปกติ + reportData.categoryCount.hyperactivity.เสี่ยง + reportData.categoryCount.hyperactivity.มีปัญหา}
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">ด้านเพื่อน</td>
                  <td className="text-center py-3 px-4 text-green-700">{reportData.categoryCount.peer.ปกติ}</td>
                  <td className="text-center py-3 px-4 text-yellow-700">{reportData.categoryCount.peer.เสี่ยง}</td>
                  <td className="text-center py-3 px-4 text-red-700">{reportData.categoryCount.peer.มีปัญหา}</td>
                  <td className="text-center py-3 px-4 text-slate-700 font-medium">
                    {reportData.categoryCount.peer.ปกติ + reportData.categoryCount.peer.เสี่ยง + reportData.categoryCount.peer.มีปัญหา}
                  </td>
                </tr>
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">สรุปรวม (ภาพรวม)</td>
                  <td className="text-center py-3 px-4 text-green-700 font-bold">{reportData.totalDifficultiesCount.ปกติ}</td>
                  <td className="text-center py-3 px-4 text-yellow-700 font-bold">{reportData.totalDifficultiesCount.เสี่ยง}</td>
                  <td className="text-center py-3 px-4 text-red-700 font-bold">{reportData.totalDifficultiesCount.มีปัญหา}</td>
                  <td className="text-center py-3 px-4 text-slate-700 font-bold">{reportData.studentsWithAssessments}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* คำอธิบายเพิ่มเติม */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">หมายเหตุ:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• ข้อมูลนี้นับจากผลการประเมินล่าสุดของนักเรียนแต่ละคน</li>
              <li>• หากนักเรียนคนใดมีการประเมินหลายครั้ง จะนับเฉพาะครั้งล่าสุดเท่านั้น</li>
              <li>• จำนวนรวมในแต่ละแถวอาจไม่เท่ากัน เนื่องจากนักเรียนแต่ละคนอาจมีระดับที่แตกต่างกันในแต่ละด้าน</li>
              <li>• แถว "สรุปรวม" แสดงผลประเมินภาพรวมตามคะแนนรวมทั้ง 4 ด้าน</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;