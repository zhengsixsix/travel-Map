<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

interface ImageItem {
  src: string;
  alt?: string;
  caption?: string;
  thumbnail?: string;
}

const props = defineProps<{
  images: ImageItem[];
  columns?: number;
}>();

const currentIndex = ref(-1);
const isLightboxOpen = ref(false);
const imageRefs = ref<HTMLElement[]>([]);
const loadedImages = ref<Set<number>>(new Set());

// 计算网格列数
const gridColumns = computed(() => {
  if (typeof window === 'undefined') return props.columns || 3;
  
  const width = window.innerWidth;
  if (width < 640) return 1;
  if (width < 1024) return 2;
  return props.columns || 3;
});

// 打开灯箱
const openLightbox = (index: number) => {
  currentIndex.value = index;
  isLightboxOpen.value = true;
  document.body.style.overflow = 'hidden';
};

// 关闭灯箱
const closeLightbox = () => {
  isLightboxOpen.value = false;
  document.body.style.overflow = '';
};

// 上一张
const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

// 下一张
const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  }
};

// 键盘导航
const handleKeyDown = (e: KeyboardEvent) => {
  if (!isLightboxOpen.value) return;
  
  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      previousImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
  }
};

// 懒加载观察器
let observer: IntersectionObserver | null = null;

const setupLazyLoading = () => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          loadedImages.value.add(index);
          observer?.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '50px',
    }
  );

  imageRefs.value.forEach((ref) => {
    if (ref) observer?.observe(ref);
  });
};

onMounted(() => {
  setupLazyLoading();
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  document.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="image-gallery">
    <div
      class="gallery-grid"
      :style="{ '--columns': gridColumns }"
    >
      <div
        v-for="(image, index) in images"
        :key="index"
        ref="imageRefs"
        class="gallery-item"
        :data-index="index"
        @click="openLightbox(index)"
      >
        <div class="image-wrapper">
          <img
            v-if="loadedImages.has(index)"
            :src="image.thumbnail || image.src"
            :alt="image.alt || `Image ${index + 1}`"
            class="gallery-image"
            loading="lazy"
          />
          <div v-else class="image-placeholder">
            <div class="placeholder-spinner" />
          </div>
          
          <div class="image-overlay">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
        </div>
        
        <div v-if="image.caption" class="image-caption">
          {{ image.caption }}
        </div>
      </div>
    </div>

    <!-- 灯箱 -->
    <transition name="lightbox">
      <div
        v-if="isLightboxOpen && currentIndex >= 0"
        class="lightbox"
        @click.self="closeLightbox"
      >
        <button class="lightbox-close" @click="closeLightbox" aria-label="关闭">
          ✕
        </button>

        <button
          v-if="currentIndex > 0"
          class="lightbox-nav lightbox-prev"
          @click="previousImage"
          aria-label="上一张"
        >
          ‹
        </button>

        <div class="lightbox-content">
          <img
            :src="images[currentIndex].src"
            :alt="images[currentIndex].alt || `Image ${currentIndex + 1}`"
            class="lightbox-image"
          />
          
          <div v-if="images[currentIndex].caption" class="lightbox-caption">
            {{ images[currentIndex].caption }}
          </div>
          
          <div class="lightbox-counter">
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>
        </div>

        <button
          v-if="currentIndex < images.length - 1"
          class="lightbox-nav lightbox-next"
          @click="nextImage"
          aria-label="下一张"
        >
          ›
        </button>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.image-gallery {
  width: 100%;
  font-family: "Nunito", sans-serif;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(var(--columns, 3), 1fr);
  gap: 16px;
  padding: 16px 0;
}

.gallery-item {
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);

    .image-overlay {
      opacity: 1;
    }
  }
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 75%; // 4:3 aspect ratio
  background: #f5f5f5;
  overflow: hidden;
  border-radius: 16px;
}

.gallery-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  .gallery-item:hover & {
    transform: scale(1.1);
  }
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #E1F5FE, #FFF9C4, #E1F5FE);
  background-size: 200% 200%;
  animation: gradientBG 3s ease infinite;
}

@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.placeholder-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.5);
  border-top-color: #0277BD;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  svg {
    width: 32px;
    height: 32px;
    color: white;
    stroke-width: 2;
  }
}

.image-caption {
  padding: 12px;
  font-size: 14px;
  color: #666;
  text-align: center;
}

// 灯箱样式
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 24px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10001;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 48px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10001;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &.lightbox-prev {
    left: 20px;
  }

  &.lightbox-next {
    right: 20px;
  }
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: calc(90vh - 100px);
  object-fit: contain;
  border-radius: 8px;
}

.lightbox-caption {
  margin-top: 20px;
  color: white;
  font-size: 16px;
  text-align: center;
}

.lightbox-counter {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 14px;
  opacity: 0.8;
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .gallery-grid {
    gap: 12px;
  }

  .lightbox-nav {
    width: 44px;
    height: 44px;
    font-size: 36px;

    &.lightbox-prev {
      left: 10px;
    }

    &.lightbox-next {
      right: 10px;
    }
  }

  .lightbox-close {
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
  }

  .lightbox-image {
    max-height: calc(90vh - 80px);
  }
}
</style>
