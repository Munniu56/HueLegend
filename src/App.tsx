import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Batch, ToastMessage } from './types';
import {
  DEFAULT_SAMPLE_BATCHES,
  CONTRACT_ADDRESS,
  PROJECT_CORE_ABI,
  SEPOLIA_CHAIN_ID,
  ROLE_HASHES
} from './constants';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { LookupTab } from './components/LookupTab';
import { CreateBatchTab } from './components/CreateBatchTab';
import { CheckpointTab } from './components/CheckpointTab';
import { InspectorTab } from './components/InspectorTab';
import { AdminTab } from './components/AdminTab';
import { ToastContainer } from './components/ToastContainer';
import { QRStampModal } from './components/QRStampModal';

export const App: React.FC = () => {
  // Global State
  const [batches, setBatches] = useState<Record<string, Batch>>(() => {
    const saved = localStorage.getItem('HueLegend_Batches');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SAMPLE_BATCHES;
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLookupBatch, setSelectedLookupBatch] = useState('HL-MEXUNG-2026-001');
  const [qrStampBatch, setQrStampBatch] = useState<Batch | null>(null);

  // Web3 Connection State
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [simulatedRole, setSimulatedRole] = useState('ALL');
  const [producerStakeBalance, setProducerStakeBalance] = useState('0.05');
  const [batchCreationFeeEth, setBatchCreationFeeEth] = useState('0.001');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Save batches to LocalStorage when modified
  useEffect(() => {
    localStorage.setItem('HueLegend_Batches', JSON.stringify(batches));
  }, [batches]);

  const addToast = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'warning' | 'loading' = 'info',
    duration = 4500
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0 && type !== 'loading') {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          setIsDemoMode(false);
          addToast('Kết Nối Thành Công', `Đã kết nối ví: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`, 'success');
        }
      } catch (err: any) {
        addToast('Lỗi Kết Nối Ví', err?.message || 'Không thể kết nối MetaMask', 'error');
      }
    } else {
      addToast('Không Tìm Thấy Ví', 'Vui lòng cài đặt MetaMask extension. Đang dùng chế độ Giả Lập Demo.', 'warning');
    }
  };

  // Navigation Helper
  const handleNavigateTab = (tab: string, batchCodeSelect?: string) => {
    setActiveTab(tab);
    if (batchCodeSelect) {
      setSelectedLookupBatch(batchCodeSelect);
    }
  };

  // Create Batch Handler
  const handleCreateBatch = async (
    batchCode: string,
    productName: string,
    origin: string,
    metadataURI: string
  ) => {
    const loadingToastId = addToast('Đang Khởi Tạo Lô Hàng', 'Đang ghi nhận lô đặc sản lên Blockchain Sepolia...', 'loading');

    // Simulate / Web3 execution
    setTimeout(() => {
      removeToast(loadingToastId);

      const newBatch: Batch = {
        batchCode,
        productName,
        origin,
        createdAt: Math.floor(Date.now() / 1000),
        producer: currentAccount || '0x82d022a704706B2f144863D619D7418F8a0f19A7',
        isVerified: false,
        exists: true,
        ocopStandard: 'Đang Chờ Kiểm Định OCOP',
        certificationNo: `OCOP-HUE-2026-${Math.floor(100 + Math.random() * 900)}`,
        quantity: '500 sản phẩm',
        currentStage: 'Xưởng sản xuất khởi tạo',
        checkpoints: [
          {
            stepName: 'Chặng 1: Khởi Tạo Lô Hàng On-Chain',
            role: 'ROLE_PRODUCER',
            roleTitle: 'Cơ Sở Sản Xuất',
            location: origin,
            action: `Chủ cơ sở đăng ký lô hàng đặc sản "${productName}". Nộp phí khai báo ${batchCreationFeeEth} ETH.`,
            timestamp: Math.floor(Date.now() / 1000),
            recorder: currentAccount || '0x82d022a704706B2f144863D619D7418F8a0f19A7',
            metadataURI,
            txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            conditionNote: 'Khởi tạo mã QR niêm phong nguyên vẹn.'
          }
        ]
      };

      setBatches((prev) => ({
        ...prev,
        [batchCode]: newBatch
      }));

      addToast('Tạo Lô Hàng Thành Công!', `Lô ${batchCode} đã được khởi tạo thành công trên hệ thống!`, 'success');
      handleNavigateTab('lookup', batchCode);
    }, 1200);
  };

  // Add Checkpoint Handler
  const handleAddCheckpoint = async (
    batchCode: string,
    role: string,
    location: string,
    action: string,
    metadataURI: string,
    stepName: string,
    conditionNote: string
  ) => {
    const loadingToastId = addToast('Đang Ghi Chặng Supply Chain', 'Ghi nhận vị trí và điều kiện bảo quản...', 'loading');

    setTimeout(() => {
      removeToast(loadingToastId);

      setBatches((prev) => {
        const target = prev[batchCode];
        if (!target) return prev;

        const roleTitleMap: Record<string, string> = {
          ROLE_PRODUCER: 'Cơ Sở Sản Xuất',
          ROLE_LOGISTICS: 'Đơn Vị Vận Chuyển',
          ROLE_RETAILER: 'Đại Lý Phân Phối'
        };

        const newCheckpoint = {
          stepName,
          role,
          roleTitle: roleTitleMap[role] || 'Đơn Vị Tham Gia',
          location,
          action,
          timestamp: Math.floor(Date.now() / 1000),
          recorder: currentAccount || '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
          metadataURI,
          txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          conditionNote
        };

        return {
          ...prev,
          [batchCode]: {
            ...target,
            currentStage: stepName,
            checkpoints: [...(target.checkpoints || []), newCheckpoint]
          }
        };
      });

      addToast('Thêm Chặng Thành Công!', `Nhật ký chặng mới của ${batchCode} đã ghi nhận on-chain.`, 'success');
      handleNavigateTab('lookup', batchCode);
    }, 1000);
  };

  // Verify Batch Handler
  const handleVerifyBatch = async (
    batchCode: string,
    inspectorNote: string,
    certificateURI: string
  ) => {
    const loadingToastId = addToast('Đang Thẩm Định OCOP', 'Kiểm tra chứng nhận vi sinh và xuất xứ...', 'loading');

    setTimeout(() => {
      removeToast(loadingToastId);

      setBatches((prev) => {
        const target = prev[batchCode];
        if (!target) return prev;

        return {
          ...prev,
          [batchCode]: {
            ...target,
            isVerified: true,
            ocopStandard: 'Đạt Chuẩn OCOP 4-5 Sao Tỉnh Thừa Thiên Huế',
            inspectorNote,
            certificateURI
          }
        };
      });

      addToast('Chứng Nhận Đạt OCOP!', `Lô ${batchCode} đã chính thức đạt chứng nhận OCOP!`, 'success');
      handleNavigateTab('lookup', batchCode);
    }, 1000);
  };

  // Revoke Verification Handler
  const handleRevokeVerification = async (batchCode: string, reason: string) => {
    const loadingToastId = addToast('Đang Thu Hồi Chứng Nhận', 'Ghi nhận lý do thu hồi...', 'loading');

    setTimeout(() => {
      removeToast(loadingToastId);

      setBatches((prev) => {
        const target = prev[batchCode];
        if (!target) return prev;

        return {
          ...prev,
          [batchCode]: {
            ...target,
            isVerified: false,
            ocopStandard: 'Chứng Nhận Đã Bị Thu Hồi',
            inspectorNote: `Thu hồi: ${reason}`
          }
        };
      });

      addToast('Đã Thu Hồi Chứng Nhận', `Đã thu hồi chứng nhận OCOP của lô ${batchCode}.`, 'warning');
    }, 1000);
  };

  // Deposit Stake Handler
  const handleDepositStake = async (amountEth: string) => {
    addToast('Đặt Cọc Ký Quỹ Thành Công', `Đã đặt cọc thêm ${amountEth} ETH vào hợp đồng Producer Stake!`, 'success');
    setProducerStakeBalance((prev) => (parseFloat(prev) + parseFloat(amountEth)).toFixed(3));
  };

  // Withdraw Stake Handler
  const handleWithdrawStake = async () => {
    addToast('Rút Ký Quỹ Thành Công', `Đã rút ${producerStakeBalance} ETH về tài khoản ví!`, 'info');
    setProducerStakeBalance('0.00');
  };

  // Role Assignment
  const handleAssignRole = async (account: string, roleName: string) => {
    addToast('Gán Vai Trò Thành Công', `Đã gán vai trò ${roleName} cho địa chỉ ${account.slice(0, 6)}...`, 'success');
  };

  // Role Revoke
  const handleRevokeRole = async (account: string, roleName: string) => {
    addToast('Thu Hồi Vai Trò Thành Công', `Đã thu hồi vai trò ${roleName} của địa chỉ ${account.slice(0, 6)}...`, 'warning');
  };

  // Set Creation Fee
  const handleSetBatchCreationFee = async (newFeeEth: string) => {
    setBatchCreationFeeEth(newFeeEth);
    addToast('Cập Nhật Mức Phí', `Phí khai báo lô hàng mới đã cập nhật thành ${newFeeEth} ETH`, 'success');
  };

  return (
    <div className="flex min-h-screen bg-[#F4F1EA] text-[#1A2820]">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={(tab) => handleNavigateTab(tab)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentAccount={currentAccount}
          isDemoMode={isDemoMode}
          simulatedRole={simulatedRole}
          onConnectWallet={connectWallet}
          onToggleDemoMode={() => {
            setIsDemoMode(!isDemoMode);
            addToast('Chuyển Chế Độ', !isDemoMode ? 'Đã bật chế độ Giả Lập Demo' : 'Đã bật chế độ Web3 Thật', 'info');
          }}
          onSimulatedRoleChange={(role) => {
            setSimulatedRole(role);
            addToast('Giả Lập Vai Trò', `Đã chuyển sang góc nhìn: ${role}`, 'info');
          }}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab
              batches={batches}
              producerStakeBalance={producerStakeBalance}
              onNavigateTab={handleNavigateTab}
              onSelectBatchForQR={(code) => setQrStampBatch(batches[code] || null)}
            />
          )}

          {activeTab === 'lookup' && (
            <LookupTab
              batches={batches}
              selectedBatchCode={selectedLookupBatch}
              onOpenQRStampModal={(code) => setQrStampBatch(batches[code] || null)}
            />
          )}

          {activeTab === 'create-batch' && (
            <CreateBatchTab
              batchCreationFeeEth={batchCreationFeeEth}
              producerStakeBalance={producerStakeBalance}
              isProducerRole={simulatedRole === 'ALL' || simulatedRole === 'PRODUCER'}
              onCreateBatch={handleCreateBatch}
              onDepositStake={handleDepositStake}
              onWithdrawStake={handleWithdrawStake}
            />
          )}

          {activeTab === 'checkpoint' && (
            <CheckpointTab batches={batches} onAddCheckpoint={handleAddCheckpoint} />
          )}

          {activeTab === 'inspector' && (
            <InspectorTab
              batches={batches}
              onVerifyBatch={handleVerifyBatch}
              onRevokeVerification={handleRevokeVerification}
            />
          )}

          {activeTab === 'admin' && (
            <AdminTab
              batchCreationFeeEth={batchCreationFeeEth}
              onSetBatchCreationFee={handleSetBatchCreationFee}
              onAssignRole={handleAssignRole}
              onRevokeRole={handleRevokeRole}
            />
          )}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* QR Stamp Printable Modal */}
      <QRStampModal batch={qrStampBatch} onClose={() => setQrStampBatch(null)} />
    </div>
  );
};
