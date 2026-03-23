import React, { useState } from 'react';
import Card from './ui/Card';
import GovernorateReport from './GovernorateReport';
import { generateReportSummary } from '../services/geminiService';
import { GOVERNORATES_DATA } from '../constants';
import { GovernorateData } from '../types';

const Reports: React.FC = () => {
    const [selectedGovernorate, setSelectedGovernorate] = useState<string>('Amman');
    const [customTopic, setCustomTopic] = useState('');
    const [generatedReport, setGeneratedReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateCustomReport = async () => {
        if (!customTopic.trim()) {
            setError('Please enter a topic for the report.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedReport('');

        try {
            const report = await generateReportSummary(customTopic);
            setGeneratedReport(report);
        } catch (err: any) {
            setError(err.message || 'An error occurred while generating the report.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const selectedGovData = GOVERNORATES_DATA.find(g => g.name === selectedGovernorate);
    
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">التقارير التنموية</h1>
                <p className="text-md text-gray-700 mt-1">إنشاء تقارير تحليلية مخصصة وعرض تقارير مفصلة للمحافظات.</p>
            </header>

            <Card>
                 <h2 className="text-xl font-bold text-gray-900 mb-4">تقارير المحافظات</h2>
                 <p className="text-sm text-gray-700 mb-4">اختر محافظة لعرض تقرير تحليلي مفصل عن وضعها التنموي.</p>
                 <select
                    value={selectedGovernorate}
                    onChange={(e) => setSelectedGovernorate(e.target.value)}
                    className="w-full md:w-1/3 bg-gray-100 border border-gray-300 rounded-md p-2 text-sm mb-6"
                 >
                    {GOVERNORATES_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                 </select>

                 {selectedGovData && <GovernorateReport governorate={selectedGovData} />}
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">تقرير مخصص</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <input 
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="أدخل موضوع التقرير (مثال: تأثير التحول الرقمي على التوظيف)"
                        className="flex-grow pr-4 pl-4 py-2 bg-gray-100 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleGenerateCustomReport}
                        disabled={isLoading || !customTopic.trim()}
                        className="px-6 py-2 text-black bg-amber-500 rounded-md disabled:bg-gray-400 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        {isLoading ? '...جاري الإنشاء' : 'إنشاء تقرير'}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {generatedReport && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                       <pre className="whitespace-pre-wrap font-sans text-gray-900">{generatedReport}</pre>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Reports;