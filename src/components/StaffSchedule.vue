<template>
  <div class="staff-schedule">
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
  </div>
</template>

<script setup>import { ref, computed } from 'vue';
import { SoundOutlined } from '@ant-design/icons-vue';
import { getEmceeSchedule, getBandSchedule, getHallInfo, detectStaffConflicts } from '../utils/scheduleUtils.js';
import { emcees, bands } from '../data/mockData.js';
import dayjs from 'dayjs';
const props = defineProps({
 date: {
 type: Object,
 default: () => dayjs()
 }
});
const activeTab = ref('emcee');
const dateStr = computed(() => props.date.format('YYYY-MM-DD'));
const staffConflicts = computed(() => detectStaffConflicts(dateStr.value));
function getEmceeScheduleList(emceeId) {
 return getEmceeSchedule(emceeId, dateStr.value);
}
function getBandScheduleList(bandId) {
 return getBandSchedule(bandId, dateStr.value);
}
function getHallName(hallId) {
 const hall = getHallInfo(hallId);
 return hall ? hall.name : '未知';
}
function getAvatar(id) {
 return `https://api.dicebear.com/7.x/avataaars/svg?seed=emcee${id}`;
}
function hasEmceeConflict(emceeId, bookingId) {
 return staffConflicts.value.some(c => c.type === 'emcee_conflict' &&
 c.staffId === emceeId &&
 (c.booking1.id === bookingId || c.booking2.id === bookingId));
}
function hasBandConflict(bandId, bookingId) {
 return staffConflicts.value.some(c => c.type === 'band_conflict' &&
 c.staffId === bandId &&
 (c.booking1.id === bookingId || c.booking2.id === bookingId));
}
function getConflictStaffName(conflict) {
 if (conflict.type === 'emcee_conflict') {
 const emcee = emcees.find(e => e.id === conflict.staffId);
 return emcee ? emcee.name : '未知';
 }
 else {
 const band = bands.find(b => b.id === conflict.staffId);
 return band ? band.name : '未知';
 }
}
</script>

<style scoped>
.staff-schedule {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

@media (max-width: 768px) {
  .staff-list {
    grid-template-columns: 1fr;
  }
}
</style>
