import React, { useState } from 'react';
import { PlusCircle, Coins, ShieldAlert, Sparkles, CheckCircle2, Lock, Unlock, HelpCircle } from 'lucide-react';

interface CreateBatchTabProps {
  batchCreationFeeEth: string;
  producerStakeBalance: string;
  isProducerRole: boolean;
  onCreateBatch: (batchCode: string, productName: string, origin: string, metadataURI: string) => Promise<void>;
  onDepositStake: (amountEth: string) => Promise<void>;
  onWithdrawStake: () => Promise<void>;
}

export const CreateBatchTab: React.FC<CreateBatchTabProps> = ({
  batchCreationFeeEth,
  producerStakeBalance,
  isProducerRole,
  onCreateBatch,
  onDepositStake,
  onWithdrawStake,
}) => {
  const [batchCode, setBatchCode] = useState(`HL-SPECIAL-${Date.now().toString().slice(-4)}`);
  const [productName, setProductName] = useState('Mè Xửng Dừa Hoàng Gia Huế');
  const [origin, setOrigin] = useState('Phường Hương Long, TP Huế, Thừa Thiên Huế');
  const [metadataURI, setMetadataURI] = useState('ipfs://QmHueBatchProducerMetadataSample');
  const [stakeAmount, setStakeAmount] = useState('0.05');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCode || !productName || !origin) return;

    setIsSubmitting(true);
    try {
      await onCreateBatch(batchCode, productName, origin, metadataURI);
      // Generate new batch code for next entry
      setBatchCode(`HL-SPECIAL-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeposit = async () => {
    setIsSubmitting(true);
    try {
      await onDepositStake(stakeAmount);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Create Batch Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E0]">
            <div>
              <h2 className="text-xl font-extrabold text-[#264939] font-serif">
                Khai Báo Lô Hàng Đặc Sản Mới
              </h2>
              <p className="text-xs text-[#5E7166] mt-1">
                Dành cho Cơ Sở Sản Xuất (Producer). Lô hàng sau khi khởi tạo sẽ được đưa lên Blockchain Sepolia.
              </p>
            </div>
            <span className="px-3 py-1 bg-[#E0ECE4] text-[#264939] rounded-full text-xs font-bold border border-[#CCD8CF]">
              Phí Tạo Lô: {batchCreationFeeEth} ETH
            </span>
          </div>

          <form onSubmit={handleSubmitBatch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                Mã Định Danh Lô Hàng (Batch Code) *
              </label>
              <input
                type="text"
                required
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="Ví dụ: HL-MEXUNG-2026-001"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-mono font-bold focus:outline-none focus:border-[#264939] bg-[#FAF9F5]"
              />
              <span className="text-[11px] text-[#8A9D92] mt-1 block">
                Quy tắc đặt mã: HL-[TEN_DAC_SAN]-[NAM]-[STT]
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                Tên Tên Đặc Sản / Sản Phẩm OCOP *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ví dụ: Mè Xửng Thiên Hương Thượng Hạng"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-bold focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                Địa Danh / Vùng Nguyên Liệu Sản Xuất *
              </label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Ví dụ: Làng Nón Tây Hồ, Xã Phú Hồ, Huyện Phú Vang"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                Đường Dẫn Hồ Sơ IPFS (Metadata URI)
              </label>
              <input
                type="text"
                value={metadataURI}
                onChange={(e) => setMetadataURI(e.target.value)}
                placeholder="ipfs://Qm..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-mono focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div className="pt-4 border-t border-[#EDE9E0] flex items-center justify-between">
              <div className="text-xs text-[#5E7166]">
                Thao tác này sẽ gọi hàm <code className="font-mono text-[#264939]">createBatch()</code> và thu {batchCreationFeeEth} ETH về Ecosystem Fund.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#264939] text-white font-bold text-xs hover:bg-[#1c372b] transition-all shadow-md disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang Khởi Tạo...' : 'Khởi Tạo Lô Hàng On-Chain'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Col: Producer Stake Management Card */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#EDE9E0]">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-[#C29B38] flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1A2820]">
                Tiền Ký Quỹ Đảm Bảo (Stake)
              </h3>
              <p className="text-xs text-[#8A9D92]">Cam kết chất lượng đặc sản</p>
            </div>
          </div>

          <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E6E1D7] space-y-2">
            <span className="text-[11px] font-bold text-[#8A9D92] uppercase">Số Dư Đã Cọc Ký Quỹ</span>
            <div className="text-2xl font-extrabold text-[#264939] font-mono">
              {producerStakeBalance} ETH
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium pt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đạt tiêu chuẩn ký quỹ tối thiểu (0.05 ETH)</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#1A2820]">
              Cọc Thêm Ký Quỹ (depositStake)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E6E1D7] text-sm font-mono font-bold"
              />
              <button
                onClick={handleDeposit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#C29B38] text-white font-bold text-xs rounded-xl hover:bg-[#8C6D1F] transition-all shrink-0"
              >
                Đặt Cọc
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#EDE9E0]">
            <button
              onClick={onWithdrawStake}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#E0ECE4] text-[#264939] font-bold text-xs rounded-xl hover:bg-[#d0e2d5] transition-all border border-[#CCD8CF] flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Rút Ký Quỹ (Khi Hết Khóa)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
