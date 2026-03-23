import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { LIVESTOCK_DATA, KINGDOM_LIVESTOCK_TOTALS } from '../constants/livestockData';
import { GOVERNORATES_DATA } from '../constants';
import LivestockTrendChart from './charts/LivestockTrendChart';
import LivestockCompositionChart from './charts/LivestockCompositionChart';

const Livestock: React.FC = () => {
    const [selectedGov, setSelectedGov] = useState('Amman');

    const latestData = useMemo(() => {
        return LIVESTOCK_DATA.map(gov => {
            const lastEntry = gov.data[gov.data.length - 1];
            const baseGovData = GOVERNORATES_DATA.find(g => g.name === gov.name);
            return {
                ...baseGovData!,
                ...lastEntry,
                total_livestock: lastEntry.sheep + lastEntry.goats + lastEntry.cows,
            };
        });
    }, []);
    
    const latestTotals = KINGDOM_LIVESTOCK_TOTALS.data[KINGDOM_LIVESTOCK_TOTALS.data.length - 1];

    const selectedGovData = LIVESTOCK_DATA.find(g => g.name === selectedGov)?.data;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تحليلات الثروة الحيوانية</h1>
                <p className="text-md text-gray-500 dark:text-gray-400 mt-1">نظرة على أعداد الثروة الحيوانية وتوزيعها في محافظات المملكة.</p>
            </header>

            <Card>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">تحليل قطاع الثروة الحيوانية</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    تمثل الثروة الحيوانية قطاعاً حيوياً للأمن الغذائي والاقتصاد الريفي في الأردن. يوضح الرسم البياني لتركيبة الثروة الحيوانية هيمنة قطاع الأغنام، خاصة في محافظات مثل المفرق والعاصمة والكرك، مما يعكس الأهمية الثقافية والاقتصادية لتربية الضأن. تظهر الاتجاهات الزمنية تقلبات في أعداد المواشي، والتي قد تكون مرتبطة بعوامل متعددة مثل أسعار الأعلاف، الظروف المناخية، والسياسات الداعمة للقطاع. خلال جائحة كورونا، واجه القطاع تحديات تتعلق بسلاسل التوريد والطلب، ولكن البيانات تظهر مرونة وقدرة على التعافي في السنوات اللاحقة.
                </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="flex flex-col justify-center items-center bg-yellow-50 dark:bg-yellow-900/50">
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">إجمالي الضأن (2023)</h3>
                    <p className="text-5xl font-bold text-yellow-500 my-2">{latestTotals.sheep.toLocaleString()}</p>
                </Card>
                <Card className="flex flex-col justify-center items-center bg-green-50 dark:bg-green-900/50">
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">إجمالي الماعز (2023)</h3>
                    <p className="text-5xl font-bold text-green-500 my-2">{latestTotals.goats.toLocaleString()}</p>
                </Card>
                 <Card className="flex flex-col justify-center items-center bg-blue-50 dark:bg-blue-900/50">
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">إجمالي الأبقار (2023)</h3>
                    <p className="text-5xl font-bold text-blue-500 my-2">{latestTotals.cows.toLocaleString()}</p>
                </Card>
            </div>
            
            <Card>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">تركيبة الثروة الحيوانية حسب المحافظة (2023)</h3>
                <LivestockCompositionChart data={latestData} />
            </Card>

             <Card>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">اتجاهات أعداد الثروة الحيوانية (2020-2023)</h3>
                    <select
                        value={selectedGov}
                        onChange={(e) => setSelectedGov(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                    >
                        {LIVESTOCK_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                    </select>
                </div>
                {selectedGovData && <LivestockTrendChart data={selectedGovData} />}
            </Card>
        </div>
    );
};

export default Livestock;