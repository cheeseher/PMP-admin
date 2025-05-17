// 供应商通道列表模拟数据
export const channelList = [
  {
    id: 1,
    channelName: '通道A',
    channelCode: '102',
    rate: 6.00,
    supplier: '上游通道A',
    supplierCode: 'NewSdPay',
    payType: '类型A',
    category: '分组A',
    enabled: true,
    minAmount: 100.00,
    maxAmount: 50000.00
  },
  {
    id: 2,
    channelName: '通道B',
    channelCode: '0000',
    rate: 6.00,
    supplier: '上游通道A',
    supplierCode: 'NewSdPay',
    payType: '类型B',
    category: '分组B',
    enabled: true,
    minAmount: 500.00,
    maxAmount: 100000.00
  },
  {
    id: 3,
    channelName: '通道C',
    channelCode: '201',
    rate: 5.80,
    supplier: '上游通道B',
    supplierCode: 'RTpay',
    payType: '类型A',
    category: '分组A',
    enabled: true,
    minAmount: 1000.00,
    maxAmount: 200000.00
  },
  {
    id: 4,
    channelName: '通道D',
    channelCode: '202',
    rate: 5.90,
    supplier: '上游通道B',
    supplierCode: 'RTpay',
    payType: '类型B',
    category: '分组B',
    enabled: false,
    minAmount: 200.00,
    maxAmount: 80000.00
  },
  {
    id: 5,
    channelName: '通道E',
    channelCode: '301',
    rate: 6.20,
    supplier: '上游通道C',
    supplierCode: 'YeePay',
    payType: '类型A',
    category: '分组A',
    enabled: true,
    minAmount: 300.00,
    maxAmount: 150000.00
  },
  {
    id: 6,
    channelName: '通道F',
    channelCode: '302',
    rate: 6.30,
    supplier: '上游通道C',
    supplierCode: 'YeePay',
    payType: '类型B',
    category: '分组B',
    enabled: false,
    minAmount: 1000.00,
    maxAmount: 300000.00
  },
  {
    id: 7,
    channelName: '通道G',
    channelCode: '401',
    rate: 5.50,
    supplier: '上游通道D',
    supplierCode: 'QuickPay',
    payType: '类型A',
    category: '分组A',
    enabled: true,
    minAmount: 100.00,
    maxAmount: 50000.00
  },
  {
    id: 8,
    channelName: '通道H',
    channelCode: '402',
    rate: 5.60,
    supplier: '上游通道D',
    supplierCode: 'QuickPay',
    payType: '类型B',
    category: '分组B',
    enabled: true,
    minAmount: 500.00,
    maxAmount: 100000.00
  },
  {
    id: 9,
    channelName: '通道I',
    channelCode: '501',
    rate: 6.10,
    supplier: '上游通道E',
    supplierCode: 'QFPay',
    payType: '类型A',
    category: '分组A',
    enabled: true,
    minAmount: 1000.00,
    maxAmount: 200000.00
  },
  {
    id: 10,
    channelName: '通道J',
    channelCode: '502',
    rate: 6.15,
    supplier: '上游通道E',
    supplierCode: 'QFPay',
    payType: '类型B',
    category: '分组B',
    enabled: false,
    minAmount: 2000.00,
    maxAmount: 500000.00
  }
];

// 支付类型选项
export const payTypeOptions = [
  { label: '类型A', value: '类型A' },
  { label: '类型B', value: '类型B' },
  { label: '类型C', value: '类型C' },
  { label: '类型D', value: '类型D' },
  { label: '类型E', value: '类型E' },
  { label: '类型F', value: '类型F' }
];

// 分组类型选项
export const categoryOptions = [
  { label: '分组A', value: '分组A' },
  { label: '分组B', value: '分组B' },
  { label: '分组C', value: '分组C' },
  { label: '分组D', value: '分组D' },
  { label: '分组E', value: '分组E' },
  { label: '分组F', value: '分组F' }
]; 