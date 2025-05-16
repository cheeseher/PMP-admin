<template>
  <el-container class="multi-merchant-layout-container">
    <el-header height="60px" class="header">
      <div class="header-left">
        <img src="@/assets/logo.svg" alt="logo" class="logo-img" />
        <span class="system-title">多商户管理后台</span>
        <span v-if="mainMerchantInfo" class="merchant-name-display">
          (主商户: {{ mainMerchantInfo.productName }} | ID: {{ mainMerchantInfo.id }})
        </span>
      </div>
      <div class="header-right">
        <el-dropdown v-if="subAccounts.length > 0" @command="handleSubAccountChange" trigger="click">
          <span class="el-dropdown-link current-account-display">
            当前账户: {{ currentSubAccount ? currentSubAccount.name : '选择子账户' }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="account in subAccounts" 
                :key="account.id" 
                :command="account.id"
                :class="{ 'is-active': currentSubAccount && currentSubAccount.id === account.id }"
              >
                {{ account.name }} (ID: {{ account.id }})
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-divider v-if="subAccounts.length > 0" direction="vertical" />
        <el-dropdown @command="handleUserCommand" trigger="click">
          <span class="user-info-display">
            <el-avatar :size="32" :icon="User" />
            <span class="user-name">{{ username }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition name="fade-transform" mode="out-in">
          <keep-alive :include="cachedViews">
            <component :is="Component" :key="route.fullPath" :current-sub-account-id="currentSubAccountIdForView" />
          </keep-alive>
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, User } from '@element-plus/icons-vue';
// import { useStore } from 'vuex'; // 或 Pinia: import { useMyStore } from '@/stores/myStore';

const route = useRoute();
const router = useRouter();
// const store = useStore(); // Vuex example
// Pinia example: const myStore = useMyStore();

const mainMerchantId = ref(null);
const mainMerchantInfo = ref(null); // { id: '2', productName: 'Merchant Two', ... }
const subAccounts = ref([]); // [{ id: 'sub1', name: 'Sub Account 1' }, { id: 'sub2', name: 'Sub Account 2' }]
const currentSubAccount = ref(null); // 当前选中的子账户对象
const currentSubAccountIdForView = ref(null); // 传递给 router-view 的子账户ID

const username = ref('当前用户'); // Placeholder for actual username

// 示例：从 productData 中获取商户信息 (实际应通过API或store)
import { productList } from '@/data/productData'; 

const fetchMerchantDetails = async () => {
  const id = route.params.mainMerchantId;
  mainMerchantId.value = id;
  
  const foundMerchant = productList.find(m => String(m.id) === String(id));
  if (foundMerchant) {
    mainMerchantInfo.value = { ...foundMerchant };
    username.value = foundMerchant.productName;

    if (foundMerchant.subAccounts && foundMerchant.subAccounts.length > 0) {
      subAccounts.value = foundMerchant.subAccounts.map(subId => {
        const subInfo = productList.find(m => String(m.id) === String(subId));
        return subInfo ? { id: subInfo.id, name: subInfo.productName } : { id: subId, name: `子账户 ${subId}` };
      });
    } else {
      subAccounts.value = [{ id: mainMerchantInfo.value.id, name: mainMerchantInfo.value.productName }];
      currentSubAccount.value = subAccounts.value[0];
      currentSubAccountIdForView.value = currentSubAccount.value.id;
      ElMessage.info('当前商户无子账户，已默认选中主商户。');
    }

  } else {
    ElMessage.error('未找到指定的主商户信息。');
    router.push('/');
  }
};

const handleSubAccountChange = (subAccountId) => {
  const selected = subAccounts.value.find(acc => String(acc.id) === String(subAccountId));
  if (selected) {
    currentSubAccount.value = selected;
    currentSubAccountIdForView.value = selected.id;
    ElMessage.success(`已切换到子账户: ${selected.name}`);
  }
};

const handleUserCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      // 清理登录状态 (token, store等)
      ElMessage.success('已退出登录');
      router.push('/login'); // 跳转到登录页
    }).catch(() => {
      // 用户取消
    });
  }
};

onMounted(() => {
  fetchMerchantDetails();
});

// 监听路由参数变化，以便在主商户ID变化时重新加载数据
watch(() => route.params.mainMerchantId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchMerchantDetails();
    // 重置子账户选择
    currentSubAccount.value = null;
    currentSubAccountIdForView.value = null;
    subAccounts.value = [];
  }
});

// 对于keep-alive的视图缓存控制 (可选, 根据需要配置)
const cachedViews = computed(() => {
  // return store.getters.cachedViews; // Vuex example
  return []; // Pinia / 简单的本地 ref 示例
});

</script>

<style scoped>
.multi-merchant-layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #001529; /* Element Plus 经典深色背景 */
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #000c17;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 32px;
  margin-right: 12px;
}

.system-title {
  font-size: 20px;
  font-weight: 600;
}

.merchant-name-display {
  margin-left: 15px;
  font-size: 14px;
  color: #a0a0a0;
}

.header-right {
  display: flex;
  align-items: center;
}

.current-account-display,
.user-info-display {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
  height: 100%;
  transition: background-color 0.3s;
}

.current-account-display:hover,
.user-info-display:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-info-display .el-avatar {
  margin-right: 8px;
}
.user-info-display .user-name {
  margin-right: 5px;
}

.el-dropdown-link {
  color: #fff;
  cursor: pointer;
}

.el-dropdown-menu__item.is-active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: bold;
}

.el-divider--vertical {
  height: 2em;
  background-color: #445d77;
  margin: 0 15px;
}

.main-content {
  background-color: #f0f2f5; /* 经典后台内容区背景色 */
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
}

/* fade-transform transition from Element Plus Pro */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all .5s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 