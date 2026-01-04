<!-- 商户后台布局 -->
<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '210px'" class="aside">
      <div class="logo">
        <img src="@/assets/logo.svg" alt="logo" />
        <h1 v-if="!isCollapse">商户后台</h1>
      </div>
      
      <el-scrollbar class="menu-scrollbar">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          router
          unique-opened
          :collapse="isCollapse"
          background-color="#001529"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <!-- 工作台 -->
          <el-menu-item index="/merchant/dashboard">
            <el-icon><DataLine /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          
          <!-- 数据看板 -->
          <el-sub-menu index="/merchant/statistics">
            <template #title>
              <el-icon><TrendCharts /></el-icon>
              <span>数据看板</span>
            </template>
            <el-menu-item index="/merchant/statistics/channel">支付通道简报</el-menu-item>
          </el-sub-menu>
          
          <!-- 财务数据 -->
          <el-sub-menu index="/merchant/finance">
            <template #title>
              <el-icon><Money /></el-icon>
              <span>财务数据</span>
            </template>
            <el-menu-item index="/merchant/finance/prepaid">预付记录</el-menu-item>
          </el-sub-menu>
          
          <!-- 通道管理 -->
          <el-sub-menu index="/merchant/channel">
            <template #title>
              <el-icon><Connection /></el-icon>
              <span>通道管理</span>
            </template>
            <el-menu-item index="/merchant/channel/payment">支付通道</el-menu-item>
          </el-sub-menu>
          
          <!-- 订单管理 -->
          <el-sub-menu index="/merchant/trade">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/merchant/trade/payment">支付订单</el-menu-item>
          </el-sub-menu>
          
          <!-- 流水审计 -->
          <el-sub-menu index="/merchant/audit">
            <template #title>
              <el-icon><Files /></el-icon>
              <span>流水审计</span>
            </template>
            <el-menu-item index="/merchant/audit/merchant">商户流水</el-menu-item>
          </el-sub-menu>
          
          <!-- 商户管理 -->
          <el-sub-menu index="/merchant/account">
            <template #title>
              <el-icon><User /></el-icon>
              <span>商户管理</span>
            </template>
            <el-menu-item index="/merchant/account/info">账户信息</el-menu-item>
            <el-menu-item index="/merchant/account/login-record">登录记录</el-menu-item>
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
            <el-breadcrumb-item :to="{ path: '/merchant/dashboard', query: { merchant: currentMerchantId } }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title || '商户中心' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="32" :icon="User" />
              <span class="user-name">{{ userInfo.productName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showChangePasswordDialog">修改密码</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="currentMerchantId" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>

  <!-- 修改密码弹窗 -->
  <el-dialog
    v-model="passwordDialogVisible"
    title="修改密码"
    width="500px"
    :close-on-click-modal="false"
    @close="resetPasswordForm"
  >
    <el-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordRules"
      label-width="80px"
      status-icon
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="passwordForm.oldPassword"
          placeholder="请输入旧密码"
          type="password"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          placeholder="请输入新密码"
          type="password"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          placeholder="请再次输入新密码"
          type="password"
          show-password
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="passwordDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitPasswordForm" :loading="passwordLoading">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productList } from '@/data/productData'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  DataLine, 
  Document, 
  Money, 
  Setting, 
  ArrowDown,
  User,
  Expand,
  Fold,
  TrendCharts,
  Connection,
  Files
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 当前激活菜单
const activeMenu = computed(() => {
  return route.path
})

// 商户信息
const userInfo = ref({
  productId: '',
  productName: '测试商户',
  avatar: ''
})

// 当前商户ID
const currentMerchantId = ref('')

// 获取商户信息
const fetchMerchantInfo = () => {
  // 从URL参数中获取商户ID
  const merchantId = route.query.merchant
  const token = route.query.token
  
  if (!merchantId) {
    return
  }
  
  currentMerchantId.value = merchantId
  
  // 模拟从API获取商户信息
  setTimeout(() => {
    const currentMerchant = productList.find(p => String(p.id) === String(merchantId))
    if (currentMerchant) {
      userInfo.value = {
        productId: currentMerchant.productId,
        productName: currentMerchant.productName,
        avatar: ''
      }
    }
  }, 100)
}

// 监听路由参数变化
watch(() => route.query.merchant, (newVal) => {
  if (newVal && newVal !== currentMerchantId.value) {
    fetchMerchantInfo()
  }
})

// 修改密码弹窗状态
const passwordDialogVisible = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref(null)

// 密码表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (passwordForm.confirmPassword !== '') {
      passwordFormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
}

// 显示修改密码弹窗
const showChangePasswordDialog = () => {
  passwordDialogVisible.value = true
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.resetFields()
}

// 提交密码表单
const submitPasswordForm = () => {
  passwordFormRef.value?.validate((valid) => {
    if (valid) {
      passwordLoading.value = true
      // 模拟API调用
      setTimeout(() => {
        passwordLoading.value = false
        passwordDialogVisible.value = false
        ElMessage.success('密码修改成功')
        resetPasswordForm()
      }, 1000)
    } else {
      return false
    }
  })
}

// 修改密码页面跳转改为直接显示弹窗
const goToChangePassword = () => {
  showChangePasswordDialog()
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('已退出登录');
    console.log('Attempting to navigate to /login from MerchantLayout');
    router.push('/login').catch(err => {
      console.error('Failed to navigate to /login from MerchantLayout:', err);
      ElMessage.error('跳转到登录页面失败，请查看控制台获取更多信息。');
    });
  }).catch(() => {
    console.log('Logout cancelled in MerchantLayout');
  });
}

onMounted(() => {
  fetchMerchantInfo()
})
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.aside {
  background-color: #001529;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  transition: width 0.3s;
  z-index: 10;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logo {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  overflow: hidden;
  background-color: #002140;
  flex-shrink: 0;
}

.logo img {
  height: 36px;
  margin-right: 10px;
}

.logo h1 {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  margin: 0;
}

.menu-scrollbar {
  flex-grow: 1;
}

.el-menu-vertical {
  border-right: none;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: #fff !important;
}

:deep(.el-menu-item:hover), :deep(.el-sub-menu__title:hover) {
  background-color: #001f3f !important;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #409EFF !important;
}

:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu--inline) {
  background-color: #000c17 !important;
}

:deep(.el-menu--inline .el-menu-item) {
  padding-left: 50px !important;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.fold-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 账户选择下拉框样式 */
/* Removed */

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  height: 40px;
  border-radius: 4px;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-name {
  margin: 0 8px;
  font-size: 14px;
  color: #606266;
}

.main {
  padding: 20px;
  background-color: #f5f7fa;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>