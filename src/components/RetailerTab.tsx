import React, { useState } from 'react';
import { Store, Tag, Package, AlertTriangle, ShieldCheck, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { Batch } from '../types';

interface RetailerTabProps {
  batches: Record<string, Batch>;
  isRetailerRole: boolean;
  currentAccount: string | null;
  onConnectWallet: () => void;
  onAddCheckpoint?: (
    batchCode: string,
    role: string,
    location: string,
    action: string,
    metadataURI: string,
    stepName: string,
    conditionNote: string
  ) => Promise<void>;
}

export const RetailerTab: React.FC<RetailerTabProps> = ({
  batches,
  isRetailerRole,
  currentAccount,
  onConnectWallet,
  onAddCheckpoint,
}) => {
  const batchList = Object.values(batches);
  // Filter batches that have been OCOP verified
  const verifiedBatches = batchList.filter((b) => b.isVerified);

  const [selectedBatchCode, setSelectedBatchCode] = useState(verifiedBatches[0]?.batchCode || '');
  const [storeName, setStoreName] = useState('');
  const [listingPriceEth, setListingPriceEth] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listedPrices, setListedPrices] = useState<Record<string, { price: string; store: string; stock: string; sellerAddr: string }>>({});

  const selectedBatch = batches[selectedBatchCode];

  const handleListForSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchCode) return;

    setIsSubmitting(true);
    try {
      if (onAddCheckpoint) {
        await onAddCheckpoint(
          selectedBatchCode,
          'RETAILER',
          storeName,
          `Đã Nhập Kho & Niêm Yết Giá Bán (${listingPriceEth} ETH)`,
          'ipfs://QmHueRetailerListing2026',
          'Niêm Yết Bán Lẻ',
          `Giá niêm yết: ${listingPriceEth} ETH — Người bán (Retailer): ${currentAccount || 'Chưa xác định'}`
        );
      }

      setListedPrices((prev) => ({
        ...prev,
        [selectedBatchCode]: {
          price: listingPriceEth,
          store: storeName,
          stock: stockQuantity,
          sellerAddr: currentAccount || 'Ví Đại Lý Sepolia'
        }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Khong can banner RBAC vi Dai ly & Cua hang dac san duoc tu do niem yet gia */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Listing Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E6E1D7] shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E0]">
              <div className="flex items-center gap-2">
                <Store className="w-6 h-6 text-[#264939]" />
                <h2 className="text-xl font-serif font-extrabold text-[#264939]">
                  Quản Lý Niêm Yết Bán Lẻ
                </h2>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E0ECE4] text-[#264939] border border-[#CCD8CF]">
                ĐẠI LÝ & CỬA HÀNG ĐẶC SẢN
              </span>
            </div>

            <p className="text-xs text-[#5E7166] leading-relaxed">
              Dành cho các Đại lý & Cửa hàng đặc sản. Bất kỳ cửa hàng nào cũng có thể chọn lô hàng đã đạt chứng nhận <strong>Kiểm Định OCOP</strong> để nhập kho, thiết lập giá niêm yết On-Chain và đăng tải lên Cửa hàng đặc sản mà không cần Admin cấp quyền trước. <em>Doanh thu từ giao dịch mua hàng sẽ tự động được Smart Contract chuyển trực tiếp về ví của cửa hàng thực hiện niêm yết (msg.sender / seller).</em>
            </p>

            <form onSubmit={handleListForSale} className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1">
                  Chọn Lô Hàng Đã Thẩm Định OCOP *
                </label>
                <select
                  value={selectedBatchCode}
                  onChange={(e) => setSelectedBatchCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D7] text-xs font-mono font-bold focus:outline-none focus:border-[#264939] bg-[#FAF9F5]"
                >
                  {verifiedBatches.length > 0 ? (
                    verifiedBatches.map((batch) => (
                      <option key={batch.batchCode} value={batch.batchCode}>
                        {batch.batchCode} — {batch.productName} (Đã Đạt Chuẩn OCOP)
                      </option>
                    ))
                  ) : (
                    <option value="">Chưa có lô hàng nào đạt chuẩn OCOP</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1A2820] mb-1">
                    Địa Điểm Cửa Hàng / Điểm Bán *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ví dụ: Cửa Hàng Đặc Sản Cố Đô Huế - 12 Lê Lợi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D7] text-xs focus:outline-none focus:border-[#264939]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A2820] mb-1">
                    Giá Niêm Yết Bán Lẻ (Sepolia ETH) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      required
                      value={listingPriceEth}
                      onChange={(e) => setListingPriceEth(e.target.value)}
                      placeholder="Ví dụ: 0.002"
                      className="w-full px-3.5 py-2.5 pr-12 rounded-xl border border-[#E6E1D7] text-xs font-mono font-bold focus:outline-none focus:border-[#264939]"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-[#8A9D92]">
                      ETH
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A2820] mb-1">
                  Số Lượng Nhập Kho (Đơn Vị) *
                </label>
                <input
                  type="number"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="Ví dụ: 100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1D7] text-xs font-mono focus:outline-none focus:border-[#264939]"
                />
              </div>

              <div className="pt-3 border-t border-[#EDE9E0] flex items-center justify-between">
                <span className="text-[11px] text-[#8A9D92]">
                  Ví Nhận Doanh Thu: <strong className="font-mono text-[#264939]">{currentAccount ? `${currentAccount.slice(0, 8)}...${currentAccount.slice(-4)}` : 'Chưa kết nối ví'}</strong>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedBatch}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#264939] text-white font-sans font-bold text-xs hover:bg-[#1c372b] transition-all shadow-2xs disabled:opacity-50"
                >
                  <Tag className="w-4 h-4 text-[#C29B38]" />
                  <span>Xác Nhận Niêm Yết On-Chain</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Active Listings */}
        <div className="space-y-6 font-sans">
          <div className="bg-white p-5 rounded-3xl border border-[#E6E1D7] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E0]">
              <h3 className="font-serif font-extrabold text-base text-[#264939]">
                Trạng Thái Niêm Yết Lô Hàng
              </h3>
              <Package className="w-5 h-5 text-[#C29B38]" />
            </div>

            {verifiedBatches.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 bg-[#FAF9F5] rounded-2xl border border-[#EDE9E0] space-y-2">
                <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto" />
                <p className="font-bold text-[#264939]">Chưa có lô hàng OCOP sẵn sàng</p>
                <p>Cần Kiểm Định Viên cấp chứng nhận OCOP trước khi đại lý có thể niêm yết.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {verifiedBatches.map((batch) => {
                  const listingInfo = listedPrices[batch.batchCode];
                  return (
                    <div
                      key={batch.batchCode}
                      className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D7] space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                            {batch.batchCode}
                          </span>
                          <h4 className="font-serif font-bold text-sm text-[#1A2820] mt-1">
                            {batch.productName}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          InRetail
                        </span>
                      </div>

                      <div className="text-xs text-[#5E7166] space-y-1 bg-white p-2.5 rounded-xl border border-[#EDE9E0]">
                        <div className="flex justify-between">
                          <span>Giá bán niêm yết:</span>
                          <span className="font-mono font-bold text-[#264939]">
                            {listingInfo?.price || '0.002'} ETH
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tồn kho đại lý:</span>
                          <span className="font-mono font-bold text-amber-800">
                            {listingInfo?.stock || '100'} đơn vị
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span>Ví Retailer thụ hưởng:</span>
                          <span className="font-mono font-bold text-emerald-700 truncate max-w-[140px]">
                            {listingInfo?.sellerAddr || currentAccount?.slice(0, 10) || 'ROLE_RETAILER'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
