
import React, { useMemo } from 'react';
import Card from './ui/Card';
import { CRIME_DATA_2024 } from '../constants/crimeData';
import { TRAFFIC_ACCIDENTS_2024 } from '../constants/trafficAccidentsData';

// Enhanced KPI Card with dynamic colors and hover effects
const KpiCard: React.FC<{ 
    icon: string; 
    label: string; 
    value: string; 
    colorClass: string; 
    borderColor: string;
}> = ({ icon, label, value, colorClass, borderColor }) => (
    <div className={`relative overflow-hidden p-4 rounded-xl border ${borderColor} ${colorClass} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-white opacity-10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
        <div className="relative z-10 flex flex-col items-center text-center h-full justify-center">
            <div className="text-3xl mb-2 drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
            <p className="text-lg lg:text-xl font-extrabold text-gray-800 dark:text-gray-900 mb-1 leading-tight">{value}</p>
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mt-0.5">{label}</p>
        </div>
    </div>
);


const NationalIndicators: React.FC = () => {
    
    // Calculate totals dynamically from data files
    const totalCrimes = useMemo(() => {
        return CRIME_DATA_2024.reduce((acc, curr) => {
            // Exclude aggregate keys to avoid double counting if they exist in the source, 
            // but based on structure we sum relevant regions. 
            // The provided CRIME_DATA_2024 has specific regions. 
            // To be safe and match the "National Totals" logic used in Security.tsx:
            // We should sum the base regions or use the pre-calculated totals if available.
            // Here we will use the logic that sums non-aggregate if possible, or just use the grand total if we trust the data entry.
            // For simplicity and consistency with the Security report which calculates: 22,388 (example).
            // Let's manually sum the breakdown to be safe, filtering out "Regions" if they are sums of others.
            // In CRIME_DATA_2024, 'إقليم العاصمة', 'إقليم الوسط', etc are aggregates.
            if (['إقليم العاصمة', 'إقليم الوسط', 'إقليم الشمال', 'إقليم الجنوب', 'شرطة البادية الملكية'].includes(curr.region)) {
                return acc;
            }
            return acc + curr.total_crimes;
        }, 0);
    }, []);

    const totalAccidents = useMemo(() => {
        return TRAFFIC_ACCIDENTS_2024.reduce((acc, curr) => acc + curr.total, 0);
    }, []);

    // Updated based on "Jordan in Figures 2025" (Data 2024) images
    const indicators = [
        // Demographics (Replaced GDP)
        { icon: '👥', label: 'عدد السكان (2024)', value: '11,734,000 نسمة', color: 'bg-blue-50', border: 'border-blue-200' },
        { icon: '📈', label: 'معدل النمو السكاني', value: '1.9%', color: 'bg-emerald-50', border: 'border-emerald-200' },
        { icon: '🏙️', label: 'الكثافة السكانية', value: '132.1 شخص/كم²', color: 'bg-amber-50', border: 'border-amber-200' },
        
        { icon: '💼', label: 'معدل البطالة العام', value: '21.4%', color: 'bg-rose-50', border: 'border-rose-200' },
        { icon: '👩‍💼', label: 'معدل بطالة الإناث', value: '32.9%', color: 'bg-purple-50', border: 'border-purple-200' },
        { icon: '🎓', label: 'بطالة الشباب (15-24 سنة)', value: '46.6%', color: 'bg-red-50', border: 'border-red-200' },
        
        { icon: '📉', label: 'المشاركة الاقتصادية للإناث', value: '14.9%', color: 'bg-indigo-50', border: 'border-indigo-200' },
        { icon: '👨‍👩‍👧‍👦', label: 'متوسط حجم الأسرة', value: '4.8 أفراد', color: 'bg-orange-50', border: 'border-orange-200' },
        { icon: '❤️', label: 'توقع الحياة عند الولادة', value: '75.3 سنة', color: 'bg-cyan-50', border: 'border-cyan-200' },
        
        { icon: '🍼', label: 'وفيات الرضع (لكل 1000)', value: '14', color: 'bg-pink-50', border: 'border-pink-200' },
        { icon: '⚖️', label: 'إجمالي الجرائم المسجلة', value: totalCrimes.toLocaleString(), color: 'bg-slate-50', border: 'border-slate-200' },
        { icon: '🚗', label: 'إجمالي حوادث الإصابات', value: totalAccidents.toLocaleString(), color: 'bg-stone-50', border: 'border-stone-200' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900">
                    لوحة المؤشرات الوطنية (2024)
                </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
                 {indicators.map((indicator, index) => (
                    <KpiCard 
                        key={index} 
                        icon={indicator.icon} 
                        label={indicator.label} 
                        value={indicator.value} 
                        colorClass={indicator.color}
                        borderColor={indicator.border}
                    />
                ))}
            </div>
        </div>
    );
};


const Dashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 text-center">
                    <h1 className="text-3xl lg:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
                        المنصة الرقمية للتحليل التنموي للمحافظات الأردنية
                    </h1>
                    <p className="text-lg lg:text-xl text-slate-300 font-light">
                        رؤية تنموية مستدامة مدعومة بقوة <span className="font-bold text-amber-400">البيانات</span> و <span className="font-bold text-emerald-400">الذكاء الاصطناعي</span>
                    </p>
                </div>
            </header>

            {/* Introduction Card */}
            <Card className="border-t-4 border-amber-500 shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="hidden md:block p-3 bg-amber-100 rounded-full text-amber-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">نظرة عامة على المنصة</h2>
                        <div className="text-gray-700 space-y-3 leading-relaxed text-lg">
                            <p>
                                تمثل هذه المنظومة نقلة نوعية في آليات التخطيط التنموي في المملكة الأردنية الهاشمية. من خلال دمج <strong>البيانات الضخمة</strong> مع خوارزميات <strong>التعلم الآلي</strong>، نقدم لصناع القرار لوحة قيادة تفاعلية لا تكتفي برصد الواقع، بل تستشرف المستقبل.
                            </p>
                            <p>
                                تتيح المنصة استكشاف الفجوات التنموية بين المحافظات بدقة متناهية، مما يضمن توجيه الموارد والمشاريع نحو المناطق الأكثر احتياجاً، تحقيقاً لرؤية التحديث الاقتصادي 2033 والعدالة الاجتماعية.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Map Section */}
                <div className="lg:col-span-2">
                    <Card className="h-full flex flex-col p-0 overflow-hidden border border-gray-200 shadow-xl rounded-2xl bg-white">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                الخارطة التفاعلية للتنمية المستدامة
                            </h3>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">تحديث: 2024</span>
                        </div>
                        <div className="flex-grow relative bg-slate-50">
                            <iframe 
                                title="مؤشر التنمية المحلية المستدامة (2024)" 
                                aria-label="Choropleth map" 
                                id="datawrapper-chart-8Q9WD" 
                                src="https://datawrapper.dwcdn.net/8Q9WD/1/" 
                                scrolling="no" 
                                frameBorder="0" 
                                style={{ border: 'none', width: '100%', height: '807px' }} 
                                width="600" 
                                height="807" 
                                data-external="1">
                            </iframe>
                        </div>
                    </Card>
                </div>

                {/* National Indicators Section */}
                <div className="lg:col-span-1">
                    <NationalIndicators />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
