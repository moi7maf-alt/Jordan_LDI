import React from 'react';
import Card from './ui/Card';
import VisionProgressChart from './charts/VisionProgressChart';
import { JORDAN_VISION_2033_TARGETS, NATIONAL_AVERAGES_2024 } from '../constants';
import { UNEMPLOYMENT_DATA } from '../constants/unemploymentData';

const VisionGapAnalysis: React.FC = () => {
    
    // FIX: Calculate max values from available data sources instead of deprecated fields.
    // Determine max values for chart scales to provide context
    const latestUnemploymentRates = UNEMPLOYMENT_DATA.filter(g => g.name !== 'Kingdom').map(g => g.data[g.data.length - 1].rate);
    const maxUnemployment = Math.max(...latestUnemploymentRates, JORDAN_VISION_2033_TARGETS.unemployment_rate) * 1.1;
    const maxParticipation = Math.max(NATIONAL_AVERAGES_2024.female_labor_force_participation, JORDAN_VISION_2033_TARGETS.female_labor_force_participation) * 1.2;

    return (
        <Card>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">التقدم المحرز نحو رؤية 2033</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">مقارنة المعدلات الوطنية لعام 2024 بالأهداف المرجوة في رؤية التحديث الاقتصادي.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <VisionProgressChart 
                    name="معدل البطالة"
                    currentValue={NATIONAL_AVERAGES_2024.unemployment_rate}
                    targetValue={JORDAN_VISION_2033_TARGETS.unemployment_rate}
                    maxValue={maxUnemployment}
                    color="#fca5a5"
                    unit="%"
                />
                <VisionProgressChart 
                    name="مشاركة الإناث في القوى العاملة"
                    currentValue={NATIONAL_AVERAGES_2024.female_labor_force_participation}
                    targetValue={JORDAN_VISION_2033_TARGETS.female_labor_force_participation}
                    maxValue={maxParticipation}
                    color="#c4b5fd"
                    unit="%"
                />
            </div>
        </Card>
    );
};

export default VisionGapAnalysis;
