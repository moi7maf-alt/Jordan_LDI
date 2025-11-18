import React from 'react';
import Card from './ui/Card';

const KpiCard: React.FC<{ icon: string; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="bg-gray-50 p-4 rounded-xl text-center transition-transform hover:scale-105 shadow-sm">
        <div className="text-3xl mb-2">{icon}</div>
        <p className="text-xl lg:text-2xl font-bold text-amber-600">{value}</p>
        <p className="text-xs text-gray-700 mt-1 h-10 flex items-center justify-center">{label}</p>
    </div>
);


const NationalIndicators: React.FC = () => {
    
    const indicators = [
        { icon: '👥', label: 'عدد السكان', value: '11.7 مليون' },
        { icon: '📈', label: 'نمو الناتج المحلي (الثابت)', value: '2.5%' },
        { icon: '💼', label: 'معدل البطالة', value: '21.4%' },
        { icon: '👩‍💼', label: 'بطالة الإناث', value: '32.9%' },
        { icon: '❤️', label: 'توقع الحياة عند الولادة', value: '75.3 سنة' },
        { icon: '🍼', label: 'وفيات الرضع (لكل 1000)', value: '14.0' },
        { icon: '📊', label: 'معدل النمو السكاني', value: '1.9%' },
        { icon: '🗺️', label: 'الكثافة السكانية (شخص/كم²)', value: '132.1' },
        { icon: '💰', label: 'نصيب الفرد من الناتج (دينار)', value: '2,846' },
        { icon: '👨‍👩‍👧‍👦', label: 'متوسط حجم الأسرة', value: '4.8 فرد' },
        { icon: '⚖️', label: 'معدل الجريمة (لكل 1000)', value: '4.2' },
        { icon: '🚗', label: 'معدل حوادث الطرق (لكل 1000)', value: '1.0' },
    ];

    return (
        <Card className="h-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
                مؤشرات وطنية رئيسية (2024)
            </h3>
            <div className="grid grid-cols-2 gap-4">
                 {indicators.map((indicator, index) => (
                    <KpiCard key={index} icon={indicator.icon} label={indicator.label} value={indicator.value} />
                ))}
            </div>
        </Card>
    );
};


const Dashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            <header className="text-center">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900">
                    المنصة الرقمية للتحليل التنبؤي والتنمية المستدامة
                </h1>
                <p className="text-lg text-amber-600 font-semibold mt-2">
                    (مدعومة بالذكاء الاصطناعي)
                </p>
            </header>
            <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">مقدمة</h2>
                <div className="text-gray-800 space-y-3 leading-relaxed">
                    <p>
                        في ظل تسارع النمو في حجم البيانات التنموية وتنوع مصادرها، أصبح استخدام الذكاء الاصطناعي أداة محورية لتحليل هذه البيانات بعمق وكفاءة.
                    </p>
                    <p>
                        تعمل منظومة التحليل التنموي المعززة بالذكاء الاصطناعي لمحافظات المملكة الأردنية على توظيف تقنيات تعلم الآلة والتحليل الذكي للبيانات لاستخراج مؤشرات تنموية دقيقة تسهم في فهم واقع المحافظات، وتحديد الفجوات والتحديات التنموية، واقتراح توجهات وسياسات مبنية على البيانات لتحسين التخطيط واتخاذ القرار.
                    </p>
                    <p>
                        تتيح المنظومة للمستخدمين استكشاف البيانات بطريقة تفاعلية وسهلة، والوصول إلى مخرجات تحليلية قابلة للاستخدام في دعم الخطط التنموية، وتوجيه الموارد نحو أولويات التنمية المحلية بفعالية أعلى واستدامة أكبر.
                    </p>
                </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="h-full flex flex-col p-0 overflow-hidden">
                        <div className="flex-grow">
                            <iframe 
                                title="مؤشر التنمية المحلية المستدامة (2024)" 
                                aria-label="Choropleth map" 
                                id="datawrapper-chart-JORjH" 
                                src="https://datawrapper.dwcdn.net/JORjH/3/" 
                                scrolling="no" 
                                frameBorder="0" 
                                style={{ border: 'none', width: '100%', height: '100%', minHeight: '741px' }}
                                data-external="1">
                            </iframe>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <NationalIndicators />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;