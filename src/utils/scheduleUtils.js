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
  bookings,
  allBookings,
  emcees,
  bands
} from '../data/mockData.js'

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
  return bookings.filter(b => b.hallId === hallId && b.date === date)
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

  bookings.filter(b => b.date === date).forEach(booking => {
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
  const dayBookings = bookings.filter(b => b.date === date)
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
  return bookings
    .filter(b => b.emceeId === emceeId && b.date === date)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
}

export function getBandSchedule(bandId, date) {
  return bookings
    .filter(b => b.bandId === bandId && b.date === date)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
}

export function filterBookings({ hallType, serviceType, timeRange, keyword }, date) {
  let filtered = bookings.filter(b => b.date === date)

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
  const dayBookings = bookings.filter(b => b.date === date)
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

  const weekBookings = allBookings.filter(b => validDates.includes(b.date))
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

  return {
    dailyData,
    hallUsage,
    totalBookings,
    avgDailyBookings,
    overallUsageRate,
    hallTypeUsage,
    dateRange: `${dates[0]} 至 ${dates[6]}`
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

  const monthBookings = allBookings.filter(b => validDates.includes(b.date))

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

  return {
    weekData,
    hallUsage,
    totalBookings,
    avgDailyBookings,
    overallUsageRate,
    hallTypeUsage,
    monthLabel: `${end.year()}年${end.month() + 1}月`,
    daysInMonth: validDayCount
  }
}

export function getHallUsageTrend(hallId, endDate, days = 7) {
  const end = dayjs(endDate)
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    dates.push(end.subtract(i, 'day').format('YYYY-MM-DD'))
  }

  return dates.map(date => {
    const dayBookings = allBookings.filter(b => b.date === date && b.hallId === hallId)
    const dateObj = dayjs(date)
    return {
      date,
      label: `${dateObj.month() + 1}/${dateObj.date()}`,
      bookingCount: dayBookings.length,
      usageRate: calculateUsageRate(dayBookings, 1)
    }
  })
}
