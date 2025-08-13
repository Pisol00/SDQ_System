'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, User, Eye, BarChart3 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const ResultsPage: React.FC = () => {
  const router = useRouter();
  const { getClassroomAssessments, getClassroomStudents, getCurrentClassroom } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const classroomAssessments = getClassroomAssessments();
  const classroomStudents = getClassroomStudents();
  const currentClassroom = getCurrentClassroom();
  
  // Group assessments by student
  const studentAssessmentGroups = classroomStudents.map(student => {
    const studentAssessments = classroomAssessments.filter(a => a.studentId === student.id);
    const latestAssessment = studentAssessments.sort((a, b) => 
      new Date(b.completedDate || '').getTime() - new Date(a.completedDate || '').getTime()
    )[0];
    
    return {
      student,
      assessments: studentAssessments,
      latestAssessment,
      hasAssessments: studentAssessments.length > 0
    };
  });

  // Filter based on search and status
  const filteredGroups = studentAssessmentGroups.filter(group => {
    const matchesSearch = group.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.student.studentId.includes(searchTerm);
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'normal') return matchesSearch && group.hasAssessments && group.latestAssessment.interpretations?.totalDifficulties === 'ปกติ';
    if (filterStatus === 'risk') return matchesSearch && group.hasAssessments && group.latestAssessment.interpretations?.totalDifficulties === 'เสี่ยง';
    if (filterStatus === 'problem') return matchesSearch && group.hasAssessments && group.latestAssessment.interpretations?.totalDifficulties === 'มีปัญหา';
    if (filterStatus === 'notAssessed') return matchesSearch && !group.hasAssessments;
    
    return matchesSearch;
  });

  const getStatusColor = (interpretation: string) => {
    switch (interpretation) {
      case 'ปกติ': return 'bg-green-100 text-green-800';
      case 'เสี่ยง': return 'bg-yellow-100 text-yellow-800';
      case 'มีปัญหา': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statsData = {
    total: classroomAssessments.length,
    normal: classroomAssessments.filter(a => a.interpretations?.totalDifficulties === 'ปกติ').length,
    risk: classroomAssessments.filter(a => a.interpretations?.totalDifficulties === 'เสี่ยง').length,
    problem: classroomAssessments.filter(a => a.interpretations?.totalDifficulties === 'มีปัญหา').length,
    notAssessed: classroomStudents.length - new Set(classroomAssessments.map(a => a.studentId)).size
  };

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
                </p>
              </div>
              <div className="text-left lg:text-right">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm text-slate-600">ห้องเรียนปัจจุบัน </p>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="text-center">
              <div className="text-xs text-slate-600 mb-1">การประเมินทั้งหมด</div>
              <div className="text-lg font-bold text-slate-800">{statsData.total}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="text-center">
              <div className="text-xs text-slate-600 mb-1">ปกติ</div>
              <div className="text-lg font-bold text-green-600">{statsData.normal}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="text-center">
              <div className="text-xs text-slate-600 mb-1">เสี่ยง</div>
              <div className="text-lg font-bold text-yellow-600">{statsData.risk}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="text-center">
              <div className="text-xs text-slate-600 mb-1">มีปัญหา</div>
              <div className="text-lg font-bold text-red-600">{statsData.problem}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200">
            <div className="text-center">
              <div className="text-xs text-slate-600 mb-1">ยังไม่ประเมิน</div>
              <div className="text-lg font-bold text-slate-600">{statsData.notAssessed}</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อนักเรียนหรือรหัสนักเรียน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 min-w-[150px]"
            >
              <option value="all">ทั้งหมด</option>
              <option value="normal">ปกติ</option>
              <option value="risk">เสี่ยง</option>
              <option value="problem">มีปัญหา</option>
              <option value="notAssessed">ยังไม่ประเมิน</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg mb-2">
                {searchTerm ? 'ไม่พบนักเรียนที่ค้นหา' : 'ไม่พบข้อมูลนักเรียนในห้องนี้'}
              </p>
              <p className="text-slate-400 text-sm mb-4">
                {!searchTerm && 'เริ่มต้นด้วยการเพิ่มนักเรียนและทำการประเมิน'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push('/students')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  เริ่มประเมิน
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">นักเรียน</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-700 text-sm">รหัส</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-700 text-sm">อายุ</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-700 text-sm">จำนวนการประเมิน</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-700 text-sm">สถานะล่าสุด</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-700 text-sm">การดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredGroups.map((group) => (
                        <tr key={group.student.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{group.student.name}</p>
                                <p className="text-xs text-slate-500">
                                  {group.hasAssessments ? 
                                    `ประเมินล่าสุด: ${new Date(group.latestAssessment.completedDate || '').toLocaleDateString('th-TH')}` :
                                    'ยังไม่เคยประเมิน'
                                  }
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">{group.student.studentId}</code>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-sm text-slate-600">{group.student.age} ปี</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {group.assessments.length} ครั้ง
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {group.hasAssessments ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(group.latestAssessment.interpretations?.totalDifficulties || '')}`}>
                                {group.latestAssessment.interpretations?.totalDifficulties}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                ยังไม่ประเมิน
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end gap-2">
                              {group.hasAssessments ? (
                                <>
                                  <button
                                    onClick={() => router.push(`/results/student/${group.student.id}`)}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors font-medium"
                                  >
                                    ดูประวัติ
                                  </button>
                                  <button
                                    onClick={() => router.push(`/results/${group.latestAssessment.id}`)}
                                    className="px-3 py-1.5 border border-slate-300 text-slate-600 text-xs rounded-md hover:bg-slate-50 transition-colors font-medium"
                                  >
                                    ผลล่าสุด
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => router.push('/students')}
                                  className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors font-medium"
                                >
                                  เริ่มประเมิน
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredGroups.map((group) => (
                  <div key={group.student.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{group.student.name}</p>
                        <p className="text-xs text-slate-500">รหัส: {group.student.studentId} | อายุ: {group.student.age} ปี</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-600">การประเมิน:</span>
                        <span className="ml-1 font-medium text-slate-800">{group.assessments.length} ครั้ง</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-slate-600">สถานะ:</span>
                        <span className={`ml-1 text-xs font-medium ${
                          group.hasAssessments ? 
                            (group.latestAssessment.interpretations?.totalDifficulties === 'ปกติ' ? 'text-green-600' :
                             group.latestAssessment.interpretations?.totalDifficulties === 'เสี่ยง' ? 'text-yellow-600' : 'text-red-600') :
                            'text-gray-600'
                        }`}>
                          {group.hasAssessments ? group.latestAssessment.interpretations?.totalDifficulties : 'ยังไม่ประเมิน'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {group.hasAssessments ? (
                        <>
                          <button
                            onClick={() => router.push(`/results/student/${group.student.id}`)}
                            className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            ดูประวัติ
                          </button>
                          <button
                            onClick={() => router.push(`/results/${group.latestAssessment.id}`)}
                            className="flex-1 py-2 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium"
                          >
                            ผลล่าสุด
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => router.push('/students')}
                          className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          เริ่มประเมิน
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;