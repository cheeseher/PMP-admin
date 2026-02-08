// 代付产品模拟数据

export const payoutProductList = [
    {
        id: '1',
        productName: '代付A',
        productCode: 'PAY_A_001',
        remark: '中国银行代付产品',
        status: 'ENABLED' // ENABLED, DISABLED
    },
    {
        id: '2',
        productName: '代付B',
        productCode: 'PAY_B_002',
        remark: '建设银行代付产品',
        status: 'ENABLED'
    },
    {
        id: '3',
        productName: '代付C',
        productCode: 'PAY_C_003',
        remark: '工商银行代付产品',
        status: 'DISABLED'
    }
]

// 获取代付产品列表
export function getPayoutProductList(params) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let filteredData = [...payoutProductList]

            // 按 ID 筛选
            if (params.id) {
                filteredData = filteredData.filter(item => item.id.includes(params.id))
            }

            // 按名称筛选
            if (params.productName) {
                filteredData = filteredData.filter(item => item.productName.includes(params.productName))
            }

            // 按状态筛选
            if (params.status) {
                filteredData = filteredData.filter(item => item.status === params.status)
            }

            resolve({
                data: filteredData,
                total: filteredData.length
            })
        }, 300)
    })
}
