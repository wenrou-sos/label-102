<template>
  <div
    class="booking-block"
    :class="[
      `status-${booking.status}`,
      { 'has-conflict': hasConflict, 'is-peak': isPeak }
    ]"
    :style="blockStyle"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
    @click="handleClick"
  >
    <div class="booking-block__header">
      <span class="booking-block__name">{{ booking.deceasedName }}</span>
      <span class="booking-block__time">{{ booking.startTime }}-{{ booking.endTime }}</span>
    </div>
    <div class="booking-block__body">
      <div class="booking-block__contact">家属：{{ booking.contactName }}</div>
      <div class="booking-block__duration">时长：{{ booking.duration }}分钟</div>
    </div>
    <div class="booking-block__services">
      <a-tag v-for="service in serviceLabels" :key="service" size="small" color="blue">
        {{ service }}
      </a-tag>
    </div>

    <div v-if="showTooltip" class="booking-tooltip">
      <div class="tooltip-header">
        <strong>{{ booking.deceasedName }} 告别仪式</strong>
      </div>
      <div class="tooltip-body">
        <p><span class="label">厅室：</span>{{ hallInfo.name }} ({{ hallTypeLabel }})</p>
        <p><span class="label">时间：</span>{{ booking.startTime }} - {{ booking.endTime }}</p>
        <p><span class="label">时长：</span>{{ booking.duration }}分钟</p>
        <p><span class="label">家属联系人：</span>{{ booking.contactName }}</p>
        <p><span class="label">联系电话：</span>{{ booking.contactPhone }}</p>
        <p><span class="label">服务类型：</span>{{ serviceLabels.join('、') }}</p>
        <p v-if="emceeInfo"><span class="label">司仪：</span>{{ emceeInfo.name }} ({{ emceeInfo.level }})</p>
        <p v-if="bandInfo"><span class="label">乐队：</span>{{ bandInfo.name }} ({{ bandInfo.members }}人)</p>
        <p v-if="booking.remark"><span class="label">备注：</span>{{ booking.remark }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getHallInfo, getEmceeInfo, getBandInfo, getServiceTypeLabels, getHallTypeLabel, isPeakHour } from '../utils/scheduleUtils.js'

const props = defineProps({
  booking: {
    type: Object,
    required: true
  },
  containerHeight: {
    type: Number,
    default: 600
  },
  hasConflict: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])
const showTooltip = ref(false)

function handleClick(e) {
  e.stopPropagation()
  emit('click', props.booking)
}

const hallInfo = computed(() => getHallInfo(props.booking.hallId))
const emceeInfo = computed(() => props.booking.emceeId ? getEmceeInfo(props.booking.emceeId) : null)
const bandInfo = computed(() => props.booking.bandId ? getBandInfo(props.booking.bandId) : null)
const serviceLabels = computed(() => getServiceTypeLabels(props.booking.services))
const hallTypeLabel = computed(() => getHallTypeLabel(hallInfo.value?.type))
const isPeak = computed(() => isPeakHour(props.booking.startTime))

const blockStyle = computed(() => {
  const startMinutes = props.booking.startTime.split(':').map(Number)
  const endMinutes = props.booking.endTime.split(':').map(Number)
  const start = startMinutes[0] * 60 + startMinutes[1]
  const end = endMinutes[0] * 60 + endMinutes[1]
  const totalMinutes = 11 * 60
  const startOffset = start - 7 * 60

  return {
    top: `${(startOffset / totalMinutes) * props.containerHeight}px`,
    height: `${((end - start) / totalMinutes) * props.containerHeight}px`
  }
})
</script>

<style scoped>
.booking-block {
  position: absolute;
  left: 4px;
  right: 4px;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
  z-index: 1;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  border: 1px solid #91d5ff;
}

.booking-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.booking-block.status-confirmed {
  background: linear-gradient(135deg, #f0f5ff 0%, #d6e4ff 100%);
  border-color: #adc6ff;
}

.booking-block.status-in-progress {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  border-color: #b7eb8f;
}

.booking-block.status-completed {
  background: linear-gradient(135deg, #fafafa 0%, #d9d9d9 100%);
  border-color: #bfbfbf;
  opacity: 0.7;
}

.booking-block.status-cancelled {
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
  border-color: #ffa39e;
  opacity: 0.6;
  text-decoration: line-through;
}

.booking-block.status-cancelled .booking-block__name {
  color: rgba(0, 0, 0, 0.45);
}

.booking-block.status-cancelled::after {
  content: '已取消';
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff4d4f;
  color: white;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  text-decoration: none;
}

.booking-block.has-conflict {
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%) !important;
  border-color: #ff4d4f !important;
  animation: conflictPulse 2s infinite;
}

.booking-block.is-peak {
  border-left: 4px solid #faad14;
}

@keyframes conflictPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255, 77, 79, 0); }
}

.booking-block__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.booking-block__name {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.booking-block__time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  background: rgba(255, 255, 255, 0.6);
  padding: 2px 6px;
  border-radius: 4px;
}

.booking-block__body {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.5;
  margin-bottom: 4px;
}

.booking-block__services {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.booking-block__services :deep(.ant-tag) {
  margin: 0;
  font-size: 11px;
}

.booking-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 280px;
  max-width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  padding: 12px;
  z-index: 100;
  margin-top: 8px;
  border: 1px solid #e8e8e8;
}

.booking-tooltip::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 20px;
  width: 12px;
  height: 12px;
  background: white;
  border-left: 1px solid #e8e8e8;
  border-top: 1px solid #e8e8e8;
  transform: rotate(45deg);
}

.tooltip-header {
  font-size: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.85);
}

.tooltip-body p {
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.6;
}

.tooltip-body .label {
  color: rgba(0, 0, 0, 0.5);
}
</style>
