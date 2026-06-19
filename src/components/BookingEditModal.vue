<template>
  <a-modal
    :title="modalTitle"
    :open="visible"
    :confirm-loading="saving"
    :ok-text="isEdit ? '保存修改' : '创建预约'"
    cancel-text="取消"
    :width="600"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
      @finish="handleSubmit"
    >
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="逝者姓名" name="deceasedName">
            <a-input v-model:value="formData.deceasedName" placeholder="请输入逝者姓名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="厅室" name="hallId">
            <a-select v-model:value="formData.hallId" placeholder="请选择厅室" style="width: 100%">
              <a-select-option v-for="hall in availableHalls" :key="hall.id" :value="hall.id">
                {{ hall.name }} ({{ hallTypeLabels[hall.type] }})
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="家属联系人" name="contactName">
            <a-input v-model:value="formData.contactName" placeholder="请输入家属姓名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="联系电话" name="contactPhone">
            <a-input v-model:value="formData.contactPhone" placeholder="请输入联系电话" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="仪式流程模板">
        <div class="template-list">
          <div
            v-for="tpl in templates"
            :key="tpl.id"
            class="template-card"
            :class="{ selected: selectedTemplate === tpl.id }"
            @click="applyTemplate(tpl)"
          >
            <div class="template-icon">{{ tpl.icon }}</div>
            <div class="template-content">
              <div class="template-name">{{ tpl.name }}</div>
              <div class="template-desc">{{ tpl.description }}</div>
              <div class="template-meta">
                <span>{{ tpl.duration }}分钟</span>
                <span class="template-services">{{ getTemplateServiceLabels(tpl) }}</span>
              </div>
            </div>
            <div class="template-check" v-if="selectedTemplate === tpl.id">✓</div>
          </div>
        </div>
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="开始时间" name="startTime">
            <a-time-picker
              v-model:value="startTimeObj"
              format="HH:mm"
              :minute-step="15"
              style="width: 100%"
              placeholder="选择开始时间"
              @change="handleStartTimeChange"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="时长（分钟）" name="duration">
            <a-select v-model:value="formData.duration" style="width: 100%" @change="handleDurationChange">
              <a-select-option :value="30">30分钟</a-select-option>
              <a-select-option :value="45">45分钟</a-select-option>
              <a-select-option :value="60">60分钟</a-select-option>
              <a-select-option :value="90">90分钟</a-select-option>
              <a-select-option :value="120">120分钟</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="服务项目" name="services">
        <a-checkbox-group v-model:value="formData.services">
          <a-checkbox value="emcee">司仪主持</a-checkbox>
          <a-checkbox value="band">乐队演奏</a-checkbox>
          <a-checkbox value="flowers">鲜花布置</a-checkbox>
          <a-checkbox value="video">追思视频</a-checkbox>
        </a-checkbox-group>
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="司仪" name="emceeId" v-if="formData.services.includes('emcee')">
            <a-select v-model:value="formData.emceeId" placeholder="请选择司仪" style="width: 100%" allow-clear>
              <a-select-option v-for="emcee in availableEmcees" :key="emcee.id" :value="emcee.id">
                {{ emcee.name }} ({{ emcee.level }})
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="乐队" name="bandId" v-if="formData.services.includes('band')">
            <a-select v-model:value="formData.bandId" placeholder="请选择乐队" style="width: 100%" allow-clear>
              <a-select-option v-for="band in availableBands" :key="band.id" :value="band.id">
                {{ band.name }} ({{ band.members }}人)
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="状态" name="status">
        <a-select v-model:value="formData.status" style="width: 100%">
          <a-select-option value="confirmed">已确认</a-select-option>
          <a-select-option value="in-progress">进行中</a-select-option>
          <a-select-option value="completed">已完成</a-select-option>
          <a-select-option value="cancelled">已取消</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="备注" name="remark">
        <a-textarea
          v-model:value="formData.remark"
          :rows="3"
          placeholder="请输入备注信息，如特殊要求、注意事项等"
        />
      </a-form-item>

      <div v-if="costInfo.items.length > 0" class="cost-preview">
        <div class="cost-title">
          <span>费用明细</span>
          <span class="cost-total">合计：{{ formatCurrency(costInfo.total) }}</span>
        </div>
        <div class="cost-list">
          <div v-for="(item, index) in costInfo.items" :key="index" class="cost-item">
            <span class="cost-item-name">{{ item.name }}</span>
            <span class="cost-item-desc" v-if="item.description">{{ item.description }}</span>
            <span class="cost-item-amount">{{ formatCurrency(item.amount) }}</span>
          </div>
        </div>
      </div>

      <div v-if="conflictWarning" class="conflict-warning">
        <a-alert type="warning" show-icon :message="conflictWarning" />
      </div>
    </a-form>

    <template #footer>
      <a-button v-if="isEdit" danger @click="handleDelete" :loading="deleting">
        <DeleteOutlined />
        取消预约
      </a-button>
      <a-button v-if="isEdit" type="dashed" @click="handleViewSettlement">
        查看结算单
      </a-button>
      <div>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="saving" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '创建预约' }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch, h } from 'vue'
import dayjs from 'dayjs'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import {
  halls,
  emcees,
  bands,
  HALL_TYPE_LABELS,
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  CEREMONY_TEMPLATES
} from '../data/mockData.js'
import {
  timeToMinutes,
  minutesToTime,
  checkBookingConflict,
  checkStaffAvailability,
  calculateBookingCost,
  formatCurrency
} from '../utils/scheduleUtils.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    default: null
  },
  date: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'save', 'delete', 'view-settlement'])

const formRef = ref(null)
const saving = ref(false)
const deleting = ref(false)
const conflictWarning = ref('')

const isEdit = computed(() => !!props.booking)
const modalTitle = computed(() => isEdit.value ? '编辑预约' : '新建预约')

const costInfo = computed(() => {
  if (!formData.hallId || !formData.duration) {
    return { items: [], total: 0 }
  }
  return calculateBookingCost({
    hallId: formData.hallId,
    duration: formData.duration,
    services: formData.services
  })
})

const availableHalls = computed(() => halls)
const hallTypeLabels = HALL_TYPE_LABELS
const availableEmcees = computed(() => emcees.filter(e => e.status === 'on-duty'))
const availableBands = computed(() => bands.filter(b => b.status === 'on-duty'))
const templates = CEREMONY_TEMPLATES
const selectedTemplate = ref(null)

const defaultFormData = () => ({
  deceasedName: '',
  contactName: '',
  contactPhone: '',
  hallId: null,
  startTime: '08:00',
  duration: 60,
  services: [],
  emceeId: null,
  bandId: null,
  status: 'confirmed',
  remark: ''
})

const formData = reactive(defaultFormData())
const startTimeObj = ref(dayjs(props.date + ' 08:00', 'YYYY-MM-DD HH:mm'))

const rules = {
  deceasedName: [{ required: true, message: '请输入逝者姓名', trigger: 'blur' }],
  contactName: [{ required: true, message: '请输入家属联系人', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  hallId: [{ required: true, message: '请选择厅室', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  duration: [{ required: true, message: '请选择时长', trigger: 'change' }],
  services: [{ type: 'array', required: true, message: '请选择至少一项服务', trigger: 'change' }]
}

watch(() => props.visible, (val) => {
  if (val) {
    resetForm()
    if (props.booking) {
      Object.assign(formData, {
        deceasedName: props.booking.deceasedName,
        contactName: props.booking.contactName,
        contactPhone: props.booking.contactPhone,
        hallId: props.booking.hallId,
        startTime: props.booking.startTime,
        duration: props.booking.duration,
        services: [...props.booking.services],
        emceeId: props.booking.emceeId,
        bandId: props.booking.bandId,
        status: props.booking.status,
        remark: props.booking.remark || ''
      })
      startTimeObj.value = dayjs(props.date + ' ' + props.booking.startTime, 'YYYY-MM-DD HH:mm')
    } else {
      startTimeObj.value = dayjs(props.date + ' 08:00', 'YYYY-MM-DD HH:mm')
    }
    checkConflict()
  }
})

watch([() => formData.hallId, () => formData.startTime, () => formData.duration, () => formData.emceeId, () => formData.bandId], () => {
  checkConflict()
}, { deep: true })

function handleStartTimeChange(time) {
  if (time) {
    formData.startTime = time.format('HH:mm')
  }
}

function handleDurationChange() {
  const startMin = timeToMinutes(formData.startTime)
  const endMin = startMin + formData.duration
  formData.endTime = minutesToTime(endMin)
}

function getTemplateServiceLabels(tpl) {
  return tpl.services.map(s => SERVICE_TYPE_LABELS[s]).join('、')
}

function applyTemplate(tpl) {
  selectedTemplate.value = tpl.id
  formData.services = [...tpl.services]
  formData.duration = tpl.duration
  formData.remark = tpl.remark || ''

  if (!tpl.services.includes(SERVICE_TYPES.EMCEE)) {
    formData.emceeId = null
  }
  if (!tpl.services.includes(SERVICE_TYPES.BAND)) {
    formData.bandId = null
  }

  checkConflict()
}

function isFormMatchTemplate(tpl) {
  if (formData.duration !== tpl.duration) return false
  if (formData.services.length !== tpl.services.length) return false
  const sortedFormServices = [...formData.services].sort()
  const sortedTplServices = [...tpl.services].sort()
  return sortedFormServices.every((s, i) => s === sortedTplServices[i])
}

watch([() => formData.services, () => formData.duration], () => {
  if (!selectedTemplate.value) return
  const tpl = templates.find(t => t.id === selectedTemplate.value)
  if (!tpl || !isFormMatchTemplate(tpl)) {
    selectedTemplate.value = null
  }
}, { deep: true })

function checkConflict() {
  if (!formData.hallId || !formData.startTime || !formData.duration) {
    conflictWarning.value = ''
    return
  }

  const endMin = timeToMinutes(formData.startTime) + formData.duration
  const endTime = minutesToTime(endMin)
  formData.endTime = endTime

  const conflict = checkBookingConflict(
    formData.hallId,
    props.date,
    formData.startTime,
    endTime,
    isEdit.value ? props.booking.id : null
  )

  const staffConflict = checkStaffAvailability(
    formData,
    props.date,
    isEdit.value ? props.booking.id : null
  )

  if (conflict) {
    conflictWarning.value = conflict
  } else if (staffConflict) {
    conflictWarning.value = staffConflict
  } else {
    conflictWarning.value = ''
  }
}

async function handleSubmit() {
  try {
    await formRef.value.validate()

    const endMin = timeToMinutes(formData.startTime) + formData.duration
    const endTime = minutesToTime(endMin)

    const conflict = checkBookingConflict(
      formData.hallId,
      props.date,
      formData.startTime,
      endTime,
      isEdit.value ? props.booking.id : null
    )

    const staffConflict = checkStaffAvailability(
      formData,
      props.date,
      isEdit.value ? props.booking.id : null
    )

    const activeConflict = conflict || staffConflict

    if (activeConflict) {
      await new Promise((resolve, reject) => {
        Modal.confirm({
          title: '存在冲突风险',
          icon: () => h(ExclamationCircleOutlined, { style: { color: '#faad14' } }),
          content: activeConflict,
          okText: '强制保存',
          okType: 'danger',
          cancelText: '返回修改',
          onOk: () => resolve(true),
          onCancel: () => reject(new Error('用户取消'))
        })
      })
    }

    saving.value = true

    const bookingData = {
      ...formData,
      endTime,
      date: props.date
    }

    if (!bookingData.services.includes(SERVICE_TYPES.EMCEE)) {
      bookingData.emceeId = null
    }
    if (!bookingData.services.includes(SERVICE_TYPES.BAND)) {
      bookingData.bandId = null
    }

    emit('save', {
      bookingData,
      isEdit: isEdit.value,
      originalId: isEdit.value ? props.booking.id : null
    })

    handleCancel()
  } catch (e) {
    if (e.message !== '用户取消') {
      console.log('表单校验失败:', e)
    }
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    deleting.value = true
    emit('delete', props.booking.id)
    handleCancel()
  } finally {
    deleting.value = false
  }
}

function handleViewSettlement() {
  const startMin = timeToMinutes(formData.startTime)
  const endMin = startMin + formData.duration
  const tempBooking = {
    id: props.booking?.id || Date.now(),
    date: props.date,
    deceasedName: formData.deceasedName || '（未填写）',
    contactName: formData.contactName || '（未填写）',
    contactPhone: formData.contactPhone || '（未填写）',
    hallId: formData.hallId,
    startTime: formData.startTime,
    endTime: minutesToTime(endMin),
    duration: formData.duration,
    services: formData.services,
    emceeId: formData.emceeId,
    bandId: formData.bandId,
    remark: formData.remark || ''
  }
  emit('view-settlement', tempBooking)
}

function handleCancel() {
  emit('update:visible', false)
  resetForm()
}

function resetForm() {
  Object.assign(formData, defaultFormData())
  conflictWarning.value = ''
  selectedTemplate.value = null
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}
</script>

<style scoped>
.conflict-warning {
  margin-top: 16px;
}

.cost-preview {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.cost-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #b7eb8f;
}

.cost-total {
  color: #52c41a;
  font-size: 18px;
}

.cost-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.cost-item-name {
  color: rgba(0, 0, 0, 0.75);
  flex: 1;
}

.cost-item-desc {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  margin: 0 12px;
}

.cost-item-amount {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  flex-shrink: 0;
}

:deep(.ant-modal-footer) {
  display: flex;
  justify-content: space-between;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
}

.template-card:hover {
  border-color: #1890ff;
  background: #e6f7ff;
}

.template-card.selected {
  border-color: #1890ff;
  background: #e6f7ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.template-icon {
  font-size: 28px;
  margin-right: 12px;
  width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.template-content {
  flex: 1;
  min-width: 0;
}

.template-name {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 2px;
}

.template-desc {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 4px;
}

.template-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.template-services {
  color: #1890ff;
}

.template-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-left: 12px;
  flex-shrink: 0;
}
</style>
