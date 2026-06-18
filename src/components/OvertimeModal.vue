<template>
  <a-modal
    :open="visible"
    :title="title"
    @ok="handleOk"
    @cancel="handleCancel"
    :ok-text="'我知道了'"
    :cancel-text="'关闭'"
    :width="600"
    class="overtime-modal"
  >
    <div class="overtime-list">
      <div
        v-for="(item, index) in overtimeList"
        :key="index"
        class="overtime-item"
        :class="{ 'warning': item.warning }"
      >
        <div class="overtime-icon">
          <WarningOutlined v-if="!item.warning" style="color: #ff4d4f; font-size: 24px" />
          <ExclamationCircleOutlined v-else style="color: #faad14; font-size: 24px" />
        </div>
        <div class="overtime-content">
          <div class="overtime-title">
            <strong>{{ item.hall.name }}</strong>
            <a-tag :color="item.warning ? 'orange' : 'red'">
              {{ item.warning ? '即将超时' : '已超时' }}
            </a-tag>
          </div>
          <div class="overtime-desc">{{ item.description }}</div>
          <div class="overtime-detail">
            <p><span class="label">当前仪式：</span>{{ item.currentBooking.deceasedName }}</p>
            <p><span class="label">预计结束：</span>{{ item.currentBooking.endTime }}</p>
            <p><span class="label">下一场：</span>{{ item.nextBooking.deceasedName }}</p>
            <p><span class="label">下一场开始：</span>{{ item.nextBooking.startTime }}</p>
            <p><span class="label">超时/风险时长：</span>
              <span :class="{ 'danger': !item.warning }">{{ item.overTimeMinutes }}分钟</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="overtime-tips">
      <a-alert type="info" show-icon :message="'温馨提示'">
        <template #description>
          <ul>
            <li>请及时与当前仪式家属沟通，控制仪式时长</li>
            <li>如确需延时，请提前与下一场家属沟通致歉</li>
            <li>高峰期时段请严格控制时间，避免连锁延误</li>
            <li>保洁时间为30分钟，请确保厅室按时交接</li>
          </ul>
        </template>
      </a-alert>
    </div>
  </a-modal>
</template>

<script setup>
import { WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '超时告警'
  },
  overtimeList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['ok', 'cancel', 'close'])

function handleOk() {
  emit('ok')
  emit('close')
}

function handleCancel() {
  emit('cancel')
  emit('close')
}
</script>

<style scoped>
.overtime-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.overtime-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fff1f0;
  border-radius: 8px;
  border-left: 4px solid #ff4d4f;
}

.overtime-item.warning {
  background: #fffbe6;
  border-left-color: #faad14;
}

.overtime-icon {
  flex-shrink: 0;
  padding-top: 2px;
}

.overtime-content {
  flex: 1;
  min-width: 0;
}

.overtime-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.overtime-title strong {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.85);
}

.overtime-desc {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  margin-bottom: 12px;
  font-weight: 500;
}

.overtime-detail {
  background: rgba(255, 255, 255, 0.6);
  padding: 10px 12px;
  border-radius: 6px;
}

.overtime-detail p {
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.6;
}

.overtime-detail .label {
  color: rgba(0, 0, 0, 0.5);
}

.overtime-detail .danger {
  color: #ff4d4f;
  font-weight: 600;
}

.overtime-tips {
  margin-top: 20px;
}

.overtime-tips ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.overtime-tips li {
  font-size: 13px;
  line-height: 1.8;
}
</style>
