# 商户管理系统 - 文件夹结构说明

根据导航栏菜单的分类结构，商户管理系统的文件已经整理到以下目录：

## 目录结构

```
src/views/organized/
├── dashboard/        # 数据概览/主页
│   └── Overview.vue  # 商户主页数据概览
├── finance/          # 财务管理相关页面
│   ├── Assets.vue    # 资产管理
│   ├── Withdraw.vue  # 提现管理
│   ├── AccountChange.vue  # 账户变更记录
│   └── Adjust.vue    # 调账管理
├── trade/            # 交易管理相关页面
│   ├── Payment.vue   # 收款订单管理
│   └── Withdraw.vue  # 出款管理
├── account/          # 账户管理相关页面
│   ├── BatchWithdraw.vue # 批量出款
│   └── Products.vue  # 产品管理
├── statistics/       # 统计分析相关页面
│   ├── Payment.vue   # 收款统计
│   └── Withdraw.vue  # 出款统计
├── setting/          # 设置相关页面
│   ├── BasicInfo.vue # 基本信息
│   ├── Security.vue  # 安全设置
│   ├── UserProfile.vue # 用户资料
│   ├── ApiConfig.vue # API配置
│   └── IpWhitelist.vue # IP白名单
└── help/             # 帮助中心
    └── Index.vue     # 帮助首页
```

## 功能模块说明

1. **数据概览 (dashboard)**：提供商户整体营运状况概览，包括余额、收款、入账、出款等关键数据指标。

2. **财务管理 (finance)**：管理商户资金相关功能，包括资产查询、提现申请、账户变更记录和调账管理。

3. **交易管理 (trade)**：管理商户交易相关功能，包括收款订单管理和出款管理。

4. **账户管理 (account)**：商户账户管理功能，包括批量出款和产品管理。

5. **统计分析 (statistics)**：提供数据分析功能，包括收款统计和出款统计。

6. **设置 (setting)**：商户系统设置功能，包括基本信息、安全设置、用户资料、API配置和IP白名单管理。

7. **帮助中心 (help)**：提供系统使用帮助和指导。
