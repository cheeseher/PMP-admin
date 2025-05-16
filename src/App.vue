<template>
  <router-view />
  <PageDocumentation />
</template>

<script setup>
import PageDocumentation from '@/components/PageDocumentation.vue';
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  background-color: #f5f7fa;
}

.app {
  min-height: 100vh;
}
</style> 