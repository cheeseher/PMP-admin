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
          <el-button :icon="Printer" plain>打印</el-button>
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
        <el-table-column prop="balance" label="余额" width="100" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ formatAmount(scope.row.balance) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="freeze" label="冻结金额" width="100" align="right">
          <template #default="scope">
            <span class="amount-cell">{{ formatAmount(scope.row.freeze || 0) }}</span>
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
        <el-table-column prop="role" label="角色" width="100" />
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
                  <el-dropdown-item command="unfreeze">余额解冻</el-dropdown-item>
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
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="productForm.mobile" placeholder="请输入手机号" />
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
        <el-form-item label="区分手机系统">
          <el-switch v-model="productForm.distinguishMobileOS" />
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
        <el-form-item label="支付产品" prop="selectedProducts">
          <el-select 
            v-model="batchConfigForm.selectedProducts" 
            multiple 
            collapse-tags
            collapse-tags-tooltip
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
            v-model="productConfigForm.selectedProducts" 
            multiple 
            collapse-tags
            collapse-tags-tooltip
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
import { ref, reactive, onMounted, watch } from 'vue'
import { Search, Refresh, Plus, Delete, Setting, Edit, ArrowDown, Printer, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productList } from '@/data/productData'
import { merchantProductList } from '@/data/merchantProductData'

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
  return amount?.toFixed(2) || '0.00'
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
  verified: 'N'
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

const resetProductForm = () => {
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  Object.assign(productForm, {
    id: '',
    productId: '',
    productName: '',
    productNo: generateMerchantNo(),
    password: '',
    mobile: '',
    apiKey: generateApiKey(),
    callbackUrl: '',
    withdrawPassword: '',
    balance: 0,
    freeze: 0,
    enableDeposit: true,
    enableWithdraw: true,
    distinguishMobileOS: false,
    depositIpWhitelist: '',
    withdrawIpWhitelist: '',
    adminIpWhitelist: '',
    remark: '',
    role: 'merchant',
    googleAuth: false,
    verified: 'N'
  })
}

const handleAdd = () => {
  resetProductForm()
  dialogTitle.value = '新增商户'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  resetProductForm()
  dialogTitle.value = '编辑商户'
  Object.assign(productForm, { ...row })
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!productFormRef.value) return
  
  try {
    await productFormRef.value.validate()
    
    loading.value = true
    setTimeout(() => {
      // 模拟提交
      if (productForm.id) {
        // 编辑
        const index = productList.findIndex(item => item.id === productForm.id)
        if (index !== -1) {
          Object.assign(productList[index], productForm)
          ElMessage.success('编辑成功')
        }
      } else {
        // 添加
        const newProduct = {
          ...productForm,
          id: productList.length + 1,
          authIp: '',
          loginCount: 0,
          freeze: productForm.freeze || 0,
          registerTime: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(/\//g, '-')
        }
        productList.unshift(newProduct)
        ElMessage.success('添加成功')
      }
      
      dialogVisible.value = false
      fetchData()
      loading.value = false
    }, 300)
    
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 删除商户
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除商户 ${row.productName} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      const index = productList.findIndex(item => item.id === row.id)
      if (index !== -1) {
        productList.splice(index, 1)
        ElMessage.success('删除成功')
        fetchData()
      }
      loading.value = false
    }, 300)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      const ids = selectedRows.value.map(row => row.id)
      let deleteCount = 0
      
      for (let i = productList.length - 1; i >= 0; i--) {
        if (ids.includes(productList[i].id)) {
          productList.splice(i, 1)
          deleteCount++
        }
      }
      
      ElMessage.success(`成功删除 ${deleteCount} 条记录`)
      fetchData()
      loading.value = false
    }, 300)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 配置商户
const handleConfig = (row) => {
  productConfigForm.merchantId = row.id
  productConfigForm.productId = row.productId
  productConfigForm.productName = row.productName
  productConfigForm.selectedProducts = []
  productConfigForm.productRates = []
  
  // 获取商户已关联的产品
  const existingProducts = merchantProductList.filter(item => 
    item.merchantNo === row.productNo || item.merchantName === row.productName
  )
  
  if (existingProducts.length > 0) {
    // 如果有已关联产品，加载它们
    productConfigForm.productRates = existingProducts.map(item => ({
      productId: paymentProducts.value.find(p => p.productName === item.productName)?.id || 0,
      productName: item.productName,
      productCode: item.productCode,
      rate: item.rate,
      weight: item.weight
    }))
    
    productConfigForm.selectedProducts = productConfigForm.productRates.map(item => item.productId)
  }
  
  productConfigVisible.value = true
}

// 监听选择产品变化
const watchSelectedProducts = () => {
  // 当选择的产品变化时，更新产品费率列表
  const currentProductIds = productConfigForm.productRates.map(item => item.productId)
  
  // 添加新选择的产品
  productConfigForm.selectedProducts.forEach(productId => {
    if (!currentProductIds.includes(productId)) {
      const product = paymentProducts.value.find(item => item.id === productId)
      if (product) {
        productConfigForm.productRates.push({
          productId: product.id,
          productName: product.productName,
          productCode: product.productCode,
          rate: productConfigForm.batchRate,
          weight: 10 // 默认权重
        })
      }
    }
  })
  
  // 移除取消选择的产品
  productConfigForm.productRates = productConfigForm.productRates.filter(
    item => productConfigForm.selectedProducts.includes(item.productId)
  )
}

// 应用批量费率
const applyBatchRate = () => {
  if (productConfigForm.productRates.length > 0) {
    productConfigForm.productRates.forEach(item => {
      item.rate = productConfigForm.batchRate
    })
    ElMessage.success('已应用批量费率')
  } else {
    ElMessage.warning('请先选择产品')
  }
}

// 提交产品配置
const submitProductConfig = () => {
  if (productConfigForm.selectedProducts.length === 0) {
    ElMessage.warning('请至少选择一个产品')
    return
  }
  
  loading.value = true
  setTimeout(() => {
    // 实际应用中这里应调用API保存商户产品配置
    ElMessage.success(`商户 ${productConfigForm.productName} 的产品配置已更新`)
    productConfigVisible.value = false
    loading.value = false
  }, 300)
}

// 处理状态开关切换
const handleStatusChange = (row) => {
  ElMessage.success(`商户 ${row.productName} 状态已更新为${row.verified === 'Y' ? '开启' : '关闭'}`)
  
  // 实际应用中这里会调用API更新商户状态
  // 这里仅做演示
}

// 余额操作
const balanceOperationVisible = ref(false)
const balanceFormRef = ref(null)
const balanceForm = reactive({
  merchantId: '',
  productId: '',
  productName: '',
  currentBalance: 0,
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
  balanceForm.merchantId = row.id
  balanceForm.productId = row.productId
  balanceForm.productName = row.productName
  balanceForm.currentBalance = row.balance || 0
  balanceForm.operationType = 'add'
  balanceForm.amount = 0
  balanceForm.remark = ''
  
  balanceOperationVisible.value = true
}

// 提交余额操作
const submitBalanceOperation = async () => {
  if (!balanceFormRef.value) return
  
  try {
    await balanceFormRef.value.validate()
    
    loading.value = true
    setTimeout(() => {
      // 模拟提交
      const index = productList.findIndex(item => item.id === balanceForm.merchantId)
      if (index !== -1) {
        if (balanceForm.operationType === 'add') {
          productList[index].balance += Number(balanceForm.amount)
          ElMessage.success(`已成功为 ${balanceForm.productName} 增加余额 ${balanceForm.amount} 元`)
        } else {
          if (productList[index].balance < balanceForm.amount) {
            ElMessage.warning('余额不足，无法扣减')
            loading.value = false
            return
          }
          productList[index].balance -= Number(balanceForm.amount)
          ElMessage.success(`已成功从 ${balanceForm.productName} 减少余额 ${balanceForm.amount} 元`)
        }
      }
      
      balanceOperationVisible.value = false
      fetchData()
      loading.value = false
    }, 300)
    
  } catch (error) {
    console.error('表单验证失败', error)
  }
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
    case 'unfreeze':
      handleUnfreeze(row)
      break
    case 'balance':
      handleBalance(row)
      break
    default:
      break
  }
}

// 重置谷歌认证
const handleResetGoogle = (row) => {
  ElMessageBox.confirm(
    `确定要重置商户 ${row.productName} 的谷歌认证吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      // 模拟API请求
      const index = productList.findIndex(item => item.id === row.id)
      if (index !== -1) {
        productList[index].googleAuth = false
        ElMessage.success(`已重置 ${row.productName} 的谷歌验证`)
        fetchData()
      }
      loading.value = false
    }, 300)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 重置APIKEY
const handleResetApiKey = (row) => {
  ElMessageBox.confirm(
    `确定要重置商户 ${row.productName} 的APIKEY吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      // 模拟API请求
      const index = productList.findIndex(item => item.id === row.id)
      if (index !== -1) {
        const newApiKey = generateApiKey()
        productList[index].apiKey = newApiKey
        ElMessage.success(`已重置 ${row.productName} 的APIKEY: ${newApiKey}`)
      }
      loading.value = false
    }, 300)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 余额解冻
const handleUnfreeze = (row) => {
  if (!row.freeze || row.freeze <= 0) {
    ElMessage.warning(`商户 ${row.productName} 没有冻结余额`)
    return
  }

  ElMessageBox.confirm(
    `确定要解冻商户 ${row.productName} 的冻结余额 ${formatAmount(row.freeze)} 元吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      // 模拟API请求
      const index = productList.findIndex(item => item.id === row.id)
      if (index !== -1) {
        // 将冻结金额加回余额中
        productList[index].balance = (productList[index].balance || 0) + (productList[index].freeze || 0)
        productList[index].freeze = 0
        ElMessage.success(`已解冻 ${row.productName} 的余额`)
        fetchData()
      }
      loading.value = false
    }, 300)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 一键登录
const handleQuickLogin = (row) => {
  ElMessage.success(`正在登录商户账户：${row.productId}`)
  // 在新标签页中打开商户后台
  const merchantAdminUrl = `/merchant/dashboard?merchant=${row.productId}&token=admin_token_${row.id}`
  window.open(merchantAdminUrl, '_blank')
}

// 导出数据
const handleExport = () => {
  ElMessage.success('商户数据导出成功')
}

// 批量配置
const batchConfigVisible = ref(false)
const batchConfigFormRef = ref(null)
const batchConfigForm = reactive({
  verified: 'Y',
  selectedProducts: [],
  rate: 3.00,
  productRates: []
})

const handleBatchConfig = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  // 重置表单
  batchConfigForm.selectedProducts = []
  batchConfigForm.rate = 3.00
  batchConfigForm.productRates = []
  
  batchConfigVisible.value = true
}

// 监听批量配置中选择产品变化
const watchBatchSelectedProducts = () => {
  // 当选择的产品变化时，更新产品费率列表
  const currentProductIds = batchConfigForm.productRates.map(item => item.productId)
  
  // 添加新选择的产品
  batchConfigForm.selectedProducts.forEach(productId => {
    if (!currentProductIds.includes(productId)) {
      const product = paymentProducts.value.find(item => item.id === productId)
      if (product) {
        batchConfigForm.productRates.push({
          productId: product.id,
          productName: product.productName,
          productCode: product.productCode,
          rate: batchConfigForm.rate,
          weight: 10 // 默认权重
        })
      }
    }
  })
  
  // 移除取消选择的产品
  batchConfigForm.productRates = batchConfigForm.productRates.filter(
    item => batchConfigForm.selectedProducts.includes(item.productId)
  )
}

// 移除批量配置中的产品费率
const removeBatchProductRate = (productId) => {
  // 从产品费率列表中移除
  const index = batchConfigForm.productRates.findIndex(item => item.productId === productId);
  if (index !== -1) {
    batchConfigForm.productRates.splice(index, 1);
  }
  
  // 从已选产品中移除
  const selectedIndex = batchConfigForm.selectedProducts.indexOf(productId);
  if (selectedIndex !== -1) {
    batchConfigForm.selectedProducts.splice(selectedIndex, 1);
  }
}

// 应用批量配置费率
const applyBatchConfigRate = () => {
  if (batchConfigForm.productRates.length > 0) {
    batchConfigForm.productRates.forEach(item => {
      item.rate = batchConfigForm.rate
    })
    ElMessage.success('已应用批量费率')
  } else {
    ElMessage.warning('请先选择产品')
  }
}

const submitBatchConfig = () => {
  if (batchConfigForm.selectedProducts.length === 0) {
    ElMessage.warning('请至少选择一个支付产品')
    return
  }
  
  loading.value = true
  setTimeout(() => {
    // 在实际应用中，这里应该调用API为多个商户配置产品和费率
    const merchantCount = selectedRows.value.length
    const productCount = batchConfigForm.productRates.length
    const rateInfo = batchConfigForm.productRates.map(item => 
      `${item.productName}(${item.rate}%)`
    ).join('、')
    
    ElMessage.success(`已为 ${merchantCount} 个商户配置产品：${rateInfo}`)
    batchConfigVisible.value = false
    loading.value = false
  }, 300)
}

// 产品配置
const productConfigVisible = ref(false)
const productConfigFormRef = ref(null)
const productConfigForm = reactive({
  merchantId: '',
  productId: '',
  productName: '',
  selectedProducts: [],
  batchRate: 3.00,
  productRates: []
})

// 移除产品费率
const removeProductRate = (productId) => {
  // 从产品费率列表中移除
  const index = productConfigForm.productRates.findIndex(item => item.productId === productId);
  if (index !== -1) {
    productConfigForm.productRates.splice(index, 1);
  }
  
  // 从已选产品中移除
  const selectedIndex = productConfigForm.selectedProducts.indexOf(productId);
  if (selectedIndex !== -1) {
    productConfigForm.selectedProducts.splice(selectedIndex, 1);
  }
}

// 支付产品列表
const paymentProducts = ref([
  { id: 1, productName: '微信支付', productCode: 'WX001' },
  { id: 2, productName: '支付宝', productCode: 'ZFB001' },
  { id: 3, productName: '银联支付', productCode: 'YL001' },
  { id: 4, productName: '云闪付', productCode: 'YSF001' },
  { id: 5, productName: '快捷支付', productCode: 'QP001' },
  { id: 6, productName: '扫码支付', productCode: 'SCAN001' },
  { id: 7, productName: '国际信用卡', productCode: 'ICC001' },
  { id: 8, productName: '聚合支付', productCode: 'AGG001' }
])

// 监听选择产品变化
watch(() => productConfigForm.selectedProducts, (newVal, oldVal) => {
  if (newVal && oldVal) {
    watchSelectedProducts()
  }
}, { deep: true })

// 监听批量配置中选择产品变化
watch(() => batchConfigForm.selectedProducts, (newVal, oldVal) => {
  if (newVal && oldVal) {
    watchBatchSelectedProducts()
  }
}, { deep: true })

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.product-list-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.el-card {
  overflow-x: auto;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
  width: 100%;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-row .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.operation-dropdown {
  display: flex;
  justify-content: center;
  width: 100%;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.rate-input-group {
  display: flex;
  align-items: center;
}

.rate-unit {
  margin-left: 5px;
  color: var(--el-text-color-regular);
}

/* 强制表格自动填充空间 */
.product-rate-list .el-table {
  width: 100%;
  table-layout: fixed;
}

.product-rate-list .el-table__body {
  width: 100% !important;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.product-rate-list {
  margin-top: 20px;
}

.selected-merchants {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.merchant-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style> 
