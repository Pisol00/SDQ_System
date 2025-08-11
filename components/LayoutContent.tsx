'use client';
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

interface LayoutContentProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoginPage && <Navigation />}
      <main>
        {children}
      </main>
    </div>
  );
};

export default LayoutContent;