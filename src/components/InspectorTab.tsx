import React, { useState } from 'react';
import { Batch } from '../types';
import {
  ShieldCheck,
  AlertOctagon,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  MapPin,
  UserCheck,
  Calendar,
  ExternalLink,
  Package,
  Coins,
  FileText
} from 'lucide-react';
import { ETHERSCAN_BASE_URL } from '../constants';

interface InspectorTabProps {
  batches: Record<string, Batch>;
  isInspectorRole?: boolean;
  onVerifyBatch: (
    batchCode: string,
    inspectorNote: string,
    certificateURI: string,
    starRating: string
  ) => Promise<void>;
  onRevokeVerification: (batchCode: string, reason: string) => Promise<void>;
  onConnectWallet?: () => void;
}

export const InspectorTab: React.FC<InspectorTabProps> = ({
  batches,
  isInspectorRole = true,
  onVerifyBatch,
  onRevokeVerification,
  onConnectWallet,
}) => {
  const batchList = Object.values(batches);
  const [selectedBatchCode, setSelectedBatchCode] = useState(batchList[0]?.batchCode || '');
  const [starRating, setStarRating] = useState('4');
  const [inspectorNote, setInspectorNote] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBatch = batches[selectedBatchCode];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchCode) return;

    setIsSubmitting(true);
    try {
      const generatedCertURI = `ipfs://huelegend/cert/${selectedBatchCode}`;
      await onVerifyBatch(selectedBatchCode, inspectorNote, generatedCertURI, starRating);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!selectedBatchCode || !revokeReason) return;

    setIsSubmitting(true);
    try {
      await onRevokeVerification(selectedBatchCode, revokeReason);
      setRevokeReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Da an banner thong bao Kiem dinh vien theo yeu cau */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E0]">
              <div>
                <h2 className="text-xl font-serif font-extrabold text-[#264939]">
                  Thẩm Định & Cấp Chứng Nhận OCOP
                </h2>
                <p className="text-xs font-sans text-[#5E7166] mt-0.5">
                  Kiểm định chất lượng đặc sản Thừa Thiên Huế và mã hóa chứng nhận lên Sepolia Testnet.
                </p>
              </div>
              <Award className="w-6 h-6 text-[#C29B38]" />
            </div>

            {/* Fee Status Indicator */}
            <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E6E1D7] flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-[#1A2820]">Trạng thái phí thẩm định:</span>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px] border border-emerald-200">
                Đã được Cơ sở sản xuất thanh toán (0.002 ETH)
              </span>
            </div>

            <form onSubmit={handleVerify} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1">
                  Chọn Lô Hàng Thẩm Định *
                </label>
                <select
                  value={selectedBatchCode}
                  onChange={(e) => setSelectedBatchCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-mono font-bold focus:outline-none focus:border-[#264939] bg-[#FAF9F5]"
                >
                  {batchList.length > 0 ? (
                    batchList.map((batch) => (
                      <option key={batch.batchCode} value={batch.batchCode}>
                        {batch.batchCode} — {batch.productName} ({batch.isVerified ? 'Đã OCOP' : 'Chờ Duyệt'})
                      </option>
                    ))
                  ) : (
                    <option value="">Chưa có sản phẩm nào trên Blockchain</option>
                  )}
                </select>
              </div>

              {/* OCOP Star Rating Dropdown / Selection */}
              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1">
                  Xếp Hạng Sao OCOP Thừa Thiên Huế *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: '3', label: '⭐ 3 Sao', desc: 'Đạt chuẩn cấp Tỉnh' },
                    { val: '4', label: '⭐⭐ 4 Sao', desc: 'Chất lượng Cao Tỉnh' },
                    { val: '5', label: '⭐⭐⭐ 5 Sao', desc: 'Cấp Quốc Gia' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.val}
                      onClick={() => setStarRating(item.val)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        starRating === item.val
                          ? 'border-[#C29B38] bg-amber-50/60 ring-1 ring-[#C29B38]'
                          : 'border-[#E6E1D7] bg-[#FAF9F5] hover:border-[#264939]'
                      }`}
                    >
                      <span className="font-extrabold text-xs text-[#264939]">{item.label}</span>
                      <span className="text-[10px] text-[#5E7166] mt-1">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1">
                  Ghi Chú Thẩm Định *
                </label>
                <textarea
                  required
                  rows={3}
                  value={inspectorNote}
                  onChange={(e) => setInspectorNote(e.target.value)}
                  placeholder="Ví dụ: Đạt chuẩn chất lượng OCOP 4 sao tỉnh Thừa Thiên Huế. Đầy đủ tem nhãn và hồ sơ vệ sinh an toàn thực phẩm."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs focus:outline-none focus:border-[#264939]"
                />
              </div>

              {/* Fee Note for Inspector */}
              <div className="text-[11px] text-[#5E7166] bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EDE9E0]">
                ⚡ <strong>Lưu ý:</strong> Người thẩm định <strong>KHÔNG TRẢ PHÍ (0 ETH)</strong>. Bạn chỉ chi trả một lượng gas Sepolia nhỏ để ký xác nhận thẩm định on-chain.
              </div>

              <div className="pt-3 border-t border-[#EDE9E0] flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedBatch || selectedBatch?.isVerified || !isInspectorRole}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C29B38] text-white font-sans font-bold text-xs hover:bg-[#8C6D1F] transition-all shadow-2xs disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {selectedBatch?.isVerified ? 'Đã Được Chứng Nhận' : 'Cấp Chứng Nhận OCOP'}
                  </span>
                </button>
              </div>
            </form>

            {selectedBatch?.isVerified && (
              <div className="pt-4 border-t border-red-200 bg-red-50/50 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                  <span>Thu hồi Chứng nhận OCOP</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="Lý do thu hồi..."
                    className="w-full px-3 py-1.5 rounded-lg border border-red-200 text-xs focus:outline-none focus:border-red-500 bg-white"
                  />
                  <button
                    onClick={handleRevoke}
                    disabled={isSubmitting || !revokeReason || !isInspectorRole}
                    className="px-3.5 py-1.5 bg-red-600 text-white font-bold text-xs rounded-lg hover:bg-red-700 transition-all shrink-0 disabled:opacity-50"
                  >
                    Thu Hồi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Complete Batch Creation Details */}
        <div className="space-y-6 font-sans">
          {selectedBatch ? (
            <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-4">
              <div className="pb-3 border-b border-[#EDE9E0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#8A9D92] uppercase tracking-wider block">
                    Chi Tiết Khai Báo Lô Hàng
                  </span>
                  <div className="font-mono text-sm font-extrabold text-[#264939] mt-0.5">
                    {selectedBatch.batchCode}
                  </div>
                </div>
                <Package className="w-5 h-5 text-[#C29B38]" />
              </div>

              {/* Specialty Product Image Preview */}
              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#E6E1D7] space-y-2 text-center">
                <div className="relative overflow-hidden rounded-xl bg-white border border-[#EDE9E0] p-2 flex items-center justify-center">
                  <img
                    src={selectedBatch.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
                    alt={selectedBatch.productName}
                    className="max-h-40 w-full object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                </div>
                <div className="text-[11px] font-extrabold text-[#1A2820] font-serif">
                  {selectedBatch.productName}
                </div>
              </div>

              {/* Status Badge */}
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E6E1D7] space-y-2">
                <span className="text-[10px] font-bold text-[#8A9D92] uppercase block">
                  TRẠNG THÁI KIỂM ĐỊNH OCOP:
                </span>
                {selectedBatch.isVerified ? (
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 bg-amber-100 text-[#8C6D1F] border border-amber-300 px-3 py-1 rounded-full text-xs font-extrabold">
                      <ShieldCheck className="w-4 h-4 text-[#C29B38]" />
                      <span>ĐÃ CẤP CHỨNG NHẬN OCOP</span>
                    </span>
                    {selectedBatch.starRating && (
                      <div className="text-xs font-bold text-[#C29B38] flex items-center gap-1 pt-1">
                        <Star className="w-3.5 h-3.5 fill-[#C29B38]" />
                        <span>Xếp hạng: {selectedBatch.starRating} Sao OCOP</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>CHỜ CẤP CHỨNG NHẬN OCOP</span>
                  </span>
                )}
              </div>

              {/* Full Created Batch Attributes List */}
              <div className="space-y-2.5 text-xs text-[#5E7166]">
                <div className="flex items-start justify-between gap-2 p-2 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                  <span className="font-medium flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-[#264939] shrink-0" />
                    <span>Nguồn gốc / Địa danh:</span>
                  </span>
                  <strong className="text-[#1A2820] text-right font-bold truncate max-w-[150px]">
                    {selectedBatch.origin || 'Thừa Thiên Huế'}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-2 p-2 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                  <span className="font-medium flex items-center gap-1 text-[11px]">
                    <UserCheck className="w-3.5 h-3.5 text-[#264939] shrink-0" />
                    <span>CS SX (Ví On-Chain):</span>
                  </span>
                  <a
                    href={`${ETHERSCAN_BASE_URL}/address/${selectedBatch.producer}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-800 font-bold hover:underline flex items-center gap-1 truncate max-w-[130px]"
                  >
                    <span>{selectedBatch.producer ? `${selectedBatch.producer.slice(0, 6)}...${selectedBatch.producer.slice(-4)}` : 'Chưa có'}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="flex items-start justify-between gap-2 p-2 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                  <span className="font-medium flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-[#264939] shrink-0" />
                    <span>Thời gian khởi tạo:</span>
                  </span>
                  <strong className="text-[#1A2820] text-right font-mono text-[11px]">
                    {selectedBatch.createdAt ? new Date(selectedBatch.createdAt * 1000).toLocaleDateString('vi-VN') : 'Mới tạo'}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-2 p-2 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                  <span className="font-medium flex items-center gap-1 text-[11px]">
                    <Coins className="w-3.5 h-3.5 text-[#C29B38] shrink-0" />
                    <span>Phí thẩm định gộp:</span>
                  </span>
                  <strong className="text-emerald-700 font-mono text-[11px]">
                    0.002 ETH (Đã thu)
                  </strong>
                </div>

                {selectedBatch.checkpoints?.[0]?.metadataURI && (
                  <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0] space-y-1">
                    <span className="font-medium flex items-center gap-1 text-[10px] text-[#8A9D92]">
                      <FileText className="w-3.5 h-3.5 text-[#264939] shrink-0" />
                      <span>METADATA URI ON-CHAIN:</span>
                    </span>
                    <div className="font-mono text-[10px] text-[#264939] truncate bg-white p-1 rounded border border-[#EDE9E0]">
                      {selectedBatch.checkpoints[0].metadataURI}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] text-center text-xs text-gray-400">
              Chưa có lô hàng nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

