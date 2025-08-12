'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ClipboardList, BarChart3, Calendar, PieChart, AlertTriangle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { 
  CardGridSkeleton, 
  TableSkeleton, 
  LoadingSpinner
} from '../components/LazyComponents';
import {
  LazyOnIntersection,
  usePreloadedNavigation,
  useProgressiveLoading
} from '../components/LazyWrapper';

// Stat Card Component with enhanced loading
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  bgColor, 
  iconColor,
  isLoaded = true 
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  isLoaded?: boolean;
}) => {
  if (!isLoaded) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-slate-300 rounded w-20 mb-2"></div>
            <div className="h-8 bg-slate-300 rounded w-12"></div>
          </div>
          <div className="w-8 h-8 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgColor} border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold text-slate-800 transition-all duration-300">
            {value}
          </p>
        </div>
        <Icon className={`h-8 w-8 ${iconColor} transition-all duration-200`} />
      </div>
    </div>
  );
};

// Recent Assessments Component with lazy loading
const RecentAssessments = ({ 
  assessments, 
  currentClassroom 
}: { 
  assessments: any[]; 
  currentClassroom: any;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return <TableSkeleton rows={3} />;
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500 text-lg mb-2">ยังไม่มีการประเมินในห้องนี้</p>
        <p className="text-slate-400 text-sm">เริ่มต้นด้วยการเพิ่มนักเรียนและทำการประเมิน</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment, index) => (
        <div
          key={assessment.id}
          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all duration-200 transform hover:scale-[1.02] ${
            isVisible ? 'animate-fadeIn' : 'opacity-0'
          }`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-800 mb-1">{assessment.studentName}</p>
            <p className="text-sm text-slate-600">
              {new Date(assessment.completedDate || '').toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="text-left sm:text-right flex-shrink-0 mt-3 sm:mt-0">
            <p className="text-sm font-medium text-slate-700 mb-2">
              คะแนนรวม: {assessment.scores?.totalDifficulties}
            </p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
              assessment.interpretations?.totalDifficulties === 'ปกติ' ? 'bg-green-100 text-green-800' :
              assessment.interpretations?.totalDifficulties === 'เสี่ยง' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {assessment.interpretations?.totalDifficulties}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Action Buttons Component with lazy loading
const ActionButtons = ({ router }: { router: any }) => {
  const { currentStep, isComplete } = useProgressiveLoading(3);

  const actions = [
    {
      path: '/students',
      icon: Users,
      label: 'จัดการนักเรียน',
      color: 'bg-blue-600 hover:bg-blue-700',
      step: 0
    },
    {
      path: '/results',
      icon: BarChart3,
      label: 'ดูผลประเมิน',
      color: 'bg-green-600 hover:bg-green-700',
      step: 1
    },
    {
      path: '/reports',
      icon: PieChart,
      label: 'รายงานสรุป',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      step: 2
    }
  ];

  return (
    <div className="space-y-3">
      {actions.map((action, index) => {
        const isVisible = currentStep > action.step;
        
        return (
          <button
            key={action.path}
            onClick={() => router.push(action.path)}
            disabled={!isVisible}
            className={`w-full text-white py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium cursor-pointer transform ${
              isVisible 
                ? `${action.color} hover:scale-105 opacity-100` 
                : 'bg-slate-300 opacity-50 cursor-not-allowed'
            }`}
            style={{ 
              animationDelay: `${index * 200}ms`,
              animation: isVisible ? 'fadeInUp 0.5s ease-out forwards' : 'none'
            }}
          >
            <action.icon className="h-5 w-5" />
            {action.label}
          </button>
        );
      })}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const router = useRouter();
  const {
    getCurrentClassroom,
    getClassroomStudents,
    getClassroomAssessments
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Use preloaded navigation
  usePreloadedNavigation();

  const classroomStudents = getClassroomStudents();
  const classroomAssessments = getClassroomAssessments();
  const currentClassroom = getCurrentClassroom();

  // Simulate data loading
  useEffect(() => {
    const timer1 = setTimeout(() => setIsLoading(false), 500);
    const timer2 = setTimeout(() => setDataLoaded(true), 800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Calculate statistics
  const needFollowUp = classroomAssessments.filter(a =>
    a.interpretations?.totalDifficulties === 'มีปัญหา' ||
    a.interpretations?.totalDifficulties === 'เสี่ยง'
  ).length;

  const thisMonth = classroomAssessments.filter(a =>
    new Date(a.completedDate || '').getMonth() === new Date().getMonth()
  ).length;

  const recentAssessments = classroomAssessments.slice(-5).reverse();

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
              <div className="h-8 bg-slate-300 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
          
          {/* Content Skeleton */}
          <CardGridSkeleton cols={4} rows={1} />
          <div className="mt-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
              <div className="h-6 bg-slate-300 rounded w-1/4 mb-4"></div>
              <TableSkeleton rows={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  ระบบประเมิน SDQ
                </h1>
                <p className="text-slate-600">แบบประเมินพฤติกรรมนักเรียน (SDQ) ฉบับครูประเมินนักเรียน</p>
              </div>
              <div className="text-left lg:text-right">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm text-slate-600">ห้องเรียนปัจจุบัน </p>
                    <p className="text-sm text-blue-700">{currentClassroom.name}</p>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <p className="text-sm text-slate-600">ปีการศึกษา</p>
                    <p className="text-sm text-blue-700">{currentClassroom.year}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards with Progressive Loading */}
        <LazyOnIntersection fallback={<CardGridSkeleton cols={4} rows={1} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="นักเรียนในห้อง"
              value={classroomStudents.length}
              icon={Users}
              bgColor="bg-white"
              iconColor="text-blue-600"
              isLoaded={dataLoaded}
            />

            <StatCard
              title="การประเมินเสร็จแล้ว"
              value={classroomAssessments.length}
              icon={ClipboardList}
              bgColor="bg-white"
              iconColor="text-green-600"
              isLoaded={dataLoaded}
            />

            <StatCard
              title="ต้องติดตาม"
              value={needFollowUp}
              icon={AlertTriangle}
              bgColor="bg-white"
              iconColor="text-orange-600"
              isLoaded={dataLoaded}
            />

            <StatCard
              title="เดือนนี้"
              value={thisMonth}
              icon={Calendar}
              bgColor="bg-white"
              iconColor="text-purple-600"
              isLoaded={dataLoaded}
            />
          </div>
        </LazyOnIntersection>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Recent Assessments - ขยายให้เต็มความกว้าง */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">
                การประเมินล่าสุดในห้อง {currentClassroom.name}
              </h2>

              <Suspense fallback={<TableSkeleton rows={3} />}>
                <RecentAssessments 
                  assessments={recentAssessments}
                  currentClassroom={currentClassroom}
                />
              </Suspense>
            </div>
          </div>

          {/* Action Buttons - ลดขนาดลง */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                การจัดการ
              </h3>

              <Suspense fallback={<LoadingSpinner />}>
                <ActionButtons router={router} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;