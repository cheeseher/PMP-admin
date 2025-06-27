<template>
  <div class="login-record-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="filterForm" inline class="filter-form">
        <el-form-item label="登录IP：" prop="loginIp">
          <el-input
            v-model="filterForm.loginIp"
            placeholder="请输入登录IP"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        
        <el-form-item label="登录状态：" prop="loginStatus">
          <el-select
            v-model="filterForm.loginStatus"
            placeholder="请选择登录状态"
            clearable
            style="width: 168px"
          >
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        
        <!-- 操作按钮组 -->
        <div class="filter-buttons">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button plain @click="resetSearch">重置</el-button>
        </div>
      </el-form>
    </el-card>
    
    <!-- 表格区域 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="loginTime" label="登录时间" min-width="180" />
        <el-table-column prop="loginIp" label="登录IP" min-width="140" />
        <el-table-column prop="loginStatus" label="登录状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.loginStatus === 'success' ? 'success' : 'danger'">
              {{ row.loginStatus === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="loginInfo" label="登录信息" min-width="150" />
        <el-table-column prop="deviceInfo" label="设备信息" min-width="280" show-overflow-tooltip />
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 筛选表单数据
const filterForm = reactive({
  loginIp: '',
  loginStatus: ''
})

// 表格加载状态
const loading = ref(false)

// 表格数据
const tableData = ref([
  {
    merchantId: '1096',
    merchantName: '新闪电',
    loginAccount: 'xsdzf',
    verifyCode: '-',
    loginTime: '2025/03/28 10:10:32',
    loginIp: '171.102.195.196',
    loginStatus: 'success',
    loginInfo: '',
    deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  },
  {
    merchantId: '1096',
    merchantName: '新闪电',
    loginAccount: 'xsdzf',
    verifyCode: '-',
    loginTime: '2025/03/27 20:17:13',
    loginIp: '139.5.159.237',
    loginStatus: 'success',
    loginInfo: '',
    deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  },
  {
    merchantId: '1096',
    merchantName: '新闪电',
    loginAccount: 'xsdzf',
    verifyCode: '-',
    loginTime: '2025/03/26 15:48:21',
    loginIp: '139.5.159.237',
    loginStatus: 'failed',
    loginInfo: '密码不匹配',
    deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  },
  {
    merchantId: '1097',
    merchantName: '闪付通',
    loginAccount: 'sft001',
    verifyCode: '-',
    loginTime: '2025/03/25 09:30:15',
    loginIp: '122.114.56.78',
    loginStatus: 'failed',
    loginInfo: '账号被禁用',
    deviceInfo: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  },
  {
    merchantId: '1098',
    merchantName: '快捷支付',
    loginAccount: 'kjzf',
    verifyCode: '-',
    loginTime: '2025/03/24 14:22:45',
    loginIp: '58.246.120.33',
    loginStatus: 'failed',
    loginInfo: '不支持该IP',
    deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  },
  {
    merchantId: '1099',
    merchantName: '易支付',
    loginAccount: 'yzf888',
    verifyCode: '123456',
    loginTime: '2025/03/23 16:05:38',
    loginIp: '183.14.132.99',
    loginStatus: 'failed',
    loginInfo: '验证码错误',
    deviceInfo: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  }
])

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 6
})

// 查询操作
const handleSearch = () => {
  loading.value = true
  // 模拟API调用延迟
  setTimeout(() => {
    loading.value = false
    // 这里实际项目中会调用API获取数据
    console.log('搜索条件:', filterForm)
  }, 500)
}

// 重置搜索
const resetSearch = () => {
  // 重置表单
  filterForm.loginIp = ''
  filterForm.loginStatus = ''
  // 重新加载数据
  handleSearch()
}

// 分页大小变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  handleSearch()
}

// 当前页变化
const handleCurrentChange = (val) => {
  pagination.currentPage = val
  handleSearch()
}

// 组件挂载后加载数据
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.login-record-container {
  padding: 16px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  align-items: center;
}

.filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style> 