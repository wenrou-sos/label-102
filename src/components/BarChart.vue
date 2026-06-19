<template>
  <div class="bar-chart">
    <div class="chart-header" v-if="title">
      <span class="chart-title">{{ title }}</span>
      <span v-if="subTitle" class="chart-subtitle">{{ subTitle }}</span>
    </div>
    <div class="chart-body">
      <div class="y-axis" v-if="showYAxis">
        <span v-for="tick in yTicks" :key="tick" class="y-tick">{{ tick }}{{ yAxisUnit }}</span>
      </div>
      <div class="chart-area">
        <div class="grid-lines" v-if="showGrid">
          <div v-for="tick in yTicks" :key="tick" class="grid-line"></div>
        </div>
        <svg
          class="chart-svg"
          :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
          preserveAspectRatio="xMidYMid meet"
          @mousemove="onChartMove"
          @mouseleave="onChartLeave"
        >
          <g v-for="(item, idx) in data" :key="idx">
            <rect
              :x="getBarX(idx)"
              :y="getBarY(item.value)"
              :width="barWidth"
              :height="getBarHeight(item.value)"
              :fill="item.color || barColor"
              :rx="4"
              :ry="4"
              :class="{ 'bar-hovered': hoveredIndex === idx }"
              style="cursor: pointer; transition: opacity 0.15s ease"
            />
          </g>
        </svg>
        <div class="x-labels">
          <span
            v-for="(item, idx) in data"
            :key="idx"
            class="x-label"
            :class="{ 'x-label-active': hoveredIndex === idx }"
          >
            {{ item.label }}
            <span v-if="item.subLabel" class="x-sublabel">{{ item.subLabel }}</span>
          </span>
        </div>
      </div>
    </div>
    <transition name="fade">
      <div
        class="chart-tooltip"
        v-if="hoveredIndex !== null && data[hoveredIndex]"
        :style="tooltipStyle"
      >
        <div class="tooltip-item"><strong>{{ data[hoveredIndex].label }}</strong></div>
        <div class="tooltip-item">{{ tooltipLabel }}：{{ data[hoveredIndex].value }}{{ yAxisUnit }}</div>
        <div v-if="data[hoveredIndex].extra" class="tooltip-item">{{ data[hoveredIndex].extra }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  subTitle: {
    type: String,
    default: ''
  },
  barColor: {
    type: String,
    default: '#1890ff'
  },
  tooltipLabel: {
    type: String,
    default: '数值'
  },
  yAxisUnit: {
    type: String,
    default: ''
  },
  showYAxis: {
    type: Boolean,
    default: true
  },
  showGrid: {
    type: Boolean,
    default: true
  }
})

const chartWidth = 500
const chartHeight = 180
const paddingTop = 20
const paddingBottom = 10
const paddingLeft = 10
const paddingRight = 10
const barGapRatio = 0.3

const hoveredIndex = ref(null)
const tooltipStyle = ref({})

const maxValue = computed(() => {
  if (!props.data.length) return 10
  return Math.max(...props.data.map(d => d.value))
})

const yTicks = computed(() => {
  const max = maxValue.value
  if (max <= 5) return [5, 4, 3, 2, 1, 0]
  if (max <= 10) return [10, 8, 6, 4, 2, 0]
  if (max <= 20) return [20, 15, 10, 5, 0]
  if (max <= 50) return [50, 40, 30, 20, 10, 0]
  return [100, 75, 50, 25, 0]
})

const chartMaxValue = computed(() => {
  return Math.max(maxValue.value, Math.max(...yTicks.value))
})

const barWidth = computed(() => {
  const innerWidth = chartWidth - paddingLeft - paddingRight
  const dataCount = props.data.length || 1
  const totalBarWidth = innerWidth / dataCount
  return totalBarWidth * (1 - barGapRatio)
})

function getBarX(idx) {
  const innerWidth = chartWidth - paddingLeft - paddingRight
  const dataCount = props.data.length || 1
  const totalBarWidth = innerWidth / dataCount
  return paddingLeft + idx * totalBarWidth + (totalBarWidth - barWidth.value) / 2
}

function getBarY(value) {
  const innerHeight = chartHeight - paddingTop - paddingBottom
  const maxVal = chartMaxValue.value
  return paddingTop + innerHeight - (value / maxVal) * innerHeight
}

function getBarHeight(value) {
  const innerHeight = chartHeight - paddingTop - paddingBottom
  const maxVal = chartMaxValue.value
  return (value / maxVal) * innerHeight
}

function onChartMove(e) {
  if (!props.data.length) return
  const svg = e.currentTarget
  const rect = svg.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width * chartWidth
  const innerWidth = chartWidth - paddingLeft - paddingRight
  const dataCount = props.data.length || 1
  const totalBarWidth = innerWidth / dataCount

  let closestIdx = null
  props.data.forEach((_, i) => {
    const barX = getBarX(i)
    if (x >= barX && x <= barX + barWidth.value) {
      closestIdx = i
    }
  })

  if (closestIdx !== hoveredIndex.value) {
    hoveredIndex.value = closestIdx
    if (closestIdx !== null) {
      const svgWidthRatio = rect.width / chartWidth
      const leftPx = (getBarX(closestIdx) + barWidth.value / 2) * svgWidthRatio
      tooltipStyle.value = {
        left: `${Math.min(Math.max(leftPx - 60, 0), rect.width - 140)}px`,
        top: '-60px'
      }
    }
  }
}

function onChartLeave() {
  hoveredIndex.value = null
}
</script>

<style scoped>
.bar-chart {
  width: 100%;
  position: relative;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.chart-subtitle {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.chart-body {
  display: flex;
  gap: 8px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 36px;
  flex-shrink: 0;
  padding: 20px 0 10px 0;
  height: 180px;
}

.y-tick {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.4);
  text-align: right;
}

.chart-area {
  flex: 1;
  position: relative;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 10px 10px 10px;
  pointer-events: none;
}

.grid-line {
  height: 1px;
  background: #f0f0f0;
}

.chart-svg {
  width: 100%;
  height: 180px;
  display: block;
  touch-action: none;
}

.bar-hovered {
  opacity: 0.8;
}

.x-labels {
  display: flex;
  justify-content: space-between;
  padding: 4px 10px 0 10px;
}

.x-label {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.55);
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: color 0.15s ease;
}

.x-label-active {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 600;
}

.x-sublabel {
  font-size: 9px;
  color: rgba(0, 0, 0, 0.35);
}

.chart-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.tooltip-item {
  line-height: 1.5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
