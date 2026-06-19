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

      <div v-if="conflictWarning" class="conflict-warning">
        <a-alert type="warning" show-icon :message="conflictWarning" />
      </div>
    </a-form>

    <template #footer v-if="isEdit">
      <a-button danger @click="handleDelete" :loading="deleting">
        <DeleteOutlined />
        取消预约
      </a-button>
      <div>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="saving" @click="handleSubmit">
          保存修改
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { DeleteOutlined } from '@ant-design/icons-vue'
import {
  halls,
  emcees,
  bands,
  HALL_TYPE_LABELS,
  SERVICE_TYPES
} from '../data/mockData.js'
import {
  timeToMinutes,
  minutesToTime,
  checkBookingConflict,
  checkStaffAvailability
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

const emit = defineEmits(['update:visible', 'save', 'delete'])

const formRef = ref(null)
const saving = ref(false)
const deleting = ref(false)
const conflictWarning = ref('')

const isEdit = computed(() => !!props.booking)
const modalTitle = computed(() => isEdit.value ? '编辑预约' : '新建预约')

const availableHalls = computed(() => halls)
const hallTypeLabels = HALL_TYPE_LABELS
const availableEmcees = computed(() => emcees.filter(e => e.status === 'on-duty'))
const availableBands = computed(() => bands.filter(b => b.status === 'on-duty'))

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

watch([() => formData.hallId, () => formData.startTime, () => formData.duration], () => {
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
    saving.value = true

    const endMin = timeToMinutes(formData.startTime) + formData.duration
    const bookingData = {
      ...formData,
      endTime: minutesToTime(endMin),
      date: props.date,
      services: formData.services.filter(s => {
        if (s === SERVICE_TYPES.EMCEE) return !!formData.emceeId
        if (s === SERVICE_TYPES.BAND) return !!formData.bandId
        return true
      })
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
    console.log('表单校验失败:', e)
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

function handleCancel() {
  emit('update:visible', false)
  resetForm()
}

function resetForm() {
  Object.assign(formData, defaultFormData())
  conflictWarning.value = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}
</script>

<style scoped>
.conflict-warning {
  margin-top: 16px;
}

:deep(.ant-modal-footer) {
  display: flex;
  justify-content: space-between;
}
</style>
