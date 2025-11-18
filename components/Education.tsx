import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { GOVERNORATE_COLORS } from '../constants/colors';

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
    <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl text-center shadow-sm">
        <div className="text-3xl mb-2">{icon}</div>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title}</p>
    </div>
);

type ContentBlock = { type: 'h1' | 'h2' | 'h3' | 'p' | 'list-item'; text: string; };

const Education: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const generateReportContent = (): ContentBlock[] => [
        { type: 'h1', text: "تقرير تحليلي استراتيجي لقطاع التعليم في الأردن 2024" },
        { type: 'p', text: "يقدم هذا التقرير تحليلاً شاملاً لواقع البنية التحتية التعليمية، كفاءة الموارد، وجودة الكوادر في المملكة، استناداً إلى بيانات التقرير الإحصائي للعام الدراسي 2023-2024 الصادر عن وزارة التربية والتعليم. يهدف التقرير إلى تسليط الضوء على الفجوات والتحديات الرئيسية، وتقديم توصيات استراتيجية لدعم صناع القرار." },
        { type: 'h2', text: "1. المشهد التعليمي الوطني: مؤشرات رئيسية" },
        { type: 'p', text: `يخدم قطاع التعليم في الأردن ما يزيد عن ${NATIONAL_KPI_DATA.totalStudents} طالباً وطالبة، موزعين على ${NATIONAL_KPI_DATA.totalSchools} مدرسة في مختلف السلطات التعليمية (وزارة التربية والتعليم، الخاص، وكالة الغوث، وغيرها). ويعمل في القطاع حوالي ${NATIONAL_KPI_DATA.totalTeachers} معلماً ومعلمة، وتخصص الدولة ميزانية ضخمة للإنفاق على التعليم تبلغ حوالي ${NATIONAL_KPI_DATA.moeBudget}.` },
        { type: 'h2', text: "2. تحليل البنية التحتية التعليمية وتوزيع الطلبة" },
        { type: 'p', text: "يكشف توزيع الطلبة والمدارس عن تركز واضح في المحافظات ذات الكثافة السكانية العالية، مما يخلق ضغطاً كبيراً على الموارد التعليمية في تلك المناطق." },
        { type: 'h3', text: "توزيع الطلبة حسب المحافظة" },
        { type: 'p', text: "تستوعب محافظة العاصمة وحدها ما يقارب 37% من إجمالي طلبة المملكة، تليها إربد (18.3%) ثم الزرقاء (13.5%). هذا التركز السكاني يضع تحديات كبيرة أمام توفير بنية تحتية تعليمية كافية ومناسبة في هذه المحافظات." },
        { type: 'h3', text: "نسبة المدارس المستأجرة (مدارس وزارة التربية والتعليم)" },
        { type: 'p', text: "تعتبر نسبة المباني المدرسية المستأجرة مؤشراً على استدامة البنية التحتية. تظهر محافظات مثل الزرقاء (42.5%) وجرش (34.7%) نسباً مرتفعة جداً، مما يؤثر على استقرار البيئة التعليمية وقدرة الوزارة على تطوير هذه المدارس. في المقابل، تتمتع محافظة معان بأقل نسبة مدارس مستأجرة (6.7%)، مما يعكس بنية تحتية أكثر استدامة." },
        { type: 'h2', text: "3. كفاءة النظام التعليمي وجودة الكوادر" },
        { type: 'p', text: "تقاس كفاءة النظام التعليمي من خلال مؤشرات مثل نسبة الطلبة للمعلمين، بينما تقاس جودة الكوادر بمؤهلاتهم العلمية." },
        { type: 'h3', text: "نسبة الطلبة لكل معلم (مدارس وزارة التربية والتعليم)" },
        { type: 'p', text: "يعد هذا المؤشر مقياساً لجودة التعليم، حيث تشير النسب المنخفضة إلى فرصة أفضل للطالب لتلقي الاهتمام. تظهر محافظات الجنوب مثل معان والطفيلة والكرك أفضل أداء في هذا المؤشر، بينما تسجل الزرقاء والعاصمة أعلى النسب، مما يعكس تحدي الاكتظاظ." },
        { type: 'h3', text: "نسبة المعلمين حملة الشهادات العليا (ماجستير ودكتوراه)" },
        { type: 'p', text: "يعكس هذا المؤشر مستوى الكادر التعليمي. تتميز محافظات الشمال مثل جرش وإربد وعجلون، بالإضافة إلى مأدبا، بنسب مرتفعة من المعلمين المؤهلين تأهيلاً عالياً، وهو ما يمثل نقطة قوة يمكن الاستفادة منها. في المقابل، تحتاج محافظات مثل العقبة والطفيلة ومعان إلى خطط لرفع كفاءة كوادرها التعليمية." },
        { type: 'h2', text: "4. تحديات استراتيجية وتوصيات" },
        { type: 'h3', text: "أبرز التحديات:" },
        { type: 'list-item', text: "الاكتظاظ الطلابي: الضغط الكبير على الموارد التعليمية في المحافظات ذات الكثافة السكانية العالية (العاصمة، الزرقاء، إربد) يؤدي إلى ارتفاع نسبة الطلبة للمعلمين والصفوف." },
        { type: 'list-item', text: "البنية التحتية غير المستدامة: الاعتماد الكبير على المباني المدرسية المستأجرة في العديد من المحافظات يشكل عبئاً مالياً ويحد من القدرة على تطوير البيئة المدرسية." },
        { type: 'list-item', text: "التفاوت في جودة الكوادر: تباين واضح في نسبة المعلمين من حملة الشهادات العليا بين المحافظات، مما يخلق فجوة في جودة المخرجات التعليمية المحتملة." },
        { type: 'list-item', text: "ضعف جاذبية التعليم المهني: على الرغم من أهميته لسوق العمل، لا يزال الإقبال على التعليم المهني، خاصة بين الإناث، دون المستوى المأمول." },
        { type: 'h3', text: "توصيات استراتيجية:" },
        { type: 'list-item', text: "خطة وطنية للمباني المدرسية: إطلاق برنامج طويل الأمد للتخلص التدريجي من المدارس المستأجرة، مع إعطاء الأولوية للمحافظات ذات النسب الأعلى مثل الزرقاء وجرش." },
        { type: 'list-item', text: "إعادة توزيع الكوادر التعليمية: وضع حوافز مادية ومعنوية للمعلمين (خاصة حملة الشهادات العليا) للعمل في المحافظات التي تعاني من نقص، مثل العقبة والطفيلة." },
        { type: 'list-item', text: "تطوير التعليم المهني: إطلاق حملة وطنية لتغيير الصورة النمطية عن التعليم المهني، وتحديث المسارات لتواكب متطلبات سوق العمل المستقبلية (مثل التكنولوجيا الخضراء والذكاء الاصطناعي)، وتقديم برامج موجهة لزيادة التحاق الإناث." },
        { type: 'list-item', text: "استخدام البيانات في التخطيط: تبني نهج قائم على البيانات في توزيع الموارد، بحيث يتم تخصيص الميزانيات والمشاريع بناءً على مؤشرات الأداء والفجوات التنموية لكل مديرية ومحافظة." },
    ];

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const content = generateReportContent();
            const title = content.find(c => c.type === 'h1')?.text || "Education Report";

            const paragraphs = content.map((block) => {
                let style = "Normal";
                let bullet = undefined;
                if (block.type.startsWith('h')) style = block.type;
                if (block.type === 'list-item') bullet = { level: 0 };
                
                return new Paragraph({
                    children: [new TextRun(block.text)],
                    style: style,
                    bullet: bullet,
                    bidirectional: true,
                    alignment: block.type === 'h1' ? AlignmentType.CENTER : AlignmentType.RIGHT,
                });
            });

            const doc = new Document({
                creator: "MOI Analytical Platform",
                title: title,
                styles: {
                    paragraphStyles: [
                        { id: "Normal", name: "Normal", run: { size: 24, font: "Calibri", rightToLeft: true }, paragraph: { spacing: { after: 120 } } },
                        { id: "h1", name: "Heading 1", basedOn: "Normal", run: { size: 48, bold: true, color: "2E74B5" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } } },
                        { id: "h2", name: "Heading 2", basedOn: "Normal", run: { size: 36, bold: true, color: "4F81BD" }, paragraph: { spacing: { before: 240, after: 120 } } },
                        { id: "h3", name: "Heading 3", basedOn: "Normal", run: { size: 28, bold: true, color: "548DD4" }, paragraph: { spacing: { before: 180, after: 100 } } },
                    ],
                },
                sections: [{ properties: { page: { margin: { top: 1134, right: 850, bottom: 1134, left: 850 } } }, children: paragraphs }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `تقرير-قطاع-التعليم.docx`);
        } catch (error) {
            console.error("Failed to export DOCX:", error);
        } finally {
            setIsExportingDocx(false);
        }
    };

    const handleExportPdf = async () => {
        setIsExportingPdf(true);
        const input = document.getElementById('report-content');
        if (!input) return;
        try {
            const canvas = await html2canvas(input, { scale: 2, useCORS: true, windowWidth: 1280 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pdfWidth - margin * 2;
            const pageContentHeight = pdfHeight - margin * 2;
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / contentWidth;
            const scaledImgHeight = imgHeight / ratio;
            let heightLeft = scaledImgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', margin, position, contentWidth, scaledImgHeight);
            heightLeft -= pageContentHeight;

            while (heightLeft > 0) {
                position -= pageContentHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, contentWidth, scaledImgHeight);
                heightLeft -= pageContentHeight;
            }
            pdf.save('تقرير-قطاع-التعليم.pdf');
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExportingPdf(false);
        }
    };

    return (
        <div className="space-y-8" id="report-content">
            <div data-html2canvas-ignore="true" className="flex justify-between items-center mb-6 no-print">
                <div />
                <div className="flex items-center gap-4">
                    <button onClick={handleExportDocx} disabled={isExportingDocx} className="px-4 py-2 text-sm font-medium text-black bg-amber-500 rounded-lg hover:bg-amber-600 focus:ring-4 focus:outline-none focus:ring-amber-300 disabled:bg-gray-400 flex items-center gap-2">
                        {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                    </button>
                    <button onClick={handleExportPdf} disabled={isExportingPdf} className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 dark:bg-slate-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center gap-2">
                        {isExportingPdf ? 'جاري التصدير...' : 'تصدير (PDF)'}
                    </button>
                </div>
            </div>

            <header className="text-center border-b border-gray-200 dark:border-gray-700 pb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">تقرير تحليلي استراتيجي لقطاع التعليم في الأردن</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                    نظرة معمقة على البنية التحتية، كفاءة الموارد، وجودة الكوادر التعليمية استناداً إلى بيانات 2023-2024.
                </p>
            </header>

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
                        <div style={{ height: 400 }}>
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
                        <div style={{ height: 400 }}>
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
                        <div style={{ height: 350 }}>
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
                         <div style={{ height: 350 }}>
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
                        <li>**الاكتظاظ الطلابي:** الضغط الكبير على الموارد التعليمية في المحافظات ذات الكثافة السكانية العالية (العاصمة، الزرقاء، إربد) يؤدي إلى ارتفاع نسبة الطلبة للمعلمين والصفوف.</li>
                        <li>**البنية التحتية غير المستدامة:** الاعتماد الكبير على المباني المدرسية المستأجرة في العديد من المحافظات يشكل عبئاً مالياً ويحد من القدرة على تطوير البيئة المدرسية.</li>
                        <li>**التفاوت في جودة الكوادر:** تباين واضح في نسبة المعلمين من حملة الشهادات العليا بين المحافظات، مما يخلق فجوة في جودة المخرجات التعليمية المحتملة.</li>
                        <li>**ضعف جاذبية التعليم المهني:** على الرغم من أهميته لسوق العمل، لا يزال الإقبال على التعليم المهني، خاصة بين الإناث، دون المستوى المأمول.</li>
                    </ul>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white pt-4">توصيات استراتيجية:</h3>
                     <ul className="list-disc list-outside mr-6 space-y-2">
                        <li>**خطة وطنية للمباني المدرسية:** إطلاق برنامج طويل الأمد للتخلص التدريجي من المدارس المستأجرة، مع إعطاء الأولوية للمحافظات ذات النسب الأعلى مثل الزرقاء وجرش.</li>
                        <li>**إعادة توزيع الكوادر التعليمية:** وضع حوافز مادية ومعنوية للمعلمين (خاصة حملة الشهادات العليا) للعمل في المحافظات التي تعاني من نقص، مثل العقبة والطفيلة.</li>
                        <li>**تطوير التعليم المهني:** إطلاق حملة وطنية لتغيير الصورة النمطية عن التعليم المهني، وتحديث المسارات لتواكب متطلبات سوق العمل المستقبلية (مثل التكنولوجيا الخضراء والذكاء الاصطناعي)، وتقديم برامج موجهة لزيادة التحاق الإناث.</li>
                        <li>**استخدام البيانات في التخطيط:** تبني نهج قائم على البيانات في توزيع الموارد، بحيث يتم تخصيص الميزانيات والمشاريع بناءً على مؤشرات الأداء والفجوات التنموية لكل مديرية ومحافظة.</li>
                    </ul>
                </div>
            </Card>

        </div>
    );
};

export default Education;