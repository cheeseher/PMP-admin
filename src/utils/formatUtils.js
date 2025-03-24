/**
 * 通用格式化工具函数
 * 包含金额格式化、日期格式化等常用功能
 */

/**
 * 格式化金额，添加千位分隔符，保留两位小数
 * @param {number} amount - 需要格式化的金额
 * @param {string} prefix - 金额前缀，默认为¥
 * @returns {string} 格式化后的金额字符串
 */
export const formatAmount = (amount, prefix = '¥') => {
  if (amount === null || amount === undefined) return `${prefix}0.00`;
  return `${prefix}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 日期时间对象或字符串
 * @param {string} format - 格式化模板，默认为 YYYY-MM-DD HH:mm:ss
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (dateTime, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!dateTime) return '';
  
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化百分比
 * @param {number} value - 百分比值（0-1之间）
 * @param {number} decimals - 小数位数，默认为2
 * @param {boolean} withSymbol - 是否添加百分号，默认为true
 * @returns {string} 格式化后的百分比字符串
 */
export const formatPercent = (value, decimals = 2, withSymbol = true) => {
  if (value === null || value === undefined) return withSymbol ? '0%' : '0';
  
  const percentValue = (value * 100).toFixed(decimals);
  return withSymbol ? `${percentValue}%` : percentValue;
};

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @param {number} decimals - 小数位数，默认为2
 * @returns {string} 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * 将数字格式化为带有指定分隔符的字符串
 * @param {number} num - 需要格式化的数字
 * @param {string} separator - 分隔符，默认为逗号
 * @returns {string} 格式化后的字符串
 */
export const formatNumber = (num, separator = ',') => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}; 