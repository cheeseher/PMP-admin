<template>
  <div class="login-container">
    <div class="login-content">
      <el-card class="login-card" shadow="hover">
        <template #header>
          <div class="login-title">PMP系统登录</div>
        </template>
        <el-form @submit.prevent="handleLogin" class="login-form" ref="loginFormRef" :model="loginForm" :rules="loginRules">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              :prefix-icon="User"
              size="large"
              clearable
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              size="large"
              show-password
              clearable
            />
          </el-form-item>
          <el-form-item class="captcha-form-item" prop="imageCaptcha">
            <div class="captcha-container">
              <el-input
                v-model="loginForm.imageCaptcha"
                placeholder="图形验证码"
                :prefix-icon="Lock"
                size="large"
                class="captcha-input"
                clearable
              />
              <img src="https://via.placeholder.com/100x40.png?text=1+6=?" alt="图形验证码" class="captcha-image" @click="refreshImageCaptcha" />
            </div>
          </el-form-item>
          <el-form-item prop="googleCaptcha">
            <el-input
              v-model="loginForm.googleCaptcha"
              placeholder="谷歌验证码"
              :prefix-icon="Lock"
              size="large"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit" class="login-button" size="large" :loading="loading">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { User, Lock } from '@element-plus/icons-vue';
import { ElMessage, ElLoading } from 'element-plus';
import { useRouter } from 'vue-router'; 
import axios from 'axios'; // 导入axios，预期用于真实的API调用

const router = useRouter();
const loading = ref(false);

const loginForm = reactive({
  username: '123',
  password: '123456',
  imageCaptcha: '123',
  googleCaptcha: '123456',
});

// 表单验证规则
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  imageCaptcha: [{ required: true, message: '请输入图形验证码', trigger: 'blur' }],
  googleCaptcha: [{ required: true, message: '请输入谷歌验证码', trigger: 'blur' }]
};

const loginFormRef = ref(null);

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    // 表单验证
    await loginFormRef.value.validate();
    
    // 显示加载状态
    loading.value = true;
    
    try {
      // API调用 - 在实际项目中替换为真实的API端点
      // 这里使用模拟API调用，在真实项目中应替换为实际接口
      const response = await loginAPI(loginForm);
      
      // 处理登录成功
      const { token, userInfo } = response;
      
      // 存储token和用户信息
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      // 显示成功消息
      ElMessage.success('登录成功');
      
      // 跳转到首页
      router.push('/');
    } catch (error) {
      // 处理API错误
      let errorMsg = '登录失败';
      if (error.response) {
        // 处理不同的错误状态码
        switch (error.response.status) {
          case 401:
            errorMsg = '用户名或密码错误';
            break;
          case 403:
            errorMsg = '验证码错误';
            break;
          case 429:
            errorMsg = '请求过于频繁，请稍后再试';
            break;
          default:
            errorMsg = error.response.data?.message || '服务器错误';
        }
      }
      ElMessage.error(errorMsg);
    } finally {
      // 隐藏加载状态
      loading.value = false;
    }
  } catch (validationError) {
    // 表单验证失败
    ElMessage.warning('请完成所有必填项');
  }
};

// 模拟API调用
// 在真实项目中，此函数应该使用axios调用实际的后端API
async function loginAPI(credentials) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 验证测试账号
      if (credentials.username === '123' && 
          credentials.password === '123456' && 
          credentials.googleCaptcha === '123456') {
        resolve({
          token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
          userInfo: {
            id: 1,
            username: credentials.username,
            name: '测试用户',
            role: 'admin'
          }
        });
      } else {
        // 模拟错误响应
        reject({
          response: {
            status: 401,
            data: { message: '用户名或密码错误' }
          }
        });
      }
    }, 1000); // 模拟网络延迟1秒
  });
}

const refreshImageCaptcha = () => {
  // 在实际项目中，此函数应该从后端获取新的验证码图片
  const newCaptcha = Math.random().toString(36).substring(2, 8);
  document.querySelector('.captcha-image').src = `https://via.placeholder.com/100x40.png?text=${newCaptcha}`;
  ElMessage.info('图形验证码已刷新');
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #304156;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to bottom right, rgba(64, 158, 255, 0.03), rgba(64, 158, 255, 0.03), transparent);
  transform: rotate(-15deg);
  pointer-events: none;
}

.login-content {
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-card {
  width: 420px;
  border-radius: var(--border-radius-base, 4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  padding-bottom: 10px;
  letter-spacing: 1px;
  position: relative;
}

.login-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background-color: #409EFF;
  border-radius: 3px;
}

.login-form {
  padding: 20px 0;
}

.login-form .el-form-item {
  margin-bottom: 25px;
}

.captcha-form-item {
  width: 100%;
}

.captcha-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.captcha-input {
  flex: 1;
  margin-right: 10px;
}

.captcha-image {
  width: 110px;
  height: 40px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
}

.captcha-image:hover {
  border-color: #c0c4cc;
  filter: brightness(1.05);
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  letter-spacing: 1px;
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.3);
}

/* Element Plus 图标颜色调整 */
:deep(.el-input__prefix .el-icon) {
  color: #909399;
}

:deep(.el-input:hover .el-input__prefix .el-icon) {
  color: #409EFF;
}
</style> 