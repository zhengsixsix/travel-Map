<script setup lang="ts">
import { onMounted, onBeforeUnmount, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { SetupMap } from "~/hooks/useMap/index";
import { fromLonLat } from "~/ol-imports";
import ControlPanel from "./ControlPanel.vue";
import TimelineControl from "./TimelineControl.vue";

const router = useRouter();
const { initMap, map, destroyMap } = SetupMap(router);

let isInitialized = false;

const handleFlyTo = (coords: number[]) => {
  if (!map.value) return;
  const view = map.value.getView();
  if (view) {
    view.animate({
      center: fromLonLat(coords),
      zoom: 10,
      duration: 1000,
    });
  }
};

onMounted(() => {
  console.log('TravelMap component mounted');

  // 确保容器存在
  const mapContainer = document.querySelector('#map');
  if (!mapContainer) {
    console.error('Map container not found');
    return;
  }

  // 清理可能存在的旧内容
  mapContainer.innerHTML = '';

  // 延迟初始化，确保 DOM 已准备好
  setTimeout(() => {
    if (!isInitialized) {
      try {
        initMap();
        isInitialized = true;
        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    }
  }, 100);
});

// 组件卸载前清理地图
onBeforeUnmount(() => {
  console.log('TravelMap component unmounting');
  if (isInitialized) {
    destroyMap();
    isInitialized = false;
  }
});

// 双重保障：组件卸载后再次清理
onUnmounted(() => {
  console.log('TravelMap component unmounted');
  if (isInitialized) {
    destroyMap();
    isInitialized = false;
  }
});

</script>

<template>
  <div class="travel-map-container">
    <div id="map"></div>
    <div id="map_marker_preview">
      <div class="img_box">
        <img src="" />
      </div>
      <div class="info">
        <div class="title" />
        <div class="desc" />
        <div class="date" />
      </div>
    </div>
    <ControlPanel 
      @fly-to="handleFlyTo" 
    />
    <TimelineControl :map="map" v-if="map" />
  </div>
</template>

<style lang="scss" scoped>
.travel-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #E0F7FA;
  /* Ocean Blue Background */
  font-family: "Nunito", sans-serif;
}

#map {
  width: 100%;
  height: 100%;
  background: transparent;
  /* Let container background show through */
}

#map_marker_preview {
  display: flex;
  box-sizing: border-box;
  position: absolute;
  pointer-events: none;
  z-index: 100;
  width: 320px;
  height: 140px;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid #fff;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

  &::before,
  &::after {
    position: absolute;
    content: "";
    width: 0;
    height: 0;
    border-style: solid;
  }

  /* Arrow pointing down (mobile) or left/right */
  /* The original code had logic for mobile/desktop. I will keep it but update colors. */

  @media (max-width: 640px) {
    &::before {
      bottom: -20px;
      left: 50%;
      margin-left: -10px;
      border-width: 10px 10px 0 10px;
      border-color: #ffffff transparent transparent transparent;
    }
  }

  @media (min-width: 640px) {
    &::before {
      top: 50%;
      left: -20px;
      margin-top: -10px;
      border-width: 10px 10px 10px 0;
      border-color: transparent #ffffff transparent transparent;
    }
  }

  .img_box {
    width: 100px;
    height: 100px;
    flex-shrink: 0;
    border-radius: 12px;
    margin-right: 16px;
    padding-bottom: 0;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;

    .title {
      width: 100%;
      font-family: "ZCOOL KuaiLe", cursive;
      font-size: 18px;
      color: #333;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .desc {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: auto;
    }

    .date {
      text-align: right;
      font-size: 12px;
      color: #999;
      font-weight: 600;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;

      &::before {
        content: '📅';
        font-size: 10px;
      }
    }
  }

  @media (max-width: 640px) {
    display: flex;
    flex-direction: column;
    width: 220px;
    height: auto;
    min-height: 240px;
    padding: 20px;

    .img_box {
      width: 100%;
      height: 140px;
      margin-right: 0;
      margin-bottom: 16px;
    }

    .info {
      height: auto;

      .title {
        text-align: center;
        font-size: 20px;
      }

      .desc {
        text-align: center;
        margin-bottom: 12px;
      }

      .date {
        justify-content: center;
      }
    }
  }
}
</style>
