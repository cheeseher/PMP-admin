<!-- 机器人管理/群发消息 - 向多个群组发送消息 -->
<template>
  <div class="mass-send-message-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <h3>群发消息</h3>
          <el-button type="primary" @click="handleSendNotice">发送通知</el-button>
        </div>
      </template>

      <!-- 表格 -->
      <el-table :data="tableData" border stripe v-loading="tableLoading" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="120" />
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <div 
              v-if="row.imageUrl" 
              class="image-placeholder"
              style="width: 60px; height: 60px; cursor: pointer;"
              @click="previewImage(row.imageUrl)"
            >图片</div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="180" show-overflow-tooltip />
        <el-table-column prop="merchantGroups" label="商户群" width="100" align="center">
          <template #default="{ row }">
            <span 
              v-if="row.merchantGroups > 0" 
              style="color: #409EFF; cursor: pointer; text-decoration: none;"
              @click="showGroupDetails(row, 'merchant')"
            >
              {{ row.merchantGroups }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="channelGroups" label="上游群" width="100" align="center">
          <template #default="{ row }">
            <span 
              v-if="row.channelGroups > 0" 
              style="color: #409EFF; cursor: pointer; text-decoration: none;"
              @click="showGroupDetails(row, 'channel')"
            >
              {{ row.channelGroups }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sendTime" label="发送时间" width="180" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 发送消息对话框 -->
    <el-dialog v-model="dialogVisible" title="发送群组通知" width="600px">
      <el-form :model="noticeForm" label-width="80px" :rules="rules" ref="noticeFormRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="noticeForm.title" placeholder="请输入通知标题" />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input v-model="noticeForm.content" type="textarea" :rows="4" placeholder="请输入通知内容" />
        </el-form-item>
        
        <el-form-item label="图片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
            :on-change="handleImageChange"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持jpg、png格式，图片大小不超过500KB</div>
        </el-form-item>
        
        <el-form-item label="商户群" prop="merchantGroups">
          <div class="group-select-container">
            <el-select
              v-model="noticeForm.merchantGroups"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择商户群"
              style="width: calc(100% - 90px)"
            >
              <el-option
                v-for="item in merchantGroups"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button size="default" @click="selectAllMerchantGroups" style="margin-left: 15px">全选</el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="上游群" prop="channelGroups">
          <div class="group-select-container">
            <el-select
              v-model="noticeForm.channelGroups"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择上游群"
              style="width: calc(100% - 90px)"
            >
              <el-option
                v-for="item in channelGroups"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button size="default" @click="selectAllChannelGroups" style="margin-left: 15px">全选</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitNotice" :loading="submitLoading">发送</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 群组详情弹窗 -->
    <el-dialog v-model="groupDetailVisible" :title="groupDetailTitle" width="500px">
      <el-table :data="currentGroupDetails" border>
        <el-table-column prop="tgid" label="群组TGID" min-width="120" />
        <el-table-column prop="name" label="群组名称" min-width="180" />
      </el-table>
    </el-dialog>

    <!-- 图片预览 -->
    <div v-if="showImageViewer">
      <el-image-viewer
        :url-list="[previewImageUrl]"
        :hide-on-click-modal="true"
        @close="showImageViewer = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, ElImageViewer } from 'element-plus';

// 表格数据
const tableData = ref([
  {
    id: 1,
    title: '系统维护通知',
    imageUrl: 'https://placeholder.pics/svg/200x200/DEDEDE/555555/维护',
    content: '尊敬的商户，系统将于2023年5月20日凌晨2:00-4:00进行维护升级，期间服务可能短暂中断，请提前做好准备。',
    merchantGroups: 5,
    channelGroups: 0,
    sendTime: '2023-05-18 14:30:00',
    // 添加群组详情数据
    merchantGroupDetails: [
      { tgid: '12345678', name: '商户A' },
      { tgid: '23456789', name: '商户B' },
      { tgid: '34567890', name: '商户A' },
      { tgid: '45678901', name: '商户B' },
      { tgid: '56789012', name: '商户A' }
    ],
    channelGroupDetails: []
  },
  {
    id: 2,
    title: '产品价格调整',
    imageUrl: '',
    content: '尊敬的合作伙伴，我们的支付产品价格将于下月起有所调整，详情请查看附件说明。',
    merchantGroups: 0,
    channelGroups: 3,
    sendTime: '2023-04-25 09:15:00',
    merchantGroupDetails: [],
    channelGroupDetails: [
      { tgid: '87654321', name: '闪电' },
      { tgid: '76543210', name: '纵横' },
      { tgid: '65432109', name: '闪电' }
    ]
  },
  {
    id: 3,
    title: '新功能上线通知',
    imageUrl: 'https://placeholder.pics/svg/200x200/DEDEDE/555555/新功能',
    content: '平台新增了批量处理功能，现在可以一次性处理多笔订单，提升工作效率。',
    merchantGroups: 8,
    channelGroups: 2,
    sendTime: '2023-04-10 16:45:00',
    merchantGroupDetails: [
      { tgid: '11223344', name: '商户A' },
      { tgid: '22334455', name: '商户B' },
      { tgid: '33445566', name: '商户A' },
      { tgid: '44556677', name: '商户B' },
      { tgid: '55667788', name: '商户A' },
      { tgid: '66778899', name: '商户B' },
      { tgid: '77889900', name: '商户A' },
      { tgid: '88990011', name: '商户B' }
    ],
    channelGroupDetails: [
      { tgid: '99001122', name: '闪电' },
      { tgid: '00112233', name: '纵横' }
    ]
  }
]);

const tableLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(3);

const handleSizeChange = (val) => {
  pageSize.value = val;
  // 加载数据
  loadTableData();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  // 加载数据
  loadTableData();
};

const loadTableData = () => {
  tableLoading.value = true;
  // 模拟加载数据
  setTimeout(() => {
    tableLoading.value = false;
  }, 500);
};

// 发送通知相关
const dialogVisible = ref(false);
const submitLoading = ref(false);
const noticeFormRef = ref(null);

const noticeForm = reactive({
  title: '',
  content: '',
  imageFile: null,
  merchantGroups: [],
  channelGroups: []
});

// 商户群列表（平级结构）
const merchantGroups = ref([
  { value: 1, label: '商户A' },
  { value: 2, label: '商户B' }
]);

// 上游群列表（平级结构）
const channelGroups = ref([
  { value: 101, label: '闪电' },
  { value: 102, label: '纵横' }
]);

// 计算所有商户群ID
const allMerchantGroupIds = computed(() => {
  return merchantGroups.value.map(item => item.value);
});

// 计算所有渠道群ID
const allChannelGroupIds = computed(() => {
  return channelGroups.value.map(item => item.value);
});

// 全选商户群
const selectAllMerchantGroups = () => {
  if (noticeForm.merchantGroups.length === allMerchantGroupIds.value.length) {
    // 如果已经全选，则取消全选
    noticeForm.merchantGroups = [];
  } else {
    // 否则设置为全选
    noticeForm.merchantGroups = [...allMerchantGroupIds.value];
  }
};

// 全选渠道群
const selectAllChannelGroups = () => {
  if (noticeForm.channelGroups.length === allChannelGroupIds.value.length) {
    // 如果已经全选，则取消全选
    noticeForm.channelGroups = [];
  } else {
    // 否则设置为全选
    noticeForm.channelGroups = [...allChannelGroupIds.value];
  }
};

const rules = {
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
  ]
};

const handleSendNotice = () => {
  dialogVisible.value = true;
};

const handleImageChange = (file) => {
  noticeForm.imageFile = file.raw;
};

const submitNotice = () => {
  noticeFormRef.value.validate((valid) => {
    if (valid) {
      if (noticeForm.merchantGroups.length === 0 && noticeForm.channelGroups.length === 0) {
        ElMessage.warning('请至少选择一个群组');
        return;
      }

      submitLoading.value = true;

      // 模拟提交
      setTimeout(() => {
        submitLoading.value = false;
        dialogVisible.value = false;
        
        // 模拟添加新数据到表格
        const newRecord = {
          id: tableData.value.length + 1,
          title: noticeForm.title,
          imageUrl: noticeForm.imageFile ? URL.createObjectURL(noticeForm.imageFile) : '',
          content: noticeForm.content,
          merchantGroups: noticeForm.merchantGroups.length,
          channelGroups: noticeForm.channelGroups.length,
          sendTime: new Date().toLocaleString()
        };
        
        tableData.value.unshift(newRecord);
        total.value = tableData.value.length;
        
        ElMessage.success('通知发送成功');
        
        // 重置表单
        noticeFormRef.value.resetFields();
        noticeForm.imageFile = null;
      }, 1000);
    }
  });
};

// 群组详情弹窗
const groupDetailVisible = ref(false);
const groupDetailTitle = ref('');
const currentGroupDetails = ref([]);

// 显示群组详情
const showGroupDetails = (row, type) => {
  if (type === 'merchant') {
    currentGroupDetails.value = row.merchantGroupDetails;
    groupDetailTitle.value = '商户群详情';
  } else {
    currentGroupDetails.value = row.channelGroupDetails;
    groupDetailTitle.value = '上游群详情';
  }
  groupDetailVisible.value = true;
};

// 图片预览相关
const showImageViewer = ref(false);
const previewImageUrl = ref('');

// 预览图片
const previewImage = (url) => {
  previewImageUrl.value = url;
  showImageViewer.value = true;
};

onMounted(() => {
  // 初始化加载数据
  loadTableData();
});
</script>

<style scoped>
.mass-send-message-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.group-select-container {
  display: flex;
  align-items: center;
}

.image-placeholder {
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 12px;
  background-color: #409EFF;
}
</style> 