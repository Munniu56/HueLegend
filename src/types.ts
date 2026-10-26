export type AppRole = 'ROLE_ADMIN' | 'ROLE_PRODUCER' | 'ROLE_LOGISTICS' | 'ROLE_RETAILER' | 'ROLE_INSPECTOR';

export interface Checkpoint {
  stepName: string;
  role: string;
  roleTitle: string;
  location: string;
  action: string;
  timestamp: number;
  recorder: string;
  metadataURI: string;
  txHash: string;
  conditionNote: string;
}

export interface Batch {
  batchCode: string;
  productName: string;
  origin: string;
  createdAt: number;
  producer: string;
  isVerified: boolean;
  exists: boolean;
  starRating?: string;
  ocopStandard?: string;
  certificationNo?: string;
  quantity?: string;
  currentStage?: string;
  inspectorNote?: string;
  certificateURI?: string;
  txHash?: string;
  verifyTxHash?: string;
  inspectionFeePaid?: string;
  checkpoints: Checkpoint[];
}

export interface UserRoles {
  isAdmin: boolean;
  isProducer: boolean;
  isLogistics: boolean;
  isRetailer: boolean;
  isInspector: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'loading';
}

export interface GrantedWallet {
  address: string;
  role: string;
  roleTitle: string;
  grantedAt: string;
  status: string;
}
