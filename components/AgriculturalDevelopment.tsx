
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
    <div className={`p-4 rounded-xl text-center shadow-sm ${bgColor} break-inside-avoid card-container`}>
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
        { type: 'h1', text: "تحليلات قطاع الزراعة في الأردن 2024" },
        { type: 'h2', text: "مقدمة: الزراعة ركيزة الأمن الغذائي والاكتفاء الذاتي" },
        { type: 'p', text: "في ظل التحديات العالمية المتزايدة، أصبح تعزيز الأمن الغذائي والاكتفاء الذاتي أولوية استراتيجية قصوى. يمثل القطاع الزراعي في الأردن، بشقيه النباتي والحيواني، حجر الزاوية في هذه المعادلة. يواجه القطاع تحديات هيكلية أبرزها ندرة المياه (حيث 90% من أراضي المملكة تستقبل أقل من 150 ملم من الأمطار سنوياً)، إلا أنه يمتلك فرصاً واعدة للنمو عبر تبني التكنولوجيا الحديثة، وتحسين إدارة الموارد، وتنويع مصادر الإنتاج. هذا القسم يقدم تحليلاً شاملاً لمكونات الثروة الزراعية ويسلط الضوء على الجهود المبذولة لتعزيز استدامة هذا القطاع الحيوي." },
        
        { type: 'h2', text: "أولاً: الثروة النباتية" },
        { type: 'p', text: "تتركز الزراعات المروية للخضروات بشكل كبير في منطقة الأغوار التي تعتبر 'سلة غذاء الأردن' بفضل مناخها الدافئ شتاءً، بينما تعتمد المحاصيل الحقلية بشكل كبير على مياه الأمطار. تُظهر محافظة المفرق تفوقاً واضحاً في زراعة الأشجار المثمرة، مستفيدة من المساحات الواسعة، تليها العاصمة والبلقاء. أما المحاصيل الحقلية، فتتصدرها العاصمة وإربد. الفرص تكمن في التوسع بالزراعات المحمية، واستخدام تقنيات توفير المياه، والتركيز على المحاصيل ذات القيمة التصديرية العالية." },

        { type: 'h2', text: "ثانياً: الثروة الحيوانية" },
        { type: 'p', text: "شهد قطاع الثروة الحيوانية نمواً ملحوظاً في عام 2024، حيث ارتفع إنتاج الحليب بنسبة 13.6% وإنتاج اللحوم الحمراء بنسبة 36.1%، مما يعكس جهوداً ناجحة في هذا القطاع. تتصدر محافظة المفرق أعداد الضأن بفارق كبير، تليها العاصمة والكرك. أما الماعز، فتتركز بشكل أكبر في العقبة والمفرق ومعان. التحدي الأكبر يتمثل في الاعتماد على الأعلاف المستوردة، بينما تكمن الفرص في تحسين السلالات وتطوير الصناعات التحويلية للحوم والألبان." },

        { type: 'h2', text: "ثالثاً: قطاع الدواجن" },
        { type: 'p', text: "يعتبر قطاع الدواجن قصة نجاح في تحقيق مستويات عالية من الاكتفاء الذاتي، حيث بلغ إنتاج لحوم الدواجن 365.8 ألف طن وبيض المائدة حوالي 1.3 مليار بيضة في 2024. هذا الإنجاز يجعله مصدراً رئيسياً للبروتين بأسعار معقولة. ومع ذلك، يواجه القطاع تحدي تقلب أسعار الأعلاف عالمياً، مما يؤثر على تكلفة الإنتاج. الفرص المستقبلية تكمن في فتح أسواق تصديرية جديدة للمنتجات الأردنية." },

        { type: 'h2', text: "رابعاً: قطاعات أخرى واعدة" },
        { type: 'h3', text: "الثروة السمكية" },
        { type: 'p', text: "يُظهر قطاع الأسماك فجوة كبيرة بين الإنتاج المحلي (4,251 طن) والاستهلاك (33,647 طن). هذه الفجوة الواسعة تمثل فرصة استثمارية ضخمة للتوسع في مشاريع الاستزراع المائي لتلبية الطلب المحلي وتقليل فاتورة الاستيراد." },
        { type: 'h3', text: "تربية النحل وإنتاج العسل" },
        { type: 'p', text: "بوجود أكثر من 40 ألف خلية نحل حديثة وإنتاج 830 طناً من العسل، يمتلك الأردن فرصة لتنمية هذا القطاع. يتميز العسل الأردني بجودته العالية وتنوعه بفضل الغطاء النباتي الفريد، مما يفتح آفاقاً واعدة للتصدير والوصول إلى الأسواق العالمية." },
    ];


    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const content = generateReportContent();
            const title = content[0].text;

            const docStyles: IStylesOptions = {
                default: { document: { run: { font: "Arial", size: 24, rightToLeft: true } } },
                paragraphStyles: [
                    { id: "Normal", name: "Normal", run: { size: 24 }, paragraph: { spacing: { after: 120 } } },
                    { id: "h1", name: "h1", run: { size: 40, bold: true, color: "2E74B5" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } } },
                    { id: "h2", name: "h2", run: { size: 32, bold: true, color: "4F81BD" }, paragraph: { spacing: { before: 240, after: 120 } } },
                    { id: "h3", name: "h3", run: { size: 28, bold: true, color: "548DD4" }, paragraph: { spacing: { before: 180, after: 100 } } },
                ],
            };

            const paragraphs = content.map(block => {
                let style = block.type.startsWith('h') ? block.type : 'Normal';
                return new Paragraph({
                    children: [new TextRun(block.text)],
                    style: style,
                    bidirectional: true,
                    alignment: AlignmentType.RIGHT,
                });
            });

             if (paragraphs.length > 0) {
                 paragraphs[0].properties.alignment = AlignmentType.CENTER;
            }

            const doc = new Document({
                styles: docStyles,
                sections: [{ properties: { page: { margin: { top: 1134, right: 850, bottom: 1134, left: 850 } } }, children: paragraphs }],
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
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                    body {
                        font-family: 'Cairo', sans-serif;
                        direction: rtl;
                        padding: 40px;
                        background: white !important;
                        color: black !important;
                        font-size: 14pt;
                    }
                    * {
                        box-shadow: none !important;
                        background: transparent !important;
                        border-radius: 0 !important;
                        border: none !important;
                    }
                    .grid, .flex { display: block !important; }
                    .no-print, .recharts-wrapper, button, select { display: none !important; }
                    
                    .card-container {
                        padding: 0 !important;
                        margin: 0 0 20px 0 !important;
                        border-bottom: 1px solid #eee !important;
                    }
                    
                    h1 { font-size: 26pt !important; text-align: center; border-bottom: 2px solid black; margin-bottom: 20px; }
                    h2 { font-size: 20pt !important; border-bottom: 1px solid #ccc; margin-top: 30px; break-after: avoid; }
                    h3 { font-size: 18pt !important; color: #333; margin-top: 20px; break-after: avoid; }
                    p, li { font-size: 14pt !important; line-height: 1.6; text-align: justify; }
                    
                    .icon-container { display: inline-block !important; font-size: 16pt !important; margin-left: 10px; }
                    
                    .kpi-value { font-size: 18pt !important; font-weight: bold !important; }
                    .kpi-title { font-size: 12pt !important; color: #555 !important; }

                    @page { size: A4; margin: 20mm; }
                </style>
            </head>
        `;

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <div class="report-header">
                        <h1>تقرير تحليلي: القطاع الزراعي والأمن الغذائي</h1>
                    </div>
                    <div class="content">
                        ${reportElement.innerHTML}
                    </div>
                     <div class="report-footer" style="text-align: center; margin-top: 50px; font-size: 10pt; color: #666;">
                        وزارة الداخلية - منظومة التحليل التنموي
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                </button>
                <button onClick={handleNativePrint} className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    طباعة / حفظ PDF (وثيقة نظيفة)
                </button>
            </div>
            
            <div id="report-content" className="space-y-8">
                <header className="text-center border-b border-gray-200 dark:border-gray-700 pb-8 no-print">
                    <h1 className="text-3xl font-bold text-gray-900">تحليلات القطاع الزراعي</h1>
                    <p className="text-lg text-gray-500 mt-1">تحليل شامل للثروة النباتية والحيوانية لتحقيق الأمن الغذائي.</p>
                </header>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. الثروة النباتية: الواقع والتحديات</h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        يشكل القطاع النباتي العمود الفقري للأمن الغذائي في الأردن. تتنوع الزراعات بين المحاصيل الحقلية التي تعتمد بشكل كبير على مياه الأمطار، والأشجار المثمرة والخضروات المروية. تبرز محافظات المفرق، إربد، والبلقاء كمراكز إنتاج رئيسية. ومع ذلك، يواجه القطاع تحديات تتمثل في تذبذب الهطول المطري، ندرة الموارد المائية، والزحف العمراني على الأراضي الزراعية.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                         <div className="no-print">
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
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                             <h3 className="font-bold text-green-800 mb-2">حقائق رئيسية (2023)</h3>
                             <ul className="list-disc list-outside mr-4 text-green-700 space-y-2">
                                 <li><strong>{(latestPlantTotals.fieldCrops / 1000).toFixed(1)} ألف دونم</strong>: إجمالي مساحة المحاصيل الحقلية.</li>
                                 <li><strong>{(latestPlantTotals.fruitTrees / 1000).toFixed(1)} ألف دونم</strong>: إجمالي مساحة الأشجار المثمرة.</li>
                                 <li>تتصدر <strong>المفرق</strong> زراعة الأشجار المثمرة، بينما تتصدر <strong>إربد</strong> المحاصيل الحقلية.</li>
                             </ul>
                        </div>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. الثروة الحيوانية: مصدر حيوي للبروتين</h2>
                    <p className="text-gray-600 leading-relaxed text-lg mb-6">
                        تعتبر الثروة الحيوانية رافداً أساسياً للاقتصاد الريفي ومصدراً رئيسياً للغذاء. شهد عام 2024 نمواً في إنتاج اللحوم الحمراء والألبان. ومع ذلك، يعاني القطاع من ارتفاع تكاليف مدخلات الإنتاج، خاصة الأعلاف المستوردة.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        <KpiCard title="إجمالي الضأن (2023)" value={latestLivestockTotals.sheep.toLocaleString()} unit="رأس" icon="🐑" bgColor="bg-yellow-50" textColor="text-yellow-600" />
                        <KpiCard title="إجمالي الماعز (2023)" value={latestLivestockTotals.goats.toLocaleString()} unit="رأس" icon="🐐" bgColor="bg-orange-50" textColor="text-orange-600" />
                        <KpiCard title="إجمالي الأبقار (2023)" value={latestLivestockTotals.cows.toLocaleString()} unit="رأس" icon="🐄" bgColor="bg-blue-50" textColor="text-blue-600" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="no-print">
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
                        <div className="no-print">
                             <h3 className="text-lg font-semibold text-gray-800 mb-4">التركيب النسبي للثروة الحيوانية (2023)</h3>
                             <LivestockCompositionChart data={latestLivestockData} />
                        </div>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. توصيات استراتيجية</h2>
                    <div className="text-gray-700 text-lg space-y-4">
                        <p><strong>تعزيز كفاءة استخدام المياه:</strong> التوسع في تقنيات الري الذكي والزراعة المائية (Hydroponics) لزيادة الإنتاجية لكل متر مكعب من المياه.</p>
                        <p><strong>دعم صغار المزارعين:</strong> توفير قروض ميسرة وبرامج إرشاد زراعي لتمكين صغار المزارعين من تبني تكنولوجيات حديثة وتحسين جودة منتجاتهم.</p>
                        <p><strong>التصنيع الغذائي:</strong> تشجيع الاستثمار في الصناعات الغذائية التي تعتمد على المنتجات المحلية (مثل الألبان، زيت الزيتون، تجفيف الفواكه) لزيادة القيمة المضافة وخلق فرص عمل.</p>
                        <p><strong>تطوير سلاسل التوريد:</strong> تحسين البنية التحتية للتخزين والنقل المبرد لتقليل الفاقد ما بعد الحصاد وفتح أسواق تصديرية جديدة.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AgriculturalDevelopment;
