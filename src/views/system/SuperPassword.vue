<!-- 系统管理/超级密码设置 - 超级密码设置页面 -->
<template>
  <div class="super-password-container">
    <el-card shadow="never" class="form-card">
      <template #header>
        <div class="card-header">
          <span>超级密码设置</span>
          <span class="header-tip">超级密码用于特定操作的二次验证，提高系统安全性</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        label-position="right"
        status-icon
      >
        <el-form-item label="当前超级密码" prop="currentPassword">
          <el-input
            v-model="form.currentPassword"
            type="password"
            placeholder="请输入当前超级密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新超级密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新超级密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认新超级密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存设置</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 表单引用
const formRef = ref(null)

// 表单数据
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 校验确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  currentPassword: [
    { required: true, message: '请输入当前超级密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新超级密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8个字符', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
      message: '密码应包含大小写字母、数字和特殊字符',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新超级密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 模拟表单提交
      setTimeout(() => {
        ElMessage.success('超级密码设置已保存')
        // 清空密码字段
        form.currentPassword = ''
        form.newPassword = ''
        form.confirmPassword = ''
      }, 800)
    } else {
      return false
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  ElMessage.info('表单已重置')
}
</script>

<style scoped>
.super-password-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-tip {
  font-size: 13px;
  color: #909399;
  font-weight: normal;
}

.form-card {
  width: 100%;
}
</style> 