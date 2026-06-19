import dayjs from 'dayjs'
import {
  TIME_SLOT_START,
  TIME_SLOT_END,
  CLEANING_DURATION,
  PEAK_START_HOUR,
  PEAK_END_HOUR,
  HALL_TYPE_LABELS,
  SERVICE_TYPE_LABELS,
  halls,
  emcees,
  bands,
  bookingStore
} from '../data/mockData.js'

function getBookings() {
  return bookingStore.getBookings()
}

function getAllBookings() {
  return bookingStore.getAllBookings()
}

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function isPeakHour(time) {
  const minutes = typeof time === 'string' ? timeToMinutes(time) : time
  const peakStart = PEAK_START_HOUR * 60
  const peakEnd = PEAK_END_HOUR * 60
  return minutes >= peakStart && minutes < peakEnd
}

export function getTimeSlots() {
  const slots = []
  for (let i = TIME_SLOT_START; i <= TIME_SLOT_END; i++) {
    slots.push({
      hour: i,
      label: `${String(i).padStart(2, '0')}:00`,
      isPeak: i >= PEAK_START_HOUR && i < PEAK_END_HOUR
    })
  }
  return slots
}

export function getHallBookings(hallId, date) {
  return getBookings().filter(b => b.hallId === hallId && b.date === date && b.status !== 'cancelled')
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
}

export function calculateBookingPosition(booking, containerHeight) {
  const startMinutes = timeToMinutes(booking.startTime)
  const endMinutes = timeToMinutes(booking.endTime)
  const totalMinutes = (TIME_SLOT_END - TIME_SLOT_START) * 60
  const startOffset = startMinutes - TIME_SLOT_START * 60
  const duration = endMinutes - startMinutes

  return {
    top: (startOffset / totalMinutes) * containerHeight,
    height: (duration / totalMinutes) * containerHeight
  }
}

export function checkTimeOverlap(start1, end1, start2, end2) {
  const s1 = typeof start1 === 'string' ? timeToMinutes(start1) : start1
  const e1 = typeof end1 === 'string' ? timeToMinutes(end1) : end1
  const s2 = typeof start2 === 'string' ? timeToMinutes(start2) : start2
  const e2 = typeof end2 === 'string' ? timeToMinutes(end2) : end2
  return s1 < e2 && s2 < e1
}

export function detectHallConflicts(hallId, date) {
  const hallBookings = getHallBookings(hallId, date)
  const conflicts = []

  for (let i = 0; i < hallBookings.length - 1; i++) {
    const current = hallBookings[i]
    const next = hallBookings[i + 1]
    const currentEnd = timeToMinutes(current.endTime)
    const nextStart = timeToMinutes(next.startTime)
    const gap = nextStart - currentEnd

    if (gap < CLEANING_DURATION) {
      conflicts.push({
        type: 'cleaning_gap',
        booking1: current,
        booking2: next,
        gapMinutes: gap,
        requiredGap: CLEANING_DURATION,
        description: `保洁时间不足：${gap}分钟（需${CLEANING_DURATION}分钟）`
      })
    }

    if (checkTimeOverlap(current.startTime, current.endTime, next.startTime, next.endTime)) {
      conflicts.push({
        type: 'booking_overlap',
        booking1: current,
        booking2: next,
        description: '预约时段重叠'
      })
    }
  }

  return conflicts
}

export function detectStaffConflicts(date) {
  const conflicts = []

  const emceeBookings = {}
  const bandBookings = {}

  getBookings().filter(b => b.date === date && b.status !== 'cancelled').forEach(booking => {
    if (booking.emceeId) {
      if (!emceeBookings[booking.emceeId]) {
        emceeBookings[booking.emceeId] = []
      }
      emceeBookings[booking.emceeId].push(booking)
    }
    if (booking.bandId) {
      if (!bandBookings[booking.bandId]) {
        bandBookings[booking.bandId] = []
      }
      bandBookings[booking.bandId].push(booking)
    }
  })

  Object.entries(emceeBookings).forEach(([emceeId, emceeBookingList]) => {
    const sorted = emceeBookingList.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    for (let i = 0; i < sorted.length - 1; i++) {
      if (checkTimeOverlap(sorted[i].startTime, sorted[i].endTime, sorted[i + 1].startTime, sorted[i + 1].endTime)) {
        conflicts.push({
          type: 'emcee_conflict',
          staffType: '司仪',
          staffId: Number(emceeId),
          booking1: sorted[i],
          booking2: sorted[i + 1],
          description: '司仪时间冲突'
        })
      }
    }
  })

  Object.entries(bandBookings).forEach(([bandId, bandBookingList]) => {
    const sorted = bandBookingList.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    for (let i = 0; i < sorted.length - 1; i++) {
      if (checkTimeOverlap(sorted[i].startTime, sorted[i].endTime, sorted[i + 1].startTime, sorted[i + 1].endTime)) {
        conflicts.push({
          type: 'band_conflict',
          staffType: '乐队',
          staffId: Number(bandId),
          booking1: sorted[i],
          booking2: sorted[i + 1],
          description: '乐队时间冲突'
        })
      }
    }
  })

  return conflicts
}

export function isHallFullAtPeak(hallId, date) {
  const peakStart = PEAK_START_HOUR * 60
  const peakEnd = PEAK_END_HOUR * 60
  const hallBookings = getHallBookings(hallId, date)

  let peakMinutesCovered = 0
  hallBookings.forEach(booking => {
    const start = Math.max(timeToMinutes(booking.startTime), peakStart)
    const end = Math.min(timeToMinutes(booking.endTime), peakEnd)
    if (end > start) {
      peakMinutesCovered += (end - start)
    }
  })

  const totalPeakMinutes = peakEnd - peakStart
  return peakMinutesCovered >= totalPeakMinutes * 0.9
}

export function getPeakHallsStatus(date) {
  return halls.map(hall => ({
    ...hall,
    isFull: isHallFullAtPeak(hall.id, date)
  }))
}

export function getDailyStatistics(date) {
  const dayBookings = getBookings().filter(b => b.date === date && b.status !== 'cancelled')
  const totalBookings = dayBookings.length

  const hallTypeCount = {}
  const serviceCount = {
    emcee: 0,
    band: 0,
    flowers: 0,
    video: 0
  }

  dayBookings.forEach(booking => {
    const hall = halls.find(h => h.id === booking.hallId)
    if (hall) {
      hallTypeCount[hall.type] = (hallTypeCount[hall.type] || 0) + 1
    }

    booking.services.forEach(service => {
      serviceCount[service] = (serviceCount[service] || 0) + 1
    })
  })

  const peakStart = PEAK_START_HOUR * 60
  const peakEnd = PEAK_END_HOUR * 60
  const peakTotalMinutes = (peakEnd - peakStart) * halls.length

  let peakUsedMinutes = 0
  dayBookings.forEach(booking => {
    const bookingStart = timeToMinutes(booking.startTime)
    const bookingEnd = timeToMinutes(booking.endTime)
    const overlapStart = Math.max(bookingStart, peakStart)
    const overlapEnd = Math.min(bookingEnd, peakEnd)
    if (overlapEnd > overlapStart) {
      peakUsedMinutes += (overlapEnd - overlapStart)
    }
  })

  const peakBookings = dayBookings.filter(b => isPeakHour(b.startTime)).length
  const peakUsageRate = peakTotalMinutes > 0 ? ((peakUsedMinutes / peakTotalMinutes) * 100).toFixed(1) : 0

  const emceeCount = new Set(dayBookings.filter(b => b.emceeId).map(b => b.emceeId)).size
  const bandCount = new Set(dayBookings.filter(b => b.bandId).map(b => b.bandId)).size

  return {
    totalBookings,
    hallTypeCount,
    serviceCount,
    peakUsageRate,
    peakBookings,
    emceeCount,
    bandCount,
    onDutyEmcees: emcees.filter(e => e.status === 'on-duty').length,
    onDutyBands: bands.filter(b => b.status === 'on-duty').length
  }
}

export function getHallInfo(hallId) {
  return halls.find(h => h.id === hallId)
}

export function getEmceeInfo(emceeId) {
  return emcees.find(e => e.id === emceeId)
}

export function getBandInfo(bandId) {
  return bands.find(b => b.id === bandId)
}

export function getServiceTypeLabels(services) {
  return services.map(s => SERVICE_TYPE_LABELS[s] || s)
}

export function getHallTypeLabel(type) {
  return HALL_TYPE_LABELS[type] || type
}

export function getEmceeSchedule(emceeId, date) {
  return getBookings()
    .filter(b => b.emceeId === emceeId && b.date === date && b.status !== 'cancelled')
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
}

export function getBandSchedule(bandId, date) {
  return getBookings()
    .filter(b => b.bandId === bandId && b.date === date && b.status !== 'cancelled')
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
}

export function filterBookings({ hallType, serviceType, timeRange, keyword }, date) {
  let filtered = getBookings().filter(b => b.date === date && b.status !== 'cancelled')

  if (hallType && hallType !== 'all') {
    const hallIds = halls.filter(h => h.type === hallType).map(h => h.id)
    filtered = filtered.filter(b => hallIds.includes(b.hallId))
  }

  if (serviceType && serviceType !== 'all') {
    filtered = filtered.filter(b => b.services.includes(serviceType))
  }

  if (timeRange && timeRange.length === 2) {
    const [start, end] = timeRange
    filtered = filtered.filter(b => {
      const bookingStart = timeToMinutes(b.startTime)
      return bookingStart >= timeToMinutes(start) && bookingStart <= timeToMinutes(end)
    })
  }

  if (keyword) {
    const kw = keyword.toLowerCase()
    filtered = filtered.filter(b =>
      b.deceasedName.toLowerCase().includes(kw) ||
      b.contactName.toLowerCase().includes(kw)
    )
  }

  return filtered
}

export function detectOverTimeBookings(date) {
  const dayBookings = getBookings().filter(b => b.date === date)
  const overTimeList = []

  halls.forEach(hall => {
    const hallBookings = getHallBookings(hall.id, date)
    for (let i = 0; i < hallBookings.length - 1; i++) {
      const current = hallBookings[i]
      const next = hallBookings[i + 1]
      if (current.status === 'in-progress') {
        const expectedEnd = timeToMinutes(current.endTime)
        const nextStart = timeToMinutes(next.startTime)
        const availableTime = nextStart - expectedEnd

        if (availableTime < 0) {
          overTimeList.push({
            hall,
            currentBooking: current,
            nextBooking: next,
            overTimeMinutes: Math.abs(availableTime),
            description: `仪式已超时${Math.abs(availableTime)}分钟，影响下一场预约`
          })
        } else if (availableTime < CLEANING_DURATION) {
          overTimeList.push({
            hall,
            currentBooking: current,
            nextBooking: next,
            overTimeMinutes: CLEANING_DURATION - availableTime,
            description: `若再延时${CLEANING_DURATION - availableTime}分钟，将影响下一场预约`,
            warning: true
          })
        }
      }
    }
  })

  return overTimeList
}

const TOTAL_MINUTES_PER_DAY = (TIME_SLOT_END - TIME_SLOT_START) * 60

function calculateUsageRate(bookingsList, hallCount, days = 1) {
  let totalUsedMinutes = 0
  bookingsList.forEach(booking => {
    totalUsedMinutes += (timeToMinutes(booking.endTime) - timeToMinutes(booking.startTime))
  })
  const totalAvailableMinutes = TOTAL_MINUTES_PER_DAY * hallCount * days
  return totalAvailableMinutes > 0
    ? Number(((totalUsedMinutes / totalAvailableMinutes) * 100).toFixed(1))
    : 0
}

export function getHallUsageTrend(hallId, endDate, days = 7) {
  const end = dayjs(endDate)
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    dates.push(end.subtract(i, 'day').format('YYYY-MM-DD'))
  }

  return dates.map(date => {
    const dayBookings = getAllBookings().filter(b => b.date === date && b.hallId === hallId && b.status !== 'cancelled')
    const dateObj = dayjs(date)
    return {
      date,
      label: `${dateObj.month() + 1}/${dateObj.date()}`,
      bookingCount: dayBookings.length,
      usageRate: calculateUsageRate(dayBookings, 1)
    }
  })
}

export function checkBookingConflict(hallId, date, startTime, endTime, excludeId = null) {
  const hallBookings = getHallBookings(hallId, date)
  const s1 = timeToMinutes(startTime)
  const e1 = timeToMinutes(endTime)

  for (const booking of hallBookings) {
    if (excludeId && booking.id === excludeId) continue
    if (booking.status === 'cancelled') continue

    const s2 = timeToMinutes(booking.startTime)
    const e2 = timeToMinutes(booking.endTime)

    if (s1 < e2 && s2 < e1) {
      return `时段冲突：与 ${booking.deceasedName} 的 ${booking.startTime}-${booking.endTime} 预约重叠`
    }

    const gap = s2 - e1
    if (gap > 0 && gap < CLEANING_DURATION) {
      return `保洁时间不足：与 ${booking.deceasedName} 的预约之间仅间隔 ${gap} 分钟（需 ${CLEANING_DURATION} 分钟）`
    }
  }

  if (e1 > TIME_SLOT_END * 60 || s1 < TIME_SLOT_START * 60) {
    return `超出营业时间：仅支持 ${String(TIME_SLOT_START).padStart(2, '0')}:00 - ${String(TIME_SLOT_END).padStart(2, '0')}:00`
  }

  return null
}

export function checkStaffAvailability(bookingData, date, excludeId = null) {
  const dayBookings = getBookings().filter(b => b.date === date && b.status !== 'cancelled')

  const s1 = timeToMinutes(bookingData.startTime)
  const endMin = s1 + bookingData.duration

  if (bookingData.emceeId) {
    const emceeBookings = dayBookings.filter(
      b => b.emceeId === bookingData.emceeId && (!excludeId || b.id !== excludeId)
    )
    for (const b of emceeBookings) {
      const s2 = timeToMinutes(b.startTime)
      const e2 = timeToMinutes(b.endTime)
      if (s1 < e2 && s2 < endMin) {
        const emcee = emcees.find(e => e.id === bookingData.emceeId)
        return `司仪 ${emcee?.name || ''} 时段冲突：与 ${b.deceasedName} 的 ${b.startTime}-${b.endTime} 预约重叠`
      }
    }
  }

  if (bookingData.bandId) {
    const bandBookings = dayBookings.filter(
      b => b.bandId === bookingData.bandId && (!excludeId || b.id !== excludeId)
    )
    for (const b of bandBookings) {
      const s2 = timeToMinutes(b.startTime)
      const e2 = timeToMinutes(b.endTime)
      if (s1 < e2 && s2 < endMin) {
        const band = bands.find(b2 => b2.id === bookingData.bandId)
        return `乐队 ${band?.name || ''} 时段冲突：与 ${b.deceasedName} 的 ${b.startTime}-${b.endTime} 预约重叠`
      }
    }
  }

  return null
}

export function createBooking(bookingData) {
  return bookingStore.addBooking(bookingData)
}

export function updateBooking(id, updates) {
  return bookingStore.updateBooking(id, updates)
}

export function deleteBooking(id) {
  return bookingStore.deleteBooking(id)
}

function calculateHourlyUsage(bookingsList, hallCount, startHour, endHour, days = 1) {
  const totalMinutes = (endHour - startHour) * 60 * hallCount * days
  let usedMinutes = 0

  bookingsList.forEach(booking => {
    const bookingStart = timeToMinutes(booking.startTime)
    const bookingEnd = timeToMinutes(booking.endTime)
    const periodStart = startHour * 60
    const periodEnd = endHour * 60
    const overlapStart = Math.max(bookingStart, periodStart)
    const overlapEnd = Math.min(bookingEnd, periodEnd)
    if (overlapEnd > overlapStart) {
      usedMinutes += (overlapEnd - overlapStart)
    }
  })

  return totalMinutes > 0 ? Number(((usedMinutes / totalMinutes) * 100).toFixed(1)) : 0
}

export function getPeakHourTrend(bookingsList, hallCount, days = 1) {
  const hours = []
  for (let h = TIME_SLOT_START; h < TIME_SLOT_END; h++) {
    const usageRate = calculateHourlyUsage(bookingsList, hallCount, h, h + 1, days)
    const hourStart = h * 60
    const hourEnd = (h + 1) * 60
    const bookingCount = bookingsList.filter(b => {
      const bStart = timeToMinutes(b.startTime)
      const bEnd = timeToMinutes(b.endTime)
      return bStart < hourEnd && bEnd > hourStart
    }).length
    hours.push({
      hour: h,
      label: `${String(h).padStart(2, '0')}:00`,
      subLabel: h >= PEAK_START_HOUR && h < PEAK_END_HOUR ? '高峰' : '',
      value: usageRate,
      bookingCount,
      isPeak: h >= PEAK_START_HOUR && h < PEAK_END_HOUR
    })
  }
  return hours
}

export function getStaffLoadStats(bookingsList, staffList, staffType, days = 1) {
  const loadMap = {}
  const workMinutesPerDay = (TIME_SLOT_END - TIME_SLOT_START) * 60

  bookingsList.forEach(booking => {
    const staffId = staffType === 'emcee' ? booking.emceeId : booking.bandId
    if (staffId) {
      if (!loadMap[staffId]) {
        loadMap[staffId] = { bookingCount: 0, usedMinutes: 0 }
      }
      loadMap[staffId].bookingCount++
      loadMap[staffId].usedMinutes += (timeToMinutes(booking.endTime) - timeToMinutes(booking.startTime))
    }
  })

  return staffList
    .filter(s => s.status === 'on-duty')
    .map(staff => {
      const stats = loadMap[staff.id] || { bookingCount: 0, usedMinutes: 0 }
      const totalAvailableMinutes = workMinutesPerDay * days
      const loadRate = totalAvailableMinutes > 0
        ? Number(((stats.usedMinutes / totalAvailableMinutes) * 100).toFixed(1))
        : 0
      return {
        ...staff,
        bookingCount: stats.bookingCount,
        usedMinutes: stats.usedMinutes,
        loadRate,
        value: loadRate,
        label: staff.name,
        subLabel: `${stats.bookingCount}场`,
        extra: `累计服务 ${Math.round(stats.usedMinutes / 60 * 10) / 10} 小时`
      }
    })
    .sort((a, b) => b.loadRate - a.loadRate)
}

function getPeakHourUsage(weeklyBookings, hallCount, days = 1) {
  const peakStart = PEAK_START_HOUR * 60
  const peakEnd = PEAK_END_HOUR * 60
  const totalPeakMinutes = (peakEnd - peakStart) * hallCount * days

  let peakUsedMinutes = 0
  weeklyBookings.forEach(booking => {
    const bookingStart = timeToMinutes(booking.startTime)
    const bookingEnd = timeToMinutes(booking.endTime)
    const overlapStart = Math.max(bookingStart, peakStart)
    const overlapEnd = Math.min(bookingEnd, peakEnd)
    if (overlapEnd > overlapStart) {
      peakUsedMinutes += (overlapEnd - overlapStart)
    }
  })

  return totalPeakMinutes > 0 ? Number(((peakUsedMinutes / totalPeakMinutes) * 100).toFixed(1)) : 0
}

export function getWeeklyStatistics(endDate) {
  const end = dayjs(endDate)
  const startOfWeek = end.startOf('week').add(1, 'day')
  const dates = []
  for (let i = 0; i < 7; i++) {
    dates.push(startOfWeek.add(i, 'day').format('YYYY-MM-DD'))
  }

  const todayStr = dayjs().format('YYYY-MM-DD')
  const validDates = dates.filter(d => dayjs(d).isBefore(dayjs(todayStr).add(1, 'day')))
  const dayCount = validDates.length

  const weekBookings = getAllBookings().filter(b => validDates.includes(b.date))
  const dailyData = validDates.map(date => {
    const dayBookings = weekBookings.filter(b => b.date === date)
    const dateObj = dayjs(date)
    return {
      date,
      label: `${dateObj.month() + 1}/${dateObj.date()}`,
      weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dateObj.day()],
      bookingCount: dayBookings.length,
      usageRate: calculateUsageRate(dayBookings, halls.length)
    }
  })

  const hallUsage = halls.map(hall => {
    const hallBookings = weekBookings.filter(b => b.hallId === hall.id)
    const typeCount = {}
    hallBookings.forEach(b => {
      b.services.forEach(s => {
        typeCount[s] = (typeCount[s] || 0) + 1
      })
    })
    return {
      ...hall,
      bookingCount: hallBookings.length,
      usageRate: calculateUsageRate(hallBookings, 1, dayCount),
      typeCount
    }
  }).sort((a, b) => b.usageRate - a.usageRate)

  const totalBookings = weekBookings.length
  const avgDailyBookings = dayCount > 0 ? (totalBookings / dayCount).toFixed(1) : '0.0'
  const overallUsageRate = calculateUsageRate(weekBookings, halls.length, dayCount)

  const hallTypeUsage = {}
  halls.forEach(hall => {
    if (!hallTypeUsage[hall.type]) {
      hallTypeUsage[hall.type] = { label: HALL_TYPE_LABELS[hall.type], count: 0, usedMinutes: 0 }
    }
    const hallBookings = weekBookings.filter(b => b.hallId === hall.id)
    hallTypeUsage[hall.type].count += hallBookings.length
    hallBookings.forEach(b => {
      hallTypeUsage[hall.type].usedMinutes += (timeToMinutes(b.endTime) - timeToMinutes(b.startTime))
    })
  })
  Object.keys(hallTypeUsage).forEach(type => {
    const hallsOfType = halls.filter(h => h.type === type).length
    hallTypeUsage[type].usageRate = dayCount > 0 ? Number(
      ((hallTypeUsage[type].usedMinutes / (TOTAL_MINUTES_PER_DAY * hallsOfType * dayCount)) * 100).toFixed(1)
    ) : 0
  })

  const peakHourTrend = getPeakHourTrend(weekBookings, halls.length, dayCount)
  const emceeLoad = getStaffLoadStats(weekBookings, emcees, 'emcee', dayCount)
  const bandLoad = getStaffLoadStats(weekBookings, bands, 'band', dayCount)
  const peakHourUsage = getPeakHourUsage(weekBookings, halls.length, dayCount)

  return {
    dailyData,
    hallUsage,
    totalBookings,
    avgDailyBookings,
    overallUsageRate,
    hallTypeUsage,
    dateRange: `${validDates[0]} 至 ${validDates[validDates.length - 1]}（本周一至今日，共${dayCount}天）`,
    peakHourTrend,
    emceeLoad,
    bandLoad,
    peakHourUsage
  }
}

export function getMonthlyStatistics(endDate) {
  const end = dayjs(endDate)
  const startOfMonth = end.startOf('month')
  const daysInMonth = end.daysInMonth()
  const todayStr = dayjs().format('YYYY-MM-DD')

  const allDates = []
  for (let i = 0; i < daysInMonth; i++) {
    allDates.push(startOfMonth.add(i, 'day').format('YYYY-MM-DD'))
  }

  const validDates = allDates.filter(d => dayjs(d).isBefore(dayjs(todayStr).add(1, 'day')))
  const validDayCount = validDates.length

  const monthBookings = getAllBookings().filter(b => validDates.includes(b.date) && b.status !== 'cancelled')

  const weekData = []
  let currentWeekStart = 0
  while (currentWeekStart < validDayCount) {
    const weekDates = validDates.slice(currentWeekStart, Math.min(currentWeekStart + 7, validDayCount))
    const weekBookings = monthBookings.filter(b => weekDates.includes(b.date))
    const weekStart = dayjs(weekDates[0])
    const weekEnd = dayjs(weekDates[weekDates.length - 1])
    weekData.push({
      label: `${weekStart.month() + 1}/${weekStart.date()}-${weekEnd.month() + 1}/${weekEnd.date()}`,
      bookingCount: weekBookings.length,
      usageRate: calculateUsageRate(weekBookings, halls.length, weekDates.length),
      dayCount: weekDates.length
    })
    currentWeekStart += 7
  }

  const hallUsage = halls.map(hall => {
    const hallBookings = monthBookings.filter(b => b.hallId === hall.id)
    return {
      ...hall,
      bookingCount: hallBookings.length,
      usageRate: calculateUsageRate(hallBookings, 1, validDayCount)
    }
  }).sort((a, b) => b.usageRate - a.usageRate)

  const totalBookings = monthBookings.length
  const avgDailyBookings = validDayCount > 0 ? (totalBookings / validDayCount).toFixed(1) : '0.0'
  const overallUsageRate = calculateUsageRate(monthBookings, halls.length, validDayCount)

  const hallTypeUsage = {}
  halls.forEach(hall => {
    if (!hallTypeUsage[hall.type]) {
      hallTypeUsage[hall.type] = { label: HALL_TYPE_LABELS[hall.type], count: 0, usedMinutes: 0 }
    }
    const hallBookings = monthBookings.filter(b => b.hallId === hall.id)
    hallTypeUsage[hall.type].count += hallBookings.length
    hallBookings.forEach(b => {
      hallTypeUsage[hall.type].usedMinutes += (timeToMinutes(b.endTime) - timeToMinutes(b.startTime))
    })
  })
  Object.keys(hallTypeUsage).forEach(type => {
    const hallsOfType = halls.filter(h => h.type === type).length
    hallTypeUsage[type].usageRate = validDayCount > 0 ? Number(
      ((hallTypeUsage[type].usedMinutes / (TOTAL_MINUTES_PER_DAY * hallsOfType * validDayCount)) * 100).toFixed(1)
    ) : 0
  })

  const peakHourTrend = getPeakHourTrend(monthBookings, halls.length, validDayCount)
  const emceeLoad = getStaffLoadStats(monthBookings, emcees, 'emcee', validDayCount)
  const bandLoad = getStaffLoadStats(monthBookings, bands, 'band', validDayCount)
  const peakHourUsage = getPeakHourUsage(monthBookings, halls.length, validDayCount)

  return {
    weekData,
    hallUsage,
    totalBookings,
    avgDailyBookings,
    overallUsageRate,
    hallTypeUsage,
    monthLabel: `${end.year()}年${end.month() + 1}月`,
    daysInMonth: validDayCount,
    peakHourTrend,
    emceeLoad,
    bandLoad,
    peakHourUsage
  }
}

function isStaffAvailable(staffSchedule, bookingStart, bookingEnd) {
  const s1 = typeof bookingStart === 'string' ? timeToMinutes(bookingStart) : bookingStart
  const e1 = typeof bookingEnd === 'string' ? timeToMinutes(bookingEnd) : bookingEnd
  for (const existing of staffSchedule) {
    const s2 = timeToMinutes(existing.startTime)
    const e2 = timeToMinutes(existing.endTime)
    if (s1 < e2 && s2 < e1) {
      return false
    }
  }
  return true
}

function getStaffWorkMinutes(staffSchedule) {
  return staffSchedule.reduce((total, booking) => {
    return total + (timeToMinutes(booking.endTime) - timeToMinutes(booking.startTime))
  }, 0)
}

export function autoAssignStaff(date) {
  const dayBookings = getBookings().filter(b => b.date === date && b.status !== 'cancelled')
  const onDutyEmcees = emcees.filter(e => e.status === 'on-duty')
  const onDutyBands = bands.filter(b => b.status === 'on-duty')

  const emceeNeededBookings = dayBookings
    .filter(b => b.services.includes('emcee') && !b.emceeId)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  const bandNeededBookings = dayBookings
    .filter(b => b.services.includes('band') && !b.bandId)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  const emceeSchedules = {}
  onDutyEmcees.forEach(e => { emceeSchedules[e.id] = getEmceeSchedule(e.id, date) })

  const bandSchedules = {}
  onDutyBands.forEach(b => { bandSchedules[b.id] = getBandSchedule(b.id, date) })

  const assignments = []
  const failedAssignments = []

  for (const booking of emceeNeededBookings) {
    const bookingStart = timeToMinutes(booking.startTime)
    const bookingEnd = timeToMinutes(booking.endTime)

    const candidates = onDutyEmcees
      .filter(emcee => isStaffAvailable(emceeSchedules[emcee.id], bookingStart, bookingEnd))
      .sort((a, b) => {
        const workA = getStaffWorkMinutes(emceeSchedules[a.id])
        const workB = getStaffWorkMinutes(emceeSchedules[b.id])
        if (workA !== workB) return workA - workB
        const expA = a.experience || 0
        const expB = b.experience || 0
        return expB - expA
      })

    if (candidates.length > 0) {
      const selected = candidates[0]
      assignments.push({
        bookingId: booking.id,
        booking,
        staffType: 'emcee',
        staffId: selected.id,
        staffName: selected.name,
        staffInfo: selected
      })
      emceeSchedules[selected.id].push(booking)
    } else {
      failedAssignments.push({
        bookingId: booking.id,
        booking,
        staffType: 'emcee',
        reason: '无空闲司仪'
      })
    }
  }

  for (const booking of bandNeededBookings) {
    const bookingStart = timeToMinutes(booking.startTime)
    const bookingEnd = timeToMinutes(booking.endTime)

    const candidates = onDutyBands
      .filter(band => isStaffAvailable(bandSchedules[band.id], bookingStart, bookingEnd))
      .sort((a, b) => {
        const workA = getStaffWorkMinutes(bandSchedules[a.id])
        const workB = getStaffWorkMinutes(bandSchedules[b.id])
        if (workA !== workB) return workA - workB
        const membersA = a.members || 0
        const membersB = b.members || 0
        return membersB - membersA
      })

    if (candidates.length > 0) {
      const selected = candidates[0]
      assignments.push({
        bookingId: booking.id,
        booking,
        staffType: 'band',
        staffId: selected.id,
        staffName: selected.name,
        staffInfo: selected
      })
      bandSchedules[selected.id].push(booking)
    } else {
      failedAssignments.push({
        bookingId: booking.id,
        booking,
        staffType: 'band',
        reason: '无空闲乐队'
      })
    }
  }

  const emceeAssigned = assignments.filter(a => a.staffType === 'emcee').length
  const bandAssigned = assignments.filter(a => a.staffType === 'band').length
  const emceeFailed = failedAssignments.filter(f => f.staffType === 'emcee').length
  const bandFailed = failedAssignments.filter(f => f.staffType === 'band').length

  return {
    assignments,
    failedAssignments,
    summary: {
      totalToAssign: emceeNeededBookings.length + bandNeededBookings.length,
      emceeNeeded: emceeNeededBookings.length,
      bandNeeded: bandNeededBookings.length,
      emceeAssigned,
      bandAssigned,
      emceeFailed,
      bandFailed,
      totalAssigned: emceeAssigned + bandAssigned,
      totalFailed: emceeFailed + bandFailed,
      onDutyEmcees: onDutyEmcees.length,
      onDutyBands: onDutyBands.length
    }
  }
}

export function applyAssignments(assignments) {
  const results = []
  for (const item of assignments) {
    const updates = {}
    if (item.staffType === 'emcee') {
      updates.emceeId = item.staffId
    } else if (item.staffType === 'band') {
      updates.bandId = item.staffId
    }
    const success = updateBooking(item.bookingId, updates)
    results.push({ ...item, success })
  }
  return results
}
