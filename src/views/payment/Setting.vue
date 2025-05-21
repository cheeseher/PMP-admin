<!-- 支付配置/支付设置 - 管理支付相关配置设置 -->
<template>
  <div class="payment-setting-container">
    <!-- 支付设置表单 -->
    <el-card shadow="never" class="setting-card">
      <template #header>
        <div class="card-header">
          <span>交易关闭设置</span>
          <el-button type="primary" size="small" @click="submitForm">保存设置</el-button>
        </div>
      </template>
      
      <el-form :model="settingForm" ref="formRef" :rules="rules" label-width="180px" class="setting-form">
        <el-form-item label="未支付订单关闭时间" prop="orderCloseTime">
          <el-input-number 
            v-model="settingForm.orderCloseTime" 
            :min="1" 
            :max="1440"
            :step="1"
            controls-position="right"
            style="width: 180px"
          />
          <span class="unit">分钟</span>
        </el-form-item>
      </el-form>
      
      <div class="setting-description">
        <el-alert type="info" :closable="false" show-icon>
          <template #title>
            <span>说明</span>
          </template>
          <p>未支付订单关闭时间：创建支付订单后，若用户在设定时间内未完成支付，系统将自动关闭该订单</p>
          <p>此设置将影响所有支付产品及商户，修改后立即生效</p>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 支付设置表单
const formRef = ref(null)
const settingForm = reactive({
  orderCloseTime: 5 // 未支付订单关闭时间（分钟）
})

// 表单验证规则
const rules = {
  orderCloseTime: [
    { required: true, message: '请输入未支付订单关闭时间', trigger: 'blur' },
    { type: 'number', min: 1, max: 1440, message: '时间范围在1-1440分钟之间', trigger: 'blur' }
  ]
}

// 表单提交
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 这里应该是调用API保存设置
      // saveSettings(settingForm)
      
      // 模拟保存成功
      setTimeout(() => {
        ElMessage.success('支付设置保存成功')
      }, 600)
    }
  })
}

// 获取支付设置
const fetchSettings = () => {
  // 这里应该是调用API获取设置
  // const res = await getSettings()
  // settingForm.orderCloseTime = res.data.orderCloseTime; // 示例：API成功返回数据后赋值
  
  // 模拟获取成功（当前为演示，并未实际从API获取或更新表单）
  setTimeout(() => {
    // 假设已经从API获取了数据，这里直接使用初始值
    // 在实际应用中，如果API返回了数据，应该在这里更新 settingForm
    console.log('已加载支付设置 (模拟数据)')
  }, 300)
}

// 初始化
onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.payment-setting-container {
  padding: 20px;
}

.setting-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.setting-form {
  max-width: 800px;
}

.unit {
  margin-left: 8px;
  color: #606266;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}

.setting-description {
  margin-top: 20px;
  max-width: 800px;
}

.setting-description p {
  margin: 8px 0;
  line-height: 1.5;
}
</style> 