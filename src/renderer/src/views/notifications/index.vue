<template>
  <div>
    <h2>通知</h2>
    <el-button @click="handleNotify">发送通知</el-button>
  </div>
</template>

<script setup lang="ts">
const handleNotify = (): void => {
  new window.Notification('渲染进程通知', {
    body: '我是渲染进程'
  });
};
</script>

<style scoped></style>
