<template>
  <div class="statistics-panel">
    <h3 class="panel-title">今日数据概览</h3>

    <a-row :gutter="[16, 16]">
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card total-card">
          <div class="stat-icon total-icon">
            <CalendarOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalBookings }}</div>
            <div class="stat-label">总场次</div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card peak-card">
          <div class="stat-icon peak-icon">
            <FireOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.peakBookings }}</div>
            <div class="stat-label">高峰期场次</div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card emcee-card">
          <div class="stat-icon emcee-icon">
            <UserOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.emceeCount }}/{{ stats.onDutyEmcees }}</div>
            <div class="stat-label">在岗司仪</div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card band-card">
          <div class="stat-icon band-icon">
            <SoundOutlined />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.bandCount }}/{{ stats.onDutyBands }}</div>
            <div class="stat-label">执勤乐队</div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <div class="stats-section">
      <h4 class="section-title">厅室类型使用统计</h4>
      <div class="hall-type-stats">
        <div
          v-for="(item, type) in hallTypeStats"
          :key="type"
          class="hall-type-item"
        >
          <div class="hall-type-header">
            <span class="hall-type-name">{{ item.label }}</span>
            <span class="hall-type-count">{{ item.count }} 场</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :class="`type-${type}`"
              :style="{ width: item.percentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <h4 class="section-title">服务资源使用统计</h4>
      <div class="service-stats">
        <div class="service-item">
          <div class="service-header">
            <span class="service-icon emcee-service-icon">🎤</span>
            <span class="service-name">司仪服务</span>
            <span class="service-count">{{ stats.serviceCount.emcee }} 次</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill service-emcee"
              :style="{ width: getServicePercentage('emcee') + '%' }"
            ></div>
          </div>
        </div>

        <div class="service-item">
          <div class="service-header">
            <span class="service-icon band-service-icon">🎵</span>
            <span class="service-name">乐队服务</span>
            <span class="service-count">{{ stats.serviceCount.band }} 次</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill service-band"
              :style="{ width: getServicePercentage('band') + '%' }"
            ></div>
          </div>
        </div>

        <div class="service-item">
          <div class="service-header">
            <span class="service-icon flower-service-icon">💐</span>
            <span class="service-name">鲜花布置</span>
            <span class="service-count">{{ stats.serviceCount.flowers }} 次</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill service-flowers"
              :style="{ width: getServicePercentage('flowers') + '%' }"
            ></div>
          </div>
        </div>

        <div class="service-item">
          <div class="service-header">
            <span class="service-icon video-service-icon">📺</span>
            <span class="service-name">追思视频</span>
            <span class="service-count">{{ stats.serviceCount.video }} 次</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill service-video"
              :style="{ width: getServicePercentage('video') + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <h4 class="section-title">高峰期使用率</h4>
      <div class="peak-usage">
        <div class="peak-usage__value">
          {{ stats.peakUsageRate }}%
        </div>
        <div class="peak-usage__bar">
          <div
            class="peak-usage__fill"
            :style="{ width: stats.peakUsageRate + '%' }"
          ></div>
        </div>
        <div class="peak-usage__info">
          <span>9:00 - 11:00 高峰期</span>
          <a-tag v-if="Number(stats.peakUsageRate) > 80" color="red">繁忙</a-tag>
          <a-tag v-else-if="Number(stats.peakUsageRate) > 50" color="orange">适中</a-tag>
          <a-tag v-else color="green">空闲</a-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CalendarOutlined, FireOutlined, UserOutlined, SoundOutlined } from '@ant-design/icons-vue'
import { HALL_TYPES, HALL_TYPE_LABELS } from '../data/mockData.js'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const hallTypeStats = computed(() => {
  const result = {}
  const maxCount = Math.max(...Object.values(props.stats.hallTypeCount), 1)

  Object.keys(HALL_TYPES).forEach(typeKey => {
    const type = HALL_TYPES[typeKey]
    const count = props.stats.hallTypeCount[type] || 0
    result[type] = {
      label: HALL_TYPE_LABELS[type],
      count,
      percentage: (count / maxCount) * 100
    }
  })

  return result
})

function getServicePercentage(service) {
  const total = props.stats.totalBookings || 1
  return ((props.stats.serviceCount[service] || 0) / total) * 100
}
</script>

<style scoped>
.statistics-panel {
  padding: 0;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: rgba(0, 0, 0, 0.85);
}

.stat-card {
  border: none;
  border-radius: 8px;
  overflow: hidden;
}

.stat-card :deep(.ant-card-body) {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.total-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.peak-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.emcee-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.band-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 4px;
}

.stats-section {
  margin-top: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: rgba(0, 0, 0, 0.75);
}

.hall-type-stats,
.service-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hall-type-item,
.service-item {
  background: #fafafa;
  padding: 10px 12px;
  border-radius: 6px;
}

.hall-type-header,
.service-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.hall-type-name {
  flex: 1;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.75);
}

.hall-type-count {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.service-icon {
  font-size: 18px;
  margin-right: 8px;
}

.service-name {
  flex: 1;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.75);
}

.service-count {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.progress-bar {
  height: 6px;
  background: #e8e8e8;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.type-small {
  background: linear-gradient(90deg, #69b1ff 0%, #4096ff 100%);
}

.progress-fill.type-medium {
  background: linear-gradient(90deg, #95de64 0%, #73d13d 100%);
}

.progress-fill.type-large {
  background: linear-gradient(90deg, #ffd666 0%, #ffc53d 100%);
}

.progress-fill.type-luxury {
  background: linear-gradient(90deg, #b37feb 0%, #9254de 100%);
}

.progress-fill.service-emcee {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.progress-fill.service-band {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.progress-fill.service-flowers {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

.progress-fill.service-video {
  background: linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%);
}

.peak-usage {
  background: #fff7e6;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #faad14;
}

.peak-usage__value {
  font-size: 32px;
  font-weight: 700;
  color: #d46b08;
  text-align: center;
  margin-bottom: 12px;
}

.peak-usage__bar {
  height: 8px;
  background: #ffe7ba;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.peak-usage__fill {
  height: 100%;
  background: linear-gradient(90deg, #ffc53d 0%, #fa8c16 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.peak-usage__info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #d46b08;
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 20px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>
