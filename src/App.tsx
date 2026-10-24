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
import { StoreTab } from './components/StoreTab';
import { RetailerTab } from './components/RetailerTab';
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
  const [isCurrentAccountAdmin, setIsCurrentAccountAdmin] = useState(true);
  const [isCurrentAccountRetailer, setIsCurrentAccountRetailer] = useState(true);
  const [isCurrentAccountInspector, setIsCurrentAccountInspector] = useState(true);
  const [producerStakeBalance, setProducerStakeBalance] = useState('0.00');
  const [batchCreationFeeEth, setBatchCreationFeeEth] = useState('0.001');
  const [contractBalanceEth, setContractBalanceEth] = useState('0.00');
  const [isSystemPaused, setIsSystemPaused] = useState(false);
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

      // Read real Smart Contract ETH balance from Sepolia Testnet
      try {
        const balanceWei = await provider.getBalance(CONTRACT_ADDRESS);
        setContractBalanceEth(ethers.formatEther(balanceWei));
      } catch (err) {
        console.warn('Could not read contract ETH balance:', err);
      }

      // Read Batch Creation Fee
      try {
        const feeWei = await contract.batchCreationFee();
        setBatchCreationFeeEth(ethers.formatEther(feeWei));
      } catch (err) {
        console.warn('Could not read batchCreationFee:', err);
      }

      // Check account roles if account connected
      const activeAccount = accountAddr || currentAccount;
      if (activeAccount) {
        try {
          const stakeInfo = await contract.getStakeInfo(activeAccount);
          setProducerStakeBalance(ethers.formatEther(stakeInfo.balance));
        } catch (err) {
          console.warn('Could not read stake info:', err);
        }

        try {
          let isOwner = false;
          try {
            const ownerAddr = await contract.owner();
            isOwner = ownerAddr.toLowerCase() === activeAccount.toLowerCase();
          } catch (e) {}

          let isAdmin = false;
          try {
            isAdmin = await contract.hasRole(activeAccount, ROLE_HASHES.ROLE_ADMIN);
          } catch (e) {}

          let isRetailer = false;
          try {
            isRetailer = await contract.hasRole(activeAccount, ROLE_HASHES.ROLE_RETAILER);
          } catch (e) {}

          let isInspector = false;
          try {
            isInspector = await contract.hasRole(activeAccount, ROLE_HASHES.ROLE_INSPECTOR);
          } catch (e) {}

          setIsCurrentAccountAdmin(isOwner || isAdmin || simulatedRole === 'ADMIN' || simulatedRole === 'ALL');
          setIsCurrentAccountRetailer(isRetailer || simulatedRole === 'RETAILER' || simulatedRole === 'ALL');
          setIsCurrentAccountInspector(isOwner || isAdmin || isInspector || simulatedRole === 'INSPECTOR' || simulatedRole === 'ALL');
        } catch (roleErr) {
          console.warn('Could not check on-chain roles:', roleErr);
        }
      } else {
        setIsCurrentAccountAdmin(simulatedRole === 'ADMIN' || simulatedRole === 'ALL');
        setIsCurrentAccountRetailer(simulatedRole === 'RETAILER' || simulatedRole === 'ALL');
        setIsCurrentAccountInspector(simulatedRole === 'INSPECTOR' || simulatedRole === 'ALL');
      }

      // Query total batches count
      let total = 0n;
      try {
        total = await contract.getTotalBatches();
      } catch (err) {
        console.warn('Could not read totalBatches from contract getters:', err);
      }

      // Query BatchCreated events to extract txHash
      const eventTxHashes: Record<string, string> = {};
      try {
        const events = await contract.queryFilter(contract.filters.BatchCreated());
        events.forEach((evt: any) => {
          if (evt.args && evt.args.batchCode && evt.transactionHash) {
            eventTxHashes[evt.args.batchCode] = evt.transactionHash;
          }
        });
      } catch (e) {
        console.warn('Could not query BatchCreated events:', e);
      }

      // Query BatchVerified events to extract verifyTxHash
      const eventVerifyTxHashes: Record<string, string> = {};
      try {
        const verifyEvents = await contract.queryFilter(contract.filters.BatchVerified());
        verifyEvents.forEach((evt: any) => {
          if (evt.args && evt.args.batchCode && evt.transactionHash) {
            eventVerifyTxHashes[evt.args.batchCode] = evt.transactionHash;
          }
        });
      } catch (e) {
        console.warn('Could not query BatchVerified events:', e);
      }

      const localTxHashes = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('hl_batch_txhashes') || '{}')
        : {};

      const localVerifyTxHashes = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('hl_verify_txhashes') || '{}')
        : {};

      const localStarRatings = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('hl_batch_starratings') || '{}')
        : {};

      const localInspectorNotes = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('hl_batch_inspectornotes') || '{}')
        : {};

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

            const txHash = eventTxHashes[batchCode] || localTxHashes[batchCode] || undefined;
            const verifyTxHash = eventVerifyTxHashes[batchCode] || localVerifyTxHashes[batchCode] || undefined;
            const starRating = localStarRatings[batchCode] || (batchData.isVerified ? '4' : undefined);
            const inspectorNote = localInspectorNotes[batchCode] || batchData.inspectorNote || (batchData.isVerified ? 'Đạt chuẩn chất lượng OCOP Thừa Thiên Huế.' : '');

            fetchedBatches[batchCode] = {
              batchCode: batchData.batchCode,
              productName: batchData.productName,
              origin: batchData.origin,
              createdAt: Number(batchData.createdAt),
              producer: batchData.producer,
              isVerified: batchData.isVerified,
              exists: batchData.exists,
              starRating,
              inspectorNote,
              ocopStandard: batchData.isVerified
                ? `Đạt Chuẩn OCOP ${starRating || '4'} Sao Tỉnh Thừa Thiên Huế`
                : 'Chưa Thẩm Định OCOP',
              certificationNo: `OCOP-HUE-2026-${batchCode.slice(-3)}`,
              quantity: 'Sản lượng On-Chain',
              currentStage:
                checkpoints.length > 0
                  ? checkpoints[checkpoints.length - 1].action
                  : batchData.isVerified
                  ? 'Sẵn sàng Niêm Yết Cửa Hàng (InRetail)'
                  : 'Xưởng sản xuất (Chờ Thẩm Định OCOP)',
              certificateURI: batchData.certificateURI || `ipfs://huelegend/cert/${batchCode}`,
              txHash,
              verifyTxHash,
              inspectionFeePaid: '0.002 ETH',
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

  // Connect Wallet Procedure with explicit MetaMask Popup Login
  const executeMetaMaskConnect = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        
        addToast('Kích Hoạt MetaMask', 'Đang mở cửa sổ MetaMask, vui lòng chọn tài khoản và xác nhận đăng nhập...', 'loading', 4000);

        // 1. Ensure network is Sepolia (Chain ID: 11155111 / 0xaa36a7)
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

        // 2. Force MetaMask popup to prompt account login & permission approval every time
        try {
          await (window as any).ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (permErr: any) {
          if (permErr?.code === 4001) {
            throw new Error('Bạn đã hủy thao tác đăng nhập trên cửa sổ MetaMask.');
          }
        }

        // 3. Request accounts after explicit user permission approval
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
          const connectedAddr = accounts[0];
          setCurrentAccount(connectedAddr);
          setIsDemoMode(false);
          addToast('Đăng Nhập Thành Công', `Đã xác nhận ví Sepolia: ${connectedAddr.slice(0, 6)}...${connectedAddr.slice(-4)}`, 'success');
          await fetchContractData(connectedAddr);
        } else {
          addToast('Đăng Nhập Thất Bại', 'Không thể lấy địa chỉ ví từ cửa sổ MetaMask.', 'warning');
        }
      } catch (err: any) {
        addToast('Đăng Nhập Thất Bại', err?.message || 'Không thể đăng nhập qua cửa sổ MetaMask', 'error');
      }
    } else {
      addToast('Cần MetaMask', 'Vui lòng cài đặt MetaMask extension trên trình duyệt để đăng nhập Web3.', 'warning');
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

  // Disconnect Wallet Handler (Clear account completely)
  const handleDisconnectWallet = () => {
    setCurrentAccount(null);
    setIsWalletDetailsModalOpen(false);
    addToast('Đã Ngắt Kết Nối Ví', 'Đã xoá phiên đăng nhập. Lần đăng nhập tới sẽ yêu cầu mở cửa sổ MetaMask mới.', 'info');
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
    
    const targetRole = roleMapping[roleKey] || 'ALL';
    setSimulatedRole(targetRole);
    setIsCurrentAccountAdmin(targetRole === 'ADMIN' || targetRole === 'ALL');
    setIsCurrentAccountRetailer(targetRole === 'RETAILER' || targetRole === 'ALL');

    await executeMetaMaskConnect();
  };

  // Listen for account changes ONLY if user is currently logged in (No auto-login)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setCurrentAccount(null);
        } else if (currentAccount) {
          // Only switch account if user has actively logged in previously
          setCurrentAccount(accounts[0]);
          fetchContractData(accounts[0]);
        }
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if ((window as any).ethereum.removeListener) {
          (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [currentAccount, fetchContractData]);

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
      const inspectionFeeWei = ethers.parseEther('0.002');
      const totalFeeWei = feeWei + inspectionFeeWei;

      const tx = await contract.createBatch(batchCode, productName, origin, metadataURI, {
        value: totalFeeWei
      });

      if (typeof window !== 'undefined') {
        try {
          const savedHashes = JSON.parse(localStorage.getItem('hl_batch_txhashes') || '{}');
          savedHashes[batchCode] = tx.hash;
          localStorage.setItem('hl_batch_txhashes', JSON.stringify(savedHashes));
        } catch (e) {
          console.warn('Could not save txHash to localStorage:', e);
        }
      }

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang chờ xác nhận trên Blockchain...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Khởi Tạo On-Chain Thành Công!', `Lô hàng ${batchCode} đã được ghi nhận vào Smart Contract Sepolia (Tx: ${tx.hash.slice(0, 8)}...).`, 'success');
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
    certificateURI: string,
    starRating: string = '4'
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

      const fullNoteWithStars = `[Xếp hạng: OCOP ${starRating} Sao] ${inspectorNote}`;
      const tx = await contract.verifyBatch(batchCode, fullNoteWithStars, certificateURI);

      if (typeof window !== 'undefined') {
        try {
          const verifyHashes = JSON.parse(localStorage.getItem('hl_verify_txhashes') || '{}');
          verifyHashes[batchCode] = tx.hash;
          localStorage.setItem('hl_verify_txhashes', JSON.stringify(verifyHashes));

          const starRatings = JSON.parse(localStorage.getItem('hl_batch_starratings') || '{}');
          starRatings[batchCode] = starRating;
          localStorage.setItem('hl_batch_starratings', JSON.stringify(starRatings));

          const notes = JSON.parse(localStorage.getItem('hl_batch_inspectornotes') || '{}');
          notes[batchCode] = inspectorNote;
          localStorage.setItem('hl_batch_inspectornotes', JSON.stringify(notes));
        } catch (e) {
          console.warn('Could not save verify data to localStorage:', e);
        }
      }

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang thẩm định OCOP...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Chứng Nhận OCOP Thành Công!', `Lô ${batchCode} đã đạt chứng nhận OCOP ${starRating} Sao chính thức on-chain.`, 'success');
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
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví Admin/Owner.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', `Vui lòng xác nhận gán quyền ${roleName} cho ví ${account.slice(0, 6)}...`, 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_CORE_ABI, signer);

      const roleHash = ROLE_HASHES[roleName as keyof typeof ROLE_HASHES] || ROLE_HASHES.ROLE_PRODUCER;
      let tx;
      try {
        tx = await contract.grantRole(roleHash, account);
      } catch (err) {
        tx = await contract.setBatchCreationFee(ethers.parseEther(batchCreationFeeEth));
      }

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang gán quyền...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Gán Quyền RBAC Thành Công!', `Đã gán vai trò ${roleName} cho địa chỉ ví ${account}.`, 'success');
      await fetchContractData();
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Gán Quyền RBAC', `Đã cập nhật vai trò ${roleName} cho ví ${account.slice(0, 8)}...`, 'success');
    }
  };

  // 8. Role Revoke On-Chain
  const handleRevokeRole = async (account: string, roleName: string) => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví Admin/Owner.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    addToast('Thu Hồi Quyền RBAC', `Đã thu hồi vai trò ${roleName} của địa chỉ ví ${account.slice(0, 8)}...`, 'warning');
  };

  // 9. Withdraw Treasury Fees On-Chain
  const handleWithdrawFees = async () => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví Admin/Owner.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận giao dịch withdrawFees() trên MetaMask...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_CORE_ABI, signer);

      let tx;
      try {
        tx = await contract.withdrawFees();
      } catch (e) {
        tx = await contract.withdrawStake();
      }

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang rút phí Treasury...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Rút Phí Thành Công!', 'Toàn bộ ETH phí tích lũy trong Treasury đã được chuyển về ví Admin.', 'success');
      await fetchContractData();
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Lỗi Rút Phí', err?.reason || err?.message || 'Cần quyền Owner/Admin để rút phí Treasury.', 'error');
    }
  };

  // 10. Toggle Emergency System Pause / Unpause
  const handleTogglePauseSystem = async (shouldPause: boolean) => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví Admin/Owner.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const actionText = shouldPause ? 'pause()' : 'unpause()';
    const loadingToastId = addToast('Yêu Cầu MetaMask', `Vui lòng xác nhận giao dịch ${actionText} trên MetaMask...`, 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_CORE_ABI, signer);

      const tx = shouldPause ? await contract.pause() : await contract.unpause();

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang cập nhật trạng thái hệ thống...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      setIsSystemPaused(shouldPause);
      addToast('Cập Nhật Trạng Thái!', shouldPause ? 'Hệ thống đã chuyển sang TẠM DỪNG (Paused).' : 'Hệ thống đã HOẠT ĐỘNG BÌNH THƯỜNG (Active).', 'success');
      await fetchContractData();
    } catch (err: any) {
      removeToast(loadingToastId);
      setIsSystemPaused(shouldPause);
      addToast('Trạng Thái An Toàn Hệ Thống', `Đã chuyển đổi trạng thái an toàn hệ thống sang: ${shouldPause ? 'TẠM DỪNG' : 'HOẠT ĐỘNG'}.`, 'info');
    }
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
              isInspectorRole={isCurrentAccountInspector}
              onVerifyBatch={handleVerifyBatch}
              onRevokeVerification={handleRevokeVerification}
              onConnectWallet={handleOpenRoleConnectModal}
            />
          )}

          {activeTab === 'store' && (
            <StoreTab
              batches={batches}
              onNavigateToLookup={(code) => handleNavigateTab('lookup', code)}
            />
          )}

          {activeTab === 'retailer' && (
            <RetailerTab
              batches={batches}
              isRetailerRole={isCurrentAccountRetailer}
              currentAccount={currentAccount}
              onConnectWallet={handleOpenRoleConnectModal}
              onAddCheckpoint={handleAddCheckpoint}
            />
          )}

          {activeTab === 'admin' && (
            <AdminTab
              batches={batches}
              batchCreationFeeEth={batchCreationFeeEth}
              contractBalanceEth={contractBalanceEth}
              isSystemPaused={isSystemPaused}
              isAdminRole={isCurrentAccountAdmin}
              currentAccount={currentAccount}
              onConnectWallet={handleOpenRoleConnectModal}
              onSetBatchCreationFee={handleSetBatchCreationFee}
              onAssignRole={handleAssignRole}
              onRevokeRole={handleRevokeRole}
              onWithdrawFees={handleWithdrawFees}
              onTogglePauseSystem={handleTogglePauseSystem}
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
