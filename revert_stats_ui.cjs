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
  'src/views/payout/PayoutOrder.vue',
  'src/views/order/MerchantOrder.vue'
];

const cssToAdd = `.text-stats-bar {
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

.stat-item .currency {
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  margin-right: 2px;
}`;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace block-style CSS back to inline-flex style
  const cssRegex = /\.stat-item\s*\{\s*display:\s*inline-flex;\s*flex-direction:\s*column;[\s\S]*?\}\s*\.stat-item\s*\.currency\s*\{[\s\S]*?\}/;
  if (cssRegex.test(content)) {
    content = content.replace(cssRegex, cssToAdd);
    content = content.replace(/\.text-stats-bar\s*\{[\s\S]*?margin-bottom:\s*10px;\s*\}/g, ''); // Remove the duplicated text-stats-bar at the bottom if it exists
    
    // Add text-stats-bar at the top if it was removed
    if (!content.includes('.text-stats-bar {')) {
        content = content.replace('.stat-item {', '.text-stats-bar {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 16px 24px;\n  padding: 12px 16px;\n  background-color: #f8f9fa;\n  border-radius: 4px;\n  margin-top: 10px;\n  margin-bottom: 10px;\n  border: 1px solid #ebeef5;\n}\n\n.stat-item {');
    }
  } else {
    // If it's already using the base CSS, let's just make sure it's the exact format you want
    const replaceCssRegex = /\/\* 统计信息区域 - 文本样式 \*\/[\s\S]*?\.stat-item \.value\.emphasis\s*\{\s*color:\s*#409eff;\s*font-size:\s*15px;\s*\}([\s\n]*\.stat-item \.currency\s*\{[\s\S]*?\})?/;
    if (replaceCssRegex.test(content)) {
        content = content.replace(replaceCssRegex, '/* 统计信息区域 - 文本样式 */\n' + cssToAdd);
    }
  }

  // Restore colon inside the label in templates
  content = content.replace(/<span class="label">(.*?[^：])<\/span>/g, '<span class="label">$1：</span>');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Reverted ' + file);
});
