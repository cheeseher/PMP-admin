/**
 * 通用生成器工具函数
 */

/**
 * 生成随机商户号 (格式为: M + yyMMddHHmm + 随机码(5位) + 自增序列(6位))
 * @returns {string}
 */
export const generateMerchantNo = () => {
  // 获取当前时间并格式化为yyMMddHHmm
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 年份后两位
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份补零
  const day = String(now.getDate()).padStart(2, '0'); // 日期补零
  const hour = String(now.getHours()).padStart(2, '0'); // 小时补零
  const minute = String(now.getMinutes()).padStart(2, '0'); // 分钟补零
  const timeStr = year + month + day + hour + minute;
  
  // 生成5位随机码
  const randomCode = Math.floor(10000 + Math.random() * 90000).toString();
  
  // 模拟6位自增序列（前端环境无法实现真正的自增，使用随机数模拟）
  const sequence = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 组合成商户号：M + 时间 + 随机码 + 序列
  return 'M' + timeStr + randomCode + sequence;
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