<template>
  <div class="statistics-panel">
    <div class="panel-header">
      <h3 class="panel-title">数据统计报表</h3>
      <a-radio-group v-model:value="activeTab" size="small" button-style="solid">
        <a-radio-button value="day">今日</a-radio-button>
        <a-radio-button value="week">本周</a-radio-button>
        <a-radio-button value="month">本月</a-radio-button>
      </a-radio-group>
    </div>

    <template v-if="activeTab === 'day'">
      <a-row :gutter="[16, 16]">
        <a-col :xs="12" :sm="12" :md="6">
          <a-card class="stat-card total-card">
            <div class="stat-icon total-icon">
              <CalendarOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dayStats.totalBookings }}</div>
              <div class="stat-label">今日总场次</div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="12" :sm="12" :md="6">
          <a-card class="stat-card peak-card">
            <div class="stat-icon peak-icon">
              <FireOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dayStats.peakBookings }}</div>
              <div class="stat-label">高峰期场次</div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="12" :sm="12" :md="6">
          <a-card class="stat-card emcee-card">
            <div class="stat-icon emcee-icon">
              <UserOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dayStats.emceeCount }}/{{ dayStats.onDutyEmcees }}</div>
              <div class="stat-label">在岗司仪</div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="12" :sm="12" :md="6">
          <a-card class="stat-card band-card">
            <div class="stat-icon band-icon">
              <SoundOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dayStats.bandCount }}/{{ dayStats.onDutyBands }}</div>
              <div class="stat-label">执勤乐队</div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <div class="stats-section">
        <h4 class="section-title">厅室类型使用统计</h4>
        <div class="hall-type-stats">
          <div
            v-for="(item, type) in dayHallTypeStats"
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
              <span class="service-icon">🎤</span>
              <span class="service-name">司仪服务</span>
              <span class="service-count">{{ dayStats.serviceCount.emcee }} 次</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill service-emcee"
                :style="{ width: getDayServicePercentage('emcee') + '%' }"
              ></div>
            </div>
          </div>
          <div class="service-item">
            <div class="service-header">
              <span class="service-icon">🎵</span>
              <span class="service-name">乐队服务</span>
              <span class="service-count">{{ dayStats.serviceCount.band }} 次</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill service-band"
                :style="{ width: getDayServicePercentage('band') + '%' }"
              ></div>
            </div>
          </div>
          <div class="service-item">
            <div class="service-header">
              <span class="service-icon">💐</span>
              <span class="service-name">鲜花布置</span>
              <span class="service-count">{{ dayStats.serviceCount.flowers }} 次</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill service-flowers"
                :style="{ width: getDayServicePercentage('flowers') + '%' }"
              ></div>
            </div>
          </div>
          <div class="service-item">
            <div class="service-header">
              <span class="service-icon">📺</span>
              <span class="service-name">追思视频</span>
              <span class="service-count">{{ dayStats.serviceCount.video }} 次</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill service-video"
                :style="{ width: getDayServicePercentage('video') + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <h4 class="section-title">高峰期使用率</h4>
        <div class="peak-usage">
          <div class="peak-usage__value">{{ dayStats.peakUsageRate }}%</div>
          <div class="peak-usage__bar">
            <div
              class="peak-usage__fill"
              :style="{ width: dayStats.peakUsageRate + '%' }"
            ></div>
          </div>
          <div class="peak-usage__info">
            <span>9:00 - 11:00 高峰期</span>
            <a-tag v-if="Number(dayStats.peakUsageRate) > 80" color="red">繁忙</a-tag>
            <a-tag v-else-if="Number(dayStats.peakUsageRate) > 50" color="orange">适中</a-tag>
            <a-tag v-else color="green">空闲</a-tag>
          </div>
        </div>
      </div>
    </template>

    <template v-if="activeTab === 'week'">
      <a-row :gutter="[16, 16]">
        <a-col :xs="12" :sm="8" :md="8">
          <a-card class="stat-card total-card">
            <div class="stat-icon total-icon">
              <CalendarOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ weekStats.totalBookings }}</div>
              <div class="stat-label">本周总场次</div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="12" :sm="8" :md="8">
          <a-card class="stat-card avg-card">
            <div class="stat-icon">
              <BarChartOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ weekStats.avgDailyBookings }}</div>
              <div class="stat-label">日均场次</div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="8" :md="8">
          <a-card class="stat-card usage-card">
            <div class="stat-icon usage-icon">
              <RiseOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ weekStats.overallUsageRate }}%</div>
              <div class="stat-label">整体使用率</div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <div class="stats-section">
        <TrendChart
          :data="weekStats.dailyData"
          title="本周使用率趋势"
          :sub-title="weekStats.dateRange"
          line-color="#1890ff"
        />
      </div>

      <div class="stats-section">
        <h4 class="section-title">厅室类型使用率</h4>
        <div class="hall-type-stats">
          <div
            v-for="(item, type) in weekStats.hallTypeUsage"
            :key="type"
            class="hall-type-item"
          >
            <div class="hall-type-header">
              <span class="hall-type-name">{{ item.label }}</span>
              <span class="hall-type-count">{{ item.count }} 场 · {{ item.usageRate }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :class="`type-${type}`"
                :style="{ width: item.usageRate + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <HallUsageRanking :data="weekStats.hallUsage" title="各厅室使用率排行（周）" />
      </div>

      <div class="stats-section">
        <div class="section-header">
          <h4 class="section-title">高峰期使用率趋势（周）</h4>
          <div class="section-stats">
            <span class="peak-stat">高峰期综合使用率：<strong>{{ weekStats.peakHourUsage }}%</strong></span>
          </div>
        </div>
        <BarChart
          :data="getPeakHourChartData(weekStats.peakHourTrend)"
          title="各时段使用率分布"
          tooltip-label="使用率"
          y-axis-unit="%"
        />
      </div>

      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :md="12">
          <div class="stats-section">
            <h4 class="section-title">司仪负载分布（周）</h4>
            <BarChart
              :data="getStaffChartData(weekStats.emceeLoad, '#4facfe')"
              tooltip-label="负载率"
              y-axis-unit="%"
              :bar-color="'#4facfe'"
            />
          </div>
        </a-col>
        <a-col :xs="24" :md="12">
          <div class="stats-section">
            <h4 class="section-title">乐队负载分布（周）</h4>
            <BarChart
              :data="getStaffChartData(weekStats.bandLoad, '#43e97b')"
              tooltip-label="负载率"
              y-axis-unit="%"
              :bar-color="'#43e97b'"
            />
          </div>
        </a-col>
      </a-row>
    </template>

    <template v-if="activeTab === 'month'">
      <a-row :gutter="[16, 16]">
        <a-col :xs="12" :sm="8" :md="8">
          <a-card class="stat-card total-card">
            <div class="stat-icon total-icon">
              <CalendarOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ monthStats.totalBookings }}</div>
              <div class="stat-label">{{ monthStats.monthLabel }}总场次</div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="12" :sm="8" :md="8">
          <a-card class="stat-card avg-card">
            <div class="stat-icon">
              <BarChartOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ monthStats.avgDailyBookings }}</div>
              <div class="stat-label">日均场次</div>
            </div>
          </a-card>
        </a-col>

        <a-col :xs="24" :sm="8" :md="8">
          <a-card class="stat-card usage-card">
            <div class="stat-icon usage-icon">
              <RiseOutlined />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ monthStats.overallUsageRate }}%</div>
              <div class="stat-label">整体使用率</div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <div class="stats-section">
        <TrendChart
          :data="monthStats.weekData"
          :title="`${monthStats.monthLabel}各周使用率趋势`"
          line-color="#722ed1"
        />
      </div>

      <div class="stats-section">
        <h4 class="section-title">厅室类型使用率</h4>
        <div class="hall-type-stats">
          <div
            v-for="(item, type) in monthStats.hallTypeUsage"
            :key="type"
            class="hall-type-item"
          >
            <div class="hall-type-header">
              <span class="hall-type-name">{{ item.label }}</span>
              <span class="hall-type-count">{{ item.count }} 场 · {{ item.usageRate }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :class="`type-${type}`"
                :style="{ width: item.usageRate + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <HallUsageRanking :data="monthStats.hallUsage" title="各厅室使用率排行（月）" />
      </div>

      <div class="stats-section">
        <div class="section-header">
          <h4 class="section-title">高峰期使用率趋势（月）</h4>
          <div class="section-stats">
            <span class="peak-stat">高峰期综合使用率：<strong>{{ monthStats.peakHourUsage }}%</strong></span>
          </div>
        </div>
        <BarChart
          :data="getPeakHourChartData(monthStats.peakHourTrend)"
          title="各时段使用率分布"
          tooltip-label="使用率"
          y-axis-unit="%"
          :bar-color="'#722ed1'"
        />
      </div>

      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :md="12">
          <div class="stats-section">
            <h4 class="section-title">司仪负载分布（月）</h4>
            <BarChart
              :data="getStaffChartData(monthStats.emceeLoad, '#4facfe')"
              tooltip-label="负载率"
              y-axis-unit="%"
              :bar-color="'#4facfe'"
            />
          </div>
        </a-col>
        <a-col :xs="24" :md="12">
          <div class="stats-section">
            <h4 class="section-title">乐队负载分布（月）</h4>
            <BarChart
              :data="getStaffChartData(monthStats.bandLoad, '#43e97b')"
              tooltip-label="负载率"
              y-axis-unit="%"
              :bar-color="'#43e97b'"
            />
          </div>
        </a-col>
      </a-row>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CalendarOutlined,
  FireOutlined,
  UserOutlined,
  SoundOutlined,
  BarChartOutlined,
  RiseOutlined
} from '@ant-design/icons-vue'
import { HALL_TYPES, HALL_TYPE_LABELS } from '../data/mockData.js'
import { getWeeklyStatistics, getMonthlyStatistics } from '../utils/scheduleUtils.js'
import TrendChart from './TrendChart.vue'
import HallUsageRanking from './HallUsageRanking.vue'
import BarChart from './BarChart.vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  },
  currentDate: {
    type: Object,
    required: true
  }
})

const activeTab = ref('day')

const dayStats = computed(() => props.stats)

const weekStats = computed(() => getWeeklyStatistics(props.currentDate))
const monthStats = computed(() => getMonthlyStatistics(props.currentDate))

const dayHallTypeStats = computed(() => {
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

function getDayServicePercentage(service) {
  const total = props.stats.totalBookings || 1
  return ((props.stats.serviceCount[service] || 0) / total) * 100
}

function getPeakHourChartData(trendData) {
  return trendData.map(item => ({
    label: item.label,
    subLabel: item.subLabel,
    value: item.value,
    color: item.isPeak ? '#fa8c16' : '#1890ff',
    extra: `${item.bookingCount} 场预约`
  }))
}

function getStaffChartData(staffData, defaultColor) {
  return staffData.slice(0, 6).map(item => ({
    label: item.label,
    subLabel: item.subLabel,
    value: item.value,
    color: item.loadRate > 70 ? '#f5222d' : (item.loadRate > 50 ? '#fa8c16' : defaultColor),
    extra: item.extra
  }))
}
</script>

<style scoped>
.statistics-panel {
  padding: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: rgba(0, 0, 0, 0.85);
}

.stat-card {
  border: none;
  border-radius: 8px;
  overflow: hidden;
}

.stat-card :deep(.ant-card-body) {
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
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

.avg-card .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.usage-icon {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 4px;
}

.stats-section {
  margin-top: 20px;
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
  gap: 10px;
}

.hall-type-item,
.service-item {
  background: #fafafa;
  padding: 8px 10px;
  border-radius: 6px;
}

.hall-type-header,
.service-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.hall-type-name {
  flex: 1;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.75);
}

.hall-type-count {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.service-icon {
  font-size: 16px;
  margin-right: 6px;
}

.service-name {
  flex: 1;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.75);
}

.service-count {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.progress-bar {
  height: 5px;
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
  padding: 14px;
  border-radius: 8px;
  border-left: 4px solid #faad14;
}

.peak-usage__value {
  font-size: 28px;
  font-weight: 700;
  color: #d46b08;
  text-align: center;
  margin-bottom: 10px;
}

.peak-usage__bar {
  height: 7px;
  background: #ffe7ba;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-header .section-title {
  margin: 0;
}

.section-stats {
  display: flex;
  gap: 16px;
}

.peak-stat {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.peak-stat strong {
  color: #fa8c16;
  font-weight: 600;
  margin-left: 4px;
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 18px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .stat-card :deep(.ant-card-body) {
    padding: 10px;
    gap: 8px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
