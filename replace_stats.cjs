const fs = require('fs');

const files = [
  'src/views/statistics/MerchantIncome.vue',
  'src/views/statistics/Upstream.vue',
  'src/views/statistics/ProductStats.vue',
  'src/views/statistics/PlatformProfit.vue',
  'src/views/statistics/MerchantOutcome.vue',
  'src/views/statistics/ChannelStats.vue'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Regex to match the whole stat-cards div block
  const statCardsRegex = /<!--\s*统计卡片.*?\s*-->\s*<div class="stat-cards">([\s\S]*?)<\/div>\s*<!--\s*数据表格\s*-->/g;
  
  const match = statCardsRegex.exec(content);
  if (!match) {
    console.log('No match found in ' + file);
    return;
  }

  const cardsHtml = match[1];
  
  // Extract all cards
  const cardRegex = /<div class="stat-header">(.*?)<\/div>\s*<div class="stat-body">[\s\S]*?<span class="stat-value">(.*?)<\/span>/g;
  
  let newHtml = '<!-- 统计信息区域 - 文本样式 -->\n    <div class="text-stats-bar">\n';
  
  let cardMatch;
  while ((cardMatch = cardRegex.exec(cardsHtml)) !== null) {
    const title = cardMatch[1].trim();
    const value = cardMatch[2].trim();
    
    // add some basic color classes based on title
    let valueClass = 'value';
    if (title.includes('成功') || title.includes('利润') || title.includes('入账')) {
      valueClass += ' income';
    } else if (title.includes('手续费') || title.includes('成本') || title.includes('支出')) {
      valueClass += ' expense';
    } else if (title.includes('总')) {
      valueClass += ' emphasis';
    }
    
    newHtml += `      <div class="stat-item">\n        <span class="label">${title}：</span>\n        <span class="${valueClass}">${value}</span>\n      </div>\n`;
  }
  newHtml += '    </div>\n\n    <!-- 数据表格 -->';
  
  content = content.replace(statCardsRegex, newHtml);
  
  // Also replace the CSS
  // Remove .stat-cards, .stat-card, .compact-card-content, .stat-header, .stat-body, .stat-value
  // It might be easier to just append the new CSS and remove the old ones manually or with regex.
  const cssRegex = /\.stat-cards\s*{[\s\S]*?}(?=\s*\.[a-zA-Z]|\s*<\/style>)/g;
  // This is tricky. Let's just append the new CSS to the <style scoped> block.
  
  const newCss = `
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
  
  content = content.replace(/<\/style>/, newCss + '\n</style>');

  // Let's remove the old CSS classes to keep it clean
  const oldCssClasses = [
    '.stat-cards', '.stat-card', '.compact-card-content', '.stat-header', '.stat-body', '.stat-value', '.filter-card'
  ];
  
  // For filter-card, just replace margin-bottom
  content = content.replace(/\.filter-card\s*{\s*margin-bottom:\s*20px;\s*}/, '.filter-card {\n  /* 去除底部间距，统一由 text-stats-bar 控制间距 */\n}');
  content = content.replace(/\.filter-container\s*{\s*margin-bottom:\s*16px;\s*}/, '.filter-container {\n  /* 去除底部间距 */\n}');

  // Remove old stat classes using regex
  content = content.replace(/\.stat-cards\s*{[\s\S]*?}\n\n/g, '');
  content = content.replace(/\.stat-card\s*{[\s\S]*?}\n\n/g, '');
  content = content.replace(/\.compact-card-content\s*{[\s\S]*?}\n\n/g, '');
  content = content.replace(/\.stat-header\s*{[\s\S]*?}\n\n/g, '');
  content = content.replace(/\.stat-body\s*{[\s\S]*?}\n\n/g, '');
  content = content.replace(/\.stat-value\s*{[\s\S]*?}\n\n/g, '');

  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
});

