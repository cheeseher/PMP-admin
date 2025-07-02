<!-- 机器人管理/群组管理 - 管理机器人所在的所有群组及其权限 -->
<template>
  <div class="group-management-container">


    <!-- 筛选表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="filterForm" inline class="filter-form">
        <div class="filter-row">
          <el-form-item label="群组名称：">
            <el-input 
              v-model="filterForm.groupName" 
              placeholder="请输入群组名称或ID" 
              clearable 
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="群组类型：">
            <el-select v-model="filterForm.groupType" placeholder="请选择类型" clearable style="width: 168px">
              <el-option label="全部" value="" />
              <el-option label="上游群" value="upstream" />
              <el-option label="商户群" value="merchant" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联机器人：">
            <el-select v-model="filterForm.botId" placeholder="请选择机器人" clearable style="width: 168px">
              <el-option label="全部" value="" />
              <el-option 
                v-for="bot in botOptions" 
                :key="bot.id" 
                :label="bot.name" 
                :value="bot.id"
              />
            </el-select>
          </el-form-item>
        </div>
        
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="resetFilter">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据展示区域 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="openDefaultRoleDialog">群组普通用户权限设置</el-button>
        </div>
        <div class="right">
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="handleSearch" />
          </el-tooltip>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="groupId" label="群组ID" min-width="150" />
        <el-table-column prop="groupName" label="群组名称" min-width="150" />
        <el-table-column prop="groupLink" label="TG群链接" min-width="180">
            <template #default="{ row }">
                <el-link :href="row.groupLink" type="primary" target="_blank" :underline="false">{{ row.groupLink }}</el-link>
            </template>
        </el-table-column>
        <el-table-column prop="groupType" label="群组类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.groupType === 'upstream' ? 'success' : 'primary'">
              {{ row.groupType === 'upstream' ? '上游群' : '商户群' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="群组人数" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openMemberListDialog(row)">{{ row.memberCount }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="供应商绑定" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openBoundSuppliersDialog(row)">
              {{ row.boundSuppliers ? row.boundSuppliers.length : 0 }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="商户绑定" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openBoundMerchantsDialog(row)">
              {{ row.boundMerchants ? row.boundMerchants.length : 0 }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="associatedBot" label="关联机器人" min-width="150" />
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
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

    <!-- 群组成员列表对话框 -->
    <el-dialog
      v-model="memberListDialogVisible"
      title="群组成员列表"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentGroupForMembers" style="margin-bottom: 16px;">
          <strong>群组: {{ currentGroupForMembers.groupName }} ({{ currentGroupForMembers.groupId }})</strong>
          <p>群组类型: {{ currentGroupForMembers.groupType === 'upstream' ? '上游群' : '商户群' }}</p>
      </div>
      <el-table :data="memberListData" border stripe v-loading="memberListLoading">
        <el-table-column prop="userTgId" label="用户TGID" width="120" />
        <el-table-column prop="userTgName" label="用户TG名称" min-width="150" />
        <el-table-column label="成员权限" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" effect="plain">{{ row.role || '未设置' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!memberListData || memberListData.length === 0" description="暂无符合条件的成员" />
      <template #footer>
        <el-button @click="memberListDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 已绑定供应商列表对话框 -->
    <el-dialog
      v-model="boundSuppliersDialogVisible"
      title="已绑定供应商列表"
      width="700px"
      destroy-on-close
    >
        <div v-if="currentGroupForBinding" style="margin-bottom: 16px;">
            <strong>群组: {{ currentGroupForBinding.groupName }} ({{ currentGroupForBinding.groupId }})</strong>
        </div>
        <el-table :data="currentGroupForBinding.boundSuppliers" border stripe>
            <el-table-column prop="id" label="供应商ID" />
            <el-table-column prop="name" label="供应商名称" />
            <el-table-column prop="template" label="模板">
              <template #default="{ row }">
                  <el-tag type="info">{{ row.template }}</el-tag>
              </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-button @click="boundSuppliersDialogVisible = false">关闭</el-button>
        </template>
    </el-dialog>

    <!-- 绑定供应商对话框 -->
    <el-dialog
      v-model="bindSupplierDialogVisible"
      title="绑定供应商"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentGroupForBinding" style="margin-bottom: 20px;">
          <p><strong>群组名称:</strong> {{ currentGroupForBinding.groupName }}</p>
          <p><strong>群组ID:</strong> {{ currentGroupForBinding.groupId }}</p>
      </div>
      <el-form ref="bindSupplierFormRef" :model="bindSupplierForm" label-width="100px">
        <el-form-item label="选择供应商" prop="supplierIds">
          <el-select
            v-model="bindSupplierForm.supplierIds"
            multiple
            filterable
            placeholder="请选择要绑定的供应商"
            style="width: 100%;"
          >
            <el-option
              v-for="supplier in supplierOptions"
              :key="supplier.id"
              :label="supplier.name"
              :value="supplier.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="bindSupplierDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSupplierBinding">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设置群组角色对话框 -->
    <el-dialog
      v-model="setRoleDialogVisible"
      title="设置群组角色"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentGroupForRole" style="margin-bottom: 20px;">
        <p><strong>群组名称:</strong> {{ currentGroupForRole.groupName }}</p>
        <p><strong>群组ID:</strong> {{ currentGroupForRole.groupId }}</p>
        <p><strong>当前角色:</strong> {{ currentGroupForRole.roleName || '未分配' }}</p>
      </div>
      <el-alert
        title="角色将决定该群组可以使用的指令范围，群组内所有成员权限不能超出群组角色的权限范围"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-form ref="setRoleFormRef" :model="setRoleForm" label-width="100px">
        <el-form-item label="选择角色" prop="roleId">
          <el-select
            v-model="setRoleForm.roleId"
            filterable
            placeholder="请选择要分配的角色"
            style="width: 100%;"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ role.roleName }}</span>
                <span style="color: #999; font-size: 12px">可用指令: {{ role.commandCount || 0 }}个</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRoleSetting">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看权限详情对话框 -->
    <el-dialog
      v-model="viewPermissionsDialogVisible"
      title="群组权限详情"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentGroupForPermissions" style="margin-bottom: 16px;">
        <p><strong>群组名称:</strong> {{ currentGroupForPermissions.groupName }}</p>
        <p><strong>群组角色:</strong> {{ currentGroupForPermissions.roleName || '未分配角色' }}</p>
      </div>
      
      <template v-if="currentGroupForPermissions && currentGroupForPermissions.roleId">
        <h4>可用指令列表：</h4>
        <el-table :data="permissionCommandList" border stripe>
          <el-table-column prop="id" label="指令ID" width="80" />
          <el-table-column prop="keyword" label="指令关键词" width="150" />
          <el-table-column prop="format" label="示例格式" min-width="200" />
        </el-table>
      </template>
      <el-empty v-else description="该群组未分配角色，无可用指令" />
      
      <template #footer>
        <el-button @click="viewPermissionsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 成员权限管理对话框 -->
    <el-dialog
      v-model="memberPermissionsDialogVisible"
      title="成员权限管理"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentGroupForMemberPermissions" style="margin-bottom: 16px;">
        <p><strong>群组:</strong> {{ currentGroupForMemberPermissions.groupName }}</p>
        <p><strong>群组角色:</strong> {{ currentGroupForMemberPermissions.roleName || '未分配角色' }}</p>
        <el-alert
          title="成员的权限只能在群组角色权限范围内进行细化，无法超出群组角色的权限范围"
          type="warning"
          show-icon
          :closable="false"
          style="margin: 10px 0"
        />
      </div>

      <el-table :data="memberPermissionsList" border stripe v-loading="memberPermissionsLoading">
        <el-table-column prop="userTgId" label="用户ID" width="120" />
        <el-table-column prop="userNickname" label="用户昵称" min-width="150" />
        <el-table-column prop="customRole" label="自定义权限" width="150" align="center">
          <template #default="{ row }">
            <el-tag type="success" effect="plain" v-if="row.customRole">已设置</el-tag>
            <el-tag type="info" effect="plain" v-else>继承群组</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="allowedCommands" label="允许的指令" min-width="180">
          <template #default="{ row }">
            <el-tag 
              v-for="cmd in row.allowedCommands" 
              :key="cmd.id" 
              size="small" 
              style="margin: 2px"
            >
              {{ cmd.keyword }}
            </el-tag>
            <span v-if="!row.allowedCommands || row.allowedCommands.length === 0">继承群组权限</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="configMemberPermission(row)">设置权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="memberPermissionsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 成员权限配置对话框 -->
    <el-dialog
      v-model="memberPermissionConfigDialogVisible"
      title="设置成员权限"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentMemberForPermission" style="margin-bottom: 16px;">
        <p><strong>用户:</strong> {{ currentMemberForPermission.userNickname }} ({{ currentMemberForPermission.userTgId }})</p>
        <p><strong>所属群组:</strong> {{ currentGroupForMemberPermissions?.groupName }}</p>
        <p><strong>群组角色:</strong> {{ currentGroupForMemberPermissions?.roleName || '未分配角色' }}</p>
      </div>

      <el-form ref="memberPermissionFormRef" :model="memberPermissionForm" label-width="120px">
        <el-form-item label="权限设置方式">
          <el-radio-group v-model="memberPermissionForm.useCustomPermissions">
            <el-radio :label="false">继承群组权限</el-radio>
            <el-radio :label="true">自定义权限</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="memberPermissionForm.useCustomPermissions">
          <el-divider content-position="left">可选指令列表（群组权限范围内）</el-divider>
          
          <el-form-item label="选择允许的指令">
            <el-checkbox-group v-model="memberPermissionForm.selectedCommandIds">
              <el-checkbox 
                v-for="cmd in availableCommandsForMember" 
                :key="cmd.id" 
                :label="cmd.id"
              >
                {{ cmd.keyword }} <span class="command-format">({{ cmd.format }})</span>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-alert
            v-if="!currentGroupForMemberPermissions?.roleId"
            title="当前群组未分配角色，无可用指令可选"
            type="error"
            show-icon
            :closable="false"
            style="margin-top: 10px"
          />
        </template>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="memberPermissionConfigDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMemberPermission">确认</el-button>
        </div>
      </template>
    </el-dialog>

          <!-- 群组普通用户权限设置对话框 -->
    <el-dialog
      v-model="defaultRoleDialogVisible"
      title="群组普通用户权限设置"
      width="700px"
      destroy-on-close
    >
      <el-alert
        title="此处设置的权限将作为群组中普通用户的默认权限，已有群组不受影响"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-form ref="defaultRoleFormRef" :model="defaultRoleForm" label-width="120px">
        <el-form-item label="上游群" prop="upstreamCascaderValue">
          <el-cascader
            v-model="defaultRoleForm.upstreamCascaderValue"
            :options="cascaderCommandOptions"
            placeholder="请选择上游群可用指令"
            style="width: 100%;"
            clearable
            @change="handleUpstreamCascaderChange"
            :props="{ 
              multiple: true,
              checkStrictly: true,
              emitPath: true,
              expandTrigger: 'hover',
              value: 'value',
              label: 'label'
            }"
          />
          <div class="form-tip">分配给新建上游群的默认可用指令</div>
        </el-form-item>
        <el-form-item label="商户群" prop="merchantCascaderValue">
          <el-cascader
            v-model="defaultRoleForm.merchantCascaderValue"
            :options="cascaderCommandOptions"
            placeholder="请选择商户群可用指令"
            style="width: 100%;"
            clearable
            @change="handleMerchantCascaderChange"
            :props="{ 
              multiple: true,
              checkStrictly: true,
              emitPath: true,
              expandTrigger: 'hover',
              value: 'value',
              label: 'label'
            }"
          />
          <div class="form-tip">分配给新建商户群的默认可用指令</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="defaultRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDefaultRole">确认</el-button>
        </div>
              </template>
    </el-dialog>

    <!-- 已绑定商户列表对话框 -->
    <el-dialog
      v-model="boundMerchantsDialogVisible"
      title="已绑定商户列表"
      width="700px"
      destroy-on-close
    >
        <div v-if="currentGroupForMerchantBinding" style="margin-bottom: 16px;">
            <strong>群组: {{ currentGroupForMerchantBinding.groupName }} ({{ currentGroupForMerchantBinding.groupId }})</strong>
        </div>
        <el-table :data="currentGroupForMerchantBinding ? currentGroupForMerchantBinding.boundMerchants : []" border stripe>
            <el-table-column prop="id" label="商户ID" width="80" align="center" />
            <el-table-column prop="name" label="商户名称" min-width="150" />
        </el-table>
        <template #footer>
            <el-button @click="boundMerchantsDialogVisible = false">关闭</el-button>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh, ArrowDown, Setting, Lock } from '@element-plus/icons-vue';

// 显示信息卡片
// 移除了说明卡片

// 筛选表单
const filterForm = reactive({
  groupName: '',
  groupType: '',
  botId: '',
});

// 模拟机器人选项
const botOptions = ref([
  { id: 1, name: '机器人A' },
  { id: 2, name: '机器人B' },
]);

// 模拟角色选项
const roleOptions = ref([
  { id: 1, roleName: '上游群角色', description: '用于上游供应商群组', commandCount: 2 },
  { id: 2, roleName: '商户群角色', description: '用于普通商户群组', commandCount: 3 },
  { id: 3, roleName: '游客角色', description: '未绑定商户的游客', commandCount: 1 },
]);

// 级联选择器的指令数据（按类型分类）
const cascaderCommandOptions = ref([
  {
    value: 'default',
    label: '预设指令',
    children: [
      { value: 1, label: '产品 (产品)' },
      { value: 2, label: '余额 (余额)' },
      { value: 3, label: '绑定 (绑定#商户号#商户密钥)' },
      { value: 4, label: '订单 (订单#订单号)' },
      { value: 5, label: '帮助 (帮助)' }
    ]
  },
  {
    value: 'other',
    label: '自定义指令',
    children: [
      { value: 6, label: '查询 (查询#参数)' },
      { value: 7, label: '支付 (支付#金额)' },
      { value: 8, label: '统计 (统计)' }
    ]
  }
]);

// 模拟指令数据
const commandsData = {
  1: [
    { id: 1, keyword: '产品', format: '产品' },
    { id: 2, keyword: '余额', format: '余额' },
  ],
  2: [
    { id: 3, keyword: '绑定', format: '绑定#商户号#商户密钥' },
    { id: 4, keyword: '订单', format: '订单#订单号' },
    { id: 5, keyword: '帮助', format: '帮助' },
  ],
  3: [
    { id: 5, keyword: '帮助', format: '帮助' },
  ],
};

// 表格数据
const loading = ref(false);
const tableData = ref([
  {
    groupId: '-100123456789',
    groupName: '闪电',
    groupLink: 'https://t.me/alipay_supplier',
    groupType: 'upstream',
    roleId: 1,
    roleName: '上游群角色',
    memberCount: 58,
    associatedBot: '机器人A',
    createTime: '2023-05-15 10:30:45',
    boundSuppliers: [
      { id: 1, name: '供应商A', template: '闪电' },
      { id: 2, name: '供应商B', template: '纵横' },
    ],
    boundMerchants: []
  },
  {
    groupId: '-100223456789',
    groupName: '商户A',
    groupLink: 'https://t.me/wxpay_merchant',
    groupType: 'merchant',
    roleId: 2,
    roleName: '商户群角色',
    memberCount: 125,
    associatedBot: '机器人B',
    createTime: '2023-07-22 14:15:30',
    boundSuppliers: [],
    boundMerchants: [
      { id: 1001, name: '商户A' },
      { id: 1002, name: '商户B' },
      { id: 1003, name: '商户C' }
    ]
  },
  {
    groupId: '-100323456789',
    groupName: '纵横',
    groupLink: 'https://t.me/unionpay_supplier',
    groupType: 'upstream',
    roleId: 1,
    roleName: '上游群角色',
    memberCount: 42,
    associatedBot: '机器人A',
    createTime: '2023-09-08 09:45:12',
    boundSuppliers: [
      { id: 3, name: '供应商C', template: '熊猫' },
    ],
    boundMerchants: []
  },
  {
    groupId: '-100423456789',
    groupName: '商户B',
    groupLink: 'https://t.me/test_merchant',
    groupType: 'merchant',
    roleId: null,
    roleName: null,
    memberCount: 15,
    associatedBot: '机器人B',
    createTime: '2023-11-30 16:20:05',
    boundSuppliers: [],
    boundMerchants: [
      { id: 1004, name: '商户D' }
    ]
  }
]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(4);

// 群组成员列表对话框
const memberListDialogVisible = ref(false);
const memberListLoading = ref(false);
const currentGroupForMembers = ref(null);
const memberListData = ref([]);

// 已绑定供应商列表对话框
const boundSuppliersDialogVisible = ref(false);
const currentGroupForBinding = ref(null);

// 已绑定商户列表对话框
const boundMerchantsDialogVisible = ref(false);
const currentGroupForMerchantBinding = ref(null);

// 绑定供应商对话框
const bindSupplierDialogVisible = ref(false);
const bindSupplierLoading = ref(false);
const bindSupplierFormRef = ref(null);
const bindSupplierForm = reactive({
  supplierIds: [],
});

// 设置群组角色对话框
const setRoleDialogVisible = ref(false);
const currentGroupForRole = ref(null);
const setRoleFormRef = ref(null);
const setRoleForm = reactive({
  roleId: null,
});

// 查看权限详情对话框
const viewPermissionsDialogVisible = ref(false);
const currentGroupForPermissions = ref(null);
const permissionCommandList = ref([]);

// 成员权限管理对话框
const memberPermissionsDialogVisible = ref(false);
const memberPermissionsLoading = ref(false);
const currentGroupForMemberPermissions = ref(null);
const memberPermissionsList = ref([]);

// 成员权限配置对话框
const memberPermissionConfigDialogVisible = ref(false);
const currentMemberForPermission = ref(null);
const memberPermissionFormRef = ref(null);
const memberPermissionForm = reactive({
  useCustomPermissions: false,
  selectedCommandIds: []
});
const availableCommandsForMember = ref([]);

// 模拟供应商选项
const supplierOptions = ref([
    { id: 1, name: '供应商A' },
    { id: 2, name: '供应商B' },
    { id: 3, name: '供应商C' },
    { id: 4, name: '供应商D' },
]);

// 模拟商户选项
const merchantOptions = ref([
    { id: 1001, name: '商户A' },
    { id: 1002, name: '商户B' },
    { id: 1003, name: '商户C' },
    { id: 1004, name: '商户D' },
    { id: 1005, name: '商户E' },
]);

// 模拟成员数据
const mockMemberData = {
    '-100123456789': [
        { userTgId: '123456789', userTgName: '张三', role: '上游群普通权限' },
        { userTgId: '987654321', userTgName: '李四', role: '运营' },
        { userTgId: '555666777', userTgName: '刘大', role: '超级管理员' },
        { userTgId: '111222333', userTgName: '孙一', role: '财务' },
    ],
    '-100223456789': [
        { userTgId: '112233445', userTgName: '王五', role: '商户群普通权限' },
        { userTgId: '556677889', userTgName: '赵六', role: '客服' },
        { userTgId: '778899001', userTgName: '马七', role: '运营' },
    ],
    '-100323456789': [
        { userTgId: '998877665', userTgName: '钱七', role: '上游群普通权限' },
        { userTgId: '445566778', userTgName: '周十', role: '超级管理员' },
    ],
    '-100423456789': [
        { userTgId: '102938475', userTgName: '孙八', role: '商户群普通权限' },
        { userTgId: '102938476', userTgName: '杨九', role: '客服' },
    ]
};

// 根据角色获取标签类型
const getRoleTagType = (role) => {
  if (!role) return 'danger';
  
  switch (role) {
    case '超级管理员':
      return 'danger';
    case '财务':
      return 'warning';
    case '运营':
      return 'success';
    case '客服':
      return 'primary';
    case '上游群普通权限':
    case '商户群普通权限':
      return 'info';
    default:
      return 'info';
  }
};

// 模拟成员权限数据
const mockMemberPermissionsData = {
  '-100123456789': [
    { 
      userTgId: '123456789', 
      userTgName: '张三', 
      customRole: true,
      allowedCommands: [
        { id: 1, keyword: '产品' },
        { id: 2, keyword: '余额' }
      ]
    },
    { 
      userTgId: '987654321', 
      userTgName: '李四',
      customRole: false,
      allowedCommands: []
    },
  ],
  '-100223456789': [
    { 
      userTgId: '112233445', 
      userTgName: '王五',
      customRole: false,
      allowedCommands: []
    },
    { 
      userTgId: '556677889', 
      userTgName: '赵六',
      customRole: true,
      allowedCommands: [
        { id: 3, keyword: '绑定' },
        { id: 4, keyword: '订单' }
      ]
    },
  ],
};

// 添加默认权限对话框相关变量
const defaultRoleDialogVisible = ref(false);
const defaultRoleForm = reactive({
  upstreamCascaderValue: [],
  merchantCascaderValue: []
});
const defaultRoleFormRef = ref(null);

// 添加打开默认权限对话框的方法
const openDefaultRoleDialog = () => {
  // 重置表单
  defaultRoleForm.upstreamCascaderValue = [];
  defaultRoleForm.merchantCascaderValue = [];
  defaultRoleDialogVisible.value = true;
};

// 处理级联选择器选择变化
const handleUpstreamCascaderChange = (value) => {
  console.log('上游群选择变化:', value);
  // 多选模式下，value是一个数组，每个元素是一个路径数组
  defaultRoleForm.upstreamCascaderValue = value;
};

const handleMerchantCascaderChange = (value) => {
  console.log('商户群选择变化:', value);
  // 多选模式下，value是一个数组，每个元素是一个路径数组
  defaultRoleForm.merchantCascaderValue = value;
};

// 添加提交默认权限设置的方法
const submitDefaultRole = () => {
  if (!defaultRoleForm.upstreamCascaderValue.length && !defaultRoleForm.merchantCascaderValue.length) {
    ElMessage.warning('请至少设置一种群组的默认指令');
    return;
  }
  
  // 提取所选指令ID
  const getSelectedCommandIds = (cascaderValues) => {
    const commandIds = [];
    if (cascaderValues && cascaderValues.length) {
      cascaderValues.forEach(path => {
        // 如果选择的是具体指令而不是分类
        if (path.length > 1 && typeof path[path.length - 1] === 'number') {
          commandIds.push(path[path.length - 1]);
        }
      });
    }
    return commandIds;
  };
  
  const upstreamCommandIds = getSelectedCommandIds(defaultRoleForm.upstreamCascaderValue);
  const merchantCommandIds = getSelectedCommandIds(defaultRoleForm.merchantCascaderValue);
  
  // 模拟API调用
  setTimeout(() => {
    let successMessage = '';
    
    if (upstreamCommandIds.length && merchantCommandIds.length) {
      successMessage = `已成功设置上游群默认指令(${upstreamCommandIds.length}个)和商户群默认指令(${merchantCommandIds.length}个)`;
    } else if (upstreamCommandIds.length) {
      successMessage = `已成功设置上游群默认指令(${upstreamCommandIds.length}个)`;
    } else {
      successMessage = `已成功设置商户群默认指令(${merchantCommandIds.length}个)`;
    }
    
    ElMessage.success(successMessage);
    defaultRoleDialogVisible.value = false;
  }, 500);
};

// 操作函数
const handleSearch = () => {
  loading.value = true;
  // 模拟API调用
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const resetFilter = () => {
  filterForm.groupName = '';
  filterForm.groupType = '';
  filterForm.botId = '';
  handleSearch();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  handleSearch();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  handleSearch();
};

const openMemberListDialog = (row) => {
  console.log('打开成员列表弹窗:', row);
  currentGroupForMembers.value = row;
  memberListLoading.value = true;
  
  // 模拟API调用
  setTimeout(() => {
    // 获取原始数据
    const members = mockMemberData[row.groupId] || [];
    console.log('原始成员数据:', members);
    
    // 根据群组类型过滤成员权限
    if (row.groupType === 'upstream') {
      // 上游群不显示"商户群普通权限"的成员
      memberListData.value = members.filter(m => m.role !== '商户群普通权限');
      console.log('过滤后的上游群成员:', memberListData.value);
    } else if (row.groupType === 'merchant') {
      // 商户群不显示"上游群普通权限"的成员
      memberListData.value = members.filter(m => m.role !== '上游群普通权限');
      console.log('过滤后的商户群成员:', memberListData.value);
    } else {
      memberListData.value = members;
    }
    
    memberListLoading.value = false;
  }, 500);
  
  memberListDialogVisible.value = true;
};

const openBoundSuppliersDialog = (row) => {
  currentGroupForBinding.value = row;
  boundSuppliersDialogVisible.value = true;
};

const openBoundMerchantsDialog = (row) => {
  console.log('打开商户绑定弹窗:', row);
  console.log('绑定商户列表:', row.boundMerchants);
  currentGroupForMerchantBinding.value = row;
  boundMerchantsDialogVisible.value = true;
};

const openBindSupplierDialog = (row) => {
  currentGroupForBinding.value = row;
  bindSupplierForm.supplierIds = row.boundSuppliers ? row.boundSuppliers.map(s => s.id) : [];
  bindSupplierDialogVisible.value = true;
};

const submitSupplierBinding = () => {
  bindSupplierLoading.value = true;
  // 模拟API调用
  setTimeout(() => {
    ElMessage.success('供应商绑定成功');
    // 更新本地数据
    if (currentGroupForBinding.value) {
      const index = tableData.value.findIndex(item => item.groupId === currentGroupForBinding.value.groupId);
      if (index !== -1) {
        const selectedSuppliers = supplierOptions.value.filter(s => bindSupplierForm.supplierIds.includes(s.id));
        tableData.value[index].boundSuppliers = selectedSuppliers.map(s => {
          let template = '闪电';
          if (s.id === 2) template = '纵横';
          if (s.id === 3) template = '熊猫';
          if (s.id === 4) template = '闪电';
          
          return {
            id: s.id,
            name: s.name,
            template: template
          };
        });
      }
    }
    bindSupplierLoading.value = false;
    bindSupplierDialogVisible.value = false;
  }, 1000);
};

const openSetRoleDialog = (row) => {
  currentGroupForRole.value = row;
  setRoleForm.roleId = row.roleId || null;
  setRoleDialogVisible.value = true;
};

const submitRoleSetting = () => {
  // 模拟API调用
  setTimeout(() => {
    // 更新本地数据
    if (currentGroupForRole.value) {
      const index = tableData.value.findIndex(item => item.groupId === currentGroupForRole.value.groupId);
      if (index !== -1) {
        const selectedRole = roleOptions.value.find(r => r.id === setRoleForm.roleId);
        tableData.value[index].roleId = setRoleForm.roleId;
        tableData.value[index].roleName = selectedRole ? selectedRole.roleName : null;
      }
    }
    ElMessage.success('群组角色设置成功');
    setRoleDialogVisible.value = false;
  }, 1000);
};

const openPermissionsDialog = (row) => {
  currentGroupForPermissions.value = row;
  if (row.roleId) {
    permissionCommandList.value = commandsData[row.roleId] || [];
  } else {
    permissionCommandList.value = [];
  }
  viewPermissionsDialogVisible.value = true;
};

const openMemberPermissionsDialog = (row) => {
  currentGroupForMemberPermissions.value = row;
  memberPermissionsLoading.value = true;
  // 模拟API调用
  setTimeout(() => {
    memberPermissionsList.value = mockMemberPermissionsData[row.groupId] || [];
    memberPermissionsLoading.value = false;
  }, 500);
  memberPermissionsDialogVisible.value = true;
};

const configMemberPermission = (member) => {
  currentMemberForPermission.value = member;
  
  // 设置初始表单值
  memberPermissionForm.useCustomPermissions = member.customRole || false;
  memberPermissionForm.selectedCommandIds = member.allowedCommands?.map(cmd => cmd.id) || [];
  
  // 获取当前群组可用的指令列表（群组权限范围内）
  if (currentGroupForMemberPermissions.value && currentGroupForMemberPermissions.value.roleId) {
    availableCommandsForMember.value = commandsData[currentGroupForMemberPermissions.value.roleId] || [];
  } else {
    availableCommandsForMember.value = [];
  }
  
  memberPermissionConfigDialogVisible.value = true;
};

const submitMemberPermission = () => {
  // 模拟API调用
  setTimeout(() => {
    // 更新本地数据
    if (currentMemberForPermission.value) {
      const memberIndex = memberPermissionsList.value.findIndex(
        m => m.userTgId === currentMemberForPermission.value.userTgId
      );
      
      if (memberIndex !== -1) {
        // 更新成员权限数据
        memberPermissionsList.value[memberIndex].customRole = memberPermissionForm.useCustomPermissions;
        
        if (memberPermissionForm.useCustomPermissions) {
          // 如果使用自定义权限，则根据选择的指令ID更新允许的指令
          const selectedCommands = [];
          
          memberPermissionForm.selectedCommandIds.forEach(cmdId => {
            const command = availableCommandsForMember.value.find(c => c.id === cmdId);
            if (command) {
              selectedCommands.push({
                id: command.id,
                keyword: command.keyword
              });
            }
          });
          
          memberPermissionsList.value[memberIndex].allowedCommands = selectedCommands;
        } else {
          // 如果继承群组权限，则清空允许的指令
          memberPermissionsList.value[memberIndex].allowedCommands = [];
        }
      }
    }
    
    ElMessage.success('成员权限设置成功');
    memberPermissionConfigDialogVisible.value = false;
  }, 500);
};

// 页面加载时执行
onMounted(() => {
  handleSearch();
});
</script>

<style scoped>
.group-management-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-direction: column;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.filter-row .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
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

.dialog-footer {
  text-align: right;
}

.command-format {
  color: #909399;
  font-size: 12px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style> 