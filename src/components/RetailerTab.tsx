import React, { useState } from 'react';
import { Store, Tag, Package, AlertTriangle, Wallet, ArrowDownRight, Image as ImageIcon, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Batch } from '../types';

interface RetailerTabProps {
  batches: Record<string, Batch>;
  isRetailerRole: boolean;
  currentAccount: string | null;
  contractBalanceEth?: string;
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
  onWithdrawEarnings?: () => Promise<void>;
}

export const RetailerTab: React.FC<RetailerTabProps> = ({
  batches,
  isRetailerRole,
  currentAccount,
  contractBalanceEth = '0.00',
  onConnectWallet,
  onAddCheckpoint,
  onWithdrawEarnings,
}) => {
  const batchList = Object.values(batches);
  // Loc danh sach cac lo hang da dat chung nhan OCOP
  const verifiedBatches = batchList.filter((b) => b.isVerified);

  const [selectedBatchCode, setSelectedBatchCode] = useState(verifiedBatches[0]?.batchCode || '');
  const [storeName, setStoreName] = useState('');
  const [listingPriceEth, setListingPriceEth] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [listedPrices, setListedPrices] = useState<Record<string, { price: string; store: string; stock: string; sellerAddr: string }>>({});

  const selectedBatch = batches[selectedBatchCode];

  // Mac dinh lay anh dac san cua don vi tao lo hang
  const defaultProductImageUrl = selectedBatch?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';

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

  const handleWithdrawRevenue = async () => {
    if (!currentAccount) {
      onConnectWallet();
      return;
    }
    if (!onWithdrawEarnings) return;

    setIsWithdrawing(true);
    try {
      await onWithdrawEarnings();
    } catch (err) {
      console.error(err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Grid bo cuc 2 cot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cot trai: Form Niem Yet & Preview Anh Dac San */}
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
              Dành cho các Đại lý & Cửa hàng đặc sản. Bất kỳ cửa hàng nào cũng có thể chọn lô hàng đã đạt chứng nhận <strong>Kiểm Định OCOP</strong> để nhập kho, thiết lập giá niêm yết On-Chain và đăng tải lên Cửa hàng đặc sản mà không cần Admin cấp quyền trước. <em>Doanh thu từ giao dịch mua hàng sẽ tự động được Smart Contract lưu giữ và chuyển về ví của cửa hàng thực hiện niêm yết khi rút.</em>
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

              {/* Muc Anh San Pham mac dinh tu Don Vi Tao Lo Hang */}
              {selectedBatch && (
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D7] space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#EDE9E0]">
                    <ImageIcon className="w-4 h-4 text-[#264939]" />
                    <span className="text-xs font-bold text-[#264939]">
                      Ảnh Sản Phẩm (Mặc Định Từ Đơn Vị Tạo Lô Hàng)
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={defaultProductImageUrl}
                      alt={selectedBatch.productName}
                      className="w-28 h-28 object-cover rounded-xl border border-[#EDE9E0] shadow-2xs shrink-0"
                    />
                    <div className="space-y-1.5 text-xs text-[#5E7166] flex-1">
                      <div className="font-bold text-[#1A2820] text-sm font-serif">
                        {selectedBatch.productName}
                      </div>
                      <div>
                        <span className="text-[#8A9D92]">Mã Lô: </span>
                        <strong className="font-mono text-[#264939]">{selectedBatch.batchCode}</strong>
                      </div>
                      <div>
                        <span className="text-[#8A9D92]">Đơn Vị Khởi Tạo: </span>
                        <strong className="font-mono text-xs">{selectedBatch.producer ? `${selectedBatch.producer.slice(0, 8)}...${selectedBatch.producer.slice(-6)}` : 'Chưa cập nhật'}</strong>
                      </div>
                      <div>
                        <span className="text-[#8A9D92]">Nguồn Gốc: </span>
                        <strong className="text-[#1A2820]">{selectedBatch.origin}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

        {/* Cot phai: So Du ETH Trong Smart Contract & Danh Sach Niem Yet */}
        <div className="space-y-6 font-sans">
          {/* Muc So Du ETH Khach Hang Mua San Pham Trong Smart Contract */}
          <div className="bg-gradient-to-br from-[#264939] to-[#1a3428] text-white p-5 rounded-3xl shadow-md border border-[#264939]/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#C29B38]" />
                <h3 className="font-serif font-extrabold text-sm text-[#FAF9F5]">
                  SỐ DƯ ETH KHÁCH HÀNG MUA SẢN PHẨM TRONG SMART CONTRACT
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#C29B38]/20 text-[#C29B38] border border-[#C29B38]/40">
                SEPOLIA
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#E0ECE4]/80">Doanh thu tích lũy từ khách hàng:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-extrabold text-amber-300">
                  {currentAccount ? contractBalanceEth : '0.00'}
                </span>
                <span className="text-xs font-mono font-bold text-[#E0ECE4]">ETH</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Tài khoản Đại lý đăng nhập:</span>
                <span className="font-mono text-emerald-300 font-bold truncate max-w-[140px]">
                  {currentAccount ? `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}` : 'Chưa kết nối ví'}
                </span>
              </div>
              <p className="text-[11px] text-white/60 leading-snug">
                {currentAccount
                  ? 'Ví này chỉ tự động nhận và tăng số dư ETH khi khách hàng thực hiện thanh toán mua sản phẩm. Chỉ đại lý sở hữu ví mới có quyền rút về ví cá nhân.'
                  : 'Chưa kết nối ví Đại lý. Vui lòng kết nối ví MetaMask để xem số dư tích lũy từ khách hàng thanh toán và thực hiện rút doanh thu.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleWithdrawRevenue}
              disabled={isWithdrawing}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C29B38] text-[#1A2820] font-sans font-extrabold text-xs hover:bg-[#b08c31] active:scale-[0.99] transition-all shadow-2xs flex items-center justify-center gap-2"
            >
              <ArrowDownRight className="w-4 h-4 text-[#1A2820]" />
              <span>{currentAccount ? 'Rút Doanh Thu Về Ví Đại Lý' : 'Kết Nối Ví Để Rút Doanh Thu'}</span>
            </button>
          </div>

          {/* Danh Sach Lo Hang Niem Yet */}
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
                      className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E6E1D7] space-y-2.5"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={batch.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
                          alt={batch.productName}
                          className="w-12 h-12 rounded-lg object-cover border border-[#EDE9E0] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 truncate">
                              {batch.batchCode}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                              InRetail
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-xs text-[#1A2820] mt-1 truncate">
                            {batch.productName}
                          </h4>
                        </div>
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

