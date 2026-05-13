const fs = require('fs');

let content = fs.readFileSync('src/views/bot/GroupManagement.vue', 'utf8');

// 1. 移除表格勾选框
content = content.replace('<el-table-column type="selection" width="55" align="center" />', '');
content = content.replace('@selection-change="handleSelectionChange"', '');

// 2. 将“普通账号”和“拉人账号”列改为弹窗形式
content = content.replace(
  /<el-table-column prop="ordinaryAccount" label="普通账号" min-width="180">[\s\S]*?<\/el-table-column>/,
  `<el-table-column label="普通账号" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openAccountDetailDialog(row, 'ordinary')">
              {{ (typeof row.ordinaryAccount === 'string' ? row.ordinaryAccount.split(',').filter(Boolean).length : (row.ordinaryAccount?.length || 0)) }}
            </el-button>
          </template>
        </el-table-column>`
);

content = content.replace(
  /<el-table-column prop="pullAccount" label="拉人账号" min-width="180">[\s\S]*?<\/el-table-column>/,
  `<el-table-column label="拉人账号" width="100" align="center">
          <template #default="{ row }">
            <el-button type="warning" link @click="openAccountDetailDialog(row, 'pull')">
              {{ (typeof row.pullAccount === 'string' ? row.pullAccount.split(',').filter(Boolean).length : (row.pullAccount?.length || 0)) }}
            </el-button>
          </template>
        </el-table-column>`
);

// 3. 修改分组管理对话框，支持关联普通账号
content = content.replace(
  '<el-table :data="groupCategoryOptions" border stripe max-height="300">\n        <el-table-column prop="name" label="分组名称" />',
  `<el-table :data="groupCategoryOptions" border stripe max-height="400">
        <el-table-column prop="name" label="分组名称" width="150" />
        <el-table-column label="关联普通账号">
          <template #default="{ row }">
            <el-input 
              v-model="row.associatedAccounts" 
              type="textarea" 
              :rows="2" 
              placeholder="多个请用逗号隔开" 
              size="small"
              @blur="handleUpdateCategoryAccounts(row)"
            />
          </template>
        </el-table-column>`
);

// 4. 新增账号详情弹窗
const accountDetailDialog = `
    <!-- 账号详情弹窗 (带备注/限制信息) -->
    <el-dialog
      v-model="accountDetailVisible"
      :title="accountDetailTitle"
      width="700px"
      destroy-on-close
    >
      <el-table :data="accountDetailList" border stripe>
        <el-table-column prop="name" label="账号名称/ID" min-width="150" />
        <el-table-column label="状态/限制" min-width="200">
          <template #default="{ row }">
            <span v-if="row.errorMessage" style="color: #F56C6C">
              <el-icon><Warning /></el-icon> {{ row.errorMessage }}
            </span>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="accountDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
`;

content = content.replace('  </div>\n</template>', accountDetailDialog + '\n  </div>\n</template>');

// 5. 更新 JS 逻辑
const newJsLogic = `
// 账号详情弹窗逻辑
const accountDetailVisible = ref(false);
const accountDetailTitle = ref('');
const accountDetailList = ref([]);

// 模拟所有账号的详细状态（带备注信息）
const allAccountsMockInfo = {
  '@test_ord': { name: '@test_ord', errorMessage: '' },
  '@test_ord2': { name: '@test_ord2', errorMessage: '登录失效' },
  '@test_pull1': { name: '@test_pull1', errorMessage: '' },
  '@test_pull2': { name: '@test_pull2', errorMessage: '操作过于频繁' },
  '@pull_master': { name: '@pull_master', errorMessage: '' },
  '@pull_assistant': { name: '@pull_assistant', errorMessage: '拉人受限' }
};

const openAccountDetailDialog = (row, type) => {
  const accountStr = type === 'ordinary' ? row.ordinaryAccount : row.pullAccount;
  accountDetailTitle.value = type === 'ordinary' ? '普通账号详情' : '拉人账号详情';
  
  const accounts = typeof accountStr === 'string' ? accountStr.split(',').filter(Boolean) : [];
  accountDetailList.value = accounts.map(acc => {
    return allAccountsMockInfo[acc] || { name: acc, errorMessage: '暂无限制信息' };
  });
  
  accountDetailVisible.value = true;
};

const handleUpdateCategoryAccounts = (row) => {
  ElMessage.success(\`分组 "\${row.name}" 关联账号已更新\`);
};
`;

content = content.replace(
  '// 配置群组信息 (分组, 账号)',
  newJsLogic + '\n// 配置群组信息 (分组, 账号)'
);

// 为分组选项增加关联账号字段
content = content.replace(
  "{ id: 1, name: '核心商户群' },\n  { id: 2, name: '备用测试群' },",
  "{ id: 1, name: '核心商户群', associatedAccounts: '@test_ord,@test_ord2' },\n  { id: 2, name: '备用测试群', associatedAccounts: '' },"
);

// 导入图标
content = content.replace(
  "import { Search, Refresh, ArrowDown, Setting, Lock } from '@element-plus/icons-vue';",
  "import { Search, Refresh, ArrowDown, Setting, Lock, Warning } from '@element-plus/icons-vue';"
);

fs.writeFileSync('src/views/bot/GroupManagement.vue', content);
