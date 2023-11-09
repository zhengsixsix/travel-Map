<script setup lang="ts">
import { ref } from 'vue';
import { MARKER_MAP } from '~/data/datas';

const emit = defineEmits<{
  import: [data: any];
  export: [];
}>();

const isOpen = ref(false);
const importFile = ref<File | null>(null);
const importError = ref('');
const exportFormat = ref<'json' | 'csv'>('json');

// 打开/关闭对话框
const toggle = () => {
  isOpen.value = !isOpen.value;
  importError.value = '';
  importFile.value = null;
};

defineExpose({ toggle });

// 导出为JSON
const exportToJSON = () => {
  const dataStr = JSON.stringify(MARKER_MAP, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `travel-map-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(link.href);
  showToast('数据已导出为 JSON 文件');
};

// 导出为CSV
const exportToCSV = () => {
  const rows: string[][] = [['省份', '城市', '地点', '经度', '纬度', '路由']];
  
  Object.entries(MARKER_MAP).forEach(([province, data]: [string, any]) => {
    if (data.coords) {
      rows.push([
        province,
        '',
        '',
        data.coords[0]?.toString() || '',
        data.coords[1]?.toString() || '',
        data.route || '',
      ]);
    }
    
    if (data.children) {
      Object.entries(data.children).forEach(([city, cityData]: [string, any]) => {
        if (cityData.coords) {
          rows.push([
            province,
            city,
            '',
            cityData.coords[0]?.toString() || '',
            cityData.coords[1]?.toString() || '',
            cityData.route || '',
          ]);
        }
        
        if (cityData.children) {
          Object.entries(cityData.children).forEach(([location, locData]: [string, any]) => {
            rows.push([
              province,
              city,
              location,
              locData.coords?.[0]?.toString() || '',
              locData.coords?.[1]?.toString() || '',
              locData.route || '',
            ]);
          });
        }
      });
    }
  });
  
  const csvContent = rows.map(row => row.join(',')).join('\n');
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const dataBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `travel-map-data-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  URL.revokeObjectURL(link.href);
  showToast('数据已导出为 CSV 文件');
};

// 处理导出
const handleExport = () => {
  if (exportFormat.value === 'json') {
    exportToJSON();
  } else {
    exportToCSV();
  }
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    importFile.value = file;
    importError.value = '';
  }
};

// 导入JSON数据
const handleImport = async () => {
  if (!importFile.value) {
    importError.value = '请选择要导入的文件';
    return;
  }
  
  try {
    const text = await importFile.value.text();
    const data = JSON.parse(text);
    
    // 简单验证数据格式
    if (typeof data !== 'object' || data === null) {
      throw new Error('无效的数据格式');
    }
    
    emit('import', data);
    showToast('数据导入成功');
    toggle();
  } catch (error) {
    importError.value = error instanceof Error ? error.message : '导入失败';
  }
};

// 显示提示消息
const showToast = (message: string) => {
  // 简单的toast实现
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    animation: fadeInOut 3s ease;
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => document.body.removeChild(toast), 3000);
};
</script>

<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="toggle">
      <div class="modal-content">
        <div class="modal-header">
          <h3>数据管理</h3>
          <button class="close-button" @click="toggle" aria-label="关闭">✕</button>
        </div>

        <div class="modal-body">
          <!-- 导出部分 -->
          <div class="section">
            <h4 class="section-title">📤 导出数据</h4>
            <p class="section-desc">将旅行数据导出为文件以便备份</p>
            
            <div class="format-selector">
              <label class="radio-label">
                <input
                  v-model="exportFormat"
                  type="radio"
                  value="json"
                  name="export-format"
                />
                <span>JSON 格式</span>
                <small>完整数据结构，可重新导入</small>
              </label>
              
              <label class="radio-label">
                <input
                  v-model="exportFormat"
                  type="radio"
                  value="csv"
                  name="export-format"
                />
                <span>CSV 格式</span>
                <small>表格格式，可用 Excel 打开</small>
              </label>
            </div>
            
            <button class="primary-button" @click="handleExport">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              导出数据
            </button>
          </div>

          <div class="divider" />

          <!-- 导入部分 -->
          <div class="section">
            <h4 class="section-title">📥 导入数据</h4>
            <p class="section-desc">从 JSON 文件导入旅行数据</p>
            
            <div class="file-input-wrapper">
              <input
                id="file-input"
                type="file"
                accept=".json"
                class="file-input"
                @change="handleFileSelect"
              />
              <label for="file-input" class="file-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span v-if="!importFile">选择文件</span>
                <span v-else>{{ importFile.name }}</span>
              </label>
            </div>
            
            <div v-if="importError" class="error-message">
              ⚠️ {{ importError }}
            </div>
            
            <button
              class="primary-button"
              :disabled="!importFile"
              @click="handleImport"
            >
              导入数据
            </button>
          </div>

          <div class="warning-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <strong>注意：</strong>导入数据将替换当前所有数据，请先导出备份！
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
}

.close-button {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e0e0e0;
    transform: rotate(90deg);
  }
}

.modal-body {
  padding: 24px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-desc {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #999;
}

.format-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.radio-label {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
  }

  input[type="radio"] {
    margin: 2px 12px 0 0;
    cursor: pointer;
  }

  span {
    font-weight: 500;
    color: #333;
    display: block;
    margin-bottom: 4px;
  }

  small {
    font-size: 12px;
    color: #999;
    display: block;
  }
}

.file-input-wrapper {
  margin-bottom: 16px;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
  font-size: 14px;

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2;
  }

  &:hover {
    background: #f0f0f0;
    border-color: #bbb;
  }
}

.primary-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2;
  }

  &:hover:not(:disabled) {
    background: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
}

.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 24px 0;
}

.error-message {
  padding: 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.warning-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  border-radius: 8px;
  font-size: 14px;
  color: #e65100;
  margin-top: 24px;

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 2;
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    font-weight: 600;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .modal-content {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-content {
    transform: scale(0.9);
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0;
  }
  10%, 90% {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .modal-content {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .format-selector {
    flex-direction: column;
  }
}
</style>
