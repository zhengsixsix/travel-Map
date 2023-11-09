<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();

const props = defineProps<{
  title?: string;
  showBack?: boolean;
  showHome?: boolean;
}>();

const canGoBack = computed(() => {
  return window.history.length > 1;
});

const handleBack = () => {
  // 直接返回首页，避免历史记录问题
  router.push('/');
};

const handleHome = () => {
  router.push('/');
};
</script>

<template>
  <nav class="page-nav">
    <div class="page-nav-container">
      <!-- 左侧：返回按钮 -->
      <div class="page-nav-left">
        <button
          v-if="showBack !== false"
          class="nav-button back-button"
          @click="handleBack"
          aria-label="返回"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span class="button-text">返回</span>
        </button>
      </div>

      <!-- 中间：标题 -->
      <div v-if="title" class="page-nav-center">
        <h1 class="page-title">{{ title }}</h1>
      </div>

      <!-- 右侧：首页按钮 -->
      <div class="page-nav-right">
        <button
          v-if="showHome !== false"
          class="nav-button home-button"
          @click="handleHome"
          aria-label="返回首页"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span class="button-text">首页</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.page-nav {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.page-nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  gap: 16px;

  @media (max-width: 640px) {
    padding: 10px 16px;
  }
}

.page-nav-left,
.page-nav-right {
  flex-shrink: 0;
}

.page-nav-center {
  flex: 1;
  text-align: center;
  min-width: 0;
  overflow: hidden;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 640px) {
    font-size: 16px;
  }
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: #f5f5f5;
  color: #666;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2;
    flex-shrink: 0;
  }

  &:hover {
    background: #e0e0e0;
    color: #333;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 6px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
}

.button-text {
  @media (max-width: 480px) {
    display: none;
  }
}

.back-button {
  svg {
    margin-left: -4px;
  }
}

.home-button {
  background: transparent;
  
  &:hover {
    background: #f5f5f5;
  }
}

// 移动端优化
@media (max-width: 640px) {
  .page-nav {
    position: fixed;
  }
}
</style>
