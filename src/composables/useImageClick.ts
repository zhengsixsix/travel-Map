import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useImageClick() {
  const showViewer = ref(false);
  const currentSrc = ref('');
  const currentAlt = ref('');

  const handleImageClick = (e: Event) => {
    const target = e.target as HTMLElement;
    
    // 检查是否点击的是图片
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      
      // 排除某些不需要预览的图片（例如图标、小图）
      if (img.classList.contains('no-preview') || img.width < 100) {
        return;
      }
      
      currentSrc.value = img.src;
      currentAlt.value = img.alt || '';
      showViewer.value = true;
      
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const closeViewer = () => {
    showViewer.value = false;
  };

  onMounted(() => {
    // 监听整个文档的图片点击
    document.addEventListener('click', handleImageClick, true);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleImageClick, true);
  });

  return {
    showViewer,
    currentSrc,
    currentAlt,
    closeViewer,
  };
}
