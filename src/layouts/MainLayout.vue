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
          <el-sub-menu index="/product">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商户管理</span>
            </template>
            <el-menu-item index="/product/list">商户列表</el-menu-item>
            <el-menu-item index="/product/merchant-products">商户产品列表</el-menu-item>
          </el-sub-menu>

          <!-- 支付配置 -->
          <el-sub-menu index="/payment">
            <template #title>
              <el-icon><Money /></el-icon>
              <span>支付配置</span>
            </template>
            <el-menu-item index="/payment/type">支付类型管理</el-menu-item>
            <el-menu-item index="/payment/product">支付产品管理</el-menu-item>
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
      
      <el-form-item label="开启google认证" prop="googleAuth">
        <el-radio-group v-model="securityForm.googleAuth">
          <el-radio :label="false">禁用</el-radio>
          <el-radio :label="true">启用</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSecuritySubmit">确认修改</el-button>
      </el-form-item>
    </el-form>
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
  ShoppingCart,
  Setting,
  DataLine,
  Histogram
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
  googleAuth: false
})

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
</style> 