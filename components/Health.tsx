
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

const KPI_CARD_DATA = [
    { title: "معدل المواليد الخام", value: `${NATIONAL_INDICATORS_2024.birth_rate}‰`, icon: "👶" },
    { title: "العمر المتوقع عند الولادة", value: NATIONAL_INDICATORS_2024.life_expectancy, icon: "📈" },
    { title: "معدل وفيات الرضع", value: `${NATIONAL_INDICATORS_2024.infant_mortality}‰`, icon: "🍼" },
    { title: "إجمالي المستشفيات", value: NATIONAL_INDICATORS_2024.total_hospitals, icon: "🏥" },
    { title: "إجمالي الأسرّة", value: NATIONAL_INDICATORS_2024.total_beds, icon: "🛏️" },
    { title: "الأطباء لكل 10,000 نسمة", value: NATIONAL_INDICATORS_2024.doctors_per_10k, icon: "👩‍⚕️" },
];

const reportContent = [
    {
        title: "1. الملخص التنفيذي والأثر الاستراتيجي",
        content: `يُظهر التحليل الاستراتيجي للقطاع الصحي الأردني لعام 2024 نظاماً يتسم بـ "المنعة الهشة". فرغم تحقيق مؤشرات كمية متقدمة إقليمياً (توقع حياة ${NATIONAL_INDICATORS_2024.life_expectancy} سنة، وتغطية شاملة للمطاعيم)، إلا أن البنية الهيكلية تعاني من اختلالات عميقة في عدالة التوزيع وكفاءة الإنفاق. يتوزع العبء الخدمي بين أربعة قطاعات رئيسية (الصحة، الخدمات الطبية، الجامعات، والقطاع الخاص) دون تكامل حقيقي، مما يؤدي إلى هدر في الموارد وازدواجية في تقديم الخدمة. التحدي الجوهري لا يكمن في ندرة الكوادر الطبية بقدر ما يكمن في سوء توزيعها الجغرافي وضعف نظام الإحالة الطبي، مما يحول المستشفيات إلى مراكز للرعاية الأولية ويزيد من كلفة الفاتورة العلاجية الوطنية. الأثر الاستراتيجي المباشر لهذه الاختلالات هو تزايد الفجوة الصحية بين المركز والأطراف، مما يهدد الأمن الصحي الاجتماعي ويستدعي تدخلاً عاجلاً لإعادة هيكلة خارطة الخدمات.`
    },
    {
        title: "2. الإطار العام للقطاع والمشهد الديموغرافي",
        content: `يمر الأردن بمرحلة "التحول الوبائي والديموغرافي" المعقدة. فمن جهة، لا يزال المجتمع فتياً بمعدل مواليد خام يبلغ ${NATIONAL_INDICATORS_2024.birth_rate} لكل ألف، مما يفرض ضغطاً مستمراً على خدمات الأمومة والطفولة والخداج. ومن جهة أخرى، أدى ارتفاع العمر المتوقع إلى زيادة متسارعة في عبء الأمراض غير السارية (القلب، السكري، السرطان)، التي تستنزف 70% من الموارد المالية للقطاع. هذا الازدواج في خريطة الأمراض يتطلب إعادة هندسة النظام الصحي للتحول من "النموذج العلاجي الحاد" إلى "النموذج الوقائي وإدارة الأمراض المزمنة"، خاصة مع تركز كبار السن في المدن الكبرى وضغط اللجوء السوري المستمر على البنية التحتية في محافظات الشمال.`
    },
    {
        title: "3. تحليل الأداء التنموي والمؤشرات الرئيسية (KPIs)",
        content: `عند تحليل المؤشرات الرئيسية بعمق، تظهر فجوات نوعية مقلقة. رغم أن معدل الأطباء (${NATIONAL_INDICATORS_2024.doctors_per_10k} لكل 10 آلاف نسمة) يعتبر مرتفعاً وفق المعايير الدولية، إلا أن هذا الرقم يخفي عجزاً حاداً في تخصصات دقيقة (مثل جراحة الأعصاب، والتخدير، وطب الطوارئ) في مستشفيات الأطراف. كما أن ثبات معدل وفيات الرضع عند ${NATIONAL_INDICATORS_2024.infant_mortality} لكل ألف ولادة حية لعدة سنوات يشير إلى وصول برامج الرعاية الأولية إلى "مرحلة الهضبة" (Plateau)، مما يستدعي تدخلات نوعية جديدة في رعاية ما قبل الولادة وحديثي الولادة، وليس مجرد توسع كمي في المراكز الصحية. إن استمرار هذا المعدل يعكس الحاجة لتحسين جودة الرعاية التوليدية والتدخل المبكر.`
    },
    {
        title: "4. دراسة الأبعاد التنموية وكفاءة الموارد",
        content: `يكشف التحليل المكاني لتوزيع الأسرة الاستشفائية عن "خلل تخطيطي جسيم" يهدد العدالة التنموية. البيانات تظهر تفاوتاً صارخاً لا يمكن تبريره؛ فبينما تتمتع محافظة الطفيلة بمعدل رفاهية سريرية يبلغ 26 سريراً لكل 10 آلاف نسمة، ومحافظة عجلون بـ 20 سريراً، تعاني محافظات ذات ثقل سكاني وصناعي من حرمان واضح. تسجل محافظة جرش أدنى معدل وطني (6 أسرة)، تليها الزرقاء (7 أسرة)، ومأدبا (8 أسرة). هذا النقص الحاد في الزرقاء وجرش يجبر المواطنين على الانتقال للعاصمة للعلاج، مما يرفع الكلفة غير المباشرة (النقل، الوقت) ويزيد من الضغط على مستشفيات عمان التحويلية (البشير، المدينة الطبية)، ويؤدي إلى تدني كفاءة استخدام الموارد المتاحة في الأطراف.`
    },
    {
        title: "5. تحليل الفجوات والمخاطر والبيئة التنافسية",
        content: `**الفجوة الوظيفية:** تكمن في تهميش دور "المراكز الصحية الشاملة" التي تعمل بطاقة منخفضة، بينما تزدحم أقسام الطوارئ في المستشفيات بحالات غير طارئة (70% من المراجعين)، مما يربك المنظومة ويقلل من جودة الخدمة للحالات الحرجة.\n**مخاطر الاستدامة المالية:** الاعتماد المفرط على الإعفاءات الطبية "غير المغطاة تأمينياً" خارج موازنة وزارة الصحة يؤدي لمديونية تراكمية للمستشفيات ويعيق قدرتها على التحديث.\n**هجرة الكفاءات:** يواجه القطاع العام نزيفاً مستمراً للكفاءات التمريضية والطبية المدربة نحو القطاع الخاص والأسواق الخارجية (الخليج، أوروبا)، مما يفرغ برامج الاختصاص من محتواها ويؤثر على جودة الرعاية في المدى المتوسط، ويخلق بيئة تنافسية غير متكافئة بين القطاعين العام والخاص.`
    },
    {
        title: "6. الأولويات والتوجهات الاستراتيجية للقطاع",
        content: `تتمحور الأولويات للسنوات الخمس القادمة حول ثلاثة محاور رئيسية لضمان الاستدامة:\n1. **حوكمة التحويلات الطبية:** إنشاء هيئة مستقلة لتدقيق المطالبات وضبط التحويلات الطبية لضمان توجيهها للمستحقين طبياً وليس اجتماعياً، ووقف الهدر المالي.\n2. **تعزيز طب الأسرة:** تبني نموذج "طبيب الأسرة" لكل مواطن كحارس بوابة (Gatekeeper) للنظام الصحي، لتقليل التحويلات غير الضرورية للمستشفيات بنسبة 40% وتحسين إدارة الأمراض المزمنة.\n3. **التحول الرقمي الشامل:** استكمال ربط كافة القطاعات (العام، الخاص، العسكري) بمنصة "حكيم" لتوحيد السجل الطبي الوطني، مما يمنع تكرار الفحوصات وصرف الأدوية ويضبط الهدر، ويوفر قاعدة بيانات دقيقة للتخطيط.`
    },
    {
        title: "7. التوصيات التخطيطية ومتطلبات التنفيذ",
        content: `بناءً على التحليل، نوصي بحزمة التدخلات التنفيذية التالية:
* **إعادة التوزيع الجغرافي للاستثمار:** تجميد أي مشاريع بناء مستشفيات جديدة في عمان، وتوجيه الموازنات الرأسمالية حصراً لبناء مستشفى حكومي جديد في الزرقاء وتوسعة مستشفى جرش الحكومي فوراً لسد الفجوة السريرية الحرجة.
* **الشراكة التشغيلية (PPP):** تفعيل نظام "شراء الخدمات" من مستشفيات القطاع الخاص في المحافظات التي تعاني نقصاً (مثل مأدبا وإربد) بأسعار تفضيلية لوزارة الصحة، كحل بديل وأسرع من البناء الجديد.
* **حوافز المناطق النائية:** إقرار نظام "المسار المهني المتسارع" وعلاوات مجزية للأطباء الاختصاصيين (التخدير، الطوارئ، الأعصاب) للعمل في مستشفيات الجنوب والبادية، لضمان استقرار الكوادر.
* **الاعتمادية الإلزامية:** اشتراط حصول كافة المستشفيات والمراكز الصحية على اعتمادية (HCAC) كشرط أساسي لتجديد الترخيص والتعاقد التأميني، لضمان الحد الأدنى من سلامة المرضى.
* **السجل الطبي الوطني الموحد:** إلزام كافة مقدمي الخدمة (بما في ذلك العيادات الخاصة) بالربط الإلكتروني مع منصة "حكيم" لضبط صرف الأدوية المكرر ومنع الازدواجية في الإجراءات الطبية.
* **السياحة العلاجية:** تنظيم قطاع السياحة العلاجية من خلال "بوابة وطنية موحدة" لضمان الشفافية في الأسعار وجودة الخدمة، والحفاظ على سمعة الأردن الطبية إقليمياً.`
    }
];

const Health: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير القطاعي الشامل: الصحة 2024";
            
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
                ...reportContent.flatMap(section => [
                    new Paragraph({ text: section.title, style: "h2" }),
                    new Paragraph({ text: section.content, style: "Normal" })
                ])
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
                        font-size: 14pt;
                        line-height: 1.6;
                    }
                    .no-print, .recharts-wrapper, button, svg, .icon-container, .kpi-card-visual { display: none !important; }
                    .card-container { box-shadow: none !important; border: none !important; padding: 0 !important; margin-bottom: 20px !important; }
                    h1 { font-size: 24pt; font-weight: bold; text-align: center; border-bottom: 3px solid #000; margin-bottom: 30px; padding-bottom: 10px; }
                    h2 { font-size: 18pt; font-weight: bold; border-bottom: 1px solid #666; margin-top: 30px; margin-bottom: 15px; }
                    p, li { text-align: justify; margin-bottom: 12px; }
                    strong { font-weight: bold; }
                    @page { size: A4; margin: 2.5cm; }
                </style>
            </head>
        `;

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <div class="report-header">
                        <h1>التقرير القطاعي الشامل: الصحة 2024</h1>
                    </div>
                    <div class="content">
                        ${reportContent.map(section => `
                            <h2>${section.title}</h2>
                            <p>${section.content.replace(/\n/g, '<br/>')}</p>
                        `).join('')}
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
                        تقييم الأداء المؤسسي، عدالة التوزيع، واستراتيجيات الاستدامة الصحية (2024).
                    </p>
                </header>
                
                {reportContent.map((section, idx) => (
                    <Card key={idx} className="card-container">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
                        <div className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed whitespace-pre-line">
                            {section.content.split('\n').map((line, i) => {
                                const parts = line.split(/(\*\*.*?\*\*)/g);
                                return (
                                    <p key={i} className="mb-3">
                                        {parts.map((part, j) => 
                                            part.startsWith('**') && part.endsWith('**') 
                                                ? <strong key={j} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong> 
                                                : part
                                        )}
                                    </p>
                                );
                            })}
                        </div>
                        {idx === 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center kpi-card-visual mt-6">
                                {KPI_CARD_DATA.map(item => (
                                    <div key={item.title} className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl break-inside-avoid">
                                        <div className="text-3xl mb-2 icon-container">{item.icon}</div>
                                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{item.value}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.title}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {idx === 3 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print mt-6">
                                <div style={{ height: 300 }}>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">توزيع الأسرة حسب القطاع</h4>
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
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">معدل الأسرة لكل 10 آلاف نسمة</h4>
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
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Health;
