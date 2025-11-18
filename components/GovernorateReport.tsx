import React, { useState, useEffect, ReactNode, useMemo } from 'react';
import { GovernorateData } from '../types';
import { generateGovernorateReport } from '../services/geminiService';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, IStylesOptions } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
    <Card className="card-container text-center">
        <div className={`mx-auto mb-3 w-12 h-12 flex items-center justify-center rounded-full ${color}`}>
            {icon}
        </div>
        <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-base text-gray-700">{title}</p>
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
    const [isExportingPdf, setIsExportingPdf] = useState(false);

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
    
    const handleExportPdf = async () => {
        setIsExportingPdf(true);
        const input = document.getElementById('report-content');
        if (!input) {
            setIsExportingPdf(false);
            return;
        }

        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const topMargin = 20;
            const bottomMargin = 20;
            const leftMargin = 15;
            const rightMargin = 15;

            const contentWidth = pdfWidth - leftMargin - rightMargin;
            const pageContentHeight = pdfHeight - topMargin - bottomMargin;

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / contentWidth;
            const scaledImgHeight = imgHeight / ratio;

            let heightLeft = scaledImgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', leftMargin, topMargin, contentWidth, scaledImgHeight);
            heightLeft -= pageContentHeight;

            while (heightLeft > 0) {
                position -= pageContentHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', leftMargin, position + topMargin, contentWidth, scaledImgHeight);
                heightLeft -= pageContentHeight;
            }
            
            pdf.save(`report-${governorate.name}.pdf`);
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExportingPdf(false);
        }
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
             <div data-html2canvas-ignore="true" className="flex justify-end items-center gap-4 no-print">
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
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 focus:z-10 focus:ring-4 focus:ring-gray-100 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {isExportingPdf ? 'جاري التصدير...' : 'تصدير (PDF)'}
                </button>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 pt-4 text-center">{reportTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard title="عدد السكان (2024)" value={governorateMetrics?.population || 'N/A'} icon={<PopulationIcon />} color="bg-amber-500" />
                <KPICard title="الكثافة (نسمة/كم²)" value={governorateMetrics?.density || 'N/A'} icon={<DensityIcon />} color="bg-amber-500" />
                <KPICard title="معدل البطالة (2024)" value={governorateMetrics?.unemployment || 'N/A'} icon={<UnemploymentIcon />} color="bg-amber-500" />
                <KPICard title="متوسط دخل الفرد السنوي" value={governorateMetrics?.income || 'N/A'} icon={<IncomeIcon />} color="bg-amber-500" />
            </div>
            
            {reportContent && (
                <>
                    <div id="ai-report-text-container" className="mt-8 p-4 bg-white rounded-lg">
                       <div className="whitespace-pre-wrap font-sans text-lg text-gray-900 leading-normal">
                          {reportContent}
                       </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
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