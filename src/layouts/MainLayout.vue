<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="aside">
      <div class="logo">
        <img src="@/assets/logo.svg" alt="logo" />
        <h1>支付管理系统</h1>
      </div>
      
      <el-scrollbar>
        <el-menu
          :default-active="route.path"
          class="el-menu-vertical"
          :collapse="isCollapse"
          @select="handleSelect"
        >
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
            <el-menu-item index="/statistics/merchant-outcome">商户出款统计</el-menu-item>
            <el-menu-item index="/statistics/merchant-balance">商户余额快照</el-menu-item>
          </el-sub-menu>

          <!-- 订单管理 -->
          <el-sub-menu index="/order">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/order/recharge" @click="router.push('/order/recharge')">商户充值列表</el-menu-item>
            <el-menu-item index="/order/merchant" @click="router.push('/order/merchant')">商户订单管理</el-menu-item>
            <el-menu-item index="/order/withdraw" @click="router.push('/order/withdraw')">商户提现审核</el-menu-item>
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
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span>管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
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
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Document,
  Connection,
  Goods,
  Money,
  Expand,
  Fold,
  ShoppingCart,
  Setting
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 菜单选择
const handleSelect = (index) => {
  console.log('菜单被点击:', index)  // 添加日志以跟踪点击事件
  router.push(index)
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  
  .aside {
    background-color: #304156;
    transition: width 0.3s;
    
    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      color: #fff;
      
      img {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }
      
      h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
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
</style> 