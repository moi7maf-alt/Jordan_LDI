import React, { useMemo, useState } from 'react';
import Card from './ui/Card';
import { INCOME_DATA } from '../constants/incomeData';
import { GOVERNORATES_DATA } from '../constants';
import IncomeSourceBreakdownChart from './charts/IncomeSourceBreakdownChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { GOVERNORATE_COLORS } from '../constants/colors';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, IStylesOptions } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ContentBlock = { type: 'h1' | 'h2' | 'h3' | 'p' | 'list-item'; text: string; };

const Income: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
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
            const title = "تحليلات دخل الأسرة";
            const content: ContentBlock[] = [
                { type: 'h1', text: title },
                { type: 'p', text: "نظرة على متوسط دخل الأفراد السنوي ومصادره في محافظات المملكة." },
                { type: 'h2', text: "تحليل دخل الأسرة ومصادره" },
                { type: 'p', text: "يكشف تحليل دخل الأسر عن تباينات جغرافية واضحة، حيث يرتفع متوسط الدخل في المناطق الحضرية مقارنة بالريف، وتتصدر العاصمة والكرك والبلقاء قائمة المحافظات الأعلى دخلاً. المصدر الرئيسي للدخل هو \"الاستخدام\" (الرواتب والأجور)، يليه \"التحويلات\"، مما يسلط الضوء على أهمية الوظائف المنتظمة والشبكات الاجتماعية في دعم مستوى المعيشة. لا شك أن التباطؤ الاقتصادي الذي رافق جائحة كورونا في 2020-2021 أثر سلباً على دخول الأسر، خاصة تلك التي تعتمد على العمل الخاص والقطاعات غير المنظمة." },
                { type: 'h2', text: "تقرير تحليلي: الدخل الجاري والإنفاق الأسري حسب المحافظات (2008-2017)" },
                { type: 'p', text: "يركز هذا التحليل على تفكيك البيانات المتاحة حسب المحافظات، مع التركيز على الاتجاهات المالية الرئيسية لعام 2017." },
                { type: 'h3', text: "1. محافظة عمان" },
                { type: 'p', text: "تُعتبر محافظة عمان القاطرة الاقتصادية, حيث سجلت أعلى الأرقام في كل من الدخل والإنفاق. بلغ متوسط الدخل الأسري السنوي فيها 11,718.8 دينار في عام 2017, مسجلاً ارتفاعاً ملحوظاً عن مستواه في عام 2008 (9,199.8 دينار). على صعيد التوزيع, يُظهر دخل الذكور ارتفاعاً كبيراً جداً ليصل إلى 12,825.8 دينار, في حين أن متوسط دخل الإناث منخفض للغاية عند 1,107.0 دينار, مما يخلق الفجوة الأكبر بين الجنسين في متوسط الدخل. في المقابل, سجلت عمان أعلى إجمالي إنفاق أسري سنوي بـ 11,944.6 دينار, وتركز الإنفاق فيها على السلع (7,456.3 دينار) والخدمات (4,488.3 دينار), وهي الأعلى بين المحافظات في مجموعات الإنفاق الرئيسية كالطعام, والمسكن, والنقل. كما أن دخلها من مصادر مثل \"الاستخدام\" و\"القاطنين لحسابهم الخاص\" هو الأعلى على مستوى المملكة." },
                { type: 'h3', text: "2. محافظة إربد" },
                { type: 'p', text: "شهدت إربد نمواً في متوسط الدخل الأسري السنوي من 7,080.9 دينار في 2008 إلى 8,283.6 دينار في 2017. بلغ متوسط دخل الذكور فيها 10,786.7 دينار, بينما كان متوسط دخل الإناث 2,503.1 دينار. إجمالي الإنفاق الأسري السنوي في إربد يقارب مستوى الدخل بـ 10,054.8 دينار. تتوزع مصادر الدخل الرئيسية للذكور فيها على \"الدخل من الاستخدام\" (5,051.5 دينار) و \"القاطنين لحسابهم الخاص\" (1,703.1 دينار)." },
                { type: 'h3', text: "3. محافظة الزرقاء" },
                { type: 'p', text: "سجلت الزرقاء متوسط دخل أسري سنوي قدره 7,428.6 دينار في عام 2017, مرتفعاً من 5,780.7 دينار في 2008. يُلاحظ أن إجمالي الإنفاق الأسري السنوي لديها 10,211.6 دينار, وهو أعلى بكثير من متوسط الدخل المعلن, مما قد يشير إلى اعتماد على مدخرات أو تحويلات غير مصنفة بالكامل ضمن الدخل الجاري. بلغ متوسط دخل الذكور 9,888.5 دينار مقابل 2,459.9 دينار للإناث. يُعتبر \"الدخل من الاستخدام\" أحد مصادر الدخل الرئيسية في المحافظة, حيث يصل دخل الذكور منه إلى 4,440.5 دينار." },
                { type: 'h3', text: "4. محافظة البلقاء (السلط)" },
                { type: 'p', text: "ارتفع متوسط الدخل الأسري السنوي في البلقاء ليصل إلى 8,054.5 دينار في 2017, مرتفعاً من 6,458.8 دينار في 2008. سجلت البلقاء فجوة دخل كبيرة حيث بلغ دخل الذكور 11,913.3 دينار, بينما كان دخل الإناث مرتفعاً نسبياً مقارنة بغيرها من المحافظات عند 3,858.8 دينار. سجلت البلقاء ثاني أعلى إنفاق أسري إجمالي بعد عمان والعقبة, بـ 10,645.6 دينار, مع إنفاق كبير نسبياً على الخدمات (4,233.0 دينار) والسلع (6,412.6 دينار)." },
                { type: 'h3', text: "5. محافظة مأدبا" },
                { type: 'p', text: "سجلت مأدبا متوسط دخل أسري سنوي قدره 8,139.4 دينار في 2017, مع زيادة واضحة عن 5,780.7 دينار في 2008. بلغ دخل الذكور 10,659.2 دينار, مقابل 2,519.9 دينار للإناث. إجمالي الإنفاق الأسري السنوي فيها كان 9,914.7 دينار. يُلاحظ أن دخل الذكور من \"القاطنين لحسابهم الخاص\" كان 1,791.7 دينار, وهو قيمة جيدة نسبياً." },
                { type: 'h3', text: "6. محافظة المفرق" },
                { type: 'p', text: "تعتبر المفرق من المحافظات التي سجلت أدنى مستويات في متوسط الدخل الأسري السنوي, حيث بلغ 6,873.1 دينار في 2017, مرتفعاً من 6,813.9 دينار في 2008 (وهو أقل ارتفاع مقارنة بمحافظات أخرى). على الرغم من انخفاض متوسط الدخل, إلا أن إجمالي إنفاقها الأسري السنوي وصل إلى 10,116.1 دينار, وهو أعلى من دخلها بفرق كبير. بلغ متوسط دخل الذكور 9,451.0 دينار مقابل 2,577.9 دينار للإناث." },
                { type: 'h3', text: "7. محافظة جرش" },
                { type: 'p', text: "سجلت جرش أحد أدنى مستويات متوسط الدخل الأسري السنوي بـ 6,363.8 دينار في 2017, مرتفعاً من 7,129.4 دينار في 2008 (وهو رقم استثنائي حيث الدخل في 2008 كان أعلى من 2017). على الرغم من انخفاض الدخل, سجلت جرش إنفاقاً أسرياً سنوياً مرتفعاً بـ 11,255.9 دينار (ثالث أعلى إنفاق بعد عمان والعقبة), مما يشير إلى اعتماد كبير على مصادر دعم أو تحويلات أخرى. دخل الذكور بلغ 9,448.4 دينار, مقابل 3,084.6 دينار للإناث." },
                { type: 'h3', text: "8. محافظة عجلون" },
                { type: 'p', text: "سجلت عجلون أيضاً أحد أدنى مستويات متوسط الدخل الأسري السنوي بـ 6,361.2 دينار في 2017. بلغ دخل الذكور 10,569.7 دينار, وهو مرتفع نسبياً, بينما وصل دخل الإناث إلى 4,208.5 دينار, مما يجعلها من المحافظات التي سجلت فيها الإناث أعلى متوسط دخل نسبي. إجمالي إنفاقها الأسري السنوي بلغ 9,956.2 دينار." },
                { type: 'h3', text: "9. محافظة الكرك" },
                { type: 'p', text: "ارتفع متوسط الدخل الأسري السنوي في الكرك من 7,695.1 دينار في 2008 إلى 8,233.6 دينار في 2017. سجلت الكرك فجوة كبيرة في الدخل حيث بلغ دخل الذكور 12,289.5 دينار (ثاني أعلى دخل ذكور بعد عمان), بينما بلغ دخل الإناث 4,055.8 دينار. سجلت الكرك أدنى إجمالي إنفاق أسري سنوي بـ 8,562.6 دينار, وكان إنفاقها على مجموعة الصحة هو الأقل بين المحافظات." },
                { type: 'h3', text: "10. محافظة الطفيلة" },
                { type: 'p', text: "سجلت الطفيلة أدنى متوسط دخل أسري سنوي بـ 6,342.9 دينار في 2017, مرتفعاً من 6,512.8 دينار في 2008. بلغ دخل الذكور 10,648.9 دينار, مقابل 4,306.1 دينار للإناث. إجمالي الإنفاق الأسري السنوي لديها بلغ 9,042.8 دينار, وهو ثاني أدنى إنفاق أسري إجمالي, وتُعتبر من المحافظات التي سجلت أدنى إنفاق على النقل." },
                { type: 'h3', text: "11. محافظة معان" },
                { type: 'p', text: "سجلت معان أدنى متوسط دخل أسري سنوي على الإطلاق بـ 5,756.9 دينار في 2017, مرتفعاً من 7,031.6 دينار في 2008. بلغ دخل الذكور 10,278.9 دينار, مقابل أعلى متوسط دخل للإناث بـ 4,522.0 دينار. إجمالي الإنفاق الأسري السنوي كان 9,986.0 دينار, وهو أعلى بكثير من متوسط الدخل. يُلاحظ أن معان سجلت ثاني أقل إنفاق على الغذاء والمشروبات غير الكحولية." },
                { type: 'h3', text: "12. محافظة العقبة" },
                { type: 'p', text: "شهدت العقبة ارتفاعاً في متوسط الدخل الأسري السنوي من 7,811.3 دينار في 2008 إلى 8,134.2 دينار في 2017. بلغ دخل الذكور 11,518.7 دينار, مقابل 1,984.2 دينار للإناث. سجلت العقبة أعلى إجمالي إنفاق أسري سنوي بـ 12,596.3 دينار, وهو أعلى من دخلها الجاري, مما يشير إلى ارتفاع مستويات المعيشة والإنفاق فيها, خاصة في مجموعة النقل, حيث سجلت ثاني أعلى إنفاق بعد عمان." },
                { type: 'h3', text: "ملخص تنفيذي (لتقديمه لمتخذ القرار)" },
                { type: 'list-item', text: "تباين جغرافي حاد: هناك تباين صارخ بين المحافظات. تُعد عمان والكرك (لدخل الذكور) الأعلى دخلاً، بينما تُعد معان وجرش والطفيلة الأقل في متوسط الدخل الأسري السنوي." },
                { type: 'list-item', text: "فجوة دخل هيكلية: الفجوة في متوسط الدخل لصالح الذكور هي سمة هيكلية في جميع المحافظات، وتبرز بشكل خاص في عمان. الاستثناء النسبي الوحيد هو أن الإناث في معان وعجلون والكرك سجلن متوسط دخل أعلى نسبياً مقارنة ببقية المحافظات." },
                { type: 'list-item', text: "ارتفاع الإنفاق على الدخل: هناك خمس محافظات (الزرقاء، المفرق، جرش، معان، العقبة) سجلت متوسط إنفاق أسري سنوي أعلى بشكل ملحوظ من متوسط دخلها الجاري السنوي في 2017، مما يشير إلى أهمية مصادر الدخل غير الجاري كالتحويلات أو الاستهلاك من المدخرات، خاصة في جرش والعقبة." },
                { type: 'list-item', text: "تمركز الإنفاق: يتركز أعلى إنفاق على السلع والخدمات في محافظتي عمان والعقبة، بينما تسجل الكرك أدنى مستوى إنفاق إجمالي." },
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
                 let bullet = undefined;
                if (block.type === 'list-item') bullet = { level: 0 };

                paragraphs.push(new Paragraph({
                    children: [new TextRun(block.text)],
                    style: block.type.startsWith('h') ? block.type : 'Normal',
                    bullet,
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
            
            pdf.save('report-income.pdf');
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تحليلات دخل الأسرة</h1>
                <p className="text-lg text-gray-700 dark:text-gray-400 mt-1">نظرة على متوسط دخل الأفراد السنوي ومصادره في محافظات المملكة.</p>
            </header>

            <Card className="card-container">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">تحليل دخل الأسرة ومصادره</h2>
                <p className="text-lg text-gray-700 dark:text-gray-400 mb-6">
                    يكشف تحليل دخل الأسر عن تباينات جغرافية واضحة، حيث يرتفع متوسط الدخل في المناطق الحضرية مقارنة بالريف، وتتصدر العاصمة والكرك والبلقاء قائمة المحافظات الأعلى دخلاً. المصدر الرئيسي للدخل هو "الاستخدام" (الرواتب والأجور)، يليه "التحويلات\"، مما يسلط الضوء على أهمية الوظائف المنتظمة والشبكات الاجتماعية في دعم مستوى المعيشة. لا شك أن التباطؤ الاقتصادي الذي رافق جائحة كورونا في 2020-2021 أثر سلباً على دخول الأسر، خاصة تلك التي تعتمد على العمل الخاص والقطاعات غير المنظمة.
                </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="card-container flex flex-col justify-center items-center bg-green-50 dark:bg-green-900/50">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">متوسط دخل المملكة</h3>
                    <p className="text-5xl font-bold text-green-500 my-2">{summaryData.kingdom?.average_total_income.toLocaleString()}</p>
                    <p className="text-base text-gray-600">دينار أردني سنوياً</p>
                </Card>
                <Card className="card-container flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">متوسط دخل الحضر</h3>
                    <p className="text-5xl font-bold text-gray-900 dark:text-gray-200 my-2">{summaryData.urban?.average_total_income.toLocaleString()}</p>
                     <p className="text-base text-gray-600">دينار أردني سنوياً</p>
                </Card>
                 <Card className="card-container flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-300">متوسط دخل الريف</h3>
                    <p className="text-5xl font-bold text-gray-900 dark:text-gray-200 my-2">{summaryData.rural?.average_total_income.toLocaleString()}</p>
                     <p className="text-base text-gray-600">دينار أردني سنوياً</p>
                </Card>
            </div>
            
            <Card className="card-container">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">مقارنة متوسط إجمالي الدخل السنوي بين المحافظات (دينار أردني)</h3>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                    <BarChart data={latestData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="name_ar" tick={{ fontSize: 12, fill: '#333333' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#333333' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                borderColor: '#4b5563',
                                borderRadius: '0.5rem',
                                color: '#fff',
                            }}
                            cursor={{ fill: 'rgba(75, 85, 99, 0.2)' }}
                            formatter={(value: number) => `${value.toFixed(1)} د.أ`}
                        />
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
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">مكونات الدخل السنوي حسب المحافظة (دينار أردني)</h3>
                <IncomeSourceBreakdownChart data={governorateIncomeData} />
            </Card>

            <Card className="card-container">
                <h2 className="text-xl font-bold text-gray-900 mb-2">تقرير تحليلي: الدخل الجاري والإنفاق الأسري حسب المحافظات (2008-2017)</h2>
                <p className="text-lg text-gray-700 mb-6">
                    يركز هذا التحليل على تفكيك البيانات المتاحة حسب المحافظات، مع التركيز على الاتجاهات المالية الرئيسية لعام 2017.
                </p>
                <div className="space-y-6 text-gray-800 leading-relaxed prose prose-lg max-w-none dark:prose-invert">
                    <div>
                        <h3 className="font-semibold">1. محافظة عمان</h3>
                        <p>تُعتبر محافظة عمان القاطرة الاقتصادية، حيث سجلت أعلى الأرقام في كل من الدخل والإنفاق. بلغ متوسط الدخل الأسري السنوي فيها 11,718.8 دينار في عام 2017، مسجلاً ارتفاعاً ملحوظاً عن مستواه في عام 2008 (9,199.8 دينار). على صعيد التوزيع، يُظهر دخل الذكور ارتفاعاً كبيراً جداً ليصل إلى 12,825.8 دينار، في حين أن متوسط دخل الإناث منخفض للغاية عند 1,107.0 دينار، مما يخلق الفجوة الأكبر بين الجنسين في متوسط الدخل. في المقابل، سجلت عمان أعلى إجمالي إنفاق أسري سنوي بـ 11,944.6 دينار، وتركز الإنفاق فيها على السلع (7,456.3 دينار) والخدمات (4,488.3 دينار)، وهي الأعلى بين المحافظات في مجموعات الإنفاق الرئيسية كالطعام، والمسكن، والنقل. كما أن دخلها من مصادر مثل "الاستخدام" و"القاطنين لحسابهم الخاص" هو الأعلى على مستوى المملكة.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">2. محافظة إربد</h3>
                        <p>شهدت إربد نمواً في متوسط الدخل الأسري السنوي من 7,080.9 دينار في 2008 إلى 8,283.6 دينار في 2017. بلغ متوسط دخل الذكور فيها 10,786.7 دينار، بينما كان متوسط دخل الإناث 2,503.1 دينار. إجمالي الإنفاق الأسري السنوي في إربد يقارب مستوى الدخل بـ 10,054.8 دينار. تتوزع مصادر الدخل الرئيسية للذكور فيها على "الدخل من الاستخدام" (5,051.5 دينار) و "القاطنين لحسابهم الخاص" (1,703.1 دينار).</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">3. محافظة الزرقاء</h3>
                        <p>سجلت الزرقاء متوسط دخل أسري سنوي قدره 7,428.6 دينار في عام 2017، مرتفعاً من 5,780.7 دينار في 2008. يُلاحظ أن إجمالي الإنفاق الأسري السنوي لديها 10,211.6 دينار، وهو أعلى بكثير من متوسط الدخل المعلن، مما قد يشير إلى اعتماد على مدخرات أو تحويلات غير مصنفة بالكامل ضمن الدخل الجاري. بلغ متوسط دخل الذكور 9,888.5 دينار مقابل 2,459.9 دينار للإناث. يُعتبر "الدخل من الاستخدام" أحد مصادر الدخل الرئيسية في المحافظة، حيث يصل دخل الذكور منه إلى 4,440.5 دينار.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">4. محافظة البلقاء (السلط)</h3>
                        <p>ارتفع متوسط الدخل الأسري السنوي في البلقاء ليصل إلى 8,054.5 دينار في 2017، مرتفعاً من 6,458.8 دينار في 2008. سجلت البلقاء فجوة دخل كبيرة حيث بلغ دخل الذكور 11,913.3 دينار، بينما كان دخل الإناث مرتفعاً نسبياً مقارنة بغيرها من المحافظات عند 3,858.8 دينار. سجلت البلقاء ثاني أعلى إنفاق أسري إجمالي بعد عمان والعقبة، بـ 10,645.6 دينار، مع إنفاق كبير نسبياً على الخدمات (4,233.0 دينار) والسلع (6,412.6 دينار).</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">5. محافظة مأدبا</h3>
                        <p>سجلت مأدبا متوسط دخل أسري سنوي قدره 8,139.4 دينار في 2017، مع زيادة واضحة عن 5,780.7 دينار في 2008. بلغ دخل الذكور 10,659.2 دينار، مقابل 2,519.9 دينار للإناث. إجمالي الإنفاق الأسري السنوي فيها كان 9,914.7 دينار. يُلاحظ أن دخل الذكور من "القاطنين لحسابهم الخاص" كان 1,791.7 دينار، وهو قيمة جيدة نسبياً.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">6. محافظة المفرق</h3>
                        <p>تعتبر المفرق من المحافظات التي سجلت أدنى مستويات في متوسط الدخل الأسري السنوي، حيث بلغ 6,873.1 دينار في 2017، مرتفعاً من 6,813.9 دينار في 2008 (وهو أقل ارتفاع مقارنة بمحافظات أخرى). على الرغم من انخفاض متوسط الدخل، إلا أن إجمالي إنفاقها الأسري السنوي وصل إلى 10,116.1 دينار، وهو أعلى من دخلها بفرق كبير. بلغ متوسط دخل الذكور 9,451.0 دينار مقابل 2,577.9 دينار للإناث.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">7. محافظة جرش</h3>
                        <p>سجلت جرش أحد أدنى مستويات متوسط الدخل الأسري السنوي بـ 6,363.8 دينار في 2017، مرتفعاً من 7,129.4 دينار في 2008 (وهو رقم استثنائي حيث الدخل في 2008 كان أعلى من 2017). على الرغم من انخفاض الدخل، سجلت جرش إنفاقاً أسرياً سنوياً مرتفعاً بـ 11,255.9 دينار (ثالث أعلى إنفاق بعد عمان والعقبة)، مما يشير إلى اعتماد كبير على مصادر دعم أو تحويلات أخرى. دخل الذكور بلغ 9,448.4 دينار، مقابل 3,084.6 دينار للإناث.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">8. محافظة عجلون</h3>
                        <p>سجلت عجلون أيضاً أحد أدنى مستويات متوسط الدخل الأسري السنوي بـ 6,361.2 دينار في 2017. بلغ دخل الذكور 10,569.7 دينار، وهو مرتفع نسبياً، بينما وصل دخل الإناث إلى 4,208.5 دينار، مما يجعلها من المحافظات التي سجلت فيها الإناث أعلى متوسط دخل نسبي. إجمالي إنفاقها الأسري السنوي بلغ 9,956.2 دينار.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">9. محافظة الكرك</h3>
                        <p>ارتفع متوسط الدخل الأسري السنوي في الكرك من 7,695.1 دينار في 2008 إلى 8,233.6 دينار في 2017. سجلت الكرك فجوة كبيرة في الدخل حيث بلغ دخل الذكور 12,289.5 دينار (ثاني أعلى دخل ذكور بعد عمان)، بينما بلغ دخل الإناث 4,055.8 دينار. سجلت الكرك أدنى إجمالي إنفاق أسري سنوي بـ 8,562.6 دينار، وكان إنفاقها على مجموعة الصحة هو الأقل بين المحافظات.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">10. محافظة الطفيلة</h3>
                        <p>سجلت الطفيلة أدنى متوسط دخل أسري سنوي بـ 6,342.9 دينار في 2017، مرتفعاً من 6,512.8 دينار في 2008. بلغ دخل الذكور 10,648.9 دينار، مقابل 4,306.1 دينار للإناث. إجمالي الإنفاق الأسري السنوي لديها بلغ 9,042.8 دينار، وهو ثاني أدنى إنفاق أسري إجمالي، وتُعتبر من المحافظات التي سجلت أدنى إنفاق على النقل.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">11. محافظة معان</h3>
                        <p>سجلت معان أدنى متوسط دخل أسري سنوي على الإطلاق بـ 5,756.9 دينار في 2017، مرتفعاً من 7,031.6 دينار في 2008. بلغ دخل الذكور 10,278.9 دينار، مقابل أعلى متوسط دخل للإناث بـ 4,522.0 دينار. إجمالي الإنفاق الأسري السنوي كان 9,986.0 دينار، وهو أعلى بكثير من متوسط الدخل. يُلاحظ أن معان سجلت ثاني أقل إنفاق على الغذاء والمشروبات غير الكحولية.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">12. محافظة العقبة</h3>
                        <p>شهدت العقبة ارتفاعاً في متوسط الدخل الأسري السنوي من 7,811.3 دينار في 2008 إلى 8,134.2 دينار في 2017. بلغ دخل الذكور 11,518.7 دينار، مقابل 1,984.2 دينار للإناث. سجلت العقبة أعلى إجمالي إنفاق أسري سنوي بـ 12,596.3 دينار، وهو أعلى من دخلها الجاري، مما يشير إلى ارتفاع مستويات المعيشة والإنفاق فيها، خاصة في مجموعة النقل، حيث سجلت ثاني أعلى إنفاق بعد عمان.</p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="font-semibold">ملخص تنفيذي (لتقديمه لمتخذ القرار)</h3>
                        <ul className="list-disc list-outside mr-6 space-y-2 mt-2">
                            <li><strong>تباين جغرافي حاد:</strong> هناك تباين صارخ بين المحافظات. تُعد عمان والكرك (لدخل الذكور) الأعلى دخلاً، بينما تُعد معان وجرش والطفيلة الأقل في متوسط الدخل الأسري السنوي.</li>
                            <li><strong>فجوة دخل هيكلية:</strong> الفجوة في متوسط الدخل لصالح الذكور هي سمة هيكلية في جميع المحافظات، وتبرز بشكل خاص في عمان. الاستثناء النسبي الوحيد هو أن الإناث في معان وعجلون والكرك سجلن متوسط دخل أعلى نسبياً مقارنة ببقية المحافظات.</li>
                            <li><strong>ارتفاع الإنفاق على الدخل:</strong> هناك خمس محافظات (الزرقاء، المفرق، جرش، معان، العقبة) سجلت متوسط إنفاق أسري سنوي أعلى بشكل ملحوظ من متوسط دخلها الجاري السنوي في 2017، مما يشير إلى أهمية مصادر الدخل غير الجاري كالتحويلات أو الاستهلاك من المدخرات، خاصة في جرش والعقبة.</li>
                            <li><strong>تمركز الإنفاق:</strong> يتركز أعلى إنفاق على السلع والخدمات في محافظتي عمان والعقبة، بينما تسجل الكرك أدنى مستوى إنفاق إجمالي.</li>
                        </ul>
                    </div>
                </div>
            </Card>

        </div>
    );
};

export default Income;