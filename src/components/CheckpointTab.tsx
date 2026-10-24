import React, { useState } from 'react';
import { Batch } from '../types';
import { Truck, PlusCircle } from 'lucide-react';

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
  const [selectedBatchCode, setSelectedBatchCode] = useState(batchList[0] || '');
  const [role, setRole] = useState('ROLE_PRODUCER');
  const [stepName, setStepName] = useState('');
  const [location, setLocation] = useState('');
  const [action, setAction] = useState('');
  const [conditionNote, setConditionNote] = useState('');
  const [metadataURI, setMetadataURI] = useState('');
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Left 2 Cols: Checkpoint Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E0]">
            <div>
              <h2 className="text-xl font-serif font-extrabold text-[#264939]">
                Ghi Nhật Ký Chặng Supply Chain
              </h2>
            </div>
            <Truck className="w-5 h-5 text-[#264939]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1">
                Chọn Lô Hàng *
              </label>
              <select
                value={selectedBatchCode}
                onChange={(e) => setSelectedBatchCode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-mono font-bold focus:outline-none focus:border-[#264939] bg-[#FAF9F5]"
              >
                {batchList.length > 0 ? (
                  batchList.map((code) => (
                    <option key={code} value={code}>
                      {code} — {batches[code]?.productName}
                    </option>
                  ))
                ) : (
                  <option value="">Chưa có sản phẩm nào trên Blockchain</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1">
                  Tên Chặng Thực Hiện *
                </label>
                <input
                  type="text"
                  required
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                  placeholder="Ví dụ: Chặng 2: Vận chuyển kho lạnh..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-bold focus:outline-none focus:border-[#264939]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1">
                  Vai Trò Đơn Vị (RBAC) *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-bold focus:outline-none focus:border-[#264939]"
                >
                  <option value="ROLE_PRODUCER">Cơ Sở Sản Xuất (Producer)</option>
                  <option value="ROLE_RETAILER">Đại Lý Phân Phối (Retailer)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1">
                Địa Điểm Thực Hiện *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ví dụ: Bưu chính Quốc Tế Huế - Ga Huế & Sân Bay Phú Bài..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1">
                Nội Dung Thực Hiện *
              </label>
              <textarea
                required
                rows={3}
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="Ví dụ: Kiểm tra tem mã QR niêm phong, đóng gói thùng xốp bảo ôn, theo dõi cảm biến..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1">
                Ghi Chú Điều Kiện Bảo Quản
              </label>
              <input
                type="text"
                value={conditionNote}
                onChange={(e) => setConditionNote(e.target.value)}
                placeholder="Ví dụ: Nhiệt độ bảo quản lạnh 15°C - 18°C, độ ẩm 45%..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1">
                IPFS Metadata Link
              </label>
              <input
                type="text"
                value={metadataURI}
                onChange={(e) => setMetadataURI(e.target.value)}
                placeholder="Ví dụ: ipfs://Qm... (Link hóa đơn hoặc biên bản giao nhận)"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-mono focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div className="pt-3 border-t border-[#EDE9E0] flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || batchList.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#264939] text-white font-sans font-bold text-xs hover:bg-[#1c372b] transition-all shadow-2xs disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ghi Chặng On-Chain</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Col: Batch Preview Card */}
      <div className="space-y-6 font-sans">
        {currentBatch ? (
          <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-3">
            <div className="pb-3 border-b border-[#EDE9E0]">
              <span className="text-[10px] font-bold text-[#8A9D92] uppercase">Lô Đang Chọn</span>
              <div className="font-mono text-sm font-extrabold text-[#264939]">
                {currentBatch.batchCode}
              </div>
              <h3 className="font-serif font-bold text-base text-[#1A2820] mt-1">{currentBatch.productName}</h3>
            </div>

            <div className="space-y-1.5 text-xs text-[#5E7166]">
              <div><span className="font-bold text-[#1A2820]">Nguồn gốc:</span> {currentBatch.origin}</div>
              <div><span className="font-bold text-[#1A2820]">Chặng đã ghi:</span> {currentBatch.checkpoints?.length || 0} chặng</div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] text-center text-xs text-gray-400 font-sans">
            Chưa có lô hàng nào để chọn.
          </div>
        )}
      </div>
    </div>
  );
};
