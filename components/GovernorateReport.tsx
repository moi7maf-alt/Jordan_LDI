
import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { GovernorateData } from '../types';
import { generateGovernorateReport, GovernorateReportResponse } from '../services/geminiService';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, IStylesOptions, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import saveAs from 'file-saver';
import Card from './ui/Card';
import AllocationPriorityChart from './charts/AllocationPriorityChart';
import { POPULATION_DATA_2025 } from '../constants/populationData';
import { UNEMPLOYMENT_DATA } from '../constants/unemploymentData';
import { INCOME_DATA } from '../constants/incomeData';
import { LIVESTOCK_DATA } from '../constants/livestockData';
import { ECONOMIC_DEV_DATA } from '../constants/economicDevelopmentData';
import UnemploymentTrendChart from './charts/UnemploymentTrendChart';
import LivestockTrendChart from './charts/LivestockTrendChart';
import EconomicDevBarChart from './charts/EconomicDevBarChart';
import { EDUCATION_DATA } from '../constants/educationData';
import { SANITATION_DATA } from '../constants/sanitationData';
import { WATER_DATA } from '../constants/waterData';
import { TRAFFIC_ACCIDENTS_2024 } from '../constants/trafficAccidentsData';
import { NATIONAL_AVERAGES_2025 } from '../constants';
import { STUDENT_TEACHER_RATIOS, STUDENT_CLASSROOM_RATIOS } from '../constants/educationRatiosData';
import { TEACHER_QUALIFICATION_DATA } from '../constants/teacherQualificationData';
import { MOE_SCHOOLS_SHARE } from '../constants/moeShareData';
import { VOCATIONAL_EDUCATION_DATA } from '../constants/vocationalEducationData';
import { BED_RATE_2024, HEALTH_CENTERS_2024, GENERAL_PRACTITIONER_RATE_2024, MOH_WORKFORCE_2024, CANCER_CASES_2022, MATERNAL_CHILD_HEALTH_DATA_2023 } from '../constants/healthData';
import { HEALTH_RATES_DATA_2024 } from '../constants/healthIndicatorsData';


interface GovernorateReportProps {
  governorate: GovernorateData;
}

const ReportSkeleton: React.FC = () => (
    <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mt-10"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-40 bg-gray-200 rounded-xl mt-6"></div>
    </div>
);

const KPICard: React.FC<{ title: string; value: string; icon: ReactNode; color: string; note?: string; }> = ({ title, value, icon, color, note }) => (
    <Card className="card-container text-center break-inside-avoid">
        <div className={`mx-auto mb-3 w-12 h-12 flex items-center justify-center rounded-full ${color} icon-wrapper`}>
            {icon}
        </div>
        <p className="text-2xl md:text-3xl font-bold text-gray-900 kpi-value">{value}</p>
        <p className="text-base text-gray-700 kpi-title">{title}</p>
        {note && <p className="mt-2 text-xs text-gray-500 italic leading-tight">{note}</p>}
    </Card>
);

const PopulationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const Target = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Activity = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const TrendingUp = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const DensityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6.5-11.5L18 6.5M4 12H2m13.5 6.5L18 17.5M12 20v1M4 12a8 8 0 018-8m0 16a8 8 0 01-8-8z" /></svg>;
const UnemploymentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 21h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2v6z" /></svg>;
const IncomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const GovernorateReport: React.FC<GovernorateReportProps> = ({ governorate }) => {
    const [reportContent, setReportContent] = useState<GovernorateReportResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const governorateMetrics = useMemo(() => {
        if (!governorate) return null;

        const populationData = POPULATION_DATA_2025.find(g => g.name === governorate.name);
        const unemploymentHistory = UNEMPLOYMENT_DATA.find(u => u.name === governorate.name)?.data;
        const unemployment2024 = unemploymentHistory?.find(u => u.year === 2024) || { rate: 0, note: '' };
        const incomeData = INCOME_DATA.find(i => i.name === governorate.name)?.data;

        return {
            population: populationData?.population.toLocaleString() || 'N/A',
            density: populationData?.density.toFixed(1) || 'N/A',
            unemployment: unemployment2024.rate > 0 ? `${unemployment2024.rate.toFixed(1)}%` : 'N/A',
            unemploymentNote: unemployment2024.note || '',
            income: incomeData?.average_total_income.toLocaleString('ar-JO', { style: 'currency', currency: 'JOD', minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 'N/A',
        };
    }, [governorate]);

    const livestockData = useMemo(() => LIVESTOCK_DATA.find(g => g.name === governorate.name)?.data, [governorate]);
    const unemploymentData = useMemo(() => UNEMPLOYMENT_DATA.find(u => u.name === governorate.name)?.data, [governorate]);
    const economicDevData = useMemo(() => ECONOMIC_DEV_DATA.find(e => e.name === governorate.name)?.data, [governorate]);
    const reportTitle = `تقرير تحليلي استراتيجي لتوجيه التنمية المستدامة في محافظة ${governorate.name_ar}`;

    useEffect(() => {
        const fetchReport = async () => {
            setIsLoading(true);
            setError(null);
            setReportContent(null);
            try {
                // Collect all relevant data for the prompt to ensure factual accuracy
                const populationData = POPULATION_DATA_2025.find(g => g.name === governorate.name);

                // --- ECONOMY ---
                const unemploymentHistory = UNEMPLOYMENT_DATA.find(u => u.name === governorate.name)?.data;
                const unemployment2024 = unemploymentHistory?.find(u => u.year === 2024) || { year: 2024, rate: 0, note: '' };
                const incomeData = INCOME_DATA.find(i => i.name === governorate.name)?.data;

                // --- EDUCATION ---
                const educationHistory = EDUCATION_DATA.find(e => e.name === governorate.name)?.data;
                const latestEducation = educationHistory ? educationHistory[educationHistory.length - 1] : null;
                const studentTeacherRatio = STUDENT_TEACHER_RATIOS.find(r => r.name_ar === governorate.name_ar)?.moe;
                const studentClassroomRatio = STUDENT_CLASSROOM_RATIOS.find(r => r.name_ar === governorate.name_ar)?.moe;
                const teacherQualifications = TEACHER_QUALIFICATION_DATA.filter(t => t.governorate === governorate.name_ar).reduce((acc, curr) => {
                    acc.phd += curr.phd;
                    acc.ma += curr.ma;
                    acc.total += curr.total;
                    return acc;
                }, { phd: 0, ma: 0, total: 0 });
                const teacherPostGraduatePercentage = teacherQualifications.total > 0 ? ((teacherQualifications.phd + teacherQualifications.ma) / teacherQualifications.total) * 100 : 0;
                const moeSchoolPercentage = MOE_SCHOOLS_SHARE.find(s => s.name === governorate.name)?.percentage;
                const vocationalData = VOCATIONAL_EDUCATION_DATA.find(v => v.name_ar === governorate.name_ar);
                const latestVocationalIndustrial = vocationalData?.industrial.find(d => d.year === 2024);
                const latestVocationalAgricultural = vocationalData?.agricultural.find(d => d.year === 2024);
                const industrialFemaleRatio = latestVocationalIndustrial && (latestVocationalIndustrial.male + latestVocationalIndustrial.female > 0) ? (latestVocationalIndustrial.female / (latestVocationalIndustrial.male + latestVocationalIndustrial.female)) * 100 : 0;
                const agriculturalFemaleRatio = latestVocationalAgricultural && (latestVocationalAgricultural.male + latestVocationalAgricultural.female > 0) ? (latestVocationalAgricultural.female / (latestVocationalAgricultural.male + latestVocationalAgricultural.female)) * 100 : 0;

                // --- HEALTH (New Data) ---
                const bedData = BED_RATE_2024.find(h => h.name_ar === governorate.name_ar);
                const healthCenterData = HEALTH_CENTERS_2024.find(h => h.name_ar === governorate.name_ar);
                const gpRateData = GENERAL_PRACTITIONER_RATE_2024.find(h => h.name_ar === governorate.name_ar);
                const workforceData = MOH_WORKFORCE_2024.find(h => h.name_ar === governorate.name_ar);
                const healthRatesData = HEALTH_RATES_DATA_2024.find(h => h.name_ar === governorate.name_ar);
                const cancerData = CANCER_CASES_2022.find(h => h.name_ar === governorate.name_ar);
                const mchData = MATERNAL_CHILD_HEALTH_DATA_2023.find(h => h.name_ar === governorate.name_ar);
                
                const totalMoHDoctors = workforceData ? workforceData.specialist_md + workforceData.gp : undefined;
                const totalMoHNurses = workforceData ? workforceData.nurse_associate + workforceData.nurse_midwife + workforceData.nurse_technical : undefined;
                const doctorsPer10k = (populationData && totalMoHDoctors) ? (totalMoHDoctors / populationData.population) * 10000 : undefined;
                const nursesPer10k = (populationData && totalMoHNurses) ? (totalMoHNurses / populationData.population) * 10000 : undefined;
                const cancerRatePer100k = (populationData && cancerData) ? (cancerData.total / populationData.population) * 100000 : undefined;


                // --- INFRASTRUCTURE & SECURITY ---
                const waterHistory = WATER_DATA.find(w => w.name === governorate.name)?.data;
                const latestWater = waterHistory ? waterHistory[waterHistory.length - 1] : null;
                const sanitationData = SANITATION_DATA.find(s => s.name === governorate.name);
                const trafficData = TRAFFIC_ACCIDENTS_2024.find(t => t.name === governorate.name);

                // --- ADDITIONAL DATA ---
                const latestLivestock = livestockData ? livestockData[livestockData.length - 1] : null;
                const latestEconomicDev = economicDevData ? economicDevData[economicDevData.length - 1] : null;

                const reportData = {
                    governorateName: governorate.name_ar,
                    population: populationData?.population,
                    density: populationData?.density,
                    // Economy
                    unemploymentRate: unemployment2024.rate,
                    unemploymentNote: unemployment2024.note,
                    nationalUnemploymentRate: UNEMPLOYMENT_DATA.find(u => u.name === 'Kingdom')?.data.find(d => d.year === 2024)?.rate || 21.4,
                    nationalStudentTeacherRatio: 28.5,
                    nationalBedsPer10k: BED_RATE_2024.find(h => h.name_ar === 'المجموع')?.rate_per_10000 || 14.0,
                    nationalWaterPerCapita: 61.2,
                    nationalSanitationCoverage: SANITATION_DATA.find(s => s.name === 'Kingdom')?.public_network || 63.0,
                    avgIncome: incomeData?.average_total_income,
                    nationalAvgIncome: INCOME_DATA.find(i => i.name === 'Kingdom')?.data.average_total_income || 2330.4,
                    nationalGPRate: 1.2,
                    nationalNurseRate: 110.0,
                    nationalInfantMortality: MATERNAL_CHILD_HEALTH_DATA_2023.find(m => m.name_ar === 'المملكة')?.infant_mortality_rate || 14.0,
                    // Education
                    studentTeacherRatio: studentTeacherRatio,
                    studentClassroomRatio: studentClassroomRatio,
                    rentedSchoolsPercentage: latestEducation ? (latestEducation.rented_schools / latestEducation.schools) * 100 : undefined,
                    teacherPostGraduatePercentage: teacherPostGraduatePercentage,
                    moeSchoolPercentage: moeSchoolPercentage,
                    vocationalIndustrialStudents: latestVocationalIndustrial ? latestVocationalIndustrial.male + latestVocationalIndustrial.female : undefined,
                    vocationalIndustrialFemaleRatio: industrialFemaleRatio,
                    vocationalAgriculturalStudents: latestVocationalAgricultural ? latestVocationalAgricultural.male + latestVocationalAgricultural.female : undefined,
                    vocationalAgriculturalFemaleRatio: agriculturalFemaleRatio,
                    // Health
                    totalBeds: bedData?.total_beds,
                    bedsPer10k: bedData?.rate_per_10000,
                    totalHealthCenters: healthCenterData ? healthCenterData.comprehensive + healthCenterData.primary + healthCenterData.secondary : undefined,
                    comprehensiveHealthCenters: healthCenterData?.comprehensive,
                    primaryHealthCenters: healthCenterData?.primary,
                    gpTreatmentRate: gpRateData?.rate_per_citizen,
                    totalMoHDoctors: totalMoHDoctors,
                    totalMoHNurses: totalMoHNurses,
                    doctorsPer10k: doctorsPer10k,
                    nursesPer10k: nursesPer10k,
                    cancerRatePer100k: cancerRatePer100k,
                    infantMortality: mchData?.infant_mortality_rate,
                    // Health Rates
                    specialistRate: healthRatesData?.specialist_rate,
                    gpRate: healthRatesData?.gp_rate,
                    dentistRate: healthRatesData?.dentist_rate,
                    pharmacistRate: healthRatesData?.pharmacist_rate,
                    nurseRate: healthRatesData?.nurse_rate,
                    // Additional Data
                    livestock: latestLivestock ? {
                        sheep: latestLivestock.sheep,
                        goats: latestLivestock.goats,
                        cattle: latestLivestock.cows, // Mapping 'cows' to 'cattle'
                    } : undefined,
                    economicDev: latestEconomicDev ? {
                        total_projects: latestEconomicDev.loans_count, // Mapping 'loans_count' to 'total_projects'
                        total_investment: latestEconomicDev.financing_volume, // Mapping 'financing_volume' to 'total_investment'
                        job_opportunities: latestEconomicDev.employment_opportunities // Mapping 'employment_opportunities' to 'job_opportunities'
                    } : undefined,
                    // Infra & Security
                    waterPerCapita: latestWater?.per_capita_supply,
                    sanitationCoverage: sanitationData?.public_network,
                    trafficAccidents: trafficData?.total,
                };

                const content = await generateGovernorateReport(reportData);
                setReportContent(content);
            } catch (err: any) {
                setError(err.message || `Failed to generate report for ${governorate.name_ar}.`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReport();
    }, [governorate]);

    const parseReportToElements = (text: string) => {
        return text.split('\n').map((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            
            // Handle Headings (###)
            if (trimmed.startsWith('###')) {
                return <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3 break-after-avoid">{trimmed.replace(/###\s?/, '').replace(/\*\*/g, '')}</h3>;
            }
            
            // Handle Subheadings completely bolded lines (**Title**)
            if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 120) {
                 return <h4 key={index} className="text-lg font-semibold text-gray-800 mt-4 mb-2 break-after-avoid">{trimmed.replace(/\*\*/g, '')}</h4>;
            }
            
            // Handle List Items (* Item)
            if (trimmed.startsWith('* ')) {
                 // Replace inline bolding
                 const content = trimmed.substring(2).split(/(\*\*.*?\*\*)/g).map((part, i) => 
                    part.startsWith('**') && part.endsWith('**') 
                        ? <strong key={i}>{part.slice(2, -2)}</strong> 
                        : part
                 );
                 return <li key={index} className="list-disc list-inside text-gray-700 mb-1 break-inside-avoid">{content}</li>;
            }

            // Handle Paragraphs with inline bolding
            const content = trimmed.split(/(\*\*.*?\*\*)/g).map((part, i) => 
                part.startsWith('**') && part.endsWith('**') 
                    ? <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong> 
                    : part
            );
            
            return <p key={index} className="text-gray-700 mb-2 leading-relaxed break-inside-avoid text-justify">{content}</p>;
        }).filter(Boolean);
    };

    const handleExportDocx = async () => {
        if (!reportContent) return;
        setIsExportingDocx(true);

        const docStyles: IStylesOptions = {
            default: {
                document: {
                    run: { font: "Arial", size: 26, rightToLeft: true }, // 13pt
                },
            },
            paragraphStyles: [
                { id: "Normal", name: "Normal", basedOn: "Normal", next: "Normal", run: { size: 26 }, paragraph: { spacing: { after: 120, line: 360 } } }, // 13pt, 1.5 line spacing
                { id: "h1", name: "h1", basedOn: "Normal", next: "Normal", run: { size: 40, bold: true, color: "1E3A8A" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 360, after: 240 } } }, // 20pt
                { id: "h2", name: "h2", basedOn: "Normal", next: "Normal", run: { size: 32, bold: true, color: "1E40AF" }, paragraph: { spacing: { before: 240, after: 120 } } }, // 16pt
                { id: "h3", name: "h3", basedOn: "Normal", next: "Normal", run: { size: 28, bold: true, color: "1D4ED8" }, paragraph: { spacing: { before: 180, after: 100 } } }, // 14pt
            ],
        };
        
        const paragraphs: (Paragraph | Table)[] = [];
        
        // Title
        paragraphs.push(new Paragraph({ text: reportTitle, style: 'h1', bidirectional: true, alignment: AlignmentType.CENTER }));

        // Main Report Content
        reportContent.report.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;
            if (trimmedLine.startsWith('###')) {
                paragraphs.push(new Paragraph({ text: trimmedLine.replace(/###\s?/, '').replace(/\*\*/g, ''), style: "h2", bidirectional: true, alignment: AlignmentType.RIGHT }));
            } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                paragraphs.push(new Paragraph({ text: trimmedLine.replace(/\*\*/g, ''), style: "h3", bidirectional: true, alignment: AlignmentType.RIGHT }));
            } else if (trimmedLine.startsWith('* ')) {
                paragraphs.push(new Paragraph({ text: trimmedLine.substring(2).replace(/\*\*/g, ''), bullet: { level: 0 }, style: "Normal", bidirectional: true, alignment: AlignmentType.RIGHT }));
            } else {
                paragraphs.push(new Paragraph({ text: trimmedLine.replace(/\*\*/g, ''), style: "Normal", bidirectional: true, alignment: AlignmentType.RIGHT }));
            }
        });

        // SWOT Section
        paragraphs.push(new Paragraph({ text: "التحليل الاستراتيجي (SWOT)", style: "h2", bidirectional: true, alignment: AlignmentType.RIGHT }));
        
        const swotTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "نقاط القوة", bold: true })], bidirectional: true, alignment: AlignmentType.CENTER })], shading: { fill: "dcfce7" } }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "نقاط الضعف", bold: true })], bidirectional: true, alignment: AlignmentType.CENTER })], shading: { fill: "fee2e2" } }),
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: reportContent.swot.strengths.map(s => new Paragraph({ text: s, bullet: { level: 0 }, bidirectional: true, alignment: AlignmentType.RIGHT })) }),
                        new TableCell({ children: reportContent.swot.weaknesses.map(w => new Paragraph({ text: w, bullet: { level: 0 }, bidirectional: true, alignment: AlignmentType.RIGHT })) }),
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "الفرص", bold: true })], bidirectional: true, alignment: AlignmentType.CENTER })], shading: { fill: "dbeafe" } }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "التهديدات", bold: true })], bidirectional: true, alignment: AlignmentType.CENTER })], shading: { fill: "fef3c7" } }),
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: reportContent.swot.opportunities.map(o => new Paragraph({ text: o, bullet: { level: 0 }, bidirectional: true, alignment: AlignmentType.RIGHT })) }),
                        new TableCell({ children: reportContent.swot.threats.map(t => new Paragraph({ text: t, bullet: { level: 0 }, bidirectional: true, alignment: AlignmentType.RIGHT })) }),
                    ]
                })
            ]
        });
        paragraphs.push(swotTable);

            {/* Strategic Plan */}
        paragraphs.push(new Paragraph({ text: "الخطة الاستراتيجية المقترحة (2026-2029)", style: "h2", bidirectional: true, alignment: AlignmentType.RIGHT }));
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: "الرؤية: ", bold: true }), new TextRun(reportContent.strategicPlan.vision)], bidirectional: true, alignment: AlignmentType.RIGHT }));
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: "الرسالة: ", bold: true }), new TextRun(reportContent.strategicPlan.mission)], bidirectional: true, alignment: AlignmentType.RIGHT }));
        
        reportContent.strategicPlan.goals.forEach((goal, i) => {
            paragraphs.push(new Paragraph({ text: `الهدف الاستراتيجي ${i+1}: ${goal.goal}`, style: "h3", bidirectional: true, alignment: AlignmentType.RIGHT }));
            goal.projects.forEach(project => {
                paragraphs.push(new Paragraph({ 
                    children: [
                        new TextRun({ text: project.name, bold: true }), 
                        new TextRun({ text: `: ${project.justification}`, size: 22 }),
                        new TextRun({ text: ` | مؤشر الأداء: ${project.kpi}`, size: 20, italics: true, color: "4F46E5" })
                    ], 
                    bullet: { level: 0 }, 
                    style: "Normal", 
                    bidirectional: true, 
                    alignment: AlignmentType.RIGHT 
                }));
            });
        });

        const doc = new Document({
            styles: docStyles,
            sections: [{
                properties: { page: { margin: { top: 1134, right: 850, bottom: 1134, left: 850 } } },
                children: paragraphs,
            }],
        });

        try {
            const blob = await Packer.toBlob(doc);
            saveAs(blob, `تقرير-${governorate.name_ar}.docx`);
        } catch (error) {
            console.error("Error creating DOCX file:", error);
        } finally {
            setIsExportingDocx(false);
        }
    };
    
    const handleNativePrint = () => {
        const reportElement = document.getElementById('report-content');
        
        if (!reportElement) return;

        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) return;

        // Strict CSS to hide ALL visual elements (charts, KPIs, icons) and keep only text
        const headContent = `
            <head>
                <title>تقرير ${governorate.name_ar} - ${new Date().toLocaleDateString('ar-JO')}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                    
                    body {
                        font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        direction: rtl;
                        padding: 40px;
                        background-color: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-size: 12pt;
                    }

                    /* CRITICAL: Hide all visual/KPI sections */
                    .kpi-section, 
                    .kpi-card-visual, 
                    .icon-wrapper, 
                    .icon-container, 
                    svg, 
                    .no-print,
                    .card-container { 
                        display: none !important; 
                    }

                    /* Allow specific text content to show */
                    #ai-report-text-container, 
                    #ai-report-text-container *,
                    .swot-section,
                    .strategic-plan-section {
                        display: block !important;
                    }

                    .swot-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 10px !important;
                        margin-top: 20px !important;
                    }

                    .swot-item {
                        padding: 10px !important;
                        border: 1px solid #eee !important;
                        border-radius: 8px !important;
                    }

                    /* Typography for Document Feel */
                    h1 {
                        font-size: 24pt !important;
                        font-weight: bold !important;
                        text-align: center !important;
                        border-bottom: 2px solid #000 !important;
                        padding-bottom: 15px !important;
                        margin-bottom: 30px !important;
                        color: #000 !important;
                    }

                    h2 {
                        font-size: 18pt !important;
                        font-weight: bold !important;
                        color: #000 !important; 
                        border-bottom: 1px solid #ccc !important;
                        padding-bottom: 8px !important;
                        margin-top: 30px !important;
                        margin-bottom: 15px !important;
                        break-after: avoid !important;
                    }

                    h3 {
                        font-size: 16pt !important;
                        font-weight: bold !important;
                        color: #333 !important;
                        margin-top: 25px !important;
                        break-after: avoid !important;
                    }
                    
                    h4 {
                         font-size: 14pt !important;
                         font-weight: bold !important;
                         margin-top: 15px !important;
                         color: #444 !important;
                    }

                    p, li {
                        font-size: 13pt !important;
                        line-height: 1.8 !important;
                        text-align: justify !important;
                        margin-bottom: 15px !important;
                        color: #000 !important;
                        page-break-inside: avoid !important;
                    }
                    
                    strong {
                        font-weight: 700;
                        color: #000;
                    }

                    .report-header {
                        text-align: center;
                        border-bottom: 2px solid #333;
                        margin-bottom: 40px;
                        padding-bottom: 20px;
                    }
                    
                    .report-footer {
                        margin-top: 50px;
                        text-align: center;
                        font-size: 10pt;
                        color: #666;
                        border-top: 1px solid #eee;
                        padding-top: 15px;
                    }
                    
                    @page {
                        size: A4;
                        margin: 20mm 25mm;
                    }
                </style>
            </head>
        `;

        const date = new Date().toLocaleDateString('ar-JO');

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <div class="report-header">
                        <h1>التقرير الاستراتيجي للتنمية المستدامة: محافظة ${governorate.name_ar}</h1>
                        <p style="text-align: center !important; font-size: 12pt;">وثيقة سياسات | تاريخ الإصدار: ${date}</p>
                    </div>
                    
                    <!-- Main Narrative Content -->
                    <div id="main-content">
                        ${reportElement.querySelector('#ai-report-text-container')?.innerHTML || ''}
                    </div>

                    <div class="report-footer">
                        وزارة الداخلية - مديرية التنمية المحلية | منظومة التحليل الرقمي
                    </div>
                </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 1000);
    };
    
    if (isLoading) {
        return (
            <div className="relative p-8 rounded-xl bg-gray-50 min-h-[500px] flex flex-col items-center justify-center">
                <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse text-lg font-semibold text-gray-700">
                    <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري إنشاء التقرير بواسطة الذكاء الاصطناعي...</span>
                </div>
                <p className="mt-3 text-sm text-gray-700">قد يستغرق ذلك بضع لحظات.</p>
                <div className="w-full mt-8 opacity-30">
                    <ReportSkeleton />
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    }

    return (
        <div id="report-content" className="space-y-8 p-4 sm:p-8 bg-gray-50 rounded-xl shadow-inner">
             <div className="flex justify-end items-center gap-4 no-print">
                <button 
                    onClick={handleExportDocx}
                    disabled={isExportingDocx}
                    className="px-4 py-2 text-sm font-medium text-black bg-amber-500 rounded-lg hover:bg-amber-600 focus:ring-4 focus:outline-none focus:ring-amber-300 disabled:bg-gray-400 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                </button>
                <button
                    onClick={handleNativePrint}
                    className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 focus:z-10 focus:ring-4 focus:ring-gray-100 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    طباعة / حفظ PDF (وثيقة نظيفة)
                </button>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 pt-4 text-center break-after-avoid">{reportTitle}</h2>
            
            {/* Wrap visual KPIs in a specific class to hide them easily during print */}
            <div className="kpi-section grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 break-inside-avoid">
                <KPICard title="تقدير السكان لعام 2025" value={governorateMetrics?.population || 'N/A'} icon={<PopulationIcon />} color="bg-amber-500" />
                <KPICard title="الكثافة (نسمة/كم²)" value={governorateMetrics?.density || 'N/A'} icon={<DensityIcon />} color="bg-amber-500" />
                <KPICard 
                    title="معدل البطالة (2024)" 
                    value={governorateMetrics?.unemployment || 'N/A'} 
                    icon={<UnemploymentIcon />} 
                    color="bg-amber-500" 
                    note={governorateMetrics?.unemploymentNote}
                />
                <KPICard title="متوسط دخل الفرد السنوي" value={governorateMetrics?.income || 'N/A'} icon={<IncomeIcon />} color="bg-amber-500" />
            </div>
            
            {reportContent && (
                <>
                    <div id="ai-report-text-container" className="mt-8 p-4 bg-white rounded-lg space-y-4 shadow-sm">
                       {parseReportToElements(reportContent.report)}
                    </div>

                    {/* Allocation Priority Chart */}
                    <div className="no-print mt-16 space-y-12">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <h4 className="text-gray-900 font-bold text-xl">أولوية توجيه المخصصات المالية حسب القطاعات</h4>
                                <span className="text-sm font-bold text-blue-700 bg-blue-100/50 px-4 py-2 rounded-full border border-blue-200">للأعوام القادمة (2026 - 2029)</span>
                            </div>
                            <AllocationPriorityChart data={reportContent.allocations} />
                        </div>
                        
                        <div className="mt-16 p-8 bg-blue-50/50 border-r-8 border-blue-400 rounded-l-2xl shadow-sm">
                            <h4 className="text-blue-900 font-black text-xl mb-6 flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                مبررات التوزيع الاستراتيجي للمخصصات (2026 - 2029):
                            </h4>
                            <p className="text-lg text-slate-800 leading-relaxed font-medium text-justify">{reportContent.allocationJustification}</p>
                        </div>
                    </div>

                    {/* SWOT Analysis Section */}
                    <div className="swot-section mt-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">التحليل الاستراتيجي (SWOT)</h3>
                        <div className="swot-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="swot-item bg-green-50 p-4 rounded-xl border border-green-100">
                                <h4 className="text-green-800 font-bold mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    نقاط القوة (Strengths)
                                </h4>
                                <ul className="space-y-1">
                                    {reportContent.swot.strengths.map((s, i) => (
                                        <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 bg-green-400 rounded-full shrink-0"></span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="swot-item bg-red-50 p-4 rounded-xl border border-red-100">
                                <h4 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    نقاط الضعف (Weaknesses)
                                </h4>
                                <ul className="space-y-1">
                                    {reportContent.swot.weaknesses.map((w, i) => (
                                        <li key={i} className="text-sm text-red-900 flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 bg-red-400 rounded-full shrink-0"></span>
                                            {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="swot-item bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    الفرص (Opportunities)
                                </h4>
                                <ul className="space-y-1">
                                    {reportContent.swot.opportunities.map((o, i) => (
                                        <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 bg-blue-400 rounded-full shrink-0"></span>
                                            {o}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="swot-item bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                    التهديدات (Threats)
                                </h4>
                                <ul className="space-y-1">
                                    {reportContent.swot.threats.map((t, i) => (
                                        <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 bg-amber-400 rounded-full shrink-0"></span>
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Strategic Plan Section */}
                    <div className="strategic-plan-section mt-12 p-8 bg-indigo-950 text-white rounded-3xl shadow-2xl border border-indigo-500/30">
                        <h3 className="text-3xl font-bold mb-10 text-center border-b border-indigo-500/30 pb-6">الخطة الاستراتيجية المقترحة (2026-2029)</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-indigo-900/40 p-6 rounded-2xl border border-indigo-500/20 backdrop-blur-sm">
                                <h4 className="text-amber-400 font-bold mb-3 text-xl flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    الرؤية
                                </h4>
                                <p className="text-indigo-100 italic leading-relaxed text-lg">{reportContent.strategicPlan.vision}</p>
                            </div>
                            <div className="bg-indigo-900/40 p-6 rounded-2xl border border-indigo-500/20 backdrop-blur-sm">
                                <h4 className="text-amber-400 font-bold mb-3 text-xl flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    الرسالة
                                </h4>
                                <p className="text-indigo-100 leading-relaxed text-lg">{reportContent.strategicPlan.mission}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h4 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-amber-500" />
                                </div>
                                الأهداف الاستراتيجية والمشاريع التنموية
                            </h4>
                            {reportContent.strategicPlan.goals.map((goal, idx) => (
                                <div key={idx} className="bg-indigo-900/30 p-8 rounded-2xl border-r-8 border-amber-500 shadow-lg">
                                    <h5 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 bg-amber-500 text-indigo-950 rounded-full text-sm font-black">{idx + 1}</span>
                                        {goal.goal}
                                    </h5>
                                    <div className="grid grid-cols-1 gap-6">
                                        {goal.projects.map((project, pIdx) => (
                                            <div key={pIdx} className="bg-indigo-900/50 p-6 rounded-xl text-slate-200 space-y-4 border border-indigo-500/10 hover:border-amber-500/30 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0 group-hover:scale-125 transition-transform"></div>
                                                    <span className="font-bold text-amber-400 text-lg">{project.name}</span>
                                                </div>
                                                <div className="space-y-3 pr-5 border-r border-indigo-500/20 mr-1">
                                                    <p className="text-sm text-indigo-100/80 leading-relaxed">
                                                        <span className="text-amber-500/90 font-bold">المبرر التنموي: </span>
                                                        {project.justification}
                                                    </p>
                                                    <div className="flex items-center gap-3 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                                                        <Activity className="w-4 h-4 text-amber-500" />
                                                        <p className="text-sm">
                                                            <span className="text-amber-500 font-bold">مؤشر قياس الأداء (KPI): </span>
                                                            <span className="text-white font-medium">{project.kpi}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200 no-print">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">المؤشرات الرسومية الداعمة</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {unemploymentData && (
                                <Card className="card-container">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">معدل البطالة (2020-2025)</h4>
                                    <UnemploymentTrendChart data={unemploymentData} height={250} />
                                </Card>
                            )}
                            {livestockData && (
                                <Card className="card-container">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">أعداد الثروة الحيوانية (2020-2023)</h4>
                                    <LivestockTrendChart data={livestockData} />
                                </Card>
                            )}
                            {economicDevData && (
                                <Card className="card-container lg:col-span-2">
                                    <EconomicDevBarChart data={economicDevData} />
                                </Card>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default GovernorateReport;
