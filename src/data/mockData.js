import dayjs from 'dayjs'

export const HALL_TYPES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  LUXURY: 'luxury'
}

export const HALL_TYPE_LABELS = {
  [HALL_TYPES.SMALL]: '小型(20人)',
  [HALL_TYPES.MEDIUM]: '中型(50人)',
  [HALL_TYPES.LARGE]: '大型(100人)',
  [HALL_TYPES.LUXURY]: '豪华(200人)'
}

export const SERVICE_TYPES = {
  EMCEE: 'emcee',
  BAND: 'band',
  FLOWERS: 'flowers',
  VIDEO: 'video'
}

export const SERVICE_TYPE_LABELS = {
  [SERVICE_TYPES.EMCEE]: '司仪',
  [SERVICE_TYPES.BAND]: '乐队',
  [SERVICE_TYPES.FLOWERS]: '鲜花布置',
  [SERVICE_TYPES.VIDEO]: '电子屏追思视频'
}

export const halls = [
  { id: 1, name: '泰安厅', type: HALL_TYPES.SMALL, capacity: 20, floor: '1F' },
  { id: 2, name: '永思厅', type: HALL_TYPES.SMALL, capacity: 20, floor: '1F' },
  { id: 3, name: '福寿厅', type: HALL_TYPES.MEDIUM, capacity: 50, floor: '2F' },
  { id: 4, name: '康宁厅', type: HALL_TYPES.MEDIUM, capacity: 50, floor: '2F' },
  { id: 5, name: '德馨厅', type: HALL_TYPES.LARGE, capacity: 100, floor: '3F' },
  { id: 6, name: '弘福厅', type: HALL_TYPES.LARGE, capacity: 100, floor: '3F' },
  { id: 7, name: '至尊厅', type: HALL_TYPES.LUXURY, capacity: 200, floor: '4F' },
  { id: 8, name: '荣尊厅', type: HALL_TYPES.LUXURY, capacity: 200, floor: '4F' }
]

const today = dayjs().format('YYYY-MM-DD')

export const bookings = [
  {
    id: 1,
    hallId: 1,
    date: today,
    startTime: '08:00',
    endTime: '08:30',
    duration: 30,
    deceasedName: '张大爷',
    contactName: '张建国',
    contactPhone: '13800138001',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.FLOWERS],
    emceeId: 1,
    bandId: null,
    status: 'confirmed',
    remark: '家属要求简单仪式'
  },
  {
    id: 2,
    hallId: 1,
    date: today,
    startTime: '09:30',
    endTime: '10:30',
    duration: 60,
    deceasedName: '李奶奶',
    contactName: '李明',
    contactPhone: '13800138002',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.BAND, SERVICE_TYPES.VIDEO],
    emceeId: 2,
    bandId: 1,
    status: 'confirmed',
    remark: ''
  },
  {
    id: 3,
    hallId: 1,
    date: today,
    startTime: '14:00',
    endTime: '15:00',
    duration: 60,
    deceasedName: '王老先生',
    contactName: '王芳',
    contactPhone: '13800138003',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.FLOWERS],
    emceeId: 1,
    bandId: null,
    status: 'confirmed',
    remark: '老党员，需要党旗覆盖'
  },
  {
    id: 4,
    hallId: 2,
    date: today,
    startTime: '08:30',
    endTime: '09:00',
    duration: 30,
    deceasedName: '赵阿姨',
    contactName: '赵伟',
    contactPhone: '13800138004',
    services: [SERVICE_TYPES.EMCEE],
    emceeId: 3,
    bandId: null,
    status: 'confirmed',
    remark: ''
  },
  {
    id: 5,
    hallId: 2,
    date: today,
    startTime: '10:00',
    endTime: '11:30',
    duration: 90,
    deceasedName: '孙老先生',
    contactName: '孙强',
    contactPhone: '13800138005',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.BAND, SERVICE_TYPES.FLOWERS, SERVICE_TYPES.VIDEO],
    emceeId: 2,
    bandId: 2,
    status: 'confirmed',
    remark: '高级干部，规格较高'
  },
  {
    id: 6,
    hallId: 2,
    date: today,
    startTime: '13:30',
    endTime: '14:30',
    duration: 60,
    deceasedName: '周奶奶',
    contactName: '周明',
    contactPhone: '13800138006',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.VIDEO],
    emceeId: 4,
    bandId: null,
    status: 'confirmed',
    remark: ''
  },
  {
    id: 7,
    hallId: 3,
    date: today,
    startTime: '09:00',
    endTime: '10:30',
    duration: 90,
    deceasedName: '吴老先生',
    contactName: '吴刚',
    contactPhone: '13800138007',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.BAND, SERVICE_TYPES.FLOWERS],
    emceeId: 1,
    bandId: 1,
    status: 'confirmed',
    remark: ''
  },
  {
    id: 8,
    hallId: 3,
    date: today,
    startTime: '14:30',
    endTime: '15:30',
    duration: 60,
    deceasedName: '郑阿姨',
    contactName: '郑华',
    contactPhone: '13800138008',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.FLOWERS],
    emceeId: 3,
    bandId: null,
    status: 'confirmed',
    remark: '鲜花要求白色百合为主'
  },
  {
    id: 9,
    hallId: 4,
    date: today,
    startTime: '08:00',
    endTime: '09:00',
    duration: 60,
    deceasedName: '冯老先生',
    contactName: '冯磊',
    contactPhone: '13800138009',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.BAND],
    emceeId: 5,
    bandId: 3,
    status: 'confirmed',
    remark: ''
  },
  {
    id: 10,
    hallId: 4,
    date: today,
    startTime: '10:30',
    endTime: '12:00',
    duration: 90,
    deceasedName: '陈奶奶',
    contactName: '陈静',
    contactPhone: '13800138010',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.BAND, SERVICE_TYPES.FLOWERS, SERVICE_TYPES.VIDEO],
    emceeId: 2,
    bandId: 2,
    status: 'in-progress',
    remark: '预计可能超时15分钟'
  },
  {
    id: 11,
    hallId: 4,
    date: today,
    startTime: '13:00',
    endTime: '14:00',
    duration: 60,
    deceasedName: '褚大爷',
    contactName: '褚军',
    contactPhone: '13800138011',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.VIDEO],
    emceeId: 4,
    bandId: null,
    status: 'confirmed',
    remark: ''
  },
  {
    id: 12,
    hallId: 5,
    date: today,
    startTime: '09:00',
    endTime: '10:30',
    duration: 90,
    deceasedName: '卫老先生',
    contactName: '卫强',
    contactPhone: '13800138012',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.BAND, SERVICE_TYPES.FLOWERS, SERVICE_TYPES.VIDEO],
    emceeId: 6,
    bandId: 4,
    status: 'confirmed',
    remark: '知名企业家，到场人数较多'
  },
  {
    id: 13,
    hallId: 5,
    date: today,
    startTime: '13:30',
    endTime: '15:00',
    duration: 90,
    deceasedName: '蒋奶奶',
    contactName: '蒋明',
    contactPhone: '13800138013',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.FLOWERS, SERVICE_TYPES.VIDEO],
    emceeId: 5,
    bandId: null,
    status: 'confirmed',
    remark: ''
  },
  {
    id: 14,
    hallId: 6,
    date: today,
    startTime: '08:30',
    endTime: '09:30',
    duration: 60,
    deceasedName: '沈老先生',
    contactName: '沈伟',
    contactPhone: '13800138014',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.BAND, SERVICE_TYPES.VIDEO],
    emceeId: 3,
    bandId: 3,
    status: 'confirmed',
    remark: ''
  },
  {
    id: 15,
    hallId: 6,
    date: today,
    startTime: '11:00',
    endTime: '12:30',
    duration: 90,
    deceasedName: '韩阿姨',
    contactName: '韩芳',
    contactPhone: '13800138015',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.FLOWERS],
    emceeId: 1,
    bandId: null,
    status: 'confirmed',
    remark: ''
  },
  {
    id: 16,
    hallId: 6,
    date: today,
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    deceasedName: '杨大爷',
    contactName: '杨军',
    contactPhone: '13800138016',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.BAND, SERVICE_TYPES.FLOWERS],
    emceeId: 6,
    bandId: 4,
    status: 'confirmed',
    remark: '退休干部'
  },
  {
    id: 17,
    hallId: 7,
    date: today,
    startTime: '09:00',
    endTime: '11:00',
    duration: 120,
    deceasedName: '朱老先生',
    contactName: '朱明',
    contactPhone: '13800138017',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.BAND, SERVICE_TYPES.FLOWERS, SERVICE_TYPES.VIDEO],
    emceeId: 7,
    bandId: 5,
    status: 'confirmed',
    remark: '豪华告别仪式，VIP客户'
  },
  {
    id: 18,
    hallId: 7,
    date: today,
    startTime: '14:30',
    endTime: '16:00',
    duration: 90,
    deceasedName: '秦奶奶',
    contactName: '秦静',
    contactPhone: '13800138018',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.FLOWERS, SERVICE_TYPES.VIDEO],
    emceeId: 8,
    bandId: null,
    status: 'confirmed',
    remark: ''
  },
  {
    id: 19,
    hallId: 8,
    date: today,
    startTime: '10:00',
    endTime: '12:00',
    duration: 120,
    deceasedName: '尤老先生',
    contactName: '尤刚',
    contactPhone: '13800138019',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.BAND, SERVICE_TYPES.FLOWERS, SERVICE_TYPES.VIDEO],
    emceeId: 9,
    bandId: 6,
    status: 'confirmed',
    remark: '社会名流，媒体到场'
  },
  {
    id: 20,
    hallId: 8,
    date: today,
    startTime: '15:00',
    endTime: '16:30',
    duration: 90,
    deceasedName: '许阿姨',
    contactName: '许华',
    contactPhone: '13800138020',
    services: [SERVICE_TYPES.EMCEE, SERVICE_TYPES.BAND, SERVICE_TYPES.FLOWERS],
    emceeId: 7,
    bandId: 5,
    status: 'confirmed',
    remark: ''
  }
]

export const emcees = [
  { id: 1, name: '张司仪', level: '高级', experience: 10, status: 'on-duty' },
  { id: 2, name: '李司仪', level: '高级', experience: 8, status: 'on-duty' },
  { id: 3, name: '王司仪', level: '中级', experience: 5, status: 'on-duty' },
  { id: 4, name: '赵司仪', level: '中级', experience: 4, status: 'on-duty' },
  { id: 5, name: '刘司仪', level: '中级', experience: 6, status: 'on-duty' },
  { id: 6, name: '陈司仪', level: '高级', experience: 12, status: 'on-duty' },
  { id: 7, name: '杨司仪', level: '首席', experience: 15, status: 'on-duty' },
  { id: 8, name: '黄司仪', level: '高级', experience: 9, status: 'on-duty' },
  { id: 9, name: '周司仪', level: '首席', experience: 18, status: 'on-duty' },
  { id: 10, name: '吴司仪', level: '初级', experience: 2, status: 'rest' }
]

export const bands = [
  { id: 1, name: '第一乐队', members: 6, leader: '王队长', status: 'on-duty' },
  { id: 2, name: '第二乐队', members: 5, leader: '李队长', status: 'on-duty' },
  { id: 3, name: '第三乐队', members: 4, leader: '张队长', status: 'on-duty' },
  { id: 4, name: '第四乐队', members: 6, leader: '刘队长', status: 'on-duty' },
  { id: 5, name: '第五乐队', members: 8, leader: '陈队长', status: 'on-duty' },
  { id: 6, name: '第六乐队', members: 7, leader: '赵队长', status: 'on-duty' },
  { id: 7, name: '第七乐队', members: 5, leader: '孙队长', status: 'rest' }
]

export const TIME_SLOT_START = 7
export const TIME_SLOT_END = 18
export const CLEANING_DURATION = 30
export const PEAK_START_HOUR = 9
export const PEAK_END_HOUR = 11

const deceasedNames = [
  '张大爷', '李奶奶', '王老先生', '赵阿姨', '孙老先生',
  '周奶奶', '吴老先生', '郑阿姨', '冯老先生', '陈奶奶',
  '褚大爷', '卫老先生', '蒋奶奶', '沈老先生', '韩阿姨',
  '杨大爷', '朱老先生', '秦奶奶', '尤老先生', '许阿姨',
  '何老先生', '吕奶奶', '施大爷', '张阿姨', '孔老先生',
  '曹奶奶', '严老先生', '华阿姨', '金大爷', '魏奶奶'
]

const contactNames = [
  '张建国', '李明', '王芳', '赵伟', '孙强',
  '周明', '吴刚', '郑华', '冯磊', '陈静',
  '褚军', '卫强', '蒋明', '沈伟', '韩芳',
  '杨军', '朱明', '秦静', '尤刚', '许华',
  '何勇', '吕强', '施亮', '张峰', '孔伟',
  '曹明', '严华', '华军', '金磊', '魏强'
]

const timeSlotsList = [
  { start: '08:00', end: '08:30', duration: 30 },
  { start: '08:30', end: '09:30', duration: 60 },
  { start: '09:00', end: '10:30', duration: 90 },
  { start: '09:30', end: '10:30', duration: 60 },
  { start: '10:00', end: '11:30', duration: 90 },
  { start: '10:30', end: '12:00', duration: 90 },
  { start: '11:00', end: '12:30', duration: 90 },
  { start: '13:00', end: '14:00', duration: 60 },
  { start: '13:30', end: '14:30', duration: 60 },
  { start: '13:30', end: '15:00', duration: 90 },
  { start: '14:00', end: '15:00', duration: 60 },
  { start: '14:00', end: '15:30', duration: 90 },
  { start: '14:30', end: '15:30', duration: 60 },
  { start: '14:30', end: '16:00', duration: 90 },
  { start: '15:00', end: '16:30', duration: 90 },
  { start: '09:00', end: '11:00', duration: 120 },
  { start: '10:00', end: '12:00', duration: 120 }
]

function seededRandom(seed) {
  let s = seed
  return function() {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function generateRandomServices(rand) {
  const base = [SERVICE_TYPES.EMCEE]
  if (rand() > 0.3) base.push(SERVICE_TYPES.FLOWERS)
  if (rand() > 0.5) base.push(SERVICE_TYPES.BAND)
  if (rand() > 0.5) base.push(SERVICE_TYPES.VIDEO)
  return base
}

export function generateHistoricalBookings() {
  const todayStr = dayjs().format('YYYY-MM-DD')
  const cacheKey = `funeral_bookings_${todayStr}`

  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {}

  const historical = []
  let bookingId = 100
  const baseSeed = dayjs(todayStr).valueOf() % 100000

  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const dateObj = dayjs(todayStr).subtract(dayOffset, 'day')
    const date = dateObj.format('YYYY-MM-DD')
    const dayOfWeek = dateObj.day()

    const daySeed = baseSeed + dayOffset * 1000
    const rand = seededRandom(daySeed)

    const bookingsOnDay = dayOfWeek === 0 || dayOfWeek === 6
      ? Math.floor(rand() * 8) + 14
      : Math.floor(rand() * 6) + 10

    const usedHallSlots = {}
    halls.forEach(h => { usedHallSlots[h.id] = [] })

    for (let i = 0; i < bookingsOnDay; i++) {
      let attempts = 0
      while (attempts < 20) {
        const hallId = halls[Math.floor(rand() * halls.length)].id
        const slot = timeSlotsList[Math.floor(rand() * timeSlotsList.length)]
        const startMin = parseInt(slot.start.split(':')[0]) * 60 + parseInt(slot.start.split(':')[1])
        const endMin = parseInt(slot.end.split(':')[0]) * 60 + parseInt(slot.end.split(':')[1])

        let conflict = false
        for (const used of usedHallSlots[hallId]) {
          if (startMin < used.end + CLEANING_DURATION && endMin + CLEANING_DURATION > used.start) {
            conflict = true
            break
          }
        }

        if (!conflict) {
          usedHallSlots[hallId].push({ start: startMin, end: endMin })
          const nameIdx = Math.floor(rand() * deceasedNames.length)
          const services = generateRandomServices(rand)
          const hasBand = services.includes(SERVICE_TYPES.BAND)
          const hasEmcee = services.includes(SERVICE_TYPES.EMCEE)

          historical.push({
            id: bookingId++,
            hallId,
            date,
            startTime: slot.start,
            endTime: slot.end,
            duration: slot.duration,
            deceasedName: deceasedNames[nameIdx],
            contactName: contactNames[nameIdx],
            contactPhone: `13800${String(138000 + bookingId).slice(-6)}`,
            services,
            emceeId: hasEmcee ? emcees[Math.floor(rand() * 9)].id : null,
            bandId: hasBand ? bands[Math.floor(rand() * 6)].id : null,
            status: dayOffset === 0 ? (i < 12 ? 'confirmed' : (i === 12 ? 'in-progress' : 'confirmed')) : 'completed',
            remark: ''
          })
          break
        }
        attempts++
      }
    }
  }

  try {
    localStorage.setItem(cacheKey, JSON.stringify(historical))
  } catch (e) {}

  return historical
}

export const allBookings = generateHistoricalBookings()

import { ref } from 'vue'

let nextId = Math.max(...bookings.map(b => b.id), ...allBookings.map(b => b.id)) + 1

const reactiveBookings = ref([...bookings])
const reactiveAllBookings = ref([...allBookings])

export const bookingStore = {
  getBookings: () => reactiveBookings.value,
  getAllBookings: () => reactiveAllBookings.value,

  addBooking: (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: nextId++
    }
    reactiveBookings.value.push(newBooking)
    reactiveAllBookings.value.push(newBooking)
    return newBooking
  },

  updateBooking: (id, updates) => {
    const idx = reactiveBookings.value.findIndex(b => b.id === id)
    if (idx !== -1) {
      reactiveBookings.value[idx] = { ...reactiveBookings.value[idx], ...updates }
    }
    const allIdx = reactiveAllBookings.value.findIndex(b => b.id === id)
    if (allIdx !== -1) {
      reactiveAllBookings.value[allIdx] = { ...reactiveAllBookings.value[allIdx], ...updates }
    }
    return idx !== -1
  },

  deleteBooking: (id) => {
    const idx = reactiveBookings.value.findIndex(b => b.id === id)
    if (idx !== -1) {
      reactiveBookings.value.splice(idx, 1)
    }
    const allIdx = reactiveAllBookings.value.findIndex(b => b.id === id)
    if (allIdx !== -1) {
      reactiveAllBookings.value.splice(allIdx, 1)
    }
    return idx !== -1
  },

  getNextId: () => nextId
}

export function getBookingsRef() {
  return reactiveBookings
}

export function getAllBookingsRef() {
  return reactiveAllBookings
}

