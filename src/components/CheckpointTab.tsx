import React, { useState } from 'react';
import { Batch } from '../types';
import { Truck, PlusCircle, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

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
  // Khoi tao gia tri khoang trang cho cac truong nhap lieu
  const batchList = Object.keys(batches);
  const [selectedBatchCode, setSelectedBatchCode] = useState(batchList[0] || '');
  const [role, setRole] = useState('ROLE_LOGISTICS');
  const [stepName, setStepName] = useState('');
  const [location, setLocation] = useState('');
  const [action, setAction] = useState('');
  const [conditionNote, setConditionNote] = useState('');
  const [metadataURI, setMetadataURI] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentBatch = batches[selectedBatchCode];

  // Ham xu ly submit form ghi chang van chuyen
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

  // Preset chanh van chuyen nhanh
  const applyPreset = (presetType: 'COLD_CHAIN' | 'EXPRESS_POST') => {
    if (presetType === 'COLD_CHAIN') {
      setStepName('Chặng 2: Tiếp nhận kho lạnh & Niêm phong xe thùng xốp bảo ôn');
      setLocation('Kho Vận Lạnh Bưu Chính Huế - 16 Lý Thường Kiệt, TP.Huế');
      setAction('Kiểm tra tem niêm phong QR, xếp lô hàng vào xe tải lạnh bảo ôn, theo dõi nhiệt độ tự động.');
      setConditionNote('Nhiệt độ bảo quản lạnh 15°C - 18°C, độ ẩm 45%, chì niêm phong số #HL-LOG-9921.');
      setMetadataURI('ipfs://QmHueColdChainLogisticsReceipt2026');
    } else {
      setStepName('Chặng 3: Vận chuyển Chuyển Phát Nhanh Quốc Tế & Liên Tỉnh');
      setLocation('Sân Bay Quốc Tế Phú Bài / Ga Huế - Thừa Thiên Huế');
      setAction('Bàn giao cho đơn vị vận chuyển hàng không / đường sắt, dán mã tem QR theo dõi thời gian thực.');
      setConditionNote('Vận chuyển hàng không 24h, nhiệt độ môi trường mát 22°C, đóng thùng carton gia cố.');
      setMetadataURI('ipfs://QmHueExpressTransportWaybill2026');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Step Indicator Banner */}
      <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E6E1D7] flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
        <span className="font-bold text-[#264939] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-[#C29B38]" />
          Quy Trình Chuỗi Cung Ứng On-Chain:
        </span>
        <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] font-bold">
          <span className="text-[#5E7166]">1. Khai Báo Lô</span>
          <span className="text-[#8A9D92]">→</span>
          <span className="text-[#5E7166]">2. Thẩm Định OCOP</span>
          <span className="text-[#8A9D92]">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-[#264939] text-white shadow-2xs">3. Vận Chuyển</span>
          <span className="text-[#8A9D92]">→</span>
          <span className="text-[#5E7166]">4. Quản Lý Niêm Yết</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Left 2 Cols: Logistics Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E0]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#264939]/10 text-[#264939] text-[11px] font-bold mb-1">
                <Truck className="w-3.5 h-3.5 text-[#264939]" />
                <span>NHẬT KÝ CHẶNG VẬN CHUYỂN ON-CHAIN</span>
              </div>
              <h2 className="text-xl font-serif font-extrabold text-[#264939]">
                Khai Báo & Ghi Nhật Ký Vận Chuyển / Kho Vận
              </h2>
            </div>
            <Truck className="w-7 h-7 text-[#264939]" />
          </div>

          {/* Quick Preset Buttons */}
          <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E6E1D7] space-y-2">
            <span className="text-xs font-bold text-[#1A2820] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C29B38]" />
              Gợi ý chặng vận chuyển nhanh:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('COLD_CHAIN')}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#CCD8CF] hover:border-[#264939] text-xs font-bold text-[#264939] hover:bg-[#E0ECE4] transition-all"
              >
                🚚 Chặng Kho Lạnh Bảo Ôn
              </button>
              <button
                type="button"
                onClick={() => applyPreset('EXPRESS_POST')}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#CCD8CF] hover:border-[#264939] text-xs font-bold text-[#264939] hover:bg-[#E0ECE4] transition-all"
              >
                ✈️ Chặng Chuyển Phát Nhanh / Hàng Không
              </button>
            </div>
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
                  Tên Chặng Vận Chuyển *
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
                  <option value="ROLE_LOGISTICS">Đơn Vị Vận Chuyển / Kho Vận (Logistics)</option>
                  <option value="ROLE_PRODUCER">Cơ Sở Sản Xuất (Producer)</option>
                  <option value="ROLE_RETAILER">Đại Lý Phân Phối (Retailer)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1">
                Địa Điểm / Tuyến Đường Vận Chuyển *
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
                Chi Tiết Hoạt Động Vận Chuyển *
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
                Ghi Chú Điều Kiện Bảo Quản & Chì Niêm Phong
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
                IPFS Metadata Link (Biên Bản Giao Nhận / Hóa Đơn)
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
                <span>Ghi Chặng Vận Chuyển On-Chain</span>
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

            <div className="space-y-2 text-xs text-[#5E7166]">
              <div><span className="font-bold text-[#1A2820]">Nguồn gốc:</span> {currentBatch.origin}</div>
              <div><span className="font-bold text-[#1A2820]">Chứng nhận OCOP:</span> {currentBatch.ocopStandard}</div>
              <div><span className="font-bold text-[#1A2820]">Số chặng đã ghi:</span> {currentBatch.checkpoints?.length || 0} chặng</div>
            </div>

            <div className="pt-3 border-t border-[#EDE9E0] space-y-2">
              <span className="text-[11px] font-bold text-[#264939] uppercase tracking-wider block">
                Tiến Trình Chặng
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {currentBatch.checkpoints?.map((cp, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E6E1D7] text-[11px]">
                    <div className="font-bold text-[#1A2820] flex items-center justify-between">
                      <span>Chặng {idx + 1}</span>
                      <span className="text-[10px] font-mono text-[#8A9D92]">
                        {new Date((cp.timestamp || 0) * 1000).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-[#5E7166] truncate mt-0.5">{cp.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] text-center text-xs text-gray-400 font-sans">
            Chưa có lô hàng nào để chọn.
          </div>
        )}
      </div>
    </div>
  </div>
);
};

