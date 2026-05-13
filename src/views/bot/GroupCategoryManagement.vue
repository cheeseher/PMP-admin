<template>
  <div class="group-category-management-container">
    <el-card shadow="never" class="toolbar-card">
      <div class="filter-container">
        <el-form inline @submit.prevent>
          <el-form-item label="分组名称">
            <el-input
              v-model="searchQuery"
              placeholder="请输入分组名称"
              style="width: 220px;"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card shadow="never">
      <!-- 表格工具栏：放置操作按钮 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="openAddDialog" :icon="Plus">新增分组</el-button>
        </div>
        <div class="right">
          <span v-if="selectedCategories.length > 0" class="selected-tip">
            已选 <strong>{{ selectedCategories.length }}</strong> 个分组
            <el-button link type="danger" style="padding: 0 4px" @click="clearSelection">清空</el-button>
          </span>
          <el-tooltip :content="selectedCategories.length === 0 ? '请先勾选分组' : '批量拉人'" placement="top">
            <span>
              <el-button
                type="warning"
                :disabled="selectedCategories.length === 0"
                @click="openBatchCategoryPullDialog"
              >批量拉人</el-button>
            </span>
          </el-tooltip>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="load" />
          </el-tooltip>
        </div>
      </div>

      <el-table
        ref="categoryTableRef"
        v-loading="loading"
        :data="pagedCategories"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center">
          <template #default="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分组名称" min-width="180" />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="warning" link @click="openCategoryPullDialog(row)">一键拉人</el-button>
            <el-button type="danger" link @click="handleDeleteCategory(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
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

    <el-dialog
      v-model="categoryPullDialogVisible"
      title="一键拉人"
      width="480px"
      destroy-on-close
    >
      <!-- [设计] 与群组管理页面对齐：仅展示摘要，不展开具体列表 -->
      <el-alert
        style="margin-bottom: 20px;"
        :title="currentCategoryForPull ? `该分组【${currentCategoryForPull.name}】下共有 ${totalPullGroupCount} 个群组` : `已选择 ${selectedCategories.length} 个分组，共包含 ${totalPullGroupCount} 个群组`"
        type="info"
        :closable="false"
        show-icon
      />
      <el-form :model="categoryPullForm" label-width="80px">
        <el-form-item label="普通账号" required>
          <!-- [设计] 使用与群组管理一致的全选下拉逻辑 -->
          <el-select
            v-model="categoryPullForm.accountIds"
            multiple
            filterable
            collapse-tags
            :max-collapse-tags="3"
            collapse-tags-tooltip
            placeholder="请搜索或选择普通账号"
            style="width: 100%"
            @change="handleAccountSelectChange"
          >
            <!-- 全选项哨兵 -->
            <el-option
              value="__SELECT_ALL__"
              class="select-all-option"
            >
              <span style="font-weight: 600; color: #409EFF;">
                {{ batchSelectAllLabel }}
              </span>
            </el-option>
            <el-option
              v-for="acc in normalAccountOptions"
              :key="acc.id"
              :label="acc.tgid ? `${acc.name}(${acc.tgid})` : acc.name"
              :value="acc.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>
                  {{ acc.name }}
                  <span v-if="acc.tgid" style="color: #909399; font-size: 12px;">（{{ acc.tgid }}）</span>
                </span>
                <span v-if="acc.errorMessage" style="color: #E6A23C; font-size: 12px;">⚠ 被限制</span>
              </div>
            </el-option>
          </el-select>
          <div style="font-size: 12px; color: #909399; margin-top: 6px;">
            已选 {{ categoryPullForm.accountIds.length }} / 共 {{ normalAccountOptions.length }} 个账号
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="categoryPullDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="categoryPullLoading" @click="submitCategoryPull">
            确认（{{ totalPullGroupCount }} 个群 × {{ categoryPullForm.accountIds.length }} 个账号）
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, Plus, Search } from '@element-plus/icons-vue';

const GROUP_CATEGORY_STORAGE_KEY = 'pmp_bot_group_category_options';
const NORMAL_ACCOUNT_STORAGE_KEY = 'pmp_bot_normal_accounts';

const normalAccountOptions = ref([]);
const groupCategoryOptions = ref([]);
const loading = ref(false);

// [逻辑] 搜索与分页状态
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(20);

// [逻辑] 过滤后的数据
const filteredCategories = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return groupCategoryOptions.value;
  return groupCategoryOptions.value.filter(item => 
    item.name.toLowerCase().includes(query)
  );
});

// [逻辑] 当前页数据切片
const pagedCategories = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredCategories.value.slice(start, start + pageSize.value);
});

const total = computed(() => filteredCategories.value.length);

const load = () => {
  loading.value = true;
  try {
    const raw = localStorage.getItem(GROUP_CATEGORY_STORAGE_KEY);
    if (!raw) {
      groupCategoryOptions.value = [
        { id: 1, name: '核心商户群' },
        { id: 2, name: '备用测试群' },
        { id: 3, name: '活动通知群' },
        { id: 4, name: '代理交流群' },
        { id: 5, name: '技术支持群' }
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
    } else {
      const parsedNormal = JSON.parse(rawNormal);
      normalAccountOptions.value = Array.isArray(parsedNormal) ? parsedNormal : [];
    }
  } catch {
    normalAccountOptions.value = [];
  }
  
  setTimeout(() => {
    loading.value = false;
  }, 300);
};

const handleSearch = () => {
  currentPage.value = 1;
};

const resetFilter = () => {
  searchQuery.value = '';
  handleSearch();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
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
  ElMessageBox.confirm(`确认删除分组【${row.name}】？删除后已关联该分组的群组将变为未分配状态！`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    groupCategoryOptions.value = groupCategoryOptions.value.filter(item => item.id !== row.id);
    persist();
    ElMessage.success('删除成功');
  }).catch(() => {});
};

// [逻辑] 跨行多选维护
const categoryTableRef = ref(null);
const selectedCategories = ref([]);
const handleSelectionChange = (selection) => {
  selectedCategories.value = selection;
};
const clearSelection = () => {
  categoryTableRef.value?.clearSelection();
};

const categoryPullDialogVisible = ref(false);
const categoryPullLoading = ref(false);
const currentCategoryForPull = ref(null); // 为null时表示是批量操作
const categoryPullForm = reactive({
  accountIds: []
});

// [原型图逻辑] 模拟该分组下的群组数量（支持单选或批量汇总）
const totalPullGroupCount = computed(() => {
  if (currentCategoryForPull.value) {
    // 单个分组操作
    const name = currentCategoryForPull.value.name;
    if (name.includes('核心')) return 8;
    if (name.includes('测试')) return 12;
    return 5;
  } else {
    // 批量分组操作：简单汇总已选分组的模拟数量
    return selectedCategories.value.reduce((acc, cur) => {
      const name = cur.name;
      let count = 5;
      if (name.includes('核心')) count = 8;
      if (name.includes('测试')) count = 12;
      return acc + count;
    }, 0);
  }
});

// [逻辑] 账号全选相关
const batchSelectAllLabel = computed(() => {
  const allIds = normalAccountOptions.value.map(a => a.id);
  const allSelected = allIds.length > 0 && allIds.every(id => categoryPullForm.accountIds.includes(id));
  return allSelected ? '取消全选' : `全选所有账号（${allIds.length}个）`;
});

const handleAccountSelectChange = (newVal) => {
  if (newVal.includes('__SELECT_ALL__')) {
    const realSelected = newVal.filter(v => v !== '__SELECT_ALL__');
    const allIds = normalAccountOptions.value.map(a => a.id);
    if (realSelected.length === allIds.length) {
      categoryPullForm.accountIds = [];
    } else {
      categoryPullForm.accountIds = [...allIds];
    }
  }
  categoryPullForm.accountIds = categoryPullForm.accountIds.filter(v => v !== '__SELECT_ALL__');
};

const openCategoryPullDialog = (row) => {
  currentCategoryForPull.value = row;
  categoryPullForm.accountIds = [];
  categoryPullDialogVisible.value = true;
};

// [逻辑] 打开批量拉人弹窗
const openBatchCategoryPullDialog = () => {
  currentCategoryForPull.value = null; // 标记为批量
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

.filter-container :deep(.el-form-item) {
  margin-bottom: 0;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-toolbar .right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* [设计] 已选提示样式 */
.selected-tip {
  font-size: 13px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 2px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}

.text-secondary {
  color: var(--el-text-color-secondary);
}

/* [设计] 全选选项视觉分隔 */
:deep(.select-all-option) {
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 4px;
}
</style>
