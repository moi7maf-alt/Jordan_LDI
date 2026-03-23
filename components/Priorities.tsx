
import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { PRIORITIES_DATA } from '../constants/prioritiesData';
import { GOVERNORATES_DATA } from '../constants';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

const sectorColors: { [key: string]: string } = {
    'التعليم': 'bg-blue-100 text-blue-800 border-blue-200',
    'الصحة': 'bg-green-100 text-green-800 border-green-200',
    'المياه': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'الزراعة': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'سوق العمل': 'bg-purple-100 text-purple-800 border-purple-200',
    'البنية التحتية': 'bg-gray-100 text-gray-800 border-gray-200',
    'النقل': 'bg-orange-100 text-orange-800 border-orange-200',
    'البيئة': 'bg-teal-100 text-teal-800 border-teal-200',
    'التنمية الاجتماعية': 'bg-pink-100 text-pink-800 border-pink-200',
    'الأمن': 'bg-red-100 text-red-800 border-red-200',
    'الاستثمار': 'bg-amber-100 text-amber-800 border-amber-200',
    'البلديات': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'الطاقة': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'السياحة': 'bg-rose-100 text-rose-800 border-rose-200',
    'الإسكان': 'bg-slate-100 text-slate-800 border-slate-200',
    'الطرق': 'bg-stone-100 text-stone-800 border-stone-200',
};

const Priorities: React.FC = () => {
    const [selectedGov, setSelectedGov] = useState('Amman');
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const currentPriorities = useMemo(() => {
        return PRIORITIES_DATA.find(p => p.name === selectedGov);
    }, [selectedGov]);

    const handleExportDocx = async () => {
        if (!currentPriorities) return;
        setIsExportingDocx(true);
        try {
            const title = `أولويات الاحتياجات التنموية - محافظة ${currentPriorities.name_ar}`;
            
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
                new Paragraph({ text: "قائمة بأهم 20 احتياجاً ملحاً بناءً على تحليل المؤشرات والبيانات:", style: "Normal" }),
                ...currentPriorities.needs.map(item => [
                    new Paragraph({ text: `${item.rank}. ${item.sector}: ${item.need}`, style: "h2" }),
                    new Paragraph({ text: `المبرر المبني على البيانات: ${item.justification}`, style: "Normal" })
                ]).flat()
            ];

            const doc = new Document({
                styles: docStyles,
                sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `أولويات-${currentPriorities.name_ar}.docx`);
        } catch (error) {
            console.error("Failed to export DOCX:", error);
        } finally {
            setIsExportingDocx(false);
        }
    };

    const handleNativePrint = () => {
        const reportElement = document.getElementById('priorities-content');
        if (!reportElement) return;

        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) return;

        const headContent = `
            <head>
                <title>أولويات الاحتياجات - ${currentPriorities?.name_ar}</title>
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
                    .no-print, button, select { display: none !important; }
                    h1 { font-size: 24pt; font-weight: bold; text-align: center; border-bottom: 3px solid #000; margin-bottom: 30px; padding-bottom: 10px; }
                    .priority-item { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                    .sector { font-weight: bold; color: #444; font-size: 16pt; }
                    .need { font-weight: bold; font-size: 14pt; margin-bottom: 5px; display: block; }
                    .justification { color: #666; font-size: 12pt; }
                    @page { size: A4; margin: 2.5cm; }
                </style>
            </head>
        `;

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <div class="report-header">
                        <h1>أولويات الاحتياجات التنموية: محافظة ${currentPriorities?.name_ar}</h1>
                    </div>
                    <div class="content">
                        ${currentPriorities?.needs.map(item => `
                            <div class="priority-item">
                                <span class="sector">${item.rank}. قطاع ${item.sector}</span>
                                <span class="need">${item.need}</span>
                                <div class="justification"><strong>المبرر:</strong> ${item.justification}</div>
                            </div>
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
            <div className="flex justify-between items-center mb-6 no-print">
                <div className="flex items-center gap-4">
                    <label htmlFor="gov-select" className="text-lg font-semibold text-gray-700">اختر المحافظة:</label>
                    <select
                        id="gov-select"
                        value={selectedGov}
                        onChange={(e) => setSelectedGov(e.target.value)}
                        className="bg-white border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:ring-2 focus:ring-amber-500"
                    >
                        {GOVERNORATES_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                    </select>
                </div>
                <div className="flex gap-4">
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
            </div>

            <div id="priorities-content">
                <header className="text-center border-b border-gray-200 dark:border-gray-700 pb-8 mb-8 no-print">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">أولويات الاحتياجات التنموية: {currentPriorities?.name_ar}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                        قائمة بأهم 20 احتياجاً ملحاً تم استخلاصها بناءً على تحليل الفجوات والمؤشرات الرقمية للقطاعات المختلفة.
                    </p>
                </header>

                <div className="space-y-4">
                    {currentPriorities?.needs.map((item) => (
                        <Card key={item.rank} className="transform transition duration-300 hover:scale-[1.01] hover:shadow-lg border border-gray-100">
                            <div className="flex flex-col md:flex-row gap-4 items-start">
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16">
                                    <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                                        {item.rank}
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 md:mb-0 w-fit ${sectorColors[item.sector] || 'bg-gray-100 text-gray-800'}`}>
                                            قطاع {item.sector}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
                                        {item.need}
                                    </h3>
                                    <div className="bg-slate-50 p-3 rounded-lg border-r-4 border-slate-300">
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            <span className="font-bold text-slate-600">المبرر (تحليل البيانات):</span> {item.justification}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Priorities;
    