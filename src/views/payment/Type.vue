<!-- 支付配置/支付类型管理 - 配置支付方式和状态 -->
<template>
  <div class="payment-type">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="类型名称">
          <el-input v-model="searchForm.typeName" placeholder="请输入类型名称" clearable />
        </el-form-item>
        <el-form-item label="支付场景">
          <el-select v-model="searchForm.scene" placeholder="请选择" clearable style="width: 168px">
            <el-option label="线上支付" value="ONLINE" />
            <el-option label="线下支付" value="OFFLINE" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 168px">
            <el-option label="启用" value="ENABLED" />
            <el-option label="禁用" value="DISABLED" />
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
          <span>支付类型列表</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增类型</el-button>
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="typeCode" label="类型编码" width="180" />
        <el-table-column prop="typeName" label="类型名称" width="180" />
        <el-table-column prop="scene" label="支付场景" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.scene === 'ONLINE' ? 'primary' : 'success'">
              {{ scope.row.scene === 'ONLINE' ? '线上支付' : '线下支付' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="scope">
            <el-icon :size="20" :color="scope.row.iconColor">
              <component :is="scope.row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ENABLED' ? 'success' : 'info'">
              {{ scope.row.status === 'ENABLED' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              link 
              :type="scope.row.status === 'ENABLED' ? 'danger' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'ENABLED' ? '禁用' : '启用' }}
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
      :title="formType === 'add' ? '新增支付类型' : '编辑支付类型'"
      width="500px"
    >
      <el-form :model="typeForm" label-width="100px">
        <el-form-item label="类型名称">
          <el-input v-model="typeForm.typeName" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="类型编码">
          <el-input 
            v-model="typeForm.typeCode" 
            placeholder="请输入类型编码"
            :disabled="formType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="支付场景">
          <el-select v-model="typeForm.scene" placeholder="请选择" style="width: 100%">
            <el-option label="线上支付" value="ONLINE" />
            <el-option label="线下支付" value="OFFLINE" />
          </el-select>
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="typeForm.icon" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in iconOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <el-icon :size="20" :color="item.color">
                <component :is="item.value" />
              </el-icon>
              <span style="margin-left: 10px">{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="图标颜色">
          <el-color-picker v-model="typeForm.iconColor" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="typeForm.sort" :min="0" :max="99" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="typeForm.remark"
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
import { Search, Refresh, Plus, Wallet, CreditCard, Money } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  typeName: '',
  scene: '',
  status: ''
})

const tableData = ref([
  {
    typeCode: 'ALIPAY',
    typeName: '支付宝支付',
    scene: 'ONLINE',
    icon: 'Wallet',
    iconColor: '#1677FF',
    status: 'ENABLED',
    sort: 1,
    createTime: '2024-03-22 10:00:00',
    remark: '支付宝官方支付'
  },
  {
    typeCode: 'WECHAT',
    typeName: '微信支付',
    scene: 'ONLINE',
    icon: 'Money',
    iconColor: '#07C160',
    status: 'ENABLED',
    sort: 2,
    createTime: '2024-03-22 10:02:00',
    remark: '微信官方支付'
  },
  {
    typeCode: 'UNIONPAY',
    typeName: '银联支付',
    scene: 'OFFLINE',
    icon: 'CreditCard',
    iconColor: '#1B1C33',
    status: 'DISABLED',
    sort: 3,
    createTime: '2024-03-22 10:03:00',
    remark: '银联快捷支付'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const formDialogVisible = ref(false)
const formType = ref('add')
const typeForm = reactive({
  typeName: '',
  typeCode: '',
  scene: '',
  icon: '',
  iconColor: '',
  sort: 0,
  remark: ''
})

const iconOptions = [
  { label: '钱包', value: 'Wallet', color: '#1677FF' },
  { label: '货币', value: 'Money', color: '#07C160' },
  { label: '银行卡', value: 'CreditCard', color: '#1B1C33' }
]

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
  Object.keys(typeForm).forEach(key => {
    typeForm[key] = key === 'sort' ? 0 : ''
  })
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  formType.value = 'edit'
  Object.keys(typeForm).forEach(key => {
    typeForm[key] = row[key] || ''
  })
  formDialogVisible.value = true
}

const handleFormSubmit = () => {
  if (!typeForm.typeName || !typeForm.typeCode || !typeForm.scene) {
    ElMessage.warning('请填写完整的类型信息')
    return
  }

  // TODO: 实现表单提交逻辑
  ElMessage.success(formType.value === 'add' ? '添加成功' : '修改成功')
  formDialogVisible.value = false
}

const handleToggleStatus = (row) => {
  const action = row.status === 'ENABLED' ? '禁用' : '启用'
  ElMessageBox.confirm(
    `确认要${action}该支付类型吗？`,
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
.payment-type {
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