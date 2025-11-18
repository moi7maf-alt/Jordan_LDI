import React, { useState, useMemo } from 'react';
import Card from './ui/Card';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, IStylesOptions } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GOVERNORATE_COLORS } from '../constants/colors';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';

// Data a s per the 2024 Annual Statistical Report
const NATIONAL_INDICATORS_2024 = {
    population: '11,734,000',
    birth_rate: '16.0',
    death_rate: '6.0',
    life_expectancy: '75.3',
    infant_mortality: '14.0',
    total_hospitals: '121',
    total_beds: '16,316',
    doctors_per_10k: '32.7',
    nurses_per_10k: '38.4',
    pharmacists_per_10k: '20.8',
};

const BEDS_BY_SECTOR_2024 = [
    { name: 'وزارة الصحة', value: 6059 },
    { name: 'الخدمات الطبية الملكية', value: 3348 },
    { name: 'المستشفيات الجامعية', value: 1261 },
    { name: 'القطاع الخاص', value: 5648 },
];

const BEDS_PER_10K_GOVERNORATE = [
  { name_ar: 'عمان', rate: 18 },
  { name_ar: 'البلقاء', rate: 18 },
  { name_ar: 'عجلون', rate: 20 },
  { name_ar: 'الطفيلة', rate: 26 },
  { name_ar: 'الكرك', rate: 13 },
  { name_ar: 'العقبة', rate: 13 },
  { name_ar: 'إربد', rate: 11 },
  { name_ar: 'معان', rate: 12 },
  { name_ar: 'المفرق', rate: 9 },
  { name_ar: 'مأدبا', rate: 8 },
  { name_ar: 'الزرقاء', rate: 7 },
  { name_ar: 'جرش', rate: 6 },
];

const HEALTH_CENTERS_BY_GOVERNORATE = [
    { name_ar: 'عمان', total: 103 },
    { name_ar: 'إربد', total: 121 },
    { name_ar: 'المفرق', total: 85 },
    { name_ar: 'الكرك', total: 55 },
    { name_ar: 'البلقاء', total: 60 },
    { name_ar: 'الزرقاء', total: 40 },
    { name_ar: 'جرش', total: 27 },
    { name_ar: 'معان', total: 38 },
    { name_ar: 'مأدبا', total: 25 },
    { name_ar: 'عجلون', total: 31 },
    { name_ar: 'الطفيلة', total: 20 },
    { name_ar: 'العقبة', total: 22 },
];

const WORKLOAD_BY_SECTOR_2024 = [
    { sector: 'وزارة الصحة', admissions: 446498, occupancy_rate: 71.4, avg_stay: 3.5, surgeries: 150541 },
    { sector: 'الخدمات الطبية', admissions: 226748, occupancy_rate: 68.6, avg_stay: 3.6, surgeries: 142946 },
    { sector: 'القطاع الخاص', admissions: 283399, occupancy_rate: 34.8, avg_stay: 2.0, surgeries: 145732 },
    { sector: 'المستشفيات الجامعية', admissions: 70906, occupancy_rate: 64.4, avg_stay: 3.9, surgeries: 40979 }, // Aggregated
];

const CAESAREAN_RATES = [
    { hospital: 'الأميرة بديعة', rate: 59.1 },
    { hospital: 'الكرك', rate: 53.3 },
    { hospital: 'الحسين / السلط', rate: 50.4 },
    { hospital: 'الطفيلة', rate: 51.7 },
    { hospital: 'الوطني', rate: 38.4 },
];

const KPI_CARD_DATA = [
    { title: "معدل المواليد الخام", value: `${NATIONAL_INDICATORS_2024.birth_rate}‰`, icon: "👶" },
    { title: "العمر المتوقع عند الولادة", value: NATIONAL_INDICATORS_2024.life_expectancy, icon: "📈" },
    { title: "معدل وفيات الرضع", value: `${NATIONAL_INDICATORS_2024.infant_mortality}‰`, icon: "🍼" },
    { title: "إجمالي المستشفيات", value: NATIONAL_INDICATORS_2024.total_hospitals, icon: "🏥" },
    { title: "إجمالي الأسرّة", value: NATIONAL_INDICATORS_2024.total_beds, icon: "🛏️" },
    { title: "الأطباء لكل 10,000 نسمة", value: NATIONAL_INDICATORS_2024.doctors_per_10k, icon: "👩‍⚕️" },
];

type ContentBlock = { type: 'h1' | 'h2' | 'h3' | 'p' | 'list-item'; text: string; };


const Health: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    
    const generateReportContent = (): ContentBlock[] => [
        { type: 'h1', text: "تقرير تحليلي استراتيجي لقطاع الصحة في الأردن 2024" },
        { type: 'p', text: "يقدم هذا التقرير تحليلاً شاملاً لواقع البنية التحتية الصحية، حجم العمل، وكفاءة الخدمات في المملكة، استناداً إلى بيانات التقرير الإحصائي السنوي لوزارة الصحة لعام 2024. يهدف التقرير إلى تحديد أبرز التحديات وتقديم توصيات استراتيجية لدعم صناع القرار." },
        { type: 'h2', text: "1. المشهد الصحي الوطني: مؤشرات رئيسية" },
        { type: 'p', text: `يبلغ عدد سكان الأردن ${NATIONAL_INDICATORS_2024.population} نسمة لعام 2024. يظهر الوضع الديموغرافي معدل مواليد خام يبلغ ${NATIONAL_INDICATORS_2024.birth_rate} لكل 1000 نسمة، ومعدل وفيات خام يبلغ ${NATIONAL_INDICATORS_2024.death_rate} لكل 1000. يعكس العمر المتوقع عند الولادة البالغ ${NATIONAL_INDICATORS_2024.life_expectancy} عاماً تحسناً في الظروف الصحية العامة. ومع ذلك، لا يزال معدل وفيات الرضع عند ${NATIONAL_INDICATORS_2024.infant_mortality} لكل 1000 ولادة حية يمثل تحدياً يتطلب اهتماماً مستمراً.` },
        { type: 'h2', text: "2. تحليل البنية التحتية للقطاع الصحي" },
        { type: 'p', text: "تتكون البنية التحتية الصحية من شبكة متنوعة من المستشفيات والمراكز الصحية التابعة لقطاعات متعددة." },
        { type: 'h3', text: "توزيع الأسرّة حسب القطاع" },
        { type: 'p', text: `يبلغ إجمالي عدد الأسرّة في المملكة ${NATIONAL_INDICATORS_2024.total_beds} سريراً. تستحوذ وزارة الصحة على الحصة الأكبر بنسبة 37.1% (6,059 سريراً)، يليها القطاع الخاص بنسبة 34.6% (5,648 سريراً)، ثم الخدمات الطبية الملكية بنسبة 20.5% (3,348 سريراً)، وأخيراً المستشفيات الجامعية بنسبة 7.7% (1,261 سريراً). هذا التوزيع يبرز الدور المحوري للقطاعين العام والخاص في تقديم الخدمات الاستشفائية.` },
        { type: 'h3', text: "الفجوة في توزيع الأسرّة بين المحافظات" },
        { type: 'p', text: "يُظهر مؤشر 'معدل الأسرّة لكل 10,000 نسمة' تفاوتاً جغرافياً صارخاً. تتصدر محافظات الطفيلة (26)، عجلون (20)، عمان (18)، والبلقاء (18) القائمة بأعلى المعدلات، مما يعكس توفر بنية تحتية جيدة نسبياً. في المقابل، تعاني محافظات ذات كثافة سكانية عالية مثل الزرقاء (7)، جرش (6)، ومأدبا (8) من نقص حاد في القدرة الاستيعابية للمستشفيات، مما يضع ضغطاً هائلاً على الخدمات الصحية فيها ويجبر المواطنين على الانتقال لمحافظات أخرى لتلقي العلاج." },
        { type: 'h2', text: "3. حجم العمل وكفاءة المستشفيات" },
        { type: 'p', text: "يكشف تحليل بيانات حجم العمل عن ديناميكيات تشغيلية مختلفة بين القطاعات." },
        { type: 'p', text: "تتعامل مستشفيات وزارة الصحة مع العبء الأكبر من حيث عدد حالات الإدخال (446,498 حالة)، وتعمل بمعدل إشغال مرتفع بلغ 71.4% ومتوسط إقامة 3.5 أيام. في المقابل، يعمل القطاع الخاص بمعدل إشغال منخفض (34.8%) ومتوسط إقامة قصير (2.0 يوم)، مما قد يعكس تركيزه على الحالات الأقل تعقيداً والعمليات الجراحية المجدولة. وتأتي الخدمات الطبية الملكية في المرتبة الثانية من حيث حجم العمل مع معدل إشغال يبلغ 68.6%." },
        { type: 'h2', text: "4. خدمات صحة الأم والطفل والخدمات المتخصصة" },
        { type: 'p', text: `شكلت الولادات القيصرية نسبة 38.4% من إجمالي الولادات في مستشفيات وزارة الصحة عام 2024، وهو ارتفاع طفيف عن العام السابق. اللافت للنظر هو الارتفاع الكبير في هذا المعدل في مستشفيات معينة مثل الأميرة بديعة (59.1%) والكرك (53.3%)، مما يتجاوز بكثير المعدلات العالمية الموصى بها (10-15%) وقد يشير إلى وجود ممارسات طبية تتطلب المراجعة.` },
        { type: 'p', text: "على صعيد الخدمات المتخصصة، استقبلت أقسام الطوارئ في مستشفيات الوزارة حوالي 4.4 مليون مراجع، 33% منهم فقط كانوا حالات طارئة، مما يدل على استخدام غير فعال لخدمات الطوارئ وضغط على الكوادر يمكن تخفيفه بتعزيز دور الرعاية الأولية. كما تم تقديم حوالي 22,500 جلسة غسيل كلى لـ 1,909 مرضى، مما يعكس حجم العبء الذي تمثله الأمراض المزمنة." },
        { type: 'h2', text: "5. تحديات استراتيجية وتوصيات" },
        { type: 'h3', text: "أبرز التحديات:" },
        { type: 'list-item', text: "التوزيع غير العادل للموارد: تركز الخدمات الصحية المتخصصة والقدرة السريرية في العاصمة، مقابل نقص حاد في المحافظات الطرفية وذات الكثافة السكانية العالية." },
        { type: 'list-item', text: "الضغط على خدمات الطوارئ: استخدام أقسام الطوارئ للحالات غير الطارئة يستنزف الموارد ويؤثر على جودة الرعاية للحالات الحرجة." },
        { type: 'list-item', text: "ارتفاع معدلات الولادة القيصرية: النسب المرتفعة في بعض المستشفيات تتطلب تحليلاً للأسباب الجذرية ووضع بروتوكولات لترشيدها." },
        { type: 'list-item', text: "ضعف البنية التحتية في بعض المحافظات: محافظات مثل الزرقاء وجرش تعاني من نقص شديد في الأسرّة مقارنة بعدد السكان." },
        { type: 'h3', text: "توصيات استراتيجية:" },
        { type: 'list-item', text: "خارطة طريق للاستثمار الصحي: وضع خطة استثمارية وطنية موجهة لإنشاء مستشفيات وتوسعة أقسام في المحافظات الأكثر حاجة (خاصة الزرقاء وجرش ومأدبا) بناءً على بيانات الاحتياج السكاني." },
        { type: 'list-item', text: "تعزيز الرعاية الصحية الأولية: إطلاق حملة وطنية لتوعية المواطنين بدور المراكز الصحية الأولية وتوجيه الحالات غير الطارئة إليها، مع توسيع ساعات عمل بعض المراكز الشاملة." },
        { type: 'list-item', text: "مراجعة بروتوكولات الولادة: تشكيل لجنة وطنية لمراجعة أسباب ارتفاع معدلات الولادة القيصرية ووضع دلائل إرشادية ومعايير واضحة لتوحيد الممارسات الطبية." },
        { type: 'list-item', text: "استخدام البيانات لتحسين الكفاءة: تحليل بيانات حجم العمل ومعدلات الإشغال بشكل دوري لتوجيه توزيع الموارد البشرية والمالية بين المستشفيات والأقسام لتحقيق أقصى استفادة من الموارد المتاحة." },
    ];

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const content = generateReportContent();
            const title = content.find(c => c.type === 'h1')?.text || "Health Report";
            
            const docStyles: IStylesOptions = {
                default: { document: { run: { font: "Calibri", size: 24, rightToLeft: true } } },
                paragraphStyles: [
                    { id: "Normal", name: "Normal", basedOn: "Normal", next: "Normal", run: { size: 24 }, paragraph: { spacing: { after: 120 } } },
                    { id: "h1", name: "h1", basedOn: "Normal", next: "Normal", run: { size: 48, bold: true, color: "2E74B5" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } } },
                    { id: "h2", name: "h2", basedOn: "Normal", next: "Normal", run: { size: 36, bold: true, color: "4F81BD" }, paragraph: { spacing: { before: 240, after: 120 } } },
                    { id: "h3", name: "h3", basedOn: "Normal", next: "Normal", run: { size: 28, bold: true, color: "548DD4" }, paragraph: { spacing: { before: 240, after: 120 } } },
                ],
            };

            const paragraphs: Paragraph[] = content.map((block) => {
                let style = "Normal";
                let bullet = undefined;
                if (block.type.startsWith('h')) style = block.type;
                if (block.type === 'list-item') bullet = { level: 0 };
                
                return new Paragraph({
                    children: [new TextRun(block.text)],
                    style: style,
                    bullet: bullet,
                    bidirectional: true,
                    alignment: AlignmentType.RIGHT,
                });
            });

            // Center the main title
            if (paragraphs.length > 0) {
                 paragraphs[0] = new Paragraph({
                    children: [new TextRun(content[0].text)],
                    style: 'h1',
                    bidirectional: true,
                    alignment: AlignmentType.CENTER,
                });
            }


            const doc = new Document({
                styles: docStyles,
                sections: [{ properties: { page: { margin: { top: 1134, right: 850, bottom: 1134, left: 850 } } }, children: paragraphs }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${title}.docx`);

        } catch (error) {
            console.error("Failed to export DOCX:", error);
        } finally {
            setIsExportingDocx(false);
        }
    };
    
    const handleExportPdf = async () => {
        setIsExportingPdf(true);
        const input = document.getElementById('report-content');
        if (!input) {
            setIsExportingPdf(false);
            return;
        }

        try {
            const canvas = await html2canvas(input, { scale: 2, useCORS: true, windowWidth: 1280 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const topMargin = 20;
            const bottomMargin = 20;
            const leftMargin = 15;
            const rightMargin = 15;

            const contentWidth = pdfWidth - leftMargin - rightMargin;
            const pageContentHeight = pdfHeight - topMargin - bottomMargin;

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / contentWidth;
            const scaledImgHeight = imgHeight / ratio;

            let heightLeft = scaledImgHeight;
            let position = -topMargin;

            pdf.addImage(imgData, 'PNG', leftMargin, position + topMargin, contentWidth, scaledImgHeight);
            heightLeft -= pageContentHeight;

            while (heightLeft > 0) {
                position -= pageContentHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', leftMargin, position + topMargin, contentWidth, scaledImgHeight);
                heightLeft -= pageContentHeight;
            }
            
            pdf.save('report-health-sector.pdf');
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                    </button>
                    <button onClick={handleExportPdf} disabled={isExportingPdf} className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-slate-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        {isExportingPdf ? 'جاري التصدير...' : 'تصدير (PDF)'}
                    </button>
                </div>
            </div>

            <header className="text-center border-b border-gray-200 dark:border-gray-700 pb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">تقرير تحليلي استراتيجي لقطاع الصحة في الأردن 2024</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                    نظرة معمقة على البنية التحتية، حجم العمل، وكفاءة الخدمات الصحية استناداً إلى التقرير الإحصائي السنوي لوزارة الصحة.
                </p>
            </header>
            
            <div className="page-break" />

            <Card className="card-container">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. المشهد الصحي الوطني: مؤشرات رئيسية لعام 2024</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">يقدم هذا القسم لمحة سريعة عن أهم المؤشرات الديموغرافية والصحية التي تشكل السياق العام للقطاع الصحي في المملكة.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                    {KPI_CARD_DATA.map(item => (
                        <div key={item.title} className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl">
                            <div className="text-3xl mb-2">{item.icon}</div>
                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{item.value}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.title}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="page-break" />

            <Card className="card-container">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. تحليل البنية التحتية للقطاع الصحي</h2>
                 <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">تتكون البنية التحتية الصحية من شبكة متنوعة من المستشفيات والمراكز الصحية التابعة لقطاعات متعددة، ويكشف توزيعها عن فجوات جغرافية واضحة.</p>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">توزيع الأسرّة حسب القطاع (إجمالي: {NATIONAL_INDICATORS_2024.total_beds})</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={BEDS_BY_SECTOR_2024} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {BEDS_BY_SECTOR_2024.map((entry, index) => <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f97316', '#8b5cf6'][index % 4]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} سرير`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">معدل الأسرّة لكل 10,000 نسمة حسب المحافظة</h3>
                         <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[...BEDS_PER_10K_GOVERNORATE].sort((a,b) => b.rate - a.rate)} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                    <XAxis dataKey="name_ar" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <YAxis domain={[0, 'dataMax + 5']} tick={{ fontSize: 11, fill: '#9ca3af' }}/>
                                    <Tooltip formatter={(value: number) => [value, "المعدل"]} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Bar dataKey="rate" name="المعدل" fill="#0ea5e9">
                                        <LabelList dataKey="rate" position="top" style={{ fill: '#6b7280', fontSize: '11px' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                 <div className="mt-8">
                     <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">إجمالي المراكز الصحية (شامل، أولي، فرعي) لوزارة الصحة</h3>
                     <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={[...HEALTH_CENTERS_BY_GOVERNORATE].sort((a,b) => b.total - a.total)} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name_ar" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip formatter={(value: number) => [value, "عدد المراكز"]} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                <Bar dataKey="total" name="عدد المراكز" fill="#14b8a6">
                                    <LabelList dataKey="total" position="top" style={{ fill: '#6b7280', fontSize: '11px' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>

            <div className="page-break" />

             <Card className="card-container">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. حجم العمل وكفاءة المستشفيات (2024)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-4 py-3">القطاع</th>
                                <th scope="col" className="px-4 py-3">حالات الإدخال</th>
                                <th scope="col" className="px-4 py-3">نسبة الإشغال (%)</th>
                                <th scope="col" className="px-4 py-3">متوسط الإقامة (يوم)</th>
                                <th scope="col" className="px-4 py-3">العمليات الجراحية</th>
                            </tr>
                        </thead>
                        <tbody>
                            {WORKLOAD_BY_SECTOR_2024.map((item) => (
                                <tr key={item.sector} className="bg-white border-b dark:bg-slate-800 dark:border-gray-700">
                                    <th scope="row" className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.sector}</th>
                                    <td className="px-4 py-4">{item.admissions.toLocaleString()}</td>
                                    <td className="px-4 py-4">{item.occupancy_rate.toFixed(1)}%</td>
                                    <td className="px-4 py-4">{item.avg_stay.toFixed(1)}</td>
                                    <td className="px-4 py-4">{item.surgeries.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="page-break" />

            <Card className="card-container">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. خدمات صحة الأم والطفل والخدمات المتخصصة</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">معدلات الولادة القيصرية (2024)</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={CAESAREAN_RATES} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                    <XAxis type="number" unit="%" domain={[0, 70]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <YAxis type="category" dataKey="hospital" width={100} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }} />
                                    <Bar dataKey="rate" name="المعدل" fill="#f43f5e" >
                                        <LabelList dataKey="rate" position="right" formatter={(value: number) => `${value.toFixed(1)}%`} style={{ fill: '#6b7280', fontSize: '11px' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 dark:text-white">مراجعات الطوارئ</h4>
                            <p className="text-3xl font-bold text-red-500">4.4 مليون</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي المراجعين لأقسام الطوارئ في مستشفيات وزارة الصحة.</p>
                            <p className="text-lg font-semibold mt-2">33% فقط حالات طارئة</p>
                        </div>
                        <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 dark:text-white">مرضى غسيل الكلى</h4>
                            <p className="text-3xl font-bold text-blue-500">1,909 مريض</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">في وحدات غسيل الكلى بمستشفيات وزارة الصحة.</p>
                            <p className="text-lg font-semibold mt-2">~22,500 جلسة علاجية</p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="page-break" />

            <Card className="card-container">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. تحديات استراتيجية وتوصيات</h2>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-4 text-lg">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white pt-2">أبرز التحديات:</h3>
                    <ul className="list-disc list-outside mr-6 space-y-2">
                        <li>**التوزيع غير العادل للموارد:** تركز الخدمات الصحية المتخصصة والقدرة السريرية في العاصمة، مقابل نقص حاد في المحافظات الطرفية وذات الكثافة السكانية العالية.</li>
                        <li>**الضغط على خدمات الطوارئ:** استخدام أقسام الطوارئ للحالات غير الطارئة يستنزف الموارد ويؤثر على جودة الرعاية للحالات الحرجة.</li>
                        <li>**ارتفاع معدلات الولادة القيصرية:** النسب المرتفعة في بعض المستشفيات تتطلب تحليلاً للأسباب الجذرية ووضع بروتوكولات لترشيدها.</li>
                        <li>**ضعف البنية التحتية في بعض المحافظات:** محافظات مثل الزرقاء وجرش تعاني من نقص شديد في الأسرّة مقارنة بعدد السكان.</li>
                    </ul>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white pt-4">توصيات استراتيجية:</h3>
                     <ul className="list-disc list-outside mr-6 space-y-2">
                        <li>**خارطة طريق للاستثمار الصحي:** وضع خطة استثمارية وطنية موجهة لإنشاء مستشفيات وتوسعة أقسام في المحافظات الأكثر حاجة (خاصة الزرقاء وجرش ومأدبا) بناءً على بيانات الاحتياج السكاني.</li>
                        <li>**تعزيز الرعاية الصحية الأولية:** إطلاق حملة وطنية لتوعية المواطنين بدور المراكز الصحية الأولية وتوجيه الحالات غير الطارئة إليها، مع توسيع ساعات عمل بعض المراكز الشاملة.</li>
                        <li>**مراجعة بروتوكولات الولادة:** تشكيل لجنة وطنية لمراجعة أسباب ارتفاع معدلات الولادة القيصرية ووضع دلائل إرشادية ومعايير واضحة لتوحيد الممارسات الطبية.</li>
                        <li>**استخدام البيانات لتحسين الكفاءة:** تحليل بيانات حجم العمل ومعدلات الإشغال بشكل دوري لتوجيه توزيع الموارد البشرية والمالية بين المستشفيات والأقسام لتحقيق أقصى استفادة من الموارد المتاحة.</li>
                    </ul>
                </div>
            </Card>
        </div>
    );
};

export default Health;