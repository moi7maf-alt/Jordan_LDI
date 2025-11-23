
import React, { useState } from 'react';
import Card from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { GOVERNORATE_COLORS } from '../constants/colors';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

const NATIONAL_KPI_DATA = {
    totalStudents: "2,307,110",
    totalSchools: "7,649",
    totalTeachers: "147,649",
    moeBudget: "1.25 مليار د.أ"
};

const STUDENTS_BY_GOVERNORATE = [
    { name_ar: 'عمان', value: 844395, name: 'Amman' },
    { name_ar: 'إربد', value: 421817, name: 'Irbid' },
    { name_ar: 'الزرقاء', value: 310545, name: 'Zarqa' },
    { name_ar: 'المفرق', value: 163848, name: 'Mafraq' },
    { name_ar: 'البلقاء', value: 155065, name: 'Balqa' },
    { name_ar: 'الكرك', value: 90966, name: 'Karak' },
    { name_ar: 'جرش', value: 71045, name: 'Jarash' },
    { name_ar: 'مأدبا', value: 62275, name: 'Madaba' },
    { name_ar: 'العقبة', value: 55454, name: 'Aqaba' },
    { name_ar: 'عجلون', value: 51677, name: 'Ajloun' },
    { name_ar: 'معان', value: 47690, name: 'Maan' },
    { name_ar: 'الطفيلة', value: 32333, name: 'Tafilah' },
];

const KpiCard: React.FC<{ title: string; value: string; icon: string; }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl text-center shadow-sm break-inside-avoid card-container kpi-card-visual">
        <div className="text-3xl mb-2 icon-container">{icon}</div>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title}</p>
    </div>
);

const reportContent = [
    {
        title: "1. الملخص التنفيذي والأثر الاستراتيجي",
        content: `يكشف التشخيص الاستراتيجي لقطاع التعليم عن "خلل هيكلي عميق" بين حجم الإنفاق وجدوى المخرجات. فرغم تخصيص موازنة ضخمة تتجاوز 1.25 مليار دينار، يذهب 88.4% منها كنفقات جارية (رواتب وأجور)، مما يترك هامشاً ضئيلاً جداً للتطوير الرأسمالي وصيانة البنية التحتية. هذا الجمود المالي يعيق أي خطط حقيقية للتحديث، ويجعل النظام التعليمي أسير "إدارة التشغيل اليومي" بدلاً من "إدارة التنمية". الأثر الاستراتيجي لهذا الواقع يتمثل في تعميق فجوة المهارات، حيث يستمر النظام في ضخ مخرجات أكاديمية مشبعة لسوق العمل، بينما يظل التعليم المهني والتقني مهمشاً (12.3% فقط). إن تحقيق رؤية التحديث الاقتصادي 2033 يتطلب تحولاً جذرياً من "التعليم للتلقين" إلى "التعليم للتمكين والتشغيل"، مع التركيز على العدالة المكانية في توزيع مكتسبات التنمية التعليمية.`
    },
    {
        title: "2. الإطار العام للقطاع والمشهد الديموغرافي",
        content: `يواجه قطاع التعليم ضغطاً ديموغرافياً هائلاً ناتجاً عن النمو الطبيعي للسكان وموجات اللجوء. بلغ إجمالي عدد الطلبة ${NATIONAL_KPI_DATA.totalStudents} طالب وطالبة، موزعين على ${NATIONAL_KPI_DATA.totalSchools} مدرسة. التحليل الديموغرافي يظهر تركزاً كثيفاً للطلبة في "إقليم الوسط" (عمان، الزرقاء، البلقاء) بنسبة 61.5%، مما يخلق ضغطاً هائلاً على البنية التحتية في هذه المناطق ويؤدي إلى ظواهر سلبية كالاكتظاظ ونظام الفترتين. في المقابل، تعاني محافظات الأطراف (مثل الطفيلة ومعان) من تشتت السكان وصعوبة إيصال الخدمات التعليمية النوعية بكفاءة اقتصادية. هذا التباين الديموغرافي يفرض تحدياً مزدوجاً: إدارة الاكتظاظ في المركز، وضمان جودة التعليم في الأطراف، مع الأخذ بعين الاعتبار "الهبة الديموغرافية" الشبابية التي تتطلب استثماراً نوعياً لتحويلها إلى محرك اقتصادي.`
    },
    {
        title: "3. تحليل الأداء التنموي والمؤشرات الرئيسية (KPIs)",
        content: `عند تقييم الأداء المؤسسي، نجد تبايناً واضحاً في مؤشرات الكفاءة والجودة. على مستوى الكفاءة الداخلية، يبلغ معدل الطالب لكل معلم في المدارس الحكومية حوالي 15.6، وهو معدل جيد إقليمياً، لكنه يخفي سوء توزيع حاد؛ فبينما تعاني مدارس القصبات من اكتظاظ يصل إلى 40 طالب في الشعبة، نجد مدارس في القرى النائية تعمل بأقل من طاقتها الاستيعابية. مؤشر "تأنيث التعليم" (70% معلمات) يطرح تحديات تربوية واجتماعية تتعلق بغياب القدوة الذكورية في المرحلة الأساسية ونقص معلمي التخصصات العلمية الذكور. أما مؤشر "المؤهلات العلمية"، فيشير إلى أن 83% من المعلمين يحملون درجة البكالوريوس، بينما لا تتجاوز نسبة حملة الدراسات العليا 6.8%، مما يعكس ضعفاً في مسار النمو المهني وغياب الحوافز لربط الترقية بالبحث التربوي والتطوير الذاتي.`
    },
    {
        title: "4. دراسة الأبعاد التنموية وكفاءة الموارد",
        content: `تعاني كفاءة الموارد من استنزاف مزمن يتمثل في "المدارس المستأجرة" التي تشكل 33.4% من إجمالي الأبنية المدرسية. هذا الملف لا يمثل فقط هدراً مالياً (ملايين الدنانير كإيجارات سنوية)، بل يشكل عائقاً تربويًا، حيث أن المباني المستأجرة (شقق سكنية أصلاً) تفتقر للساحات والمختبرات والمرافق الضرورية لبيئة تعليمية جاذبة. بالإضافة إلى ذلك، فإن اللجوء لنظام الفترتين في 13.3% من المدارس، خاصة في مناطق اللجوء السوري (المفرق، إربد، عمان)، يؤدي إلى تقليص وقت الحصة الدراسية وضعف التحصيل العلمي. كفاءة الإنفاق تتطلب تحولاً نحو "المجمعات المدرسية المركزية" المخدومة بشبكة نقل، بدلاً من الاستمرار في استئجار مباني متهالكة لحل مشاكل آنية.`
    },
    {
        title: "5. تحليل الفجوات والمخاطر والبيئة التنافسية",
        content: `**الفجوات الهيكلية:** الفجوة الأخطر هي "انفصال التعليم عن سوق العمل". ضعف التوجيه نحو التعليم المهني (0.8% من موازنة التعليم) أدى إلى تخريج جيوش من العاطلين عن العمل في تخصصات راكدة. كما توجد فجوة رقمية واضحة بين المدارس الخاصة (التي تتبنى مناهج دولية وتكنولوجيا متقدمة) والمدارس الحكومية في الأطراف.\n**المخاطر:** تتمثل المخاطر الرئيسية في تآكل البنية التحتية القديمة، وهجرة الكفاءات التعليمية المتميزة إلى القطاع الخاص أو الخارج، وتزايد معدلات التسرب المدرسي الخفي (الحضور الشكلي دون تعلم حقيقي).\n**البيئة التنافسية:** يشهد القطاع الخاص (43.8% من المدارس) نمواً متسارعاً، مما يعكس تراجع ثقة الطبقة الوسطى بالتعليم العام، ويكرس "الطبقية التعليمية" التي تهدد العدالة الاجتماعية وتكافؤ الفرص.`
    },
    {
        title: "6. الأولويات والتوجهات الاستراتيجية للقطاع",
        content: `تتمحور الأولويات الوطنية للسنوات القادمة حول ثلاثة مسارات متوازية:\n1. **هندسة التعليم المهني:** رفع نسبة الالتحاق بالتعليم المهني والتقني إلى 20% بحلول 2030، من خلال شراكات حقيقية مع القطاع الخاص لتدريب الطلبة في بيئة عمل حقيقية (نظام التلمذة المهنية).\n2. **التحول الرقمي والتعليم المدمج:** مأسسة التعليم عن بعد كجزء أصيل من المنظومة التعليمية، ليس كبديل للطوارئ، بل كأداة لتعويض نقص المعلمين في التخصصات النادرة في المدارس النائية.\n3. **اللامركزية الإدارية:** منح مديريات التربية في الميدان صلاحيات مالية وإدارية أوسع لإجراء الصيانات ومعالجة الاحتياجات اللوجستية دون الرجوع للمركز، لضمان سرعة الاستجابة.`
    },
    {
        title: "7. التوصيات التخطيطية ومتطلبات التنفيذ",
        content: `لتحقيق نقلة نوعية في القطاع التعليمي، يوصى بتبني حزمة الإجراءات التنفيذية التالية:
* **خارطة طريق للأبنية المدرسية:** وضع خطة عشرية ملزمة للتخلص من المباني المستأجرة نهائياً، تعتمد على التمويل التأجيري أو الشراكة مع القطاع الخاص (PPP) لبناء 60 مدرسة مجمعة ذكية سنوياً.
* **رخصة مزاولة المهنة:** تفعيل نظام "رخص المهن التعليمية" وربط العلاوات والترقيات بـ "مسار النمو المهني" واجتياز اختبارات الكفايات، وليس بالأقدمية فقط، لضمان جودة المعلم.
* **العدالة الرقمية:** إطلاق مشروع وطني لتزويد كافة مدارس الأطراف (خاصة في المفرق والبادية) بإنترنت عريض النطاق وأجهزة لوحية، لضمان وصول الطلبة لنفس المحتوى المعرفي المتاح لطلبة العاصمة.
* **الدمج المدرسي:** دمج المدارس الصغيرة المتقاربة (التي يقل طلابها عن 50) في "مجمعات تربوية ريفية" حديثة توفر بيئة تعليمية متكاملة ومواصلات آمنة، لرفع كفاءة التشغيل.
* **التوجيه المهني المبكر:** إدخال برامج التوجيه المهني بدءاً من الصف التاسع، وإلزامية التدريب العملي الصيفي لطلبة المرحلة الثانوية في قطاعات صناعية وخدمية.
* **حوكمة التعليم الخاص:** وضع نظام تصنيف وطني للمدارس الخاصة يربط سقف الرسوم المدرسية بجودة التعليم والخدمات المقدمة، لضبط الانفلات في الأسعار.`
    }
];

const Education: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير الاستراتيجي: قطاع التعليم 2024";
            
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
                <title>تقرير قطاع التعليم - 2024</title>
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
                    @page { size: A4; margin: 2.5cm; }
                </style>
            </head>
        `;

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <div class="report-header">
                        <h1>التقرير الاستراتيجي: قطاع التعليم 2024</h1>
                    </div>
                    <div class="content">
                        ${reportContent.map(section => `
                            <h2>${section.title}</h2>
                            <p>${section.content.replace(/\*\*/g, '').replace(/\n/g, '<br/>')}</p>
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
            <div className="flex justify-end items-center gap-4 mb-6 no-print">
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
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">تقرير تحليلي استراتيجي لقطاع التعليم</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                        قراءة في الاختلالات الهيكلية، كفاءة الإنفاق، وتحديات المستقبل (2024).
                    </p>
                </header>
                
                {reportContent.map((section, idx) => (
                    <Card key={idx} className="card-container">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                            {section.content.split('\n').map((line, i) => {
                                const parts = line.split(/(\*\*.*?\*\*)/g);
                                return (
                                    <p key={i} className="mb-2">
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
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center kpi-card-visual mt-6">
                                <KpiCard title="إجمالي الطلبة" value={NATIONAL_KPI_DATA.totalStudents} icon="👥" />
                                <KpiCard title="إجمالي المدارس" value={NATIONAL_KPI_DATA.totalSchools} icon="🏫" />
                                <KpiCard title="إجمالي المعلمين" value={NATIONAL_KPI_DATA.totalTeachers} icon="🧑‍🏫" />
                                <KpiCard title="مدارس مستأجرة" value="33.4%" icon="🏠" />
                            </div>
                        )}
                        {idx === 1 && (
                            <div style={{ height: 450 }} className="no-print mt-6">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">توزيع الطلبة حسب المحافظات</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[...STUDENTS_BY_GOVERNORATE].sort((a,b) => b.value - a.value)}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                        <XAxis dataKey="name_ar" tick={{ fontSize: 12, fill: '#000000' }} interval={0} />
                                        <YAxis tick={{ fontSize: 12, fill: '#000000' }} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)}/>
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(75, 85, 99, 0.1)' }}
                                            formatter={(value: number) => [value.toLocaleString(), "عدد الطلبة"]} 
                                            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', color: 'white', borderRadius: '8px', border: 'none' }} 
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="value" name="عدد الطلبة" radius={[4, 4, 0, 0]}>
                                            <LabelList 
                                                dataKey="value" 
                                                position="top" 
                                                formatter={(value: number) => value.toLocaleString()} 
                                                style={{ fill: '#000000', fontSize: '12px', fontWeight: 'bold' }} 
                                            />
                                            {STUDENTS_BY_GOVERNORATE.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={GOVERNORATE_COLORS[entry.name]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Education;
