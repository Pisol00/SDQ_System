import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ClassroomDialogProps {
  onClose: () => void;
  onAddClassroom: (classroomData: {
    name: string;
    grade: string;
    section: string;
    year: string;
  }) => void;
}

const ClassroomDialog: React.FC<ClassroomDialogProps> = ({ onClose, onAddClassroom }) => {
  const [newClassroom, setNewClassroom] = useState({ 
    name: '', 
    grade: '', 
    section: '', 
    year: '2567' 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClassroom.grade && newClassroom.section) {
      const classroomName = `${newClassroom.grade}/${newClassroom.section}`;
      onAddClassroom({ ...newClassroom, name: classroomName });
      setNewClassroom({ name: '', grade: '', section: '', year: '2567' });
    }
  };

  const gradeOptions = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-gray-900/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">เพิ่มห้องเรียนใหม่</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชั้น</label>
              <select
                value={newClassroom.grade}
                onChange={(e) => setNewClassroom({...newClassroom, grade: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base cursor-pointer"
                required
              >
                <option value="">เลือกชั้น</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ห้อง</label>
              <input
                type="text"
                value={newClassroom.section}
                onChange={(e) => setNewClassroom({...newClassroom, section: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="เช่น 1, 2, 3..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
              <input
                type="text"
                value={newClassroom.year}
                onChange={(e) => setNewClassroom({...newClassroom, year: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="2567"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base cursor-pointer"
              >
                เพิ่มห้องเรียน
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassroomDialog;