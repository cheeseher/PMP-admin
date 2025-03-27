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
          <el-menu-item index="/merchant/dashboard">
            <el-icon><DataLine /></el-icon>
            <span>仪表板</span>
          </el-menu-item>
          
          <el-sub-menu index="/merchant/account">
            <template #title>
              <el-icon><User /></el-icon>
              <span>商户中心</span>
            </template>
            <el-menu-item index="/merchant/account/security">账户安全</el-menu-item>
            <el-menu-item index="/merchant/account/api">商户对接信息</el-menu-item>
            <el-menu-item index="/merchant/account/products">商户产品列表</el-menu-item>
            <el-menu-item index="/merchant/account/batch-withdraw">批量导入出款订单</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="/merchant/trade">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>交易管理</span>
            </template>
            <el-menu-item index="/merchant/trade/payment">收款订单</el-menu-item>
            <el-menu-item index="/merchant/trade/withdraw">出款订单</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="/merchant/finance">
            <template #title>
              <el-icon><Money /></el-icon>
              <span>财务管理</span>
            </template>
            <el-menu-item index="/merchant/finance/assets">我的资产</el-menu-item>
            <el-menu-item index="/merchant/finance/adjust">充减订单</el-menu-item>
            <el-menu-item index="/merchant/finance/account-change">账变详情</el-menu-item>
            <el-menu-item index="/merchant/finance/withdraw">提现列表</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="/merchant/statistics">
            <template #title>
              <el-icon><TrendCharts /></el-icon>
              <span>数据统计</span>
            </template>
            <el-menu-item index="/merchant/statistics/withdraw">出款统计</el-menu-item>
            <el-menu-item index="/merchant/statistics/payment">收款统计</el-menu-item>
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
            <el-breadcrumb-item :to="{ path: '/merchant/dashboard' }">首页</el-breadcrumb-item>
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
                <el-dropdown-item @click="goToProfile">商户资料</el-dropdown-item>
                <el-dropdown-item @click="goToSecurity">安全设置</el-dropdown-item>
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
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  DataLine, 
  Document, 
  Money, 
  Setting, 
  QuestionFilled, 
  ArrowDown,
  User,
  Expand,
  Fold,
  TrendCharts
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

// 获取商户信息
const fetchMerchantInfo = () => {
  // 从URL参数中获取商户ID
  const merchantId = route.query.merchant
  const token = route.query.token
  
  if (!merchantId || !token) {
    ElMessage.error('无效的登录信息')
    router.push('/login')
    return
  }
  
  // 模拟从API获取商户信息
  setTimeout(() => {
    userInfo.value = {
      productId: merchantId,
      productName: `商户${merchantId}`,
      avatar: ''
    }
  }, 300)
}

// 跳转到商户资料页
const goToProfile = () => {
  router.push('/merchant/setting/profile')
}

// 跳转到安全设置页
const goToSecurity = () => {
  router.push('/merchant/setting/security')
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
    window.close() // 关闭标签页
  }).catch(() => {
    // 取消退出
  })
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
}

.logo {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  overflow: hidden;
  background-color: #002140;
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
  height: calc(100vh - 60px);
  overflow-x: hidden;
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
</style> 