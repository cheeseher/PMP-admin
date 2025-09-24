<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <div class="logo">
        <h1 v-if="!isCollapse">PMP系统</h1>
      </div>
      
      <el-scrollbar class="menu-scrollbar">
        <el-menu
          :default-active="route.path"
          class="el-menu-vertical"
          :collapse="isCollapse"
          @select="handleSelect"
        >
          <!-- 仪表板 -->
          <el-menu-item index="/dashboard">
            <el-icon><DataLine /></el-icon>
            <span>仪表板</span>
          </el-menu-item>

          <!-- 数据统计 -->
          <el-sub-menu index="/statistics">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>数据统计</span>
            </template>
            <el-menu-item index="/statistics/product">产品跑量统计</el-menu-item>
            <el-menu-item index="/statistics/upstream">上游渠道统计</el-menu-item>
            <el-menu-item index="/statistics/channel">支付通道统计</el-menu-item>
            <el-menu-item index="/statistics/merchant-rank">商户支付排行</el-menu-item>
            <el-menu-item index="/statistics/platform-profit">平台分润统计</el-menu-item>
            <el-menu-item index="/statistics/merchant-income">商户收款统计</el-menu-item>
            <el-menu-item index="/statistics/merchant-balance">商户余额快照</el-menu-item>
          </el-sub-menu>

          <!-- 流水审计 -->
          <el-sub-menu index="/audit">
            <template #title>
              <el-icon><Histogram /></el-icon>
              <span>流水审计</span>
            </template>
            <el-menu-item index="/audit/merchant-fund">商户资金流水</el-menu-item>
            <el-menu-item index="/audit/merchant-prepaid">商户预付记录</el-menu-item>
            <el-menu-item index="/audit/supplier-fund">供应商资金流水</el-menu-item>
            <el-menu-item index="/audit/supplier-prepaid">供应商预付记录</el-menu-item>
          </el-sub-menu>

          <!-- 订单管理 -->
          <el-sub-menu index="/order">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/order/merchant" @click="router.push('/order/merchant')">商户订单管理</el-menu-item>
            <el-menu-item v-if="!isMenuItemHidden('/order/withdraw')" index="/order/withdraw" @click="router.push('/order/withdraw')">商户提现审核</el-menu-item>
          </el-sub-menu>

          <!-- 供应商管理 -->
          <el-sub-menu index="/supplier">
            <template #title>
              <el-icon><Connection /></el-icon>
              <span>供应商管理</span>
            </template>
            <el-menu-item index="/supplier/list">供应商列表</el-menu-item>
            <el-menu-item index="/supplier/channel">供应商通道管理</el-menu-item>
          </el-sub-menu>

          <!-- 商户管理 -->
          <el-sub-menu index="product">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商户管理</span>
            </template>
            <el-menu-item index="/product/list">商户列表</el-menu-item>
            <el-menu-item index="/product/merchant-products">商户产品列表</el-menu-item>
          </el-sub-menu>

          <!-- 代理商管理 -->
          <el-sub-menu index="agent">
            <template #title>
              <el-icon><User /></el-icon>
              <span>代理商管理</span>
            </template>
            <el-menu-item index="/agent/list">代理商列表</el-menu-item>
          </el-sub-menu>

          <!-- 支付配置 -->
          <el-sub-menu index="payment">
            <template #title>
              <el-icon><Money /></el-icon>
              <span>支付配置</span>
            </template>
            <el-menu-item index="/payment/type">支付类型管理</el-menu-item>
            <el-menu-item index="/payment/product">支付产品管理</el-menu-item>
            <el-menu-item index="/payment/setting">支付设置</el-menu-item>
          </el-sub-menu>

          <!-- 代付管理 -->
          <el-sub-menu index="payout">
            <template #title>
              <el-icon><CreditCard /></el-icon>
              <span>代付管理</span>
            </template>
            <el-menu-item index="/payout/merchant-fund-flow">商户代付资金流水</el-menu-item>
            <el-menu-item index="/payout/upstream-channel">代付上游通道管理</el-menu-item>
            <el-menu-item index="/payout/upstream">代付上游管理</el-menu-item>
            <el-menu-item index="/payout/product">代付产品管理</el-menu-item>
            <el-menu-item index="/payout/upstream-fund-flow">上游代付资金流水</el-menu-item>
            <el-menu-item index="/payout/order">代付订单管理</el-menu-item>
          </el-sub-menu>

          <!-- 机器人管理 -->
          <el-sub-menu index="/bot">
            <template #title>
              <el-icon><ChatLineRound /></el-icon>
              <span>机器人管理</span>
            </template>
            <el-menu-item index="/bot/management">机器人列表</el-menu-item>
            <el-menu-item index="/bot/command">指令管理</el-menu-item>
            <el-menu-item index="/bot/role">角色权限管理</el-menu-item>
            <el-menu-item index="/bot/group">群组管理</el-menu-item>
            <el-menu-item index="/bot/mass-message">群发消息</el-menu-item>
            <el-menu-item index="/bot/operation-log">操作记录</el-menu-item>
          </el-sub-menu>

          <!-- 系统管理 -->
          <el-sub-menu index="/system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/admin">管理员管理</el-menu-item>
            <el-menu-item index="/system/role">角色管理</el-menu-item>
            <el-menu-item index="/system/permission">权限管理</el-menu-item>
            <el-menu-item index="/system/menu">菜单管理</el-menu-item>
            <el-menu-item index="/system/super-password">超级密码设置</el-menu-item>
            <el-menu-item index="/system/operation-log">管理员操作日志</el-menu-item>
            <el-menu-item index="/system/business-log">管理员业务日志</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <!-- 头部 -->
      <el-header height="60px" class="header">
        <div class="header-left">
          <el-icon
            class="fold-btn"
            @click="toggleSidebar"
          >
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span>管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="security">账户安全</el-dropdown-item>
                <el-dropdown-item command="exportManagement">导出管理</el-dropdown-item>
                <el-dropdown-item command="clearCache">清理缓存</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

  <!-- 账户安全抽屉 -->
  <el-drawer
    v-model="securityDrawerVisible"
    title="账户安全"
    direction="rtl"
    size="400px"
  >
    <el-form
      ref="securityFormRef"
      :model="securityForm"
      :rules="securityRules"
      label-width="120px"
      class="security-form"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="securityForm.username" />
      </el-form-item>
      
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="securityForm.nickname" />
      </el-form-item>
      
      <el-form-item label="输入新密码" prop="password">
        <el-input 
          v-model="securityForm.password" 
          type="password" 
          placeholder="不填表示不更新密码"
        />
      </el-form-item>
      
      <el-form-item label="谷歌验证" prop="googleAuth">
        <div class="google-auth">
          <el-tag v-if="securityForm.googleAuthEnabled" type="success">已验证</el-tag>
          <el-tag v-else type="warning">未验证</el-tag>
          <el-button v-if="!securityForm.googleAuthEnabled" type="primary" size="small" @click="handleGoogleAuth" style="margin-left: 12px">立即验证</el-button>
        </div>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSecuritySubmit">确认修改</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>

  <!-- 导出管理抽屉 -->
  <el-drawer
    v-model="exportDrawerVisible"
    title="导出管理"
    direction="rtl"
    size="800px"
  >
    <div class="export-management">
      <div class="export-header">
        <span class="export-title">导出文件记录</span>
        <el-tag type="info" size="small">{{ exportList.length }}条记录</el-tag>
      </div>
      
      <el-table :data="paginatedExportList" style="width: 100%" class="export-table">
        <el-table-column prop="fileName" label="文件名" min-width="200">
          <template #default="{ row }">
            <span class="file-name">{{ row.fileName }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="fileSize" label="文件大小" width="100" align="center" />
        
        <el-table-column prop="exportTime" label="导出时间" width="160" align="center">
          <template #default="{ row }">
            <div class="export-time">
              <div>{{ row.exportTime.split(' ')[0] }}</div>
              <div>{{ row.exportTime.split(' ')[1] }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="150" align="center">
          <template #default="{ row }">
            <div v-if="row.status === 'completed'" class="status-container">
              <el-tag type="success" size="small">已完成</el-tag>
              <el-progress :percentage="100" :show-text="false" :stroke-width="4" status="success" class="status-progress" />
            </div>
            <div v-else-if="row.status === 'processing'" class="status-container">
              <el-tag type="warning" size="small">处理中</el-tag>
              <el-progress :percentage="row.progress || 65" :show-text="false" :stroke-width="4" status="warning" class="status-progress" />
            </div>
            <div v-else class="status-container">
              <el-tag type="danger" size="small">失败</el-tag>
              <el-progress :percentage="0" :show-text="false" :stroke-width="4" status="exception" class="status-progress" />
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div class="operation-links">
              <span
                v-if="row.status === 'completed'"
                class="download-link"
                @click="downloadExportFile(row)"
              >
                下载
              </span>
              <span
                class="delete-link"
                @click="deleteExportRecord(row)"
              >
                删除
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="exportList.length === 0" class="empty-state">
        <el-empty description="暂无导出记录" />
      </div>
      
      <div v-if="exportList.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="exportList.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </el-drawer>

  <!-- 清理缓存对话框 -->
  <el-dialog
    v-model="clearCacheDialogVisible"
    title="清理缓存"
    width="400px"
  >
    <span>确定要清理系统缓存吗？</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="clearCacheDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleClearCache">确认</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 谷歌验证器设置弹窗 -->
  <el-dialog
    v-model="googleAuthDialogVisible"
    title="谷歌验证器"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    :show-close="false"
  >
    <template #header>
      <div class="dialog-header">
        <span>谷歌验证器</span>
        <el-button class="close-btn" type="text" @click="handleCloseGoogleAuth">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>

    <el-steps :active="activeStep" finish-status="success" class="auth-steps">
      <el-step title="第一步：创建秘钥" />
      <el-step title="第二步：验证身份" />
      <el-step title="第三步：完成设置" />
    </el-steps>

    <div class="auth-content">
      <!-- 第一步：创建秘钥 -->
      <div v-if="activeStep === 1" class="step-content">
        <div class="qrcode-container">
          <img :src="qrCodeUrl" alt="Google Authenticator QR Code" class="qrcode-img" />
        </div>
        <div class="secret-key">
          <span class="key-label">安全秘钥：</span>
          <span class="key-value">{{ secretKey }}</span>
          <el-button link type="primary" @click="handleCopy(secretKey)">复制</el-button>
        </div>
        <div class="auth-tip">
          打开手机谷歌验证器，并扫描上方二维码或手动输入安全秘钥
        </div>
        <div class="step-footer">
          <el-button @click="handleCloseGoogleAuth">取消</el-button>
          <el-button type="primary" @click="activeStep = 2">下一步</el-button>
        </div>
      </div>

      <!-- 第二步：验证身份 -->
      <div v-if="activeStep === 2" class="step-content">
        <div class="verify-container">
          <el-form :model="authForm" ref="authFormRef">
            <el-form-item>
              <el-input
                v-model="authForm.code"
                placeholder="请输入6位验证码"
                maxlength="6"
                clearable
                class="auth-input"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="step-footer">
          <el-button @click="activeStep = 1">上一步</el-button>
          <el-button type="primary" @click="handleVerifyCode">下一步</el-button>
        </div>
      </div>

      <!-- 第三步：完成设置 -->
      <div v-if="activeStep === 3" class="step-content">
        <div class="success-message">
          <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
          <div class="success-text">恭喜您，谷歌验证器设置成功！</div>
        </div>
        <div class="step-footer">
          <el-button type="primary" @click="handleFinishSetup">完成</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Connection,
  Goods,
  Money,
  Expand,
  Fold,
  Setting,
  DataLine,
  Histogram,
  ChatLineRound,
  User,
  CreditCard,
  Close,
  CircleCheckFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

// Helper function to check if a menu item should be hidden
const isMenuItemHidden = (path) => {
  const matchedRoute = router.getRoutes().find(r => r.path === path);
  return matchedRoute && matchedRoute.meta && matchedRoute.meta.hidden;
};

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 菜单选择
const handleSelect = (index) => {
  console.log('菜单被点击:', index)  // 添加日志以跟踪点击事件
  router.push(index)
}

// 账户安全抽屉
const securityDrawerVisible = ref(false)
const securityFormRef = ref(null)
const securityForm = reactive({
  username: 'admin',
  nickname: '管理员',
  password: '',
  googleAuth: false,
  googleAuthEnabled: false
})

// Google验证相关
const googleAuthDialogVisible = ref(false)
const activeStep = ref(1)
const secretKey = ref('JBSWY3DPEHPK3PXP')
const qrCodeUrl = ref('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
const authForm = reactive({
  code: ''
})
const authFormRef = ref()

// 表单验证规则
const securityRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  googleAuth: [
    { required: true, message: '请选择是否开启Google认证', trigger: 'change' }
  ]
}

// 账户安全表单提交
const handleSecuritySubmit = () => {
  securityFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟提交
      setTimeout(() => {
        ElMessage.success('账户信息修改成功')
        securityDrawerVisible.value = false
      }, 1000)
    } else {
      return false
    }
  })
}

// Google验证相关函数
const handleGoogleAuth = () => {
  googleAuthDialogVisible.value = true
  activeStep.value = 1
  // 模拟生成二维码和密钥
  secretKey.value = 'JBSWY3DPEHPK3PXP'
  qrCodeUrl.value = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/SiFang:admin?secret=' + secretKey.value + '&issuer=SiFang'
}

const handleCopy = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const handleVerifyCode = () => {
  if (!authForm.code || authForm.code.length !== 6) {
    ElMessage.error('请输入6位验证码')
    return
  }
  // 模拟验证
  activeStep.value = 3
}

const handleFinishSetup = () => {
  securityForm.googleAuthEnabled = true
  googleAuthDialogVisible.value = false
  activeStep.value = 1
  authForm.code = ''
  ElMessage.success('谷歌验证器设置成功')
}

const handleCloseGoogleAuth = () => {
  googleAuthDialogVisible.value = false
  activeStep.value = 1
  authForm.code = ''
}

// 导出管理抽屉
const exportDrawerVisible = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const exportList = ref([
  {
    id: 1,
    fileName: '商户资金流水_20241201143025.xlsx',
    fileSize: '2.5MB',
    exportTime: '2024-12-01 14:30:25',
    status: 'completed',
    progress: 100,
    downloadUrl: '/api/export/download/1'
  },
  {
    id: 2,
    fileName: '商户订单管理_20241130164512.xlsx',
    fileSize: '5.8MB',
    exportTime: '2024-11-30 16:45:12',
    status: 'completed',
    progress: 100,
    downloadUrl: '/api/export/download/2'
  },
  {
    id: 3,
    fileName: '支付产品管理_20241129102033.xlsx',
    fileSize: '1.2MB',
    exportTime: '2024-11-29 10:20:33',
    status: 'processing',
    progress: 65,
    downloadUrl: ''
  },
  {
    id: 4,
    fileName: '供应商通道管理_20241128091542.xlsx',
    fileSize: '3.1MB',
    exportTime: '2024-11-28 09:15:42',
    status: 'failed',
    progress: 0,
    downloadUrl: ''
  },
  {
    id: 5,
    fileName: '商户列表_20241127083015.xlsx',
    fileSize: '4.2MB',
    exportTime: '2024-11-27 08:30:15',
    status: 'completed',
    progress: 100,
    downloadUrl: '/api/export/download/5'
  },
  {
    id: 6,
    fileName: '支付类型管理_20241126155230.xlsx',
    fileSize: '800KB',
    exportTime: '2024-11-26 15:52:30',
    status: 'completed',
    progress: 100,
    downloadUrl: '/api/export/download/6'
  },
  {
    id: 7,
    fileName: '供应商列表_20241125112045.xlsx',
    fileSize: '6.7MB',
    exportTime: '2024-11-25 11:20:45',
    status: 'processing',
    progress: 35,
    downloadUrl: ''
  },
  {
    id: 8,
    fileName: '商户产品列表_20241124094318.xlsx',
    fileSize: '3.8MB',
    exportTime: '2024-11-24 09:43:18',
    status: 'completed',
    progress: 100,
    downloadUrl: '/api/export/download/8'
  },
  {
    id: 9,
    fileName: '系统用户管理_20241123173522.xlsx',
    fileSize: '1.5MB',
    exportTime: '2024-11-23 17:35:22',
    status: 'failed',
    progress: 0,
    downloadUrl: ''
  },
  {
    id: 10,
    fileName: '角色权限管理_20241122141208.xlsx',
    fileSize: '950KB',
    exportTime: '2024-11-22 14:12:08',
    status: 'completed',
    progress: 100,
    downloadUrl: '/api/export/download/10'
  },
  {
    id: 11,
    fileName: '操作日志_20241121105533.xlsx',
    fileSize: '12.3MB',
    exportTime: '2024-11-21 10:55:33',
    status: 'processing',
    progress: 78,
    downloadUrl: ''
  },
  {
    id: 12,
    fileName: '财务对账单_20241120162847.xlsx',
    fileSize: '8.9MB',
    exportTime: '2024-11-20 16:28:47',
    status: 'completed',
    progress: 100,
    downloadUrl: '/api/export/download/12'
  },
  {
    id: 13,
    fileName: '交易统计报表_20241119134512.xlsx',
    fileSize: '5.4MB',
    exportTime: '2024-11-19 13:45:12',
    status: 'completed',
    progress: 100,
    downloadUrl: '/api/export/download/13'
  },
  {
    id: 14,
    fileName: '风控规则配置_20241118091025.xlsx',
    fileSize: '2.1MB',
    exportTime: '2024-11-18 09:10:25',
    status: 'failed',
    progress: 0,
    downloadUrl: ''
  },
  {
    id: 15,
    fileName: '通知消息记录_20241117203318.xlsx',
    fileSize: '3.6MB',
    exportTime: '2024-11-17 20:33:18',
    status: 'completed',
    progress: 100,
    downloadUrl: '/api/export/download/15'
  }
])

// 计算分页数据
const paginatedExportList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return exportList.value.slice(start, end)
})

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
}

// 下载导出文件
const downloadExportFile = (row) => {
  if (row.status === 'completed' && row.downloadUrl) {
    // 模拟下载
    const link = document.createElement('a')
    link.href = row.downloadUrl
    link.download = row.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('文件下载已开始')
  } else {
    ElMessage.warning('文件还在处理中，请稍后再试')
  }
}

// 删除导出记录
const deleteExportRecord = (row) => {
  ElMessageBox.confirm('确定要删除这条导出记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = exportList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      exportList.value.splice(index, 1)
      ElMessage.success('删除成功')
      // 如果当前页没有数据了，回到上一页
      const totalPages = Math.ceil(exportList.value.length / pageSize.value)
      if (currentPage.value > totalPages && totalPages > 0) {
        currentPage.value = totalPages
      }
    }
  }).catch(() => {
    // 取消删除
  })
}

// 清理缓存对话框
const clearCacheDialogVisible = ref(false)

// 清理缓存处理
const handleClearCache = () => {
  // 模拟清理缓存
  setTimeout(() => {
    ElMessage.success('系统缓存清理成功')
    clearCacheDialogVisible.value = false
  }, 1000)
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已退出登录');
    console.log('Attempting to navigate to /login from MainLayout');
    router.push('/login').catch(err => {
      console.error('Failed to navigate to /login from MainLayout:', err);
      ElMessage.error('跳转到登录页面失败，请查看控制台获取更多信息。');
    });
  }).catch(() => {
    console.log('Logout cancelled in MainLayout');
  });
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'security':
      securityDrawerVisible.value = true
      break
    case 'exportManagement':
      exportDrawerVisible.value = true
      break
    case 'clearCache':
      clearCacheDialogVisible.value = true
      break
    case 'logout':
      handleLogout()
      break
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  
  .aside {
    background-color: #304156;
    transition: width 0.3s;
    overflow: hidden;
    
    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      color: #fff;
      
      h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        white-space: nowrap;
      }
    }
    
    .menu-scrollbar {
      height: calc(100% - 60px);
      
      :deep(.el-scrollbar__bar.is-horizontal) {
        display: none;
      }
      
      :deep(.el-scrollbar__bar.is-vertical) {
        display: none;
      }
    }
    
    .el-menu {
      border-right: none;
    }
  }
  
  .header {
    background-color: #fff;
    border-bottom: 1px solid #e6e6e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    
    .header-left {
      display: flex;
      align-items: center;
      
      .fold-btn {
        font-size: 20px;
        margin-right: 20px;
        cursor: pointer;
      }
    }
    
    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        
        span {
          margin-left: 8px;
        }
      }
    }
  }
  
  .el-main {
    background-color: #f0f2f5;
    padding: 20px;
  }
}

:deep(.el-menu) {
  background-color: #304156;
  
  .el-sub-menu__title {
    color: #bfcbd9;
    
    &:hover {
      background-color: #263445;
    }
  }
  
  .el-menu-item {
    color: #bfcbd9;
    
    &:hover {
      background-color: #263445;
    }
    
    &.is-active {
      background-color: #1890ff;
      color: #fff;
    }
  }
}

.security-form {
  padding: 20px;
}

/* Google验证相关样式 */
.google-auth {
  display: flex;
  align-items: center;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.close-btn {
  padding: 0;
  margin: 0;
  border: none;
  background: none;
}

.auth-steps {
  margin-bottom: 30px;
}

.auth-content {
  min-height: 300px;
}

.step-content {
  text-align: center;
  padding: 20px 0;
}

.qrcode-container {
  margin-bottom: 20px;
}

.qrcode-img {
  width: 200px;
  height: 200px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
}

.secret-key {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.key-label {
  font-weight: 500;
  color: #666;
}

.key-value {
  font-family: monospace;
  font-size: 16px;
  color: #333;
  letter-spacing: 2px;
}

.auth-tip {
  color: #666;
  font-size: 14px;
  margin-bottom: 30px;
  line-height: 1.5;
}

.verify-container {
  max-width: 300px;
  margin: 0 auto 30px;
}

.auth-input {
  text-align: center;
  font-size: 18px;
  letter-spacing: 4px;
}

.success-message {
  margin-bottom: 30px;
}

.success-icon {
  font-size: 48px;
  color: #52c41a;
  margin-bottom: 15px;
}

.success-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.step-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.export-management {
  padding: 20px;
  
  .export-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    
    .export-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .export-table {
    .file-info {
      display: flex;
      align-items: center;
      
      .file-icon {
        margin-right: 8px;
        color: #409eff;
      }
      
      .file-name {
        color: #303133;
        word-break: break-all;
      }
    }
    
    .status-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      
      .status-progress {
        width: 80px;
      }
    }
    
    .operation-links {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      
      .download-link {
        color: #409eff;
        cursor: pointer;
        font-size: 14px;
        
        &:hover {
          color: #66b1ff;
          text-decoration: underline;
        }
      }
      
      .delete-link {
        color: #f56c6c;
        cursor: pointer;
        font-size: 14px;
        
        &:hover {
          color: #f78989;
          text-decoration: underline;
        }
      }
     }
     
     .export-time {
       display: flex;
       flex-direction: column;
       align-items: center;
       line-height: 1.2;
       
       div {
         font-size: 13px;
         color: #606266;
       }
       
       div:first-child {
         margin-bottom: 2px;
       }
     }
   }
   
   .empty-state {
     margin-top: 40px;
   }
   
   .pagination-container {
     margin-top: 20px;
     display: flex;
     justify-content: center;
   }
 }
</style>