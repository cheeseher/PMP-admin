# 思方支付管理系统

基于 Vue 3 + Element Plus 的现代化支付管理系统。

## 项目结构

```
src/
├── views/                # 页面视图
│   ├── order/           # 订单管理模块
│   │   ├── MerchantOrder.vue   # 商户订单管理
│   │   ├── Recharge.vue       # 账户充值列表
│   │   └── Withdraw.vue       # 提现审核
│   ├── supplier/        # 供应商管理模块
│   │   ├── SupplierList.vue   # 供应商列表
│   │   └── Channel.vue        # 供应商通道列表
│   ├── product/         # 商户管理模块
│   │   └── ProductList.vue    # 商户列表
│   ├── payment/         # 支付配置模块
│   │   ├── Type.vue           # 支付类型管理
│   │   └── Product.vue        # 支付产品管理
│   ├── organized/       # 机构管理模块
│   │   ├── trade/           # 交易管理
│   │   │   └── PaymentChannel.vue # 支付通道管理
│   │   └── statistics/      # 统计分析 (机构视角)
│   │       └── Channel.vue    # 通道统计 (机构视角)
│   ├── system/          # 系统管理模块
│   │   ├── AdminList.vue      # 管理员管理
│   │   ├── RoleList.vue       # 角色管理
│   │   ├── PermissionList.vue # 权限管理
│   │   ├── MenuList.vue       # 菜单管理
│   │   ├── OperationLog.vue   # 管理员操作日志
│   │   └── BusinessLog.vue    # 管理员业务日志
│   └── statistics/      # 数据统计模块
│       ├── ProductStats.vue   # 产品跑量统计
│       ├── Upstream.vue       # 上游渠道统计
│       ├── ChannelStats.vue   # 支付通道统计
│       ├── MerchantRank.vue   # 商户支付排行
│       ├── PlatformProfit.vue # 平台分润统计
│       ├── MerchantIncome.vue # 商户收款统计
│       ├── MerchantOutcome.vue # 商户出款统计
│       └── MerchantBalance.vue # 商户余额快照
├── components/          # 公共组件
├── layouts/            # 布局组件
├── router/             # 路由配置
├── stores/             # 状态管理（Pinia）
├── api/                # API 接口
├── utils/              # 工具函数
├── styles/             # 全局样式
├── composables/        # 组合式函数
├── config/             # 全局配置
├── data/              # 模拟数据
└── assets/             # 静态资源
```

## 功能模块

### 订单管理模块 (/order)
- 商户订单管理：订单列表、订单状态管理
- 账户充值列表：充值记录查询、充值状态管理
- 商户提现审核：提现申请处理、审核流程管理

### 供应商管理模块 (/supplier)
- 供应商列表：供应商信息管理、状态管理
- 供应商通道列表：通道配置、费率设置、通道状态管理

### 商户管理模块 (/product)
- 商户列表：商户信息管理、添加/编辑商户、批量配置、状态管理
- 商户产品列表：查看商户已配置的产品、费率及供应商通道信息。其中供应商通道显示格式调整为"渠道名称 | 通道A | 费率"。

### 支付配置模块 (/payment)
- 支付类型管理：支付方式配置、状态管理
- 支付产品管理：产品参数配置、费率设置、供应商通道配置
  - **同步配置功能**：支持三种同步方式（不同步、立即同步、定时同步）
    - **不同步**：仅修改模板配置，不影响商户现有配置。可选择性设置生效时间，仅对模板生效。
    - **立即同步**：修改后立即将配置同步到所有关联商户。
    - **定时同步**：设置生效时间，到达指定时间后自动将配置同步到所有关联商户，支持倒计时显示。
  - **生效时间管理**：根据同步方式动态显示和管理生效时间设置，提供倒计时显示和已生效标识。

### 机构管理模块 (/organized)
- 交易管理
  - 支付通道管理 (`PaymentChannel.vue`): 查看机构下已开通的支付通道列表，包含支付产品编码、支付产品名称、商户费率、状态等信息。支持"拉单测试"功能。
- 统计分析 (机构视角)
  - 通道统计 (`Channel.vue`): (待补充详细功能描述)

### 系统管理模块 (/system)
- 管理员管理 (AdminList.vue)：管理员账号创建、编辑、状态管理及权限分配
- 角色管理 (RoleList.vue)：角色创建、编辑、权限分配及用户关联
- 权限管理 (PermissionList.vue)：系统权限配置、权限标识管理
- 菜单管理 (MenuList.vue)：系统菜单结构配置、菜单权限关联
- 管理员操作日志 (OperationLog.vue)：记录管理员操作行为，支持多维度查询
- 管理员业务日志 (BusinessLog.vue)：记录管理员业务操作，包含操作前后数据对比

### 数据统计模块 (/statistics)
- 产品跑量统计 (ProductStats.vue)：产品交易量统计分析
- 上游渠道统计 (Upstream.vue)：上游渠道数据分析
- 支付通道统计 (ChannelStats.vue)：支付通道数据分析
- 商户支付排行 (MerchantRank.vue)：商户交易排名分析
- 平台分润统计 (PlatformProfit.vue)：平台收益数据统计
- 商户收款统计 (MerchantIncome.vue)：商户收入详细分析
- 商户出款统计 (MerchantOutcome.vue)：商户出款数据统计
- 商户余额快照 (MerchantBalance.vue)：商户账户余额实时监控，包含总体统计卡片、可用余额与冻结资金明细、余额趋势图表及历史记录查询功能，支持多维度筛选和数据导出

## 技术栈

- Vue 3：前端框架
- Element Plus：UI 组件库
- Vue Router：路由管理
- Pinia：状态管理
- Axios：HTTP 请求
- ECharts：数据可视化
- Vite：构建工具

## 设计规范

- 使用 Element Plus 原生组件，保持界面统一性
- 下拉菜单统一宽度：168px
- 二级菜单仅使用文字，不显示图标
- 使用 Element Plus 线性图标，确保视觉统一

## 开发说明

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 构建生产版本：
```bash
npm run build
```

## 部署说明

项目使用 Vercel 进行部署，配置文件位于根目录的 `vercel.json`。部署步骤：

1. 在 Vercel 上创建新项目
2. 连接 GitHub 仓库
3. 配置环境变量（如需要）
4. 触发自动部署

## 开发团队

- 产品经理：负责产品规划和功能设计
- 前端开发：负责界面实现和交互开发
- UI 设计：负责视觉设计和用户体验
- 技术支持：负责系统维护和技术支持 