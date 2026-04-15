<script setup lang="ts">
console.log(window.electron);
const { ipcRenderer } = window.electron;
const handleContentmenu1 = (): void => {
  ipcRenderer.send('contextMenu', [
    {
      label: '新增数据'
    },
    {
      label: '删除数据'
    }
  ]);
};
const handleContentmenu2 = (): void => {
  ipcRenderer.send('contextMenu', [
    {
      label: '新增分类'
    },
    {
      label: '删除分类'
    }
  ]);
};
</script>
<template>
  <h2>右击菜单</h2>
  <div class="flex h-full">
    <div class="flex-1 bg-green-500 h-[50%]" @contextmenu.prevent="handleContentmenu1"></div>
    <div class="flex-1 bg-blue-500 h-[50%]" @contextmenu.prevent="handleContentmenu2"></div>
  </div>
</template>
<style scoped></style>
