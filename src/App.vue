<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">
            <HomeOutlined />
          </div>
          <div class="logo-text">
            <h1>殡仪馆告别厅调度管理系统</h1>
            <p>Funeral Hall Scheduling Management System</p>
          </div>
        </div>
        <div class="header-info">
          <div class="current-time">
            <ClockCircleOutlined />
            <span>{{ currentTime }}</span>
          </div>
          <a-button type="primary" @click="showOvertimeModal = true" v-if="overtimeBookings.length > 0">
            <ExclamationCircleOutlined />
            超时告警
            <a-badge :count="overtimeBookings.length" style="margin-left: 8px" />
          </a-button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <a-layout has-sider>
        <a-layout-sider
          width="300"
          theme="light"
          :collapsed="siderCollapsed"
          :collapsed-width="0"
          collapsible
          @collapse="onSiderCollapse"
          class="main-sider"
        >
          <div class="sider-content">
            <FilterPanel @filter-change="handleFilterChange" />
          </div>
        </a-layout-sider>

        <a-layout-content class="main-content">
          <div class="content-wrapper">
            <div class="schedule-section">
              <DayView
                ref="dayViewRef"
                :filtered-hall-ids="filterResult.hallIds"
                :filter-options="filterResult"
                @date-change="handleDateChange"
              />
            </div>

            <div class="bottom-section">
              <a-row :gutter="[16, 16]">
                <a-col :xs="24" :lg="14">
                  <a-card title="人员排班管理" class="staff-card">
                    <StaffSchedule :date="currentDate" />
                  </a-card>
                </a-col>
                <a-col :xs="24" :lg="10">
                  <a-card class="stats-card">
                    <StatisticsPanel :stats="dailyStats" :current-date="currentDate" />
                  </a-card>
                </a-col>
              </a-row>
            </div>
          </div>
        </a-layout-content>
      </a-layout>
    </main>

    <OvertimeModal
      :visible="showOvertimeModal"
      :overtime-list="overtimeBookings"
      @close="showOvertimeModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import dayjs from 'dayjs'
import { HomeOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import DayView from './components/DayView.vue'
import StaffSchedule from './components/StaffSchedule.vue'
import StatisticsPanel from './components/StatisticsPanel.vue'
import FilterPanel from './components/FilterPanel.vue'
import OvertimeModal from './components/OvertimeModal.vue'
import { getDailyStatistics, detectOverTimeBookings } from './utils/scheduleUtils.js'

const currentDate = ref(dayjs())
const currentTime = ref('')
const siderCollapsed = ref(false)
const showOvertimeModal = ref(false)
const dayViewRef = ref(null)

const filterResult = ref({
  hallType: 'all',
  serviceType: 'all',
  timeRange: 'all',
  keyword: '',
  hallIds: null
})

const dateStr = computed(() => currentDate.value.format('YYYY-MM-DD'))
const dailyStats = computed(() => getDailyStatistics(dateStr.value))
const overtimeBookings = computed(() => detectOverTimeBookings(dateStr.value))

let timeTimer = null
let overtimeCheckTimer = null

function updateTime() {
  currentTime.value = dayjs().format('YYYY年MM月DD日 HH:mm:ss')
}

function handleDateChange(date) {
  currentDate.value = date
}

function handleFilterChange(filters) {
  filterResult.value = filters
}

function onSiderCollapse(collapsed) {
  siderCollapsed.value = collapsed
}

let lastAlertedCount = 0

watch(overtimeBookings, (newList) => {
  const criticalItems = newList.filter(item => !item.warning)
  if (criticalItems.length > 0 && criticalItems.length !== lastAlertedCount) {
    lastAlertedCount = criticalItems.length
    showOvertimeModal.value = true
  }
}, { deep: true, immediate: false })

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)

  overtimeCheckTimer = setInterval(() => {
    const current = overtimeBookings.value
    const criticalItems = current.filter(item => !item.warning)
    if (criticalItems.length > 0 && criticalItems.length !== lastAlertedCount) {
      lastAlertedCount = criticalItems.length
      showOvertimeModal.value = true
    }
  }, 30000)

  if (overtimeBookings.value.length > 0) {
    lastAlertedCount = overtimeBookings.value.filter(i => !i.warning).length
    setTimeout(() => {
      showOvertimeModal.value = true
    }, 1000)
  }
})

onUnmounted(() => {
  if (timeTimer) {
    clearInterval(timeTimer)
  }
  if (overtimeCheckTimer) {
    clearInterval(overtimeCheckTimer)
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.app-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1920px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.logo-text h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.logo-text p {
  font-size: 12px;
  margin: 2px 0 0 0;
  color: rgba(255, 255, 255, 0.6);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.current-time {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 6px;
}

.app-main {
  flex: 1;
  padding: 16px;
}

.main-sider {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.sider-content {
  padding: 12px;
  height: 100%;
  overflow-y: auto;
}

.main-content {
  background: transparent;
  padding: 0 0 0 16px;
  min-height: 800px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  min-height: 600px;
}

.bottom-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.staff-card,
.stats-card {
  height: 100%;
}

.staff-card :deep(.ant-card-body),
.stats-card :deep(.ant-card-body) {
  height: 100%;
}

@media (max-width: 992px) {
  .header-content {
    padding: 12px 16px;
  }

  .logo-text h1 {
    font-size: 16px;
  }

  .logo-text p {
    display: none;
  }

  .current-time {
    font-size: 12px;
  }

  .app-main {
    padding: 12px;
  }

  .main-content {
    padding: 12px 0 0 0;
  }
}

@media (max-width: 576px) {
  .header-info {
    gap: 10px;
  }

  .current-time {
    display: none;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    font-size: 22px;
  }

  .logo-text h1 {
    font-size: 14px;
  }
}
</style>
