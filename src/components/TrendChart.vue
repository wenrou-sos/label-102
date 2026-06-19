<template>
  <div class="trend-chart">
    <div class="chart-header" v-if="title">
      <span class="chart-title">{{ title }}</span>
      <span v-if="subTitle" class="chart-subtitle">{{ subTitle }}</span>
    </div>
    <div class="chart-body">
      <div class="y-axis">
        <span v-for="tick in yTicks" :key="tick" class="y-tick">{{ tick }}%</span>
      </div>
      <div class="chart-area" @mouseleave="onChartLeave">
        <div class="grid-lines">
          <div v-for="tick in yTicks" :key="tick" class="grid-line"></div>
        </div>
        <svg
          class="chart-svg"
          :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
          preserveAspectRatio="xMidYMid meet"
          @mousemove="onChartMove"
        >
          <defs>
            <linearGradient :id="gradId" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" :style="{ stopColor: lineColor, stopOpacity: 0.3 }" />
              <stop offset="100%" :style="{ stopColor: lineColor, stopOpacity: 0.05 }" />
            </linearGradient>
          </defs>
          <path :d="areaPath" :fill="`url(#${gradId})`" />
          <path
            :d="linePath"
            fill="none"
            :stroke="lineColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <g v-for="(point, idx) in points" :key="idx">
            <circle
              :cx="point.x"
              :cy="point.y"
              :r="hoveredIndex === idx ? 7 : (point.highlight ? 6 : 5)"
              :fill="hoveredIndex === idx ? lineColor : (point.highlight ? lineColor : 'white')"
              :stroke="lineColor"
              stroke-width="2.5"
              style="cursor: pointer; transition: r 0.15s ease"
            />
          </g>
          <line
            v-if="hoveredIndex !== null && points[hoveredIndex]"
            :x1="points[hoveredIndex].x"
            :y1="paddingTop"
            :x2="points[hoveredIndex].x"
            :y2="chartHeight - paddingBottom"
            :stroke="lineColor"
            stroke-width="1"
            stroke-dasharray="3 3"
            stroke-opacity="0.5"
          />
        </svg>
        <div class="x-labels">
          <span
            v-for="(item, idx) in data"
            :key="idx"
            class="x-label"
            :class="{ 'x-label-active': hoveredIndex === idx }"
          >
            {{ item.label }}
            <span v-if="item.weekday" class="x-weekday">{{ item.weekday }}</span>
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
        <div class="tooltip-item"><strong>{{ data[hoveredIndex].label }}{{ data[hoveredIndex].weekday ? ' ' + data[hoveredIndex].weekday : '' }}</strong></div>
        <div class="tooltip-item">场次：{{ data[hoveredIndex].bookingCount }}</div>
        <div class="tooltip-item">使用率：{{ data[hoveredIndex].usageRate }}%</div>
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
  lineColor: {
    type: String,
    default: '#1890ff'
  }
})

const chartWidth = 500
const chartHeight = 160
const paddingTop = 20
const paddingBottom = 10
const paddingLeft = 10
const paddingRight = 10
const hoveredIndex = ref(null)
const tooltipStyle = ref({})

const gradId = computed(() => `grad-${Math.random().toString(36).slice(2, 8)}`)

const yTicks = [100, 75, 50, 25, 0]

const maxValue = computed(() => {
  if (!props.data.length) return 100
  const max = Math.max(...props.data.map(d => d.usageRate))
  return Math.max(50, Math.ceil(max / 25) * 25)
})

const points = computed(() => {
  if (!props.data.length) return []
  const innerWidth = chartWidth - paddingLeft - paddingRight
  const innerHeight = chartHeight - paddingTop - paddingBottom
  const stepX = props.data.length > 1 ? innerWidth / (props.data.length - 1) : innerWidth / 2
  const maxVal = maxValue.value

  return props.data.map((d, i) => {
    const x = paddingLeft + i * stepX
    const usage = Math.min(d.usageRate, maxVal)
    const y = paddingTop + innerHeight - (usage / maxVal) * innerHeight
    return { x, y, highlight: i === props.data.length - 1 }
  })
})

const linePath = computed(() => {
  if (points.value.length < 2) return ''
  return points.value.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`).join(' ')
})

const areaPath = computed(() => {
  if (points.value.length < 2) return ''
  const line = points.value.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`).join(' ')
  const lastX = points.value[points.value.length - 1].x
  const firstX = points.value[0].x
  const bottomY = chartHeight - paddingBottom
  return `${line} L${lastX},${bottomY} L${firstX},${bottomY} Z`
})

function onChartMove(e) {
  if (!props.data.length) return
  const svg = e.currentTarget
  const rect = svg.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width * chartWidth
  const innerWidth = chartWidth - paddingLeft - paddingRight
  const stepX = props.data.length > 1 ? innerWidth / (props.data.length - 1) : innerWidth / 2

  let closestIdx = 0
  let closestDist = Infinity
  points.value.forEach((p, i) => {
    const dist = Math.abs(p.x - x)
    if (dist < closestDist) {
      closestDist = dist
      closestIdx = i
    }
  })

  if (closestIdx !== hoveredIndex.value) {
    hoveredIndex.value = closestIdx
    const svgWidthRatio = rect.width / chartWidth
    const leftPx = points.value[closestIdx].x * svgWidthRatio
    tooltipStyle.value = {
      left: `${Math.min(Math.max(leftPx - 60, 0), rect.width - 140)}px`,
      top: '-50px'
    }
  }
}

function onChartLeave() {
  hoveredIndex.value = null
}
</script>

<style scoped>
.trend-chart {
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
  height: 160px;
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
  height: 160px;
  display: block;
  touch-action: none;
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

.x-weekday {
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
