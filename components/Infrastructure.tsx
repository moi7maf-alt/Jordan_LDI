
import React, { useState } from 'react';
import Card from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { GOVERNORATE_COLORS } from '../constants/colors';
import { Document, Packer, Paragraph, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

const INFRASTRUCTURE_KPI_DATA = {
    roadNetwork: "10,500 كم",
    publicTransport: "45% تغطية",
    digitalConnectivity: "82% انتشار",
    portCapacity: "25 مليون طن"
};

const INFRASTRUCTURE_INDEX_BY_GOVERNORATE = [
    { name_ar: 'عمان', value: 88, name: 'Amman' },
    { name_ar: 'الزرقاء', value: 75, name: 'Zarqa' },
    { name_ar: 'إربد', value: 72, name: 'Irbid' },
    { name_ar: 'العقبة', value: 85, name: 'Aqaba' },
    { name_ar: 'المفرق', value: 60, name: 'Mafraq' },
    { name_ar: 'الكرك', value: 65, name: 'Karak' },
];

const KpiCard: React.FC<{ title: string; value: string; icon: string; }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl text-center shadow-sm break-inside-avoid">
        <div className="text-3xl mb-2">{icon}</div>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title}</p>
    </div>
);

const reportContent = [
    {
        title: "1. الملخص التنفيذي للبنية التحتية",
        content: `تُعد البنية التحتية المتطورة العمود الفقري للتنمية الاقتصادية والاجتماعية في الأردن. شهدت السنوات الأخيرة استثمارات كبيرة في شبكة الطرق، الموانئ، والاتصالات الرقمية. ومع ذلك، لا تزال هناك فجوات في منظومة النقل العام والربط السككي، مما يزيد من تكاليف اللوجستيات ويؤثر على تنافسية الاقتصاد الوطني. التوجه نحو "البنية التحتية الخضراء" والمدن الذكية يمثل أولوية في رؤية التحديث الاقتصادي.`
    },
    {
        title: "2. تحليل الربط اللوجستي والاتصالات",
        content: `تتميز العقبة كمركز لوجستي عالمي بفضل مينائها المتطور والمطار الدولي، مما يربط الأردن بالأسواق العالمية. في المقابل، تعاني محافظات الشمال والشرق من ضغط هائلاً على شبكة الطرق الرئيسية نتيجة حركة الشحن الدولي. التحول الرقمي يسير بخطى متسارعة، حيث وصلت نسبة انتشار الإنترنت إلى مستويات قياسية، مما يمهد الطريق لخدمات حكومية ذكية واقتصاد رقمي متكامل.`
    },
    {
        title: "3. التحديات والحلول الذكية",
        content: `**التحديات:** تآكل البنية التحتية القديمة، نقص التمويل للصيانة الدورية، والزحف العمراني العشوائي الذي يضغط على الخدمات.\n**الحلول الذكية:** استخدام الذكاء الاصطناعي في إدارة المرور، الصيانة التنبؤية للطرق والجسور، وتوسيع شبكات الألياف الضوئية لتشمل كافة المحافظات. إنترنت الأشياء (IoT) يمكن أن يحسن كفاءة استهلاك الطاقة في الإنارة العامة وإدارة النفايات.`
    }
];

const Infrastructure: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير الاستراتيجي: قطاع البنية التحتية 2024";
            const docStyles: IStylesOptions = {
                default: { document: { run: { font: "Arial", size: 24, rightToLeft: true } } },
                paragraphStyles: [
                    { id: "Normal", name: "Normal", run: { size: 24 }, paragraph: { spacing: { after: 120 }, alignment: AlignmentType.RIGHT } },
                    { id: "h1", name: "h1", run: { size: 32, bold: true, color: "2E74B5" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } } },
                    { id: "h2", name: "h2", run: { size: 28, bold: true, color: "4F81BD" }, paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.RIGHT } },
                ],
            };

            const children = [
                new Paragraph({ text: title, style: "h1" }),
                ...reportContent.flatMap(section => [
                    new Paragraph({ text: section.title, style: "h2" }),
                    new Paragraph({ text: section.content, style: "Normal" })
                ])
            ];

            const doc = new Document({
                styles: docStyles,
                sections: [{ children }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${title}.docx`);
        } catch (error) {
            console.error("Failed to export DOCX:", error);
        } finally {
            setIsExportingDocx(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end items-center gap-4 mb-6">
                <button 
                    onClick={handleExportDocx} 
                    disabled={isExportingDocx}
                    className="px-4 py-2 text-sm font-medium text-black bg-amber-500 rounded-lg hover:bg-amber-600 disabled:bg-gray-400"
                >
                    تصدير (DOCX)
                </button>
            </div>

            <header className="text-center border-b border-gray-200 dark:border-gray-700 pb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">قطاع البنية التحتية والنقل</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">تحليل مؤشرات الربط اللوجستي والخدمات الأساسية (2024)</p>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KpiCard title="شبكة الطرق" value={INFRASTRUCTURE_KPI_DATA.roadNetwork} icon="🛣️" />
                <KpiCard title="النقل العام" value={INFRASTRUCTURE_KPI_DATA.publicTransport} icon="🚌" />
                <KpiCard title="الربط الرقمي" value={INFRASTRUCTURE_KPI_DATA.digitalConnectivity} icon="📡" />
                <KpiCard title="سعة الموانئ" value={INFRASTRUCTURE_KPI_DATA.portCapacity} icon="🚢" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-bold mb-4">مؤشر جودة البنية التحتية (1-100)</h3>
                    <div style={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={INFRASTRUCTURE_INDEX_BY_GOVERNORATE}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name_ar" tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Bar dataKey="value" name="مؤشر الجودة" radius={[4, 4, 0, 0]}>
                                    {INFRASTRUCTURE_INDEX_BY_GOVERNORATE.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={GOVERNORATE_COLORS[entry.name] || '#f59e0b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-bold mb-4">التحليل الاستراتيجي</h3>
                    <div className="space-y-4">
                        {reportContent.map((section, idx) => (
                            <div key={idx}>
                                <h4 className="font-bold text-amber-600 dark:text-amber-400">{section.title}</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{section.content}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Infrastructure;
