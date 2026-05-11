const fs = require('fs');
const files = [
  'src/views/statistics/MerchantIncome.vue',
  'src/views/statistics/Upstream.vue',
  'src/views/statistics/ProductStats.vue',
  'src/views/statistics/PlatformProfit.vue',
  'src/views/statistics/MerchantOutcome.vue',
  'src/views/statistics/ChannelStats.vue'
];

const correctCss = `
/* 统计信息区域 - 文本样式 */
.text-stats-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 24px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid #ebeef5;
}

.stat-item {
  display: inline-flex;
  align-items: baseline;
  font-size: 14px;
}

.stat-item .label {
  color: #606266;
  margin-right: 4px;
}

.stat-item .value {
  font-family: 'Roboto Mono', Monaco, monospace;
  font-weight: 600;
  color: #303133;
}

.stat-item .value.income {
  color: #67c23a;
}

.stat-item .value.expense {
  color: #f56c6c;
}

.stat-item .value.emphasis {
  color: #409eff;
  font-size: 15px;
}
`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\/\* 统计信息区域 - 文本样式 \*\/[\s\S]*?(?=\s*<\/style>)/, correctCss);
  fs.writeFileSync(file, content, 'utf8');
});
