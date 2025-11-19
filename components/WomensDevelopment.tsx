
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

const WomensDevelopment: React.FC = () => {
    const [selectedGov, setSelectedGov] = useState('Amman');
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const selectedGovData = ECONOMIC_EMPOWERMENT_DATA.find(g => g.name === selectedGov)?.data;

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "تقرير قطاع المرأة - 2024";
            
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
                new Paragraph({ text: "تحليلات تنمية وتمكين المرأة في الأردن.", style: "Normal" }),
                
                new Paragraph({ text: "1. التمكين الاقتصادي", style: "h2" }),
                new Paragraph({ text: `المعدل الوطني لمشاركة الإناث في القوى العاملة: ${NATIONAL_AVERAGES_2024.female_labor_force_participation.toFixed(1)}%`, style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: `الهدف المنشود لعام 2033: ${JORDAN_VISION_2033_TARGETS.female_labor_force_participation}%`, style: "Normal", bullet: { level: 0 } }),

                new Paragraph({ text: "2. المؤشرات الرئيسية", style: "h2" }),
                new Paragraph({ text: "تُظهر البيانات تبايناً كبيراً في التحديات عبر المحافظات، خاصة في معدلات البطالة والأمية.", style: "Normal" }),
                
                new Paragraph({ text: "3. التحديات والتوصيات", style: "h2" }),
                new Paragraph({ text: "بطالة مرتفعة في الزرقاء وجرش.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "فجوة تعليمية وارتفاع الأمية في المحافظات الجنوبية.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "توصية: برامج موجهة جغرافياً لمحو الأمية الرقمية.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "توصية: دعم رائدات الأعمال بحاضنات أعمال مخصصة.", style: "Normal", bullet: { level: 0 } }),
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
                        <h1>تقرير تحليلي: تنمية وتمكين المرأة في الأردن</h1>
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
                    <h1 className="text-3xl font-bold text-gray-900">تحليلات تنمية المرأة</h1>
                    <p className="text-lg text-gray-700 mt-1">استكشاف المؤشرات الرئيسية المتعلقة بتمكين المرأة في الأردن.</p>
                </header>
                
                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">نظرة على تمكين المرأة الاقتصادي</h2>
                    <p className="text-lg text-gray-700 mb-6">
                        يعد تمكين المرأة ركيزة أساسية في رؤية التحديث الاقتصادي. ومع ذلك، لا يزال المعدل الوطني لمشاركة الإناث في القوى العاملة عند {NATIONAL_AVERAGES_2024.female_labor_force_participation.toFixed(1)}%، وهو أقل بكثير من الهدف المنشود لعام 2033 والبالغ {JORDAN_VISION_2033_TARGETS.female_labor_force_participation}%.
                    </p>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="card-container flex flex-col justify-center items-center">
                        <h3 className="text-lg font-semibold text-gray-800">مشاركة الإناث في القوى العاملة (2024)</h3>
                        <p className="text-5xl font-bold text-violet-500 my-2">{NATIONAL_AVERAGES_2024.female_labor_force_participation.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">المعدل الوطني</p>
                    </Card>
                    <Card className="card-container">
                        <div className="flex justify-between items-center mb-4 no-print">
                            <h3 className="text-lg font-semibold text-gray-800">العاملون المؤمن عليهم (الضمان الاجتماعي)</h3>
                            <select
                                value={selectedGov}
                                onChange={(e) => setSelectedGov(e.target.value)}
                                className="bg-gray-100 border border-gray-300 rounded-md p-2 text-sm"
                            >
                                {ECONOMIC_EMPOWERMENT_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                            </select>
                        </div>
                        <div className="no-print">
                            {selectedGovData && <EconomicEmpowermentChart data={selectedGovData} />}
                        </div>
                        <p className="text-lg text-gray-700 mb-4">
                            يعكس الرسم البياني (غير ظاهر في الطباعة) تطور نسبة الإناث والذكور المؤمن عليهم في الضمان الاجتماعي، مما يشير إلى مستوى الوصول للعمل الرسمي.
                        </p>
                    </Card>
                </div>

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">المؤشرات الرئيسية للمرأة الأردنية (2024)</h2>
                    <p className="text-lg text-gray-700 mb-6">
                        تُظهر البيانات تبايناً كبيراً في التحديات التي تواجهها النساء عبر المحافظات، خاصة فيما يتعلق بالبطالة والأمية والمشاركة الاقتصادية.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12 no-print">
                        <div>
                            <p className="text-lg text-gray-700 mb-4">معدل البطالة (إناث)</p>
                            <GovernorateBarChart data={WOMEN_DEV_DATA_2024 as any} dataKey="unemployment_rate_f" unit="%" title="معدل البطالة" />
                        </div>
                        <div>
                            <p className="text-lg text-gray-700 mb-4">معدل الأمية (إناث)</p>
                            <GovernorateBarChart data={WOMEN_DEV_DATA_2024 as any} dataKey="illiteracy_rate_f" unit="%" title="معدل الأمية" />
                        </div>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">مقارنة توزيع المشتغلات (2024)</h2>
                    <p className="text-lg text-gray-700 mb-6">
                        الفجوة في توزيع العمالة بين إجمالي الإناث والنساء اللاتي يرأسن أسرهن تشير إلى تحديات إضافية تواجه ربات الأسر.
                    </p>
                    <div style={{ width: '100%', height: 400 }} className="no-print">
                        <ResponsiveContainer>
                            <BarChart data={EMPLOYED_WOMEN_DISTRIBUTION_DATA_2024} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name_ar" tick={{ fontSize: 12, fill: '#333333' }} />
                                <YAxis unit="%" tick={{ fontSize: 12, fill: '#333333' }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '14px' }} />
                                <Bar dataKey="employed_dist_f" name="إجمالي الإناث" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="employed_dist_fhh" name="أسر ترأسها نساء" fill="#f9a8d4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                
                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">التحليل الاستراتيجي والتوصيات</h2>
                    <div className="text-gray-800 leading-normal space-y-3 text-lg">
                        <h3 className="text-lg font-semibold text-gray-900 pt-2">نقاط سلبية تتطلب تدخلاً:</h3>
                        <ul className="list-disc list-outside mr-6 space-y-2">
                            <li><strong>بطالة مرتفعة:</strong> تعاني محافظات مثل الزرقاء وجرش من معدلات بطالة مقلقة بين النساء.</li>
                            <li><strong>فجوة تعليمية:</strong> ترتفع معدلات الأمية بشكل كبير في المحافظات الجنوبية (معان، الطفيلة) والمفرق.</li>
                            <li><strong>مشاركة اقتصادية منخفضة:</strong> تسجل محافظات حيوية مثل الزرقاء والعقبة معدلات منخفضة.</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-gray-900 pt-2">توصيات استراتيجية:</h3>
                        <ul className="list-disc list-outside mr-6 space-y-2">
                            <li><strong>برامج موجهة جغرافياً:</strong> تصميم برامج لمحو الأمية الرقمية والمالية في المحافظات ذات معدلات الأمية المرتفعة.</li>
                            <li><strong>دعم رائدات الأعمال:</strong> إطلاق حاضنات أعمال ومحافظ تمويلية مخصصة للنساء.</li>
                            <li><strong>سياسات داعمة لربات الأسر:</strong> توفير خدمات رعاية الأطفال بأسعار معقولة.</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default WomensDevelopment;
