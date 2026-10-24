import React, { useState } from 'react';
import { PlusCircle, Coins, Unlock } from 'lucide-react';

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
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E0]">
            <div>
              <h2 className="text-lg font-serif font-extrabold text-[#264939]">
                Khai Báo Lô Hàng On-Chain
              </h2>
            </div>
            <span className="px-3 py-1 bg-[#E0ECE4] text-[#264939] rounded-full text-xs font-bold border border-[#CCD8CF]">
              Phí: {batchCreationFeeEth} ETH
            </span>
          </div>

          <form onSubmit={handleSubmitBatch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1">
                Mã Lô Hàng *
              </label>
              <input
                type="text"
                required
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="HL-MEXUNG-2026-001"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-mono font-bold focus:outline-none focus:border-[#264939] bg-[#FAF9F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1">
                Tên Đặc Sản *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Mè Xửng Thiên Hương..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-bold focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1">
                Địa Danh / Nguồn Gốc *
              </label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Phường Phú Hậu, TP Huế..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1">
                Metadata IPFS URI
              </label>
              <input
                type="text"
                value={metadataURI}
                onChange={(e) => setMetadataURI(e.target.value)}
                placeholder="ipfs://Qm..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-mono focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div className="pt-3 border-t border-[#EDE9E0] flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#264939] text-white font-bold text-xs hover:bg-[#1c372b] transition-all shadow-2xs disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Khởi Tạo Lô Hàng</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EDE9E0]">
            <Coins className="w-5 h-5 text-[#C29B38]" />
            <h3 className="font-extrabold text-sm text-[#1A2820]">
              Tiền Ký Quỹ Producer
            </h3>
          </div>

          <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E6E1D7]">
            <span className="text-[10px] font-bold text-[#8A9D92] uppercase">Số Dư Ký Quỹ</span>
            <div className="text-xl font-extrabold text-[#264939] font-mono mt-0.5">
              {producerStakeBalance} ETH
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1A2820]">
              Cọc Ký Quỹ Thêm
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E6E1D7] text-xs font-mono font-bold"
              />
              <button
                onClick={handleDeposit}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 bg-[#C29B38] text-white font-bold text-xs rounded-lg hover:bg-[#8C6D1F] transition-all shrink-0"
              >
                Cọc
              </button>
            </div>
          </div>

          <button
            onClick={onWithdrawStake}
            disabled={isSubmitting}
            className="w-full py-2 px-3 bg-[#E0ECE4] text-[#264939] font-bold text-xs rounded-xl hover:bg-[#d0e2d5] transition-all border border-[#CCD8CF] flex items-center justify-center gap-1.5"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Rút Ký Quỹ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
