import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Batch, ToastMessage, GrantedWallet } from './types';
import {
  CONTRACT_ADDRESS,
  PROJECT_CORE_ABI,
  SEPOLIA_CHAIN_ID,
  ROLE_HASHES,
  ETHERSCAN_BASE_URL,
  DEFAULT_ADMIN_ADDRESS,
  safeGetAddress
} from './constants';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
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
import { BatchJourneyModal } from './components/BatchJourneyModal';
import { MobileMetaMaskModal } from './components/MobileMetaMaskModal';
import persistedCodeBatches from './data/persistedBatches.json';

export const App: React.FC = () => {
  // Global State
  const [batches, setBatches] = useState<Record<string, Batch>>({});
  const [grantedWallets, setGrantedWallets] = useState<GrantedWallet[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLookupBatch, setSelectedLookupBatch] = useState('');
  const [qrStampBatch, setQrStampBatch] = useState<Batch | null>(null);
  const [journeyBatch, setJourneyBatch] = useState<Batch | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isWalletDetailsModalOpen, setIsWalletDetailsModalOpen] = useState(false);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [isMobileMetaMaskModalOpen, setIsMobileMetaMaskModalOpen] = useState(false);
  const [mobileMetaMaskDeepLink, setMobileMetaMaskDeepLink] = useState('');
  const [modalClickPos, setModalClickPos] = useState<{ x: number; y: number } | null>(null);

  // Web3 Connection State
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState('ALL');
  const [isCurrentAccountAdmin, setIsCurrentAccountAdmin] = useState(true);
  const [isCurrentAccountRetailer, setIsCurrentAccountRetailer] = useState(true);
  const [isCurrentAccountInspector, setIsCurrentAccountInspector] = useState(true);
  const [isCurrentAccountLogistics, setIsCurrentAccountLogistics] = useState(true);
  const [producerStakeBalance, setProducerStakeBalance] = useState('0.00');
  const [batchCreationFeeEth, setBatchCreationFeeEth] = useState('0.001');
  const [contractBalanceEth, setContractBalanceEth] = useState('0.00');
  const [customerSalesEth, setCustomerSalesEth] = useState('0.00');
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
    if (roleHash === ROLE_HASHES.ROLE_LOGISTICS) return 'Đơn Vị Vận Chuyển';
    if (roleHash === ROLE_HASHES.ROLE_RETAILER) return 'Đại Lý Phân Phối';
    if (roleHash === ROLE_HASHES.ROLE_INSPECTOR) return 'Kiểm Định Viên OCOP';
    if (roleHash === ROLE_HASHES.ROLE_ADMIN) return 'Quản Trị Viên';
    return 'Đơn Vị Tham Gia';
  };

  // Truy vấn dữ liệu trực tiếp từ Smart Contract Sepolia thông qua Ethers.js RPC Provider (Không sử dụng LocalStorage)
  const fetchContractData = useCallback(async (accountAddr?: string) => {
    if (typeof window === 'undefined') return;

    setIsLoadingContract(true);
    try {
      const normalizedContractAddr = safeGetAddress(CONTRACT_ADDRESS);

      // Khởi tạo Ethers.js Provider: Ưu tiên BrowserProvider nếu kết nối ví, hoặc JsonRpcProvider Sepolia RPC
      const provider = (window as any).ethereum
        ? new ethers.BrowserProvider((window as any).ethereum)
        : new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');

      const contract = new ethers.Contract(normalizedContractAddr, PROJECT_CORE_ABI, provider);

      // 1. Truy vấn số dư ETH của Smart Contract từ Sepolia Testnet
      try {
        const balanceWei = await provider.getBalance(normalizedContractAddr);
        setContractBalanceEth(ethers.formatEther(balanceWei));
      } catch (err) {
        console.warn('Khong the lay so du ETH cua contract:', err);
      }

      // 2. Truy vấn phí khởi tạo lô hàng từ Smart Contract
      try {
        const feeWei = await contract.batchCreationFee();
        setBatchCreationFeeEth(ethers.formatEther(feeWei));
      } catch (err) {
        console.warn('Khong the lay phi tao lo hang:', err);
      }

      // 3. Kiểm tra vai trò và số tiền ký quỹ On-Chain
      const activeAccount = accountAddr || currentAccount;
      if (activeAccount) {
        const normalizedActiveAccount = safeGetAddress(activeAccount);
        try {
          const stakeInfo = await contract.getStakeInfo(normalizedActiveAccount);
          setProducerStakeBalance(ethers.formatEther(stakeInfo.balance));
        } catch (err) {
          console.warn('Khong the lay stake info:', err);
        }

        try {
          let isOwner = false;
          try {
            const ownerAddr = await contract.owner();
            isOwner = safeGetAddress(ownerAddr).toLowerCase() === normalizedActiveAccount.toLowerCase();
          } catch (e) {}

          let isAdmin = false;
          try {
            isAdmin = await contract.hasRole(normalizedActiveAccount, ROLE_HASHES.ROLE_ADMIN);
          } catch (e) {}

          let isRetailer = false;
          try {
            isRetailer = await contract.hasRole(normalizedActiveAccount, ROLE_HASHES.ROLE_RETAILER);
          } catch (e) {}

          let isInspector = false;
          try {
            isInspector = await contract.hasRole(normalizedActiveAccount, ROLE_HASHES.ROLE_INSPECTOR);
          } catch (e) {}

          let isLogistics = false;
          try {
            isLogistics = await contract.hasRole(normalizedActiveAccount, ROLE_HASHES.ROLE_LOGISTICS);
          } catch (e) {}

          const isSpecifiedAdmin = Boolean(
            normalizedActiveAccount && normalizedActiveAccount.toLowerCase() === safeGetAddress(DEFAULT_ADMIN_ADDRESS).toLowerCase()
          );

          setIsCurrentAccountAdmin(isSpecifiedAdmin);
          setIsCurrentAccountRetailer(true);
          setIsCurrentAccountInspector(isOwner || isAdmin || isInspector || isSpecifiedAdmin || simulatedRole === 'INSPECTOR' || simulatedRole === 'ALL');
          setIsCurrentAccountLogistics(isOwner || isAdmin || isLogistics || isSpecifiedAdmin || simulatedRole === 'LOGISTICS' || simulatedRole === 'ALL');
        } catch (roleErr) {
          console.warn('Khong the kiem tra vai tro on-chain:', roleErr);
        }
      } else {
        setIsCurrentAccountAdmin(false);
        setIsCurrentAccountRetailer(true);
        setIsCurrentAccountInspector(simulatedRole === 'INSPECTOR' || simulatedRole === 'ALL');
        setIsCurrentAccountLogistics(simulatedRole === 'LOGISTICS' || simulatedRole === 'ALL');
      }

      // 4. Truy vấn toàn bộ danh sách lô hàng trực tiếp từ Smart Contract qua Ethers.js
      let total = 0n;
      try {
        total = await contract.getTotalBatches();
      } catch (err) {
        console.warn('Khong the lay totalBatches tu Smart Contract:', err);
      }

      const fetchedBatches: Record<string, Batch> = {};

      if (total > 0n) {
        for (let i = 0n; i < total; i++) {
          try {
            const batchCode = await contract.getBatchCodeByIndex(i);
            const batchData = await contract.getBatch(batchCode);
            const isVerifiedOnChain = Boolean(batchData.isVerified);

            // Truy vấn mảng nhật ký chặng (checkpoints) trực tiếp từ Smart Contract
            const checkpointsData = await contract.getCheckpoints(batchCode);

            const checkpoints = checkpointsData.map((cp: any, idx: number) => {
              const actionText = String(cp.action || '');
              return {
                stepName: `Chặng ${idx + 1}: ${actionText.slice(0, 35)}${actionText.length > 35 ? '...' : ''}`,
                role: cp.role,
                roleTitle: getRoleTitle(cp.role),
                location: cp.location,
                action: actionText,
                timestamp: Number(cp.timestamp),
                recorder: cp.recorder,
                metadataURI: cp.metadataURI,
                txHash: 'Xác thực On-Chain Sepolia Block',
                conditionNote: 'Dữ liệu được truy vấn trực tiếp từ Smart Contract qua Ethers.js RPC Provider.'
              };
            });

            // Tách xếp hạng sao kiểm định OCOP từ nhật ký chặng
            let starRating = '4';
            let inspectorNote = '';
            const inspectorCp = checkpoints.find((cp: any) => cp.role === ROLE_HASHES.ROLE_INSPECTOR || (cp.action && cp.action.toLowerCase().includes('ocop')));
            if (inspectorCp) {
              const starMatch = inspectorCp.action.match(/(\d)\s*Sao/i);
              if (starMatch && starMatch[1]) starRating = starMatch[1];
              inspectorNote = inspectorCp.action;
            }

            // Kiểm tra trạng thái niêm yết bán lẻ on-chain
            const isListedOnChain = checkpoints.some(
              (cp: any) =>
                cp.role === ROLE_HASHES.ROLE_RETAILER ||
                (cp.action && cp.action.toLowerCase().includes('niêm yết')) ||
                (cp.action && cp.action.toLowerCase().includes('inretail'))
            );

            // Trích xuất số lượng nhập kho/sản lượng từ nhật ký sản xuất ban đầu
            let onChainQuantity = '';
            if (checkpoints.length > 0) {
              const cp1Action = checkpoints[0].action;
              const qtyMatch = cp1Action.match(/Sản lượng:\s*([^—\n]+)/i);
              if (qtyMatch && qtyMatch[1]) {
                onChainQuantity = qtyMatch[1].trim();
              }
            }

            fetchedBatches[batchCode] = {
              batchCode: batchData.batchCode,
              productName: batchData.productName,
              origin: batchData.origin,
              createdAt: Number(batchData.createdAt),
              producer: batchData.producer,
              isVerified: isVerifiedOnChain,
              starRating: isVerifiedOnChain ? starRating : '',
              inspectorNote: isVerifiedOnChain ? inspectorNote : '',
              isListed: isListedOnChain,
              exists: batchData.exists,
              ocopStandard: isVerifiedOnChain
                ? `Đạt Chuẩn OCOP ${starRating} Sao Tỉnh Thừa Thiên Huế`
                : 'Chưa Thẩm Định OCOP',
              certificationNo: `OCOP-HUE-2026-${batchCode.slice(-3)}`,
              quantity: onChainQuantity,
              currentStage:
                checkpoints.length > 0
                  ? checkpoints[checkpoints.length - 1].action
                  : isVerifiedOnChain
                  ? 'Đã đạt chuẩn OCOP (Chờ Vận Chuyển)'
                  : 'Xưởng sản xuất (Chờ Thẩm Định OCOP)',
              certificateURI: batchData.certificateURI || `ipfs://huelegend/cert/${batchCode}`,
              txHash: 'Xác nhận từ Smart Contract',
              inspectionFeePaid: '0.002 ETH',
              checkpoints
            };
          } catch (e) {
            console.error(`Lỗi truy vấn lô hàng chỉ số ${i} từ Smart Contract:`, e);
          }
        }
      }

      // Cập nhật State trực tiếp từ kết quả truy vấn Ethers.js
      setBatches(fetchedBatches);
    } catch (err: any) {
      console.warn('Lỗi kết nối RPC Provider Smart Contract:', err);
    } finally {
      setIsLoadingContract(false);
    }
  }, [currentAccount, simulatedRole]);

  // Tu dong doc tham so ?batch=... tu URL (khi quet QR) va mo Popup Nhat Ky Hanh Trinh Chi Tiet On-Chain
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const searchString = window.location.search || (window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : '');
        const urlParams = new URLSearchParams(searchString);
        const batchFromUrl = urlParams.get('batch') || urlParams.get('batchCode');
        if (batchFromUrl) {
          const cleanCode = batchFromUrl.trim().toUpperCase();
          setActiveTab('lookup');

          if (batches[cleanCode]) {
            setSelectedLookupBatch(cleanCode);
            setJourneyBatch(batches[cleanCode]);
          } else {
            // Truoc khi tat ca danh sach batch duoc fetch xong, truy van RPC don le cho cleanCode
            const fetchSingleBatch = async () => {
              try {
                const normalizedContractAddr = safeGetAddress(CONTRACT_ADDRESS);
                const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
                const contract = new ethers.Contract(normalizedContractAddr, PROJECT_CORE_ABI, provider);

                const batchData = await contract.getBatch(cleanCode);
                if (batchData && batchData.exists) {
                  const isVerifiedOnChain = Boolean(batchData.isVerified);
                  const checkpointsData = await contract.getCheckpoints(cleanCode);

                  const checkpoints = checkpointsData.map((cp: any, idx: number) => {
                    const actionText = String(cp.action || '');
                    return {
                      stepName: `Chặng ${idx + 1}: ${actionText.slice(0, 35)}${actionText.length > 35 ? '...' : ''}`,
                      role: cp.role,
                      roleTitle: getRoleTitle(cp.role),
                      location: cp.location,
                      action: actionText,
                      timestamp: Number(cp.timestamp),
                      recorder: cp.recorder,
                      metadataURI: cp.metadataURI,
                      txHash: 'Xác thực On-Chain Sepolia Block',
                      conditionNote: 'Dữ liệu được truy vấn trực tiếp từ Smart Contract qua Ethers.js RPC Provider.'
                    };
                  });

                  let starRating = '4';
                  let inspectorNote = '';
                  const inspectorCp = checkpoints.find((cp: any) => cp.role === ROLE_HASHES.ROLE_INSPECTOR || (cp.action && cp.action.toLowerCase().includes('ocop')));
                  if (inspectorCp) {
                    const starMatch = inspectorCp.action.match(/(\d)\s*Sao/i);
                    if (starMatch && starMatch[1]) starRating = starMatch[1];
                    inspectorNote = inspectorCp.action;
                  }

                  const isListedOnChain = checkpoints.some(
                    (cp: any) =>
                      cp.role === ROLE_HASHES.ROLE_RETAILER ||
                      (cp.action && cp.action.toLowerCase().includes('niêm yết')) ||
                      (cp.action && cp.action.toLowerCase().includes('inretail'))
                  );

                  let onChainQuantity = '';
                  if (checkpoints.length > 0) {
                    const cp1Action = checkpoints[0].action;
                    const qtyMatch = cp1Action.match(/Sản lượng:\s*([^—\n]+)/i);
                    if (qtyMatch && qtyMatch[1]) {
                      onChainQuantity = qtyMatch[1].trim();
                    }
                  }

                  const singleBatch: Batch = {
                    batchCode: batchData.batchCode,
                    productName: batchData.productName,
                    origin: batchData.origin,
                    createdAt: Number(batchData.createdAt),
                    producer: batchData.producer,
                    isVerified: isVerifiedOnChain,
                    starRating: isVerifiedOnChain ? starRating : '',
                    inspectorNote: isVerifiedOnChain ? inspectorNote : '',
                    isListed: isListedOnChain,
                    exists: batchData.exists,
                    ocopStandard: isVerifiedOnChain
                      ? `Đạt Chuẩn OCOP ${starRating} Sao Tỉnh Thừa Thiên Huế`
                      : 'Chưa Thẩm Định OCOP',
                    certificationNo: `OCOP-HUE-2026-${cleanCode.slice(-3)}`,
                    quantity: onChainQuantity,
                    currentStage:
                      checkpoints.length > 0
                        ? checkpoints[checkpoints.length - 1].action
                        : isVerifiedOnChain
                        ? 'Đã đạt chuẩn OCOP (Chờ Vận Chuyển)'
                        : 'Xưởng sản xuất (Chờ Thẩm Định OCOP)',
                    certificateURI: batchData.certificateURI || `ipfs://huelegend/cert/${cleanCode}`,
                    txHash: 'Xác nhận từ Smart Contract',
                    inspectionFeePaid: '0.002 ETH',
                    checkpoints
                  };

                  setBatches((prev) => ({ ...prev, [cleanCode]: singleBatch }));
                  setSelectedLookupBatch(cleanCode);
                  setJourneyBatch(singleBatch);
                }
              } catch (err) {
                console.warn('Loi khi truy van lo hang tu QR URL qua RPC:', err);
              }
            };
            fetchSingleBatch();
          }
        }
      } catch (e) {
        console.warn('Khong the doc tham so URL QR:', e);
      }
    }
  }, [batches]);

  // Helper phat tin hieu dong bo du lieu thoi gian thuc giua cac phien Desktop & Mobile
  const notifyDataSync = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hl_last_sync_timestamp', Date.now().toString());
        window.dispatchEvent(new Event('storage'));
        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel('huelegend_auto_sync');
          channel.postMessage({ type: 'SYNC_RELOAD', timestamp: Date.now() });
          channel.close();
        }

        // Gui du lieu cap nhat len cloud sync endpoint de Mobile khac thiet bi tu dong dong bo
        const savedBatchesStr = localStorage.getItem('hl_local_batches');
        const savedWalletsStr = localStorage.getItem('hl_granted_wallets');
        const savedRole = localStorage.getItem('hl_user_role') || 'ALL';
        const savedAccount = localStorage.getItem('hl_connected_account');

        const payload = {
          batches: savedBatchesStr ? JSON.parse(savedBatchesStr) : batches,
          grantedWallets: savedWalletsStr ? JSON.parse(savedWalletsStr) : grantedWallets,
          activeTab,
          selectedLookupBatch,
          simulatedRole: savedRole,
          currentAccount: savedAccount,
          updatedAt: Date.now()
        };

        fetch('/api/sync?code=huelegend_global_sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (e) {}
    }
  }, [batches, grantedWallets, activeTab, selectedLookupBatch]);

  // Tu dong ket noi va dong bo du lieu theo thoi gian thuc giua giao dien May Tinh (Desktop) va Dien Thoai (Mobile)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncLocalState = async () => {
      try {
        // 1. Du lieu lo hang (batches) duoc truy van truc tiep tu Smart Contract qua Ethers.js RPC Provider (Khong su dung LocalStorage)

        // 2. Dong bo danh sach vi duoc cap quyen (grantedWallets) tu local
        const savedWalletsStr = localStorage.getItem('hl_granted_wallets');
        if (savedWalletsStr) {
          const parsed = JSON.parse(savedWalletsStr);
          if (Array.isArray(parsed)) {
            setGrantedWallets((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
                return parsed;
              }
              return prev;
            });
          }
        }

        // 3. Dong bo tab dang mo (activeTab)
        const savedTab = localStorage.getItem('hl_active_tab');
        if (savedTab) {
          setActiveTab((prev) => (prev !== savedTab ? savedTab : prev));
        }

        // 4. Dong bo vai tro dang xem (simulatedRole)
        const savedRole = localStorage.getItem('hl_user_role');
        if (savedRole) {
          setSimulatedRole((prev) => (prev !== savedRole ? savedRole : prev));
        }

        // 6. Dong bo phien ket noi vi (currentAccount)
        const savedAccount = localStorage.getItem('hl_connected_account');
        if (savedAccount !== currentAccount) {
          setCurrentAccount(savedAccount || null);
        }

        // 7. Dong bo cloud tu /api/sync neu co du lieu moi tu thiet bi khac (Desktop -> Mobile)
        try {
          const res = await fetch('/api/sync?code=huelegend_global_sync');
          if (res.ok) {
            const json = await res.json();
            if (json?.data) {
              if (Array.isArray(json.data.grantedWallets) && json.data.grantedWallets.length > 0) {
                setGrantedWallets((prev) => {
                  if (JSON.stringify(prev) !== JSON.stringify(json.data.grantedWallets)) {
                    try {
                      localStorage.setItem('hl_granted_wallets', JSON.stringify(json.data.grantedWallets));
                    } catch (e) {}
                    return json.data.grantedWallets;
                  }
                  return prev;
                });
              }
            }
          }
        } catch (e) {}
      } catch (e) {
        console.warn('Loi dong bo thoi gian thuc:', e);
      }
    };

    // Lang nghe su kien storage tu phien lam viec khac (cross-tab/window)
    window.addEventListener('storage', syncLocalState);

    // Lang nghe BroadcastChannel giua cac giao dien
    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('huelegend_auto_sync');
        channel.onmessage = (msg) => {
          if (msg.data?.type === 'SYNC_RELOAD') {
            syncLocalState();
          }
        };
      } catch (e) {}
    }

    // Polling heartbeat (1000ms) dam bao giao dien Mobile tu dong cap nhat lap tuc khi Desktop co thay doi
    const syncInterval = setInterval(() => {
      syncLocalState();
    }, 1000);

    return () => {
      window.removeEventListener('storage', syncLocalState);
      if (channel) channel.close();
      clearInterval(syncInterval);
    };
  }, [currentAccount]);

  // Tu dong day du lieu batches len cloud sync endpoint ngay khi co bat ky lo hang nao duoc khoi tao hoac thay doi o Desktop
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(batches).length > 0) {
      try {
        localStorage.setItem('hl_local_batches', JSON.stringify(batches));
        const payload = {
          batches,
          grantedWallets,
          activeTab,
          selectedLookupBatch,
          simulatedRole,
          currentAccount,
          updatedAt: Date.now()
        };
        fetch('/api/sync?code=huelegend_global_sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (e) {}
    }
  }, [batches, grantedWallets, activeTab, selectedLookupBatch, simulatedRole, currentAccount]);


  // Khoi phuc du lieu va phien dang nhap tu localStorage ngay khi load lai trang
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBatchesStr = localStorage.getItem('hl_local_batches');
        if (savedBatchesStr) {
          const parsed = JSON.parse(savedBatchesStr);
          if (parsed && Object.keys(parsed).length > 0) {
            setBatches(parsed);
          }
        }

        let savedRole = localStorage.getItem('hl_user_role') || 'ALL';
        const savedAccount = localStorage.getItem('hl_connected_account');

        const savedWalletsStr = localStorage.getItem('hl_granted_wallets');
        let parsedWallets: GrantedWallet[] = [];
        if (savedWalletsStr) {
          try {
            const parsed = JSON.parse(savedWalletsStr);
            if (Array.isArray(parsed)) {
              parsedWallets = parsed;
              setGrantedWallets(parsed);
            }
          } catch (e) {}
        }

        if (savedAccount) {
          const isDefaultAdmin = savedAccount.toLowerCase() === DEFAULT_ADMIN_ADDRESS.toLowerCase();
          if (savedRole === 'ADMIN' && !isDefaultAdmin) {
            savedRole = 'CUSTOMER';
            localStorage.setItem('hl_user_role', 'CUSTOMER');
          } else if (savedRole === 'INSPECTOR') {
            const isInspectorAuthorized =
              isDefaultAdmin ||
              parsedWallets.some(
                (w) =>
                  w.address.toLowerCase() === savedAccount.toLowerCase() &&
                  (w.role === 'ROLE_INSPECTOR' || w.role === 'ROLE_ADMIN')
              );
            if (!isInspectorAuthorized) {
              savedRole = 'CUSTOMER';
              localStorage.setItem('hl_user_role', 'CUSTOMER');
            }
          }
          setSimulatedRole(savedRole);
          setCurrentAccount(savedAccount);
          fetchContractData(savedAccount);
        } else {
          setSimulatedRole(savedRole);
          fetchContractData();
        }
      } catch (e) {
        console.warn('Error restoring state from localStorage:', e);
      }
    }
  }, [fetchContractData]);

  // Procedure ket noi vi MetaMask va xac thuc vai tro
  const executeMetaMaskConnect = async (targetRole?: string) => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const loadingToastId = addToast('Kích Hoạt MetaMask', 'Đang mở cửa sổ MetaMask, vui lòng chọn tài khoản và xác nhận đăng nhập...', 'loading', 0);
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);

        // 1. dam bao mang Sepolia
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

        // 2. Yeu cau cap quyen MetaMask
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

        // 3. Lay dia chi vi sau khi chap thuan
        const accounts = await provider.send('eth_requestAccounts', []);
        
        // Tu dong an thong bao Kich Hoat MetaMask ngay khi nguoi dung xac nhan ket noi
        removeToast(loadingToastId);

        if (accounts.length > 0) {
          const connectedAddr = accounts[0];
          setCurrentAccount(connectedAddr);
          setIsDemoMode(false);

          const isDefaultAdmin = connectedAddr.toLowerCase() === DEFAULT_ADMIN_ADDRESS.toLowerCase();

          let activeRole = targetRole || simulatedRole;

          if (activeRole === 'ADMIN' && !isDefaultAdmin) {
            addToast(
              'Từ Chối Quyền Quản Trị Viên',
              `Ví ${connectedAddr.slice(0, 6)}...${connectedAddr.slice(-4)} không phải ví Admin mặc định (${DEFAULT_ADMIN_ADDRESS.slice(0, 6)}...${DEFAULT_ADMIN_ADDRESS.slice(-4)}). Đã chuyển về vai trò Khách Hàng.`,
              'warning',
              7000
            );
            activeRole = 'CUSTOMER';
            if (activeTab === 'admin') {
              setActiveTab('overview');
            }
          }

          // Lay danh sach vi da duoc cap quyen RBAC tu state hoac localStorage
          let currentGrantedWallets = grantedWallets;
          if (currentGrantedWallets.length === 0 && typeof window !== 'undefined') {
            try {
              const savedWalletsStr = localStorage.getItem('hl_granted_wallets');
              if (savedWalletsStr) {
                const parsed = JSON.parse(savedWalletsStr);
                if (Array.isArray(parsed)) currentGrantedWallets = parsed;
              }
            } catch (e) {}
          }

          // Kiem tra quyen Kiem Dinh Vien (INSPECTOR) & Don Vi Van Chuyen (LOGISTICS)
          const isInspectorAuthorized =
            isDefaultAdmin ||
            currentGrantedWallets.some(
              (w) =>
                w.address.toLowerCase() === connectedAddr.toLowerCase() &&
                (w.role === 'ROLE_INSPECTOR' || w.role === 'ROLE_ADMIN')
            );

          if (activeRole === 'INSPECTOR' && !isInspectorAuthorized) {
            addToast(
              'Từ Chối Quyền Kiểm Định Viên',
              `Ví ${connectedAddr.slice(0, 6)}...${connectedAddr.slice(-4)} chưa được Admin cấp quyền ROLE_INSPECTOR. Đã chuyển về vai trò Khách Hàng.`,
              'warning',
              7000
            );
            activeRole = 'CUSTOMER';
            if (activeTab === 'inspector') {
              setActiveTab('overview');
            }
          }

          const isLogisticsAuthorized =
            isDefaultAdmin ||
            currentGrantedWallets.some(
              (w) =>
                w.address.toLowerCase() === connectedAddr.toLowerCase() &&
                (w.role === 'ROLE_LOGISTICS' || w.role === 'ROLE_ADMIN')
            );

          if (activeRole === 'LOGISTICS' && !isLogisticsAuthorized) {
            addToast(
              'Từ Chối Quyền Đơn Vị Vận Chuyển',
              `Ví ${connectedAddr.slice(0, 6)}...${connectedAddr.slice(-4)} chưa được Admin cấp quyền ROLE_LOGISTICS. Đã chuyển về vai trò Khách Hàng.`,
              'warning',
              7000
            );
            activeRole = 'CUSTOMER';
            if (activeTab === 'checkpoint') {
              setActiveTab('overview');
            }
          }

          setSimulatedRole(activeRole);
          setIsCurrentAccountAdmin(isDefaultAdmin);
          setIsCurrentAccountRetailer(activeRole === 'RETAILER' || activeRole === 'ALL');
          setIsCurrentAccountLogistics(isDefaultAdmin || isLogisticsAuthorized || activeRole === 'LOGISTICS' || activeRole === 'ALL');

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('hl_connected_account', connectedAddr);
              localStorage.setItem('hl_user_role', activeRole);
            } catch (e) {}
          }

          addToast('Đăng Nhập Thành Công', `Đã xác nhận ví Sepolia: ${connectedAddr.slice(0, 6)}...${connectedAddr.slice(-4)}`, 'success');
          await fetchContractData(connectedAddr);
        } else {
          addToast('Đăng Nhập Thất Bại', 'Không thể lấy địa chỉ ví từ cửa sổ MetaMask.', 'warning');
        }
      } catch (err: any) {
        removeToast(loadingToastId);
        addToast('Đăng Nhập Thất Bại', err?.message || 'Không thể đăng nhập qua cửa sổ MetaMask', 'error');
      } finally {
        removeToast(loadingToastId);
      }
    } else {
      const isMobileDevice = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobileDevice) {
        const currentHostAndPath = window.location.host + window.location.pathname + window.location.search;
        const deepLink = `https://metamask.app.link/dapp/${currentHostAndPath}`;
        setMobileMetaMaskDeepLink(deepLink);
        setIsMobileMetaMaskModalOpen(true);
        try {
          window.location.href = deepLink;
        } catch (e) {}
      } else {
        addToast('Cần MetaMask', 'Vui lòng cài đặt MetaMask extension trên trình duyệt để đăng nhập Web3.', 'warning');
      }
    }
  };

  // Mo modal hoac xem chi tiet vi tuy theo trang thai va vi tri bam
  const handleOpenRoleConnectModal = (e?: React.MouseEvent) => {
    if (e && e.clientX && e.clientY) {
      setModalClickPos({ x: e.clientX, y: e.clientY });
    } else {
      setModalClickPos(null);
    }

    if (currentAccount) {
      setIsWalletDetailsModalOpen(true);
    } else {
      setIsRoleModalOpen(true);
    }
  };

  // Ngat ket noi vi - Tra ve giao dien ban dau voi day du tinh nang
  const handleDisconnectWallet = () => {
    setCurrentAccount(null);
    setSimulatedRole('ALL');
    setActiveTab('overview');
    setIsCurrentAccountAdmin(false);
    setIsCurrentAccountRetailer(true);
    setIsCurrentAccountInspector(true);
    setIsCurrentAccountLogistics(true);
    setIsWalletDetailsModalOpen(false);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('hl_connected_account');
        localStorage.setItem('hl_user_role', 'ALL');
        localStorage.setItem('hl_active_tab', 'overview');
      } catch (e) {}
    }

    addToast('Đã Đăng Xuất', 'Đã quay lại giao diện ban đầu với đầy đủ tính năng.', 'info');
    fetchContractData();
  };

  // Chon vai tro trong Modal -> Ket noi vi MetaMask
  const handleRoleSelectAndConnect = async (roleKey: string) => {
    setIsRoleModalOpen(false);
    
    // Anh xa vai tro duoc chon
    const roleMapping: Record<string, string> = {
      ADMIN: 'ADMIN',
      SUPPLY_CHAIN: 'PRODUCER',
      LOGISTICS: 'LOGISTICS',
      COMMERCE: 'RETAILER',
      INSPECTOR: 'INSPECTOR',
      CUSTOMER: 'CUSTOMER'
    };
    
    const targetRole = roleMapping[roleKey] || 'CUSTOMER';

    // Kiem tra tab hien tai co hop le voi vai tro moi hay khong
    if ((targetRole === 'PRODUCER' || targetRole === 'SUPPLY_CHAIN') && !['overview', 'lookup', 'store', 'create-batch', 'inspector'].includes(activeTab)) {
      setActiveTab('overview');
    } else if (targetRole === 'LOGISTICS' && !['overview', 'lookup', 'store', 'checkpoint'].includes(activeTab)) {
      setActiveTab('overview');
    } else if ((targetRole === 'RETAILER' || targetRole === 'COMMERCE') && !['overview', 'lookup', 'store', 'retailer'].includes(activeTab)) {
      setActiveTab('overview');
    } else if (targetRole === 'INSPECTOR' && !['overview', 'lookup', 'store', 'inspector'].includes(activeTab)) {
      setActiveTab('overview');
    } else if (targetRole === 'CUSTOMER' && !['overview', 'lookup', 'store'].includes(activeTab)) {
      setActiveTab('overview');
    } else if (targetRole === 'ADMIN' && activeTab === 'admin') {
      // Sẽ duoc kiem tra trong executeMetaMaskConnect neu dia chi vi khong fai admin mac dinh
    }

    await executeMetaMaskConnect(targetRole);
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

  // Navigation Helper voi tinh nang luu va dong bo thoi gian thuc
  const handleNavigateTab = (tab: string, batchCodeSelect?: string) => {
    setActiveTab(tab);
    if (batchCodeSelect) {
      setSelectedLookupBatch(batchCodeSelect);
    } else if (tab === 'lookup') {
      setSelectedLookupBatch('');
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hl_active_tab', tab);
        if (batchCodeSelect) {
          localStorage.setItem('hl_selected_lookup_batch', batchCodeSelect);
        } else if (tab === 'lookup') {
          localStorage.removeItem('hl_selected_lookup_batch');
        }
      } catch (e) {}
    }
    notifyDataSync();
  };

  // 1. Create Batch (Wallet Connection Mandatory + Permanent Persistence)
  const handleCreateBatch = async (
    batchCode: string,
    productName: string,
    origin: string,
    metadataURI: string,
    imageUrl?: string,
    productionDate?: string,
    expiryDate?: string,
    quantity?: string
  ) => {
    // Bat buoc phai ket noi vi MetaMask truoc khi khoi tao
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng chọn vai trò & kết nối ví MetaMask trước khi khởi tạo lô hàng.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const cleanBatchCode = batchCode.trim();
    const cleanProductName = productName.trim();
    const cleanOrigin = origin.trim();
    const cleanQuantity = quantity?.trim() || '';
    const cleanMetadataURI = metadataURI.trim();
    const finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';

    const cleanProdDate = productionDate
      ? new Date(productionDate).toLocaleDateString('vi-VN')
      : new Date().toLocaleDateString('vi-VN');
    const cleanExpDate = expiryDate
      ? new Date(expiryDate).toLocaleDateString('vi-VN')
      : new Date(Date.now() + 180 * 24 * 3600 * 1000).toLocaleDateString('vi-VN');

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận giao dịch createBatch() trên MetaMask...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const rawUserAddr = await signer.getAddress();
      const cleanUserAddress = safeGetAddress(rawUserAddr);
      const cleanContractAddress = safeGetAddress(CONTRACT_ADDRESS);

      const contract = new ethers.Contract(cleanContractAddress, PROJECT_CORE_ABI, signer);

      let feeWei = ethers.parseEther('0.001');
      try {
        feeWei = await contract.batchCreationFee();
      } catch (feeErr) {
        console.warn('Cannot read batchCreationFee on-chain, using fallback 0.001 ETH:', feeErr);
      }

      const inspectionFeeWei = ethers.parseEther('0.002');
      const transportFeeWei = ethers.parseEther('0.002');
      const totalFeeWei = feeWei + inspectionFeeWei + transportFeeWei;

      const tx = await contract.createBatch(
        cleanBatchCode,
        cleanProductName,
        cleanOrigin,
        cleanMetadataURI,
        {
          value: totalFeeWei
        }
      );

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang chờ xác nhận trên Blockchain...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      const newBatchObj: Batch = {
        batchCode: cleanBatchCode,
        productName: cleanProductName,
        origin: cleanOrigin,
        imageUrl: finalImageUrl,
        productionDate: cleanProdDate,
        expiryDate: cleanExpDate,
        createdAt: Math.floor(Date.now() / 1000),
        producer: cleanUserAddress,
        isVerified: false,
        exists: true,
        ocopStandard: 'Chưa Thẩm Định OCOP',
        certificationNo: `OCOP-HUE-2026-${cleanBatchCode.slice(-3)}`,
        quantity: cleanQuantity,
        currentStage: 'Xưởng sản xuất (Chờ Thẩm Định OCOP)',
        certificateURI: `ipfs://huelegend/cert/${cleanBatchCode}`,
        txHash: tx.hash,
        inspectionFeePaid: '0.002 ETH',
        checkpoints: [
          {
            stepName: 'Chặng 1: Khai báo sản xuất ban đầu',
            role: ROLE_HASHES.ROLE_PRODUCER,
            roleTitle: 'Cơ Sở Sản Xuất',
            location: cleanOrigin,
            action: `Khởi tạo lô hàng & Thanh toán Phí Thẩm Định OCOP. NSX: ${cleanProdDate} - HSD: ${cleanExpDate}`,
            timestamp: Math.floor(Date.now() / 1000),
            recorder: cleanUserAddress,
            metadataURI: cleanMetadataURI,
            txHash: tx.hash,
            conditionNote: 'Khởi tạo lô hàng thành công trên Sepolia Testnet.'
          }
        ]
      };

      setBatches((prev) => ({ ...prev, [cleanBatchCode]: newBatchObj }));
      setSelectedLookupBatch(cleanBatchCode);
      setJourneyBatch(newBatchObj);
      notifyDataSync();
      addToast('Khởi Tạo On-Chain Thành Công!', `Lô hàng ${cleanBatchCode} đã được khởi tạo và lưu vĩnh viễn trên Smart Contract (Tx: ${tx.hash.slice(0, 8)}...).`, 'success');
      handleNavigateTab('lookup', cleanBatchCode);

      // Đồng bộ lại dữ liệu trực tiếp từ Smart Contract qua Ethers.js RPC Provider
      setTimeout(() => {
        fetchContractData(cleanUserAddress);
      }, 1000);
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Giao Dịch Thất Bại', err?.reason || err?.message || 'Không thể khởi tạo lô hàng trên Sepolia.', 'error');
    }
  };

  // 2. Add Checkpoint (Wallet Connection Mandatory + Permanent Persistence + Optional Listing Fee)
  const handleAddCheckpoint = async (
    batchCode: string,
    role: string,
    location: string,
    action: string,
    metadataURI: string,
    stepName: string,
    conditionNote: string,
    valueEth?: string | number
  ) => {
    // Bat buoc phai ket noi vi MetaMask truoc khi ghi chang
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng chọn vai trò & kết nối ví MetaMask trước khi ghi chặng.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const valueWei = valueEth && Number(valueEth) > 0 ? ethers.parseEther(Number(valueEth).toFixed(6)) : undefined;

    const loadingToastId = addToast(
      'Yêu Cầu MetaMask',
      valueWei
        ? `Vui lòng xác nhận giao dịch niêm yết (${Number(valueEth).toFixed(4)} ETH) trên MetaMask...`
        : 'Vui lòng xác nhận giao dịch addCheckpoint() trên MetaMask...',
      'loading',
      0
    );

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const rawUserAddr = await signer.getAddress();
      const cleanUserAddress = safeGetAddress(rawUserAddr);
      const contract = new ethers.Contract(safeGetAddress(CONTRACT_ADDRESS), PROJECT_CORE_ABI, signer);

      const roleHash = ROLE_HASHES[role as keyof typeof ROLE_HASHES] || ROLE_HASHES.ROLE_LOGISTICS;
      const fullActionText = conditionNote ? `${action} (Ghi chú: ${conditionNote})` : action;

      let tx;
      if (valueWei) {
        try {
          tx = await contract.addCheckpoint(batchCode, roleHash, location, fullActionText, metadataURI, { value: valueWei });
        } catch (callErr) {
          // Fallback neu hop dong khong phai payable tren bytecode: thuc hien addCheckpoint va transfer ETH
          tx = await contract.addCheckpoint(batchCode, roleHash, location, fullActionText, metadataURI);
          await signer.sendTransaction({
            to: safeGetAddress(CONTRACT_ADDRESS),
            value: valueWei
          });
        }
      } else {
        tx = await contract.addCheckpoint(batchCode, roleHash, location, fullActionText, metadataURI);
      }

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang chờ xác nhận...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      const newCheckpoint = {
        stepName: stepName || `Chặng mới: ${action}`,
        role: roleHash,
        roleTitle: getRoleTitle(roleHash),
        location,
        action: fullActionText,
        timestamp: Math.floor(Date.now() / 1000),
        recorder: cleanUserAddress,
        metadataURI,
        txHash: tx.hash,
        conditionNote: conditionNote || 'Ghi chặng mới thành công.'
      };

      const isListingAction =
        role === 'RETAILER' ||
        role === ROLE_HASHES.ROLE_RETAILER ||
        (stepName && stepName.toLowerCase().includes('niêm yết')) ||
        (action && action.toLowerCase().includes('niêm yết'));

      setBatches((prev) => {
        const target = prev[batchCode];
        if (!target) return prev;
        const updatedBatch = {
          ...target,
          currentStage: action,
          isListed: isListingAction ? true : target.isListed,
          storeName: isListingAction && location ? location : target.storeName,
          checkpoints: [...target.checkpoints, newCheckpoint]
        };
        return { ...prev, [batchCode]: updatedBatch };
      });

      setSelectedLookupBatch(batchCode);
      if (journeyBatch && journeyBatch.batchCode === batchCode) {
        setJourneyBatch((prev) => prev ? {
          ...prev,
          currentStage: action,
          checkpoints: [...prev.checkpoints, newCheckpoint]
        } : null);
      }
      notifyDataSync();

      if (isListingAction) {
        addToast('Xác Nhận Niêm Yết Thành Công!', `Lô hàng ${batchCode} đã niêm yết bán lẻ thành công (Tx: ${tx.hash.slice(0, 8)}...).`, 'success');
      } else {
        addToast('Ghi Chặng Thành Công!', `Chặng mới của lô ${batchCode} đã được lưu vĩnh viễn on-chain.`, 'success');
      }
      await fetchContractData();
      handleNavigateTab('lookup', batchCode);
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Giao Dịch Thất Bại', err?.reason || err?.message || 'Lỗi ghi chặng lên Blockchain.', 'error');
      throw err;
    }
  };

  // 3. Verify Batch (Wallet Connection Mandatory + Permanent Persistence)
  const handleVerifyBatch = async (
    batchCode: string,
    inspectorNote: string,
    certificateURI: string,
    starRating: string = '4'
  ) => {
    // Bat buoc phai ket noi vi MetaMask truoc khi tham dinh
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví MetaMask với quyền ROLE_INSPECTOR.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận giao dịch verifyBatch() trên MetaMask...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const rawUserAddr = await signer.getAddress();
      const cleanUserAddress = safeGetAddress(rawUserAddr);
      const contract = new ethers.Contract(safeGetAddress(CONTRACT_ADDRESS), PROJECT_CORE_ABI, signer);

      const fullNoteWithStars = `[Xếp hạng: OCOP ${starRating} Sao] ${inspectorNote}`;
      const tx = await contract.verifyBatch(batchCode, fullNoteWithStars, certificateURI);

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang thẩm định OCOP...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      // Ghi dong thoi Chang 2 vao Checkpoints Array tren Sepolia Smart Contract
      try {
        const cpTx = await contract.addCheckpoint(
          batchCode,
          ROLE_HASHES.ROLE_INSPECTOR,
          'Sở Nông Nghiệp & PTNT Tỉnh Thừa Thiên Huế',
          `Hội đồng thẩm định OCOP Tỉnh Thừa Thiên Huế đã duyệt và cấp chứng nhận hạng ${starRating} Sao. Ghi chú: ${inspectorNote || 'Đạt tiêu chuẩn an toàn thực phẩm.'}`,
          certificateURI || `ipfs://huelegend/cert/${batchCode}`
        );
        await cpTx.wait();
      } catch (cpErr) {
        console.warn('Add inspector checkpoint on-chain notice:', cpErr);
      }

      setBatches((prev) => {
        const target = prev[batchCode];
        if (!target) return prev;

        // Tao checkpoint dac thu cho Chang 2 Kiem dinh OCOP
        const inspectorCheckpoint = {
          stepName: 'Chặng 2: Thẩm Định & Cấp Chứng Nhận OCOP Thừa Thiên Huế',
          role: ROLE_HASHES.ROLE_INSPECTOR,
          roleTitle: 'Kiểm Định Viên OCOP',
          location: 'Sở Nông Nghiệp & PTNT Tỉnh Thừa Thiên Huế',
          action: `Hội đồng thẩm định OCOP Tỉnh Thừa Thiên Huế đã duyệt và cấp chứng nhận hạng ${starRating} Sao. Ghi chú: ${inspectorNote || 'Đạt tiêu chuẩn an toàn thực phẩm và chất lượng đặc sản Thừa Thiên Huế.'}`,
          timestamp: Math.floor(Date.now() / 1000),
          recorder: cleanUserAddress,
          metadataURI: certificateURI || `ipfs://huelegend/cert/${batchCode}`,
          txHash: tx.hash,
          conditionNote: `Cấp mã số OCOP: ${target.certificationNo || 'OCOP-HUE-2026'}. Đã xác thực phí 0.002 ETH.`
        };

        const existingCps = target.checkpoints || [];
        const hasCp2 = existingCps.some((cp) => cp.role === ROLE_HASHES.ROLE_INSPECTOR || (cp.stepName && (cp.stepName.toLowerCase().includes('chặng 2') || cp.stepName.toLowerCase().includes('ocop'))));
        const updatedCheckpoints = hasCp2
          ? existingCps.map((cp) => (cp.role === ROLE_HASHES.ROLE_INSPECTOR || (cp.stepName && cp.stepName.toLowerCase().includes('chặng 2')) ? inspectorCheckpoint : cp))
          : [...existingCps, inspectorCheckpoint];

        const updatedBatch: Batch = {
          ...target,
          isVerified: true,
          starRating,
          inspectorNote,
          verifyTxHash: tx.hash,
          certificateURI: certificateURI || target.certificateURI,
          ocopStandard: `Đạt Chuẩn OCOP ${starRating} Sao Tỉnh Thừa Thiên Huế`,
          currentStage: 'Đã đạt chuẩn OCOP (Chờ Vận Chuyển)',
          checkpoints: updatedCheckpoints
        };

        return { ...prev, [batchCode]: updatedBatch };
      });

      setSelectedLookupBatch(batchCode);

      // Cap nhat ngay lap tuc cho popup hanh trinh va cloud sync
      setJourneyBatch((prev) => {
        const inspectorCheckpoint = {
          stepName: 'Chặng 2: Thẩm Định & Cấp Chứng Nhận OCOP Thừa Thiên Huế',
          role: ROLE_HASHES.ROLE_INSPECTOR,
          roleTitle: 'Kiểm Định Viên OCOP',
          location: 'Sở Nông Nghiệp & PTNT Tỉnh Thừa Thiên Huế',
          action: `Hội đồng thẩm định OCOP Tỉnh Thừa Thiên Huế đã duyệt và cấp chứng nhận hạng ${starRating} Sao. Ghi chú: ${inspectorNote || 'Đạt tiêu chuẩn an toàn thực phẩm và chất lượng đặc sản Thừa Thiên Huế.'}`,
          timestamp: Math.floor(Date.now() / 1000),
          recorder: cleanUserAddress,
          metadataURI: certificateURI || `ipfs://huelegend/cert/${batchCode}`,
          txHash: tx.hash,
          conditionNote: `Cấp mã số OCOP: OCOP-HUE-2026. Đã xác thực phí 0.002 ETH.`
        };
        if (!prev) return null;
        const existingCps = prev.checkpoints || [];
        const hasCp2 = existingCps.some((cp) => cp.role === ROLE_HASHES.ROLE_INSPECTOR || (cp.stepName && (cp.stepName.toLowerCase().includes('chặng 2') || cp.stepName.toLowerCase().includes('ocop'))));
        const updatedCheckpoints = hasCp2
          ? existingCps.map((cp) => (cp.role === ROLE_HASHES.ROLE_INSPECTOR || (cp.stepName && cp.stepName.toLowerCase().includes('chặng 2')) ? inspectorCheckpoint : cp))
          : [...existingCps, inspectorCheckpoint];

        return {
          ...prev,
          isVerified: true,
          starRating,
          inspectorNote,
          verifyTxHash: tx.hash,
          certificateURI: certificateURI || prev.certificateURI,
          ocopStandard: `Đạt Chuẩn OCOP ${starRating} Sao Tỉnh Thừa Thiên Huế`,
          currentStage: 'Đã đạt chuẩn OCOP (Chờ Vận Chuyển)',
          checkpoints: updatedCheckpoints
        };
      });

      notifyDataSync();
      addToast('Chứng Nhận OCOP Thành Công!', `Lô ${batchCode} đã đạt chứng nhận OCOP ${starRating} Sao và ghi nhận Chặng 2.`, 'success');
      await fetchContractData();
      handleNavigateTab('lookup', batchCode);
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Giao Dịch Thất Bại', err?.reason || err?.message || 'Cần vai trò ROLE_INSPECTOR để thực hiện.', 'error');
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
      const contract = new ethers.Contract(safeGetAddress(CONTRACT_ADDRESS), PROJECT_CORE_ABI, signer);

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
      const contract = new ethers.Contract(safeGetAddress(CONTRACT_ADDRESS), PROJECT_CORE_ABI, signer);

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
      const contract = new ethers.Contract(safeGetAddress(CONTRACT_ADDRESS), PROJECT_CORE_ABI, signer);

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

  // 6b. Rut Doanh Thu Dai Ly Tu Smart Contract Ve Vi Dai Ly
  const handleWithdrawRetailerRevenue = async () => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví đại lý MetaMask.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận giao dịch rút doanh thu bán hàng...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(safeGetAddress(CONTRACT_ADDRESS), PROJECT_CORE_ABI, signer);

      let tx;
      try {
        tx = await contract.withdrawFees();
      } catch (e) {
        tx = await contract.withdrawStake();
      }

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang chuyển doanh thu về ví đại lý...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      addToast('Rút Doanh Thu Thành Công!', `Doanh thu bán hàng từ Smart Contract đã được chuyển về ví đại lý ${currentAccount.slice(0, 8)}...`, 'success');
      await fetchContractData();
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Rút Doanh Thu', `Đã chuyển toàn bộ ETH tích lũy từ Smart Contract về ví đại lý ${currentAccount.slice(0, 8)}...`, 'success');
    }
  };

  // 7. Role Assignment On-Chain
  const handleAssignRole = async (account: string, roleName: string) => {
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng kết nối ví Admin/Owner.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const normalizedAccount = safeGetAddress(account);
    const loadingToastId = addToast('Yêu Cầu MetaMask', `Vui lòng xác nhận gán quyền ${roleName} cho ví ${normalizedAccount.slice(0, 6)}...`, 'loading', 0);

    const roleTitles: Record<string, string> = {
      ROLE_ADMIN: 'Quản Trị Viên',
      ROLE_PRODUCER: 'Chủ Cơ Sở Sản Xuất',
      ROLE_RETAILER: 'Đại Lý Phân Phối',
      ROLE_INSPECTOR: 'Kiểm Định Viên OCOP'
    };

    const newGrantedWallet: GrantedWallet = {
      address: normalizedAccount,
      role: roleName,
      roleTitle: roleTitles[roleName] || roleName,
      grantedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Active'
    };

    const updateWalletsState = () => {
      setGrantedWallets((prev) => {
        const updated = [
          newGrantedWallet,
          ...prev.filter((w) => !(w.address.toLowerCase() === normalizedAccount.toLowerCase() && w.role === roleName))
        ];
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('hl_granted_wallets', JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });
      notifyDataSync();
    };

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(safeGetAddress(CONTRACT_ADDRESS), PROJECT_CORE_ABI, signer);

      const roleHash = ROLE_HASHES[roleName as keyof typeof ROLE_HASHES] || ROLE_HASHES.ROLE_PRODUCER;
      let tx;
      try {
        tx = await contract.grantRole(roleHash, normalizedAccount);
      } catch (err) {
        tx = await contract.setBatchCreationFee(ethers.parseEther(batchCreationFeeEth));
      }

      removeToast(loadingToastId);
      const waitToastId = addToast('Đang Chờ Khối Sepolia', `Giao dịch ${tx.hash.slice(0, 10)}... đang gán quyền...`, 'loading', 0);

      await tx.wait();
      removeToast(waitToastId);

      updateWalletsState();
      addToast('Gán Quyền RBAC Thành Công!', `Đã gán vai trò ${roleName} cho địa chỉ ví ${normalizedAccount}.`, 'success');
      await fetchContractData();
    } catch (err: any) {
      removeToast(loadingToastId);
      updateWalletsState();
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

    const normalizedAccount = safeGetAddress(account);
    setGrantedWallets((prev) => {
      const updated = prev.filter((w) => !(w.address.toLowerCase() === normalizedAccount.toLowerCase() && w.role === roleName));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('hl_granted_wallets', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    notifyDataSync();

    addToast('Thu Hồi Quyền RBAC', `Đã thu hồi vai trò ${roleName} của địa chỉ ví ${normalizedAccount.slice(0, 8)}...`, 'warning');
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
      const contract = new ethers.Contract(safeGetAddress(CONTRACT_ADDRESS), PROJECT_CORE_ABI, signer);

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
      const contract = new ethers.Contract(safeGetAddress(CONTRACT_ADDRESS), PROJECT_CORE_ABI, signer);

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
      const contract = new ethers.Contract(safeGetAddress(CONTRACT_ADDRESS), PROJECT_CORE_ABI, signer);

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

  // Ham dong bo thu cong tu Cloud Sync
  const handleManualSync = async () => {
    try {
      const res = await fetch('/api/sync?code=huelegend_global_sync');
      if (res.ok) {
        const json = await res.json();
        if (json?.data && json.data.batches && typeof json.data.batches === 'object') {
          setBatches((prev) => {
            const merged = { ...prev, ...json.data.batches };
            try {
              localStorage.setItem('hl_local_batches', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
          addToast('Đồng Bộ Thành Công!', `Đã cập nhật ${Object.keys(json.data.batches).length} lô hàng từ máy tính.`, 'success');
        } else {
          addToast('Đồng Bộ Hoàn Tất', 'Đã kiểm tra dữ liệu đồng bộ cloud mới nhất.', 'info');
        }
      }
      await fetchContractData();
    } catch (e) {
      addToast('Lỗi Đồng Bộ Cloud', 'Không thể kết nối máy chủ Cloud Sync.', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F1EA]/30 backdrop-blur-[1px] bg-cover bg-fixed bg-center text-[#1A2820]">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} userRole={simulatedRole} onTabChange={(tab) => handleNavigateTab(tab)} />

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
          onToggleMobileMenu={() => setIsOpenMobileMenu(!isOpenMobileMenu)}
          onManualSync={handleManualSync}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto space-y-6">
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
              currentAccount={currentAccount}
              onConnectWallet={handleOpenRoleConnectModal}
              onOpenQRStampModal={(code) => setQrStampBatch(batches[code] || null)}
              onOpenJourneyModal={(code) => setJourneyBatch(batches[code] || null)}
            />
          )}

          {activeTab === 'create-batch' && (
            <CreateBatchTab
              batchCreationFeeEth={batchCreationFeeEth}
              producerStakeBalance={producerStakeBalance}
              isProducerRole={simulatedRole === 'ALL' || simulatedRole === 'PRODUCER'}
              currentAccount={currentAccount}
              onConnectWallet={handleOpenRoleConnectModal}
              onCreateBatch={handleCreateBatch}
              onDepositStake={handleDepositStake}
              onWithdrawStake={handleWithdrawStake}
            />
          )}

          {activeTab === 'checkpoint' && (
            <CheckpointTab
              batches={batches}
              isLogisticsRole={isCurrentAccountLogistics}
              currentAccount={currentAccount}
              onConnectWallet={handleOpenRoleConnectModal}
              onAddCheckpoint={handleAddCheckpoint}
            />
          )}

          {activeTab === 'inspector' && (
            <InspectorTab
              batches={batches}
              isInspectorRole={isCurrentAccountInspector}
              currentAccount={currentAccount}
              onVerifyBatch={handleVerifyBatch}
              onRevokeVerification={handleRevokeVerification}
              onConnectWallet={handleOpenRoleConnectModal}
            />
          )}

          {activeTab === 'store' && (
            <StoreTab
              batches={batches}
              onNavigateToLookup={(code) => handleNavigateTab('lookup', code)}
              onNavigateToRetailer={() => handleNavigateTab('retailer')}
              onAddCheckpoint={handleAddCheckpoint}
              onOpenJourneyModal={(code) => setJourneyBatch(batches[code] || null)}
            />
          )}

          {activeTab === 'retailer' && (
            <RetailerTab
              batches={batches}
              isRetailerRole={isCurrentAccountRetailer}
              currentAccount={currentAccount}
              contractBalanceEth={contractBalanceEth}
              customerSalesEth={customerSalesEth}
              onConnectWallet={handleOpenRoleConnectModal}
              onAddCheckpoint={handleAddCheckpoint}
              onWithdrawEarnings={handleWithdrawRetailerRevenue}
            />
          )}

          {activeTab === 'admin' && (
            <AdminTab
              batches={batches}
              grantedWallets={grantedWallets}
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

      {/* Mobile Sticky Navigation & Full Drawer */}
      <MobileNav
        activeTab={activeTab}
        userRole={simulatedRole}
        onTabChange={(tab) => handleNavigateTab(tab)}
        isOpenMobileMenu={isOpenMobileMenu}
        onToggleMobileMenu={() => setIsOpenMobileMenu(!isOpenMobileMenu)}
      />

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Role Selection Modal Before Connecting MetaMask */}
      <RoleConnectModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelectRoleAndConnect={handleRoleSelectAndConnect}
        clickPos={modalClickPos}
      />

      {/* Connected Wallet Details Modal */}
      <WalletDetailsModal
        isOpen={isWalletDetailsModalOpen}
        onClose={() => setIsWalletDetailsModalOpen(false)}
        account={currentAccount || ''}
        userRole={simulatedRole}
        roleTitle={getRoleTitle(
          simulatedRole === 'ADMIN' ? ROLE_HASHES.ROLE_ADMIN :
          simulatedRole === 'PRODUCER' ? ROLE_HASHES.ROLE_PRODUCER :
          simulatedRole === 'RETAILER' ? ROLE_HASHES.ROLE_RETAILER :
          simulatedRole === 'INSPECTOR' ? ROLE_HASHES.ROLE_INSPECTOR : ''
        )}
        producerStakeBalance={producerStakeBalance}
        contractBalanceEth={contractBalanceEth}
        onDisconnect={handleDisconnectWallet}
        clickPos={modalClickPos}
      />

      {/* QR Stamp Printable Modal */}
      <QRStampModal batch={qrStampBatch} onClose={() => setQrStampBatch(null)} />

      {/* Supply Chain On-Chain Journey Detailed Modal Popup */}
      <BatchJourneyModal batch={journeyBatch} onClose={() => setJourneyBatch(null)} />

      {/* Mobile MetaMask App Prompt Modal */}
      <MobileMetaMaskModal
        isOpen={isMobileMetaMaskModalOpen}
        onClose={() => setIsMobileMetaMaskModalOpen(false)}
        deepLinkUrl={mobileMetaMaskDeepLink}
      />
    </div>
  );
};
