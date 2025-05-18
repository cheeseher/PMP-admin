import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义要提取的文件列表
const filesToExtract = [
  {
    sourcePath: 'src/views/product/ProductList.vue',
    outputName: '商户列表.md',
    title: '商户列表'
  },
  {
    sourcePath: 'src/views/product/MerchantProductList.vue',
    outputName: '商户产品列表.md',
    title: '商户产品列表'
  },
  {
    sourcePath: 'src/views/payment/Type.vue',
    outputName: '支付类型管理.md',
    title: '支付类型管理'
  },
  {
    sourcePath: 'src/views/payment/Product.vue',
    outputName: '支付产品管理.md',
    title: '支付产品管理'
  },
  {
    sourcePath: 'src/views/supplier/SupplierList.vue',
    outputName: '供应商列表.md',
    title: '供应商列表'
  },
  {
    sourcePath: 'src/views/supplier/Channel.vue',
    outputName: '供应商通道管理.md',
    title: '供应商通道管理'
  },
  {
    sourcePath: 'src/views/order/MerchantOrder.vue',
    outputName: '商户订单管理.md',
    title: '商户订单管理'
  }
];

// 创建markdown文件夹（如果不存在）
const markdownDir = path.join(__dirname, 'markdown-pages');
if (!fs.existsSync(markdownDir)) {
  fs.mkdirSync(markdownDir);
}

// 处理每个文件
filesToExtract.forEach(file => {
  try {
    // 读取源文件
    const sourceFilePath = path.join(__dirname, file.sourcePath);
    const sourceContent = fs.readFileSync(sourceFilePath, 'utf8');
    
    // 创建markdown内容
    const markdownContent = `# ${file.title}

## 页面路径
\`${file.sourcePath}\`

## 源代码
\`\`\`vue
${sourceContent}
\`\`\`
`;
    
    // 写入markdown文件
    const outputPath = path.join(markdownDir, file.outputName);
    fs.writeFileSync(outputPath, markdownContent, 'utf8');
    
    console.log(`✅ 已创建: ${file.outputName}`);
  } catch (error) {
    console.error(`❌ 创建 ${file.outputName} 失败:`, error.message);
  }
});

console.log(`\n所有文件已保存到: ${markdownDir}`); 