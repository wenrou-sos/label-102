<template>
  <div class="staff-schedule">
    <div class="schedule-header">
      <div class="header-actions">
        <a-button type="primary" :loading="scheduling" @click="handleAutoSchedule">
          <PlusOutlined />
          一键排班
        </a-button>
      </div>
    </div>

    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="emcee" tab="司仪排班">
        <div class="staff-list">
          <div
            v-for="emcee in emcees"
            :key="emcee.id"
            class="staff-card"
            :class="{ 'off-duty': emcee.status !== 'on-duty' }"
          >
            <div class="staff-card__header">
              <div class="staff-avatar">
                <img :src="getAvatar(emcee.id)" alt="" />
              </div>
              <div class="staff-info">
                <div class="staff-name">
                  {{ emcee.name }}
                  <a-tag v-if="emcee.status === 'on-duty'" color="green" size="small">在岗</a-tag>
                  <a-tag v-else color="default" size="small">休息</a-tag>
                </div>
                <div class="staff-detail">
                  {{ emcee.level }} · {{ emcee.experience }}年经验
                </div>
              </div>
            </div>
            <div class="staff-card__schedule">
              <div
                v-if="getEmceeScheduleList(emcee.id).length > 0"
                class="schedule-timeline"
              >
                <div
                  v-for="booking in getEmceeScheduleList(emcee.id)"
                  :key="booking.id"
                  class="schedule-item"
                  :class="{ 'has-conflict': hasEmceeConflict(emcee.id, booking.id) }"
                >
                  <div class="schedule-time">
                    {{ booking.startTime }} - {{ booking.endTime }}
                  </div>
                  <div class="schedule-content">
                    <div class="schedule-hall">{{ getHallName(booking.hallId) }}</div>
                    <div class="schedule-deceased">{{ booking.deceasedName }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="no-schedule">
                <span v-if="emcee.status === 'on-duty'">今日无安排</span>
                <span v-else>今日休息</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="band" tab="乐队排班">
        <div class="staff-list">
          <div
            v-for="band in bands"
            :key="band.id"
            class="staff-card"
            :class="{ 'off-duty': band.status !== 'on-duty' }"
          >
            <div class="staff-card__header">
              <div class="staff-avatar band-avatar">
                <SoundOutlined style="font-size: 24px; color: #1890ff" />
              </div>
              <div class="staff-info">
                <div class="staff-name">
                  {{ band.name }}
                  <a-tag v-if="band.status === 'on-duty'" color="green" size="small">在岗</a-tag>
                  <a-tag v-else color="default" size="small">休息</a-tag>
                </div>
                <div class="staff-detail">
                  {{ band.leader }} · {{ band.members }}人
                </div>
              </div>
            </div>
            <div class="staff-card__schedule">
              <div
                v-if="getBandScheduleList(band.id).length > 0"
                class="schedule-timeline"
              >
                <div
                  v-for="booking in getBandScheduleList(band.id)"
                  :key="booking.id"
                  class="schedule-item"
                  :class="{ 'has-conflict': hasBandConflict(band.id, booking.id) }"
                >
                  <div class="schedule-time">
                    {{ booking.startTime }} - {{ booking.endTime }}
                  </div>
                  <div class="schedule-content">
                    <div class="schedule-hall">{{ getHallName(booking.hallId) }}</div>
                    <div class="schedule-deceased">{{ booking.deceasedName }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="no-schedule">
                <span v-if="band.status === 'on-duty'">今日无安排</span>
                <span v-else>今日休息</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <div v-if="staffConflicts.length > 0" class="conflict-warning">
      <a-alert
        type="error"
        show-icon
        :message="`检测到 ${staffConflicts.length} 处人员排班冲突`"
      >
        <template #description>
          <ul>
            <li v-for="(conflict, index) in staffConflicts" :key="index">
              {{ conflict.staffType }}: {{ getConflictStaffName(conflict) }} - 
              {{ conflict.booking1.deceasedName }}({{ conflict.booking1.startTime }}) 与 
              {{ conflict.booking2.deceasedName }}({{ conflict.booking2.startTime }}) 冲突
            </li>
          </ul>
        </template>
      </a-alert>
    </div>

    <a-modal
      v-model:open="showScheduleResult"
      title="一键排班结果"
      :width="700"
      :ok-text="'确认应用'"
      :cancel-text="'取消'"
      @ok="handleConfirmApply"
      @cancel="handleCancelApply"
    >
      <div v-if="scheduleResult" class="schedule-result">
        <div class="result-summary">
          <a-descriptions bordered size="small" :column="2">
            <a-descriptions-item label="待分配司仪">
              {{ scheduleResult.summary.emceeNeeded }} 场
            </a-descriptions-item>
            <a-descriptions-item label="待分配乐队">
              {{ scheduleResult.summary.bandNeeded }} 场
            </a-descriptions-item>
            <a-descriptions-item label="成功分配司仪">
              <span style="color: #52c41a">{{ scheduleResult.summary.emceeAssigned }} 场</span>
            </a-descriptions-item>
            <a-descriptions-item label="成功分配乐队">
              <span style="color: #52c41a">{{ scheduleResult.summary.bandAssigned }} 场</span>
            </a-descriptions-item>
            <a-descriptions-item label="在岗司仪">
              {{ scheduleResult.summary.onDutyEmcees }} 人
            </a-descriptions-item>
            <a-descriptions-item label="在岗乐队">
              {{ scheduleResult.summary.onDutyBands }} 支
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <div v-if="scheduleResult.assignments.length > 0" class="result-section">
          <h4 class="section-title">
            <CheckCircleOutlined style="color: #52c41a; margin-right: 6px" />
            分配成功（{{ scheduleResult.assignments.length }}）
          </h4>
          <a-table
            :columns="assignmentColumns"
            :data-source="scheduleResult.assignments"
            :pagination="false"
            size="small"
            row-key="bookingId"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'staff'">
                <a-select
                  v-model:value="selectedStaffMap[record.bookingId + '_' + record.staffType]"
                  style="width: 100%"
                  size="small"
                >
                  <a-select-option
                    v-for="staff in getAvailableStaff(record)"
                    :key="staff.id"
                    :value="staff.id"
                  >
                    {{ staff.name }}
                  </a-select-option>
                </a-select>
              </template>
            </template>
          </a-table>
        </div>

        <div v-if="scheduleResult.failedAssignments.length > 0" class="result-section">
          <h4 class="section-title">
            <ExclamationCircleOutlined style="color: #ff4d4f; margin-right: 6px" />
            无法分配（{{ scheduleResult.failedAssignments.length }}）
          </h4>
          <a-alert
            v-for="fail in scheduleResult.failedAssignments"
            :key="fail.bookingId"
            type="warning"
            show-icon
            class="fail-item"
          >
            <template #message>
              <strong>{{ fail.booking.deceasedName }}</strong>
              （{{ fail.booking.startTime }} - {{ fail.booking.endTime }}，{{ getHallName(fail.booking.hallId) }}）
            </template>
            <template #description>
              {{ fail.staffType === 'emcee' ? '司仪' : '乐队' }}：{{ fail.reason }}
            </template>
          </a-alert>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { SoundOutlined, PlusOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import {
  getEmceeSchedule,
  getBandSchedule,
  getHallInfo,
  detectStaffConflicts,
  autoAssignStaff,
  applyAssignments
} from '../utils/scheduleUtils.js'
import { emcees, bands } from '../data/mockData.js'
import dayjs from 'dayjs'

const props = defineProps({
  date: {
    type: Object,
    default: () => dayjs()
  }
})

const emit = defineEmits(['schedule-updated'])

const activeTab = ref('emcee')
const scheduling = ref(false)
const showScheduleResult = ref(false)
const scheduleResult = ref(null)
const selectedStaffMap = reactive({})

const dateStr = computed(() => props.date.format('YYYY-MM-DD'))
const staffConflicts = computed(() => detectStaffConflicts(dateStr.value))

const assignmentColumns = [
  {
    title: '逝者',
    dataIndex: ['booking', 'deceasedName'],
    key: 'deceased',
    width: 100
  },
  {
    title: '时间',
    key: 'time',
    width: 140,
    customRender: ({ record }) => `${record.booking.startTime} - ${record.booking.endTime}`
  },
  {
    title: '厅室',
    key: 'hall',
    width: 100,
    customRender: ({ record }) => getHallName(record.booking.hallId)
  },
  {
    title: '类型',
    key: 'type',
    width: 60,
    customRender: ({ record }) => record.staffType === 'emcee' ? '司仪' : '乐队'
  },
  {
    title: '分配人员（可调整）',
    dataIndex: 'staffName',
    key: 'staff',
    width: 180
  }
]

function getEmceeScheduleList(emceeId) {
  return getEmceeSchedule(emceeId, dateStr.value)
}

function getBandScheduleList(bandId) {
  return getBandSchedule(bandId, dateStr.value)
}

function getHallName(hallId) {
  const hall = getHallInfo(hallId)
  return hall ? hall.name : '未知'
}

function getAvatar(id) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=emcee${id}`
}

function hasEmceeConflict(emceeId, bookingId) {
  return staffConflicts.value.some(c => c.type === 'emcee_conflict' &&
    c.staffId === emceeId &&
    (c.booking1.id === bookingId || c.booking2.id === bookingId))
}

function hasBandConflict(bandId, bookingId) {
  return staffConflicts.value.some(c => c.type === 'band_conflict' &&
    c.staffId === bandId &&
    (c.booking1.id === bookingId || c.booking2.id === bookingId))
}

function getConflictStaffName(conflict) {
  if (conflict.type === 'emcee_conflict') {
    const emcee = emcees.find(e => e.id === conflict.staffId)
    return emcee ? emcee.name : '未知'
  } else {
    const band = bands.find(b => b.id === conflict.staffId)
    return band ? band.name : '未知'
  }
}

function getAvailableStaff(record) {
  if (record.staffType === 'emcee') {
    return emcees.filter(e => e.status === 'on-duty')
  } else {
    return bands.filter(b => b.status === 'on-duty')
  }
}

async function handleAutoSchedule() {
  scheduling.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    const result = autoAssignStaff(dateStr.value)
    scheduleResult.value = result

    Object.keys(selectedStaffMap).forEach(k => delete selectedStaffMap[k])
    result.assignments.forEach(item => {
      selectedStaffMap[item.bookingId + '_' + item.staffType] = item.staffId
    })

    if (result.summary.totalToAssign === 0) {
      message.info('当前日期没有需要分配人员的预约')
      return
    }

    showScheduleResult.value = true
  } finally {
    scheduling.value = false
  }
}

function handleConfirmApply() {
  if (!scheduleResult.value) return

  const finalAssignments = scheduleResult.value.assignments.map(item => {
    const key = item.bookingId + '_' + item.staffType
    const newStaffId = selectedStaffMap[key]
    if (newStaffId && newStaffId !== item.staffId) {
      const staffList = item.staffType === 'emcee' ? emcees : bands
      const newStaff = staffList.find(s => s.id === newStaffId)
      return {
        ...item,
        staffId: newStaffId,
        staffName: newStaff ? newStaff.name : item.staffName
      }
    }
    return item
  })

  const results = applyAssignments(finalAssignments)
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length

  if (successCount > 0) {
    message.success(`成功应用 ${successCount} 项分配${failCount > 0 ? `，${failCount} 项失败` : ''}`)
  }
  if (failCount > 0) {
    message.error(`${failCount} 项分配应用失败`)
  }

  showScheduleResult.value = false
  emit('schedule-updated')
}

function handleCancelApply() {
  showScheduleResult.value = false
}
</script>

<style scoped>
.staff-schedule {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.staff-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.staff-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.staff-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.staff-card.off-duty {
  opacity: 0.6;
}

.staff-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.staff-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.staff-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.band-avatar {
  background: #e6f7ff;
}

.staff-info {
  flex: 1;
}

.staff-name {
  font-weight: 600;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  gap: 8px;
}

.staff-detail {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 2px;
}

.staff-card__schedule {
  padding: 12px 16px;
  max-height: 200px;
  overflow-y: auto;
}

.schedule-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schedule-item {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  background: #f6ffed;
  border-radius: 6px;
  border-left: 3px solid #52c41a;
}

.schedule-item.has-conflict {
  background: #fff1f0;
  border-left-color: #ff4d4f;
  animation: conflictPulse 2s infinite;
}

@keyframes conflictPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.2); }
  50% { box-shadow: 0 0 0 4px rgba(255, 77, 79, 0); }
}

.schedule-time {
  font-size: 12px;
  font-weight: 500;
  color: #52c41a;
  white-space: nowrap;
  flex-shrink: 0;
}

.schedule-item.has-conflict .schedule-time {
  color: #ff4d4f;
}

.schedule-content {
  flex: 1;
  min-width: 0;
}

.schedule-hall {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.schedule-deceased {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 2px;
}

.no-schedule {
  text-align: center;
  padding: 20px;
  color: rgba(0, 0, 0, 0.35);
  font-size: 13px;
}

.conflict-warning {
  margin-top: 16px;
}

.conflict-warning ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.conflict-warning li {
  font-size: 13px;
  line-height: 1.8;
}

.schedule-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.fail-item {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .staff-list {
    grid-template-columns: 1fr;
  }
}
</style>
