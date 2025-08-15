// contexts/AppContext.tsx - แก้ไขปัญหา infinite re-render จากโค้ดเดิม
'use client';
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
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

// Context Type - ✅ ครบถ้วนจากโปรเจคเดิม
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

  hideNavigation: boolean;
  setHideNavigation: (hide: boolean) => void;

  // Assessment Management Functions
  getOrCreateAssessment: (student: Student) => Assessment;
  getAssessmentByStudentId: (studentId: number) => Assessment | null;
  getCompletedAssessmentByStudentId: (studentId: number) => Assessment | null;
  getStudentAssessmentStatus: (studentId: number) => 'completed' | 'in-progress' | 'not-started';
  addAssessment: (assessment: Assessment) => void;
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
  cleanupDuplicateAssessments:() => void;
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
  // ✅ States
  const [classrooms, setClassrooms] = useState<Classroom[]>([
    { id: 1, name: 'ป.1/1', grade: 'ป.1', section: '1', year: '2567', createdDate: new Date().toISOString() }
  ]);
  const [currentClassroom, setCurrentClassroom] = useState<number>(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // ✅ Use useRef for tracking created assessments to prevent duplicates
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

  const [hideNavigation, setHideNavigation] = useState<boolean>(false);

  // ✅ Load data from localStorage on mount
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

  // ✅ Save data to localStorage when state changes
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

  // ✅ Stable helper functions using useCallback
  const getCurrentClassroom = useCallback((): Classroom => {
    return classrooms.find(c => c.id === currentClassroom) || classrooms[0];
  }, [classrooms, currentClassroom]);

  const getClassroomStudents = useCallback((): Student[] => {
    return students.filter(s => s.classroomId === currentClassroom);
  }, [students, currentClassroom]);

  const getClassroomAssessments = useCallback((): Assessment[] => {
    return assessments.filter(a => {
      const student = students.find(s => s.id === a.studentId);
      return student?.classroomId === currentClassroom;
    });
  }, [assessments, students, currentClassroom]);

  // ✅ Stable assessment management functions
  const getAssessmentByStudentId = useCallback((studentId: number): Assessment | null => {
    return assessments.find(a => a.studentId === studentId && !a.completed) || null;
  }, [assessments]);

  const getCompletedAssessmentByStudentId = useCallback((studentId: number): Assessment | null => {
    return assessments.find(a => a.studentId === studentId && a.completed) || null;
  }, [assessments]);

  const getStudentAssessmentStatus = useCallback((studentId: number): 'completed' | 'in-progress' | 'not-started' => {
    const completedAssessment = assessments.find(a => a.studentId === studentId && a.completed);
    if (completedAssessment) return 'completed';

    const inProgressAssessment = assessments.find(a => a.studentId === studentId && !a.completed);
    if (inProgressAssessment) return 'in-progress';

    return 'not-started';
  }, [assessments]);

  const addAssessment = useCallback((assessment: Assessment) => {
    setAssessments(prev => [...prev, assessment]);
  }, []);

  const updateAssessment = useCallback((updatedAssessment: Assessment) => {
    setAssessments(prev => {
      const index = prev.findIndex(a => a.id === updatedAssessment.id);
      if (index >= 0) {
        // Update existing assessment
        const newAssessments = [...prev];
        newAssessments[index] = updatedAssessment;
        return newAssessments;
      } else {
        // Add new assessment
        return [...prev, updatedAssessment];
      }
    });
  }, []);

  // ✅ แก้ไข getOrCreateAssessment function ให้ป้องกัน duplicate ได้ดีขึ้น
  const getOrCreateAssessment = (student: Student): Assessment => {
    // หา assessment ที่ยังไม่เสร็จก่อน
    let existingAssessment = assessments.find(a =>
      a.studentId === student.id && !a.completed
    );

    // ถ้าพบแล้ว return ทันที
    if (existingAssessment) {
      return existingAssessment;
    }

    // ตรวจสอบว่ากำลังสร้างอยู่หรือไม่
    if (createdAssessments.current.has(student.id)) {
      // รอ assessment ที่สร้างแล้วใน state (ใช้ timeout เล็กน้อย)
      const waitForAssessment = () => {
        const newAssessment = assessments.find(a =>
          a.studentId === student.id && !a.completed
        );

        if (newAssessment) {
          return newAssessment;
        }

        // ถ้ายังไม่พบ สร้างใหม่
        return createNewAssessment(student);
      };

      return waitForAssessment();
    }

    // สร้าง assessment ใหม่
    return createNewAssessment(student);
  };

  const createNewAssessment = (student: Student): Assessment => {
    // ป้องกันการสร้างซ้ำ
    createdAssessments.current.add(student.id);

    const newAssessment: Assessment = {
      id: Date.now() + Math.random(),
      studentId: student.id,
      studentName: student.name,
      classroomId: student.classroomId,
      date: new Date().toISOString().split('T')[0],
      responses: {},
      impactResponses: { hasProblems: -1 },
      completed: false
    };

    // เพิ่มใน state
    setAssessments(prev => {
      // ตรวจสอบอีกครั้งว่าไม่มีใน state แล้ว
      const existing = prev.find(a =>
        a.studentId === student.id && !a.completed
      );

      if (existing) {
        // ถ้ามีแล้ว ไม่ต้องเพิ่ม
        createdAssessments.current.delete(student.id);
        return prev;
      }

      // เพิ่ม assessment ใหม่
      return [...prev, newAssessment];
    });

    // เคลียร์หลังจากสร้างเสร็จ
    setTimeout(() => {
      createdAssessments.current.delete(student.id);
    }, 100);

    return newAssessment;
  };

  const startNewAssessment = useCallback((student: Student) => {
    const assessment = getOrCreateAssessment(student);
    setCurrentAssessment(assessment);
    setSelectedStudent(student);
  }, [getOrCreateAssessment]);

  const saveAssessment = useCallback((assessment: Assessment) => {
    setAssessments(prev => {
      const existingIndex = prev.findIndex(a => a.id === assessment.id);
      if (existingIndex >= 0) {
        const newAssessments = [...prev];
        newAssessments[existingIndex] = assessment;
        return newAssessments;
      } else {
        return [...prev, assessment];
      }
    });

    showToast.success(`บันทึกผลการประเมินของ ${assessment.studentName} เรียบร้อยแล้ว`);
  }, []);

  // ✅ Function สำหรับทำความสะอาด duplicate assessments
  const cleanupDuplicateAssessments = () => {
    setAssessments(prev => {
      const cleanedAssessments: Assessment[] = [];
      const studentMap = new Map<number, { completed: Assessment[], inProgress: Assessment[] }>();

      // จัดกลุ่มตาม studentId
      prev.forEach(assessment => {
        if (!studentMap.has(assessment.studentId)) {
          studentMap.set(assessment.studentId, { completed: [], inProgress: [] });
        }

        const group = studentMap.get(assessment.studentId)!;
        if (assessment.completed) {
          group.completed.push(assessment);
        } else {
          group.inProgress.push(assessment);
        }
      });

      // สำหรับแต่ละนักเรียน เก็บเฉพาะ assessment ที่จำเป็น
      studentMap.forEach((group) => {
        // เก็บ completed assessments ทั้งหมด (เผื่อต้องการดูประวัติ)
        cleanedAssessments.push(...group.completed);

        // เก็บเฉพาะ in-progress assessment อันล่าสุด
        if (group.inProgress.length > 0) {
          const latestInProgress = group.inProgress.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          cleanedAssessments.push(latestInProgress);
        }
      });

      const removedCount = prev.length - cleanedAssessments.length;
      if (removedCount > 0) {
        showToast.success(`ลบแบบประเมินที่ซ้ำซ้อน ${removedCount} รายการ`);
      } else {
        showToast.info('ไม่พบแบบประเมินที่ซ้ำซ้อน');
      }

      return cleanedAssessments;
    });
  };
  // ✅ Other stable functions
  const addClassroom = useCallback((classroom: Omit<Classroom, 'id' | 'createdDate'>) => {
    const newClassroom: Classroom = {
      ...classroom,
      id: Date.now(),
      createdDate: new Date().toISOString()
    };
    setClassrooms(prev => [...prev, newClassroom]);
  }, []);

  const addStudent = useCallback((student: Omit<Student, 'id' | 'classroomId' | 'createdDate' | 'grade'>) => {
    const currentClassroomData = classrooms.find(c => c.id === currentClassroom);
    const newStudent: Student = {
      ...student,
      id: Date.now(),
      classroomId: currentClassroom,
      grade: currentClassroomData?.name || '',
      createdDate: new Date().toISOString()
    };
    setStudents(prev => [...prev, newStudent]);
  }, [currentClassroom, classrooms]);

  // ✅ Excel Import Functions - เพิ่ม useCallback
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    showToast.loading('กำลังประมวลผลไฟล์ Excel...');

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
  }, []);

  const previewSheetData = useCallback((sheetName: string) => {
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
  }, [excelFile, getCurrentClassroom]);

  const importStudentsFromExcel = useCallback(() => {
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
        setStudents(prev => [...prev, ...uniqueNewStudents]);
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
  }, [excelFile, selectedSheet, students, currentClassroom, getCurrentClassroom]);

  // ✅ Context Value - ครบถ้วนทุก functions
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

    hideNavigation,
    setHideNavigation,

    // Assessment Management Functions
    getOrCreateAssessment,
    getAssessmentByStudentId,
    getCompletedAssessmentByStudentId,
    getStudentAssessmentStatus,
    addAssessment,
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
    importStudentsFromExcel,
    cleanupDuplicateAssessments
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};