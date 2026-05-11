const fs = require('fs');
const files = [
  'src/views/statistics/MerchantIncome.vue',
  'src/views/statistics/Upstream.vue',
  'src/views/statistics/ProductStats.vue',
  'src/views/statistics/PlatformProfit.vue',
  'src/views/statistics/ChannelStats.vue'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace:
  // <span class="value ...">
  //   <span class="currency">¥</span>
  //   {{ formatAmount(VARIABLE).replace('¥', '') }}
  // </span>
  // With:
  // <span class="value ...">{{ formatAmount(VARIABLE) }}</span>
  
  content = content.replace(/<span class="(value[^"]*)">\s*<span class="currency">¥<\/span>\s*\{\{\s*formatAmount\((.*?)\)\.replace\('¥',\s*''\)\s*\}\}\s*<\/span>/g, '<span class="$1">{{ formatAmount($2) }}</span>');
  
  fs.writeFileSync(file, content, 'utf8');
});
