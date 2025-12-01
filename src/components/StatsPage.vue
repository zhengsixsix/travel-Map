<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { CreateMapMarkerData } from '~/utils/route';
import StatisticsPanel from './StatisticsPanel.vue';

// We can reuse the StatisticsPanel component but wrap it in a page layout
// Or we can extract logic. Since StatisticsPanel is self-contained, we can just use it.
// But StatisticsPanel has a toggle button and overlay logic. We should probably refactor it or just hide the header.
// Let's just create a wrapper that uses the same data logic but displays it as a full page.

// Actually, StatisticsPanel was designed as a popup. Let's create a dedicated page view using the same data.
// We can copy the logic from StatisticsPanel or import it if we refactor. 
// To be quick and clean, I'll reimplement the view here for the full page experience.

import { computed } from 'vue';

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
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" /><stop offset="100%" style="stop-color:#FF8E8E;stop-opacity:1" /></linearGradient></defs><path d="M12 13.43a3.12 3.12 0 1 0 0-6.24 3.12 3.12 0 0 0 0 6.24Z" fill="white" fill-opacity="0.9"/><path d="M20.9 11.6C20.7 17.8 13.5 22.3 12 22.3s-8.7-4.5-8.9-10.7a8.9 8.9 0 1 1 17.8 0Z" fill="url(#grad1)"/></svg>`,
    color: '#FF6B6B',
  },
  {
    label: '访问省份',
    value: statistics.value.provinceCount,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4ECDC4;stop-opacity:1" /><stop offset="100%" style="stop-color:#6EE7DE;stop-opacity:1" /></linearGradient></defs><path d="M9 20l-5.44-2.72a2 2 0 0 1-1-1.34l-.12-.59 5.24-2.62 3.12 3.12L9 20zM15 4l5.44 2.72a2 2 0 0 1 1 1.34l.12.59-5.24 2.62-3.12-3.12L15 4zM13.73 7.17L19 9.8V18l-5.44 2.72a2 2 0 0 1-1.79 0L6.33 18 12 15.17l1.73-8z" fill="url(#grad2)"/></svg>`,
    color: '#4ECDC4',
  },
  {
    label: '访问城市',
    value: statistics.value.cityCount,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#45B7D1;stop-opacity:1" /><stop offset="100%" style="stop-color:#69D5EE;stop-opacity:1" /></linearGradient></defs><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21V11l3-1.5M16 21v-8l-2.5-1.5" stroke="url(#grad3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 14h.01M9 17h.01M15 14h.01M15 17h.01" stroke="url(#grad3)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    color: '#45B7D1',
  },
  {
    label: '旅行足迹',
    value: statistics.value.totalMarkers,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#96CEB4;stop-opacity:1" /><stop offset="100%" style="stop-color:#B8E6D0;stop-opacity:1" /></linearGradient></defs><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" fill="url(#grad4)"/></svg>`,
    color: '#96CEB4',
  },
]);

</script>

<template>
  <div class="stats-page">
    <div class="stats-header">
      <h2 class="stats-title">📊 旅行统计</h2>
    </div>

    <div class="stats-content">
      <!-- Overview Cards -->
      <div class="stats-grid">
        <div v-for="item in statItems" :key="item.label" class="stat-card" :style="{ '--card-color': item.color }">
          <div class="stat-icon" v-html="item.icon"></div>
          <div class="stat-info">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stats-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  padding-bottom: 100px;
  /* Space for bottom nav */
  animation: fadeIn 0.3s ease;
  font-family: "Nunito", sans-serif;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.stats-header {
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.stats-title {
  margin: 0;
  font-family: "ZCOOL KuaiLe", cursive;
  font-size: 28px;
  color: #333;
  letter-spacing: 1px;
}

.stats-content {
  padding: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--card-color);
    opacity: 0.08;
    z-index: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    background: white;
    border-color: var(--card-color);

    &::before {
      opacity: 0.15;
    }

    .stat-icon {
      transform: scale(1.2) rotate(10deg);
      color: var(--card-color);
    }
  }
}

.stat-icon {
  width: 56px;
  height: 56px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  color: #666;
  margin-right: 20px;
  z-index: 1;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
}

.stat-info {
  flex: 1;
  z-index: 1;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: #333;
  line-height: 1;
  margin-bottom: 4px;
  background: linear-gradient(45deg, #333, #666);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 14px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
}

@media (max-width: 640px) {
  .stats-header {
    padding: 16px 20px;
  }

  .stats-title {
    font-size: 24px;
  }

  .stats-content {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .stat-card {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    border-radius: 20px;

    &:hover {
      transform: translateY(-4px);
    }
  }

  .stat-icon {
    margin-right: 0;
    margin-bottom: 12px;
    font-size: 36px;
  }

  .stat-value {
    font-size: 28px;
  }

  .stat-label {
    font-size: 12px;
  }
}
</style>
