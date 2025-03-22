// 订单状态枚举
export const OrderStatus = {
  PROCESSING: '订单处理中',
  SUCCESS: '交易成功',
  FAILED: '交易失败',
  REFUND: '已退款',
  CANCELLED: '已取消'
}

// 模拟订单数据
export const orderList = [
  {
    orderId: '1',
    merchantName: '测试',
    upstream: '新沪电',
    channelCode: '102',
    productCode: '8888',
    productName: '演示产品',
    orderAmount: 100.00,
    orderStatus: OrderStatus.SUCCESS,
    createTime: '2025-03-04 17:31:32',
    successCount: 2
  },
  {
    orderId: '2',
    merchantName: '测试',
    upstream: '新沪电',
    channelCode: '0000',
    productCode: '8888',
    productName: '演示产品',
    orderAmount: 300.00,
    orderStatus: OrderStatus.PROCESSING,
    createTime: '2024-10-31 15:53:19',
    successCount: 2
  }
]

// 统计数据
export const statistics = {
  totalAmount: 0.00,
  successAmount: 0.00,
  profitAmount: 0.00,
  totalCount: 0,
  successRate: '0.00%',
  successCount: 0,
  profitRate: '0.00%',
  upstreamAmount: 0.00,
  upstreamSuccessRate: '0.00%'
} 