<template>
  <div class="hall-usage-ranking">
    <h4 class="section-title">{{ title }}</h4>
    <div class="ranking-list">
      <div
        v-for="(hall, index) in data"
        :key="hall.id"
        class="ranking-item"
      >
        <div class="ranking-rank">
          <span
            class="rank-badge"
            :class="{
              'rank-1': index === 0,
              'rank-2': index === 1,
              'rank-3': index === 2
            }"
          >
            {{ index + 1 }}
          </span>
        </div>
        <div class="ranking-info">
          <div class="ranking-header">
            <span class="hall-name">{{ hall.name }}</span>
            <span class="hall-type">{{ getHallTypeLabel(hall.type) }}</span>
            <span class="hall-bookings">{{ hall.bookingCount }}场</span>
          </div>
          <div class="ranking-bar">
            <div
              class="ranking-bar-fill"
              :class="`type-${hall.type}`"
              :style="{ width: getBarWidth(hall.usageRate) + '%' }"
            ></div>
          </div>
        </div>
        <div class="ranking-value">
          <span class="usage-rate">{{ hall.usageRate }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HALL_TYPE_LABELS } from '../data/mockData.js'

defineProps({
  data: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: '厅室使用率排行'
  }
})

function getHallTypeLabel(type) {
  return HALL_TYPE_LABELS[type] || type
}

function getBarWidth(rate) {
  return Math.min(100, Math.max(5, rate))
}
</script>

<style scoped>
.hall-usage-ranking {
  width: 100%;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: rgba(0, 0, 0, 0.75);
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ranking-rank {
  flex-shrink: 0;
  width: 22px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f0f0f0;
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.45);
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  color: white;
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%);
  color: white;
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #a0522d 100%);
  color: white;
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.hall-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.hall-type {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.4);
  background: #f5f5f5;
  padding: 1px 6px;
  border-radius: 3px;
}

.hall-bookings {
  font-size: 11px;
  color: #1890ff;
  margin-left: auto;
}

.ranking-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.ranking-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.ranking-bar-fill.type-small {
  background: linear-gradient(90deg, #69b1ff 0%, #4096ff 100%);
}

.ranking-bar-fill.type-medium {
  background: linear-gradient(90deg, #95de64 0%, #73d13d 100%);
}

.ranking-bar-fill.type-large {
  background: linear-gradient(90deg, #ffd666 0%, #ffc53d 100%);
}

.ranking-bar-fill.type-luxury {
  background: linear-gradient(90deg, #b37feb 0%, #9254de 100%);
}

.ranking-value {
  flex-shrink: 0;
  width: 50px;
  text-align: right;
}

.usage-rate {
  font-size: 13px;
  font-weight: 600;
  color: #1890ff;
}
</style>
