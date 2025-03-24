<!-- 支付配置/支付类型管理 - 管理系统支持的支付类型 -->
<template>
  <div class="payment-type-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="title">支付类型管理</div>
      <div class="description">管理系统支持的所有支付类型以及配置信息</div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="类型ID">
          <el-input v-model="searchForm.id" placeholder="请输入类型ID" clearable></el-input>
        </el-form-item>
        <el-form-item label="类型名称">
          <el-input v-model="searchForm.typeName" placeholder="请输入类型名称" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>支付类型列表</span>
          <div class="header-operations">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon> 新增
            </el-button>
            <el-button type="danger" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon> 批量删除
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="tableData" 
        border 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="typeName" label="类型名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
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
  Edit
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
    typeName: '微信扫码', 
    createTime: '2023-01-01 10:00:00',
    remark: '微信扫码支付' 
  },
  { 
    id: 2, 
    typeName: '微信H5', 
    createTime: '2023-01-01 10:00:00',
    remark: '微信H5支付' 
  },
  { 
    id: 3, 
    typeName: '支付宝扫码', 
    createTime: '2023-01-01 10:00:00',
    remark: '支付宝扫码支付' 
  },
  { 
    id: 4, 
    typeName: '支付宝H5', 
    createTime: '2023-01-01 10:00:00',
    remark: '支付宝H5支付' 
  },
  { 
    id: 5, 
    typeName: '银行卡', 
    createTime: '2023-01-01 10:00:00',
    remark: '银行卡支付' 
  },
  { 
    id: 6, 
    typeName: 'QQH5', 
    createTime: '2023-01-01 10:00:00',
    remark: 'QQ支付H5' 
  },
  { 
    id: 7, 
    typeName: '云闪付', 
    createTime: '2023-01-01 10:00:00',
    remark: '银联云闪付' 
  },
  { 
    id: 8, 
    typeName: '数字人民币', 
    createTime: '2023-01-01 10:00:00',
    remark: '数字人民币支付' 
  },
  { 
    id: 9, 
    typeName: 'QQ扫码', 
    createTime: '2023-01-01 10:00:00',
    remark: 'QQ扫码支付' 
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

<style scoped lang="scss">
.payment-type-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    .description {
      color: #606266;
      font-size: 14px;
    }
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 