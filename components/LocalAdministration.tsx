
import React, { useMemo, useState } from 'react';
import Card from './ui/Card';
import { SOLID_WASTE_DATA } from '../constants/solidWasteData';
import { GOVERNORATES_DATA } from '../constants';
import SolidWasteChart from './charts/SolidWasteChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

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

    const reportContent = [
        {
            title: "1. الملخص التنفيذي والأثر الاستراتيجي",
            content: `يمثل قطاع الإدارة المحلية حجر الزاوية في منظومة الحكم الرشيد والتنمية المناطقية. تظهر قراءة الواقع لعام 2024 أن البلديات الأردنية تمر بمرحلة حرجة تتسم بـ "اختلال التوازن المالي والوظيفي". فبينما يُتوقع منها قيادة التنمية المحلية وجذب الاستثمار، نجدها مثقلة بمديونية تراكمية تجاوزت 632 مليون دينار، وبفاتورة رواتب تلتهم معظم إيراداتها. الأثر الاستراتيجي لهذا الواقع هو تحول البلديات من "مؤسسات تنموية" إلى "أجهزة بيروقراطية" عاجزة عن تقديم خدمات نوعية أو صيانة البنية التحتية، مما يؤثر سلباً على جودة حياة المواطنين وبيئة الأعمال. إن استعادة الدور التنموي للبلديات يتطلب هندسة مالية وإدارية شاملة تعيد ترتيب الأولويات من التوظيف إلى الاستثمار.`
        },
        {
            title: "2. الإطار العام للقطاع والمشهد الديموغرافي",
            content: `تعمل البلديات في بيئة ديموغرافية شديدة التعقيد. النمو السكاني السريع (الطبيعي واللجوء) ضاعف الطلب على الخدمات الأساسية، خاصة النظافة والطرق، دون أن يقابله نمو موازٍ في الإيرادات. ظاهرة "الزحف العمراني العشوائي" (Urban Sprawl) نحو الأراضي الزراعية وأطراف المدن شكلت ضغطاً هائلاً على موازنات البلديات، حيث تضاعفت كلفة مد شبكات الطرق والإنارة وجمع النفايات لخدمة تجمعات سكانية متباعدة وقليلة الكثافة. هذا المشهد يتطلب تفعيل المخططات الشمولية بصرامة للحد من التوسع الأفقي المكلف، وتوجيه النمو السكاني نحو "مدن مدمجة" (Compact Cities) يسهل خدمتها بكفاءة.`
        },
        {
            title: "3. تحليل الأداء التنموي والمؤشرات الرئيسية (KPIs)",
            content: `تُظهر مؤشرات الأداء المالي تبايناً حاداً بين بلديات الفئة الأولى (مراكز المحافظات) والبلديات الصغيرة. تعاني معظم البلديات من تدني نسبة "الاعتماد على الذات" (الإيرادات الذاتية/إجمالي النفقات) التي لا تتجاوز 36% كمعدل وطني، مما يجعلها رهينة للتحويلات الحكومية (عوائد المحروقات). كما أن مؤشر "كفاءة الإنفاق" يدق ناقوس الخطر، حيث تستحوذ الرواتب والأجور على ما يقارب 70-80% من الموازنات الجارية، مما يترك هامشاً ضئيلاً جداً للنفقات الرأسمالية والخدمية. على صعيد الخدمات، تفاوتت كفاءة جمع النفايات، حيث سجلت العاصمة وإربد معدلات جمع مرتفعة، بينما تواجه بلديات الأطراف تحديات لوجستية بسبب تهالك أسطول الآليات ونقص الكوادر الفنية.`
        },
        {
            title: "4. دراسة الأبعاد التنموية وكفاءة الموارد",
            content: `يُنتج الأردن سنوياً ما يزيد عن ${Math.round(kingdomTotals.totalWaste).toLocaleString()} طن من النفايات الصلبة، بمتوسط إنتاج للفرد يبلغ حوالي ${kingdomTotals.avgWastePerCapita.toFixed(1)} كغم. للأسف، لا يزال التعامل مع هذا المورد يتم بعقلية "التخلص والطمر" وليس "التدوير والاستثمار". كفاءة الموارد في هذا القطاع منخفضة جداً، حيث تُهدر فرص اقتصادية هائلة في فرز النفايات وتوليد الطاقة والسماد العضوي. من جهة أخرى، تعاني البلديات من ضعف في إدارة أصولها العقارية والاستثمارية، حيث تؤجر العديد من المخازن والأسواق بأسعار زهيدة لا تعكس قيمتها السوقية، مما يحرم صناديقها من إيرادات مستدامة يمكن أن تغطي جزءاً من العجز.`
        },
        {
            title: "5. تحليل الفجوات والمخاطر والبيئة التنافسية",
            content: `**الفجوة الرقمية:** لا تزال العديد من الخدمات البلدية (رخص مهن، تراخيص بناء) تعتمد على الإجراءات الورقية والبيروقراطية، مما يفتح باباً للفساد الإداري ويطيل أمد المعاملات، مقارنة بأمانة عمان التي قطعت شوطاً في الأتمتة.\n**فجوة المهارات:** تعاني البلديات، خاصة في الأطراف، من نقص حاد في المهندسين والمخططين الحضريين والمحاسبين المؤهلين، مقابل تضخم في الوظائف الإدارية البسيطة والعمالة غير الماهرة.\n**المخاطر:** تتمثل في استمرار تراكم الديون وفوائدها، وتراجع قدرة البلديات على صيانة شبكات تصريف مياه الأمطار مما يزيد مخاطر الفيضانات في الشتاء، وتآكل الثقة بين المواطن والبلدية.`
        },
        {
            title: "6. الأولويات والتوجهات الاستراتيجية للقطاع",
            content: `تتمحور الأولويات الوطنية للنهوض بالقطاع حول:\n1. **الاستقلال المالي:** تحرير البلديات من التبعية المالية من خلال تحسين كفاءة التحصيل (المسقفات، المخالفات) وتمكينها من إقامة مشاريع استثمارية بالشراكة مع القطاع الخاص.\n2. **إدارة النفايات المتكاملة:** التحول نحو منظومة "الاقتصاد الدائري" في إدارة النفايات، وتشجيع الاستثمار في الفرز والتدوير لتقليل كلف الطمر وخلق فرص عمل خضراء.\n3. **التحول الرقمي والمدن الذكية:** تعميم تجربة التحول الإلكتروني لتشمل كافة بلديات المملكة لضمان الشفافية والسرعة، وتبني حلول ذكية في الإنارة والمرور.`
        },
        {
            title: "7. التوصيات التخطيطية ومتطلبات التنفيذ",
            content: `لتحقيق استدامة مالية وخدمية للبلديات، يوصى بتبني الإجراءات التالية:
* **التصنيف الائتماني للبلديات (Municipal Credit Rating):** تطبيق نظام تصنيف ائتماني يربط سقف الاقتراض والمنح الحكومية بمدى "الكفاءة المالية" للبلدية وليس بحجمها، لخلق حافز تنافسي لضبط النفقات وتعظيم الإيرادات الذاتية.
* **وقف التعيينات الإدارية:** فرض حظر شامل على التعيينات الإدارية في البلديات لمدة 5 سنوات، وحصر التوظيف في الوظائف الفنية المتخصصة (مهندسين، مساحين، عمال وطن) حسب الحاجة الفعلية.
* **الاستثمار في الطاقة الشمسية:** تمويل مشاريع لإنشاء مزارع طاقة شمسية تغطي استهلاك البلديات من إنارة الشوارع والمباني، لخفض فاتورة الكهرباء التي تستنزف 20% من الموازنات، وتوجيه الوفر للمشاريع الخدمية.
* **الشراء البلدي الموحد (Unified Procurement):** تأسيس وحدة مركزية للشراء الموحد للبلديات لتأمين الاحتياجات المشتركة (آليات، خلطات إسفلتية، وحدات إنارة) بأسعار جملة تفضيلية وضمان الجودة، مما يقلل الكلف التشغيلية ويضبط الهدر.
* **شركات الخدمات البلدية القابضة:** تحويل مجالس الخدمات المشتركة التقليدية إلى شركات مملوكة للبلديات تعمل بأسس تجارية، لإدارة ملفات النقل، إدارة النفايات، والأسواق المركزية، مما يرفع كفاءة التشغيل ويحرر هذه الخدمات من البيروقراطية.
* **مكبات النفايات الاستثمارية:** طرح عطاءات دولية لتحويل مكبات النفايات الرئيسية إلى مشاريع استثمارية لتوليد الطاقة والغاز الحيوي بنظام (BOT)، مما يحل المشكلة البيئية ويوفر عوائد مالية.`
        }
    ];
    
    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير القطاعي الشامل: الإدارة المحلية 2024";
            
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
                ...reportContent.flatMap(section => [
                    new Paragraph({ text: section.title, style: "h2" }),
                    new Paragraph({ text: section.content, style: "Normal" })
                ])
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
                        font-size: 14pt;
                        line-height: 1.6;
                    }
                    .no-print, .recharts-wrapper, button, select, svg, .icon-container, .kpi-card-visual { display: none !important; }
                    .card-container { box-shadow: none !important; border: none !important; padding: 0 !important; margin-bottom: 20px !important; }
                    h1 { font-size: 24pt; font-weight: bold; text-align: center; border-bottom: 3px solid #000; margin-bottom: 30px; padding-bottom: 10px; }
                    h2 { font-size: 18pt; font-weight: bold; border-bottom: 1px solid #666; margin-top: 30px; margin-bottom: 15px; }
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
                        <h1>التقرير القطاعي الشامل: الإدارة المحلية 2024</h1>
                    </div>
                    <div class="content">
                        ${reportContent.map(section => `
                            <h2>${section.title}</h2>
                            <p>${section.content.replace(/\n/g, '<br/>')}</p>
                        `).join('')}
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
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">التقرير الاستراتيجي: الإدارة المحلية والبلديات</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                        تقييم الأداء المالي، الحوكمة، واستدامة الخدمات البلدية (2024).
                    </p>
                </header>
                
                {reportContent.map((section, idx) => (
                    <Card key={idx} className="card-container">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                            {section.content.split('\n').map((line, i) => {
                                const parts = line.split(/(\*\*.*?\*\*)/g);
                                return (
                                    <p key={i} className="mb-3">
                                        {parts.map((part, j) => 
                                            part.startsWith('**') && part.endsWith('**') 
                                                ? <strong key={j} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong> 
                                                : part
                                        )}
                                    </p>
                                );
                            })}
                        </div>
                        {idx === 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 kpi-card-visual mt-6">
                                <KpiCard title="مديونية البلديات" value="+632 مليون د.أ" icon="💸" />
                                <KpiCard title="الرواتب من إجمالي الإيرادات" value="70%" icon="💼" />
                                <KpiCard title="نسبة الإيرادات الذاتية" value="36%" icon="📉" />
                                <KpiCard title="فشل عطاءات الجودة" value="~69%" icon="❌" />
                            </div>
                        )}
                        {idx === 3 && (
                            <div className="mt-6 no-print">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">كمية النفايات الصلبة المجمعة حسب المحافظة (2022)</h3>
                                <div style={{ width: '100%', height: 350 }}>
                                    <SolidWasteChart data={latestData} />
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default LocalAdministration;
