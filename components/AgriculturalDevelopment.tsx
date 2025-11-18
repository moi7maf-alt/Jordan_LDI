import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    <div className={`p-4 rounded-xl text-center shadow-sm ${bgColor}`}>
        <div className="text-3xl mb-2">{icon}</div>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        <p className="text-xs text-gray-700 mt-1 h-10 flex items-center justify-center">{title} ({unit})</p>
    </div>
);


const AgriculturalDevelopment: React.FC = () => {
    // State for Plant Wealth section
    const [selectedPlantGov, setSelectedPlantGov] = useState('Amman');
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

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

    const handleExportPdf = async () => {
        setIsExportingPdf(true);
        const input = document.getElementById('report-content');
        if (!input) {
            setIsExportingPdf(false);
            return;
        }

        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const topMargin = 20;
            const bottomMargin = 20;
            const leftMargin = 15;
            const rightMargin = 15;

            const contentWidth = pdfWidth - leftMargin - rightMargin;
            const pageContentHeight = pdfHeight - topMargin - bottomMargin;

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / contentWidth;
            const scaledImgHeight = imgHeight / ratio;

            let heightLeft = scaledImgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', leftMargin, topMargin, contentWidth, scaledImgHeight);
            heightLeft -= pageContentHeight;

            while (heightLeft > 0) {
                position -= pageContentHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', leftMargin, position + topMargin, contentWidth, scaledImgHeight);
                heightLeft -= pageContentHeight;
            }
            
            pdf.save('report-agriculture.pdf');
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExportingPdf(false);
        }
    };

    return (
        <div className="space-y-8" id="report-content">
            <div data-html2canvas-ignore="true" className="flex justify-end items-center gap-4 mb-6 no-print">
                <button 
                    onClick={handleExportDocx} 
                    disabled={isExportingDocx}
                    className="px-4 py-2 text-sm font-medium text-black bg-amber-500 rounded-lg hover:bg-amber-600 focus:ring-4 focus:outline-none focus:ring-amber-300 disabled:bg-gray-400 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                </button>
                <button 
                    onClick={handleExportPdf} 
                    disabled={isExportingPdf}
                    className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 focus:z-10 focus:ring-4 focus:ring-gray-100 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    {isExportingPdf ? 'جاري التصدير...' : 'تصدير (PDF)'}
                </button>
            </div>
            <header>
                <h1 className="text-3xl font-bold text-gray-900">تحليلات قطاع الزراعة (2024)</h1>
                <p className="text-md text-gray-700 mt-1">نظرة متكاملة على قطاعات الثروة النباتية والحيوانية والدواجن ودورها في تحقيق الأمن الغذائي الوطني.</p>
            </header>

            <Card className="card-container">
                 <h2 className="text-xl font-bold text-gray-900 mb-2">الزراعة: ركيزة الأمن الغذائي والاكتفاء الذاتي</h2>
                <p className="text-gray-800 leading-relaxed">
                   في ظل التحديات العالمية المتزايدة، أصبح تعزيز الأمن الغذائي والاكتفاء الذاتي أولوية استراتيجية قصوى. يمثل القطاع الزراعي في الأردن، بشقيه النباتي والحيواني، حجر الزاوية في هذه المعادلة. يواجه القطاع تحديات هيكلية أبرزها ندرة المياه (حيث 90% من أراضي المملكة تستقبل أقل من 150 ملم من الأمطار سنوياً)، إلا أنه يمتلك فرصاً واعدة للنمو عبر تبني التكنولوجيا الحديثة، وتحسين إدارة الموارد، وتنويع مصادر الإنتاج. هذا القسم يقدم تحليلاً شاملاً لمكونات الثروة الزراعية ويسلط الضوء على الجهود المبذولة لتعزيز استدامة هذا القطاع الحيوي.
                </p>
            </Card>

            {/* Section 1: Plant Wealth */}
            <div className="space-y-8 pt-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-emerald-100"><span className="text-2xl">🌱</span></div>
                    <div><h2 className="text-2xl font-bold text-gray-900">أولاً: الثروة النباتية</h2></div>
                </div>
                <Card><p className="text-gray-800 leading-relaxed">تتركز الزراعات المروية للخضروات بشكل كبير في منطقة الأغوار التي تعتبر "سلة غذاء الأردن" بفضل مناخها الدافئ شتاءً، بينما تعتمد المحاصيل الحقلية بشكل كبير على مياه الأمطار. تُظهر محافظة المفرق تفوقاً واضحاً في زراعة الأشجار المثمرة، مستفيدة من المساحات الواسعة، تليها العاصمة والبلقاء. أما المحاصيل الحقلية، فتتصدرها العاصمة وإربد. الفرص تكمن في التوسع بالزراعات المحمية، واستخدام تقنيات توفير المياه، والتركيز على المحاصيل ذات القيمة التصديرية العالية مثل الخضار والفواكه التي تم تصدير ما مجموعه 405 و 180 ألف طن منها على التوالي في 2024.</p></Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><KpiCard title="إجمالي مساحة المحاصيل الحقلية" value={(latestPlantTotals.fieldCrops / 1000).toFixed(1)} unit="ألف دونم" icon="🌾" bgColor="bg-emerald-50" textColor="text-emerald-500" /><KpiCard title="إجمالي مساحة الأشجار المثمرة" value={(latestPlantTotals.fruitTrees / 1000).toFixed(1)} unit="ألف دونم" icon="🌳" bgColor="bg-amber-50" textColor="text-amber-500" /></div>
                <Card className="card-container"><h3 className="text-lg font-semibold text-gray-800 mb-4">المساحات المزروعة حسب المحافظة (دونم - 2023)</h3><div style={{ width: '100%', height: 400 }}><ResponsiveContainer><BarChart data={latestPlantData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" /><XAxis dataKey="name_ar" tick={{ fontSize: 12, fill: '#333333' }} /><YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} tick={{ fontSize: 12, fill: '#333333' }} /><Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }} cursor={{ fill: 'rgba(75, 85, 99, 0.2)' }} /><Legend wrapperStyle={{ fontSize: '14px' }} /><Bar dataKey="fieldCrops" name="محاصيل حقلية" stackId="a" fill="#34d399" /><Bar dataKey="fruitTrees" name="أشجار مثمرة" stackId="a" fill="#fbbf24" /></BarChart></ResponsiveContainer></div></Card>
                <Card className="card-container"><div className="flex justify-between items-center mb-4 no-print"><h3 className="text-lg font-semibold text-gray-800">اتجاهات المساحات المزروعة (2020-2023)</h3><select value={selectedPlantGov} onChange={(e) => setSelectedPlantGov(e.target.value)} className="bg-gray-100 border border-gray-300 rounded-md p-2 text-sm">{AGRICULTURE_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}</select></div>{selectedPlantGovData && <AgricultureTrendChart data={selectedPlantGovData} />}</Card>
            </div>

            {/* Section 2: Livestock Wealth */}
            <div className="space-y-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4"><div className="w-12 h-12 flex items-center justify-center rounded-lg bg-orange-100"><span className="text-2xl">🐑</span></div><div><h2 className="text-2xl font-bold text-gray-900">ثانياً: الثروة الحيوانية</h2></div></div>
                <Card><p className="text-gray-800 leading-relaxed">شهد قطاع الثروة الحيوانية نمواً ملحوظاً في عام 2024، حيث ارتفع إنتاج الحليب بنسبة 13.6% وإنتاج اللحوم الحمراء بنسبة 36.1%، مما يعكس جهوداً ناجحة في هذا القطاع الحيوي. تتصدر محافظة المفرق أعداد الضأن بفارق كبير، تليها العاصمة والكرك. أما الماعز، فتتركز بشكل أكبر في العقبة والمفرق ومعان. التحدي الأكبر يتمثل في الاعتماد على الأعلاف المستوردة، بينما تكمن الفرص في تحسين السلالات وتطوير الصناعات التحويلية للحوم والألبان لزيادة القيمة المضافة.</p></Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8"><KpiCard title="إجمالي الضأن" value={latestLivestockTotals.sheep.toLocaleString()} unit="رأس" icon="🐑" bgColor="bg-yellow-50" textColor="text-yellow-500" /><KpiCard title="إجمالي الماعز" value={latestLivestockTotals.goats.toLocaleString()} unit="رأس" icon="🐐" bgColor="bg-green-50" textColor="text-green-500" /><KpiCard title="إجمالي الأبقار" value={latestLivestockTotals.cows.toLocaleString()} unit="رأس" icon="🐄" bgColor="bg-blue-50" textColor="text-blue-500" /></div>
                <Card className="card-container"><h3 className="text-lg font-semibold text-gray-800 mb-4">تركيبة الثروة الحيوانية حسب المحافظة (2023)</h3><LivestockCompositionChart data={latestLivestockData} /></Card>
                <Card className="card-container"><div className="flex justify-between items-center mb-4 no-print"><h3 className="text-lg font-semibold text-gray-800">اتجاهات أعداد الثروة الحيوانية (2020-2023)</h3><select value={selectedLivestockGov} onChange={(e) => setSelectedLivestockGov(e.target.value)} className="bg-gray-100 border border-gray-300 rounded-md p-2 text-sm">{LIVESTOCK_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}</select></div>{selectedLivestockGovData && <LivestockTrendChart data={selectedLivestockGovData} />}</Card>
            </div>
            
            {/* Section 3: Poultry Sector */}
             <div className="space-y-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4"><div className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-100"><span className="text-2xl">🐔</span></div><div><h2 className="text-2xl font-bold text-gray-900">ثالثاً: قطاع الدواجن</h2></div></div>
                <Card><p className="text-gray-800 leading-relaxed">يعتبر قطاع الدواجن قصة نجاح في تحقيق مستويات عالية من الاكتفاء الذاتي، ويُعد مصدراً رئيسياً للبروتين بأسعار معقولة في المملكة. على الرغم من انخفاض طفيف في إنتاج اللحوم بنسبة 1.1% في 2024، إلا أن القطاع لا يزال قوياً. التحدي الأكبر هو تقلب أسعار الأعلاف عالمياً، مما يؤثر على تكلفة الإنتاج. الفرص المستقبلية تكمن في فتح أسواق تصديرية جديدة للمنتجات الأردنية ذات الجودة العالية.</p></Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><KpiCard title="إنتاج لحوم الدواجن" value={"365.8"} unit="ألف طن" icon="🍗" bgColor="bg-red-50" textColor="text-red-500" /><KpiCard title="إنتاج بيض المائدة" value={"1.3"} unit="مليار بيضة" icon="🥚" bgColor="bg-orange-50" textColor="text-orange-500" /></div>
            </div>

            {/* Section 4: Other Sectors */}
            <div className="space-y-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4"><div className="w-12 h-12 flex items-center justify-center rounded-lg bg-cyan-100"><span className="text-2xl">🐝</span></div><div><h2 className="text-2xl font-bold text-gray-900">رابعاً: قطاعات أخرى واعدة</h2></div></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">الثروة السمكية</h3>
                        <p className="text-sm text-center text-gray-700 mb-4">يُظهر قطاع الأسماك فجوة كبيرة بين الإنتاج المحلي والاستهلاك، مما يمثل فرصة استثمارية ضخمة للتوسع في مشاريع الاستزراع المائي لتلبية الطلب المحلي وتقليل فاتورة الاستيراد.</p>
                        <div className="grid grid-cols-2 gap-4"><KpiCard title="الإنتاج المحلي" value={"4,251"} unit="طن" icon="🐟" bgColor="bg-cyan-50" textColor="text-cyan-500" /><KpiCard title="الاستهلاك المتاح" value={"33,647"} unit="طن" icon="🍽️" bgColor="bg-gray-100" textColor="text-gray-600" /></div>
                    </Card>
                     <Card>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">تربية النحل وإنتاج العسل</h3>
                        <p className="text-sm text-center text-gray-700 mb-4">يمتلك الأردن فرصة لتنمية هذا القطاع بفضل جودة العسل الأردني وتنوعه، مما يفتح آفاقاً واعدة للتصدير والوصول إلى الأسواق العالمية.</p>
                        <div className="grid grid-cols-2 gap-4"><KpiCard title="إنتاج العسل" value={"830"} unit="طن" icon="🍯" bgColor="bg-yellow-50" textColor="text-yellow-600" /><KpiCard title="عدد الخلايا الحديثة" value={"40,217"} unit="خلية" icon="🐝" bgColor="bg-gray-100" textColor="text-gray-600" /></div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AgriculturalDevelopment;