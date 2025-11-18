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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ContentBlock = { type: 'h1' | 'h2' | 'h3' | 'p' | 'list-item'; text: string; };

const Water: React.FC = () => {
    const [selectedGov, setSelectedGov] = useState('Amman');
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    
    const selectedGovTrendData = WATER_DATA.find(g => g.name === selectedGov)?.data;
    
    const kingdomAverages = {
        waterSource: WATER_SOURCES_DATA.find(d => d.name === 'Kingdom'),
        waterShortage: WATER_SHORTAGE_DATA.find(d => d.name === 'Kingdom'),
        sanitation: SANITATION_DATA.find(d => d.name === 'Kingdom'),
    };

    const governorateData = useMemo(() => {
        return WATER_SOURCES_DATA.filter(d => d.name !== 'Kingdom').map(d => ({
            name: d.name,
            name_ar: d.name_ar,
        }));
    }, []);

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "تحليلات قطاع المياه والصرف الصحي";
            const content: ContentBlock[] = [
                { type: 'h1', text: title },
                { type: 'p', text: "نظرة على مصادر المياه، تحديات النقص، والبنية التحتية للصرف الصحي في الأردن." },
                { type: 'h2', text: "الأمن المائي: التحدي الأكبر" },
                { type: 'p', text: "يُصنف الأردن كواحد من أفقر دول العالم مائياً، مما يجعل إدارة الموارد المائية تحدياً استراتيجياً بالغ الأهمية. تظهر البيانات اعتماداً كبيراً على الصهاريج كمصدر مياه رئيسي للأسر، مما يعكس الضغط على الشبكة العامة. كما أن تغطية شبكة الصرف الصحي لا تزال دون المستوى المأمول في العديد من المحافظات، مما يزيد من الأعباء البيئية والصحية. لقد فاقمت أزمة اللجوء السوري من حدة هذا التحدي، بالإضافة إلى التأثيرات المتزايدة للتغير المناخي." },

                { type: 'h2', text: 'تطور الموارد المائية الكلية (2019-2024)' },
                { type: 'list-item', text: 'تراجع حاد: انخفض إجمالي الموارد المائية بنسبة 15.4% بين ذروتها عام 2020 (1,286.240 مليون م³) وعام 2024 (1,088.240 مليون م³).' },
                { type: 'list-item', text: 'ثبات المصدر غير المتجدد: بقيت كمية المياه الجوفية شبه ثابتة، مما يؤكد أنها مصدر غير متجدد يتم استنزافه.' },
                { type: 'list-item', text: 'تذبذب المصادر السطحية: شهدت المياه السطحية المحلية تقلبات حادة، حيث انخفضت من 534.920 مليون م³ عام 2020 إلى 321.810 مليون م³ عام 2024 (انخفاض بنسبة 39.8%)، مما يعكس تأثير التغير في كميات هطول الأمطار.' },
                { type: 'list-item', text: 'تراجع الحصة الإقليمية: انخفاض مطرد في المياه السطحية الإقليمية (من 139.810 إلى 132.000 مليون م³).' },
                { type: 'list-item', text: 'النمو الوحيد: ارتفاع مطرد في استخدام المياه غير التقليدية (المعالجة) بنسبة 17% من 2019 إلى 2024.' },
    
                { type: 'h2', text: 'تحليل استخدام المياه الجوفية حسب القطاع والموقع' },
                { type: 'p', text: 'يُعد حوض عمان-الزرقاء هو نقطة الارتكاز والضغط الأكبر، بينما يبقى القطاع الزراعي المستهلك الأضخم للمياه الجوفية.' },
                { type: 'h3', text: 'الاستهلاك الزراعي' },
                { type: 'list-item', text: 'الهيمنة: القطاع الزراعي يستهلك أكبر حجم من المياه الجوفية، حيث بلغت الكمية 2,378.0 مليون م3 في 2024.' },
                { type: 'list-item', text: 'الضغط الإقليمي: حوض عمان-الزرقاء هو الحوض الأكثر استنزافاً زراعياً 631.0 مليون م3 مما يهدد استدامة التجمعات السكانية والصناعية التي تعتمد عليه.' },
                { type: 'h3', text: 'الاستهلاك الحضري والصناعي' },
                { type: 'list-item', text: 'البلديات: ارتفع استهلاك البلديات بشكل ثابت إلى 844.0 مليون م3 في 2024، مع التركيز على حوض عمان-الزرقاء (408.2 مليون م3)، نتيجة النمو السكاني.' },
                { type: 'list-item', text: 'الصناعة: الاستهلاك الصناعي مستقر نسبياً (198.00 مليون م3 في 2024)، ويتصدر حوض عمان-الزرقاء أيضاً هذا الاستهلاك.' },
                { type: 'h3', text: 'الاستخدامات المتنامية' },
                { type: 'list-item', text: 'الثروة الحيوانية: شهدت زيادة في الاستهلاك من 42.00 مليون م3 (2019) إلى 74.00 مليون م3 (2024).' },
                { type: 'list-item', text: 'السياحة: ارتفع الاستهلاك السياحي بشكل كبير، مع تركيز في حوض البحر الميت، مما يتطلب تقنيناً لحماية البيئة الحساسة لهذه المناطق.' },
                
                { type: 'h2', text: 'تباين حصة الفرد من المياه على مستوى المحافظات (لتر/يوم)' },
                { type: 'h3', text: 'اتجاهات التزويد المائي' },
                { type: 'p', text: 'التزويد الكلي للمملكة زاد من 474.23 مليون م3 في 2019 إلى 530.40 مليون م3 في 2023، لكن التوزيع يظهر تركيزاً وتباينات:' },
                { type: 'list-item', text: 'التركيز الحضري: العاصمة تسجل أعلى تزويد (221.30 مليون م3 في 2023)، مما يوضح الضغط السكاني والاقتصادي فيها.' },
                { type: 'list-item', text: 'النمو السريع: العقبة شهدت نمواً سريعاً جداً في التزويد (من 13.29 مليون م3 في 2019 إلى 25.10 مليون م3 في 2023)، وهو ما يترافق مع المشاريع التنموية والنمو السياحي.' },
                { type: 'h3', text: 'الفقر المائي وعدالة التوزيع' },
                { type: 'list-item', text: 'أزمة الفقر المائي: تُظهر معظم المحافظات حصة فرد أقل بكثير من خط الفقر المائي المطلق (500 م 3/سنة/فرد)، مما يؤكد أن المملكة تعاني من إجهاد مائي حاد.' },
                { type: 'list-item', text: 'تفاوت حاد: هناك تباين صارخ بين المحافظات. ففي عام 2023:' },
                { type: 'list-item', text: '   • جرش وعجلون تسجلان أدنى حصص (حوالي 85 م3/سنة/فرد).' },
                { type: 'list-item', text: '   • العقبة تسجل أعلى حصة (302.9 م 3/سنة/فرد).' },
    
                { type: 'h2', text: 'واقع المياه المعالجة' },
                { type: 'list-item', text: 'كمية محدودة: بلغت كمية المياه العادمة المعالجة والمستخدمة 195.15 مليون م³ عام 2024.' },
                { type: 'list-item', text: 'نسبة ضئيلة: تشكل هذه الكمية حوالي 17.9% فقط من إجمالي الموارد المائية لعام 2024 (1,088.240 مليون م³)، مما يشير إلى وجود هامش كبير لزيادة الاعتماد على هذا المصدر.' },
    
                { type: 'h2', text: 'الخلاصة والتحديات المستخلصة رقميًا' },
                { type: 'list-item', text: '1. تراجع شامل في الموارد المائية الكلية: انخفاض إجمالي الإمدادات المائية بأكثر من 15% في 4 سنوات.' },
                { type: 'list-item', text: '2. استنزاف متسارع للمياه الجوفية: زيادة السحب الجوفي للزراعة بمقدار 27.6 مليون م³ منذ 2019، بينما الكمية المتاحة ثابتة (مستنفدة).' },
                { type: 'list-item', text: '3. أزمة توزيع جغرافي: تفاوت كبير وغير عادل في حصة الفرد بين المحافظات، مع اتجاه سلبي في محافظات مكتظة بالسكان مثل إربد والزرقاء.' },
                { type: 'list-item', text: '4. اعتماد شبه كامل على المصادر الطبيعية المتقلبة: الاعتماد على الأمطار والمياه الجوفية غير المتجددة يشكل خطرًا مع تزايد التغيرات المناخية.' },
                { type: 'list-item', text: '5. هدر للفرص في المياه المعالجة: لا يتم تعظيم استخدام المياه غير التقليدية التي تشكل المصدر الوحيد المتزايد باستمرار.' },
    
                { type: 'h2', text: 'التوصيات الاستراتيجية' },
                { type: 'p', text: 'لضمان الاستدامة والأمن المائي للمملكة، يوصى باتخاذ الإجراءات التالية:' },
                { type: 'h3', text: '1. التحول نحو الاستدامة الجوفية:' },
                { type: 'list-item', text: 'تخفيض استخراج المياه الجوفية فوراً، خاصة في حوض عمان-الزرقاء، ليتوافق مع معدلات التغذية الحقيقية المعلنة.' },
                { type: 'list-item', text: 'تنفيذ مشاريع التحلية الكبرى (مثل مشروع الناقل الوطني) لتعويض النقص في مياه الشرب وتقليل الاعتماد على المياه الجوفية بشكل جذري.' },
                { type: 'h3', text: '2. إدارة الطلب الزراعي والري:' },
                { type: 'list-item', text: 'فرض تقنين صارم على استخدام المياه الجوفية في الزراعة، وتقديم حوافز للمزارعين لاستخدام تقنيات الري الحديثة والموفرة للمياه.' },
                { type: 'list-item', text: 'تغيير الأنماط الزراعية نحو المحاصيل ذات الاحتياجات المائية المنخفضة أو التوجه نحو الزراعة ذات القيمة المضافة العالية التي تبرر الاستهلاك المائي.' },
                { type: 'h3', text: '3. تعظيم المياه غير التقليدية:' },
                { type: 'list-item', text: 'التوسع في معالجة مياه الصرف الصحي وتحديث محطات المعالجة لإنتاج مياه ذات جودة أعلى للاستخدامات الصناعية والزراعية المقيدة.' },
                { type: 'list-item', text: 'زيادة استخدام المياه المعالجة في القطاعات الأخرى غير الزراعية (مثل التبريد الصناعي أو أغراض البلدية غير الشرب) لتوفير المزيد من المياه العذبة.' },
                { type: 'h3', text: '4. تحسين عدالة التوزيع والبنية التحتية:' },
                { type: 'list-item', text: 'الاستثمار في صيانة شبكات التزويد لتقليل نسبة فاقد المياه غير المحقق (التي تقدر بعشرات الملايين من الأمتار المكعبة سنوياً).' },
                { type: 'list-item', text: 'تخصيص الموارد الإضافية للمحافظات الأقل حصة (مثل جرش وعجلون) لضمان تلبية احتياجات المواطنين الأساسية.' },
            ];

            const docStyles: IStylesOptions = {
                default: {
                    document: {
                        run: { font: "Arial", size: 26, rightToLeft: true }, // 13pt
                    },
                },
                paragraphStyles: [
                    { id: "Normal", name: "Normal", basedOn: "Normal", next: "Normal", run: { size: 26 }, paragraph: { spacing: { after: 120, line: 360, rule: "auto" } } }, // 13pt, 1.5 line spacing
                    { id: "h1", name: "h1", basedOn: "Normal", next: "Normal", run: { size: 40, bold: true, color: "1E3A8A" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 360, after: 240 } } }, // 20pt
                    { id: "h2", name: "h2", basedOn: "Normal", next: "Normal", run: { size: 32, bold: true, color: "1E40AF" }, paragraph: { spacing: { before: 240, after: 120 } } }, // 16pt
                    { id: "h3", name: "h3", basedOn: "Normal", next: "Normal", run: { size: 28, bold: true, color: "1D4ED8" }, paragraph: { spacing: { before: 180, after: 100 } } }, // 14pt
                ],
            };

            const paragraphs: Paragraph[] = [];
            content.forEach((block, index) => {
                let style = "Normal";
                let bullet = undefined;
                if (block.type.startsWith('h')) style = block.type;
                if (block.type === 'list-item') bullet = { level: 0 };
                
                paragraphs.push(new Paragraph({
                    children: [new TextRun(block.text)],
                    style: style,
                    bullet: bullet,
                    bidirectional: true,
                    alignment: (block.type === 'h1' && index === 0) ? AlignmentType.CENTER : AlignmentType.RIGHT,
                }));
            });

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
            const canvas = await html2canvas(input, { scale: 2 });
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
            let position = 0;

            pdf.addImage(imgData, 'PNG', leftMargin, topMargin, contentWidth, scaledImgHeight);
            heightLeft -= pageContentHeight;

            while (heightLeft > 0) {
                position -= pageContentHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', leftMargin, position + topMargin, contentWidth, scaledImgHeight);
                heightLeft -= pageContentHeight;
            }
            
            pdf.save('report-water.pdf');
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                </button>
                <button 
                    onClick={handleExportPdf} 
                    disabled={isExportingPdf}
                    className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-slate-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {isExportingPdf ? 'جاري التصدير...' : 'تصدير (PDF)'}
                </button>
            </div>
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تحليلات قطاع المياه والصرف الصحي</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                    نظرة على مصادر المياه، تحديات النقص، والبنية التحتية للصرف الصحي في الأردن.
                </p>
            </header>

            <Card className="card-container">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">الأمن المائي: التحدي الأكبر</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                    يُصنف الأردن كواحد من أفقر دول العالم مائياً، مما يجعل إدارة الموارد المائية تحدياً استراتيجياً بالغ الأهمية. تظهر البيانات اعتماداً كبيراً على الصهاريج كمصدر مياه رئيسي للأسر، مما يعكس الضغط على الشبكة العامة. كما أن تغطية شبكة الصرف الصحي لا تزال دون المستوى المأمول في العديد من المحافظات، مما يزيد من الأعباء البيئية والصحية. لقد فاقمت أزمة اللجوء السوري من حدة هذا التحدي، بالإضافة إلى التأثيرات المتزايدة للتغير المناخي.
                </p>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <Card className="card-container flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">تغطية شبكة المياه العامة</h3>
                    <p className="text-5xl font-bold text-sky-500 my-2">{kingdomAverages.waterSource?.public_network.toFixed(1)}%</p>
                    <p className="text-base text-gray-400">متوسط الأسر المتصلة</p>
                </Card>
                <Card className="card-container flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">تغطية الصرف الصحي</h3>
                    <p className="text-5xl font-bold text-sky-500 my-2">{kingdomAverages.sanitation?.public_network.toFixed(1)}%</p>
                    <p className="text-base text-gray-400">متوسط الأسر المتصلة</p>
                </Card>
                <Card className="card-container flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">أسر لا تواجه نقصاً بالمياه</h3>
                    <p className="text-5xl font-bold text-sky-500 my-2">{kingdomAverages.waterShortage?.no_shortage.toFixed(1)}%</p>
                    <p className="text-base text-gray-400">من المتصلين بالشبكة</p>
                </Card>
            </div>

            <Card className="card-container">
                 <div className="flex justify-between items-center mb-4 no-print">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">اتجاه حصة الفرد من المياه (2020-2023)</h3>
                    <select
                        value={selectedGov}
                        onChange={(e) => setSelectedGov(e.target.value)}
                        className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
                    >
                        {governorateData.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                    </select>
                </div>
                {selectedGovTrendData && <WaterTrendChart data={selectedGovTrendData} />}
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="card-container">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">المصدر الرئيسي لمياه الشرب (%)</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-center text-sm">
                        يُظهر هذا الرسم البياني التوزيع النسبي للمصادر التي تعتمد عليها الأسر في الحصول على مياه الشرب. يُلاحظ الاعتماد الكبير على الصهاريج والمياه المعبأة في معظم المحافظات، مما يعكس الضغط على الشبكات العامة.
                    </p>
                     <div style={{ width: '100%', height: 450 }}>
                        <ResponsiveContainer>
                            <BarChart 
                                data={WATER_SOURCES_DATA.filter(d => d.name !== 'Kingdom')} 
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis type="category" dataKey="name_ar" width={80} tick={{ fontSize: 12, fill: '#374151' }} />
                                <Tooltip 
                                    formatter={(value: number) => `${value.toFixed(1)}%`} 
                                    contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem', color: '#fff' }} 
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', position: 'bottom' }} />
                                <Bar dataKey="public_network" name="شبكة عامة" stackId="a" fill="#3b82f6" />
                                <Bar dataKey="tanker" name="صهريج" stackId="a" fill="#f97316" />
                                <Bar dataKey="mineral_water" name="مياه معبأة" stackId="a" fill="#10b981" />
                                <Bar dataKey="rainwater" name="آبار جمع" stackId="a" fill="#0ea5e9" />
                                <Bar dataKey="spring" name="ينابيع" stackId="a" fill="#84cc16" />
                                <Bar dataKey="artesian_well" name="آبار ارتوازية" stackId="a" fill="#a855f7" />
                                <Bar dataKey="other" name="أخرى" stackId="a" fill="#6b7280" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                 <Card className="card-container">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">طريقة التخلص من المياه العادمة (%)</h3>
                     <p className="text-gray-600 dark:text-gray-400 mb-4 text-center text-sm">
                        يوضح هذا الرسم البياني نسبة تغطية خدمات الصرف الصحي. تظهر فجوة واضحة بين المحافظات المركزية مثل العاصمة والعقبة التي تتمتع بتغطية عالية، والمحافظات الطرفية التي لا تزال تعتمد بشكل كبير على الحفر الامتصاصية.
                    </p>
                     <div style={{ width: '100%', height: 450 }}>
                        <ResponsiveContainer>
                             <BarChart 
                                data={SANITATION_DATA.filter(d => d.name !== 'Kingdom')} 
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis type="category" dataKey="name_ar" width={80} tick={{ fontSize: 12, fill: '#374151' }} />
                                <Tooltip 
                                    formatter={(value: number) => `${value.toFixed(1)}%`} 
                                    contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem', color: '#fff' }} 
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', position: 'bottom' }} />
                                <Bar dataKey="public_network" name="شبكة عامة" stackId="a" fill="#22c55e" />
                                <Bar dataKey="cesspit" name="حفرة امتصاصية" stackId="a" fill="#eab308" />
                                <Bar dataKey="no_sanitation" name="لا يوجد" stackId="a" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
            
            <Card className="card-container bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">الخلاصة والتوصيات الاستراتيجية</h2>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">الخلاصة والتحديات المستخلصة رقميًا:</h3>
                    <ol className="list-decimal list-outside mr-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>تراجع شامل في الموارد المائية الكلية: انخفاض إجمالي الإمدادات المائية بأكثر من 15% في 4 سنوات.</li>
                        <li>استنزاف متسارع للمياه الجوفية: زيادة السحب الجوفي للزراعة بمقدار 27.6 مليون م³ منذ 2019، بينما الكمية المتاحة ثابتة (مستنفدة).</li>
                        <li>أزمة توزيع جغرافي: تفاوت كبير وغير عادل في حصة الفرد بين المحافظات، مع اتجاه سلبي في محافظات مكتظة بالسكان مثل إربد والزرقاء.</li>
                        <li>اعتماد شبه كامل على المصادر الطبيعية المتقلبة: الاعتماد على الأمطار والمياه الجوفية غير المتجددة يشكل خطرًا مع تزايد التغيرات المناخية.</li>
                        <li>هدر للفرص في المياه المعالجة: لا يتم تعظيم استخدام المياه غير التقليدية التي تشكل المصدر الوحيد المتزايد باستمرار.</li>
                    </ol>
                </div>
                 <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">التوصيات:</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">لضمان الاستدامة والأمن المائي للمملكة، يوصى باتخاذ الإجراءات التالية:</p>
                    <ol className="list-decimal list-outside mr-6 space-y-4 text-gray-700 dark:text-gray-300">
                        <li>
                            <strong>التحول نحو الاستدامة الجوفية:</strong>
                            <ul className="list-disc list-outside mr-6 space-y-1 mt-1">
                                <li>تخفيض استخراج المياه الجوفية فوراً، خاصة في حوض عمان-الزرقاء، ليتوافق مع معدلات التغذية الحقيقية المعلنة.</li>
                                <li>تنفيذ مشاريع التحلية الكبرى (مثل مشروع الناقل الوطني) لتعويض النقص في مياه الشرب وتقليل الاعتماد على المياه الجوفية بشكل جذري.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>إدارة الطلب الزراعي والري:</strong>
                            <ul className="list-disc list-outside mr-6 space-y-1 mt-1">
                                <li>فرض تقنين صارم على استخدام المياه الجوفية في الزراعة، وتقديم حوافز للمزارعين لاستخدام تقنيات الري الحديثة والموفرة للمياه.</li>
                                <li>تغيير الأنماط الزراعية نحو المحاصيل ذات الاحتياجات المائية المنخفضة أو التوجه نحو الزراعة ذات القيمة المضافة العالية التي تبرر الاستهلاك المائي.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>تعظيم المياه غير التقليدية:</strong>
                            <ul className="list-disc list-outside mr-6 space-y-1 mt-1">
                                <li>التوسع في معالجة مياه الصرف الصحي وتحديث محطات المعالجة لإنتاج مياه ذات جودة أعلى للاستخدامات الصناعية والزراعية المقيدة.</li>
                                <li>زيادة استخدام المياه المعالجة في القطاعات الأخرى غير الزراعية (مثل التبريد الصناعي أو أغراض البلدية غير الشرب) لتوفير المزيد من المياه العذبة.</li>
                            </ul>
                        </li>
                         <li>
                            <strong>تحسين عدالة التوزيع والبنية التحتية:</strong>
                             <ul className="list-disc list-outside mr-6 space-y-1 mt-1">
                                <li>الاستثمار في صيانة شبكات التزويد لتقليل نسبة فاقد المياه غير المحقق (التي تقدر بعشرات الملايين من الأمتار المكعبة سنوياً).</li>
                                <li>تخصيص الموارد الإضافية للمحافظات الأقل حصة (مثل جرش وعجلون) لضمان تلبية احتياجات المواطنين الأساسية.</li>
                            </ul>
                        </li>
                    </ol>
                </div>
            </Card>

        </div>
    );
};

export default Water;
