
import React, { useMemo, useState } from 'react';
import Card from './ui/Card';
import { SOLID_WASTE_DATA } from '../constants/solidWasteData';
import { GOVERNORATES_DATA } from '../constants';
import SolidWasteChart from './charts/SolidWasteChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

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

const KpiCard: React.FC<{ title: string; value: string; icon: string; }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 p-4 rounded-xl text-center shadow-sm h-full flex flex-col justify-center break-inside-avoid kpi-card-visual">
        <div className="text-3xl mb-2 icon-container">{icon}</div>
        <p className="text-2xl font-bold text-amber-600">{value}</p>
        <p className="text-xs text-gray-700 mt-1 h-10 flex items-center justify-center">{title}</p>
    </div>
);

const LocalAdministration: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);

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
    
    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير الاستراتيجي: قطاع الإدارة المحلية 2024";
            
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
                
                new Paragraph({ text: "1. أزمة الاستدامة المالية: عبء المديونية والرواتب", style: "h2" }),
                new Paragraph({ text: "تواجه البلديات أزمة هيكلية خانقة، حيث تجاوزت المديونية 632 مليون دينار. المشكلة ليست في نقص الموارد فحسب، بل في سوء إدارتها. تلتهم فاتورة الرواتب والأجور 70% من إجمالي الإيرادات، وفي بعض البلديات تتجاوز الـ 100% من الإيرادات الذاتية، مما يحول البلديات فعلياً إلى مؤسسات للتوظيف بدلاً من تقديم الخدمات والتنمية. نسبة الاعتماد على الذات لا تتجاوز 36%، مما يجعل البلديات رهينة للدعم الحكومي المتقلب.", style: "Normal" }),

                new Paragraph({ text: "2. أزمة الحوكمة والجودة", style: "h2" }),
                new Paragraph({ text: "كشفت تقارير وزارة الإدارة المحلية لعام 2024 عن خلل خطير في منظومة الرقابة، حيث فشلت 69% من العينات المفحوصة في مشاريع البنية التحتية (مثل الخلطات الإسفلتية) في تحقيق المواصفات الفنية. هذا الهدر المالي المباشر هو عرض لمرض أعمق يتمثل في ضعف القدرات الفنية والهندسية في البلديات وغياب المحاسبة الفعالة للمقاولين.", style: "Normal" }),

                new Paragraph({ text: "3. التفاوت التنموي: فجوة الفئات", style: "h2" }),
                new Paragraph({ text: "يُظهر التحليل فجوة هائلة بين بلديات الفئة الأولى (مراكز المحافظات) والبلديات الصغرى. بينما تحقق بلديات مثل مأدبا والزرقاء وفراً تشغيلياً يمكن توجيهه للاستثمار، تعاني بلديات الفئة الثالثة من عجز مزمن، وتعتمد كلياً على المنح لتغطية النفقات الجارية، مما يجعل التنمية فيها شبه مستحيلة دون تدخل حكومي جذري.", style: "Normal" }),

                new Paragraph({ text: "4. تحدي النفايات الصلبة", style: "h2" }),
                new Paragraph({ text: `تنتج المملكة أكثر من ${Math.round(kingdomTotals.totalWaste).toLocaleString()} طن من النفايات سنوياً، بمتوسط إنتاج للفرد يبلغ ${kingdomTotals.avgWastePerCapita.toFixed(1)} كغم. تتركز الكميات الأكبر في العاصمة وإربد والزرقاء. كلفة الجمع والنقل تستنزف موازنات البلديات، بينما يظل ملف إعادة التدوير والاستثمار في الطاقة البديلة من النفايات دون المستوى المأمول.`, style: "Normal" }),

                new Paragraph({ text: "5. توصيات استراتيجية", style: "h2" }),
                new Paragraph({ text: "أولاً: إعادة هيكلة مالية شاملة: وقف التوظيف الإداري تماماً، وربط الدعم الحكومي بمعايير كفاءة الأداء وتحصيل الديون المستحقة.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثانياً: وحدة مركزية للعطاءات: إنشاء وحدة فنية مستقلة تشرف على طرح واستلام مشاريع البلديات لضمان الجودة ووقف الهدر.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثالثاً: الدمج الذكي: دمج البلديات المتعثرة مالياً وجغرافياً لتقليل النفقات الإدارية وتوحيد الموارد.", style: "Normal", bullet: { level: 0 } }),
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
                <title>تقرير الإدارة المحلية - 2024</title>
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
                        <h1>التقرير الاستراتيجي: قطاع الإدارة المحلية والبلديات</h1>
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
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">تحليل استراتيجي لقطاع الإدارة المحلية</h1>
                    <p className="text-lg text-gray-700 mt-1">تقييم الأداء المالي، الحوكمة، واستدامة الخدمات البلدية.</p>
                </header>
                
                <div className="space-y-8">
                    {/* NEW 2024 ANALYSIS SECTION */}
                    <div className="space-y-8 pt-4">
                        <div className="flex items-center gap-4 break-inside-avoid no-print">
                            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-100 icon-container"><span className="text-2xl">🚨</span></div>
                            <div><h2 className="text-2xl font-bold text-gray-900">الواقع المالي الحرج: مؤشرات الخطر (2024)</h2></div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 kpi-card-visual">
                            <KpiCard title="مديونية البلديات" value="+632 مليون د.أ" icon="💸" />
                            <KpiCard title="الرواتب من إجمالي الإيرادات" value="70%" icon="💼" />
                            <KpiCard title="نسبة الإيرادات الذاتية" value="36%" icon="📉" />
                            <KpiCard title="فشل عطاءات الجودة" value="~69%" icon="❌" />
                        </div>

                        <Card className="card-container">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">1. أزمة الملاءة المالية والاستقلالية</h3>
                            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                                <p>تعيش البلديات الأردنية أزمة مالية مركبة تهدد قدرتها على الاستمرار في تقديم الخدمات الأساسية. الأرقام صادمة: <strong>مديونية تتجاوز 632 مليون دينار</strong>، وفاتورة رواتب تلتهم <strong>70% من إجمالي الإيرادات</strong> (وتصل في بعض الحالات إلى كامل الدعم الحكومي والإيراد الذاتي). هذا الوضع يعني عملياً أن البلديات تحولت من مؤسسات خدمية تنموية إلى هياكل بيروقراطية مثقلة بالبطالة المقنعة.</p>
                                <p>الأخطر هو <strong>ضعف الاعتماد على الذات (36% فقط)</strong>، مما يكشف عن فشل ذريع في استثمار الأصول البلدية أو تحصيل الديون المستحقة للمواطنين (التي تقدر بعشرات الملايين). هذا الاعتماد المفرط على التحويلات الحكومية (عوائد المحروقات) يجعل موازنات البلديات هشة وغير مستقرة.</p>
                            </div>
                        </Card>

                        <Card className="card-container">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">2. أزمة الحوكمة والهدر في البنية التحتية</h3>
                            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                                <p>لا يقتصر التحدي على نقص المال، بل يتعداه إلى كفاءة إنفاقه. كشفت نتائج الفحوصات الفنية لعام 2024 عن كارثة في إدارة العطاءات: <strong>69% من عينات الخلطات الإسفلتية فشلت في اجتياز فحوصات الجودة</strong>. هذا يعني هدراً مباشراً للمال العام يقدر بالملايين سنوياً، ناهيك عن التكاليف غير المباشرة المترتبة على تدهور الطرق وصيانة المركبات.</p>
                                <p>هذا المؤشر يعكس ضعفاً مؤسسياً في الدوائر الهندسية للبلديات، وغياباً للرقابة الميدانية الفعالة، وربما تواطؤاً في استلام مشاريع غير مطابقة للمواصفات، مما يستدعي تدخلاً رقابياً مركزياً صارماً.</p>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-gray-200">
                        <Card className="card-container">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">3. تباين صارخ في الأداء والكفاءة</h3>
                            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                                <p>يظهر التحليل المالي فجوة تنموية عميقة بين البلديات:</p>
                                <ul className="list-disc list-outside mr-6 space-y-2">
                                    <li><strong>بلديات الفئة الأولى (مراكز المحافظات):</strong> تمتلك مقومات الاستدامة المالية. بلديات مثل <strong>مأدبا والزرقاء</strong> حققت وفراً تشغيلياً إيجابياً، مما مكنها من توجيه جزء من موازنتها للنفقات الرأسمالية. ومع ذلك، تعاني هذه البلديات من ضغط سكاني هائل وتحديات بيئية كبرى.</li>
                                    <li><strong>بلديات الفئة الثانية والثالثة (الأطراف):</strong> تعيش حالة "موت سريري" مالي. تعتمد كلياً على المنح والرواتب، ونسبة الإنفاق التنموي فيها تكاد تكون معدومة (أقل من 12%). الرواتب تلتهم الموازنة بالكامل، مما يحرم المجتمعات المحلية من أي مشاريع تحسن جودة الحياة، ويدفع باتجاه الهجرة نحو المراكز الحضرية.</li>
                                </ul>
                            </div>
                            <div style={{ width: '100%', height: 350 }} className="no-print">
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
                    </div>
                </div>

                {/* Existing Solid Waste Section */}
                <div className="space-y-8 pt-8 border-t border-gray-200">
                    <Card className="card-container">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. تحدي إدارة النفايات الصلبة</h2>
                        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                            تنتج المملكة ما يزيد عن <strong>{Math.round(kingdomTotals.totalWaste).toLocaleString()}</strong> طن من النفايات الصلبة سنوياً، يتركز معظمها في العاصمة وإربد والزرقاء. التحدي لا يكمن فقط في الكمية، بل في كلفة الجمع والنقل التي تستنزف موازنات البلديات (حوالي 60-70 دينار للطن). غياب الفرز من المصدر وضعف الاستثمار في إعادة التدوير يحول النفايات من مورد اقتصادي محتمل (طاقة، سماد) إلى عبء بيئي ومالي ثقيل.
                        </p>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 kpi-card-visual">
                        <Card className="flex flex-col justify-center items-center bg-green-50 break-inside-avoid">
                            <h3 className="text-lg font-semibold text-gray-800">إجمالي النفايات المجمعة (2022)</h3>
                            <p className="text-5xl font-bold text-green-600 my-2">{Math.round(kingdomTotals.totalWaste).toLocaleString()}</p>
                            <p className="text-base text-gray-600">طن سنوياً</p>
                        </Card>
                        <Card className="flex flex-col justify-center items-center bg-green-50 break-inside-avoid">
                            <h3 className="text-lg font-semibold text-gray-800">المعدل الوطني لإنتاج الفرد للنفايات</h3>
                            <p className="text-5xl font-bold text-green-600 my-2">{kingdomTotals.avgWastePerCapita.toFixed(1)}</p>
                            <p className="text-base text-gray-600">كغم / فرد / سنة</p>
                        </Card>
                    </div>
                    <Card className="no-print">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">كمية النفايات الصلبة المجمعة حسب المحافظة (طن - 2022)</h3>
                        <div style={{ width: '100%', height: 350 }}>
                            <SolidWasteChart data={latestData} />
                        </div>
                    </Card>
                </div>

                 <div className="pt-8 mt-8 border-t border-gray-300">
                    <Card className="card-container bg-amber-50 border-amber-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">5. توصيات استراتيجية لصانع القرار</h3>
                        <div className="space-y-6 text-gray-800 text-lg">
                            <div>
                                <h4 className="font-semibold text-lg text-amber-800">الهندسة المالية القسرية</h4>
                                <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                                    <li>وقف التعيينات الإدارية نهائياً لمدة 5 سنوات.</li>
                                    <li>تأسيس وحدة مركزية لتحصيل ديون البلديات بصلاحيات تنفيذية واسعة.</li>
                                    <li>ربط التحويلات الحكومية بمؤشر "كفاءة الإنفاق" وليس فقط عدد السكان.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg text-amber-800">ثورة في إدارة المشاريع</h4>
                                <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                                    <li>سحب صلاحيات طرح العطاءات الكبرى من البلديات غير المؤهلة فنياً وإناطتها ببنك تنمية المدن والقرى أو وزارة الأشغال.</li>
                                    <li>تطبيق نظام "المناقصات الإلكترونية" لضمان الشفافية ومنع التواطؤ.</li>
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold text-lg text-amber-800">الحلول البيئية الذكية</h4>
                                <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                                    <li>خصخصة قطاع النظافة في البلديات الكبرى لرفع الكفاءة وتقليل الكلف التشغيلية.</li>
                                    <li>تحويل مكبات النفايات إلى مشاريع استثمارية لتوليد الطاقة (Biogas) بالشراكة مع القطاع الخاص.</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LocalAdministration;
