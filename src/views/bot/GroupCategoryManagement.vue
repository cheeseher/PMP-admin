<template>
  <div class="group-category-management-container">
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="left">
          <el-button type="primary" @click="openAddDialog">新增分组</el-button>
        </div>
        <div class="right">
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="load" />
          </el-tooltip>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table :data="groupCategoryOptions" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="分组名称" min-width="180" />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="warning" link @click="openCategoryPullDialog(row)">一键拉人</el-button>
            <el-button type="danger" link @click="handleDeleteCategory(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="addDialogVisible" title="新增分组" width="460px" destroy-on-close>
      <el-form ref="addFormRef" :model="addForm" label-width="100px">
        <el-form-item label="分组名称" prop="name" required>
          <el-input v-model="addForm.name" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdd">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="categoryPullDialogVisible" title="一键拉人" width="600px" destroy-on-close>
      <div v-if="currentCategoryForPull" style="margin-bottom: 16px;">
        <p><strong>分组:</strong> {{ currentCategoryForPull.name }}</p>
      </div>
      <el-form :model="categoryPullForm" label-width="100px">
        <el-form-item label="普通账号" required>
          <el-select
            v-model="categoryPullForm.accountIds"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择要拉入的普通账号"
            style="width: 100%"
          >
            <el-option
              v-for="acc in normalAccountOptions"
              :key="acc.id"
              :label="acc.name"
              :value="acc.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ acc.name }}</span>
                <span v-if="acc.errorMessage" style="color: #E6A23C; font-size: 12px">被限制</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="categoryPullDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="categoryPullLoading" @click="submitCategoryPull">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';

const GROUP_CATEGORY_STORAGE_KEY = 'pmp_bot_group_category_options';
const NORMAL_ACCOUNT_STORAGE_KEY = 'pmp_bot_normal_accounts';

const normalAccountOptions = ref([]);
const groupCategoryOptions = ref([]);

const load = () => {
  try {
    const raw = localStorage.getItem(GROUP_CATEGORY_STORAGE_KEY);
    if (!raw) {
      groupCategoryOptions.value = [
        { id: 1, name: '核心商户群' },
        { id: 2, name: '备用测试群' }
      ];
      localStorage.setItem(GROUP_CATEGORY_STORAGE_KEY, JSON.stringify(groupCategoryOptions.value));
    } else {
      const parsed = JSON.parse(raw);
      groupCategoryOptions.value = Array.isArray(parsed)
        ? parsed
            .map(item => ({ id: item?.id, name: item?.name }))
            .filter(item => item.id != null && String(item.name || '').trim())
        : [];
    }
  } catch {
    groupCategoryOptions.value = [];
  }

  try {
    const rawNormal = localStorage.getItem(NORMAL_ACCOUNT_STORAGE_KEY);
    if (!rawNormal) {
      normalAccountOptions.value = [];
      return;
    }
    const parsedNormal = JSON.parse(rawNormal);
    normalAccountOptions.value = Array.isArray(parsedNormal) ? parsedNormal : [];
  } catch {
    normalAccountOptions.value = [];
  }
};

const persist = () => {
  localStorage.setItem(GROUP_CATEGORY_STORAGE_KEY, JSON.stringify(groupCategoryOptions.value));
};

const addDialogVisible = ref(false);
const addFormRef = ref(null);
const addForm = reactive({ name: '' });
const openAddDialog = () => {
  addForm.name = '';
  addDialogVisible.value = true;
};
const submitAdd = () => {
  const name = addForm.name.trim();
  if (!name) return ElMessage.warning('请输入分组名称');
  const exists = groupCategoryOptions.value.some(item => String(item.name).trim() === name);
  if (exists) return ElMessage.warning('该分组已存在');
  groupCategoryOptions.value.push({ id: Date.now(), name });
  persist();
  addDialogVisible.value = false;
  ElMessage.success('新增分组成功');
};

const handleDeleteCategory = (row) => {
  ElMessageBox.confirm(`确认删除分组【${row.name}】？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    groupCategoryOptions.value = groupCategoryOptions.value.filter(item => item.id !== row.id);
    persist();
    ElMessage.success('删除成功');
  }).catch(() => {});
};

const categoryPullDialogVisible = ref(false);
const categoryPullLoading = ref(false);
const currentCategoryForPull = ref(null);
const categoryPullForm = reactive({
  accountIds: []
});
const openCategoryPullDialog = (row) => {
  currentCategoryForPull.value = row;
  categoryPullForm.accountIds = [];
  categoryPullDialogVisible.value = true;
};
const submitCategoryPull = () => {
  if (!categoryPullForm.accountIds.length) return ElMessage.warning('请选择普通账号');
  categoryPullLoading.value = true;
  setTimeout(() => {
    categoryPullLoading.value = false;
    categoryPullDialogVisible.value = false;
    ElMessage.success('入群指令已下发给机器人！');
  }, 800);
};

onMounted(() => {
  load();
});
</script>

<style scoped>
.group-category-management-container {
  padding: 20px;
}

.toolbar-card {
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar .left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dialog-footer {
  text-align: right;
}

.text-secondary {
  color: var(--el-text-color-secondary);
}
</style>
