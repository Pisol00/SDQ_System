'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BarChart3, Users, ClipboardList, PieChart, ChevronDown, PlusCircle, Menu, X, User } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { DynamicClassroomDialog, DialogLoading } from './LazyComponents';
import { showToast } from '../utils/toast';

// Enhanced Logo Component with click to home
const Logo = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div 
      className="flex items-center cursor-pointer hover:opacity-80 transition-opacity group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
        <BarChart3 className="h-6 w-6 text-white" />
      </div>
      <div className="ml-3 hidden sm:block">
        <div className="text-slate-800 font-semibold text-lg group-hover:text-blue-600 transition-colors">
          ระบบประเมินผล
        </div>
        <div className="text-slate-500 font-medium text-xs">
          Student Assessment System
        </div>
      </div>
    </div>
  );
};

// Enhanced Navigation Link Component
const NavLink = ({
  isActive,
  icon: Icon,
  children,
  onClick,
  className = ""
}: {
  isActive: boolean;
  icon: React.ElementType;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) => {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 relative group cursor-pointer ${
        isActive 
          ? 'text-blue-700 bg-blue-50 shadow-sm' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      } ${className}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={`w-4 h-4 transition-all duration-200 ${
        isActive ? 'text-blue-600 scale-110' : 'text-slate-500 group-hover:scale-110'
      }`} />
      <span>{children}</span>
      
      {/* Active indicator */}
      <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-500 transition-all duration-200 ${
        isActive ? 'w-3/4' : 'w-0 group-hover:w-3/4'
      }`} />
    </button>
  );
};

// Enhanced User Profile
const UserProfile = ({ onLogout }: { onLogout: () => void }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-all duration-200 relative cursor-pointer group focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="เปิดเมนูผู้ใช้"
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <User className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-64 py-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 animate-fadeIn">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">ครูประจำ</div>
                <div className="text-xs text-slate-500">ผู้ใช้งานระบบ</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
              <User className="w-4 h-4 mr-3 text-slate-500" />
              จัดการโปรไฟล์
            </button>
          </div>

          {/* Logout Section */}
          <div className="border-t border-slate-100 py-1">
            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer group"
            >
              <svg className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Classroom Selector
const ClassroomSelector = ({ pathname }: { pathname: string }) => {
  const { 
    classrooms, 
    currentClassroom, 
    setCurrentClassroom, 
    getCurrentClassroom,
    showClassroomDropdown, 
    setShowClassroomDropdown,
    setShowClassroomDialog 
  } = useApp();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check if in assessment mode
  const isInAssessment = pathname.includes('/assessment');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowClassroomDropdown(false);
      }
    };

    if (showClassroomDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showClassroomDropdown, setShowClassroomDropdown]);

  const handleClassroomSwitch = (classroomId: number) => {
    // ป้องกันการเปลี่ยนห้องเมื่ออยู่ใน assessment
    if (isInAssessment) {
      return;
    }
    
    setCurrentClassroom(classroomId);
    setShowClassroomDropdown(false);
    
    // Stay on current page but with new classroom context
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          // ป้องกันการเปิด dropdown เมื่ออยู่ใน assessment
          if (isInAssessment) {
            return;
          }
          setShowClassroomDropdown(!showClassroomDropdown);
        }}
        disabled={isInAssessment}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border border-slate-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isInAssessment
            ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer'
        }`}
        aria-expanded={showClassroomDropdown}
        aria-haspopup="true"
        title={isInAssessment ? 'ไม่สามารถเปลี่ยนห้องระหว่างการประเมินได้' : ''}
      >
        <span className="truncate max-w-32">{getCurrentClassroom()?.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
          showClassroomDropdown ? 'rotate-180' : 'rotate-0'
        }`} />
      </button>

      {showClassroomDropdown && !isInAssessment && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-fadeIn">
          {/* Classroom List */}
          <div className="py-2 max-h-64 overflow-y-auto">
            <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              เปลี่ยนห้องเรียน
            </div>
            
            {classrooms.map((classroom) => (
              <button
                key={classroom.id}
                onClick={() => handleClassroomSwitch(classroom.id)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors cursor-pointer ${
                  classroom.id === currentClassroom ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{classroom.name}</div>
                    <div className="text-xs text-slate-500">ปีการศึกษา {classroom.year}</div>
                  </div>
                  {classroom.id === currentClassroom && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Add New Classroom */}
          <div className="border-t border-slate-100">
            <button
              onClick={() => {
                setShowClassroomDropdown(false);
                setShowClassroomDialog(true);
              }}
              className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>เพิ่มห้องเรียนใหม่</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Navigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    getCurrentClassroom, 
    showClassroomDialog,
    setShowClassroomDialog,
    addClassroom
  } = useApp();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = [
    { key: '/', label: 'หน้าหลัก', icon: BarChart3 },
    { key: '/students', label: 'นักเรียน', icon: Users },
    { key: '/results', label: 'ผลประเมิน', icon: ClipboardList },
    { key: '/reports', label: 'รายงาน', icon: PieChart }
  ];

  const handleNavigation = (path: string) => {
    // ป้องกันการนำทางระหว่าง assessment
    if (pathname.includes('/assessment') && path !== pathname) {
      showToast.navConfirm(() => {
        router.push(path);
        setShowMobileMenu(false);
      });
      return;
    }
    
    router.push(path);
    setShowMobileMenu(false);
  };

  const handleLogoClick = () => {
    handleNavigation('/');
  };

  const handleLogout = () => {
    showToast.logoutConfirm(() => {
      // เคลียร์ข้อมูลผู้ใช้/โทเค็นตามที่ระบบ login ของคุณใช้
      try {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      } catch (error) {
        console.warn('Could not clear auth data:', error);
      }
      // ไปหน้า login ด้วย router
      router.push('/login');
      showToast.success('ออกจากระบบเรียบร้อยแล้ว');
    });
  };

  // Handle escape key for all dropdowns
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Enhanced CSS Animations */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo Section - Enhanced with click handler */}
            <Logo onClick={handleLogoClick} />

            {/* Navigation Menu - Desktop */}
            <nav className="hidden md:flex items-center justify-center space-x-1">
              {navItems.map(({ key, label, icon }) => (
                <NavLink
                  key={key}
                  isActive={pathname === key}
                  icon={icon}
                  onClick={() => handleNavigation(key)}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right Side - Enhanced */}
            <div className="flex items-center space-x-4">
              
              {/* Enhanced Classroom Switcher - Desktop */}
              <div className="hidden md:block">
                <ClassroomSelector pathname={pathname} />
              </div>

              {/* Mobile Current Classroom Display - Enhanced */}
              <div className="md:hidden">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">
                    {getCurrentClassroom()?.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    ปีการศึกษา {getCurrentClassroom()?.year}
                  </div>
                </div>
              </div>

              {/* Enhanced User Profile */}
              <UserProfile onLogout={handleLogout} />

              {/* Enhanced Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                aria-label="เปิดเมนูมือถือ"
                aria-expanded={showMobileMenu}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm cursor-pointer" 
            onClick={() => setShowMobileMenu(false)}
          />
          
          <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out animate-slideIn">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">เมนู</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="ปิดเมนูมือถือ"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Current Classroom - Enhanced */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                <div className="font-semibold text-slate-900">
                  {getCurrentClassroom()?.name}
                </div>
                <div className="text-sm text-slate-600">
                  ปีการศึกษา {getCurrentClassroom()?.year}
                </div>
              </div>

              {/* Navigation Items - Enhanced */}
              <div className="p-6 space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  เมนูหลัก
                </h3>
                {navItems.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleNavigation(key)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                      pathname === key 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium flex-1 text-left">{label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Classroom Management - Rest of the mobile menu */}
              <div className="border-t border-slate-200 p-6">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors cursor-pointer text-red-600 hover:bg-red-50 flex items-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">ออกจากระบบ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lazy Loaded Classroom Dialog */}
      {showClassroomDialog && (
        <Suspense fallback={<DialogLoading message="กำลังเตรียมฟอร์ม..." />}>
          <DynamicClassroomDialog
            onClose={() => setShowClassroomDialog(false)}
            onAddClassroom={addClassroom}
          />
        </Suspense>
      )}
    </>
  );
};

export default Navigation;