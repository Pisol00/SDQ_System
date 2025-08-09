import * as XLSX from 'xlsx';
import { Student, PreviewStudent } from '../types';
import { calculateAge } from './sdqCalculations';

export const processExcelFile = async (file: File): Promise<XLSX.WorkBook> => {
  const arrayBuffer = await file.arrayBuffer();
  return XLSX.read(arrayBuffer, {
    cellStyles: true,
    cellFormula: true,
    cellDates: true,
    cellNF: true,
    sheetStubs: true
  });
};

export const extractStudentsFromSheet = (
  workbook: XLSX.WorkBook, 
  sheetName: string, 
  classroomId: number
): Student[] => {
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  const studentRows = jsonData.slice(3); // Skip header rows
  const students: Student[] = [];
  
  studentRows.forEach((row: any, index: number) => {
    if (row && row[0] && row[1] && row[5] && row[6]) {
      const student: Student = {
        id: Date.now() + index,
        studentId: row[1]?.toString() || '',
        name: `${row[5]} ${row[6]}`,
        grade: extractGradeFromSheetName(sheetName),
        age: calculateAge(row[3]),
        gender: row[8] === 1 ? 'ชาย' : row[9] === 1 ? 'หญิง' : 'ไม่ระบุ',
        fullNameWithTitle: row[7] || `${row[4]} ${row[5]} ${row[6]}`,
        birthDate: row[3],
        citizenId: row[2],
        classroomId,
        createdDate: new Date().toISOString()
      };
      students.push(student);
    }
  });
  
  return students;
};

export const extractPreviewData = (
  workbook: XLSX.WorkBook, 
  sheetName: string,
  maxRows: number = 5
): PreviewStudent[] => {
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  const studentRows = jsonData.slice(3);
  const preview: PreviewStudent[] = [];
  
  studentRows.slice(0, maxRows).forEach((row: any, index: number) => {
    if (row && row[0] && row[1] && row[5] && row[6]) {
      preview.push({
        id: Date.now() + index,
        studentId: row[1]?.toString() || '',
        name: `${row[5]} ${row[6]}`,
        grade: extractGradeFromSheetName(sheetName),
        age: calculateAge(row[3]),
        gender: row[8] === 1 ? 'ชาย' : row[9] === 1 ? 'หญิง' : 'ไม่ระบุ'
      });
    }
  });
  
  return preview;
};

const extractGradeFromSheetName = (sheetName: string): string => {
  if (sheetName.includes('6')) return 'ป.6';
  if (sheetName.includes('5')) return 'ป.5';
  if (sheetName.includes('4')) return 'ป.4';
  if (sheetName.includes('3')) return 'ป.3';
  if (sheetName.includes('2')) return 'ป.2';
  if (sheetName.includes('1')) return 'ป.1';
  return 'ไม่ระบุ';
};

export const validateExcelStructure = (workbook: XLSX.WorkBook, sheetName: string): boolean => {
  try {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Check if we have enough rows
    if (jsonData.length < 4) return false;
    
    // Check if first data row has required columns
    const firstDataRow = jsonData[3] as any[];
    return firstDataRow && firstDataRow[1] && firstDataRow[5] && firstDataRow[6];
  } catch (error) {
    console.error('Error validating Excel structure:', error);
    return false;
  }
};