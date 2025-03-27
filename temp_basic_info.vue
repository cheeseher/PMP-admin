<!-- 商户后台/设置/基本信息 - 管理商户基本信息 -->
<template>
  <div class="basic-info-container">
    <el-card shadow="never" class="info-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
          <div class="action-buttons">
            <el-button type="primary" @click="handleEdit">编辑信息</el-button>
          </div>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="商户ID">{{ merchantInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="商户类型">
          <el-tag v-if="merchantInfo.type === 'enterprise'" type="primary">企业商户</el-tag>
          <el-tag v-else-if="merchantInfo.type === 'individual'" type="success">个人商户</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="商户名称">{{ merchantInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ merchantInfo.contactPerson }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ merchantInfo.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="联系邮箱">{{ merchantInfo.contactEmail }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ merchantInfo.registerTime }}</el-descriptions-item>
        <el-descriptions-item label="商户状态">
          <el-tag v-if="merchantInfo.status === 'active'" type="success">正常</el-tag>
          <el-tag v-else-if="merchantInfo.status === 'inactive'" type="info">未激活</el-tag>
          <el-tag v-else-if="merchantInfo.status === 'suspended'" type="warning">已暂停</el-tag>
          <el-tag v-else-if="merchantInfo.status === 'banned'" type="danger">已封禁</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="detail-card">
      <template #header>
        <div class="card-header">
          <span>详细信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item v-if="merchantInfo.type === 'enterprise'" label="企业名称">{{ merchantInfo.companyName }}</el-descriptions-item>
        <el-descriptions-item v-if="merchantInfo.type === 'enterprise'" label="统一社会信用代码">{{ merchantInfo.businessLicenseNo }}</el-descriptions-item>
        <el-descriptions-item v-if="merchantInfo.type === 'individual'" label="身份证号码">{{ formatIdCard(merchantInfo.idCardNo) }}</el-descriptions-item>
        <el-descriptions-item label="经营地址">{{ merchantInfo.address }}</el-descriptions-item>
        <el-descriptions-item label="经营范围">{{ merchantInfo.businessScope }}</el-descriptions-item>
        <el-descriptions-item label="所属行业">{{ merchantInfo.industry }}</el-descriptions-item>
        <el-descriptions-item label="官方网站">
          <a v-if="merchantInfo.website" :href="merchantInfo.website" target="_blank">{{ merchantInfo.website }}</a>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="settlement-card">
      <template #header>
        <div class="card-header">
          <span>结算信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="结算方式">{{ getSettlementTypeText(merchantInfo.settlementType) }}</el-descriptions-item>
        <el-descriptions-item label="结算周期">{{ getSettlementCycleText(merchantInfo.settlementCycle) }}</el-descriptions-item>
        <el-descriptions-item label="收款银行">{{ merchantInfo.bankName }}</el-descriptions-item>
        <el-descriptions-item label="开户名">{{ merchantInfo.accountName }}</el-descriptions-item>
        <el-descriptions-item label="开户支行">{{ merchantInfo.bankBranch }}</el-descriptions-item>
        <el-descriptions-item label="银行账号">{{ formatBankAccount(merchantInfo.bankAccount) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 编辑信息对话框 -->
    <el-dialog
      title="编辑基本信息"
      v-model="editDialogVisible"
      width="650px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="editForm"
        :rules="formRules"
        label-width="120px"
      >
        <el-divider content-position="left">商户信息</el-divider>
        <el-form-item label="商户名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入商户名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="editForm.contactPerson" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="editForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input v-model="editForm.contactEmail" placeholder="请输入联系邮箱" />
        </el-form-item>

        <el-divider content-position="left">详细信息</el-divider>
        <el-form-item v-if="merchantInfo.type === 'enterprise'" label="企业名称" prop="companyName">
          <el-input v-model="editForm.companyName" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="经营地址" prop="address">
          <el-input v-model="editForm.address" placeholder="请输入经营地址" />
        </el-form-item>
        <el-form-item label="经营范围" prop="businessScope">
          <el-input
            v-model="editForm.businessScope"
            type="textarea"
            :rows="3"
            placeholder="请输入经营范围"
          />
        </el-form-item>
        <el-form-item label="所属行业" prop="industry">
          <el-select v-model="editForm.industry" placeholder="请选择所属行业" style="width: 100%">
            <el-option label="互联网/IT/电子/通信" value="internet" />
            <el-option label="金融/投资/保险" value="finance" />
            <el-option label="房地产/建筑" value="realestate" />
            <el-option label="商业服务/咨询" value="business" />
            <el-option label="贸易/批发/零售/租赁" value="trade" />
            <el-option label="服装/纺织/皮革" value="clothing" />
            <el-option label="家电/家居/装修/材料" value="furniture" />
            <el-option label="快消品/食品/饮料/烟酒" value="fmcg" />
            <el-option label="制药/生物工程/医疗" value="medical" />
            <el-option label="广告/传媒/文化/体育" value="media" />
            <el-option label="教育/培训/科研" value="education" />
            <el-option label="酒店/餐饮/旅游/娱乐" value="hotel" />
            <el-option label="交通/运输/物流/仓储" value="transportation" />
            <el-option label="能源/矿产/环保" value="energy" />
            <el-option label="政府/非盈利机构" value="government" />
            <el-option label="其他行业" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="官方网站" prop="website">
          <el-input v-model="editForm.website" placeholder="请输入官方网站地址" />
        </el-form-item>

        <el-divider content-position="left">结算信息</el-divider>
        <el-form-item label="开户银行" prop="bankName">
          <el-select v-model="editForm.bankName" placeholder="请选择开户银行" style="width: 100%">
            <el-option label="中国工商银行" value="工商银行" />
            <el-option label="中国农业银行" value="农业银行" />
            <el-option label="中国建设银行" value="建设银行" />
            <el-option label="中国银行" value="中国银行" />
            <el-option label="交通银行" value="交通银行" />
            <el-option label="招商银行" value="招商银行" />
            <el-option label="中信银行" value="中信银行" />
            <el-option label="浦发银行" value="浦发银行" />
            <el-option label="兴业银行" value="兴业银行" />
            <el-option label="广发银行" value="广发银行" />
            <el-option label="平安银行" value="平安银行" />
            <el-option label="中国光大银行" value="光大银行" />
            <el-option label="华夏银行" value="华夏银行" />
            <el-option label="邮储银行" value="邮储银行" />
          </el-select>
        </el-form-item>
        <el-form-item label="开户名" prop="accountName">
          <el-input v-model="editForm.accountName" placeholder="请输入开户名" />
        </el-form-item>
        <el-form-item label="开户支行" prop="bankBranch">
          <el-input v-model="editForm.bankBranch" placeholder="请输入开户支行" />
        </el-form-item>
        <el-form-item label="银行账号" prop="bankAccount">
          <el-input v-model="editForm.bankAccount" placeholder="请输入银行账号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="submitting">保存</el-button>
        </span>
      </template>
    </el-dialog>

