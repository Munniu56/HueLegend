import React from 'react';
import { Batch } from '../types';
import {
  X,
  ShieldCheck,
  Award,
  GripHorizontal,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Clock,
  Star,
  UserCheck,
  Building2,
  Package
} from 'lucide-react';
import { useDraggable } from '../hooks/useDraggable';
import { ETHERSCAN_BASE_URL } from '../constants';

interface BatchJourneyModalProps {
  batch: Batch | null;
  onClose: () => void;
}

export const BatchJourneyModal: React.FC<BatchJourneyModalProps> = ({ batch, onClose }) => {
  const { position, isDragging, dragHeaderProps } = useDraggable(Boolean(batch));

  if (!batch) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in font-sans overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.05s ease-out',
        }}
        className="bg-white rounded-3xl border border-[#E6E1D7] max-w-2xl w-full max-h-[85vh] p-6 space-y-6 shadow-2xl relative overflow-y-auto"
      >
        {/* Top Header with Drag Handle */}
        <div
          {...dragHeaderProps}
          className="flex items-center justify-between pb-4 border-b border-[#EDE9E0] select-none touch-none"
          title="Nắm giữ và kéo để di chuyển popup"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-[#FAF9F5] border border-[#E6E1D7] text-[#8A9D92] hover:text-[#264939] transition-colors">
              <GripHorizontal className="w-4 h-4" />
            </div>
            <Award className="w-5 h-5 text-[#C29B38] pointer-events-none" />
            <h3 className="font-serif font-extrabold text-lg sm:text-xl text-[#264939] pointer-events-none">
              Nhật Ký Hành Trình Supply Chain On-Chain
            </h3>
          </div>
          <button
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#E0ECE4] text-gray-500 hover:text-[#264939] transition-colors border border-[#EDE9E0]"
            title="Đóng popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Identity Summary Card */}
        <div className="bg-gradient-to-r from-[#FAF9F5] via-white to-[#E0ECE4]/30 p-5 rounded-2xl border border-[#E6E1D7] space-y-4 shadow-2xs">
          <div className="flex items-start gap-4">
            <img
              src={batch.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
              alt={batch.productName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[#EDE9E0] shadow-2xs shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
              }}
            />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-extrabold text-[#264939] bg-[#E0ECE4] px-2.5 py-0.5 rounded-lg border border-[#CCD8CF]">
                  {batch.batchCode}
                </span>

                {batch.isVerified ? (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-[#8C6D1F] border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C29B38]" />
                    <span>OCOP {batch.starRating || '4'} SAO</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chờ Thẩm Định</span>
                  </span>
                )}
              </div>

              <h4 className="font-serif font-extrabold text-lg sm:text-xl text-[#1A2820] leading-snug">
                {batch.productName}
              </h4>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5E7166]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C29B38]" />
                  <span>{batch.origin || 'Thừa Thiên Huế'}</span>
                </span>

                {batch.isVerified && batch.certificationNo && (
                  <span className="inline-flex items-center gap-1 font-semibold text-[#264939]">
                    <Building2 className="w-3.5 h-3.5 text-[#264939]" />
                    <span>Số: {batch.certificationNo}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* OCOP Certification Star Note if verified */}
          {batch.isVerified && (
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-1 text-[#8C6D1F] font-bold">
                {Array.from({ length: Number(batch.starRating || '4') }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C29B38] text-[#C29B38]" />
                ))}
                <span>Đạt Chứng Nhận OCOP {batch.starRating || '4'} Sao Tỉnh Thừa Thiên Huế</span>
              </div>
              {batch.inspectorNote && (
                <p className="text-[#1A2820] italic font-serif text-[11px]">
                  "{batch.inspectorNote}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Detailed Timeline Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EDE9E0]">
            <h4 className="font-serif font-extrabold text-base text-[#264939] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C29B38]" />
              <span>Nhật Ký Hành Trình Chặng On-Chain</span>
            </h4>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E0ECE4] text-[#264939] border border-[#CCD8CF]">
              {batch.checkpoints?.length || 0} Chặng Đã Lưu
            </span>
          </div>

          {/* Vertical Timeline Node List */}
          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#CCD8CF]">
            {batch.checkpoints && batch.checkpoints.length > 0 ? (
              batch.checkpoints.map((cp, idx) => {
                const dateStr = cp.timestamp ? new Date(cp.timestamp * 1000).toLocaleString('vi-VN') : 'Vừa khởi tạo';

                return (
                  <div key={idx} className="relative group font-sans">
                    {/* Circle Node Indicator */}
                    <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-[#264939] border-4 border-white shadow-sm flex items-center justify-center text-white text-[9px] font-bold font-mono">
                      {idx + 1}
                    </div>

                    <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E6E1D7] space-y-2.5 hover:border-[#264939] transition-all shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-[#EDE9E0]">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C29B38]">
                            {cp.roleTitle || cp.role}
                          </span>
                          <h5 className="font-serif font-extrabold text-sm sm:text-base text-[#1A2820]">
                            {cp.stepName}
                          </h5>
                        </div>
                        <span className="text-[11px] font-medium text-[#8A9D92] bg-white px-2.5 py-0.5 rounded-lg border border-[#EDE9E0]">
                          {dateStr}
                        </span>
                      </div>

                      {/* Location & Detailed Action */}
                      <div className="space-y-1.5 text-xs text-[#3B4D43]">
                        <div className="flex items-center gap-1.5 text-[#264939] font-bold">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{cp.location}</span>
                        </div>

                        <p className="leading-relaxed text-[#1A2820] bg-white p-2.5 rounded-xl border border-[#EDE9E0]">
                          {cp.action}
                        </p>

                        {cp.conditionNote && (
                          <div className="text-[11px] text-[#5E7166] flex items-center gap-1.5 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{cp.conditionNote}</span>
                          </div>
                        )}
                      </div>

                      {/* On-Chain Verification Footer with Etherscan Link */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8A9D92] border-t border-[#EDE9E0]">
                        <div className="font-mono text-[#1A2820] flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-[#264939]" />
                          <span>Ví ghi: {cp.recorder ? `${cp.recorder.slice(0, 8)}...${cp.recorder.slice(-4)}` : '0x...'}</span>
                        </div>

                        {cp.txHash && (
                          <a
                            href={`${ETHERSCAN_BASE_URL}/tx/${cp.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#264939] font-bold hover:underline"
                          >
                            <span>Etherscan Sepolia</span>
                            <ExternalLink className="w-3 h-3 text-[#C29B38]" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-gray-400 italic">
                Chưa có lịch sử chặng nào được ghi nhận.
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-3 border-t border-[#EDE9E0] flex justify-end font-sans">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#264939] text-white text-xs font-bold hover:bg-[#1c372b] transition-all shadow-md"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
