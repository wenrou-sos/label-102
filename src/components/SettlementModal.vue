<template>
  <a-modal
    :open="visible"
    title="费用结算单"
    :width="640"
    :footer="null"
    @cancel="handleCancel"
  >
    <div v-if="booking" class="settlement-container">
      <div class="settlement-header">
        <div class="company-name">殡仪馆告别厅服务结算单</div>
        <div class="settlement-no">单据号：{{ settlementNo }}</div>
      </div>

      <div class="settlement-info">
        <a-descriptions bordered size="small" :column="2">
          <a-descriptions-item label="逝者姓名">
            {{ booking.deceasedName }}
          </a-descriptions-item>
          <a-descriptions-item label="家属联系人">
            {{ booking.contactName }}
          </a-descriptions-item>
          <a-descriptions-item label="联系电话">
            {{ booking.contactPhone }}
          </a-descriptions-item>
          <a-descriptions-item label="使用日期">
            {{ booking.date }}
          </a-descriptions-item>
          <a-descriptions-item label="使用时间">
            {{ booking.startTime }} - {{ booking.endTime }}（{{ booking.duration }}分钟）
          </a-descriptions-item>
          <a-descriptions-item label="厅室">
            {{ hallName }}
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <div class="settlement-items">
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40%">项目</th>
              <th style="width: 25%">说明</th>
              <th style="width: 15%">单价</th>
              <th style="width: 20%">金额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in costInfo.items" :key="index">
              <td>{{ item.name }}</td>
              <td>{{ item.description || item.unit }}</td>
              <td>¥{{ item.price.toFixed(2) }}</td>
              <td>¥{{ item.amount.toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total-label">合计金额</td>
              <td class="total-amount">¥{{ costInfo.total.toFixed(2) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="settlement-footer">
        <div class="footer-left">
          <div>备注：{{ booking.remark || '无' }}</div>
          <div class="amount-words">金额大写：{{ amountInWords }}</div>
        </div>
      </div>

      <div class="settlement-signature">
        <div class="sig-item">
          <span>经办人：</span>
          <span class="sig-line"></span>
        </div>
        <div class="sig-item">
          <span>家属确认：</span>
          <span class="sig-line"></span>
        </div>
        <div class="sig-item">
          <span>日期：</span>
          <span class="sig-line"></span>
        </div>
      </div>

      <div class="settlement-actions no-print">
        <a-button @click="handleCancel">关闭</a-button>
        <a-button type="primary" @click="handlePrint">
          <PrinterOutlined />
          打印结算单
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { PrinterOutlined } from '@ant-design/icons-vue'
import { calculateBookingCost, formatCurrency } from '../utils/scheduleUtils.js'
import { getHallInfo } from '../utils/scheduleUtils.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

const settlementNo = ref('')

watch(() => props.visible, (val) => {
  if (val && props.booking) {
    const now = new Date()
    const dateStr = props.booking.date.replace(/-/g, '')
    const seq = String(props.booking.id).padStart(4, '0')
    settlementNo.value = `BG${dateStr}${seq}`
  }
})

const costInfo = computed(() => {
  if (!props.booking) return { items: [], total: 0 }
  return calculateBookingCost(props.booking)
})

const hallName = computed(() => {
  if (!props.booking || !props.booking.hallId) return ''
  const hall = getHallInfo(props.booking.hallId)
  return hall ? hall.name : ''
})

const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const units = ['', '拾', '佰', '仟', '万', '拾万', '佰万', '仟万']

const amountInWords = computed(() => {
  const num = costInfo.value.total
  if (num === 0) return '零元整'

  const intPart = Math.floor(num)
  const decPart = Math.round((num - intPart) * 100)

  let result = ''

  if (intPart > 0) {
    const intStr = String(intPart)
    let intResult = ''
    for (let i = 0; i < intStr.length; i++) {
      const digit = parseInt(intStr[i])
      const unitIndex = intStr.length - 1 - i
      if (digit !== 0) {
        intResult += digits[digit] + units[unitIndex]
      } else if (intResult && !intResult.endsWith('零')) {
        intResult += '零'
      }
    }
    intResult = intResult.replace(/零+$/, '')
    result += intResult + '元'
  }

  if (decPart > 0) {
    const jiao = Math.floor(decPart / 10)
    const fen = decPart % 10
    if (jiao > 0) {
      result += digits[jiao] + '角'
    } else if (intPart > 0) {
      result += '零'
    }
    if (fen > 0) {
      result += digits[fen] + '分'
    }
  } else {
    result += '整'
  }

  return result
})

function handlePrint() {
  window.print()
}

function handleCancel() {
  emit('update:visible', false)
}
</script>

<style scoped>
.settlement-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settlement-header {
  text-align: center;
  border-bottom: 2px solid #d9d9d9;
  padding-bottom: 16px;
}

.company-name {
  font-size: 20px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 8px;
}

.settlement-no {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
}

.settlement-info {
  margin-bottom: 8px;
}

.settlement-items {
  margin-bottom: 8px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.items-table th,
.items-table td {
  border: 1px solid #d9d9d9;
  padding: 8px 12px;
  text-align: left;
}

.items-table th {
  background: #fafafa;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.items-table tfoot td {
  background: #fafafa;
  font-weight: 600;
}

.total-label {
  text-align: right;
}

.total-amount {
  color: #f5222d;
  font-size: 16px;
}

.settlement-footer {
  margin-top: 8px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.footer-left {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.amount-words {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.settlement-signature {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #d9d9d9;
}

.sig-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.sig-line {
  display: inline-block;
  width: 100px;
  border-bottom: 1px solid #d9d9d9;
  margin-left: 8px;
}

.settlement-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}
</style>

<style media="print">
.no-print {
  display: none !important;
}

:deep(.ant-modal) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 20px !important;
  box-shadow: none !important;
}

:deep(.ant-modal-content) {
  box-shadow: none !important;
}

:deep(.ant-modal-header) {
  display: none !important;
}

:deep(.ant-modal-close) {
  display: none !important;
}

body {
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
</style>
