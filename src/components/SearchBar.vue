<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { MARKER_MAP } from '~/data/datas';

interface SearchResult {
  province: string;
  city?: string;
  location?: string;
  coords?: number[];
  route?: string;
}

const emit = defineEmits<{
  search: [result: SearchResult];
  clear: [];
}>();

const searchQuery = ref('');
const isExpanded = ref(false);
const selectedIndex = ref(-1);

// 构建搜索索引
const searchIndex = computed(() => {
  const results: SearchResult[] = [];
  
  Object.entries(MARKER_MAP).forEach(([province, data]: [string, any]) => {
    // 添加省份
    if (data.coords) {
      results.push({
        province,
        coords: data.coords,
        route: data.route,
      });
    }
    
    // 添加城市和具体地点
    if (data.children) {
      Object.entries(data.children).forEach(([city, cityData]: [string, any]) => {
        if (cityData.coords) {
          results.push({
            province,
            city,
            coords: cityData.coords,
            route: cityData.route,
          });
        }
        
        if (cityData.children) {
          Object.entries(cityData.children).forEach(([location, locData]: [string, any]) => {
            results.push({
              province,
              city,
              location,
              coords: locData.coords,
              route: locData.route,
            });
          });
        }
      });
    }
  });
  
  return results;
});

// 搜索结果
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return [];
  
  const query = searchQuery.value.toLowerCase();
  return searchIndex.value.filter(item => {
    const searchText = `${item.province} ${item.city || ''} ${item.location || ''}`.toLowerCase();
    return searchText.includes(query);
  }).slice(0, 8); // 限制显示前8个结果
});

// 处理搜索选择
const handleSelect = (result: SearchResult) => {
  emit('search', result);
  searchQuery.value = result.location || result.city || result.province;
  isExpanded.value = false;
  selectedIndex.value = -1;
};

// 清除搜索
const handleClear = () => {
  searchQuery.value = '';
  isExpanded.value = false;
  selectedIndex.value = -1;
  emit('clear');
};

// 键盘导航
const handleKeyDown = (e: KeyboardEvent) => {
  if (!searchResults.value.length) return;
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
      break;
    case 'Enter':
      e.preventDefault();
      if (selectedIndex.value >= 0) {
        handleSelect(searchResults.value[selectedIndex.value]);
      }
      break;
    case 'Escape':
      handleClear();
      break;
  }
};

watch(searchQuery, () => {
  isExpanded.value = searchQuery.value.length > 0;
  selectedIndex.value = -1;
});
</script>

<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索地点、城市或省份..."
        @keydown="handleKeyDown"
        @focus="isExpanded = searchQuery.length > 0"
      />
      
      <button
        v-if="searchQuery"
        class="clear-button"
        @click="handleClear"
        aria-label="清除搜索"
      >
        ✕
      </button>
    </div>
    
    <transition name="dropdown">
      <div v-if="isExpanded && searchResults.length" class="search-results">
        <div
          v-for="(result, index) in searchResults"
          :key="index"
          class="search-result-item"
          :class="{ active: index === selectedIndex }"
          @click="handleSelect(result)"
          @mouseenter="selectedIndex = index"
        >
          <div class="result-icon">📍</div>
          <div class="result-content">
            <div class="result-title">
              {{ result.location || result.city || result.province }}
            </div>
            <div class="result-subtitle">
              {{ result.province }}
              <template v-if="result.city && result.location">
                > {{ result.city }}
              </template>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <div v-if="isExpanded && !searchResults.length && searchQuery" class="no-results">
      未找到相关地点
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-bar {
  position: relative;
  width: 100%;
  max-width: 500px;
  z-index: 1000;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #999;
  margin-right: 12px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  background: transparent;

  &::placeholder {
    color: #999;
  }
}

.clear-button {
  width: 24px;
  height: 24px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #e0e0e0;
    color: #333;
  }
}

.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover,
  &.active {
    background: #f5f5f5;
  }
}

.result-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-subtitle {
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .search-bar {
    max-width: 100%;
  }

  .search-input-wrapper {
    padding: 10px 14px;
  }

  .search-input {
    font-size: 14px;
  }

  .search-results {
    max-height: 300px;
  }
}
</style>
