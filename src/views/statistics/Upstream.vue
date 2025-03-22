<!-- 数据统计/上游渠道统计 - 统计分析上游渠道数据 -->
<template>
  <div class="statistics-upstream">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline class="search-form">
      <el-form-item label="渠道名称">
        <el-input v-model="searchForm.channelName" placeholder="请输入渠道名称" clearable style="width: 168px" />
      </el-form-item>
      <el-form-item label="支付类型">
        <el-select v-model="searchForm.payType" placeholder="请选择支付类型" clearable style="width: 168px">
          <el-option label="支付宝" value="alipay" />
          <el-option label="微信支付" value="wechat" />
          <el-option label="银联" value="unionpay" />
        </el-select>
      </el-form-item>
      <el-form-item label="统计时间">
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="channelName" label="渠道名称" width="150" />
      <el-table-column prop="payType" label="支付类型" width="120" />
      <el-table-column prop="orderCount" label="订单笔数" width="120">
        <template #default="{ row }">
          <span>{{ row.orderCount }}笔</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderAmount" label="订单金额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.orderAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="successCount" label="成功笔数" width="120">
        <template #default="{ row }">
          <span>{{ row.successCount }}笔</span>
        </template>
      </el-table-column>
      <el-table-column prop="successAmount" label="成功金额" width="150">
        <template #default="{ row }">
          <span>¥{{ row.successAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="successRate" label="成功率" width="120">
        <template #default="{ row }">
          <span>{{ (row.successRate * 100).toFixed(2) }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="fee" label="手续费" width="150">
        <template #default="{ row }">
          <span>¥{{ row.fee.toFixed(2) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 搜索表单数据
const searchForm = reactive({
  channelName: '',
  payType: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    date: '2024-03-14',
    channelName: '示例渠道',
    payType: '支付宝',
    orderCount: 1000,
    orderAmount: 50000.00,
    successCount: 980,
    successAmount: 49000.00,
    successRate: 0.98,
    fee: 245.00
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const loading = ref(false)

// 搜索方法
const handleSearch = () => {
  loading.value = true
  // TODO: 调用接口获取数据
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// 重置方法
const handleReset = () => {
  searchForm.channelName = ''
  searchForm.payType = ''
  searchForm.dateRange = []
  handleSearch()
}

// 分页方法
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}
</script>

<style scoped lang="scss">
.statistics-upstream {
  .search-form {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .pagination-container {
    text-align: right;
    margin-top: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
  }
}
</style> 