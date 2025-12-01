<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, watch } from 'vue';
import PageNav from './components/PageNav.vue';
import BottomNav from './components/BottomNav.vue';
import ImageViewer from './components/ImageViewer.vue';
import { useImageClick } from './composables/useImageClick';

const route = useRoute();

// 判断是否显示导航（首页不显示）
const showNav = computed(() => {
  return route.path !== '/' && route.path !== '/gallery' && route.path !== '/stats';
});

// 判断是否是主标签页 (Home, Gallery, Stats)
const isMainPage = computed(() => {
  return ['/', '/gallery', '/stats'].includes(route.path);
});

// 判断是否是地图页（首页）
const isMapPage = computed(() => {
  return route.path === '/';
});

// 获取页面标题
const pageTitle = computed(() => {
  const meta = route.meta as any;
  return meta?.frontmatter?.title || '';
});

// 调试：监听路由变化
watch(() => route.path, (newPath) => {
  console.log('Route changed to:', newPath);
  console.log('isMapPage:', isMapPage.value);
}, { immediate: true });

// 全局图片查看器
const { showViewer, currentSrc, currentAlt, closeViewer } = useImageClick();
</script>

<template>
  <div class="app-container">
    <PageNav v-if="showNav" :title="pageTitle" />
    <div class="app-content" :class="{ 'with-nav': showNav, 'is-map': isMapPage }">
      <router-view v-slot="{ Component, route: routeSlot }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="routeSlot.fullPath" />
        </transition>
      </router-view>
    </div>
    
    <!-- 底部导航菜单 -->
    <BottomNav v-if="isMainPage" />
    
    <!-- 全局图片查看器 -->
    <ImageViewer 
      :show="showViewer" 
      :src="currentSrc" 
      :alt="currentAlt" 
      @close="closeViewer" 
    />
  </div>
</template>

<style lang="scss">
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: "Nunito", system-ui, -apple-system, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
}

.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  position: relative;
  -webkit-overflow-scrolling: touch;
  
  // 默认：文章页面样式
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  
  &.with-nav {
    @media (max-width: 640px) {
      padding-top: 48px; // 为固定导航留出空间
    }
  }
  
  // 地图页面：全屏无滚动（通过路由判断）
  &.is-map {
    background: transparent;
    overflow: hidden;
    height: 100%;
  }
  
  // 文章页面：隐藏地图
  &:not(.is-map) {
    .map_container,
    .travel-map-container {
      display: none !important;
    }
  }
}

// 页面切换过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 地图容器样式
.map_container {
  height: 100%;
  width: 100%;
}

// 全局移动端优化
@media (max-width: 640px) {
  // 优化触摸区域
  button,
  a {
    min-height: 44px;
    min-width: 44px;
  }
  
  // 防止文本选中
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }
  
  // 优化滚动性能
  .app-content {
    will-change: scroll-position;
  }
}

// Markdown 内容样式优化
.prose {
  max-width: 65ch;
  margin: 0 auto;
  padding: 2rem;
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    cursor: zoom-in;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
  
  @media (max-width: 640px) {
    padding: 1.5rem 1rem;
    font-size: 16px;
    line-height: 1.6;
    
    h1 {
      font-size: 1.75rem;
    }
    
    h2 {
      font-size: 1.5rem;
    }
    
    h3 {
      font-size: 1.25rem;
    }
    
    img {
      border-radius: 4px;
      margin: 1rem 0;
    }
  }
}

// 为 image-gallery 类添加样式
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
  
  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 8px;
    cursor: zoom-in;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
