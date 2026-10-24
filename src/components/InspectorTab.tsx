import React, { useState } from 'react';
import { Batch } from '../types';
import { ShieldCheck, AlertOctagon, FileCheck2, Clock, CheckCircle2, Award } from 'lucide-react';

interface InspectorTabProps {
  batches: Record<string, Batch>;
  onVerifyBatch: (batchCode: string, inspectorNote: string, certificateURI: string) => Promise<void>;
  onRevokeVerification: (batchCode: string, reason: string) => Promise<void>;
}

export const InspectorTab: React.FC<InspectorTabProps> = ({
  batches,
  onVerifyBatch,
  onRevokeVerification,
}) => {
  const batchList = Object.values(batches);
  const [selectedBatchCode, setSelectedBatchCode] = useState(batchList[0]?.batchCode || 'HL-NONLA-2026-004');
  const [inspectorNote, setInspectorNote] = useState('Đã đối chiếu mẫu thử nghiệm vi sinh và xuất xứ Đầm Phá Tam Giang. Đạt chứng nhận OCOP 4 Sao Thừa Thiên Huế.');
  const [certificateURI, setCertificateURI] = useState('ipfs://QmHueOCOPInspectionCertificate2026');
  const [revokeReason, setRevokeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBatch = batches[selectedBatchCode];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchCode) return;

    setIsSubmitting(true);
    try {
      await onVerifyBatch(selectedBatchCode, inspectorNote, certificateURI);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Inspection Action Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E0]">
            <div>
              <h2 className="text-xl font-extrabold text-[#264939] font-serif">
                Thẩm Định & Cấp Chứng Nhận OCOP (verifyBatch)
              </h2>
              <p className="text-xs text-[#5E7166] mt-1">
                Quyền hạn dành riêng cho Kiểm Định Viên OCOP (ROLE_INSPECTOR).
              </p>
            </div>
            <Award className="w-7 h-7 text-[#C29B38]" />
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                Chọn Lô Hàng Thẩm Định *
              </label>
              <select
                value={selectedBatchCode}
                onChange={(e) => setSelectedBatchCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-mono font-bold focus:outline-none focus:border-[#264939] bg-[#FAF9F5]"
              >
                {batchList.map((batch) => (
                  <option key={batch.batchCode} value={batch.batchCode}>
                    {batch.batchCode} — {batch.productName} ({batch.isVerified ? 'Đã OCOP' : 'Chờ Kiểm Định'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                Kết Luận / Ghi Chú Thẩm Định Chất Lượng *
              </label>
              <textarea
                required
                rows={3}
                value={inspectorNote}
                onChange={(e) => setInspectorNote(e.target.value)}
                placeholder="Nhập ghi chú kiểm định vi sinh, xuất xứ và quy trình..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1.5">
                Đường Dẫn Chứng Nhận IPFS (Certificate URI)
              </label>
              <input
                type="text"
                value={certificateURI}
                onChange={(e) => setCertificateURI(e.target.value)}
                placeholder="ipfs://Qm..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D7] text-sm font-mono focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div className="pt-4 border-t border-[#EDE9E0] flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                disabled={isSubmitting || selectedBatch?.isVerified}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C29B38] text-white font-bold text-xs hover:bg-[#8C6D1F] transition-all shadow-md disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {selectedBatch?.isVerified ? 'Lô Hàng Đã Được Chứng Nhận' : 'Cấp Chứng Nhận Đạt OCOP'}
                </span>
              </button>
            </div>
          </form>

          {/* Revoke Verification Option */}
          {selectedBatch?.isVerified && (
            <div className="pt-6 border-t border-red-200 bg-red-50/50 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span>Thu hồi Chứng nhận OCOP (revokeBatchVerification)</span>
              </div>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Nhập lý do thu hồi (Vi phạm vệ sinh, mẫu sai lệch...)"
                className="w-full px-3 py-2 rounded-xl border border-red-200 text-sm focus:outline-none focus:border-red-500 bg-white"
              />
              <button
                onClick={handleRevoke}
                disabled={isSubmitting || !revokeReason}
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
              >
                Xác Nhận Thu Hồi Chứng Nhận
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Col: Batch Preview Status */}
      <div className="space-y-6">
        {selectedBatch && (
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-4">
            <div className="pb-3 border-b border-[#EDE9E0]">
              <span className="text-[10px] font-bold text-[#8A9D92] uppercase">Trạng Thái Lô</span>
              <div className="font-mono text-base font-extrabold text-[#264939]">
                {selectedBatch.batchCode}
              </div>
              <h3 className="font-bold text-sm text-[#1A2820] mt-1">{selectedBatch.productName}</h3>
            </div>

            <div className="flex items-center gap-2">
              {selectedBatch.isVerified ? (
                <span className="flex items-center gap-1.5 bg-amber-50 text-[#8C6D1F] border border-amber-200 px-3 py-1.5 rounded-full text-xs font-extrabold">
                  <ShieldCheck className="w-4 h-4 text-[#C29B38]" />
                  <span>ĐÃ ĐẠT CHỨNG NHẬN OCOP</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>CHƯA XÁC NHẬN</span>
                </span>
              )}
            </div>

            <div className="text-xs space-y-2 text-[#5E7166]">
              <div>
                <span className="font-bold text-[#1A2820]">Nguồn gốc:</span> {selectedBatch.origin}
              </div>
              <div>
                <span className="font-bold text-[#1A2820]">Số chặng:</span>{' '}
                {selectedBatch.checkpoints?.length || 0} chặng
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
