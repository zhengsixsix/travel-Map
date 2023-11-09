<script setup lang="ts">
import { ref } from 'vue';
import StatisticsPanel from './StatisticsPanel.vue';

const isPanelCollapsed = ref(false);
</script>

<template>
  <div class="control-panel">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h1 class="app-title">🗺️ 旅行地图</h1>
      </div>
      
      <div class="toolbar-right">
        <button
          class="icon-button"
          @click="isPanelCollapsed = !isPanelCollapsed"
          :title="isPanelCollapsed ? '显示统计' : '隐藏统计'"
          aria-label="统计面板"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 3v18h18M7 16l4-4 4 4 6-6" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 统计面板 -->
    <transition name="slide-down">
      <div v-if="!isPanelCollapsed" class="panel-container">
        <StatisticsPanel
          :collapsed="isPanelCollapsed"
          @toggle="isPanelCollapsed = !isPanelCollapsed"
        />
      </div>
    </transition>
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
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}

.toolbar-left {
  flex: 1;
}

.app-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.icon-button {
  width: 48px;
  height: 48px;
  border: none;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
    stroke-width: 2;
    color: #666;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    svg {
      color: #333;
    }
  }

  &:active {
    transform: translateY(0);
  }
}

.panel-container {
  position: absolute;
  top: 100%;
  left: 20px;
  right: 20px;
  max-width: 400px;
  margin-top: -10px;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 1024px) {
  .toolbar {
    padding: 16px;
  }

  .app-title {
    font-size: 20px;
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
    font-size: 18px;
  }

  .icon-button {
    width: 44px;
    height: 44px;

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
