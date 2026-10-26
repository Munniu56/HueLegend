import React from 'react';
import { X, Wallet, ShieldCheck, ExternalLink, LogOut, Coins, Network } from 'lucide-react';
import { ETHERSCAN_BASE_URL, CONTRACT_ADDRESS } from '../constants';

interface WalletDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: string;
  roleTitle: string;
  producerStakeBalance: string;
  onDisconnect: () => void;
}

export const WalletDetailsModal: React.FC<WalletDetailsModalProps> = ({
  isOpen,
  onClose,
  account,
  roleTitle,
  producerStakeBalance,
  onDisconnect,
}) => {
  if (!isOpen) return null;

  const shortAddress = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E6E1D7] max-w-md w-full max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl relative overflow-hidden my-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E0]">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#264939]" />
            <h3 className="font-serif font-extrabold text-lg text-[#264939]">
              Thông Số Ví Kết Nối
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Address Badge Box */}
        <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E6E1D7] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8A9D92] uppercase tracking-wider">
              TÀI KHOẢN VÍ ĐANG KẾT NỐI
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-extrabold text-[#264939] truncate">
              {shortAddress}
            </span>
            <a
              href={`${ETHERSCAN_BASE_URL}/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#264939] font-bold hover:underline shrink-0"
            >
              <span>Etherscan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-[11px] font-mono text-gray-500 break-all bg-white p-2 rounded-lg border border-[#EDE9E0]">
            {account}
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E6E1D7] space-y-1">
            <div className="flex items-center gap-1.5 text-[#5E7166]">
              <Network className="w-3.5 h-3.5 text-[#264939]" />
              <span className="font-bold text-[11px]">MẠNG LƯỚI</span>
            </div>
            <p className="font-bold text-[#1A2820]">Sepolia Testnet</p>
            <p className="text-[10px] text-gray-500 font-mono">Chain ID: 11155111</p>
          </div>

          <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E6E1D7] space-y-1">
            <div className="flex items-center gap-1.5 text-[#5E7166]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C29B38]" />
              <span className="font-bold text-[11px]">VAI TRÒ VÍ</span>
            </div>
            <p className="font-bold text-[#264939] truncate">{roleTitle || 'Tất cả vai trò'}</p>
            <p className="text-[10px] text-emerald-700 font-medium">Đã xác thực</p>
          </div>

          <div className="col-span-2 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-700" />
              <div>
                <span className="text-[10px] font-bold text-[#8A9D92] uppercase block">TIỀN KÝ QUỸ PRODUCER</span>
                <span className="text-sm font-mono font-extrabold text-[#264939]">{producerStakeBalance} ETH</span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200">
              On-Chain
            </span>
          </div>
        </div>

        {/* Action: Disconnect Button */}
        <div className="pt-2 border-t border-[#EDE9E0]">
          <button
            onClick={() => {
              onDisconnect();
              onClose();
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 transition-all border border-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Ngắt Kết Nối Ví (Disconnect Wallet)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
