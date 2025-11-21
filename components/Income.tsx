
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

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير الاستراتيجي: دخل ونفقات الأسرة 2024";
            
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
                
                new Paragraph({ text: "1. المشهد الاقتصادي للأسر: تباينات حادة", style: "h2" }),
                new Paragraph({ text: `يكشف تحليل دخل الأسر عن فجوة تنموية عميقة بين المركز والأطراف. يبلغ متوسط دخل الأسرة السنوي في المملكة ${summaryData.kingdom?.average_total_income.toLocaleString()} دينار، لكن هذا الرقم يخفي تباينات كبيرة. فبينما يسجل سكان الحضر متوسطاً يبلغ ${summaryData.urban?.average_total_income.toLocaleString()} دينار، ينخفض الرقم في الريف إلى ${summaryData.rural?.average_total_income.toLocaleString()} دينار، مما يعكس تركز الفرص الاقتصادية في المدن الكبرى وتهميش المناطق الريفية.`, style: "Normal" }),

                new Paragraph({ text: "2. جغرافيا الدخل: من يقود ومن يتأخر؟", style: "h2" }),
                new Paragraph({ text: "تتصدر العاصمة عمان القائمة بمتوسط دخل سنوي يبلغ 2,788 دينار، مدفوعة بتنوع الأنشطة الاقتصادية والوظائف ذات الأجور المرتفعة. تليها الكرك (2,321 دينار) والبلقاء (2,309 دينار). في المقابل، تقبع محافظات المفرق (1,676 دينار) وجرش (1,740 دينار) ومعان (1,829 دينار) في ذيل القائمة. هذا التفاوت يعني أن القدرة الشرائية ومستوى المعيشة لأسرة في عمان يقارب ضعف نظيرتها في المفرق، مما يفسر موجات الهجرة الداخلية نحو العاصمة.", style: "Normal" }),

                new Paragraph({ text: "3. مصادر الدخل: الاعتماد على الرواتب", style: "h2" }),
                new Paragraph({ text: "يُظهر تحليل مصادر الدخل اعتماداً مفرطاً على 'الاستخدام' (الرواتب والأجور)، حيث يشكل المصدر الرئيسي للدخل في كافة المحافظات. في العقبة، يصل الدخل من الاستخدام إلى 1,165 دينار، وهو الأعلى، مما يعكس طبيعة الوظائف في المنطقة الاقتصادية الخاصة والموانئ. أما الدخل من 'التحويلات' (تقاعد، مساعدات، تحويلات مغتربين) فيلعب دوراً حاسماً في محافظات مثل الكرك (963 دينار) وعجلون (928 دينار)، مما يشير إلى اعتماد اقتصاد هذه المحافظات على شبكات الأمان الاجتماعي والوظائف الحكومية السابقة.", style: "Normal" }),

                new Paragraph({ text: "4. مؤشر الإنفاق مقابل الدخل: علامات حمراء", style: "h2" }),
                new Paragraph({ text: "تشير البيانات التاريخية وتحليلات الأنماط الاستهلاكية إلى ظاهرة مقلقة في محافظات مثل الزرقاء، المفرق، ومعان، حيث يتجاوز متوسط الإنفاق الأسري مستوى الدخل الجاري. هذه الفجوة يتم تغطيتها غالباً عبر الاستدانة أو استنزاف المدخرات أو الاعتماد على مساعدات غير منتظمة، مما يضع هذه الأسر في دائرة الهشاشة المالية ويهدد الطبقة الوسطى بالتآكل.", style: "Normal" }),

                new Paragraph({ text: "5. التوصيات الاستراتيجية", style: "h2" }),
                new Paragraph({ text: "أولاً: توجيه استثمارات كثيفة العمالة نحو المفرق وجرش ومعان لتقليل الاعتماد على الوظائف الحكومية وزيادة الدخل من العمل الخاص.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثانياً: تعزيز برامج التمويل الأصغر في المناطق الريفية لدعم المشاريع المدرة للدخل وتقليص الفجوة بين الريف والحضر.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثالثاً: ربط الحد الأدنى للأجور بتكاليف المعيشة المحلية لكل محافظة لتضييق فجوة التفاوت في الدخل الحقيقي.", style: "Normal", bullet: { level: 0 } }),
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
                        <h1>التقرير الاستراتيجي: دخل الأسرة والإنفاق في الأردن</h1>
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
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">التقرير الاستراتيجي: دخل الأسرة والإنفاق</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                        تحليل معمق لمتوسط دخل الأفراد، مصادره، والفجوات التنموية بين المحافظات.
                    </p>
                </header>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. المشهد الاقتصادي للأسر: تباينات حادة</h2>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        <p className="mb-4">
                            يكشف تحليل دخل الأسر عن فجوة تنموية عميقة بين المركز والأطراف. يبلغ متوسط دخل الأسرة السنوي في المملكة <strong>{summaryData.kingdom?.average_total_income.toLocaleString()}</strong> دينار، لكن هذا الرقم يخفي تباينات كبيرة. فبينما يسجل سكان الحضر متوسطاً يبلغ <strong>{summaryData.urban?.average_total_income.toLocaleString()}</strong> دينار، ينخفض الرقم في الريف إلى <strong>{summaryData.rural?.average_total_income.toLocaleString()}</strong> دينار، مما يعكس تركز الفرص الاقتصادية في المدن الكبرى وتهميش المناطق الريفية.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 kpi-card-visual">
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
                </Card>
                
                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. جغرافيا الدخل: من يقود ومن يتأخر؟</h2>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        <p>
                            تتصدر <strong>العاصمة عمان</strong> القائمة بمتوسط دخل سنوي يبلغ 2,788 دينار، مدفوعة بتنوع الأنشطة الاقتصادية والوظائف ذات الأجور المرتفعة. تليها <strong>الكرك</strong> (2,321 دينار) و<strong>البلقاء</strong> (2,309 دينار). في المقابل، تقبع محافظات <strong>المفرق</strong> (1,676 دينار) و<strong>جرش</strong> (1,740 دينار) و<strong>معان</strong> (1,829 دينار) في ذيل القائمة. هذا التفاوت يعني أن القدرة الشرائية ومستوى المعيشة لأسرة في عمان يقارب ضعف نظيرتها في المفرق، مما يفسر موجات الهجرة الداخلية نحو العاصمة.
                        </p>
                    </div>
                    <div style={{ width: '100%', height: 350 }} className="no-print">
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
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. مصادر الدخل: هيمنة الرواتب ودور التحويلات</h2>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        <p>
                            يُظهر تحليل مصادر الدخل اعتماداً مفرطاً على "الاستخدام" (الرواتب والأجور)، حيث يشكل المصدر الرئيسي للدخل في كافة المحافظات. في <strong>العقبة</strong>، يصل الدخل من الاستخدام إلى 1,165 دينار، وهو الأعلى، مما يعكس طبيعة الوظائف في المنطقة الاقتصادية الخاصة والموانئ. أما الدخل من "التحويلات" (تقاعد، مساعدات، تحويلات مغتربين) فيلعب دوراً حاسماً في محافظات مثل <strong>الكرك</strong> (963 دينار) و<strong>عجلون</strong> (928 دينار)، مما يشير إلى اعتماد اقتصاد هذه المحافظات على شبكات الأمان الاجتماعي والوظائف الحكومية السابقة.
                        </p>
                    </div>
                    <div className="no-print">
                        <IncomeSourceBreakdownChart data={governorateIncomeData} />
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. مؤشرات الإنفاق مقابل الدخل</h2>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        <p>
                            تشير البيانات التاريخية وتحليلات الأنماط الاستهلاكية إلى ظاهرة مقلقة في محافظات مثل <strong>الزرقاء، المفرق، ومعان</strong>، حيث يتجاوز متوسط الإنفاق الأسري مستوى الدخل الجاري. هذه الفجوة يتم تغطيتها غالباً عبر الاستدانة أو استنزاف المدخرات أو الاعتماد على مساعدات غير منتظمة، مما يضع هذه الأسر في دائرة الهشاشة المالية ويهدد الطبقة الوسطى بالتآكل.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Income;
