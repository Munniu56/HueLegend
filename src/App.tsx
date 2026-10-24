import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Batch, ToastMessage } from './types';
import {
  CONTRACT_ADDRESS,
  PROJECT_CORE_ABI,
  SEPOLIA_CHAIN_ID,
  ROLE_HASHES,
  ETHERSCAN_BASE_URL
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
import { RoleConnectModal } from './components/RoleConnectModal';
import { WalletDetailsModal } from './components/WalletDetailsModal';

export const App: React.FC = () => {
  // Global State
  const [batches, setBatches] = useState<Record<string, Batch>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLookupBatch, setSelectedLookupBatch] = useState('');
  const [qrStampBatch, setQrStampBatch] = useState<Batch | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isWalletDetailsModalOpen, setIsWalletDetailsModalOpen] = useState(false);

  // Web3 Connection State
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState('ALL');
  const [producerStakeBalance, setProducerStakeBalance] = useState('0.00');
  const [batchCreationFeeEth, setBatchCreationFeeEth] = useState('0.001');
  const [isLoadingContract, setIsLoadingContract] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
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
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Map OpenZeppelin role hash to title
  const getRoleTitle = (roleHash: string): string => {
    if (roleHash === ROLE_HASHES.ROLE_PRODUCER) return 'Cơ Sở Sản Xuất';
    if (roleHash === ROLE_HASHES.ROLE_LOGISTICS) return 'Đơn Vị Vận Chuyển';
    if (roleHash === ROLE_HASHES.ROLE_RETAILER) return 'Đại Lý Phân Phối';
    if (roleHash === ROLE_HASHES.ROLE_INSPECTOR) return 'Kiểm Định Viên OCOP';
    if (roleHash === ROLE_HASHES.ROLE_ADMIN) return 'Quản Trị Viên';
    return 'Đơn Vị Tham Gia';
  };

  // Fetch real Smart Contract data from Sepolia Testnet
  const fetchContractData = useCallback(async (accountAddr?: string) => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return;
    }

    setIsLoadingContract(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_CORE_ABI, provider);

      // Read Batch Creation Fee
      try {
        const feeWei = await contract.batchCreationFee();
        setBatchCreationFeeEth(ethers.formatEther(feeWei));
      } catch (err) {
        console.warn('Could not read batchCreationFee:', err);
      }

      // Read Producer Stake balance if account connected
      const activeAccount = accountAddr || currentAccount;
      if (activeAccount) {
        try {
          const stakeInfo = await contract.getStakeInfo(activeAccount);
          setProducerStakeBalance(ethers.formatEther(stakeInfo.balance));
        } catch (err) {
          console.warn('Could not read stake info:', err);
        }
      }

      // Query total batches count
      let total = 0n;
      try {
        total = await contract.getTotalBatches();
      } catch (err) {
        console.warn('Could not read totalBatches from contract getters:', err);
      }

      const fetchedBatches: Record<string, Batch> = {};

      if (total > 0n) {
        for (let i = 0n; i < total; i++) {
          try {
            const batchCode = await contract.getBatchCodeByIndex(i);
            const batchData = await contract.getBatch(batchCode);
            const checkpointsData = await contract.getCheckpoints(batchCode);

            const checkpoints = checkpointsData.map((cp: any, idx: number) => ({
              stepName: `Chặng ${idx + 1}: ${cp.action.substring(0, 30)}...`,
              role: cp.role,
              roleTitle: getRoleTitle(cp.role),
              location: cp.location,
              action: cp.action,
              timestamp: Number(cp.timestamp),
              recorder: cp.recorder,
              metadataURI: cp.metadataURI,
              txHash: 'On-Chain Block Transaction',
              conditionNote: 'Niêm phong Blockchain nguyên vẹn.'
            }));

            fetchedBatches[batchCode] = {
              batchCode: batchData.batchCode,
              productName: batchData.productName,
              origin: batchData.origin,
              createdAt: Number(batchData.createdAt),
              producer: batchData.producer,
              isVerified: batchData.isVerified,
              exists: batchData.exists,
              ocopStandard: batchData.isVerified
                ? 'Đạt Chuẩn OCOP Tỉnh Thừa Thiên Huế'
                : 'Chưa Thẩm Định OCOP',
              certificationNo: `OCOP-HUE-2026-${batchCode.slice(-3)}`,
              quantity: 'Sản lượng On-Chain',
              currentStage:
                checkpoints.length > 0
                  ? checkpoints[checkpoints.length - 1].action
                  : 'Xưởng sản xuất',
              checkpoints
            };
          } catch (e) {
            console.error(`Error reading batch index ${i}:`, e);
          }
        }
      }

      setBatches(fetchedBatches);
      if (Object.keys(fetchedBatches).length > 0 && !selectedLookupBatch) {
        setSelectedLookupBatch(Object.keys(fetchedBatches)[0]);
      }
    } catch (err: any) {
      console.error('Error fetching contract data from Sepolia:', err);
    } finally {
      setIsLoadingContract(false);
    }
  }, [currentAccount, selectedLookupBatch]);

  // Connect Wallet Procedure
  const executeMetaMaskConnect = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        
        // Ensure network is Sepolia (Chain ID: 11155111 / 0xaa36a7)
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }]
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['https://rpc.sepolia.org'],
                  blockExplorerUrls: [ETHERSCAN_BASE_URL]
                }
              ]
            });
          }
        }

        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
          const connectedAddr = accounts[0];
          setCurrentAccount(connectedAddr);
          setIsDemoMode(false);
          addToast('Kết Nối Thành Công', `Ví Sepolia: ${connectedAddr.slice(0, 6)}...${connectedAddr.slice(-4)}`, 'success');
          await fetchContractData(connectedAddr);
        }
      } catch (err: any) {
        addToast('Lỗi Kết Nối Ví', err?.message || 'Không thể kết nối MetaMask', 'error');
      }
    } else {
      addToast('Cần MetaMask', 'Vui lòng cài đặt MetaMask extension để tương tác với Sepolia Blockchain.', 'warning');
    }
  };

  // Open Modal or Wallet Details depending on connection status
  const handleOpenRoleConnectModal = () => {
    if (currentAccount) {
      // Already connected -> Open Wallet Details Modal with parameters & disconnect button
      setIsWalletDetailsModalOpen(true);
    } else {
      setIsRoleModalOpen(true);
    }
  };

  // Disconnect Wallet Handler
  const handleDisconnectWallet = () => {
    setCurrentAccount(null);
    setIsWalletDetailsModalOpen(false);
    addToast('Đã Ngắt Kết Nối Ví', 'Đã ngắt kết nối với ví MetaMask thành công.', 'info');
  };

  // Role Selection in Modal -> Connect MetaMask
  const handleRoleSelectAndConnect = async (roleKey: string) => {
    setIsRoleModalOpen(false);
    
    // Map role selection
    const roleMapping: Record<string, string> = {
      ADMIN: 'ADMIN',
      SUPPLY_CHAIN: 'PRODUCER',
      COMMERCE: 'RETAILER',
      CUSTOMER: 'INSPECTOR'
    };
    
    setSimulatedRole(roleMapping[roleKey] || 'ALL');
    await executeMetaMaskConnect();
  };

  // Listen for account changes (Do NOT auto-connect on page load/refresh)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          fetchContractData(accounts[0]);
        } else {
          setCurrentAccount(null);
          setBatches({});
        }
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if ((window as any).ethereum.removeListener) {
          (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [fetchContractData]);

  // Navigation Helper
  const handleNavigateTab = (tab: string, batchCodeSelect?: string) => {
    setActiveTab(tab);
    if (batchCodeSelect) {
      setSelectedLookupBatch(batchCodeSelect);
    }
  };

  // 1. Create Batch On-Chain
  const handleCreateBatch = async (
    batchCode: string,
    productName: string,
    origin: string,
    metadataURI: string
  ) => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng chọn vai trò & kết nối ví MetaMask trước khi tạo lô hàng.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận giao dịch createBatch() trên MetaMask...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_CORE_ABI, signer);

      const feeWei = await contract.batchCreationFee();
      const tx = await contract.createBatch(batchCode, productName, origin, metadataURI, {
        value: feeWei
      });

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang chờ xác nhận trên Blockchain...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Khởi Tạo On-Chain Thành Công!', `Lô hàng ${batchCode} đã được ghi nhận vào Smart Contract Sepolia.`, 'success');
      await fetchContractData();
      handleNavigateTab('lookup', batchCode);
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Lỗi Giao Dịch On-Chain', err?.reason || err?.message || 'Giao dịch thất bại trên Sepolia.', 'error');
    }
  };

  // 2. Add Checkpoint On-Chain
  const handleAddCheckpoint = async (
    batchCode: string,
    role: string,
    location: string,
    action: string,
    metadataURI: string,
    stepName: string,
    conditionNote: string
  ) => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng chọn vai trò & kết nối ví MetaMask.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận giao dịch addCheckpoint() trên MetaMask...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_CORE_ABI, signer);

      const roleHash = ROLE_HASHES[role as keyof typeof ROLE_HASHES] || ROLE_HASHES.ROLE_LOGISTICS;
      const fullActionText = conditionNote ? `${action} (Ghi chú: ${conditionNote})` : action;

      const tx = await contract.addCheckpoint(batchCode, roleHash, location, fullActionText, metadataURI);

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang chờ xác nhận...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Ghi Chặng Thành Công!', `Chặng mới của lô ${batchCode} đã được lưu trữ bất biến on-chain.`, 'success');
      await fetchContractData();
      handleNavigateTab('lookup', batchCode);
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Lỗi Giao Dịch On-Chain', err?.reason || err?.message || 'Lỗi ghi chặng lên Blockchain.', 'error');
    }
  };

  // 3. Verify Batch On-Chain
  const handleVerifyBatch = async (
    batchCode: string,
    inspectorNote: string,
    certificateURI: string
  ) => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví MetaMask với quyền ROLE_INSPECTOR.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận giao dịch verifyBatch() trên MetaMask...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_CORE_ABI, signer);

      const tx = await contract.verifyBatch(batchCode, inspectorNote, certificateURI);

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang thẩm định OCOP...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Chứng Nhận OCOP Thành Công!', `Lô ${batchCode} đã đạt chứng nhận OCOP chính thức on-chain.`, 'success');
      await fetchContractData();
      handleNavigateTab('lookup', batchCode);
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Lỗi Thẩm Định On-Chain', err?.reason || err?.message || 'Cần vai trò ROLE_INSPECTOR để thực hiện.', 'error');
    }
  };

  // 4. Revoke Verification On-Chain
  const handleRevokeVerification = async (batchCode: string, reason: string) => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví MetaMask.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận revokeBatchVerification() trên MetaMask...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_CORE_ABI, signer);

      const tx = await contract.revokeBatchVerification(batchCode, reason);

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang thu hồi...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Đã Thu Hồi Chứng Nhận', `Lô ${batchCode} đã bị thu hồi chứng nhận OCOP on-chain.`, 'warning');
      await fetchContractData();
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Lỗi Thu Hồi On-Chain', err?.reason || err?.message || 'Không thể thu hồi chứng nhận.', 'error');
    }
  };

  // 5. Deposit Stake On-Chain
  const handleDepositStake = async (amountEth: string) => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví MetaMask.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận depositStake() trên MetaMask...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_CORE_ABI, signer);

      const valueWei = ethers.parseEther(amountEth);
      const tx = await contract.depositStake({ value: valueWei });

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang ký quỹ...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Đặt Cọc Ký Quỹ Thành Công!', `Đã đặt cọc ${amountEth} ETH bảo đảm chất lượng.`, 'success');
      await fetchContractData();
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Lỗi Đặt Cọc', err?.reason || err?.message || 'Đặt cọc ký quỹ thất bại.', 'error');
    }
  };

  // 6. Withdraw Stake On-Chain
  const handleWithdrawStake = async () => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví MetaMask.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận withdrawStake() trên MetaMask...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_CORE_ABI, signer);

      const tx = await contract.withdrawStake();

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang rút tiền...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Rút Ký Quỹ Thành Công!', 'Số tiền ký quỹ đã được chuyển về ví của bạn.', 'success');
      await fetchContractData();
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Lỗi Rút Ký Quỹ', err?.reason || err?.message || 'Tiền ký quỹ còn đang trong thời gian khóa.', 'error');
    }
  };

  // 7. Role Assignment On-Chain
  const handleAssignRole = async (account: string, roleName: string) => {
    addToast('Yêu Cầu Admin', `Chỉ Admin (Owner) mới có thể gán vai trò ${roleName} on-chain.`, 'info');
  };

  // 8. Role Revoke On-Chain
  const handleRevokeRole = async (account: string, roleName: string) => {
    addToast('Yêu Cầu Admin', `Chỉ Admin (Owner) mới có thể thu hồi vai trò ${roleName} on-chain.`, 'info');
  };

  // 9. Set Creation Fee On-Chain
  const handleSetBatchCreationFee = async (newFeeEth: string) => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví MetaMask.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận setBatchCreationFee() trên MetaMask...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_CORE_ABI, signer);

      const newFeeWei = ethers.parseEther(newFeeEth);
      const tx = await contract.setBatchCreationFee(newFeeWei);

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang cập nhật phí...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Cập Nhật Mức Phí Thành Công!', `Mức phí tạo lô hàng đã chuyển sang ${newFeeEth} ETH.`, 'success');
      await fetchContractData();
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Lỗi Cập Nhật Phí', err?.reason || err?.message || 'Cần vai trò ROLE_ADMIN để đổi phí.', 'error');
    }
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
          onConnectWallet={handleOpenRoleConnectModal}
          onToggleDemoMode={() => {
            setIsDemoMode(!isDemoMode);
            addToast('Chuyển Chế Độ', !isDemoMode ? 'Đã bật chế độ xem trước' : 'Đã bật chế độ Web3 Thật', 'info');
          }}
          onSimulatedRoleChange={(role) => {
            setSimulatedRole(role);
            addToast('Góc Nhìn Vai Trò', `Đã chuyển sang góc nhìn: ${role}`, 'info');
          }}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {!currentAccount && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs font-sans">
              <div>
                <span className="font-bold block text-sm text-amber-950 font-serif">Chưa Kết Nối Ví Sepolia Testnet</span>
                <span>Vui lòng chọn vai trò tham gia và kết nối MetaMask để tương tác từ Smart Contract.</span>
              </div>
              <button
                onClick={handleOpenRoleConnectModal}
                className="px-4 py-2 bg-[#264939] text-white font-bold rounded-xl hover:bg-[#1c372b] transition-all shadow-xs shrink-0"
              >
                Chọn Vai Trò & Kết Nối Ví
              </button>
            </div>
          )}

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

      {/* Role Selection Modal Before Connecting MetaMask */}
      <RoleConnectModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelectRoleAndConnect={handleRoleSelectAndConnect}
      />

      {/* Connected Wallet Details Modal */}
      <WalletDetailsModal
        isOpen={isWalletDetailsModalOpen}
        onClose={() => setIsWalletDetailsModalOpen(false)}
        account={currentAccount || ''}
        roleTitle={getRoleTitle(
          simulatedRole === 'ADMIN' ? ROLE_HASHES.ROLE_ADMIN :
          simulatedRole === 'PRODUCER' ? ROLE_HASHES.ROLE_PRODUCER :
          simulatedRole === 'LOGISTICS' ? ROLE_HASHES.ROLE_LOGISTICS :
          simulatedRole === 'RETAILER' ? ROLE_HASHES.ROLE_RETAILER :
          simulatedRole === 'INSPECTOR' ? ROLE_HASHES.ROLE_INSPECTOR : ''
        )}
        producerStakeBalance={producerStakeBalance}
        onDisconnect={handleDisconnectWallet}
      />

      {/* QR Stamp Printable Modal */}
      <QRStampModal batch={qrStampBatch} onClose={() => setQrStampBatch(null)} />
    </div>
  );
};
