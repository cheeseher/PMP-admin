<template>
  <div class="payment-channel-container">
    <el-card shadow="never">
      <el-table
        :data="channelList"
        border
        stripe
        style="width: 100%">
        <el-table-column 
          type="index" 
          label="序号" 
          width="70" 
          align="center" />
        <el-table-column 
          prop="id" 
          label="通道编码" 
          width="120">
          <template #default="scope">
            <div class="code-cell">
              <span>{{ scope.row.id }}</span>
              <el-tooltip content="复制编码" placement="top">
                <el-icon class="copy-icon" @click="copyContent(scope.row.id)"><CopyDocument /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column 
          prop="name" 
          label="通道名称" 
          min-width="150" />
        <el-table-column 
          prop="status" 
          label="状态" 
          width="100" 
          align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '启用' ? 'success' : 'info'" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          prop="feeRate" 
          label="费率" 
          width="100" 
          align="center" />
        <el-table-column 
          prop="limitRange" 
          label="单笔限额" 
          min-width="180" 
          align="center" />
        <el-table-column 
          label="操作" 
          width="120" 
          align="center" 
          fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              plain 
              @click="handlePayment(scope.row)">
              发起支付
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

// 支付通道数据
const channelList = ref([
  {
    id: '1119',
    name: '口令红包',
    status: '禁用',
    feeRate: '3.30%',
    limitRange: '¥300.00 ~ ¥2000.00'
  },
  {
    id: '119',
    name: '零花钱',
    status: '启用',
    feeRate: '5.80%',
    limitRange: '¥50.00 ~ ¥1000.00'
  },
  {
    id: '1111',
    name: '数字人民币',
    status: '启用',
    feeRate: '0.60%',
    limitRange: '¥100.00 ~ ¥5000.00'
  },
  {
    id: '1112',
    name: 'uid小额',
    status: '启用',
    feeRate: '5.30%',
    limitRange: '¥200.00 ~ ¥3000.00'
  },
  {
    id: '1115',
    name: 'uid超大',
    status: '启用',
    feeRate: '3.00%',
    limitRange: '¥2000.00 ~ ¥20000.00'
  },
  {
    id: '1114',
    name: 'uid大额',
    status: '启用',
    feeRate: '3.20%',
    limitRange: '¥800.00 ~ ¥20000.00'
  },
  {
    id: '1128',
    name: '云闪付',
    status: '启用',
    feeRate: '4.00%',
    limitRange: '¥100.00 ~ ¥2000.00'
  },
  {
    id: '1117',
    name: '支付宝小额包',
    status: '启用',
    feeRate: '1.30%',
    limitRange: '¥300.00 ~ ¥20000.00'
  },
  {
    id: '116',
    name: '支付宝包uid大额',
    status: '禁用',
    feeRate: '4.70%',
    limitRange: '¥800.00 ~ ¥20000.00'
  },
  {
    id: '1113',
    name: 'uid中额',
    status: '启用',
    feeRate: '3.80%',
    limitRange: '¥500.00 ~ ¥20000.00'
  }
])

// 处理支付
const handlePayment = (channel) => {
  ElMessage.success(`正在发起${channel.name}支付`)
  // 实际操作需要与后端对接
}

// 复制内容
const copyContent = (content) => {
  try {
    navigator.clipboard.writeText(content)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
    console.error('复制失败:', error)
  }
}
</script>

<style scoped>
.payment-channel-container {
  padding: 20px;
}

.code-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.copy-icon {
  margin-left: 8px;
  font-size: 14px;
  color: #909399;
  cursor: pointer;
}

.copy-icon:hover {
  color: #409EFF;
}
</style> 