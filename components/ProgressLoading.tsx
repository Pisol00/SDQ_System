import React from 'react';

interface ProgressLoadingProps {
  message?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
}

const ProgressLoading: React.FC<ProgressLoadingProps> = ({ 
  message = "กำลังประมวลผลไฟล์...", 
  progress = 0,
  showProgress = false 
}) => {
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-gray-900/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-300">
        
        {/* Main Loading Animation */}
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-20 h-20 rounded-full border-4 border-gray-200"></div>
          
          {/* Animated Ring */}
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin"></div>
          
          {/* Inner Pulsing Dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          
          {/* Rotating Gradient Effect */}
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 animate-spin" 
               style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
        </div>

        {/* Progress Bar (if enabled) */}
        {showProgress && (
          <div className="w-full">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>ความคืบหน้า</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Dots Animation */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-gray-700 font-medium text-base mb-1">{message}</p>
          <p className="text-gray-500 text-sm">โปรดรอสักครู่...</p>
        </div>

        {/* Breathing Background Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 animate-pulse -z-10"></div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProgressLoading;