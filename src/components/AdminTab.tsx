import React, { useState } from 'react';
import { Settings, UserPlus, UserMinus, ShieldAlert, Coins, RefreshCw } from 'lucide-react';
import { ROLE_HASHES } from '../constants';

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* RBAC Role Assignment Panel */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E0]">
          <div>
            <h2 className="text-xl font-extrabold text-[#264939] font-serif">
              Phân Quyền Vai Trò RBAC (OpenZeppelin)
            </h2>
            <p className="text-xs text-[#5E7166] mt-1">
              Gán hoặc thu hồi vai trò Producer, Logistics, Retailer, Inspector.
            </p>
          </div>
          <Settings className="w-6 h-6 text-[#264939]" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
              Địa Chỉ Ví Ethereum *
            </label>
            <input
              type="text"
              required
              value={accountAddress}
              onChange={(e) => setAccountAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-mono font-bold focus:outline-none focus:border-[#264939]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
              Chọn Vai Trò (Role) *
            </label>
            <select
              value={roleSelect}
              onChange={(e) => setRoleSelect(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-bold focus:outline-none focus:border-[#264939]"
            >
              <option value="ROLE_PRODUCER">ROLE_PRODUCER (Chủ Cơ Sở Sản Xuất)</option>
              <option value="ROLE_LOGISTICS">ROLE_LOGISTICS (Đơn Vị Vận Chuyển)</option>
              <option value="ROLE_RETAILER">ROLE_RETAILER (Đại Lý Phân Phối)</option>
              <option value="ROLE_INSPECTOR">ROLE_INSPECTOR (Kiểm Định Viên OCOP)</option>
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={handleAssign}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#264939] text-white font-bold text-xs hover:bg-[#1c372b] transition-all shadow-sm disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Gán Vai Trò (Assign)</span>
            </button>

            <button
              onClick={handleRevoke}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
            >
              <UserMinus className="w-4 h-4" />
              <span>Thu Hồi Quyền (Revoke)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contract Fee Config Panel */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E0]">
          <div>
            <h2 className="text-xl font-extrabold text-[#264939] font-serif">
              Cấu Hình Phí Khai Báo (setBatchCreationFee)
            </h2>
            <p className="text-xs text-[#5E7166] mt-1">
              Thay đổi mức phí tạo lô hàng đặc sản nộp về Quỹ Hệ Thống (Ecosystem Fund).
            </p>
          </div>
          <Coins className="w-6 h-6 text-[#C29B38]" />
        </div>

        <form onSubmit={handleUpdateFee} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
              Phí Hiện Tại On-Chain: <span className="text-[#264939] font-mono font-bold">{batchCreationFeeEth} ETH</span>
            </label>
            <input
              type="number"
              step="0.0001"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-mono font-bold focus:outline-none focus:border-[#264939]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#C29B38] text-white font-bold text-xs hover:bg-[#8C6D1F] transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cập Nhật Mức Phí On-Chain</span>
          </button>
        </form>
      </div>
    </div>
  );
};
