
import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { WATER_DATA } from '../constants/waterData';
import { WATER_SOURCES_DATA } from '../constants/waterSourcesData';
import { WATER_SHORTAGE_DATA } from '../constants/waterShortageData';
import { SANITATION_DATA } from '../constants/sanitationData';
import WaterTrendChart from './charts/WaterTrendChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

const Water: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const [selectedGov, setSelectedGov] = useState('Amman');
    
    const selectedGovTrendData = WATER_DATA.find(g => g.name === selectedGov)?.data;
    
    const governorateData = useMemo(() => {
        return WATER_SOURCES_DATA.filter(d => d.name !== 'Kingdom').map(d => ({
            name: d.name,
            name_ar: d.name_ar,
        }));
    }, []);

    const reportContent = [
        {
            title: "1. الملخص التنفيذي والأثر الاستراتيجي",
            content: `يواجه الأردن تحدياً وجودياً يتمثل في العجز المائي الهيكلي، حيث تصنف المملكة كواحدة من أفقر دول العالم مائياً. إلا أن قراءة بيانات عام 2024 تذهب إلى ما هو أعمق من مجرد "شح الموارد"؛ فهي تكشف عن "أزمة إدارة وتوزيع" حادة تخلق تفاوتات تنموية واجتماعية خطيرة بين المحافظات. تظهر المؤشرات فجوة صارخة بين "المراكز الحضرية" التي تتمتع باستقرار مائي نسبي (مثل العقبة وعمان)، وبين "محافظات الأطراف" (مثل جرش والمفرق والكرك) التي تعيش واقعاً مائياً صعباً يعتمد فيه المواطن على الحلول الفردية المكلفة (الصهاريج). هذا الواقع يفرض كلفاً اقتصادية باهظة على الأسر الأردنية، ويستنزف المياه الجوفية، ويشكل تهديداً بيئياً عبر الصرف الصحي غير المعالج. الأمن المائي لم يعد مجرد قضية خدماتية، بل أصبح ركيزة أساسية للأمن القومي والاستقرار الاجتماعي.`
        },
        {
            title: "2. الإطار العام للقطاع والمشهد الديموغرافي",
            content: `يتأثر القطاع المائي بشكل مباشر بالنمو السكاني وتوزيع الكثافة. الضغط الديموغرافي في "إقليم الشمال" (إربد، المفرق) نتيجة اللجوء السوري شكل صدمة للبنية التحتية المائية، حيث انخفضت حصة الفرد إلى مستويات حرجة. في المقابل، يشهد الجنوب ضغطاً من نوع آخر يتعلق بالزراعة والتعدين. التحليل الديموغرافي يظهر أن الأسر في المناطق ذات الكثافة العالية والنمو العشوائي (أطراف المدن) هي الأكثر تضرراً من انقطاع المياه، مما يضطرها لإنفاق جزء كبير من دخلها على شراء المياه. هذا الارتباط بين "الفقر المائي" و"الفقر الاقتصادي" يتطلب معالجة شمولية تدمج التخطيط العمراني مع التخطيط المائي.`
        },
        {
            title: "3. تحليل الأداء التنموي والمؤشرات الرئيسية (KPIs)",
            content: `يكشف تحليل بيانات مصادر مياه الشرب عن تحول هيكلي في نمط التزود. تراجعت ثقة المواطن بالشبكة العامة في العديد من المحافظات، ليحل محلها "اقتصاد الصهاريج". في **جرش**، يعتمد 73.8% من الأسر على الصهاريج، وفي **مأدبا** 71.8%، وهي نسب تعني فشلاً وظيفياً للشبكة العامة في تلبية الطلب اليومي. على النقيض، تحافظ **الزرقاء** على أعلى نسبة اعتماد على الشبكة (43.4%)، تليها عمان (31.5%). مؤشر آخر مقلق هو الاعتماد المفرط على المياه المعبأة في **العقبة** (81.8%)، رغم توفر الشبكة، مما يشير لتحديات تتعلق بجودة المياه أو أنماط الاستهلاك. هذه المؤشرات تؤكد أن "الوصول للمياه" لا يعني بالضرورة "الأمن المائي" للأسر.`
        },
        {
            title: "4. دراسة الأبعاد التنموية وكفاءة الموارد",
            content: `عند تتبع حصة الفرد من التزود المائي، نلاحظ استنزافاً واضحاً في الشمال، حيث حافظت **إربد** على أدنى حصة للفرد (77.6 متر مكعب)، وهو رقم يقل عن خط الفقر المائي العالمي بكثير. في المقابل، سجلت **العقبة** قفزة نوعية في حصة الفرد لتصل إلى 302.9 م³، مدعومة بمشاريع التحلية، مما يطرح تساؤلات حول عدالة التوزيع وكفاءة الاستخدام بين المحافظات. كفاءة الموارد تعاني أيضاً من الفاقد الفني والإداري في الشبكات القديمة (خاصة في جرش والبلقاء)، مما يعني أن كميات ضخمة من المياه المدعومة تضيع قبل وصولها للمستهلك، مما يرفع كلفة المتر المكعب ويستنزف الموازنة العامة.`
        },
        {
            title: "5. تحليل الفجوات والمخاطر والبيئة التنافسية",
            content: `**فجوة الصرف الصحي:** هي القنبلة البيئية الموقوتة. في محافظة **المفرق**، لا تتجاوز نسبة المخدومين بالشبكة العامة 13.1%، بينما يعتمد 85.0% من السكان على الحفر الامتصاصية فوق أهم الأحواض الجوفية. في **الكرك**، الوضع مشابه (83.6% حفر). هذا الواقع يهدد بتلويث مصادر الشرب الجوفية بشكل لا رجعة فيه.\n**فجوة العدالة المائية:** تتجلى في التفاوت بين العقبة (97% لا يعانون نقصاً) وجرش (82% يعانون نقصاً). هذا التفاوت يخلق شعوراً بالغبن الاجتماعي ويهدد السلم الأهلي في المناطق المحرومة.\n**المخاطر:** تتمثل في استنزاف الأحواض الجوفية، وتذبذب الهطول المطري بسبب التغير المناخي، وارتفاع كلف الطاقة اللازمة لضخ المياه.`
        },
        {
            title: "6. الأولويات والتوجهات الاستراتيجية للقطاع",
            content: `تتركز الأولويات الاستراتيجية في:\n1. **الناقل الوطني:** الإسراع في تنفيذ مشروع الناقل الوطني لتحلية مياه البحر الأحمر وضخها للشمال والوسط، لتقليل الاعتماد على المياه الجوفية المستنزفة.\n2. **الحوكمة الذكية:** تركيب عدادات ذكية وأنظمة مراقبة (SCADA) لضبط الفاقد المائي وسرقة المياه، وتحسين كفاءة التحصيل المالي.\n3. **أمن التزود في الشمال:** إعطاء أولوية قصوى لمشاريع المياه في جرش وعجلون والمفرق، لتقليل الاعتماد على الصهاريج المكلفة وتعزيز استقرار التزود.`
        },
        {
            title: "7. التوصيات التخطيطية ومتطلبات التنفيذ",
            content: `نوصي بتبني خارطة طريق تنفيذية عاجلة تشمل:
* **إعلان "الطوارئ البيئية" في المفرق:** إطلاق مشروع وطني استراتيجي لمد شبكات الصرف الصحي في المفرق والبادية الشمالية لحماية الأحواض الجوفية من التلوث، بتمويل من صناديق المناخ الدولية.
* **تنظيم "بورصة الصهاريج":** إخضاع قطاع صهاريج المياه لنظام تتبع إلكتروني وتحديد سقوف سعرية ملزمة، ودمج أصحاب الصهاريج في منظومة الأمن المائي الرسمية لضمان الجودة والسعر العادل.
* **محطات المعالجة اللامركزية:** تبني نموذج محطات التنقية الصغيرة (Compact Units) لخدمة القرى والتجمعات السكانية المتناثرة في الكرك وعجلون، كبديل أسرع وأوفر من الشبكات المركزية الضخمة.
* **كودات الحصاد المائي الإلزامي:** تعديل تشريعات البناء لفرض وجود "بئر تجميع مياه أمطار" كشرط لإذن الأشغال في كافة المباني الجديدة، خاصة في محافظات الشمال ذات الهطول المطري الجيد.
* **استبدال المحاصيل الشرهة للمياه:** تقديم حوافز للمزارعين في الأغوار والمرتفعات للتحول من المحاصيل المستهلكة للمياه (مثل الموز والحمضيات) إلى زراعات ذات قيمة مضافة عالية واستهلاك مائي منخفض (مثل النخيل والزراعات المائية).
* **العدادات الذكية والفوترة:** تعميم تجربة العدادات الذكية في كافة المحافظات لتقليل الفاقد الإداري وضمان دقة الفواتير، مما يعزز الثقة بين المواطن وشركات المياه.`
        }
    ];

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير القطاعي الشامل: المياه والصرف الصحي 2024";
            
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
                <title>تقرير قطاع المياه - 2024</title>
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
                        <h1>التقرير القطاعي الشامل: المياه والصرف الصحي 2024</h1>
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
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">التقرير الاستراتيجي: قطاع المياه والصرف الصحي</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                        تحليل معمق للواقع المائي، فجوات التزود، وتحديات الصرف الصحي (2024).
                    </p>
                </header>

                {reportContent.map((section, idx) => (
                    <Card key={idx} className="card-container">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                            {section.content.split('\n').map((line, i) => {
                                const parts = line.split(/(\*\*.*?\*\*)/g);
                                return (
                                    <p key={i} className="mb-3">
                                        {parts.map((part, j) => 
                                            part.startsWith('**') && part.endsWith('**') 
                                                ? <strong key={j} className="font-bold text-blue-900 dark:text-blue-400">{part.slice(2, -2)}</strong> 
                                                : part
                                        )}
                                    </p>
                                );
                            })}
                        </div>
                        
                        {/* Visualization for Water Trend (after Section 5) */}
                        {idx === 4 && (
                            <div className="mt-8 pt-6 border-t border-gray-200 no-print">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">المؤشر البياني: حصّة الفرد من المياه (2020-2023)</h3>
                                    <select
                                        value={selectedGov}
                                        onChange={(e) => setSelectedGov(e.target.value)}
                                        className="bg-gray-100 border border-gray-300 rounded-md p-2 text-sm"
                                    >
                                        {governorateData.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                                    </select>
                                </div>
                                {selectedGovTrendData && <WaterTrendChart data={selectedGovTrendData} />}
                            </div>
                        )}

                        {/* Visualization for Water Sources (after Section 2) */}
                        {idx === 2 && (
                            <div className="mt-8 pt-6 border-t border-gray-200 no-print">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">توزيع مصادر مياه الشرب الرئيسية للأسر (%)</h3>
                                <div style={{ width: '100%', height: 450 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={WATER_SOURCES_DATA.filter(d => d.name !== 'Kingdom')} layout="vertical" margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                                            <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: '#333333' }} domain={[0, 100]} />
                                            <YAxis type="category" dataKey="name_ar" width={70} tick={{ fontSize: 12, fill: '#333333', fontWeight: 'bold' }} />
                                            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', color: '#fff', borderRadius: '8px', border: 'none' }} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                            <Bar dataKey="public_network" name="شبكة عامة" stackId="a" fill="#3b82f6" barSize={20} />
                                            <Bar dataKey="tanker" name="صهريج" stackId="a" fill="#f97316" barSize={20} />
                                            <Bar dataKey="mineral_water" name="مياه معدنية" stackId="a" fill="#10b981" barSize={20} />
                                            <Bar dataKey="rainwater" name="آبار تجميع" stackId="a" fill="#06b6d4" barSize={20} />
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

export default Water;
