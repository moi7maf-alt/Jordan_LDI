import React from 'react';
import Card from './ui/Card';

const dataSources = [
    { text: 'الأردن بالأرقام 2024 2024 Figures in Jordan دائرة الإحصاءات العامة | العدد 27', href: null },
    { text: 'التقارير السنوية الاحصائية لوزارة التربية والتعليم', href: null },
    { text: 'التقارير السنوية الاحصائية لوزارة الصحة', href: null },
    { text: 'احصائيات جندرية – دائرة الإحصاءات العامة', href: 'https://jorinfo.dos.gov.jo/Databank/pxweb/ar/GenderStatistcs' },
    { text: 'احصائيات رقمية – مديرية الأمن العام - التقرير الإحصائي الجنائي لعام 2024م', href: null },
    { text: 'الزراعة بالأرقام – التقرير الاحصائي لعام 2024 وزارة الزراعة', href: null },
    { text: 'تقرير حالة البلاد - الثورة الصناعية الرابعة وسوق العمل الأردني 2023 - المجلس الاقتصادي والاجتماعي الأردني', href: null },
    { text: 'التقرير السنوي لصندوق المعونة الوطنية 2024', href: null },
    { text: 'التقرير المالي للبلديات اصدار رقم 2 لعام 2023', href: null },
];

const DataSources: React.FC = () => {
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">مصادر البيانات</h1>
                <p className="text-lg text-gray-700 mt-1">قائمة المراجع والتقارير الرسمية التي تم الاعتماد عليها في بناء هذه المنظومة.</p>
            </header>

            <Card className="card-container">
                <div className="space-y-4">
                    <ul className="list-disc list-outside mr-6 space-y-3 text-lg text-gray-800">
                        {dataSources.map((source, index) => (
                            <li key={index}>
                                {source.href ? (
                                    <a 
                                        href={source.href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        {source.text}
                                    </a>
                                ) : (
                                    <span>{source.text}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>
        </div>
    );
};

export default DataSources;