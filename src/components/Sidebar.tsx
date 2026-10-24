import React from 'react';
import {
  LayoutDashboard,
  QrCode,
  PlusCircle,
  Truck,
  ShieldCheck,
  Settings,
  Award
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'overview', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'lookup', label: 'Tra Cứu Tem QR', icon: QrCode },
    { id: 'create-batch', label: 'Tạo Lô Hàng', icon: PlusCircle },
    { id: 'checkpoint', label: 'Ghi Chặng', icon: Truck },
    { id: 'inspector', label: 'Kiểm Định OCOP', icon: ShieldCheck },
    { id: 'admin', label: 'Quản Trị Hệ Thống', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#FAF9F5] border-r border-[#E6E1D7] flex flex-col justify-between p-5 min-h-screen shrink-0 relative overflow-hidden">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-[#E6E1D7]">
          <div className="w-10 h-10 rounded-xl bg-[#264939] flex items-center justify-center p-2 shadow-xs">
            <img
              src="/assets/brand_logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Award className="w-5 h-5 text-[#C29B38] hidden" />
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-lg text-[#264939] leading-tight">
              HueLegend
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-[#8A9D92] uppercase">
              Đặc Sản Huế Blockchain
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1 mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left font-medium text-xs ${
                  isActive
                    ? 'bg-[#E0ECE4] text-[#1c372b] font-bold border border-[#CCD8CF]'
                    : 'text-[#3B4D43] hover:bg-[#EFF3EF] hover:text-[#264939]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#264939]' : 'text-[#5E7166]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding Card */}
      <div className="relative z-10 pt-4 border-t border-[#E6E1D7]">
        <div className="bg-[#264939] text-white p-3.5 rounded-xl shadow-2xs">
          <div className="text-[10px] font-bold text-[#C29B38] uppercase tracking-wider">
            ECO2432 HueLegend
          </div>
          <p className="text-xs text-emerald-100 font-medium mt-0.5">
            Truy xuất nguồn gốc OCOP Cố Đô
          </p>
        </div>
      </div>
    </aside>
  );
};
