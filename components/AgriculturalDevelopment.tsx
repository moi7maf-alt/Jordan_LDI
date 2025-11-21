
import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

// Plant Wealth Data
import { AGRICULTURE_DATA } from '../constants/agricultureData';
import AgricultureTrendChart from './charts/AgricultureTrendChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Livestock Wealth Data
import { LIVESTOCK_DATA, KINGDOM_LIVESTOCK_TOTALS } from '../constants/livestockData';
import { GOVERNORATES_DATA } from '../constants';
import LivestockTrendChart from './charts/LivestockTrendChart';
import LivestockCompositionChart from './charts/LivestockCompositionChart';

type ContentBlock = { type: 'h1' | 'h2' | 'h3' | 'p'; text: string; };

const KpiCard: React.FC<{ title: string; value: string; unit: string; icon: string; bgColor: string; textColor: string; }> = ({ title, value, unit, icon, bgColor, textColor }) => (
    <div className={`p-4 rounded-xl text-center shadow-sm ${bgColor} break-inside-avoid card-container kpi-card-visual`}>
        <div className="text-3xl mb-2 icon-container">{icon}</div>
        <p className={`text-2xl font-bold ${textColor} kpi-value`}>{value}</p>
        <p className="text-xs text-gray-700 mt-1 h-10 flex items-center justify-center kpi-title">{title} ({unit})</p>
    </div>
);


const AgriculturalDevelopment: React.FC = () => {
    // State for Plant Wealth section
    const [selectedPlantGov, setSelectedPlantGov] = useState('Amman');
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    // State for Livestock Wealth section
    const [selectedLivestockGov, setSelectedLivestockGov] = useState('Amman');

    // Memos for Plant Wealth
    const latestPlantData = useMemo(() => {
        return AGRICULTURE_DATA.map(gov => {
            const lastEntry = gov.data[gov.data.length - 1];
            return {
                name_ar: gov.name_ar,
                name: gov.name,
                ...lastEntry,
            };
        }).sort((a,b) => (b.fieldCrops + b.fruitTrees) - (a.fieldCrops + a.fruitTrees));
    }, []);
    
    const latestPlantTotals = useMemo(() => {
        return latestPlantData.reduce((acc, gov) => {
            acc.fieldCrops += gov.fieldCrops;
            acc.fruitTrees += gov.fruitTrees;
            return acc;
        }, { fieldCrops: 0, fruitTrees: 0 });
    }, [latestPlantData]);

    const selectedPlantGovData = AGRICULTURE_DATA.find(g => g.name === selectedPlantGov)?.data;

    // Memos for Livestock Wealth
    const latestLivestockData = useMemo(() => {
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
    
    const latestLivestockTotals = KINGDOM_LIVESTOCK_TOTALS.data[KINGDOM_LIVESTOCK_TOTALS.data.length - 1];
    const selectedLivestockGovData = LIVESTOCK_DATA.find(g => g.name === selectedLivestockGov)?.data;

     const generateReportContent = (): ContentBlock[] => [
        { type: 'h1', text: "التقرير الاستراتيجي: القطاع الزراعي والأمن الغذائي 2024" },
        
        { type: 'h2', text: "1. مقدمة: الزراعة في مواجهة ندرة المياه" },
        { type: 'p', text: "في ظل التحديات العالمية المتزايدة، أصبح تعزيز الأمن الغذائي والاكتفاء الذاتي أولوية استراتيجية قصوى. يمثل القطاع الزراعي في الأردن، بشقيه النباتي والحيواني، حجر الزاوية في هذه المعادلة. يواجه القطاع تحدياً وجودياً يتمثل في شح المياه، حيث تستقبل 90% من أراضي المملكة أقل من 150 ملم من الأمطار سنوياً. رغم ذلك، أظهر القطاع مرونة عالية عبر تبني التكنولوجيا الحديثة، حيث بلغت المساحة المزروعة بالمحاصيل الحقلية حوالي ${(latestPlantTotals.fieldCrops / 1000).toFixed(1)} ألف دونم، والأشجار المثمرة ${(latestPlantTotals.fruitTrees / 1000).toFixed(1)} ألف دونم." },
        
        { type: 'h2', text: "2. الثروة النباتية: خارطة الإنتاج والتخصص" },
        { type: 'p', text: "تُظهر البيانات تخصصاً جغرافياً واضحاً في الإنتاج النباتي. تتربع محافظة المفرق على عرش زراعة الأشجار المثمرة بمساحات شاسعة، مستفيدة من طبيعة أراضيها السهلية وتوفر المياه الجوفية، مما يجعلها المصدر الرئيسي للفواكه والزيتون. في المقابل، تتصدر إربد والعاصمة إنتاج المحاصيل الحقلية (القمح والشعير)، معتمدة بشكل أساسي على الزراعة البعلية. هذا التنوع الجغرافي يعزز التكامل الغذائي، لكنه يتطلب سياسات دعم متباينة تراعي خصوصية كل منطقة (دعم مياه للمفرق، ودعم بذار لإربد)." },

        { type: 'h2', text: "3. الثروة الحيوانية: أرقام النمو وتحديات الأعلاف" },
        { type: 'p', text: `شهد قطاع الثروة الحيوانية نمواً ملحوظاً، حيث وصل إجمالي عدد الضأن إلى ${latestLivestockTotals.sheep.toLocaleString()} رأس، والماعز إلى ${latestLivestockTotals.goats.toLocaleString()} رأس. تتصدر محافظة المفرق أعداد الثروة الحيوانية بفارق كبير (حوالي مليون رأس من الضأن)، تليها العاصمة والكرك. هذا التركز في المفرق يجعلها "خزان اللحوم الحمراء" للمملكة، لكنه يضع ضغطاً بيئياً على المراعي ويتطلب توفير كميات ضخمة من الأعلاف المستوردة، مما يربط الأمن الغذائي بتقلبات الأسعار العالمية.` },

        { type: 'h2', text: "4. قطاعات داعمة: الدواجن والاستزراع السمكي" },
        { type: 'p', text: "حقق قطاع الدواجن مستويات اكتفاء ذاتي ممتازة، حيث بلغ إنتاج لحوم الدواجن 365.8 ألف طن وبيض المائدة حوالي 1.3 مليار بيضة. في المقابل، لا يزال قطاع الأسماك دون الطموح، بفجوة كبيرة بين الإنتاج المحلي (4,251 طن) والاستهلاك (33,647 طن)، مما يفتح باباً واسعاً للاستثمار في مشاريع الاستزراع المائي، خاصة في وادي الأردن والعقبة." },

        { type: 'h2', text: "5. التوصيات الاستراتيجية" },
        { type: 'p', text: "أولاً: التحول الجذري نحو الزراعة الذكية مناخياً (Hydroponics) لرفع كفاءة استخدام المياه." },
        { type: 'p', text: "ثانياً: إنشاء مصانع للأعلاف تعتمد على مدخلات محلية لتقليل فاتورة الاستيراد ودعم مربي الماشية في المفرق والجنوب." },
        { type: 'p', text: "ثالثاً: تشجيع التصنيع الغذائي (تجفيف، تعليب) في مناطق الإنتاج لتقليل الفاقد ما بعد الحصاد وزيادة القيمة المضافة للمنتج المحلي." },
    ];


    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const content = generateReportContent();
            const title = content[0].text;

            const docStyles: IStylesOptions = {
                default: { document: { run: { font: "Arial", size: 24, rightToLeft: true } } },
                paragraphStyles: [
                    { id: "Normal", name: "Normal", run: { size: 24 }, paragraph: { spacing: { after: 120 }, alignment: AlignmentType.RIGHT } },
                    { id: "h1", name: "h1", run: { size: 32, bold: true, color: "2E74B5" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } } },
                    { id: "h2", name: "h2", run: { size: 28, bold: true, color: "4F81BD" }, paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.RIGHT } },
                    { id: "h3", name: "h3", run: { size: 26, bold: true, color: "548DD4" }, paragraph: { spacing: { before: 180, after: 100 }, alignment: AlignmentType.RIGHT } },
                ],
            };

            const paragraphs = content.map(block => {
                let style = block.type.startsWith('h') ? block.type : 'Normal';
                return new Paragraph({
                    children: [new TextRun(block.text)],
                    style: style,
                    bidirectional: true,
                    alignment: (block.type === 'h1') ? AlignmentType.CENTER : AlignmentType.RIGHT,
                });
            });

            const doc = new Document({
                styles: docStyles,
                sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: paragraphs }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${title}.docx`);

        } catch (error) {
            console.error("Failed to export DOCX:", error);
        } finally {
            setIsExportingDocx(false);
        }
    };

    const handleNativePrint = () => {
        const reportElement = document.getElementById('report-content');
        if (!reportElement) return;

        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) return;

        const headContent = `
            <head>
                <title>تقرير القطاع الزراعي - 2024</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Traditional+Arabic:wght@400;700&display=swap');
                    body {
                        font-family: 'Traditional Arabic', serif;
                        direction: rtl;
                        padding: 40px;
                        background: white !important;
                        color: black !important;
                        font-size: 16pt;
                        line-height: 1.6;
                    }
                    .no-print, .recharts-wrapper, button, select, svg, .icon-container, .kpi-card-visual { display: none !important; }
                    
                    .card-container {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin-bottom: 20px !important;
                        break-inside: avoid;
                    }
                    
                    h1 { font-size: 28pt; font-weight: bold; text-align: center; border-bottom: 3px solid #000; margin-bottom: 30px; padding-bottom: 10px; }
                    h2 { font-size: 22pt; font-weight: bold; border-bottom: 1px solid #666; margin-top: 30px; margin-bottom: 15px; }
                    h3 { font-size: 18pt; font-weight: bold; margin-top: 20px; }
                    p, li { text-align: justify; margin-bottom: 12px; }
                    
                    @page { size: A4; margin: 2.5cm; }
                </style>
            </head>
        `;

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <div class="report-header">
                        <h1>التقرير الاستراتيجي: القطاع الزراعي والأمن الغذائي</h1>
                    </div>
                    <div class="content">
                        ${reportElement.innerHTML}
                    </div>
                     <div class="report-footer" style="text-align: center; margin-top: 50px; font-size: 12pt; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
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

    return (
        <div className="space-y-8">
             <div className="flex justify-end items-center mb-6 no-print gap-4">
                <button 
                    onClick={handleExportDocx} 
                    disabled={isExportingDocx}
                    className="px-4 py-2 text-sm font-medium text-black bg-amber-500 rounded-lg hover:bg-amber-600 focus:ring-4 focus:outline-none focus:ring-amber-300 disabled:bg-gray-400 flex items-center gap-2"
                >
                    تصدير (DOCX)
                </button>
                <button onClick={handleNativePrint} className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 flex items-center gap-2">
                    طباعة (تقرير نصي)
                </button>
            </div>
            
            <div id="report-content" className="space-y-8">
                <header className="text-center border-b border-gray-200 dark:border-gray-700 pb-8 no-print">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">تحليلات القطاع الزراعي</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">تحليل استراتيجي للثروة النباتية والحيوانية والأمن الغذائي.</p>
                </header>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. الزراعة في مواجهة ندرة المياه: الواقع والتحديات</h2>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        <p>
                            يشكل القطاع الزراعي صمام الأمان الغذائي للأردن، لكنه يواجه تحدياً وجودياً يتمثل في شح المياه، حيث تستقبل 90% من أراضي المملكة أقل من 150 ملم من الأمطار سنوياً. رغم ذلك، أظهر القطاع مرونة عالية عبر تبني التكنولوجيا الحديثة. تشير البيانات إلى أن إجمالي المساحة المزروعة بالمحاصيل الحقلية بلغت حوالي <strong>{(latestPlantTotals.fieldCrops / 1000).toFixed(1)} ألف دونم</strong>، بينما غطت الأشجار المثمرة <strong>{(latestPlantTotals.fruitTrees / 1000).toFixed(1)} ألف دونم</strong>.
                        </p>
                        <p className="mt-4">
                            تُظهر البيانات تخصصاً جغرافياً واضحاً؛ إذ تتربع <strong>محافظة المفرق</strong> على عرش زراعة الأشجار المثمرة بمساحات شاسعة، مستفيدة من طبيعة أراضيها وتوفر المياه الجوفية، بينما تتصدر <strong>إربد والعاصمة</strong> إنتاج المحاصيل الحقلية (القمح والشعير) اعتماداً على الزراعة البعلية.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 no-print">
                         <div>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">المساحات المزروعة (2023)</h3>
                                <select
                                    value={selectedPlantGov}
                                    onChange={(e) => setSelectedPlantGov(e.target.value)}
                                    className="bg-gray-100 border border-gray-300 rounded-md p-2 text-sm"
                                >
                                    {AGRICULTURE_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                                </select>
                            </div>
                            {selectedPlantGovData && <AgricultureTrendChart data={selectedPlantGovData} />}
                        </div>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. الثروة الحيوانية: خزان الغذاء الاستراتيجي</h2>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        <p>
                            شهد قطاع الثروة الحيوانية نمواً ملحوظاً، حيث وصل إجمالي عدد الضأن إلى <strong>{latestLivestockTotals.sheep.toLocaleString()}</strong> رأس، والماعز إلى <strong>{latestLivestockTotals.goats.toLocaleString()}</strong> رأس. تتصدر <strong>محافظة المفرق</strong> أعداد الثروة الحيوانية بفارق كبير (حوالي مليون رأس من الضأن)، تليها العاصمة والكرك. هذا التركز في المفرق يجعلها "خزان اللحوم الحمراء" للمملكة، لكنه يضع ضغطاً بيئياً على المراعي ويتطلب توفير كميات ضخمة من الأعلاف المستوردة، مما يربط الأمن الغذائي بتقلبات الأسعار العالمية.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 kpi-card-visual">
                        <KpiCard title="إجمالي الضأن (2023)" value={latestLivestockTotals.sheep.toLocaleString()} unit="رأس" icon="🐑" bgColor="bg-yellow-50" textColor="text-yellow-600" />
                        <KpiCard title="إجمالي الماعز (2023)" value={latestLivestockTotals.goats.toLocaleString()} unit="رأس" icon="🐐" bgColor="bg-orange-50" textColor="text-orange-600" />
                        <KpiCard title="إجمالي الأبقار (2023)" value={latestLivestockTotals.cows.toLocaleString()} unit="رأس" icon="🐄" bgColor="bg-blue-50" textColor="text-blue-600" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
                         <div>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">تطور أعداد الثروة الحيوانية</h3>
                                <select
                                    value={selectedLivestockGov}
                                    onChange={(e) => setSelectedLivestockGov(e.target.value)}
                                    className="bg-gray-100 border border-gray-300 rounded-md p-2 text-sm"
                                >
                                    {LIVESTOCK_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                                </select>
                            </div>
                            {selectedLivestockGovData && <LivestockTrendChart data={selectedLivestockGovData} />}
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold text-gray-800 mb-4">التركيب النسبي للثروة الحيوانية (2023)</h3>
                             <LivestockCompositionChart data={latestLivestockData} />
                        </div>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. توصيات استراتيجية</h2>
                    <div className="text-gray-700 dark:text-gray-300 text-lg space-y-4">
                        <p><strong>تعزيز كفاءة استخدام المياه:</strong> التوسع في تقنيات الري الذكي والزراعة المائية (Hydroponics) لزيادة الإنتاجية لكل متر مكعب من المياه.</p>
                        <p><strong>دعم صغار المزارعين:</strong> توفير قروض ميسرة وبرامج إرشاد زراعي لتمكين صغار المزارعين من تبني تكنولوجيات حديثة وتحسين جودة منتجاتهم.</p>
                        <p><strong>التصنيع الغذائي:</strong> تشجيع الاستثمار في الصناعات الغذائية التي تعتمد على المنتجات المحلية (مثل الألبان، زيت الزيتون، تجفيف الفواكه) لزيادة القيمة المضافة وخلق فرص عمل.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AgriculturalDevelopment;
