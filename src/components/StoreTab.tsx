import React from 'react';
import { Store, QrCode, ShoppingBag, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { Batch } from '../types';

interface StoreTabProps {
  batches: Record<string, Batch>;
  onNavigateToLookup: (batchCode: string) => void;
}

export const StoreTab: React.FC<StoreTabProps> = ({ batches, onNavigateToLookup }) => {
  const batchList = Object.values(batches);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#264939] via-[#1c372b] to-[#264939] text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 border border-white/20 text-xs font-semibold backdrop-blur-xs">
            <Store className="w-3.5 h-3.5 text-[#C29B38]" />
            <span>Kênh Phân Phối Cửa Hàng Đặc Sản OCOP Huế</span>
          </div>

          <h2 className="font-serif font-extrabold text-2xl md:text-3xl tracking-tight text-amber-100">
            Cửa Hàng Đặc Sản Cố Đô
          </h2>

          <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-sans">
            Kênh điểm bán niêm phong sản phẩm đạt chuẩn OCOP Thừa Thiên Huế. Khách hàng quét tem QR trực tiếp tại điểm bán để kiểm tra chứng nhận & nguồn gốc Blockchain.
          </p>
        </div>
      </div>

      {/* Product Batches Display In Store */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6E1D7] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E0]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#264939]" />
            <h3 className="font-serif font-extrabold text-lg text-[#264939]">
              Sản Phẩm Đang Kệ Phân Phối On-Chain
            </h3>
          </div>
          <span className="text-xs font-bold text-[#8A9D92]">
            Tổng số: {batchList.length} lô hàng
          </span>
        </div>

        {batchList.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF9F5] rounded-2xl border border-[#EDE9E0] space-y-2">
            <Tag className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-bold text-[#264939]">Chưa Có Lô Hàng On-Chain Trong Kho Cửa Hàng</p>
            <p className="text-xs text-gray-500">
              Vui lòng kết nối ví tạo lô hàng đặc sản trên mạng Sepolia Testnet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batchList.map((batch) => (
              <div
                key={batch.batchCode}
                className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D7] space-y-3 hover:border-[#264939] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      MÃ LÔ: {batch.batchCode}
                    </span>
                    <h4 className="font-serif font-extrabold text-base text-[#1A2820] mt-1">
                      {batch.productName}
                    </h4>
                  </div>
                  {batch.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      <span>Đạt Chuẩn OCOP</span>
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#5E7166] space-y-1 bg-white p-3 rounded-xl border border-[#EDE9E0]">
                  <div className="flex justify-between">
                    <span>Nguồn gốc sản xuất:</span>
                    <span className="font-bold text-[#1A2820]">{batch.origin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái hiện tại:</span>
                    <span className="font-bold text-[#264939]">{batch.currentStage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số chặng ghi nhận:</span>
                    <span className="font-mono font-bold text-amber-800">{batch.checkpoints.length} chặng</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#8A9D92] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#C29B38]" />
                    <span>Xác thực niêm phong On-Chain</span>
                  </span>
                  <button
                    onClick={() => onNavigateToLookup(batch.batchCode)}
                    className="px-3 py-1.5 bg-[#264939] text-white rounded-xl text-xs font-bold hover:bg-[#1c372b] transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Quét Tra Cứu</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
