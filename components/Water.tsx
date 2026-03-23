
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
            content: `يُظهر التحليل الدقيق لبيانات التزود المائي في الأردن قصة نجاح في "شمولية البنية التحتية" تواجه تحديات في "الاستدامة والكفاءة". تشير الإحصاءات المحدثة إلى أن 95.28% من مساكن المملكة تعتمد على الشبكة العامة كمصدر رئيسي للمياه، وهو معدل مرتفع جداً يعكس استثماراً حكومياً ضخماً في إيصال المياه. ومع ذلك، فإن التحدي انتقل من "الإتاحة" إلى "الموثوقية"، حيث لا تزال بعض المحافظات، وتحديداً المفرق، تسجل نسباً ملحوظة في الاعتماد على الصهاريج (11.43%). الأثر الاستراتيجي يكمن اليوم في الحفاظ على هذه الشبكة الممتدة وتقليل الفاقد، وضمان عدالة التوزيع خاصة في مناطق الضغط السكاني واللجوء، حيث أن الاعتماد المرتفع على الشبكة يضع مسؤولية جسيمة على الدولة لضمان استمرارية الضخ.`
        },
        {
            title: "2. الإطار العام للقطاع والمشهد الديموغرافي",
            content: `يتأثر المشهد المائي بشكل مباشر بالكثافة السكانية والتوزيع الجغرافي. في المحافظات ذات الكثافة العالية والتنظيم الحضري المستقر مثل **العقبة** و**الزرقاء** و**مأدبا**، تصل نسبة الاعتماد على الشبكة إلى مستويات قياسية (فوق 98%)، مما يعكس كفاءة في تغطية المناطق الحضرية. في المقابل، تظهر المحافظات ذات الرقعة الجغرافية الواسعة والتجمعات المتناثرة مثل **المفرق** نمطاً مغايراً، حيث تنخفض نسبة الربط الشبكي إلى 84.0%، مما يضطر السكان للاعتماد على الصهاريج (11.43%) والآبار الارتوازية. هذا التباين يفرض كلفاً إضافية على الأسر الريفية وسكان البادية، ويربط الأمن المائي لديهم بقدرتهم المالية على شراء المياه.`
        },
        {
            title: "3. تحليل الأداء التنموي والمؤشرات الرئيسية (KPIs)",
            content: `يكشف تحليل مؤشرات مصادر المياه عن تفوق واضح لمحافظات الجنوب والوسط في نسبة الربط بالشبكة العامة. تتصدر **العقبة** المملكة بنسبة 99.72%، تليها **الزرقاء** (98.80%) و**مأدبا** (98.35%)، مما يشير إلى نجاح السياسات في هذه المحافظات. على النقيض، تظهر مؤشرات القلق في إقليم الشمال، حيث تسجل **المفرق** أعلى نسبة اعتماد على الصهاريج (11.43%) تليها **إربد** (7.56%) و**جرش** (7.30%). هذه الأرقام في محافظات الشمال ترتبط بشكل مباشر بالضغط السكاني وتوسع العمران في مناطق قد تكون الشبكة فيها أضعف أو تعاني من انقطاعات تجبر المواطنين على البدائل. كما يلاحظ ارتفاع نسبة الاعتماد على مياه الأمطار في **عجلون** (3.14%) كبديل بيئي مستدام.`
        },
        {
            title: "4. دراسة الأبعاد التنموية وكفاءة الموارد",
            content: `رغم التغطية الشاملة للشبكة، إلا أن حصة الفرد المائية لا تزال تمثل التحدي الأكبر لكفاءة الموارد. البيانات تشير إلى أن **إربد** تعاني من أدنى حصة للفرد (77.6 متر مكعب)، مما يفسر لجوء 7.56% من سكانها للصهاريج رغم وجود الشبكة، فالشبكة موجودة لكن المياه قد لا تصل بالكميات الكافية. في المقابل، تتمتع العقبة بحصة فرد مرتفعة (302.9 م³) مع تغطية شبكة شبه كاملة، مما يعكس نموذجاً مائياً مستقراً. كفاءة الموارد تتطلب التركيز الآن على تقليل الفاقد في المحافظات التي تعتمد كلياً على الشبكة (مثل الكرك والطفيلة) لضمان ديمومة الخدمة دون انقطاع.`
        },
        {
            title: "5. تحليل الفجوات والمخاطر والبيئة التنافسية",
            content: `**فجوة الصرف الصحي:** بينما نجحت الدولة في إيصال المياه لـ 95% من السكان، لا يزال الصرف الصحي متأخراً بشكل خطير، خاصة في **المفرق** (13.1% فقط مخدومون) و**الكرك** (15.7%). هذا التفاوت بين مدخلات المياه (شبكة قوية) ومخرجاتها (صرف صحي ضعيف) يشكل تهديداً بيئياً هائلاً للمياه الجوفية.\n**فجوة الأطراف:** تظهر بوضوح في المفرق، حيث لا يزال 11.4% من السكان خارج مظلة الشبكة العامة، وهي نسبة مرتفعة مقارنة بالمعدل الوطني (4.13% للصهاريج).\n**المخاطر:** تكمن في تآكل الشبكات القديمة في عمان والزرقاء، مما يحول "المياه الواصلة" إلى "مياه مفقودة"، ويهدد استقرار التزود الذي يعتمد عليه 96-98% من السكان.`
        },
        {
            title: "6. الأولويات والتوجهات الاستراتيجية للقطاع",
            content: `تتركز الأولويات الاستراتيجية في:\n1. **سد الفجوة في الشمال:** تنفيذ مشاريع تمديد شبكات مياه عاجلة في قرى المفرق والبادية لرفع نسبة الربط من 84% إلى المعدل الوطني (95%).\n2. **إدارة الطلب:** بما أن الشبكة تصل للجميع تقريباً، فالأولوية الآن لتركيب العدادات الذكية وأنظمة كشف التسرب لضمان أن المياه التي تضخ تصل فعلياً للمواطن ولا تضيع هدراً.\n3. **التلازم بين المياه والصرف الصحي:** إعطاء أولوية قصوى لمشاريع الصرف الصحي في الكرك والمفرق لحماية مصادر الشرب التي تغذي الشبكة العامة.`
        },
        {
            title: "7. التوصيات التخطيطية ومتطلبات التنفيذ",
            content: `نوصي بتبني خارطة طريق تنفيذية تشمل:
* **برنامج "وصلة لكل منزل" في المفرق:** تخصيص موازنة رأسمالية عاجلة لربط الـ 16% المتبقية من سكان المفرق بالشبكة العامة، لإنهاء عصر الصهاريج في المناطق المأهولة.
* **صيانة وقائية للشبكات في الجنوب:** نظراً لاعتماد الكرك والطفيلة ومعان وشبه الكلي (97-98%) على الشبكة، يجب تكثيف برامج الصيانة الدورية لأن أي انقطاع يعني شللاً كاملاً في التزود لعدم وجود بدائل جاهزة.
* **دعم حصاد الأمطار في عجلون:** البناء على ثقافة المجتمع المحلي (3.14% يعتمدون على الأمطار) وتوسيع دعم آبار التجميع لتقليل الضغط على الشبكة في المناطق الجبلية.
* **لامركزية إدارة المياه:** منح إدارات المياه في المحافظات صلاحيات أكبر للتعامل مع الكسور والأعطال بسرعة، لضمان موثوقية الشبكة التي يعتمد عليها الغالبية العظمى من السكان.
* **الرقابة على نوعية مياه الشبكة:** تكثيف الفحوصات المخبرية الدورية لنقاط النهاية في الشبكات، خاصة في الزرقاء وعمان، لتعزيز ثقة المواطن واستمرار اعتماده على الشبكة بدلاً من المياه المعبأة.`
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
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">توزيع مصادر مياه الشرب الرئيسية للأسر</h3>
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
