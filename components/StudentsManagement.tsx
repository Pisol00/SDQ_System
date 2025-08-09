import React, { useState } from 'react';
import { PlusCircle, Search, User, FileSpreadsheet } from 'lucide-react';
import { Student, Classroom, Assessment } from './types';

interface StudentsManagementProps {
  getCurrentClassroom: () => Classroom;
  getClassroomStudents: () => Student[];
  onAddStudent: (student: Omit<Student, 'id' | 'classroomId' | 'createdDate'>) => void;
  onStartAssessment: (student: Student) => void;
  onViewStudentHistory: (student: Student) => void;
  assessments: Assessment[];
  isProcessingFile: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const StudentsManagement: React.FC<StudentsManagementProps> = ({
  getCurrentClassroom,
  getClassroomStudents,
  onAddStudent,
  onStartAssessment,
  onViewStudentHistory,
  assessments,
  isProcessingFile,
  onFileUpload
}) => {
  const [newStudent, setNewStudent] = useState({ 
    name: '', 
    studentId: '', 
    grade: '', 
    age: '' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const classroomStudents = getClassroomStudents();
  const currentClassroom = getCurrentClassroom();

  const addStudent = () => {
    if (newStudent.name && newStudent.studentId) {
      onAddStudent(newStudent);
      setNewStudent({ name: '', studentId: '', grade: '', age: '' });
      setShowAddForm(false);
    }
  };

  const filteredStudents = classroomStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.includes(searchTerm)
  );

  const hasStudentHistory = (student: Student) => {
    return assessments.some(a => a.studentId === student.id);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">จัดการข้อมูลนักเรียน</h1>
          <div className="text-left sm:text-right p-3 bg-blue-50 rounded-lg sm:bg-transparent sm:p-0">
            <p className="text-xs sm:text-sm text-gray-500">ห้องเรียน</p>
            <p className="text-base sm:text-lg font-bold text-blue-600">{currentClassroom.name}</p>
          </div>
        </div>
        <p className="text-sm sm:text-base text-gray-600">เพิ่มและจัดการข้อมูลนักเรียนสำหรับการประเมิน SDQ</p>
      </div>

      {/* Mobile Add Button */}
      <div className="mb-4 lg:hidden">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          {showAddForm ? 'ยกเลิก' : 'เพิ่มนักเรียนใหม่'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Student Form */}
        <div className={`lg:col-span-1 ${showAddForm ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">เพิ่มนักเรียนใหม่</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนักเรียน</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  value={newStudent.studentId}
                  onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                  placeholder="กรอกรหัสนักเรียน"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชั้น</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                  placeholder="เช่น ป.1, ป.2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อายุ</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  value={newStudent.age}
                  onChange={(e) => setNewStudent({...newStudent, age: e.target.value})}
                  placeholder="กรอกอายุ"
                />
              </div>
              <button
                onClick={addStudent}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                เพิ่มนักเรียน
              </button>
              
              {/* Excel Import */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">นำเข้าจาก Excel</h3>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={onFileUpload}
                  className="hidden"
                  id="excel-upload"
                  disabled={isProcessingFile}
                />
                <label
                  htmlFor="excel-upload"
                  className={`w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors flex flex-col items-center gap-2 ${
                    isProcessingFile ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessingFile ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">กำลังประมวลผล...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-600">คลิกเพื่อเลือกไฟล์ Excel</span>
                      <span className="text-xs text-gray-500">รองรับ .xlsx, .xls</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className={`lg:col-span-2 ${showAddForm ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            {/* Header and Search */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                รายชื่อนักเรียนในห้อง {currentClassroom.name}
                <span className="text-sm font-normal text-gray-600 ml-2">({classroomStudents.length} คน)</span>
              </h2>
              <div className="relative flex-shrink-0">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหรือรหัสนักเรียน"
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Students List */}
            {filteredStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
                {searchTerm ? 'ไม่พบนักเรียนที่ค้นหา' : 'ไม่พบข้อมูลนักเรียนในห้องนี้'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{student.name}</p>
                        <div className="text-xs sm:text-sm text-gray-600 flex flex-col sm:flex-row sm:gap-4">
                          <span>รหัส: {student.studentId}</span>
                          <span>ชั้น: {student.grade}</span>
                          <span>อายุ: {student.age} ปี</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => onStartAssessment(student)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ประเมิน SDQ
                      </button>
                      {hasStudentHistory(student) && (
                        <button
                          onClick={() => onViewStudentHistory(student)}
                          className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          ประวัติ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsManagement;