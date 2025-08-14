'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';
import { showToast } from '@/utils/toast';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const ChangePasswordPage: React.FC = () => {
  const router = useRouter();
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field: keyof ShowPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'กรุณากรอกรหัสผ่านใหม่';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score < 2) return { score, text: 'อ่อน', color: 'text-red-600 bg-red-100' };
    if (score < 4) return { score, text: 'ปานกลาง', color: 'text-yellow-600 bg-yellow-100' };
    return { score, text: 'แข็งแกร่ง', color: 'text-green-600 bg-green-100' };
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real system, you would add changePassword to AppContext:
      // const { changePassword } = useApp();
      // await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      showToast.success('เปลี่ยนรหัสผ่านสำเร็จ!');
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Redirect back to profile after success
      setTimeout(() => {
        router.push('/userprofile');
      }, 1000);
      
    } catch (error) {
      setErrors({ general: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' });
      showToast.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push('/userprofile');
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const canSubmit = passwordData.currentPassword && 
                   passwordData.newPassword && 
                   passwordData.confirmPassword && 
                   Object.keys(errors).length === 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={handleGoBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </button>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">เปลี่ยนรหัสผ่าน</h1>
          <p className="text-slate-600">อัปเดตรหัสผ่านเพื่อความปลอดภัยของบัญชี</p>
        </div>


        {/* Change Password Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              เปลี่ยนรหัสผ่าน
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                รหัสผ่านปัจจุบัน *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.currentPassword 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                รหัสผ่านใหม่ *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.newPassword 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                  placeholder="กรอกรหัสผ่านใหม่"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">ความแข็งแกร่งของรหัสผ่าน:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength.score 
                            ? passwordStrength.score < 2 ? 'bg-red-400' 
                              : passwordStrength.score < 4 ? 'bg-yellow-400' 
                              : 'bg-green-400'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {errors.newPassword && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                ยืนยันรหัสผ่านใหม่ *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-300 focus:border-blue-500'
                  }`}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {passwordData.confirmPassword && (
                <div className="flex items-center gap-2">
                  {passwordData.newPassword === passwordData.confirmPassword ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 text-sm">รหัสผ่านตรงกัน</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600 text-sm">รหัสผ่านไม่ตรงกัน</span>
                    </>
                  )}
                </div>
              )}
              
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleChangePassword}
                disabled={!canSubmit || isLoading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-top-transparent"></div>
                    กำลังเปลี่ยนรหัสผ่าน...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    เปลี่ยนรหัสผ่าน
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

                {/* Security Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">เคล็ดลับความปลอดภัย</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• ใช้อย่างน้อย 8 ตัวอักษร</li>
                <li>• ผสมตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และสัญลักษณ์</li>
                <li>• หลีกเลี่ยงข้อมูลส่วนตัว เช่น ชื่อ วันเกิด</li>
                <li>• ไม่ใช้รหัสผ่านเดียวกันกับเว็บไซต์อื่น</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChangePasswordPage;