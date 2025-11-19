
import React, { useState } from 'react';
import Card from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { GOVERNORATE_COLORS } from '../constants/colors';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

// Data extracted from "التقرير الإحصائي للعام الدراسي 2024-2023"

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

const STUDENT_TEACHER_RATIO_MOE = [
    { name_ar: 'الزرقاء', value: 20.49, name: 'Zarqa' },
    { name_ar: 'عمان', value: 19.07, name: 'Amman' },
    { name_ar: 'إربد', value: 16.79, name: 'Irbid' },
    { name_ar: 'البلقاء', value: 15.60, name: 'Balqa' },
    { name_ar: 'جرش', value: 14.38, name: 'Jarash' },
    { name_ar: 'المفرق', value: 14.34, name: 'Mafraq' },
    { name_ar: 'مأدبا', value: 13.84, name: 'Madaba' },
    { name_ar: 'عجلون', value: 13.69, name: 'Ajloun' },
    { name_ar: 'الكرك', value: 11.42, name: 'Karak' },
    { name_ar: 'الطفيلة', value: 10.60, name: 'Tafilah' },
    { name_ar: 'معان', value: 15.07, name: 'Maan' },
    { name_ar: 'العقبة', value: 16.37, name: 'Aqaba' }
];

const TEACHER_QUALIFICATIONS = [
    { name_ar: 'جرش', value: 9.7, name: 'Jarash' },
    { name_ar: 'إربد', value: 8.7, name: 'Irbid' },
    { name_ar: 'مأدبا', value: 8.6, name: 'Madaba' },
    { name_ar: 'عجلون', value: 8.1, name: 'Ajloun' },
    { name_ar: 'الكرك', value: 8.0, name: 'Karak' },
    { name_ar: 'الزرقاء', value: 7.2, name: 'Zarqa' },
    { name_ar: 'البلقاء', value: 7.2, name: 'Balqa' },
    { name_ar: 'عمان', value: 6.8, name: 'Amman' },
    { name_ar: 'المفرق', value: 5.8, name: 'Mafraq' },
    { name_ar: 'معان', value: 4.8, name: 'Maan' },
    { name_ar: 'الطفيلة', value: 2.9, name: 'Tafilah' },
    { name_ar: 'العقبة', value: 2.6, name: 'Aqaba' }
];

const RENTED_SCHOOLS_MOE = [
    { name_ar: 'الطفيلة', value: 37.6, name: 'Tafilah' },
    { name_ar: 'عجلون', value: 34.0, name: 'Ajloun' },
    { name_ar: 'الكرك', value: 33.9, name: 'Karak' },
    { name_ar: 'العقبة', value: 32.8, name: 'Aqaba' },
    { name_ar: 'جرش', value: 30.2, name: 'Jarash' },
    { name_ar: 'المفرق', value: 29.5, name: 'Mafraq' },
    { name_ar: 'الزرقاء', value: 27.7, name: 'Zarqa' },
    { name_ar: 'البلقاء', value: 27.6, name: 'Balqa' },
    { name_ar: 'مأدبا', value: 27.0, name: 'Madaba' },
    { name_ar: 'إربد', value: 19.0, name: 'Irbid' },
    { name_ar: 'عمان', value: 17.8, name: 'Amman' },
    { name_ar: 'معان', value: 11.2, name: 'Maan' }
];

const KpiCard: React.FC<{ title: string; value: string; icon: string; }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl text-center shadow-sm break-inside-avoid card-container">
        <div className="text-3xl mb-2 icon-container">{icon}</div>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title}</p>
    </div>
);

const Education: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "تقرير قطاع التعليم في الأردن 2024";
            
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
                new Paragraph({ text: "نظرة معمقة على البنية التحتية، كفاءة الموارد، وجودة الكوادر التعليمية.", style: "Normal" }),
                
                new Paragraph({ text: "1. المشهد التعليمي الوطني", style: "h2" }),
                new Paragraph({ text: `إجمالي الطلبة: ${NATIONAL_KPI_DATA.totalStudents}`, style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: `إجمالي المدارس: ${NATIONAL_KPI_DATA.totalSchools}`, style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: `إجمالي المعلمين: ${NATIONAL_KPI_DATA.totalTeachers}`, style: "Normal", bullet: { level: 0 } }),

                new Paragraph({ text: "2. تحليل البنية التحتية وتوزيع الطلبة", style: "h2" }),
                new Paragraph({ text: "تستوعب محافظة العاصمة وحدها ما يقارب 37% من إجمالي طلبة المملكة. هذا التركز السكاني يضع تحديات كبيرة أمام توفير بنية تحتية تعليمية كافية.", style: "Normal" }),
                new Paragraph({ text: "تعاني محافظات مثل الزرقاء وجرش من نسب مرتفعة للمدارس المستأجرة، مما يؤثر على استقرار البيئة التعليمية.", style: "Normal" }),

                new Paragraph({ text: "3. كفاءة النظام التعليمي وجودة الكوادر", style: "h2" }),
                new Paragraph({ text: "تظهر محافظات الجنوب أفضل أداء في نسبة الطلبة للمعلمين، بينما تواجه الزرقاء والعاصمة تحدي الاكتظاظ.", style: "Normal" }),
                new Paragraph({ text: "تتميز محافظات الشمال بنسب مرتفعة من المعلمين حملة الشهادات العليا.", style: "Normal" }),

                new Paragraph({ text: "4. تحديات استراتيجية وتوصيات", style: "h2" }),
                new Paragraph({ text: "الاكتظاظ الطلابي في المحافظات الكبرى.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "البنية التحتية غير المستدامة (المدارس المستأجرة).", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "التفاوت في جودة الكوادر بين المحافظات.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "توصية: خطة وطنية للتخلص من المدارس المستأجرة.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "توصية: إعادة توزيع الكوادر التعليمية وتقديم حوافز للمناطق النائية.", style: "Normal", bullet: { level: 0 } }),
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
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                    
                    body {
                        font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        direction: rtl;
                        padding: 40px;
                        background-color: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-size: 14pt;
                    }

                    * {
                        box-shadow: none !important;
                        text-shadow: none !important;
                        background-color: transparent !important;
                        border-radius: 0 !important;
                        border: none !important;
                    }
                    
                    .no-print {
                        display: none !important;
                    }

                    .grid, .flex {
                        display: block !important;
                    }
                    
                    .grid-cols-1, .grid-cols-2, .grid-cols-4, .sm\\:grid-cols-4 {
                        display: block !important;
                        width: 100% !important;
                    }

                    .card-container {
                         padding: 10px 0 !important;
                         border-bottom: 1px solid #eee !important;
                         margin-bottom: 15px !important;
                         page-break-inside: avoid !important;
                    }
                    
                    h1 {
                        font-size: 24pt !important;
                        font-weight: bold !important;
                        text-align: center !important;
                        border-bottom: 2px solid #000 !important;
                        padding-bottom: 15px !important;
                        margin-bottom: 30px !important;
                        color: #000 !important;
                    }

                    h2 {
                        font-size: 20pt !important;
                        font-weight: bold !important;
                        color: #000 !important; 
                        border-bottom: 1px solid #ccc !important;
                        padding-bottom: 8px !important;
                        margin-top: 30px !important;
                        margin-bottom: 15px !important;
                        break-after: avoid !important;
                    }

                    h3 {
                        font-size: 16pt !important;
                        font-weight: bold !important;
                        color: #333 !important;
                        margin-top: 20px !important;
                        break-after: avoid !important;
                    }

                    p, li {
                        font-size: 14pt !important;
                        line-height: 1.6 !important;
                        text-align: justify !important;
                        margin-bottom: 10px !important;
                        color: #000 !important;
                        page-break-inside: avoid !important;
                    }

                    .icon-container {
                        font-size: 16pt !important;
                        margin: 0 !important;
                        display: inline-block !important;
                    }
                    
                    .recharts-wrapper {
                        width: 100% !important;
                        height: 350px !important;
                        display: block !important;
                        margin: 20px auto !important;
                        overflow: visible !important;
                    }
                    
                    .recharts-surface {
                        width: 100% !important;
                        height: 100% !important;
                        overflow: visible !important;
                    }
                    
                    div[style*="width: 100%"] {
                        width: 100% !important;
                    }

                    .report-header {
                        text-align: center;
                        border-bottom: 2px solid #333;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                    }
                    
                    .report-footer {
                        margin-top: 50px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        border-top: 1px solid #eee;
                        padding-top: 10px;
                    }
                    
                    @page {
                        size: A4;
                        margin: 15mm 20mm;
                    }
                </style>
            </head>
        `;

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <div class="report-header">
                        <h1>تقرير تحليلي استراتيجي لقطاع التعليم في الأردن 2024</h1>
                    </div>
                    <div class="content">
                        ${reportElement.innerHTML}
                    </div>
                    <div class="report-footer">
                        تم توليد هذا التقرير آلياً بواسطة منظومة التحليل التنموي - وزارة الداخلية.
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                </button>
                <button onClick={handleNativePrint} className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    طباعة / حفظ PDF (وثيقة نظيفة)
                </button>
            </div>

            <div id="report-content" className="space-y-8">
                <header className="text-center border-b border-gray-200 dark:border-gray-700 pb-8 no-print">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">تقرير تحليلي استراتيجي لقطاع التعليم في الأردن</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                        نظرة معمقة على البنية التحتية، كفاءة الموارد، وجودة الكوادر التعليمية استناداً إلى بيانات 2023-2024.
                    </p>
                </header>
                
                <div className="report-section">
                    <p className="text-lg text-gray-700 mb-6">
                        يقدم هذا التقرير تحليلاً شاملاً لواقع البنية التحتية التعليمية، كفاءة الموارد، وجودة الكوادر في المملكة، استناداً إلى بيانات التقرير الإحصائي للعام الدراسي 2023-2024 الصادر عن وزارة التربية والتعليم. يهدف التقرير إلى تسليط الضوء على الفجوات والتحديات الرئيسية، وتقديم توصيات استراتيجية لدعم صناع القرار.
                    </p>
                </div>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. المشهد التعليمي الوطني: مؤشرات رئيسية</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <KpiCard title="إجمالي الطلبة" value={NATIONAL_KPI_DATA.totalStudents} icon="👥" />
                        <KpiCard title="إجمالي المدارس" value={NATIONAL_KPI_DATA.totalSchools} icon="🏫" />
                        <KpiCard title="إجمالي المعلمين" value={NATIONAL_KPI_DATA.totalTeachers} icon="🧑‍🏫" />
                        <KpiCard title="موازنة الوزارة (2023)" value={NATIONAL_KPI_DATA.moeBudget} icon="💰" />
                    </div>
                </Card>
                
                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. تحليل البنية التحتية وتوزيع الطلبة</h2>
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-center">توزيع الطلبة حسب المحافظة (2024)</h3>
                            <p className="text-base text-gray-500 dark:text-gray-400 mb-4 text-center max-w-2xl mx-auto">تستوعب محافظة العاصمة وحدها ما يقارب 37% من إجمالي طلبة المملكة، تليها إربد (18.3%) ثم الزرقاء (13.5%). هذا التركز السكاني يضع تحديات كبيرة أمام توفير بنية تحتية تعليمية كافية في هذه المحافظات.</p>
                            <div style={{ height: 400 }} className="no-print">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[...STUDENTS_BY_GOVERNORATE].sort((a,b) => b.value - a.value)} layout="vertical" margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.2)" />
                                        <XAxis type="number" tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                        <YAxis type="category" dataKey="name_ar" width={80} tick={{ fontSize: 13, fill: '#cbd5e1' }} />
                                        <Tooltip formatter={(value: number) => [value.toLocaleString(), "عدد الطلبة"]} contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: '#334155' }} />
                                        <Bar dataKey="value" name="عدد الطلبة" radius={[0, 4, 4, 0]}>
                                            <LabelList dataKey="value" position="right" formatter={(value: number) => value.toLocaleString()} style={{ fill: '#e2e8f0', fontSize: '12px' }}  />
                                            {STUDENTS_BY_GOVERNORATE.map(entry => <Cell key={entry.name} fill={GOVERNORATE_COLORS[entry.name]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-center">نسبة المدارس المستأجرة (وزارة التربية والتعليم)</h3>
                            <p className="text-base text-gray-500 dark:text-gray-400 mb-4 text-center max-w-2xl mx-auto">تعتبر نسبة المباني المدرسية المستأجرة مؤشراً على استدامة البنية التحتية. تظهر محافظات مثل الزرقاء وجرش نسباً مرتفعة، مما يؤثر على استقرار البيئة التعليمية، بينما تتمتع معان بأقل نسبة، مما يعكس بنية تحتية أكثر استدامة.</p>
                            <div style={{ height: 400 }} className="no-print">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[...RENTED_SCHOOLS_MOE].sort((a,b) => b.value - a.value)} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.2)" />
                                        <XAxis type="number" unit="%" domain={[0, 50]} tick={{ fontSize: 12, fill: '#94a3b8' }}/>
                                        <YAxis type="category" dataKey="name_ar" width={80} tick={{ fontSize: 13, fill: '#cbd5e1' }} />
                                        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "النسبة"]} contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: '#334155' }} />
                                        <Bar dataKey="value" name="النسبة المئوية" fill="#f97316" radius={[0, 4, 4, 0]}>
                                            <LabelList dataKey="value" position="right" formatter={(value: number) => `${value.toFixed(1)}%`} style={{ fill: '#e2e8f0', fontSize: '12px' }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. كفاءة النظام التعليمي وجودة الكوادر</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-center">نسبة الطلبة لكل معلم (مدارس وزارة التربية)</h3>
                            <p className="text-base text-gray-500 dark:text-gray-400 mb-4 text-center">يعكس هذا المؤشر كثافة الطلبة بالنسبة للكادر التعليمي. المعدلات المنخفضة تشير إلى جودة أفضل. تظهر محافظات الجنوب أفضل أداء، بينما تواجه الزرقاء والعاصمة تحدي الاكتظاظ.</p>
                            <div style={{ height: 350 }} className="no-print">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[...STUDENT_TEACHER_RATIO_MOE].sort((a,b) => b.value - a.value)} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.2)" />
                                        <XAxis dataKey="name_ar" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                        <YAxis domain={[8, 'dataMax + 2']} tick={{ fontSize: 12, fill: '#cbd5e1' }}/>
                                        <Tooltip formatter={(value: number) => [value.toFixed(1), "طالب/معلم"]} contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: '#334155' }} />
                                        <Bar dataKey="value" name="النسبة" fill="#a855f7" radius={[4, 4, 0, 0]}>
                                            <LabelList dataKey="value" position="top" style={{ fill: '#e2e8f0', fontSize: '12px' }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-center">نسبة المعلمين حملة الشهادات العليا (%)</h3>
                            <p className="text-base text-gray-500 dark:text-gray-400 mb-4 text-center">يعكس هذا المؤشر مستوى تأهيل الكادر التعليمي. تتميز محافظات الشمال بنسب مرتفعة، مما يمثل نقطة قوة، بينما تحتاج المحافظات الجنوبية إلى خطط لرفع كفاءة كوادرها.</p>
                            <div style={{ height: 350 }} className="no-print">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[...TEACHER_QUALIFICATIONS].sort((a,b) => b.value - a.value)} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.2)" />
                                        <XAxis dataKey="name_ar" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                        <YAxis unit="%" domain={[0, 'dataMax + 2']} tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                                        <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "النسبة"]} contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: '#334155' }} />
                                        <Bar dataKey="value" name="النسبة" fill="#22c55e" radius={[4, 4, 0, 0]}>
                                            <LabelList dataKey="value" position="top" formatter={(value: number) => `${value.toFixed(1)}%`} style={{ fill: '#e2e8f0', fontSize: '12px' }}/>
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. تحديات استراتيجية وتوصيات</h2>
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-4 text-lg">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white pt-2">أبرز التحديات:</h3>
                        <ul className="list-disc list-outside mr-6 space-y-2">
                            <li><strong>الاكتظاظ الطلابي:</strong> الضغط الكبير على الموارد التعليمية في المحافظات ذات الكثافة السكانية العالية (العاصمة، الزرقاء، إربد) يؤدي إلى ارتفاع نسبة الطلبة للمعلمين والصفوف.</li>
                            <li><strong>البنية التحتية غير المستدامة:</strong> الاعتماد الكبير على المباني المدرسية المستأجرة في العديد من المحافظات يشكل عبئاً مالياً ويحد من القدرة على تطوير البيئة المدرسية.</li>
                            <li><strong>التفاوت في جودة الكوادر:</strong> تباين واضح في نسبة المعلمين من حملة الشهادات العليا بين المحافظات، مما يخلق فجوة في جودة المخرجات التعليمية المحتملة.</li>
                            <li><strong>ضعف جاذبية التعليم المهني:</strong> على الرغم من أهميته لسوق العمل، لا يزال الإقبال على التعليم المهني، خاصة بين الإناث، دون المستوى المأمول.</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white pt-4">توصيات استراتيجية:</h3>
                        <ul className="list-disc list-outside mr-6 space-y-2">
                            <li><strong>خطة وطنية للمباني المدرسية:</strong> إطلاق برنامج طويل الأمد للتخلص التدريجي من المدارس المستأجرة، مع إعطاء الأولوية للمحافظات ذات النسب الأعلى مثل الزرقاء وجرش.</li>
                            <li><strong>إعادة توزيع الكوادر التعليمية:</strong> وضع حوافز مادية ومعنوية للمعلمين (خاصة حملة الشهادات العليا) للعمل في المحافظات التي تعاني من نقص، مثل العقبة والطفيلة.</li>
                            <li><strong>تطوير التعليم المهني:</strong> إطلاق حملة وطنية لتغيير الصورة النمطية عن التعليم المهني، وتحديث المسارات لتواكب متطلبات سوق العمل المستقبلية (مثل التكنولوجيا الخضراء والذكاء الاصطناعي)، وتقديم برامج موجهة لزيادة التحاق الإناث.</li>
                            <li><strong>استخدام البيانات في التخطيط:</strong> تبني نهج قائم على البيانات في توزيع الموارد، بحيث يتم تخصيص الميزانيات والمشاريع بناءً على مؤشرات الأداء والفجوات التنموية لكل مديرية ومحافظة.</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Education;
