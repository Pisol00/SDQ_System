'use client'
import React, { useMemo, useState } from "react";
import {
    User as UserIcon,
    Mail,
    Phone,
    Shield,
    KeyRound,
    Edit3,
    Save,
    X,
    Building2,
    Clock3,
    CheckCircle2,
    Image as ImageIcon,
    User,
} from "lucide-react";

/**
 * UI-ONLY User Profile component
 * ---------------------------------
 * - Pure presentational/controlled component (no data fetching, no global state)
 * - DOES NOT modify any existing business logic in your project
 * - Drop-in: /components/UserProfile.tsx
 * - TailwindCSS only (no extra deps)
 */

export type AppRole = "teacher" | "admin" | "counselor" | "guest";

export interface ClassroomLite {
    id: number | string;
    name: string; // e.g. "ป.1/1"
    year?: string | number; // e.g. "2567"
}

export interface UserProfileData {
    id: string | number;
    username: string;
    displayName: string; // e.g. "ครูประจำ"
    fullName?: string;
    email?: string;
    phone?: string;
    role: AppRole;
    avatarUrl?: string | null;
    organization?: string; // e.g. school
    bio?: string;
    classrooms?: ClassroomLite[]; // assigned classrooms
    lastActiveISO?: string; // ISO string
}

export interface UserProfileProps {
    /** Profile data to display */
    user: UserProfileData;
    /** Form state is controlled by the parent – pass in a mutable copy */
    draft?: Partial<UserProfileData>;
    /** Called when a field changes */
    onChange?: (patch: Partial<UserProfileData>) => void;
    /** Save & Cancel actions (wire these to your existing logic if needed) */
    onSave?: () => void;
    onCancel?: () => void;
    /** Optional: disable editing mode */
    readOnly?: boolean;
    /** Optional: show as dialog */
    asDialog?: boolean;
    onClose?: () => void;
}

const RoleBadge: React.FC<{ role: AppRole }> = ({ role }) => {
    const map = {
        teacher: { label: "ครู", cls: "bg-blue-100 text-blue-800" },
        admin: { label: "ผู้ดูแล", cls: "bg-purple-100 text-purple-800" },
        counselor: { label: "ครูที่ปรึกษา", cls: "bg-emerald-100 text-emerald-800" },
        guest: { label: "ผู้เยี่ยมชม", cls: "bg-slate-100 text-slate-700" },
    } as const;
    const d = map[role] ?? map.guest;
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.cls}`}>{d.label}</span>
    );
};

const FieldRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    value?: string;
    placeholder?: string;
    editable?: boolean;
    onChange?: (v: string) => void;
    type?: string;
}> = ({ icon, label, value, placeholder, editable, onChange, type = "text" }) => {
    return (
        <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 sm:col-span-4 flex items-center gap-2 text-slate-600 text-sm">
                {icon}
                <span className="font-medium">{label}</span>
            </div>
            <div className="col-span-12 sm:col-span-8">
                {editable ? (
                    <input
                        type={type}
                        value={value ?? ""}
                        onChange={(e) => onChange?.(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                ) : (
                    <p className="text-slate-900 text-sm break-words">{value || "-"}</p>
                )}
            </div>
        </div>
    );
};

const Avatar: React.FC<{
    url?: string | null;
    name: string;
    size?: number;
}> = ({ url, name, size = 80 }) => {
    const initials = useMemo(() => {
        const n = name?.trim() || "";
        const parts = n.split(" ");
        const head = (parts[0]?.[0] ?? "").toUpperCase();
        const tail = (parts[1]?.[0] ?? "").toUpperCase();
        return (head + tail) || "U";
    }, [name]);

    if (url) {
        return (
            <img
                src={url}
                alt={name}
                width={size}
                height={size}
                className="rounded-full object-cover border border-slate-200"
            />
        );
    }
    return (
        <div
            style={{ width: size, height: size }}
            className="rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold border border-slate-300"
        >
            {initials}
        </div>
    );
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const UserProfile: React.FC<UserProfileProps> = ({
    user,
    draft,
    onChange,
    onSave,
    onCancel,
    readOnly,
    asDialog,
    onClose,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const d = { ...user, ...draft } as UserProfileData;

    const container = (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <Avatar url={d.avatarUrl} name={d.displayName || d.fullName || "ผู้ใช้"} />
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                                    {d.displayName || d.fullName || "ผู้ใช้"}
                                </h1>
                                <RoleBadge role={d.role} />
                            </div>
                            {d.organization && (
                                <div className="mt-1 flex items-center gap-2 text-slate-600 text-sm">
                                    <Building2 className="w-4 h-4" /> {d.organization}
                                </div>
                            )}
                            {d.lastActiveISO && (
                                <div className="mt-1 flex items-center gap-2 text-slate-500 text-xs">
                                    <Clock3 className="w-4 h-4" />
                                    กิจกรรมล่าสุด: {new Date(d.lastActiveISO).toLocaleString("th-TH")}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {!readOnly && (
                            isEditing ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            onCancel?.();
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                                    >
                                        <X className="w-4 h-4" /> ยกเลิก
                                    </button>
                                    <button
                                        onClick={() => {
                                            onSave?.();
                                            setIsEditing(false);
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                                    >
                                        <Save className="w-4 h-4" /> บันทึก
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                >
                                    <Edit3 className="w-4 h-4" /> แก้ไขโปรไฟล์
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Grid sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="space-y-6 lg:col-span-2">
                    <SectionCard title="ข้อมูลติดต่อ">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FieldRow
                                icon={<User className="w-4 h-4" />}
                                label="Display Name"
                                value={d.displayName}
                                editable={isEditing}
                                placeholder="ชื่อที่แสดง"
                                onChange={(v) => onChange?.({ displayName: v })}
                                type="text"
                            />
                            <FieldRow
                                icon={<User className="w-4 h-4" />}
                                label="Full Name"
                                value={d.fullName}
                                editable={isEditing}
                                placeholder="ชื่อ-นามสกุลเต็ม"
                                onChange={(v) => onChange?.({ fullName: v })}
                                type="text"
                            />
                            <FieldRow
                                icon={<Mail className="w-4 h-4" />}
                                label="อีเมล"
                                value={d.email}
                                editable={isEditing}
                                placeholder="name@example.com"
                                onChange={(v) => onChange?.({ email: v })}
                                type="email"
                            />
                        </div>
                    </SectionCard>


                    <SectionCard title="การรักษาความปลอดภัยบัญชี (UI เท่านั้น)">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="p-4 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2 text-slate-700 text-sm mb-2">
                                    <KeyRound className="w-4 h-4" /> เปลี่ยนรหัสผ่าน
                                </div>
                                <p className="text-xs text-slate-500 mb-3">ปุ่มนี้เป็น UI เท่านั้น ไม่แตะ business logic</p>
                                <button className="px-3 py-2 rounded-lg border text-sm hover:bg-slate-50">เปลี่ยนรหัสผ่าน</button>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    <SectionCard title="รูปโปรไฟล์">
                        <div className="flex items-center gap-4">
                            <Avatar url={d.avatarUrl} name={d.displayName || d.fullName || "ผู้ใช้"} size={72} />
                            <div className="text-sm text-slate-600">
                                <p>อัปโหลดรูปขนาด 256×256 ขึ้นไป</p>
                                <p>รองรับ JPG/PNG</p>
                            </div>
                        </div>
                        {isEditing && (
                            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer w-fit hover:bg-slate-50 text-sm">
                                <ImageIcon className="w-4 h-4" /> เปลี่ยนรูป
                                <input type="file" accept="image/*" className="hidden" onChange={() => {/* wire to parent */ }} />
                            </label>
                        )}
                    </SectionCard>

                </div>
            </div>
        </div>
    );

    if (!asDialog) return container;

    // Dialog wrapper (optional usage without touching existing files)
    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-full sm:w-[760px] bg-white shadow-2xl border-l border-slate-200 overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between p-4">
                    <h2 className="text-lg font-semibold text-slate-900">โปรไฟล์ผู้ใช้</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
                </div>
                {container}
            </div>
        </div>
    );
};

export default UserProfile;