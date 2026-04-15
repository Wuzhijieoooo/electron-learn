<template>
  <div>
    <h1 class="text-3xl font-bold">IPC</h1>
    <h2>send方式</h2>
    <el-button @click="setTitle">修改标题</el-button>
    <el-divider />
    <h2>invoke方式</h2>
    <el-button @click="handleOpen">打开文件</el-button>
    <p>{{ filePaths }}</p>
    <el-divider />
    <h2>切换主题</h2>
    <el-button @click="toggleTheme">切换主题</el-button>
    <p>{{ filePaths }}</p>
    <el-divider />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

console.log(window.electron);
const { ipcRenderer } = window.electron;
const filePaths = ref([]);
const setTitle = (): void => {
  ipcRenderer.send('set-title', 'ipc');
};
const handleOpen = async (): Promise<void> => {
  const res = await ipcRenderer.invoke('openDialog');
  filePaths.value = res;
};
const toggleTheme = (): void => {};
</script>

<style scoped></style>
