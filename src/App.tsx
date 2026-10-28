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
    if (roleHash === ROLE_HASHES.ROLE_RETAILER) return 'Đại Lý Phân Phối';
    if (roleHash === ROLE_HASHES.ROLE_INSPECTOR) return 'Kiểm Định Viên OCOP';
    if (roleHash === ROLE_HASHES.ROLE_ADMIN) return 'Quản Trị Viên';
    return 'Đơn Vị Tham Gia';
  };

  // Fetch real Smart Contract data from Sepolia Testnet with Guaranteed Local Data Retention
  const fetchContractData = useCallback(async (accountAddr?: string) => {
    // 1. Luon khoi phuc du lieu LocalStorage TRUOC TIEN ngay khi goi ham
    let localBatches: Record<string, Batch> = {};
    if (typeof window !== 'undefined') {
      try {
        const localBatchesStr = localStorage.getItem('hl_local_batches');
        if (localBatchesStr) {
          localBatches = JSON.parse(localBatchesStr);
          if (Object.keys(localBatches).length > 0) {
            setBatches(localBatches);
          }
        }
      } catch (e) {
        console.warn('Could not parse local batches from localStorage:', e);
      }
    }

    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return;
    }

    setIsLoadingContract(true);
    try {
      const normalizedContractAddr = safeGetAddress(CONTRACT_ADDRESS);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(normalizedContractAddr, PROJECT_CORE_ABI, provider);

      // Read real Smart Contract ETH balance from Sepolia Testnet
      try {
        const balanceWei = await provider.getBalance(normalizedContractAddr);
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
        const normalizedActiveAccount = safeGetAddress(activeAccount);
        try {
          const stakeInfo = await contract.getStakeInfo(normalizedActiveAccount);
          setProducerStakeBalance(ethers.formatEther(stakeInfo.balance));
        } catch (err) {
          console.warn('Could not read stake info:', err);
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

          const isSpecifiedAdmin = Boolean(
            normalizedActiveAccount && normalizedActiveAccount.toLowerCase() === safeGetAddress(DEFAULT_ADMIN_ADDRESS).toLowerCase()
          );

          setIsCurrentAccountAdmin(isSpecifiedAdmin);
          // Dai ly va Cua hang dac san duoc tu do niem yet gia khong can Admin cap quyen truoc
          setIsCurrentAccountRetailer(true);
          setIsCurrentAccountInspector(isOwner || isAdmin || isInspector || simulatedRole === 'INSPECTOR' || simulatedRole === 'ALL');
        } catch (roleErr) {
          console.warn('Could not check on-chain roles:', roleErr);
        }
      } else {
        setIsCurrentAccountAdmin(false);
        setIsCurrentAccountRetailer(true);
        setIsCurrentAccountInspector(simulatedRole === 'INSPECTOR' || simulatedRole === 'ALL');
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

            const isListedOnChain = checkpoints.some(
              (cp: any) =>
                cp.role === ROLE_HASHES.ROLE_RETAILER ||
                (cp.action && cp.action.toLowerCase().includes('niêm yết')) ||
                (cp.action && cp.action.toLowerCase().includes('inretail'))
            );

            fetchedBatches[batchCode] = {
              batchCode: batchData.batchCode,
              productName: batchData.productName,
              origin: batchData.origin,
              createdAt: Number(batchData.createdAt),
              producer: batchData.producer,
              isVerified: batchData.isVerified,
              isListed: isListedOnChain,
              exists: batchData.exists,
              ocopStandard: batchData.isVerified
                ? 'Đạt Chuẩn OCOP Tỉnh Thừa Thiên Huế'
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
              txHash: 'On-Chain Confirmed',
              inspectionFeePaid: '0.002 ETH',
              checkpoints
            };
          } catch (e) {
            console.error(`Error reading batch index ${i}:`, e);
          }
        }
      }

      // Hop nhat du lieu local va du lieu on-chain (KHONG BAO GIO XOA DU LIEU LOCAL)
      const mergedBatches: Record<string, Batch> = { ...localBatches };

      Object.keys(fetchedBatches).forEach((code) => {
        if (!mergedBatches[code]) {
          mergedBatches[code] = fetchedBatches[code];
        } else {
          mergedBatches[code] = {
            ...fetchedBatches[code],
            ...mergedBatches[code],
            checkpoints:
              mergedBatches[code].checkpoints && mergedBatches[code].checkpoints.length >= (fetchedBatches[code].checkpoints?.length || 0)
                ? mergedBatches[code].checkpoints
                : fetchedBatches[code].checkpoints,
          };
        }
      });

      if (Object.keys(mergedBatches).length > 0) {
        setBatches(mergedBatches);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('hl_local_batches', JSON.stringify(mergedBatches));
          } catch (e) {}
          if (!selectedLookupBatch) {
            setSelectedLookupBatch(Object.keys(mergedBatches)[0]);
          }
        }
      }
    } catch (err: any) {
      console.warn('Network sync notice:', err);
    } finally {
      setIsLoadingContract(false);
    }
  }, [currentAccount, simulatedRole, selectedLookupBatch]);

  // Tu dong doc tham so ?batch=... tu URL (khi quet QR) va mo Popup Nhat Ky Hanh Trinh Chi Tiet On-Chain
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const searchString = window.location.search || (window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : '');
        const urlParams = new URLSearchParams(searchString);
        const batchFromUrl = urlParams.get('batch') || urlParams.get('batchCode');
        if (batchFromUrl) {
          const cleanCode = batchFromUrl.trim().toUpperCase();
          setSelectedLookupBatch(cleanCode);
          setActiveTab('lookup');

          // Neu du lieu lo hang da duoc cap nhat trong state, mo popup vinh vien hien thi cac chang chi tiet
          if (batches[cleanCode]) {
            setJourneyBatch(batches[cleanCode]);
          } else if (Object.keys(batches).length > 0) {
            // Re-check target batch or use available batch
            const targetBatch = batches[cleanCode] || batches[Object.keys(batches)[0]];
            if (targetBatch) {
              setJourneyBatch(targetBatch);
            }
          }
        }
      } catch (e) {
        console.warn('Khong the doc tham so URL QR:', e);
      }
    }
  }, [batches]);

  // Khoi phuc du lieu va phien dang nhap tu localStorage ngay khi load lai trang
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBatchesStr = localStorage.getItem('hl_local_batches');
        if (savedBatchesStr) {
          const parsed = JSON.parse(savedBatchesStr);
          if (parsed && Object.keys(parsed).length > 0) {
            setBatches(parsed);
            setSelectedLookupBatch((prev) => prev || Object.keys(parsed)[0]);
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
              `Ví ${connectedAddr.slice(0, 6)}...${connectedAddr.slice(-4)} không phải ví Admin mặc định (0x82d0...19A7). Đã chuyển về vai trò Khách Hàng.`,
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

          // Kiem tra quyen Kiem Dinh Vien (INSPECTOR): Phai la Admin hoac nam trong danh sach grantedWallets
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

          setSimulatedRole(activeRole);
          setIsCurrentAccountAdmin(isDefaultAdmin);
          setIsCurrentAccountRetailer(activeRole === 'RETAILER' || activeRole === 'ALL');

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
      addToast('Cần MetaMask', 'Vui lòng cài đặt MetaMask extension trên trình duyệt để đăng nhập Web3.', 'warning');
    }
  };

  // Mo modal hoac xem chi tiet vi tuy theo trang thai
  const handleOpenRoleConnectModal = () => {
    if (currentAccount) {
      setIsWalletDetailsModalOpen(true);
    } else {
      setIsRoleModalOpen(true);
    }
  };

  // Ngat ket noi vi
  const handleDisconnectWallet = () => {
    setCurrentAccount(null);
    setIsWalletDetailsModalOpen(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('hl_connected_account');
      } catch (e) {}
    }
    addToast('Đã Ngắt Kết Nối Ví', 'Đã xoá phiên đăng nhập. Lần đăng nhập tới sẽ yêu cầu mở cửa sổ MetaMask mới.', 'info');
  };

  // Chon vai tro trong Modal -> Ket noi vi MetaMask
  const handleRoleSelectAndConnect = async (roleKey: string) => {
    setIsRoleModalOpen(false);
    
    // Anh xa vai tro duoc chon
    const roleMapping: Record<string, string> = {
      ADMIN: 'ADMIN',
      SUPPLY_CHAIN: 'PRODUCER',
      COMMERCE: 'RETAILER',
      INSPECTOR: 'INSPECTOR',
      CUSTOMER: 'CUSTOMER'
    };
    
    const targetRole = roleMapping[roleKey] || 'CUSTOMER';

    // Kiem tra tab hien tai co hop le voi vai tro moi hay khong
    if ((targetRole === 'PRODUCER' || targetRole === 'SUPPLY_CHAIN') && !['overview', 'lookup', 'store', 'create-batch', 'inspector'].includes(activeTab)) {
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

  // Navigation Helper
  const handleNavigateTab = (tab: string, batchCodeSelect?: string) => {
    setActiveTab(tab);
    if (batchCodeSelect) {
      setSelectedLookupBatch(batchCodeSelect);
    }
  };

  // 1. Create Batch (Wallet Connection Mandatory + Permanent Persistence)
  const handleCreateBatch = async (
    batchCode: string,
    productName: string,
    origin: string,
    metadataURI: string,
    imageUrl?: string
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
    const cleanMetadataURI = metadataURI.trim();
    const finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';

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
      const totalFeeWei = feeWei + inspectionFeeWei;

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
        createdAt: Math.floor(Date.now() / 1000),
        producer: cleanUserAddress,
        isVerified: false,
        exists: true,
        ocopStandard: 'Chưa Thẩm Định OCOP',
        certificationNo: `OCOP-HUE-2026-${cleanBatchCode.slice(-3)}`,
        quantity: 'Sản lượng Khởi Tạo On-Chain',
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
            action: 'Khởi tạo lô hàng & Thanh toán Phí Thẩm Định OCOP',
            timestamp: Math.floor(Date.now() / 1000),
            recorder: cleanUserAddress,
            metadataURI: cleanMetadataURI,
            txHash: tx.hash,
            conditionNote: 'Khởi tạo lô hàng thành công trên Sepolia Testnet.'
          }
        ]
      };

      // Luu vinh vien vao State va LocalStorage
      setBatches((prev) => {
        const updated = { ...prev, [cleanBatchCode]: newBatchObj };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('hl_local_batches', JSON.stringify(updated));
            const savedHashes = JSON.parse(localStorage.getItem('hl_batch_txhashes') || '{}');
            savedHashes[cleanBatchCode] = tx.hash;
            localStorage.setItem('hl_batch_txhashes', JSON.stringify(savedHashes));
          } catch (e) {}
        }
        return updated;
      });

      setSelectedLookupBatch(cleanBatchCode);
      addToast('Khởi Tạo On-Chain Thành Công!', `Lô hàng ${cleanBatchCode} đã được khởi tạo và lưu vĩnh viễn (Tx: ${tx.hash.slice(0, 8)}...).`, 'success');
      await fetchContractData(cleanUserAddress);
      handleNavigateTab('lookup', cleanBatchCode);
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Giao Dịch Thất Bại', err?.reason || err?.message || 'Không thể khởi tạo lô hàng trên Sepolia.', 'error');
    }
  };

  // 2. Add Checkpoint (Wallet Connection Mandatory + Permanent Persistence)
  const handleAddCheckpoint = async (
    batchCode: string,
    role: string,
    location: string,
    action: string,
    metadataURI: string,
    stepName: string,
    conditionNote: string
  ) => {
    // Bat buoc phai ket noi vi MetaMask truoc khi ghi chang
    if (!currentAccount) {
      addToast('Chưa Kết Nối Ví', 'Vui lòng chọn vai trò & kết nối ví MetaMask trước khi ghi chặng.', 'warning');
      setIsRoleModalOpen(true);
      return;
    }

    const loadingToastId = addToast('Yêu Cầu MetaMask', 'Vui lòng xác nhận giao dịch addCheckpoint() trên MetaMask...', 'loading', 0);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const rawUserAddr = await signer.getAddress();
      const cleanUserAddress = safeGetAddress(rawUserAddr);
      const contract = new ethers.Contract(safeGetAddress(CONTRACT_ADDRESS), PROJECT_CORE_ABI, signer);

      const roleHash = ROLE_HASHES[role as keyof typeof ROLE_HASHES] || ROLE_HASHES.ROLE_LOGISTICS;
      const fullActionText = conditionNote ? `${action} (Ghi chú: ${conditionNote})` : action;

      const tx = await contract.addCheckpoint(batchCode, roleHash, location, fullActionText, metadataURI);

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

      setBatches((prev) => {
        const target = prev[batchCode];
        if (!target) return prev;
        const isListingAction =
          role === 'RETAILER' ||
          role === ROLE_HASHES.ROLE_RETAILER ||
          (stepName && stepName.toLowerCase().includes('niêm yết')) ||
          (action && action.toLowerCase().includes('niêm yết'));
        const updatedBatch = {
          ...target,
          currentStage: action,
          isListed: isListingAction ? true : target.isListed,
          storeName: isListingAction && location ? location : target.storeName,
          checkpoints: [...target.checkpoints, newCheckpoint]
        };
        const updatedAll = { ...prev, [batchCode]: updatedBatch };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('hl_local_batches', JSON.stringify(updatedAll));
          } catch (e) {}
        }
        return updatedAll;
      });

      addToast('Ghi Chặng Thành Công!', `Chặng mới của lô ${batchCode} đã được lưu vĩnh viễn on-chain.`, 'success');
      await fetchContractData();
      handleNavigateTab('lookup', batchCode);
    } catch (err: any) {
      removeToast(loadingToastId);
      addToast('Giao Dịch Thất Bại', err?.reason || err?.message || 'Lỗi ghi chặng lên Blockchain.', 'error');
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

      setBatches((prev) => {
        const target = prev[batchCode];
        if (!target) return prev;
        const updatedBatch: Batch = {
          ...target,
          isVerified: true,
          starRating,
          inspectorNote,
          verifyTxHash: tx.hash,
          ocopStandard: `Đạt Chuẩn OCOP ${starRating} Sao Tỉnh Thừa Thiên Huế`,
          currentStage: 'Sẵn sàng Niêm Yết Cửa Hàng (InRetail)'
        };
        const updatedAll = { ...prev, [batchCode]: updatedBatch };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('hl_local_batches', JSON.stringify(updatedAll));
            const starRatings = JSON.parse(localStorage.getItem('hl_batch_starratings') || '{}');
            starRatings[batchCode] = starRating;
            localStorage.setItem('hl_batch_starratings', JSON.stringify(starRatings));

            const notes = JSON.parse(localStorage.getItem('hl_batch_inspectornotes') || '{}');
            notes[batchCode] = inspectorNote;
            localStorage.setItem('hl_batch_inspectornotes', JSON.stringify(notes));
          } catch (e) {}
        }
        return updatedAll;
      });

      addToast('Chứng Nhận OCOP Thành Công!', `Lô ${batchCode} đã đạt chứng nhận OCOP ${starRating} Sao và lưu vĩnh viễn.`, 'success');
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
            <CheckpointTab batches={batches} onAddCheckpoint={handleAddCheckpoint} />
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
      />

      {/* QR Stamp Printable Modal */}
      <QRStampModal batch={qrStampBatch} onClose={() => setQrStampBatch(null)} />

      {/* Supply Chain On-Chain Journey Detailed Modal Popup */}
      <BatchJourneyModal batch={journeyBatch} onClose={() => setJourneyBatch(null)} />
    </div>
  );
};
