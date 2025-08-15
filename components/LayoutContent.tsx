'use client';
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import { useApp } from "@/contexts/AppContext";

interface LayoutContentProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
  const pathname = usePathname();
  const { hideNavigation } = useApp(); // ✅ ใช้จาก context
  
  const isLoginPage = pathname === '/login';
  
  // ✅ เงื่อนไขการซ่อน navigation
  const shouldHideNavigation = isLoginPage || hideNavigation;

  return (
    <div className="min-h-screen bg-gray-50">
      {!shouldHideNavigation && <Navigation />}
      <main>
        {children}
      </main>
    </div>
  );
};

export default LayoutContent;