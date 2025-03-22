<!-- 支付配置/支付产品管理 - 配置支付产品和费率 -->
<template>
  <div class="payment-product">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.productName" placeholder="请输入产品名称" clearable />
        </el-form-item>
        <el-form-item label="支付类型">
          <el-select v-model="searchForm.payType" placeholder="请选择" clearable style="width: 168px">
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="微信" value="WECHAT" />
            <el-option label="银联" value="UNIONPAY" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px">
            <el-option label="上架" value="ONLINE" />
            <el-option label="下架" value="OFFLINE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>产品列表</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增产品</el-button>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="productCode" label="产品编码" width="180" />
        <el-table-column prop="productName" label="产品名称" width="180" />
        <el-table-column prop="payType" label="支付类型" width="120">
          <template #default="scope">
            <el-tag
              :type="scope.row.payType === 'ALIPAY' ? 'primary' : scope.row.payType === 'WECHAT' ? 'success' : 'warning'"
            >
              {{ scope.row.payType === 'ALIPAY' ? '支付宝' : scope.row.payType === 'WECHAT' ? '微信' : '银联' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="feeRate" label="费率" width="120">
          <template #default="scope">
            {{ (scope.row.feeRate * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="minAmount" label="单笔最小" width="120">
          <template #default="scope">
            ¥{{ scope.row.minAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="maxAmount" label="单笔最大" width="120">
          <template #default="scope">
            ¥{{ scope.row.maxAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="dayLimit" label="日限额" width="120">
          <template #default="scope">
            ¥{{ scope.row.dayLimit.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ONLINE' ? 'success' : 'info'">
              {{ scope.row.status === 'ONLINE' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              link 
              :type="scope.row.status === 'ONLINE' ? 'danger' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'ONLINE' ? '下架' : '上架' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
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
    </el-card>

    <el-dialog
      v-model="formDialogVisible"
      :title="formType === 'add' ? '新增产品' : '编辑产品'"
      width="500px"
    >
      <el-form :model="productForm" label-width="100px">
        <el-form-item label="产品名称">
          <el-input v-model="productForm.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品编码">
          <el-input 
            v-model="productForm.productCode" 
            placeholder="请输入产品编码"
            :disabled="formType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="支付类型">
          <el-select v-model="productForm.payType" placeholder="请选择" style="width: 100%">
            <el-option label="支付宝" value="ALIPAY" />
            <el-option label="微信" value="WECHAT" />
            <el-option label="银联" value="UNIONPAY" />
          </el-select>
        </el-form-item>
        <el-form-item label="费率">
          <el-input-number
            v-model="productForm.feeRate"
            :min="0"
            :max="1"
            :precision="4"
            :step="0.0001"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="单笔最小">
          <el-input-number
            v-model="productForm.minAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="单笔最大">
          <el-input-number
            v-model="productForm.maxAmount"
            :min="productForm.minAmount"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="日限额">
          <el-input-number
            v-model="productForm.dayLimit"
            :min="productForm.maxAmount"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="productForm.remark"
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
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  productName: '',
  payType: '',
  status: ''
})

const tableData = ref([
  {
    productCode: 'ALIPAY_SCAN',
    productName: '支付宝扫码支付',
    payType: 'ALIPAY',
    feeRate: 0.0025,
    minAmount: 0.01,
    maxAmount: 100000.00,
    dayLimit: 1000000.00,
    status: 'ONLINE',
    createTime: '2024-03-22 10:00:00',
    remark: '支付宝扫码支付产品'
  },
  {
    productCode: 'WECHAT_SCAN',
    productName: '微信扫码支付',
    payType: 'WECHAT',
    feeRate: 0.003,
    minAmount: 0.01,
    maxAmount: 50000.00,
    dayLimit: 500000.00,
    status: 'ONLINE',
    createTime: '2024-03-22 10:02:00',
    remark: '微信扫码支付产品'
  },
  {
    productCode: 'UNIONPAY_QUICK',
    productName: '银联快捷支付',
    payType: 'UNIONPAY',
    feeRate: 0.002,
    minAmount: 100.00,
    maxAmount: 200000.00,
    dayLimit: 2000000.00,
    status: 'OFFLINE',
    createTime: '2024-03-22 10:03:00',
    remark: '银联快捷支付产品'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const formDialogVisible = ref(false)
const formType = ref('add')
const productForm = reactive({
  productName: '',
  productCode: '',
  payType: '',
  feeRate: 0,
  minAmount: 0,
  maxAmount: 0,
  dayLimit: 0,
  remark: ''
})

const handleSearch = () => {
  // TODO: 实现搜索逻辑
  console.log('搜索条件：', searchForm)
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

const handleAdd = () => {
  formType.value = 'add'
  Object.keys(productForm).forEach(key => {
    productForm[key] = key === 'feeRate' ? 0 : key.includes('Amount') || key === 'dayLimit' ? 0 : ''
  })
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  formType.value = 'edit'
  Object.keys(productForm).forEach(key => {
    productForm[key] = row[key] || ''
  })
  formDialogVisible.value = true
}

const handleFormSubmit = () => {
  if (!productForm.productName || !productForm.productCode || !productForm.payType) {
    ElMessage.warning('请填写完整的产品信息')
    return
  }

  if (productForm.maxAmount < productForm.minAmount) {
    ElMessage.warning('单笔最大金额不能小于最小金额')
    return
  }

  if (productForm.dayLimit < productForm.maxAmount) {
    ElMessage.warning('日限额不能小于单笔最大金额')
    return
  }

  // TODO: 实现表单提交逻辑
  ElMessage.success(formType.value === 'add' ? '添加成功' : '修改成功')
  formDialogVisible.value = false
}

const handleToggleStatus = (row) => {
  const action = row.status === 'ONLINE' ? '下架' : '上架'
  ElMessageBox.confirm(
    `确认要${action}该产品吗？`,
    `${action}确认`,
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现状态切换逻辑
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleSizeChange = (val) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // TODO: 重新加载数据
}
</script>

<style scoped>
.payment-product {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 