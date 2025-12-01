<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

const items = [
  {
    label: '地图',
    icon: '/images/icons/nav-map.svg',
    path: '/',
  },
  {
    label: '相册',
    icon: '/images/icons/nav-gallery.svg',
    path: '/gallery',
  },
  {
    label: '统计',
    icon: '/images/icons/nav-stats.svg',
    path: '/stats',
  }
];

const activeIndex = computed(() => {
  return items.findIndex(item => item.path === route.path);
});

const handleClick = (path: string) => {
  router.push(path);
};

const getIconStyle = (url: string) => {
  return {
    maskImage: `url(${url})`,
    WebkitMaskImage: `url(${url})`
  } as any;
};
</script>

<template>
  <div class="nav-wrapper">
    <!-- SVG Filter for Distortion -->
    <svg style="display: none">
      <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.001 0.005" numOctaves="1" seed="17" result="turbulence" />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>

        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />

        <feSpecularLighting in="softMap" surfaceScale="15" specularConstant="1.2" specularExponent="30"
          lighting-color="white" result="specLight">
          <fePointLight x="-100" y="-100" z="200" />
        </feSpecularLighting>

        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />

        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="40" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>

    <nav class="liquidGlass-wrapper">
      <div class="liquidGlass-effect"></div>
      <div class="liquidGlass-tint"></div>
      <div class="liquidGlass-shine"></div>

      <div class="liquidGlass-text nav-container">
        <!-- Indicator -->
        <div class="nav-indicator" :style="{ transform: `translateX(${activeIndex * 100}%)` }">
          <div class="indicator-bg"></div>
        </div>

        <!-- Items -->
        <div v-for="(item, index) in items" :key="item.path" class="nav-item" :class="{ active: activeIndex === index }"
          @click="handleClick(item.path)">
          <div class="item-icon" :style="getIconStyle(item.icon)"></div>
          <span class="item-label">{{ item.label }}</span>
        </div>
      </div>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.nav-wrapper {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
}

.liquidGlass-wrapper {
  position: relative;
  display: flex;
  font-weight: 600;
  overflow: hidden;
  color: black;
  cursor: pointer;
  /* Apple-style shadow: diffuse soft shadow + tight darker shadow */
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 5px 15px rgba(0, 0, 0, 0.05),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
  border-radius: 2rem;
  padding: 4px;
  /* Base transparency */
  background: rgba(255, 255, 255, 0.2);
}

.liquidGlass-effect {
  position: absolute;
  z-index: 0;
  inset: 0;
  /* Strong blur for the frosted glass look */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  /* The distortion filter adds the liquid texture */
  filter: url(#glass-distortion);
  overflow: hidden;
  border-radius: 2rem;
  opacity: 0.7;
}

.liquidGlass-tint {
  z-index: 1;
  position: absolute;
  inset: 0;
  /* A subtle gradient tint */
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.1) 100%);
}

.liquidGlass-shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  /* The classic "glass edge" highlights */
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.7),
    inset 1px 0 0 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 0 rgba(0, 0, 0, 0.05);
  border-radius: 2rem;
  pointer-events: none;
}

.liquidGlass-text {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  width: 100%;
}

.nav-container {
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 4px;
}

.nav-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 33.33%;
  /* 3 items */
  height: 100%;
  padding: 4px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: -1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.indicator-bg {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-item {
  flex: 1;
  min-width: 80px;
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.6);
  transition: all 0.3s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  border-radius: 1.5rem;

  &.active {
    color: #0277BD;

    .item-icon {
      transform: scale(1.1);
    }

    .item-label {
      font-weight: 700;
      opacity: 1;
    }
  }

  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.2);
  }
}

.item-icon {
  width: 20px;
  height: 20px;
  margin-bottom: 4px;
  background-color: currentColor;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.item-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

@media (max-width: 640px) {
  .nav-wrapper {
    bottom: 24px;
    width: 90%;
    max-width: 360px;
  }

  .nav-item {
    height: 52px;
    min-width: auto;
  }
}
</style>
