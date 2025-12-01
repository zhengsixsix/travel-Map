<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { CreateMapMarkerData } from '~/utils/route';

const router = useRouter();
const markers = CreateMapMarkerData();
const photoMarkers = computed(() => {
  return markers.filter(m => m.preview);
});

const handleSelect = (marker: any) => {
  if (marker.route) {
    router.push(marker.route);
  } else if (marker.coords) {
    // Fallback to map if no route (though all should have routes based on utils/route.ts)
    router.push({ path: '/', query: { flyTo: marker.coords.join(',') } });
  }
};
</script>

<template>
  <div class="photo-gallery-page">
    <div class="gallery-header">
      <h2 class="gallery-title">📷 足迹相册</h2>
    </div>
    
    <div class="gallery-content">
      <div class="gallery-grid">
        <div 
          v-for="(marker, index) in photoMarkers" 
          :key="index" 
          class="photo-item"
          @click="handleSelect(marker)"
        >
          <div class="photo-wrapper">
            <img :src="marker.preview" loading="lazy" :alt="marker.title" />
            <div class="photo-info">
              <div class="photo-title">{{ marker.title }}</div>
              <div class="photo-meta">
                <span class="photo-city">📍 {{ marker.city }}</span>
                <span class="photo-date">{{ marker.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="photoMarkers.length === 0" class="empty-state">
        <div class="empty-icon">🖼️</div>
        <p>暂无带图的足迹</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.photo-gallery-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 100px; /* Space for bottom nav */
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.gallery-header {
  padding: 16px 24px;
  background: white;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.gallery-title {
  margin: 0;
  font-family: "ZCOOL KuaiLe", cursive;
  font-size: 24px;
  color: #333;
}

.gallery-content {
  padding: 8px;
}

.gallery-grid {
  column-count: 4;
  column-gap: 12px;
  max-width: 1400px;
  margin: 0 auto;
}

.photo-item {
  /* aspect-ratio removed to allow natural height */
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  break-inside: avoid; /* Prevent break inside columns */
  margin-bottom: 12px; /* Space between items vertically */
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    
    .photo-info {
      transform: translateY(0);
    }
    
    img {
      transform: scale(1.05);
    }
  }
}

.photo-wrapper {
  position: relative;
  width: 100%;
  /* height removed to wrap content */
}

img {
  width: 100%;
  height: auto; /* Natural height */
  display: block; /* Remove bottom space */
  transition: transform 0.5s ease;
}

/* ... (rest of styles) */

@media (max-width: 1024px) {
  .gallery-grid {
    column-count: 3;
  }
}

@media (max-width: 768px) {
  .gallery-grid {
    column-count: 2;
  }
}

@media (max-width: 640px) {
  .gallery-header {
    padding: 16px 20px;
  }
  
  .gallery-title {
    font-size: 24px;
  }
  
  .gallery-content {
    padding: 8px;
  }
  
  .gallery-grid {
    column-count: 2;
    column-gap: 8px;
  }
  
  .photo-item {
    margin-bottom: 16px;
  }
  
  .photo-info {
    padding: 12px;
    transform: translateY(0);
  }
  
  .photo-title {
    font-size: 14px;
  }
  
  .photo-meta {
    font-size: 11px;
  }
}
</style>
