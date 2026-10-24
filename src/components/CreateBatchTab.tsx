import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

interface CreateBatchTabProps {
  batchCreationFeeEth: string;
  producerStakeBalance?: string;
  isProducerRole?: boolean;
  onCreateBatch: (batchCode: string, productName: string, origin: string, metadataURI: string) => Promise<void>;
  onDepositStake?: (amountEth: string) => Promise<void>;
  onWithdrawStake?: () => Promise<void>;
}

export const CreateBatchTab: React.FC<CreateBatchTabProps> = ({
  batchCreationFeeEth,
  onCreateBatch,
}) => {
  const [batchCode, setBatchCode] = useState('');
  const [productName, setProductName] = useState('');
  const [origin, setOrigin] = useState('');
  const [metadataURI, setMetadataURI] = useState('');
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

  return (
    <div className="max-w-3xl mx-auto">
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
              placeholder="Ví dụ: HL-MEXUNG-2026-001"
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
              placeholder="Ví dụ: Mè Xửng Dừa Hoàng Gia Huế..."
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
              placeholder="Ví dụ: Phường Hương Long, TP Huế, Thừa Thiên Huế..."
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
              placeholder="Ví dụ: ipfs://Qm... (Link tài liệu chứng minh nguồn gốc)"
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
  );
};
