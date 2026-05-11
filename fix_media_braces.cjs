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
  let content = fs.readFileSync(file, 'utf8');
  // Regex to remove all these orphaned media queries
  // /* 媒体查询，适配小屏幕 */ followed by any number of @media (...) {
  content = content.replace(/\/\* 媒体查询，适配小屏幕 \*\/[\s\n]*(@media\s*\([^)]+\)\s*\{\s*)+/g, '');
  
  fs.writeFileSync(file, content, 'utf8');
});
