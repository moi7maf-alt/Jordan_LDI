
import React, { useState } from 'react';
import Card from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
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
    <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl text-center shadow-sm break-inside-avoid card-container kpi-card-visual">
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
                
                new Paragraph({ text: "1. المشهد التعليمي الوطني: ضخامة الأرقام وتحديات الموارد", style: "h2" }),
                new Paragraph({ text: `يحتضن النظام التعليمي في الأردن أكثر من ${NATIONAL_KPI_DATA.totalStudents} طالب وطالبة، موزعين على ${NATIONAL_KPI_DATA.totalSchools} مدرسة. هذه الأرقام الضخمة تضع ضغطاً هائلاً على الموارد، حيث بلغ عدد المعلمين ${NATIONAL_KPI_DATA.totalTeachers}. ورغم أن موازنة الوزارة بلغت ${NATIONAL_KPI_DATA.moeBudget}، إلا أن الجزء الأكبر منها يذهب للنفقات الجارية (الرواتب)، مما يترك هامشاً ضيقاً للتطوير الرأسمالي وتحسين البنية التحتية.`, style: "Normal" }),

                new Paragraph({ text: "2. اختلالات التوزيع الديموغرافي والبنية التحتية", style: "h2" }),
                new Paragraph({ text: "تشير البيانات إلى تركز سكاني وطلابي كثيف في العاصمة عمان، التي تستوعب وحدها ما يقارب 37% من إجمالي طلبة المملكة (844,395 طالب)، تليها إربد (421,817 طالب) ثم الزرقاء (310,545 طالب). هذا التباين يخلق ضغطاً شديداً على البنية التحتية في المدن الكبرى، بينما تعاني مناطق الأطراف من تشتت المدارس وارتفاع كلفة الطالب.", style: "Normal" }),
                new Paragraph({ text: "أزمة المدارس المستأجرة لا تزال تشكل تحدياً جوهرياً لاستدامة البيئة التعليمية. تسجل محافظة الطفيلة أعلى نسبة للمدارس المستأجرة بواقع 37.6%، تليها عجلون (34.0%) والكرك (33.9%). هذه المباني غالباً ما تكون غير مصممة أصلاً كمدارس، وتفتقر للمرافق الأساسية كالساحات والمختبرات، مما يؤثر سلباً على جودة التعليم.", style: "Normal" }),

                new Paragraph({ text: "3. جودة التعليم: الكثافة الصفية وكفاءة المعلمين", style: "h2" }),
                new Paragraph({ text: "يُظهر مؤشر 'نسبة الطلبة لكل معلم' تبايناً واضحاً في الجودة. فبينما تعاني الزرقاء من اكتظاظ واضح بنسبة تصل إلى 20.5 طالب لكل معلم في المدارس الحكومية، وعمان بنسبة 19.1، تتمتع محافظات الجنوب بنسب مريحة جداً (الطفيلة 10.6، الكرك 11.4)، مما يتيح فرصة أكبر للتركيز الفردي على الطلبة. ومع ذلك، فإن انخفاض النسبة في الجنوب قد يعكس أيضاً تشتت السكان وصغر حجم المدارس.", style: "Normal" }),
                new Paragraph({ text: "من حيث المؤهلات، تتفوق محافظات الشمال، حيث تسجل جرش أعلى نسبة للمعلمين من حملة الشهادات العليا (9.7%)، تليها إربد (8.7%). في المقابل، تنخفض هذه النسبة بشكل ملحوظ في العقبة (2.6%) والطفيلة (2.9%)، مما يستدعي برامج ابتعاث وتحفيز لرفع كفاءة الكادر التعليمي في الجنوب.", style: "Normal" }),

                new Paragraph({ text: "4. التوصيات الاستراتيجية", style: "h2" }),
                new Paragraph({ text: "أولاً: إطلاق خطة وطنية عاجلة للتخلص من المدارس المستأجرة، مع إعطاء الأولوية للمحافظات ذات النسب الحرجة (الطفيلة، عجلون، الكرك) لضمان بيئة تعليمية آمنة.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثانياً: إعادة هندسة الموارد البشرية لمعالجة سوء التوزيع، عبر تقديم حوافز مادية مجزية للمعلمين المؤهلين للعمل في مناطق البادية والجنوب لردم فجوة المؤهلات العلمية.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثالثاً: تبني حلول المدارس المجمعة (Hub Schools) في المناطق النائية، مع توفير نظام نقل مدرسي فعال، بدلاً من الإبقاء على مدارس صغيرة ومستأجرة وغير فعالة.", style: "Normal", bullet: { level: 0 } }),
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
                        font-size: 16pt;
                        line-height: 1.6;
                    }
                    .no-print, .recharts-wrapper, button, svg, .icon-container, .kpi-card-visual { display: none !important; }
                    
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
                        <h1>التقرير الاستراتيجي: قطاع التعليم 2024</h1>
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
                        نظرة معمقة على البنية التحتية، كفاءة الموارد، وجودة الكوادر التعليمية استناداً إلى بيانات 2024.
                    </p>
                </header>
                
                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. المشهد التعليمي الوطني: ضخامة الأرقام وتحديات الموارد</h2>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        <p>
                            يحتضن النظام التعليمي في الأردن أكثر من <strong>{NATIONAL_KPI_DATA.totalStudents}</strong> طالب وطالبة، موزعين على <strong>{NATIONAL_KPI_DATA.totalSchools}</strong> مدرسة. هذه الأرقام الضخمة تضع ضغطاً هائلاً على الموارد، حيث بلغ عدد المعلمين <strong>{NATIONAL_KPI_DATA.totalTeachers}</strong>. ورغم أن موازنة الوزارة بلغت <strong>{NATIONAL_KPI_DATA.moeBudget}</strong>، إلا أن الجزء الأكبر منها يذهب للنفقات الجارية (الرواتب)، مما يترك هامشاً ضيقاً للتطوير الرأسمالي وتحسين البنية التحتية.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center kpi-card-visual">
                        <KpiCard title="إجمالي الطلبة" value={NATIONAL_KPI_DATA.totalStudents} icon="👥" />
                        <KpiCard title="إجمالي المدارس" value={NATIONAL_KPI_DATA.totalSchools} icon="🏫" />
                        <KpiCard title="إجمالي المعلمين" value={NATIONAL_KPI_DATA.totalTeachers} icon="🧑‍🏫" />
                        <KpiCard title="موازنة الوزارة (2023)" value={NATIONAL_KPI_DATA.moeBudget} icon="💰" />
                    </div>
                </Card>
                
                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. اختلالات التوزيع الديموغرافي والبنية التحتية</h2>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        <p className="mb-4">
                            تشير البيانات إلى تركز سكاني وطلابي كثيف في العاصمة عمان، التي تستوعب وحدها ما يقارب <strong>37%</strong> من إجمالي طلبة المملكة (844,395 طالب)، تليها إربد (421,817 طالب) ثم الزرقاء (310,545 طالب). هذا التباين يخلق ضغطاً شديداً على البنية التحتية في المدن الكبرى، بينما تعاني مناطق الأطراف من تشتت المدارس وارتفاع كلفة الطالب.
                        </p>
                        <p>
                            أزمة المدارس المستأجرة لا تزال تشكل تحدياً جوهرياً لاستدامة البيئة التعليمية. تسجل محافظة <strong>الطفيلة</strong> أعلى نسبة للمدارس المستأجرة بواقع <strong>37.6%</strong>، تليها <strong>عجلون (34.0%)</strong> والكرك (33.9%). هذه المباني غالباً ما تكون غير مصممة أصلاً كمدارس، وتفتقر للمرافق الأساسية كالساحات والمختبرات، مما يؤثر سلباً على جودة التعليم.
                        </p>
                    </div>
                    <div style={{ height: 400 }} className="no-print">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[...STUDENTS_BY_GOVERNORATE].sort((a,b) => b.value - a.value)} layout="vertical" margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.2)" />
                                <XAxis type="number" tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis type="category" dataKey="name_ar" width={80} tick={{ fontSize: 13, fill: '#cbd5e1' }} />
                                <Tooltip formatter={(value: number) => [value.toLocaleString(), "عدد الطلبة"]} />
                                <Bar dataKey="value" name="عدد الطلبة" radius={[0, 4, 4, 0]}>
                                    <LabelList dataKey="value" position="right" formatter={(value: number) => value.toLocaleString()} style={{ fill: '#e2e8f0', fontSize: '12px' }}  />
                                    {STUDENTS_BY_GOVERNORATE.map(entry => <Cell key={entry.name} fill={GOVERNORATE_COLORS[entry.name]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. جودة التعليم: الكثافة الصفية وكفاءة المعلمين</h2>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        <p className="mb-4">
                            يُظهر مؤشر "نسبة الطلبة لكل معلم" تبايناً واضحاً في الجودة. فبينما تعاني <strong>الزرقاء</strong> من اكتظاظ واضح بنسبة تصل إلى <strong>20.5</strong> طالب لكل معلم في المدارس الحكومية، وعمان بنسبة 19.1، تتمتع محافظات الجنوب بنسب مريحة جداً (الطفيلة 10.6، الكرك 11.4)، مما يتيح فرصة أكبر للتركيز الفردي على الطلبة. ومع ذلك، فإن انخفاض النسبة في الجنوب قد يعكس أيضاً تشتت السكان وصغر حجم المدارس.
                        </p>
                        <p>
                            من حيث المؤهلات، تتفوق محافظات الشمال، حيث تسجل <strong>جرش</strong> أعلى نسبة للمعلمين من حملة الشهادات العليا (<strong>9.7%</strong>)، تليها إربد (8.7%). في المقابل، تنخفض هذه النسبة بشكل ملحوظ في العقبة (2.6%) والطفيلة (2.9%)، مما يستدعي برامج ابتعاث وتحفيز لرفع كفاءة الكادر التعليمي في الجنوب.
                        </p>
                    </div>
                    <div style={{ height: 350 }} className="no-print">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[...STUDENT_TEACHER_RATIO_MOE].sort((a,b) => b.value - a.value)} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.2)" />
                                <XAxis dataKey="name_ar" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis domain={[8, 'dataMax + 2']} tick={{ fontSize: 12, fill: '#cbd5e1' }}/>
                                <Tooltip formatter={(value: number) => [value.toFixed(1), "طالب/معلم"]} />
                                <Bar dataKey="value" name="النسبة" fill="#a855f7" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="value" position="top" style={{ fill: '#e2e8f0', fontSize: '12px' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. التوصيات الاستراتيجية</h2>
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-4 text-lg">
                        <ul className="list-disc list-outside mr-6 space-y-2">
                            <li><strong>خطة وطنية للمباني المدرسية:</strong> إطلاق برنامج طويل الأمد للتخلص التدريجي من المدارس المستأجرة، مع إعطاء الأولوية للمحافظات ذات النسب الأعلى مثل الزرقاء وجرش.</li>
                            <li><strong>إعادة توزيع الكوادر التعليمية:</strong> وضع حوافز مادية ومعنوية للمعلمين (خاصة حملة الشهادات العليا) للعمل في المحافظات التي تعاني من نقص، مثل العقبة والطفيلة.</li>
                            <li><strong>تطوير التعليم المهني:</strong> إطلاق حملة وطنية لتغيير الصورة النمطية عن التعليم المهني، وتحديث المسارات لتواكب متطلبات سوق العمل المستقبلية.</li>
                            <li><strong>المدارس المجمعة:</strong> دمج المدارس الصغيرة والمستأجرة في مدارس مجمعة حديثة في مراكز الألوية مع توفير شبكة نقل فعالة.</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Education;
