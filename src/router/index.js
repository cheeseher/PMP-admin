import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import MerchantLayout from '@/layouts/MerchantLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      redirect: '/dashboard',
      children: [
        // 仪表板
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/statistics/Dashboard.vue'),
          meta: { title: '仪表板' }
        },
        
        // 订单管理
        {
          path: '/order',
          name: 'Order',
          redirect: '/order/recharge',
          meta: { title: '订单管理' },
          children: [
            {
              path: 'merchant',
              name: 'MerchantOrder',
              component: () => import('@/views/order/MerchantOrder.vue'),
              meta: { title: '商户订单管理' }
            },
            {
              path: 'recharge',
              name: 'RechargeList',
              component: () => import('@/views/order/Recharge.vue'),
              meta: { title: '商户充值列表' }
            },
            {
              path: 'withdraw',
              name: 'WithdrawList',
              component: () => import('@/views/order/Withdraw.vue'),
              meta: { title: '商户提现审核' }
            }
          ]
        },
        
        // 供应商管理
        {
          path: '/supplier',
          name: 'Supplier',
          redirect: '/supplier/list',
          meta: { title: '供应商管理' },
          children: [
            {
              path: 'list',
              name: 'SupplierList',
              component: () => import('@/views/supplier/SupplierList.vue'),
              meta: { title: '供应商列表' }
            },
            {
              path: 'channel',
              name: 'SupplierChannel',
              component: () => import('@/views/supplier/Channel.vue'),
              meta: { title: '供应商通道管理' }
            }
          ]
        },

        // 商户管理
        {
          path: '/product',
          name: 'Product',
          redirect: '/product/list',
          meta: { title: '商户管理' },
          children: [
            {
              path: 'list',
              name: 'ProductList',
              component: () => import('@/views/product/ProductList.vue'),
              meta: { title: '商户列表' }
            },
            {
              path: 'merchant-products',
              name: 'MerchantProductList',
              component: () => import('@/views/product/MerchantProductList.vue'),
              meta: { title: '商户产品列表' }
            }
          ]
        },

        // 支付配置
        {
          path: '/payment',
          name: 'Payment',
          redirect: '/payment/type',
          meta: { title: '支付配置' },
          children: [
            {
              path: 'type',
              name: 'PaymentType',
              component: () => import('@/views/payment/Type.vue'),
              meta: { title: '支付类型管理' }
            },
            {
              path: 'product',
              name: 'PaymentProduct',
              component: () => import('@/views/payment/Product.vue'),
              meta: { title: '支付产品管理' }
            }
          ]
        },

        // 数据统计
        {
          path: '/statistics',
          name: 'Statistics',
          redirect: '/statistics/dashboard',
          meta: { title: '数据统计' },
          children: [
            {
              path: 'product',
              name: 'StatisticsProduct',
              component: () => import('@/views/statistics/ProductStats.vue'),
              meta: { title: '产品跑量统计' }
            },
            {
              path: 'upstream',
              name: 'StatisticsUpstream',
              component: () => import('@/views/statistics/Upstream.vue'),
              meta: { title: '上游渠道统计' }
            },
            {
              path: 'channel',
              name: 'StatisticsChannel',
              component: () => import('@/views/statistics/ChannelStats.vue'),
              meta: { title: '支付通道统计' }
            },
            {
              path: 'merchant-rank',
              name: 'StatisticsMerchantRank',
              component: () => import('@/views/statistics/MerchantRank.vue'),
              meta: { title: '商户支付排行' }
            },
            {
              path: 'platform-profit',
              name: 'StatisticsPlatformProfit',
              component: () => import('@/views/statistics/PlatformProfit.vue'),
              meta: { title: '平台分润统计' }
            },
            {
              path: 'merchant-income',
              name: 'StatisticsMerchantIncome',
              component: () => import('@/views/statistics/MerchantIncome.vue'),
              meta: { title: '商户收款统计' }
            },
            {
              path: 'merchant-outcome',
              name: 'StatisticsMerchantOutcome',
              component: () => import('@/views/statistics/MerchantOutcome.vue'),
              meta: { title: '商户出款统计' }
            },
            {
              path: 'merchant-balance',
              name: 'StatisticsMerchantBalance',
              component: () => import('@/views/statistics/MerchantBalance.vue'),
              meta: { title: '商户余额快照' }
            }
          ]
        },

        // 系统管理
        {
          path: '/system',
          name: 'System',
          redirect: '/system/admin',
          meta: { title: '系统管理' },
          children: [
            {
              path: 'admin',
              name: 'AdminList',
              component: () => import('@/views/system/AdminList.vue'),
              meta: { title: '管理员管理' }
            },
            {
              path: 'role',
              name: 'RoleList',
              component: () => import('@/views/system/RoleList.vue'),
              meta: { title: '角色管理' }
            },
            {
              path: 'permission',
              name: 'PermissionList',
              component: () => import('@/views/system/PermissionList.vue'),
              meta: { title: '权限管理' }
            },
            {
              path: 'menu',
              name: 'MenuList',
              component: () => import('@/views/system/MenuList.vue'),
              meta: { title: '菜单管理' }
            },
            {
              path: 'operation-log',
              name: 'OperationLog',
              component: () => import('@/views/system/OperationLog.vue'),
              meta: { title: '管理员操作日志' }
            },
            {
              path: 'business-log',
              name: 'BusinessLog',
              component: () => import('@/views/system/BusinessLog.vue'),
              meta: { title: '管理员业务日志' }
            }
          ]
        }
      ]
    },
    // 商户后台路由
    {
      path: '/merchant',
      component: MerchantLayout,
      redirect: '/merchant/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'MerchantDashboard',
          component: () => import('@/views/organized/dashboard/Overview.vue'),
          meta: { title: '商户仪表盘' }
        },
        // 商户中心
        {
          path: 'account/security',
          name: 'MerchantAccountSecurity',
          component: () => import('@/views/organized/setting/Security.vue'),
          meta: { title: '账户安全' }
        },
        {
          path: 'account/api',
          name: 'MerchantAccountApi',
          component: () => import('@/views/organized/setting/ApiConfig.vue'),
          meta: { title: '商户对接信息' }
        },
        {
          path: 'account/products',
          name: 'MerchantAccountProducts',
          component: () => import('@/views/organized/account/Products.vue'),
          meta: { title: '商户产品列表' }
        },
        {
          path: 'account/batch-withdraw',
          name: 'MerchantAccountBatchWithdraw',
          component: () => import('@/views/organized/account/BatchWithdraw.vue'),
          meta: { title: '批量导入出款订单' }
        },
        {
          path: 'account/profile',
          name: 'MerchantUserProfile',
          component: () => import('@/views/organized/setting/UserProfile.vue'),
          meta: { title: '修改资料' }
        },
        // 交易管理
        {
          path: 'trade/payment',
          name: 'MerchantTradePayment',
          component: () => import('@/views/organized/trade/Payment.vue'),
          meta: { title: '收款订单' }
        },
        {
          path: 'trade/withdraw',
          name: 'MerchantTradeWithdraw',
          component: () => import('@/views/organized/trade/Withdraw.vue'),
          meta: { title: '出款订单' }
        },
        // 财务管理
        {
          path: 'finance/assets',
          name: 'MerchantFinanceAssets',
          component: () => import('@/views/organized/finance/Assets.vue'),
          meta: { title: '我的资产' }
        },
        {
          path: 'finance/adjust',
          name: 'MerchantFinanceAdjust',
          component: () => import('@/views/organized/finance/Adjust.vue'),
          meta: { title: '充减订单' }
        },
        {
          path: 'finance/account-change',
          name: 'MerchantFinanceAccountChange',
          component: () => import('@/views/organized/finance/AccountChange.vue'),
          meta: { title: '账变详情' }
        },
        {
          path: 'finance/withdraw',
          name: 'MerchantFinanceWithdraw',
          component: () => import('@/views/organized/finance/Withdraw.vue'),
          meta: { title: '提现列表' }
        },
        // 数据统计
        {
          path: 'statistics/withdraw',
          name: 'MerchantStatisticsWithdraw',
          component: () => import('@/views/organized/statistics/Withdraw.vue'),
          meta: { title: '出款统计' }
        },
        {
          path: 'statistics/payment',
          name: 'MerchantStatisticsPayment',
          component: () => import('@/views/organized/statistics/Payment.vue'),
          meta: { title: '收款统计' }
        },
        // 原有设置路由保留，以确保兼容性
        {
          path: 'setting/basic',
          name: 'MerchantBasicInfo',
          component: () => import('@/views/organized/setting/BasicInfo.vue'),
          meta: { title: '基本信息' }
        },
        {
          path: 'setting/profile',
          name: 'MerchantSettingProfile',
          component: () => import('@/views/organized/setting/UserProfile.vue'),
          meta: { title: '修改资料' }
        },
        {
          path: 'setting/security',
          name: 'MerchantSecurity',
          component: () => import('@/views/organized/setting/Security.vue'),
          meta: { title: '安全设置' }
        },
        {
          path: 'setting/api',
          name: 'MerchantApiConfig',
          component: () => import('@/views/organized/setting/ApiConfig.vue'),
          meta: { title: 'API配置' }
        },
        {
          path: 'setting/ip-whitelist',
          name: 'MerchantIpWhitelist',
          component: () => import('@/views/organized/setting/IpWhitelist.vue'),
          meta: { title: 'IP白名单' }
        },
        {
          path: 'help',
          name: 'MerchantHelp',
          component: () => import('@/views/organized/help/Index.vue'),
          meta: { title: '帮助中心' }
        }
      ]
    }
  ]
})

export default router 