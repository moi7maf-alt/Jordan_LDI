
import React, { useState } from 'react';
import Card from './ui/Card';
import { AI_PREDICTIVE_ANALYSIS_DATA, GOVERNORATES_DATA } from '../constants';
import { generateProjectAnalysis } from '../services/geminiService';

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


// The original predictive analysis table component for DESKTOP
const AiPredictiveAnalysisTable: React.FC = () => {
    return (
        <Card>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    التحليل التنبؤي وحلول الذكاء الاصطناعي الاستراتيجية (2025-2028)
                </h2>
                <p className="mt-3 text-md text-gray-700 dark:text-gray-400 max-w-4xl mx-auto">
                    يستعرض هذا التقرير نتائج التحليل الكمي المتقدم المدعوم بمنهجيات الذكاء الاصطناعي لتحديد الاتجاهات المتوقعة للأعوام القادمة، وتقديم حزمة من التوصيات المبنية على البيانات لدعم اتخاذ القرارات التنموية.
                </p>
            </div>

            <div className="overflow-x-auto relative shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm text-right text-gray-800 dark:text-gray-400">
                    <thead className="text-xs text-gray-800 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-4 py-3 w-[15%]">القطاع</th>
                            <th scope="col" className="px-4 py-3 w-[20%]">الاتجاه التنبؤي (صعود/هبوط/تحسن)</th>
                            <th scope="col" className="px-4 py-3 w-[20%]">التحليل التنبؤي (الأسباب والعوامل)</th>
                            <th scope="col" className="px-4 py-3 w-[22.5%]">الحلول التقليدية (تخفيف الأثر)</th>
                            <th scope="col" className="px-4 py-3 w-[22.5%]">حلول إبداعية/ذكية (خارج الصندوق)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {AI_PREDICTIVE_ANALYSIS_DATA.map((item, index) => (
                            <tr key={index} className="bg-white border-b dark:bg-slate-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 align-top">
                                <th scope="row" className="px-4 py-4 font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                                    <span className="text-lg mr-2">{item.icon}</span> {item.sector}
                                </th>
                                <td className="px-4 py-4 leading-relaxed font-medium text-amber-700 dark:text-amber-500">{item.trend}</td>
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
                    استعراض للاتجاهات المتوقعة (2025-2028) والتوصيات المبنية على البيانات.
                </p>
            </div>
            <div className="space-y-6">
                {AI_PREDICTIVE_ANALYSIS_DATA.map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                            <span className="text-xl ml-2">{item.icon}</span> {item.sector}
                        </h3>
                        
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

const PredictiveAnalysis: React.FC = () => {
    const [projectIdea, setProjectIdea] = useState('');
    const [selectedGov, setSelectedGov] = useState('Amman');
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
