import React from 'react';
import { Wallet, ShieldCheck } from 'lucide-react';

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
    : 'Chưa kết nối ví';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E6E1D7] px-6 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Network Status Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#E0ECE4] text-[#1c372b] border border-[#CCD8CF]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{isDemoMode ? 'Chế độ Xem Trước' : 'Sepolia Testnet'}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#5E7166]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C29B38]" />
          <span className="font-mono text-[11px]">0x3565...3C6b</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex flex-wrap items-center gap-2.5 ml-auto">
        {/* Connect Wallet Button */}
        <button
          onClick={onConnectWallet}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
            currentAccount
              ? 'bg-[#264939] text-white hover:bg-[#1c372b]'
              : 'bg-[#C29B38] text-white hover:bg-[#8C6D1F]'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>{shortAddress}</span>
        </button>
      </div>
    </header>
  );
};
