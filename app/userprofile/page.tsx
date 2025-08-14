'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  Lock,
  AtSign
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { showToast } from '@/utils/toast';

const UserProfilePage: React.FC = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  // Demo user data - in real system this would come from your auth context
  // You can add user management to AppContext later
  const [userData, setUserData] = useState({
    id: 1,
    username: "teacher001", 
    fullName: "อาจารย์สมใจ ใจดี",
    email: "somjai@school.ac.th", 
    phone: "081-234-5678",
    role: "user",
    school: "โรงเรียนบ้านดอนใหญ่",
    avatar: null
  });
  
  const [editData, setEditData] = useState(userData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(userData);
  };

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);
    
    // In future: add updateUser to AppContext
    // const { updateUser } = useApp();
    // updateUser(editData);
    
    showToast.success('บันทึกข้อมูลเรียบร้อย');
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleText = (role: string) => {
    const roles = {
      admin: "ผู้ดูแลระบบ",
      user: "คุณครู"
    };
    return roles[role as keyof typeof roles] || "ไม่ระบุ";
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      user: "bg-blue-100 text-blue-800"
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const InfoField = ({ 
    icon: Icon, 
    label, 
    value, 
    field, 
    type = "text" 
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    field: string;
    type?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500" />
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={editData[field as keyof typeof editData] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder={label}
        />
      ) : (
        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
          {value || '-'}
        </div>
      )}
    </div>
  );

  const handleChangePassword = () => {
    router.push('/userprofile/settings/security');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">โปรไฟล์ผู้ใช้</h1>
          <p className="text-slate-600">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {userData.avatar ? (
                    <img src={userData.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover" />
                  ) : (
                    userData.fullName.charAt(0)
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{userData.fullName}</h2>
                <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userData.role)}`}>
                    {getRoleText(userData.role)}
                  </span>
                  <span className="text-slate-600">@</span>
                  <span className="text-slate-600 font-medium">{userData.school}</span>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="hidden md:block">•</div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{userData.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Edit3 className="h-4 w-4" />
                    แก้ไขข้อมูล
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      บันทึก
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      ยกเลิก
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  ข้อมูลส่วนตัว
                </h3>
                {isEditing && (
                  <div className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                    กำลังแก้ไข
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              <InfoField
                icon={AtSign}
                label="ชื่อผู้ใช้"
                value={userData.username}
                field="username"
              />
              <InfoField
                icon={User}
                label="ชื่อ-นามสกุล"
                value={userData.fullName}
                field="fullName"
              />
              <InfoField
                icon={Mail}
                label="อีเมล"
                value={userData.email}
                field="email"
                type="email"
              />
              <InfoField
                icon={Phone}
                label="เบอร์โทรศัพท์"
                value={userData.phone}
                field="phone"
                type="tel"
              />
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  ความปลอดภัยบัญชี
                </h3>
                <p className="text-slate-600 text-sm mb-6">
                  เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี
                </p>
                <button
                  onClick={handleChangePassword}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Lock className="h-4 w-4" />
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;