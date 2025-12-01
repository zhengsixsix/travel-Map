<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { Map, Feature, LineString, Point, Style, Stroke, Text, Icon, fromLonLat } from '~/ol-imports';
import { CreateMapMarkerData } from '~/utils/route';
import { CreatePointFeature } from '~/hooks/useMap/maker/point';
import { getDistance } from 'ol/sphere';

const props = defineProps<{
  map?: Map;
}>();

const markers = CreateMapMarkerData();
const currentIndex = ref(0);
const isPlaying = ref(false);
const showPath = ref(true);
const isExpanded = ref(false); // Default collapsed
let animationFrameId: number | null = null;

const expand = () => {
  console.log('Timeline expanded');
  isExpanded.value = true;
};

const collapse = () => {
  isExpanded.value = false;
  if (isPlaying.value) pause();
};

watch(isPlaying, (newVal) => {
  if (newVal) {
    isExpanded.value = true;
  }
});

let lastTime = 0;
let segmentProgress = 0; // 0 to 1

// Animation constants
const BASE_SPEED = 0.5; // Progress per second (adjusted by distance)

// Format date helper
const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return isNaN(d.getTime()) ? date : d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
};

const currentDate = computed(() => {
  if (currentIndex.value === 0) return '开始旅程';
  const marker = markers[currentIndex.value - 1];
  return marker ? formatDate(marker.date) : '未开始';
});

const progressPercentage = computed(() => {
  return markers.length ? (currentIndex.value / markers.length) * 100 : 0;
});

// Catmull-Rom Spline interpolation
const solveCatmullRom = (p0: number[], p1: number[], p2: number[], p3: number[], t: number) => {
  const v0 = (p2[0] - p0[0]) * 0.5;
  const v1 = (p3[0] - p1[0]) * 0.5;
  const t2 = t * t;
  const t3 = t * t2;
  return [
    (2 * p1[0] - 2 * p2[0] + v0 + v1) * t3 + (-3 * p1[0] + 3 * p2[0] - 2 * v0 - v1) * t2 + v0 * t + p1[0],
    (2 * p1[1] - 2 * p2[1] + v0 + v1) * t3 + (-3 * p1[1] + 3 * p2[1] - 2 * v0 - v1) * t2 + v0 * t + p1[1]
  ];
};

const getSmoothPath = (coords: number[][]) => {
  if (coords.length < 2) return coords;
  
  const smoothCoords: number[][] = [];
  const points = [...coords];
  
  // Add ghost points for start and end
  points.unshift(points[0]);
  points.push(points[points.length - 1]);
  
  for (let i = 0; i < points.length - 3; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const p2 = points[i + 2];
    const p3 = points[i + 3];
    
    const dist = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
    const steps = Math.max(Math.floor(dist / 10000), 20); 
    
    for (let t = 0; t <= steps; t++) {
      smoothCoords.push(solveCatmullRom(p0, p1, p2, p3, t / steps));
    }
  }
  
  return smoothCoords;
};

// Get transport mode and icon
const getTransportMode = (p1: number[], p2: number[]) => {
  const dist = getDistance(p1, p2); // meters
  const distKm = dist / 1000;
  
  if (distKm < 50) return { icon: '🚶', type: 'walk', speed: 0.8 };
  if (distKm < 800) return { icon: '🚗', type: 'car', speed: 0.5 };
  return { icon: '✈️', type: 'plane', speed: 0.3 };
};

// Current traveler and path features
let travelerFeature: Feature | null = null;
let dynamicLineFeature: Feature | null = null;

const updateMap = () => {
  if (!props.map) return;
  
  const layer = props.map.getLayers().getArray().find(l => l.get('name') === 'markers') as any;
  if (!layer) return;
  
  const source = layer.getSource();
  if (!source) return;
  
  // Cleanup features that are not traveler or dynamic line
  const features = source.getFeatures();
  features.forEach((f: any) => {
    if (f !== travelerFeature && f !== dynamicLineFeature) {
      source.removeFeature(f);
    }
  });
  
  // Draw static markers and completed path
  // We draw up to startIdx (which is currentIndex - 1 during animation, or currentIndex if paused/jumped)
  // Actually currentIndex in my logic is "target" during animation?
  // No, in `animate`: `startIdx = currentIndex.value > 0 ? currentIndex.value - 1 : 0;`
  // So currentIndex is the "target" we are moving TO.
  // The static path should be drawn up to startIdx.
  
  // If we are NOT animating (isPlaying=false), currentIndex is where we are AT.
  // So we draw up to currentIndex.
  
  // Let's simplify:
  // Always draw up to currentIndex.
  // But during animation, currentIndex is the *target*. So we want to draw up to currentIndex-1.
  // But `animate` increments currentIndex ONLY when segment is done.
  // So during animation loop 0->1, currentIndex is 0?
  // In `animate`: `if (startIdx === endIdx) currentIndex.value++`
  // So if we start at 0. startIdx=0, endIdx=0 -> currentIndex becomes 1.
  // Loop continues. Next frame: startIdx=0 (because 1>0? 1-1:0), endIdx=1.
  // So we animate 0->1.
  
  // So when animating 0->1, currentIndex is 1.
  // We want static path to be empty (just 0).
  // So we draw markers.slice(0, currentIndex).
  // If currentIndex=1, slice(0,1) -> [0]. No path. Correct.
  
  // If animating 1->2. currentIndex=2.
  // slice(0,2) -> [0, 1]. Path 0->1. Correct.
  // Animation draws growing path 1->2.
  
  const visibleCount = isPlaying.value ? currentIndex.value : currentIndex.value;
  // Actually if we just finished 0->1, currentIndex becomes 1.
  // The loop finishes.
  // If we paused, currentIndex is 1.
  // updateMap uses currentIndex. slice(0,1) -> [0]. No path 0->1!
  // This is a bug in my previous logic too.
  
  // If I am at station 1 (index 1), I should see path 0->1.
  // So I need slice(0, 2).
  // So `markers.slice(0, currentIndex.value + 1)` ?
  // If index=0. slice(0,1) -> [0]. No path.
  // If index=1. slice(0,2) -> [0,1]. Path 0->1.
  
  // So let's change slice to `currentIndex.value + 1`.
  
  // But wait, in `animate`, we increment currentIndex *before* the loop if start==end.
  // If we start at 0. currentIndex becomes 1.
  // We animate 0->1.
  // Static path should be empty.
  // If we use `currentIndex + 1` (which is 2), we draw 0->1 static path.
  // That overlaps with dynamic path.
  
  // So:
  // If animating: static path up to `currentIndex`. (0->1 animation, index=1, static=[0], path=[])
  // If NOT animating: static path up to `currentIndex + 1`? Or is currentIndex 0-based count?
  // currentIndex is an index. Length is index+1.
  
  // Let's handle the "draw up to" logic carefully.
  
  const displayMarkers = markers.slice(0, isPlaying.value ? currentIndex.value : currentIndex.value + 1);
  
  // Add Markers
  displayMarkers.forEach(m => {
    const feature = CreatePointFeature(m);
    if (feature) source.addFeature(feature);
  });
  
  // Add Static Path
  if (showPath.value && displayMarkers.length > 1) {
    const coords = displayMarkers
      .filter(m => m.coords)
      .map(m => fromLonLat(m.coords));
      
    if (coords.length > 1) {
      const smoothCoords = getSmoothPath(coords);
      const lineFeature = new Feature({
        geometry: new LineString(smoothCoords)
      });
      
      lineFeature.setStyle(new Style({
        stroke: new Stroke({
          color: '#0277BD',
          width: 3,
          lineDash: [10, 10]
        })
      }));
      
      source.addFeature(lineFeature);
    }
  }

  // Re-add dynamic features if they exist
  if (travelerFeature && !source.getFeatureById(travelerFeature.getId())) {
    source.addFeature(travelerFeature);
  }
  if (dynamicLineFeature && !source.getFeatureById(dynamicLineFeature.getId())) {
    source.addFeature(dynamicLineFeature);
  }
};

const animate = (timestamp: number) => {
  if (!isPlaying.value) return;
  if (!lastTime) lastTime = timestamp;
  const deltaTime = (timestamp - lastTime) / 1000; // seconds
  lastTime = timestamp;

  if (currentIndex.value >= markers.length) {
    isPlaying.value = false;
    // Cleanup dynamic features
    if (travelerFeature) {
        const layer = props.map?.getLayers().getArray().find(l => l.get('name') === 'markers') as any;
        layer?.getSource()?.removeFeature(travelerFeature);
        travelerFeature = null;
    }
    if (dynamicLineFeature) {
        const layer = props.map?.getLayers().getArray().find(l => l.get('name') === 'markers') as any;
        layer?.getSource()?.removeFeature(dynamicLineFeature);
        dynamicLineFeature = null;
    }
    // Final update to show full path
    updateMap();
    return;
  }

  const startIdx = currentIndex.value > 0 ? currentIndex.value - 1 : 0;
  const endIdx = currentIndex.value;
  
  if (startIdx === endIdx) {
    currentIndex.value++;
    requestAnimationFrame(animate);
    return;
  }

  const startMarker = markers[startIdx];
  const endMarker = markers[endIdx];

  if (!startMarker.coords || !endMarker.coords) {
    currentIndex.value++; 
    requestAnimationFrame(animate);
    return;
  }

  const startCoords = fromLonLat(startMarker.coords);
  const endCoords = fromLonLat(endMarker.coords);
  
  const { icon, speed } = getTransportMode(startMarker.coords, endMarker.coords);
  
  const pPrev = markers[startIdx - 1]?.coords ? fromLonLat(markers[startIdx - 1].coords) : startCoords;
  const pNext = markers[endIdx + 1]?.coords ? fromLonLat(markers[endIdx + 1].coords) : endCoords;
  
  const curvePoints: number[][] = [];
  const steps = 100; 
  
  for (let t = 0; t <= steps; t++) {
    curvePoints.push(solveCatmullRom(pPrev, startCoords, endCoords, pNext, t / steps));
  }

  segmentProgress += deltaTime * speed;
  
  if (segmentProgress >= 1) {
    segmentProgress = 0;
    currentIndex.value++;
    
    // Segment done, remove dynamic line (it will become static in next updateMap)
    if (dynamicLineFeature) {
        const layer = props.map?.getLayers().getArray().find(l => l.get('name') === 'markers') as any;
        layer?.getSource()?.removeFeature(dynamicLineFeature);
        dynamicLineFeature = null;
    }
    
    // Update map to make this segment static
    updateMap();
    
    if (currentIndex.value >= markers.length) {
      isPlaying.value = false;
    }
  } else {
    const pointIndex = Math.floor(segmentProgress * (curvePoints.length - 1));
    const currentPos = curvePoints[pointIndex];
    
    // Update/Create Traveler
    const nextPos = curvePoints[Math.min(pointIndex + 1, curvePoints.length - 1)];
    const dx = nextPos[0] - currentPos[0];
    const dy = nextPos[1] - currentPos[1];
    const rotation = Math.atan2(dy, dx);

    const layer = props.map?.getLayers().getArray().find(l => l.get('name') === 'markers') as any;
    const source = layer?.getSource();

    if (!travelerFeature) {
      travelerFeature = new Feature({
        geometry: new Point(currentPos)
      });
      travelerFeature.setId('traveler');
      source?.addFeature(travelerFeature);
    } else {
       (travelerFeature.getGeometry() as Point).setCoordinates(currentPos);
    }
    
    // Camera follows traveler
    if (props.map) {
      const view = props.map.getView();
      view.setCenter(currentPos);
    }
    
    // Determine style based on type
    const transportType = getTransportMode(startMarker.coords, endMarker.coords).type;
    
    if (transportType === 'car') {
       travelerFeature.setStyle(new Style({
        image: new Icon({
          src: '/images/icons/car.svg',
          scale: 1.2,
          rotation: -rotation
        })
      }));
    } else {
      travelerFeature.setStyle(new Style({
        text: new Text({
          text: icon,
          font: '24px sans-serif',
          rotation: icon === '✈️' ? -rotation + Math.PI / 2 : 0, 
          offsetY: -10
        })
      }));
    }

    // Update/Create Dynamic Line
    if (showPath.value) {
        // We need points up to currentPos
        const currentPathPoints = curvePoints.slice(0, pointIndex + 1);
        if (currentPathPoints.length > 1) {
            if (!dynamicLineFeature) {
                dynamicLineFeature = new Feature({
                    geometry: new LineString(currentPathPoints)
                });
                dynamicLineFeature.setId('dynamic-line');
                source?.addFeature(dynamicLineFeature);
                
                dynamicLineFeature.setStyle(new Style({
                    stroke: new Stroke({
                        color: '#0277BD',
                        width: 3,
                        lineDash: [10, 10]
                    })
                }));
            } else {
                (dynamicLineFeature.getGeometry() as LineString).setCoordinates(currentPathPoints);
            }
        }
    }
  }
  
  if (isPlaying.value) {
    animationFrameId = requestAnimationFrame(animate);
  }
};

// Watchers for external slider control (when not playing)
watch(currentIndex, (newVal, oldVal) => {
  // If we jumped manually (not playing), update map instantly
  if (!isPlaying.value) {
      updateMap();
  } else {
      // Even while playing, we need to ensure static markers are updated
      // updateMap() clears source, so we need to be careful
      // Let's update static map but keep traveler
      updateMap();
  }
});

watch(showPath, () => {
  updateMap();
});

const play = () => {
  if (currentIndex.value >= markers.length) {
    currentIndex.value = 0;
  }
  isPlaying.value = true;
  lastTime = 0;
  segmentProgress = 0;
  animationFrameId = requestAnimationFrame(animate);
};

const pause = () => {
  isPlaying.value = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (travelerFeature) {
    const layer = props.map?.getLayers().getArray().find(l => l.get('name') === 'markers') as any;
    layer?.getSource()?.removeFeature(travelerFeature);
    travelerFeature = null;
  }
};

const togglePlay = () => {
  if (isPlaying.value) pause();
  else play();
};

onUnmounted(() => {
  pause();
});
const getIconStyle = (name: string) => {
  const url = `/images/icons/${name}.svg`;
  return {
    maskImage: `url(${url})`,
    WebkitMaskImage: `url(${url})`,
    backgroundColor: 'currentColor',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    WebkitMaskSize: 'contain'
  } as any;
};
</script>

<template>
  <div class="timeline-container" :class="{ 'is-expanded': isExpanded }">
    <!-- Minimized State (FAB) -->
    <transition name="fade-scale" mode="out-in">
      <button 
        v-if="!isExpanded" 
        class="fab-btn liquidGlass-wrapper" 
        @click="expand"
        title="开启时间轴"
      >
        <div class="liquidGlass-effect"></div>
        <div class="liquidGlass-tint"></div>
        <div class="liquidGlass-shine"></div>
        <div class="icon-svg" :style="getIconStyle('timeline')"></div>
      </button>

      <!-- Expanded State (Player) -->
      <div v-else class="player-pill liquidGlass-wrapper">
        <div class="liquidGlass-effect"></div>
        <div class="liquidGlass-tint"></div>
        <div class="liquidGlass-shine"></div>
        
        <div class="player-content">
          <!-- Play/Pause -->
          <button class="control-btn main-action" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
            <div class="icon-svg action-icon" :style="getIconStyle(isPlaying ? 'pause' : 'play')"></div>
          </button>
          
          <!-- Date & Slider Group -->
          <div class="center-group">
            <div class="date-tag">{{ currentDate }}</div>
            <div class="slider-box">
               <input 
                type="range" 
                min="0" 
                :max="markers.length" 
                v-model.number="currentIndex"
                class="compact-slider"
                :style="{ '--progress': `${progressPercentage}%` }"
              >
            </div>
          </div>

          <!-- Extra Controls -->
          <div class="actions-group">
            <label class="icon-toggle" :class="{ active: showPath }" title="显示路线">
              <input type="checkbox" v-model="showPath" hidden>
              <div class="icon-svg sm-icon" :style="getIconStyle('marker')"></div>
            </label>
            <button class="control-btn close-btn" @click="collapse" title="收起">
              <div class="icon-svg sm-icon" :style="getIconStyle('close')"></div>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.icon-svg {
  width: 24px;
  height: 24px;
  background-color: #0277BD;
  transition: transform 0.2s;
}

.sm-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
  background-color: #333;
}

.action-icon {
  width: 20px;
  height: 20px;
  background-color: #0277BD;
}

.timeline-container {
  position: absolute;
  bottom: 110px; /* Above bottom nav */
  right: 20px;
  z-index: 3000;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  /* Mobile safe area */
  margin-bottom: env(safe-area-inset-bottom);
  pointer-events: none;
}

/* Shared Glass Styles */
.liquidGlass-wrapper {
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab-btn, .player-pill {
  pointer-events: auto;
}

.liquidGlass-effect, .liquidGlass-tint, .liquidGlass-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.liquidGlass-tint {
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
  z-index: 1;
}

.liquidGlass-shine {
  z-index: 2;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8);
}

/* FAB Styles */
.fab-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none; /* Reset default border */
  padding: 0;
  
  .icon {
    position: relative;
    z-index: 3;
    font-size: 24px;
    line-height: 1;
  }

  &:hover {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.8);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

/* Expanded Player Styles */
.player-pill {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  min-width: 300px;
  max-width: 90vw;
}

.player-content {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 0 8px;
}

.control-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  color: #0277BD;
  
  &:hover {
    transform: scale(1.15);
  }
  &:active {
    transform: scale(0.95);
  }
}

.main-action {
  font-size: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(2, 119, 189, 0.1);
  
  &:hover {
    background: rgba(2, 119, 189, 0.2);
  }
}

.center-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0; /* Flexbox truncation fix */
}

.date-tag {
  font-size: 12px;
  font-weight: 700;
  color: #0277BD;
  text-align: center;
  font-family: "ZCOOL KuaiLe", cursive;
  white-space: nowrap;
}

.slider-box {
  height: 16px; /* Height for touch target */
  display: flex;
  align-items: center;
}

.compact-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
  cursor: pointer;
  
  /* Progress fill */
  background-image: linear-gradient(#0277BD, #0277BD);
  background-size: var(--progress) 100%;
  background-repeat: no-repeat;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 14px;
    width: 14px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #0277BD;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    transition: transform 0.1s;
    
    &:hover {
      transform: scale(1.3);
    }
  }
  
  &::-moz-range-thumb {
    height: 14px;
    width: 14px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #0277BD;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 1px solid rgba(0,0,0,0.1);
  padding-left: 8px;
}

.icon-toggle {
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
  opacity: 0.5;
  
  &:hover {
    background: rgba(0,0,0,0.05);
  }
  
  &.active {
    opacity: 1;
    transform: scale(1.1);
  }
}

.close-btn {
  font-size: 14px;
  width: 24px;
  height: 24px;
  opacity: 0.6;
  
  &:hover {
    opacity: 1;
    background: rgba(0,0,0,0.05);
    border-radius: 50%;
  }
}

/* Transitions */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}
</style>
