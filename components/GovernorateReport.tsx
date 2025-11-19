
import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { GovernorateData } from '../types';
import { generateGovernorateReport } from '../services/geminiService';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, IStylesOptions } from 'docx';
import saveAs from 'file-saver';
import Card from './ui/Card';
import { POPULATION_DATA_2024 } from '../constants/populationData';
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
import { NATIONAL_AVERAGES_2024 } from '../constants';
import { STUDENT_TEACHER_RATIOS, STUDENT_CLASSROOM_RATIOS } from '../constants/educationRatiosData';
import { TEACHER_QUALIFICATION_DATA } from '../constants/teacherQualificationData';
import { MOE_SCHOOLS_SHARE } from '../constants/moeShareData';
import { VOCATIONAL_EDUCATION_DATA } from '../constants/vocationalEducationData';
import { BED_RATE_2024, HEALTH_CENTERS_2024, GENERAL_PRACTITIONER_RATE_2024, MOH_WORKFORCE_2024, CANCER_CASES_2022, MATERNAL_CHILD_HEALTH_DATA_2023 } from '../constants/healthData';


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

const KPICard: React.FC<{ title: string; value: string; icon: ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <Card className="card-container text-center break-inside-avoid">
        <div className={`mx-auto mb-3 w-12 h-12 flex items-center justify-center rounded-full ${color} icon-wrapper`}>
            {icon}
        </div>
        <p className="text-2xl md:text-3xl font-bold text-gray-900 kpi-value">{value}</p>
        <p className="text-base text-gray-700 kpi-title">{title}</p>
    </Card>
);

const PopulationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const DensityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6.5-11.5L18 6.5M4 12H2m13.5 6.5L18 17.5M12 20v1M4 12a8 8 0 018-8m0 16a8 8 0 01-8-8z" /></svg>;
const UnemploymentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 21h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2v6z" /></svg>;
const IncomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const GovernorateReport: React.FC<GovernorateReportProps> = ({ governorate }) => {
    const [reportContent, setReportContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const governorateMetrics = useMemo(() => {
        if (!governorate) return null;

        const populationData = POPULATION_DATA_2024.find(g => g.name === governorate.name);
        const unemploymentHistory = UNEMPLOYMENT_DATA.find(u => u.name === governorate.name)?.data;
        const latestUnemployment = unemploymentHistory ? unemploymentHistory[unemploymentHistory.length - 1].rate : 0;
        const incomeData = INCOME_DATA.find(i => i.name === governorate.name)?.data;

        return {
            population: populationData?.population.toLocaleString() || 'N/A',
            density: populationData?.density.toFixed(1) || 'N/A',
            unemployment: latestUnemployment > 0 ? `${latestUnemployment.toFixed(1)}%` : 'N/A',
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
                const populationData = POPULATION_DATA_2024.find(g => g.name === governorate.name);

                // --- ECONOMY ---
                const unemploymentHistory = UNEMPLOYMENT_DATA.find(u => u.name === governorate.name)?.data;
                const latestUnemployment = unemploymentHistory ? unemploymentHistory[unemploymentHistory.length - 1] : { year: 2024, rate: 0 };
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

                const reportData = {
                    governorateName: governorate.name_ar,
                    // Economy
                    unemploymentRate: latestUnemployment.rate,
                    nationalUnemploymentRate: NATIONAL_AVERAGES_2024.unemployment_rate,
                    avgIncome: incomeData?.average_total_income,
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
            if (trimmed.startsWith('###')) {
                return <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3 break-after-avoid">{trimmed.replace(/###\s?/, '').replace(/\*\*/g, '')}</h3>;
            }
            if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                 return <h4 key={index} className="text-lg font-semibold text-gray-800 mt-4 mb-2 break-after-avoid">{trimmed.replace(/\*\*/g, '')}</h4>;
            }
            if (trimmed.startsWith('* ')) {
                 return <li key={index} className="list-disc list-inside text-gray-700 mb-1 break-inside-avoid">{trimmed.substring(2).replace(/\*\*/g, '')}</li>;
            }
            return <p key={index} className="text-gray-700 mb-2 leading-relaxed break-inside-avoid">{trimmed.replace(/\*\*/g, '')}</p>;
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
                { id: "Normal", name: "Normal", basedOn: "Normal", next: "Normal", run: { size: 26 }, paragraph: { spacing: { after: 120, line: 360, rule: "auto" } } }, // 13pt, 1.5 line spacing
                { id: "h1", name: "h1", basedOn: "Normal", next: "Normal", run: { size: 40, bold: true, color: "1E3A8A" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 360, after: 240 } } }, // 20pt
                { id: "h2", name: "h2", basedOn: "Normal", next: "Normal", run: { size: 32, bold: true, color: "1E40AF" }, paragraph: { spacing: { before: 240, after: 120 } } }, // 16pt
                { id: "h3", name: "h3", basedOn: "Normal", next: "Normal", run: { size: 28, bold: true, color: "1D4ED8" }, paragraph: { spacing: { before: 180, after: 100 } } }, // 14pt
            ],
        };
        
        const paragraphs = reportContent.split('\n').map(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('###')) {
                return new Paragraph({ text: trimmedLine.replace(/###\s?/, '').replace(/\*\*/g, ''), style: "h2", bidirectional: true, alignment: AlignmentType.RIGHT });
            }
            if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                return new Paragraph({ text: trimmedLine.replace(/\*\*/g, ''), style: "h3", bidirectional: true, alignment: AlignmentType.RIGHT });
            }
            if (trimmedLine.startsWith('* ')) {
                return new Paragraph({ text: trimmedLine.substring(2).replace(/\*\*/g, ''), bullet: { level: 0 }, style: "Normal", bidirectional: true, alignment: AlignmentType.RIGHT });
            }
            return new Paragraph({ text: trimmedLine, style: "Normal", bidirectional: true, alignment: AlignmentType.RIGHT });
        });
        
        const titlePara = new Paragraph({ text: reportTitle, style: 'h1', bidirectional: true, alignment: AlignmentType.CENTER });

        const doc = new Document({
            styles: docStyles,
            sections: [{
                properties: { page: { margin: { top: 1134, right: 850, bottom: 1134, left: 850 } } },
                children: [titlePara, ...paragraphs],
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
    
    /**
     * Native Print Solution (Iframe Isolation with CSS Paging Injection and Design Stripping)
     * 
     * This method creates a clean, document-oriented print view by:
     * 1. Removing all shadows, backgrounds, and complex UI styling.
     * 2. Forcing a 'display: block' flow layout to prevent cutting.
     * 3. Injecting strict paging rules to avoid breaks inside paragraphs.
     * 4. HIDING the graphical charts section to avoid rendering issues.
     * 5. Resizing icons to be small (20px) for a clean list view.
     */
    const handleNativePrint = () => {
        const reportElement = document.getElementById('report-content');
        
        if (!reportElement) return;

        // 1. Create a virtual window
        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) return;

        // 2. Prepare head with strict CSS for paging and design stripping
        const headContent = `
            <head>
                <title>تقرير ${governorate.name_ar} - ${new Date().toLocaleDateString('ar-JO')}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                    
                    /* RESET & BASICS */
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

                    /* DESIGN STRIPPING */
                    * {
                        box-shadow: none !important;
                        text-shadow: none !important;
                        background-color: transparent !important;
                        border-radius: 0 !important;
                        border: none !important;
                    }
                    
                    /* Hide elements marked as no-print (The Charts) */
                    .no-print {
                        display: none !important;
                    }

                    /* LAYOUT FLATTENING */
                    .grid, .flex, .flex-row, .flex-col {
                        display: block !important; /* Force flow layout */
                    }
                    
                    /* KPI Cards styling for print */
                    .card-container {
                         padding: 10px 0 !important;
                         border-bottom: 1px solid #eee !important;
                         margin-bottom: 10px !important;
                    }
                    
                    /* Ensure flexible content within cards is handled */
                    .card-container .flex {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                    }
                    
                    /* RESET ICON CONTAINERS */
                    .icon-wrapper, .rounded-full {
                        width: auto !important;
                        height: auto !important;
                        padding: 0 10px !important;
                        margin: 0 !important;
                        background: none !important;
                        display: inline-block !important;
                        min-width: 20px !important;
                        border: none !important;
                    }

                    /* TYPOGRAPHY */
                    h1 {
                        font-size: 22pt !important;
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
                        margin-top: 20px !important;
                        break-after: avoid !important;
                    }
                    
                    h4 {
                         font-size: 14pt !important;
                         font-weight: bold !important;
                         margin-top: 15px !important;
                    }

                    p, li {
                        font-size: 12pt !important;
                        line-height: 1.6 !important;
                        text-align: justify !important;
                        margin-bottom: 10px !important;
                        color: #000 !important;
                        page-break-inside: avoid !important;
                    }
                    
                    /* KPI Values */
                    .kpi-value { font-size: 16pt !important; font-weight: bold !important; margin: 0 !important; }
                    .kpi-title { font-size: 10pt !important; color: #555 !important; }

                     /* ICONS SIZING - Small for text-based report */
                    svg {
                        width: 20px !important;
                        height: 20px !important;
                        display: inline-block !important;
                        vertical-align: middle !important;
                    }

                    .report-header {
                        text-align: center;
                        border-bottom: 2px solid #333;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                    }
                    
                    .report-footer {
                        margin-top: 50px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        border-top: 1px solid #eee;
                        padding-top: 10px;
                    }
                    
                    @page {
                        size: A4;
                        margin: 15mm 20mm;
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
                        <h1>تقرير التنمية المستدامة: محافظة ${governorate.name_ar}</h1>
                        <p style="text-align: center !important;">تاريخ التقرير: ${date} | المصدر: نظام التخطيط الذكي</p>
                    </div>
                    <div class="content">
                        ${reportElement.innerHTML}
                    </div>
                    <div class="report-footer">
                        تم توليد هذا التقرير آلياً بواسطة منظومة التحليل التنموي - وزارة الداخلية.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 break-inside-avoid">
                <KPICard title="عدد السكان (2024)" value={governorateMetrics?.population || 'N/A'} icon={<PopulationIcon />} color="bg-amber-500" />
                <KPICard title="الكثافة (نسمة/كم²)" value={governorateMetrics?.density || 'N/A'} icon={<DensityIcon />} color="bg-amber-500" />
                <KPICard title="معدل البطالة (2024)" value={governorateMetrics?.unemployment || 'N/A'} icon={<UnemploymentIcon />} color="bg-amber-500" />
                <KPICard title="متوسط دخل الفرد السنوي" value={governorateMetrics?.income || 'N/A'} icon={<IncomeIcon />} color="bg-amber-500" />
            </div>
            
            {reportContent && (
                <>
                    <div id="ai-report-text-container" className="mt-8 p-4 bg-white rounded-lg space-y-4 shadow-sm">
                       {parseReportToElements(reportContent)}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200 no-print">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">المؤشرات الرسومية الداعمة</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {unemploymentData && (
                                <Card className="card-container">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">معدل البطالة (2020-2024)</h4>
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
