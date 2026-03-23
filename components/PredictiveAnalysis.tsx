
import React, { useState } from 'react';
import Card from './ui/Card';
import { AI_PREDICTIVE_ANALYSIS_DATA, GOVERNORATES_DATA } from '../constants';
import { generateProjectAnalysis } from '../services/geminiService';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import saveAs from 'file-saver';

// Component to parse and render text with numbered lists
const RichTextParser: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const lines = text.split('\n').filter(line => line.trim() !== '');

    return (
        <div className="space-y-2">
            {lines.map((line, lineIndex) => {
                const trimmedLine = line.trim();
                const numberedMatch = trimmedLine.match(/^(\d+[\.\-]\s?)/);
                
                if (numberedMatch) {
                    const content = trimmedLine.substring(numberedMatch[0].length);
                    return (
                        <div key={lineIndex} className="flex items-start">
                            <span className="ml-2 font-semibold text-gray-800 dark:text-gray-400">{numberedMatch[1].replace(/\s?$/, ' ')}</span>
                            <span>{content}</span>
                        </div>
                    );
                }

                return <p key={lineIndex}>{trimmedLine}</p>;
            })}
        </div>
    );
};


// Component to render trend icon based on status
const TrendIcon: React.FC<{ status?: string }> = ({ status }) => {
    if (status === 'positive') {
        return (
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7 7 7M12 3v18"></path>
                </svg>
                صعود
            </span>
        );
    }
    if (status === 'negative') {
        return (
            <span className="inline-flex items-center text-rose-600 dark:text-rose-400 font-bold">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7-7-7M12 21V3"></path>
                </svg>
                هبوط
            </span>
        );
    }
    if (status === 'improvement') {
        return (
            <span className="inline-flex items-center text-amber-600 dark:text-amber-500 font-bold">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7 7 7M12 3v18"></path>
                </svg>
                تحسن
            </span>
        );
    }
    return null;
};


// The original predictive analysis table component for DESKTOP
const AiPredictiveAnalysisTable: React.FC = () => {
    return (
        <Card>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    التحليل التنبؤي وحلول الذكاء الاصطناعي الاستراتيجية (2025-2028)
                </h2>
                <p className="mt-3 text-md text-gray-700 dark:text-gray-400 max-w-4xl mx-auto">
                    يستعرض هذا التقرير نتائج التحليل الكمي المتقدم المدعوم بمنهجيات الذكاء الاصطناعي، مسلطاً الضوء على **قصص النجاح والاتجاهات الإيجابية** لتعزيزها، و**التحديات القائمة** لوضع حلول استباقية لها، مما يدعم اتخاذ قرارات تنموية متوازنة.
                </p>
            </div>

            <div className="overflow-x-auto relative shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm text-right text-gray-800 dark:text-gray-400">
                    <thead className="text-xs text-gray-800 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-4 py-3 w-[15%]">القطاع</th>
                            <th scope="col" className="px-4 py-3 w-[20%]">الاتجاه التنبؤي</th>
                            <th scope="col" className="px-4 py-3 w-[20%]">التحليل التنبؤي (الأسباب والعوامل)</th>
                            <th scope="col" className="px-4 py-3 w-[22.5%]">الحلول التقليدية (تخفيف الأثر)</th>
                            <th scope="col" className="px-4 py-3 w-[22.5%]">حلول إبداعية/ذكية (خارج الصندوق)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {AI_PREDICTIVE_ANALYSIS_DATA.map((item: any, index) => (
                            <tr key={index} className="bg-white border-b dark:bg-slate-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 align-top">
                                <th scope="row" className="px-4 py-4 font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                    <span className="text-lg mr-2">{item.icon}</span> {item.sector}
                                </th>
                                <td className="px-4 py-4 leading-relaxed">
                                    <div className="mb-2">
                                        <TrendIcon status={item.trend_status} />
                                    </div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200">{item.trend}</div>
                                </td>
                                <td className="px-4 py-4 leading-relaxed text-gray-700 dark:text-gray-300">{item.analysis}</td>
                                <td className="px-4 py-4 leading-relaxed"><RichTextParser text={item.traditional_solutions} /></td>
                                <td className="px-4 py-4 leading-relaxed bg-blue-50 dark:bg-blue-900/20"><RichTextParser text={item.ai_solutions} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};


// The new responsive card-based component for MOBILE
const AiPredictiveAnalysisCards: React.FC = () => {
    const [openSections, setOpenSections] = useState<{ [key: number]: { traditional: boolean; ai: boolean } }>({});

    const toggleSection = (index: number, section: 'traditional' | 'ai') => {
        setOpenSections(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [section]: !prev[index]?.[section]
            }
        }));
    };

    return (
        <Card>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    التحليل التنبؤي وحلول الذكاء الاصطناعي
                </h2>
                <p className="mt-3 text-md text-gray-700 dark:text-gray-400 max-w-4xl mx-auto">
                    استعراض للاتجاهات الإيجابية لتعزيزها والتحديات المتوقعة لمعالجتها (2025-2028).
                </p>
            </div>
            <div className="space-y-6">
                {AI_PREDICTIVE_ANALYSIS_DATA.map((item: any, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                <span className="text-xl ml-2">{item.icon}</span> {item.sector}
                            </h3>
                            <TrendIcon status={item.trend_status} />
                        </div>
                        
                        <div className="space-y-4">
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                                <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">الاتجاه التنبؤي</h4>
                                <p className="text-sm leading-relaxed font-medium">{item.trend}</p>
                            </div>
                            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                                <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-1">التحليل والأسباب</h4>
                                <p className="text-sm leading-relaxed">{item.analysis}</p>
                            </div>

                            {/* Accordion for Traditional Solutions */}
                            <div>
                                <button
                                    onClick={() => toggleSection(index, 'traditional')}
                                    className="w-full flex justify-between items-center text-right p-3 bg-gray-100 dark:bg-slate-700 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                    aria-expanded={!!openSections[index]?.traditional}
                                >
                                    <span className="font-semibold">الحلول التقليدية (تخفيف الأثر)</span>
                                    <svg className={`w-5 h-5 transition-transform duration-200 ${openSections[index]?.traditional ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                {openSections[index]?.traditional && (
                                    <div className="p-3 mt-2 border-r-2 border-amber-500 mr-2 text-sm leading-relaxed bg-white dark:bg-slate-800 rounded-md">
                                        <RichTextParser text={item.traditional_solutions} />
                                    </div>
                                )}
                            </div>

                            {/* Accordion for AI Solutions */}
                            <div>
                                <button
                                    onClick={() => toggleSection(index, 'ai')}
                                    className="w-full flex justify-between items-center text-right p-3 bg-blue-100 dark:bg-blue-900 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                    aria-expanded={!!openSections[index]?.ai}
                                >
                                    <span className="font-semibold text-blue-900 dark:text-blue-100">حلول إبداعية/ذكية</span>
                                     <svg className={`w-5 h-5 transition-transform duration-200 ${openSections[index]?.ai ? 'rotate-180' : ''} text-blue-900 dark:text-blue-100`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                {openSections[index]?.ai && (
                                     <div className="p-3 mt-2 border-r-2 border-blue-500 mr-2 text-sm leading-relaxed bg-blue-50 dark:bg-slate-800 rounded-md">
                                        <RichTextParser text={item.ai_solutions} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// Section to describe the nature of data used for prediction
const DataNatureSection: React.FC = () => {
    return (
        <Card>
            <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full">
                    <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">طبيعة البيانات والهدف الاستراتيجي من التنبؤ</h3>
                    <p className="text-gray-700 dark:text-gray-400 mb-4 leading-relaxed">
                        يعتمد التحليل التنبؤي في هذه المنظومة على معالجة خوارزمية متقدمة لبيانات السلاسل الزمنية الممتدة لعدة سنوات سابقة، بهدف استشراف الاتجاه التنموي مستقبلاً اعتماداً على الواقع الحالي. تسعى هذه العملية إلى 
                        <span className="font-bold text-emerald-600 dark:text-emerald-400"> رصد وتعزيز قصص النجاح والاتجاهات الإيجابية </span> 
                        (مثل التحول الرقمي والطاقة المتجددة) وفي المقابل وضع استراتيجيات استباقية 
                        <span className="font-bold text-rose-600 dark:text-rose-400"> لمعالجة الفجوات والمؤشرات السلبية </span>، 
                        وتشمل هذه البيانات:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <p className="text-sm"><span className="font-semibold">المؤشرات الديموغرافية:</span> تتبع معدلات النمو السكاني وتوزيع القوى العاملة.</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <p className="text-sm"><span className="font-semibold">البيانات الاقتصادية:</span> تحليل اتجاهات البطالة، الدخل، والنشاط التجاري المحلي.</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <p className="text-sm"><span className="font-semibold">مؤشرات الموارد:</span> بيانات استهلاك المياه، الطاقة، والمساحات الزراعية المتاحة.</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <p className="text-sm"><span className="font-semibold">الخطط الاستراتيجية:</span> مواءمة التنبؤات مع أهداف رؤية التحديث الاقتصادي 2033.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const PredictiveAnalysis: React.FC = () => {
    const [projectIdea, setProjectIdea] = useState('');
    const [selectedGov, setSelectedGov] = useState('Amman');
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "تقرير التحليل التنبؤي وحلول الذكاء الاصطناعي الاستراتيجية (2025-2028)";
            
            const docStyles: IStylesOptions = {
                default: { document: { run: { font: "Arial", size: 24, rightToLeft: true } } },
                paragraphStyles: [
                    { id: "Normal", name: "Normal", run: { size: 24 }, paragraph: { spacing: { after: 120 }, alignment: AlignmentType.RIGHT } },
                    { id: "h1", name: "h1", run: { size: 32, bold: true, color: "2E74B5" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } } },
                    { id: "h2", name: "h2", run: { size: 28, bold: true, color: "4F81BD" }, paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.RIGHT } },
                ],
            };

            const tableHeader = new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "القطاع", bold: true })] })], width: { size: 15, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "الاتجاه التنبؤي", bold: true })] })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "التحليل والأسباب", bold: true })] })], width: { size: 20, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "الحلول التقليدية", bold: true })] })], width: { size: 22.5, type: WidthType.PERCENTAGE } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "حلول إبداعية/ذكية", bold: true })] })], width: { size: 22.5, type: WidthType.PERCENTAGE } }),
                ],
            });

            const tableRows = AI_PREDICTIVE_ANALYSIS_DATA.map((item: any) => {
                return new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: `${item.icon} ${item.sector}` })] }),
                        new TableCell({ children: [new Paragraph({ text: item.trend })] }),
                        new TableCell({ children: [new Paragraph({ text: item.analysis })] }),
                        new TableCell({ children: item.traditional_solutions.split('\n').map((line: string) => new Paragraph({ text: line })) }),
                        new TableCell({ children: item.ai_solutions.split('\n').map((line: string) => new Paragraph({ text: line })) }),
                    ],
                });
            });

            const table = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [tableHeader, ...tableRows],
            });

            const children = [
                new Paragraph({ text: title, style: "h1" }),
                new Paragraph({ text: "يستعرض هذا التقرير نتائج التحليل الكمي المتقدم المدعوم بمنهجيات الذكاء الاصطناعي، مسلطاً الضوء على قصص النجاح والاتجاهات الإيجابية لتعزيزها، والتحديات القائمة لوضع حلول استباقية لها.", style: "Normal" }),
                new Paragraph({ text: "جدول التحليل التنبؤي", style: "h2" }),
                table,
            ];

            if (analysisResult) {
                children.push(new Paragraph({ text: "نتائج محاكي المشاريع التنموية", style: "h2" }));
                children.push(new Paragraph({ text: `فكرة المشروع: ${projectIdea}`, style: "Normal" }));
                children.push(new Paragraph({ text: `المحافظة: ${selectedGov}`, style: "Normal" }));
                children.push(new Paragraph({ text: analysisResult, style: "Normal" }));
            }

            const doc = new Document({
                styles: docStyles,
                sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `تقرير_التحليل_التنبؤي_2025.docx`);
        } catch (error) {
            console.error("Failed to export DOCX:", error);
        } finally {
            setIsExportingDocx(false);
        }
    };

    const handleNativePrint = () => {
        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) return;

        const headContent = `
            <head>
                <title>تقرير التحليل التنبؤي - 2025</title>
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
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #000; padding: 10px; text-align: right; font-size: 12pt; }
                    th { background-color: #f2f2f2; }
                    h1 { font-size: 24pt; font-weight: bold; text-align: center; border-bottom: 3px solid #000; margin-bottom: 30px; padding-bottom: 10px; }
                    h2 { font-size: 18pt; font-weight: bold; border-bottom: 1px solid #666; margin-top: 30px; margin-bottom: 15px; }
                    .no-print { display: none !important; }
                    @page { size: A4 landscape; margin: 1.5cm; }
                </style>
            </head>
        `;

        const tableRows = AI_PREDICTIVE_ANALYSIS_DATA.map((item: any) => `
            <tr>
                <td>${item.icon} ${item.sector}</td>
                <td>${item.trend}</td>
                <td>${item.analysis}</td>
                <td>${item.traditional_solutions.replace(/\n/g, '<br/>')}</td>
                <td>${item.ai_solutions.replace(/\n/g, '<br/>')}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <h1>تقرير التحليل التنبؤي وحلول الذكاء الاصطناعي الاستراتيجية</h1>
                    <p>يستعرض هذا التقرير نتائج التحليل الكمي المتقدم المدعوم بمنهجيات الذكاء الاصطناعي (2025-2028).</p>
                    <table>
                        <thead>
                            <tr>
                                <th>القطاع</th>
                                <th>الاتجاه التنبؤي</th>
                                <th>التحليل والأسباب</th>
                                <th>الحلول التقليدية</th>
                                <th>حلول إبداعية/ذكية</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    ${analysisResult ? `
                        <h2>نتائج محاكي المشاريع التنموية</h2>
                        <p><strong>فكرة المشروع:</strong> ${projectIdea}</p>
                        <p><strong>المحافظة:</strong> ${selectedGov}</p>
                        <div style="white-space: pre-wrap;">${analysisResult}</div>
                    ` : ''}
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

    const handleAnalyze = async () => {
        if (!projectIdea.trim()) {
            setError('الرجاء إدخال فكرة المشروع.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult('');

        try {
            const result = await generateProjectAnalysis(projectIdea, selectedGov);
            setAnalysisResult(result);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء تحليل المشروع.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 no-print">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التحليل التنبؤي الاستراتيجي</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleNativePrint}
                        className="flex items-center px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors border border-gray-200 dark:border-gray-600"
                    >
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                        </svg>
                        طباعة التقرير
                    </button>
                    <button
                        onClick={handleExportDocx}
                        disabled={isExportingDocx}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        {isExportingDocx ? 'جاري التصدير...' : 'تحميل DOCX'}
                    </button>
                </div>
            </div>

            <DataNatureSection />
            
            {/* Responsive container for the analysis section */}
            <div className="hidden md:block">
                 <AiPredictiveAnalysisTable />
            </div>
             <div className="block md:hidden">
                 <AiPredictiveAnalysisCards />
            </div>

             <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">محاكي المشاريع التنموية (مدعوم بـ Gemini)</h2>
                <p className="text-sm text-gray-700 dark:text-gray-400 mb-6">
                    أدخل فكرة مشروع تنموي، واختر المحافظة، واحصل على تحليل فوري للأثر المتوقع والتحديات المحتملة.
                </p>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <textarea
                            value={projectIdea}
                            onChange={(e) => setProjectIdea(e.target.value)}
                            placeholder="مثال: إنشاء مصنع لتجهيز المنتجات الزراعية في محافظة المفرق..."
                            className="md:col-span-2 w-full pr-4 pl-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 h-24"
                            disabled={isLoading}
                        />
                         <div className="space-y-4">
                             <select
                                value={selectedGov}
                                onChange={(e) => setSelectedGov(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm"
                            >
                                {GOVERNORATES_DATA.map(g => <option key={g.name} value={g.name_ar}>{g.name_ar}</option>)}
                            </select>
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || !projectIdea.trim()}
                                className="w-full px-6 py-3 text-black bg-amber-500 rounded-md disabled:bg-gray-400 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                            >
                                {isLoading ? '...جاري التحليل' : 'تحليل الأثر'}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-center">{error}</p>}

                    {isLoading && (
                        <div className="flex justify-center items-center p-8">
                            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    
                    {analysisResult && (
                        <div className="mt-6 p-6 bg-gray-50 dark:bg-slate-900/50 rounded-lg prose prose-sm dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-200">{analysisResult}</pre>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default PredictiveAnalysis;
