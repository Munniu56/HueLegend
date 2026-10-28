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
  FileText,
  Wallet
} from 'lucide-react';
import { ETHERSCAN_BASE_URL } from '../constants';

interface InspectorTabProps {
  batches: Record<string, Batch>;
  isInspectorRole?: boolean;
  currentAccount?: string | null;
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
  currentAccount,
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
      {/* Top Banner Title Header */}
      <div className="bg-gradient-to-r from-[#264939] via-[#1c382b] to-[#12261d] text-white p-6 sm:p-7 rounded-3xl shadow-sm border border-[#264939]/40 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C29B38]/20 text-[#C29B38] text-xs font-bold border border-[#C29B38]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HỘI ĐỒNG THẨM ĐỊNH OCOP TỈNH THỪA THIÊN HUẾ</span>
          </div>
          <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-amber-100 leading-tight">
            Thẩm Định & Cấp Chứng Nhận OCOP On-Chain
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 font-sans">
            Thẩm định chất lượng đặc sản Cố Đô Huế, xếp hạng sao OCOP chính thức và mã hóa chứng nhận lên Blockchain Sepolia Testnet.
          </p>
        </div>

        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xs flex items-center gap-3 shrink-0">
          <Award className="w-8 h-8 text-[#C29B38]" />
          <div>
            <span className="text-[10px] text-emerald-200 uppercase font-bold block">
              Thẩm Định Viên
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {currentAccount ? `${currentAccount.slice(0, 8)}...${currentAccount.slice(-4)}` : 'Chưa kết nối ví'}
            </span>
          </div>
        </div>
      </div>

      {/* Step Indicator Banner */}
      <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E6E1D7] flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
        <span className="font-bold text-[#264939] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#C29B38]" />
          Quy Trình Chuỗi Cung Ứng On-Chain:
        </span>
        <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] font-bold">
          <span className="text-[#5E7166]">1. Khai Báo Lô</span>
          <span className="text-[#8A9D92]">→</span>
          <span className="px-2.5 py-1 rounded-lg bg-[#264939] text-white shadow-2xs">2. Thẩm Định OCOP</span>
          <span className="text-[#8A9D92]">→</span>
          <span className="text-[#5E7166]">3. Vận Chuyển</span>
          <span className="text-[#8A9D92]">→</span>
          <span className="text-[#5E7166]">4. Quản Lý Niêm Yết</span>
        </div>
      </div>

      {/* Chi hien thi chuc nang Kiem dinh OCOP khi da ket noi vi */}
      {!currentAccount ? (
        <div className="bg-white p-10 sm:p-12 rounded-3xl border-2 border-dashed border-[#E6E1D7] text-center space-y-4 font-sans shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-[#8C6D1F] flex items-center justify-center mx-auto border border-amber-200">
            <Award className="w-8 h-8 text-[#C29B38]" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-serif font-extrabold text-[#264939]">
              Yêu Cầu Kết Nối Ví Để Thẩm Định OCOP
            </h3>
            <p className="text-xs text-[#5E7166] leading-relaxed">
              Vui lòng kết nối ví MetaMask có quyền Kiểm Định Viên OCOP (ROLE_INSPECTOR) để xem thông tin chi tiết và thực hiện thẩm định & cấp chứng nhận On-Chain.
            </p>
          </div>
          {onConnectWallet && (
            <button
              onClick={onConnectWallet}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#C29B38] text-white font-sans font-bold text-xs hover:bg-[#8C6D1F] transition-all shadow-md mt-2"
            >
              <Wallet className="w-4 h-4 text-white" />
              <span>Kết Nối Ví MetaMask Ngay</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cot Trai (7/12): Form Tham Dinh */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#E6E1D7] shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#E0ECE4] text-[#264939] border border-[#CCD8CF]">
                  <ShieldCheck className="w-5 h-5 text-[#C29B38]" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-extrabold text-[#264939]">
                    Biểu Mẫu Thẩm Định & Đánh Giá
                  </h3>
                  <p className="text-xs text-[#5E7166]">
                    Chọn lô hàng, xếp hạng sao và nhập ghi chú thẩm định chính thức
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#E0ECE4] text-[#264939] border border-[#CCD8CF]">
                ROLE_INSPECTOR
              </span>
            </div>

            {/* Fee Paid Status Banner */}
            <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E6E1D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-[#1A2820] block">Phí Thẩm Định Gộp On-Chain:</span>
                  <span className="text-[11px] text-[#5E7166]">Đã được Cơ sở sản xuất chi trả khi tạo lô (0.002 ETH)</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px] border border-emerald-200 shrink-0 text-center">
                0.002 ETH Đã Thu
              </span>
            </div>

            <form onSubmit={handleVerify} className="space-y-5 font-sans">
              {/* Field 1: Select Batch */}
              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1.5 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#264939]" />
                  <span>Chọn Lô Hàng Cần Thẩm Định *</span>
                </label>
                <select
                  value={selectedBatchCode}
                  onChange={(e) => setSelectedBatchCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E6E1D7] text-xs font-mono font-bold focus:outline-none focus:border-[#264939] bg-[#FAF9F5] text-[#1A2820] shadow-inner"
                >
                  {batchList.length > 0 ? (
                    batchList.map((batch) => (
                      <option key={batch.batchCode} value={batch.batchCode}>
                        {batch.batchCode} — {batch.productName} [{batch.isVerified ? 'Đã Cấp OCOP' : 'Chờ Thẩm Định'}]
                      </option>
                    ))
                  ) : (
                    <option value="">Chưa có sản phẩm nào trên Blockchain</option>
                  )}
                </select>
              </div>

              {/* Field 2: Select Star Rating Cards */}
              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1.5 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#C29B38]" />
                  <span>Xếp Hạng Sao OCOP Thừa Thiên Huế *</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { val: '3', label: '3 Sao OCOP', stars: '⭐⭐⭐', desc: 'Đạt chuẩn chất lượng cấp Tỉnh' },
                    { val: '4', label: '4 Sao OCOP', stars: '⭐⭐⭐⭐', desc: 'Chất lượng cao, tiềm năng Quốc gia' },
                    { val: '5', label: '5 Sao OCOP', stars: '⭐⭐⭐⭐⭐', desc: 'Đặc sản Cấp Quốc Gia' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.val}
                      onClick={() => setStarRating(item.val)}
                      className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 relative ${
                        starRating === item.val
                          ? 'border-[#C29B38] bg-amber-50/80 ring-2 ring-[#C29B38]/40 shadow-xs'
                          : 'border-[#E6E1D7] bg-[#FAF9F5] hover:border-[#264939]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-[#264939] font-serif">{item.label}</span>
                        {starRating === item.val && (
                          <CheckCircle2 className="w-4 h-4 text-[#C29B38]" />
                        )}
                      </div>
                      <div className="text-xs">{item.stars}</div>
                      <p className="text-[10px] text-[#5E7166] leading-tight pt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Inspector Notes */}
              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#264939]" />
                  <span>Nội Dung / Nhận Xét Thẩm Định Chính Thức *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={inspectorNote}
                  onChange={(e) => setInspectorNote(e.target.value)}
                  placeholder="Nhập ghi chú thẩm định (Ví dụ: Sản phẩm đạt chuẩn an toàn vệ sinh thực phẩm, quy trình sản xuất truyền thống Cố Đô Huế đạt tiêu chuẩn OCOP 4 sao tỉnh Thừa Thiên Huế...)"
                  className="w-full px-4 py-3 rounded-2xl border border-[#E6E1D7] text-xs focus:outline-none focus:border-[#264939] bg-white placeholder:text-[#8A9D92]"
                />
              </div>

              {/* Gas Note */}
              <div className="text-[11px] text-[#5E7166] bg-[#FAF9F5] p-3 rounded-2xl border border-[#EDE9E0] flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#C29B38] shrink-0" />
                <span>
                  ⚡ <strong>Lưu ý Kiểm Định Viên:</strong> Thao tác ký duyệt OCOP <strong>KHÔNG MẤT PHÍ THẨM ĐỊNH (0 ETH)</strong>. Bạn chỉ cần trả một lượng nhỏ gas Sepolia để ghi nhận chữ ký lên Smart Contract.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-[#EDE9E0] flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedBatch || selectedBatch?.isVerified || !isInspectorRole}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C29B38] to-[#a38029] text-white font-sans font-extrabold text-xs hover:opacity-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>
                    {selectedBatch?.isVerified ? 'Lô Hàng Đã Đạt OCOP' : 'Ký Xác Nhận & Cấp OCOP On-Chain'}
                  </span>
                </button>
              </div>
            </form>

            {/* Revoke OCOP Section if verified */}
            {selectedBatch?.isVerified && (
              <div className="pt-4 border-t border-red-200 bg-red-50/60 p-4.5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                  <span>Thu Hồi Chứng Nhận OCOP (Nếu Phát Hiện Vi Phạm)</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="Nhập lý do thu hồi chứng nhận OCOP..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-red-200 text-xs focus:outline-none focus:border-red-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleRevoke}
                    disabled={isSubmitting || !revokeReason || !isInspectorRole}
                    className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-all shrink-0 disabled:opacity-50"
                  >
                    Xác Nhận Thu Hồi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cot Phai (5/12): Tat Ca Thong Tin Tao Lo Hang & Trang Thai OCOP */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#E6E1D7] shadow-2xs space-y-5">
            {selectedBatch ? (
              <div className="space-y-4 font-sans">
                <div className="pb-3 border-b border-[#EDE9E0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#8A9D92] uppercase tracking-wider block">
                      TẤT CẢ THÔNG TIN TẠO LÔ HÀNG
                    </span>
                    <div className="font-mono text-sm sm:text-base font-extrabold text-[#264939] mt-0.5">
                      {selectedBatch.batchCode}
                    </div>
                  </div>
                  <Package className="w-6 h-6 text-[#C29B38]" />
                </div>

                {/* Full Specialty Product Image Preview Box */}
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E6E1D7] space-y-3 text-center shadow-inner">
                  <div className="relative overflow-hidden rounded-2xl bg-white border border-[#EDE9E0] p-2 flex items-center justify-center">
                    <img
                      src={selectedBatch.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
                      alt={selectedBatch.productName}
                      className="max-h-48 w-full object-contain rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-extrabold text-lg text-[#1A2820]">
                      {selectedBatch.productName}
                    </h4>
                    <span className="text-[10px] font-bold text-[#264939] bg-[#E0ECE4] px-2.5 py-0.5 rounded-full border border-[#CCD8CF] inline-block mt-1">
                      Ảnh Sản Phẩm Mặc Định Từ CS SX
                    </span>
                  </div>
                </div>

                {/* Verification Status Card */}
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E6E1D7] space-y-2">
                  <span className="text-[10px] font-bold text-[#8A9D92] uppercase block">
                    TRẠNG THÁI KIỂM ĐỊNH OCOP:
                  </span>
                  {selectedBatch.isVerified ? (
                    <div className="space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 bg-amber-100 text-[#8C6D1F] border border-amber-300 px-3.5 py-1 rounded-full text-xs font-extrabold shadow-2xs">
                        <ShieldCheck className="w-4 h-4 text-[#C29B38]" />
                        <span>ĐÃ CẤP CHỨNG NHẬN OCOP</span>
                      </span>
                      {selectedBatch.starRating && (
                        <div className="text-xs font-bold text-[#C29B38] flex items-center gap-1 pt-0.5">
                          <Star className="w-3.5 h-3.5 fill-[#C29B38]" />
                          <span>Hạng {selectedBatch.starRating} Sao OCOP Thừa Thiên Huế</span>
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

                {/* Complete Batch Creation Attributes List */}
                <div className="space-y-2 text-xs text-[#5E7166]">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                    <span className="font-medium flex items-center gap-1.5 text-[11px]">
                      <Package className="w-3.5 h-3.5 text-[#264939] shrink-0" />
                      <span>Tên Đặc Sản Khai Báo:</span>
                    </span>
                    <strong className="text-[#1A2820] font-serif font-bold truncate max-w-[160px]">
                      {selectedBatch.productName}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                    <span className="font-medium flex items-center gap-1.5 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#264939] shrink-0" />
                      <span>Địa Danh / Nguồn Gốc:</span>
                    </span>
                    <strong className="text-[#1A2820] truncate max-w-[160px]">
                      {selectedBatch.origin || 'Thừa Thiên Huế'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                    <span className="font-medium flex items-center gap-1.5 text-[11px]">
                      <UserCheck className="w-3.5 h-3.5 text-[#264939] shrink-0" />
                      <span>Ví CS SX (Producer):</span>
                    </span>
                    <a
                      href={`${ETHERSCAN_BASE_URL}/address/${selectedBatch.producer}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-emerald-800 font-bold hover:underline flex items-center gap-1 truncate max-w-[140px]"
                    >
                      <span>{selectedBatch.producer ? `${selectedBatch.producer.slice(0, 6)}...${selectedBatch.producer.slice(-4)}` : 'Chưa cập nhật'}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                    <span className="font-medium flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#264939] shrink-0" />
                      <span>Thời Gian Khởi Tạo:</span>
                    </span>
                    <strong className="text-[#1A2820] font-mono text-[11px]">
                      {selectedBatch.createdAt ? new Date(selectedBatch.createdAt * 1000).toLocaleString('vi-VN') : 'Vừa tạo'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                    <span className="font-medium flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#264939] shrink-0" />
                      <span>Ngày Sản Xuất (NSX):</span>
                    </span>
                    <strong className="text-[#1A2820] font-mono text-[11px]">
                      {selectedBatch.productionDate || new Date(selectedBatch.createdAt * 1000).toLocaleDateString('vi-VN')}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                    <span className="font-medium flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-[#C29B38] shrink-0" />
                      <span>Hạn Sử Dụng (HSD):</span>
                    </span>
                    <strong className="text-[#8C6D1F] font-mono text-[11px]">
                      {selectedBatch.expiryDate || new Date((selectedBatch.createdAt + 180 * 86400) * 1000).toLocaleDateString('vi-VN')}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                    <span className="font-medium flex items-center gap-1.5 text-[11px]">
                      <Coins className="w-3.5 h-3.5 text-[#C29B38] shrink-0" />
                      <span>Phí Tạo Lô + Phí Thẩm Định:</span>
                    </span>
                    <strong className="text-emerald-800 font-mono text-[11px]">
                      0.003 ETH (Đã thanh toán)
                    </strong>
                  </div>

                  {selectedBatch.checkpoints?.[0]?.metadataURI && (
                    <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0] space-y-1">
                      <span className="font-medium flex items-center gap-1.5 text-[10px] text-[#8A9D92]">
                        <FileText className="w-3.5 h-3.5 text-[#264939] shrink-0" />
                        <span>METADATA URI ON-CHAIN:</span>
                      </span>
                      <div className="font-mono text-[10px] text-[#264939] truncate bg-white p-1.5 rounded-lg border border-[#EDE9E0]">
                        {selectedBatch.checkpoints[0].metadataURI}
                      </div>
                    </div>
                  )}

                  {selectedBatch.txHash && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EDE9E0]">
                      <span className="font-medium flex items-center gap-1.5 text-[11px]">
                        <ExternalLink className="w-3.5 h-3.5 text-[#C29B38] shrink-0" />
                        <span>Mã Băm Tạo Lô (Tx Hash):</span>
                      </span>
                      <a
                        href={`${ETHERSCAN_BASE_URL}/tx/${selectedBatch.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-[#264939] hover:underline font-bold truncate max-w-[130px]"
                      >
                        {`${selectedBatch.txHash.slice(0, 8)}...${selectedBatch.txHash.slice(-4)}`}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF9F5] p-8 rounded-2xl border border-dashed border-[#E6E1D7] text-center text-xs text-gray-400">
                Chưa có lô hàng nào trên Blockchain.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

