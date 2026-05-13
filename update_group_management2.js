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
            <template v-if="row.normalAccounts && row.normalAccounts.l
let content = fs.readFileSync(g v