<template>
  <div class="filter-panel">
    <a-card size="small" :title="title">
      <div class="filter-form">
        <div class="filter-item">
          <label class="filter-label">厅室类型</label>
          <a-select
            v-model:value="filters.hallType"
            @change="handleFilterChange"
            placeholder="全部厅室类型"
            allow-clear
          >
            <a-select-option value="all">全部类型</a-select-option>
            <a-select-option value="small">小型 (20人)</a-select-option>
            <a-select-option value="medium">中型 (50人)</a-select-option>
            <a-select-option value="large">大型 (100人)</a-select-option>
            <a-select-option value="luxury">豪华 (200人)</a-select-option>
          </a-select>
        </div>

        <div class="filter-item">
          <label class="filter-label">服务类型</label>
          <a-select
            v-model:value="filters.serviceType"
            @change="handleFilterChange"
            placeholder="全部服务类型"
            allow-clear
          >
            <a-select-option value="all">全部服务</a-select-option>
            <a-select-option value="emcee">司仪</a-select-option>
            <a-select-option value="band">乐队</a-select-option>
            <a-select-option value="flowers">鲜花布置</a-select-option>
            <a-select-option value="video">电子屏追思视频</a-select-option>
          </a-select>
        </div>

        <div class="filter-item">
          <label class="filter-label">时间范围</label>
          <a-select
            v-model:value="filters.timeRange"
            @change="handleTimeRangeChange"
            placeholder="全部时段"
            allow-clear
          >
            <a-select-option value="all">全部时段</a-select-option>
            <a-select-option value="morning">上午 (07:00-12:00)</a-select-option>
            <a-select-option value="afternoon">下午 (12:00-18:00)</a-select-option>
            <a-select-option value="peak">高峰期 (09:00-11:00)</a-select-option>
          </a-select>
        </div>

        <div class="filter-item">
          <label class="filter-label">关键词搜索</label>
          <a-input-search
            v-model:value="filters.keyword"
            placeholder="逝者姓名/家属姓名"
            @search="handleFilterChange"
            allow-clear
          />
        </div>
      </div>

      <div class="filter-actions">
        <a-button size="small" @click="resetFilters">重置</a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { halls } from '../data/mockData.js'

const props = defineProps({
  title: {
    type: String,
    default: '筛选条件'
  }
})

const emit = defineEmits(['filter-change'])

const filters = reactive({
  hallType: 'all',
  serviceType: 'all',
  timeRange: 'all',
  keyword: ''
})

const timeRanges = {
  morning: ['07:00', '12:00'],
  afternoon: ['12:00', '18:00'],
  peak: ['09:00', '11:00']
}

function handleFilterChange() {
  emitChange()
}

function handleTimeRangeChange(value) {
  emitChange()
}

function emitChange() {
  const result = {
    ...filters,
    hallIds: getFilteredHallIds()
  }
  emit('filter-change', result)
}

function getFilteredHallIds() {
  if (filters.hallType === 'all' || !filters.hallType) {
    return null
  }
  return halls
    .filter(h => h.type === filters.hallType)
    .map(h => h.id)
}

function resetFilters() {
  filters.hallType = 'all'
  filters.serviceType = 'all'
  filters.timeRange = 'all'
  filters.keyword = ''
  emitChange()
}

watch(() => filters.timeRange, (newVal) => {
  // 时间范围变化时也触发筛选
})
</script>

<style scoped>
.filter-panel {
  width: 100%;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.75);
  font-weight: 500;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
