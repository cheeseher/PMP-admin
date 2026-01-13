
<!-- 机器人管理/其他设置 - 包含供应商汇总分组等设置 -->
<template>
  <div class="bot-other-settings-container">
    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="供应商汇总分组" name="supplierGrouping">
        
        <!-- 筛选/操作栏 -->
        <el-card shadow="never" class="filter-container">
           <div class="operation-bar">
            <el-button type="primary" :icon="Plus" @click="handleAddGroup">新增分组</el-button>
             <el-input
                v-model="searchQuery"
                placeholder="请输入分组名称搜索"
                style="width: 250px; margin-left: 16px;"
                clearable
                :prefix-icon="Search"
                @input="handleSearch"
             />
           </div>
        </el-card>

        <!-- 数据表格 -->
        <el-card shadow="never" style="margin-top: 16px;">
          <el-table
            v-loading="loading"
            :data="filteredGroupList"
            border
            stripe
            style="width: 100%"
          >
            <!-- 移除分组ID列 -->
            <!-- <el-table-column prop="id" label="分组ID" width="100" align="center" /> -->
            <el-table-column prop="name" label="分组名称" min-width="150" />
            <el-table-column prop="supplierIds" label="包含供应商" min-width="300">
                 <template #default="{ row }">
                   <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                     <el-tag 
                        v-for="(name, index) in getSupplierNames(row.supplierIds).slice(0, 3)" 
                        :key="index"
                        type="info" 
                        effect="plain"
                        size="small"
                     >
                        {{ name }}
                     </el-tag>
                     <el-tooltip
                        v-if="getSupplierNames(row.supplierIds).length > 3"
                        effect="dark"
                        placement="top"
                     >
                        <template #content>
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <span v-for="(name, index) in getSupplierNames(row.supplierIds).slice(3)" :key="index">
                                    {{ name }}
                                </span>
                            </div>
                        </template>
                        <el-tag type="info" effect="plain" size="small">
                            +{{ getSupplierNames(row.supplierIds).length - 3 }}
                        </el-tag>
                     </el-tooltip>
                   </div>
                 </template>
            </el-table-column>
            <!-- 移除备注列 -->
            <!-- <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip /> -->
            <!-- 移除创建时间列 -->
            <!-- <el-table-column prop="createTime" label="创建时间" width="180" align="center" /> -->
            <el-table-column label="操作" width="200" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link :icon="EditPen" @click="handleEditGroup(row)">编辑</el-button>
                <el-button type="danger" link :icon="Delete" @click="handleDeleteGroup(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页器 (模拟) -->
          <div class="pagination-container" style="margin-top: 20px; display: flex; justify-content: flex-end;">
            <el-pagination
              layout="total, prev, pager, next"
              :total="filteredGroupList.length"
              :page-size="10"
            />
          </div>
        </el-card>

      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑分组弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="供应商汇总分组"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="分组名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分组名称" />
        </el-form-item>
        
        <el-form-item label="选择供应商" prop="supplierIds">
            <el-select
                v-model="form.supplierIds"
                multiple
                filterable
                placeholder="请选择供应商"
                style="width: 100%"
            >
                <el-option
                    v-for="item in supplierOptions"
                    :key="item.id"
                    :label="item.supplier"
                    :value="item.id"
                />
            </el-select>
        </el-form-item>

        <!-- 移除弹窗中的备注字段 -->
        <!-- <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" rows="3" placeholder="请输入备注信息" />
        </el-form-item> -->
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search, EditPen, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { supplierList } from '@/data/supplierData'

// 激活的Tab
const activeTab = ref('supplierGrouping')

// 搜索
const searchQuery = ref('')
const loading = ref(false)

// 供应商选项数据
const supplierOptions = ref(supplierList)

// 辅助函数：根据ID获取供应商名称列表
const getSupplierNames = (ids) => {
    if (!ids || ids.length === 0) return []
    return ids.map(id => {
        const supplier = supplierOptions.value.find(item => item.id === id)
        return supplier ? supplier.supplier : `Unknown(${id})`
    })
}

// 分组列表数据 (模拟数据 - 更新名称)
const groupList = ref([
    {
        id: 1,
        name: '闪电',
        supplierIds: [1, 3, 5, 2], // 渠道A, C, E, B
        remark: '包含即时到账的优质供应商',
        createTime: '2023-11-01 10:00:00'
    },
    {
        id: 2,
        name: '熊猫',
        supplierIds: [4], // 渠道D
        remark: '当主通道拥堵时切换使用',
        createTime: '2023-11-05 14:30:00'
    }
])

// 过滤后的列表
const filteredGroupList = computed(() => {
    if (!searchQuery.value) return groupList.value
    return groupList.value.filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' | 'edit'
const formRef = ref(null)
const form = reactive({
    id: null,
    name: '',
    supplierIds: [],
    remark: ''
})

const rules = {
    name: [
        { required: true, message: '请输入分组名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    supplierIds: [
        { required: true, message: '请至少选择一个供应商', trigger: 'change' }
    ]
}

// 搜索处理
const handleSearch = () => {
    // 前端过滤，无需额外逻辑
}

// 新增分组
const handleAddGroup = () => {
    dialogType.value = 'add'
    form.id = null
    form.name = ''
    form.supplierIds = []
    form.remark = ''
    dialogVisible.value = true
}

// 编辑分组
const handleEditGroup = (row) => {
    dialogType.value = 'edit'
    form.id = row.id
    form.name = row.name
    // 复制数组，防止引用修改
    form.supplierIds = [...row.supplierIds]
    form.remark = row.remark
    dialogVisible.value = true
}

// 删除分组
const handleDeleteGroup = (row) => {
    ElMessageBox.confirm(
        `确定要删除分组 "${row.name}" 吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            const index = groupList.value.findIndex(item => item.id === row.id)
            if (index !== -1) {
                groupList.value.splice(index, 1)
                ElMessage.success('删除成功')
            }
        })
        .catch(() => {
            ElMessage.info('已取消删除')
        })
}

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return
    
    await formRef.value.validate((valid) => {
        if (valid) {
            loading.value = true
            // 模拟API请求延迟
            setTimeout(() => {
                if (dialogType.value === 'add') {
                    // 新增逻辑
                    const newId = groupList.value.length > 0 ? Math.max(...groupList.value.map(g => g.id)) + 1 : 1
                    groupList.value.unshift({
                        id: newId,
                        name: form.name,
                        supplierIds: form.supplierIds,
                        remark: form.remark,
                        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
                    })
                    ElMessage.success('添加成功')
                } else {
                    // 编辑逻辑
                    const index = groupList.value.findIndex(item => item.id === form.id)
                    if (index !== -1) {
                        groupList.value[index] = {
                            ...groupList.value[index],
                            name: form.name,
                            supplierIds: form.supplierIds,
                            remark: form.remark
                        }
                        ElMessage.success('修改成功')
                    }
                }
                loading.value = false
                dialogVisible.value = false
            }, 500)
        }
    })
}

onMounted(() => {
    // 初始化逻辑（如果需要从后端加载数据）
})

</script>

<style scoped>
.bot-other-settings-container {
    padding: 0;
}

.operation-bar {
    display: flex;
    align-items: center;
}
</style>
