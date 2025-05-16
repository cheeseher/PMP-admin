<template>
  <div class="multi-merchant-dashboard">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>多商户工作台 (主商户ID: {{ mainMerchantIdLocal }})</span>
        </div>
      </template>

      <div v-if="!currentSubAccountId">
        <el-empty description="请在页面顶部选择一个子账户以查看其数据"></el-empty>
      </div>

      <div v-else>
        <el-alert 
          :title="`当前查看子账户：${currentSubAccountName} (ID: ${currentSubAccountId})`" 
          type="success" 
          :closable="false" 
          show-icon 
          style="margin-bottom: 20px;"
        />

        <!-- 工作台核心内容 - 这里将使用标签页展示各个子账户的 dashboard -->
        <el-tabs v-if="displayMode === 'tabs' && subAccountsForTabs.length > 0" v-model="activeTabAccountId" type="border-card">
          <el-tab-pane
            v-for="subAccount in subAccountsForTabs"
            :key="subAccount.id"
            :label="`${subAccount.name} (ID: ${subAccount.id})`"
            :name="String(subAccount.id)"
          >
            <div class="tab-content">
              <h3>{{ subAccount.name }} 的工作台数据</h3>
              <p>这里是子账户 ID: {{ subAccount.id }} 的具体统计信息和概览。</p>
              <p>实际内容可以复用或扩展现有的单商户工作台组件。</p>
              <pre>Props 接收到的 currentSubAccountId: {{ currentSubAccountId }}</pre>
              <el-button @click="fetchSubAccountData(subAccount.id)">模拟加载数据</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
        
        <!-- 或者，如果布局中已经选择了单个子账户，则直接显示该子账户的 dashboard -->
        <div v-if="displayMode === 'single'">
          <h3>{{ currentSubAccountName }} 的工作台数据 (ID: {{ currentSubAccountId }})</h3>
          <p>这里是子账户 ID: {{ currentSubAccountId }} 的具体统计信息和概览。</p>
          <p>实际内容可以复用或扩展现有的单商户工作台组件。</p>
          <el-button @click="fetchSubAccountData(currentSubAccountId)">模拟加载数据</el-button>
        </div>

      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

// 接收来自 MultiMerchantLayout 的 prop
const props = defineProps({
  currentSubAccountId: {
    type: [String, Number, null],
    default: null
  }
});

const { currentSubAccountId: propSubAccountId } = toRefs(props);

const route = useRoute();
const mainMerchantIdLocal = ref(route.params.mainMerchantId);
const currentSelectedSubAccountId = ref(null); // 由 prop 或 tab 切换驱动
const currentSubAccountName = ref('');

// 根据 MultiMerchantLayout 是否传入 currentSubAccountId，决定显示模式
// 如果传入了，说明布局层面已经做了子账户选择，直接显示该子账户数据
// 如果没传入（或者说外部不控制），则内部使用 Tabs 展示所有子账户
const displayMode = computed(() => {
  // 如果 MultiMerchantLayout 的 currentSubAccountIdForView 有效，则为 'single' 模式
  // 否则，如果 MultiMerchantLayout 未传递有效 subAccountId，则此 Dashboard 内部用 tabs 管理
  // 为简化，我们先假设如果 props.currentSubAccountId 有值就是 single 模式
  return propSubAccountId.value ? 'single' : 'tabs';
});

// 模拟子账户列表，实际应从 store 或 API 获取与 mainMerchantId 关联的子账户
const subAccountsForTabs = ref([]); 
const activeTabAccountId = ref(null); // 当前激活的tab (子账户ID)

// 从 productData 中获取商户信息 (实际应通过API或store)
import { productList } from '@/data/productData';

const loadInitialData = () => {
  mainMerchantIdLocal.value = route.params.mainMerchantId;
  const mainMerchant = productList.find(m => String(m.id) === String(mainMerchantIdLocal.value));

  if (mainMerchant && mainMerchant.subAccounts && mainMerchant.subAccounts.length > 0) {
    subAccountsForTabs.value = mainMerchant.subAccounts.map(subId => {
      const subInfo = productList.find(m => String(m.id) === String(subId));
      return subInfo ? { id: subInfo.id, name: subInfo.productName } : { id: subId, name: `子账户 ${subId}` };
    });
    if (subAccountsForTabs.value.length > 0) {
      // 如果是 tabs 模式，默认激活第一个 tab
      if (displayMode.value === 'tabs') {
        activeTabAccountId.value = String(subAccountsForTabs.value[0].id);
      }
    }
  } else if (mainMerchant) { // 主商户存在，但无子账户
     subAccountsForTabs.value = [{ id: mainMerchant.id, name: mainMerchant.productName }];
     if (displayMode.value === 'tabs'){
        activeTabAccountId.value = String(mainMerchant.id);
     }
  } else {
    ElMessage.error('无法加载主商户信息。');
  }
  
  // 更新当前选中的子账户信息
  updateCurrentSelectionDetails();
};

const fetchSubAccountData = (accountId) => {
  ElMessage.info(`正在为子账户 ID: ${accountId} 加载数据... (模拟)`);
  // 实际的API调用
};

// 监听 propSubAccountId (来自布局的选中) 和 activeTabAccountId (内部tab选中) 的变化
watch([propSubAccountId, activeTabAccountId, displayMode], () => {
  updateCurrentSelectionDetails();
}, { immediate: true });

// 更新当前选中的子账户ID和名称，用于显示
const updateCurrentSelectionDetails = () => {
  let finalSelectedId = null;
  if (displayMode.value === 'single' && propSubAccountId.value) {
    finalSelectedId = propSubAccountId.value;
  } else if (displayMode.value === 'tabs' && activeTabAccountId.value) {
    finalSelectedId = activeTabAccountId.value;
  }
  
  currentSelectedSubAccountId.value = finalSelectedId;
  if (finalSelectedId) {
    const acc = productList.find(m => String(m.id) === String(finalSelectedId));
    currentSubAccountName.value = acc ? acc.productName : `子账户 ${finalSelectedId}`;
  } else {
    currentSubAccountName.value = '';
  }
};

watch(() => route.params.mainMerchantId, (newId) => {
  if (newId) {
    loadInitialData();
  }
});

onMounted(() => {
  loadInitialData();
});

</script>

<style scoped>
.multi-merchant-dashboard {
  padding: 0; /* 通常 el-card 会有自己的 padding */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-content {
  padding: 15px;
  min-height: 200px; /* 给点初始高度 */
}
</style> 