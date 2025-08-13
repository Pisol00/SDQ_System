'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Search, User, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import ImportDialog from '../../components/ImportDialog';
import { toast } from 'sonner';
import { showToast } from '../../utils/toast'; // เพิ่ม import นี้

const StudentsPage: React.FC = () => {
  const router = useRouter();
  const {
    getCurrentClassroom,
    getClassroomStudents,
    addStudent,
    startNewAssessment,
    assessments,
    isProcessingFile,
    handleFileUpload,
    // เพิ่ม states สำหรับ Excel import
    showImportDialog,
    setShowImportDialog,
    excelSheets,
    selectedSheet,
    previewData,
    previewSheetData,
    importStudentsFromExcel
  } = useApp();

  const [newStudent, setNewStudent] = useState({
    name: '',
    studentId: '',
    age: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const classroomStudents = getClassroomStudents();
  const currentClassroom = getCurrentClassroom();

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.studentId) {
      addStudent(newStudent);
      setNewStudent({ name: '', studentId: '', age: '' });
      setShowAddForm(false);
    }
  };

  const filteredStudents = classroomStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.includes(searchTerm)
  );

  const hasStudentHistory = (student: any) => {
    return assessments.some(a => a.studentId === student.id);
  };

  const handleStartAssessment = (student: any) => {
    startNewAssessment(student);
    router.push('/assessment');
  };

  const handleViewStudentHistory = (student: any) => {
    // Navigate to results with student filter
    router.push(`/results/student/${student.id}`);
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">จัดการข้อมูลนักเรียน</h1>
                <p className="text-slate-600">เพิ่มและจัดการข้อมูลนักเรียนสำหรับการประเมิน SDQ</p>
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

        {/* Mobile Add Button */}
        <div className="mb-6 lg:hidden">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <PlusCircle className="h-5 w-5" />
            {showAddForm ? 'ยกเลิก' : 'เพิ่มนักเรียนใหม่'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Add Student Form */}
          <div className={`lg:col-span-1 ${showAddForm ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">เพิ่มนักเรียนใหม่</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors hover:border-slate-400"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">รหัสนักเรียน</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors hover:border-slate-400"
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                    placeholder="กรอกรหัสนักเรียน"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ชั้น</label>
                  <div className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-600">
                    {currentClassroom.name} (ดึงจากห้องปัจจุบัน)
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">อายุ</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors hover:border-slate-400"
                    value={newStudent.age}
                    onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                    placeholder="กรอกอายุ"
                  />
                </div>

                <button
                  onClick={handleAddStudent}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  เพิ่มนักเรียน
                </button>

                {/* Excel Import */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">นำเข้าจาก Excel</h3>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload"
                    disabled={isProcessingFile}
                  />
                  <label
                    htmlFor="excel-upload"
                    className={`w-full border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-slate-400 transition-colors flex flex-col items-center gap-2 ${isProcessingFile ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isProcessingFile ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-slate-600">กำลังประมวลผล...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="h-8 w-8 text-slate-400" />
                        <span className="text-sm text-slate-600">คลิกเพื่อเลือกไฟล์ Excel</span>
                        <span className="text-xs text-slate-500">รองรับ .xlsx, .xls</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className={`lg:col-span-3 ${showAddForm ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">

              {/* Header and Search */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  รายชื่อนักเรียนในห้อง {currentClassroom.name}
                  <span className="text-sm font-normal text-slate-600 ml-2">({classroomStudents.length} คน)</span>
                </h2>
                <div className="relative flex-shrink-0">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อหรือรหัสนักเรียน"
                    className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 text-sm transition-colors hover:border-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Students List */}
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg mb-2">
                    {searchTerm ? 'ไม่พบนักเรียนที่ค้นหา' : 'ไม่พบข้อมูลนักเรียนในห้องนี้'}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {!searchTerm && 'เริ่มต้นด้วยการเพิ่มนักเรียนใหม่'}
                  </p>
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
                            <th className="text-center py-3 px-4 font-medium text-slate-700 text-sm">ชั้น</th>
                            <th className="text-center py-3 px-4 font-medium text-slate-700 text-sm">อายุ</th>
                            <th className="text-center py-3 px-4 font-medium text-slate-700 text-sm">สถานะ</th>
                            <th className="text-right py-3 px-4 font-medium text-slate-700 text-sm">การดำเนินการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <User className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800">{student.name}</p>
                                    <p className="text-xs text-slate-500">เพิ่มเมื่อ {new Date(student.createdDate).toLocaleDateString('th-TH')}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">{student.studentId}</code>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {student.grade}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="text-sm text-slate-600">{student.age} ปี</span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                {hasStudentHistory(student) ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    มีประวัติ
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    ยังไม่ประเมิน
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleStartAssessment(student)}
                                    className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors font-medium"
                                  >
                                    ประเมิน
                                  </button>
                                  {hasStudentHistory(student) && (
                                    <button
                                      onClick={() => handleViewStudentHistory(student)}
                                      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors font-medium"
                                    >
                                      ประวัติ
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
                  <div className="md:hidden space-y-3">
                    {filteredStudents.map((student) => (
                      <div key={student.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-slate-800">{student.name}</h3>
                              <p className="text-xs text-slate-500">รหัส: {student.studentId}</p>
                            </div>
                          </div>
                          {hasStudentHistory(student) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              มีประวัติ
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">ชั้น</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {student.grade}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">อายุ</p>
                            <p className="text-sm font-medium text-slate-700">{student.age} ปี</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">สถานะ</p>
                            <p className="text-xs font-medium text-slate-700">
                              {hasStudentHistory(student) ? 'ประเมินแล้ว' : 'ยังไม่ประเมิน'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartAssessment(student)}
                            className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            ประเมิน SDQ
                          </button>
                          {hasStudentHistory(student) && (
                            <button
                              onClick={() => handleViewStudentHistory(student)}
                              className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              ดูประวัติ
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
      </div>

      {/* Import Dialog - เพิ่มส่วนนี้ */}
      {showImportDialog && (
        <ImportDialog
          onClose={() => setShowImportDialog(false)}
          onImport={importStudentsFromExcel}
          excelSheets={excelSheets}
          selectedSheet={selectedSheet}
          previewData={previewData}
          onPreviewSheet={previewSheetData}
          currentClassroom={currentClassroom}
        />
      )}
    </div>
  );
};

export default StudentsPage;