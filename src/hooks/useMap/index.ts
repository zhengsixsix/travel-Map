import { Map, View, fromLonLat, transformExtent } from "~/ol-imports";

import { MAP_DEFAULT_OPTIONS, EPSG4326 } from "./config";

import {
  SetupBaseLayer,
  SetupProvinceLayer,
  SetupEventListener,
} from "./layer";

import { SetupMarkerLayer, CleanupMarkerLayer } from "./maker";

import { setupWindowEventListener } from "~/utils/window";

import { ref } from "vue";
import { Router } from "vue-router";

function CreateMap() {
  const element = document.querySelector("#map") as HTMLElement;
  const { center, zoom, minZoom, maxZoom, extent } = MAP_DEFAULT_OPTIONS;
  const map = new Map({
    target: element,
    layers: [],
    controls: [],
  });
  map.setView(
    new View({
      center: fromLonLat(center),
      zoom,
      minZoom,
      maxZoom,
      constrainResolution: true,
      extent: transformExtent(extent, EPSG4326, map.getView().getProjection()),
    })
  );
  return map;
}

export function SetupMap(router?: Router) {
  const map = ref<Map>();
  let resizeListenerAdded = false;

  const { listen, watchWindowChange } = setupWindowEventListener();

  const initMap = () => {
    // 如果已经存在地图实例，先销毁
    if (map.value) {
      destroyMap();
    }

    map.value = CreateMap();
    SetupBaseLayer(map.value);
    SetupProvinceLayer(map.value);

    SetupMarkerLayer(map.value, watchWindowChange, router);

    SetupEventListener(map.value);

    // 只添加一次 resize 监听器
    if (!resizeListenerAdded) {
      listen();
      resizeListenerAdded = true;
    }
  };

  const destroyMap = () => {
    if (map.value) {
      console.log('Starting map cleanup...');

      try {
        // 清理标记图层的 interactions
        CleanupMarkerLayer(map.value);

        // 移除所有 interactions
        const interactions = map.value.getInteractions().getArray().slice();
        interactions.forEach(interaction => {
          try {
            map.value!.removeInteraction(interaction);
          } catch (e) {
            console.warn('Failed to remove interaction:', e);
          }
        });

        // 移除所有 overlays
        const overlays = map.value.getOverlays().getArray().slice();
        overlays.forEach(overlay => {
          try {
            map.value!.removeOverlay(overlay);
          } catch (e) {
            console.warn('Failed to remove overlay:', e);
          }
        });

        // 移除所有图层
        const layers = map.value.getLayers().getArray().slice();
        layers.forEach(layer => {
          try {
            // 清理图层源 (使用类型断言绕过 BaseLayer 类型限制)
            const source = (layer as any).getSource?.();
            if (source && typeof source.clear === 'function') {
              source.clear();
            }
            map.value!.removeLayer(layer);
          } catch (e) {
            console.warn('Failed to remove layer:', e);
          }
        });

        // 移除视图事件监听
        const view = map.value.getView();
        if (view) {
          view.un('change:resolution', () => { });
        }

        // 解除地图与 DOM 的绑定
        map.value.setTarget(undefined);

        // 清空引用
        map.value = undefined;

        console.log('Map destroyed successfully');
      } catch (error) {
        console.error('Error during map cleanup:', error);
        // 即使出错也要清空引用
        map.value = undefined;
      }
    }
  };

  return { initMap, map, destroyMap };
}
