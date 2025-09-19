// 代付上游管理模拟数据

export const payoutUpstreamData = {
  // 上游列表数据
  upstreams: [
    {
      id: 1,
      upstreamName: '代付上游A',
      upstreamCode: 'UpstreamA',
      merchantId: 'M001001',
      balance: 1000000.00,
      frozenAmount: 50000.00,
      alertThreshold: 100000.00,
      remark: '主要代付通道，稳定性较好',
      status: 1
    },
    {
      id: 2,
      upstreamName: '代付上游B',
      upstreamCode: 'UpstreamB',
      merchantId: 'M001002',
      balance: 800000,
      frozenAmount: 30000,
      alertThreshold: 80000,
      status: 'disabled',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-01-20 14:20:00'
    },
    {
      id: 3,
      upstreamName: '代付上游C',
      upstreamCode: 'UpstreamC',
      merchantId: 'M001003',
      balance: 1200000,
      frozenAmount: 0,
      alertThreshold: 120000,
      status: 'enabled',
      createTime: '2024-01-16 09:15:00',
      updateTime: '2024-01-22 11:45:00'
    },
    {
      id: 4,
      upstreamName: '代付上游D',
      upstreamCode: 'UpstreamD',
      merchantId: 'M001004',
      balance: 600000,
      frozenAmount: 20000,
      alertThreshold: 60000,
      status: 'enabled',
      createTime: '2024-01-17 14:20:00',
      updateTime: '2024-01-23 16:30:00'
    },
    {
      id: 5,
      upstreamName: '代付上游E',
      upstreamCode: 'UpstreamE',
      merchantId: 'M001005',
      balance: 900000,
      frozenAmount: 45000,
      alertThreshold: 90000,
      status: 'disabled',
      createTime: '2024-01-18 11:10:00',
      updateTime: '2024-01-24 13:15:00'
    },
    {
      id: 6,
      upstreamName: '代付上游F',
      upstreamCode: 'UpstreamF',
      merchantId: 'M001006',
      balance: 1500000,
      frozenAmount: 75000,
      alertThreshold: 150000,
      status: 'enabled',
      createTime: '2024-01-19 16:45:00',
      updateTime: '2024-01-25 09:20:00'
    },
    {
      id: 7,
      upstreamName: '代付上游G',
      upstreamCode: 'UpstreamG',
      merchantId: 'M001007',
      balance: 700000,
      frozenAmount: 35000,
      alertThreshold: 70000,
      status: 'enabled',
      createTime: '2024-01-20 13:30:00',
      updateTime: '2024-01-26 15:40:00'
    },
    {
      id: 8,
      upstreamName: '代付上游H',
      upstreamCode: 'UpstreamH',
      merchantId: 'M001008',
      balance: 1100000,
      frozenAmount: 55000,
      alertThreshold: 110000,
      status: 'disabled',
      createTime: '2024-01-21 08:50:00',
      updateTime: '2024-01-27 12:25:00'
    }
  ]
}

// 状态选项
export const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

// 操作类型选项
export const operationTypes = [
  { label: '编辑上游', value: 'edit' },
  { label: '删除上游', value: 'delete' },
  { label: '余额操作', value: 'balance' },
  { label: '余额解冻', value: 'unfreeze' }
]

export default {
  payoutUpstreamData,
  statusOptions,
  operationTypes
}