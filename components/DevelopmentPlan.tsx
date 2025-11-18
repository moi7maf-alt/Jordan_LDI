import React from 'react';
import Card from './ui/Card';
import DevelopmentGapAnalysis from './DevelopmentGapAnalysis';

const nationalIndicators = [
    { label: "نمو الناتج المحلي الإجمالي (2022)", value: "2.7%", icon: "💰" },
    { label: "معدل البطالة بين الشباب (2023)", value: ">30%", icon: "🧑‍💼", note: "مرتفع" },
    { label: "مشاركة المرأة بسوق العمل (2023)", value: "14%", icon: "👩‍💻" },
    { label: "مؤشر الابتكار العالمي (2023)", value: "166 عالمياً", icon: "🌍", note: "8 عربياً" }
];


const DevelopmentPlan: React.FC = () => {
    return (
        <div className="space-y-8">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">التحليل المقارن</h1>
                <p className="text-lg text-gray-700 mt-2 max-w-3xl mx-auto">
                    نحو أردن مزدهر بتنمية عادلة ومستدامة تصل إلى كل محافظة، لتعزيز جودة الحياة وتحقيق الرفاه لجميع المواطنين.
                </p>
            </header>

            <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">التوجه الوطني: مؤشرات استراتيجية</h2>
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">أبرز المؤشرات الوطنية</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {nationalIndicators.map(indicator => (
                            <div key={indicator.label} className="bg-gray-100 p-4 rounded-lg text-center shadow-sm">
                                <div className="text-3xl mb-2" role="img" aria-label="icon">{indicator.icon}</div>
                                <p className="text-sm text-gray-700 h-10 flex items-center justify-center">{indicator.label}</p>
                                <p className="text-2xl font-bold text-amber-600 mt-1">{indicator.value}</p>
                                {indicator.note && <p className="text-xs text-gray-600">{indicator.note}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <DevelopmentGapAnalysis />

        </div>
    );
};

export default DevelopmentPlan;