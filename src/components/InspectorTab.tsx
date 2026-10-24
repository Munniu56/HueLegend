import React, { useState } from 'react';
import { Batch } from '../types';
import { ShieldCheck, AlertOctagon, Award, Clock } from 'lucide-react';

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
  const [selectedBatchCode, setSelectedBatchCode] = useState(batchList[0]?.batchCode || '');
  const [inspectorNote, setInspectorNote] = useState('');
  const [certificateURI, setCertificateURI] = useState('');
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E0]">
            <div>
              <h2 className="text-xl font-serif font-extrabold text-[#264939]">
                Thẩm Định & Cấp Chứng Nhận OCOP
              </h2>
            </div>
            <Award className="w-6 h-6 text-[#C29B38]" />
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

            <div>
              <label className="block text-xs font-bold text-[#1A2820] mb-1">
                Certificate IPFS URI
              </label>
              <input
                type="text"
                value={certificateURI}
                onChange={(e) => setCertificateURI(e.target.value)}
                placeholder="Ví dụ: ipfs://Qm... (Link giấy chứng nhận OCOP)"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D7] text-xs font-mono focus:outline-none focus:border-[#264939]"
              />
            </div>

            <div className="pt-3 border-t border-[#EDE9E0] flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !selectedBatch || selectedBatch?.isVerified}
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
                  disabled={isSubmitting || !revokeReason}
                  className="px-3.5 py-1.5 bg-red-600 text-white font-bold text-xs rounded-lg hover:bg-red-700 transition-all shrink-0 disabled:opacity-50"
                >
                  Thu Hồi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 font-sans">
        {selectedBatch ? (
          <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-2xs space-y-3">
            <div className="pb-3 border-b border-[#EDE9E0]">
              <span className="text-[10px] font-bold text-[#8A9D92] uppercase">Trạng Thái</span>
              <div className="font-mono text-sm font-extrabold text-[#264939]">{selectedBatch.batchCode}</div>
              <h3 className="font-serif font-bold text-base text-[#1A2820] mt-1">{selectedBatch.productName}</h3>
            </div>

            {selectedBatch.isVerified ? (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-[#8C6D1F] border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C29B38]" />
                <span>ĐÃ CHỨNG NHẬN OCOP</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>CHƯA XÁC NHẬN</span>
              </span>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-[#E6E1D7] text-center text-xs text-gray-400">
            Chưa có lô hàng nào.
          </div>
        )}
      </div>
    </div>
  );
};
