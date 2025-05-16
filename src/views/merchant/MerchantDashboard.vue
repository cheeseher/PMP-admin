<template>
  <div class="merchant-dashboard-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>商户工作台</span>
        </div>
      </template>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else-if="error" class="error-container">
        <el-alert type="error" :title="error" show-icon :closable="false" />
        <el-button @click="fetchMerchantData" style="margin-top: 15px;">重试</el-button>
      </div>
      <div v-else-if="merchantInfo" class="dashboard-content">
        <el-descriptions title="商户基本信息" :column="2" border>
          <el-descriptions-item label="商户名称">{{ merchantInfo.productName }}</el-descriptions-item>
          <el-descriptions-item label="商户ID">{{ merchantInfo.id }}</el-descriptions-item>
          <el-descriptions-item label="商户账号">{{ merchantInfo.productId }}</el-descriptions-item>
          <el-descriptions-item label="商户号">{{ merchantInfo.productNo }}</el-descriptions-item>
          <el-descriptions-item label="当前余额">
            <el-tag type="success">{{ formatAmount(merchantInfo.balance) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="merchantInfo.verified === 'Y' ? 'success' : 'danger'">
              {{ merchantInfo.verified === 'Y' ? '已启用' : '已禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header><div>快捷操作</div></template>
              <el-button type="primary" plain @click="goTo('/merchant/trade/payment')">查看支付订单</el-button>
              <el-button plain @click="goTo('/merchant/finance/prepaid')">查看预付记录</el-button>
              <el-button plain @click="goTo('/merchant/account/info')">账户信息</el-button>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header><div>数据概览 (模拟)</div></template>
              <p>今日订单数: 120</p>
              <p>今日交易额: ¥ 24,500.00</p>
            </el-card>
          </el-col>
        </el-row>

      </div>
      <div v-else>
        <el-empty description="未能加载商户信息，请检查参数或联系管理员" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
// 假设 productList 是一个包含所有商户数据的本地模拟数据源
import { productList } from '@/data/productData'; 

const route = useRoute();
const router = useRouter();

const merchantInfo = ref(null);
const loading = ref(true);
const error = ref(null);

const formatAmount = (amount) => {
  if (typeof amount !== 'number') return '0.00';
  return amount.toFixed(2);
};

const fetchMerchantData = async () => {
  loading.value = true;
  error.value = null;
  const merchantIdFromQuery = route.query.merchant;
  const token = route.query.token; // 虽然目前没用，但可以保留用于后续验证

  console.log(`MerchantDashboard: Attempting to load data for merchant ID: ${merchantIdFromQuery}, token: ${token}`);

  if (!merchantIdFromQuery) {
    error.value = '商户ID缺失，无法加载数据。';
    merchantInfo.value = null;
    loading.value = false;
    ElMessage.error(error.value);
    return;
  }

  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 300)); 

  const foundMerchant = productList.find(m => String(m.id) === String(merchantIdFromQuery));

  if (foundMerchant) {
    merchantInfo.value = { ...foundMerchant };
    console.log('MerchantDashboard: Data loaded:', merchantInfo.value);
  } else {
    error.value = `未能找到ID为 ${merchantIdFromQuery} 的商户信息。`;
    merchantInfo.value = null;
    ElMessage.error(error.value);
  }
  loading.value = false;
};

const goTo = (path) => {
  router.push(path);
};

// 监听路由查询参数的变化，特别是 merchantId
watch(() => route.query.merchant, (newMerchantId) => {
  if (newMerchantId) {
    fetchMerchantData();
  }
}, { immediate: true }); // 立即执行一次，以处理初始加载

onMounted(() => {
  // fetchMerchantData(); // 已经被 watch 的 immediate:true 覆盖了，所以这里可以不调用
  // 但如果 watch 中没有 immediate:true，则需要在此处调用
  if (!route.query.merchant) {
    error.value = '商户ID未在URL参数中提供。';
    loading.value = false;
    ElMessage.warning(error.value);
  }
});

</script>

<style scoped>
.merchant-dashboard-container {
  padding: 0; /* el-card has its own padding */
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.loading-container, .error-container {
  padding: 20px;
  text-align: center;
}
.dashboard-content {
  padding: 10px;
}
.el-descriptions {
  margin-top: 10px;
}
.el-button + .el-button {
  margin-left: 10px;
}
</style> 