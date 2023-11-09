<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{ srcList: string[] }>();
// 列拆分：奇数时左列多一张，视觉更均衡
const splitIndex = computed(() => Math.ceil(props.srcList.length / 2));
const left = computed(() => props.srcList.slice(0, splitIndex.value));
const right = computed(() => props.srcList.slice(splitIndex.value));

// 预览状态
const showViewer = ref(false);
const currentIndex = ref(0);
const allImages = computed(() => props.srcList);
const currentSrc = computed(() => allImages.value[currentIndex.value]);

function openAt(i: number) {
  currentIndex.value = i;
  showViewer.value = true;
}
function closeViewer() {
  showViewer.value = false;
}
function prev() {
  const len = allImages.value.length;
  currentIndex.value = (currentIndex.value - 1 + len) % len;
}
function next() {
  const len = allImages.value.length;
  currentIndex.value = (currentIndex.value + 1) % len;
}
function onKey(e: KeyboardEvent) {
  if (!showViewer.value) return;
  if (e.key === "Escape") return closeViewer();
  if (e.key === "ArrowLeft") return prev();
  if (e.key === "ArrowRight") return next();
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>
<template>
  <client-only>
    <div class="container">
      <div class="left">
        <div v-for="(item, i) in left" :key="item">
          <img class="img clickable" :src="item" @click="openAt(i)" />
        </div>
      </div>
      <div class="right">
        <div v-for="(item, i) in right" :key="item">
          <img class="img clickable" :src="item" @click="openAt(splitIndex + i)" />
        </div>
      </div>
    </div>

    <!-- 预览层（点击遮罩关闭，支持左右切换与键盘导航） -->
    <div v-if="showViewer" class="viewer" @click.self="closeViewer">
      <button class="close" aria-label="close" @click="closeViewer">×</button>
      <button class="nav prev" aria-label="previous" @click.stop="prev">‹</button>
      <img class="viewer-img" :src="currentSrc" />
      <button class="nav next" aria-label="next" @click.stop="next">›</button>
      <div class="counter">{{ currentIndex + 1 }} / {{ allImages.length }}</div>
    </div>
  </client-only>
</template>
<style lang="scss" scoped>
.container {
  display: flex;
  gap: 20px;
  padding: 1.25rem;
  background-color: #ecf0f1;
  border-radius: 8px;
  .left {
    width: 50%;
    margin: 0 auto;
    div {
      display: flex;
      img {
        margin: 0 auto;
        margin-top: 15px;
        border-radius: 8px;
      }
    }
  }
  .right {
    width: 50%;
    margin: 0 auto;
    div {
      display: flex;
      img {
        margin: 0 auto;
        margin-top: 15px;
        border-radius: 8px;
      }
    }
  }
}
.clickable {
  cursor: zoom-in;
}
.viewer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.viewer-img {
  max-width: 92vw;
  max-height: 88vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: 36px;
  width: 48px;
  height: 72px;
  line-height: 72px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
}
.nav:hover {
  background: rgba(255, 255, 255, 0.25);
}
.prev { left: 20px; }
.next { right: 20px; }
.close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}
.close:hover { background: rgba(255,255,255,0.25); }
.counter {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 14px;
  opacity: 0.9;
}
</style>
