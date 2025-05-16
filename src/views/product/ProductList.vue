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
        <el-table-column prop="balance" label="余额" width="160" align="right">
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
        
        <!-- 非自定义模式下的支付产品选择 -->
        <el-form-item label="选择支付产品" v-if="!productConfigForm.customOption">
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
        
        <!-- 自定义模式下的支付产品显示 -->
        <el-form-item label="支付产品" v-if="productConfigForm.customOption">
          <el-input 
            :value="getSelectedProductName()"
            placeholder="无已选支付产品"
            disabled
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="支付产品编码" prop="productCode">
          <el-input 
            v-model="productConfigForm.productCode" 
            placeholder="请输入支付产品编码"
            style="width: 100%"
            disabled
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
        
        <el-form-item label="自定义通道">
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
              :label="'渠道' + item.channelCode + ' | ' + item.channelName" 
              :value="item.id" 
            />
          </el-select>
          <div class="form-tip">可以选择多个供应商通道</div>
        </el-form-item>
        
        <!-- 已选择的通道表格 -->
        <el-form-item v-if="productConfigForm.customOption && productConfigForm.selectedChannels.length > 0" label="已选择的通道">
          <!-- 轮询方式选择 -->
          <div class="polling-option" style="margin-bottom: 12px;">
            <el-radio-group v-model="productConfigForm.routingMode" size="small">
              <el-radio label="polling">轮询</el-radio>
              <el-radio label="weight">权重</el-radio>
            </el-radio-group>
            <div class="form-tip" style="margin-top: 4px;">
              轮询模式: 按顺序依次调用通道; 权重模式: 按权重比例随机调用通道
            </div>
          </div>
          
          <el-table :data="getSelectedChannelsData()" border style="width: 100%;">
            <el-table-column prop="channelName" label="通道名称" min-width="160">
              <template #default="scope">
                <span>渠道{{ scope.row.channelCode }} | {{ scope.row.channelName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="channelCode" label="通道编码" min-width="120" />
            <el-table-column prop="rate" label="通道成本" width="100">
              <template #default="scope">
                <span>{{ scope.row.rate }}%</span>
              </template>
            </el-table-column>
            <el-table-column label="权重" width="120">
              <template #default="scope">
                <el-input-number 
                  v-model="scope.row.weight" 
                  :disabled="productConfigForm.routingMode === 'polling'"
                  :precision="0" 
                  :step="1" 
                  :min="1" 
                  :max="100"
                  size="small"
                  controls-position="right"
                  style="width: 100px"
                  @change="(val) => updateChannelWeight(scope.row.id, val)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  link 
                  size="small" 
                  @click="removeSelectedChannel(scope.row.id)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        
        <!-- 无产品提示 -->
        <el-empty v-if="!productConfigForm.customOption && productConfigForm.productRates.length === 0" description="请选择支付产品" />
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="productConfigVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProductConfig">确认</el-button>
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
import { useRouter } from 'vue-router'

const router = useRouter()

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
  { id: 101, channelName: '通道A', channelCode: 'A', rate: 6.00 },
  { id: 102, channelName: '通道B', channelCode: 'B', rate: 6.00 },
  { id: 103, channelName: '通道C', channelCode: 'C', rate: 5.80 },
  { id: 104, channelName: '通道D', channelCode: 'D', rate: 5.90 },
  { id: 105, channelName: '通道E', channelCode: 'E', rate: 6.20 },
  { id: 106, channelName: '通道F', channelCode: 'F', rate: 6.30 }
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
  selectedChannels: [],
  routingMode: 'polling',
  channelsWeightMap: {} // 通道权重映射，格式为: {channelId: weight}
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
  productConfigForm.routingMode = 'polling' // 默认使用轮询模式
  productConfigForm.channelsWeightMap = {} // 重置通道权重映射
  
  // 获取商户已关联的产品
  const existingProducts = merchantProductList.filter(item => 
    item.merchantNo === row.productNo || item.merchantName === row.productName
  )
  
  if (existingProducts.length > 0 && existingProducts[0]) {
    // 加载第一个关联产品
    const firstProduct = existingProducts[0]
    
    // 检查是否有路由模式设置，如果有就使用
    if (firstProduct.routingMode) {
      productConfigForm.routingMode = firstProduct.routingMode;
    }
    
    const productId = paymentProducts.value.find(p => p.productName === firstProduct.productName)?.id
    
    if (productId) {
      // 如果是标准产品
      productConfigForm.selectedProduct = productId
      
      // 检查编码格式，如果不是"1111"格式则生成新编码
      if (!/^\d{4}$/.test(firstProduct.productCode)) {
        const randomCode = Math.floor(1000 + Math.random() * 9000).toString()
        productConfigForm.productCode = randomCode
      } else {
        productConfigForm.productCode = firstProduct.productCode // 设置产品编码
      }
      
      productConfigForm.merchantRate = firstProduct.rate // 设置商户费率
      productConfigForm.productRates = [{
        productId: productId,
        productName: firstProduct.productName,
        productCode: productConfigForm.productCode,
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
        
        // 检查编码格式，如果不是"1111"格式则生成新编码
        if (!/^\d{4}$/.test(firstProduct.productCode)) {
          const randomCode = Math.floor(1000 + Math.random() * 9000).toString()
          productConfigForm.productCode = randomCode
        } else {
          productConfigForm.productCode = firstProduct.productCode // 设置产品编码
        }
        
        productConfigForm.merchantRate = firstProduct.rate // 设置商户费率
        
        // 设置通道权重
        if (firstProduct.weight) {
          productConfigForm.channelsWeightMap[channel.id] = firstProduct.weight;
        }
        
        productConfigForm.productRates = [{
          productId: firstProduct.productId,
          productName: firstProduct.productName,
          productCode: productConfigForm.productCode,
          rate: firstProduct.rate,
          weight: firstProduct.weight || 10
        }]
      }
    }
    
    // 如果有多个产品，还需要加载其他产品的权重设置
    if (existingProducts.length > 1) {
      existingProducts.slice(1).forEach(product => {
        if (product.productName.startsWith('自定义-')) {
          const channelName = product.productName.replace('自定义-', '')
          const channel = supplierChannels.value.find(c => c.channelName === channelName)
          
          if (channel && !productConfigForm.selectedChannels.includes(channel.id)) {
            productConfigForm.selectedChannels.push(channel.id);
            
            // 设置通道权重
            if (product.weight) {
              productConfigForm.channelsWeightMap[channel.id] = product.weight;
            }
          }
        }
      });
    }
  }
  
  productConfigVisible.value = true
}

// 获取已选择通道数据
const getSelectedChannelsData = () => {
  if (!productConfigForm.selectedChannels || productConfigForm.selectedChannels.length === 0) {
    return [];
  }
  
  // 从channelsWeightMap获取权重或使用默认值10
  return supplierChannels.value.filter(item => 
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
    const selectedProduct = paymentProducts.value.find(p => p.id === newVal)
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

// 更新通道权重映射
const updateChannelWeight = (channelId, weight) => {
  productConfigForm.channelsWeightMap[channelId] = weight;
}

// 移除已选择的通道
const removeSelectedChannel = (channelId) => {
  // 从已选择的通道中移除
  productConfigForm.selectedChannels = productConfigForm.selectedChannels.filter(id => id !== channelId);
  // 从权重映射中移除
  if (channelId in productConfigForm.channelsWeightMap) {
    delete productConfigForm.channelsWeightMap[channelId];
  }
}

// 监听表格中权重的变化
const handleWeightChange = (channel, newWeight) => {
  updateChannelWeight(channel.id, newWeight);
}

// 提交产品配置
const submitProductConfig = () => {
  // 验证必填字段
  if (!productConfigForm.productCode.trim()) {
    ElMessage.warning('请输入支付产品编码')
    return
  }
  
  // 提取标准支付产品信息
  let products = [...productConfigForm.productRates];
  
  // 处理自定义通道模式
  if (productConfigForm.customOption && productConfigForm.selectedChannels.length > 0) {
    // 添加选中的通道信息
    const selectedChannelsData = getSelectedChannelsData();
    
    // 记录自定义通道信息
    const channelProducts = selectedChannelsData.map(channel => ({
      productId: `channel_${channel.id}`,
      productName: `自定义-${channel.channelName}`,
      productCode: productConfigForm.productCode,
      rate: productConfigForm.merchantRate,
      weight: productConfigForm.routingMode === 'weight' ? (channel.weight || 10) : 10
    }));
    
    // 合并产品列表
    products = products.concat(channelProducts);
  }
  
  // 构造提交数据
  const submitData = {
    merchantId: productConfigForm.merchantId,
    productId: productConfigForm.productId,
    productName: productConfigForm.productName,
    productCode: productConfigForm.productCode,
    merchantRate: productConfigForm.merchantRate,
    products: products,
    customOption: productConfigForm.customOption,
    selectedChannels: productConfigForm.selectedChannels,
    routingMode: productConfigForm.routingMode
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
  selectedProduct: [],
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
  
  batchConfigForm.selectedProduct = []
  batchConfigForm.productRates = []
  batchConfigForm.rate = 3.00
  
  batchConfigVisible.value = true
}

// 监听批量配置中的支付产品选择
watch(() => batchConfigForm.selectedProduct, (newVal, oldVal) => {
  if (newVal && newVal.length) {
    // 找出新增的产品ID
    const addedProductIds = oldVal ? newVal.filter(id => !oldVal.includes(id)) : newVal;
    
    // 为新增的产品添加到费率列表
    addedProductIds.forEach(productId => {
      const selectedProduct = paymentProducts.value.find(p => p.id === productId);
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

// 模拟获取商户登录 Token
const getMerchantLoginToken = async (merchantId) => {
  // 实际场景中，这里应该调用后端API获取真实的Token
  console.log(`尝试为商户 ${merchantId} 获取登录Token...`)
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

// 获取已选产品名称
const getSelectedProductName = () => {
  if (productConfigForm.selectedProduct) {
    const product = paymentProducts.value.find(p => p.id === productConfigForm.selectedProduct);
    return product ? product.productName : '';
  }
  return '';
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
</style>
