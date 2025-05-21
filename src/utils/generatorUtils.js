/**
 * 通用生成器工具函数
 */

/**
 * 生成随机商户号 (10位数字)
 * @returns {string}
 */
export const generateMerchantNo = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

/**
 * 生成随机API密钥 (32位十六进制字符串)
 * @returns {string}
 */
export const generateApiKey = () => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}; 