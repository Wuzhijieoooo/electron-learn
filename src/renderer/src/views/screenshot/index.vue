<template>
  <div>
    <Button @click="handleScreenshot">截图</Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
const { ipcRenderer } = window.electron;
const handleScreenshot = (): void => {
  ipcRenderer.send('win:capture');
};
</script>

<style scoped></style>
