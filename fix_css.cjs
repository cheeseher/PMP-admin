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
  
  // Clean up the broken @media queries
  content = content.replace(/\/\* 媒体查询，适配小屏幕 \*\/\n@media \(max-width: 1200px\) \{\n  @media \(max-width: 768px\) \{\n  /g, '');
  
  fs.writeFileSync(file, content, 'utf8');
});
