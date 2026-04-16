<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const handleOpen = (key: string, keyPath: string[]): void => {
  console.log(key, keyPath);
  router.push({ path: key });
};
const handleClose = (key: string, keyPath: string[]): void => {
  console.log(key, keyPath);
};
const setWinState = (action): void => {
  const { winApi } = window.api;
  winApi.send('set-state', action);
};
</script>

<template>
  <el-container class="h-full">
    <el-header class="bg-amber-600 leading-[60px] flex justify-between">
      <div>渲染进程</div>
      <div class="flex items-center gap-x-2">
        <el-icon @click="setWinState('min')"><Minus /></el-icon>
        <el-icon @click="setWinState('max')"><FullScreen /></el-icon>
        <el-icon @click="setWinState('restore')"><RefreshLeft /></el-icon>
        <el-icon @click="setWinState('fullScreen')"><Monitor /></el-icon>
        <el-icon @click="setWinState('close')"><Close /></el-icon>
      </div>
    </el-header>
    <el-container>
      <el-aside class="border-r" width="200px">
        <el-menu
          active-text-color="#ffd04b"
          background-color="#545c64"
          class="el-menu-vertical-demo"
          default-active="2"
          text-color="#fff"
          @open="handleOpen"
          @close="handleClose"
        >
          <el-menu-item index="/ipc">
            <el-icon><icon-menu /></el-icon>
            <span>ipc</span>
          </el-menu-item>
          <el-menu-item index="/ipc/theme">
            <el-icon><icon-menu /></el-icon>
            <span>theme</span>
          </el-menu-item>
          <el-menu-item index="/menu/index">
            <el-icon><icon-menu /></el-icon>
            <span>menu</span>
          </el-menu-item>
          <el-menu-item index="/notifications/index">
            <el-icon><icon-menu /></el-icon>
            <span>通知</span>
          </el-menu-item>
          <el-menu-item index="/shortcut/index">
            <el-icon><icon-menu /></el-icon>
            <span>快捷键</span>
          </el-menu-item>
          <el-menu-item index="/dialog/index">
            <el-icon><icon-menu /></el-icon>
            <span>弹窗</span>
          </el-menu-item>
          <el-menu-item index="/online/index">
            <el-icon><icon-menu /></el-icon>
            <span>online</span>
          </el-menu-item>
          <el-menu-item index="/communication/index">
            <el-icon><icon-menu /></el-icon>
            <span>communication</span>
          </el-menu-item>
          <el-menu-item index="/screenshot/index">
            <el-icon><icon-menu /></el-icon>
            <span>screenshot</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
