<!-- 商户管理/商户列表 - 管理平台商户信息 -->
<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">商户列表</h2>
      <p class="description">管理系统内所有商户的基本信息、状态和配置</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <div class="stat-card">
          <div class="title">总商户数</div>
          <div class="value">1,234</div>
          <div class="footer">
            较上月 <span class="text-success">+12.5%</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="title">活跃商户数</div>
          <div class="value">856</div>
          <div class="footer">
            较上月 <span class="text-success">+8.2%</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="title">本月新增商户</div>
          <div class="value">128</div>
          <div class="footer">
            较上月 <span class="text-warning">-2.3%</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="title">待审核商户</div>
          <div class="value">45</div>
          <div class="footer">
            较上月 <span class="text-error">+15.8%</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 搜索表单 -->
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="商户编号">
          <el-input
            v-model="searchForm.merchantNo"
            placeholder="请输入商户编号"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="商户名称">
          <el-input
            v-model="searchForm.merchantName"
            placeholder="请输入商户名称"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="商户状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 168px"
          >
            <el-option label="正常" value="ACTIVE" />
            <el-option label="冻结" value="FROZEN" />
            <el-option label="禁用" value="DISABLED" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="注册时间">
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
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <div class="table-header">
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增商户
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon> 导出数据
          </el-button>
        </div>
        
        <div class="right">
          <el-button-group>
            <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
            <el-button :icon="Setting" @click="handleColumnSetting">列设置</el-button>
          </el-button-group>
        </div>
      </div>

      <el-table
        :data="tableData"
        style="width: 100%"
        border
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="merchantNo" label="商户编号" width="180" />
        <el-table-column prop="merchantName" label="商户名称" width="180" />
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="120" />
        <el-table-column prop="balance" label="账户余额" width="120">
          <template #default="scope">
            ¥{{ scope.row.balance.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === 'ACTIVE' ? 'success' :
                scope.row.status === 'FROZEN' ? 'warning' : 'danger'
              "
            >
              {{ 
                scope.row.status === 'ACTIVE' ? '正常' :
                scope.row.status === 'FROZEN' ? '冻结' : '禁用'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="primary"
              @click="handleProducts(scope.row)"
            >
              产品配置
            </el-button>
            <el-button
              v-if="scope.row.status === 'ACTIVE'"
              link
              type="warning"
              @click="handleFreeze(scope.row)"
            >
              冻结
            </el-button>
            <el-button
              v-if="scope.row.status === 'FROZEN'"
              link
              type="success"
              @click="handleUnfreeze(scope.row)"
            >
              解冻
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="formDialogVisible"
      :title="formType === 'add' ? '新增商户' : '编辑商户'"
      width="600px"
    >
      <el-form :model="merchantForm" label-width="100px">
        <el-form-item label="商户名称">
          <el-input v-model="merchantForm.merchantName" placeholder="请输入商户名称" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="merchantForm.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="merchantForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="结算银行">
          <el-input v-model="merchantForm.bankName" placeholder="请输入开户银行" />
        </el-form-item>
        <el-form-item label="银行账号">
          <el-input v-model="merchantForm.bankAccount" placeholder="请输入银行账号" />
        </el-form-item>
        <el-form-item label="开户名">
          <el-input v-model="merchantForm.accountName" placeholder="请输入开户名" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="merchantForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleFormSubmit">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  Search,
  Refresh,
  Plus,
  Download,
  Setting
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索表单数据
const searchForm = reactive({
  merchantNo: '',
  merchantName: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref([
  {
    merchantNo: 'M202403220001',
    merchantName: '测试商户1',
    contactName: '张三',
    contactPhone: '13800138001',
    balance: 10000.00,
    status: 'ACTIVE',
    createTime: '2024-03-22 10:00:00',
    remark: '重要客户'
  },
  {
    merchantNo: 'M202403220002',
    merchantName: '测试商户2',
    contactName: '李四',
    contactPhone: '13800138002',
    balance: 5000.00,
    status: 'FROZEN',
    createTime: '2024-03-22 10:02:00',
    remark: '风控审核中'
  },
  {
    merchantNo: 'M202403220003',
    merchantName: '测试商户3',
    contactName: '王五',
    contactPhone: '13800138003',
    balance: 0.00,
    status: 'DISABLED',
    createTime: '2024-03-22 10:03:00',
    remark: '长期无交易'
  }
])

// 加载状态
const loading = ref(false)

// 分页配置
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 表单对话框
const formDialogVisible = ref(false)
const formType = ref('add')
const merchantForm = reactive({
  merchantName: '',
  contactName: '',
  contactPhone: '',
  bankName: '',
  bankAccount: '',
  accountName: '',
  remark: ''
})

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    normal: 'success',
    disabled: 'danger',
    pending: 'warning'
  }
  return statusMap[status]
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    normal: '正常',
    disabled: '禁用',
    pending: '待审核'
  }
  return statusMap[status]
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  // TODO: 实现搜索逻辑
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchForm.dateRange = []
}

// 新增商户
const handleAdd = () => {
  formType.value = 'add'
  Object.keys(merchantForm).forEach(key => {
    merchantForm[key] = ''
  })
  formDialogVisible.value = true
}

// 导出数据
const handleExport = () => {
  // TODO: 实现导出数据逻辑
}

// 刷新
const handleRefresh = () => {
  // TODO: 实现刷新逻辑
}

// 列设置
const handleColumnSetting = () => {
  // TODO: 实现列设置逻辑
}

// 编辑商户
const handleEdit = (row) => {
  formType.value = 'edit'
  Object.keys(merchantForm).forEach(key => {
    merchantForm[key] = row[key] || ''
  })
  formDialogVisible.value = true
}

// 产品配置
const handleProducts = (row) => {
  router.push({
    name: 'MerchantProducts',
    query: { merchantNo: row.merchantNo }
  })
}

// 冻结商户
const handleFreeze = (row) => {
  ElMessageBox.confirm(
    `确认要冻结商户 ${row.merchantName} 吗？`,
    '冻结确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现冻结逻辑
    ElMessage.success('冻结成功')
  }).catch(() => {})
}

// 解冻商户
const handleUnfreeze = (row) => {
  ElMessageBox.confirm(
    `确认要解冻商户 ${row.merchantName} 吗？`,
    '解冻确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现解冻逻辑
    ElMessage.success('解冻成功')
  }).catch(() => {})
}

// 表单提交
const handleFormSubmit = () => {
  // TODO: 实现表单提交逻辑
  ElMessage.success(formType.value === 'add' ? '添加成功' : '修改成功')
  formDialogVisible.value = false
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  // TODO: 重新加载数据
}
</script>

<style scoped lang="scss">
.mb-4 {
  margin-bottom: 24px;
}

.text-success {
  color: var(--success-color);
}

.text-warning {
  color: var(--warning-color);
}

.text-error {
  color: var(--error-color);
}
</style> 