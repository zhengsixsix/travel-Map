import { Layer, Map, click, pointerMove } from "~/ol-imports";
import { Router } from "vue-router";

import { CreateMarkerLayer } from "./point";
import { MarkerPreview, CreateMarkerPreview } from "./preview";
import { Interaction } from "./interaction";

// 存储 interactions 以便清理
let hoverInteraction: Interaction | null = null;
let clickInteraction: Interaction | null = null;

export function SetupMarkerLayer(map: Map, watchWindowChange: Function, router?: Router) {
  try {
    // 创建点图层
    const containerLayer = CreateMarkerLayer();
    
    if (!containerLayer) {
      console.error('Failed to create marker layer');
      return;
    }

    map.addLayer(containerLayer);
    
    // 安全地添加分辨率变化监听
    const view = map.getView();
    if (view && typeof containerLayer.changed === 'function') {
      view.on("change:resolution", () => containerLayer.changed());
    }
    
    const preview = CreateMarkerPreview();
    if (preview?.overlay) {
      map.addOverlay(preview.overlay);
    }

    BindMarkerEvents(map, containerLayer, preview, router);
    
    console.log('Marker layer setup completed successfully');
  } catch (error) {
    console.error('Error setting up marker layer:', error);
  }
}

// 清理标记图层相关资源
export function CleanupMarkerLayer(map: Map) {
  // 移除 hover interaction
  if (hoverInteraction) {
    hoverInteraction.cleanup(); // 清理事件监听器
    map.removeInteraction(hoverInteraction.interaction);
    hoverInteraction = null;
  }
  
  // 移除 click interaction
  if (clickInteraction) {
    clickInteraction.cleanup(); // 清理事件监听器
    map.removeInteraction(clickInteraction.interaction);
    clickInteraction = null;
  }
  
  console.log('Marker layer interactions cleaned up');
}

// 点击事件
function BindMarkerEvents(map: Map, layer: Layer, preview: MarkerPreview, router?: Router) {
  // 清理旧的 interactions（如果存在）
  CleanupMarkerLayer(map);
  
  // 悬停交互
  hoverInteraction = new Interaction(layer, pointerMove);
  hoverInteraction.mount(map);
  hoverInteraction.on((e) => {
    const { hit, info, coords } = e;
    map.getTargetElement().style.cursor = hit ? "pointer" : "default";
    preview.setPreview(info);
    preview.setStyle(info);
    preview.setPosition(coords);
  });
  
  // 点击交互
  clickInteraction = new Interaction(layer, click);
  clickInteraction.mount(map);
  clickInteraction.on(({ info }) => {
    console.log('Marker clicked:', info); // 调试日志
    
    if (info?.route) {
      console.log('Navigating to:', info.route); // 调试日志
      
      // 使用 Vue Router 进行 SPA 跳转
      if (router) {
        router.push(info.route).catch(err => {
          console.error('Navigation failed:', err);
        });
      } else {
        // 如果没有 router，使用原生跳转
        console.warn('Router not available, using native navigation');
        if (typeof window !== 'undefined') {
          window.location.href = info.route;
        }
      }
    } else {
      console.warn('No route found for marker:', info); // 警告日志
    }
  });
}
