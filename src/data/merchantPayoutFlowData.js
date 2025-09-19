// 商户代付资金流水模拟数据
export const merchantPayoutFlowData = [
  {
    id: 1,
    merchant: '商户A',
    transactionNo: 'TXN202412150001',
    beforeBalance: 50000.00,
    transactionAmount: -1500.00,
    transactionType: '代付',
    fee: 15.00,
    commission: 5.00,
    remark: '代付订单：PAY202412150001',
    afterBalance: 48485.00,
    status: '成功',
    createTime: '2024-12-15 10:30:25'
  },
  {
    id: 2,
    merchant: '商户B',
    transactionNo: 'TXN202412150002',
    beforeBalance: 25000.00,
    transactionAmount: 10000.00,
    transactionType: '充值',
    fee: 0.00,
    commission: 0.00,
    remark: '商户充值',
    afterBalance: 35000.00,
    status: '成功',
    createTime: '2024-12-15 09:15:30'
  },
  {
    id: 3,
    merchant: '商户A',
    transactionNo: 'TXN202412150003',
    beforeBalance: 48485.00,
    transactionAmount: -2000.00,
    transactionType: '代付',
    fee: 20.00,
    commission: 6.67,
    remark: '代付订单：PAY202412150003',
    afterBalance: 46465.00,
    status: '处理中',
    createTime: '2024-12-15 11:45:12'
  },
  {
    id: 4,
    merchant: '商户C',
    transactionNo: 'TXN202412150004',
    beforeBalance: 15000.00,
    transactionAmount: -500.00,
    transactionType: '代付',
    fee: 5.00,
    commission: 1.67,
    remark: '代付订单：PAY202412150004',
    afterBalance: 14495.00,
    status: '失败',
    createTime: '2024-12-15 08:20:45'
  },
  {
    id: 5,
    merchant: '商户B',
    transactionNo: 'TXN202412150005',
    beforeBalance: 35000.00,
    transactionAmount: -3000.00,
    transactionType: '代付',
    fee: 30.00,
    commission: 10.00,
    remark: '代付订单：PAY202412150005',
    afterBalance: 31970.00,
    status: '成功',
    createTime: '2024-12-15 14:30:18'
  },
  {
    id: 6,
    merchant: '商户A',
    transactionNo: 'TXN202412150006',
    beforeBalance: 46465.00,
    transactionAmount: 5000.00,
    transactionType: '充值',
    fee: 0.00,
    commission: 0.00,
    remark: '商户充值',
    afterBalance: 51465.00,
    status: '成功',
    createTime: '2024-12-15 16:10:33'
  },
  {
    id: 7,
    merchant: '商户C',
    transactionNo: 'TXN202412150007',
    beforeBalance: 14495.00,
    transactionAmount: -800.00,
    transactionType: '代付',
    fee: 8.00,
    commission: 2.67,
    remark: '代付订单：PAY202412150007',
    afterBalance: 13687.00,
    status: '成功',
    createTime: '2024-12-15 17:25:50'
  },
  {
    id: 8,
    merchant: '商户B',
    transactionNo: 'TXN202412150008',
    beforeBalance: 31970.00,
    transactionAmount: -1200.00,
    transactionType: '代付',
    fee: 12.00,
    commission: 4.00,
    remark: '代付订单：PAY202412150008',
    afterBalance: 30758.00,
    status: '处理中',
    createTime: '2024-12-15 18:40:15'
  },
  {
    id: 9,
    merchant: '商户A',
    transactionNo: 'TXN202412150009',
    beforeBalance: 51465.00,
    transactionAmount: -2500.00,
    transactionType: '代付',
    fee: 25.00,
    commission: 8.33,
    remark: '代付订单：PAY202412150009',
    afterBalance: 48940.00,
    status: '成功',
    createTime: '2024-12-15 19:55:28'
  },
  {
    id: 10,
    merchant: '商户C',
    transactionNo: 'TXN202412150010',
    beforeBalance: 13687.00,
    transactionAmount: 8000.00,
    transactionType: '充值',
    fee: 0.00,
    commission: 0.00,
    remark: '商户充值',
    afterBalance: 21687.00,
    status: '成功',
    createTime: '2024-12-15 20:12:40'
  }
]

// 商户选项
export const merchantOptions = [
  { label: '商户A', value: '商户A' },
  { label: '商户B', value: '商户B' },
  { label: '商户C', value: '商户C' },
  { label: '商户D', value: '商户D' },
  { label: '商户E', value: '商户E' }
]

// 交易类型选项数据
export const transactionTypeOptions = [
  { label: '代付', value: '代付' },
  { label: '充值', value: '充值' },
  { label: '提现', value: '提现' },
  { label: '退款', value: '退款' },
  { label: '手续费', value: '手续费' }
]

// 状态选项数据
export const statusOptions = [
  { label: '成功', value: '成功' },
  { label: '失败', value: '失败' },
  { label: '处理中', value: '处理中' },
  { label: '已取消', value: '已取消' }
]