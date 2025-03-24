// 供应商通道列表模拟数据
export const channelList = [
  {
    id: 1,
    channelName: '新沪电_支付宝',
    channelCode: '102',
    rate: 6.00,
    supplier: '新沪电',
    supplierCode: 'NewSdPay',
    payType: '支付宝H5',
    category: '微信H5',
    enabled: true
  },
  {
    id: 2,
    channelName: '新沪电测试通道',
    channelCode: '0000',
    rate: 6.00,
    supplier: '新沪电',
    supplierCode: 'NewSdPay',
    payType: '微信H5',
    category: '微信H5',
    enabled: true
  },
  {
    id: 3,
    channelName: '融通付_支付宝',
    channelCode: '201',
    rate: 5.80,
    supplier: '融通付',
    supplierCode: 'RTpay',
    payType: '支付宝H5',
    category: '支付宝H5',
    enabled: true
  },
  {
    id: 4,
    channelName: '融通付_微信',
    channelCode: '202',
    rate: 5.90,
    supplier: '融通付',
    supplierCode: 'RTpay',
    payType: '微信H5',
    category: '微信H5',
    enabled: false
  },
  {
    id: 5,
    channelName: '易宝_支付宝',
    channelCode: '301',
    rate: 6.20,
    supplier: '易宝支付',
    supplierCode: 'YeePay',
    payType: '支付宝H5',
    category: '支付宝H5',
    enabled: true
  },
  {
    id: 6,
    channelName: '易宝_微信',
    channelCode: '302',
    rate: 6.30,
    supplier: '易宝支付',
    supplierCode: 'YeePay',
    payType: '微信H5',
    category: '微信H5',
    enabled: false
  },
  {
    id: 7,
    channelName: '快捷通_支付宝',
    channelCode: '401',
    rate: 5.50,
    supplier: '快捷通',
    supplierCode: 'QuickPay',
    payType: '支付宝H5',
    category: '支付宝H5',
    enabled: true
  },
  {
    id: 8,
    channelName: '快捷通_微信',
    channelCode: '402',
    rate: 5.60,
    supplier: '快捷通',
    supplierCode: 'QuickPay',
    payType: '微信H5',
    category: '微信H5',
    enabled: true
  },
  {
    id: 9,
    channelName: '钱方_支付宝',
    channelCode: '501',
    rate: 6.10,
    supplier: '钱方支付',
    supplierCode: 'QFPay',
    payType: '支付宝H5',
    category: '支付宝H5',
    enabled: true
  },
  {
    id: 10,
    channelName: '钱方_微信',
    channelCode: '502',
    rate: 6.15,
    supplier: '钱方支付',
    supplierCode: 'QFPay',
    payType: '微信H5',
    category: '微信H5',
    enabled: false
  }
];

// 支付类型选项
export const payTypeOptions = [
  { label: '支付宝H5', value: '支付宝H5' },
  { label: '微信H5', value: '微信H5' },
  { label: '支付宝扫码', value: '支付宝扫码' },
  { label: '微信扫码', value: '微信扫码' },
  { label: '银联H5', value: '银联H5' },
  { label: '云闪付', value: '云闪付' }
];

// 分组类型选项
export const categoryOptions = [
  { label: '支付宝H5', value: '支付宝H5' },
  { label: '微信H5', value: '微信H5' },
  { label: '支付宝扫码', value: '支付宝扫码' },
  { label: '微信扫码', value: '微信扫码' },
  { label: '银联H5', value: '银联H5' },
  { label: '云闪付', value: '云闪付' }
]; 