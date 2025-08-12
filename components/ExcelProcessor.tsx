// components/ExcelProcessor.tsx - Separate Excel processing logic
'use client';
import React, { useState, useCallback, useRef } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';

interface ExcelProcessorProps {
  onFileProcessed: (workbook: any, file: File) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
  disabled?: boolean;
  accept?: string;
  className?: string;
}

const ExcelProcessor: React.FC<ExcelProcessorProps> = ({ 
  onFileProcessed, 
  onError,
  isProcessing = false,
  disabled = false,
  accept = '.xlsx,.xls',
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processExcelFile = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      onError('กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)');
      return;
    }

    try {
      // Dynamically import XLSX to reduce initial bundle size
      const XLSX = await import('xlsx');
      
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        cellStyles: true,
        cellFormula: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
      });

      onFileProcessed(workbook, file);
    } catch (error) {
      console.error('Excel processing error:', error);
      onError('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel');
    }
  }, [onFileProcessed, onError]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
    // Reset input value to allow same file selection
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [processExcelFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || isProcessing) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processExcelFile(files[0]);
    }
  }, [processExcelFile, disabled, isProcessing]);

  const handleClick = useCallback(() => {
    if (disabled || isProcessing) return;
    inputRef.current?.click();
  }, [disabled, isProcessing]);

  return (
    <div className={`${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />
      
      <div
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
          disabled || isProcessing
            ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
            : dragActive
            ? 'border-blue-400 bg-blue-50 scale-105'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-sm text-slate-600">กำลังประมวลผล...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {dragActive ? (
              <Upload className="h-8 w-8 text-blue-500" />
            ) : (
              <FileSpreadsheet className="h-8 w-8 text-slate-400" />
            )}
            <div className="text-sm text-slate-600">
              {dragActive ? (
                <span className="text-blue-600 font-medium">วางไฟล์ที่นี่</span>
              ) : (
                <>
                  <span className="font-medium">คลิกเพื่อเลือกไฟล์ Excel</span>
                  <br />
                  <span className="text-slate-500">หรือลากไฟล์มาวางที่นี่</span>
                </>
              )}
            </div>
            <span className="text-xs text-slate-500">รองรับ .xlsx, .xls (สูงสุด 10MB)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelProcessor;