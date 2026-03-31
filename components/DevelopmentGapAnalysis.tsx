
import React, { useState, useMemo, useEffect } from 'react';
import Card from './ui/Card';
import { generateComparativeAnalysis, ComparativeGovData } from '../services/geminiService';
import { GOVERNORATES_DATA } from '../constants';
import { POPULATION_DATA_2025 } from '../constants/populationData';
import { EDUCATION_DATA } from '../constants/educationData';
import { UNEMPLOYMENT_DATA } from '../constants/unemploymentData';
import { INCOME_DATA } from '../constants/incomeData';
import { WATER_DATA } from '../constants/waterData';
import { SANITATION_DATA } from '../constants/sanitationData';
import { TRAFFIC_ACCIDENTS_2024 } from '../constants/trafficAccidentsData';
import { CRIME_DATA_2024 } from '../constants/crimeData';
import { STUDENT_TEACHER_RATIOS } from '../constants/educationRatiosData';
import { BED_RATE_2024 } from '../constants/healthData';

const governoratePoliceRegionMapping: { [key: string]: string[] } = {
    Amman: ['وسط عمان', 'جنوب عمان', 'شمال عمان', 'شرق عمان', 'البادية الوسطى'],
    Balqa: ['البلقاء', 'غرب البلقاء'],
    Zarqa: ['الزرقاء', 'الرصيفة'],
    Madaba: ['مأدبا'],
    Irbid: ['اربد', 'غرب اربد', 'الرمثا'],
    Mafraq: ['المفرق', 'البادية الشمالية'],
    Jarash: ['جرش'],
    Ajloun: ['عجلون'],
    Karak: ['الكرك'],
    Tafilah: ['الطفيلة'],
    Maan: ['معان', 'غرب معان', 'البادية الجنوبية'],
    Aqaba: ['العقبة']
};
const crimeDataMap = new Map(CRIME_DATA_2024.map(d => [d.region, d]));

const useGovernorateComparisonData = (): ComparativeGovData[] => {
    return useMemo(() => {
        return GOVERNORATES_DATA.map(gov => {
            const popData = POPULATION_DATA_2025.find(p => p.name === gov.name);
            const eduHistory = EDUCATION_DATA.find(e => e.name === gov.name)?.data;
            const latestEdu = eduHistory ? eduHistory[eduHistory.length - 1] : null;
            const unemploymentHistory = UNEMPLOYMENT_DATA.find(u => u.name === gov.name)?.data;
            const latestUnemployment = unemploymentHistory ? unemploymentHistory[unemploymentHistory.length - 1] : null;
            const incomeData = INCOME_DATA.find(i => i.name === gov.name)?.data;
            const waterHistory = WATER_DATA.find(w => w.name === gov.name)?.data;
            const latestWater = waterHistory ? waterHistory[waterHistory.length - 1] : null;
            const sanitationData = SANITATION_DATA.find(s => s.name === gov.name);
            const trafficData = TRAFFIC_ACCIDENTS_2024.find(t => t.name === gov.name);
            const studentTeacherRatio = STUDENT_TEACHER_RATIOS.find(r => r.name_ar === gov.name_ar)?.moe;
            const bedRateData = BED_RATE_2024.find(br => br.name_ar === gov.name_ar);

            const policeRegionsForGov = governoratePoliceRegionMapping[gov.name] || [];
            const aggregatedCrimeData = policeRegionsForGov.reduce((acc, regionName) => {
                const regionData = crimeDataMap.get(regionName);
                if (regionData) {
                    acc.total_crimes += regionData.total_crimes;
                }
                return acc;
            }, { total_crimes: 0 });

            const population = popData?.population || 1;
            const crime_rate = (aggregatedCrimeData.total_crimes / population) * 100000;
            const accident_rate = ((trafficData?.total || 0) / population) * 100000;

            return {
                name_ar: gov.name_ar,
                population: population,
                density: popData?.density || 0,
                student_teacher_ratio: studentTeacherRatio || 0,
                rented_schools_percentage: (latestEdu && latestEdu.schools > 0) ? (latestEdu.rented_schools / latestEdu.schools) * 100 : 0,
                beds_per_100k: (bedRateData?.rate_per_10000 || 0) * 10,
                unemployment_rate: latestUnemployment?.rate || 0,
                avg_income: incomeData?.average_total_income || 0,
                water_per_capita: latestWater?.per_capita_supply || 0,
                sanitation_coverage: sanitationData?.public_network || 0,
                crime_rate: isNaN(crime_rate) ? 0 : crime_rate,
                accident_rate: isNaN(accident_rate) ? 0 : accident_rate,
            };
        });
    }, []);
};

interface AnalysisResult {
    education?: string;
    health?: string;
    economy?: string;
    water?: string;
    security?: string;
}

const AnalysisSection: React.FC<{ title: string, content?: string, icon: string }> = ({ title, content, icon }) => (
    <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
            <span className="text-xl ml-2">{icon}</span> {title}
        </h4>
        {content ? <p className="text-gray-700 whitespace-pre-wrap">{content.replace(/\*\*/g, '')}</p> : <p className="text-gray-500">لا يوجد تحليل لهذا القطاع.</p>}
    </div>
);

const DevelopmentGapAnalysis: React.FC = () => {
    const comparisonData = useGovernorateComparisonData();
    const [gov1, setGov1] = useState('Amman');
    const [gov2, setGov2] = useState('Maan');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    const handleAnalysis = async () => {
        if (gov1 === gov2) {
            setError('الرجاء اختيار محافظتين مختلفتين.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const gov1Data = comparisonData.find(g => g.name_ar === GOVERNORATES_DATA.find(gd => gd.name === gov1)?.name_ar);
            const gov2Data = comparisonData.find(g => g.name_ar === GOVERNORATES_DATA.find(gd => gd.name === gov2)?.name_ar);

            if (!gov1Data || !gov2Data) {
                throw new Error('لم يتم العثور على بيانات لإحدى المحافظات المختارة.');
            }

            const resultJson = await generateComparativeAnalysis(gov1Data, gov2Data);
            setAnalysisResult(JSON.parse(resultJson));

        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إنشاء التحليل.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Auto-run analysis on initial load
    useEffect(() => {
        handleAnalysis();
    }, []);

    return (
        <Card>
            <div className="py-4 mb-6 border-b border-gray-100">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3 text-center text-amber-600">تحليل الفجوة التنموية بين المحافظات</h2>
                <p className="text-xl text-gray-700 text-center font-medium max-w-4xl mx-auto leading-relaxed">
                    اختر محافظتين لمقارنة مؤشراتهما التنموية الرئيسية والحصول على تحليل للفجوات مدعوم بالذكاء الاصطناعي.
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                <select
                    value={gov1}
                    onChange={(e) => setGov1(e.target.value)}
                    className="w-full md:w-1/3 bg-white border border-gray-300 rounded-lg p-3 text-base font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                >
                    {GOVERNORATES_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                </select>
                <span className="font-bold text-gray-500 text-lg px-2">مقابل</span>
                <select
                    value={gov2}
                    onChange={(e) => setGov2(e.target.value)}
                    className="w-full md:w-1/3 bg-white border border-gray-300 rounded-lg p-3 text-base font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                >
                     {GOVERNORATES_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                </select>
                <button
                    onClick={handleAnalysis}
                    disabled={isLoading}
                    className="w-full md:w-auto px-8 py-3 text-black bg-amber-500 rounded-lg disabled:bg-gray-400 hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-300 font-bold text-base transition-colors shadow-sm"
                >
                    {isLoading ? '...جاري التحليل' : 'تحليل الفجوة'}
                </button>
            </div>

            {error && <p className="text-red-500 text-center font-medium">{error}</p>}
            
            {isLoading && (
                <div className="flex flex-col justify-center items-center p-12">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">جاري معالجة البيانات وإنشاء التحليل...</p>
                </div>
            )}

            {analysisResult && (
                <div className="mt-8 space-y-6">
                    <AnalysisSection title="التعليم" content={analysisResult.education} icon="🎓" />
                    <AnalysisSection title="الصحة" content={analysisResult.health} icon="⚕️" />
                    <AnalysisSection title="الاقتصاد" content={analysisResult.economy} icon="💼" />
                    <AnalysisSection title="المياه والبنية التحتية" content={analysisResult.water} icon="💧" />
                    <AnalysisSection title="الأمن المجتمعي" content={analysisResult.security} icon="🛡️" />
                </div>
            )}
        </Card>
    );
};

export default DevelopmentGapAnalysis;
