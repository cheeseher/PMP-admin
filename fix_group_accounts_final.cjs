const fs = require('fs');

let content = fs.readFileSync('src/views/bot/GroupManagement.vue', 'utf8');

// 1. Change "2 个" to "2"
content = content.replace(
  /\{\{ Array\.isArray\(row\.ordinaryAccount\).*?\}\} 个/g,
  `{{ Array.isArray(row.ordinaryAccount) ? row.ordinaryAccount.length : row.ordinaryAccount.split(',').filter(Boolean).length }}`
);

// Just in case it was already replaced differently, let's target the exact column:
content = content.replace(
  /<el-table-column prop="ordinaryAccount" label="普通账号" width="100" align="center">[\s\S]*?<\/el-table-column>/,
  `<el-table-column prop="ordinaryAccount" label="普通账号" width="100" align="center">
          <template #default="{ row }">
            <el-button v-if="row.ordinaryAccount && (Array.isArray(row.ordinaryAccount) ? row.ordinaryAccount.length : row.ordinaryAccount.split(',').filter(Boolean).length) > 0" type="primary" link @click="openAccountListDialog(row, 'ordinary')">
              {{ Array.isArray(row.ordinaryAccount) ? row.ordinaryAccount.length : row.ordinaryAccount.split(',').filter(Boolean).length }}
            </el-button>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>`
);

// 2. Insert accountListDialog before </template> if it's not there
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

if (!content.includes('账号列表展示对话框')) {
  // Find the first </template> which marks the end of the Vue template
  content = content.replace('</template>', accountListDialog + '\n</template>');
}

fs.writeFileSync('src/views/bot/GroupManagement.vue', content);
