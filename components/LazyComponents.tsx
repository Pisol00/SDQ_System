// components/LazyComponents.tsx - Centralized lazy loading
import { lazy } from 'react';
import dynamic from 'next/dynamic';

// Loading Spinner Component
export const LoadingSpinner = ({ message = 'กำลังโหลด...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
    <span className="text-slate-600">{message}</span>
  </div>
);

// Dialog Loading Component
export const DialogLoading = ({ message = 'กำลังโหลด...' }: { message?: string }) => (
  <div className="fixed inset-0 backdrop-blur-md bg-gray-900/20 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl p-8">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-slate-600">{message}</span>
      </div>
    </div>
  </div>
);

// Chart Loading Skeleton
export const ChartSkeleton = () => (
  <div className="w-full h-64 flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <span className="text-slate-500 text-sm">กำลังโหลดกราฟ...</span>
    </div>
  </div>
);

// Dynamic Dialog Components
export const DynamicClassroomDialog = dynamic(() => import('./ClassroomDialog'), {
  loading: () => <DialogLoading message="กำลังเตรียมฟอร์ม..." />,
  ssr: false
});

export const DynamicImportDialog = dynamic(() => import('./ImportDialog'), {
  loading: () => <DialogLoading message="กำลังเตรียมข้อมูล..." />,
  ssr: false
});

// Dynamic Chart Components with better loading states
export const DynamicBarChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.BarChart })),
  { 
    loading: () => <ChartSkeleton />,
    ssr: false 
  }
);

export const DynamicResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { 
    loading: () => <div className="w-full h-full animate-pulse bg-slate-100 rounded" />,
    ssr: false 
  }
);

export const DynamicXAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.XAxis })),
  { ssr: false }
);

export const DynamicYAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.YAxis })),
  { ssr: false }
);

export const DynamicCartesianGrid = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.CartesianGrid })),
  { ssr: false }
);

export const DynamicTooltip = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Tooltip })),
  { ssr: false }
);

export const DynamicLegend = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Legend })),
  { ssr: false }
);

export const DynamicBar = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Bar })),
  { ssr: false }
);

// Excel Processing Component
export const DynamicExcelProcessor = dynamic(() => import('./ExcelProcessor'), {
  loading: () => <LoadingSpinner message="กำลังเตรียมเครื่องมือ Excel..." />,
  ssr: false
});

// Score Card Component
export const DynamicScoreCard = dynamic(() => import('./ScoreCard'), {
  loading: () => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
      <div className="h-4 bg-slate-300 rounded mb-2"></div>
      <div className="h-8 bg-slate-300 rounded mb-3"></div>
      <div className="h-6 bg-slate-300 rounded w-20"></div>
    </div>
  ),
  ssr: false
});

// Navigation Component
export const DynamicNavigation = dynamic(() => import('./Navigation'), {
  loading: () => (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-slate-300 rounded-lg animate-pulse"></div>
            <div className="h-4 bg-slate-300 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 bg-slate-300 rounded w-24 animate-pulse"></div>
            <div className="w-8 h-8 bg-slate-300 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  ),
  ssr: false
});

// Table Skeleton for student lists
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-4">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-300 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          </div>
          <div className="h-8 bg-slate-300 rounded w-20"></div>
        </div>
      </div>
    ))}
  </div>
);

// Card Grid Skeleton
export const CardGridSkeleton = ({ cols = 3, rows = 2 }: { cols?: number; rows?: number }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-6`}>
    {[...Array(cols * rows)].map((_, i) => (
      <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
        <div className="h-4 bg-slate-300 rounded mb-2"></div>
        <div className="h-8 bg-slate-300 rounded mb-3"></div>
        <div className="h-6 bg-slate-300 rounded w-20"></div>
      </div>
    ))}
  </div>
);

// Page Skeleton for entire page loading
export const PageSkeleton = () => (
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
      <div className="space-y-6">
        <CardGridSkeleton />
        <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
          <div className="h-6 bg-slate-300 rounded w-1/4 mb-4"></div>
          <TableSkeleton />
        </div>
      </div>
    </div>
  </div>
);

// Higher Order Component for lazy loading with error boundary
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return (props: P) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy loaded components
export const LazyClassroomDialog = lazy(() => import('./ClassroomDialog'));
export const LazyImportDialog = lazy(() => import('./ImportDialog'));
export const LazyScoreCard = lazy(() => import('./ScoreCard'));