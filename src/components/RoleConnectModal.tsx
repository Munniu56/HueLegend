import React from 'react';
import { X, ShieldCheck, ArrowRight } from 'lucide-react';
import { DEFAULT_ADMIN_ADDRESS } from '../constants';

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
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E6E1D7] max-w-2xl w-full max-h-[90vh] flex flex-col p-4 sm:p-6 shadow-2xl relative overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 shrink-0 border-b border-[#EDE9E0]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#264939]" />
            <h3 className="font-serif font-extrabold text-lg sm:text-xl text-[#264939]">
              Chọn Vai Trò Kết Nối Ví
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-sans text-[#5E7166] pt-3 shrink-0">
          Vui lòng chọn vai trò bạn muốn tham gia trên hệ thống HueLegend trước khi kết nối với ví MetaMask:
        </p>

        {/* Dynamic Responsive 2-Column Grid Layout for All Computer Screens */}
        <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {roleOptions.map((role, idx) => (
              <button
                key={role.id}
                onClick={() => onSelectRoleAndConnect(role.id)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D7] hover:border-[#264939] hover:bg-[#E0ECE4]/50 transition-all text-left group shadow-2xs ${
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
          Sau khi chọn vai trò, ví MetaMask sẽ tự động được mở để xác nhận kết nối Sepolia Testnet.
        </div>
      </div>
    </div>
  );
};
