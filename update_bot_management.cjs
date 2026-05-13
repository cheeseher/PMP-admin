const fs = require('fs');

let content = fs.readFileSync('src/views/bot/BotManagement.vue', 'utf8');

// 1. Add "拉人账号" Tab next to "普通账号" Tab
const pullAccountTab = `
        <!-- 新增：拉人账号 Tab -->
        <el-tab-pane label="拉人账号" name="pull">
          <!-- 表格工具栏 -->
          <div class="table-toolbar">
            <div class="left">
              <el-button type="warning" :icon="Plus" @click="openNormalDialog('add', 'pull')">新增拉人账号</el-button>
            </div>
            <div class="right">
              <el-tooltip content="刷新数据">
                <el-button :icon="Refresh" circle plain @click="handleSearch" />
              </el-tooltip>
            </div>
          </div>

          <!-- 拉人账号数据表格 -->
          <el-table
            v-loading="loading"
            :data="displayPullData"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="名称" min-width="160" />
            <el-table-column prop="tgid" label="TGID" min-width="160" />
            <el-table-column prop="phone" label="手机号" min-width="180" />
            <el-table-column prop="apiid" label="apiid" min-width="160" />
            <el-table-column label="备注" min-width="180">
              <template #default="{ row }">
                <div v-if="row.errorMessage">
                  <span style="color: #E6A23C">限制</span>：{{ row.errorMessage }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="creator" label="创建人" width="120" />
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column fixed="right" label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button type="danger" link @click="handlePullDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页器 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pullCurrentPage"
              v-model:page-size="pullPageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pullTotal"
              @size-change="handlePullSizeChange"
              @current-change="handlePullCurrentChange"
            />
          </div>
        </el-tab-pane>
`;

content = content.replace(
  '      </el-tabs>\n    </el-card>',
  pullAccountTab + '      </el-tabs>\n    </el-card>'
);

// update activeTab condition in filter
content = content.replace(
  '<el-form-item :label="activeTab === \'normal\' ? \'账号名称：\' : \'机器人名称：\'">',
  `<el-form-item :label="activeTab === 'bot' ? '机器人名称：' : '账号名称：'">`
);

content = content.replace(
  ':placeholder="activeTab === \'normal\' ? \'请输入账号名称\' : \'请输入机器人名称\'"',
  `:placeholder="activeTab === 'bot' ? '请输入机器人名称' : '请输入账号名称'"`
);

// In JS, add pull data logic
const jsLogic = `
// 拉人账号数据
const pullData = ref([
  {
    id: 1,
    name: '@pull_master',
    tgid: '3344556677',
    phone: '+1 2345678900',
    apiid: '3456789',
    errorMessage: '',
    creator: 'Admin',
    createdAt: '2023-11-20 14:30:00'
  },
  {
    id: 2,
    name: '@pull_assistant',
    tgid: '8899001122',
    phone: '+44 9876543210',
    apiid: '8765432',
    errorMessage: '近期拉人过快',
    creator: 'Admin',
    createdAt: '2023-11-22 10:15:00'
  }
]);
const pullCurrentPage = ref(1);
const pullPageSize = ref(10);
const displayPullData = computed(() => {
  let filtered = pullData.value;
  if (filterForm.botName) {
    filtered = filtered.filter(item => item.name.includes(filterForm.botName));
  }
  const start = (pullCurrentPage.value - 1) * pullPageSize.value;
  const end = start + pullPageSize.value;
  return filtered.slice(start, end);
});
const pullTotal = computed(() => {
  let filtered = pullData.value;
  if (filterForm.botName) {
    filtered = filtered.filter(item => item.name.includes(filterForm.botName));
  }
  return filtered.length;
});
const handlePullSizeChange = (val) => {
  pullPageSize.value = val;
  pullCurrentPage.value = 1;
};
const handlePullCurrentChange = (val) => {
  pullCurrentPage.value = val;
};
const handlePullDelete = (row) => {
  ElMessageBox.confirm(\`确定要删除拉人账号 "\${row.name}" 吗？\`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    pullData.value = pullData.value.filter(item => item.id !== row.id);
    ElMessage.success('删除成功');
  }).catch(() => {});
};
`;

content = content.replace(
  '// -------------------- 普通账号相关逻辑 --------------------',
  jsLogic + '\n// -------------------- 普通账号相关逻辑 --------------------'
);

// update normalDialog to support type param
content = content.replace(
  'const openNormalDialog = (type, row) => {',
  `const currentAccountType = ref('normal');
const openNormalDialog = (type, accountType = 'normal', row) => {
  currentAccountType.value = accountType;`
);

content = content.replace(
  'title="新增普通账号"',
  `:title="currentAccountType === 'pull' ? '新增拉人账号' : '新增普通账号'"`
);

content = content.replace(
  `normalData.value.unshift({\n        id: Date.now(),\n        ...normalForm,\n        creator: '当前用户',\n        createdAt: new Date().toLocaleString().replace(/\\//g, '-'),\n        errorMessage: ''\n      });`,
  `const newAccount = {
        id: Date.now(),
        ...normalForm,
        creator: '当前用户',
        createdAt: new Date().toLocaleString().replace(/\\//g, '-'),
        errorMessage: ''
      };
      if (currentAccountType.value === 'pull') {
        pullData.value.unshift(newAccount);
      } else {
        normalData.value.unshift(newAccount);
      }`
);

fs.writeFileSync('src/views/bot/BotManagement.vue', content);
