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
    {
      id: 'overview',
      label: 'Tổng Quan Hệ Thống',
      sublabel: 'Bảng điều khiển & danh sách',
      icon: LayoutDashboard,
    },
    {
      id: 'lookup',
      label: 'Tra Cứu Tem QR Blockchain',
      sublabel: 'Truy xuất nguồn gốc & Quét mã',
      icon: QrCode,
    },
    {
      id: 'create-batch',
      label: 'Tạo Lô Hàng Đặc Sản',
      sublabel: 'Dành cho Chủ Cơ Sở (Producer)',
      icon: PlusCircle,
    },
    {
      id: 'checkpoint',
      label: 'Ghi Chặng Supply Chain',
      sublabel: 'Chế biến, Vận chuyển, Đại lý',
      icon: Truck,
    },
    {
      id: 'inspector',
      label: 'Kiểm Định & Chứng Nhận OCOP',
      sublabel: 'Dành cho Kiểm Định Viên',
      icon: ShieldCheck,
    },
    {
      id: 'admin',
      label: 'Quản Trị RBAC & Phí Hệ Thống',
      sublabel: 'Dành cho Quản Trị Viên (Admin)',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-72 bg-[#FAF9F5] border-r border-[#E6E1D7] flex flex-col justify-between p-5 min-h-screen shrink-0 relative overflow-hidden">
      {/* Background Decorative Lotus Watermark */}
      <img
        src="/assets/lotus_transparent.png"
        alt=""
        aria-hidden="true"
        className="absolute -bottom-10 -left-10 w-48 h-48 opacity-10 pointer-events-none select-none object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />

      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#E6E1D7]">
          <div className="w-11 h-11 rounded-2xl bg-[#264939] flex items-center justify-center p-2 shadow-md">
            <img
              src="/assets/brand_logo.png"
              alt="HueLegend Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback icon if image loading fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Award className="w-6 h-6 text-[#C29B38] hidden" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-[#264939] tracking-tight leading-none">
              HueLegend
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-[#8A9D92] uppercase mt-1">
              Đặc Sản Huế Blockchain
            </p>
          </div>
        </div>

        {/* Navigation Section Title */}
        <div className="mt-6 mb-2 px-2 text-[11px] font-bold text-[#8A9D92] uppercase tracking-wider">
          Danh Mục Chức Năng
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all text-left group relative ${
                  isActive
                    ? 'bg-[#E0ECE4] text-[#1c372b] font-bold border border-[#CCD8CF] shadow-xs'
                    : 'text-[#3B4D43] hover:bg-[#EFF3EF] hover:text-[#264939]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 mt-0.5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#264939]' : 'text-[#5E7166]'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold leading-snug">{item.label}</div>
                  <div className="text-[11px] text-[#8A9D92] font-normal truncate mt-0.5">
                    {item.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding Card */}
      <div className="relative z-10 pt-4 mt-6 border-t border-[#E6E1D7]">
        <div className="bg-[#264939] text-white p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-[#C29B38] uppercase tracking-wider mb-1">
            ECO2432 HueLegend
          </div>
          <p className="text-xs text-emerald-100 font-medium leading-relaxed">
            Hệ thống Quản trị & Truy xuất Nguồn gốc Đặc sản Huế chuẩn OCOP
          </p>
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-emerald-200">
            <span>Dự án Cố Đô Huế</span>
            <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">v1.0.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
