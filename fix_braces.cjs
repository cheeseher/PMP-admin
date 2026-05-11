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
  // There are two hanging `}` at the end or before text-stats-bar?
  // Let's just remove any standalone `}` or `@media` that are messed up, or I'll just rewrite the style tag cleanly.
  // Actually, let's see where the unclosed block is.
  console.log(`Checking ${file}`);
});
