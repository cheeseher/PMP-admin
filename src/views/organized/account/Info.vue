<!-- 商户账户信息页面 -->
<template>
  <div class="account-info-container">
    <el-card shadow="never" class="info-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">商户信息</span>
          
          <div class="header-filter" v-if="subAccounts.length > 0">
             <el-select v-model="selectedMerchantId" :placeholder="`${merchantInfo.name} (${merchantInfo.id})`" style="width: 200px" clearable>
              <el-option :label="`${merchantInfo.name} (${merchantInfo.id})`" value="" />
              <el-option 
                v-for="account in subAccounts" 
                :key="account.id" 
                :label="`${account.productName} (${account.id})`" 
                :value="account.id" 
              />
            </el-select>
          </div>
        </div>
      </template>
      
      <div class="info-content">
        <div class="info-item">
          <span class="label">商户名称：</span>
          <span class="value">{{ displayedMerchantInfo.name }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">登录账号：</span>
          <span class="value">{{ displayedMerchantInfo.username }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">商户号：</span>
          <span class="value">{{ displayedMerchantInfo.id }}</span>
          <el-button link type="primary" @click="handleCopy(displayedMerchantInfo.id)">复制</el-button>
        </div>
        
        <div class="info-item">
          <span class="label">商户秘钥：</span>
          <span class="value">{{ showToken ? displayedMerchantInfo.token : '************************' }}</span>
          <el-button link type="primary" @click="handleResetToken">重置</el-button>
          <el-button link type="primary" @click="handleShowToken">{{ showToken ? '隐藏' : '显示' }}</el-button>
        </div>
        
        <div class="info-item">
          <span class="label">商户配置：</span>
          <div class="whitelist-container">
            <div class="whitelist-header">
              <span>后台白名单</span>
              <el-button link type="primary" @click="handleAddWhitelist">+ 添加白名单</el-button>
            </div>
            <div v-if="displayedMerchantInfo.whitelist.length === 0" class="empty-whitelist">
              暂无白名单配置
            </div>
            <div v-else class="whitelist-list">
              <div v-for="(item, index) in displayedWhitelist" :key="index" class="whitelist-item">
                <span>{{ item }}</span>
                <el-button link type="danger" size="small" @click="handleRemoveWhitelist(index)">移除</el-button>
              </div>
              <div v-if="displayedMerchantInfo.whitelist.length > displayLimit" class="more-button-container">
                <el-button type="primary" plain size="small" @click="showAllWhitelist">
                  查看更多 ({{ displayedMerchantInfo.whitelist.length - displayLimit }}项)
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="info-item">
          <span class="label">谷歌验证：</span>
          <div class="google-auth">
            <el-tag v-if="displayedMerchantInfo.googleAuthEnabled" type="success">已验证</el-tag>
            <el-tag v-else type="warning">未验证</el-tag>
            <el-button v-if="!displayedMerchantInfo.googleAuthEnabled" type="primary" size="small" @click="handleGoogleAuth" style="margin-left: 12px">立即验证</el-button>
          </div>
        </div>
        
        <div class="info-item">
          <span class="label">注册时间：</span>
          <span class="value">{{ displayedMerchantInfo.registerTime }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">上次登录：</span>
          <span class="value">{{ displayedMerchantInfo.lastLoginTime }}</span>
          <span class="ip-info">(IP: {{ displayedMerchantInfo.lastLoginIp }} {{ displayedMerchantInfo.lastLoginLocation }})</span>
        </div>
      </div>
    </el-card>

    <!-- 添加白名单弹窗 -->
    <el-dialog
      v-model="whitelistDialogVisible"
      title="添加白名单"
      width="500px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form :model="whitelistForm" ref="whitelistFormRef">
        <el-form-item>
          <el-input
            v-model="whitelistForm.ip"
            placeholder="请输入白名单IP地址"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="whitelistDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddWhitelistConfirm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看全部白名单弹窗 -->
    <el-dialog
      v-model="allWhitelistDialogVisible"
      title="全部后台白名单"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="displayedMerchantInfo.whitelist.length === 0" class="empty-whitelist">
        暂无白名单配置
      </div>
      <div v-else class="whitelist-dialog-list">
        <div v-for="(item, index) in displayedMerchantInfo.whitelist" :key="index" class="whitelist-dialog-item">
          <span>{{ item }}</span>
          <el-button link type="danger" size="small" @click="handleRemoveWhitelistFromDialog(index)">移除</el-button>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="allWhitelistDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleAddWhitelist">添加白名单</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 谷歌验证器设置弹窗 -->
    <el-dialog
      v-model="googleAuthDialogVisible"
      title="谷歌验证器"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      :show-close="false"
    >
      <template #header>
        <div class="dialog-header">
          <span>谷歌验证器</span>
          <el-button class="close-btn" type="text" @click="handleCloseGoogleAuth">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <el-steps :active="activeStep" finish-status="success" class="auth-steps">
        <el-step title="第一步：创建秘钥" />
        <el-step title="第二步：验证身份" />
        <el-step title="第三步：完成设置" />
      </el-steps>

      <div class="auth-content">
        <!-- 第一步：创建秘钥 -->
        <div v-if="activeStep === 1" class="step-content">
          <div class="qrcode-container">
            <img :src="qrCodeUrl" alt="Google Authenticator QR Code" class="qrcode-img" />
          </div>
          <div class="secret-key">
            <span class="key-label">安全秘钥：</span>
            <span class="key-value">{{ secretKey }}</span>
            <el-button link type="primary" @click="handleCopy(secretKey)">复制</el-button>
          </div>
          <div class="auth-tip">
            打开手机谷歌验证器，并扫描上方二维码或手动输入安全秘钥
          </div>
          <div class="step-footer">
            <el-button @click="handleCloseGoogleAuth">取消</el-button>
            <el-button type="primary" @click="activeStep = 2">下一步</el-button>
          </div>
        </div>

        <!-- 第二步：验证身份 -->
        <div v-if="activeStep === 2" class="step-content">
          <div class="verify-container">
            <el-form :model="authForm" ref="authFormRef">
              <el-form-item>
                <el-input
                  v-model="authForm.code"
                  placeholder="请输入6位验证码"
                  maxlength="6"
                  clearable
                  class="auth-input"
                />
              </el-form-item>
            </el-form>
          </div>
          <div class="step-footer">
            <el-button @click="activeStep = 1">上一步</el-button>
            <el-button type="primary" @click="handleVerifyCode">下一步</el-button>
          </div>
        </div>

        <!-- 第三步：完成设置 -->
        <div v-if="activeStep === 3" class="step-content">
          <div class="success-message">
            <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
            <div class="success-text">恭喜您，谷歌验证器设置成功！</div>
          </div>
          <div class="step-footer">
            <el-button type="primary" @click="handleFinishSetup">完成</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheckFilled, Close } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { productList } from '@/data/productData'

const route = useRoute()

// 商户筛选
const subAccounts = ref([])
const selectedMerchantId = ref('')
const currentLoginMerchantId = ref('')

// 获取当前登录商户的子账户
const fetchSubAccounts = () => {
  const merchantId = route.query.merchant || '2'
  if (!merchantId) return

  currentLoginMerchantId.value = merchantId
  
  // 查找当前商户
  const currentMerchant = productList.find(p => String(p.id) === String(merchantId))
  
  if (currentMerchant) {
    // Populate main merchant info
    merchantInfo.value = {
      name: currentMerchant.productName,
      username: `admin_${currentMerchant.id}`,
      id: currentMerchant.id,
      token: `sk_live_${currentMerchant.id}_token`,
      whitelist: ['192.168.1.100'],
      googleAuthEnabled: true,
      registerTime: currentMerchant.registerTime,
      lastLoginTime: '2024-06-03 10:30:25',
      lastLoginIp: currentMerchant.authIp || '192.168.1.101',
      lastLoginLocation: '中国上海'
    }
    // Initialize displayed info
    displayedMerchantInfo.value = { ...merchantInfo.value }
  }

  if (currentMerchant && currentMerchant.subAccounts && currentMerchant.subAccounts.length > 0) {
    // 获取子账户详情
    const accounts = []
    currentMerchant.subAccounts.forEach(subId => {
      const sub = productList.find(p => p.id === subId)
      if (sub) {
        accounts.push(sub)
      }
    })
    subAccounts.value = accounts
  } else {
    subAccounts.value = []
  }
}

// 监听商户ID变化
watch(() => route.query.merchant, (newId) => {
  if (newId) {
    selectedMerchantId.value = ''
    fetchSubAccounts()
  }
})

// 默认商户信息 (Ref)
const merchantInfo = ref({
  name: '',
  username: '',
  id: '',
  token: '',
  whitelist: [],
  googleAuthEnabled: false,
  registerTime: '',
  lastLoginTime: '',
  lastLoginIp: '',
  lastLoginLocation: ''
})

// Current displayed merchant info
const displayedMerchantInfo = ref({
  name: '',
  username: '',
  id: '',
  token: '',
  whitelist: [],
  googleAuthEnabled: false,
  registerTime: '',
  lastLoginTime: '',
  lastLoginIp: '',
  lastLoginLocation: ''
})

// Update displayed info when filter changes
watch(selectedMerchantId, (newId) => {
  if (newId) {
    const sub = subAccounts.value.find(a => String(a.id) === String(newId))
    if (sub) {
      displayedMerchantInfo.value = {
        name: sub.productName,
        username: `user_${sub.id}`,
        id: sub.id,
        token: `sub_token_${sub.id}_xyz_mocked`,
        whitelist: ['192.168.1.1', '10.0.0.1'],
        googleAuthEnabled: false,
        registerTime: sub.registerTime || '2024/05/20 10:00:00',
        lastLoginTime: '2024/06/01 12:30:45',
        lastLoginIp: '183.14.132.88',
        lastLoginLocation: '中国广东深圳'
      }
    }
  } else {
    // Reset to main
    displayedMerchantInfo.value = { ...merchantInfo.value }
  }
})

// 白名单显示限制
const displayLimit = 3
const displayedWhitelist = computed(() => {
  return displayedMerchantInfo.value.whitelist.slice(0, displayLimit)
})

// ... (rest of the code)

// 重置Token



// 是否显示Token
const showToken = ref(false)

// 白名单弹窗相关
const whitelistDialogVisible = ref(false)
const allWhitelistDialogVisible = ref(false)
const whitelistForm = reactive({
  ip: ''
})
const whitelistFormRef = ref(null)

// 谷歌验证相关
const googleAuthDialogVisible = ref(false)
const activeStep = ref(1)
const secretKey = ref('A6ST5PEOBHOK3QAF')
const qrCodeUrl = ref('data:image/png;base64,...') // 这里需要后端提供实际的二维码图片
const authForm = reactive({
  code: ''
})

onMounted(() => {
  fetchSubAccounts()
})

// 复制功能
const handleCopy = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 显示/隐藏Token
const handleShowToken = () => {
  showToken.value = !showToken.value
}

// 重置Token
const handleResetToken = () => {
  // 判断是否已绑定谷歌验证器
  if (!displayedMerchantInfo.value.googleAuthEnabled) {
    ElMessageBox.alert('重置商户秘钥需要先绑定谷歌验证器', '提示', {
      confirmButtonText: '知道了',
      type: 'warning',
      callback: () => {
        handleGoogleAuth() // 直接打开谷歌验证器设置
      }
    })
    return
  }
  
  // 已绑定谷歌验证器,弹出验证码输入框
  ElMessageBox.prompt('请输入谷歌验证器的6位验证码', '安全验证', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d{6}$/,
    inputErrorMessage: '请输入6位数字验证码',
    inputType: 'password'
  }).then(({ value }) => {
    // 验证码验证通过后,确认是否重置
    ElMessageBox.confirm('确认要重置商户秘钥吗？重置后需要重新配置API对接参数', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // TODO: 调用API重置Token
      // 模拟重置生成新的Token
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let newToken = ''
      for (let i = 0; i < 32; i++) {
        newToken += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      displayedMerchantInfo.value.token = newToken
      showToken.value = true
      ElMessage.success('商户秘钥重置成功')
    }).catch(() => {})
  }).catch(() => {})
}

// 打开添加白名单弹窗
const handleAddWhitelist = () => {
  whitelistDialogVisible.value = true
}

// 关闭弹窗时重置表单
const handleDialogClose = () => {
  whitelistForm.ip = ''
}

// 确认添加白名单
const handleAddWhitelistConfirm = () => {
  if (!whitelistForm.ip) {
    ElMessage.warning('请输入IP地址')
    return
  }
  // TODO: 调用API添加白名单
  displayedMerchantInfo.value.whitelist.push(whitelistForm.ip)
  whitelistDialogVisible.value = false
  ElMessage.success('添加成功')
}

// 移除白名单
const handleRemoveWhitelist = (index) => {
  ElMessageBox.confirm('确认要移除该IP地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用API移除白名单
    displayedMerchantInfo.value.whitelist.splice(index, 1)
    ElMessage.success('移除成功')
  }).catch(() => {})
}

// 显示全部白名单
const showAllWhitelist = () => {
  allWhitelistDialogVisible.value = true
}

// 从弹窗中移除白名单
const handleRemoveWhitelistFromDialog = (index) => {
  ElMessageBox.confirm('确认要移除该IP地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用API移除白名单
    displayedMerchantInfo.value.whitelist.splice(index, 1)
    ElMessage.success('移除成功')
  }).catch(() => {})
}

// 打开谷歌验证设置
const handleGoogleAuth = () => {
  googleAuthDialogVisible.value = true
  activeStep.value = 1
}

// 验证验证码
const handleVerifyCode = () => {
  if (!authForm.code) {
    ElMessage.warning('请输入验证码')
    return
  }
  if (authForm.code.length !== 6) {
    ElMessage.warning('请输入6位验证码')
    return
  }
  // TODO: 调用API验证验证码
  activeStep.value = 3
}

// 完成设置
const handleFinishSetup = () => {
  googleAuthDialogVisible.value = false
  displayedMerchantInfo.value.googleAuthEnabled = true
  ElMessage.success('谷歌验证器设置成功')
}

// 关闭谷歌验证设置
const handleCloseGoogleAuth = () => {
  ElMessageBox.confirm('确认要取消设置谷歌验证器吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    googleAuthDialogVisible.value = false
    activeStep.value = 1
    authForm.code = ''
  }).catch(() => {})
}
</script>

<style scoped>
.account-info-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.info-card {
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
  border-radius: 6px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.header-filter {
  margin-left: auto;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  position: relative;
  padding-left: 12px;
}

.header-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  border-radius: 2px;
}

.info-content {
  padding: 10px 20px 30px;
}

.info-item {
  margin-bottom: 28px;
  display: flex;
  align-items: flex-start;
  position: relative;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  width: 100px;
  color: #606266;
  line-height: 32px;
  flex-shrink: 0;
  text-align: right;
  padding-right: 12px;
  font-weight: 500;
}

.info-item .value {
  color: #303133;
  line-height: 32px;
}

.token-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  margin-left: 100px;
  background-color: #f8f8f8;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #e6a23c;
}

.whitelist-container {
  flex: 1;
}

.whitelist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #ebeef5;
}

.empty-whitelist {
  color: #909399;
  font-size: 14px;
  padding: 30px 0;
  text-align: center;
  background: #f8f8f8;
  border-radius: 4px;
}

.whitelist-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.whitelist-item {
  padding: 10px 16px;
  background: #f8f8f8;
  border-radius: 4px;
  color: #606266;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.whitelist-item:hover {
  border-left-color: #409EFF;
  background: #f0f5ff;
}

.google-auth {
  display: flex;
  align-items: center;
}

.ip-info {
  color: #909399;
  margin-left: 12px;
  line-height: 32px;
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin: -20px -20px 0;
  border-bottom: 1px solid #dcdfe6;
}

.dialog-header span {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.close-btn {
  padding: 0;
  font-size: 20px;
}

.auth-steps {
  margin: 30px 0 40px;
  padding: 0 40px;
}

.step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 60px 40px;
}

.qrcode-container {
  margin-bottom: 24px;
  padding: 30px;
  background: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.qrcode-img {
  width: 180px;
  height: 180px;
  display: block;
}

.secret-key {
  font-size: 15px;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 4px;
  width: 100%;
  justify-content: center;
}

.key-label {
  color: #606266;
}

.key-value {
  font-family: monospace;
  letter-spacing: 1px;
}

.auth-tip {
  color: #909399;
  font-size: 14px;
  margin: 20px 0 30px;
  text-align: center;
  line-height: 1.5;
}

.verify-container {
  width: 100%;
  max-width: 300px;
  margin: 20px 0 40px;
}

.auth-input {
  width: 100%;
}

.auth-input :deep(.el-input__inner) {
  text-align: center;
  letter-spacing: 4px;
  font-size: 20px;
  font-family: monospace;
}

.step-footer {
  margin-top: 0;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.success-message {
  text-align: center;
  margin: 50px 0;
}

.success-icon {
  font-size: 56px;
  color: #67c23a;
  margin-bottom: 20px;
}

.success-text {
  font-size: 18px;
  color: #303133;
  font-weight: 500;
}

.more-button-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.whitelist-dialog-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.whitelist-dialog-item {
  padding: 10px 16px;
  background: #f8f8f8;
  border-radius: 4px;
  color: #606266;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.whitelist-dialog-item:hover {
  border-left-color: #409EFF;
  background: #f0f5ff;
}
</style> 