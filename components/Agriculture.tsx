import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, IStylesOptions } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Plant Wealth Data
import { AGRICULTURE_DATA } from '../constants/agricultureData';
import AgricultureTrendChart from './charts/AgricultureTrendChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Livestock Wealth Data
import { LIVESTOCK_DATA, KINGDOM_LIVESTOCK_TOTALS } from '../constants/livestockData';
// FIX: Import GOVERNORATES_DATA to provide full data for charts.
import { GOVERNORATES_DATA } from '../constants';
import LivestockTrendChart from './charts/LivestockTrendChart';
import LivestockCompositionChart from './charts/LivestockCompositionChart';

type ContentBlock = { type: 'h1' | 'h2' | 'p'; text: string; };

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
        // FIX: Merge with GOVERNORATES_DATA to satisfy the GovernorateData type which includes population, etc.
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

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "تحليلات قطاع الزراعة";
            const content: ContentBlock[] = [
                { type: 'h1', text: title },
                { type: 'p', text: "نظرة متكاملة على قطاعي الثروة النباتية والحيوانية ودورهما في تحقيق الأمن الغذائي الوطني." },
                { type: 'h2', text: "الزراعة: ركيزة الأمن الغذائي والاكتفاء الذاتي" },
                { type: 'p', text: "في ظل التحديات العالمية المتزايدة، أصبح تعزيز الأمن الغذائي والاكتفاء الذاتي أولوية استراتيجية قصوى. يمثل القطاع الزراعي في الأردن، بشقيه النباتي والحيواني، حجر الزاوية في هذه المعادلة. يواجه القطاع تحديات هيكلية أبرزها ندرة المياه، إلا أنه يمتلك فرصاً واعدة للنمو عبر تبني التكنولوجيا الحديثة، وتحسين إدارة الموارد، وتنويع مصادر الإنتاج. هذا القسم يقدم تحليلاً شاملاً لمكونات الثروة الزراعية، ويسلط الضوء على الجهود المبذولة لتعزيز استدامة هذا القطاع الحيوي." },
                { type: 'h2', text: "الثروة النباتية" },
                { type: 'p', text: "تحليل المساحات المزروعة بالمحاصيل الحقلية والأشجار المثمرة." },
                { type: 'h2', text: "الثروة الحيوانية" },
                { type: 'p', text: "أعداد المواشي وتوزيعها ودورها في الاقتصاد الريفي." },
            ];

            const docStyles: IStylesOptions = {
                default: { document: { run: { font: "Calibri", size: 24, rightToLeft: true } } },
                paragraphStyles: [
                    { id: "Normal", name: "Normal", basedOn: "Normal", next: "Normal", run: { size: 24 }, paragraph: { spacing: { after: 120 } } },
                    { id: "h1", name: "h1", basedOn: "Normal", next: "Normal", run: { size: 48, bold: true, color: "2E74B5" }, paragraph: { spacing: { before: 240, after: 120 } } },
                    { id: "h2", name: "h2", basedOn: "Normal", next: "Normal", run: { size: 36, bold: true, color: "4F81BD" }, paragraph: { spacing: { before: 240, after: 120 } } },
                ],
            };

            const paragraphs: Paragraph[] = [];
            content.forEach((block, index) => {
                paragraphs.push(new Paragraph({
                    children: [new TextRun(block.text)],
                    style: block.type.startsWith('h') ? block.type : 'Normal',
                    bidirectional: true,
                    alignment: (block.type === 'h1' && index === 0) ? AlignmentType.CENTER : AlignmentType.RIGHT,
                }));
            });

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
            <div className="flex justify-end items-center gap-4 mb-6 no-print">
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
                <button 
                    onClick={handleExportPdf} 
                    disabled={isExportingPdf}
                    className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-slate-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {isExportingPdf ? 'جاري التصدير...' : 'تصدير (PDF)'}
                </button>
            </div>
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تحليلات قطاع الزراعة</h1>
                <p className="text-md text-gray-500 dark:text-gray-400 mt-1">نظرة متكاملة على قطاعي الثروة النباتية والحيوانية ودورهما في تحقيق الأمن الغذائي الوطني.</p>
            </header>

            <Card className="card-container">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">الزراعة: ركيزة الأمن الغذائي والاكتفاء الذاتي</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    في ظل التحديات العالمية المتزايدة، أصبح تعزيز الأمن الغذائي والاكتفاء الذاتي أولوية استراتيجية قصوى. يمثل القطاع الزراعي في الأردن، بشقيه النباتي والحيواني، حجر الزاوية في هذه المعادلة. يواجه القطاع تحديات هيكلية أبرزها ندرة المياه، إلا أنه يمتلك فرصاً واعدة للنمو عبر تبني التكنولوجيا الحديثة، وتحسين إدارة الموارد، وتنويع مصادر الإنتاج. هذا القسم يقدم تحليلاً شاملاً لمكونات الثروة الزراعية، ويسلط الضوء على الجهود المبذولة لتعزيز استدامة هذا القطاع الحيوي.
                </p>
            </Card>

            {/* Section 1: Plant Wealth */}
            <div className="space-y-8 pt-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15s4-6 9-6 9 6 9 6m-9-6V4m0 11v-2m0-9a2 2 0 100-4 2 2 0 000 4zm0 0v2"></path><path d="M12 21a9 9 0 00-9-9h18a9 9 0 00-9 9z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الثروة النباتية</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">تحليل المساحات المزروعة بالمحاصيل الحقلية والأشجار المثمرة.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="card-container flex flex-col justify-center items-center bg-emerald-50 dark:bg-emerald-900/50">
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">إجمالي مساحة المحاصيل الحقلية (2023)</h3>
                        <p className="text-5xl font-bold text-emerald-500 my-2">{(latestPlantTotals.fieldCrops / 1000).toFixed(1)} ألف</p>
                        <p className="text-sm text-gray-400">دونم</p>
                    </Card>
                    <Card className="card-container flex flex-col justify-center items-center bg-amber-50 dark:bg-amber-900/50">
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">إجمالي مساحة الأشجار المثمرة (2023)</h3>
                        <p className="text-5xl font-bold text-amber-500 my-2">{(latestPlantTotals.fruitTrees / 1000).toFixed(1)} ألف</p>
                        <p className="text-sm text-gray-400">دونم</p>
                    </Card>
                </div>
                
                <Card className="card-container">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">المساحات المزروعة حسب المحافظة (دونم - 2023)</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={latestPlantData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name_ar" tick={{ fontSize: 12, fill: '#333333' }} />
                                <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} tick={{ fontSize: 12, fill: '#333333' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem', color: '#fff' }} cursor={{ fill: 'rgba(75, 85, 99, 0.2)' }} />
                                <Legend wrapperStyle={{ fontSize: '14px' }} />
                                <Bar dataKey="fieldCrops" name="محاصيل حقلية" stackId="a" fill="#6ee7b7" />
                                <Bar dataKey="fruitTrees" name="أشجار مثمرة" stackId="a" fill="#fcd34d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                 <Card className="card-container">
                     <div className="flex justify-between items-center mb-4 no-print">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">اتجاهات المساحات المزروعة (2020-2023)</h3>
                        <select
                            value={selectedPlantGov}
                            onChange={(e) => setSelectedPlantGov(e.target.value)}
                            className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                        >
                            {AGRICULTURE_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                        </select>
                    </div>
                    {selectedPlantGovData && <AgricultureTrendChart data={selectedPlantGovData} />}
                </Card>
            </div>

            {/* Section 2: Livestock Wealth */}
            <div className="space-y-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                     <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12l-4-4-4 4m4 4v8m-4-4h8"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 10.5C6 8.5 8.5 7 12 7s6 1.5 7.5 3.5"></path></svg>
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الثروة الحيوانية</h2>
                         <p className="text-sm text-gray-500 dark:text-gray-400">أعداد المواشي وتوزيعها ودورها في الاقتصاد الريفي.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="card-container flex flex-col justify-center items-center bg-yellow-50 dark:bg-yellow-900/50">
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">إجمالي الضأن (2023)</h3>
                        <p className="text-5xl font-bold text-yellow-500 my-2">{latestLivestockTotals.sheep.toLocaleString()}</p>
                    </Card>
                    <Card className="card-container flex flex-col justify-center items-center bg-green-50 dark:bg-green-900/50">
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">إجمالي الماعز (2023)</h3>
                        <p className="text-5xl font-bold text-green-500 my-2">{latestLivestockTotals.goats.toLocaleString()}</p>
                    </Card>
                     <Card className="card-container flex flex-col justify-center items-center bg-blue-50 dark:bg-blue-900/50">
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">إجمالي الأبقار (2023)</h3>
                        <p className="text-5xl font-bold text-blue-500 my-2">{latestLivestockTotals.cows.toLocaleString()}</p>
                    </Card>
                </div>
                
                <Card className="card-container">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">تركيبة الثروة الحيوانية حسب المحافظة (2023)</h3>
                    <LivestockCompositionChart data={latestLivestockData} />
                </Card>

                 <Card className="card-container">
                     <div className="flex justify-between items-center mb-4 no-print">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">اتجاهات أعداد الثروة الحيوانية (2020-2023)</h3>
                        <select
                            value={selectedLivestockGov}
                            onChange={(e) => setSelectedLivestockGov(e.target.value)}
                            className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                        >
                            {LIVESTOCK_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                        </select>
                    </div>
                    {selectedLivestockGovData && <LivestockTrendChart data={selectedLivestockGovData} />}
                </Card>
            </div>

        </div>
    );
};

export default AgriculturalDevelopment;