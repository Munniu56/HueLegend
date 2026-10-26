import React from 'react';
import { X, ShieldCheck, ArrowRight, GripHorizontal } from 'lucide-react';
import { DEFAULT_ADMIN_ADDRESS } from '../constants';
import { useDraggable } from '../hooks/useDraggable';

interface RoleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoleAndConnect: (roleKey: string) => void;
}

export const RoleConnectModal: React.FC<RoleConnectModalProps> = ({
  isOpen,
  onClose,
  onSelectRoleAndConnect,
}) => {
  const { position, isDragging, dragHeaderProps } = useDraggable(isOpen);

  if (!isOpen) return null;

  const roleOptions = [
    {
      id: 'ADMIN',
      icon: '👑',
      title: 'Quản trị hệ thống',
      description: `Chỉ dành riêng cho Ví Admin mặc định (${DEFAULT_ADMIN_ADDRESS.slice(0, 6)}...${DEFAULT_ADMIN_ADDRESS.slice(-4)})`,
      badge: 'Admin Only'
    },
    {
      id: 'SUPPLY_CHAIN',
      icon: '📦',
      title: 'Cơ sở sản xuất',
      description: 'Dành cho Cơ sở sản xuất khai báo & khởi tạo lô hàng OCOP',
      badge: 'Producer'
    },
    {
      id: 'COMMERCE',
      icon: '🏪',
      title: 'Thương mại & Bán hàng',
      description: 'Dành cho Đại lý bán lẻ & Cửa hàng đặc sản OCOP',
      badge: 'Retailer'
    },
    {
      id: 'INSPECTOR',
      icon: '🛡️',
      title: 'Kiểm định viên OCOP',
      description: 'Dành cho Cơ quan thẩm định & Cấp chứng nhận OCOP',
      badge: 'Inspector'
    },
    {
      id: 'CUSTOMER',
      icon: '🔍',
      title: 'Khách hàng',
      description: 'Dành cho Du khách, Người tiêu dùng & Khách tham quan tra cứu nguồn gốc',
      badge: 'Khách hàng / Customer'
    }
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.05s ease-out',
        }}
        className="bg-white rounded-3xl border border-[#E6E1D7] max-w-xl w-full max-h-[85vh] flex flex-col p-5 sm:p-7 shadow-2xl relative overflow-hidden my-0"
      >
        {/* Modal Header with Drag handle */}
        <div
          {...dragHeaderProps}
          className="flex items-center justify-between pb-4 shrink-0 border-b border-[#EDE9E0] select-none touch-none"
          title="Nắm giữ và kéo để di chuyển popup"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg bg-[#FAF9F5] border border-[#E6E1D7] text-[#8A9D92] hover:text-[#264939] transition-colors">
              <GripHorizontal className="w-4 h-4" />
            </div>
            <img
              src="/assets/aistudio/logo-1_df0d933f.png"
              alt="HueLegend Logo"
              className="h-7 sm:h-9 w-auto max-w-[140px] sm:max-w-[180px] object-contain pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/aistudio/logo_98ef48b3.png';
              }}
            />
            <span className="text-[#CCD8CF] font-light hidden sm:inline">|</span>
            <h3 className="font-serif font-extrabold text-base sm:text-lg text-[#264939] pointer-events-none">
              Chọn Vai Trò Kết Nối Ví
            </h3>
          </div>
          <button
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 rounded-full bg-[#FAF9F5] border border-[#E6E1D7] text-gray-400 hover:text-gray-700 hover:bg-[#E0ECE4] transition-all"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-sans text-[#5E7166] pt-3 shrink-0">
          Vui lòng chọn vai trò tham gia trên hệ thống HueLegend trước khi mở ví MetaMask:
        </p>

        {/* Dynamic Responsive 2-Column Grid Layout */}
        <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {roleOptions.map((role, idx) => (
              <button
                key={role.id}
                onClick={() => onSelectRoleAndConnect(role.id)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D7] hover:border-[#264939] hover:bg-[#E0ECE4]/60 transition-all text-left group shadow-2xs ${
                  idx === roleOptions.length - 1 ? 'sm:col-span-2' : ''
                }`}
              >
                <div className="text-xl p-2 bg-white rounded-xl border border-[#E6E1D7] shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                  {role.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <h4 className="font-serif font-extrabold text-xs sm:text-sm text-[#1A2820] group-hover:text-[#264939] transition-colors truncate">
                      {role.title}
                    </h4>
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E0ECE4] text-[#264939] border border-[#CCD8CF] shrink-0">
                      {role.badge}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#5E7166] mt-1 leading-relaxed line-clamp-2">
                    {role.description}
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-[#8A9D92] group-hover:text-[#264939] group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2.5 border-t border-[#EDE9E0] shrink-0 text-center text-[10px] sm:text-[11px] font-sans text-[#8A9D92]">
          Ví MetaMask sẽ tự động được yêu cầu mở cửa sổ xác nhận mạng Sepolia Testnet.
        </div>
      </div>
    </div>
  );
};
