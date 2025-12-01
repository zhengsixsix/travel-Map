<script setup lang="ts">
import {computed} from 'vue';
import {CreateMapMarkerData} from '~/utils/route';

interface StatItem {
  label: string;
  value: number;
  icon: string;
  color: string;
}

// 根据地图标记点计算统计数据
const statistics = computed(() => {
  const markers = CreateMapMarkerData();

  // 统计省份和城市
  const provinces = new Set<string>();
  const cities = new Set<string>();

  markers.forEach(marker => {
    if (marker.coords) {
      // 从 route 路径中提取省份和城市信息
      // 例如: /travel/fujian/fuzhou -> fujian, fuzhou
      if (marker.route) {
        const parts = marker.route.split('/').filter(p => p);
        if (parts.length >= 2) {
          provinces.add(parts[1]); // travel/[province]/city
        }
        if (parts.length >= 3) {
          cities.add(`${parts[1]}-${parts[2]}`);
        }
      }
    }
  });

  return {
    totalMarkers: markers.length,
    provinceCount: provinces.size,
    cityCount: cities.size,
  };
});

const statItems = computed<StatItem[]>(() => [
  {
    label: '旅行标记',
    value: statistics.value.totalMarkers,
    icon: '📍',
    color: '#4CAF50',
  },
  {
    label: '访问省份',
    value: statistics.value.provinceCount,
    icon: '🗺️',
    color: '#2196F3',
  },
  {
    label: '访问城市',
    value: statistics.value.cityCount,
    icon: '🏙️',
    color: '#FF9800',
  },
  {
    label: '旅行足迹',
    value: statistics.value.totalMarkers,
    icon: '✈️',
    color: '#9C27B0',
  },
]);

const props = defineProps<{
  collapsed?: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <div class="statistics-panel" :class="{ collapsed }">
    <div class="panel-header">
      <h3 class="panel-title">旅行统计</h3>
      <button class="toggle-button" @click="emit('toggle')" aria-label="切换面板">
        <svg v-if="!collapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M6 9l6 6 6-6"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
    </div>

    <transition name="expand">
      <div v-if="!collapsed" class="panel-content">
        <div class="stats-grid">
          <div
              v-for="item in statItems"
              :key="item.label"
              class="stat-card"
              :style="{ '--card-color': item.color }"
          >
            <div class="stat-icon">{{ item.icon }}</div>
            <div class="stat-info">
              <div class="stat-value">
                {{ item.value }}
                <span v-if="item.label === '覆盖率'" class="stat-unit">%</span>
              </div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
        </div>

      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.statistics-panel {
  position: relative;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: all 0.3s ease;
  font-family: "Nunito", sans-serif;

  &.collapsed {
    .panel-header {
      border-bottom: none;
    }
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: border 0.3s ease;
}

.panel-title {
  margin: 0;
  font-family: "ZCOOL KuaiLe", cursive;
  font-size: 20px;
  font-weight: 400;
  color: #333;
  letter-spacing: 1px;
}

.toggle-button {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: #666;

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2.5;
  }

  &:hover {
    background: #e0e0e0;
    transform: rotate(90deg);
    color: #333;
  }
}

.panel-content {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 16px;
  border: 2px solid transparent;
  border-color: var(--card-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--card-color);
    opacity: 0.1;
    z-index: 0;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    
    &::before {
      opacity: 0.2;
    }
  }
}

.stat-icon {
  font-size: 32px;
  margin-right: 12px;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.stat-info {
  flex: 1;
  z-index: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #333;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-unit {
  font-size: 16px;
  font-weight: 600;
  color: #666;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
}


.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: scale(0.95);
}

.expand-enter-to,
.expand-leave-from {
  max-height: 600px;
  opacity: 1;
  transform: scale(1);
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-icon {
    font-size: 28px;
  }

  .stat-value {
    font-size: 20px;
  }
}
</style>
