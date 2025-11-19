
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

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "تقرير قطاع المياه والصرف الصحي 2024";
            
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
                new Paragraph({ text: "نظرة على مصادر المياه، تحديات النقص، والبنية التحتية للصرف الصحي في الأردن.", style: "Normal" }),
                
                new Paragraph({ text: "1. الأمن المائي", style: "h2" }),
                new Paragraph({ text: "يُصنف الأردن كواحد من أفقر دول العالم مائياً.", style: "Normal" }),
                new Paragraph({ text: "تظهر البيانات اعتماداً كبيراً على الصهاريج كمصدر مياه رئيسي للأسر.", style: "Normal" }),

                new Paragraph({ text: "2. التحديات الرئيسية", style: "h2" }),
                new Paragraph({ text: "انخفاض إجمالي الموارد المائية بنسبة 15.4% بين عامي 2020 و 2024.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "الاعتماد المفرط على المياه الجوفية غير المتجددة.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "تفاوت كبير في حصة الفرد بين المحافظات، مع ضغط شديد في إربد وجرش.", style: "Normal", bullet: { level: 0 } }),

                new Paragraph({ text: "3. التوصيات الاستراتيجية", style: "h2" }),
                new Paragraph({ text: "تسريع مشاريع التحلية الكبرى (الناقل الوطني).", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "تقنين الاستخدام الزراعي الجائر للمياه الجوفية.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "التوسع في معالجة مياه الصرف الصحي للاستخدام الزراعي.", style: "Normal", bullet: { level: 0 } }),
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
                    .no-print, .recharts-wrapper, button, select { display: none !important; }
                    
                    .card-container {
                        padding: 0 !important;
                        margin: 0 0 20px 0 !important;
                        border-bottom: 1px solid #eee !important;
                    }
                    
                    h1 { font-size: 26pt !important; text-align: center; border-bottom: 2px solid black; margin-bottom: 20px; }
                    h2 { font-size: 20pt !important; border-bottom: 1px solid #ccc; margin-top: 30px; break-after: avoid; }
                    h3 { font-size: 18pt !important; color: #333; margin-top: 20px; break-after: avoid; }
                    p, li { font-size: 14pt !important; line-height: 1.6; text-align: justify; }
                    
                    @page { size: A4; margin: 20mm; }
                </style>
            </head>
        `;

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <div class="report-header">
                        <h1>تقرير تحليلي: قطاع المياه والصرف الصحي</h1>
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
                    <h1 className="text-3xl font-bold text-gray-900">تحليلات قطاع المياه والصرف الصحي</h1>
                    <p className="text-lg text-gray-700 mt-1">نظرة على مصادر المياه، تحديات النقص، والبنية التحتية للصرف الصحي في الأردن.</p>
                </header>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">الأمن المائي: التحدي الأكبر</h2>
                    <p className="text-gray-700 leading-relaxed">
                        يُصنف الأردن كواحد من أفقر دول العالم مائياً، مما يجعل إدارة الموارد المائية تحدياً استراتيجياً بالغ الأهمية. تظهر البيانات اعتماداً كبيراً على الصهاريج كمصدر مياه رئيسي للأسر، مما يعكس الضغط على الشبكة العامة. كما أن تغطية شبكة الصرف الصحي لا تزال دون المستوى المأمول في العديد من المحافظات، مما يزيد من الأعباء البيئية والصحية. لقد فاقمت أزمة اللجوء السوري من حدة هذا التحدي، بالإضافة إلى التأثيرات المتزايدة للتغير المناخي.
                    </p>
                </Card>

                <Card>
                    <div className="flex justify-between items-center mb-4 no-print">
                        <h3 className="text-lg font-semibold text-gray-800">حصّة الفرد من المياه (م³/سنوياً)</h3>
                        <select
                            value={selectedGov}
                            onChange={(e) => setSelectedGov(e.target.value)}
                            className="bg-gray-100 border border-gray-300 rounded-md p-2 text-sm"
                        >
                            {governorateData.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                        </select>
                    </div>
                    {selectedGovTrendData && <div className="no-print"><WaterTrendChart data={selectedGovTrendData} /></div>}
                    <p className="text-gray-700 mt-2">تظهر الرسوم البيانية (غير ظاهرة في الطباعة) تذبذب حصة الفرد من المياه، مما يعكس الضغط المتزايد على الموارد.</p>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">مصدر مياه الشرب الرئيسي للأسر (%)</h3>
                    <div style={{ width: '100%', height: 400 }} className="no-print">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">طريقة التعامل مع نقص المياه (%)</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={WATER_SHORTAGE_DATA.filter(d => d.name !== 'Kingdom')} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                                    <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: '#333333' }} />
                                    <YAxis type="category" dataKey="name_ar" width={80} tick={{ fontSize: 12, fill: '#333333' }} />
                                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }} />
                                    <Legend />
                                    <Bar dataKey="no_shortage" name="لا يوجد نقص" stackId="a" fill="#10b981" />
                                    <Bar dataKey="buy_tankers" name="شراء صهاريج" stackId="a" fill="#f59e0b" />
                                    <Bar dataKey="other" name="أخرى" stackId="a" fill="#64748b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">طريقة التخلص من المياه العادمة (%)</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={SANITATION_DATA.filter(d => d.name !== 'Kingdom')} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                                    <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: '#333333' }} />
                                    <YAxis type="category" dataKey="name_ar" width={80} tick={{ fontSize: 12, fill: '#333333' }} />
                                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }} />
                                    <Legend />
                                    <Bar dataKey="public_network" name="شبكة عامة" stackId="a" fill="#8b5cf6" />
                                    <Bar dataKey="cesspit" name="حفرة امتصاصية" stackId="a" fill="#db2777" />
                                    <Bar dataKey="no_sanitation" name="لا يوجد" stackId="a" fill="#78716c" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
                
                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">الخلاصة والتحديات</h2>
                    <ul className="list-disc list-outside mr-6 space-y-2 text-gray-700 text-lg">
                        <li><strong>تراجع حاد:</strong> انخفاض إجمالي الموارد المائية بنسبة 15.4% بين عامي 2020 و 2024.</li>
                        <li><strong>استنزاف الجوفي:</strong> الاعتماد المفرط على المياه الجوفية غير المتجددة.</li>
                        <li><strong>أزمة توزيع:</strong> تفاوت كبير في حصة الفرد بين المحافظات، مع ضغط شديد في إربد وجرش.</li>
                    </ul>
                    <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">التوصيات الاستراتيجية</h2>
                    <ul className="list-disc list-outside mr-6 space-y-2 text-gray-700 text-lg">
                        <li><strong>التحول نحو الاستدامة:</strong> تسريع مشاريع التحلية الكبرى (الناقل الوطني).</li>
                        <li><strong>إدارة الطلب:</strong> تقنين الاستخدام الزراعي الجائر للمياه الجوفية.</li>
                        <li><strong>المياه غير التقليدية:</strong> التوسع في معالجة مياه الصرف الصحي للاستخدام الزراعي والصناعي.</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default Water;
