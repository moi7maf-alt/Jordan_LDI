// types.ts

export interface GovernorateData {
  name: string;
  name_ar: string;
  population: number;
  internet_penetration: number;
  education_index: number;
  [key: string]: any; // Allows for dynamic keys used in charts
}

export interface ChatMessageSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: ChatMessageSource[];
}

export interface Indicator {
  key: keyof GovernorateData;
  name: string;
  unit: string;
  direction: 'lower-is-better' | 'higher-is-better';
}

export interface AgricultureDataPoint {
  year: number;
  fieldCrops: number;
  fruitTrees: number;
}

export interface GovernorateAgricultureData {
  name: string;
  name_ar: string;
  data: AgricultureDataPoint[];
}

export interface PopulationData {
  name: string;
  name_ar: string;
  population: number;
  area: number;
  density: number;
}

export interface WomenDevData {
  name: string;
  name_ar: string;
  refined_economic_participation_rate_f: number;
  unemployment_rate_f: number;
  illiteracy_rate_f: number;
}

export interface EmployedWomenDistData {
  name: string;
  name_ar: string;
  employed_dist_f: number;
  employed_dist_fhh: number;
}

export interface EconomicDevDataPoint {
  year: number;
  loans_count: number;
  employment_opportunities: number;
  financing_volume: number;
}

export interface GovernorateEconomicDevData {
  name: string;
  name_ar: string;
  data: EconomicDevDataPoint[];
}

export interface WaterDataPoint {
  year: number;
  per_capita_supply: number;
}

export interface GovernorateWaterData {
  name: string;
  name_ar: string;
  data: WaterDataPoint[];
}

export interface TrafficAccidentsData {
  name: string;
  name_ar: string;
  total: number;
  collision: number;
  run_over: number;
  rollover: number;
}

export interface EducationDataPoint {
  year: number;
  schools: number;
  rented_schools: number;
  two_shift_schools: number;
  students: number;
  teachers: number;
  student_teacher_ratio: number;
  student_classroom_ratio: number;
}

export interface GovernorateEducationData {
  name: string;
  name_ar: string;
  data: EducationDataPoint[];
}

export interface LivestockDataPoint {
  year: number;
  sheep: number;
  goats: number;
  cows: number;
}

export interface GovernorateLivestockData {
  name: string;
  name_ar: string;
  data: LivestockDataPoint[];
}

export interface IncomeDataPoint {
  average_total_income: number;
  transactions_incomes: number;
  property_incomes: number;
  rentals_incomes: number;
  private_work_incomes: number;
  employment_incomes: number;
}

export interface GovernorateIncomeData {
  name: string;
  name_ar: string;
  data: IncomeDataPoint;
}

export interface UnemploymentDataPoint {
  year: number;
  rate: number;
}

export interface GovernorateUnemploymentData {
  name: string;
  name_ar: string;
  data: UnemploymentDataPoint[];
}

export interface EconomicParticipationDataPoint {
  year: number;
  rate: number;
}

export interface GovernorateEconomicParticipationData {
  name: string;
  name_ar: string;
  data: EconomicParticipationDataPoint[];
}

export interface EconomicEmpowermentDataPoint {
  year: number;
  female_insured: number;
  male_insured: number;
}

export interface GovernorateEconomicEmpowermentData {
  name: string;
  name_ar: string;
  data: EconomicEmpowermentDataPoint[];
}

export interface SolidWasteDataPoint {
  year: number;
  quantity_tons: number;
}

export interface GovernorateSolidWasteData {
  name: string;
  name_ar: string;
  data: SolidWasteDataPoint[];
}

export interface CrimeData2024 {
  region: string;
  total_crimes: number;
  clearance_rate: number;
  felonies: number;
  misdemeanors: number;
  felony_percentage: number;
  homicides: number;
  juvenile_crimes: number;
  foreigner_crimes: number;
  drug_crimes_total: number;
  population: number;
  drug_crime_rate: number;
  drug_trafficking: number;
  drug_possession_use: number;
}

export interface HealthCenterData {
  comprehensive: number;
  primary: number;
  secondary: number;
}

export interface HealthDataPoint2024 {
  total_beds: number;
  moh_beds: number;
  private_beds: number;
  royal_medical_services_beds: number;
  university_beds: number;
  health_centers: HealthCenterData;
}

export interface HealthData2024 {
  name: string;
  name_ar: string;
  data: HealthDataPoint2024;
}

export interface DevelopmentIndicators2024 {
  name: string;
  name_ar: string;
  economic_activity: number;
  infrastructure: number;
  education: number;
  health: number;
  social_status: number;
}

export interface FinalRanking2024 {
  name: string;
  name_ar: string;
  rank: number;
}

export interface WaterSourceData {
    name: string;
    name_ar: string;
    public_network: number;
    tanker: number;
    rainwater: number;
    spring: number;
    artesian_well: number;
    mineral_water: number;
    other: number;
}

export interface WaterShortageData {
    name: string;
    name_ar: string;
    no_shortage: number;
    buy_tankers: number;
    other: number;
    not_applicable: number;
}

export interface SanitationData {
    name: string;
    name_ar: string;
    public_network: number;
    cesspit: number;
    no_sanitation: number;
}

export interface TeacherQualification {
    governorate: string;
    directorate: string;
    phd: number;
    ma: number;
    high_diploma: number;
    ba: number;
    diploma: number;
    gsc: number;
    total: number;
}

export interface EducationRatios {
    name_ar: string;
    moe: number;
    private: number;
    other_gov: number;
    unrwa: number;
    total: number;
}

export interface MoeShare {
    name_ar: string;
    name: string;
    moe: number;
    total: number;
    percentage: number;
}

export interface VocationalEducationYear {
    year: number;
    female: number;
    male: number;
    gender_gap: number;
}

export interface VocationalEducationData {
    name_ar: string;
    agricultural: VocationalEducationYear[];
    industrial: VocationalEducationYear[];
}

export interface HealthCenterInfo2024 {
  name_ar: string;
  comprehensive: number;
  primary: number;
  secondary: number;
  maternity_childhood: number;
  chest_diseases: number;
  expatriate_health: number;
}

export interface GeneralPractitionerRate2024 {
  name_ar: string;
  population: number;
  total_treatments: number;
  rate_per_citizen: number;
}

export interface BedRate2024 {
  name_ar: string;
  population: number;
  total_beds: number;
  rate_per_10000: number;
}

export interface MoHWorkforce2024 {
  name_ar: string;
  specialist_md: number;
  gp: number;
  dentist: number;
  pharmacist: number;
  nurse_associate: number;
  nurse_midwife: number;
  nurse_technical: number;
  total: number;
}

export interface CancerData2022 {
  name_ar: string;
  male: number;
  female: number;
  total: number;
}

export interface MaternalChildHealthData {
  name_ar: string;
  year: number;
  infant_mortality_rate: number;
  under_five_mortality_rate: number;
  anc_coverage_four_visits: number;
  births_in_health_facilities: number;
  adolescent_fertility_rate: number;
  violence_against_children_rate: number;
}
