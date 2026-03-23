
import React, { useMemo, useState } from 'react';
import Card from './ui/Card';
import { INCOME_DATA } from '../constants/incomeData';
import { GOVERNORATES_DATA } from '../constants';
import IncomeSourceBreakdownChart from './charts/IncomeSourceBreakdownChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { GOVERNORATE_COLORS } from '../constants/colors';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

const Income: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const governorateIncomeData = useMemo(() => INCOME_DATA.filter(d => !['Urban', 'Rural', 'Kingdom'].includes(d.name)), []);

    const latestData = useMemo(() => {
        return governorateIncomeData.map(gov => {
            const baseGovData = GOVERNORATES_DATA.find(g => g.name === gov.name);
            return {
                ...baseGovData!,
                name: gov.name,
                name_ar: gov.name_ar,
                average_total_income: gov.data.average_total_income,
                income_from_employment: gov.data.employment_incomes,
            };
        });
    }, [governorateIncomeData]);

    const summaryData = {
        kingdom: INCOME_DATA.find(d => d.name === 'Kingdom')?.data,
        urban: INCOME_DATA.find(d => d.name === 'Urban')?.data,
        rural: INCOME_DATA.find(d => d.name === 'Rural')?.data,
    };

    const reportContent = [
        { 
            title: "1. الملخص التنفيذي والأثر الاستراتيجي", 
            content: `يُعد مستوى دخل الأسرة المؤشر الأصدق لقياس الرفاه الاقتصادي والقدرة الشرائية، والمرآة الحقيقية لعدالة توزيع مكتسبات التنمية. تشير بيانات عام 2024 إلى أن متوسط دخل الأسرة السنوي في المملكة بلغ ${summaryData.kingdom?.average_total_income.toLocaleString()} دينار، وهو رقم يخفي خلفه تباينات هيكلية ومناطقية حادة. الأثر الاستراتيجي لهذه الفجوة يتجاوز البعد الاقتصادي؛ فهو المحرك الأول للهجرة الداخلية من الأطراف إلى المركز، والمسبب الرئيسي لتآكل الطبقة الوسطى في المحافظات البعيدة. إن استمرار التفاوت الكبير بين دخل الأسرة في العاصمة عمان (${latestData.find(d => d.name === 'Amman')?.average_total_income.toLocaleString()} دينار) ومحافظات مثل المفرق (${latestData.find(d => d.name === 'Mafraq')?.average_total_income.toLocaleString()} دينار) يهدد الاستقرار الديموغرافي ويعيق جهود التنمية المحلية، مما يستدعي تحولاً في السياسات من "دعم السلع" إلى "تمكين الدخل".` 
        },
        { 
            title: "2. الإطار العام للقطاع والمشهد الديموغرافي", 
            content: `يرتبط هيكل الدخل في الأردن بمتغيرات ديموغرافية وجغرافية معقدة. يُظهر تحليل البيانات فجوة "حضرية-ريفية" واضحة، حيث يبلغ متوسط دخل الأسر في الحضر ${summaryData.urban?.average_total_income.toLocaleString()} دينار، متفوقاً بشكل ملحوظ على الريف (${summaryData.rural?.average_total_income.toLocaleString()} دينار). هذه الفجوة تتفاقم بفعل "معدل الإعالة" المرتفع في المحافظات الطرفية، حيث يتقاسم عدد أكبر من أفراد الأسرة دخلاً محدوداً واحداً، مما يخفض نصيب الفرد الفعلي إلى مستويات تقارب خط الفقر. المشهد الديموغرافي يشير أيضاً إلى أن الأسر التي ترأسها نساء أو شباب حديثو التخرج هي الأكثر هشاشة مالياً، نظراً لضعف المشاركة الاقتصادية وارتفاع معدلات البطالة في هذه الفئات.` 
        },
        { 
            title: "3. تحليل الأداء التنموي والمؤشرات الرئيسية (KPIs)", 
            content: `عند تشريح مؤشرات الدخل، تظهر عمان كمركز الثقل الاقتصادي بمتوسط دخل سنوي يبلغ 2,788 دينار، مدفوعة بتنوع فرص العمل وارتفاع أجور القطاع الخاص. تأتي بعدها محافظات الوسط (البلقاء، مأدبا) والجنوب الصناعي (الكرك، العقبة) بمستويات دخل متوسطة تتراوح بين 2000-2300 دينار. في المقابل، تقبع محافظات الشمال والبادية (المفرق، جرش، معان) في ذيل القائمة، بمتوسطات دخل تقل عن 1850 دينار. هذا التباين يعني عملياً أن القوة الشرائية لأسرة في عمان تزيد بنسبة 60% عن نظيرتها في المفرق، مما يفسر تركز النشاط التجاري والخدمي في العاصمة وضعفه في الأطراف، ويؤكد الحاجة لسياسات أجور وتحفيز استثماري تأخذ "كلفة المعيشة" و"العدالة المكانية" بعين الاعتبار.` 
        },
        { 
            title: "4. دراسة الأبعاد التنموية وكفاءة الموارد", 
            content: `يعاني هيكل الدخل الأردني من تشوه بنيوي يتمثل في الاعتماد المفرط على "الرواتب والأجور" (الاستخدام) كمصدر وحيد للدخل، حيث يشكل أكثر من 45% من إجمالي دخل الأسر في معظم المحافظات. في **العقبة**، يصل الدخل من الاستخدام إلى 1,165 دينار، وهو الأعلى وطنياً، مما يعكس نجاح المنطقة الاقتصادية في خلق وظائف رسمية. في المقابل، يعتمد اقتصاد الأسر في محافظات مثل **الكرك** و**عجلون** بشكل كبير على "التحويلات" (التقاعد، المعونة الوطنية، تحويلات المغتربين)، حيث تصل إلى 963 دينار في الكرك. هذا الاعتماد على التدفقات النقدية غير الإنتاجية يجعل اقتصاديات هذه المحافظات هشة وغير مستدامة، وعرضة لأي تغييرات في سياسات التقاعد أو تراجع تحويلات العاملين في الخارج.` 
        },
        { 
            title: "5. تحليل الفجوات والمخاطر والبيئة التنافسية", 
            content: `**فجوة الدخل والإنفاق:** تشير أنماط الاستهلاك إلى أن شريحة واسعة من الأسر في الزرقاء والمفرق وجرش تعيش في حالة "عجز مالي مزمن"، حيث يتجاوز الإنفاق الأساسي (غذاء، سكن، طاقة) مستوى الدخل المتاح، مما يضطرها للاستدانة وتآكل المدخرات.\n**ضعف الريادة:** تكشف البيانات عن ضآلة مساهمة "العمل الخاص" في دخل الأسر (أقل من 10% في معظم المحافظات باستثناء عمان)، مما يشير إلى ضعف بيئة الأعمال الصغيرة والمتوسطة وعدم قدرتها على توليد الثروة.\n**المخاطر:** تآكل الدخل الحقيقي بفعل التضخم وثبات الرواتب يشكل الخطر الأكبر، مما قد يدفع المزيد من الأسر نحو الطبقة الفقيرة ويزيد الضغط على شبكات الأمان الاجتماعي.` 
        },
        { 
            title: "6. الأولويات والتوجهات الاستراتيجية للقطاع", 
            content: `تتمحور الأولويات الوطنية لردم فجوة الدخل حول:\n1. **تنويع مصادر الدخل:** الانتقال من ثقافة "الوظيفة والراتب" إلى ثقافة "الإنتاج والملكية"، من خلال دعم المشاريع المنزلية والزراعية والسياحية الصغيرة في المحافظات.\n2. **اللامركزية الاستثمارية:** توجيه الاستثمارات كثيفة العمالة (المصانع، مراكز الاتصال) نحو المحافظات ذات الدخل المنخفض لرفع مستوى الأجور وخلق طبقة وسطى محلية.\n3. **الحماية من التضخم:** تبني سياسات لضبط أسعار السلع الأساسية والطاقة، وحماية القوة الشرائية للأسر محدودة الدخل من التآكل.` 
        },
        { 
            title: "7. التوصيات التخطيطية ومتطلبات التنفيذ", 
            content: `لتحسين واقع الدخل المعيشي، يوصى بتبني السياسات التالية:
* **سياسة الحد الأدنى للأجور المرن:** دراسة ربط الحد الأدنى للأجور بمعدلات التضخم وتكاليف المعيشة (Living Wage) ومراجعته سنوياً لضمان حد الكفاف والكرامة الإنسانية.
* **برامج التمويل الريفي الميسر:** إطلاق نوافذ تمويلية حكومية بفوائد صفرية وفترات سماح طويلة لدعم مشاريع الأسر الريفية في الزراعة والتصنيع الغذائي، لتعزيز الدخل من "العمل الخاص".
* **الحوافز الضريبية المكانية:** منح إعفاءات ضريبية كاملة لمدة 10 سنوات للشركات التي تنقل مقراتها وعملياتها للمحافظات الأقل دخلاً (المفرق، الطفيلة، معان) وتشغل أبناء المحافظة.
* **تنظيم اقتصاد العمل الحر (Gig Economy):** وضع إطار تشريعي لحماية العاملين في التطبيقات الذكية والعمل عن بعد، لضمان استقرار دخلهم وتوفير حماية اجتماعية لهم، كقطاع واعد للشباب.
* **سلاسل القيمة المحلية:** دعم إنشاء "تعاونيات تسويقية" في المحافظات لتقليل حلقات الوساطة التجارية، مما يضمن ذهاب النسبة الأكبر من أرباح بيع المنتجات الزراعية والحرفية للمنتج المحلي مباشرة وليس للوسطاء.
* **الشمول المالي الرقمي:** توسيع خدمات المحافظ الإلكترونية والإقراض الرقمي في المناطق النائية لتمكين الأسر من إدارة مواردها المالية والحصول على تمويل طارئ بكرامة وسهولة.` 
        }
    ];

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير القطاعي الشامل: الدخل والإنفاق 2024";
            
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
                <title>تقرير الدخل والإنفاق - 2024</title>
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
                        <h1>التقرير القطاعي الشامل: الدخل والإنفاق 2024</h1>
                    </div>
                    <div class="content">
                        ${reportContent.map(section => `
                            <h2>${section.title}</h2>
                            <p>${section.content}</p>
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
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">التقرير الاستراتيجي: دخل الأسرة والإنفاق</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                        تحليل معمق لمتوسط دخل الأفراد، مصادره، والفجوات التنموية بين المحافظات.
                    </p>
                </header>

                {reportContent.map((section, idx) => (
                    <Card key={idx} className="card-container">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                            {section.content}
                        </div>
                        {idx === 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 kpi-card-visual mt-6">
                                <Card className="card-container flex flex-col justify-center items-center bg-green-50 dark:bg-green-900/50 break-inside-avoid">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">متوسط دخل المملكة</h3>
                                    <p className="text-5xl font-bold text-green-500 my-2">{summaryData.kingdom?.average_total_income.toLocaleString()}</p>
                                    <p className="text-base text-gray-600">دينار أردني سنوياً</p>
                                </Card>
                                <Card className="card-container flex flex-col justify-center items-center break-inside-avoid">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">متوسط دخل الحضر</h3>
                                    <p className="text-5xl font-bold text-gray-900 dark:text-gray-200 my-2">{summaryData.urban?.average_total_income.toLocaleString()}</p>
                                    <p className="text-base text-gray-600">دينار أردني سنوياً</p>
                                </Card>
                                <Card className="card-container flex flex-col justify-center items-center break-inside-avoid">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">متوسط دخل الريف</h3>
                                    <p className="text-5xl font-bold text-gray-900 dark:text-gray-200 my-2">{summaryData.rural?.average_total_income.toLocaleString()}</p>
                                    <p className="text-base text-gray-600">دينار أردني سنوياً</p>
                                </Card>
                            </div>
                        )}
                        {idx === 2 && (
                            <div style={{ width: '100%', height: 350 }} className="no-print mt-6">
                                <ResponsiveContainer>
                                <BarChart data={latestData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                    <XAxis dataKey="name_ar" tick={{ fontSize: 12, fill: '#333333' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#333333' }} />
                                    <Tooltip formatter={(value: number) => `${value.toFixed(1)} د.أ`} />
                                    <Bar dataKey="average_total_income" name="متوسط إجمالي الدخل" radius={[4, 4, 0, 0]}>
                                        <LabelList dataKey="average_total_income" position="top" formatter={(value: number) => Math.round(value).toLocaleString()} style={{ fill: '#111827', fontSize: '12px' }} />
                                        {latestData.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={GOVERNORATE_COLORS[entry.name]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        {idx === 3 && (
                            <div className="no-print mt-6">
                                <IncomeSourceBreakdownChart data={governorateIncomeData} />
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Income;
