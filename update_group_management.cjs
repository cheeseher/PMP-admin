const fs = require('fs');

let content = fs.readFileSync('src/views/bot/GroupManagement.vue', 'utf8');

// 1. Update filter options: remove '全部', add '未分组'
content = content.replace(
  '<el-option label="全部" value="" />\n              <el-option \n                v-for="category in groupCategoryOptions"',
  '<el-option label="未分组" value="unassigned" />\n              <el-option \n                v-for="category in groupCategoryOptions"'
);

// 2. Update table columns for ordinaryAccount and pullAccount to support multiple accounts
content = content.replace(
  '<el-table-column prop="ordinaryAccount" label="普通账号" min-width="120">\n          <template #default="{ row }">\n            <span>{{ row.ordinaryAccount || \'-\' }}</span>\n          </template>\n        </el-table-column>',
  `<el-table-column prop="ordinaryAccount" label="普通账号" min-width="180">
          <template #default="{ row }">
            <template v-if="row.ordinaryAccount && row.ordinaryAccount.length > 0">
              <el-tag v-for="(acc, idx) in (typeof row.ordinaryAccount === 'string' ? row.ordinaryAccount.split(',') : row.ordinaryAccount)" :key="idx" size="small" style="margin: 2px" type="info">{{ acc }}</el-tag>
            </template>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>`
);

content = content.replace(
  '<el-table-column prop="pullAccount" label="拉人账号" min-width="120">\n          <template #default="{ row }">\n            <span>{{ row.pullAccount || \'-\' }}</span>\n          </template>\n        </el-table-column>',
  `<el-table-column prop="pullAccount" label="拉人账号" min-width="180">
          <template #default="{ row }">
            <template v-if="row.pullAccount && row.pullAccount.length > 0">
              <el-tag v-for="(acc, idx) in (typeof row.pullAccount === 'string' ? row.pullAccount.split(',') : row.pullAccount)" :key="idx" size="small" style="margin: 2px" type="warning">{{ acc }}</el-tag>
            </template>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>`
);

// 3. Add "一键拉人" to Operations column
content = content.replace(
  '<el-table-column label="操作" width="120" fixed="right" align="center">\n          <template #default="{ row }">\n            <el-button type="primary" link @click="openConfigGroupDialog(row)">配置信息</el-button>\n          </template>\n        </el-table-column>',
  `<el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openConfigGroupDialog(row)">配置信息</el-button>
            <el-button type="warning" link @click="openSingleJoinDialog(row)">一键拉人</el-button>
          </template>
        </el-table-column>`
);

// 4. Update the config dialog to support multiple accounts
content = content.replace(
  '<el-form-item label="普通账号" prop="ordinaryAccount">\n          <el-input v-model="configGroupForm.ordinaryAccount" placeholder="请输入普通账号ID或用户名" clearable />\n        </el-form-item>\n        <el-form-item label="拉人账号" prop="pullAccount">\n          <el-input v-model="configGroupForm.pullAccount" placeholder="请输入拉人账号ID或用户名" clearable />\n        </el-form-item>',
  `<el-form-item label="普通账号" prop="ordinaryAccount">
          <el-input v-model="configGroupForm.ordinaryAccount" type="textarea" :rows="3" placeholder="请输入普通账号ID或用户名，多个请用逗号隔开" clearable />
        </el-form-item>
        <el-form-item label="拉人账号" prop="pullAccount">
          <el-input v-model="configGroupForm.pullAccount" type="textarea" :rows="3" placeholder="请输入拉人账号ID或用户名，多个请用逗号隔开" clearable />
        </el-form-item>`
);

// 5. Add "一键拉人" Dialog before </template>
const singleJoinDialog = `
    <!-- 一键拉人(单个群组)对话框 -->
    <el-dialog
      v-model="singleJoinDialogVisible"
      title="一键拉人"
      width="600px"
      destroy-on-close
    >
      <div style="margin-bottom: 20px;">
        <p><strong>目标群组:</strong> {{ currentGroupForJoin?.groupName }}</p>
      </div>
      <el-form ref="singleJoinFormRef" :model="singleJoinForm" label-width="100px">
        <el-form-item label="入群用户" prop="users" :rules="[{ required: true, message: '请输入要拉入群的用户ID或用户名' }]">
          <el-input 
            v-model="singleJoinForm.users" 
            type="textarea" 
            :rows="6" 
            placeholder="请输入用户的 TG ID 或用户名，多个用户请用换行或逗号隔开" 
          />
        </el-form-item>
        <el-form-item label="执行预览" v-if="singleJoinForm.users.trim().length > 0">
          <el-alert
            :title="\`即将拉取 \${singleJoinForm.users.split(/[\\n,]+/).filter(u => u.trim()).length} 名用户入群\`"
            type="success"
            :closable="false"
          />
        </el-form-item>
        <el-form-item label="使用账号">
          <el-radio-group v-model="singleJoinForm.useAccountType">
            <el-radio label="pull">使用群组配置的拉人账号</el-radio>
            <el-radio label="bot">使用机器人直接拉取</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="singleJoinDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSingleJoin" :loading="singleJoinLoading">确认拉入</el-button>
        </div>
      </template>
    </el-dialog>
`;

content = content.replace('  </div>\n</template>', singleJoinDialog + '\n  </div>\n</template>');

// 6. Add "一键拉人" JS logic
const singleJoinJs = `
// 一键拉人 (单个群组)
const singleJoinDialogVisible = ref(false);
const singleJoinLoading = ref(false);
const currentGroupForJoin = ref(null);
const singleJoinForm = reactive({
  users: '',
  useAccountType: 'pull'
});
const openSingleJoinDialog = (row) => {
  currentGroupForJoin.value = row;
  singleJoinForm.users = '';
  singleJoinForm.useAccountType = 'pull';
  singleJoinDialogVisible.value = true;
};
const submitSingleJoin = () => {
  if (!singleJoinForm.users.trim()) return ElMessage.warning('请输入拉入的用户');
  singleJoinLoading.value = true;
  setTimeout(() => {
    singleJoinLoading.value = false;
    singleJoinDialogVisible.value = false;
    ElMessage.success('入群指令已下发给机器人！');
  }, 1000);
};
`;

content = content.replace(
  '// 配置群组信息 (分组, 账号)',
  singleJoinJs + '\n// 配置群组信息 (分组, 账号)'
);

// Format mock data array for ordinaryAccount and pullAccount
content = content.replace(
  "ordinaryAccount: '@test_ord',\n    pullAccount: '@test_pull',",
  "ordinaryAccount: '@test_ord,@test_ord2',\n    pullAccount: '@test_pull1,@test_pull2',"
);

fs.writeFileSync('src/views/bot/GroupManagement.vue', content);
