
import React, { useState } from 'react';
import Card from './ui/Card';
import { NATIONAL_AVERAGES_2024, JORDAN_VISION_2033_TARGETS } from '../constants';
import { ECONOMIC_EMPOWERMENT_DATA } from '../constants/economicEmpowermentData';
import { WOMEN_DEV_DATA_2024 } from '../constants/womensDevelopmentData';
import EconomicEmpowermentChart from './charts/EconomicEmpowermentChart';
import GovernorateBarChart from './charts/GovernorateBarChart';
import { EMPLOYED_WOMEN_DISTRIBUTION_DATA_2024 } from '../constants/employedWomenDistData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

const reportContent = [
    {
        title: "1. الملخص التنفيذي والأثر الاستراتيجي",
        content: `يُشكل ملف تمكين المرأة التحدي الأبرز في الهيكل الاقتصادي الأردني، حيث لا تزال مشاركتها الاقتصادية تراوح مكانها عند ${NATIONAL_AVERAGES_2024.female_labor_force_participation.toFixed(1)}%، وهي من أدنى النسب عالمياً، رغم التفوق الأكاديمي الواضح للإناث في كافة المراحل التعليمية. الأثر الاستراتيجي لدمج المرأة لا يقتصر على البعد الحقوقي، بل يتعداه إلى البعد الاقتصادي الكلي؛ إذ تقدر الدراسات أن رفع نسبة المشاركة إلى ${JORDAN_VISION_2033_TARGETS.female_labor_force_participation}% سيضيف ما لا يقل عن مليار دينار للناتج المحلي الإجمالي سنوياً، وسيعزز الأمن المعيشي للأسر الأردنية. إن تعطيل نصف المجتمع عن الإنتاج يمثل هدراً هائلاً للموارد البشرية الوطنية ويعيق تحقيق التنمية المستدامة.`
    },
    {
        title: "2. الإطار العام للقطاع والمشهد الديموغرافي",
        content: `تتميز القوى العاملة النسائية في الأردن بمفارقة صارخة تعرف بـ "مفارقة التعليم والبطالة". تشكل النساء 49% من السكان، وتحقق الإناث معدلات نجاح وتفوق أعلى من الذكور في الثانوية العامة والجامعات، إلا أن هذا الاستثمار الهائل في التعليم يتبخر عند بوابة سوق العمل. ديموغرافياً، تتركز الكفاءات النسائية الشابة والمتعلمة في المدن الكبرى ومراكز المحافظات، لكن معدلات البطالة بينهن ترتفع بشكل مقلق في المحافظات (الكرك، المفرق، الطفيلة) نتيجة ندرة فرص العمل اللائقة، ومحدودية القطاع الخاص، والقيود الاجتماعية التي تحد من قدرة المرأة على التنقل للعمل في مناطق بعيدة عن سكنها.`
    },
    {
        title: "3. تحليل الأداء التنموي والمؤشرات الرئيسية (KPIs)",
        content: `يكشف التحليل الجغرافي لمؤشرات البطالة والمشاركة عن تباينات حادة ومقلقة. تتصدر محافظة **الزرقاء** المشهد بمعدل بطالة إناث كارثي يصل إلى 39.3%، تليها **جرش** (36.2%) و**عمان** (35.2%). هذا الارتفاع في مراكز الثقل السكاني والصناعي يشير إلى أن سوق العمل التقليدي "طارد" للمرأة، إما بسبب تدني الأجور مقارنة بكلفة المواصلات والرعاية، أو بسبب بيئة العمل غير الصديقة للأسرة. في المقابل، تسجل **العقبة** أدنى معدل مشاركة اقتصادية (7.6%)، مما يعكس هيمنة القطاعات الذكورية (الموانئ، النقل، اللوجستيات) وضعف القطاعات النسوية (السياحة، الخدمات) في توفير فرص ملائمة للمرأة.`
    },
    {
        title: "4. دراسة الأبعاد التنموية وكفاءة الموارد",
        content: `تُظهر بيانات الضمان الاجتماعي فجوة كبيرة في الحماية الاجتماعية، وهي مؤشر حيوي على جودة الوظائف. في محافظة العقبة، لا تتجاوز نسبة الإناث من إجمالي المؤمن عليهم 23.4%، وفي معان 24.5%. هذا يعني أن الغالبية العظمى من النساء العاملات في هذه المناطق ينخرطن في "الاقتصاد غير المنظم" (زراعة، مشاريع منزلية، تعليم غير رسمي) ويفتقرن لأبسط حقوق الحماية كإجازات الأمومة وتأمين التعطل والتقاعد. هذا الواقع يرسخ هشاشتهن الاقتصادية ويجعلهن أول الضحايا عند أي أزمة اقتصادية، كما يحرم الاقتصاد الرسمي من مساهماتهن الضريبية والإنتاجية الموثقة.`
    },
    {
        title: "5. تحليل الفجوات والمخاطر والبيئة التنافسية",
        content: `الفجوة الرئيسية التي تعيق عمل المرأة تكمن في "اقتصاد الرعاية". غياب الحضانات المؤسسية الميسرة التكلفة ووسائل النقل العام الآمنة والمنتظمة يشكل العائق الأكبر، حيث تستنزف كلفة المواصلات والرعاية ما يقارب 40-50% من راتب المرأة المتوقع (الذي غالباً ما يكون قريباً من الحد الأدنى للأجور)، مما يجعل خيار "البقاء في المنزل" قراراً اقتصادياً عقلانياً للأسر ذات الدخل المحدود. إضافة إلى ذلك، تشكل الأمية في بعض جيوب الفقر (معان 13.7%، الطفيلة 11.8%) عائقاً هيكلياً أمام دمج نساء هذه المناطق في سوق العمل الحديث الذي يتطلب مهارات رقمية ووظيفية متقدمة.`
    },
    {
        title: "6. الأولويات والتوجهات الاستراتيجية للقطاع",
        content: `تتركز الأولويات الوطنية للتمكين الاقتصادي للمرأة في:\n1. **مأسسة اقتصاد الرعاية:** التوسع في إنشاء الحضانات المؤسسية في القطاعين العام والخاص، خاصة في الزرقاء وعمان، لتقليل "كلفة الفرصة البديلة" لعمل المرأة وخلق فرص عمل جديدة لمربيات مؤهلات.\n2. **العمل المرن:** مأسسة العمل المرن والعمل عن بعد في التشريعات والممارسات، خاصة للقطاعات الخدمية والتكنولوجية، لتمكين النساء في المحافظات البعيدة من العمل لصالح شركات في المركز أو الخارج دون الحاجة للهجرة أو التنقل اليومي المكلف.\n3. **الشمول المالي:** تصميم منتجات تمويلية ميسرة (بدون ضمانات تقليدية كالأرض والعقار) تستهدف النساء الرياديات في الأطراف لتمكينهن من بدء مشاريعهن الخاصة.`
    },
    {
        title: "7. التوصيات التخطيطية ومتطلبات التنفيذ",
        content: `لردم الفجوة الجندرية وتحقيق قفزة في المشاركة الاقتصادية، يوصى بما يلي:
* **توجيه حوافز الاستثمار:** ربط منح الإعفاءات الضريبية للمستثمرين الجدد في المحافظات (خاصة في قطاعات النسيج والصناعات الغذائية) باشتراط توظيف نسبة لا تقل عن 40% من الإناث من المجتمع المحلي.
* **تطوير شبكة نقل آمنة:** إطلاق خطوط نقل "ترددية وآمنة" مخصصة لربط القرى والبادية بمراكز العمل والمدن الصناعية في إربد والكرك، مزودة بكاميرات مراقبة لضمان بيئة آمنة تشجع الأهالي على عمل بناتهم.
* **حماية العاملات في الزراعة:** إصدار نظام خاص لعمال الزراعة يضمن شمولهم بالضمان الاجتماعي والتأمين الصحي، وتغليظ العقوبات على "سماسرة العمالة" الذين يستغلون نساء الأغوار والمفرق.
* **برامج "التشغيل الذاتي" الرقمي:** إطلاق أكاديميات رقمية في معان والطفيلة لتدريب الفتيات على مهارات "العمل الحر عبر الإنترنت" (Freelancing) في مجالات الترجمة، التصميم، والتسويق الإلكتروني، لتجاوز عقبة الجغرافيا.
* **تعديل نظام الخدمة المدنية:** منح نقاط إضافية في التعيين أو علاوات خاصة للنساء اللواتي يعملن في مناطق نائية بعيدة عن مكان سكنهن لتشجيع الحراك الوظيفي.
* **دعم الحضانات المؤسسية:** تقديم إعفاءات ضريبية وجمركية كاملة لتأسيس الحضانات في أماكن العمل، وإلزام المؤسسات الكبرى (التي تزيد عمالتها عن 50 عاملاً/عاملة) بتوفير حضانة أو بدل رعاية.`
    }
];

const WomensDevelopment: React.FC = () => {
    const [selectedGov, setSelectedGov] = useState('Amman');
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const selectedGovData = ECONOMIC_EMPOWERMENT_DATA.find(g => g.name === selectedGov)?.data;

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير القطاعي الشامل: تنمية المرأة 2024";
            
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
                <title>تقرير قطاع المرأة - 2024</title>
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
                    .no-print, .recharts-wrapper, button, select, svg, .icon-container, .kpi-card-visual { display: none !important; }
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
                        <h1>التقرير القطاعي الشامل: واقع المرأة الأردنية 2024</h1>
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
                    <h1 className="text-3xl font-bold text-gray-900">التقرير الاستراتيجي لقطاع المرأة</h1>
                    <p className="text-lg text-gray-700 mt-1">قراءة معمقة في مؤشرات المشاركة والتمكين والتحديات (2024).</p>
                </header>
                
                {reportContent.map((section, idx) => (
                    <Card key={idx} className="card-container">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                        <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
                            {section.content.split('\n').map((line, i) => {
                                const parts = line.split(/(\*\*.*?\*\*)/g);
                                return (
                                    <p key={i} className="mb-3">
                                        {parts.map((part, j) => 
                                            part.startsWith('**') && part.endsWith('**') 
                                                ? <strong key={j} className="font-bold text-gray-900">{part.slice(2, -2)}</strong> 
                                                : part
                                        )}
                                    </p>
                                );
                            })}
                        </div>
                        {idx === 0 && (
                            <div className="flex flex-col justify-center items-center kpi-card-visual mt-6">
                                <div className="bg-gray-100 p-6 rounded-xl text-center">
                                    <h3 className="text-lg font-semibold text-gray-800">مشاركة الإناث في القوى العاملة (2024)</h3>
                                    <p className="text-5xl font-bold text-violet-500 my-2">{NATIONAL_AVERAGES_2024.female_labor_force_participation.toFixed(1)}%</p>
                                    <p className="text-sm text-gray-600">المعدل الوطني</p>
                                </div>
                            </div>
                        )}
                        {idx === 3 && (
                            <div className="no-print mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">الشمول في الضمان الاجتماعي</h3>
                                    <select
                                        value={selectedGov}
                                        onChange={(e) => setSelectedGov(e.target.value)}
                                        className="bg-gray-100 border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        {ECONOMIC_EMPOWERMENT_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                                    </select>
                                </div>
                                {selectedGovData && <EconomicEmpowermentChart data={selectedGovData} />}
                            </div>
                        )}
                        {idx === 2 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12 no-print mt-6">
                                <div>
                                    <p className="text-lg text-gray-700 mb-4">معدل البطالة (إناث)</p>
                                    <GovernorateBarChart data={WOMEN_DEV_DATA_2024 as any} dataKey="unemployment_rate_f" unit="%" title="معدل البطالة" />
                                </div>
                                <div>
                                    <p className="text-lg text-gray-700 mb-4">معدل الأمية (إناث)</p>
                                    <GovernorateBarChart data={WOMEN_DEV_DATA_2024 as any} dataKey="illiteracy_rate_f" unit="%" title="معدل الأمية" />
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default WomensDevelopment;
