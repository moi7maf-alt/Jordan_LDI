import { HealthCenterInfo2024, GeneralPractitionerRate2024, BedRate2024, MoHWorkforce2024, CancerData2022, MaternalChildHealthData } from '../types';

// Source: جدول 4-1
export const HEALTH_CENTERS_2024: HealthCenterInfo2024[] = [
  { name_ar: 'عمان', comprehensive: 27, primary: 62, secondary: 14, maternity_childhood: 81, chest_diseases: 5, expatriate_health: 74 },
  { name_ar: 'مأدبا', comprehensive: 9, primary: 10, secondary: 6, maternity_childhood: 19, chest_diseases: 1, expatriate_health: 19 },
  { name_ar: 'الزرقاء', comprehensive: 10, primary: 25, secondary: 5, maternity_childhood: 32, chest_diseases: 1, expatriate_health: 31 },
  { name_ar: 'البلقاء', comprehensive: 11, primary: 38, secondary: 11, maternity_childhood: 50, chest_diseases: 2, expatriate_health: 45 },
  { name_ar: 'إربد', comprehensive: 18, primary: 82, secondary: 19, maternity_childhood: 103, chest_diseases: 1, expatriate_health: 93 },
  { name_ar: 'عجلون', comprehensive: 6, primary: 15, secondary: 10, maternity_childhood: 24, chest_diseases: 1, expatriate_health: 25 },
  { name_ar: 'جرش', comprehensive: 4, primary: 16, secondary: 7, maternity_childhood: 18, chest_diseases: 1, expatriate_health: 21 },
  { name_ar: 'المفرق', comprehensive: 22, primary: 32, secondary: 31, maternity_childhood: 60, chest_diseases: 1, expatriate_health: 47 },
  { name_ar: 'الكرك', comprehensive: 10, primary: 36, secondary: 9, maternity_childhood: 42, chest_diseases: 1, expatriate_health: 41 },
  { name_ar: 'الطفيلة', comprehensive: 6, primary: 12, secondary: 2, maternity_childhood: 17, chest_diseases: 1, expatriate_health: 16 },
  { name_ar: 'معان', comprehensive: 7, primary: 17, secondary: 14, maternity_childhood: 24, chest_diseases: 1, expatriate_health: 21 },
  { name_ar: 'العقبة', comprehensive: 4, primary: 9, secondary: 9, maternity_childhood: 18, chest_diseases: 1, expatriate_health: 14 },
  { name_ar: 'المجموع', comprehensive: 134, primary: 354, secondary: 137, maternity_childhood: 488, chest_diseases: 17, expatriate_health: 447 },
];

// Source: جدول 8-1
export const GENERAL_PRACTITIONER_RATE_2024: GeneralPractitionerRate2024[] = [
  { name_ar: 'عمان', population: 4920100, total_treatments: 3018131, rate_per_citizen: 0.6 },
  { name_ar: 'إربد', population: 2173200, total_treatments: 2580338, rate_per_citizen: 1.2 },
  { name_ar: 'الزرقاء', population: 1675700, total_treatments: 1691200, rate_per_citizen: 1.0 },
  { name_ar: 'البلقاء', population: 603700, total_treatments: 741666, rate_per_citizen: 1.2 },
  { name_ar: 'المفرق', population: 675200, total_treatments: 794537, rate_per_citizen: 1.2 },
  { name_ar: 'الكرك', population: 388700, total_treatments: 532265, rate_per_citizen: 1.4 },
  { name_ar: 'جرش', population: 291000, total_treatments: 586681, rate_per_citizen: 2.0 },
  { name_ar: 'مأدبا', population: 232300, total_treatments: 537571, rate_per_citizen: 2.3 },
  { name_ar: 'عجلون', population: 216200, total_treatments: 325593, rate_per_citizen: 1.5 },
  { name_ar: 'العقبة', population: 245200, total_treatments: 275113, rate_per_citizen: 1.1 },
  { name_ar: 'معان', population: 194500, total_treatments: 188909, rate_per_citizen: 1.0 },
  { name_ar: 'الطفيلة', population: 118200, total_treatments: 191696, rate_per_citizen: 1.6 },
  { name_ar: 'المجموع', population: 11734000, total_treatments: 11463700, rate_per_citizen: 1.0 },
];

// Source: جدول 13-2
export const BED_RATE_2024: BedRate2024[] = [
  { name_ar: 'عمان', population: 4920100, total_beds: 8817, rate_per_10000: 18 },
  { name_ar: 'إربد', population: 2173200, total_beds: 2459, rate_per_10000: 11 },
  { name_ar: 'الزرقاء', population: 1675700, total_beds: 1211, rate_per_10000: 7 },
  { name_ar: 'البلقاء', population: 603700, total_beds: 1071, rate_per_10000: 18 },
  { name_ar: 'المفرق', population: 675200, total_beds: 579, rate_per_10000: 9 },
  { name_ar: 'الكرك', population: 388700, total_beds: 521, rate_per_10000: 13 },
  { name_ar: 'جرش', population: 291000, total_beds: 167, rate_per_10000: 6 },
  { name_ar: 'مأدبا', population: 232300, total_beds: 191, rate_per_10000: 8 },
  { name_ar: 'عجلون', population: 216200, total_beds: 433, rate_per_10000: 20 },
  { name_ar: 'العقبة', population: 245200, total_beds: 325, rate_per_10000: 13 },
  { name_ar: 'معان', population: 194500, total_beds: 232, rate_per_10000: 12 },
  { name_ar: 'الطفيلة', population: 118200, total_beds: 310, rate_per_10000: 26 },
  { name_ar: 'المجموع', population: 11734000, total_beds: 16316, rate_per_10000: 14 },
];

// Source: جدول 13-6
export const MOH_WORKFORCE_2024: MoHWorkforce2024[] = [
    { name_ar: 'عمان', specialist_md: 837, gp: 1260, dentist: 388, pharmacist: 286, nurse_associate: 2385, nurse_midwife: 94, nurse_technical: 294, total: 6520 },
    { name_ar: 'البلقاء', specialist_md: 62, gp: 100, dentist: 41, pharmacist: 89, nurse_associate: 660, nurse_midwife: 44, nurse_technical: 94, total: 1856 },
    { name_ar: 'مأدبا', specialist_md: 62, gp: 69, dentist: 22, pharmacist: 69, nurse_associate: 212, nurse_midwife: 2, nurse_technical: 130, total: 862 },
    { name_ar: 'الزرقاء', specialist_md: 176, gp: 342, dentist: 99, pharmacist: 129, nurse_associate: 907, nurse_midwife: 84, nurse_technical: 199, total: 2394 },
    { name_ar: 'إربد', specialist_md: 195, gp: 317, dentist: 111, pharmacist: 185, nurse_associate: 1338, nurse_midwife: 265, nurse_technical: 418, total: 3911 },
    { name_ar: 'المفرق', specialist_md: 63, gp: 134, dentist: 41, pharmacist: 49, nurse_associate: 240, nurse_midwife: 61, nurse_technical: 76, total: 675 },
    { name_ar: 'جرش', specialist_md: 59, gp: 134, dentist: 63, pharmacist: 115, nurse_associate: 135, nurse_midwife: 85, nurse_technical: 55, total: 1533 },
    { name_ar: 'عجلون', specialist_md: 52, gp: 108, dentist: 30, pharmacist: 65, nurse_associate: 553, nurse_midwife: 121, nurse_technical: 171, total: 1719 },
    { name_ar: 'الكرك', specialist_md: 42, gp: 52, dentist: 48, pharmacist: 62, nurse_associate: 403, nurse_midwife: 158, nurse_technical: 121, total: 1098 },
    { name_ar: 'الطفيلة', specialist_md: 2, gp: 11, dentist: 11, pharmacist: 31, nurse_associate: 42, nurse_midwife: 35, nurse_technical: 9, total: 420 },
    { name_ar: 'معان', specialist_md: 50, gp: 106, dentist: 63, pharmacist: 48, nurse_associate: 153, nurse_midwife: 72, nurse_technical: 48, total: 1017 },
    { name_ar: 'العقبة', specialist_md: 1, gp: 3, dentist: 12, pharmacist: 42, nurse_associate: 127, nurse_midwife: 15, nurse_technical: 37, total: 248 },
    { name_ar: 'المجموع', specialist_md: 1956, gp: 3291, dentist: 1003, pharmacist: 1342, nurse_associate: 8042, nurse_midwife: 1016, nurse_technical: 1637, total: 22332 },
];

// Source: جدول 5-4
export const CANCER_CASES_2022: CancerData2022[] = [
    { name_ar: 'عمان', male: 2335, female: 2839, total: 5174 },
    { name_ar: 'مأدبا', male: 42, female: 44, total: 86 },
    { name_ar: 'الزرقاء', male: 205, female: 276, total: 481 },
    { name_ar: 'البلقاء', male: 113, female: 138, total: 251 },
    { name_ar: 'إربد', male: 149, female: 167, total: 316 },
    { name_ar: 'جرش', male: 20, female: 26, total: 46 },
    { name_ar: 'عجلون', male: 26, female: 27, total: 53 },
    { name_ar: 'المفرق', male: 17, female: 26, total: 43 },
    { name_ar: 'الكرك', male: 8, female: 11, total: 19 },
    { name_ar: 'الطفيلة', male: 21, female: 38, total: 59 },
    { name_ar: 'معان', male: 15, female: 26, total: 41 },
    { name_ar: 'العقبة', male: 23, female: 26, total: 49 },
];

// Source: Excel sheet '...المؤشر' for 2023
export const MATERNAL_CHILD_HEALTH_DATA_2023: MaternalChildHealthData[] = [
    { name_ar: 'عمان', year: 2023, infant_mortality_rate: 19.0, under_five_mortality_rate: 24.0, anc_coverage_four_visits: 60.1, births_in_health_facilities: 100.0, violence_against_children_rate: 2.4, adolescent_fertility_rate: 11.0 },
    { name_ar: 'البلقاء', year: 2023, infant_mortality_rate: 21.0, under_five_mortality_rate: 24.0, anc_coverage_four_visits: 62.6, births_in_health_facilities: 100.0, violence_against_children_rate: 2.0, adolescent_fertility_rate: 14.0 },
    { name_ar: 'الزرقاء', year: 2023, infant_mortality_rate: 15.0, under_five_mortality_rate: 17.0, anc_coverage_four_visits: 63.7, births_in_health_facilities: 99.3, violence_against_children_rate: 3.0, adolescent_fertility_rate: 27.0 },
    { name_ar: 'مأدبا', year: 2023, infant_mortality_rate: 14.0, under_five_mortality_rate: 11.0, anc_coverage_four_visits: 68.7, births_in_health_facilities: 100.0, violence_against_children_rate: 2.2, adolescent_fertility_rate: 9.0 },
    { name_ar: 'إربد', year: 2023, infant_mortality_rate: 10.0, under_five_mortality_rate: 13.0, anc_coverage_four_visits: 61.2, births_in_health_facilities: 100.0, violence_against_children_rate: 2.9, adolescent_fertility_rate: 16.0 },
    { name_ar: 'المفرق', year: 2023, infant_mortality_rate: 4.0, under_five_mortality_rate: 5.0, anc_coverage_four_visits: 38.3, births_in_health_facilities: 100.0, violence_against_children_rate: 3.1, adolescent_fertility_rate: 24.0 },
    { name_ar: 'جرش', year: 2023, infant_mortality_rate: 10.0, under_five_mortality_rate: 13.0, anc_coverage_four_visits: 62.5, births_in_health_facilities: 100.0, violence_against_children_rate: 3.0, adolescent_fertility_rate: 20.0 },
    { name_ar: 'عجلون', year: 2023, infant_mortality_rate: 22.0, under_five_mortality_rate: 22.0, anc_coverage_four_visits: 63.7, births_in_health_facilities: 99.6, violence_against_children_rate: 3.1, adolescent_fertility_rate: 13.0 },
    { name_ar: 'الكرك', year: 2023, infant_mortality_rate: 5.0, under_five_mortality_rate: 6.0, anc_coverage_four_visits: 51.4, births_in_health_facilities: 100.0, violence_against_children_rate: 2.3, adolescent_fertility_rate: 10.0 },
    { name_ar: 'الطفيلة', year: 2023, infant_mortality_rate: 9.0, under_five_mortality_rate: 10.0, anc_coverage_four_visits: 63.5, births_in_health_facilities: 100.0, violence_against_children_rate: 2.4, adolescent_fertility_rate: 1.0 },
    { name_ar: 'معان', year: 2023, infant_mortality_rate: 4.0, under_five_mortality_rate: 4.0, anc_coverage_four_visits: 59.6, births_in_health_facilities: 100.0, violence_against_children_rate: 1.9, adolescent_fertility_rate: 5.0 },
    { name_ar: 'العقبة', year: 2023, infant_mortality_rate: 9.0, under_five_mortality_rate: 10.0, anc_coverage_four_visits: 59.6, births_in_health_facilities: 100.0, violence_against_children_rate: 1.9, adolescent_fertility_rate: 7.0 },
    { name_ar: 'المملكة', year: 2023, infant_mortality_rate: 14.0, under_five_mortality_rate: 16.0, anc_coverage_four_visits: 59.6, births_in_health_facilities: 99.9, violence_against_children_rate: 2.6, adolescent_fertility_rate: 18.0 },
];