<template>
  <div>
    <h2>弹窗</h2>
    <Dialog>
      <DialogTrigger>
        <Button>ui组件弹窗</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>

    <Button @click="handleOpen1">messagebox</Button>
    <Button @click="handleOpen2">errorMessageBox</Button>
    <Button @click="handleOpen3">showOpenDialog</Button>
    <div>content:</div>
    <div>{{ fileContent }}</div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { MessageBoxOptions, OpenDialogOptions } from 'electron';
import { ref } from 'vue';
const fileContent = ref('');
const handleOpen1 = async (): Promise<void> => {
  const options: MessageBoxOptions = {
    type: 'info',
    title: '温馨提示',
    message: 'this is message',
    detail: 'this is detail',
    buttons: ['yes', 'no']
  };
  const { ipcRenderer } = window.electron;
  const res = await ipcRenderer.invoke('electron:messageBox', options);
  console.log(res);
};
const handleOpen2 = async (): Promise<void> => {
  const { ipcRenderer } = window.electron;
  ipcRenderer.invoke('electron:errorMessageBox', 'error', 'this is a err message box');
};
const handleOpen3 = async (): Promise<void> => {
  const options: OpenDialogOptions = {
    title: 'choose file',
    message: 'please choose files',
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'all',
        extensions: ['*']
      },
      {
        name: '图片',
        extensions: ['png', 'jpg', 'jpeg']
      },
      {
        name: '文档',
        extensions: ['xlsx', 'xlx', 'doc', 'pdf']
      }
    ]
  };
  const { ipcRenderer } = window.electron;
  const res = await ipcRenderer.invoke('electron:showOpenDialog', options);
  console.log(res);
  const { filePaths } = res;
  const content = await window.api.winApi.readFileStream(filePaths[0]);
  fileContent.value = content;
};
</script>

<style scoped></style>
