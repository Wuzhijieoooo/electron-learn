<script setup lang="ts">
import { Sunny, Moon, Monitor } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import { Theme } from './type';
const theme = ref<Theme>('dark');
const themeOptions: { label: string; value: Theme }[] = [
  {
    label: '深色',
    value: 'dark'
  },
  {
    label: '浅色',
    value: 'light'
  },
  {
    label: '跟随系统',
    value: 'system'
  }
];
const themeText = computed(() => {
  const item = themeOptions.find((item) => item.value === theme.value);
  return item?.label;
});
const toggle = (): void => {
  const { ipcRenderer } = window.electron;
  const i = themeOptions.findIndex((item) => item.value === theme.value);
  const oI = (i + 1) % 3;
  theme.value = themeOptions[oI].value;
  console.log(ipcRenderer);
  ipcRenderer.invoke('toggleTheme', theme.value);
};
</script>
<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="text-4xl">主题切换</div>
      <div class="flex gap-2">
        <el-tooltip effect="dark" :content="themeText" placement="bottom">
          <el-icon size="20" class="hover:cursor-pointer" @click="toggle">
            <Sunny v-if="theme === 'dark'" />
            <Moon v-else-if="theme === 'light'" />
            <Monitor v-else />
          </el-icon>
        </el-tooltip>
        <!-- <el-tooltip effect="dark" content="跟随系统" placement="bottom">
          <el-icon class="hover:cursor-pointer"><Monitor /></el-icon>
        </el-tooltip> -->
      </div>
    </div>
  </div>
</template>
<style scoped></style>
