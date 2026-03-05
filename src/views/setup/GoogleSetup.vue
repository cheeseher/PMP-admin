<!-- 首次登录 - 强制绑定 Google 验证器页面 -->
<template>
  <div class="setup-container">
    <div class="setup-content">
      <!-- 顶部标题区域 -->
      <div class="setup-header">
        <div class="setup-logo">PMP</div>
        <h2 class="setup-title">账户安全验证</h2>
        <p class="setup-subtitle">为保障账户安全，首次登录需绑定 Google Authenticator</p>
      </div>

      <!-- 主卡片 -->
      <el-card class="setup-card" shadow="always">
        <!-- 进度步骤 -->
        <el-steps :active="activeStep" finish-status="success" class="auth-steps">
          <el-step title="第一步：创建秘钥" />
          <el-step title="第二步：验证身份" />
          <el-step title="第三步：完成设置" />
        </el-steps>

        <div class="step-body">
          <!-- 第一步：扫码 -->
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
              打开手机谷歌验证器，扫描上方二维码或手动输入安全秘钥
            </div>
            <div class="step-footer">
              <el-button type="primary" size="large" @click="activeStep = 2">
                下一步
              </el-button>
            </div>
          </div>

          <!-- 第二步：输入验证码确认 -->
          <div v-if="activeStep === 2" class="step-content">
            <div class="verify-tip">
              <el-icon class="tip-icon"><Warning /></el-icon>
              <span>请在谷歌验证器 App 中查看 6 位验证码</span>
            </div>
            <div class="verify-container">
              <el-input
                v-model="authCode"
                placeholder="请输入 6 位验证码"
                maxlength="6"
                size="large"
                clearable
                class="auth-input"
                @keyup.enter="handleVerifyCode"
              />
            </div>
            <div class="step-footer">
              <el-button size="large" @click="activeStep = 1">上一步</el-button>
              <el-button type="primary" size="large" :loading="verifyLoading" @click="handleVerifyCode">
                验证并完成
              </el-button>
            </div>
          </div>

          <!-- 第三步：完成 -->
          <div v-if="activeStep === 3" class="step-content success-content">
            <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
            <div class="success-title">绑定成功！</div>
            <div class="success-desc">Google 验证器已成功绑定，账户安全已提升</div>
            <div class="redirect-tip">
              <el-icon class="loading-icon is-loading"><Loading /></el-icon>
              <span>{{ countdown }} 秒后自动跳转至后台...</span>
            </div>
            <el-button type="primary" size="large" @click="goToDashboard">立即进入</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheckFilled, Warning, Loading } from '@element-plus/icons-vue'

const router = useRouter()

const activeStep = ref(1)
const authCode = ref('')
const verifyLoading = ref(false)
const countdown = ref(3)

// [逻辑] 实际项目中由后端接口动态生成二维码 URL 和秘钥
const secretKey = ref('JBSWY3DPEHPK3PXP')
const qrCodeUrl = ref('https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/PMP:admin?secret=JBSWY3DPEHPK3PXP%26issuer=PMP')

let countdownTimer = null

// 复制秘钥
const handleCopy = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

// 验证验证码
const handleVerifyCode = () => {
  if (!authCode.value) {
    ElMessage.warning('请输入验证码')
    return
  }
  if (authCode.value.length !== 6) {
    ElMessage.warning('请输入 6 位验证码')
    return
  }
  
  verifyLoading.value = true
  // [逻辑] 实际项目中应调用后端 API 进行 TOTP 校验
  setTimeout(() => {
    verifyLoading.value = false
    // 更新本地存储中的 googleAuth 状态
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    userInfo.googleAuth = true
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    
    activeStep.value = 3
    startCountdown()
  }, 800)
}

// 倒计时后跳转
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      goToDashboard()
    }
  }, 1000)
}

const goToDashboard = () => {
  if (countdownTimer) clearInterval(countdownTimer)
  router.push('/dashboard')
}

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.setup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #304156;
  background-image: linear-gradient(135deg, #304156 0%, #1a2a3f 100%);
  position: relative;
  overflow: hidden;
}

.setup-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 40%, rgba(64, 158, 255, 0.06) 0%, transparent 60%);
  pointer-events: none;
}

.setup-content {
  z-index: 1;
  width: 100%;
  max-width: 560px;
  padding: 20px;
}

.setup-header {
  text-align: center;
  margin-bottom: 28px;
  color: #fff;
}

.setup-logo {
  font-size: 22px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 16px;
  letter-spacing: 2px;
}

.setup-title {
  font-size: 26px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #fff;
}

.setup-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.setup-card {
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-steps {
  padding: 0 20px;
  margin-bottom: 32px;
}

.step-body {
  padding: 0 10px 10px;
}

.step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 二维码容器 */
.qrcode-container {
  margin-bottom: 20px;
  padding: 24px;
  background: #f5f7fa;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.qrcode-img {
  width: 180px;
  height: 180px;
  display: block;
}

/* 秘钥展示 */
.secret-key {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f7fa;
  padding: 12px 20px;
  border-radius: 8px;
  width: 100%;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 15px;
}

.key-label {
  color: #606266;
}

.key-value {
  font-family: monospace;
  letter-spacing: 2px;
  font-weight: 600;
  color: #303133;
}

.auth-tip {
  color: #909399;
  font-size: 13px;
  text-align: center;
  margin-bottom: 28px;
  line-height: 1.6;
}

/* 验证码输入 */
.verify-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e6a23c;
  font-size: 14px;
  margin-bottom: 20px;
}

.tip-icon {
  font-size: 16px;
}

.verify-container {
  width: 100%;
  max-width: 280px;
  margin-bottom: 28px;
}

.auth-input :deep(.el-input__inner) {
  text-align: center;
  letter-spacing: 6px;
  font-size: 22px;
  font-family: monospace;
  font-weight: 600;
}

/* 成功状态 */
.success-content {
  padding: 20px 0 10px;
}

.success-icon {
  font-size: 64px;
  color: #67c23a;
  margin-bottom: 16px;
}

.success-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.success-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 24px;
}

.redirect-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
  margin-bottom: 20px;
}

.loading-icon {
  font-size: 14px;
  color: #409eff;
}

/* 按钮区域 */
.step-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
  margin-top: 4px;
}

.step-footer .el-button {
  min-width: 120px;
}
</style>
