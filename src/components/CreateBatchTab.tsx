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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate batch code from product name
  const generateBatchCodeFromProductName = (name: string): string => {
    if (!name.trim()) return '';
    const noAccents = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');

    const words = noAccents
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) return '';

    const prefix = words.slice(0, 3).join('').slice(0, 10);
    const year = new Date().getFullYear();
    return `HL-${prefix}-${year}-001`;
  };

  const handleProductNameChange = (val: string) => {
    setProductName(val);
    const autoCode = generateBatchCodeFromProductName(val);
    setBatchCode(autoCode);
  };

  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCode.trim() || !productName.trim() || !origin.trim()) return;

    setIsSubmitting(true);
    try {
      const generatedMetadataURI = `ipfs://huelegend/batch/${batchCode.trim()}`;
      await onCreateBatch(batchCode.trim(), productName.trim(), origin.trim(), generatedMetadataURI);
      setBatchCode('');
      setProductName('');
      setOrigin('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto font-sans">
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
              Tên Đặc Sản *
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => handleProductNameChange(e.target.value)}
              placeholder="Ví dụ: Mè Xửng Dừa Hoàng Gia Huế..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-bold focus:outline-none focus:border-[#264939]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#1A2820]">
                Mã Lô Hàng On-Chain *
              </label>
              <span className="text-[10px] font-bold text-[#264939] bg-[#E0ECE4] px-2 py-0.5 rounded-full border border-[#CCD8CF]">
                ⚡ Tự động tạo từ Tên Đặc Sản
              </span>
            </div>
            <input
              type="text"
              readOnly
              required
              value={batchCode}
              placeholder="Mã lô hàng sẽ tự động xuất hiện sau khi nhập Tên Đặc Sản..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-mono font-bold focus:outline-none bg-[#FAF9F5] text-[#264939] cursor-not-allowed"
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
