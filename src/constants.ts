import { Batch } from './types';

// Cau hinh hop dong va mang Sepolia
export const CONTRACT_ADDRESS = "0x35655079aEbB215E58e379D5a8c2f1f3a5323C6b";
export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111
export const SEPOLIA_DECIMAL_ID = 11155111;
export const ETHERSCAN_BASE_URL = "https://sepolia.etherscan.io";

export const ROLE_HASHES = {
  ROLE_ADMIN: "0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42",
  ROLE_PRODUCER: "0x2c0f20977a41ca739e03496033e64f7b605151ee67b93b827e8a946ad4ee2678",
  ROLE_LOGISTICS: "0x789b78809f69f29ee87bc6c1e57c6b54a2a16d56df3d132cb0a54cf53d9e47cb",
  ROLE_RETAILER: "0xa3858c42a5a54db645ce1e2e1329c29c8e1f592aa1527efd75c924bcbe1fb4e1",
  ROLE_INSPECTOR: "0x4296dbb7b322384a621147a468d6ef71f28b40d6c44917a22ab65a12154c34cb"
};

export const PROJECT_CORE_ABI = [
  "constructor()",
  "error BatchAlreadyExists(string batchCode)",
  "error BatchAlreadyVerified(string batchCode)",
  "error BatchNotFound(string batchCode)",
  "error BatchNotVerified(string batchCode)",
  "error EmptyString(string paramName)",
  "error FeeExceedsLimit(uint256 attempted, uint256 maxLimit)",
  "error InsufficientBatchFee(uint256 provided, uint256 requiredFee)",
  "error InvalidAddress()",
  "error MaxCheckpointsExceeded(string batchCode, uint256 maxAllowed)",
  "error NothingToWithdraw()",
  "error StakeTooLow(uint256 provided, uint256 minimum)",
  "error StillLocked(uint256 unlockAt, uint256 currentTime)",
  "error StringTooLong(string paramName, uint256 maxAllowed)",
  "error TransferFailed()",
  "error UnauthorizedCaller(address caller, bytes32 requiredRole)",
  "error ZeroAmount()",
  "event BatchCreated(string indexed batchCode, string productName, address indexed producer, uint256 timestamp)",
  "event BatchCreationFeeUpdated(uint256 oldFee, uint256 newFee)",
  "event BatchFeeCollected(address indexed producer, string indexed batchCode, uint256 feeAmount)",
  "event BatchVerificationRevoked(string indexed batchCode, address indexed inspector, string reason, uint256 timestamp)",
  "event BatchVerified(string indexed batchCode, address indexed inspector, uint256 timestamp)",
  "event CheckpointAdded(string indexed batchCode, address indexed recorder, bytes32 indexed role, string action, string location, uint256 timestamp)",
  "event RoleAssigned(address indexed account, bytes32 indexed role)",
  "event RoleRevoked(address indexed account, bytes32 indexed role)",
  "event StakeDeposited(address indexed producer, uint256 amount, uint256 unlockTime)",
  "event StakeWithdrawn(address indexed producer, uint256 amount)",
  "function ROLE_ADMIN() view returns (bytes32)",
  "function ROLE_INSPECTOR() view returns (bytes32)",
  "function ROLE_LOGISTICS() view returns (bytes32)",
  "function ROLE_PRODUCER() view returns (bytes32)",
  "function ROLE_RETAILER() view returns (bytes32)",
  "function addCheckpoint(string batchCode, bytes32 role, string location, string action, string metadataURI)",
  "function batchCreationFee() view returns (uint256)",
  "function createBatch(string batchCode, string productName, string origin, string initialMetadataURI) payable",
  "function depositStake() payable",
  "function ecosystemFund() view returns (address)",
  "function getBatch(string batchCode) view returns (tuple(string batchCode, string productName, string origin, uint256 createdAt, address producer, bool isVerified, bool exists))",
  "function getCheckpoints(string batchCode) view returns (tuple(uint256 timestamp, address recorder, bytes32 role, string location, string action, string metadataURI)[])",
  "function getTotalBatches() view returns (uint256)",
  "function getBatchCodeByIndex(uint256 index) view returns (string)",
  "function getStakeInfo(address producer) view returns (uint256 balance, uint256 unlockAt, uint256 remainingSeconds)",
  "function hasRole(address account, bytes32 role) view returns (bool)",
  "function owner() view returns (address)",
  "function producerStake(address) view returns (uint256)",
  "function producerUnlockTime(address) view returns (uint256)",
  "function setBatchCreationFee(uint256 newFee)",
  "function verifyBatch(string batchCode, string inspectorNote, string certificateURI)",
  "function revokeBatchVerification(string batchCode, string reason)",
  "function withdrawStake()"
];

export const DEFAULT_SAMPLE_BATCHES: Record<string, Batch> = {
  "HL-MEXUNG-2026-001": {
    batchCode: "HL-MEXUNG-2026-001",
    productName: "Mè Xửng Thiên Hương Thượng Hạng",
    origin: "20 Chi Lăng, Phường Phú Hậu, TP Huế",
    createdAt: 1773000000,
    producer: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
    isVerified: true,
    exists: true,
    ocopStandard: "OCOP 4 Sao Tỉnh Thừa Thiên Huế",
    certificationNo: "OCOP-HUE-2026-048",
    quantity: "1.000 hộp (Loại 500g)",
    currentStage: "Đại lý mở bán",
    checkpoints: [
      {
        stepName: "Chặng 1: Sản Xuất & Đóng Gói",
        role: "ROLE_PRODUCER",
        roleTitle: "Cơ Sở Sản Xuất",
        location: "Xưởng sản xuất Thiên Hương, Phú Hậu, TP Huế",
        action: "Thu hoạch mè trắng hạt tròn và đậu phụng Vĩnh Linh, nấu kẹo theo công thức mạch nha gia truyền, đóng gói hút chân không tiệt trùng.",
        timestamp: 1773000000,
        recorder: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
        metadataURI: "ipfs://QmHueMeXungBatch001ProductionSpec",
        txHash: "0x4a18e3c5d678912ef01923847582910384751029384756102938475610293847",
        conditionNote: "Nhiệt độ phòng đóng gói 24°C, độ ẩm 50%, hạn sử dụng 12 tháng."
      },
      {
        stepName: "Chặng 2: Vận Chuyển & Lưu Kho",
        role: "ROLE_LOGISTICS",
        roleTitle: "Đơn Vị Vận Chuyển",
        location: "Ga Huế & Tuyến Đường Sắt Bắc Nam, Ga Hà Nội",
        action: "Vận chuyển bằng toa hàng bảo ôn chuyên dụng, niêm phong kẹp chì điện tử, theo dõi định vị GPS và cảm biến nhiệt độ liên tục.",
        timestamp: 1773172800,
        recorder: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        metadataURI: "ipfs://QmHueMeXungBatch001ShippingReceipt",
        txHash: "0x8b29f4d7e1029384756102938475610293847561029384756102938475610293",
        conditionNote: "Nhiệt độ thùng xe ổn định 22°C - 25°C, không va đập, bảo quản khô ráo."
      },
      {
        stepName: "Chặng 3: Nhập Kho Đại Lý & Mở Bán",
        role: "ROLE_RETAILER",
        roleTitle: "Đại Lý Phân Phối",
        location: "Cửa hàng Đặc sản Cố Đô Huế, 12 Tràng Tiền, Hoàn Kiếm, Hà Nội",
        action: "Kiểm tra mã tem niêm phong QR, quét nhận diện lô hàng nguyên vẹn, nhập kho đại lý và chính thức mở bán phục vụ du khách.",
        timestamp: 1773345600,
        recorder: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        metadataURI: "ipfs://QmHueMeXungBatch001RetailerAcceptance",
        txHash: "0x3c71a9e201928374651029384756102938475610293847561029384756102938",
        conditionNote: "Trưng bày kệ thoáng mát, tem niêm phong blockchain còn nguyên vẹn 100%."
      }
    ]
  },
  "HL-TOMCHUA-2026-002": {
    batchCode: "HL-TOMCHUA-2026-002",
    productName: "Tôm Chua Trọng Tín Cung Đình",
    origin: "Đầm Phá Tam Giang, Huyện Quảng Điền, Thừa Thiên Huế",
    createdAt: 1773200000,
    producer: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
    isVerified: true,
    exists: true,
    ocopStandard: "OCOP 4 Sao - Đặc Sản Cố Đô",
    certificationNo: "OCOP-HUE-2026-092",
    quantity: "800 hũ (Hũ thủy tinh 450g)",
    currentStage: "Đại lý mở bán",
    checkpoints: [
      {
        stepName: "Chặng 1: Sản Xuất & Lên Men",
        role: "ROLE_PRODUCER",
        roleTitle: "Cơ Sở Sản Xuất",
        location: "Xưởng chế biến Trọng Tín, Đầm Chuồn, Phú Vang, Huế",
        action: "Tuyển chọn tôm rảo tươi sống Đầm Chuồn, ủ lên men tự nhiên với riềng củ, tỏi ớt Huế và rượu nếp thơm nồng trong chum sành 21 ngày.",
        timestamp: 1773200000,
        recorder: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
        metadataURI: "ipfs://QmHueTomChuaBatch002Production",
        txHash: "0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
        conditionNote: "Ủ tự nhiên ở nhiệt độ 28°C - 30°C, kiểm soát vi sinh đạt chuẩn ATTP."
      },
      {
        stepName: "Chặng 2: Vận Chuyển Kho Lạnh",
        role: "ROLE_LOGISTICS",
        roleTitle: "Đơn Vị Vận Chuyển",
        location: "Kho lạnh Trung chuyển Miền Trung, KCN Phú Bài, Huế",
        action: "Vận chuyển bằng xe chuyên dụng thùng lạnh, giữ trọn độ giòn ngọt của tôm chua và ngăn chặn lên men quá độ.",
        timestamp: 1773300000,
        recorder: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        metadataURI: "ipfs://QmHueTomChuaBatch002ColdChain",
        txHash: "0x223344556677889900aabbccddeeff11223344556677889900aabbccddeeff11",
        conditionNote: "Nhiệt độ bảo quản lạnh 10°C - 15°C trong suốt hành trình."
      },
      {
        stepName: "Chặng 3: Nhập Kho Siêu Thị OCOP",
        role: "ROLE_RETAILER",
        roleTitle: "Đại Lý Phân Phối",
        location: "Trung tâm Giới thiệu Nông sản OCOP Huế, Chợ Đông Ba, TP Huế",
        action: "Xác nhận nhập kho, kiểm định độ chua chuẩn vị, dán tem mã QR Blockchain phục vụ khách du lịch.",
        timestamp: 1773400000,
        recorder: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        metadataURI: "ipfs://QmHueTomChuaBatch002Retailer",
        txHash: "0x3344556677889900aabbccddeeff11223344556677889900aabbccddeeff1122",
        conditionNote: "Lưu trữ ngăn mát 8°C - 12°C, sẵn sàng cung cấp cho người tiêu dùng."
      }
    ]
  },
  "HL-TRASEN-2026-003": {
    batchCode: "HL-TRASEN-2026-003",
    productName: "Trà Sen Cung Đình Huế Hoàng Gia",
    origin: "Hồ Tịnh Tâm, Phường Thuận Thành, TP Huế",
    createdAt: 1773350000,
    producer: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
    isVerified: true,
    exists: true,
    ocopStandard: "OCOP 5 Sao Tiềm Năng - Di Sản Ẩm Thực",
    certificationNo: "OCOP-HUE-2026-001",
    quantity: "300 hộp (Hộp gỗ sơn mài Cung đình 200g)",
    currentStage: "Trưng bày VIP",
    checkpoints: [
      {
        stepName: "Chặng 1: Ướp Hương Sen Hồ Tịnh",
        role: "ROLE_PRODUCER",
        roleTitle: "Cơ Sở Sản Xuất",
        location: "Trà đình Tịnh Tâm, Hồ Tịnh Tâm, TP Huế",
        action: "Thu hái hoa sen bách diệp đầu mùa lúc sáng sớm, ướp từng búp trà xanh Tân Cương thượng hạng vào nhụy hoa sen qua đêm hứng sương sớm.",
        timestamp: 1773350000,
        recorder: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
        metadataURI: "ipfs://QmHueTraSenBatch003Heritage",
        txHash: "0x556677889900aabbccddeeff11223344556677889900aabbccddeeff11223344",
        conditionNote: "Ướp tự nhiên không hương liệu nhân tạo, sấy chân không giữ nguyên hương thơm hoàng tộc."
      },
      {
        stepName: "Chặng 2: Kiểm Định Chất Lượng & Lưu Kho",
        role: "ROLE_LOGISTICS",
        roleTitle: "Đơn Vị Vận Chuyển",
        location: "Kho trung chuyển Đường hàng không - Sân bay Phú Bài Huế",
        action: "Vận chuyển hỏa tốc bằng đường hàng không, đóng thùng chống ẩm cao cấp để bảo vệ cánh sen và hương trà.",
        timestamp: 1773450000,
        recorder: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        metadataURI: "ipfs://QmHueTraSenBatch003AirCargo",
        txHash: "0x6677889900aabbccddeeff11223344556677889900aabbccddeeff1122334455",
        conditionNote: "Độ ẩm thùng hàng luôn dưới 30%, chống ẩm tuyệt đối."
      },
      {
        stepName: "Chặng 3: Phân Phối Trưng Bày",
        role: "ROLE_RETAILER",
        roleTitle: "Đại Lý Phân Phối",
        location: "Khu Trưng bày Di sản Hoàng Gia, Sân bay Quốc tế Tân Sơn Nhất, TP.HCM",
        action: "Tiếp nhận sản phẩm trà sen Cung đình, trưng bày tại quầy VIP Quà tặng Ngoại giao và Văn hóa Huế.",
        timestamp: 1773550000,
        recorder: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        metadataURI: "ipfs://QmHueTraSenBatch003Retail",
        txHash: "0x77889900aabbccddeeff11223344556677889900aabbccddeeff112233445566",
        conditionNote: "Tủ trưng bày chống tia UV và điều hòa 20°C."
      }
    ]
  },
  "HL-NONLA-2026-004": {
    batchCode: "HL-NONLA-2026-004",
    productName: "Nón Lá Bài Thơ Làng Tây Hồ",
    origin: "Làng Nón Tây Hồ, Xã Phú Hồ, Huyện Phú Vang, Thừa Thiên Huế",
    createdAt: 1773400000,
    producer: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
    isVerified: false,
    exists: true,
    ocopStandard: "Đang Chờ Kiểm Định OCOP",
    certificationNo: "HUE-CRAFT-2026-015",
    quantity: "500 chiếc (Nón bài thơ 16 vành)",
    currentStage: "Tại xưởng làng nghề",
    checkpoints: [
      {
        stepName: "Chặng 1: Chuốt Vành & Chằm Nón",
        role: "ROLE_PRODUCER",
        roleTitle: "Cơ Sở Sản Xuất",
        location: "Hợp tác xã Nón lá Tây Hồ, Phú Vang, Huế",
        action: "Chọn lá nón non sấy khô trắng muốt, chuốt 16 vành tre cật tròn đều, lồng tranh phong cảnh Cầu Trường Tiền và thơ xứ Huế giữa 2 lớp lá.",
        timestamp: 1773400000,
        recorder: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
        metadataURI: "ipfs://QmHueNonLaBatch004Heritage",
        txHash: "0x889900aabbccddeeff11223344556677889900aabbccddeeff11223344556677",
        conditionNote: "Đường kim mũi chỉ thanh mảnh, soi đèn hiện rõ hình ảnh phong cảnh Huế."
      }
    ]
  },
  "HL-TRAMGIO-2026-005": {
    batchCode: "HL-TRAMGIO-2026-005",
    productName: "Tinh Dầu Tràm Cung Đình Hoa Nén",
    origin: "Làng Nghề Nấu Dầu Tràm Lộc Thuỷ, Huyện Phú Lộc, Thừa Thiên Huế",
    createdAt: 1773450000,
    producer: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
    isVerified: false,
    exists: true,
    ocopStandard: "Đang Chờ Kiểm Định OCOP",
    certificationNo: "HUE-ESSENTIAL-2026-033",
    quantity: "1.200 chai (Chai thủy tinh 50ml)",
    currentStage: "Vận chuyển lưu kho",
    checkpoints: [
      {
        stepName: "Chặng 1: Chưng Cất Tinh Dầu Tràm",
        role: "ROLE_PRODUCER",
        roleTitle: "Cơ Sở Sản Xuất",
        location: "Xưởng chưng cất Hoa Nén, Lộc Thủy, Phú Lộc, Huế",
        action: "Thu hái lá tràm gió tự nhiên chân đèo Hải Vân, chưng cất lôi cuốn hơi nước truyền thống bằng nồi đồng trong 6 giờ liên tục.",
        timestamp: 1773450000,
        recorder: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
        metadataURI: "ipfs://QmHueTramGioBatch005Extraction",
        txHash: "0x9900aabbccddeeff11223344556677889900aabbccddeeff1122334455667788",
        conditionNote: "Hàm lượng Cineol đạt trên 60%, mùi thơm dịu nhẹ ấm áp, an toàn cho trẻ sơ sinh."
      },
      {
        stepName: "Chặng 2: Vận Chuyển Đóng Kiện",
        role: "ROLE_LOGISTICS",
        roleTitle: "Đơn Vị Vận Chuyển",
        location: "Bưu chính Quốc tế Huế - Trung tâm khai thác miền Trung",
        action: "Đóng gói màng xốp chống va đập, bảo quản tránh ánh sáng trực tiếp, chuẩn bị phân phối đến các đại lý toàn quốc.",
        timestamp: 1773500000,
        recorder: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        metadataURI: "ipfs://QmHueTramGioBatch005Shipping",
        txHash: "0xaabbccddeeff11223344556677889900aabbccddeeff11223344556677889900",
        conditionNote: "Chống xóc nhiệt, thùng kín chống bay hơi tinh dầu."
      }
    ]
  },
  "HL-KEOGUONG-2026-006": {
    batchCode: "HL-KEOGUONG-2026-006",
    productName: "Kẹo Gương Đậu Phụng Phò Trạch",
    origin: "Làng Nghề Phò Trạch, Huyện Phong Điền, Thừa Thiên Huế",
    createdAt: 1773520000,
    producer: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
    isVerified: false,
    exists: true,
    ocopStandard: "Đang Chờ Kiểm Định OCOP",
    certificationNo: "HUE-CANDY-2026-056",
    quantity: "600 hộp (Loại 300g)",
    currentStage: "Tại xưởng sản xuất",
    checkpoints: [
      {
        stepName: "Chặng 1: Thắng Đường & Cán Mỏng",
        role: "ROLE_PRODUCER",
        roleTitle: "Cơ Sở Sản Xuất",
        location: "Cơ sở kẹo gương Phò Trạch, Phong Điền, Huế",
        action: "Thắng đường cát trắng và mạch nha trong veo như thủy tinh, rải đều đậu phụng rang giòn và mè trắng, cán mỏng như tấm gương soi.",
        timestamp: 1773520000,
        recorder: "0x82d022a704706B2f144863D619D7418F8a0f19A7",
        metadataURI: "ipfs://QmHueKeoGuongBatch006Production",
        txHash: "0xbbccddeeff11223344556677889900aabbccddeeff11223344556677889900aa",
        conditionNote: "Đóng gói kín chống ẩm, giữ độ giòn tan ngọt thanh."
      }
    ]
  }
};
