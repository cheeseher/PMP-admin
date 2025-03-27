<!-- 支付配置/支付类型管理 - 管理系统支持的支付类型 -->
<template>
  <div class="payment-type-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <el-form-item label="支付类型ID：">
          <el-input v-model="searchForm.id" placeholder="请输入支付类型ID" style="width: 168px" clearable />
        </el-form-item>
        <el-form-item label="支付类型名称：">
          <el-input v-model="searchForm.typeName" placeholder="请输入支付类型名称" style="width: 220px" clearable />
        </el-form-item>
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button :icon="Delete" plain :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="fetchData" />
          </el-tooltip>
        </div>
      </div>

      <el-table 
        :data="tableData" 
        border 
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="id" label="支付类型ID" width="100" />
        <el-table-column prop="typeName" label="支付类型名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="formType === 'add' ? '新增支付类型' : '编辑支付类型'"
      v-model="dialogVisible"
      width="550px"
      destroy-on-close
    >
      <el-form :model="typeForm" :rules="rules" ref="typeFormRef" label-width="100px">
        <el-form-item label="类型名称" prop="typeName">
          <el-input v-model="typeForm.typeName" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="typeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { 
  Search, 
  Refresh,
  Plus, 
  Delete,
  Edit,
  Download
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCleanup } from '@/utils/cleanupUtils'

// 搜索表单
const searchForm = reactive({
  id: '',
  typeName: ''
})

// 表格数据
const tableData = ref([
  { 
    id: 1, 
    typeName: '类型A', 
    createTime: '2023-01-01 10:00:00',
    remark: '类型A支付' 
  },
  { 
    id: 2, 
    typeName: '类型B', 
    createTime: '2023-01-01 10:00:00',
    remark: '类型B支付' 
  },
  { 
    id: 3, 
    typeName: '类型C', 
    createTime: '2023-01-01 10:00:00',
    remark: '类型C支付' 
  },
  { 
    id: 4, 
    typeName: '类型D', 
    createTime: '2023-01-01 10:00:00',
    remark: '类型D支付' 
  },
  { 
    id: 5, 
    typeName: '类型E', 
    createTime: '2023-01-01 10:00:00',
    remark: '类型E支付' 
  },
  { 
    id: 6, 
    typeName: '类型F', 
    createTime: '2023-01-01 10:00:00',
    remark: '类型F支付' 
  },
  { 
    id: 7, 
    typeName: '类型G', 
    createTime: '2023-01-01 10:00:00',
    remark: '类型G支付' 
  },
  { 
    id: 8, 
    typeName: '类型H', 
    createTime: '2023-01-01 10:00:00',
    remark: '类型H支付' 
  },
  { 
    id: 9, 
    typeName: '类型I', 
    createTime: '2023-01-01 10:00:00',
    remark: '类型I支付' 
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(9)
const loading = ref(false)

// 已选中的行
const selectedRows = ref([])

// 弹窗相关
const dialogVisible = ref(false)
const formType = ref('add') // add 或 edit
const typeFormRef = ref(null)
const typeForm = reactive({
  id: '',
  typeName: '',
  remark: ''
})

// 表单校验规则
const rules = {
  typeName: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在2到20个字符之间', trigger: 'blur' }
  ]
}

// 获取清理工具
const { safeTimeout } = useCleanup()

// 初始化
onMounted(() => {
  fetchData()
})

// 获取数据
const fetchData = () => {
  loading.value = true
  safeTimeout(() => {
    loading.value = false
  }, 500)
}

// 导出数据
const handleExport = () => {
  ElMessage.success('支付类型数据导出成功')
}

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

// 表格选择
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 新增方法
const handleAdd = () => {
  formType.value = 'add'
  // 重置表单
  if (typeFormRef.value) {
    typeFormRef.value.resetFields()
  }
  
  typeForm.id = ''
  typeForm.typeName = ''
  typeForm.remark = ''
  
  dialogVisible.value = true
}

// 编辑方法
const handleEdit = (row) => {
  formType.value = 'edit'
  // 填充表单
  Object.keys(typeForm).forEach(key => {
    typeForm[key] = row[key]
  })
  dialogVisible.value = true
}

// 删除方法
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除支付类型"${row.typeName}"吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      tableData.value.splice(index, 1)
      total.value--
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedRows.value.length} 条记录吗？此操作不可恢复！`,
    '批量删除确认',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const ids = selectedRows.value.map(row => row.id)
    tableData.value = tableData.value.filter(item => !ids.includes(item.id))
    total.value = tableData.value.length
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

// 表单提交
const submitForm = () => {
  typeFormRef.value.validate((valid) => {
    if (valid) {
      if (formType.value === 'add') {
        // 新增逻辑
        const newId = Math.max(...tableData.value.map(item => item.id)) + 1
        const newType = {
          id: newId,
          typeName: typeForm.typeName,
          createTime: new Date().toLocaleString(),
          remark: typeForm.remark
        }
        tableData.value.push(newType)
        total.value++
        ElMessage.success('新增成功')
      } else {
        // 编辑逻辑
        const index = tableData.value.findIndex(item => item.id === typeForm.id)
        if (index !== -1) {
          tableData.value[index] = { 
            ...tableData.value[index],
            typeName: typeForm.typeName,
            remark: typeForm.remark
          }
          ElMessage.success('编辑成功')
        }
      }
      dialogVisible.value = false
    } else {
      return false
    }
  })
}

// 分页方法
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}
</script>

<style scoped>
.payment-type-container {
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

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-toolbar .left .el-button {
  margin-right: 8px;
}

.table-toolbar .right .el-button {
  margin-left: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style> 