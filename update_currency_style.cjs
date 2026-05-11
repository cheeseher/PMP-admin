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

const cssToAdd = `\n.stat-item .currency {
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  margin-right: 2px;
}\n`;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace colon in label
  content = content.replace(/<span class="label">(.*?)：<\/span>/g, '<span class="label">$1</span>');

  // 2. Inject the currency style
  if (!content.includes('.stat-item .currency')) {
    const valueStyleStr = '.stat-item .value {\n  font-family: \'Roboto Mono\', Monaco, monospace;\n  font-weight: 600;\n  font-size: 16px;\n  color: #303133;\n}';
    if (content.includes(valueStyleStr)) {
      content = content.replace(valueStyleStr, valueStyleStr + cssToAdd);
    }
  }

  // 3. Format the amount display in HTML template
  const textStatsBarRegex = /(<div class="text-stats-bar">[\s\S]*?)(<!-- 数据表格 -->|<!-- 表格区域 -->)/;
  const match = textStatsBarRegex.exec(content);
  
  if (match) {
    let statsBarHtml = match[1];
    
    // Replace spans that have formatAmount but don't have currency yet
    statsBarHtml = statsBarHtml.replace(
      /<span class="(value[^"]*)">\s*\{\{\s*formatAmount\((.*?)\)\s*\}\}\s*<\/span>/g,
      `<span class="$1">\n          <span class="currency">¥</span>\n          {{ formatAmount($2).replace('¥', '') }}\n        </span>`
    );

    content = content.replace(match[1], statsBarHtml);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
});
