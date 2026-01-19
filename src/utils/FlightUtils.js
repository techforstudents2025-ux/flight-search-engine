// FlightUtils.js أو في أعلى الملف
export const parseFlightDuration = (durationStr) => {
  // إذا كانت القيمة فارغة أو غير صالحة
  if (!durationStr || durationStr === '' || typeof durationStr !== 'string') {
    return { hours: 0, minutes: 0, totalHours: 0, formatted: '0h 0m' };
  }
  
  let hours = 0;
  let minutes = 0;
  
  try {
    // الحالة 1: تنسيق ISO 8601 (PT2H30M)
    if (durationStr.includes('PT')) {
      const hourMatch = durationStr.match(/(\d+)H/);
      const minuteMatch = durationStr.match(/(\d+)M/);
      
      hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
      minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
    }
    // الحالة 2: تنسيق "2h 30m"
    else if (durationStr.includes('h') || durationStr.includes('m')) {
      const hourMatch = durationStr.match(/(\d+)\s*h/);
      const minuteMatch = durationStr.match(/(\d+)\s*m/);
      
      hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
      minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
    }
    // الحالة 3: تنسيق "2:30"
    else if (durationStr.includes(':')) {
      const parts = durationStr.split(':');
      if (parts.length >= 2) {
        hours = parseInt(parts[0], 10) || 0;
        minutes = parseInt(parts[1], 10) || 0;
      }
    }
    // الحالة 4: عدد عشري من الساعات
    else if (!isNaN(parseFloat(durationStr))) {
      const decimalHours = parseFloat(durationStr);
      hours = Math.floor(decimalHours);
      minutes = Math.round((decimalHours - hours) * 60);
    }
  } catch (error) {
    console.error('Error parsing duration:', durationStr, error);
    // قيم افتراضية في حالة الخطأ
    hours = 0;
    minutes = 0;
  }
  
  const totalHours = hours + (minutes / 60);
  const formatted = `${hours}h ${minutes}m`;
  
  return { hours, minutes, totalHours, formatted };
};

export const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '--:--';
  
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return '--:--';
  }
};

export const formatDate = (dateTimeStr) => {
  if (!dateTimeStr) return '---';
  
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  } catch (error) {
    return '---';
  }
};