import React, { useState } from 'react';
import { Batch } from '../types';
import { Truck, MapPin, FileText, CheckCircle2, Shield, PlusCircle } from 'lucide-react';

interface CheckpointTabProps {
  batches: Record<string, Batch>;
  onAddCheckpoint: (
    batchCode: string,
    role: string,
    location: string,
    action: string,
    metadataURI: string,
    stepName: string,
    conditionNote: string
  ) => Promise<void>;
}

export const CheckpointTab: React.FC<CheckpointTabProps> = ({ batches, onAddCheckpoint }) => {
  const batchList = Object.keys(batches);
  const [selectedBatchCode, setSelectedBatchCode] = useState(batchList[0] || 'HL-MEXUNG-2026-001');
  const [role, setRole] = useState('ROLE_LOGISTICS');
  const [stepName, setStepName] = useState('Chặng 2: Vận Chuyển Kho Lạnh Quốc Tế');
  const [location, setLocation] = useState('Bưu chính Quốc Tế Huế - Ga Huế & Sân Bay Phú Bài');
  const [action, setAction] = useState(
    'Kiểm tra tem mã QR niêm phong, đóng gói thùng xốp bảo ôn, theo dõi cảm biến nhiệt độ liên tục trong suốt hành trình.'
  );
  const [conditionNote, setConditionNote] = useState('Nhiệt độ bảo quản lạnh 15°C - 18°C, độ ẩm 45%, không xóc nhiệt.');
  const [metadataURI, setMetadataURI] = useState('ipfs://QmHueSupplyChainLogisticsReceipt');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentBatch = batches[selectedBatchCode];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchCode || !location || !action) return;

    setIsSubmitting(true);
    try {
      await onAddCheckpoint(selectedBatchCode, role, location, action, metadataURI, stepName, conditionNote);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Checkpoint Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E0]">
            <div>
              <h2 className="text-xl font-extrabold text-[#264939] font-serif">
                Ghi Nhật Ký Chặng Supply Chain (addCheckpoint)
              </h2>
              <p className="text-xs text-[#5E7166] mt-1">
                Khai báo thông tin chặng chế biến, vận chuyển, lưu kho hoặc đại lý phân phối lên Blockchain.
              </p>
            </div>
            <Truck className="w-6 h-6 text-[#264939]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                Chọn Lô Hàng Cần Cập Nhật *
              </label>
              <select
                value={selectedBatchCode}
                onChange={(e) => setSelectedBatchCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-mono font-bold focus:outline-none focus:border-[#264939] bg-[#FAF9F5]"
              >
                {batchList.map((code) => (
                  <option key={code} value={code}>
                    {code} — {batches[code]?.productName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                  Tên Chặng Thực Hiện *
                </label>
                <input
                  type="text"
                  required
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                  placeholder="Chặng 2: Vận Chuyển..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-bold focus:outline-none focus:border-[#264939]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                  Vai Trò Đơn Vị Ghi Nhận (RBAC) *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-bold focus:outline-none focus:border-[#264939]"
                >
                  <option value="ROLE_PRODUCER">Cơ Sở Sản Xuất (Producer)</option>
                  <option value="ROLE_LOGISTICS">Đơn Vị Vận Chuyển (Logistics)</option>
                  <option value="ROLE_RETAILER">Đại Lý Phân Phối (Retailer)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                Địa Điểm Thực Hiện *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ví dụ: Kho trung chuyển Ga Huế, TP Huế..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                Chi Tiết Hành Động Thực Hiện *
              </label>
              <textarea
                required
                rows={3}
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="Mô tả quá trình chế biến, niêm phong hoặc giao nhận..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                Ghi Chú Điều Kiện Bảo Quản / Vận Chuyển
              </label>
              <input
                type="text"
                value={conditionNote}
                onChange={(e) => setConditionNote(e.target.value)}
                placeholder="Nhiệt độ, độ ẩm, niêm phong..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                IPFS Metadata Link
              </label>
              <input
                type="text"
                value={metadataURI}
                onChange={(e) => setMetadataURI(e.target.value)}
                placeholder="ipfs://Qm..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-mono focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div className="pt-4 border-t border-[#EDE9E0] flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#264939] text-white font-bold text-xs hover:bg-[#1c372b] transition-all shadow-md disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang Ghi Nhận...' : 'Ghi Chặng On-Chain'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Col: Batch Preview Card */}
      <div className="space-y-6">
        {currentBatch ? (
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-4">
            <div className="pb-3 border-b border-[#EDE9E0]">
              <span className="text-[10px] font-bold text-[#8A9D92] uppercase">
                Thông Tin Lô Đang Chọn
              </span>
              <div className="font-mono text-base font-extrabold text-[#264939]">
                {currentBatch.batchCode}
              </div>
              <h3 className="font-bold text-sm text-[#1A2820] mt-1">{currentBatch.productName}</h3>
            </div>

            <div className="space-y-2 text-xs text-[#5E7166]">
              <div>
                <span className="font-bold text-[#1A2820]">Nguồn gốc:</span> {currentBatch.origin}
              </div>
              <div>
                <span className="font-bold text-[#1A2820]">Chặng hiện tại:</span>{' '}
                {currentBatch.checkpoints?.length || 0} chặng
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EDE9E0] space-y-2 text-xs">
              <span className="font-bold text-[#264939] block">Chặng mới nhất:</span>
              {currentBatch.checkpoints && currentBatch.checkpoints.length > 0 ? (
                <p className="text-[#3B4D43] italic">
                  "{currentBatch.checkpoints[currentBatch.checkpoints.length - 1].action}"
                </p>
              ) : (
                <p className="text-gray-400">Chưa có chặng nào.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] text-center text-xs text-gray-400">
            Hãy chọn một lô hàng để xem chi tiết.
          </div>
        )}
      </div>
    </div>
  );
};
