import React from 'react';
import { X } from 'lucide-react';

interface PreviewStudent {
  studentId: string;
  name: string;
  grade: string;
  age: string | number;
  gender: string;
}

interface Classroom {
  id: number;
  name: string;
  year: string;
}

interface ImportDialogProps {
  onClose: () => void;
  onImport: () => void;
  excelSheets: string[];
  selectedSheet: string;
  previewData: PreviewStudent[];
  onPreviewSheet: (sheetName: string) => void;
  currentClassroom: Classroom;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  onClose,
  onImport,
  excelSheets,
  selectedSheet,
  previewData,
  onPreviewSheet,
  currentClassroom
}) => {
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-gray-900/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                นำเข้าข้อมูลจาก Excel
              </h2>
              <p className="text-sm text-gray-600">
                ลงในห้อง <span className="font-medium text-blue-600">{currentClassroom.name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-4 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เลือก Sheet</label>
              <select
                value={selectedSheet}
                onChange={(e) => onPreviewSheet(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base cursor-pointer"
              >
                <option value="">-- เลือก Sheet --</option>
                {excelSheets.map((sheet) => (
                  <option key={sheet} value={sheet}>{sheet}</option>
                ))}
              </select>
            </div>

            {previewData.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  ตัวอย่างข้อมูล 
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (5 รายการแรก)
                  </span>
                </h3>
                
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-3">
                  {previewData.map((student, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">รหัส: {student.studentId}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {student.grade}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>อายุ: {student.age} ปี</span>
                          <span>เพศ: {student.gender}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          รหัสนักเรียน
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          ชื่อ-สกุล
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          ชั้น
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          อายุ
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          เพศ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((student, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 border-b">
                            {student.studentId}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 border-b">
                            {student.name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 border-b">
                            {student.grade}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 border-b">
                            {student.age} ปี
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 border-b">
                            {student.gender}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={onImport}
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base cursor-pointer"
                  >
                    นำเข้าข้อมูลลงในห้อง {currentClassroom.name}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;