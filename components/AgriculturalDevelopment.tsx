
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

const KpiCard: React.FC<{ title: string; value: string; unit: string; icon: string; bgColor: string; textColor: string; }> = ({ title, value, unit, icon, bgColor, textColor }) => (
    <div className={`p-4 rounded-xl text-center shadow-sm ${bgColor} break-inside-avoid card-container kpi-card-visual`}>
        <div className="text-3xl mb-2 icon-container">{icon}</div>
        <p className={`text-2xl font-bold ${textColor} kpi-value`}>{value}</p>
        <p className="text-xs text-gray-700 mt-1 h-10 flex items-center justify-center kpi-title">{title} ({unit})</p>
    </div>
);

const AgriculturalDevelopment: React.FC = () => {
    // State for Charts
    const [selectedPlantGov, setSelectedPlantGov] = useState('Amman');
    const [selectedLivestockGov, setSelectedLivestockGov] = useState('Amman');
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    // --- Memos & Data Processing ---

    // Plant Data Processing
    const latestPlantData = useMemo(() => {
        return AGRICULTURE_DATA.map(gov => {
            const lastEntry = gov.data[gov.data.length - 1];
            return {
                name_ar: gov.name_ar,
                name: gov.name,
                ...lastEntry,
                total_area: lastEntry.fieldCrops + lastEntry.fruitTrees
            };
        }).sort((a,b) => b.total_area - a.total_area);
    }, []);
    
    const latestPlantTotals = useMemo(() => {
        return latestPlantData.reduce((acc, gov) => {
            acc.fieldCrops += gov.fieldCrops;
            acc.fruitTrees += gov.fruitTrees;
            return acc;
        }, { fieldCrops: 0, fruitTrees: 0 });
    }, [latestPlantData]);

    const selectedPlantGovData = AGRICULTURE_DATA.find(g => g.name === selectedPlantGov)?.data;

    // Livestock Data Processing
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

    // --- Narrative Content Generation (Unified Framework) ---

    const reportContent = [
        {
            title: "1. الملخص التنفيذي والأثر الاستراتيجي",
            content: `يحتل القطاع الزراعي مكانة محورية في منظومة الأمن الغذائي والاقتصاد الوطني. رغم مساهمته المتواضعة في الناتج المحلي الإجمالي المباشر، إلا أن أثره الاستراتيجي يمتد ليشمل الأمن الغذائي، والاستقرار الاجتماعي في الأرياف، وتشغيل القوى العاملة. تظهر بيانات عام 2023 استقراراً في المساحات المزروعة بالأشجار المثمرة (${(latestPlantTotals.fruitTrees / 1000).toFixed(1)} ألف دونم) ونمواً في أعداد الثروة الحيوانية (خاصة الضأن الذي وصل إلى 3.4 مليون رأس). ومع ذلك، يواجه القطاع تحديات هيكلية تتمثل في ندرة المياه، والتغير المناخي، وتركز الإنتاج في مناطق محددة (المفرق للزراعة، والضأن)، مما يجعله عرضة للصدمات البيئية والاقتصادية.`
        },
        {
            title: "2. الإطار العام للقطاع والمشهد الديموغرافي",
            content: `يرتبط النشاط الزراعي ارتباطاً وثيقاً بالجغرافيا والديموغرافيا. تتركز الزراعة المروية المكثفة (خاصة الأشجار المثمرة) في محافظة المفرق التي تضم وحدها 242 ألف دونم من الأشجار المثمرة، مستفيدة من المياه الجوفية والمساحات الشاسعة. في المقابل، تعتمد محافظات إربد وعمان على الزراعة المطرية (المحاصيل الحقلية) التي ترتبط بالمواسم وتوفر دخلاً موسمياً للأسر الريفية. ديموغرافياً، يُعد القطاع مشغلاً رئيسياً للعمالة في الأطراف، خاصة العمالة الوافدة والنساء العاملات في قطاع الزراعة غير المنظم، مما يجعله ركيزة للحماية الاجتماعية في المناطق الأقل حظاً.`
        },
        {
            title: "3. تحليل الأداء التنموي والمؤشرات الرئيسية (KPIs)",
            content: `**الثروة النباتية:** تتصدر محافظة العاصمة إنتاج المحاصيل الحقلية (164,749 دونم)، مما يعكس استغلالاً جيداً للأراضي في جنوب وشرق عمان. بينما تهيمن المفرق على قطاع الأشجار المثمرة. التذبذب في مساحات المحاصيل الحقلية في المفرق (انخفاض ثم ارتفاع) يشير إلى مخاطر الاعتماد على الزراعة البعلية.\n**الثروة الحيوانية:** شهد قطاع الضأن طفرة في المفرق ليصل إلى قرابة مليون رأس، مما يجعلها "خزان اللحوم الحمراء" للمملكة. كما لوحظ نمو كبير في أعداد الماعز في العقبة ومعان، مما يعكس تكيف المجتمعات المحلية مع البيئة الجافة. أما قطاع الأبقار، فيتركز بشكل مكثف في الزرقاء (40,010 رأس) وإربد، بينما يغيب بشكل شبه كامل عن محافظات الجنوب، مما يخلق فجوة في إنتاج الحليب الطازج.`
        },
        {
            title: "4. دراسة الأبعاد التنموية وكفاءة الموارد",
            content: `كفاءة استخدام الموارد المائية هي التحدي الأكبر. تركز الزراعة المروية في المفرق (التي تعتمد على المياه الجوفية غير المتجددة) يطرح تساؤلات حول الاستدامة طويلة الأمد. في المقابل، يعتبر التوسع في زراعة الزيتون في جرش وعجلون (زراعة بعلية) نموذجاً أكثر استدامة وكفاءة. اقتصادياً، يعاني صغار المزارعين من ضعف حلقات التسويق وارتفاع كلف المدخلات (أعلاف، أسمدة)، مما يقلل من هوامش الربح ويدفع البعض لهجر الأراضي الزراعية. القيمة المضافة للقطاع لا تزال منخفضة بسبب ضعف التصنيع الغذائي الذي يمتص فائض الإنتاج.`
        },
        {
            title: "5. تحليل الفجوات والمخاطر والبيئة التنافسية",
            content: `**فجوة الأمن الغذائي:** الاعتماد الكبير على استيراد الحبوب والأعلاف يجعل القطاع مكشوفاً لتقلبات الأسعار العالمية.\n**الفجوة المناطقية:** تركز الثروة الحيوانية (الضأن) في المفرق (30% من المجموع) يجعل أي وباء حيواني هناك كارثة وطنية. كما أن غياب مزارع الأبقار في الجنوب يرفع كلفة منتجات الألبان هناك.\n**المخاطر:** التغير المناخي وتذبذب الهطول المطري يهدد الزراعات البعلية في إربد والكرك. كما أن الزحف العمراني على الأراضي الخصبة في عمان وإربد يقلص الرقعة الزراعية بشكل لا رجعة فيه.`
        },
        {
            title: "6. الأولويات والتوجهات الاستراتيجية للقطاع",
            content: `تتركز الأولويات في:\n1. **الزراعة الذكية مناخياً:** التوسع في استخدام أصناف بذور مقاومة للجفاف وتقنيات الري الموفرة للمياه.\n2. **سلاسل القيمة:** تحويل الزراعة من "إنتاج خام" إلى "تصنيع غذائي" (رب البندورة، المخللات، الأجبان) لزيادة القيمة المضافة وتشغيل العمالة المحلية.\n3. **تنويع مصادر المياه:** التوسع في استخدام المياه المعالجة لزراعة الأعلاف في المناطق المحاذية لمحطات التنقية، لتخفيف الضغط على المياه الجوفية.`
        },
        {
            title: "7. التوصيات التخطيطية ومتطلبات التنفيذ",
            content: `لتعزيز صمود ونمو القطاع، يوصى بتبني التوصيات التالية:
* **صندوق المخاطر السيادي للمفرق:** نظراً للأهمية الاستراتيجية للمفرق في الأمن الغذائي (نباتي وحيواني)، يجب إنشاء صندوق طوارئ خاص بالأوبئة والجفاف لهذه المحافظة حصراً.
* **توطين الاستثمار في الجنوب:** تقديم أراضي وحوافز طاقة مدعومة لإنشاء مزارع أبقار ومصانع ألبان في الكرك ومعان لسد الفجوة الغذائية وتقليل كلف النقل من الشمال.
* **قاعدة البيانات الزراعية الوطنية:** إنشاء نظام تتبع إلكتروني آني (Real-time) للمنتجات الزراعية لربط الإنتاج بالاستهلاك وتوجيه المزارعين نحو الزراعات المطلوبة، للحد من الاختناقات التسويقية.
* **حماية الرقعة الزراعية:** تفعيل قوانين صارمة (Zero Tolerance) لمنع تفتيت الملكية والزحف العمراني في سهول حوران (إربد) ومأدبا، واعتبارها مناطق محمية استراتيجياً.
* **التحول نحو الزراعة المائية (Hydroponics):** دعم قروض بدون فوائد للمزارعين في وادي الأردن والمناطق الصحراوية لتبني تقنيات الزراعة المائية التي توفر 80% من المياه.
* **التصنيع الغذائي التعاوني:** دعم إنشاء جمعيات تعاونية في عجلون وجرش لإنشاء وحدات تصنيع غذائي (زيت زيتون، منتجات ألبان) لزيادة القيمة المضافة للمنتج المحلي.`
        }
    ];

    // --- Export Logic ---

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير القطاعي الشامل: الزراعة 2024";

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
                sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }],
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
                        font-size: 14pt;
                        line-height: 1.6;
                    }
                    .no-print, .recharts-wrapper, button, select, svg, .icon-container, .kpi-card-visual { display: none !important; }
                    .card-container { box-shadow: none !important; border: none !important; padding: 0 !important; margin-bottom: 20px !important; }
                    h1 { font-size: 24pt; font-weight: bold; text-align: center; border-bottom: 3px solid #000; margin-bottom: 30px; padding-bottom: 10px; }
                    h2 { font-size: 18pt; font-weight: bold; border-bottom: 1px solid #666; margin-top: 30px; margin-bottom: 15px; }
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
                        <h1>التقرير القطاعي الشامل: الزراعة والأمن الغذائي 2024</h1>
                    </div>
                    <div class="content">
                        ${reportContent.map(section => `
                            <h2>${section.title}</h2>
                            <p>${section.content.replace(/\n/g, '<br/>')}</p>
                        `).join('')}
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
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">التقرير الاستراتيجي للقطاع الزراعي</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">تحليل معمق للثروة النباتية والحيوانية وتحديات الأمن الغذائي (2024).</p>
                </header>

                {reportContent.map((section, idx) => (
                    <Card key={idx} className="card-container">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                            {section.content.split('\n').map((line, i) => {
                                const parts = line.split(/(\*\*.*?\*\*)/g);
                                return (
                                    <p key={i} className="mb-3">
                                        {parts.map((part, j) => 
                                            part.startsWith('**') && part.endsWith('**') 
                                                ? <strong key={j} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong> 
                                                : part
                                        )}
                                    </p>
                                );
                            })}
                        </div>
                        {idx === 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 kpi-card-visual mt-6">
                                <KpiCard title="إجمالي الضأن (2023)" value={latestLivestockTotals.sheep.toLocaleString()} unit="رأس" icon="🐑" bgColor="bg-yellow-50" textColor="text-yellow-600" />
                                <KpiCard title="إجمالي المحاصيل الحقلية" value={(latestPlantTotals.fieldCrops / 1000).toFixed(1)} unit="ألف دونم" icon="🌾" bgColor="bg-emerald-50" textColor="text-emerald-600" />
                                <KpiCard title="إجمالي الأبقار (2023)" value={latestLivestockTotals.cows.toLocaleString()} unit="رأس" icon="🐄" bgColor="bg-blue-50" textColor="text-blue-600" />
                            </div>
                        )}
                        {idx === 2 && (
                            <div className="mt-8 no-print">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-md font-semibold text-center mb-2">المساحات المزروعة حسب المحافظة (2023)</h4>
                                        <div style={{ width: '100%', height: 350 }}>
                                            <ResponsiveContainer>
                                                <BarChart data={latestPlantData} margin={{ top: 20, right: 5, left: 5, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                                    <XAxis dataKey="name_ar" tick={{ fontSize: 11, fill: '#333333' }} interval={0} />
                                                    <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} tick={{ fontSize: 11, fill: '#333333' }} />
                                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderRadius: '0.5rem', color: '#fff' }} />
                                                    <Legend />
                                                    <Bar dataKey="fieldCrops" name="محاصيل حقلية" stackId="a" fill="#10b981" />
                                                    <Bar dataKey="fruitTrees" name="أشجار مثمرة" stackId="a" fill="#f59e0b" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-md font-semibold text-center mb-2">توزيع الثروة الحيوانية حسب المحافظة (2023)</h4>
                                        <LivestockCompositionChart data={latestLivestockData} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AgriculturalDevelopment;
