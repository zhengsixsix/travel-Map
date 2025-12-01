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
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
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
        <button class="nav-icon-button back-button" @click="handleBack" aria-label="返回" title="返回上一页">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- 中间：标题 -->
      <div v-if="title" class="page-nav-center">
        <h1 class="page-title">{{ title }}</h1>
      </div>

      <!-- 右侧：首页按钮 -->
      <div class="page-nav-right">
        <button class="nav-icon-button home-button" @click="handleHome" aria-label="返回首页" title="返回首页">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke-width="2.5" stroke-linecap="round"
              stroke-linejoin="round" />
            <polyline points="9 22 9 12 15 12 15 22" stroke-width="2.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
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
  font-family: "ZCOOL KuaiLe", cursive;
  font-size: 20px;
  font-weight: 400;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.5px;

  @media (max-width: 640px) {
    font-size: 18px;
  }
}

.nav-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
  }
}

.back-button {
  color: #0277BD;
  /* Bright Blue */
  background: #E1F5FE;

  &:hover {
    background: #B3E5FC;

    svg {
      transform: translateX(-2px);
    }
  }
}

.home-button {
  color: #EF6C00;
  /* Orange */
  background: #FFF3E0;

  &:hover {
    background: #FFE0B2;

    svg {
      transform: scale(1.1);
    }
  }
}

// 移动端优化
@media (max-width: 640px) {
  .page-nav {
    position: fixed;
  }
}
</style>
