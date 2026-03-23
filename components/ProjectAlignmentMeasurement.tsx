
import React, { useState } from 'react';
import Card from './ui/Card';
import { ECONOMIC_VISION_DATA } from '../constants/economicVisionData';
import { GOVERNORATES_DATA } from '../constants';
import { analyzeEconomicVisionAlignment } from '../services/geminiService';
import { motion } from 'motion/react';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions, WidthType } from 'docx';
import saveAs from 'file-saver';

const ProjectAlignmentMeasurement: React.FC = () => {
    const [projectIdea, setProjectIdea] = useState('');
    const [selectedGov, setSelectedGov] = useState('Amman');
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const handleExportDocx = async () => {
        if (!analysisResult) return;
        setIsExportingDocx(true);
        try {
            const title = "تقرير مواءمة المشروع مع رؤية التحديث الاقتصادي الأردنية";
            
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
                new Paragraph({ text: `فكرة المشروع: ${projectIdea}`, style: "Normal" }),
                new Paragraph({ text: `المحافظة: ${GOVERNORATES_DATA.find(g => g.name === selectedGov)?.name_ar || selectedGov}`, style: "Normal" }),
                new Paragraph({ text: "نتائج التحليل:", style: "h2" }),
                ...analysisResult.split('\n').map(line => new Paragraph({ text: line, style: "Normal" }))
            ];

            const doc = new Document({
                styles: docStyles,
                sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `تقرير_مواءمة_الرؤية_${selectedGov}.docx`);
        } catch (error) {
            console.error("Failed to export DOCX:", error);
        } finally {
            setIsExportingDocx(false);
        }
    };

    const handleNativePrint = () => {
        if (!analysisResult) return;
        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) return;

        const headContent = `
            <head>
                <title>تقرير مواءمة الرؤية</title>
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
                    h1 { font-size: 24pt; font-weight: bold; text-align: center; border-bottom: 3px solid #000; margin-bottom: 30px; padding-bottom: 10px; }
                    h2 { font-size: 18pt; font-weight: bold; border-bottom: 1px solid #666; margin-top: 30px; margin-bottom: 15px; }
                    .meta { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                    @page { size: A4; margin: 1.5cm; }
                </style>
            </head>
        `;

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <h1>تقرير مواءمة المشروع مع رؤية التحديث الاقتصادي الأردنية</h1>
                    <div class="meta">
                        <p><strong>فكرة المشروع:</strong> ${projectIdea}</p>
                        <p><strong>المحافظة:</strong> ${GOVERNORATES_DATA.find(g => g.name === selectedGov)?.name_ar || selectedGov}</p>
                    </div>
                    <div style="white-space: pre-wrap;">${analysisResult}</div>
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
            const result = await analyzeEconomicVisionAlignment(projectIdea, selectedGov);
            setAnalysisResult(result);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء تحليل المشروع.');
        } finally {
            setIsLoading(false);
        }
    };

    const currentGovContext = (ECONOMIC_VISION_DATA.governorates_context as any)[selectedGov];

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center mb-10">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                >
                    {ECONOMIC_VISION_DATA.title}
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-amber-600 dark:text-amber-400 font-medium italic mb-4"
                >
                    "{ECONOMIC_VISION_DATA.slogan}"
                </motion.p>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-3xl mx-auto text-gray-600 dark:text-gray-400 leading-relaxed"
                >
                    {ECONOMIC_VISION_DATA.introduction}
                </motion.p>
            </div>

            {/* Pillars Section */}
            <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ECONOMIC_VISION_DATA.pillars.map((pillar, index) => (
                        <motion.div
                            key={pillar.id}
                            initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full border-t-4 border-amber-500 bg-white dark:bg-slate-900 relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-4xl">{pillar.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{pillar.title}</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                    {pillar.description}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
                
                {/* Sustainability Connector */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg border-2 border-white dark:border-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        الاستدامة
                    </div>
                </div>
                <div className="md:hidden flex justify-center mt-4">
                    <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        تتشارك الركيزتان بخاصية الاستدامة
                    </div>
                </div>
            </div>

            {/* Strategic Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ECONOMIC_VISION_DATA.strategic_targets.map((target, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-900 text-white p-6 rounded-2xl border border-white/10 text-center"
                    >
                        <p className="text-amber-400 text-sm font-bold mb-2 uppercase tracking-wider">{target.label}</p>
                        <p className="text-lg font-medium leading-tight">{target.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Drivers Section */}
            <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="text-amber-500">⚙️</span> محركات النمو الثمانية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {ECONOMIC_VISION_DATA.drivers.map((driver, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-500 transition-colors group"
                        >
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{driver.icon}</div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{driver.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{driver.sectors}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Governorate Budget Projects Alignment Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-blue-500">📋</span> مواءمة مشاريع موازنة المحافظة مع الرؤية
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">كيف تخدم المشاريع "التقليدية" في موازنتك أهداف رؤية التحديث الاقتصادي؟</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(ECONOMIC_VISION_DATA as any).budget_projects_mapping.map((item: any, index: number) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                        >
                            <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {item.category}
                            </h4>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {item.projects.map((p: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600">
                                        {p}
                                    </span>
                                ))}
                            </div>
                            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500">محرك الرؤية:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{item.vision_driver}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed italic">
                                    <span className="font-bold not-italic">الأثر الاستراتيجي: </span> {item.impact}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* AI Alignment Tool */}
            <Card id="alignment-tool" className="border-2 border-amber-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-3 bg-amber-500 rounded-lg text-black">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">أداة مواءمة المشاريع الاستراتيجية</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">افحص مدى ارتباط مشروعك اللامركزي برؤية التحديث الاقتصادي</p>
                    </div>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">فكرة المشروع المقترح</label>
                            <textarea
                                value={projectIdea}
                                onChange={(e) => setProjectIdea(e.target.value)}
                                placeholder="مثال: إنشاء مركز تدريب مهني متخصص في تقنيات الزراعة الذكية في محافظة المفرق..."
                                className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent h-40 text-gray-900 dark:text-white"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">المحافظة</label>
                                <select
                                    value={selectedGov}
                                    onChange={(e) => setSelectedGov(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white"
                                    disabled={isLoading}
                                >
                                    {GOVERNORATES_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                                </select>
                            </div>

                            {/* Governorate Context Display */}
                            {currentGovContext && (
                                <motion.div 
                                    key={selectedGov}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                                >
                                    <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 uppercase">الميزة التنافسية للمحافظة:</h5>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 leading-snug">{currentGovContext.advantage}</p>
                                    <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase">القطاعات الواعدة:</h5>
                                    <div className="flex flex-wrap gap-1">
                                        {currentGovContext.promising_sectors.map((s: string, i: number) => (
                                            <span key={i} className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || !projectIdea.trim()}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 flex justify-center items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        <span>جاري التحليل...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                        </svg>
                                        <span>مواءمة المشروع</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                            {analysisResult && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 p-8 bg-white dark:bg-slate-900 border border-amber-500/30 rounded-2xl shadow-xl"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <h3 className="text-xl font-bold">تقرير مواءمة المشروع مع الرؤية</h3>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={handleNativePrint}
                                                className="flex-1 sm:flex-none flex items-center justify-center px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm border border-gray-200 dark:border-gray-700"
                                                title="طباعة التقرير"
                                            >
                                                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                                                </svg>
                                                طباعة
                                            </button>
                                            <button
                                                onClick={handleExportDocx}
                                                disabled={isExportingDocx}
                                                className="flex-1 sm:flex-none flex items-center justify-center px-3 py-1.5 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition-colors text-sm font-semibold disabled:bg-gray-400"
                                                title="تحميل التقرير بصيغة DOCX"
                                            >
                                                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                                {isExportingDocx ? 'جاري التحميل...' : 'تحميل'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="prose prose-amber dark:prose-invert max-w-none">
                                        <div className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed">
                                            {analysisResult}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                </div>
            </Card>

            {/* Decentralization Linkage Info */}
            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-start gap-4">
                    <div className="text-2xl">💡</div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لماذا نربط مشاريع اللامركزية بالرؤية؟</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            تؤكد الرؤية في وثائقها التنفيذية على "النمو الشامل"، وهو ما يعني توزيع مكتسبات التنمية وعدم حصر الاستثمارات في العاصمة، بل توجيهها للمحافظات بناءً على "الميزة التنافسية" لكل محافظة. تفعيل دور مجالس المحافظات (اللامركزية) في تحديد المشاريع الرأسمالية التي تتواءم مع محركات النمو يضمن سد الفجوات التنموية الحقيقية.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectAlignmentMeasurement;
