import React, { useState, useEffect } from 'react';
import { Batch } from '../types';
import {
  Search,
  QrCode,
  ShieldCheck,
  Building2,
  MapPin,
  ExternalLink,
  Printer,
  CheckCircle2,
  Clock,
  UserCheck,
  Camera,
  Layers,
  Package,
  Star,
  Award
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ETHERSCAN_BASE_URL } from '../constants';

interface LookupTabProps {
  batches: Record<string, Batch>;
  selectedBatchCode?: string;
  onOpenQRStampModal: (batchCode: string) => void;
}

export const LookupTab: React.FC<LookupTabProps> = ({
  batches,
  selectedBatchCode = '',
  onOpenQRStampModal,
}) => {
  const batchKeys = Object.keys(batches);
  const initialBatchCode = selectedBatchCode || batchKeys[0] || '';

  // Khoi tao searchCode="" de khong nhap san gia tri vao o tim kiem
  const [searchCode, setSearchCode] = useState('');
  const [activeBatch, setActiveBatch] = useState<Batch | null>(batches[initialBatchCode] || null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (selectedBatchCode && batches[selectedBatchCode]) {
      setActiveBatch(batches[selectedBatchCode]);
    } else if (batchKeys.length > 0 && !activeBatch) {
      setActiveBatch(batches[batchKeys[0]]);
    }
  }, [selectedBatchCode, batches]);

  const handleSearch = (code: string) => {
    const formatted = code.trim().toUpperCase();
    // Neu nguoi dung tim kiem voi o trong, tu dong tra cuu lo mac dinh
    const targetCode = formatted || selectedBatchCode || batchKeys[0] || '';
    if (formatted) {
      setSearchCode(formatted);
    }
    if (batches[targetCode]) {
      setActiveBatch(batches[targetCode]);
    } else {
      setActiveBatch(null);
    }
  };

  const currentOriginUrl = window.location.href;
  const suggestedPlaceholder = batchKeys[0]
    ? `Gợi ý nhập mã lô: ${batchKeys[0]}`
    : 'Nhập mã lô đặc sản (Ví dụ: HL-MEXUNGD-2026-001)...';

  return (
    <div className="space-y-6 font-sans">
      {/* Top Search & Camera Scan Bar */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E6E1D7] shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#EDE9E0]">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0ECE4] text-[#264939] text-[11px] font-bold border border-[#CCD8CF]">
              <QrCode className="w-3.5 h-3.5 text-[#C29B38]" />
              <span>CỔNG XÁC THỰC BLOCKCHAIN SEPOLIA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-[#264939]">
              Tra Cứu & Xác Thực Nguồn Gốc Đặc Sản
            </h2>
            <p className="text-xs font-sans text-[#5E7166]">
              Nhập mã định danh lô hàng hoặc quét mã tem QR niêm phong để đọc nhật ký minh bạch từ Sepolia Testnet.
            </p>
          </div>

          <button
            onClick={() => onOpenQRStampModal(activeBatch?.batchCode || '')}
            disabled={!activeBatch}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C29B38] text-white text-xs font-sans font-bold hover:bg-[#8C6D1F] transition-all shadow-2xs disabled:opacity-50 shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>In Tem QR Niêm Phong</span>
          </button>
        </div>

        {/* Refined Form Width & Search Inputs */}
        <div className="max-w-3xl mx-auto w-full pt-1 space-y-3 font-sans">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchCode)}
                placeholder={suggestedPlaceholder}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-[#E6E1D7] text-xs sm:text-sm font-mono focus:outline-none focus:border-[#264939] bg-[#FAF9F5] shadow-inner transition-colors placeholder:text-[#8A9D92] placeholder:font-sans placeholder:font-normal"
              />
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleSearch(searchCode)}
                className="px-6 py-3 bg-[#264939] text-white font-sans font-bold text-xs rounded-2xl hover:bg-[#1c372b] transition-all shadow-xs flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tra Cứu</span>
              </button>

              <button
                onClick={() => setIsScanning(!isScanning)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#E0ECE4] text-[#264939] font-sans font-bold text-xs rounded-2xl hover:bg-[#d0e2d5] transition-all border border-[#CCD8CF] flex-1 sm:flex-none"
              >
                <Camera className="w-4 h-4" />
                <span>{isScanning ? 'Tắt Camera' : 'Quét Mã Camera'}</span>
              </button>
            </div>
          </div>

          {/* Quick Batch Suggestion Pills */}
          {batchKeys.length > 0 && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 font-sans">
              <span className="text-[11px] font-extrabold text-[#8A9D92] uppercase tracking-wider">Lô On-Chain:</span>
              {batchKeys.map((code) => (
                <button
                  key={code}
                  onClick={() => handleSearch(code)}
                  className={`text-xs font-mono px-3 py-1 rounded-xl border transition-all shadow-2xs ${
                    searchCode === code
                      ? 'bg-[#264939] text-white border-[#264939] font-extrabold scale-105'
                      : 'bg-[#FAF9F5] text-[#3B4D43] border-[#E6E1D7] hover:border-[#264939] hover:bg-[#E0ECE4]/50'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          )}

          {/* Camera Simulator panel if toggled */}
          {isScanning && (
            <div className="p-5 bg-emerald-950 text-white rounded-2xl text-center space-y-3 animate-in fade-in font-sans shadow-lg">
              <div className="w-12 h-12 rounded-full bg-emerald-800/50 flex items-center justify-center mx-auto text-emerald-300">
                <QrCode className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xs text-emerald-200 font-medium">
                {batchKeys.length > 0
                  ? 'Đang giả lập Camera quét QR Code... Vui lòng chọn lô bên dưới để nhận diện lập tức:'
                  : 'Chưa có sản phẩm nào trên Blockchain để quét.'}
              </p>
              {batchKeys.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 font-mono">
                  {batchKeys.map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        handleSearch(code);
                        setIsScanning(false);
                      }}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 rounded-xl text-xs font-bold text-white transition-all border border-emerald-700"
                    >
                      Nhận diện {code}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Result Display */}
      {activeBatch ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans items-start">
          {/* Left Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E6E1D7] shadow-sm space-y-5 relative overflow-hidden">
              {/* Header Badge Row */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E0] gap-2">
                <div>
                  <span className="text-[10px] font-sans font-bold text-[#8A9D92] uppercase tracking-wider block">
                    MÃ ĐỊNH DANH LÔ HÀNG
                  </span>
                  <div className="font-mono text-sm sm:text-base font-extrabold text-[#264939] bg-[#E0ECE4] px-2.5 py-0.5 rounded-lg border border-[#CCD8CF] inline-block mt-0.5">
                    {activeBatch.batchCode}
                  </div>
                </div>

                {activeBatch.isVerified ? (
                  <span className="flex items-center gap-1.5 bg-amber-50 text-[#8C6D1F] border border-amber-200 px-3 py-1.5 rounded-full text-xs font-sans font-extrabold shadow-2xs shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#C29B38]" />
                    <span>OCOP {activeBatch.starRating || '4'} SAO</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 px-3 py-1.5 rounded-full text-xs font-sans font-bold shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Chờ Kiểm Định</span>
                  </span>
                )}
              </div>

              {/* Title & OCOP Status */}
              <div>
                <h3 className="font-serif font-extrabold text-2xl text-[#1A2820] leading-snug">
                  {activeBatch.productName}
                </h3>
                <p className="text-xs font-sans font-medium text-[#5E7166] mt-1">{activeBatch.ocopStandard}</p>
              </div>

              {/* OCOP Star Badge Card if verified */}
              {activeBatch.isVerified && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50/40 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Number(activeBatch.starRating || '4') }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#C29B38] text-[#C29B38]" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-[#8C6D1F] bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                      Hạng {activeBatch.starRating || '4'} Sao OCOP
                    </span>
                  </div>
                  {activeBatch.inspectorNote && (
                    <p className="text-xs text-[#1A2820] italic font-serif leading-relaxed">
                      "{activeBatch.inspectorNote}"
                    </p>
                  )}
                  <div className="text-[10px] text-[#8C6D1F] flex items-center gap-1 pt-1 font-sans border-t border-amber-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Phí thẩm định 0.002 ETH đã được Cơ sở sản xuất chi trả.</span>
                  </div>
                </div>
              )}

              {/* Compact QR Code Graphic Box */}
              <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#E6E1D7] flex flex-col items-center justify-center gap-2">
                <QRCodeSVG
                  value={`${currentOriginUrl}?batch=${activeBatch.batchCode}`}
                  size={125}
                  level="H"
                  includeMargin={true}
                />
                <span className="text-[10px] text-[#8A9D92] font-mono font-medium text-center">
                  Quét mã QR bằng điện thoại để xem chứng nhận Sepolia
                </span>
              </div>

              {/* Key Metadata Details with Clean Truncated Addresses */}
              <div className="space-y-3 text-xs font-sans border-t border-[#EDE9E0] pt-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#C29B38] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[#1A2820]">Nguồn Gốc Xuất Xứ:</span>
                    <p className="text-[#5E7166] truncate">{activeBatch.origin}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-[#264939] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[#1A2820]">Số Chứng Nhận OCOP:</span>
                    <p className="text-[#5E7166] truncate">{activeBatch.certificationNo || 'Đang cấp phép'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-[#264939] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[#1A2820]">Quy Mô / Sản Lượng:</span>
                    <p className="text-[#5E7166] truncate">{activeBatch.quantity || 'Sản lượng On-Chain'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#264939] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[#1A2820]">Địa Chỉ Chủ Cơ Sở (Producer):</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <a
                        href={`${ETHERSCAN_BASE_URL}/address/${activeBatch.producer}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#264939] hover:underline font-mono text-[11px] font-bold truncate block"
                        title={activeBatch.producer}
                      >
                        {activeBatch.producer ? `${activeBatch.producer.slice(0, 10)}...${activeBatch.producer.slice(-6)}` : 'Chưa cập nhật'}
                      </a>
                      <ExternalLink className="w-3 h-3 text-[#C29B38] shrink-0" />
                    </div>
                  </div>
                </div>

                {activeBatch.txHash && (
                  <div className="flex items-start gap-2.5">
                    <ExternalLink className="w-4 h-4 text-[#C29B38] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-[#1A2820]">Mã Băm Tạo Lô (Tx Hash):</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a
                          href={`${ETHERSCAN_BASE_URL}/tx/${activeBatch.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#264939] hover:underline font-mono text-[11px] font-bold truncate block"
                          title={activeBatch.txHash}
                        >
                          {`${activeBatch.txHash.slice(0, 10)}...${activeBatch.txHash.slice(-6)}`}
                        </a>
                        <ExternalLink className="w-3 h-3 text-[#C29B38] shrink-0" />
                      </div>
                    </div>
                  </div>
                )}

                {activeBatch.verifyTxHash && (
                  <div className="flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-[#C29B38] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-[#1A2820]">Mã Băm Thẩm Định (Verify Tx):</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a
                          href={`${ETHERSCAN_BASE_URL}/tx/${activeBatch.verifyTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#264939] hover:underline font-mono text-[11px] font-bold truncate block"
                          title={activeBatch.verifyTxHash}
                        >
                          {`${activeBatch.verifyTxHash.slice(0, 10)}...${activeBatch.verifyTxHash.slice(-6)}`}
                        </a>
                        <ExternalLink className="w-3 h-3 text-[#C29B38] shrink-0" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Supply Chain Timeline Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E6E1D7] shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#EDE9E0] gap-2">
                <div>
                  <h3 className="text-xl font-serif font-extrabold text-[#264939]">
                    Nhật Ký Hành Trình Supply Chain On-Chain
                  </h3>
                  <p className="text-xs font-sans text-[#5E7166]">
                    Tất cả dữ liệu chặng được mã hóa và lưu trữ trên Blockchain Sepolia.
                  </p>
                </div>
                <span className="text-xs font-sans font-bold px-3 py-1 bg-[#E0ECE4] text-[#264939] rounded-full border border-[#CCD8CF] shrink-0">
                  {activeBatch.checkpoints?.length || 0} Chặng Đã Khai Báo
                </span>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#CCD8CF]">
                {activeBatch.checkpoints?.map((cp, idx) => {
                  const dateStr = new Date(cp.timestamp * 1000).toLocaleString('vi-VN');

                  return (
                    <div key={idx} className="relative group font-sans">
                      {/* Circle Node Indicator */}
                      <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-[#264939] border-4 border-white shadow-sm flex items-center justify-center text-white text-[9px] font-bold font-mono">
                        {idx + 1}
                      </div>

                      <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E6E1D7] space-y-3 hover:border-[#264939] transition-all shadow-2xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#EDE9E0]">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C29B38]">
                              {cp.roleTitle || cp.role}
                            </span>
                            <h4 className="font-serif font-extrabold text-base text-[#1A2820]">
                              {cp.stepName}
                            </h4>
                          </div>
                          <span className="text-[11px] font-medium text-[#8A9D92] bg-white px-2.5 py-1 rounded-lg border border-[#EDE9E0]">
                            {dateStr}
                          </span>
                        </div>

                        {/* Location & Action */}
                        <div className="space-y-2 text-xs text-[#3B4D43]">
                          <div className="flex items-center gap-2 text-[#264939] font-bold">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{cp.location}</span>
                          </div>

                          <p className="leading-relaxed text-[#1A2820] bg-white p-3 rounded-xl border border-[#EDE9E0]">
                            {cp.action}
                          </p>

                          {cp.conditionNote && (
                            <div className="text-[11px] text-[#5E7166] flex items-center gap-1.5 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{cp.conditionNote}</span>
                            </div>
                          )}
                        </div>

                        {/* On-Chain Verification Footer */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8A9D92] border-t border-[#EDE9E0]">
                          <div className="font-mono font-bold text-[#1A2820]">
                            Địa chỉ ghi: {cp.recorder ? `${cp.recorder.slice(0, 10)}...${cp.recorder.slice(-6)}` : '0x...'}
                          </div>
                          <a
                            href={`${ETHERSCAN_BASE_URL}/address/${cp.recorder}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#264939] font-bold hover:underline"
                          >
                            <span>Etherscan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-[#E6E1D7] text-center space-y-3 font-sans">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-xl font-serif font-extrabold text-[#1A2820]">
            Chưa có sản phẩm nào trên Blockchain
          </h3>
          <p className="text-xs text-[#5E7166] max-w-md mx-auto">
            {searchCode
              ? `Không tìm thấy lô hàng "${searchCode}" trên Smart Contract Sepolia.`
              : 'Hãy kết nối ví MetaMask và tạo lô hàng đặc sản đầu tiên.'}
          </p>
        </div>
      )}
    </div>
  );
};
