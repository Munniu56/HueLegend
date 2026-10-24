import React, { useState } from 'react';
import { Batch } from '../types';
import {
  Package,
  ShieldCheck,
  Coins,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  QrCode,
  Sparkles,
  MapPin,
  Calendar,
  Building2
} from 'lucide-react';
import { ETHERSCAN_BASE_URL } from '../constants';

interface OverviewTabProps {
  batches: Record<string, Batch>;
  producerStakeBalance: string;
  onNavigateTab: (tab: string, batchCodeSelect?: string) => void;
  onSelectBatchForQR: (batchCode: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  batches,
  producerStakeBalance,
  onNavigateTab,
  onSelectBatchForQR,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');

  const batchList = Object.values(batches);
  const totalBatches = batchList.length;
  const verifiedCount = batchList.filter((b) => b.isVerified).length;
  const verifiedRatio = totalBatches > 0 ? Math.round((verifiedCount / totalBatches) * 100) : 0;
  const totalCheckpoints = batchList.reduce((acc, b) => acc + (b.checkpoints?.length || 0), 0);

  const filteredBatches = batchList.filter((batch) => {
    const matchesSearch =
      batch.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.origin.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterVerified === 'VERIFIED') return matchesSearch && batch.isVerified;
    if (filterVerified === 'PENDING') return matchesSearch && !batch.isVerified;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Imperial Hue Motif */}
      <div className="relative bg-gradient-to-r from-[#264939] via-[#1c372b] to-[#12251c] text-white rounded-3xl p-8 shadow-xl overflow-hidden border border-[#CCD8CF]/20">
        <img
          src="/assets/hue_landscape_banner.png"
          alt="Huế Landscape"
          className="absolute right-0 top-0 bottom-0 w-1/2 object-cover opacity-20 pointer-events-none mix-blend-overlay"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C29B38]/20 text-[#C29B38] text-xs font-bold border border-[#C29B38]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nền Tảng Quản Trị & Minh Bạch Chuỗi Cung Ứng Đặc Sản Cố Đô</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-white font-serif">
            Hệ Thống Truy Xuất Nguồn Gốc Đặc Sản Huế
          </h1>

          <p className="text-emerald-100/90 text-sm leading-relaxed">
            Số hóa minh bạch 100% từng chặng chăn nuôi, chế biến, vận chuyển kho lạnh và phân phối OCOP.
            Bảo vệ thương hiệu di sản và quyền lợi tiêu dùng trên Blockchain Sepolia.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('create-batch')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C29B38] text-white font-bold text-xs hover:bg-[#8C6D1F] transition-all shadow-md"
            >
              <span>+ Tạo Lô Hàng Mới</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('lookup')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all border border-white/20"
            >
              <QrCode className="w-4 h-4" />
              <span>Tra Cứu / Quét Mã QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E0ECE4] text-[#264939] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#8A9D92] uppercase">Tổng Lô Hàng On-Chain</div>
            <div className="text-2xl font-extrabold text-[#264939] mt-0.5">{totalBatches}</div>
            <div className="text-[11px] text-[#5E7166] mt-0.5">Lô đặc sản đã tạo</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C29B38] flex items-center justify-center shrink-0 border border-amber-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#8A9D92] uppercase">Xác Nhận Đạt OCOP</div>
            <div className="text-2xl font-extrabold text-[#C29B38] mt-0.5">
              {verifiedCount} <span className="text-xs font-normal text-gray-500">({verifiedRatio}%)</span>
            </div>
            <div className="text-[11px] text-[#5E7166] mt-0.5">Đã kiểm định chất lượng</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#8A9D92] uppercase">Tiền Ký Quỹ Producer</div>
            <div className="text-2xl font-extrabold text-[#264939] mt-0.5">{producerStakeBalance} ETH</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Đã đặt cọc đảm bảo uy tín</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#8A9D92] uppercase">Tổng Chặng Ghi Nhận</div>
            <div className="text-2xl font-extrabold text-[#1A2820] mt-0.5">{totalCheckpoints}</div>
            <div className="text-[11px] text-[#5E7166] mt-0.5">Nhật ký chuỗi cung ứng</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6E1D7] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã lô (HL-...), Tên đặc sản, hoặc Địa danh..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm focus:outline-none focus:border-[#264939] bg-[#FAF9F5]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5E7166]" />
          <span className="text-xs font-bold text-[#5E7166]">Trạng thái:</span>
          <div className="inline-flex p-1 bg-[#FAF9F5] border border-[#E6E1D7] rounded-xl">
            <button
              onClick={() => setFilterVerified('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterVerified === 'ALL'
                  ? 'bg-[#264939] text-white shadow-xs'
                  : 'text-[#5E7166] hover:text-[#264939]'
              }`}
            >
              Tất cả ({totalBatches})
            </button>
            <button
              onClick={() => setFilterVerified('VERIFIED')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterVerified === 'VERIFIED'
                  ? 'bg-[#C29B38] text-white shadow-xs'
                  : 'text-[#5E7166] hover:text-[#264939]'
              }`}
            >
              Đã OCOP ({verifiedCount})
            </button>
            <button
              onClick={() => setFilterVerified('PENDING')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterVerified === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-[#5E7166] hover:text-[#264939]'
              }`}
            >
              Chờ Kiểm Định ({totalBatches - verifiedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Batch Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => {
          const checkpointCount = batch.checkpoints?.length || 0;
          const createdDate = new Date(batch.createdAt * 1000).toLocaleDateString('vi-VN');

          return (
            <div
              key={batch.batchCode}
              className="bg-white rounded-2xl border border-[#E6E1D7] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EDE9E0]">
                  <div>
                    <span className="inline-block font-mono text-xs font-extrabold text-[#264939] bg-[#E0ECE4] px-2.5 py-0.5 rounded-lg border border-[#CCD8CF]">
                      {batch.batchCode}
                    </span>
                    <h3 className="font-extrabold text-base text-[#1A2820] mt-1.5 group-hover:text-[#264939] transition-colors leading-snug">
                      {batch.productName}
                    </h3>
                  </div>

                  {batch.isVerified ? (
                    <span className="shrink-0 flex items-center gap-1 text-[11px] font-extrabold bg-amber-50 text-[#8C6D1F] border border-amber-200 px-2.5 py-1 rounded-full shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C29B38]" />
                      <span>ĐẠT OCOP</span>
                    </span>
                  ) : (
                    <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Chờ Duyệt</span>
                    </span>
                  )}
                </div>

                {/* Info Metadata */}
                <div className="py-3 space-y-2 text-xs text-[#3B4D43]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#5E7166] shrink-0" />
                    <span className="truncate">{batch.origin}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#5E7166] shrink-0" />
                    <span className="font-medium">Tiêu chuẩn: {batch.ocopStandard || 'Đang cập nhật'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#5E7166] shrink-0" />
                    <span>Khởi tạo: {createdDate}</span>
                  </div>
                </div>

                {/* Progress Checkpoint Pill */}
                <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EDE9E0] text-xs">
                  <div className="flex items-center justify-between text-[#5E7166] font-semibold mb-1">
                    <span>Số chặng ghi nhận:</span>
                    <span className="font-bold text-[#264939]">{checkpointCount} chặng</span>
                  </div>
                  <div className="text-[11px] text-[#8A9D92] truncate">
                    Giai đoạn hiện tại: <span className="font-bold text-[#1A2820]">{batch.currentStage || 'Xưởng sản xuất'}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 mt-4 border-t border-[#EDE9E0] flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectBatchForQR(batch.batchCode)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#264939] hover:text-[#1c372b] p-1 rounded-lg hover:bg-[#E0ECE4] transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Tem QR Stamp</span>
                </button>

                <button
                  onClick={() => onNavigateTab('lookup', batch.batchCode)}
                  className="flex items-center gap-1 text-xs font-bold text-white bg-[#264939] px-3 py-1.5 rounded-xl hover:bg-[#1c372b] transition-all shadow-2xs"
                >
                  <span>Xem Chi Tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBatches.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-[#E6E1D7] text-center space-y-3">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-[#1A2820]">Không Tìm Thấy Lô Hàng Phù Hợp</h3>
          <p className="text-xs text-[#5E7166]">
            Hãy thử tìm bằng từ khóa khác hoặc bấm nút Tạo Lô Hàng mới.
          </p>
        </div>
      )}
    </div>
  );
};
