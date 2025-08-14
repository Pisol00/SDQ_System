'use client';
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import * as XLSX from 'xlsx';
import { showToast } from '../utils/toast';
import { calculateAge } from '../utils/sdqCalculations';

// Types (เหมือนเดิม...)
export interface Classroom {
  id: number;
  name: string;
  grade: string;
  section: string;
  year: string;
  createdDate: string;
}

export interface Student {
  id: number;
  studentId: string;
  name: string;
  grade: string;
  age: string | number;
  gender?: string;
  fullNameWithTitle?: string;
  birthDate?: any;
  citizenId?: string;
  classroomId: number;
  createdDate: string;
}

export interface Assessment {
  id: number;
  studentId: number;
  studentName: string;
  classroomId: number;
  date: string;
  responses: Record<number, number>;
  impactResponses?: {
    hasProblems: number;
    duration?: number;
    distress?: number;
    impactFriends?: number;
    impactLearning?: number;
    burdenOthers?: number;
  };
  completed: boolean;
  scores?: SDQScores;
  interpretations?: SDQInterpretations;
  completedDate?: string;
}

export interface SDQScores {
  emotional: number;
  conduct: number;
  hyperactivity: number;
  peer: number;
  prosocial: number;
  totalDifficulties: number;
}

export interface SDQInterpretations {
  emotional: string;
  conduct: string;
  hyperactivity: string;
  peer: string;
  prosocial: string;
  totalDifficulties: string;
}

export interface PreviewStudent {
  id: number;
  studentId: string;
  name: string;
  grade: string;
  age: string | number;
  gender: string;
}

// Context Type - ✅ เพิ่ม functions ใหม่
interface AppContextType {
  // State
  classrooms: Classroom[];
  currentClassroom: number;
  students: Student[];
  assessments: Assessment[];

  // Current Assessment
  currentAssessment: Assessment | null;
  selectedStudent: Student | null;

  // Excel Import
  excelFile: any;
  excelSheets: string[];
  selectedSheet: string;
  previewData: PreviewStudent[];
  isProcessingFile: boolean;

  // Dialog States
  showImportDialog: boolean;
  showClassroomDialog: boolean;
  showClassroomDropdown: boolean;

  // Assessment Management Functions
  getOrCreateAssessment: (student: Student) => Assessment;
  getAssessmentByStudentId: (studentId: number) => Assessment | null;
  getCompletedAssessmentByStudentId: (studentId: number) => Assessment | null; // ✅ เพิ่ม
  getStudentAssessmentStatus: (studentId: number) => 'completed' | 'in-progress' | 'not-started'; // ✅ เพิ่ม
  addAssessment: (assessment: Assessment) => void; // ✅ เพิ่ม
  updateAssessment: (assessment: Assessment) => void;

  // Actions
  setCurrentClassroom: (id: number) => void;
  addClassroom: (classroom: Omit<Classroom, 'id' | 'createdDate'>) => void;
  addStudent: (student: Omit<Student, 'id' | 'classroomId' | 'createdDate' | 'grade'>) => void;
  startNewAssessment: (student: Student) => void;
  saveAssessment: (assessment: Assessment) => void;
  setCurrentAssessment: (assessment: Assessment | null) => void;
  setSelectedStudent: (student: Student | null) => void;

  // Excel Import Actions
  setExcelFile: (file: any) => void;
  setExcelSheets: (sheets: string[]) => void;
  setSelectedSheet: (sheet: string) => void;
  setPreviewData: (data: PreviewStudent[]) => void;
  setIsProcessingFile: (processing: boolean) => void;

  // Dialog Actions
  setShowImportDialog: (show: boolean) => void;
  setShowClassroomDialog: (show: boolean) => void;
  setShowClassroomDropdown: (show: boolean) => void;

  // Helper Functions
  getCurrentClassroom: () => Classroom;
  getClassroomStudents: () => Student[];
  getClassroomAssessments: () => Assessment[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  previewSheetData: (sheetName: string) => void;
  importStudentsFromExcel: () => void;
}

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Provider Component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [classrooms, setClassrooms] = useState<Classroom[]>([
    { id: 1, name: 'ป.1/1', grade: 'ป.1', section: '1', year: '2567', createdDate: new Date().toISOString() }
  ]);
  const [currentClassroom, setCurrentClassroom] = useState<number>(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const createdAssessments = useRef<Set<number>>(new Set());

  // Current Assessment State
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Excel Import State
  const [excelFile, setExcelFile] = useState<any>(null);
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [previewData, setPreviewData] = useState<PreviewStudent[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Dialog States
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showClassroomDialog, setShowClassroomDialog] = useState(false);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedClassrooms = localStorage.getItem('sdq-classrooms');
    const savedStudents = localStorage.getItem('sdq-students');
    const savedAssessments = localStorage.getItem('sdq-assessments');
    const savedCurrentClassroom = localStorage.getItem('sdq-current-classroom');

    if (savedClassrooms) {
      setClassrooms(JSON.parse(savedClassrooms));
    }
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
    if (savedAssessments) {
      setAssessments(JSON.parse(savedAssessments));
    }
    if (savedCurrentClassroom) {
      setCurrentClassroom(parseInt(savedCurrentClassroom));
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('sdq-classrooms', JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem('sdq-students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('sdq-assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('sdq-current-classroom', currentClassroom.toString());
  }, [currentClassroom]);

  // Helper Functions
  const getCurrentClassroom = (): Classroom =>
    classrooms.find(c => c.id === currentClassroom) || classrooms[0];

  const getClassroomStudents = (): Student[] =>
    students.filter(s => s.classroomId === currentClassroom);

  const getClassroomAssessments = (): Assessment[] =>
    assessments.filter(a => {
      const student = students.find(s => s.id === a.studentId);
      return student?.classroomId === currentClassroom;
    });

  // ✅ Assessment Management Functions - แก้ไขให้ถูกต้อง
  const getOrCreateAssessment = (student: Student): Assessment => {
    // ตรวจสอบก่อนว่ากำลังสร้างอยู่หรือไม่
    if (createdAssessments.current.has(student.id)) {
      // รอให้ state update
      return assessments.find(a => a.studentId === student.id && !a.completed)!;
    }

    // หา assessment ที่ยังไม่เสร็จ
    let existingAssessment = assessments.find(a =>
      a.studentId === student.id && !a.completed
    );

    if (!existingAssessment) {
      // สร้าง assessment ใหม่
      createdAssessments.current.add(student.id);
      
      existingAssessment = {
        id: Date.now() + Math.random(),
        studentId: student.id,
        studentName: student.name,
        classroomId: student.classroomId,
        date: new Date().toISOString().split('T')[0],
        responses: {},
        impactResponses: { hasProblems: -1 },
        completed: false
      };

      setAssessments(prev => [...prev, existingAssessment!]);
      
      // เคลียร์หลังจากสร้างเสร็จ
      setTimeout(() => {
        createdAssessments.current.delete(student.id);
      }, 100);
    }

    return existingAssessment;
  };

  const getAssessmentByStudentId = (studentId: number): Assessment | null => {
    // หา assessment ที่ยังไม่เสร็จสำหรับ student คนนี้
    return assessments.find(a =>
      a.studentId === studentId && !a.completed
    ) || null;
  };

  // ✅ เพิ่ม function สำหรับเช็ค assessment ที่เสร็จแล้ว
  const getCompletedAssessmentByStudentId = (studentId: number): Assessment | null => {
    const completedAssessments = assessments.filter(a =>
      a.studentId === studentId && a.completed
    );
    
    if (completedAssessments.length === 0) return null;
    
    // ส่งกลับ assessment ล่าสุด
    return completedAssessments.sort((a, b) => 
      new Date(b.completedDate || b.date).getTime() - 
      new Date(a.completedDate || a.date).getTime()
    )[0];
  };

  // ✅ เพิ่ม function สำหรับเช็คสถานะ assessment ของ student
  const getStudentAssessmentStatus = (studentId: number): 'completed' | 'in-progress' | 'not-started' => {
    const hasCompleted = assessments.some(a => a.studentId === studentId && a.completed);
    const hasInProgress = assessments.some(a => a.studentId === studentId && !a.completed);
    
    if (hasCompleted) return 'completed';
    if (hasInProgress) return 'in-progress';
    return 'not-started';
  };

  // ✅ เพิ่ม function สำหรับเพิ่ม assessment ใหม่
  const addAssessment = (assessment: Assessment) => {
    setAssessments(prev => [...prev, assessment]);
  };

  const updateAssessment = (updatedAssessment: Assessment) => {
    setAssessments(prev =>
      prev.map(a =>
        a.id === updatedAssessment.id ? updatedAssessment : a
      )
    );
  };

  // Actions
  const addClassroom = (classroomData: Omit<Classroom, 'id' | 'createdDate'>) => {
    const newClassroom: Classroom = {
      id: Date.now(),
      ...classroomData,
      createdDate: new Date().toISOString()
    };
    setClassrooms([...classrooms, newClassroom]);
    setCurrentClassroom(newClassroom.id);
    setShowClassroomDialog(false);

    showToast.success(`เพิ่มห้องเรียน ${newClassroom.name} เรียบร้อยแล้ว`);
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'classroomId' | 'createdDate' | 'grade'>) => {
    const newStudent: Student = {
      id: Date.now(),
      ...studentData,
      grade: getCurrentClassroom().name,
      classroomId: currentClassroom,
      createdDate: new Date().toISOString()
    };
    setStudents([...students, newStudent]);

    showToast.success(`เพิ่มนักเรียน ${newStudent.name} เรียบร้อยแล้ว`);
  };

  const startNewAssessment = (student: Student) => {
    showToast.info(`เริ่มประเมิน SDQ สำหรับ ${student.name}`);
  };

  const saveAssessment = (assessment: Assessment) => {
    setAssessments(prev =>
      prev.map(a =>
        a.id === assessment.id ? assessment : a
      )
    );

    showToast.success(`บันทึกผลการประเมินของ ${assessment.studentName} เรียบร้อยแล้ว`);
  };

  // Excel Import Functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const loadingId = showToast.loading('กำลังประมวลผลไฟล์ Excel...');

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

      showToast.success('อ่านไฟล์ Excel เรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error reading Excel file:', error);
      showToast.error('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel');
    } finally {
      setIsProcessingFile(false);
      if (event.target) {
        event.target.value = '';
      }
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
            grade: getCurrentClassroom().name,
            age: calculateAge(row[3]),
            gender: row[8] === 1 ? 'ชาย' : row[9] === 1 ? 'หญิง' : 'ไม่ระบุ'
          });
        }
      });

      setPreviewData(preview);
      setSelectedSheet(sheetName);

      showToast.info(`แสดงตัวอย่างข้อมูลจาก Sheet: ${sheetName}`);
    } catch (error) {
      console.error('Error previewing sheet data:', error);
      showToast.error('เกิดข้อผิดพลาดในการแสดงตัวอย่างข้อมูล');
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
            grade: getCurrentClassroom().name,
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

      if (uniqueNewStudents.length === 0) {
        showToast.warning('ไม่มีข้อมูลนักเรียนใหม่ที่ต้องนำเข้า (ข้อมูลทั้งหมดมีอยู่แล้ว)');
      } else {
        setStudents([...students, ...uniqueNewStudents]);
        showToast.success(`นำเข้าข้อมูลลงในห้อง ${getCurrentClassroom().name} สำเร็จ!`,
          `เพิ่มนักเรียนใหม่ ${uniqueNewStudents.length} คน`);
      }

      // รีเซ็ตทุกอย่างหลังจากเสร็จสิ้น
      setShowImportDialog(false);
      setExcelFile(null);
      setExcelSheets([]);
      setSelectedSheet('');
      setPreviewData([]);
    } catch (error) {
      console.error('Error importing students:', error);
      showToast.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล', (error as Error).message);
    }
  };

  // ✅ Context Value - เพิ่ม functions ใหม่ทั้งหมด
  const value: AppContextType = {
    // State
    classrooms,
    currentClassroom,
    students,
    assessments,
    currentAssessment,
    selectedStudent,
    excelFile,
    excelSheets,
    selectedSheet,
    previewData,
    isProcessingFile,
    showImportDialog,
    showClassroomDialog,
    showClassroomDropdown,

    // Assessment Management Functions
    getOrCreateAssessment,
    getAssessmentByStudentId,
    getCompletedAssessmentByStudentId, // ✅ เพิ่ม
    getStudentAssessmentStatus, // ✅ เพิ่ม
    addAssessment, // ✅ เพิ่ม
    updateAssessment,

    // Actions
    setCurrentClassroom,
    addClassroom,
    addStudent,
    startNewAssessment,
    saveAssessment,
    setCurrentAssessment,
    setSelectedStudent,
    setExcelFile,
    setExcelSheets,
    setSelectedSheet,
    setPreviewData,
    setIsProcessingFile,
    setShowImportDialog,
    setShowClassroomDialog,
    setShowClassroomDropdown,
    
    // Helper Functions
    getCurrentClassroom,
    getClassroomStudents,
    getClassroomAssessments,
    handleFileUpload,
    previewSheetData,
    importStudentsFromExcel
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};