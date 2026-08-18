export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Convert DD/MM/YYYY or YYYY-MM-DD to standard Date object
export function parseDate(dateStr?: string | null): Date | null {
  if (!dateStr || !dateStr.trim() || dateStr.trim() === "-") return null;
  const str = dateStr.trim();

  // Match DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      return d;
    }
    return null;
  }

  // Match YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      return d;
    }
    return null;
  }

  return null;
}

export function validatePlayerForm(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};
  const currentYear = new Date().getFullYear();

  // 1. Name validation
  const name = (formData.get("name") as string)?.trim() || "";
  if (!name) {
    errors.name = "กรุณากรอกชื่อนักเตะ";
  } else if (name.length < 2) {
    errors.name = "ชื่อนักเตะต้องมีความยาวอย่างน้อย 2 ตัวอักษร";
  }

  // 2. Position validation
  const position = (formData.get("position") as string)?.trim() || "";
  if (!position) {
    errors.position = "กรุณาเลือกตำแหน่งของนักเตะ";
  }

  // 3. La Masia Year validation
  const lamasiaYearStr = (formData.get("lamasia_year") as string)?.trim() || "";
  if (!lamasiaYearStr) {
    errors.lamasia_year = "กรุณาระบุปีที่เข้า La Masia";
  } else {
    const year = parseInt(lamasiaYearStr, 10);
    if (isNaN(year) || year < 1950 || year > currentYear + 1) {
      errors.lamasia_year = `ปีที่เข้าต้องเป็นตัวเลข ค.ศ. ระหว่าง 1950 ถึง ${currentYear + 1}`;
    }
  }

  // 4. Nationality validation
  const nationality = (formData.get("nationality") as string)?.trim() || "";
  if (!nationality) {
    errors.nationality = "กรุณาเลือกสัญชาติของนักเตะ";
  }

  // 5. Date of Birth validation
  const dobStr = (formData.get("date_of_birth") as string)?.trim() || "";
  if (!dobStr) {
    errors.date_of_birth = "กรุณาระบุวันเกิด";
  } else {
    const dob = parseDate(dobStr);
    if (!dob) {
      errors.date_of_birth = "รูปแบบวันที่ไม่ถูกต้อง (กรุณาระบุเป็น วว/ดด/ปปปป เช่น 13/07/2007)";
    } else {
      const birthYear = dob.getFullYear();
      if (birthYear < 1970 || birthYear > currentYear) {
        errors.date_of_birth = `ปีเกิดไม่ถูกต้อง (ต้องอยู่ระหว่าง 1970 ถึง ${currentYear})`;
      }
    }
  }

  // 6. Current Status validation
  const currentStatus = (formData.get("current_status") as string)?.trim() || "";
  if (!currentStatus) {
    errors.current_status = "กรุณาเลือกสถานะปัจจุบันของนักเตะ";
  }

  // 7. Optional Jersey Number validation
  const jerseyStr = (formData.get("jersey_number") as string)?.trim();
  if (jerseyStr) {
    const jersey = parseInt(jerseyStr, 10);
    if (isNaN(jersey) || jersey < 1 || jersey > 99) {
      errors.jersey_number = "หมายเลขเสื้อต้องอยู่ระหว่าง 1 ถึง 99";
    }
  }

  // 8. Optional Height validation
  const heightStr = (formData.get("height") as string)?.trim();
  if (heightStr) {
    const height = parseInt(heightStr, 10);
    if (isNaN(height) || height < 120 || height > 230) {
      errors.height = "ส่วนสูงต้องอยู่ระหว่าง 120 ถึง 230 ซม.";
    }
  }

  // 9. Optional Market Value validation
  const marketValueStr = (formData.get("market_value_m") as string)?.trim();
  if (marketValueStr) {
    const marketValue = parseFloat(marketValueStr);
    if (isNaN(marketValue) || marketValue < 0) {
      errors.market_value_m = "มูลค่าการตลาดต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0";
    }
  }

  // 10. Optional URLs validation
  const imageUrl = (formData.get("image_url") as string)?.trim();
  if (imageUrl && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
    errors.image_url = "URL รูปภาพต้องขึ้นต้นด้วย http:// หรือ https://";
  }

  const actionShotUrl = (formData.get("action_shot_url") as string)?.trim();
  if (actionShotUrl && !actionShotUrl.startsWith("http://") && !actionShotUrl.startsWith("https://")) {
    errors.action_shot_url = "URL รูปแอคชั่นต้องขึ้นต้นด้วย http:// หรือ https://";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePreSeasonForm(formData: FormData): ValidationResult {
  const errors: Record<string, string> = {};

  const season = (formData.get("season") as string)?.trim() || "";
  if (!season) {
    errors.season = "กรุณาระบุฤดูกาล (เช่น 2024/25)";
  }

  const yearStr = (formData.get("year") as string)?.trim() || "";
  if (!yearStr) {
    errors.year = "กรุณาระบุปี ค.ศ.";
  } else {
    const year = parseInt(yearStr, 10);
    if (isNaN(year) || year < 2000 || year > 2050) {
      errors.year = "ปีต้องอยู่ระหว่าง ค.ศ. 2000 ถึง 2050";
    }
  }

  const checkNonNegativeInt = (fieldName: string, label: string) => {
    const valStr = (formData.get(fieldName) as string)?.trim();
    if (valStr) {
      const val = parseInt(valStr, 10);
      if (isNaN(val) || val < 0) {
        errors[fieldName] = `${label} ต้องเป็นตัวเลขจำนวนเต็ม 0 ขึ้นไป`;
      }
    }
  };

  checkNonNegativeInt("appearances", "จำนวนนัดที่ลงเล่น");
  checkNonNegativeInt("minutes_played", "เวลาที่เล่น (นาที)");
  checkNonNegativeInt("goals", "จำนวนประตู");
  checkNonNegativeInt("assists", "จำนวนแอสซิสต์");

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
