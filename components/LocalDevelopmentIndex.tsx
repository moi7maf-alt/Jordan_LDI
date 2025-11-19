
import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { DEVELOPMENT_INDICATORS_2024 } from '../constants/developmentIndexData';
import { FINAL_RANKING_2024 } from '../constants/finalRankingData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell, LabelList } from 'recharts';
import { DevelopmentIndicators2024, FinalRanking2024 } from '../types';
import { GOVERNORATE_COLORS } from '../constants/colors';

const indicators = [
    { key: 'final_ranking' as const, name: 'الترتيب النهائي' },
    { key: 'economic_activity' as const, name: 'الأنشطة الاقتصادية' },
    { key: 'infrastructure' as const, name: 'البنية التحتية' },
    { key: 'education' as const, name: 'التعليم' },
    { key: 'health' as const, name: 'الصحة' },
    { key: 'social_status' as const, name: 'الوضع الاجتماعي' }
];

const indicatorKeys: (keyof Omit<DevelopmentIndicators2024, 'name' | 'name_ar'>)[] = ['economic_activity', 'infrastructure', 'education', 'health', 'social_status'];


// Comparison chart for one indicator across all governorates
const IndicatorComparisonChart: React.FC<{data: DevelopmentIndicators2024[], dataKey: keyof DevelopmentIndicators2024}> = ({ data, dataKey }) => (
    <div style={{ width: '100%', height: 450 }}>
        <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="name_ar" width={95} tick={{ fontSize: 13, fill: '#9ca3af' }} />
                <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem', color: '#fff' }}
                    formatter={(value: number) => [value.toFixed(2), 'الدرجة']}
                />
                <Bar dataKey={dataKey} background={{ fill: 'rgba(128, 128, 128, 0.1)' }} radius={[0, 4, 4, 0]}>
                     <LabelList dataKey={dataKey} position="right" formatter={(value: number) => value.toFixed(2)} style={{ fill: '#4b5563', fontSize: '12px' }} />
                    {data.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={GOVERNORATE_COLORS[entry.name] as string} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
);

// Radar chart for a single governorate's performance across all indicators
const GovernorateRadarChart: React.FC<{ selectedData: DevelopmentIndicators2024; averageData: DevelopmentIndicators2024 & { name_ar: string } }> = ({ selectedData, averageData }) => {
    const radarData = indicators.slice(1).map(ind => ({
        subject: ind.name,
        [selectedData.name_ar]: selectedData[ind.key as keyof DevelopmentIndicators2024],
        'المعدل الوطني': averageData[ind.key as keyof DevelopmentIndicators2024],
        fullMark: 20,
    }));

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(128, 128, 128, 0.2)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem', color: '#fff' }} />
                    <Radar name={selectedData.name_ar} dataKey={selectedData.name_ar} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                    <Radar name="المعدل الوطني" dataKey="المعدل الوطني" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '15px' }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};


// New Leaderboard-style Final Ranking Display
const FinalRankingDisplay: React.FC<{ rankData: FinalRanking2024[], scoreData: DevelopmentIndicators2024[] }> = ({ rankData, scoreData }) => {
    const scoreMap = new Map(scoreData.map(d => [d.name, d]));
    
    const combinedData = rankData.map(rankItem => {
        const scores = scoreMap.get(rankItem.name);
        const totalScore = scores ? indicatorKeys.reduce((acc, key) => acc + (scores[key] || 0), 0) : 0;
        return {
            ...rankItem,
            totalScore
        };
    }).sort((a, b) => a.rank - b.rank);

    const rankIcons: { [key: number]: string } = { 1: '🥇', 2: '🥈', 3: '🥉' };

    const getBarColor = (rank: number) => {
        if (rank === 1) return 'bg-yellow-400 dark:bg-yellow-500';
        if (rank === 2) return 'bg-gray-400 dark:bg-gray-500';
        if (rank === 3) return 'bg-orange-400 dark:bg-orange-500';
        return 'bg-amber-500 dark:bg-amber-600';
    };

    return (
        <div className="p-2 font-sans">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 text-center">الترتيب النهائي للمحافظات (2024)</h3>
            <div className="space-y-3">
                {combinedData.map((gov) => (
                    <div key={gov.name} className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-slate-700/50">
                        <div className="flex-shrink-0 w-10 text-center text-xl font-bold text-gray-600 dark:text-gray-400">
                            {rankIcons[gov.rank] || gov.rank}
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-baseline mb-1">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{gov.name_ar}</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{gov.totalScore.toFixed(1)}</p>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                <div 
                                    className={`${getBarColor(gov.rank)} h-2.5 rounded-full transition-all duration-500 ease-out`} 
                                    style={{ width: `${gov.totalScore}%` }}
                                    title={`Score: ${gov.totalScore.toFixed(2)}`}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Expanded analysis text generation
const getAnalysisText = (indicatorKey: string, data: any[]) => {
    const scoreDataMap = new Map(DEVELOPMENT_INDICATORS_2024.map(d => [d.name, d]));

    const formatGovernorate = (gov: any) => {
        if (gov.rank) { // From FINAL_RANKING_2024
            const scores = scoreDataMap.get(gov.name);
            const totalScore = scores ? indicatorKeys.reduce((acc, key) => acc + (scores[key] || 0), 0) : 0;
            return `<strong>${gov.name_ar}</strong> (الترتيب ${gov.rank}، الدرجة: ${totalScore.toFixed(1)})`;
        }
        // From DEVELOPMENT_INDICATORS_2024
        return `<strong>${gov.name_ar}</strong> (الدرجة: ${gov[indicatorKey]?.toFixed(2)})`;
    };
    
    const sortedData = 'rank' in data[0] ? [...data].sort((a, b) => a.rank - b.rank) : [...data].sort((a, b) => (b[indicatorKey as keyof DevelopmentIndicators2024] as number) - (a[indicatorKey as keyof DevelopmentIndicators2024] as number));
    
    const top3 = sortedData.slice(0, 3);
    const bottom3 = sortedData.slice(-3).reverse();

    switch (indicatorKey) {
        case 'final_ranking':
            const middle6 = sortedData.slice(3, 9);
            const formatMiddleList = middle6.map(g => formatGovernorate(g)).join('، ');

            return `
                <p class="mb-4">يعكس الترتيب النهائي لمؤشر التنمية المحلية المستدامة الأداء الكلي للمحافظات عبر المحاور الخمسة الرئيسية، مقدماً رؤية شاملة لمستوى التطور في كل منها.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الفئة الأولى: المحافظات الرائدة</h4>
                <p class="mb-4">تتصدر ${formatGovernorate(top3[0])} المشهد بفارق ملحوظ، مستفيدة من مكانتها كمركز اقتصادي وإداري للمملكة. تليها ${formatGovernorate(top3[1])} التي تتميز ببنيتها التحتية القوية وقطاعها السياحي الواعد، ثم ${formatGovernorate(top3[2])} التي تظهر أداءً متوازناً في مختلف القطاعات.</p>
                
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الفئة الثانية: محافظات النمو الواعدة</h4>
                <p class="mb-4">تضم هذه الفئة محافظات تمتلك إمكانيات كبيرة للتقدم ولكنها تواجه تحديات محددة في بعض القطاعات. وتشمل بالترتيب: ${formatMiddleList}. هذه المحافظات، مثل <strong>جرش</strong> بقطاعها التعليمي الجيد و<strong>الكرك</strong> بوضعها الصحي المتقدم، يمكنها تحقيق قفزات نوعية من خلال معالجة نقاط ضعف معينة كالبنية التحتية أو تنويع النشاط الاقتصادي.</p>

                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الفئة الثالثة: محافظات تتطلب دعماً مكثفاً</h4>
                <p class="mb-4">تُظهر النتائج أن هناك حاجة لتركيز الجهود التنموية في المحافظات التي تقع في مراتب متأخرة مثل ${formatGovernorate(bottom3[0])}, ${formatGovernorate(bottom3[1])}, و ${formatGovernorate(bottom3[2])}. تعاني هذه المحافظات من تحديات مركّبة تتطلب خططاً تنموية متكاملة ومخصصة.</p>
                
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">توصيات استراتيجية قابلة للتنفيذ</h4>
                <ul class="list-disc list-outside mr-6 space-y-2 my-4">
                    <li><strong>للمحافظات الرائدة:</strong> التركيز على التحول نحو اقتصاد المعرفة والخدمات المتقدمة، وتعزيز مكانتها كمراكز إقليمية للابتكار وريادة الأعمال. إطلاق "صناديق استثمار تنموية" متخصصة بكل محافظة.</li>
                    <li><strong>لمحافظات النمو:</strong> تنفيذ "برامج تسريع تنموي" تستهدف القطاعات ذات الأولوية في كل محافظة. على سبيل المثال، دعم السياحة البيئية والمغامرات في <strong>عجلون والطفيلة</strong>، وتطوير الصناعات الزراعية التحويلية في <strong>جرش</strong>.</li>
                    <li><strong>للمحافظات الأقل حظاً:</strong> إطلاق "حزمة مشاريع بنية تحتية أساسية" تشمل تطوير شبكات المياه والصرف الصحي والطرق الثانوية. تقديم حوافز ضريبية واستثمارية استثنائية لجذب المشاريع كثيفة العمالة إلى <strong>المفرق ومعان</strong>.</li>
                    <li><strong>توصية شاملة:</strong> إنشاء "منصة بيانات تنموية موحدة" تتيح لصناع القرار متابعة أداء المؤشرات بشكل دوري وتوجيه الموارد بفعالية أكبر بناءً على البيانات المحدثة، وربط موازنات المحافظات (اللامركزية) بتحقيق مستهدفات واضحة في هذه المؤشرات.</li>
                </ul>
            `;
        case 'economic_activity':
            return `
                <p class="mb-4">يقيس هذا المؤشر قدرة المحافظة على خلق بيئة اقتصادية نشطة ومستدامة، بما في ذلك جذب الاستثمارات، وتوفير فرص العمل، ودعم ريادة الأعمال.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الأفضل أداءً:</h4>
                <p class="mb-4">تتربع ${formatGovernorate(top3[0])} و ${formatGovernorate(top3[1])} على القمة بفارق واضح، مستفيدتين من تركّز الأعمال والأنشطة اللوجستية والسياحية. كما تظهر ${formatGovernorate(top3[2])} أداءً قوياً نسبياً.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الأكثر تحدياً:</h4>
                <p class="mb-4">تواجه محافظات مثل ${formatGovernorate(bottom3[0])} و ${formatGovernorate(bottom3[1])} تحديات أكبر في تنويع القاعدة الاقتصادية وجذب استثمارات نوعية خارج القطاعات التقليدية.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">توصيات استراتيجية:</h4>
                <p>يُنصح بتوجيه برامج تنموية لدعم المشاريع الصغيرة والمتوسطة في المحافظات الأقل أداءً، مع التركيز على استغلال الميزات النسبية لكل محافظة (مثل السياحة البيئية في عجلون أو الزراعة في المفرق).</p>
            `;
        case 'infrastructure':
            return `
                <p class="mb-4">يعكس مؤشر البنية التحتية جودة الخدمات الأساسية التي تشكل عصب الحياة اليومية والتنمية، بما في ذلك الطرق، والمياه، والصرف الصحي، والاتصالات، والطاقة.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الأفضل أداءً:</h4>
                <p class="mb-4">تتميز ${formatGovernorate(top3[0])} و ${formatGovernorate(top3[1])} ببنية تحتية قوية تدعم الأنشطة الاقتصادية والسكانية، مما يعزز من جودة الحياة والجاذبية الاستثمارية.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الأكثر تحدياً:</h4>
                <p class="mb-4">في المقابل، تُظهر محافظات مثل ${formatGovernorate(bottom3[0])} و ${formatGovernorate(bottom3[1])} حاجة ماسة لتطوير البنية التحتية، خاصة في المناطق النائية، لتحسين مستوى الخدمات.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">توصيات استراتيجية:</h4>
                <p>يجب إطلاق خطط استثمارية عاجلة وموجهة لمشاريع البنية التحتية الحيوية في المحافظات الأكثر حاجة، مع التركيز على مشاريع الاستدامة مثل الطاقة المتجددة وإدارة المياه.</p>
            `;
        case 'education':
            return `
                <p class="mb-4">يُقيّم هذا المؤشر كفاءة وجودة النظام التعليمي، من خلال معايير مثل نسبة المعلمين إلى الطلبة، وجودة المرافق المدرسية، ومستوى التحصيل الأكاديمي.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الأفضل أداءً:</h4>
                <p class="mb-4">تُحقق ${formatGovernorate(top3[0])} أداءً متميزاً، تليها ${formatGovernorate(top3[1])} و ${formatGovernorate(top3[2])}، مما يشير إلى جودة مخرجات التعليم وتوفر الكوادر والمرافق في هذه المناطق.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الأكثر تحدياً:</h4>
                <p class="mb-4">تظهر المحافظات الأقل أداءً مثل ${formatGovernorate(bottom3[0])} و ${formatGovernorate(bottom3[1])} تحديات قد ترتبط بالكثافة الصفية أو الحاجة لتأهيل إضافي للكوادر.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">توصيات استراتيجية:</h4>
                <p>يوصى بزيادة الاستثمار في تأهيل المدارس وتدريب المعلمين في المحافظات ذات الأداء المنخفض، مع التركيز على دمج التكنولوجيا في التعليم لتقليص الفجوة التعليمية.</p>
            `;
        case 'health':
            return `
                <p class="mb-4">يقيس مؤشر الصحة مدى توفر وجودة الخدمات الصحية، بما في ذلك عدد المستشفيات والمراكز الصحية، نسبة الأطباء والأسرة للسكان، ومؤشرات الصحة العامة.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الأفضل أداءً:</h4>
                <p class="mb-4">تتصدر ${formatGovernorate(top3[0])} المؤشر، مما يعكس توفر بنية تحتية صحية قوية. كما يظهر أداء متقدم في ${formatGovernorate(top3[1])} و ${formatGovernorate(top3[2])}، مما يشير إلى توزيع جيد نسبياً للخدمات الصحية.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الأكثر تحدياً:</h4>
                <p class="mb-4">لا تزال محافظات مثل ${formatGovernorate(bottom3[0])} و ${formatGovernorate(bottom3[1])} تواجه تحديات في الوصول إلى خدمات صحية متكاملة وتخصصية.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">توصيات استراتيجية:</h4>
                <p>من الضروري تعزيز المراكز الصحية الأولية وزيادة عدد الأسرة في المستشفيات الحكومية في المناطق الأقل حظاً، مع التوسع في برامج التأمين الصحي الشامل.</p>
            `;
        case 'social_status':
            return `
                <p class="mb-4">يقيس مؤشر الوضع الاجتماعي عوامل جودة الحياة التي تساهم في رفاه المواطنين، مثل المشاركة المجتمعية، والترابط الأسري، ومستوى الأمان، والوصول للأنشطة الثقافية والترفيهية.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الأفضل أداءً:</h4>
                <p class="mb-4">تتصدر ${formatGovernorate(top3[0])} و ${formatGovernorate(top3[1])} هذا المؤشر، مما قد يعكس طبيعة المجتمعات الأصغر والأكثر ترابطاً وقوة الشبكات الاجتماعية فيها.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">الأكثر تحدياً:</h4>
                <p class="mb-4">تسجل ${formatGovernorate(bottom3[0])} و ${formatGovernorate(bottom3[1])} درجات أقل، مما يشير إلى وجود تحديات في بعض جوانب جودة الحياة أو الترابط المجتمعي.</p>
                <h4 class="font-semibold text-gray-800 dark:text-white mb-2">توصيات استراتيجية:</h4>
                <p>يُنصح بتعزيز المرافق العامة والبرامج والمبادرات التي تدعم التماسك المجتمعي، وتشجيع الأنشطة الشبابية والثقافية في كافة المحافظات، خاصة تلك التي تظهر مؤشرات اجتماعية أقل.</p>
            `;
        default: return '';
    }
};


const LocalDevelopmentIndex: React.FC = () => {
    const [activeTab, setActiveTab] = useState(indicators[0].key);
    const [selectedGovernorate, setSelectedGovernorate] = useState('Amman');

    const averageIndicators = useMemo(() => {
        const totals: { [key in (typeof indicatorKeys)[number]]: number } = {
            economic_activity: 0,
            infrastructure: 0,
            education: 0,
            health: 0,
            social_status: 0,
        };

        for (const gov of DEVELOPMENT_INDICATORS_2024) {
            for (const key of indicatorKeys) {
                totals[key] += gov[key];
            }
        }

        const count = DEVELOPMENT_INDICATORS_2024.length;
        const averages: Partial<DevelopmentIndicators2024> = {};
        for (const key of indicatorKeys) {
            averages[key] = totals[key] / count;
        }
        
        return { ...averages, name: 'Average', name_ar: 'المعدل الوطني' } as DevelopmentIndicators2024;
    }, []);

    const renderContent = () => {
        if (activeTab === 'final_ranking') {
            const analysisHtml = { __html: getAnalysisText(activeTab, FINAL_RANKING_2024) };
            return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="order-2 lg:order-1">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">تحليل الترتيب النهائي</h3>
                        <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-2 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={analysisHtml}></div>
                    </div>
                    <div className="order-1 lg:order-2">
                       <FinalRankingDisplay rankData={FINAL_RANKING_2024} scoreData={DEVELOPMENT_INDICATORS_2024} />
                    </div>
                </div>
            );
        }

        const activeIndicator = indicators.find(ind => ind.key === activeTab)!;
        const sortedData = [...DEVELOPMENT_INDICATORS_2024].sort((a, b) => (b[activeIndicator.key as keyof DevelopmentIndicators2024] as number) - (a[activeIndicator.key as keyof DevelopmentIndicators2024] as number));
        const selectedGovData = DEVELOPMENT_INDICATORS_2024.find(g => g.name === selectedGovernorate)!;
        const analysisHtml = { __html: getAnalysisText(activeIndicator.key, DEVELOPMENT_INDICATORS_2024) };
        
        return (
            <div className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-2">
                        <div className="mb-4">
                            <label htmlFor="gov-select" className="block text-lg font-semibold text-gray-800 dark:text-white mb-2">تحليل أداء المحافظة</label>
                            <select
                                id="gov-select"
                                value={selectedGovernorate}
                                onChange={(e) => setSelectedGovernorate(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                            >
                                {DEVELOPMENT_INDICATORS_2024.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                            </select>
                        </div>
                        <GovernorateRadarChart selectedData={selectedGovData} averageData={averageIndicators} />
                    </div>
                     <div className="lg:col-span-3">
                         <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">تقرير مفصل لمؤشر "{activeIndicator.name}"</h3>
                         <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-2 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={analysisHtml}></div>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">مقارنة جميع المحافظات في مؤشر "{activeIndicator.name}"</h3>
                    <IndicatorComparisonChart data={sortedData} dataKey={activeIndicator.key as keyof DevelopmentIndicators2024} />
                </div>
            </div>
        );
    };

    return (
        <Card>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">مؤشر التنمية المحلية المستدامة (2024)</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                تحليل تفصيلي للترتيب النهائي والمؤشرات الخمسة الرئيسية التي تشكل أساس التنمية في المحافظات، مع مقارنة الأداء وتقديم توصيات بناءً على النتائج. الدرجة الإجمالية لكل مؤشر فرعي هي (من 20).
            </p>
            
            <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    يمثل مؤشر التنمية المحلية المستدامة لعام 2024 أداة تشخيصية وتحليلية كمية، مصممة لتقييم ومقارنة الأداء التنموي الشامل للمحافظات وتوجيه قرارات السياسات نحو الأولويات الأكثر إلحاحاً.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    أهمية وأهداف ومنهجية احتساب مؤشر التنمية المحلية المستدامة لعام 2024:
                </h3>

                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <p><strong>الأهمية والأهداف:</strong> يوفر المؤشر أداة موضوعية وكمية لتقييم الأداء التنموي للمحافظات، ويكشف عن الفجوات ونقاط القوة في مختلف الأبعاد الاقتصادية والاجتماعية والصحية.</p>
                    <p><strong>هيكلية المؤشر:</strong> تم بناء المؤشر على أساس خمسة محاور رئيسية (الاقتصاد، التعليم، الصحة، البنية التحتية، والوضع الاجتماعي)، وتم تخصيص وزن متساوٍ (20%) لكل محور لضمان التوازن في التقييم.</p>
                    <p><strong>منهجية التوحيد:</strong> للجمع بين البيانات المتنوعة، تم توحيدها على مقياس من 0 إلى 100، حيث تم عكس اتجاه المؤشرات السلبية (مثل البطالة والطلاق) لتعطي درجة أعلى للمحافظات ذات القيمة الأقل.</p>
                    <p><strong>تفسير الدرجات:</strong> تعكس الدرجة النهائية (من 100) مدى قرب المحافظة من الوضع التنموي المثالي، حيث تكشف أن الدرجات الأقل من 100 هي مؤشر على الحاجة للتدخلات العاجلة.</p>
                    <p><strong>الاستنتاج العملي:</strong> أظهرت النتائج تركز الأداء العالي في العاصمة وإربد، مع تأكيد أن التحدي الأكبر لجميع المحافظات يتركز في محاور الاقتصاد في الأطراف.</p>
                </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
                    {indicators.map((indicator) => (
                        <button
                            key={indicator.key}
                            onClick={() => setActiveTab(indicator.key)}
                            className={`whitespace-nowrap pb-4 pt-2 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === indicator.key
                                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-200 dark:hover:border-gray-600'
                                }`}
                        >
                            {indicator.name}
                        </button>
                    ))}
                </nav>
            </div>
            
            {renderContent()}
        </Card>
    );
};

export default LocalDevelopmentIndex;
