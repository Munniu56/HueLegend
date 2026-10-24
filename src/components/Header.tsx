import React from 'react';
import { Wallet, ShieldCheck, Cpu, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentAccount: string | null;
  isDemoMode: boolean;
  simulatedRole: string;
  onConnectWallet: () => void;
  onToggleDemoMode: () => void;
  onSimulatedRoleChange: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAccount,
  isDemoMode,
  simulatedRole,
  onConnectWallet,
  onToggleDemoMode,
  onSimulatedRoleChange,
}) => {
  const shortAddress = currentAccount
    ? `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`
    : 'Chưa kết nối';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E6E1D7] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Title & Network Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E0ECE4] text-[#1c372b] border border-[#CCD8CF]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {isDemoMode ? 'Chế độ Demo (Giả Lập)' : 'Mạng Sepolia Testnet'}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#5E7166]">
          <ShieldCheck className="w-4 h-4 text-[#C29B38]" />
          <span>Hợp Đồng Smart Contract: ProjectCore.sol (Lab 8 - 15)</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex flex-wrap items-center gap-3 ml-auto">
        {/* Role Simulator */}
        <div className="flex items-center gap-1.5 bg-white border border-[#E6E1D7] rounded-lg px-2.5 py-1 text-xs font-medium shadow-xs">
          <Cpu className="w-3.5 h-3.5 text-[#264939]" />
          <span className="text-[#5E7166]">Giả lập vai trò:</span>
          <select
            value={simulatedRole}
            onChange={(e) => onSimulatedRoleChange(e.target.value)}
            className="bg-transparent font-bold text-[#264939] focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả vai trò (Full Demo)</option>
            <option value="PRODUCER">Chủ cơ sở (Producer)</option>
            <option value="LOGISTICS">Vận chuyển (Logistics)</option>
            <option value="RETAILER">Đại lý (Retailer)</option>
            <option value="INSPECTOR">Kiểm định viên (Inspector)</option>
            <option value="ADMIN">Quản trị viên (Admin)</option>
          </select>
        </div>

        {/* Demo Switch Toggle */}
        <button
          onClick={onToggleDemoMode}
          title="Bật/Tắt Chế độ Giả Lập Trải Nghiệm Mượt Ma"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isDemoMode
              ? 'bg-[#E0ECE4] text-[#264939] border-[#CCD8CF] hover:bg-[#d0e2d5]'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isDemoMode ? 'text-[#264939]' : 'text-amber-600'}`} />
          {isDemoMode ? 'Chế độ Demo: BẬT' : 'Web3 Thật: BẬT'}
        </button>

        {/* Connect Wallet Button */}
        <button
          onClick={onConnectWallet}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            currentAccount
              ? 'bg-[#264939] text-white hover:bg-[#1c372b]'
              : 'bg-[#C29B38] text-white hover:bg-[#8C6D1F]'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{currentAccount ? shortAddress : 'Kết Nối Ví MetaMask'}</span>
        </button>
      </div>
    </header>
  );
};
