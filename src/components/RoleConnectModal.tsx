import React from 'react';
import { X, ShieldCheck, ArrowRight } from 'lucide-react';

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
  if (!isOpen) return null;

  const roleOptions = [
    {
      id: 'ADMIN',
      icon: '👑',
      title: 'Quản trị hệ thống',
      description: 'Dành cho Admin & Ban quản lý OCOP (Cấu hình phí, gán vai trò RBAC)',
      badge: 'Admin / Owner'
    },
    {
      id: 'SUPPLY_CHAIN',
      icon: '📦',
      title: 'Chuỗi cung ứng & Vận hành',
      description: 'Dành cho Cơ sở sản xuất (Producer) & Đơn vị vận chuyển (Logistics)',
      badge: 'Producer & Logistics'
    },
    {
      id: 'COMMERCE',
      icon: '🏪',
      title: 'Thương mại & Bán hàng',
      description: 'Dành cho Đại lý bán lẻ & Cửa hàng đặc sản OCOP',
      badge: 'Retailer'
    },
    {
      id: 'CUSTOMER',
      icon: '🔍',
      title: 'Khách hàng & Kiểm định',
      description: 'Dành cho Du khách, Người tiêu dùng & Kiểm định viên OCOP',
      badge: 'Customer & Inspector'
    }
  ];

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
      <div className="bg-white rounded-3xl border border-[#E6E1D7] max-w-lg w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E0]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#264939]" />
            <h3 className="font-serif font-extrabold text-xl text-[#264939]">
              Chọn Vai Trò Kết Nối Ví
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-sans text-[#5E7166]">
          Vui lòng chọn vai trò bạn muốn tham gia trên hệ thống HueLegend trước khi kết nối với ví MetaMask:
        </p>

        {/* 4 Role Options List */}
        <div className="space-y-3 font-sans">
          {roleOptions.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRoleAndConnect(role.id)}
              className="w-full flex items-start gap-4 p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D7] hover:border-[#264939] hover:bg-[#E0ECE4]/50 transition-all text-left group shadow-2xs"
            >
              <div className="text-2xl p-2 bg-white rounded-xl border border-[#E6E1D7] shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                {role.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-serif font-extrabold text-sm text-[#1A2820] group-hover:text-[#264939] transition-colors">
                    {role.title}
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E0ECE4] text-[#264939] border border-[#CCD8CF] shrink-0">
                    {role.badge}
                  </span>
                </div>
                <p className="text-xs text-[#5E7166] mt-1 leading-relaxed">
                  {role.description}
                </p>
              </div>

              <ArrowRight className="w-4 h-4 text-[#8A9D92] group-hover:text-[#264939] group-hover:translate-x-1 transition-all shrink-0 mt-3" />
            </button>
          ))}
        </div>

        <div className="pt-2 text-center text-[11px] font-sans text-[#8A9D92]">
          Sau khi chọn vai trò, ví MetaMask sẽ tự động được mở để xác nhận kết nối Sepolia Testnet.
        </div>
      </div>
    </div>
  );
};
