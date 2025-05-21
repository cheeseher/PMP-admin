export const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')} ${String(tomorrow.getHours()).padStart(2, '0')}:${String(tomorrow.getMinutes()).padStart(2, '0')}:${String(tomorrow.getSeconds()).padStart(2, '0')}`;
};

export const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7; // 禁用今天之前的日期 (8.64e7 是一天的毫秒数)
};

export const formatScheduledTime = (timeStr) => {
  if (!timeStr) return '-';
  try {
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return timeStr;
  }
};

export const getRemainingTimeText = (scheduledTime) => {
  if (!scheduledTime) return '时间未设置';

  const targetTime = new Date(scheduledTime).getTime();
  const now = Date.now();

  if (now >= targetTime) {
    return '已生效';
  }

  const diffMs = targetTime - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays}天${diffHours}小时后`;
  } else if (diffHours > 0) {
    return `${diffHours}小时${diffMinutes}分钟后`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟后`;
  } else {
    return '即将';
  }
}; 