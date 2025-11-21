
import React from 'react';
import DevelopmentGapAnalysis from './DevelopmentGapAnalysis';

const DevelopmentPlan: React.FC = () => {
    return (
        <div className="space-y-8">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">التحليل المقارن</h1>
                <p className="text-lg text-gray-700 mt-2 max-w-3xl mx-auto">
                    نحو أردن مزدهر بتنمية عادلة ومستدامة تصل إلى كل محافظة، لتعزيز جودة الحياة وتحقيق الرفاه لجميع المواطنين.
                </p>
            </header>

            <DevelopmentGapAnalysis />

        </div>
    );
};

export default DevelopmentPlan;
