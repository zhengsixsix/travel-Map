<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  show: boolean;
  src: string;
  alt?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const lastX = ref(0);
const lastY = ref(0);

// 重置变换
const resetTransform = () => {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
};

// 监听 show 变化，重置状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    resetTransform();
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// 关闭查看器
const close = () => {
  emit('close');
};

// 放大
const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.5, 5);
};

// 缩小
const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.5, 0.5);
};

// 鼠标滚轮缩放
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale.value = Math.max(0.5, Math.min(5, scale.value + delta));
};

// 开始拖动
const startDrag = (e: MouseEvent | TouchEvent) => {
  if (scale.value <= 1) return; // 只有放大时才能拖动
  
  isDragging.value = true;
  
  if (e instanceof MouseEvent) {
    startX.value = e.clientX - translateX.value;
    startY.value = e.clientY - translateY.value;
  } else {
    startX.value = e.touches[0].clientX - translateX.value;
    startY.value = e.touches[0].clientY - translateY.value;
  }
};

// 拖动中
const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || scale.value <= 1) return;
  
  e.preventDefault();
  
  if (e instanceof MouseEvent) {
    translateX.value = e.clientX - startX.value;
    translateY.value = e.clientY - startY.value;
  } else {
    translateX.value = e.touches[0].clientX - startX.value;
    translateY.value = e.touches[0].clientY - startY.value;
  }
};

// 结束拖动
const endDrag = () => {
  isDragging.value = false;
};

// 双击缩放
const handleDoubleClick = () => {
  if (scale.value === 1) {
    scale.value = 2;
  } else {
    resetTransform();
  }
};

// 键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  if (!props.show) return;
  
  switch (e.key) {
    case 'Escape':
      close();
      break;
    case '+':
    case '=':
      zoomIn();
      break;
    case '-':
      zoomOut();
      break;
    case '0':
      resetTransform();
      break;
  }
};

// 计算变换样式
const transformStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  cursor: scale.value > 1 ? (isDragging.value ? 'grabbing' : 'grab') : 'default',
}));

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <transition name="viewer">
    <div
      v-if="show"
      class="image-viewer"
      @click.self="close"
      @wheel.prevent="handleWheel"
    >
      <!-- 工具栏 -->
      <div class="viewer-toolbar">
        <button @click="zoomOut" class="toolbar-btn" title="缩小 (-)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" />
            <line x1="8" y1="11" x2="14" y2="11" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        
        <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
        
        <button @click="zoomIn" class="toolbar-btn" title="放大 (+)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        
        <button @click="resetTransform" class="toolbar-btn" title="重置 (0)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
        
        <button @click="close" class="toolbar-btn close-btn" title="关闭 (ESC)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      
      <!-- 图片容器 -->
      <div
        class="viewer-content"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @touchstart="startDrag"
        @touchmove="onDrag"
        @touchend="endDrag"
        @dblclick="handleDoubleClick"
      >
        <img
          :src="src"
          :alt="alt"
          :style="transformStyle"
          class="viewer-image"
          draggable="false"
        />
      </div>
      
      <!-- 提示信息 -->
      <div class="viewer-tips">
        <span>滚轮缩放</span>
        <span>·</span>
        <span>双击重置</span>
        <span>·</span>
        <span>拖动移动</span>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-toolbar {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 12px;
  border-radius: 8px;
  z-index: 10001;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &.close-btn {
    margin-left: 8px;
    background: rgba(255, 59, 48, 0.8);
    
    &:hover {
      background: rgba(255, 59, 48, 1);
    }
  }
}

.zoom-level {
  color: white;
  font-size: 14px;
  min-width: 50px;
  text-align: center;
}

.viewer-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
}

.viewer-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.1s ease-out;
  transform-origin: center;
}

.viewer-tips {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  
  span:nth-child(even) {
    opacity: 0.4;
  }
}

// 过渡动画
.viewer-enter-active,
.viewer-leave-active {
  transition: opacity 0.3s ease;
}

.viewer-enter-from,
.viewer-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .viewer-toolbar {
    top: 10px;
    right: 10px;
    padding: 6px 8px;
    gap: 6px;
  }
  
  .toolbar-btn {
    width: 32px;
    height: 32px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  .zoom-level {
    font-size: 12px;
    min-width: 45px;
  }
  
  .viewer-tips {
    bottom: 20px;
    font-size: 12px;
    padding: 6px 12px;
    gap: 8px;
  }
  
  .viewer-image {
    max-width: 95%;
    max-height: 95%;
  }
}
</style>
