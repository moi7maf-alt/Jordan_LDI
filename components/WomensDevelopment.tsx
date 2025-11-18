import React, { useState } from 'react';
import Card from './ui/Card';
import { NATIONAL_AVERAGES_2024, JORDAN_VISION_2033_TARGETS } from '../constants';
import { ECONOMIC_EMPOWERMENT_DATA } from '../constants/economicEmpowermentData';
import { WOMEN_DEV_DATA_2024 } from '../constants/womensDevelopmentData';
import EconomicEmpowermentChart from './charts/EconomicEmpowermentChart';
import GovernorateBarChart from './charts/GovernorateBarChart';
import { EMPLOYED_WOMEN_DISTRIBUTION_DATA_2024 } from '../constants/employedWomenDistData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, IStylesOptions } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ContentBlock = { type: 'h1' | 'h2' | 'h3' | 'p' | 'list-item'; text: string; };

const WomensDevelopment: React.FC = () => {
    const [selectedGov, setSelectedGov] = useState('Amman');
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    
    const selectedGovData = ECONOMIC_EMPOWERMENT_DATA.find(g => g.name === selectedGov)?.data;

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "تحليلات تنمية المرأة";
            const content: ContentBlock[] = [
                { type: 'h1', text: title },
                { type: 'p', text: "استكشاف المؤشرات الرئيسية المتعلقة بتمكين المرأة في الأردن." },
                { type: 'h2', text: "نظرة على تمكين المرأة الاقتصادي" },
                { type: 'p', text: `يعد تمكين المرأة ركيزة أساسية في رؤية التحديث الاقتصادي. ومع ذلك، لا يزال المعدل الوطني لمشاركة الإناث في القوى العاملة عند ${NATIONAL_AVERAGES_2024.female_labor_force_participation.toFixed(1)}%، وهو أقل بكثير من الهدف المنشود لعام 2033 والبالغ ${JORDAN_VISION_2033_TARGETS.female_labor_force_participation}%. وقد أدت جائحة كورونا خلال عامي 2020 و 2021 إلى تفاقم هذا التحدي، حيث تأثرت القطاعات التي تعمل بها النساء بشكل كبير، وزادت الأعباء الأسرية عليهن. من جانب آخر، يُظهر تحليل بيانات الضمان الاجتماعي تبايناً في نسبة الإناث المؤمن عليهن بين المحافظات، مما يعكس الفجوة في الوصول إلى العمل الرسمي والمنظم.` },
                { type: 'h2', text: "المؤشرات الرئيسية للمرأة الأردنية (2024) - إجمالي الإناث" },
                { type: 'p', text: "تُظهر البيانات تبايناً كبيراً في التحديات التي تواجهها النساء عبر المحافظات، خاصة فيما يتعلق بالبطالة والأمية والمشاركة الاقتصادية، مما يستدعي سياسات موجهة لدعم تمكينهن." },
                { type: 'h2', text: "مقارنة توزيع المشتغلات (2024)" },
                { type: 'p', text: "يوضح هذا الرسم البياني الفجوة في توزيع العمالة بين إجمالي الإناث والنساء اللاتي يرأسن أسرهن. الفجوات الكبيرة قد تشير إلى تحديات إضافية تواجه ربات الأسر في الوصول إلى سوق العمل المنظم." },
                { type: 'h2', text: "التحليل الاستراتيجي والتوصيات" },
                { type: 'p', text: "تكشف المؤشرات عن صورة مركبة لوضع المرأة في الأردن، حيث تبرز فجوات تنموية واضحة بين المحافظات." },
                { type: 'h3', text: "نقاط سلبية تتطلب تدخلاً:" },
                { type: 'list-item', text: "بطالة مرتفعة: تعاني محافظات مثل الزرقاء وجرش من معدلات بطالة مقلقة بين النساء، مما يستدعي برامج تشغيل وتدريب مهني موجهة." },
                { type: 'list-item', text: "فجوة تعليمية: ترتفع معدلات الأمية بشكل كبير في المحافظات الجنوبية (معان، الطفيلة) والمفرق، مما يشكل عائقاً أساسياً أمام التمكين الاقتصادي." },
                { type: 'list-item', text: "مشاركة اقتصادية منخفضة: تسجل محافظات حيوية مثل الزرقاء والعقبة معدلات مشاركة اقتصادية منقحة منخفضة، مما يشير إلى وجود حواجز هيكلية أو ثقافية تحد من دخول المرأة لسوق العمل." },
                { type: 'list-item', text: "تحديات مضاعفة لربات الأسر: تظهر بيانات توزيع المشتغلات فجوة واضحة بين إجمالي الإناث والنساء اللاتي يرأسن أسرهن، مما يؤكد على الصعوبات الإضافية التي تواجهها هذه الفئة في الحصول على عمل منظم." },
                { type: 'h3', text: "نقاط إيجابية يمكن البناء عليها:" },
                { type: 'list-item', text: "مشاركة فاعلة: تُظهر محافظات مثل الكرك والطفيلة معدلات مشاركة اقتصادية مرتفعة نسبياً، مما يعكس وجود بيئة أكثر تمكيناً يمكن دراسة عوامل نجاحها وتعميمها." },
                { type: 'list-item', text: "انخفاض الأمية في المركز: تتمتع العاصمة وإربد بمعدلات أمية منخفضة، مما يوفر قاعدة قوية من رأس المال البشري النسائي المؤهل." },
                { type: 'h3', text: "توصيات استراتيجية:" },
                { type: 'list-item', text: "برامج موجهة جغرافياً: تصميم برامج لمحو الأمية الرقمية والمالية في المحافظات ذات معدلات الأمية المرتفعة." },
                { type: 'list-item', text: "دعم رائدات الأعمال: إطلاق حاضنات أعمال ومحافظ تمويلية مخصصة للنساء في المحافظات ذات المشاركة الاقتصادية المنخفضة." },
                { type: 'list-item', text: "سياسات داعمة لربات الأسر: توفير خدمات رعاية الأطفال بأسعار معقولة، وتشجيع أنماط العمل المرنة لمساعدة النساء اللاتي يرأسن أسرهن على الانخراط في سوق العمل." },
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
            
            pdf.save('report-womens-development.pdf');
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
                    className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 focus:z-10 focus:ring-4 focus:ring-gray-100 flex items-center gap-2"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                   </svg>
                    {isExportingPdf ? 'جاري التصدير...' : 'تصدير (PDF)'}
                </button>
            </div>
             <header>
                <h1 className="text-3xl font-bold text-gray-900">تحليلات تنمية المرأة</h1>
                <p className="text-lg text-gray-700 mt-1">استكشاف المؤشرات الرئيسية المتعلقة بتمكين المرأة في الأردن.</p>
            </header>
            
            <Card className="card-container">
                <h2 className="text-xl font-bold text-gray-900 mb-2">نظرة على تمكين المرأة الاقتصادي</h2>
                <p className="text-lg text-gray-700 mb-6">
                    يعد تمكين المرأة ركيزة أساسية في رؤية التحديث الاقتصادي. ومع ذلك، لا يزال المعدل الوطني لمشاركة الإناث في القوى العاملة عند ${NATIONAL_AVERAGES_2024.female_labor_force_participation.toFixed(1)}%، وهو أقل بكثير من الهدف المنشود لعام 2033 والبالغ ${JORDAN_VISION_2033_TARGETS.female_labor_force_participation}%. وقد أدت جائحة كورونا خلال عامي 2020 و 2021 إلى تفاقم هذا التحدي، حيث تأثرت القطاعات التي تعمل بها النساء بشكل كبير، وزادت الأعباء الأسرية عليهن. من جانب آخر، يُظهر تحليل بيانات الضمان الاجتماعي تبايناً في نسبة الإناث المؤمن عليهن بين المحافظات، مما يعكس الفجوة في الوصول إلى العمل الرسمي والمنظم.
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
                     <p className="text-lg text-gray-700 mb-4">
                        يوضح هذا الرسم البياني تطور نسبة الإناث والذكور المؤمن عليهم في الضمان الاجتماعي على مدى السنوات الخمس الماضية. تعكس هذه النسبة مستوى الوصول إلى العمل الرسمي والمنظم الذي يوفر حماية اجتماعية. يتيح لك اختيار المحافظة من القائمة أعلاه استكشاف الفروقات والاتجاهات الخاصة بكل منطقة.
                    </p>
                    {selectedGovData && <EconomicEmpowermentChart data={selectedGovData} />}
                </Card>
            </div>

            <Card className="card-container">
                <h2 className="text-xl font-bold text-gray-900 mb-2">المؤشرات الرئيسية للمرأة الأردنية (2024) - إجمالي الإناث</h2>
                <p className="text-lg text-gray-700 mb-6">
                    تُظهر البيانات تبايناً كبيراً في التحديات التي تواجهها النساء عبر المحافظات، خاصة فيما يتعلق بالبطالة والأمية والمشاركة الاقتصادية، مما يستدعي سياسات موجهة لدعم تمكينهن.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12">
                     <div>
                        <p className="text-lg text-gray-700 mb-4">
                            يقارن هذا الرسم البياني معدلات البطالة بين النساء في مختلف المحافظات. تُظهر الأعمدة الأعلى تحديات أكبر في الحصول على فرص عمل، مما يستدعي تدخلات سياساتية موجهة لتوفير برامج تدريب وتشغيل.
                        </p>
                        <GovernorateBarChart
                            data={WOMEN_DEV_DATA_2024 as any}
                            dataKey="unemployment_rate_f"
                            unit="%"
                            title="معدل البطالة (إناث)"
                        />
                    </div>
                     <div>
                        <p className="text-lg text-gray-700 mb-4">
                            يسلط هذا المؤشر الضوء على الفجوات التعليمية لدى النساء. يعتبر انخفاض معدل الأمية أساسياً لتعزيز القدرة على المشاركة الاقتصادية الفعالة. تبرز المحافظات ذات المعدلات المرتفعة كأولوية لبرامج محو الأمية وتعليم الكبار.
                        </p>
                        <GovernorateBarChart
                            data={WOMEN_DEV_DATA_2024 as any}
                            dataKey="illiteracy_rate_f"
                            unit="%"
                            title="معدل الأمية (إناث)"
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <p className="text-lg text-gray-700 mb-4">
                            يقيس هذا الرسم البياني "معدل المشاركة الاقتصادية المنقح"، وهو نسبة النساء العاملات أو الباحثات عن عمل من بين جميع النساء في سن العمل. تُظهر المعدلات المرتفعة اندماجاً أكبر في سوق العمل، بينما تشير المعدلات المنخفضة إلى وجود عوائق تحول دون مشاركتهن.
                        </p>
                        <GovernorateBarChart
                            data={WOMEN_DEV_DATA_2024 as any}
                            dataKey="refined_economic_participation_rate_f"
                            unit="%"
                            title="معدل المشاركة الاقتصادية المنقح (إناث)"
                        />
                    </div>
                </div>
            </Card>

            <Card className="card-container">
                <h2 className="text-xl font-bold text-gray-900 mb-2">مقارنة توزيع المشتغلات (2024)</h2>
                <p className="text-lg text-gray-700 mb-6">
                    يوضح هذا الرسم البياني الفجوة في توزيع العمالة بين إجمالي الإناث والنساء اللاتي يرأسن أسرهن. الفجوات الكبيرة قد تشير إلى تحديات إضافية تواجه ربات الأسر في الوصول إلى سوق العمل المنظم.
                </p>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={EMPLOYED_WOMEN_DISTRIBUTION_DATA_2024} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name_ar" tick={{ fontSize: 12, fill: '#333333' }} />
                            <YAxis unit="%" tick={{ fontSize: 12, fill: '#333333' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                    borderColor: '#4b5563',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                }}
                                formatter={(value: number) => `${value.toFixed(1)}%`}
                            />
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
                    <p>
                        تكشف المؤشرات عن صورة مركبة لوضع المرأة في الأردن، حيث تبرز فجوات تنموية واضحة بين المحافظات.
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 pt-2">نقاط سلبية تتطلب تدخلاً:</h3>
                    <ul className="list-disc list-outside mr-6 space-y-2">
                        <li><strong>بطالة مرتفعة:</strong> تعاني محافظات مثل الزرقاء وجرش من معدلات بطالة مقلقة بين النساء، مما يستدعي برامج تشغيل وتدريب مهني موجهة.</li>
                        <li><strong>فجوة تعليمية:</strong> ترتفع معدلات الأمية بشكل كبير في المحافظات الجنوبية (معان، الطفيلة) والمفرق، مما يشكل عائقاً أساسياً أمام التمكين الاقتصادي.</li>
                        <li><strong>مشاركة اقتصادية منخفضة:</strong> تسجل محافظات حيوية مثل الزرقاء والعقبة معدلات مشاركة اقتصادية منقحة منخفضة، مما يشير إلى وجود حواجز هيكلية أو ثقافية تحد من دخول المرأة لسوق العمل.</li>
                        <li><strong>تحديات مضاعفة لربات الأسر:</strong> تظهر بيانات توزيع المشتغلات فجوة واضحة بين إجمالي الإناث والنساء اللاتي يرأسن أسرهن، مما يؤكد على الصعوبات الإضافية التي تواجهها هذه الفئة في الحصول على عمل منظم.</li>
                    </ul>
                    <h3 className="text-lg font-semibold text-gray-900 pt-2">نقاط إيجابية يمكن البناء عليها:</h3>
                    <ul className="list-disc list-outside mr-6 space-y-2">
                        <li><strong>مشاركة فاعلة:</strong> تُظهر محافظات مثل الكرك والطفيلة معدلات مشاركة اقتصادية مرتفعة نسبياً، مما يعكس وجود بيئة أكثر تمكيناً يمكن دراسة عوامل نجاحها وتعميمها.</li>
                        <li><strong>انخفاض الأمية في المركز:</strong> تتمتع العاصمة وإربد بمعدلات أمية منخفضة، مما يوفر قاعدة قوية من رأس المال البشري النسائي المؤهل.</li>
                    </ul>
                    <h3 className="text-lg font-semibold text-gray-900 pt-2">توصيات استراتيجية:</h3>
                    <ul className="list-disc list-outside mr-6 space-y-2">
                        <li><strong>برامج موجهة جغرافياً:</strong> تصميم برامج لمحو الأمية الرقمية والمالية في المحافظات ذات معدلات الأمية المرتفعة.</li>
                        <li><strong>دعم رائدات الأعمال:</strong> إطلاق حاضنات أعمال ومحافظ تمويلية مخصصة للنساء في المحافظات ذات المشاركة الاقتصادية المنخفضة.</li>
                        <li><strong>سياسات داعمة لربات الأسر:</strong> توفير خدمات رعاية الأطفال بأسعار معقولة، وتشجيع أنماط العمل المرنة لمساعدة النساء اللاتي يرأسن أسرهن على الانخراط في سوق العمل.</li>
                    </ul>
                </div>
            </Card>
        </div>
    );
};

export default WomensDevelopment;