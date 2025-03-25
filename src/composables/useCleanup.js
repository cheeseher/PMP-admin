/**
 * useCleanup - 一个用于管理资源清理的组合式函数
 * 提供自动清理定时器和其他资源的工具，防止内存泄漏
 */

import { onBeforeUnmount } from 'vue'

export function useCleanup() {
  // 存储所有需要清理的资源
  const resources = {
    timeouts: new Set(),
    intervals: new Set(),
    eventListeners: new Set(),
  }

  // 安全的setTimeout，会自动清理
  const safeTimeout = (callback, delay) => {
    const timeoutId = setTimeout(callback, delay)
    resources.timeouts.add(timeoutId)
    return timeoutId
  }

  // 清除特定的timeout
  const clearSafeTimeout = (timeoutId) => {
    clearTimeout(timeoutId)
    resources.timeouts.delete(timeoutId)
  }

  // 安全的setInterval，会自动清理
  const safeInterval = (callback, delay) => {
    const intervalId = setInterval(callback, delay)
    resources.intervals.add(intervalId)
    return intervalId
  }

  // 清除特定的interval
  const clearSafeInterval = (intervalId) => {
    clearInterval(intervalId)
    resources.intervals.delete(intervalId)
  }

  // 安全的事件监听器，会自动移除
  const safeEventListener = (element, event, handler, options) => {
    element.addEventListener(event, handler, options)
    const listenerInfo = { element, event, handler }
    resources.eventListeners.add(listenerInfo)
    return listenerInfo
  }

  // 移除特定的事件监听器
  const removeSafeEventListener = (listenerInfo) => {
    const { element, event, handler } = listenerInfo
    element.removeEventListener(event, handler)
    resources.eventListeners.delete(listenerInfo)
  }

  // 组件卸载前清理所有资源
  onBeforeUnmount(() => {
    // 清理所有timeout
    resources.timeouts.forEach(id => clearTimeout(id))
    resources.timeouts.clear()

    // 清理所有interval
    resources.intervals.forEach(id => clearInterval(id))
    resources.intervals.clear()

    // 清理所有事件监听器
    resources.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler)
    })
    resources.eventListeners.clear()
  })

  return {
    safeTimeout,
    clearSafeTimeout,
    safeInterval, 
    clearSafeInterval,
    safeEventListener,
    removeSafeEventListener
  }
} 