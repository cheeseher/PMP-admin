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

/**
 * 生成随机密码 
 * 密码需包含字母和数字，长度 8~20 位，可包含特殊字符，禁止空格
 * @param {number} length 密码长度，默认为随机 8~16 位
 * @returns {string}
 */
export const generatePassword = (length = 0) => {
  // 如果未指定长度，则随机生成 8-16 之间的长度
  const passwordLength = length || Math.floor(Math.random() * 9) + 8;
  
  const lowerChars = 'abcdefghijkmnpqrstuvwxyz'; // 避开容易混淆的字母 l o
  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // 避开容易混淆的字母 I O
  const numbers = '23456789'; // 避开容易混淆的数字 0 1
  const specialChars = '!@#$%^&*_+-=?';
  
  const allChars = lowerChars + upperChars + numbers + specialChars;
  
  // 确保密码至少包含一个小写字母、一个大写字母和一个数字
  let password = '';
  password += lowerChars[Math.floor(Math.random() * lowerChars.length)];
  password += upperChars[Math.floor(Math.random() * upperChars.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // 生成剩余的字符
  for (let i = 3; i < passwordLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // 打乱密码字符顺序
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}; 