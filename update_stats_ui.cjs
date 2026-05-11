const fs = require('fs');
const path = require('path');

const files = [
  'src/views/statistics/MerchantIncome.vue',
  'src/views/statistics/Upstream.vue',
  'src/views/statistics/ProductStats.vue',
  'src/views/statistics/PlatformProfit.vue',
  'src/views/statistics/MerchantOutcome.vue',
  'src/views/statistics/ChannelStats.vue',
  'src/views/payout/OrderManagement.vue',
  'src/views/payout/PayoutOrder.vue'
];

const newCss = `.stat-item {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  font-size: 14px;
  background-color: #ffffff;
  padding: 12px 16px;
  border-radius: 4px;
  min-width: 140px;
  border: 1px solid #ebeef5;
}

.stat-item .label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 8px;
}

.stat-item .value {
  font-family: 'Roboto Mono', Monaco, monospace;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.text-stats-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  background-color: transparent;
  padding: 0;
  border: none;
  margin-top: 10px;
  margin-bottom: 10px;
}`;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  const startStr = '/* 统计信息区域 - 文本样式 */';
  const startIdx = content.indexOf(startStr);
  
  if (startIdx !== -1) {
    const endStr = '.stat-item .value.income {';
    const endIdx = content.indexOf(endStr, startIdx);
    
    if (endIdx !== -1) {
      content = content.substring(0, startIdx) + startStr + '\n' + newCss + '\n\n' + content.substring(endIdx);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated ' + file);
    }
  }
});
