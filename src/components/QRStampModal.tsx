import React from 'react';
import { Batch } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ShieldCheck, Award } from 'lucide-react';

interface QRStampModalProps {
  batch: Batch | null;
  onClose: () => void;
}

export const QRStampModal: React.FC<QRStampModalProps> = ({ batch, onClose }) => {
  if (!batch) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentUrl = window.location.href;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
      <div className="bg-white rounded-3xl border border-[#E6E1D7] max-w-md w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E0]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C29B38]" />
            <h3 className="font-serif font-extrabold text-lg text-[#264939]">
              Tem Mã QR Niêm Phong Đặc Sản
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Stamp Badge Box */}
        <div
          id="printable-stamp"
          className="p-6 bg-gradient-to-b from-[#FAF9F5] to-white rounded-2xl border-2 border-[#C29B38] text-center space-y-4 relative shadow-inner"
        >
          {/* Top Royal Header */}
          <div className="space-y-1">
            <div className="text-[10px] font-sans font-extrabold tracking-widest text-[#C29B38] uppercase">
              UỶ BAN NHÂN DÂN TỈNH THỪA THIÊN HUẾ
            </div>
            <div className="text-xs font-sans font-bold text-[#264939]">
              TEM CHỨNG NHẬN TRUY XUẤT NGUỒN GỐC BLOCKCHAIN
            </div>
          </div>

          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-xl border border-[#CCD8CF] inline-block shadow-2xs">
            <QRCodeSVG
              value={`${currentUrl}?batch=${batch.batchCode}`}
              size={150}
              level="H"
              includeMargin={true}
            />
          </div>

          <div>
            <span className="font-mono text-xs font-extrabold text-[#264939] bg-[#E0ECE4] px-3 py-1 rounded-lg border border-[#CCD8CF]">
              {batch.batchCode}
            </span>
            <h4 className="font-serif font-extrabold text-xl text-[#1A2820] mt-2">
              {batch.productName}
            </h4>
            <p className="text-xs font-sans text-[#5E7166] mt-1">{batch.origin}</p>
          </div>

          <div className="pt-2 border-t border-[#EDE9E0] flex items-center justify-center gap-1.5 text-xs font-sans font-bold text-[#8C6D1F]">
            <ShieldCheck className="w-4 h-4 text-[#C29B38]" />
            <span>{batch.ocopStandard || 'Xác thực OCOP Cố Đô Huế'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 font-sans">
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#264939] text-white font-bold text-xs hover:bg-[#1c372b] transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>In Tem Niêm Phong</span>
          </button>
        </div>
      </div>
    </div>
  );
};
