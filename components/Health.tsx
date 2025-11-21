
import React, { useState } from 'react';
import Card from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

const NATIONAL_INDICATORS_2024 = {
    population: '11,734,000',
    birth_rate: '16.0',
    death_rate: '6.0',
    life_expectancy: '75.3',
    infant_mortality: '14.0',
    total_hospitals: '121',
    total_beds: '16,316',
    doctors_per_10k: '32.7',
    nurses_per_10k: '38.4',
    pharmacists_per_10k: '20.8',
};

const BEDS_BY_SECTOR_2024 = [
    { name: 'وزارة الصحة', value: 6059 },
    { name: 'الخدمات الطبية الملكية', value: 3348 },
    { name: 'المستشفيات الجامعية', value: 1261 },
    { name: 'القطاع الخاص', value: 5648 },
];

const BEDS_PER_10K_GOVERNORATE = [
  { name_ar: 'عمان', rate: 18 },
  { name_ar: 'البلقاء', rate: 18 },
  { name_ar: 'عجلون', rate: 20 },
  { name_ar: 'الطفيلة', rate: 26 },
  { name_ar: 'الكرك', rate: 13 },
  { name_ar: 'العقبة', rate: 13 },
  { name_ar: 'إربد', rate: 11 },
  { name_ar: 'معان', rate: 12 },
  { name_ar: 'المفرق', rate: 9 },
  { name_ar: 'مأدبا', rate: 8 },
  { name_ar: 'الزرقاء', rate: 7 },
  { name_ar: 'جرش', rate: 6 },
];

const WORKLOAD_BY_SECTOR_2024 = [
    { sector: 'وزارة الصحة', admissions: 446498, occupancy_rate: 71.4, avg_stay: 3.5, surgeries: 150541 },
    { sector: 'الخدمات الطبية', admissions: 226748, occupancy_rate: 68.6, avg_stay: 3.6, surgeries: 142946 },
    { sector: 'القطاع الخاص', admissions: 283399, occupancy_rate: 34.8, avg_stay: 2.0, surgeries: 145732 },
    { sector: 'المستشفيات الجامعية', admissions: 70906, occupancy_rate: 64.4, avg_stay: 3.9, surgeries: 40979 },
];

const CAESAREAN_RATES = [
    { hospital: 'الأميرة بديعة', rate: 59.1 },
    { hospital: 'الكرك', rate: 53.3 },
    { hospital: 'الحسين / السلط', rate: 50.4 },
    { hospital: 'الطفيلة', rate: 51.7 },
    { hospital: 'الوطني', rate: 38.4 },
];

const KPI_CARD_DATA = [
    { title: "معدل المواليد الخام", value: `${NATIONAL_INDICATORS_2024.birth_rate}‰`, icon: "👶" },
    { title: "العمر المتوقع عند الولادة", value: NATIONAL_INDICATORS_2024.life_expectancy, icon: "📈" },
    { title: "معدل وفيات الرضع", value: `${NATIONAL_INDICATORS_2024.infant_mortality}‰`, icon: "🍼" },
    { title: "إجمالي المستشفيات", value: NATIONAL_INDICATORS_2024.total_hospitals, icon: "🏥" },
    { title: "إجمالي الأسرّة", value: NATIONAL_INDICATORS_2024.total_beds, icon: "🛏️" },
    { title: "الأطباء لكل 10,000 نسمة", value: NATIONAL_INDICATORS_2024.doctors_per_10k, icon: "👩‍⚕️" },
];


const Health: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير الاستراتيجي: قطاع الصحة 2024";
            
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
                
                new Paragraph({ text: "1. المشهد الصحي الوطني: مؤشرات الكفاءة", style: "h2" }),
                new Paragraph({ text: `يقدم القطاع الصحي خدماته لـ ${NATIONAL_INDICATORS_2024.population} نسمة، مدعوماً ببنية تحتية تضم ${NATIONAL_INDICATORS_2024.total_hospitals} مستشفى و${NATIONAL_INDICATORS_2024.total_beds} سريراً. يعكس العمر المتوقع عند الولادة (${NATIONAL_INDICATORS_2024.life_expectancy} عاماً) جودة الرعاية العامة، لكن بقاء معدل وفيات الرضع عند ${NATIONAL_INDICATORS_2024.infant_mortality} لكل 1000 ولادة حية يستدعي مراجعة برامج رعاية الأمومة والطفولة.`, style: "Normal" }),

                new Paragraph({ text: "2. عدالة توزيع الخدمات الصحية", style: "h2" }),
                new Paragraph({ text: "يكشف تحليل توزيع الأسرّة عن فجوة جغرافية حادة. بينما تتمتع محافظة الطفيلة بأعلى معدل (26 سريراً لكل 10,000 نسمة) وعجلون (20)، تعاني محافظات ذات كثافة سكانية عالية من نقص واضح. ففي الزرقاء، ينخفض المعدل إلى 7 أسرّة فقط، وفي جرش إلى 6 أسرّة، وهو أقل بكثير من المعدل الوطني (14). هذا التفاوت يفرض ضغطاً هائلاً على مستشفيات العاصمة ويؤدي إلى رحلات علاجية مكلفة للمواطنين.", style: "Normal" }),

                new Paragraph({ text: "3. الأداء التشغيلي والضغط على القطاع العام", style: "h2" }),
                new Paragraph({ text: "تتحمل وزارة الصحة العبء الأكبر، حيث تستحوذ على 37.1% من إجمالي الأسرّة، وتسجل أعلى نسبة إشغال (71.4%) مقارنة بالقطاع الخاص (34.8%). هذا الضغط يتجلى بوضوح في أقسام الطوارئ التي استقبلت 4.4 مليون مراجع، إلا أن 33% فقط منهم صُنفوا كحالات طارئة فعلية، مما يشير إلى خلل في نظام الرعاية الأولية واعتماد المواطنين على المستشفيات كبديل للمراكز الصحية.", style: "Normal" }),

                new Paragraph({ text: "4. مؤشرات حرجة: الولادات القيصرية", style: "h2" }),
                new Paragraph({ text: "رصد التقرير ارتفاعاً مقلقاً في معدلات الولادة القيصرية، حيث وصلت في مستشفى الأميرة بديعة إلى 59.1% وفي الكرك إلى 53.3%. هذه النسب، التي تتجاوز المعدلات العالمية الموصى بها، قد تشير إلى ممارسات طبية دفاعية أو نقص في برامج التوعية والولادة الطبيعية، مما يزيد من المخاطر الصحية والتكاليف المالية.", style: "Normal" }),

                new Paragraph({ text: "5. التوصيات الاستراتيجية", style: "h2" }),
                new Paragraph({ text: "أولاً: توجيه مشاريع التوسعة الصحية الجديدة حصراً للمحافظات الأقل حظاً (الزرقاء، جرش، المفرق) لتحقيق العدالة المكانية.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثانياً: تفعيل نظام الفرز الطبي في المراكز الصحية الأولية لتقليل الضغط غير المبرر على طوارئ المستشفيات.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثالثاً: وضع بروتوكولات صارمة للولادات القيصرية ومراقبة المستشفيات ذات المعدلات المرتفعة.", style: "Normal", bullet: { level: 0 } }),
            ];

            const doc = new Document({
                styles: docStyles,
                sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${title}.docx`);
        } catch (error) {
            console.error("Failed to export DOCX:", error);
        } finally {
            setIsExportingDocx(false);
        }
    };
    
    const handleNativePrint = () => {
        const reportElement = document.getElementById('report-content');
        if (!reportElement) return;

        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) return;

        const headContent = `
            <head>
                <title>تقرير قطاع الصحة - 2024</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Traditional+Arabic:wght@400;700&display=swap');
                    body {
                        font-family: 'Traditional Arabic', serif;
                        direction: rtl;
                        padding: 40px;
                        background: white !important;
                        color: black !important;
                        font-size: 16pt;
                        line-height: 1.6;
                    }
                    .no-print, .recharts-wrapper, button, svg, .icon-container, .kpi-card-visual { display: none !important; }
                    
                    .card-container {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin-bottom: 20px !important;
                        break-inside: avoid;
                    }
                    
                    h1 { font-size: 28pt; font-weight: bold; text-align: center; border-bottom: 3px solid #000; margin-bottom: 30px; padding-bottom: 10px; }
                    h2 { font-size: 22pt; font-weight: bold; border-bottom: 1px solid #666; margin-top: 30px; margin-bottom: 15px; }
                    h3 { font-size: 18pt; font-weight: bold; margin-top: 20px; }
                    p, li { text-align: justify; margin-bottom: 12px; }
                    
                    @page { size: A4; margin: 2.5cm; }
                </style>
            </head>
        `;

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <div class="report-header">
                        <h1>التقرير الاستراتيجي: قطاع الصحة 2024</h1>
                    </div>
                    <div class="content">
                        ${reportElement.innerHTML}
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
             <div className="flex justify-end items-center mb-6 no-print gap-4">
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

            <div id="report-content" className="space-y-8">
                <header className="text-center border-b border-gray-200 dark:border-gray-700 pb-8 no-print">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">تقرير تحليلي استراتيجي لقطاع الصحة</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                        نظرة معمقة على البنية التحتية، حجم العمل، وكفاءة الخدمات الصحية استناداً إلى التقرير الإحصائي السنوي.
                    </p>
                </header>
                
                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. المشهد الصحي الوطني: مؤشرات رئيسية لعام 2024</h2>
                    <div className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                        <p>
                            يقدم القطاع الصحي خدماته لـ <strong>{NATIONAL_INDICATORS_2024.population}</strong> نسمة، مدعوماً ببنية تحتية تضم <strong>{NATIONAL_INDICATORS_2024.total_hospitals}</strong> مستشفى و<strong>{NATIONAL_INDICATORS_2024.total_beds}</strong> سريراً. يعكس العمر المتوقع عند الولادة (<strong>{NATIONAL_INDICATORS_2024.life_expectancy}</strong> عاماً) جودة الرعاية العامة، لكن بقاء معدل وفيات الرضع عند <strong>{NATIONAL_INDICATORS_2024.infant_mortality}</strong> لكل 1000 ولادة حية يستدعي مراجعة برامج رعاية الأمومة والطفولة.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center kpi-card-visual">
                        {KPI_CARD_DATA.map(item => (
                            <div key={item.title} className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl break-inside-avoid">
                                <div className="text-3xl mb-2 icon-container">{item.icon}</div>
                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{item.value}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.title}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. تحليل البنية التحتية: فجوات العدالة المكانية</h2>
                    <div className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                        <p>
                            يكشف تحليل توزيع الأسرّة عن فجوة جغرافية حادة تعيق الوصول العادل للخدمات. بينما تتمتع محافظة <strong>الطفيلة</strong> بأعلى معدل (<strong>26</strong> سريراً لكل 10,000 نسمة) وعجلون (20)، تعاني محافظات ذات كثافة سكانية عالية من نقص واضح. ففي <strong>الزرقاء</strong>، ينخفض المعدل إلى <strong>7</strong> أسرّة فقط، وفي <strong>جرش</strong> إلى <strong>6</strong> أسرّة، وهو أقل بكثير من المعدل الوطني (14). هذا التفاوت يفرض ضغطاً هائلاً على مستشفيات العاصمة ويؤدي إلى رحلات علاجية مكلفة للمواطنين.
                        </p>
                        <p className="mt-4">
                            على صعيد الملكية، تستحوذ وزارة الصحة على الحصة الأكبر بنسبة 37.1% من إجمالي الأسرة، يليها القطاع الخاص بنسبة 34.6%، مما يؤكد الدور المحوري للقطاع العام في الأمن الصحي.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={BEDS_BY_SECTOR_2024} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {BEDS_BY_SECTOR_2024.map((entry, index) => <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f97316', '#8b5cf6'][index % 4]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} سرير`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[...BEDS_PER_10K_GOVERNORATE].sort((a,b) => b.rate - a.rate)} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                    <XAxis dataKey="name_ar" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <YAxis domain={[0, 'dataMax + 5']} tick={{ fontSize: 11, fill: '#9ca3af' }}/>
                                    <Tooltip formatter={(value: number) => [value, "المعدل"]} />
                                    <Bar dataKey="rate" name="المعدل" fill="#0ea5e9">
                                        <LabelList dataKey="rate" position="top" style={{ fill: '#6b7280', fontSize: '11px' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. الأداء التشغيلي وجودة الخدمات</h2>
                    <div className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                        <p>
                            تواجه مستشفيات وزارة الصحة ضغطاً تشغيلياً هائلاً، حيث سجلت أعلى نسبة إشغال (71.4%) مقارنة بالقطاع الخاص (34.8%). هذا الضغط يتجلى بوضوح في <strong>أقسام الطوارئ</strong> التي استقبلت 4.4 مليون مراجع، إلا أن <strong>33% فقط منهم</strong> صُنفوا كحالات طارئة فعلية، مما يشير إلى خلل في نظام الرعاية الأولية واعتماد المواطنين على المستشفيات كبديل للمراكز الصحية.
                        </p>
                        <p className="mt-4">
                            كما رصد التقرير ارتفاعاً مقلقاً في <strong>معدلات الولادة القيصرية</strong>، حيث وصلت في مستشفى الأميرة بديعة إلى <strong>59.1%</strong> وفي الكرك إلى 53.3%. هذه النسب، التي تتجاوز المعدلات العالمية الموصى بها، قد تشير إلى ممارسات طبية دفاعية أو نقص في برامج التوعية والولادة الطبيعية.
                        </p>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. التوصيات الاستراتيجية</h2>
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-4 text-lg">
                        <ul className="list-disc list-outside mr-6 space-y-2">
                            <li><strong>إعادة توجيه الاستثمار:</strong> توجيه مشاريع التوسعة الصحية الجديدة حصراً للمحافظات الأقل حظاً (الزرقاء، جرش، المفرق) لتحقيق العدالة المكانية في توزيع الأسرة.</li>
                            <li><strong>تفعيل الرعاية الأولية:</strong> تعزيز دور المراكز الصحية الشاملة وتمديد ساعات عملها لتقليل الضغط غير المبرر على طوارئ المستشفيات.</li>
                            <li><strong>ضبط الجودة السريرية:</strong> وضع بروتوكولات صارمة للولادات القيصرية ومراقبة المستشفيات ذات المعدلات المرتفعة لضمان سلامة الأمهات وترشيد النفقات.</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Health;
