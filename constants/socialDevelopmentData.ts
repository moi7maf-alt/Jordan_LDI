// Data extracted from National Aid Fund Annual Report 2024 PDF

// From table: "توزيع المستفيدين من برامج التحويلات النقدية 2024 حسب المحافظات" (Page 15)
export const TOTAL_BENEFICIARIES_2024 = [
  { governorate: 'العاصمة', aid_count: 67123, individuals: 318669, monthly_amount: 5895478, percentage: 28 },
  { governorate: 'اربد', aid_count: 53658, individuals: 249413, monthly_amount: 4670502, percentage: 22 },
  { governorate: 'الزرقاء', aid_count: 37364, individuals: 176332, monthly_amount: 3273396, percentage: 16 },
  { governorate: 'البلقاء', aid_count: 21153, individuals: 100447, monthly_amount: 1825294, percentage: 9 },
  { governorate: 'المفرق', aid_count: 17464, individuals: 79767, monthly_amount: 1529951, percentage: 7 },
  { governorate: 'الكرك', aid_count: 10464, individuals: 47793, monthly_amount: 858377, percentage: 4 },
  { governorate: 'مادبا', aid_count: 7322, individuals: 32822, monthly_amount: 624231, percentage: 3 },
  { governorate: 'جرش', aid_count: 6897, individuals: 30957, monthly_amount: 577254, percentage: 3 },
  { governorate: 'عجلون', aid_count: 5265, individuals: 24448, monthly_amount: 427320, percentage: 2 },
  { governorate: 'معان', aid_count: 5115, individuals: 23377, monthly_amount: 420058, percentage: 2 },
  { governorate: 'العقبة', aid_count: 4855, individuals: 22146, monthly_amount: 403089, percentage: 2 },
  { governorate: 'الطفيلة', aid_count: 2497, individuals: 11082, monthly_amount: 202002, percentage: 1 },
];

// From table: "توزيع المستفيدين حسب جنس رب الأسرة..." (Page 16)
export const HOUSEHOLD_HEAD_GENDER_2024 = [
  { governorate: 'معان', female_led_percentage: 39, female_led_count: 1996, male_led_count: 3119 },
  { governorate: 'الكرك', female_led_percentage: 36, female_led_count: 3722, male_led_count: 6742 },
  { governorate: 'جرش', female_led_percentage: 34, female_led_count: 2364, male_led_count: 4533 },
  { governorate: 'العقبة', female_led_percentage: 34, female_led_count: 1662, male_led_count: 3193 },
  { governorate: 'الطفيلة', female_led_percentage: 34, female_led_count: 841, male_led_count: 1656 },
  { governorate: 'المفرق', female_led_percentage: 34, female_led_count: 5857, male_led_count: 11607 },
  { governorate: 'عجلون', female_led_percentage: 33, female_led_count: 1724, male_led_count: 3541 },
  { governorate: 'مادبا', female_led_percentage: 32, female_led_count: 2311, male_led_count: 5011 },
  { governorate: 'البلقاء', female_led_percentage: 28, female_led_count: 5994, male_led_count: 15159 },
  { governorate: 'اربد', female_led_percentage: 27, female_led_count: 14647, male_led_count: 39011 },
  { governorate: 'الزرقاء', female_led_percentage: 27, female_led_count: 10123, male_led_count: 27241 },
  { governorate: 'العاصمة', female_led_percentage: 27, female_led_count: 17843, male_led_count: 49280 },
];

// From table: "توزيع الأفراد حسب الفئات العمرية والجنس" (Page 16)
export const BENEFICIARY_AGE_GENDER_2024 = [
    { age_group: '0-4', male: 31586, female: 30877, total: 62463 },
    { age_group: '5-9', male: 80509, female: 77985, total: 158494 },
    { age_group: '10-14', male: 88025, female: 86231, total: 174256 },
    { age_group: '15-19', male: 78656, female: 78965, total: 157621 },
    { age_group: '20-24', male: 44926, female: 46718, total: 91644 },
    { age_group: '25-29', male: 24365, female: 30989, total: 55354 },
    { age_group: '30-34', male: 24856, female: 36502, total: 61358 },
    { age_group: '35-39', male: 28615, female: 39065, total: 67680 },
    { age_group: '40-44', male: 36327, female: 38909, total: 75236 },
    { age_group: '45-49', male: 34733, female: 30158, total: 64891 },
    { age_group: '50-54', male: 25401, female: 23839, total: 49240 },
    { age_group: '55-59', male: 14175, female: 17234, total: 31409 },
    { age_group: '60-64', male: 8120, female: 12048, total: 20168 },
    { age_group: '65-69', male: 4981, female: 8804, total: 13785 },
    { age_group: '70+', male: 13045, female: 20609, total: 33654 },
];

// From table: "برنامج المعونات الطارئة" (Page 27)
export const EMERGENCY_AID_2024 = [
    { governorate: 'العاصمة', amount: 323630, count: 1664, male_led: 269, female_led: 1395 },
    { governorate: 'اربد', amount: 250990, count: 1278, male_led: 288, female_led: 990 },
    { governorate: 'الزرقاء', amount: 224040, count: 1144, male_led: 228, female_led: 916 },
    { governorate: 'البلقاء', amount: 78305, count: 400, male_led: 83, female_led: 317 },
    { governorate: 'المفرق', amount: 54415, count: 283, male_led: 45, female_led: 238 },
    { governorate: 'الكرك', amount: 48835, count: 251, male_led: 58, female_led: 193 },
    { governorate: 'جرش', amount: 28070, count: 143, male_led: 32, female_led: 111 },
    { governorate: 'عجلون', amount: 25085, count: 126, male_led: 24, female_led: 102 },
    { governorate: 'مادبا', amount: 23470, count: 119, male_led: 27, female_led: 92 },
    { governorate: 'العقبة', amount: 18860, count: 98, male_led: 13, female_led: 85 },
    { governorate: 'معان', amount: 16040, count: 82, male_led: 15, female_led: 67 },
    { governorate: 'الطفيلة', amount: 6675, count: 33, male_led: 8, female_led: 25 },
];

// From table: "برامج التدريب والتشغيل" (Page 33)
export const TRAINING_PROGRAM_2024 = [
    { governorate: 'اربد', total: 364, male: 147, female: 217 },
    { governorate: 'البلقاء', total: 156, male: 141, female: 15 },
    { governorate: 'عمان', total: 173, male: 136, female: 37 },
    { governorate: 'الزرقاء', total: 103, male: 78, female: 25 },
    { governorate: 'معان', total: 90, male: 18, female: 72 },
    { governorate: 'المفرق', total: 52, male: 32, female: 20 },
    { governorate: 'الطفيلة', total: 65, male: 3, female: 62 },
    { governorate: 'الكرك', total: 121, male: 9, female: 112 },
    { governorate: 'العقبة', total: 40, male: 11, female: 29 },
    { governorate: 'عجلون', total: 15, male: 9, female: 6 },
    { governorate: 'جرش', total: 10, male: 6, female: 4 },
    { governorate: 'مادبا', total: 6, male: 2, female: 4 },
];

// From table: "برنامج التشغيل" (Page 35)
export const EMPLOYMENT_PROGRAM_2024 = [
    { governorate: 'المفرق', total: 621, male: 371, female: 250 },
    { governorate: 'اربد', total: 506, male: 319, female: 186 },
    { governorate: 'جرش', total: 139, male: 102, female: 37 },
    { governorate: 'الكرك', total: 98, male: 14, female: 84 },
    { governorate: 'البلقاء', total: 84, male: 45, female: 39 },
    { governorate: 'عجلون', total: 77, male: 50, female: 27 },
    { governorate: 'الزرقاء', total: 56, male: 44, female: 12 },
    { governorate: 'العقبة', total: 47, male: 24, female: 23 },
    { governorate: 'عمان', total: 62, male: 45, female: 17 },
    { governorate: 'مادبا', total: 24, male: 14, female: 10 },
    { governorate: 'الطفيلة', total: 22, male: 20, female: 2 },
    { governorate: 'معان', total: 4, male: 3, female: 1 },
];
