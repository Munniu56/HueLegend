import React from 'react';
import {
  LayoutDashboard,
  QrCode,
  PlusCircle,
  ShieldCheck,
  Store,
  Tag,
  Settings,
  Award,
  Sparkles,
  ExternalLink,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { CONTRACT_ADDRESS, ETHERSCAN_BASE_URL } from '../constants';

interface SidebarProps {
  activeTab: string;
  userRole?: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, userRole = 'ALL', onTabChange }) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Tổng Quan Hệ Thống',
      sublabel: 'Bảng điều khiển & thống kê',
      icon: LayoutDashboard,
    },
    {
      id: 'lookup',
      label: 'Tra Cứu Tem QR',
      sublabel: 'Xác thực & quét mã camera',
      icon: QrCode,
    },
    {
      id: 'store',
      label: 'Cửa Hàng Đặc Sản',
      sublabel: 'Mua hàng bằng Sepolia ETH',
      icon: Store,
    },
    {
      id: 'create-batch',
      label: 'Tạo Lô Hàng',
      sublabel: 'Dành cho cơ sở sản xuất',
      icon: PlusCircle,
    },
    {
      id: 'inspector',
      label: 'Kiểm Định OCOP',
      sublabel: 'Thẩm định & cấp chứng nhận',
      icon: ShieldCheck,
    },
    {
      id: 'retailer',
      label: 'Quản Lý Niêm Yết',
      sublabel: 'Nhập kho & niêm yết bán lẻ',
      icon: Tag,
    },
    {
      id: 'admin',
      label: 'Quản Trị Hệ Thống',
      sublabel: 'Phân quyền RBAC & đổi phí',
      icon: Settings,
    },
  ];

  // Loc cac muc menu theo vai tro nguoi dung
  const filteredNavItems = navItems.filter((item) => {
    if (userRole === 'PRODUCER' || userRole === 'SUPPLY_CHAIN') {
      return ['overview', 'lookup', 'store', 'create-batch', 'inspector'].includes(item.id);
    }
    if (userRole === 'RETAILER' || userRole === 'COMMERCE') {
      return ['overview', 'lookup', 'store', 'retailer'].includes(item.id);
    }
    if (userRole === 'INSPECTOR') {
      return ['overview', 'lookup', 'store', 'inspector'].includes(item.id);
    }
    if (userRole === 'CUSTOMER') {
      return ['overview', 'lookup', 'store'].includes(item.id);
    }
    return true; // ADMIN hoac ALL
  });

  return (
    <aside className="w-72 bg-[#FAF9F5] border-r border-[#E6E1D7] flex flex-col justify-between p-5 h-screen sticky top-0 shrink-0 overflow-y-auto font-sans">
      {/* Background Subtle Watermark */}
      <img
        src="/assets/lotus_transparent.png"
        alt=""
        aria-hidden="true"
        className="absolute -bottom-10 -left-10 w-48 h-48 opacity-10 pointer-events-none select-none object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />

      <div className="space-y-5">
        {/* Brand Header - Clean typography without logo image */}
        <div className="pb-4 border-b border-[#E6E1D7] px-1">
          <h1 className="font-serif font-extrabold text-2xl text-[#264939] tracking-tight leading-none">
            HueLegend
          </h1>
          <p className="text-[10px] font-bold tracking-widest text-[#8A9D92] uppercase mt-1">
            Tinh Hoa Huế — Giá Trị Bền Vững
          </p>
        </div>

        {/* Navigation Section */}
        <div>
          <div className="text-[10px] font-bold text-[#8A9D92] uppercase tracking-wider px-2 mb-2">
            CHỨC NĂNG QUẢN TRỊ
          </div>

          <nav className="flex flex-col gap-1.5">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl transition-all text-left group relative ${
                    isActive
                      ? 'bg-[#E0ECE4] text-[#1c372b] font-bold border border-[#CCD8CF] shadow-2xs'
                      : 'text-[#3B4D43] hover:bg-[#EFF3EF] hover:text-[#264939]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mt-0.5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#264939]' : 'text-[#5E7166]'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold leading-snug">{item.label}</div>
                    <div className="text-[10px] text-[#8A9D92] font-normal truncate mt-0.5">
                      {item.sublabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Info Widget: OCOP Standard */}
        <div className="bg-gradient-to-br from-[#E0ECE4]/80 to-[#F2F6F3] p-3.5 rounded-2xl border border-[#CCD8CF] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#264939]">
            <Sparkles className="w-3.5 h-3.5 text-[#C29B38] shrink-0" />
            <span className="font-serif">Tiêu Chuẩn OCOP Huế</span>
          </div>

          <p className="text-[11px] text-[#3B4D43] leading-relaxed">
            Số hóa minh bạch 100% từng chặng chăn nuôi, chế biến và lưu kho trên Sepolia Testnet.
          </p>

          <div className="pt-1.5 border-t border-[#CCD8CF]/60 flex items-center justify-between text-[10px] text-[#5E7166]">
            <div className="flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3 text-[#C29B38]" />
              <span>Thừa Thiên Huế</span>
            </div>
            <span className="font-bold text-[#264939]">Sepolia 100%</span>
          </div>
        </div>

        {/* Smart Contract Card */}
        <div className="bg-white p-3 rounded-xl border border-[#E6E1D7] space-y-1">
          <div className="text-[10px] font-bold text-[#8A9D92] uppercase tracking-wider flex items-center justify-between">
            <span>SMART CONTRACT</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          </div>
          <a
            href={`${ETHERSCAN_BASE_URL}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono font-bold text-[#264939] hover:underline flex items-center justify-between"
          >
            <span className="truncate">{CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-4)}</span>
            <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
          </a>
        </div>
      </div>

      {/* Footer Branding Card */}
      <div className="pt-3 border-t border-[#E6E1D7] mt-4 shrink-0">
        <div className="bg-[#264939] text-white p-3 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#C29B38] uppercase tracking-wider">
            <span>ECO2432 HueLegend</span>
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-200">v1.0.0</span>
          </div>
          <p className="text-[11px] text-emerald-100 font-medium leading-snug">
            Truy xuất Nguồn gốc Đặc sản Cố Đô
          </p>
        </div>
      </div>
    </aside>
  );
};
