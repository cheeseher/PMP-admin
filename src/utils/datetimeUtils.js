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
  const now = new Date();

  if (now >= targetDate) {
    return '已生效';
  }

  const diffMs = targetDate - now;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `剩余${diffDays}天`;
  }
  if (diffHours > 0) {
    return `剩余${diffHours}小时`;
  }
  if (diffMinutes > 0) {
    const seconds = diffSeconds % 60;
    return `剩余${diffMinutes}分${seconds}秒`;
  }
  if (diffSeconds > 0) {
    return `剩余${diffSeconds}秒`;
  }

  return '即将生效';
}; 