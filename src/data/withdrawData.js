// 商户提现审核模拟数据
import { generateWithdrawNo } from '../utils/generatorUtils.js'

// 模拟提现数据
const mockWithdrawData = [
  {
    id: 'WD001',
    merchantName: '商户A',
    withdrawNo: generateWithdrawNo(),
    amount: 1000,
    type: 'TRX',
    walletAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    withdrawAmount: 7200,
    remark: '正常提现',
    auditRemark: '',
    status: 'pending',
    createTime: '2024-12-01 10:30:00',
    finishTime: ''
  },
  {
    id: 'WD002',
    merchantName: '商户B',
    withdrawNo: generateWithdrawNo(),
    amount: 500,
    type: 'TRX',
    walletAddress: 'TX8M8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5',
    withdrawAmount: 3600,
    remark: '紧急提现',
    auditRemark: '',
    status: 'success',
    createTime: '2024-12-01 09:15:00',
    finishTime: '2024-12-01 09:45:00'
  },
  {
    id: 'WD003',
    merchantName: '商户C',
    withdrawNo: generateWithdrawNo(),
    amount: 2000,
    type: 'TRX',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
    withdrawAmount: 14400,
    remark: '大额提现',
    auditRemark: '',
    status: 'failed',
    createTime: '2024-12-01 08:45:00',
    finishTime: '2024-12-01 09:10:00'
  },
  {
    id: 'WD004',
    merchantName: '商户A',
    withdrawNo: generateWithdrawNo(),
    amount: 800,
    type: 'TRX',
    walletAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    withdrawAmount: 5760,
    remark: '常规提现',
    auditRemark: '',
    status: 'pending',
    createTime: '2024-12-01 14:20:00',
    finishTime: ''
  },
  {
    id: 'WD005',
    merchantName: '商户D',
    withdrawNo: generateWithdrawNo(),
    amount: 1500,
    type: 'TRX',
    walletAddress: 'TX8M8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5',
    withdrawAmount: 10800,
    remark: '业务提现',
    auditRemark: '',
    status: 'success',
    createTime: '2024-12-01 16:30:00',
    finishTime: '2024-12-01 16:50:00'
  }
]

// 格式化日期时间为 YYYY-MM-DD HH:mm:ss
function formatDateTime(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

// 获取提现列表
export function getWithdrawList(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockWithdrawData]
      
      // 按商户名称筛选
      if (params.merchantName) {
        filteredData = filteredData.filter(item => item.merchantName === params.merchantName)
      }
      
      // 按提现单号筛选
      if (params.withdrawNo) {
        filteredData = filteredData.filter(item => item.withdrawNo.includes(params.withdrawNo))
      }
      
      // 按状态筛选
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status)
      }
      
      // 按时间范围筛选
      if (params.applyTimeRange && params.applyTimeRange.length === 2) {
        const startTime = new Date(params.applyTimeRange[0]).getTime()
        const endTime = new Date(params.applyTimeRange[1]).getTime()
        filteredData = filteredData.filter(item => {
          const itemTime = new Date(item.createTime).getTime()
          return itemTime >= startTime && itemTime <= endTime
        })
      }
      
      // 分页
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      const pageData = filteredData.slice(start, end)
      
      resolve({
        data: pageData,
        total: filteredData.length,
        page: params.page,
        pageSize: params.pageSize
      })
    }, 300)
  })
}

// 审核提现
export function approveWithdraw(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const withdraw = mockWithdrawData.find(item => item.id === data.id)
      if (withdraw) {
        if (data.result === 'approve') {
          withdraw.status = 'success'
          withdraw.finishTime = formatDateTime(new Date())
        } else if (data.result === 'reject') {
          withdraw.status = 'failed'
          withdraw.finishTime = formatDateTime(new Date())
        }
        // 保存审核备注
        if (typeof data.remark === 'string') {
          withdraw.auditRemark = data.remark
        }
        resolve({
          success: true,
          message: '审核成功',
          data: withdraw
        })
      } else {
        reject(new Error('提现记录不存在'))
      }
    }, 500)
  })
}

// 批量审核提现
export function batchApproveWithdraw(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      data.ids.forEach(id => {
        const withdraw = mockWithdrawData.find(item => item.id === id)
        if (withdraw && withdraw.status === 'pending') {
          if (data.result === 'approve') {
            withdraw.status = 'success'
            withdraw.finishTime = formatDateTime(new Date())
          } else if (data.result === 'reject') {
            withdraw.status = 'failed'
            withdraw.finishTime = formatDateTime(new Date())
          }
          if (typeof data.remark === 'string') {
            withdraw.auditRemark = data.remark
          }
        }
      })
      resolve({
        success: true,
        message: '批量审核成功',
        count: data.ids.length
      })
    }, 800)
  })
}

// 导出提现数据
export function exportWithdrawData(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '导出成功',
        downloadUrl: '/api/export/withdraw_data.xlsx'
      })
    }, 1000)
  })
}