<!-- 商户管理/商户列表 - 管理商户信息 -->
<template>
  <div class="product-list-container">
    <!-- 搜索表单 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="searchForm" inline class="filter-form">
        <!-- 第一行筛选项 -->
        <div class="filter-row">
          <el-form-item label="商户ID：">
            <el-input v-model="searchForm.id" placeholder="请输入商户ID" style="width: 168px" clearable />
          </el-form-item>
          <el-form-item label="商户账号：">
            <el-input v-model="searchForm.productId" placeholder="请输入商户账号" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="商户名称：">
            <el-input v-model="searchForm.productName" placeholder="请输入商户名称" style="width: 220px" clearable />
          </el-form-item>
          <el-form-item label="商户号：">
            <el-input v-model="searchForm.productNo" placeholder="请输入商户号" style="width: 168px" clearable />
          </el-form-item>
        </div>
        
        <!-- 第二行筛选项 -->
        <div class="filter-row">
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
        </div>
        
        <!-- 按钮区域 -->
        <div class="filter-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增商户</el-button>
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
        <el-table-column prop="balance" label="余额" width="130" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ formatAmount(scope.row.balance) }}</span>
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
        <el-form-item label="密码" prop="password">
          <el-input v-model="productForm.password" type="password" placeholder="不填表示不更新密码" show-password />
        </el-form-item>
        <el-form-item label="商户号" prop="productNo">
          <el-input v-model="productForm.productNo" placeholder="请输入商户号" />
        </el-form-item>
        <el-form-item label="API密钥" prop="apiKey">
          <el-input v-model="productForm.apiKey" placeholder="请输入API密钥" />
        </el-form-item>
        <el-form-item label="回调地址" prop="callbackUrl">
          <el-input v-model="productForm.callbackUrl" placeholder="请输入回调地址" />
        </el-form-item>
        <el-form-item label="提现密码" prop="withdrawPassword">
          <el-input v-model="productForm.withdrawPassword" type="password" placeholder="不填表示不更新密码" show-password />
        </el-form-item>
        <el-form-item label="开启进单">
          <el-switch v-model="productForm.enableDeposit" />
        </el-form-item>
        <el-form-item label="开启提现">
          <el-switch v-model="productForm.enableWithdraw" />
        </el-form-item>
        <el-form-item label="下单IP白名单" prop="depositIpWhitelist">
          <el-input 
            v-model="productForm.depositIpWhitelist" 
            type="textarea" 
            :rows="2" 
            placeholder="多个IP请用英文逗号分隔" 
          />
        </el-form-item>
        <el-form-item label="出款IP白名单" prop="withdrawIpWhitelist">
          <el-input 
            v-model="productForm.withdrawIpWhitelist" 
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
          <el-radio-group v-model="productForm.verified">
            <el-radio label="Y">开启</el-radio>
            <el-radio label="N">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="子账户" prop="subAccounts">
          <div class="custom-transfer">
            <div class="transfer-container">
              <!-- 左侧面板：可选子账户 -->
              <div class="transfer-panel left-panel">
                <div class="panel-header">
                  <span>可选子账户</span>
                  <div class="search-box">
                    <el-input 
                      v-model="merchantSearchText" 
                      placeholder="请输入商户名称" 
                      clearable 
                      size="small"
                      :prefix-icon="Search"
                    />
                  </div>
                </div>
                <div class="panel-body">
                  <el-scrollbar>
                    <ul class="transfer-list">
                      <li 
                        v-for="item in availableMerchants" 
                        :key="item.id"
                        class="transfer-item"
                      >
                        <el-checkbox 
                          v-model="tempSelectedMerchants" 
                          :label="item.id"
                          @change="updateSelectedMerchants"
                        >
                          {{ item.productName }}
                        </el-checkbox>
                      </li>
                      <div v-if="availableMerchants.length === 0" class="empty-text">
                        <span>无可选商户</span>
                      </div>
                    </ul>
                  </el-scrollbar>
                </div>
              </div>
              
              <!-- 中间按钮组 -->
              <div class="transfer-buttons">
                <el-button 
                  type="primary" 
                  plain
                  @click="moveSelected(true)"
                >
                  添加
                </el-button>
                <el-button 
                  type="danger" 
                  plain
                  @click="moveSelected(false)"
                >
                  移除
                </el-button>
              </div>
              
              <!-- 右侧面板：已选子账户 -->
              <div class="transfer-panel right-panel">
                <div class="panel-header">
                  <span>已选子账户 ({{ productForm.subAccounts.length }})</span>
                </div>
                <div class="panel-body">
                  <el-scrollbar>
                    <ul class="transfer-list">
                      <li 
                        v-for="id in productForm.subAccounts" 
                        :key="id"
                        class="transfer-item"
                      >
                        <el-checkbox 
                          v-model="tempRightSelectedMerchants" 
                          :label="id"
                          @change="updateRightSelectedMerchants"
                        >
                          {{ getSubAccountName(id) }}
                        </el-checkbox>
                      </li>
                      <div v-if="productForm.subAccounts.length === 0" class="empty-text">
                        <span>请从左侧选择子账户</span>
                      </div>
                    </ul>
                  </el-scrollbar>
                </div>
              </div>
            </div>
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
        <el-form-item label="支付产品" prop="selectedProduct">
          <el-select 
            v-model="batchConfigForm.selectedProduct" 
            placeholder="请选择支付产品"
            style="width: 100%"
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
            <el-table-column label="商户费率" min-width="200">
              <template #default="scope">
                <div class="rate-input-group">
                  <el-input-number 
                    v-model="scope.row.rate" 
                    :precision="2" 
                    :step="0.1" 
                    :min="0" 
                    :max="20"
                    controls-position="right"
                    style="width: 100px"
                    size="small"
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
      width="650px"
      destroy-on-close
    >
      <el-form
        ref="productConfigFormRef"
        :model="productConfigForm"
        label-width="100px"
      >
        <el-form-item label="商户账号">
          <el-input v-model="productConfigForm.productId" disabled />
        </el-form-item>
        <el-form-item label="商户名称">
          <el-input v-model="productConfigForm.productName" disabled />
        </el-form-item>
        <el-form-item label="选择支付产品">
          <el-select 
            v-model="productConfigForm.selectedProduct" 
            placeholder="请选择支付产品"
            style="width: 100%"
          >
            <el-option 
              v-for="item in paymentProducts" 
              :key="item.id" 
              :label="item.productName" 
              :value="item.id" 
              :default-first-option="true"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="支付产品编码" prop="productCode">
          <el-input 
            v-model="productConfigForm.productCode" 
            placeholder="请输入支付产品编码"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="商户费率" prop="merchantRate">
          <div class="rate-input-group">
            <el-input-number 
              v-model="productConfigForm.merchantRate" 
              :precision="2" 
              :step="0.1" 
              :min="0" 
              :max="20"
              controls-position="right"
              style="width: 120px"
            />
            <span class="rate-unit">%</span>
          </div>
        </el-form-item>
        
        <el-form-item label="自定义选项">
          <el-switch 
            v-model="productConfigForm.customOption" 
            active-text="启用"
            inactive-text="禁用"
          />
          <div class="form-tip">启用后可以自定义选择供应商通道</div>
        </el-form-item>
        
        <el-form-item label="供应商通道" v-if="productConfigForm.customOption">
          <el-select 
            v-model="productConfigForm.selectedChannels" 
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择供应商通道"
            style="width: 100%"
          >
            <el-option 
              v-for="item in supplierChannels" 
              :key="item.id" 
              :label="item.channelName" 
              :value="item.id" 
            />
          </el-select>
          <div class="form-tip">可以选择多个供应商通道</div>
        </el-form-item>
        
        <!-- 支付产品费率列表 -->
        <div class="product-rate-list" v-if="productConfigForm.productRates.length > 0">
          <el-divider content-position="left">支付产品费率列表</el-divider>
          
          <!-- 批量设置费率 -->
          <div v-if="productConfigForm.productRates.length > 1" class="batch-rate-setting">
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
                      v-model="productConfigForm.batchRate" 
                      :precision="2" 
                      :step="0.1" 
                      :min="0"
                      :max="20"
                      controls-position="right"
                      size="small"
                      style="width: 120px"
                    />
                    <span class="rate-unit">%</span>
                    <el-button type="primary" size="small" style="margin-left: 10px" @click="applyBatchRate">应用到所有产品</el-button>
                  </div>
                </div>
              </template>
            </el-alert>
          </div>
          
          <el-table :data="productConfigForm.productRates" style="width: 100%; margin-top: 16px" border>
            <el-table-column prop="productName" label="支付产品名称" min-width="180" />
            <el-table-column label="商户费率" min-width="200">
              <template #default="scope">
                <div class="rate-input-group">
                  <el-input-number 
                    v-model="scope.row.rate" 
                    :precision="2" 
                    :step="0.1" 
                    :min="0" 
                    :max="20"
                    controls-position="right"
                    style="width: 100px"
                    size="small"
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
                  @click="removeProductRate(scope.row.productId)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 无产品提示 -->
        <el-empty v-if="productConfigForm.productRates.length === 0" description="请选择支付产品" />
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="productConfigVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProductConfig" :disabled="productConfigForm.productRates.length === 0">确认</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { Search, Refresh, Plus, Delete, Setting, Edit, ArrowDown, Download, ArrowRight, ArrowLeft, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productList } from '@/data/productData'
import { merchantProductList } from '@/data/merchantProductData'

// 支付产品数据
const paymentProducts = ref([
  { id: 1, productName: '产品A', productCode: '8888', rate: 10.00 },
  { id: 2, productName: '产品B', productCode: 'WX001', rate: 3.50 },
  { id: 3, productName: '产品C', productCode: 'ZFB001', rate: 3.00 },
  { id: 4, productName: '产品D', productCode: 'YL001', rate: 2.80 },
  { id: 5, productName: '产品E', productCode: 'YSF001', rate: 2.50 },
  { id: 6, productName: '产品F', productCode: 'ICC001', rate: 4.50 },
  { id: 7, productName: '产品G', productCode: 'QP001', rate: 2.60 },
  { id: 8, productName: '产品H', productCode: 'AGG001', rate: 3.80 },
  { id: 9, productName: '产品I', productCode: 'SCAN001', rate: 2.20 }
])

// 供应商通道数据
const supplierChannels = ref([
  { id: 101, channelName: '通道A', channelCode: '102', rate: 6.00 },
  { id: 102, channelName: '通道B', channelCode: '0000', rate: 6.00 },
  { id: 103, channelName: '通道C', channelCode: '201', rate: 5.80 },
  { id: 104, channelName: '通道D', channelCode: '202', rate: 5.90 },
  { id: 105, channelName: '通道E', channelCode: '301', rate: 6.20 },
  { id: 106, channelName: '通道F', channelCode: '302', rate: 6.30 }
])

// 渠道选项
const channelOptions = ref([
  { label: '通道A', value: 'channel_a' },
  { label: '通道B', value: 'channel_b' },
  { label: '通道C', value: 'channel_c' },
  { label: '通道D', value: 'channel_d' },
  { label: '通道E', value: 'channel_e' }
])

// 搜索表单
const searchForm = reactive({
  id: '',
  productId: '',
  productName: '',
  productNo: '',
  verified: '',
  googleAuth: ''
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
  
  // 模拟异步请求
  setTimeout(() => {
    let filteredData = [...productList]
    
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
    
    if (searchForm.verified) {
      filteredData = filteredData.filter(item => 
        item.verified === searchForm.verified)
    }
    
    if (searchForm.googleAuth !== '') {
      const isGoogleAuth = searchForm.googleAuth === true || searchForm.googleAuth === 'true'
      filteredData = filteredData.filter(item => 
        item.googleAuth === isGoogleAuth)
    }
    
    total.value = filteredData.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    
    tableData.value = filteredData.slice(start, end)
    loading.value = false
  }, 300)
}

// 格式化金额
const formatAmount = (amount) => {
  return '￥' + (amount?.toFixed(2) || '0.00')
}

// 搜索与重置
const handleSearch = () => {
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
  verified: 'N',
  subAccounts: [],
  enableDeposit: true,
  enableWithdraw: true
})

const productRules = {
  productId: [{ required: true, message: '请输入商户账号', trigger: 'blur' }],
  productName: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
  productNo: [{ required: true, message: '请输入商户号', trigger: 'blur' }]
}

// 生成随机商户号
const generateMerchantNo = () => {
  // 生成10位数字的商户号
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// 生成随机API密钥
const generateApiKey = () => {
  // 生成32位的随机字符串（MD5格式）
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// 产品配置
const productConfigVisible = ref(false)
const productConfigFormRef = ref(null)
const productConfigForm = reactive({
  merchantId: '',
  productId: '',
  productName: '',
  selectedProduct: '',
  productCode: '',
  merchantRate: 3.00,
  batchRate: 3.00,
  productRates: [],
  customOption: false,
  selectedChannels: []
})

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
  productConfigForm.productName = row.productName
  productConfigForm.selectedProduct = ''
  productConfigForm.productCode = '' // 重置产品编码
  productConfigForm.merchantRate = 3.00 // 重置默认费率
  productConfigForm.productRates = []
  productConfigForm.customOption = false
  productConfigForm.selectedChannels = []
  
  // 获取商户已关联的产品
  const existingProducts = merchantProductList.filter(item => 
    item.merchantNo === row.productNo || item.merchantName === row.productName
  )
  
  if (existingProducts.length > 0 && existingProducts[0]) {
    // 加载第一个关联产品
    const firstProduct = existingProducts[0]
    const productId = paymentProducts.value.find(p => p.productName === firstProduct.productName)?.id
    
    if (productId) {
      // 如果是标准产品
      productConfigForm.selectedProduct = productId
      productConfigForm.productCode = firstProduct.productCode // 设置产品编码
      productConfigForm.merchantRate = firstProduct.rate // 设置商户费率
      productConfigForm.productRates = [{
        productId: productId,
        productName: firstProduct.productName,
        productCode: firstProduct.productCode,
        rate: firstProduct.rate,
        weight: firstProduct.weight || 10
      }]
    } else if (firstProduct.productName.startsWith('自定义-')) {
      // 如果是自定义产品
      productConfigForm.customOption = true
      const channelName = firstProduct.productName.replace('自定义-', '')
      const channel = supplierChannels.value.find(c => c.channelName === channelName)
      
      if (channel) {
        productConfigForm.selectedChannels = [channel.id]
        productConfigForm.productCode = firstProduct.productCode // 设置产品编码
        productConfigForm.merchantRate = firstProduct.rate // 设置商户费率
        productConfigForm.productRates = [{
          productId: firstProduct.productId,
          productName: firstProduct.productName,
          productCode: firstProduct.productCode,
          rate: firstProduct.rate,
          weight: firstProduct.weight || 10
        }]
      }
    }
  }
  
  productConfigVisible.value = true
}

// 监听自定义选项变化
watch(() => productConfigForm.customOption, (newVal) => {
  if (newVal) {
    // 启用自定义选项时，清空选择的产品
    productConfigForm.selectedProduct = ''
    productConfigForm.productCode = '' // 清空产品编码
    productConfigForm.productRates = []
  } else {
    // 禁用自定义选项时，清空已选通道
    productConfigForm.selectedChannels = []
  }
})

// 监听支付产品变化
watch(() => productConfigForm.selectedProduct, (newVal) => {
  if (newVal && !productConfigForm.customOption) {
    // 选择了标准支付产品时
    const selectedProduct = paymentProducts.value.find(p => p.id === newVal)
    if (selectedProduct) {
      // 自动设置产品编码 (可以根据需要修改这个逻辑)
      productConfigForm.productCode = `PROD_${selectedProduct.id}`
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
  if (newVal.length > 0 && productConfigForm.customOption) {
    // 清空之前的费率列表
    productConfigForm.productRates = []
    
    // 添加选择的通道
    const selectedChannels = supplierChannels.value.filter(item => newVal.includes(item.id))
    
    selectedChannels.forEach(channel => {
      productConfigForm.productRates.push({
        productId: `channel_${channel.id}`,
        productName: `自定义-${channel.channelName}`,
        productCode: `CUSTOM_${channel.id}`,
        rate: productConfigForm.merchantRate, // 使用商户费率字段
        weight: 10 // 默认权重
      })
    })
  }
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
  return account ? account.productName : `未知账户(${id})`
}

// 提交产品配置
const submitProductConfig = () => {
  // 验证必填字段
  if (!productConfigForm.productCode.trim()) {
    ElMessage.warning('请输入支付产品编码')
    return
  }
  
  // 更新商户费率到产品费率列表
  if (productConfigForm.productRates.length === 1) {
    productConfigForm.productRates[0].rate = productConfigForm.merchantRate
    productConfigForm.productRates[0].productCode = productConfigForm.productCode
  }
  
  // 构造提交数据
  const submitData = {
    merchantId: productConfigForm.merchantId,
    productId: productConfigForm.productId,
    productName: productConfigForm.productName,
    productCode: productConfigForm.productCode,
    merchantRate: productConfigForm.merchantRate,
    products: productConfigForm.productRates.map(item => ({
      productId: item.productId,
      productName: item.productName,
      productCode: item.productCode || productConfigForm.productCode,
      rate: item.rate,
      weight: item.weight || 10
    })),
    customOption: productConfigForm.customOption,
    selectedChannels: productConfigForm.selectedChannels
  }
  
  console.log('提交的产品配置数据:', submitData)
  
  // 这里应该是调用API保存数据
  // saveProductConfig(submitData)
  
  // 模拟提交成功
  setTimeout(() => {
    ElMessage.success('产品配置保存成功')
    productConfigVisible.value = false
    // 刷新表格
    fetchData()
  }, 500)
}

// 批量配置相关
const batchConfigVisible = ref(false)
const batchConfigFormRef = ref(null)
const batchConfigForm = reactive({
  selectedProduct: '',
  productRates: [],
  rate: 3.00
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
    products: batchConfigForm.productRates.map(item => ({
      productId: item.productId,
      productName: item.productName,
      productCode: item.productCode,
      rate: item.rate
    }))
  }
  
  console.log('提交的批量配置数据:', submitData)
  
  // 这里应该是调用API保存数据
  // saveBatchConfig(submitData)
  
  // 模拟提交成功
  setTimeout(() => {
    ElMessage.success('批量配置保存成功')
    batchConfigVisible.value = false
    // 刷新表格
    fetchData()
  }, 500)
}

// 处理批量配置
const handleBatchConfig = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要批量配置的商户')
    return
  }
  
  batchConfigForm.selectedProduct = ''
  batchConfigForm.productRates = []
  batchConfigForm.rate = 3.00
  
  batchConfigVisible.value = true
}

// 监听批量配置中的支付产品选择
watch(() => batchConfigForm.selectedProduct, (newVal) => {
  if (newVal) {
    // 选择了支付产品
    const selectedProduct = paymentProducts.value.find(p => p.id === newVal)
    if (selectedProduct && !batchConfigForm.productRates.some(item => item.productId === newVal)) {
      batchConfigForm.productRates.push({
        productId: newVal,
        productName: selectedProduct.productName,
        productCode: selectedProduct.productCode,
        rate: batchConfigForm.rate
      })
    }
  }
})

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
        ElMessage.success('余额操作成功')
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
  // 清空表单
  Object.keys(productForm).forEach(key => {
    if (key === 'verified') {
      productForm[key] = 'N'
    } else if (key === 'enableDeposit' || key === 'enableWithdraw') {
      productForm[key] = true
    } else if (key === 'subAccounts') {
      productForm[key] = []
    } else {
      productForm[key] = ''
    }
  })
  
  // 生成随机商户号和API密钥
  productForm.productNo = generateMerchantNo()
  productForm.apiKey = generateApiKey()
  
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑商户'
  // 填充表单
  Object.keys(productForm).forEach(key => {
    if (key in row) {
      productForm[key] = row[key]
    }
  })
  
  // 清空密码字段
  productForm.password = ''
  productForm.withdrawPassword = ''
  
  dialogVisible.value = true
}

// 提交商户表单
const submitForm = () => {
  productFormRef.value.validate((valid) => {
    if (valid) {
      // 这里应该是调用API保存数据
      // saveProduct(productForm)
      
      // 模拟提交成功
      setTimeout(() => {
        ElMessage.success(dialogTitle.value === '新增商户' ? '商户添加成功' : '商户编辑成功')
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
  
  ElMessage.success(`已${statusText}商户: ${row.productName}`)
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
      ElMessage.success('谷歌认证重置成功')
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
      ElMessage.success(`API密钥重置成功: ${newApiKey}`)
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
      ElMessage.success('批量删除成功')
      // 刷新表格
      fetchData()
    }, 500)
  }).catch(() => {})
}

// 导出数据
const handleExport = () => {
  ElMessage.success('正在导出数据，请稍候...')
  
  // 这里应该是调用API导出数据
  // exportData(searchForm)
  
  // 模拟操作成功
  setTimeout(() => {
    ElMessage.success('数据导出成功')
  }, 1500)
}

// 一键登录
const handleQuickLogin = (row) => {
  ElMessage.success(`正在登录商户 ${row.productName} 的后台...`)
  
  // 生成授权令牌
  const timestamp = new Date().getTime()
  const token = `${timestamp}_${row.id}_${generateApiKey().substring(0, 8)}`
  
  // 直接跳转到商户后台，使用内部路由
  const merchantBackendUrl = `/merchant/dashboard?merchant=${row.id}&token=${token}`
  window.open(merchantBackendUrl, '_blank')
}

// 商户选择相关
const merchantSearchText = ref('')
const tempSelectedMerchants = ref([])
const tempRightSelectedMerchants = ref([])

// 可选商户列表
const availableMerchants = computed(() => {
  // 过滤出未被选为子账户的商户
  let merchants = productList.filter(item => 
    !productForm.subAccounts.includes(item.id) && 
    item.id !== productForm.id
  )
  
  // 如果有搜索文本，再进一步过滤
  if (merchantSearchText.value) {
    const searchText = merchantSearchText.value.toLowerCase()
    merchants = merchants.filter(item => 
      item.productName.toLowerCase().includes(searchText) ||
      item.productId.toLowerCase().includes(searchText)
    )
  }
  
  return merchants
})

// 更新选中的商户
const updateSelectedMerchants = () => {
  // 这个函数空实现即可，仅用于触发checkbox的变化
}

// 更新右侧选中的商户
const updateRightSelectedMerchants = () => {
  // 这个函数空实现即可，仅用于触发checkbox的变化
}

// 移动选中的商户
const moveSelected = (isToRight) => {
  if (isToRight) {
    // 添加到子账户
    if (tempSelectedMerchants.value.length === 0) {
      ElMessage.warning('请选择要添加的商户')
      return
    }
    
    // 将选中的商户添加到子账户列表
    tempSelectedMerchants.value.forEach(id => {
      if (!productForm.subAccounts.includes(id)) {
        productForm.subAccounts.push(id)
      }
    })
    
    // 清空选择
    tempSelectedMerchants.value = []
  } else {
    // 从子账户移除
    if (tempRightSelectedMerchants.value.length === 0) {
      ElMessage.warning('请选择要移除的商户')
      return
    }
    
    // 从子账户列表移除选中的商户
    productForm.subAccounts = productForm.subAccounts.filter(id => 
      !tempRightSelectedMerchants.value.includes(id)
    )
    
    // 清空选择
    tempRightSelectedMerchants.value = []
  }
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
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-row {
  display: flex;
  width: 100%;
  margin-bottom: 16px;
  align-items: center;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.filter-buttons .el-button + .el-button {
  margin-left: 8px;
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

/* 自定义Transfer组件样式 */
.custom-transfer {
  width: 100%;
  min-height: 200px;
}

.transfer-container {
  display: flex;
  align-items: stretch;
  height: 300px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
}

.transfer-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #EBEEF5;
}

.transfer-panel:last-child {
  border-right: none;
}

.panel-header {
  height: 40px;
  padding: 0 12px;
  border-bottom: 1px solid #EBEEF5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F5F7FA;
}

.search-box {
  width: 180px;
}

.panel-body {
  flex: 1;
  overflow: hidden;
}

.transfer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
}

.transfer-item {
  padding: 8px 12px;
  transition: background-color 0.2s;
}

.transfer-item:hover {
  background-color: #F5F7FA;
}

.transfer-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px;
}

.transfer-buttons .el-button {
  margin: 5px 0;
}

.empty-text {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
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
</style>
