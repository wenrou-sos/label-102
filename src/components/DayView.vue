<template>
  <div class="day-view">
    <div class="day-view__header">
      <div class="day-view__date-picker">
        <a-date-picker v-model:value="currentDate" @change="handleDateChange" style="width: 200px" />
      </div>
      <div class="day-view__actions">
        <a-button type="primary" @click="openCreateModal">
          <PlusOutlined />
          新建预约
        </a-button>
      </div>
      <div class="day-view__legend">
        <span class="legend-item">
          <span class="legend-color legend-confirmed"></span>
          已预约
        </span>
        <span class="legend-item">
          <span class="legend-color legend-in-progress"></span>
          进行中
        </span>
        <span class="legend-item">
          <span class="legend-color legend-completed"></span>
          已完成
        </span>
        <span class="legend-item">
          <span class="legend-color legend-cancelled"></span>
          已取消
        </span>
        <span class="legend-item">
          <span class="legend-color legend-conflict"></span>
          冲突
        </span>
        <span class="legend-item">
          <span class="legend-color legend-cleaning"></span>
          保洁中
        </span>
        <span class="legend-item peak">
          <span class="legend-color legend-peak"></span>
          高峰期(9-11点)
        </span>
      </div>
    </div>

    <div class="day-view__body" ref="scheduleContainer">
      <div class="time-axis">
        <div class="time-axis__label">时间</div>
        <div class="time-axis__slots">
          <div
            v-for="slot in timeSlots"
            :key="slot.hour"
            class="time-slot"
            :class="{ 'peak-slot': slot.isPeak }"
            :style="{ height: slotHeight + 'px' }"
          >
            {{ slot.label }}
          </div>
        </div>
      </div>

      <div class="halls-container">
        <div class="halls-header">
          <div
            v-for="hall in displayHalls"
            :key="hall.id"
            class="hall-header"
            :class="[`type-${hall.type}`, { 'peak-full': hall.peakFull }]"
          >
            <div class="hall-name">{{ hall.name }}</div>
            <div class="hall-info">
              <span class="hall-type">{{ getHallTypeLabel(hall.type) }}</span>
              <span class="hall-floor">{{ hall.floor }}</span>
            </div>
            <a-badge
              v-if="hall.peakFull"
              status="warning"
              text="高峰满"
              :number="0"
            />
          </div>
        </div>

        <div class="halls-body" :style="{ height: scheduleHeight + 'px' }">
          <div
            v-for="hall in displayHalls"
            :key="hall.id"
            class="hall-column"
          >
            <div class="hall-column__bg">
              <div
                v-for="slot in timeSlots"
                :key="slot.hour"
                class="bg-slot"
                :class="{ 'peak-bg': slot.isPeak }"
                :style="{ height: slotHeight + 'px' }"
              ></div>
            </div>

            <div
              v-for="booking in getHallBookingsList(hall.id)"
              :key="booking.id"
              class="booking-wrapper"
            >
              <BookingBlock
                :booking="booking"
                :container-height="scheduleHeight"
                :has-conflict="hasBookingConflict(booking.id, hall.id)"
                @click="handleBookingClick"
              />
            </div>

            <div
              v-for="cleaning in getCleaningPeriods(hall.id)"
              :key="cleaning.id"
              class="cleaning-block"
              :style="getCleaningStyle(cleaning)"
            >
              <span class="cleaning-text">保洁</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="peak-tip" v-if="peakFullHalls.length > 0">
      <a-alert
        type="warning"
        show-icon
        :message="`高峰期提示：${peakFullHalls.map(h => h.name).join('、')} 已全满，建议错峰安排`"
      />
    </div>

    <BookingEditModal
      v-model:visible="showEditModal"
      :booking="editingBooking"
      :date="currentDateStr"
      @save="handleSaveBooking"
      @delete="handleDeleteBooking"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import dayjs from 'dayjs'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import BookingBlock from './BookingBlock.vue'
import BookingEditModal from './BookingEditModal.vue'
import {
  getTimeSlots,
  getHallBookings,
  getHallTypeLabel,
  detectHallConflicts,
  isHallFullAtPeak,
  timeToMinutes,
  createBooking,
  updateBooking,
  deleteBooking
} from '../utils/scheduleUtils.js'
import { halls, TIME_SLOT_START, TIME_SLOT_END, CLEANING_DURATION, bookingStore } from '../data/mockData.js'

const props = defineProps({
  filteredHallIds: {
    type: Array,
    default: () => null
  },
  filterOptions: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['booking-click'])

const currentDate = ref(dayjs())
const scheduleContainer = ref(null)
const scheduleHeight = ref(660)
const slotHeight = computed(() => scheduleHeight.value / timeSlots.value.length)

const showEditModal = ref(false)
const editingBooking = ref(null)

const timeSlots = computed(() => getTimeSlots())

const displayHalls = computed(() => {
  let result = halls
  if (props.filteredHallIds && props.filteredHallIds.length > 0) {
    result = halls.filter(h => props.filteredHallIds.includes(h.id))
  }
  return result.map(hall => ({
    ...hall,
    peakFull: isHallFullAtPeak(hall.id, currentDate.value.format('YYYY-MM-DD'))
  }))
})

const peakFullHalls = computed(() => displayHalls.value.filter(h => h.peakFull))

const currentDateStr = computed(() => currentDate.value.format('YYYY-MM-DD'))

function handleDateChange(date) {
  currentDate.value = date
}

function getHallBookingsList(hallId) {
  let bookings = bookingStore.getBookings().filter(
    b => b.hallId === hallId && b.date === currentDateStr.value
  ).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  if (props.filterOptions.serviceType && props.filterOptions.serviceType !== 'all') {
    bookings = bookings.filter(b => b.services.includes(props.filterOptions.serviceType))
  }
  if (props.filterOptions.keyword) {
    const kw = props.filterOptions.keyword.toLowerCase()
    bookings = bookings.filter(b =>
      b.deceasedName.toLowerCase().includes(kw) ||
      b.contactName.toLowerCase().includes(kw)
    )
  }
  if (props.filterOptions.timeRangeArray && props.filterOptions.timeRangeArray.length === 2) {
    const [rangeStart, rangeEnd] = props.filterOptions.timeRangeArray
    const rangeStartMin = timeToMinutes(rangeStart)
    const rangeEndMin = timeToMinutes(rangeEnd)
    bookings = bookings.filter(b => {
      const bookingStart = timeToMinutes(b.startTime)
      return bookingStart >= rangeStartMin && bookingStart < rangeEndMin
    })
  }

  return bookings
}

function hasBookingConflict(bookingId, hallId) {
  const conflicts = detectHallConflicts(hallId, currentDateStr.value)
  return conflicts.some(c => c.booking1.id === bookingId || c.booking2.id === bookingId)
}

function getCleaningPeriods(hallId) {
  const bookings = getHallBookings(hallId, currentDateStr.value)
  const cleanings = []

  for (let i = 0; i < bookings.length - 1; i++) {
    const currentEnd = timeToMinutes(bookings[i].endTime)
    const nextStart = timeToMinutes(bookings[i + 1].startTime)
    const gapMinutes = nextStart - currentEnd

    if (gapMinutes > 0) {
      const actualCleaningMinutes = Math.min(CLEANING_DURATION, gapMinutes)
      cleanings.push({
        id: `${hallId}-cleaning-${i}`,
        startTimeMinutes: currentEnd,
        durationMinutes: actualCleaningMinutes
      })
    }
  }

  return cleanings
}

function getCleaningStyle(cleaning) {
  const startMinutes = cleaning.startTimeMinutes
  const endMinutes = cleaning.startTimeMinutes + cleaning.durationMinutes
  const totalMinutes = (TIME_SLOT_END - TIME_SLOT_START) * 60
  const startOffset = startMinutes - TIME_SLOT_START * 60

  return {
    top: `${(startOffset / totalMinutes) * scheduleHeight.value}px`,
    height: `${((endMinutes - startMinutes) / totalMinutes) * scheduleHeight.value}px`
  }
}

function openCreateModal() {
  editingBooking.value = null
  showEditModal.value = true
}

function handleBookingClick(booking) {
  editingBooking.value = booking
  showEditModal.value = true
}

function handleSaveBooking({ bookingData, isEdit, originalId }) {
  try {
    if (isEdit) {
      updateBooking(originalId, bookingData)
      message.success('预约更新成功')
    } else {
      createBooking(bookingData)
      message.success('预约创建成功')
    }
  } catch (e) {
    message.error('操作失败，请重试')
    console.error(e)
  }
}

function handleDeleteBooking(bookingId) {
  try {
    deleteBooking(bookingId)
    message.success('预约已取消')
  } catch (e) {
    message.error('取消失败，请重试')
    console.error(e)
  }
}

onMounted(() => {
  nextTick(() => {
    if (scheduleContainer.value) {
      const height = scheduleContainer.value.clientHeight - 60
      scheduleHeight.value = Math.max(600, height)
    }
  })
})

watch(currentDate, () => {
  emit('date-change', currentDate.value)
})
</script>

<style scoped>
.day-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.day-view__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  flex-wrap: wrap;
  gap: 12px;
}

.day-view__actions {
  display: flex;
  gap: 8px;
}

.day-view__legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-confirmed {
  background: linear-gradient(135deg, #f0f5ff 0%, #d6e4ff 100%);
  border: 1px solid #adc6ff;
}

.legend-in-progress {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  border: 1px solid #b7eb8f;
}

.legend-completed {
  background: linear-gradient(135deg, #fafafa 0%, #d9d9d9 100%);
  border: 1px solid #bfbfbf;
}

.legend-cancelled {
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
  border: 1px solid #ffa39e;
  position: relative;
}

.legend-cancelled::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 2px;
  background: rgba(0, 0, 0, 0.3);
  transform: rotate(-10deg);
}

.legend-conflict {
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
  border: 1px solid #ff4d4f;
}

.legend-cleaning {
  background: repeating-linear-gradient(
    45deg,
    #fffbe6,
    #fffbe6 5px,
    #ffe58f 5px,
    #ffe58f 10px
  );
}

.legend-peak {
  background: #fff7e6;
  border-left: 4px solid #faad14;
}

.legend-item.peak {
  color: #d46b08;
  font-weight: 500;
}

.day-view__body {
  display: flex;
  flex: 1;
  overflow: auto;
  min-height: 600px;
}

.time-axis {
  flex-shrink: 0;
  width: 70px;
  border-right: 1px solid #f0f0f0;
  background: #fafafa;
}

.time-axis__label {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  border-bottom: 1px solid #f0f0f0;
}

.time-axis__slots {
  position: relative;
}

.time-slot {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  border-bottom: 1px dashed #f0f0f0;
}

.time-slot.peak-slot {
  background: #fffbe6;
  color: #d46b08;
  font-weight: 500;
}

.halls-container {
  flex: 1;
  overflow-x: auto;
  min-width: 0;
}

.halls-header {
  display: flex;
  height: 60px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: #fafafa;
  z-index: 5;
}

.hall-header {
  flex: 1;
  min-width: 140px;
  padding: 8px 12px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.hall-header.type-small {
  background: #f0f5ff;
}

.hall-header.type-medium {
  background: #f6ffed;
}

.hall-header.type-large {
  background: #fff7e6;
}

.hall-header.type-luxury {
  background: #f9f0ff;
}

.hall-header.peak-full {
  border-bottom: 3px solid #faad14;
}

.hall-name {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.hall-info {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 2px;
}

.halls-body {
  display: flex;
  position: relative;
}

.hall-column {
  flex: 1;
  min-width: 140px;
  position: relative;
  border-right: 1px solid #f0f0f0;
}

.hall-column__bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.bg-slot {
  border-bottom: 1px dashed #f0f0f0;
}

.bg-slot.peak-bg {
  background: #fffbe6;
}

.booking-wrapper {
  position: absolute;
  left: 0;
  right: 0;
}

.cleaning-block {
  position: absolute;
  left: 4px;
  right: 4px;
  background: repeating-linear-gradient(
    45deg,
    #fffbe6,
    #fffbe6 5px,
    #ffe58f 5px,
    #ffe58f 10px
  );
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #d46b08;
  z-index: 0;
}

.cleaning-text {
  background: rgba(255, 255, 255, 0.8);
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.peak-tip {
  padding: 12px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fffbe6;
}

@media (max-width: 768px) {
  .day-view__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .legend-item {
    font-size: 12px;
  }

  .hall-header,
  .hall-column {
    min-width: 120px;
  }
}
</style>
