<!-- 机器人管理/角色权限管理 - 配置群组权限 -->
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
        <el-table-column label="可用指令" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openCommandListDialog(row)">
              {{ row.commands ? row.commands.length : 0 }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="groupCount" label="关联人员" width="120" align="center">
          <template #default="{ row }">
            <el-tooltip
              effect="light"
              placement="top"
              :visible-arrow="true"
              popper-class="member-tooltip"
              :enterable="true"
              :show-after="100"
            >
              <template #content>
                <div class="custom-tooltip-content">
                  <div class="tooltip-title">关联人员列表</div>
                  <div v-if="!getAssociatedMembers(row.id).length" class="tooltip-empty">
                    暂无关联人员
                  </div>
                  <div v-else>
                    <div v-for="member in getAssociatedMembers(row.id)" :key="member.groupId" class="tooltip-member-item">
                      <div class="tooltip-member-name">{{ member.name || member.groupName }}</div>
                      <div class="tooltip-member-id">TGID: {{ member.groupId.replace(/-/g, '') }}</div>
                    </div>
                  </div>
                </div>
              </template>
              <span class="members-count">
                {{ row.groupCount || 0 }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="groupTypePermission" label="群组类型权限" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.groupTypePermission ? 'success' : 'info'">
              {{ row.groupTypePermission ? '已开启' : '已关闭' }}
            </el-tag>
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
      width="700px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="dialogForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="角色描述" prop="description">
          <el-input v-model="dialogForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="可用指令" prop="cascaderCommands">
            <el-cascader
                v-model="dialogForm.cascaderCommands"
                :options="cascaderCommandOptions"
                :props="{ 
                  multiple: true,
                  checkStrictly: true,
                  emitPath: true,
                  expandTrigger: 'hover',
                  value: 'value',
                  label: 'label'
                }"
                placeholder="请选择该角色可用的指令"
                filterable
                clearable
                style="width: 100%"
            />
            <div class="form-tip">配置群组可用的指令范围，群组内用户权限无法超出此范围</div>
        </el-form-item>
        
        <!-- 关联人员表单 -->
        <el-form-item label="关联人员">
          <div class="members-wrapper">
            <div class="members-header">
              <span>已添加 {{ dialogForm.members.length }} 人</span>
              <div class="members-actions">
                <el-button type="primary" link size="small" @click="addMember">
                  <el-icon><Plus /></el-icon> 添加人员
                </el-button>
              </div>
            </div>
            
            <div v-if="dialogForm.members.length === 0" class="no-members">
              <el-empty description="暂无关联人员" :image-size="60">
                <el-button type="primary" size="small" @click="addMember">添加人员</el-button>
              </el-empty>
            </div>
            
            <div v-else class="members-list">
              <el-tag
                v-for="(member, index) in dialogForm.members"
                :key="index"
                closable
                :disable-transitions="false"
                @close="removeMember(index)"
                class="member-tag"
              >
                <div class="member-tag-content" @click="editMember(index)">
                  <span class="member-name">{{ member.name }}</span>
                  <span class="member-id">{{ member.id }}</span>
                </div>
              </el-tag>
            </div>
          </div>
          <div class="form-tip">关联人员将在所有群组中拥有此角色权限，点击人员标签可编辑信息</div>
        </el-form-item>
        
        <el-form-item label="群组类型权限" prop="groupTypePermission">
          <el-switch
            v-model="dialogForm.groupTypePermission"
          />
          <div class="form-tip">开启后，可以按群组类型分配不同的权限</div>
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

    <!-- 添加/编辑人员对话框 -->
    <el-dialog
      v-model="memberDialogVisible"
      :title="memberDialogType === 'add' ? '添加人员' : '编辑人员'"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="memberFormRef" :model="memberForm" :rules="memberRules" label-width="80px">
        <el-form-item label="TGID" prop="id">
          <el-input v-model="memberForm.id" placeholder="请输入TGID" />
        </el-form-item>
        <el-form-item label="人员名称" prop="name">
          <el-input v-model="memberForm.name" placeholder="请输入人员名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="memberDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMemberForm">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 指令列表对话框 -->
    <el-dialog
      v-model="commandListDialogVisible"
      title="可用指令列表"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentRoleForCommands" style="margin-bottom: 16px;">
          <strong>角色: {{ currentRoleForCommands.roleName }}</strong>
          <p>该角色下的人员将可以使用以下指令：</p>
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
import { Search, Refresh, Plus, InfoFilled, Delete } from '@element-plus/icons-vue';

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

// tooltip显示状态管理（可以删除，因为不再需要手动控制显示状态）
// const tooltipVisible = reactive({});

// 模拟角色数据
const mockRoleData = [
  {
    id: 1,
    roleName: '超级管理员',
    description: '拥有所有权限的角色，可以管理系统所有功能',
    status: 'enabled',
    commands: [1, 2, 3, 4, 5],
    tgids: '123456789,987654321',
    groupCount: 2,
    groupTypePermission: true
  },
  {
    id: 2,
    roleName: '财务',
    description: '负责财务相关操作，具有查询和统计权限',
    status: 'enabled',
    commands: [1, 2, 4],
    tgids: '123456789',
    groupCount: 1,
    groupTypePermission: false
  },
  {
    id: 3,
    roleName: '运营',
    description: '负责日常运营工作，具有产品和订单管理权限',
    status: 'enabled',
    commands: [1, 2],
    tgids: '',
    groupCount: 0,
    groupTypePermission: false
  },
  {
    id: 4,
    roleName: '客服',
    description: '处理客户问题，具有有限的查询权限',
    status: 'disabled',
    commands: [],
    tgids: '',
    groupCount: 0,
    groupTypePermission: false
  }
];

// 模拟人员数据
const mockGroupsData = {
  1: [
    { groupId: '-100123456789', groupName: '张总', type: 'upstream' },
    { groupId: '-100223456789', groupName: '王总', type: 'upstream' },
  ],
  2: [
    { groupId: '-100423456789', groupName: '李财务', type: 'merchant' },
    { groupId: '-100523456789', groupName: '赵会计', type: 'merchant' },
    { groupId: '-100623456789', groupName: '钱出纳', type: 'merchant' },
  ],
  3: [
    { groupId: '-100923456789', groupName: '刘运营', type: 'merchant' },
    { groupId: '-101023456789', groupName: '孙主管', type: 'merchant' },
    { groupId: '-101123456789', groupName: '周专员', type: 'merchant' },
  ],
  4: [
    { groupId: '-101323456789', groupName: '吴客服', type: 'upstream' },
    { groupId: '-101423456789', groupName: '郑客服', type: 'upstream' },
  ]
};

// 获取关联的人员列表
const getAssociatedMembers = (roleId) => {
  return mockGroupsData[roleId] || [];
};

// 模拟指令选项
const commandOptions = ref([
    { id: 1, keyword: '产品', format: '产品' },
    { id: 2, keyword: '余额', format: '余额' },
    { id: 3, keyword: '绑定', format: '绑定#商户号#商户密钥' },
    { id: 4, keyword: '订单', format: '订单#订单号' },
    { id: 5, keyword: '帮助', format: '帮助' },
]);

// 级联选择器的指令数据（按功能分类）
const cascaderCommandOptions = ref([
  {
    value: 'query',
    label: '查询类指令',
    children: [
      { value: 1, label: '产品 (产品)' },
      { value: 2, label: '余额 (余额)' },
      { value: 4, label: '订单 (订单#订单号)' },
    ]
  },
  {
    value: 'operate',
    label: '操作类指令',
    children: [
      { value: 3, label: '绑定 (绑定#商户号#商户密钥)' },
    ]
  },
  {
    value: 'utility',
    label: '辅助类指令',
    children: [
      { value: 5, label: '帮助 (帮助)' },
    ]
  }
]);

// 将扁平化的指令ID数组转换为适用于级联选择器的值
const getSelectedCascaderValues = (commandIds) => {
  const result = [];
  
  if (!commandIds || !commandIds.length) return result;
  
  // 遍历所有的分类
  cascaderCommandOptions.value.forEach(category => {
    // 找出该分类下被选中的指令
    const selectedCommands = category.children.filter(cmd => commandIds.includes(cmd.value));
    
    // 如果有选中的指令，则添加相应的级联路径
    selectedCommands.forEach(cmd => {
      result.push([category.value, cmd.value]);
    });
  });
  
  return result;
};

// 将级联选择器的值转换为扁平化的指令ID数组
const getCommandIdsFromCascader = (cascaderValues) => {
  if (!cascaderValues || !cascaderValues.length) return [];
  
  // 提取所有路径中的第二级值（即指令ID）
  return cascaderValues.map(path => path[path.length - 1]);
};

const loadTableData = () => {
  loading.value = true;
  setTimeout(() => {
    // 根据筛选条件过滤数据
    let filteredData = [...mockRoleData];
    
    if (filterForm.roleName) {
      filteredData = filteredData.filter(item => 
        item.roleName.toLowerCase().includes(filterForm.roleName.toLowerCase())
      );
    }
    
    tableData.value = filteredData;
    pagination.total = filteredData.length;
    loading.value = false;
    
    // 初始化 tooltip 显示状态
    filteredData.forEach(item => {
      // tooltipVisible[item.id] = false;
    });
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
  cascaderCommands: [], // 级联选择器使用的格式
  tgids: '', // 旧的TGID字段（用于兼容）
  members: [], // 新增关联人员列表
  groupTypePermission: false // 群组类型分配权限
});

// 人员对话框相关
const memberDialogVisible = ref(false);
const memberDialogType = ref('add');
const memberFormRef = ref(null);
const memberForm = reactive({
  id: '',
  name: '',
  type: 'merchant', // 保留默认值为普通成员
  index: -1 // 用于编辑现有人员时记录索引
});

const memberRules = reactive({
  id: [{ required: true, message: '请输入TGID', trigger: 'blur' }],
  name: [{ required: true, message: '请输入人员名称', trigger: 'blur' }]
});

// 添加关联人员行
const addMember = () => {
  memberDialogType.value = 'add';
  memberForm.id = '';
  memberForm.name = '';
  memberForm.type = 'merchant'; // 保留默认值设置
  memberForm.index = -1;
  memberDialogVisible.value = true;
};

// 编辑关联人员
const editMember = (index) => {
  const member = dialogForm.members[index];
  memberDialogType.value = 'edit';
  memberForm.id = member.id;
  memberForm.name = member.name;
  memberForm.type = member.type; // 保留获取已有值
  memberForm.index = index;
  memberDialogVisible.value = true;
};

// 提交人员表单
const submitMemberForm = () => {
  memberFormRef.value?.validate((valid) => {
    if (!valid) return;
    
    const newMember = {
      id: memberForm.id.trim(),
      name: memberForm.name.trim(),
      type: memberForm.type
    };
    
    if (memberDialogType.value === 'edit' && memberForm.index >= 0) {
      // 编辑现有人员
      dialogForm.members[memberForm.index] = newMember;
    } else {
      // 添加新人员
      dialogForm.members.push(newMember);
    }
    
    memberDialogVisible.value = false;
    ElMessage.success(memberDialogType.value === 'add' ? '人员添加成功' : '人员更新成功');
  });
};

// 移除关联人员行
const removeMember = (index) => {
  dialogForm.members.splice(index, 1);
};

// 将旧的TGID字符串转换为成员数组
const tgidsToMembers = (tgids, roleId) => {
  if (!tgids) return [];
  
  const result = [];
  const ids = tgids.split(',').filter(id => id.trim());
  
  // 获取现有的人员数据
  const existingMembers = mockGroupsData[roleId] || [];
  
  // 为未命名的人员生成字母序号
  let nameIndex = 0;
  const generateName = () => {
    // 从A开始，根据索引生成字母
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[nameIndex % letters.length];
    nameIndex++;
    return `人员${letter}`;
  };
  
  // 为每个ID创建成员对象
  ids.forEach(id => {
    // 移除ID中的短横线
    const cleanId = id.replace(/-/g, '');
    
    // 查找现有人员中是否有匹配的
    const existingMember = existingMembers.find(member => member.groupId.replace(/-/g, '') === cleanId);
    
    if (existingMember) {
      // 如果找到了匹配的现有人员，使用其信息
      result.push({
        id: cleanId, // 使用清理后的ID
        name: existingMember.groupName || generateName(), // 使用groupName作为name，如果没有则生成名称
        type: existingMember.type
      });
    } else {
      // 否则创建一个新的成员对象，只有ID
      result.push({
        id: cleanId, // 使用清理后的ID
        name: generateName(), // 生成"人员A"、"人员B"这样的名称
        type: 'merchant' // 默认设为普通成员
      });
    }
  });
  
  return result;
};

// 将成员数组转换回TGID字符串（用于兼容现有数据结构）
const membersToTgids = (members) => {
  if (!members || !members.length) return '';
  
  // 提取所有有效的ID并用逗号连接
  return members
    .filter(member => member.id && member.id.trim())
    .map(member => member.id.trim())
    .join(',');
};

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
    dialogForm.commands = row.commands || []; // 保存原始指令ID数组
    dialogForm.cascaderCommands = getSelectedCascaderValues(row.commands); // 转换为级联选择器格式
    dialogForm.tgids = row.tgids || ''; // 保留旧的TGID字段
    dialogForm.members = tgidsToMembers(row.tgids, row.id); // 从旧的TGID字段转换成员数组
    dialogForm.groupTypePermission = row.groupTypePermission || false; // 群组类型分配权限
  } else {
    dialogForm.id = null;
    dialogForm.roleName = '';
    dialogForm.description = '';
    dialogForm.status = 'enabled';
    dialogForm.commands = [];
    dialogForm.cascaderCommands = [];
    dialogForm.tgids = '';
    dialogForm.members = [];
    dialogForm.groupTypePermission = false; // 重置群组类型分配权限
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

// 解析和处理TGID输入
const processTgids = (tgidString) => {
  if (!tgidString) return '';
  
  // 移除空格，分割逗号分隔的ID，过滤空值
  const tgids = tgidString.replace(/\s+/g, '').split(',').filter(id => id.trim());
  
  // 返回处理后的字符串
  return tgids.join(',');
};

const submitForm = () => {
  dialogFormRef.value.validate((valid) => {
    if (!valid) return;
    
    // 从级联选择器值中提取指令ID
    const commandIds = getCommandIdsFromCascader(dialogForm.cascaderCommands);
    
    // 从成员数组中提取TGID字符串
    const tgids = membersToTgids(dialogForm.members);
    
    const formData = {
      id: dialogForm.id,
      roleName: dialogForm.roleName,
      description: dialogForm.description,
      status: dialogForm.status,
      commands: commandIds,
      tgids: tgids,
      groupTypePermission: dialogForm.groupTypePermission // 保存群组类型分配权限
    };
    
    // 保存到mockGroupsData
    const members = dialogForm.members
      .filter(member => member.id && member.id.trim())
      .map(member => ({
        groupId: member.id.trim(),
        groupName: member.name || '未命名', // 如果没有名称则默认为"未命名"
        type: member.type || 'merchant' // 如果没有类型则默认为普通成员
      }));
    
    const roleId = dialogForm.id || Date.now();
    mockGroupsData[roleId] = members;
    
    if (dialogForm.id) {
      const index = tableData.value.findIndex(item => item.id === dialogForm.id);
      if (index !== -1) {
        tableData.value[index] = { 
          ...tableData.value[index], 
          ...formData,
          groupCount: members.length // 更新关联人员数量
        };
      }
      ElMessage.success('角色更新成功');
    } else {
      const newRole = { 
        id: roleId, 
        ...formData, 
        groupCount: members.length // 设置关联人员数量
      };
      tableData.value.unshift(newRole);
      pagination.total += 1;
      ElMessage.success('角色新增成功');
    }
    dialogVisible.value = false;
  });
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色 "${row.roleName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id);
    if (index !== -1) {
      tableData.value.splice(index, 1);
      pagination.total -= 1;
      
      // 删除关联的人员数据
      delete mockGroupsData[row.id];
    }
    ElMessage.success('角色删除成功');
  }).catch(() => {});
};

const handleSearch = () => {
  loadTableData();
};

const resetFilter = () => {
  filterForm.roleName = '';
  filterForm.roleType = '';
  handleSearch();
};

const handleSizeChange = (val) => {
  pagination.pageSize = val;
  loadTableData();
};

const handleCurrentChange = (val) => {
  pagination.currentPage = val;
  loadTableData();
};

// 为el-tooltip准备内容函数
const getTooltipContent = (roleId) => {
  const members = getAssociatedMembers(roleId);
  if (!members || members.length === 0) {
    return '暂无关联人员';
  }
  
  return members.map(member => 
    `${member.name || member.groupName}: ${member.groupId}`
  ).join('<br>');
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
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  align-items: center;
}

.info-card {
  margin-bottom: 16px;
  background-color: #f8f8f8;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-header h3 {
  margin: 0;
  font-size: 16px;
  color: #409EFF;
}

.info-content {
  line-height: 1.6;
}

.info-content p {
  margin: 8px 0;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.members-count {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  color: #409EFF;
}

.members-count:hover {
  text-decoration: underline;
}

.info-icon {
  margin-left: 4px;
  font-size: 14px;
}

.tooltip-member-list {
  min-width: 280px;
  max-width: 400px;
  max-height: 350px;
  overflow-y: auto;
}

.tooltip-title {
  font-weight: bold;
  font-size: 14px;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.tooltip-empty {
  color: #909399;
  font-style: italic;
  padding: 10px 0;
}

.tooltip-members {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tooltip-member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px dashed #ebeef5;
}

.member-name {
  font-weight: 500;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.member-id {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.members-wrapper {
  width: 100%;
  margin-bottom: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  background-color: #f8f9fa;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e0e0e0;
}

.members-actions {
  display: flex;
  gap: 12px;
}

.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding: 6px;
}

.member-tag {
  display: flex;
  max-width: 100%;
  margin-bottom: 6px;
  cursor: pointer;
}

.member-tag-content {
  display: flex;
  align-items: center;
  max-width: 100%;
}

.member-name {
  font-weight: 500;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-id {
  color: #909399;
  font-size: 12px;
  margin: 0 8px;
}

.no-members {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.custom-tooltip-content {
  padding: 8px 0;
  min-width: 200px;
}

.tooltip-title {
  font-weight: bold;
  padding: 0 12px 8px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 8px;
  color: #303133;
}

.tooltip-empty {
  padding: 8px 12px;
  color: #909399;
  font-size: 13px;
}

.tooltip-member-item {
  padding: 6px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.tooltip-member-item:last-child {
  border-bottom: none;
}

.tooltip-member-name {
  font-weight: 500;
  margin-bottom: 2px;
  color: #303133;
}

.tooltip-member-id {
  font-size: 12px;
  color: #909399;
}

:deep(.member-tooltip) {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0;
}
</style> 