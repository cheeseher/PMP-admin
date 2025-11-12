<template>
  <div class="page-container">
    <el-card class="cleanup-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>商户订单清理</span>
          <el-tag type="info" size="small">清理后数据不可恢复</el-tag>
        </div>
      </template>
      <el-form :model="cleanupForm" label-width="120px" class="cleanup-form">
        <el-form-item label="保留最近订单">
          <el-select v-model="cleanupForm.retentionDays" placeholder="请选择保留天数" style="width: 100%;">
                        <el-option label="保留最近 7 天" :value="7"></el-option>
            <el-option label="保留最近 30 天" :value="30"></el-option>
            <el-option label="保留最近 60 天" :value="60"></el-option>
            <el-option label="保留最近 90 天" :value="90"></el-option>
            <el-option label="保留最近 180 天" :value="180"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="自动清理">
          <el-switch v-model="cleanupForm.autoCleanup"></el-switch>
        </el-form-item>

        <el-form-item v-if="cleanupForm.autoCleanup" label="清理时间点">
          <el-time-select
            v-model="cleanupForm.autoCleanupTime"
            start="00:00"
            step="01:00"
            end="23:00"
            placeholder="选择每日自动清理时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item v-if="cleanupForm.autoCleanup" label="清理周期">
          <el-select v-model="cleanupForm.schedulePeriod" placeholder="选择周期" style="width: 100%;">
            <el-option label="每日" value="daily" />
            <el-option label="每7天" value="every7" />
            <el-option label="每30天" value="every30" />
            <el-option label="每60天" value="every60" />
          </el-select>
        </el-form-item>

        <el-form-item label="订单状态">
          <el-select
            v-model="cleanupForm.orderStatus"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="可多选，默认清理所有状态"
            style="width: 100%;"
          >
            <el-option label="订单创建" value="created"></el-option>
            <el-option label="交易成功" value="success"></el-option>
            <el-option label="待付款" value="pending"></el-option>
            <el-option label="交易失败" value="failed"></el-option>
            <el-option label="交易撤销" value="canceled"></el-option>
            <el-option label="补单成功" value="reorder_success"></el-option>
            <el-option label="交易关闭" value="closed"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleCleanup">执行一次性清理</el-button>
          <el-button @click="handleSaveSettings">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="cleanup-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>其他清理</span>
        </div>
      </template>
      <el-form :model="otherCleanupForm" label-width="120px" class="cleanup-form">
        <el-form-item label="清理范围">
          <el-checkbox-group v-model="otherCleanupForm.cleanupScope">
            <el-checkbox label="platformProfit">平台分润统计</el-checkbox>
            <el-checkbox label="merchantCollection">商户收款统计</el-checkbox>
            <el-checkbox label="merchantBalance">商户余额快照</el-checkbox>
            <el-checkbox label="merchantFunds">商户资金流水</el-checkbox>
            <el-checkbox label="merchantPrepayment">商户预付记录</el-checkbox>
            <el-checkbox label="supplierFunds">供应商资金流水</el-checkbox>
            <el-checkbox label="supplierPrepayment">供应商预付记录</el-checkbox>
            <el-checkbox label="botHistory">机器人操作记录</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="保留最近数据">
          <el-select v-model="otherCleanupForm.retentionDays" placeholder="请选择">
            <el-option label="7天内" :value="7" />
            <el-option label="30天内" :value="30" />
            <el-option label="60天内" :value="60" />
            <el-option label="90天内" :value="90" />
            <el-option label="180天内" :value="180" />
          </el-select>
        </el-form-item>
        <el-form-item label="自动清理">
          <el-switch v-model="otherCleanupForm.autoCleanup" />
        </el-form-item>
        <el-form-item v-if="otherCleanupForm.autoCleanup" label="清理时间点">
          <el-time-select
            v-model="otherCleanupForm.autoCleanupTime"
            end="23:59"
            placeholder="选择时间"
            start="00:00"
            step="01:00"
          />
        </el-form-item>
        <el-form-item v-if="otherCleanupForm.autoCleanup" label="清理周期">
          <el-select v-model="otherCleanupForm.schedulePeriod" placeholder="选择周期">
            <el-option label="每日" value="daily" />
            <el-option label="每7天" value="every7" />
            <el-option label="每30天" value="every30" />
            <el-option label="每60天" value="every60" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleOtherCleanup">执行一次性清理</el-button>
          <el-button @click="handleSaveOtherSettings">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>


  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useCleanup } from '@/composables/useCleanup'

// 页面名称：数据清理
// 使用场景：用于定期清理系统中的历史数据、日志等，以保持系统性能。
// 核心组件：el-card, el-form, el-date-picker, el-select, el-button

const cleanupForm = reactive({
  autoCleanup: false,
  autoCleanupTime: '',
  retentionDays: 30,
  orderStatus: [],
  schedulePeriod: 'daily',
})

const otherCleanupForm = reactive({
  cleanupScope: [],
  retentionDays: 30,
  autoCleanup: false,
  autoCleanupTime: '',
  schedulePeriod: 'daily',
})
const { safeTimeout, clearSafeTimeout, safeInterval, clearSafeInterval } = useCleanup()
let mInitialTimeout = null
let mInterval = null
let oInitialTimeout = null
let oInterval = null

const runCleanup = (type) => {
  ElMessage.success(type === 'merchant' ? '已执行商户订单清理' : '已执行其他数据清理')
}

const parseNextDelay = (timeStr, period) => {
  if (!timeStr) return null
  const now = new Date()
  const [hh, mm] = (timeStr || '00:00').split(':').map(v => parseInt(v, 10))
  const target = new Date(now)
  target.setHours(hh)
  target.setMinutes(mm)
  target.setSeconds(0)
  target.setMilliseconds(0)
  const stepDays = period === 'daily' ? 1 : period === 'every7' ? 7 : period === 'every30' ? 30 : 60
  if (target <= now) target.setDate(target.getDate() + stepDays)
  return target.getTime() - now.getTime()
}

const setupSchedule = (form, kind) => {
  if (kind === 'merchant') {
    if (mInitialTimeout) { clearSafeTimeout(mInitialTimeout); mInitialTimeout = null }
    if (mInterval) { clearSafeInterval(mInterval); mInterval = null }
  } else {
    if (oInitialTimeout) { clearSafeTimeout(oInitialTimeout); oInitialTimeout = null }
    if (oInterval) { clearSafeInterval(oInterval); oInterval = null }
  }
  if (!form.autoCleanup) return
  const period = form.schedulePeriod
  const delay = parseNextDelay(form.autoCleanupTime, period)
  if (delay == null) return
  const initialId = safeTimeout(() => {
    runCleanup(kind)
    const stepDays = period === 'daily' ? 1 : period === 'every7' ? 7 : period === 'every30' ? 30 : 60
    const intervalMs = stepDays * 24 * 60 * 60 * 1000
    const intervalId = safeInterval(() => runCleanup(kind), intervalMs)
    if (kind === 'merchant') mInterval = intervalId; else oInterval = intervalId
  }, delay)
  if (kind === 'merchant') mInitialTimeout = initialId; else oInitialTimeout = initialId
}

const handleCleanup = async () => {
  try {
    await ElMessageBox.confirm('确定执行一次性清理吗？该操作不可恢复', '提示', { type: 'warning' })
    runCleanup('merchant')
  } catch {}
}

const handleOtherCleanup = async () => {
  try {
    await ElMessageBox.confirm('确定执行一次性清理吗？该操作不可恢复', '提示', { type: 'warning' })
    runCleanup('other')
  } catch {}
}

const handleSaveSettings = () => {
  const payload = { ...cleanupForm }
  localStorage.setItem('dataCleanupSettings', JSON.stringify(payload))
  ElMessage.success('设置已保存')
  setupSchedule(cleanupForm, 'merchant')
}

const handleSaveOtherSettings = () => {
  const payload = { ...otherCleanupForm }
  localStorage.setItem('otherCleanupSettings', JSON.stringify(payload))
  ElMessage.success('设置已保存')
  setupSchedule(otherCleanupForm, 'other')
}

watch(() => [cleanupForm.autoCleanup, cleanupForm.autoCleanupTime, cleanupForm.schedulePeriod], () => {
  setupSchedule(cleanupForm, 'merchant')
})

watch(() => [otherCleanupForm.autoCleanup, otherCleanupForm.autoCleanupTime, otherCleanupForm.schedulePeriod], () => {
  setupSchedule(otherCleanupForm, 'other')
})

</script>

<style scoped>
.page-container {
  padding: 20px;
}
.cleanup-card {
  max-width: 800px;
  margin: 0 auto 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cleanup-form {
  padding-top: 20px;
}
</style>
