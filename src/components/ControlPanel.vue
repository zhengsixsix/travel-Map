<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { CreateMapMarkerData } from '~/utils/route';

const isSearchActive = ref(false);
const searchQuery = ref('');
const searchInput = ref<HTMLInputElement | null>(null);

const markers = CreateMapMarkerData();

const searchResults = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return [];
  
  return markers.filter(marker => {
    const title = marker.title?.toLowerCase() || '';
    const city = marker.city?.toLowerCase() || '';
    const desc = marker.desc?.toLowerCase() || '';
    return title.includes(query) || city.includes(query) || desc.includes(query);
  }).slice(0, 5); // Limit results
});

const emit = defineEmits<{
  'fly-to': [coords: number[]];
}>();

const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value;
  if (isSearchActive.value) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  } else {
    searchQuery.value = '';
  }
};

const handleSelect = (marker: MarkerItem) => {
  if (marker.coords) {
    emit('fly-to', marker.coords);
    isSearchActive.value = false;
    searchQuery.value = '';
  }
};

const closeSearch = () => {
  // Delay to allow click event to process
  setTimeout(() => {
    isSearchActive.value = false;
    searchQuery.value = '';
  }, 200);
};
</script>

<template>
  <div class="control-panel">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h1 class="app-title">🗺️ 旅行地图</h1>
      </div>
      
      <div class="toolbar-right">
        <!-- 搜索栏 -->
        <div class="search-wrapper" :class="{ active: isSearchActive }">
          <div class="search-input-box" v-if="isSearchActive">
             <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="搜索地点/城市..."
              @blur="closeSearch"
              @keydown.esc="closeSearch"
            />
          </div>
         
          <button
            class="icon-button search-btn"
            @click="toggleSearch"
            title="搜索地点"
            aria-label="搜索"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- 搜索结果下拉 -->
          <div v-if="isSearchActive && searchResults.length > 0" class="search-results">
            <div 
              v-for="item in searchResults" 
              :key="item.route" 
              class="search-item"
              @mousedown="handleSelect(item)"
            >
              <span class="item-icon">📍</span>
              <div class="item-info">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-sub">{{ item.city }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计面板 (已移除，现在作为独立页面) -->
  </div>
</template>

<style lang="scss" scoped>
.control-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}

.toolbar-left {
  flex: 1;
}

.app-title {
  margin: 0;
  font-family: "ZCOOL KuaiLe", cursive;
  font-size: 28px;
  color: #0277BD; /* Bright Blue */
  text-shadow: 2px 2px 0px #ffffff;
  white-space: nowrap;
  letter-spacing: 1px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  align-items: center;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-box {
  margin-right: 8px;
  
  input {
    width: 200px;
    height: 40px;
    padding: 0 16px;
    border: none;
    border-radius: 20px;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: "Nunito", sans-serif;
    font-size: 14px;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
      box-shadow: 0 6px 16px rgba(2, 119, 189, 0.15);
    }
    
    @media (max-width: 640px) {
      width: 140px;
    }
  }
}

.search-results {
  position: absolute;
  top: 100%;
  right: 0;
  width: 260px;
  margin-top: 12px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
  
  @media (max-width: 640px) {
    width: 220px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.search-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f5f5f5;
  }
  
  .item-icon {
    margin-right: 12px;
    font-size: 18px;
  }
  
  .item-info {
    flex: 1;
    overflow: hidden;
  }
  
  .item-title {
    font-size: 14px;
    color: #333;
    font-weight: 600;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .item-sub {
    font-size: 12px;
    color: #999;
  }
}

.icon-button {
  width: 48px;
  height: 48px;
  border: none;
  background: #ffffff;
  border-radius: 50%; /* Circle */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy transition */
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
    stroke-width: 2.5;
    color: #0277BD;
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 8px 16px rgba(2, 119, 189, 0.2);
    background: #E1F5FE;

    svg {
      color: #01579B;
      transform: scale(1.1);
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.panel-container {
  position: absolute;
  top: 100%;
  right: 20px;
  width: 100%;
  max-width: 400px;
  margin-top: -10px;
  /* Ensure it doesn't go off-screen on small devices */
  @media (max-width: 640px) {
    left: 20px;
    right: 20px;
    width: auto;
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
}

@media (max-width: 1024px) {
  .toolbar {
    padding: 16px;
  }

  .app-title {
    font-size: 24px;
  }

  .panel-container {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .toolbar {
    padding: 12px;
  }

  .app-title {
    font-size: 20px;
  }

  .icon-button {
    width: 40px;
    height: 40px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .panel-container {
    left: 12px;
    right: 12px;
  }
}
</style>
