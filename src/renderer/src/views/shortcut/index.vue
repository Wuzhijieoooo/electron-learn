<template>
  <div>
    <h2>快捷键</h2>
    <Button>hello</Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { onMounted, onUnmounted } from 'vue';
const handleShortcut = (e: KeyboardEvent): void => {
  e.preventDefault();
  const { metaKey, shiftKey, key } = e;
  if (!(metaKey || shiftKey)) return;
  console.log(key);
  if (key === 'o') {
    new window.Notification('打开文件');
    return;
  }
  if (key === 'd') {
    new window.Notification('删除');
    return;
  }
};
onMounted(() => {
  window.onkeydown = handleShortcut;
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleShortcut);
});
</script>

<style scoped></style>
