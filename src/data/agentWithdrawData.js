// 代理商提现订单模拟数据

// 模拟提现数据
export const agentWithdrawList = [
    {
        id: 'AW001',
        type: 'TRX提现',
        agentName: '代理商A',
        withdrawNo: 'AW202602091001',
        status: 'pending', // pending, success, failed
        beforeBalance: '50000.00',
        frozenAmount: '2000.00',
        amount: '1000.00',
        fee: '12.00',
        afterBalance: '48988.00',
        afterFrozen: '3000.00',
        bankName: 'Tether (TRC20)',
        realName: '张三',
        cardNo: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        remark: '正常提现',
        createTime: '2026-02-09 10:30:00'
    },
    {
        id: 'AW002',
        type: 'USDT提现',
        agentName: '代理商B',
        withdrawNo: 'AW202602091002',
        status: 'success',
        beforeBalance: '12000.00',
        frozenAmount: '0.00',
        amount: '500.00',
        fee: '5.00',
        afterBalance: '11495.00',
        afterFrozen: '0.00',
        bankName: '工商银行',
        realName: '李四',
        cardNo: '622202******1234',
        remark: '已完成打款',
        createTime: '2026-02-09 09:15:00'
    },
    {
        id: 'AW003',
        type: '银行卡提现',
        agentName: '代理商C',
        withdrawNo: 'AW202602091003',
        status: 'failed',
        beforeBalance: '25000.00',
        frozenAmount: '5000.00',
        amount: '2000.00',
        fee: '20.00',
        afterBalance: '25000.00',
        afterFrozen: '3000.00',
        bankName: '招商银行',
        realName: '王五',
        cardNo: '621483******5678',
        remark: '余额不足排查中',
        createTime: '2026-02-09 08:45:00'
    }
]

// 获取提现列表
export function getAgentWithdrawList(params) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let filteredData = [...agentWithdrawList]

            // 按状态筛选
            if (params.status) {
                filteredData = filteredData.filter(item => item.status === params.status)
            }

            // 按提现单号筛选
            if (params.withdrawNo) {
                filteredData = filteredData.filter(item => item.withdrawNo.includes(params.withdrawNo))
            }

            // 按时间筛选 (简化处理)
            if (params.dateRange && params.dateRange.length === 2) {
                // 实际逻辑这里会过滤日期
            }

            resolve({
                data: filteredData,
                total: filteredData.length
            })
        }, 300)
    })
}
