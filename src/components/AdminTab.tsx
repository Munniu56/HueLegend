import React, { useState } from 'react';
import { Settings, UserPlus, UserMinus, Coins, RefreshCw } from 'lucide-react';

interface AdminTabProps {
  batchCreationFeeEth: string;
  onSetBatchCreationFee: (newFeeEth: string) => Promise<void>;
  onAssignRole: (account: string, roleName: string) => Promise<void>;
  onRevokeRole: (account: string, roleName: string) => Promise<void>;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  batchCreationFeeEth,
  onSetBatchCreationFee,
  onAssignRole,
  onRevokeRole,
}) => {
  const [accountAddress, setAccountAddress] = useState('0x82d022a704706B2f144863D619D7418F8a0f19A7');
  const [roleSelect, setRoleSelect] = useState('ROLE_PRODUCER');
  const [newFee, setNewFee] = useState(batchCreationFeeEth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssign = async () => {
    if (!accountAddress) return;
    setIsSubmitting(true);
    try {
      await onAssignRole(accountAddress, roleSelect);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!accountAddress) return;
    setIsSubmitting(true);
    try {
      await onRevokeRole(accountAddress, roleSelect);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSetBatchCreationFee(newFee);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      {/* RBAC Role Assignment Panel */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E0]">
          <div>
            <h2 className="text-xl font-serif font-extrabold text-[#264939]">
              Phân Quyền Vai Trò RBAC
            </h2>
          </div>
          <Settings className="w-5 h-5 text-[#264939]" />
        </div>

        <div className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-bold text-[#1A2820] mb-1">
              Địa Chỉ Ví Ethereum *
            </label>
            <input
              type="text"
              required
              value={accountAddress}
              onChange={(e) => setAccountAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-mono font-bold focus:outline-none focus:border-[#264939]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A2820] mb-1">
              Chọn Vai Trò *
            </label>
            <select
              value={roleSelect}
              onChange={(e) => setRoleSelect(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-bold focus:outline-none focus:border-[#264939]"
            >
              <option value="ROLE_PRODUCER">ROLE_PRODUCER (Chủ Cơ Sở)</option>
              <option value="ROLE_LOGISTICS">ROLE_LOGISTICS (Đơn Vị Vận Chuyển)</option>
              <option value="ROLE_RETAILER">ROLE_RETAILER (Đại Lý Phân Phối)</option>
              <option value="ROLE_INSPECTOR">ROLE_INSPECTOR (Kiểm Định Viên OCOP)</option>
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={handleAssign}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#264939] text-white font-bold text-xs hover:bg-[#1c372b] transition-all shadow-2xs disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Gán Vai Trò</span>
            </button>

            <button
              onClick={handleRevoke}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all shadow-2xs disabled:opacity-50"
            >
              <UserMinus className="w-4 h-4" />
              <span>Thu Hồi Quyền</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contract Fee Config Panel */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E0]">
          <div>
            <h2 className="text-xl font-serif font-extrabold text-[#264939]">
              Cấu Hình Phí Khai Báo
            </h2>
          </div>
          <Coins className="w-5 h-5 text-[#C29B38]" />
        </div>

        <form onSubmit={handleUpdateFee} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-bold text-[#1A2820] mb-1">
              Phí Hiện Tại On-Chain: <span className="text-[#264939] font-mono font-bold">{batchCreationFeeEth} ETH</span>
            </label>
            <input
              type="number"
              step="0.0001"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-mono font-bold focus:outline-none focus:border-[#264939]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C29B38] text-white font-bold text-xs hover:bg-[#8C6D1F] transition-all shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cập Nhật Mức Phí</span>
          </button>
        </form>
      </div>
    </div>
  );
};
