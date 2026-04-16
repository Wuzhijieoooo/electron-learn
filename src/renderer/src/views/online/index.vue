<template>
  <div>
    <h2>检测在线状态</h2>
    <div>当前的状态为: {{ onlineText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const isOnline = ref(true);
const onlineText = computed(() => (isOnline.value ? '在线' : '离线'));
window.addEventListener('online', () => {
  isOnline.value = true;
});
window.addEventListener('offline', () => {
  isOnline.value = false;
});
</script>

<style scoped></style>
