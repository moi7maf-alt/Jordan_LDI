
import React, { useState } from 'react';
import Card from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { GOVERNORATE_COLORS } from '../constants/colors';
import { Document, Packer, Paragraph, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

const TOURISM_KPI_DATA = {
    totalVisitors: "6,350,000",
    tourismRevenue: "5.2 مليار د.أ",
    hotelRooms: "32,450",
    registeredSites: "27,000+"
};

const VISITORS_BY_GOVERNORATE = [
    { name_ar: 'عمان', value: 2150000, name: 'Amman' },
    { name_ar: 'العقبة', value: 1850000, name: 'Aqaba' },
    { name_ar: 'مأدبا', value: 950000, name: 'Madaba' },
    { name_ar: 'جرش', value: 750000, name: 'Jarash' },
    { name_ar: 'عجلون', value: 450000, name: 'Ajloun' },
    { name_ar: 'إربد', value: 200000, name: 'Irbid' },
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
        title: "1. الملخص التنفيذي لقطاع السياحة",
        content: `يُعد قطاع السياحة أحد الركائز الأساسية للاقتصاد الوطني الأردني، حيث يساهم بنسبة كبيرة في الناتج المحلي الإجمالي. شهد عام 2024 نمواً ملحوظاً في أعداد الزوار الدوليين، مدفوعاً باستقرار المملكة وتنوع المنتج السياحي بين السياحة الدينية، العلاجية، والمغامرات. ومع ذلك، لا يزال القطاع يواجه تحديات تتعلق بالموسمية وتركز النشاط السياحي في "المثلث الذهبي" (عمان، البتراء، وادي رم، العقبة)، مما يتطلب استراتيجيات لتوزيع المكاسب السياحية على باقي المحافظات.`
    },
    {
        title: "2. تحليل الأداء السياحي حسب المحافظات",
        content: `تتصدر العاصمة عمان القائمة كوجهة رئيسية لسياحة الأعمال والمؤتمرات، تليها العقبة كمنفذ بحري ومركز للسياحة الترفيهية. تبرز مأدبا وجرش كأهم مراكز السياحة الثقافية والأثرية. التحليل يظهر فجوة في البنية التحتية السياحية في محافظات الشمال والجنوب البعيدة، حيث تفتقر للخدمات الفندقية المتنوعة والمرافق الترفيهية التي تطيل مدة إقامة السائح. التوجه نحو "السياحة المجتمعية" في عجلون والطفيلة يمثل فرصة واعدة لخلق فرص عمل محلية.`
    },
    {
        title: "3. التحديات والفرص المستقبلية",
        content: `**التحديات:** تذبذب الأوضاع الإقليمية، ارتفاع تكاليف التشغيل (الطاقة والمياه)، ونقص العمالة الماهرة في بعض المهن السياحية المتخصصة.\n**الفرص:** التحول الرقمي في تسويق الوجهات، تطوير سياحة الاستشفاء، واستثمار المواقع الأثرية غير المكتشفة بالكامل. الذكاء الاصطناعي يمكن أن يلعب دوراً محورياً في تخصيص تجارب السياح والتنبؤ بأنماط السفر العالمية.`
    }
];

const Tourism: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير الاستراتيجي: قطاع السياحة 2024";
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
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">قطاع السياحة والآثار</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">تحليل المؤشرات السياحية والأثر الاقتصادي (2024)</p>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KpiCard title="إجمالي الزوار" value={TOURISM_KPI_DATA.totalVisitors} icon="🌍" />
                <KpiCard title="الدخل السياحي" value={TOURISM_KPI_DATA.tourismRevenue} icon="💰" />
                <KpiCard title="الغرف الفندقية" value={TOURISM_KPI_DATA.hotelRooms} icon="🏨" />
                <KpiCard title="المواقع المسجلة" value={TOURISM_KPI_DATA.registeredSites} icon="🏛️" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-bold mb-4">توزيع الزوار حسب المحافظة</h3>
                    <div style={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={VISITORS_BY_GOVERNORATE} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name_ar" type="category" width={80} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                                <Bar dataKey="value" name="عدد الزوار" radius={[0, 4, 4, 0]}>
                                    {VISITORS_BY_GOVERNORATE.map((entry, index) => (
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

export default Tourism;
