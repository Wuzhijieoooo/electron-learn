<template>
  <div>
    <h2>父子组件通信</h2>
    <Button @click="openChildWin">打开子窗口</Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
const openChildWin = (): void => {
  window.electron.ipcRenderer.send('openChildWin', {
    page: 'child',
    options: {
      width: 300,
      height: 200,
      resizable: true,
      modal: true
    }
  });
};
</script>

<style scoped></style>
