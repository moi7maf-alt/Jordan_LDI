
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
            const title = "التقرير الاستراتيجي: واقع المرأة الأردنية 2024";
            
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
                
                new Paragraph({ text: "1. مقدمة تحليلية: الفجوة الجندرية والتحدي الاقتصادي", style: "h2" }),
                new Paragraph({ text: `يُشكل ضعف المشاركة الاقتصادية للمرأة التحدي الهيكلي الأبرز في الاقتصاد الأردني. تشير البيانات الرقمية لعام 2024 إلى أن المعدل الوطني للمشاركة لا يزال يراوح عند ${NATIONAL_AVERAGES_2024.female_labor_force_participation.toFixed(1)}%، وهي نسبة متواضعة جداً إذا ما قورنت بالاستثمار الهائل في تعليم الإناث. هذه الفجوة ليست مجرد رقم إحصائي، بل تمثل طاقة إنتاجية معطلة تقدر بمليارات الدنانير سنوياً. الهدف الوطني الطموح ضمن رؤية التحديث الاقتصادي هو الوصول إلى ${JORDAN_VISION_2033_TARGETS.female_labor_force_participation}% بحلول عام 2033، وهو ما يتطلب هندسة اجتماعية واقتصادية شاملة لبيئة العمل.`, style: "Normal" }),

                new Paragraph({ text: "2. خارطة البطالة: تباين جغرافي ومؤشرات حرجة", style: "h2" }),
                new Paragraph({ text: "يكشف التحليل الجغرافي لبيانات البطالة بين الإناث عن تباينات حادة تستدعي تدخلات مخصصة لكل منطقة. تتصدر محافظة الزرقاء المشهد بمعدل بطالة إناث مقلق يصل إلى 39.3%، تليها جرش بنسبة 36.2%، وعمان بنسبة 35.2%. هذا الارتفاع في مراكز الكثافة السكانية (عمان والزرقاء) يشير إلى أن سوق العمل الرسمي التقليدي قد وصل مرحلة الإشباع، أو أنه يطرد الكفاءات النسائية بسبب ظروف العمل غير الصديقة للأسرة.", style: "Normal" }),
                new Paragraph({ text: "في المقابل، ورغم الانخفاض النسبي في محافظات الجنوب، إلا أن ذلك قد يعزى لظاهرة \"اليأس من البحث عن عمل\" وانسحاب النساء من القوى العاملة كلياً، وليس بالضرورة لتوفر فرص عمل حقيقية.", style: "Normal" }),

                new Paragraph({ text: "3. الحماية الاجتماعية والشمول التأميني", style: "h2" }),
                new Paragraph({ text: "تُظهر بيانات الضمان الاجتماعي فجوة كبيرة في الحماية الاجتماعية. في محافظة العقبة، على سبيل المثال، لا تتجاوز نسبة الإناث من إجمالي المؤمن عليهم 23.4%، وفي معان 24.5%. هذا يعني أن الغالبية العظمى من النساء العاملات في هذه المناطق يعملن في القطاع غير المنظم (زراعة، مشاريع منزلية غير مرخصة) ويفتقرن لأبسط حقوق الحماية كإجازات الأمومة والتقاعد، مما يرسخ هشاشتهن الاقتصادية.", style: "Normal" }),

                new Paragraph({ text: "4. التعليم كعامل تمكين وتحدي", style: "h2" }),
                new Paragraph({ text: "بينما حقق الأردن إنجازات كبرى في ردم فجوة التعليم، لا تزال جيوب الأمية تشكل عائقاً في بعض المناطق، حيث تسجل معان أعلى معدل أمية بين الإناث بنسبة 13.7%، تليها الطفيلة بنسبة 11.8%. هذا المؤشر يرتبط ارتباطاً وثيقاً بضعف المشاركة الاقتصادية في هذه المحافظات، حيث يحد من قدرة النساء على الانخراط في سوق العمل الحديث الذي يتطلب مهارات رقمية ومعرفية.", style: "Normal" }),

                new Paragraph({ text: "5. التوصيات الاستراتيجية", style: "h2" }),
                new Paragraph({ text: "أولاً: التوسع في إنشاء الحضانات المؤسسية في القطاعين العام والخاص، خاصة في الزرقاء وعمان، لتقليل كلفة الفرصة البديلة لعمل المرأة.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثانياً: توجيه صناديق التمويل والإقراض (مثل صندوق التنمية والتشغيل) لدعم مشاريع ريادة الأعمال النسائية في قطاعات التكنولوجيا والزراعة الذكية في محافظات الجنوب (الكرك، الطفيلة، معان) للخروج من عباءة الوظيفة الحكومية.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثالثاً: شمول العاملات في الزراعة والسياحة بمظلة الضمان الاجتماعي عبر برامج مدعومة حكومياً لتعزيز استقرارهن الوظيفي.", style: "Normal", bullet: { level: 0 } }),
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

        // Optimized print styling: hide visualizations, enhance text readability
        const headContent = `
            <head>
                <title>تقرير قطاع المرأة - 2024</title>
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
                    /* Hide non-text elements */
                    .no-print, .recharts-wrapper, button, select, svg, .icon-container, .kpi-card-visual { 
                        display: none !important; 
                    }
                    /* Hide KPI cards container if it only contains visuals */
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
                        <h1>التقرير الاستراتيجي: واقع المرأة الأردنية 2024</h1>
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
                    <h1 className="text-3xl font-bold text-gray-900">تحليلات تنمية المرأة</h1>
                    <p className="text-lg text-gray-700 mt-1">قراءة معمقة في مؤشرات المشاركة والتمكين والتحديات.</p>
                </header>
                
                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">1. الفجوة الجندرية والتحدي الاقتصادي</h2>
                    <div className="text-gray-800 leading-relaxed text-lg">
                        <p className="mb-4">
                            يُشكل ضعف المشاركة الاقتصادية للمرأة التحدي الهيكلي الأبرز في الاقتصاد الأردني. تشير البيانات الرقمية لعام 2024 إلى أن المعدل الوطني للمشاركة لا يزال يراوح عند <strong>{NATIONAL_AVERAGES_2024.female_labor_force_participation.toFixed(1)}%</strong>، وهي نسبة متواضعة جداً إذا ما قورنت بالاستثمار الهائل في تعليم الإناث. هذه الفجوة ليست مجرد رقم إحصائي، بل تمثل طاقة إنتاجية معطلة تقدر بمليارات الدنانير سنوياً. الهدف الوطني الطموح ضمن رؤية التحديث الاقتصادي هو الوصول إلى <strong>{JORDAN_VISION_2033_TARGETS.female_labor_force_participation}%</strong> بحلول عام 2033، وهو ما يتطلب هندسة اجتماعية واقتصادية شاملة لبيئة العمل.
                        </p>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 kpi-card-visual">
                    <Card className="card-container flex flex-col justify-center items-center">
                        <h3 className="text-lg font-semibold text-gray-800">مشاركة الإناث في القوى العاملة (2024)</h3>
                        <p className="text-5xl font-bold text-violet-500 my-2">{NATIONAL_AVERAGES_2024.female_labor_force_participation.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">المعدل الوطني</p>
                    </Card>
                    <Card className="card-container no-print">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">الشمول في الضمان الاجتماعي</h3>
                            <select
                                value={selectedGov}
                                onChange={(e) => setSelectedGov(e.target.value)}
                                className="bg-gray-100 border border-gray-300 rounded-md p-2 text-sm"
                            >
                                {ECONOMIC_EMPOWERMENT_DATA.map(g => <option key={g.name} value={g.name}>{g.name_ar}</option>)}
                            </select>
                        </div>
                        {selectedGovData && <EconomicEmpowermentChart data={selectedGovData} />}
                    </Card>
                </div>

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">2. تحليل البطالة: تباين جغرافي ومؤشرات حرجة</h2>
                    <div className="text-gray-800 leading-relaxed text-lg">
                        <p className="mb-4">
                            يكشف التحليل الجغرافي لبيانات البطالة بين الإناث عن تباينات حادة تستدعي تدخلات مخصصة لكل منطقة. تتصدر <strong>محافظة الزرقاء</strong> المشهد بمعدل بطالة إناث مقلق يصل إلى <strong>39.3%</strong>، تليها <strong>جرش</strong> بنسبة <strong>36.2%</strong>، و<strong>عمان</strong> بنسبة <strong>35.2%</strong>. هذا الارتفاع في مراكز الكثافة السكانية يشير إلى أن سوق العمل الرسمي التقليدي قد وصل مرحلة الإشباع، أو أنه يطرد الكفاءات النسائية بسبب ظروف العمل غير الصديقة للأسرة (طول ساعات العمل، ضعف المواصلات، غياب الحضانات).
                        </p>
                        <p>
                            في المقابل، ورغم الانخفاض النسبي في محافظات الجنوب، إلا أن ذلك قد يعزى لظاهرة "اليأس من البحث عن عمل" وانسحاب النساء من القوى العاملة كلياً، وليس بالضرورة لتوفر فرص عمل حقيقية، مما يستوجب دراسات معمقة حول البطالة المقنعة.
                        </p>
                    </div>
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
                    <h2 className="text-xl font-bold text-gray-900 mb-4">3. الحماية الاجتماعية والشمول التأميني</h2>
                    <div className="text-gray-800 leading-relaxed text-lg">
                        <p className="mb-4">
                            تُظهر بيانات الضمان الاجتماعي فجوة كبيرة في الحماية الاجتماعية. في <strong>محافظة العقبة</strong>، لا تتجاوز نسبة الإناث من إجمالي المؤمن عليهم <strong>23.4%</strong>، وفي <strong>معان 24.5%</strong>. هذا يعني أن الغالبية العظمى من النساء العاملات في هذه المناطق يعملن في القطاع غير المنظم (زراعة، مشاريع منزلية غير مرخصة) ويفتقرن لأبسط حقوق الحماية كإجازات الأمومة والتقاعد، مما يرسخ هشاشتهن الاقتصادية ويجعلهن عرضة للصدمات المعيشية.
                        </p>
                    </div>
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
                    <h2 className="text-xl font-bold text-gray-900 mb-4">4. التعليم والتحديات الجغرافية</h2>
                    <div className="text-gray-800 leading-relaxed text-lg">
                        <p className="mb-4">
                            بينما حقق الأردن إنجازات كبرى في ردم فجوة التعليم، لا تزال جيوب الأمية تشكل عائقاً في بعض المناطق، حيث تسجل <strong>معان</strong> أعلى معدل أمية بين الإناث بنسبة <strong>13.7%</strong>، تليها <strong>الطفيلة</strong> بنسبة <strong>11.8%</strong>. هذا المؤشر يرتبط ارتباطاً وثيقاً بضعف المشاركة الاقتصادية في هذه المحافظات، حيث يحد من قدرة النساء على الانخراط في سوق العمل الحديث الذي يتطلب مهارات رقمية ومعرفية.
                        </p>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">5. التوصيات الاستراتيجية والحلول المقترحة</h2>
                    <div className="text-gray-800 leading-normal space-y-4 text-lg">
                        <ul className="list-disc list-outside mr-6 space-y-2">
                            <li><strong>دعم البنية التحتية للرعاية:</strong> التوسع في إنشاء الحضانات المؤسسية في القطاعين العام والخاص، خاصة في الزرقاء وعمان، لتقليل كلفة الفرصة البديلة لعمل المرأة.</li>
                            <li><strong>التمكين في الأطراف:</strong> توجيه صناديق التمويل والإقراض (مثل صندوق التنمية والتشغيل) لدعم مشاريع ريادة الأعمال النسائية في قطاعات التكنولوجيا والزراعة الذكية في محافظات الجنوب (الكرك، الطفيلة، معان).</li>
                            <li><strong>الحماية الاجتماعية الشاملة:</strong> شمول العاملات في الزراعة والسياحة بمظلة الضمان الاجتماعي عبر برامج مدعومة حكومياً لتعزيز استقرارهن الوظيفي.</li>
                            <li><strong>محو الأمية الرقمية:</strong> إطلاق برامج وطنية لمحو الأمية الرقمية تستهدف النساء في المحافظات ذات معدلات الأمية المرتفعة لتمكينهن من الوصول إلى الفرص الاقتصادية المتاحة عبر الإنترنت.</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default WomensDevelopment;
