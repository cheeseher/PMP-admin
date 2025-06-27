<!-- 机器人管理/角色管理 - 配置用户角色与权限 -->
<template>
  <div class="role-management-container">
    <!-- 筛选表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="filterForm" inline class="filter-form">
        <el-form-item label="角色名称：">
          <el-input 
            v-model="filterForm.roleName" 
            placeholder="请输入角色名称" 
            clearable 
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据展示区域 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <el-button type="primary" :icon="Plus" @click="openDialog('add')">新增角色</el-button>
        <el-tooltip content="刷新数据">
          <el-button :icon="Refresh" circle plain @click="handleSearch" />
        </el-tooltip>
      </div>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="roleName" label="角色名称" min-width="150" />
        <el-table-column prop="description" label="角色描述" min-width="200" />
        <el-table-column label="指令" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openCommandListDialog(row)">
              {{ row.commands ? row.commands.length : 0 }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('edit', row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
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

    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="600px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="dialogForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="dialogForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="指令权限" prop="commands">
            <el-select
                v-model="dialogForm.commands"
                multiple
                filterable
                placeholder="请选择该角色可用的指令"
                style="width: 100%;"
            >
                <el-option
                    v-for="command in commandOptions"
                    :key="command.id"
                    :label="`${command.keyword} (${command.format})`"
                    :value="command.id"
                />
            </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dialogForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 指令列表对话框 -->
    <el-dialog
      v-model="commandListDialogVisible"
      title="已授权指令列表"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentRoleForCommands" style="margin-bottom: 16px;">
          <strong>角色: {{ currentRoleForCommands.roleName }}</strong>
      </div>
      <el-table :data="commandListData" border stripe>
        <el-table-column prop="id" label="指令ID" width="100" />
        <el-table-column prop="keyword" label="指令关键词" />
        <el-table-column prop="format" label="示例格式" />
      </el-table>
      <template #footer>
        <el-button @click="commandListDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Plus } from '@element-plus/icons-vue';

// 筛选表单
const filterForm = reactive({
  roleName: '',
});

const loading = ref(false);
const tableData = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 模拟角色数据
const mockRoleData = [
  { id: 1, roleName: '上游群角色', description: '用于上游供应商群组，具备查询余额、产品等权限。', status: 'enabled', commands: [1, 2] },
  { id: 2, roleName: '商户群角色', description: '用于普通商户群组，具备绑定商户、查询自身订单等权限。', status: 'enabled', commands: [3, 4] },
  { id: 3, roleName: '游客角色', description: '未绑定商户的游客，无任何指令权限。', status: 'disabled', commands: [] },
];

// 模拟指令选项
const commandOptions = ref([
    { id: 1, keyword: '产品', format: '产品' },
    { id: 2, keyword: '余额', format: '余额' },
    { id: 3, keyword: '绑定', format: '绑定#商户号#商户密钥' },
    { id: 4, keyword: '订单', format: '订单#订单号' },
    { id: 5, keyword: '帮助', format: '帮助' },
]);

const loadTableData = () => {
  loading.value = true;
  setTimeout(() => {
    tableData.value = mockRoleData;
    pagination.total = mockRoleData.length;
    loading.value = false;
  }, 500);
};

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref('add');
const dialogFormRef = ref(null);
const dialogForm = reactive({
  id: null,
  roleName: '',
  description: '',
  status: 'enabled',
  commands: [],
});

// 指令列表弹窗相关
const commandListDialogVisible = ref(false);
const currentRoleForCommands = ref(null);
const commandListData = ref([]);

const dialogRules = reactive({
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
});

const openDialog = (type, row) => {
  dialogType.value = type;
  if (type === 'edit' && row) {
    dialogForm.id = row.id;
    dialogForm.roleName = row.roleName;
    dialogForm.description = row.description;
    dialogForm.status = row.status;
    dialogForm.commands = row.commands || []; // 回显指令
  } else {
    dialogForm.id = null;
    dialogForm.roleName = '';
    dialogForm.description = '';
    dialogForm.status = 'enabled';
    dialogForm.commands = []; // 清空指令
  }
  dialogVisible.value = true;
};

const openCommandListDialog = (row) => {
  currentRoleForCommands.value = row;
  // 根据角色拥有的指令ID，从所有指令选项中筛选出完整的指令对象
  commandListData.value = commandOptions.value.filter(
    command => row.commands.includes(command.id)
  );
  commandListDialogVisible.value = true;
};

const submitForm = () => {
  dialogFormRef.value.validate((valid) => {
    if (!valid) return;
    if (dialogForm.id) {
      const index = tableData.value.findIndex(item => item.id === dialogForm.id);
      if (index !== -1) {
        tableData.value[index] = { ...dialogForm };
      }
      ElMessage.success('角色更新成功');
    } else {
      const newRole = { id: Date.now(), ...dialogForm };
      tableData.value.unshift(newRole);
      ElMessage.success('角色新增成功');
    }
    dialogVisible.value = false;
  });
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色 "${row.roleName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id);
    if (index !== -1) {
      tableData.value.splice(index, 1);
    }
    ElMessage.success('删除成功');
  });
};

// 搜索
const handleSearch = () => {
  loadTableData();
};

// 重置筛选
const resetFilter = () => {
  filterForm.roleName = '';
  handleSearch();
};

// 分页
const handleSizeChange = (val) => {
  pagination.pageSize = val;
  loadTableData();
};
const handleCurrentChange = (val) => {
  pagination.currentPage = val;
  loadTableData();
};

onMounted(() => {
  loadTableData();
});
</script>

<style scoped>
.role-management-container {
  padding: 20px;
}
.filter-container {
  margin-bottom: 20px;
}
.filter-form {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.dialog-footer {
  text-align: right;
}
</style> 