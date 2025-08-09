import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Users, ClipboardList, PieChart, BookOpen, ChevronDown, PlusCircle, Menu, X } from 'lucide-react';
import { Classroom, PageType } from './types';

interface NavigationProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  classrooms: Classroom[];
  currentClassroom: number;
  showClassroomDropdown: boolean;
  setShowClassroomDropdown: (show: boolean) => void;
  switchClassroom: (classroomId: number) => void;
  setShowClassroomDialog: (show: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  setCurrentPage,
  classrooms,
  currentClassroom,
  showClassroomDropdown,
  setShowClassroomDropdown,
  switchClassroom,
  setShowClassroomDialog
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const getCurrentClassroom = () => classrooms.find(c => c.id === currentClassroom) || classrooms[0];

  const navItems = [
    { key: 'dashboard', label: 'หน้าหลัก', icon: BarChart3 },
    { key: 'students', label: 'นักเรียน', icon: Users },
    { key: 'results', label: 'ผลประเมิน', icon: ClipboardList },
    { key: 'reports', label: 'รายงาน', icon: PieChart }
  ];

  const handleNavItemClick = (page: PageType) => {
    setCurrentPage(page);
    closeMobileMenu();
  };

  const handleClassroomSwitch = (classroomId: number) => {
    switchClassroom(classroomId);
    closeMobileMenu();
  };

  const openMobileMenu = () => {
    setIsAnimating(true);
    setShowMobileMenu(true);
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    setIsAnimating(true);
    setShowMobileMenu(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
    // Focus back to menu button for accessibility
    setTimeout(() => {
      menuButtonRef.current?.focus();
      setIsAnimating(false);
    }, 300);
  };

  const toggleMobileMenu = () => {
    if (showMobileMenu) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMobileMenu) {
        closeMobileMenu();
      }
    };

    if (showMobileMenu) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showMobileMenu]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
        document.body.style.overflow = 'unset';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Focus management for accessibility
  useEffect(() => {
    if (showMobileMenu && mobileMenuRef.current) {
      const firstFocusableElement = mobileMenuRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusableElement?.focus();
    }
  }, [showMobileMenu]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between py-4">
            <div className="flex items-center gap-6">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentPage(key as PageType)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 cursor-pointer ${
                    currentPage === key 
                      ? 'bg-blue-100 text-blue-700 shadow-sm scale-105' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Desktop Classroom Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowClassroomDropdown(!showClassroomDropdown)}
                className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200 shadow-sm transform hover:scale-105 cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                <span className="font-semibold">{getCurrentClassroom()?.name}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showClassroomDropdown ? 'rotate-180' : 'rotate-0'}`} />
              </button>

              {showClassroomDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 backdrop-blur-md bg-white/95 transform transition-all duration-200 animate-in slide-in-from-top-2 fade-in">
                  <div className="py-3">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      เปลี่ยนห้องเรียน
                    </div>
                    {classrooms.map((classroom) => (
                      <button
                        key={classroom.id}
                        onClick={() => switchClassroom(classroom.id)}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] cursor-pointer ${
                          classroom.id === currentClassroom ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{classroom.name}</div>
                            <div className="text-xs text-gray-500">ปีการศึกษา {classroom.year}</div>
                          </div>
                          {classroom.id === currentClassroom && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </button>
                    ))}
                    <div className="border-t border-gray-100 mt-2">
                      <button
                        onClick={() => {
                          setShowClassroomDropdown(false);
                          setShowClassroomDialog(true);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-[1.02] cursor-pointer"
                      >
                        <PlusCircle className="h-4 w-4" />
                        เพิ่มห้องเรียนใหม่
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Header */}
          <div className="md:hidden">
            <div className="flex items-center justify-between py-3">
              {/* Mobile Classroom Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 text-sm truncate">{getCurrentClassroom()?.name}</div>
                  <div className="text-xs text-gray-500">ปีการศึกษา {getCurrentClassroom()?.year}</div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                ref={menuButtonRef}
                onClick={toggleMobileMenu}
                className={`relative p-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 border border-gray-200 touch-manipulation transform hover:scale-105 cursor-pointer ${
                  showMobileMenu ? 'scale-110 bg-blue-50 border-blue-200 text-blue-600' : ''
                }`}
                aria-label={showMobileMenu ? 'ปิดเมนู' : 'เปิดเมนู'}
                aria-expanded={showMobileMenu}
                disabled={isAnimating}
              >
                <div className="relative w-6 h-6">
                  <Menu className={`absolute inset-0 transition-all duration-300 ${showMobileMenu ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
                  <X className={`absolute inset-0 transition-all duration-300 ${showMobileMenu ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black backdrop-blur-sm transition-opacity duration-300 ${
              showMobileMenu ? 'opacity-30' : 'opacity-0'
            }`}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          
          {/* Slide-in Menu Panel */}
          <div 
            ref={mobileMenuRef}
            className={`fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
              showMobileMenu ? 'translate-x-0' : 'translate-x-full'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="เมนูหลัก"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">เมนู</h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 touch-manipulation transform hover:scale-110 cursor-pointer"
                aria-label="ปิดเมนู"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Current Classroom Info */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{getCurrentClassroom()?.name}</div>
                    <div className="text-sm text-gray-600">ปีการศึกษา {getCurrentClassroom()?.year}</div>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="p-6 space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  เมนูหลัก
                </h3>
                {navItems.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleNavItemClick(key as PageType)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 touch-manipulation transform hover:scale-[1.02] cursor-pointer ${
                      currentPage === key 
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-sm' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${
                      currentPage === key ? 'bg-blue-200' : 'bg-gray-100'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-base">{label}</span>
                    {currentPage === key && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Classroom Switcher */}
              <div className="border-t border-gray-200">
                <div className="p-6 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    เปลี่ยนห้องเรียน
                  </h3>
                  {classrooms.map((classroom) => (
                    <button
                      key={classroom.id}
                      onClick={() => handleClassroomSwitch(classroom.id)}
                      className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-200 touch-manipulation transform hover:scale-[1.02] cursor-pointer ${
                        classroom.id === currentClassroom 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-base">{classroom.name}</div>
                          <div className="text-sm text-gray-500">ปีการศึกษา {classroom.year}</div>
                        </div>
                        {classroom.id === currentClassroom && (
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </button>
                  ))}
                  
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      setShowClassroomDialog(true);
                    }}
                    className="w-full text-left px-4 py-4 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded-xl transition-all duration-200 flex items-center gap-4 font-semibold touch-manipulation transform hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="p-2.5 bg-indigo-100 rounded-xl">
                      <PlusCircle className="h-5 w-5" />
                    </div>
                    <span className="text-base">เพิ่มห้องเรียนใหม่</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside handler for desktop dropdown */}
      {showClassroomDropdown && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowClassroomDropdown(false)}
        />
      )}
    </>
  );
};

export default Navigation;