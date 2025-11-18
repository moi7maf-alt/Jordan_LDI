
import React, { useMemo, useState } from 'react';
import Card from './ui/Card';
import { SOLID_WASTE_DATA } from '../constants/solidWasteData';
import { GOVERNORATES_DATA } from '../constants';
import SolidWasteChart from './charts/SolidWasteChart';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, LabelList, AreaChart, Area } from 'recharts';

// Data derived from the provided images and report summaries
const OPERATIONAL_PERFORMANCE_CAT1_2022 = [
  { name: 'مأدبا', value: 3.7 },
  { name: 'الزرقاء', value: 2.1 },
  { name: 'معان', value: 0.83 },
  { name: 'إربد', value: 0.47 },
  { name: 'الرصيفة', value: -0.27 },
  { name: 'السلط', value: -0.28 },
  { name: 'الكرك', value: -0.31 },
  { name: 'جرش', value: -0.35 },
].sort((a,b) => b.value - a.value);

const CAT3_REVENUE_DATA_CHART = [
  { year: 2018, 'إيرادات تشغيلية': 26303260, 'إيرادات رأسمالية': 115979, 'مساهمات وهبات': 5311239 },
  { year: 2022, 'إيرادات تشغيلية': 15693626, 'إيرادات رأسمالية': 143068, 'مساهمات وهبات': 2102190 },
];

const CAT3_EXPENDITURE_DATA_CHART = [
    { year: 2018, 'رواتب وأجور': 8903796, 'نفقات رأسمالية': 2987064, 'نفقات أخرى': 3519505 },
    { year: 2022, 'رواتب وأجور': 13059947, 'نفقات رأسمالية': 6375284, 'نفقات أخرى': 289852 },
];

const MUNICIPAL_DEBT_DATA = [
    { year: '2018', cat1: 58253198, cat2: 15635854, cat3: 574354 },
    { year: '2019', cat1: 68130435, cat2: 17595692, cat3: 787686 },
    { year: '2020', cat1: 97777773, cat2: 21665431, cat3: 1232741 },
    { year: '2021', cat1: 147322385, cat2: 24243083, cat3: 2178238 },
    { year: '2022', cat1: 156078842, cat2: 28556796, cat3: 1573759 },
    { year: 'Q1 2023', cat1: 162716483, cat2: 29155106, cat3: 734605 },
];


const KpiCard: React.FC<{ title: string; value: string; icon: string; }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 p-4 rounded-xl text-center shadow-sm h-full flex flex-col justify-center">
        <div className="text-3xl mb-2">{icon}</div>
        <p className="text-2xl font-bold text-amber-600">{value}</p>
        <p className="text-xs text-gray-700 mt-1 h-10 flex items-center justify-center">{title}</p>
    </div>
);

type ContentBlock = { type: 'h1' | 'h2' | 'h3' | 'p' | 'list-item'; text: string; };

const LocalAdministration: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const latestData = useMemo(() => {
        const populationMap = new Map(GOVERNORATES_DATA.map(g => [g.name, g.population]));
        return SOLID_WASTE_DATA.filter(g => g.name !== 'Kingdom').map(gov => {
            const lastEntry = gov.data.find(d => d.year === 2022) || gov.data[gov.data.length - 1];
            const baseGovData = GOVERNORATES_DATA.find(g => g.name === gov.name);
            const population = populationMap.get(gov.name) || 1;
            const wastePerCapita = (lastEntry.quantity_tons * 1000) / population;
            return {
                ...baseGovData!, name: gov.name, name_ar: gov.name_ar,
                quantity_tons_2022: lastEntry.quantity_tons,
                waste_per_capita_2022: isNaN(wastePerCapita) ? 0 : wastePerCapita,
            };
        });
    }, []);

    const kingdomTotals = useMemo(() => {
        const kingdomData = SOLID_WASTE_DATA.find(g => g.name === 'Kingdom');
        const totalPopulation = GOVERNORATES_DATA.reduce((acc, gov) => acc + gov.population, 0);
        const latestWaste = kingdomData?.data.find(d => d.year === 2022)?.quantity_tons || 0;
        const avgWastePerCapita = (latestWaste * 1000) / totalPopulation;
        return { totalWaste: latestWaste, avgWastePerCapita: avgWastePerCapita };
    }, []);
    
    const generateReportContent = (): ContentBlock[] => [
        { type: 'h1', text: "تحليل مؤشرات عامة لقطاع الإدارة المحلية" },
        { type: 'h2', text: "ملخص تنفيذي" },
        { type: 'p', text: "يقدم هذا التقرير تحليلاً شاملاً لقطاع الإدارة المحلية في الأردن، مستنداً إلى بيانات حديثة لعام 2024 وتحليل تاريخي للفترة 2018-2022. يكشف التحليل عن تحديات هيكلية عميقة تتمثل في هيمنة النفقات التشغيلية (خاصة الرواتب) على الموازنات، وضعف الإيرادات الذاتية، مما يحد بشدة من القدرة على الإنفاق التنموي. كما يسلط التقرير الضوء على أزمة حوكمة في إدارة المشاريع والعطاءات، ويقدم توصيات استراتيجية قابلة للتنفيذ لتعزيز الاستدامة المالية، ترشيد الإنفاق، ورفع كفاءة الخدمات المقدمة للمواطنين." },
    
        { type: 'h2', text: "تحليل الأداء المالي والحوكمة للبلديات (بيانات 2024)" },
        { type: 'h3', text: "تحديات هيكلية تهدد استدامة الخدمات" },
        { type: 'p', text: "كشف إيجاز وزارة الإدارة المحلية لعام 2024 عن أزمة مالية وحوكمة متعددة الأبعاد تتطلب تدخلاً فورياً، وتتمثل أبرز التحديات فيما يلي:" },
        { type: 'list-item', text: "عبء مالي خانق: تستهلك الرواتب وحدها 70% من إجمالي إيرادات البلديات، وتتجاوز قيمة التحويلات الحكومية بنسبة 113%. هذا يعني أن الدعم الحكومي يذهب بالكامل للرواتب ولا يتبقى أي فائض للمشاريع التنموية أو تحسين الخدمات، مما يجعل البلديات عاجزة عن تلبية طموحات مجتمعاتها. يتفاقم هذا الوضع مع وصول إجمالي ديون البلديات إلى أكثر من 632 مليون دينار، مما يضعها في حلقة مفرغة من المديونية." },
        { type: 'list-item', text: "ضعف الاعتماد على الذات: تشكل الإيرادات الذاتية 36% فقط من إجمالي الإيرادات البالغ 340 مليون دينار. هذا الاعتماد الكبير على الموازنة العامة يجعل البلديات عرضة لأي تقلبات في الدعم الحكومي، ويضعف استقلاليتها المالية وقدرتها على التخطيط طويل الأمد." },
        { type: 'list-item', text: "أزمة حوكمة وجودة في المشاريع: كشفت فحوصات الجودة العشوائية عن خلل كبير في إدارة المشاريع، حيث فشلت 11 عينة من أصل 16 (أي 69%) في تحقيق المواصفات المطلوبة، بقيمة إجمالية تزيد عن 8.1 مليون دينار. هذا لا يمثل هدراً مالياً فادحاً فحسب، بل يشير إلى ضعف في آليات الرقابة والإشراف، ويؤثر سلباً على جودة البنية التحتية والخدمات المقدمة للمواطنين ويهدر ثقتهم." },
    
        { type: 'h2', text: "تحليل الأداء المالي المقارن للبلديات (2018-2022)" },
        { type: 'h3', text: "أولاً: بلديات الفئة الأولى - استقلالية أفضل ولكن تحديات قائمة" },
        { type: 'p', text: "تُظهر بلديات الفئة الأولى قدرة أفضل على توليد الإيرادات الذاتية، حيث ارتفع إجمالي إيراداتها (قبل الدعم) إلى 100.04 مليون دينار في 2022، وانخفض اعتمادها على الدعم الحكومي إلى 25.8%. ومع ذلك، لا تزال تواجه تحدي هيمنة النفقات التشغيلية (96.1 مليون دينار) التي تلتهم الجزء الأكبر من الميزانية، بينما لا تتجاوز نسبة النفقات الرأسمالية (التنموية) 10.6%، وهو ما يعني ضعف القدرة على إطلاق مشاريع جديدة لتحسين البنية التحتية والخدمات." },
        { type: 'p', text: "الأداء التشغيلي لهذه البلديات متفاوت، حيث تحقق بعضها (مثل مأدبا والزرقاء) فائضاً تشغيلياً يعكس كفاءة إدارية، بينما تعاني أخرى (مثل جرش والكرك) من عجز يتطلب دعماً إضافياً." },
        { type: 'h3', text: "ثانياً: بلديات الفئة الثانية - اعتمادية عالية وتحديات هيكلية" },
        { type: 'p', text: "تعاني هذه البلديات من اعتمادية شبه كاملة على الدعم الحكومي (7.5 مليون دينار في 2022)، مما يجعل استقلاليتها المالية محدودة للغاية. المشكلة الأكبر تكمن في هيكل النفقات، حيث تذهب 60-65% من إجمالي الميزانيات لتغطية رواتب وأجور الموظفين، وترتفع نسبة النفقات الإدارية إلى 38.4%. هذا الهيكل 'المقفل' يترك حيزاً ضئيلاً جداً للإنفاق على المشاريع التنموية التي تخدم المجتمع." },
        { type: 'h3', text: "ثالثاً: بلديات الفئة الثالثة - تحديات السيولة والإنفاق التنموي" },
        { type: 'p', text: "تُظهر بلديات الفئة الثالثة تذبذباً في إيراداتها الذاتية مع انخفاض حاد في عام 2022. وفي المقابل، شهدت نفقاتها تزايداً مستمراً، مع ارتفاع ملحوظ في بند الرواتب والأجور الذي يشكل البند الأكبر. اللافت للنظر هو القفزة الكبيرة في النفقات الرأسمالية عام 2022، مما قد يشير إلى تنفيذ مشاريع محددة في تلك السنة، ولكنه يسلط الضوء على الطبيعة غير المستدامة للإنفاق التنموي." },

        { type: 'h2', text: "قطاع إدارة النفايات الصلبة ومجالس الخدمات المشتركة" },
        { type: 'p', text: `تمثل إدارة النفايات الصلبة تحدياً بيئياً وخدمياً رئيسياً ومكلفاً للبلديات. وصل إجمالي النفايات المجمعة في المملكة إلى حوالي ${kingdomTotals.totalWaste.toLocaleString()} مليون طن في عام 2022. تتركز الكميات الأكبر في المحافظات ذات الكثافة السكانية العالية مثل العاصمة وإربد. يبلغ المعدل الوطني لإنتاج الفرد من النفايات حوالي ${kingdomTotals.avgWastePerCapita.toFixed(0)} كغم سنوياً، وهو مؤشر يتطلب دراسة أنماط الاستهلاك والعمل على برامج لتقليل النفايات وإعادة التدوير لخفض العبء المالي والبيئي على البلديات.` },
        { type: 'p', text: "تأسست مجالس الخدمات المشتركة كأداة لتحقيق نقلة نوعية في مفهوم الإدارة المحلية، حيث يبلغ عددها 17 مجلساً، 16 منها تشرف بشكل مباشر على مكبات النفايات، مما يجعلها الذراع التنفيذي الرئيسي لإدارة النفايات على المستوى الوطني." },

        { type: 'h2', text: "توصيات استراتيجية عاجلة لصانع القرار" },
        { type: 'p', text: "بناءً على التحليل، تم تحديد أربعة محاور رئيسية للتدخل:" },
        { type: 'list-item', text: "تعزيز الاستدامة المالية: الهدف هو بناء قدرة البلديات على تمويل خدماتها ذاتياً. ويتم ذلك عبر تنويع الإيرادات وتحسين كفاءة التحصيل، وإدارة الديون بفعالية." },
        { type: 'list-item', text: "ترشيد الإنفاق التشغيلي: الهدف هو تحرير جزء من الموازنة من النفقات الجارية وتوجيهه نحو التنمية. يتطلب ذلك إعادة هيكلة العمالة وربط التوظيف بالحاجة الفعلية ورفع الإنتاجية." },
        { type: 'list-item', text: "زيادة الإنفاق التنموي: الهدف هو ضمان استثمار جزء ثابت من الميزانية في مشاريع تخدم المستقبل. يمكن تحقيق ذلك عبر فرض حد أدنى للنفقات الرأسمالية وتفعيل الشراكة مع القطاع الخاص." },
        { type: 'list-item', text: "حوكمة ورقابة على المشاريع والعطاءات: الهدف هو تحقيق القيمة مقابل المال العام واستعادة ثقة المواطن. يتطلب ذلك إنشاء وحدة رقابة جودة مركزية، تفعيل أنظمة المناقصات الإلكترونية، ووضع قائمة سوداء للمقاولين ذوي الأداء الضعيف." },
    ];
    
    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const content = generateReportContent();
            const title = content.find(c => c.type === 'h1')?.text || "Local Administration Report";
    
            const docStyles: IStylesOptions = {
                default: {
                    document: {
                        run: { font: "Arial", size: 24, rightToLeft: true }, // 12pt
                    },
                },
                paragraphStyles: [
                    {
                        id: "Normal", name: "Normal", basedOn: "Normal", next: "Normal",
                        run: { size: 26 }, // 13pt
                        paragraph: { spacing: { after: 120, line: 360, rule: "auto" }, alignment: AlignmentType.RIGHT, bidirectional: true },
                    },
                    {
                        id: "h1", name: "Heading 1", basedOn: "Normal", next: "Normal",
                        run: { size: 40, bold: true, color: "1E3A8A" }, // 20pt
                        paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 360, after: 240 }, bidirectional: true },
                    },
                    {
                        id: "h2", name: "Heading 2", basedOn: "Normal", next: "Normal",
                        run: { size: 32, bold: true, color: "1E40AF" }, // 16pt
                        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.RIGHT, bidirectional: true },
                    },
                    {
                        id: "h3", name: "Heading 3", basedOn: "Normal", next: "Normal",
                        run: { size: 28, bold: true, color: "1D4ED8" }, // 14pt
                        paragraph: { spacing: { before: 180, after: 100 }, alignment: AlignmentType.RIGHT, bidirectional: true },
                    },
                ],
            };
    
            const paragraphs: Paragraph[] = content.map(block => {
                let style = block.type.startsWith('h') ? block.type : 'Normal';
                let bullet = block.type === 'list-item' ? { level: 0 } : undefined;
                
                return new Paragraph({
                    children: [new TextRun(block.text)],
                    style: style,
                    bullet: bullet,
                });
            });
    
            const doc = new Document({
                styles: docStyles,
                sections: [{ properties: { page: { margin: { top: 1134, right: 850, bottom: 1134, left: 850 } } }, children: paragraphs }]
            });
            
            const blob = await Packer.toBlob(doc);
            saveAs(blob, `تقرير-الإدارة-المحلية.docx`);
    
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
            const canvas = await html2canvas(input, { scale: 2 });
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

            pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, scaledImgHeight);
            heightLeft -= pageContentHeight;

            while (heightLeft > 0) {
                position -= pageContentHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position + margin, contentWidth, scaledImgHeight);
                heightLeft -= pageContentHeight;
            }
            pdf.save('report-local-administration.pdf');
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExportingPdf(false);
        }
    };

    return (
        <div className="space-y-8" id="report-content">
             <div data-html2canvas-ignore="true" className="flex justify-end items-center gap-4 mb-6 no-print">
                <button 
                    onClick={handleExportDocx} 
                    disabled={isExportingDocx}
                    className="px-4 py-2 text-sm font-medium text-black bg-amber-500 rounded-lg hover:bg-amber-600 focus:ring-4 focus:outline-none focus:ring-amber-300 disabled:bg-gray-400 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                </button>
                <button 
                    onClick={handleExportPdf} 
                    disabled={isExportingPdf}
                    className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 focus:z-10 focus:ring-4 focus:ring-gray-100 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    {isExportingPdf ? 'جاري التصدير...' : 'تصدير (PDF)'}
                </button>
            </div>
            <header>
                <h1 className="text-3xl font-bold text-gray-900">تحليل مؤشرات عامة لقطاع الإدارة المحلية</h1>
                <p className="text-lg text-gray-700 mt-1">مؤشرات الأداء المالي للبلديات وخدمات إدارة النفايات الصلبة في الأردن.</p>
            </header>
            
            <div className="space-y-8">
                {/* NEW 2024 ANALYSIS SECTION */}
                <div className="space-y-8 pt-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-100"><span className="text-2xl">🚨</span></div>
                        <div><h2 className="text-2xl font-bold text-gray-900">تحليل الأداء المالي والحوكمة للبلديات (بيانات 2024)</h2></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard title="مديونية البلديات" value="+632 مليون د.أ" icon="💸" />
                        <KpiCard title="الرواتب من إجمالي الإيرادات" value="70%" icon="💼" />
                        <KpiCard title="نسبة الإيرادات الذاتية" value="36%" icon="📉" />
                        <KpiCard title="فشل عطاءات الجودة" value="~69%" icon="❌" />
                    </div>

                    <Card>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">تحديات هيكلية في المالية والحوكمة</h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p><strong>عبء مالي خانق:</strong> كشف إيجاز وزارة الإدارة المحلية عن أزمة مالية عميقة، حيث تستهلك الرواتب وحدها 70% من إجمالي إيرادات البلديات، وتتجاوز قيمة التحويلات الحكومية بنسبة 113%. هذا يعني أن الدعم الحكومي يذهب بالكامل للرواتب ولا يتبقى أي فائض للمشاريع التنموية أو تحسين الخدمات. يتفاقم هذا الوضع مع وصول إجمالي ديون البلديات إلى أكثر من 632 مليون دينار.</p>
                            <p><strong>ضعف الاعتماد على الذات:</strong> تشكل الإيرادات الذاتية 36% فقط من إجمالي الإيرادات البالغ 340 مليون دينار، مما يعكس اعتماداً كبيراً وخطيراً على الموازنة العامة ويجعل البلديات عرضة لأي تقلبات في الدعم الحكومي.</p>
                            <p><strong>أزمة حوكمة وجودة:</strong> كشفت فحوصات الجودة العشوائية عن خلل كبير في إدارة المشاريع، حيث فشلت 11 عينة من أصل 16 (أي 69%) في تحقيق المواصفات المطلوبة، بقيمة إجمالية تزيد عن 8.1 مليون دينار. هذا لا يمثل هدراً مالياً فادحاً فحسب، بل يشير إلى ضعف في آليات الرقابة والإشراف على تنفيذ العطاءات، مما يؤثر سلباً على جودة البنية التحتية والخدمات المقدمة للمواطنين.</p>
                        </div>
                    </Card>
                </div>

                {/* HISTORICAL 2018-2022 ANALYSIS SECTION */}
                 <div className="space-y-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-indigo-100"><span className="text-2xl">🏛️</span></div>
                        <div><h2 className="text-2xl font-bold text-gray-900">تحليل الأداء المالي للبلديات (2018-2022)</h2></div>
                    </div>
                    <Card className="card-container">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">أولاً: بلديات الفئة الأولى: استقلالية مالية أفضل</h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p><strong>الإيرادات:</strong> ارتفع إجمالي الإيرادات (قبل الدعم) بشكل طفيف ليصل إلى 100.04 مليون دينار في 2022. تشكل الإيرادات الذاتية التشغيلية المكون الأكبر (93.4 مليون دينار)، بينما انخفضت نسبة الدعم الحكومي إلى 25.8%، مما يعكس اعتماداً أقل على الخزينة.</p>
                            <p><strong>النفقات:</strong> ارتفعت النفقات الكلية إلى 149.5 مليون دينار في 2022. النفقات التشغيلية (الجارية) هي المهيمنة، حيث بلغت 96.1 مليون دينار، معظمها رواتب وأجور، مما يضغط على مرونة الموازنات. في المقابل، نسبة النفقات الرأسمالية (التنموية) منخفضة جداً عند 10.6% فقط، مما يضعف القدرة على تطوير الخدمات والبنية التحتية.</p>
                        </div>
                         <h4 className="text-lg font-semibold text-center text-gray-800 my-6">الأداء التشغيلي لبلديات الفئة الأولى (2022) - (مليون دينار)</h4>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={OPERATIONAL_PERFORMANCE_CAT1_2022} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#333333' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#333333' }} />
                                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)} مليون د.أ`, value > 0 ? 'فائض' : 'عجز']} />
                                    <Bar dataKey="value" name="الوفر/العجز التشغيلي">
                                        <LabelList dataKey="value" position="top" formatter={(value: number) => value.toFixed(2)} style={{ fill: '#1f2937', fontSize: '12px', fontWeight: 'bold' }} />
                                        {OPERATIONAL_PERFORMANCE_CAT1_2022.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                    <Card className="card-container">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">ثانياً: بلديات الفئة الثانية: تحديات هيكلية</h3>
                         <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p><strong>الإيرادات:</strong> تعتمد هذه البلديات بشكل كبير جداً على الدعم الحكومي الذي بلغ 7.5 مليون دينار في 2022، مما يجعل استقلاليتها المالية محدودة للغاية وعرضة لتقلبات الموازنة العامة.</p>
                            <p><strong>النفقات:</strong> النفقات الإدارية والعمومية مرتفعة (تصل إلى 38.4% من الإجمالي)، كما أن النفقات الرأسمالية منخفضة جداً (12-13%). الأخطر من ذلك هو أن الرواتب والأجور تستهلك حوالي 70% من النفقات الإدارية و 60-65% من إجمالي النفقات، مما يعني أن معظم الميزانيات تذهب لتغطية أعباء الموظفين على حساب المشاريع والخدمات.</p>
                        </div>
                    </Card>

                     <Card className="card-container">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">ثالثاً: بلديات الفئة الثالثة - تحديات السيولة والإنفاق التنموي</h3>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                             <p>تُظهر بلديات الفئة الثالثة تذبذباً في إيراداتها الذاتية مع انخفاض حاد في عام 2022. وفي المقابل، شهدت نفقاتها تزايداً مستمراً، مع ارتفاع ملحوظ في بند الرواتب والأجور الذي يشكل البند الأكبر. اللافت للنظر هو القفزة الكبيرة في النفقات الرأسمالية عام 2022، مما قد يشير إلى تنفيذ مشاريع محددة في تلك السنة، ولكنه يسلط الضوء على الطبيعة غير المستدامة للإنفاق التنموي.</p>
                        </div>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                            <div>
                                <h4 className="text-lg font-semibold text-center text-gray-800 mb-4">تكوين إيرادات الفئة الثالثة (دينار)</h4>
                                <div style={{width: '100%', height: 300}}>
                                    <ResponsiveContainer>
                                        <BarChart data={CAT3_REVENUE_DATA_CHART} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#333333' }} />
                                            <YAxis tickFormatter={(val) => `${(val / 1_000_000).toFixed(1)}م`} tick={{ fontSize: 12, fill: '#333333' }} />
                                            <Tooltip formatter={(val: number) => [val.toLocaleString(), 'دينار']} />
                                            <Legend />
                                            <Bar dataKey="إيرادات تشغيلية" stackId="a" fill="#3b82f6" />
                                            <Bar dataKey="مساهمات وهبات" stackId="a" fill="#10b981" />
                                            <Bar dataKey="إيرادات رأسمالية" stackId="a" fill="#f97316" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                             <div>
                                <h4 className="text-lg font-semibold text-center text-gray-800 mb-4">تكوين نفقات الفئة الثالثة (دينار)</h4>
                                <div style={{width: '100%', height: 300}}>
                                     <ResponsiveContainer>
                                        <BarChart data={CAT3_EXPENDITURE_DATA_CHART} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#333333' }} />
                                            <YAxis tickFormatter={(val) => `${(val / 1_000_000).toFixed(1)}م`} tick={{ fontSize: 12, fill: '#333333' }} />
                                            <Tooltip formatter={(val: number) => [val.toLocaleString(), 'دينار']} />
                                            <Legend />
                                            <Bar dataKey="رواتب وأجور" stackId="a" fill="#ef4444" />
                                            <Bar dataKey="نفقات رأسمالية" stackId="a" fill="#a855f7" />
                                            <Bar dataKey="نفقات أخرى" stackId="a" fill="#8b5cf6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Existing Solid Waste Section */}
            <div className="space-y-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-emerald-100"><span className="text-2xl">♻️</span></div>
                    <div><h2 className="text-2xl font-bold text-gray-900">إدارة النفايات الصلبة ومجالس الخدمات المشتركة</h2></div>
                </div>
                <Card>
                    <p className="text-lg text-gray-700 mb-6">
                        تمثل إدارة النفايات الصلبة تحدياً بيئياً وخدمياً رئيسياً. البيانات لعام 2022 تظهر أن المحافظات ذات الكثافة السكانية العالية، مثل العاصمة وإربد، هي الأكثر إنتاجاً للنفايات. المعدل الوطني لإنتاج الفرد من النفايات يعطي مؤشراً على أنماط الاستهلاك. 
                    </p>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="flex flex-col justify-center items-center bg-green-50">
                        <h3 className="text-lg font-semibold text-gray-800">إجمالي النفايات المجمعة (2022)</h3>
                        <p className="text-5xl font-bold text-green-600 my-2">{Math.round(kingdomTotals.totalWaste).toLocaleString()}</p>
                        <p className="text-base text-gray-600">طن سنوياً</p>
                    </Card>
                    <Card className="flex flex-col justify-center items-center bg-green-50">
                        <h3 className="text-lg font-semibold text-gray-800">المعدل الوطني لإنتاج الفرد للنفايات</h3>
                        <p className="text-5xl font-bold text-green-600 my-2">{kingdomTotals.avgWastePerCapita.toFixed(1)}</p>
                        <p className="text-base text-gray-600">كغم / فرد / سنة</p>
                    </Card>
                </div>
                <Card>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">كمية النفايات الصلبة المجمعة حسب المحافظة (طن - 2022)</h3>
                    <SolidWasteChart data={latestData} />
                </Card>
                 <Card>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">مجالس الخدمات المشتركة في الأردن</h3>
                    <div className="space-y-4 text-gray-700">
                        <p>تأسست مجالس الخدمات المشتركة وفقاً لنظام عام 1983 (المعدل بالنظام رقم 14 لسنة 2006)، بهدف إيجاد نقلة نوعية لمفهوم الإدارة المحلية وتنسيق الجهود بين البلديات. يبلغ عدد هذه المجالس 17 مجلساً، ويُشرف 16 منها بشكل مباشر على مكبّات النفايات، مما يجعلها الذراع التنفيذي الرئيسي لإدارة النفايات على المستوى الوطني.</p>
                        <h4 className="font-semibold pt-2">قائمة بأسماء مجالس الخدمات المشتركة:</h4>
                        <ol className="list-decimal list-inside columns-2 gap-x-8">
                            <li>مجلس خدمات محافظة إربد</li>
                            <li>مجلس خدمات محافظة المفرق</li>
                            <li>مجلس خدمات لواء البادية الشمالية</li>
                            <li>مجلس خدمات محافظة عجلون</li>
                            <li>مجلس خدمات محافظة الزرقاء</li>
                            <li>مجلس خدمات محافظة البلقاء</li>
                            <li>مجلس خدمات أغوار الوسطى</li>
                            <li>مجلس خدمات محافظة مادبا</li>
                            <li>مجلس خدمات لواء ذيبان</li>
                            <li>مجلس خدمات مادبا ومأعين ومليح وحسبان</li>
                            <li>مجلس خدمات محافظة الكرك</li>
                            <li>مجلس خدمات لواء الأغوار الجنوبية</li>
                            <li>مجلس خدمات محافظة الطفيلة</li>
                            <li>مجلس خدمات محافظة معان</li>
                            <li>مجلس خدمات البتراء</li>
                            <li>مجلس خدمات أغوار الوسطى</li>
                            <li>مجلس خدمات لواء القويرة</li>
                        </ol>
                    </div>
                </Card>
            </div>
             <div className="pt-8 mt-8 border-t border-gray-300">
                <Card className="card-container bg-amber-50 border-amber-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">توصيات استراتيجية عاجلة لصانع القرار</h3>
                     <div className="space-y-6 text-gray-800">
                        <div>
                            <h4 className="font-semibold text-lg">1. تعزيز الاستدامة المالية</h4>
                            <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                                <li><strong>تنويع الإيرادات:</strong> تحسين كفاءة تحصيل الضرائب والرسوم، وتفعيل دور البلديات كمستثمر ومطور للمشاريع الصغيرة.</li>
                                <li><strong>إدارة الديون:</strong> وضع خطة عمل واضحة لتحصيل الديون المستحقة للبلديات (55 مليون دينار)، وفي نفس الوقت إعادة هيكلة ديونها طويلة الأجل بالتعاون مع بنك تنمية المدن والقرى.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">2. ترشيد الإنفاق التشغيلي</h4>
                             <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                                <li><strong>إعادة هيكلة العمالة:</strong> ربط التوظيف بالحاجة الفعلية ورفع الإنتاجية، مع تطبيق أنظمة تقييم أداء وربط الحوافز بالإنتاج.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">3. زيادة الإنفاق التنموي</h4>
                             <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                                <li><strong>فرض حد أدنى للنفقات الرأسمالية:</strong> إلزام البلديات بتخصيص نسبة لا تقل عن 20% من موازنتها للمشاريع التنموية.</li>
                                <li><strong>تفعيل الشراكة مع القطاع الخاص (PPP):</strong> لتمويل مشاريع البنية التحتية الكبرى.</li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold text-lg">4. حوكمة ورقابة على المشاريع والعطاءات</h4>
                             <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                                <li><strong>إنشاء وحدة رقابة جودة مركزية:</strong> تكون مستقلة ومسؤولة عن فحص عطاءات البلديات قبل وبعد التنفيذ لضمان مطابقتها للمواصفات.</li>
                                <li><strong>تفعيل أنظمة المناقصات الإلكترونية (e-tendering):</strong> لزيادة الشفافية، تقليل الأخطاء، وتسهيل الرقابة.</li>
                                <li><strong>وضع "قائمة سوداء" للمقاولين:</strong> منع المقاولين ذوي الأداء الضعيف من المشاركة في العطاءات المستقبلية لضمان جودة التنفيذ.</li>
                            </ul>
                        </div>
                     </div>
                </Card>
            </div>
        </div>
    );
};

export default LocalAdministration;
