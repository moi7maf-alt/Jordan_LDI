
import { WaterSourceData } from '../types';

// Source: جدول 1: نسبة توزيع المساكن حسب المصدر الرئيسي للمياه في المسكن (2017-2018)
export const WATER_SOURCES_DATA: WaterSourceData[] = [
    { name: 'Amman', name_ar: 'عمان', public_network: 96.84, tanker: 2.98, rainwater: 0.02, spring: 0.03, artesian_well: 0.07, mineral_water: 0.0, other: 0.06 },
    { name: 'Balqa', name_ar: 'البلقاء', public_network: 93.85, tanker: 5.73, rainwater: 0.12, spring: 0.07, artesian_well: 0.01, mineral_water: 0.0, other: 0.22 },
    { name: 'Zarqa', name_ar: 'الزرقاء', public_network: 98.80, tanker: 1.06, rainwater: 0.00, spring: 0.00, artesian_well: 0.10, mineral_water: 0.0, other: 0.04 },
    { name: 'Madaba', name_ar: 'مأدبا', public_network: 98.35, tanker: 1.65, rainwater: 0.00, spring: 0.00, artesian_well: 0.00, mineral_water: 0.0, other: 0.00 },
    { name: 'Irbid', name_ar: 'إربد', public_network: 91.94, tanker: 7.56, rainwater: 0.40, spring: 0.01, artesian_well: 0.02, mineral_water: 0.0, other: 0.07 },
    { name: 'Mafraq', name_ar: 'المفرق', public_network: 84.00, tanker: 11.43, rainwater: 0.00, spring: 0.00, artesian_well: 1.12, mineral_water: 0.0, other: 3.44 },
    { name: 'Jarash', name_ar: 'جرش', public_network: 91.58, tanker: 7.30, rainwater: 0.05, spring: 0.68, artesian_well: 0.39, mineral_water: 0.0, other: 0.00 },
    { name: 'Ajloun', name_ar: 'عجلون', public_network: 89.46, tanker: 6.52, rainwater: 3.14, spring: 0.46, artesian_well: 0.33, mineral_water: 0.0, other: 0.09 },
    { name: 'Karak', name_ar: 'الكرك', public_network: 97.93, tanker: 0.70, rainwater: 0.00, spring: 0.00, artesian_well: 0.76, mineral_water: 0.0, other: 0.61 },
    { name: 'Tafilah', name_ar: 'الطفيلة', public_network: 97.52, tanker: 2.48, rainwater: 0.00, spring: 0.00, artesian_well: 0.00, mineral_water: 0.0, other: 0.00 },
    { name: 'Maan', name_ar: 'معان', public_network: 98.18, tanker: 1.71, rainwater: 0.00, spring: 0.00, artesian_well: 0.07, mineral_water: 0.0, other: 0.04 },
    { name: 'Aqaba', name_ar: 'العقبة', public_network: 99.72, tanker: 0.19, rainwater: 0.00, spring: 0.00, artesian_well: 0.04, mineral_water: 0.0, other: 0.05 },
    { name: 'Kingdom', name_ar: 'المملكة', public_network: 95.28, tanker: 4.13, rainwater: 0.15, spring: 0.04, artesian_well: 0.15, mineral_water: 0.0, other: 0.25 },
];
