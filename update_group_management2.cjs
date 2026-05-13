const fs = require('fs');

let content = fs.readFileSync('src/views/bot/GroupManagement.vue', 'utf8');

// 1. Remove selection column
content = content.replace(
  'style="width: 100%"\n        @selection-change="handleSelectionChange"\n      >\n        <el-table-column type="selection" width="55" align="center" />',
  'style="width: 100%"\n      >'
);

// Remove the disabled attribute from batch join button (if present)
content = content.replace(
  ':disabled="selectedGroups.length === 0" \n            @click="openBatchJoinDialog"',
  '@click="openBatchJoinDialog"'
);

// 2. Add normal accounts binding to category management dialog
content = content.replace(
  '<el-table-column prop="name" label="分组名称" />',
  `<el-table-column prop="name" label="分组名称" />
        <el-table-column label="关联普通账号" min-width="150">
          <template #default="{ row }">
            <template v-if="row.normalAccounts && row.normalAccounts.length > 0">
              <el-tag v-for="(acc, idx) in row.normalAccounts" :key="idx" size="small" type="info" style="margin: 2px">{{ acc }}</el-tag>
            </template>
            <span v-else class="text-secondary">未关联</span>
          </template>
        </el-table-column>`
);

content = content.replace(
  '<el-button type="danger" link @click="handleDeleteCategory(row)">删除</el-button>',
  `<el-button type="primary" link @click="openCategoryAccountDialog(row)">配置账号</el-button>
            <el-button type="danger" link @click="handleDeleteCategory(row)">删除</el-button>`
);

// Add the categoryAccount dialog right after categoryManagementDialog
const categoryAccountDialog = `
    <!-- 配置分组账号对话框 -->
    <el-dialog
      v-model="categoryAccountDialogVisible"
      title="配置分组账号"
      width="500px"
      destroy-on-close
    >
      <el-form ref="categoryAccountFormRef" :model="categoryAccountForm" label-width="100px">
        <el-form-item label="所属分组">
          <el-input v-model="currentCategoryForAccount.name" disabled />
        </el-form-item>
        <el-form-item label="普通账号">
          <el-select 
            v-model="categoryAccountForm.normalAccounts" 
            multiple 
            filterable 
            placeholder="请选择要关联的普通账号" 
            style="width: 100%;"
          >
            <el-option 
              v-for="acc in normalAccountOptions" 
              :key="acc.id" 
              :label="acc.name" 
              :value="acc.name"
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
          <el-button @click="categoryAccountDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryAccount">保存</el-button>
        </div>
      </template>
    </el-dialog>
`;
content = content.replace('    </el-dialog>\n\n    <!-- 批量入群对话框 -->', '    </el-dialog>\n' + categoryAccountDialog + '\n    <!-- 批量入群对话框 -->');


// 3. Change ordinaryAccount and pullAccount to clickable buttons
content = content.replace(
  `<el-table-column prop="ordinaryAccount" label="普通账号" min-width="180">
          <template #default="{ row }">
            <template v-if="row.ordinaryAccount && row.ordinaryAccount.length > 0">
              <el-tag v-for="(acc, idx) in (typeof row.ordinaryAccount === 'string' ? row.ordinaryAccount.split(',') : row.ordinaryAccount)" :key="idx" size="small" style="margin: 2px" type="info">{{ acc }}</el-tag>
            </template>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>`,
  `<el-table-column prop="ordinaryAccount" label="普通账号" width="100" align="center">
          <template #default="{ row }">
            <el-button v-if="row.ordinaryAccount && row.ordinaryAccount.length > 0" type="primary" link @click="openAccountListDialog(row, 'ordinary')">
              {{ row.ordinaryAccount.length }} 个账号
            </el-button>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>`
);

// Fallback if the previous string was not perfectly matched due to the tag contents change
content = content.replace(
  /<el-table-column prop="ordinaryAccount"[\s\S]*?<\/el-table-column>/,
  `<el-table-column prop="ordinaryAccount" label="普通账号" width="100" align="center">
          <template #default="{ row }">
            <el-button v-if="row.ordinaryAccount && row.ordinaryAccount.length > 0" type="primary" link @click="openAccountListDialog(row, 'ordinary')">
              {{ row.ordinaryAccount.length }}
            </el-button>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>`
);

content = content.replace(
  /<el-table-column prop="pullAccount"[\s\S]*?<\/el-table-column>/,
  `<el-table-column prop="pullAccount" label="拉人账号" width="100" align="center">
          <template #default="{ row }">
            <el-button v-if="row.pullAccount && row.pullAccount.length > 0" type="primary" link @click="openAccountListDialog(row, 'pull')">
              {{ row.pullAccount.length }}
            </el-button>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>`
);

// Add the account list dialog
const accountListDialog = `
    <!-- 账号列表展示对话框 -->
    <el-dialog
      v-model="accountListDialogVisible"
      :title="accountListDialogType === 'ordinary' ? '普通账号列表' : '拉人账号列表'"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentGroupForAccounts" style="margin-bottom: 16px;">
        <p><strong>群组:</strong> {{ currentGroupForAccounts.groupName }} ({{ currentGroupForAccounts.groupId }})</p>
      </div>
      <el-table :data="accountListData" border stripe>
        <el-table-column prop="name" label="账号名称" min-width="150" />
        <el-table-column label="备注" min-width="200">
          <template #default="{ row }">
            <div v-if="row.errorMessage">
              <span style="color: #E6A23C">限制</span>：{{ row.errorMessage }}
            </div>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="accountListDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
`;
content = content.replace('  </div>\n</template>', accountListDialog + '\n  </div>\n</template>');

// Modify js Logic:

const extraJs = `
// 模拟来自系统的账号数据
const normalAccountOptions = ref([
  { id: 1, name: '@test_ord', errorMessage: '限制：发言过快' },
  { id: 2, name: '@test_ord2', errorMessage: '' },
  { id: 3, name: '@test_ord3', errorMessage: '被封禁24小时' },
]);

// 分组账号配置
const categoryAccountDialogVisible = ref(false);
const currentCategoryForAccount = ref({});
const categoryAccountForm = reactive({
  normalAccounts: []
});
const openCategoryAccountDialog = (row) => {
  currentCategoryForAccount.value = row;
  categoryAccountForm.normalAccounts = row.normalAccounts ? [...row.normalAccounts] : [];
  categoryAccountDialogVisible.value = true;
};
const submitCategoryAccount = () => {
  currentCategoryForAccount.value.normalAccounts = [...categoryAccountForm.normalAccounts];
  categoryAccountDialogVisible.value = false;
  ElMessage.success('配置分组账号成功');
};

// 查看群组关联的账号列表
const accountListDialogVisible = ref(false);
const accountListDialogType = ref('ordinary');
const accountListData = ref([]);
const currentGroupForAccounts = ref(null);

const openAccountListDialog = (row, type) => {
  currentGroupForAccounts.value = row;
  accountListDialogType.value = type;
  const rawAccounts = type === 'ordinary' ? row.ordinaryAccount : row.pullAccount;
  
  // Convert strings/objects to unified format for display
  accountListData.value = rawAccounts.map(acc => {
    if (typeof acc === 'string') {
      // Find in options if it exists to get errorMessage
      const found = normalAccountOptions.value.find(o => o.name === acc);
      return found ? found : { name: acc, errorMessage: '' };
    }
    return acc;
  });
  
  accountListDialogVisible.value = true;
};
`;

content = content.replace('// ----------------- 新增逻辑：分组与入群 -----------------', '// ----------------- 新增逻辑：分组与入群 -----------------\n' + extraJs);

// update mock data format
content = content.replace(
  "ordinaryAccount: '@test_ord,@test_ord2',\n    pullAccount: '@test_pull1,@test_pull2',",
  `ordinaryAccount: [
      { name: '@test_ord', errorMessage: '限制：发言过快' },
      { name: '@test_ord2', errorMessage: '' }
    ],
    pullAccount: [
      { name: '@test_pull1', errorMessage: '' },
      { name: '@test_pull2', errorMessage: '频繁操作' }
    ],`
);

content = content.replace(
  "const groupCategoryOptions = ref([\n  { id: 1, name: '核心商户群' },\n  { id: 2, name: '备用测试群' },\n]);",
  "const groupCategoryOptions = ref([\n  { id: 1, name: '核心商户群', normalAccounts: ['@test_ord'] },\n  { id: 2, name: '备用测试群', normalAccounts: [] },\n]);"
);

fs.writeFileSync('src/views/bot/GroupManagement.vue', content);
