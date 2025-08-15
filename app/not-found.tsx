// app/not-found.tsx
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Users, ClipboardList, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext'; // ✅ ใช้ context

const NotFoundPage: React.FC = () => {
  const router = useRouter();
  const { setHideNavigation } = useApp(); // ✅ ใช้ context เพื่อซ่อน nav

  // ✅ ซ่อน navigation เมื่อเข้าหน้า 404
  useEffect(() => {
    setHideNavigation(true);
    
    // ✅ แสดง navigation เมื่อออกจากหน้า 404
    return () => {
      setHideNavigation(false);
    };
  }, [setHideNavigation]);

  const quickActions = [
    {
      icon: Home,
      label: 'หน้าหลัก',
      description: 'กลับไปยังหน้าแรกของระบบ',
      path: '/',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Users,
      label: 'จัดการนักเรียน',
      description: 'ดูรายชื่อนักเรียนและเริ่มการประเมิน',
      path: '/students',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: ClipboardList,
      label: 'ผลการประเมิน',
      description: 'ดูผลการประเมิน SDQ ของนักเรียน',
      path: '/results',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        
        {/* Main 404 Content */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">
              ไม่พบหน้าที่คุณต้องการ
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              หน้าที่คุณพยายามเข้าถึงอาจถูกย้าย เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบประเมิน SDQ
              <br />
              โปรดตรวจสอบ URL หรือเลือกหน้าที่ต้องการด้านล่าง
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors duration-200 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              กลับหน้าก่อนหน้า
            </button>
            <button
              onClick={() => handleNavigation('/')}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <Home className="h-5 w-5 mr-2" />
              กลับหน้าหลัก
            </button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={index}
                onClick={() => handleNavigation(action.path)}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${action.color} rounded-lg mb-4 transition-transform duration-200 group-hover:scale-110`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {action.label}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {action.description}
                </p>
              </div>
            );
          })}
        </div>
        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>ระบบประเมินพฤติกรรมนักเรียน (SDQ) - Student Assessment System</p>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;