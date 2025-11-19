
import React, { useState } from 'react';
import Card from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

// Data a s per the 2024 Annual Statistical Report
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

const HEALTH_CENTERS_BY_GOVERNORATE = [
    { name_ar: 'عمان', total: 103 },
    { name_ar: 'إربد', total: 121 },
    { name_ar: 'المفرق', total: 85 },
    { name_ar: 'الكرك', total: 55 },
    { name_ar: 'البلقاء', total: 60 },
    { name_ar: 'الزرقاء', total: 40 },
    { name_ar: 'جرش', total: 27 },
    { name_ar: 'معان', total: 38 },
    { name_ar: 'مأدبا', total: 25 },
    { name_ar: 'عجلون', total: 31 },
    { name_ar: 'الطفيلة', total: 20 },
    { name_ar: 'العقبة', total: 22 },
];

const WORKLOAD_BY_SECTOR_2024 = [
    { sector: 'وزارة الصحة', admissions: 446498, occupancy_rate: 71.4, avg_stay: 3.5, surgeries: 150541 },
    { sector: 'الخدمات الطبية', admissions: 226748, occupancy_rate: 68.6, avg_stay: 3.6, surgeries: 142946 },
    { sector: 'القطاع الخاص', admissions: 283399, occupancy_rate: 34.8, avg_stay: 2.0, surgeries: 145732 },
    { sector: 'المستشفيات الجامعية', admissions: 70906, occupancy_rate: 64.4, avg_stay: 3.9, surgeries: 40979 }, // Aggregated
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
            const title = "تقرير قطاع الصحة في الأردن 2024";
            
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
                new Paragraph({ text: "نظرة معمقة على البنية التحتية، حجم العمل، وكفاءة الخدمات الصحية.", style: "Normal" }),
                
                new Paragraph({ text: "1. المشهد الصحي الوطني (2024)", style: "h2" }),
                new Paragraph({ text: `عدد السكان: ${NATIONAL_INDICATORS_2024.population}`, style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: `معدل وفيات الرضع: ${NATIONAL_INDICATORS_2024.infant_mortality} لكل 1000`, style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: `إجمالي الأسرّة: ${NATIONAL_INDICATORS_2024.total_beds}`, style: "Normal", bullet: { level: 0 } }),

                new Paragraph({ text: "2. تحليل البنية التحتية", style: "h2" }),
                new Paragraph({ text: "تستحوذ وزارة الصحة على الحصة الأكبر من الأسرّة (37.1%)، يليها القطاع الخاص.", style: "Normal" }),
                new Paragraph({ text: "يُظهر معدل الأسرّة تفاوتاً جغرافياً صارخاً. تتصدر الطفيلة وعجلون القائمة، بينما تعاني الزرقاء وجرش من نقص.", style: "Normal" }),

                new Paragraph({ text: "3. خدمات صحة الأم والطفل", style: "h2" }),
                new Paragraph({ text: "شكلت الولادات القيصرية نسبة مرتفعة في بعض المستشفيات مثل الأميرة بديعة (59.1%).", style: "Normal" }),
                new Paragraph({ text: "هناك ضغط كبير على خدمات الطوارئ، حيث أن 33% فقط من المراجعين هم حالات طارئة فعلية.", style: "Normal" }),

                new Paragraph({ text: "4. توصيات استراتيجية", style: "h2" }),
                new Paragraph({ text: "خارطة طريق للاستثمار الصحي وتوجيه الاستثمار للمحافظات الأكثر حاجة.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "تعزيز الرعاية الصحية الأولية لتخفيف الضغط عن المستشفيات.", style: "Normal", bullet: { level: 0 } }),
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
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                    body {
                        font-family: 'Cairo', sans-serif;
                        direction: rtl;
                        padding: 40px;
                        background: white !important;
                        color: black !important;
                        font-size: 14pt;
                    }
                    * {
                        box-shadow: none !important;
                        background: transparent !important;
                        border-radius: 0 !important;
                        border: none !important;
                    }
                    .grid, .flex { display: block !important; }
                    .no-print, .recharts-wrapper, button { display: none !important; }
                    
                    .card-container {
                        padding: 0 !important;
                        margin: 0 0 20px 0 !important;
                        border-bottom: 1px solid #eee !important;
                    }
                    
                    h1 { font-size: 26pt !important; text-align: center; border-bottom: 2px solid black; margin-bottom: 20px; }
                    h2 { font-size: 20pt !important; border-bottom: 1px solid #ccc; margin-top: 30px; break-after: avoid; }
                    h3 { font-size: 18pt !important; color: #333; margin-top: 20px; break-after: avoid; }
                    p, li { font-size: 14pt !important; line-height: 1.6; text-align: justify; }
                    
                    .icon-container { display: inline-block !important; font-size: 16pt !important; margin-left: 10px; }
                    
                    @page { size: A4; margin: 20mm; }
                </style>
            </head>
        `;

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <div class="report-header">
                        <h1>تقرير تحليلي استراتيجي لقطاع الصحة في الأردن 2024</h1>
                    </div>
                    <div class="content">
                        ${reportElement.innerHTML}
                    </div>
                     <div class="report-footer" style="text-align: center; margin-top: 50px; font-size: 10pt; color: #666;">
                        وزارة الداخلية - منظومة التحليل التنموي
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                </button>
                <button onClick={handleNativePrint} className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    طباعة / حفظ PDF (وثيقة نظيفة)
                </button>
            </div>

            <div id="report-content" className="space-y-8">
                <header className="text-center border-b border-gray-200 dark:border-gray-700 pb-8 no-print">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">تقرير تحليلي استراتيجي لقطاع الصحة في الأردن 2024</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                        نظرة معمقة على البنية التحتية، حجم العمل، وكفاءة الخدمات الصحية استناداً إلى التقرير الإحصائي السنوي لوزارة الصحة.
                    </p>
                </header>
                
                <div className="report-intro">
                    <p className="text-lg text-gray-700 mb-6">
                        يقدم هذا التقرير تحليلاً شاملاً لواقع البنية التحتية الصحية، حجم العمل، وكفاءة الخدمات في المملكة، استناداً إلى بيانات التقرير الإحصائي السنوي لوزارة الصحة لعام 2024. يهدف التقرير إلى تحديد أبرز التحديات وتقديم توصيات استراتيجية لدعم صناع القرار.
                    </p>
                </div>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. المشهد الصحي الوطني: مؤشرات رئيسية لعام 2024</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">يبلغ عدد سكان الأردن {NATIONAL_INDICATORS_2024.population} نسمة. يعكس العمر المتوقع عند الولادة ({NATIONAL_INDICATORS_2024.life_expectancy} عاماً) تحسناً في الظروف الصحية. ومع ذلك، لا يزال معدل وفيات الرضع عند {NATIONAL_INDICATORS_2024.infant_mortality} لكل 1000 ولادة حية يمثل تحدياً.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. تحليل البنية التحتية للقطاع الصحي</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">تتكون البنية التحتية الصحية من شبكة متنوعة من المستشفيات والمراكز الصحية التابعة لقطاعات متعددة، ويكشف توزيعها عن فجوات جغرافية واضحة.</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">توزيع الأسرّة حسب القطاع (إجمالي: {NATIONAL_INDICATORS_2024.total_beds})</h3>
                            <div style={{ height: 300 }} className="no-print">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={BEDS_BY_SECTOR_2024} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {BEDS_BY_SECTOR_2024.map((entry, index) => <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f97316', '#8b5cf6'][index % 4]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `${value.toLocaleString()} سرير`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-gray-700 mt-4">
                                يبلغ إجمالي عدد الأسرّة في المملكة {NATIONAL_INDICATORS_2024.total_beds} سريراً. تستحوذ وزارة الصحة على الحصة الأكبر بنسبة 37.1%، يليها القطاع الخاص بنسبة 34.6%.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">معدل الأسرّة لكل 10,000 نسمة حسب المحافظة</h3>
                            <div style={{ height: 300 }} className="no-print">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[...BEDS_PER_10K_GOVERNORATE].sort((a,b) => b.rate - a.rate)} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                        <XAxis dataKey="name_ar" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                        <YAxis domain={[0, 'dataMax + 5']} tick={{ fontSize: 11, fill: '#9ca3af' }}/>
                                        <Tooltip formatter={(value: number) => [value, "المعدل"]} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                        <Bar dataKey="rate" name="المعدل" fill="#0ea5e9">
                                            <LabelList dataKey="rate" position="top" style={{ fill: '#6b7280', fontSize: '11px' }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-gray-700 mt-4">
                                يُظهر المعدل تفاوتاً جغرافياً صارخاً. تتصدر محافظات الطفيلة (26) وعجلون (20) القائمة، بينما تعاني الزرقاء (7) وجرش (6) من نقص حاد.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. حجم العمل وكفاءة المستشفيات (2024)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-4 py-3">القطاع</th>
                                    <th scope="col" className="px-4 py-3">حالات الإدخال</th>
                                    <th scope="col" className="px-4 py-3">نسبة الإشغال (%)</th>
                                    <th scope="col" className="px-4 py-3">متوسط الإقامة (يوم)</th>
                                    <th scope="col" className="px-4 py-3">العمليات الجراحية</th>
                                </tr>
                            </thead>
                            <tbody>
                                {WORKLOAD_BY_SECTOR_2024.map((item) => (
                                    <tr key={item.sector} className="bg-white border-b dark:bg-slate-800 dark:border-gray-700">
                                        <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.sector}</th>
                                        <td className="px-4 py-4">{item.admissions.toLocaleString()}</td>
                                        <td className="px-4 py-4">{item.occupancy_rate.toFixed(1)}%</td>
                                        <td className="px-4 py-4">{item.avg_stay.toFixed(1)}</td>
                                        <td className="px-4 py-4">{item.surgeries.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. خدمات صحة الأم والطفل والخدمات المتخصصة</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">معدلات الولادة القيصرية (2024)</h3>
                            <div style={{ height: 300 }} className="no-print">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={CAESAREAN_RATES} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                        <XAxis type="number" unit="%" domain={[0, 70]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                        <YAxis type="category" dataKey="hospital" width={100} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }} />
                                        <Bar dataKey="rate" name="المعدل" fill="#f43f5e" >
                                            <LabelList dataKey="rate" position="right" formatter={(value: number) => `${value.toFixed(1)}%`} style={{ fill: '#6b7280', fontSize: '11px' }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-gray-700 mt-2">شكلت الولادات القيصرية 38.4% من الإجمالي. الارتفاع في مستشفيات مثل الأميرة بديعة (59.1%) يتطلب المراجعة.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg break-inside-avoid">
                                <h4 className="font-semibold text-gray-800 dark:text-white">مراجعات الطوارئ</h4>
                                <p className="text-3xl font-bold text-red-500">4.4 مليون</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي المراجعين لأقسام الطوارئ في مستشفيات وزارة الصحة.</p>
                                <p className="text-lg font-semibold mt-2">33% فقط حالات طارئة</p>
                            </div>
                            <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg break-inside-avoid">
                                <h4 className="font-semibold text-gray-800 dark:text-white">مرضى غسيل الكلى</h4>
                                <p className="text-3xl font-bold text-blue-500">1,909 مريض</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">في وحدات غسيل الكلى بمستشفيات وزارة الصحة.</p>
                                <p className="text-lg font-semibold mt-2">~22,500 جلسة علاجية</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. تحديات استراتيجية وتوصيات</h2>
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-4 text-lg">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white pt-2">أبرز التحديات:</h3>
                        <ul className="list-disc list-outside mr-6 space-y-2">
                            <li><strong>التوزيع غير العادل للموارد:</strong> تركز الخدمات الصحية المتخصصة والقدرة السريرية في العاصمة، مقابل نقص حاد في المحافظات الطرفية.</li>
                            <li><strong>الضغط على خدمات الطوارئ:</strong> استخدام أقسام الطوارئ للحالات غير الطارئة يستنزف الموارد.</li>
                            <li><strong>ارتفاع معدلات الولادة القيصرية:</strong> النسب المرتفعة تتطلب تحليلاً للأسباب ووضع بروتوكولات.</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white pt-4">توصيات استراتيجية:</h3>
                        <ul className="list-disc list-outside mr-6 space-y-2">
                            <li><strong>خارطة طريق للاستثمار الصحي:</strong> توجيه الاستثمار للمحافظات الأكثر حاجة (الزرقاء، جرش، مأدبا).</li>
                            <li><strong>تعزيز الرعاية الصحية الأولية:</strong> توعية المواطنين وتوسيع ساعات عمل المراكز الشاملة.</li>
                            <li><strong>استخدام البيانات لتحسين الكفاءة:</strong> تحليل بيانات حجم العمل لتوجيه الموارد البشرية والمالية.</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Health;
