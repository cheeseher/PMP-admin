export const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
};

export const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7; // 禁用今天之前的日期 (8.64e7 是一天的毫秒数)
};

export const formatScheduledTime = (timeStr) => {
  if (!timeStr) return '-';
  try {
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return timeStr;
  }
};

export const getRemainingTimeText = (scheduledTime) => {
  if (!scheduledTime) return '时间未设置';

  const targetDate = new Date(scheduledTime);
  // 设置为当天结束时间
  targetDate.setHours(23, 59, 59, 999);
  
  const now = new Date();
  
  if (now >= targetDate) {
    return '已生效';
  }
  
  // 计算天数差异
  const diffMs = targetDate - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) {
    return `${diffDays}天后`;
  } else {
    return '明天生效';
  }
}; 