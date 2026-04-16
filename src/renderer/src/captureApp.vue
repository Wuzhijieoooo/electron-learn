<template>
  <div ref="capture" class="h-full"></div>
  <div class="mask h-full absolute inset-[0]"></div>
  <!-- <canvas ref="preview" class="absolute inset-[0] border border-white hidden"></canvas> -->
  <canvas ref="preview" class="absolute inset-[0] h-full"></canvas>
</template>

<script setup lang="ts">
import { IpcRendererEvent } from 'electron';
import { onMounted, onUnmounted, reactive, useTemplateRef } from 'vue';

const { ipcRenderer } = window.electron;
const selection = reactive({
  flag: false,
  x: 0,
  y: 0
});

// 存储按钮位置信息
const buttonState = reactive({
  saveButtonX: 0,
  saveButtonY: 0,
  cancelButtonX: 0,
  cancelButtonY: 0,
  buttonWidth: 60,
  buttonHeight: 24,
  isVisible: false
});

// 存储框选区域信息
const selectionArea = reactive({
  left: 0,
  top: 0,
  width: 0,
  height: 0
});
const captureRef = useTemplateRef<HTMLDivElement>('capture');
const previewRef = useTemplateRef<HTMLCanvasElement>('preview');

// 调整 canvas 尺寸以匹配显示尺寸
const resizeCanvas = (): void => {
  const canvas = previewRef.value;
  if (!canvas) return;

  // 获取 canvas 元素的实际显示尺寸
  const rect = canvas.getBoundingClientRect();

  // 设置 canvas 的实际尺寸，避免模糊
  canvas.width = rect.width;
  canvas.height = rect.height;
};

// 转换鼠标坐标为相对于 canvas 的坐标
const getCanvasCoordinates = (e: MouseEvent): { x: number; y: number } => {
  const canvas = previewRef.value;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

ipcRenderer.on('captureBase64', (_event: IpcRendererEvent, base64: string) => {
  if (!captureRef.value) return;
  captureRef.value.style.backgroundImage = `url(${base64})`;
});

onMounted(() => {
  const canvas = previewRef.value;
  const ctx = canvas?.getContext('2d');

  // 初始调整 canvas 尺寸
  resizeCanvas();

  // 监听窗口大小变化
  window.addEventListener('resize', resizeCanvas);

  const handleMouseDown = (e: MouseEvent): void => {
    const { x, y } = getCanvasCoordinates(e);
    selection.flag = true;
    selection.x = x;
    selection.y = y;
  };

  const handleMouseMove = (e: MouseEvent): void => {
    if (!selection.flag || !ctx || !canvas) return;

    const { x, y } = getCanvasCoordinates(e);
    const left = Math.min(x, selection.x);
    const top = Math.min(y, selection.y);
    const width = Math.abs(x - selection.x);
    const height = Math.abs(y - selection.y);

    // 更新框选区域信息
    selectionArea.left = left;
    selectionArea.top = top;
    selectionArea.width = width;
    selectionArea.height = height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 框选区域的矩形框
    ctx.strokeStyle = '#409eff';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, top, width, height);

    // 半透明填充（可选）
    ctx.fillStyle = 'rgba(64,158,255,0.2)';
    ctx.fillRect(left, top, width, height);

    // 绘制文字（宽高）
    const text = `${Math.round(width)} x ${Math.round(height)}`;
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';

    // 文字背景（增强可读性）
    const textWidth = ctx.measureText(text).width;
    const textHeight = 16;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(left, top - textHeight, textWidth + 6, textHeight);

    ctx.fillStyle = '#fff';
    ctx.fillText(text, left + 3, top - 4);

    const buttonGap = 10;

    // 计算按钮位置（右下角）
    const saveButtonX = left + width - 2 * buttonState.buttonWidth - buttonGap;
    const cancelButtonX = left + width - buttonState.buttonWidth;
    const buttonY = top + height + 10;

    // 更新按钮位置信息
    buttonState.saveButtonX = saveButtonX;
    buttonState.saveButtonY = buttonY;
    buttonState.cancelButtonX = cancelButtonX;
    buttonState.cancelButtonY = buttonY;
    buttonState.isVisible = true;

    // 绘制取消按钮
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(cancelButtonX, buttonY, buttonState.buttonWidth, buttonState.buttonHeight);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(cancelButtonX, buttonY, buttonState.buttonWidth, buttonState.buttonHeight);

    // 绘制取消按钮文字
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    const cancelTextWidth = ctx.measureText('取消').width;
    ctx.fillText(
      '取消',
      cancelButtonX + (buttonState.buttonWidth - cancelTextWidth) / 2,
      buttonY + 16
    );

    // 绘制保存按钮
    ctx.fillStyle = '#409eff';
    ctx.fillRect(saveButtonX, buttonY, buttonState.buttonWidth, buttonState.buttonHeight);

    // 绘制保存按钮文字
    ctx.fillStyle = '#fff';
    const saveTextWidth = ctx.measureText('保存').width;
    ctx.fillText('保存', saveButtonX + (buttonState.buttonWidth - saveTextWidth) / 2, buttonY + 16);

    previewRef.value!.style.display = 'block';
  };

  const handleMouseUp = (): void => {
    selection.flag = false;
  };

  // 处理 canvas 点击事件
  const handleCanvasClick = (e: MouseEvent): void => {
    if (!buttonState.isVisible) return;

    const { x, y } = getCanvasCoordinates(e);

    // 检查是否点击了保存按钮
    if (
      x >= buttonState.saveButtonX &&
      x <= buttonState.saveButtonX + buttonState.buttonWidth &&
      y >= buttonState.saveButtonY &&
      y <= buttonState.saveButtonY + buttonState.buttonHeight
    ) {
      console.log('点击了保存按钮');
      buttonState.isVisible = false;

      // 提取框选区域的内容为 base64 编码的图片
      if (canvas && selectionArea.width > 0 && selectionArea.height > 0) {
        // 创建临时 canvas 元素
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = selectionArea.width;
        tempCanvas.height = selectionArea.height;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          // 将框选区域的内容绘制到临时 canvas 上
          tempCtx.drawImage(
            canvas,
            selectionArea.left,
            selectionArea.top,
            selectionArea.width,
            selectionArea.height,
            0,
            0,
            selectionArea.width,
            selectionArea.height
          );

          // 获取框选区域的截图
          const base64Image = tempCanvas.toDataURL('image/png');
          console.log('框选区域截图:', base64Image);

          // 发送截图到主进程
          ipcRenderer.send('capture:save', base64Image);
        }
      }

      // 清空画布
      ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    }

    // 检查是否点击了取消按钮
    if (
      x >= buttonState.cancelButtonX &&
      x <= buttonState.cancelButtonX + buttonState.buttonWidth &&
      y >= buttonState.cancelButtonY &&
      y <= buttonState.cancelButtonY + buttonState.buttonHeight
    ) {
      console.log('点击了取消按钮');
      buttonState.isVisible = false;
      // 清空画布
      ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    }
  };

  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  canvas?.addEventListener('click', handleCanvasClick);

  // 清理事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas);
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    canvas?.removeEventListener('click', handleCanvasClick);
  });
});
</script>
<style scoped>
.mask {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
