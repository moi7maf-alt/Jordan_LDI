
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

type ContentBlock = { type: 'h1' | 'h2' | 'h3' | 'p' | 'list-item'; text: string; };

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
            title: "1. الأمن المائي: الواقع الاستراتيجي والتحديات الهيكلية",
            content: `يواجه الأردن أزمة مائية وجودية تتجاوز مفهوم "الشح" لتصل إلى العجز الهيكلي المزمن. تشير البيانات الرقمية لعام 2024 إلى انخفاض حصة الفرد من المياه في العديد من المحافظات عن خط الفقر المائي المدقع (أقل من 100 متر مكعب سنوياً). في محافظة إربد، انخفضت حصة الفرد إلى 77.6 م³ سنوياً، وفي جرش إلى 84.3 م³، مما يضع هذه المحافظات تحت ضغط ديموغرافي ومائي هائل، فاقمه اللجوء السوري والتغير المناخي الذي أدى لتراجع الهطول المطري بنسبة تتجاوز 20% عن المعدل العام طويل الأمد.
            
            هذا العجز دفع الدولة والمواطن نحو حلول مكلفة وغير مستدامة. الاعتماد على المياه الجوفية تجاوز الحدود الآمنة للسحب (Safe Yield) بأضعاف في أحواض رئيسية كالأزرق واليرموك، مما ينذر بملوحة المياه ونضوب الطبقات الجوفية الاستراتيجية.`
        },
        {
            title: "2. اقتصاد الصهاريج: الخصخصة القسرية للمياه",
            content: `يكشف تحليل مصادر مياه الشرب عن تحول خطير في نمط التزود بالمياه، حيث باتت "الصهاريج" المصدر الرئيسي للمياه في محافظات حيوية، متجاوزة الشبكة العامة. في جرش، يعتمد 73.8% من الأسر على الصهاريج، وفي مأدبا 71.8%، وفي الكرك 71.3%. هذا الاعتماد المرتفع يشير إلى فشل في كفاءة الشبكة العامة وعدم انتظام أدوار المياه.
            
            هذا التحول خلق ما يمكن تسميته "اقتصاد الصهاريج"، حيث تتحمل الأسر كلفة إضافية باهظة للحصول على المياه (سعر المتر المكعب من الصهريج قد يصل لـ 5 أضعاف سعره من الشبكة)، مما يفاقم الفجوة الاجتماعية ويستنزف دخل الأسر، خاصة في المحافظات ذات الدخل المحدود.`
        },
        {
            title: "3. تحدي الصرف الصحي والبعد البيئي",
            content: `تظهر البيانات تبايناً صارخاً في خدمات الصرف الصحي يعكس غياب العدالة في توزيع مشاريع البنية التحتية. بينما تتمتع العقبة بنسبة تغطية شبكة عامة تصل إلى 87.4% والزرقاء 82.8%، تعاني محافظات ذات طبيعة جيولوجية حساسة من غياب شبه كامل للشبكة. في الكرك، تعتمد 83.6% من الأسر على الحفر الامتصاصية، وفي المفرق 85.0%.
            
            هذا الاعتماد الهائل على الحفر الامتصاصية يشكل "قنبلة بيئية موقوتة"، خاصة في المناطق التي تعتمد على المياه الجوفية للشرب والزراعة، حيث يرتفع خطر تلوث الأحواض الجوفية بالنترات والملوثات البيولوجية، مما يهدد الأمن الصحي والغذائي على المدى الطويل.`
        }
    ];

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "تقرير الواقع المائي الاستراتيجي 2024";
            
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
                new Paragraph({ text: "تحليل معمق للفجوة المائية، اقتصاديات التزود، والبنية التحتية للصرف الصحي.", style: "Normal" }),
                
                ...reportContent.flatMap(section => [
                    new Paragraph({ text: section.title, style: "h2" }),
                    new Paragraph({ text: section.content, style: "Normal" })
                ]),

                new Paragraph({ text: "4. التوصيات الاستراتيجية لصناع القرار", style: "h2" }),
                new Paragraph({ text: "أولاً: تسريع تنفيذ مشروع الناقل الوطني كأولوية قصوى لضمان أمن التزود المائي للمراكز السكانية الكبرى (عمان، إربد، الزرقاء).", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثانياً: إطلاق برنامج وطني لشبكات الصرف الصحي اللامركزية في المناطق الريفية والطرفية (خاصة الكرك والمفرق) لحماية المياه الجوفية.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثالثاً: مراجعة تعرفة المياه تصاعدياً لقطاعات الاستخدام الترفيهي والتجاري لتمويل صيانة الشبكات وتقليل الفاقد (NRW) الذي يتجاوز 45% في بعض المناطق.", style: "Normal", bullet: { level: 0 } }),
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
                        font-size: 16pt;
                        line-height: 1.6;
                    }
                    .no-print, .recharts-wrapper, button, select, svg, .icon-container, .kpi-card-visual { display: none !important; }
                    
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
                        <h1>التقرير الاستراتيجي: قطاع المياه والصرف الصحي</h1>
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
                    <h1 className="text-3xl font-bold text-gray-900">تحليلات قطاع المياه والصرف الصحي</h1>
                    <p className="text-lg text-gray-700 mt-1">تحليل استراتيجي للواقع المائي وتحديات البنية التحتية (2024)</p>
                </header>

                {reportContent.map((section, idx) => (
                    <Card key={idx} className="card-container">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                        <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                            {section.content}
                        </div>
                    </Card>
                ))}

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">4. الخلاصة والتوصيات العاجلة</h2>
                    <div className="space-y-4 text-gray-800 text-lg">
                        <p><strong>إدارة الأزمة:</strong> الوضع المائي في الأردن لا يحتمل التأجيل. الاعتماد على الحلول المؤقتة (الصهاريج) يرهق المواطن والدولة. يجب التحول الفوري نحو إدارة الطلب بصرامة، ورفع كفاءة الشبكات لتقليل الفاقد الذي يصل لمستويات حرجة.</p>
                        <p><strong>الاستدامة البيئية:</strong> التوسع في شبكات الصرف الصحي في المناطق الريفية ليس ترفاً بل ضرورة لحماية ما تبقى من مياه جوفية صالحة للشرب.</p>
                        <p><strong>الناقل الوطني:</strong> تسريع تنفيذ مشروع الناقل الوطني كأولوية قصوى لضمان أمن التزود المائي للمراكز السكانية الكبرى (عمان، إربد، الزرقاء).</p>
                    </div>
                </Card>

                <Card className="no-print">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">حصّة الفرد من المياه (م³/سنوياً)</h3>
                        <select
                            value={selectedGov}
                            onChange={(e) => setSelectedGov(e.target.value)}
                            className="bg-gray-100 border border-gray-300 rounded-md p-2 text-sm"
                        >
                            {governorateData.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                        </select>
                    </div>
                    {selectedGovTrendData && <WaterTrendChart data={selectedGovTrendData} />}
                </Card>

                <Card className="no-print">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">مصدر مياه الشرب الرئيسي للأسر (%)</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={WATER_SOURCES_DATA.filter(d => d.name !== 'Kingdom')} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                                <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: '#333333' }} />
                                <YAxis type="category" dataKey="name_ar" width={80} tick={{ fontSize: 12, fill: '#333333' }} />
                                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }} />
                                <Legend />
                                <Bar dataKey="public_network" name="شبكة عامة" stackId="a" fill="#3b82f6" />
                                <Bar dataKey="tanker" name="صهريج" stackId="a" fill="#f97316" />
                                <Bar dataKey="mineral_water" name="مياه معدنية" stackId="a" fill="#84cc16" />
                                <Bar dataKey="rainwater" name="آبار تجميع" stackId="a" fill="#06b6d4" />
                                <Bar dataKey="other" name="أخرى" stackId="a" fill="#a8a29e" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Water;
