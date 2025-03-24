/**
 * 用于处理组件中的异步操作清理
 */

import { onBeforeUnmount } from 'vue'

/**
 * 创建一个可以自动清理的setTimeout
 * @param {Function} callback 回调函数
 * @param {number} timeout 延迟时间(ms)
 * @return {Object} 包含clear方法的对象
 */
export const createSafeTimeout = (callback, timeout) => {
  let timerId = setTimeout(callback, timeout)
  
  const clear = () => {
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }
  
  return {
    clear,
    id: timerId
  }
}

/**
 * 在组件中使用的自动清理钩子，会自动在组件卸载前清理定时器
 * @param {Array} cleanupFns 需要清理的函数数组
 */
export const useCleanup = (cleanupFns = []) => {
  const timers = []
  
  // 创建一个安全的setTimeout，会在组件卸载时自动清理
  const safeTimeout = (callback, timeout) => {
    const timer = createSafeTimeout(callback, timeout)
    timers.push(timer)
    return timer.id
  }
  
  // 在组件卸载前清理所有定时器和传入的清理函数
  onBeforeUnmount(() => {
    // 清理所有定时器
    timers.forEach(timer => timer.clear())
    
    // 调用所有传入的清理函数
    cleanupFns.forEach(fn => typeof fn === 'function' && fn())
  })
  
  return {
    safeTimeout
  }
} 