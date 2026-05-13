const fs = require('fs');

let content = fs.readFileSync('src/views/bot/GroupManagement.vue', 'utf8');

// 1. Fix ordinaryAccount column display and click
content = content.replace(
  /<el-table-column prop="ordinaryAccount"[\s\S]*?<\/el-table-column>/,
  `<el-table-column prop="ordinaryAccount" label="普通账号" width="100" align="center">
          <template #default="{ row }">
            <el-button v-if="row.ordinaryAccount && (Array.isArray(row.ordinaryAccount) ? row.ordinaryAccount.length : row.ordinaryAccount.split(',').filter(Boolean).length) > 0" type="primary" link @click="openAccountListDialog(row, 'ordinary')">
              {{ Array.isArray(row.ordinaryAccount) ? row.ordinaryAccount.length : row.ordinaryAccount.split(',').filter(Boolean).length }} 个
            </el-button>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>`
);

// 2. Fix pullAccount column to show only one account
content = content.replace(
  /<el-table-column prop="pullAccount"[\s\S]*?<\/el-table-column>/,
  `<el-table-column prop="pullAccount" label="拉人账号" min-width="120">
          <template #default="{ row }">
            <template v-if="row.pullAccount && (Array.isArray(row.pullAccount) ? row.pullAccount.length : row.pullAccount.split(',').filter(Boolean).length) > 0">
              <el-tag size="small" type="warning">
                {{ Array.isArray(row.pullAccount) ? (row.pullAccount[0].name || row.pullAccount[0]) : row.pullAccount.split(',').filter(Boolean)[0] }}
              </el-tag>
            </template>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>`
);

// 3. Fix openAccountListDialog JS logic to handle string input properly
const oldJsLogic = `const openAccountListDialog = (row, type) => {
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
};`;

const newJsLogic = `const openAccountListDialog = (row, type) => {
  currentGroupForAccounts.value = row;
  accountListDialogType.value = type;
  
  let rawAccounts = type === 'ordinary' ? row.ordinaryAccount : row.pullAccount;
  if (!rawAccounts) rawAccounts = [];
  if (typeof rawAccounts === 'string') {
    rawAccounts = rawAccounts.split(',').map(s => s.trim()).filter(Boolean);
  }
  
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
};`;

content = content.replace(oldJsLogic, newJsLogic);

// Ensure config Group handles string format mapping when opening dialog so it shows in textarea correctly
const oldConfigOpen = `const openConfigGroupDialog = (row) => {
  configGroupForm.groupId = row.groupId;
  configGroupForm.groupName = row.groupName;
  configGroupForm.categoryId = row.categoryId || '';
  configGroupForm.ordinaryAccount = row.ordinaryAccount || '';
  configGroupForm.pullAccount = row.pullAccount || '';
  configGroupDialogVisible.value = true;
};`;

const newConfigOpen = `const openConfigGroupDialog = (row) => {
  configGroupForm.groupId = row.groupId;
  configGroupForm.groupName = row.groupName;
  configGroupForm.categoryId = row.categoryId || '';
  
  // Convert array back to string for textarea editing
  configGroupForm.ordinaryAccount = Array.isArray(row.ordinaryAccount) 
    ? row.ordinaryAccount.map(a => typeof a === 'string' ? a : a.name).join(',')
    : (row.ordinaryAccount || '');
    
  configGroupForm.pullAccount = Array.isArray(row.pullAccount)
    ? row.pullAccount.map(a => typeof a === 'string' ? a : a.name).join(',')
    : (row.pullAccount || '');
    
  configGroupDialogVisible.value = true;
};`;

content = content.replace(oldConfigOpen, newConfigOpen);

fs.writeFileSync('src/views/bot/GroupManagement.vue', content);
