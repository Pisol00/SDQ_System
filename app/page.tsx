'use client'
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// Import types
import {
  Classroom,
  Student,
  Assessment,
  PageType,
  PreviewStudent
} from '../components/types';

// Import utilities
import { calculateScores, getInterpretation, calculateAge } from '../components/utils/sdqCalculations';

// Import components
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import StudentsManagement from '../components/StudentsManagement';
import AssessmentPage from '../components/Assessment';
import ImpactAssessment from '../components/ImpactAssessment';
import Results from '../components/Results';
import ClassroomReport from '../components/ClassroomReport';
import ClassroomDialog from '../components/ClassroomDialog';
import ImportDialog from '../components/ImportDialog';
import ProgressLoading from '@/components/ProgressLoading';

const SDQTeacherApp: React.FC = () => {


  // State management
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [classrooms, setClassrooms] = useState<Classroom[]>([
    { id: 1, name: 'ป.1/1', grade: 'ป.1', section: '1', year: '2567', createdDate: new Date().toISOString() }
  ]);
  const [currentClassroom, setCurrentClassroom] = useState<number>(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);

  // Dialog states
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showClassroomDialog, setShowClassroomDialog] = useState(false);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);

  // Excel import states
  const [excelFile, setExcelFile] = useState<any>(null);
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [previewData, setPreviewData] = useState<PreviewStudent[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Mobile responsiveness helpers
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper functions
  const getCurrentClassroom = (): Classroom =>
    classrooms.find(c => c.id === currentClassroom) || classrooms[0];

  const getClassroomStudents = (): Student[] =>
    students.filter(s => s.classroomId === currentClassroom);

  const getClassroomAssessments = (): Assessment[] =>
    assessments.filter(a => {
      const student = students.find(s => s.id === a.studentId);
      return student?.classroomId === currentClassroom;
    });

  // Enhanced page navigation with mobile optimization
  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
    // Close any open dropdowns when changing pages
    setShowClassroomDropdown(false);

    // Scroll to top on page change for better mobile UX
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Classroom management
  const addClassroom = (classroomData: Omit<Classroom, 'id' | 'createdDate'>) => {
    const newClassroom: Classroom = {
      id: Date.now(),
      ...classroomData,
      createdDate: new Date().toISOString()
    };
    setClassrooms([...classrooms, newClassroom]);
    setCurrentClassroom(newClassroom.id);
    setShowClassroomDialog(false);
    handlePageChange('dashboard');
  };

  const switchClassroom = (classroomId: number) => {
    setCurrentClassroom(classroomId);
    setShowClassroomDropdown(false);
    handlePageChange('dashboard');
  };

  // Student management
  const addStudent = (studentData: Omit<Student, 'id' | 'classroomId' | 'createdDate'>) => {
    const newStudent: Student = {
      id: Date.now(),
      ...studentData,
      classroomId: currentClassroom,
      createdDate: new Date().toISOString()
    };
    setStudents([...students, newStudent]);
  };

  // Assessment management
  const startNewAssessment = (student: Student) => {
    const newAssessment: Assessment = {
      id: Date.now(),
      studentId: student.id,
      studentName: student.name,
      classroomId: student.classroomId,
      date: new Date().toISOString().split('T')[0],
      responses: {},
      impactResponses: { hasProblems: -1 },
      completed: false
    };
    setCurrentAssessment(newAssessment);
    handlePageChange('assessment');
  };

  const moveToImpactAssessment = () => {
    if (!currentAssessment) return;
    handlePageChange('impact-assessment');
  };

  const backToAssessment = () => {
    handlePageChange('assessment');
  };

  const saveAssessment = () => {
    if (!currentAssessment) return;

    const scores = calculateScores(currentAssessment.responses);
    const interpretations = getInterpretation(scores);

    const completedAssessment: Assessment = {
      ...currentAssessment,
      scores,
      interpretations,
      completed: true,
      completedDate: new Date().toISOString()
    };

    setAssessments([...assessments, completedAssessment]);
    setCurrentAssessment(null);
    handlePageChange('results');
  };

  // Excel file handling
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        cellStyles: true,
        cellFormula: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
      });

      setExcelFile(workbook);
      setExcelSheets(workbook.SheetNames);
      setShowImportDialog(true);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const previewSheetData = (sheetName: string) => {
    if (!excelFile || !sheetName) return;

    try {
      const worksheet = excelFile.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const studentRows = jsonData.slice(3);
      const preview: PreviewStudent[] = [];

      studentRows.slice(0, 5).forEach((row: any, index: number) => {
        if (row && row[0] && row[1] && row[5] && row[6]) {
          preview.push({
            id: Date.now() + index,
            studentId: row[1]?.toString() || '',
            name: `${row[5]} ${row[6]}`,
            grade: sheetName.includes('6') ? 'ป.6' :
              sheetName.includes('5') ? 'ป.5' :
                sheetName.includes('4') ? 'ป.4' :
                  sheetName.includes('3') ? 'ป.3' :
                    sheetName.includes('2') ? 'ป.2' :
                      sheetName.includes('1') ? 'ป.1' : 'ไม่ระบุ',
            age: calculateAge(row[3]),
            gender: row[8] === 1 ? 'ชาย' : row[9] === 1 ? 'หญิง' : 'ไม่ระบุ'
          });
        }
      });

      setPreviewData(preview);
      setSelectedSheet(sheetName);
    } catch (error) {
      console.error('Error previewing sheet data:', error);
    }
  };

  const importStudentsFromExcel = () => {
    if (!excelFile || !selectedSheet) return;

    try {
      const worksheet = excelFile.Sheets[selectedSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const studentRows = jsonData.slice(3);
      const newStudents: Student[] = [];

      studentRows.forEach((row: any, index: number) => {
        if (row && row[0] && row[1] && row[5] && row[6]) {
          const student: Student = {
            id: Date.now() + index,
            studentId: row[1]?.toString() || '',
            name: `${row[5]} ${row[6]}`,
            grade: selectedSheet.includes('6') ? 'ป.6' :
              selectedSheet.includes('5') ? 'ป.5' :
                selectedSheet.includes('4') ? 'ป.4' :
                  selectedSheet.includes('3') ? 'ป.3' :
                    selectedSheet.includes('2') ? 'ป.2' :
                      selectedSheet.includes('1') ? 'ป.1' : 'ไม่ระบุ',
            age: calculateAge(row[3]),
            gender: row[8] === 1 ? 'ชาย' : row[9] === 1 ? 'หญิง' : 'ไม่ระบุ',
            fullNameWithTitle: row[7] || `${row[4]} ${row[5]} ${row[6]}`,
            birthDate: row[3],
            citizenId: row[2],
            classroomId: currentClassroom,
            createdDate: new Date().toISOString()
          };
          newStudents.push(student);
        }
      });

      const existingIds = students.map(s => s.studentId);
      const uniqueNewStudents = newStudents.filter(s => !existingIds.includes(s.studentId));

      setStudents([...students, ...uniqueNewStudents]);
      setShowImportDialog(false);
      setExcelFile(null);
      setExcelSheets([]);
      setSelectedSheet('');
      setPreviewData([]);

      alert(`นำเข้าข้อมูลลงในห้อง ${getCurrentClassroom().name} สำเร็จ! เพิ่มนักเรียนใหม่ ${uniqueNewStudents.length} คน`);
    } catch (error) {
      console.error('Error importing students:', error);
      alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
    }
  };

  const viewStudentHistory = (student: Student) => {
    setSelectedStudent(student);
    handlePageChange('student-history');
  };

  // Close dropdowns when clicking outside (mobile optimization)
  useEffect(() => {
    const handleClickOutside = () => {
      setShowClassroomDropdown(false);
    };

    if (showClassroomDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showClassroomDropdown]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" style={{ fontFamily: "'Sarabun', sans-serif" }}>
      <Navigation
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        classrooms={classrooms}
        currentClassroom={currentClassroom}
        showClassroomDropdown={showClassroomDropdown}
        setShowClassroomDropdown={setShowClassroomDropdown}
        switchClassroom={switchClassroom}
        setShowClassroomDialog={setShowClassroomDialog}
      />

      {/* Main Content Area with proper mobile spacing */}
      <main className="relative">
        {currentPage === 'dashboard' && (
          <Dashboard
            getCurrentClassroom={getCurrentClassroom}
            getClassroomStudents={getClassroomStudents}
            getClassroomAssessments={getClassroomAssessments}
            setCurrentPage={handlePageChange}
          />
        )}

        {currentPage === 'students' && (
          <StudentsManagement
            getCurrentClassroom={getCurrentClassroom}
            getClassroomStudents={getClassroomStudents}
            onAddStudent={addStudent}
            onStartAssessment={startNewAssessment}
            onViewStudentHistory={viewStudentHistory}
            assessments={assessments}
            isProcessingFile={isProcessingFile}
            onFileUpload={handleFileUpload}
          />
        )}

        {currentPage === 'assessment' && currentAssessment && (
          <AssessmentPage
            currentAssessment={currentAssessment}
            setCurrentAssessment={setCurrentAssessment}
            getCurrentClassroom={getCurrentClassroom}
            onMoveToImpactAssessment={moveToImpactAssessment}
          />
        )}

        {currentPage === 'impact-assessment' && currentAssessment && (
          <ImpactAssessment
            currentAssessment={currentAssessment}
            setCurrentAssessment={setCurrentAssessment}
            getCurrentClassroom={getCurrentClassroom}
            onSaveAssessment={saveAssessment}
            onBackToAssessment={backToAssessment}
          />
        )}

        {currentPage === 'results' && (
          <Results
            getClassroomAssessments={getClassroomAssessments}
            getCurrentClassroom={getCurrentClassroom}
            setCurrentPage={handlePageChange}
          />
        )}

        {currentPage === 'reports' && (
          <ClassroomReport
            getCurrentClassroom={getCurrentClassroom}
            getClassroomStudents={getClassroomStudents}
            getClassroomAssessments={getClassroomAssessments}
            setCurrentPage={handlePageChange}
          />
        )}
      </main>

      {/* Modal Dialogs */}
      {showImportDialog && (
        <ImportDialog
          onClose={() => setShowImportDialog(false)}
          onImport={importStudentsFromExcel}
          excelSheets={excelSheets}
          selectedSheet={selectedSheet}
          previewData={previewData}
          onPreviewSheet={previewSheetData}
          currentClassroom={getCurrentClassroom()}
        />
      )}

      {showClassroomDialog && (
        <ClassroomDialog
          onClose={() => setShowClassroomDialog(false)}
          onAddClassroom={addClassroom}
        />
      )}

      {/* Loading overlay for better mobile feedback */}
      {isProcessingFile && (
        <ProgressLoading message="กำลังประมวลผลไฟล์ Excel..." />
      )}
    </div>
  );
};

export default SDQTeacherApp;