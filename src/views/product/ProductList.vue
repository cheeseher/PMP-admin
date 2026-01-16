<!-- 商户管理/商户列表 - 管理商户信息 -->
<template>
  <div class="product-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" label-position="left" class="filter-form">
        <div class="filter-grid">
          <el-form-item label="商户ID：">
            <el-input v-model="searchForm.id" placeholder="请输入商户ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户账号：">
            <el-input v-model="searchForm.productId" placeholder="请输入商户账号" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户名称：">
            <el-input v-model="searchForm.productName" placeholder="请输入商户名称" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户号：">
            <el-input v-model="searchForm.productNo" placeholder="请输入商户号" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="钱包地址：">
            <el-input v-model="searchForm.walletAddress" placeholder="请输入钱包地址" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="状态：">
            <el-select v-model="searchForm.verified" placeholder="请选择状态" style="width: 168px" clearable>
              <el-option label="开启" value="Y" />
              <el-option label="关闭" value="N" />
            </el-select>
          </el-form-item>
          <el-form-item label="谷歌认证：">
            <el-select v-model="searchForm.googleAuth" placeholder="请选择状态" style="width: 168px" clearable>
              <el-option label="开启" :value="true" />
              <el-option label="关闭" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="开启进单：">
            <el-select v-model="searchForm.enableDeposit" placeholder="请选择状态" style="width: 168px" clearable>
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="回调模式：">
            <el-select v-model="searchForm.callbackMode" placeholder="请选择模式" style="width: 168px" clearable>
              <el-option label="FORM" value="form" />
              <el-option label="JSON" value="json" />
            </el-select>
          </el-form-item>
          <div class="filter-buttons">
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增商户</el-button>
          <el-button type="primary" :icon="Setting" @click="openMerchantGroupConfig">商户组配置</el-button>
          <el-button :icon="Delete" plain :disabled="!selectedRows.length" @click="handleBatchDelete">批量删除</el-button>
          <el-button :icon="Setting" plain :disabled="!selectedRows.length" @click="handleBatchConfig">批量配置产品</el-button>
        </div>
        <div class="right">
          <el-button type="primary" :icon="Download" @click="handleExport">导出</el-button>
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle plain @click="fetchData" />
          </el-tooltip>
        </div>
      </div>
      
      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="id" label="商户ID" width="80" />
        <el-table-column prop="productId" label="商户账号" min-width="120" />
        <el-table-column prop="productName" label="商户名称" min-width="150" />
        <el-table-column prop="productNo" label="商户号" min-width="120" />
        <el-table-column prop="walletAddress" label="钱包地址" min-width="220" />
        <el-table-column prop="balance" label="余额" width="160" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ formatAmount(scope.row.balance) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="enableDeposit" label="开启进单" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.enableDeposit ? 'success' : 'info'"
              size="small"
            >
              {{ scope.row.enableDeposit ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="callbackMode" label="回调模式" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.callbackMode === 'json' ? 'warning' : ''" size="small">
              {{ scope.row.callbackMode === 'json' ? 'JSON' : 'FORM' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="subAccounts" label="子账户" min-width="200">
          <template #default="scope">
            <div class="sub-accounts-tags" v-if="scope.row.subAccounts && scope.row.subAccounts.length">
              <el-tag
                v-for="accountId in scope.row.subAccounts"
                :key="accountId"
                size="small"
                type="info"
                effect="plain"
                class="sub-account-tag"
              >
                {{ getSubAccountName(accountId) }}
              </el-tag>
            </div>
            <span v-else class="no-sub-accounts">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="authIp" label="上次登录IP" width="140" />
        <el-table-column prop="loginCount" label="登录次数" width="100" />
        <el-table-column prop="googleAuth" label="谷歌认证" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.googleAuth ? 'success' : 'info'"
              size="small"
            >
              {{ scope.row.googleAuth ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quickLogin" label="一键登录" width="90">
          <template #default="scope">
            <el-button link type="primary" @click="handleQuickLogin(scope.row)">登录</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="verified" label="状态" width="90">
          <template #default="scope">
            <el-switch
              v-model="scope.row.verified"
              :active-value="'Y'"
              :inactive-value="'N'"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-dropdown @command="(command) => handleCommand(command, scope.row)" class="operation-dropdown">
              <span class="el-dropdown-link">
                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="config">产品配置</el-dropdown-item>
                  <el-dropdown-item command="edit">编辑商户</el-dropdown-item>
                  <el-dropdown-item command="resetGoogle">重置谷歌</el-dropdown-item>
                  <el-dropdown-item command="resetApiKey">重置APIKEY</el-dropdown-item>
                  <el-dropdown-item command="balance">余额操作</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑商户对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="650px"
      destroy-on-close
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="120px"
        class="product-form"
      >
        <el-form-item label="商户账号" prop="productId">
          <el-input v-model="productForm.productId" placeholder="请输入商户账号" />
        </el-form-item>
        <el-form-item label="商户名称" prop="productName">
          <el-input v-model="productForm.productName" placeholder="请输入商户名称" />
        </el-form-item>
        <el-form-item label="商户后台密码" prop="password">
          <el-input v-model="productForm.password" type="password" placeholder="请输入商户后台密码" show-password>
            <template #append>
              <el-button v-if="productForm.password" @click="copyPassword" :icon="CopyDocument" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="商户号" prop="productNo">
          <el-input v-model="productForm.productNo" placeholder="请输入商户号" :disabled="dialogTitle === '编辑商户'">
            <template #append v-if="dialogTitle === '新增商户'">
              <el-button @click="productForm.productNo = generateMerchantNo()">自动生成</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="回调模式">
          <el-select v-model="productForm.callbackMode" placeholder="请选择回调模式" style="width: 100%">
            <el-option label="FORM" value="form" />
            <el-option label="JSON" value="json" />
          </el-select>
        </el-form-item>
        <el-form-item label="商户钱包地址" prop="walletAddress">
          <el-input v-model="productForm.walletAddress" placeholder="请输入商户钱包地址" />
        </el-form-item>
        <el-form-item label="API密钥" prop="apiKey">
          <el-input v-model="productForm.apiKey" placeholder="请输入API密钥">
            <template #append>
              <el-button @click="productForm.apiKey = generateApiKey()">自动生成</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="回调地址" prop="callbackUrl">
          <el-input v-model="productForm.callbackUrl" placeholder="请输入回调地址" />
        </el-form-item>
        <el-form-item label="开启进单">
          <el-switch v-model="productForm.enableDeposit" />
        </el-form-item>
        <el-form-item label="下单IP白名单" prop="depositIpWhitelist">
          <el-input 
            v-model="productForm.depositIpWhitelist" 
            type="textarea" 
            :rows="2" 
            placeholder="多个IP请用英文逗号分隔" 
          />
        </el-form-item>
        <el-form-item label="后台IP白名单" prop="adminIpWhitelist">
          <el-input 
            v-model="productForm.adminIpWhitelist" 
            type="textarea" 
            :rows="2" 
            placeholder="多个IP请用英文逗号分隔" 
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="productForm.remark" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入备注信息" 
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="productForm.verified"
            active-value="Y"
            inactive-value="N"
            active-text="开启"
            inactive-text="关闭"
          />
        </el-form-item>
        <el-form-item label="子账户" prop="subAccounts">
          <el-select
            v-model="productForm.subAccounts"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            :placeholder="availableSubAccounts.length > 0 ? '请选择子账户' : '无可选子账户'"
            style="width: 100%"
          >
            <el-option
              v-for="item in availableSubAccounts"
              :key="item.id"
              :label="`${item.productName} (${item.id})`"
              :value="item.id"
            />
          </el-select>
          <div class="form-tip" v-if="productForm.subAccounts.length > 0">
            已选择 {{ productForm.subAccounts.length }} 个子账户
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 批量配置对话框 -->
    <el-dialog
      title="批量配置产品"
      v-model="batchConfigVisible"
      width="650px"
      destroy-on-close
    >
      <el-form
        ref="batchConfigFormRef"
        :model="batchConfigForm"
        label-width="100px"
      >
        <el-form-item label="已选商户">
          <div class="selected-merchants">
            <el-tag
              v-for="merchant in selectedRows"
              :key="merchant.id"
              type="info"
              effect="plain"
              class="merchant-tag"
            >
              {{ merchant.productName }}
            </el-tag>
          </div>
          <div class="form-tip">已选择 {{ selectedRows.length }} 个商户</div>
        </el-form-item>
        <el-form-item label="配置模式" prop="configMode">
          <div>
            <el-radio-group v-model="batchConfigForm.configMode">
              <el-radio label="append">追加模式</el-radio>
              <el-radio label="overwrite">覆盖模式</el-radio>
            </el-radio-group>
            <div class="form-tip" v-if="batchConfigForm.configMode === 'append'">
              在现有配置基础上增加新产品，若产品已存在则忽略
            </div>
            <div class="form-tip" v-else>
              清空商户原有所有配置，仅保留当前选择的产品
            </div>
          </div>
        </el-form-item>
        <el-form-item label="支付产品" prop="selectedProduct">
          <el-select 
            v-model="batchConfigForm.selectedProduct" 
            placeholder="请选择支付产品"
            style="width: 100%"
            multiple
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option 
              v-for="item in paymentProducts" 
              :key="item.id" 
              :label="item.productName" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
        
        <!-- 支付产品费率列表 -->
        <div class="product-rate-list" v-if="batchConfigForm.productRates.length > 0">
          <el-divider content-position="left">支付产品费率列表</el-divider>
          
          <!-- 批量设置费率 -->
          <div v-if="batchConfigForm.productRates.length > 1" class="batch-rate-setting">
            <el-alert
              type="info"
              :closable="false"
              show-icon
            >
              <template #title>
                <div class="batch-rate-title">
                  <span>批量设置费率</span>
                  <div class="batch-rate-input">
                    <el-input-number 
                      v-model="batchConfigForm.rate" 
                      :precision="2" 
                      :step="0.1" 
                      :min="0"
                      :max="20"
                      controls-position="right"
                      size="small"
                      style="width: 120px"
                    />
                    <span class="rate-unit">%</span>
                    <el-button type="primary" size="small" style="margin-left: 10px" @click="applyBatchConfigRate">应用到所有产品</el-button>
                  </div>
                </div>
              </template>
            </el-alert>
          </div>
          
          <el-table :data="batchConfigForm.productRates" style="width: 100%; margin-top: 16px" border>
            <el-table-column prop="productName" label="支付产品名称" min-width="180" />
            <el-table-column label="商户费率" width="150" align="center">
              <template #default="scope">
                <div class="rate-input-group">
                  <el-input-number 
                    v-model="scope.row.rate" 
                    :precision="2" 
                    :step="0.1" 
                    :min="0"
                    :max="20"
                    controls-position="right"
                    size="small"
                    style="width: 100px"
                  />
                  <span class="rate-unit">%</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="100" align="center">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  link 
                  size="small" 
                  @click="removeBatchProductRate(scope.row.productId)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 无产品提示 -->
        <el-empty v-if="batchConfigForm.productRates.length === 0" description="请选择支付产品" />
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchConfigVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchConfig" :disabled="batchConfigForm.productRates.length === 0">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 产品配置弹窗 -->
    <el-dialog
      title="产品配置"
      v-model="productConfigVisible"
      width="750px"
      destroy-on-close
    >
      <el-form
        ref="productConfigFormRef"
        :model="productConfigForm"
        label-width="100px"
      >
        <el-form-item label="商户号">
          <el-input v-model="productConfigForm.productNo" disabled />
        </el-form-item>
        <el-form-item label="商户名称">
          <el-input v-model="productConfigForm.productName" disabled />
        </el-form-item>
        
        <!-- 已配置的支付产品表格 -->
        <el-form-item label="已配置产品">
          <div class="table-toolbar" style="margin-bottom: 10px;">
            <div>
              <el-button type="primary" size="small" :icon="Plus" @click="showAddProductDialog">新增产品</el-button>
            </div>
          </div>
          
          <el-table :data="productConfigForm.productRates" style="width: 100%" border>
            <el-table-column prop="productName" label="支付产品名称" min-width="180" />
            <el-table-column prop="productCode" label="支付产品编码" width="80" />
            <el-table-column label="商户费率" width="120">
              <template #default="scope">
                <div class="rate-input-group">
                  <el-input-number 
                    v-model="scope.row.rate" 
                    :precision="2" 
                    :step="0.1" 
                    :min="0"
                    :max="20"
                    controls-position="right"
                    size="small"
                    style="width: 100px"
                  />
                  <span class="rate-unit">%</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="自定义通道" width="100">
              <template #default="scope">
                <el-tag v-if="scope.row.customOption" type="success" size="small">已开启</el-tag>
                <el-tag v-else type="info" size="small">未开启</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button type="primary" link size="small" @click="handleCustomChannel(scope.row)">
                  自定义通道
                </el-button>
                <el-button type="danger" link size="small" @click="removeConfiguredProduct(scope.$index)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 空数据提示 -->
          <el-empty v-if="productConfigForm.productRates.length === 0" description="暂无配置产品" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="productConfigVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProductConfig">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 自定义通道配置弹窗 -->
    <el-drawer
      :title="'自定义通道配置 - ' + currentEditingProduct.productName"
      v-model="showCustomSection"
      direction="rtl"
      size="650px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form label-width="100px" style="padding: 20px;">
        <el-form-item label="自定义通道">
          <el-switch 
            v-model="currentEditingProduct.customOption" 
            active-text="启用"
            inactive-text="禁用"
          />
          <div class="form-tip">启用后可以自定义选择供应商通道</div>
        </el-form-item>
        
        <el-form-item label="供应商通道" v-if="currentEditingProduct.customOption">
          <el-select 
            v-model="currentEditingProduct.selectedChannels" 
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择供应商通道"
            style="width: 100%"
          >
            <el-option 
              v-for="item in supplierChannels" 
              :key="item.id" 
              :label="'渠道' + item.channelCode + ' | ' + item.channelName + ' | ' + item.rate + '%'" 
              :value="item.id" 
            />
          </el-select>
          <div class="form-tip">可以选择多个供应商通道</div>
        </el-form-item>
        
        <!-- 已选择的通道表格 -->
        <el-form-item v-if="currentEditingProduct.customOption && currentEditingProduct.selectedChannels.length > 0" label="已选择的通道">
          <!-- 轮询方式选择 -->
          <div class="polling-option" style="margin-bottom: 12px;">
            <el-radio-group v-model="currentEditingProduct.routingMode" size="small">
              <el-radio label="polling">轮询</el-radio>
              <el-radio label="weight">权重</el-radio>
            </el-radio-group>
            <div class="form-tip" style="margin-top: 4px;">
              轮询模式: 按顺序依次调用通道; 权重模式: 按权重比例随机调用通道
            </div>
          </div>
          
          <el-table :data="getSelectedChannelsDataForProduct(currentEditingProduct)" border style="width: 100%;">
            <el-table-column prop="channelName" label="通道名称" min-width="160">
              <template #default="scope">
                <span>渠道{{ scope.row.channelCode }} | {{ scope.row.channelName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="channelCode" label="通道编码" width="80" />
            <el-table-column prop="rate" label="通道成本" width="100">
              <template #default="scope">
                <span>{{ scope.row.rate }}%</span>
              </template>
            </el-table-column>
            <el-table-column label="权重" width="150">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.weight" 
                  :disabled="currentEditingProduct.routingMode === 'polling'"
                  :precision="0" 
                  :step="1" 
                  :min="1" 
                  :max="100"
                  size="small"
                  controls-position="right"
                  style="width: 100px"
                  @change="(val) => updateChannelWeightForProduct(currentEditingProduct, scope.row.id, val)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  link 
                  size="small" 
                  @click="removeSelectedChannelForProduct(currentEditingProduct, scope.row.id)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      
      <div style="padding: 0 20px 20px; position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: end;">
        <el-button @click="cancelCustomChannel">取消</el-button>
        <el-button type="primary" @click="confirmCustomChannel">确认</el-button>
      </div>
    </el-drawer>

    <!-- 新增产品对话框 -->
    <el-dialog
      title="新增支付产品"
      v-model="addProductDialogVisible"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="addProductFormRef"
        :model="addProductForm"
        label-width="100px"
      >
        <el-form-item label="支付产品" prop="selectedProduct">
          <el-select 
            v-model="addProductForm.selectedProduct" 
            placeholder="请选择支付产品"
            style="width: 100%"
            filterable
            multiple
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option 
              v-for="item in availablePaymentProducts" 
              :key="item.id" 
              :label="item.productName" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addProductDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddProduct">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 余额操作弹窗 -->
    <el-dialog
      title="余额操作"
      v-model="balanceOperationVisible"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="balanceFormRef"
        :model="balanceForm"
        :rules="balanceRules"
        label-width="100px"
      >
        <el-form-item label="商户账号">
          <el-input v-model="balanceForm.productId" disabled />
        </el-form-item>
        <el-form-item label="商户名称">
          <el-input v-model="balanceForm.productName" disabled />
        </el-form-item>
        <el-form-item label="当前余额">
          <el-input v-model="balanceForm.currentBalance" disabled>
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="操作类型" prop="operationType">
          <el-radio-group v-model="balanceForm.operationType">
            <el-radio label="add">增加余额</el-radio>
            <el-radio label="subtract">减少余额</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作金额" prop="amount">
          <el-input-number 
            v-model="balanceForm.amount" 
            :precision="2" 
            :min="0"
            :max="999999999"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="balanceForm.remark" 
            type="textarea" 
            :rows="3"
            placeholder="请输入操作备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="balanceOperationVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBalanceOperation">确认</el-button>
        </div>
      </template>
    </el-dialog>


    <!-- 商户组配置对话框 -->
    <el-dialog
      title="商户组配置"
      v-model="merchantGroupVisible"
      width="800px"
      destroy-on-close
      class="merchant-group-dialog"
    >
      <div class="merchant-group-container" style="display: flex; height: 500px; border: 1px solid #dcdfe6; border-radius: 4px;">
        <!-- 左侧：商户组列表 -->
        <div class="group-list-panel" style="width: 250px; border-right: 1px solid #dcdfe6; display: flex; flex-direction: column;">
          <div class="panel-header" style="padding: 10px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold;">商户组列表</span>
            <el-button type="primary" link size="small" :icon="Plus" @click="handleAddGroup">新增</el-button>
          </div>
          <div class="group-list" style="flex: 1; overflow-y: auto; padding: 10px;">
            <div 
              v-for="(group, index) in localMerchantGroups" 
              :key="group.id"
              class="group-item"
              :class="{ active: currentGroup && currentGroup.id === group.id }"
              style="padding: 8px 10px; cursor: pointer; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;"
              @click="handleSelectGroup(group)"
            >
              <span class="group-name" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ group.groupName }}</span>
              <el-icon 
                class="delete-icon" 
                @click.stop="handleDeleteGroup(index)"
                style="color: #f56c6c; display: none;"
              ><Delete /></el-icon>
            </div>
            <div v-if="localMerchantGroups.length === 0" style="text-align: center; color: #909399; margin-top: 20px;">
              暂无商户组
            </div>
          </div>
        </div>

        <!-- 右侧：组配置详情 -->
        <div class="group-detail-panel" style="flex: 1; padding: 20px; display: flex; flex-direction: column;" v-if="currentGroup">
          <el-form label-width="80px">
            <el-form-item label="组名称">
              <el-input v-model="currentGroup.groupName" placeholder="请输入商户组名称" />
            </el-form-item>
            <el-form-item label="包含商户">
               <el-select
                v-model="currentGroup.merchantIds"
                multiple
                filterable
                placeholder="请选择商户"
                style="width: 100%"
                collapse-tags
                collapse-tags-tooltip
              >
                <el-option
                  v-for="item in productList"
                  :key="item.id"
                  :label="item.productName"
                  :value="item.id"
                />
              </el-select>
              <div class="form-tip" style="margin-top: 5px; color: #909399; font-size: 12px;">
                已选择 {{ currentGroup.merchantIds.length }} 个商户
              </div>
            </el-form-item>
          </el-form>
          
          <div class="selected-merchants-preview" style="flex: 1; margin-top: 10px; border: 1px solid #ebeef5; border-radius: 4px; padding: 10px; overflow-y: auto;">
            <div style="margin-bottom: 10px; font-weight: bold; color: #606266;">已选商户预览：</div>
            <el-tag
              v-for="mid in currentGroup.merchantIds"
              :key="mid"
              class="merchant-preview-tag"
              closable
              style="margin-right: 5px; margin-bottom: 5px;"
              @close="removeMerchantFromGroup(mid)"
            >
              {{ getMerchantName(mid) }}
            </el-tag>
            <div v-if="currentGroup.merchantIds.length === 0" style="color: #909399; text-align: center; margin-top: 20px;">
              未选择任何商户
            </div>
          </div>
        </div>
        <div class="empty-selection" v-else style="flex: 1; display: flex; justify-content: center; align-items: center; color: #909399;">
          请选择或创建一个商户组
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="merchantGroupVisible = false">关闭</el-button>
          <el-button type="primary" @click="saveMerchantGroups">保存配置</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { Search, Refresh, Plus, Delete, Setting, ArrowDown, Download, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productList } from '@/data/productData'
import { merchantProductList } from '@/data/merchantProductData'
import { useRouter } from 'vue-router'
import { formatAmount } from '@/utils/formatUtils'
import { generateMerchantNo, generateApiKey, generatePassword } from '@/utils/generatorUtils'
import { paymentProducts, supplierChannels } from '@/data/productRelatedData'
import { merchantGroupList } from '@/data/merchantGroupData'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  id: '',
  productId: '',
  productName: '',
  productNo: '',
  walletAddress: '',
  verified: '',
  googleAuth: '',
  enableDeposit: '',
  callbackMode: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取数据
const fetchData = () => {
  loading.value = true
  console.log('正在加载商户列表数据...', searchForm)

  try {
    // 模拟异步请求和前端分页、筛选
    setTimeout(() => {
      let filteredData = [...productList] // 使用导入的模拟商户列表数据
      
      // 执行前端筛选逻辑
      if (searchForm.id) {
        filteredData = filteredData.filter(item => 
          item.id.toString().includes(searchForm.id))
      }
      
      if (searchForm.productId) {
        filteredData = filteredData.filter(item => 
          item.productId && item.productId.toLowerCase().includes(searchForm.productId.toLowerCase()))
      }
      
      if (searchForm.productName) {
        filteredData = filteredData.filter(item => 
          item.productName.toLowerCase().includes(searchForm.productName.toLowerCase()))
      }
      
      if (searchForm.productNo) {
        filteredData = filteredData.filter(item => 
          item.productNo.toLowerCase().includes(searchForm.productNo.toLowerCase()))
      }
      if (searchForm.walletAddress) {
        filteredData = filteredData.filter(item =>
          item.walletAddress && item.walletAddress.toLowerCase().includes(searchForm.walletAddress.toLowerCase()))
      }
      
      if (searchForm.verified) {
        filteredData = filteredData.filter(item => 
          item.verified === searchForm.verified)
      }
      
      if (searchForm.googleAuth !== '') {
        const isGoogleAuth = searchForm.googleAuth === true || searchForm.googleAuth === 'true'
        filteredData = filteredData.filter(item => 
          item.googleAuth === isGoogleAuth)
      }
      
      if (searchForm.enableDeposit !== '') {
        const isEnableDeposit = searchForm.enableDeposit === true || searchForm.enableDeposit === 'true'
        filteredData = filteredData.filter(item => 
          item.enableDeposit === isEnableDeposit)
      }

      if (searchForm.callbackMode) {
        filteredData = filteredData.filter(item => 
          (item.callbackMode || 'form') === searchForm.callbackMode)
      }
      
      total.value = filteredData.length
      
// 商户组配置相关
const merchantGroupVisible = ref(false)
const localMerchantGroups = ref([])
const currentGroup = ref(null)

// 打开商户组配置
const openMerchantGroupConfig = () => {
  // 深拷贝数据，避免直接修改源数据
  localMerchantGroups.value = JSON.parse(JSON.stringify(merchantGroupList))
  merchantGroupVisible.value = true
  if (localMerchantGroups.value.length > 0) {
    currentGroup.value = localMerchantGroups.value[0]
  } else {
    currentGroup.value = null
  }
}

// 新增商户组
const handleAddGroup = () => {
  const newGroup = {
    id: Date.now(), // 临时ID
    groupName: '新商户组',
    merchantIds: []
  }
  localMerchantGroups.value.push(newGroup)
  currentGroup.value = newGroup
}

// 选择商户组
const handleSelectGroup = (group) => {
  currentGroup.value = group
}

// 删除商户组
const handleDeleteGroup = (index) => {
  ElMessageBox.confirm(
    '确定要删除该商户组吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    if (currentGroup.value && localMerchantGroups.value[index].id === currentGroup.value.id) {
      currentGroup.value = null
    }
    localMerchantGroups.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 从当前组移除商户
const removeMerchantFromGroup = (merchantId) => {
  if (currentGroup.value) {
    currentGroup.value.merchantIds = currentGroup.value.merchantIds.filter(id => id !== merchantId)
  }
}

// 获取商户名称
const getMerchantName = (merchantId) => {
  const merchant = productList.find(m => m.id === merchantId)
  return merchant ? merchant.productName : `Unknown(${merchantId})`
}

// 保存商户组配置
const saveMerchantGroups = () => {
  // 这里应该调用API保存，目前仅更新本地模拟数据
  // 实际项目中应替换为真实API调用
  
  // 更新源数据（模拟保存）
  merchantGroupList.length = 0
  merchantGroupList.push(...JSON.parse(JSON.stringify(localMerchantGroups.value)))
  
  ElMessage.success('保存成功')
  merchantGroupVisible.value = false
}
      
      // 分页处理
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      
      tableData.value = filteredData.slice(start, end)
      loading.value = false
      console.log('商户列表数据加载成功', tableData.value.length)
    }, 300)
  } catch (error) {
    console.error('加载商户列表数据失败:', error)
    ElMessage.error('数据加载失败，请重试')
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  console.log('搜索按钮被点击', JSON.stringify(searchForm))
  ElMessage.success('正在查询数据...')
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  // 重置搜索表单
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  fetchData()
}

// 表格选择
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

// 添加/编辑商户相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增商户')
const productFormRef = ref(null)
const productForm = reactive({
  id: '',
  productNo: '',
  productName: '',
  productId: '',
  password: '',
  walletAddress: '',
  verified: 'N',
  subAccounts: [],
  enableDeposit: true,
  callbackMode: 'form'
})

const productRules = {
  productId: [{ required: true, message: '请输入商户账号', trigger: 'blur' }],
  productName: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
  productNo: [{ required: true, message: '请输入商户号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入商户后台密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        // 对于编辑情况，如果保留了占位符密码"********"，则认为是有效的
        if (dialogTitle.value === '编辑商户' && value === '********') {
          callback()
        } else {
          callback()
        }
      }
    }
  ]
}

// 产品配置
const productConfigVisible = ref(false)
const productConfigFormRef = ref(null)
const productConfigForm = reactive({
  merchantId: '',
  productId: '',
  productNo: '',
  productName: '',
  selectedProduct: '',
  productCode: '',
  merchantRate: 3.00,
  batchRate: 3.00,
  productRates: [],
  customOption: false,
  selectedChannels: [],
  routingMode: 'polling',
  channelsWeightMap: {} // 通道权重映射，格式为: {channelId: weight}
})

// 新增产品相关
const addProductDialogVisible = ref(false)
const addProductFormRef = ref(null)
const addProductForm = reactive({
  selectedProduct: '',
  merchantRate: 3.00
})

// 自定义通道相关
const showCustomSection = ref(false)
const currentEditingProduct = reactive({
  productId: '',
  productName: '',
  productCode: '',
  rate: 0,
  customOption: false,
  selectedChannels: [],
  routingMode: 'polling',
  channelsWeightMap: {},
  originalIndex: -1  // 用于记录正在编辑的产品在productRates中的索引
})

// 获取可选的产品列表（排除已选的）
const availablePaymentProducts = computed(() => {
  // 获取已经选择的产品ID列表
  const selectedProductIds = productConfigForm.productRates.map(item => item.productId)
  // 过滤出未选择的产品
  return paymentProducts.filter(product => !selectedProductIds.includes(product.id))
})

// 显示新增产品对话框
const showAddProductDialog = () => {
  addProductForm.selectedProduct = ''
  addProductForm.merchantRate = 3.00
  addProductDialogVisible.value = true
}

// 确认新增产品
const confirmAddProduct = () => {
  if (!addProductForm.selectedProduct || addProductForm.selectedProduct.length === 0) {
    ElMessage.warning('请选择支付产品')
    return
  }
  
  // 支持批量添加
  addProductForm.selectedProduct.forEach(productId => {
    const selectedProduct = paymentProducts.find(p => p.id === productId)
    if (selectedProduct) {
      // 生成四位随机数作为产品编码
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString()
      
      // 添加到产品列表
      productConfigForm.productRates.push({
        productId: productId,
        productName: selectedProduct.productName,
        productCode: randomCode,
        rate: selectedProduct.rate || 3.00, // 默认带入产品的rate
        customOption: false,
        selectedChannels: [],
        routingMode: 'polling',
        channelsWeightMap: {}
      })
    }
  })
  
  addProductDialogVisible.value = false
  ElMessage.success('添加产品成功')
}

// 删除已配置产品
const removeConfiguredProduct = (index) => {
  ElMessageBox.confirm('确定要移除此产品配置吗?', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    productConfigForm.productRates.splice(index, 1)
    ElMessage.success('已移除产品配置')
  }).catch(() => {})
}

// 处理自定义通道
const handleCustomChannel = (product) => {
  const index = productConfigForm.productRates.findIndex(item => 
    item.productId === product.productId && item.productCode === product.productCode
  )
  
  if (index !== -1) {
    Object.assign(currentEditingProduct, JSON.parse(JSON.stringify(product)))
    currentEditingProduct.originalIndex = index
    
    currentEditingProduct.customOption = true 
    console.log('In handleCustomChannel, after setting customOption:', 
                currentEditingProduct.customOption, 
                JSON.parse(JSON.stringify(currentEditingProduct)));
    
    if (!currentEditingProduct.channelsWeightMap) {
      currentEditingProduct.channelsWeightMap = {}
    }
    if (!currentEditingProduct.selectedChannels) {
      currentEditingProduct.selectedChannels = []
    }
    if (!currentEditingProduct.routingMode) {
      currentEditingProduct.routingMode = 'polling'
    }
    
    showCustomSection.value = true
  }
}

// 获取特定产品的已选通道数据
const getSelectedChannelsDataForProduct = (product) => {
  if (!product.selectedChannels || product.selectedChannels.length === 0) {
    return []
  }
  
  // 从产品的channelsWeightMap获取权重或使用默认值10
  return supplierChannels.filter(item => 
    product.selectedChannels.includes(item.id)
  ).map(channel => ({
    ...channel,
    weight: product.channelsWeightMap[channel.id] || 10
  }))
}

// 更新特定产品的通道权重
const updateChannelWeightForProduct = (product, channelId, weight) => {
  if (!product.channelsWeightMap) {
    product.channelsWeightMap = {}
  }
  product.channelsWeightMap[channelId] = weight
}

// 移除特定产品的已选通道
const removeSelectedChannelForProduct = (product, channelId) => {
  if (product.selectedChannels) {
    const index = product.selectedChannels.indexOf(channelId)
    if (index !== -1) {
      product.selectedChannels.splice(index, 1)
    }
    
    // 同时移除权重映射中的数据
    if (product.channelsWeightMap && product.channelsWeightMap[channelId]) {
      delete product.channelsWeightMap[channelId]
    }
  }
}

// 返回产品列表
const backToProductList = () => {
  // 自动保存当前编辑的产品配置
  if (currentEditingProduct.originalIndex >= 0) {
    // 更新原产品数据
    const updatedProduct = JSON.parse(JSON.stringify(currentEditingProduct))
    delete updatedProduct.originalIndex // 删除辅助字段，不需要保存
    
    productConfigForm.productRates[currentEditingProduct.originalIndex] = updatedProduct
    ElMessage.success('通道配置已保存')
  }
  
  // 隐藏自定义通道部分
  showCustomSection.value = false
  currentEditingProduct.originalIndex = -1
}

// 取消自定义通道配置
const cancelCustomChannel = () => {
  showCustomSection.value = false
  currentEditingProduct.originalIndex = -1
}

// 确认自定义通道配置
const confirmCustomChannel = () => {
  if (currentEditingProduct.originalIndex >= 0) {
    // 更新原产品数据
    const updatedProduct = JSON.parse(JSON.stringify(currentEditingProduct))
    delete updatedProduct.originalIndex // 删除辅助字段，不需要保存
    
    productConfigForm.productRates[currentEditingProduct.originalIndex] = updatedProduct
    ElMessage.success('通道配置已更新')
  }
  
  showCustomSection.value = false
  currentEditingProduct.originalIndex = -1
}

// 提交批量配置
const submitBatchConfig = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择至少一个商户')
    return
  }
  
  if (batchConfigForm.productRates.length === 0) {
    ElMessage.warning('请选择至少一个支付产品')
    return
  }
  
  // 构造提交数据
  const submitData = {
    merchantIds: selectedRows.value.map(row => row.id),
    configMode: batchConfigForm.configMode,
    products: batchConfigForm.productRates.map(item => ({
      productId: item.productId,
      productName: item.productName,
      productCode: item.productCode,
      rate: item.rate
    }))
  }
  
  console.log('提交的批量配置数据:', submitData)
  
  // 模拟后端处理逻辑
  selectedRows.value.forEach(merchant => {
    // 覆盖模式：先删除该商户的所有产品
    if (batchConfigForm.configMode === 'overwrite') {
      const indicesToRemove = []
      merchantProductList.forEach((item, index) => {
        if (item.merchantNo === merchant.productNo || item.merchantName === merchant.productName) {
          indicesToRemove.push(index)
        }
      })
      // 从后往前删，避免索引偏移
      for (let i = indicesToRemove.length - 1; i >= 0; i--) {
        merchantProductList.splice(indicesToRemove[i], 1)
      }
    }
    
    // 添加新配置
    batchConfigForm.productRates.forEach(newProduct => {
      // 检查是否已存在（仅追加模式需要检查，覆盖模式已清空必定不存在）
      const exists = merchantProductList.find(item => 
        (item.merchantNo === merchant.productNo || item.merchantName === merchant.productName) &&
        item.productName === newProduct.productName
      )
      
      if (!exists) {
        // 生成新的ID
        const newId = Math.max(...merchantProductList.map(m => m.id), 0) + 1 + Math.floor(Math.random() * 1000)
        
        merchantProductList.push({
          id: newId,
          merchantNo: merchant.productNo,
          merchantName: merchant.productName,
          productName: newProduct.productName,
          productCode: newProduct.productCode, // 注意：批量配置时所有商户使用相同的产品代码，可能需要改为随机生成
          rate: newProduct.rate,
           weight: 10,
          remark: '批量配置',
          customOption: false,
          selectedChannels: []
        })
      }
    })
  })
  
  // 模拟提交成功
  setTimeout(() => {
    ElMessage.success('批量配置保存成功')
    batchConfigVisible.value = false
    // 刷新表格
    fetchData()
  }, 500)
}

// 处理下拉菜单操作
const handleCommand = (command, row) => {
  switch (command) {
    case 'config':
      handleConfig(row)
      break
    case 'edit':
      handleEdit(row)
      break
    case 'resetGoogle':
      handleResetGoogle(row)
      break
    case 'resetApiKey':
      handleResetApiKey(row)
      break
    case 'balance':
      handleBalance(row)
      break
    default:
      break
  }
}

// 配置商户
const handleConfig = (row) => {
  productConfigForm.merchantId = row.id
  productConfigForm.productId = row.productId
  productConfigForm.productNo = row.productNo
  productConfigForm.productName = row.productName
  
  // 清空产品配置相关的数据
  productConfigForm.productRates = []
  
  // 重置自定义通道相关状态
  showCustomSection.value = false
  Object.keys(currentEditingProduct).forEach(key => {
    if (key === 'customOption' || key === 'routingMode') {
      currentEditingProduct[key] = 'polling'
    } else if (key === 'selectedChannels') {
      currentEditingProduct[key] = []
    } else if (key === 'channelsWeightMap') {
      currentEditingProduct[key] = {}
    } else if (key === 'originalIndex') {
      currentEditingProduct[key] = -1
    } else {
      currentEditingProduct[key] = ''
    }
  })
  
  // 获取商户已关联的产品
  const existingProducts = merchantProductList.filter(item => 
    item.merchantNo === row.productNo || item.merchantName === row.productName
  )
  
  if (existingProducts.length > 0) {
    // 加载所有关联产品
    existingProducts.forEach(product => {
      const productData = {
        productId: '',
        productName: product.productName,
        productCode: '',
        rate: product.rate || 3.00,
        customOption: false,
        selectedChannels: [],
        routingMode: product.routingMode || 'polling',
        channelsWeightMap: {}
      }
      
      // 检查编码格式，如果不是"1111"格式则生成新编码
      if (!/^\d{4}$/.test(product.productCode)) {
        const randomCode = Math.floor(1000 + Math.random() * 9000).toString()
        productData.productCode = randomCode
      } else {
        productData.productCode = product.productCode
      }
      
      // 判断是标准产品还是自定义产品
      if (product.productName.startsWith('自定义-')) {
        // 自定义产品
        productData.customOption = true
        const channelName = product.productName.replace('自定义-', '')
        const channel = supplierChannels.find(c => c.channelName === channelName)
        
        if (channel) {
          productData.selectedChannels = [channel.id]
          
          // 设置通道权重
          if (product.weight) {
            productData.channelsWeightMap[channel.id] = product.weight
          }
        }
      } else {
        // 标准产品
        const paymentProduct = paymentProducts.find(p => p.productName === product.productName)
        if (paymentProduct) {
          productData.productId = paymentProduct.id
        }
      }
      
      // 添加到产品列表
      productConfigForm.productRates.push(productData)
    })
  }
  
  productConfigVisible.value = true
}

// 获取已选择通道数据
const getSelectedChannelsData = () => {
  if (!productConfigForm.selectedChannels || productConfigForm.selectedChannels.length === 0) {
    return [];
  }
  
  // 从channelsWeightMap获取权重或使用默认值10
  return supplierChannels.filter(item => 
    productConfigForm.selectedChannels.includes(item.id)
  ).map(channel => ({
    ...channel,
    weight: productConfigForm.channelsWeightMap[channel.id] || 10
  }));
}

// 监听自定义选项变化
watch(() => productConfigForm.customOption, (newVal) => {
  if (newVal) {
    // 启用自定义通道时，不清空已选产品，只初始化通道列表（如果为空）
    productConfigForm.selectedChannels = productConfigForm.selectedChannels || [];
  } else {
    // 禁用自定义通道时，清空已选通道
    productConfigForm.selectedChannels = [];
  }
})

// 监听支付产品变化
watch(() => productConfigForm.selectedProduct, (newVal) => {
  if (newVal && !productConfigForm.customOption) {
    // 选择了标准支付产品时
    const selectedProduct = paymentProducts.find(p => p.id === newVal)
    if (selectedProduct) {
      // 自动设置产品编码为"1111"格式
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString()
      productConfigForm.productCode = randomCode
      
      // 为所选产品添加到费率列表中
      if (!productConfigForm.productRates.some(item => item.productId === newVal)) {
        productConfigForm.productRates = [{
          productId: newVal,
          productName: selectedProduct.productName,
          productCode: productConfigForm.productCode,
          rate: productConfigForm.merchantRate,
          weight: 10
        }]
      }
    }
  }
})

// 监听自定义通道选择
watch(() => productConfigForm.selectedChannels, (newVal) => {
  // 只记录选择的通道，不对productRates做任何修改
  // 保持支付产品和编码不变
}, { deep: true })

// 监听商户费率变化
watch(() => productConfigForm.merchantRate, (newVal) => {
  // 当直接更改商户费率时，如果已选产品或通道，则更新费率表中的费率值
  if (productConfigForm.productRates.length === 1) {
    productConfigForm.productRates[0].rate = newVal;
  }
})

// 批量设置费率
const applyBatchRate = () => {
  productConfigForm.productRates.forEach(item => {
    item.rate = productConfigForm.batchRate
  })
  ElMessage.success('已应用批量费率')
}

// 删除产品配置
const removeProductRate = (productId) => {
  const index = productConfigForm.productRates.findIndex(item => item.productId === productId)
  if (index !== -1) {
    productConfigForm.productRates.splice(index, 1)
  }
}

// 获取子账户名称
const getSubAccountName = (id) => {
  const account = productList.find(item => item.id === id)
  return account ? `${account.productName} (${account.id})` : `未知账户(${id})`
}

// 更新通道权重
const updateChannelWeight = (channelId, weight) => {
  productConfigForm.channelsWeightMap[channelId] = weight
}

// 移除已选通道
const removeSelectedChannel = (channelId) => {
  const index = productConfigForm.selectedChannels.indexOf(channelId)
  if (index !== -1) {
    productConfigForm.selectedChannels.splice(index, 1)
  }
}

// 提交产品配置
const submitProductConfig = () => {
  if (productConfigForm.productRates.length === 0) {
    ElMessage.warning('请至少配置一个支付产品')
    return
  }

  // 检查每个产品的配置是否完整
  for (const product of productConfigForm.productRates) {
    if (product.customOption && (!product.selectedChannels || product.selectedChannels.length === 0)) {
      ElMessage.warning(`产品"${product.productName}"已启用自定义通道，但未选择任何供应商通道`)
      return
    }
  }
  
  // 构造提交数据
  const submitData = {
    merchantId: productConfigForm.merchantId,
    merchantName: productConfigForm.productName,
    productConfigs: productConfigForm.productRates.map(product => {
      const productConfig = {
        productId: product.productId,
        productName: product.productName,
        productCode: product.productCode,
        merchantRate: product.rate
      }
      
      // 如果启用了自定义通道
      if (product.customOption) {
        productConfig.customOption = true
        productConfig.selectedChannels = product.selectedChannels
        productConfig.routingMode = product.routingMode
        productConfig.channelsWeightMap = product.channelsWeightMap
      }
      
      return productConfig
    })
  }
  
  console.log('提交的产品配置数据:', submitData)
  
  // 这里应该是调用API保存数据
  // saveProductConfig(submitData)
  
  // 模拟提交成功
  setTimeout(() => {
    ElMessage.success('产品配置保存成功 (模拟操作)')
    productConfigVisible.value = false
    // 刷新表格
    fetchData()
  }, 500)
}

// 批量配置相关
const batchConfigVisible = ref(false)
const batchConfigFormRef = ref(null)
const batchConfigForm = reactive({
  selectedProduct: [],
  productRates: [],
  rate: 3.00,
  configMode: 'append'
})

// 批量设置费率
const applyBatchConfigRate = () => {
  batchConfigForm.productRates.forEach(item => {
    item.rate = batchConfigForm.rate
  })
  ElMessage.success('已应用批量费率')
}

// 删除批量配置产品
const removeBatchProductRate = (productId) => {
  const index = batchConfigForm.productRates.findIndex(item => item.productId === productId)
  if (index !== -1) {
    batchConfigForm.productRates.splice(index, 1)
  }
}

// 处理批量配置
const handleBatchConfig = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要批量配置的商户')
    return
  }
  
  batchConfigForm.selectedProduct = []
  batchConfigForm.productRates = []
  batchConfigForm.rate = 3.00
  batchConfigForm.configMode = 'append'
  
  batchConfigVisible.value = true
}

// 监听批量配置中的支付产品选择
watch(() => batchConfigForm.selectedProduct, (newVal, oldVal) => {
  if (newVal && newVal.length) {
    // 找出新增的产品ID
    const addedProductIds = oldVal ? newVal.filter(id => !oldVal.includes(id)) : newVal;
    
    // 为新增的产品添加到费率列表
    addedProductIds.forEach(productId => {
      const selectedProduct = paymentProducts.find(p => p.id === productId);
      if (selectedProduct && !batchConfigForm.productRates.some(item => item.productId === productId)) {
        // 生成四位随机数作为产品编码
        const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
        
        batchConfigForm.productRates.push({
          productId: productId,
          productName: selectedProduct.productName,
          productCode: randomCode,
          rate: batchConfigForm.rate
        });
      }
    });
    
    // 处理被移除的产品
    if (oldVal) {
      const removedProductIds = oldVal.filter(id => !newVal.includes(id));
      removedProductIds.forEach(productId => {
        const index = batchConfigForm.productRates.findIndex(item => item.productId === productId);
        if (index !== -1) {
          batchConfigForm.productRates.splice(index, 1);
        }
      });
    }
  } else if (newVal && newVal.length === 0) {
    // 清空所有产品
    batchConfigForm.productRates = [];
  }
}, { deep: true })

// 余额操作相关
const balanceOperationVisible = ref(false)
const balanceFormRef = ref(null)
const balanceForm = reactive({
  id: '',
  productId: '',
  productName: '',
  currentBalance: '0.00',
  operationType: 'add',
  amount: 0,
  remark: ''
})

const balanceRules = {
  operationType: [{ required: true, message: '请选择操作类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入操作金额', trigger: 'blur' }],
  remark: [{ required: true, message: '请输入操作备注', trigger: 'blur' }]
}

// 处理余额操作
const handleBalance = (row) => {
  balanceForm.id = row.id
  balanceForm.productId = row.productId
  balanceForm.productName = row.productName
  balanceForm.currentBalance = formatAmount(row.balance)
  balanceForm.operationType = 'add'
  balanceForm.amount = 0
  balanceForm.remark = ''
  
  balanceOperationVisible.value = true
}

// 提交余额操作
const submitBalanceOperation = () => {
  balanceFormRef.value.validate((valid) => {
    if (valid) {
      // 构造提交数据
      const submitData = {
        id: balanceForm.id,
        operationType: balanceForm.operationType,
        amount: balanceForm.amount,
        remark: balanceForm.remark
      }
      
      console.log('提交的余额操作数据:', submitData)
      
      // 这里应该是调用API保存数据
      // saveBalanceOperation(submitData)
      
      // 模拟提交成功
      setTimeout(() => {
        ElMessage.success('余额操作成功 (模拟操作)')
        balanceOperationVisible.value = false
        // 刷新表格
        fetchData()
      }, 500)
    }
  })
}

// 商户相关处理函数
const handleAdd = () => {
  dialogTitle.value = '新增商户'
  resetForm()
  // 自动生成商户号和API密钥
  productForm.productNo = generateMerchantNo()
  productForm.apiKey = generateApiKey()
  // 自动生成随机密码
  productForm.password = generatePassword()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  resetForm()
  dialogTitle.value = '编辑商户'
  // 填充表单
  Object.keys(productForm).forEach(key => {
    if (key in row) {
      productForm[key] = row[key]
    }
  })
  
  // 设置一个默认密码（在实际场景中，这里应该是从后端获取的已加密密码）
  if (!productForm.password) {
    productForm.password = row.password || '********' // 使用已有密码或显示占位符
  }
  
  dialogVisible.value = true
}

// 提交商户表单
const submitForm = () => {
  productFormRef.value.validate((valid) => {
    if (valid) {
      // 创建提交的数据对象
      const submitData = { ...productForm }
      
      // 如果是编辑模式且密码为占位符，则不提交密码字段
      if (dialogTitle.value === '编辑商户' && submitData.password === '********') {
        delete submitData.password
      }
      
      console.log('正在提交商户数据:', submitData)
      
      // 这里应该是调用API保存数据
      // saveProduct(submitData)
      
      // 模拟提交成功
      setTimeout(() => {
        ElMessage.success((dialogTitle.value === '新增商户' ? '商户添加成功' : '商户编辑成功') + ' (模拟操作)')
        dialogVisible.value = false
        // 刷新表格
        fetchData()
      }, 500)
    }
  })
}

// 处理状态变更
const handleStatusChange = (row) => {
  const statusText = row.verified === 'Y' ? '启用' : '禁用'
  
  // 这里应该是调用API保存状态
  // updateStatus(row.id, row.verified)
  
  ElMessage.success(`已${statusText}商户: ${row.productName} (模拟操作)`)
}

// 重置谷歌认证
const handleResetGoogle = (row) => {
  ElMessageBox.confirm(`确定要重置商户 ${row.productName} 的谷歌认证吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里应该是调用API重置谷歌认证
    // resetGoogleAuth(row.id)
    
    // 模拟操作成功
    setTimeout(() => {
      ElMessage.success('谷歌认证重置成功 (模拟操作)')
      // 刷新表格
      fetchData()
    }, 500)
  }).catch(() => {})
}

// 重置API密钥
const handleResetApiKey = (row) => {
  ElMessageBox.confirm(`确定要重置商户 ${row.productName} 的API密钥吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const newApiKey = generateApiKey()
    
    // 这里应该是调用API重置API密钥
    // resetApiKey(row.id, newApiKey)
    
    // 模拟操作成功
    setTimeout(() => {
      ElMessage.success(`API密钥重置成功: ${newApiKey} (模拟操作)`)
      // 刷新表格
      fetchData()
    }, 500)
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的商户')
    return
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个商户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = selectedRows.value.map(row => row.id)
    
    // 这里应该是调用API批量删除
    // batchDelete(ids)
    
    // 模拟操作成功
    setTimeout(() => {
      ElMessage.success('批量删除成功 (模拟操作)')
      // 刷新表格
      fetchData()
    }, 500)
  }).catch(() => {})
}

// 导出数据
const handleExport = () => {
  ElMessage.success('正在导出数据，请稍候... (模拟操作)')
  
  // 这里应该是调用API导出数据
  // exportData(searchForm)
  
  // 模拟操作成功
  setTimeout(() => {
    ElMessage.success('数据导出成功 (模拟操作)')
  }, 1500)
}

// 模拟获取商户登录 Token
const getMerchantLoginToken = async (merchantId) => {
  // 实际场景中，这里应该调用后端API获取真实的Token
  console.log(`尝试为商户 ${merchantId} 获取登录Token... (模拟)`)
  return new Promise(resolve => {
    setTimeout(() => {
      const token = `fake-token-for-${merchantId}-${Date.now()}`
      console.log(`为商户 ${merchantId} 生成Token: ${token}`)
      resolve(token)
    }, 200)
  })
}

// 一键登录处理
const handleQuickLogin = async (row) => {
  console.log('尝试快速登录:', row)
  const merchantId = row.id

  // 不再区分多商户和单商户，统一使用单商户登录逻辑
  console.log(`商户ID ${merchantId} 执行登录逻辑...`)
  try {
    const token = await getMerchantLoginToken(merchantId)
    if (token) {
      // 统一使用单商户后台入口
      const loginUrl = router.resolve({
        path: '/merchant/dashboard', 
        query: { merchant: String(merchantId), token: token, ts: Date.now() } // 添加时间戳防止缓存
      }).href
      
      console.log('商户登录URL:', loginUrl)
      // 为了方便本地开发和HMR，使用当前页跳转
      router.push({ 
        path: '/merchant/dashboard', 
        query: { merchant: String(merchantId), token: token, ts: Date.now() }
      });
      ElMessage.success(`正在为商户 ${row.productName} (ID: ${merchantId}) 打开商户后台...`)
    } else {
      ElMessage.error('获取登录凭证失败，无法登录。')
    }
  } catch (error) {
    console.error('商户登录过程中发生错误:', error)
    ElMessage.error('登录失败，请稍后重试。')
  }
}

// 获取可选的子账户列表
const availableSubAccounts = computed(() => {
  // 过滤出可选的子账户（不包括当前商户自己）
  return productList.filter(item => item.id !== productForm.id);
});

// 复制密码到剪贴板
const copyPassword = () => {
  navigator.clipboard.writeText(productForm.password)
    .then(() => {
      ElMessage.success('密码已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 重置表单
const resetForm = () => {
  // 清空表单
  Object.keys(productForm).forEach(key => {
    if (key === 'verified') {
      productForm[key] = 'N'
    } else if (key === 'enableDeposit') {
      productForm[key] = true
    } else if (key === 'subAccounts') {
      productForm[key] = []
    } else if (key === 'callbackMode') {
      productForm[key] = 'form'
    } else {
      productForm[key] = ''
    }
  })
}

// 商户组配置相关
const merchantGroupVisible = ref(false)
const localMerchantGroups = ref([])
const currentGroup = ref(null)

// 打开商户组配置
const openMerchantGroupConfig = () => {
  // 深拷贝数据，避免直接修改源数据
  localMerchantGroups.value = JSON.parse(JSON.stringify(merchantGroupList))
  merchantGroupVisible.value = true
  if (localMerchantGroups.value.length > 0) {
    currentGroup.value = localMerchantGroups.value[0]
  } else {
    currentGroup.value = null
  }
}

// 新增商户组
const handleAddGroup = () => {
  const newGroup = {
    id: Date.now(), // 临时ID
    groupName: '新商户组',
    merchantIds: []
  }
  localMerchantGroups.value.push(newGroup)
  currentGroup.value = newGroup
}

// 选择商户组
const handleSelectGroup = (group) => {
  currentGroup.value = group
}

// 删除商户组
const handleDeleteGroup = (index) => {
  ElMessageBox.confirm(
    '确定要删除该商户组吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    if (currentGroup.value && localMerchantGroups.value[index].id === currentGroup.value.id) {
      currentGroup.value = null
    }
    localMerchantGroups.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 从当前组移除商户
const removeMerchantFromGroup = (merchantId) => {
  if (currentGroup.value) {
    currentGroup.value.merchantIds = currentGroup.value.merchantIds.filter(id => id !== merchantId)
  }
}

// 获取商户名称
const getMerchantName = (merchantId) => {
  const merchant = productList.find(m => m.id === merchantId)
  return merchant ? merchant.productName : `Unknown(${merchantId})`
}

// 保存商户组配置
const saveMerchantGroups = () => {
  // 更新源数据（模拟保存）
  merchantGroupList.length = 0
  merchantGroupList.push(...JSON.parse(JSON.stringify(localMerchantGroups.value)))
  
  ElMessage.success('保存成功')
  merchantGroupVisible.value = false
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* 商户列表样式 */
.product-list-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
  display: flex;
  align-items: center;
}

.filter-form :deep(.el-form-item__label) {
  line-height: 32px;
  white-space: nowrap;
  width: auto !important;
  padding-right: 6px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.table-toolbar .left {
  display: flex;
  align-items: center;
}

.table-toolbar .right {
  display: flex;
  align-items: center;
}

.table-toolbar .el-button {
  margin-right: 8px;
}

.table-toolbar .right .el-button {
  margin-right: 0;
  margin-left: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.operation-dropdown {
  cursor: pointer;
  color: var(--el-color-primary);
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
  margin-top: 5px;
}

/* 子账户显示样式 */
.sub-accounts-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.sub-account-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.no-sub-accounts {
  color: #909399;
}

.amount-cell {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #606266;
  letter-spacing: 0.5px;
  display: inline-block;
  min-width: 120px;
  text-align: right;
}

/* 商户标签样式 */
.merchant-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.selected-merchants {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

/* 产品费率相关样式 */
.product-rate-list {
  margin-top: 20px;
}

.batch-rate-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.batch-rate-input {
  display: flex;
  align-items: center;
}

.rate-input-group {
  display: flex;
  align-items: center;
}

.rate-unit {
  margin-left: 5px;
  color: #606266;
}

.product-form .el-form-item {
  margin-bottom: 18px;
}

/* 轮询选项样式 */
.polling-option {
  margin-bottom: 12px;
}

/* 商户组配置样式 */
.merchant-group-container {
  overflow: hidden;
}
.group-list-panel {
  background-color: #fff;
}
.group-list::-webkit-scrollbar {
  width: 6px;
}
.group-list::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}
.group-list .group-item {
  transition: all 0.2s;
}
.group-list .group-item:hover {
  background-color: #f5f7fa;
}
.group-list .group-item.active {
  background-color: #ecf5ff;
  color: #409eff;
}
.group-list .group-item:hover .delete-icon {
  display: block !important;
}

.selected-merchants-preview::-webkit-scrollbar {
  width: 6px;
}
.selected-merchants-preview::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}
</style>
