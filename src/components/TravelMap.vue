<script setup lang="ts">
import { onMounted, onBeforeUnmount, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { SetupMap } from "~/hooks/useMap/index";
import ControlPanel from "./ControlPanel.vue";

const router = useRouter();
const { initMap, map, destroyMap } = SetupMap(router);

let isInitialized = false;

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
    <ControlPanel />
  </div>
</template>

<style lang="scss" scoped>
.travel-map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

#map {
  width: 100%;
  height: 100%;
}
#map_marker_preview {
  display: flex;
  box-sizing: border-box;
  position: absolute;
  pointer-events: none;
  z-index: 100;
  width: 300px;
  height: 120px;
  background-color: #eaeaea;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;

  &::before,
  &::after {
    position: absolute;

    content: "";
    width: 0;
    height: 0;
    border-right: 10px solid transparent;
    border-left: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-top: 10px solid #eaeaea;

    @media (max-width: 640px) {
      bottom: -20px;
      left: 50%;
      margin-left: -10px;
    }

    @media (min-width: 640px) {
      top: 50%;
      left: -20px;
      margin-top: -10px;
      border-top: 10px solid transparent;
      border-right: 10px solid #eaeaea;
    }
  }

  .img_box {
    max-width: 100px;
    height: auto;
    border-radius: 5px;
    margin-right: 20px;
    padding-bottom: 0;

    img {
      height: 100%;
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    span {
      display: inline-block;
    }
    .title {
      width: 100%;
      font-size: 14px;
      opacity: 0.8;
    }

    .desc {
      font-size: 12px;
      opacity: 0.7;
    }

    .date {
      text-align: right;
      font-size: 12px;
      opacity: 0.5;
    }
  }

  @media (max-width: 640px) {
    display: inherit;
    width: 200px;
    height: 230px;

    .img_box {
      display: flex;
      justify-content: center;
      width: 100%;
      max-width: 100%;
      height: 100px;
      margin-right: 0;
      padding-bottom: 20px;
    }

    .info {
      height: 100px;

      .title {
        text-align: center;
      }
    }
  }
}
</style>
