'use client';
import React, { Suspense, lazy, ComponentType } from 'react';
import { usePathname } from "next/navigation";
import { LoadingSpinner } from './LazyComponents';

// Lazy load LayoutContent
const LazyLayoutContentComponent = lazy(() => import('./LayoutContent'));

// Enhanced lazy wrapper with error boundary
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">เกิดข้อผิดพลาดในการโหลด</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              รีโหลดหน้า
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced lazy wrapper component
export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <LoadingSpinner />,
  errorFallback 
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Layout Content with lazy loading
export const LazyLayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <LazyWrapper 
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="animate-pulse">
            {/* Navigation skeleton */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-300 rounded-lg"></div>
                    <div className="h-4 bg-slate-300 rounded w-32"></div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-8 bg-slate-300 rounded w-24"></div>
                    <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </header>
            {/* Content skeleton */}
            <div className="p-6 max-w-7xl mx-auto">
              <div className="mb-8">
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="h-8 bg-slate-300 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="h-4 bg-slate-300 rounded mb-2"></div>
                    <div className="h-8 bg-slate-300 rounded mb-3"></div>
                    <div className="h-6 bg-slate-300 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <LazyLayoutContentComponent>
        {children}
      </LazyLayoutContentComponent>
    </LazyWrapper>
  );
};

// HOC for lazy loading pages
export const withLazyPage = <P extends object>(
  Component: ComponentType<P>,
  customFallback?: React.ReactNode
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  const defaultFallback = (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
            <div className="h-8 bg-slate-300 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
                <div className="h-4 bg-slate-300 rounded mb-2"></div>
                <div className="h-8 bg-slate-300 rounded mb-3"></div>
                <div className="h-6 bg-slate-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  return (props: P) => (
    <LazyWrapper fallback={customFallback || defaultFallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
};

// Route-based lazy loading
export const createLazyRoute = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  const defaultFallback = (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <LoadingSpinner message="กำลังโหลดหน้า..." />
    </div>
  );
  
  return (props: any) => (
    <LazyWrapper fallback={fallback || defaultFallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
};

// Intersection Observer Hook for lazy loading
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
};

// Lazy component for intersection-based loading
export const LazyOnIntersection: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ children, fallback = <div className="h-32 bg-slate-100 animate-pulse rounded" />, className }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(ref);

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? children : fallback}
    </div>
  );
};

// Preload functions for better UX
export const preloadRoute = (routeImport: () => Promise<any>) => {
  // Start loading the route in the background
  routeImport().catch(err => console.error('Preload failed:', err));
};

export const preloadComponent = (componentImport: () => Promise<any>) => {
  // Start loading the component in the background
  componentImport().catch(err => console.error('Component preload failed:', err));
};

// Navigation with preloading
export const usePreloadedNavigation = () => {
  const preloadPages = React.useCallback(() => {
    // Preload critical pages
    const criticalPages = [
      () => import('../app/students/page'),
      () => import('../app/results/page'),
      () => import('../app/reports/page'),
    ];

    criticalPages.forEach(pageImport => {
      setTimeout(() => preloadRoute(pageImport), 1000);
    });
  }, []);

  React.useEffect(() => {
    // Preload after initial render
    const timer = setTimeout(preloadPages, 2000);
    return () => clearTimeout(timer);
  }, [preloadPages]);

  return { preloadPages };
};

// Custom hook for progressive loading
export const useProgressiveLoading = (steps: number = 3) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    if (currentStep < steps) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentStep, steps]);

  return { currentStep, isComplete, progress: (currentStep / steps) * 100 };
};