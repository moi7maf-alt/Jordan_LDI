
import React, { useMemo, useState } from 'react';
import Card from './ui/Card';
import { TRAFFIC_ACCIDENTS_2024 } from '../constants/trafficAccidentsData';
import { CRIME_DATA_2024 } from '../constants/crimeData';
import { POPULATION_DATA_2024 } from '../constants/populationData';
import CrimeBreakdownChart from './charts/CrimeBreakdownChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

const Security: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const securityIndicators = useMemo(() => {
        const governoratePoliceRegionMapping: { [key: string]: string[] } = {
            Amman: ['وسط عمان', 'جنوب عمان', 'شمال عمان', 'شرق عمان', 'البادية الوسطى'],
            Balqa: ['البلقاء', 'غرب البلقاء'],
            Zarqa: ['الزرقاء', 'الرصيفة'],
            Madaba: ['مأدبا'],
            Irbid: ['اربد', 'غرب اربد', 'الرمثا'],
            Mafraq: ['المفرق', 'البادية الشمالية'],
            Jarash: ['جرش'],
            Ajloun: ['عجلون'],
            Karak: ['الكرك'],
            Tafilah: ['الطفيلة'],
            Maan: ['معان', 'غرب معان', 'البادية الجنوبية'],
            Aqaba: ['العقبة']
        };

        const crimeDataMap = new Map(CRIME_DATA_2024.map(d => [d.region, d]));

        const governorateData = POPULATION_DATA_2024.filter(p => p.area > 0).map(pop => {
            const policeRegionsForGov = governoratePoliceRegionMapping[pop.name] || [];
            
            const aggregatedCrimeData = policeRegionsForGov.reduce((acc, regionName) => {
                const regionData = crimeDataMap.get(regionName);
                if (regionData) {
                    acc.total_crimes += regionData.total_crimes;
                    acc.total_drug_crimes += regionData.drug_crimes_total;
                    acc.weighted_clearance += regionData.total_crimes * (regionData.clearance_rate / 100);
                }
                return acc;
            }, { total_crimes: 0, total_drug_crimes: 0, weighted_clearance: 0 });
            
            const { total_crimes, total_drug_crimes, weighted_clearance } = aggregatedCrimeData;

            const trafficData = TRAFFIC_ACCIDENTS_2024.find(t => t.name === pop.name);
            const total_accidents = trafficData?.total || 0;
            
            const crime_rate = (total_crimes / pop.population) * 100000;
            const accident_rate = ((trafficData?.total || 0) / pop.population) * 100000;
            const drug_crime_rate = (total_drug_crimes / pop.population) * 100000;
            const clearance_rate = total_crimes > 0 ? (weighted_clearance / total_crimes) * 100 : 0;

            return {
                name: pop.name,
                name_ar: pop.name_ar,
                population: pop.population,
                total_crimes,
                total_accidents,
                total_drug_crimes,
                crime_rate: isNaN(crime_rate) ? 0 : crime_rate,
                accident_rate: isNaN(accident_rate) ? 0 : accident_rate,
                drug_crime_rate: isNaN(drug_crime_rate) ? 0 : drug_crime_rate,
                clearance_rate: isNaN(clearance_rate) ? 0 : clearance_rate,
            };
        });

        const crimeRates = governorateData.map(g => g.crime_rate).filter(v => v > 0);
        const maxCrimeRate = Math.max(...crimeRates);
        const minCrimeRate = Math.min(...crimeRates);

        const accidentRates = governorateData.map(g => g.accident_rate).filter(v => v > 0);
        const maxAccidentRate = Math.max(...accidentRates);
        const minAccidentRate = Math.min(...accidentRates);

        const clearanceRates = governorateData.map(g => g.clearance_rate).filter(v => v > 0);
        const maxClearanceRate = Math.max(...clearanceRates);
        const minClearanceRate = Math.min(...clearanceRates);

        const withScores = governorateData.map(g => {
            const crimeRange = maxCrimeRate - minCrimeRate;
            const accidentRange = maxAccidentRate - minAccidentRate;
            const clearanceRange = maxClearanceRate - minClearanceRate;

            const crimeScore = crimeRange > 0 ? ((maxCrimeRate - g.crime_rate) / crimeRange) * 40 : 40; 
            const accidentScore = accidentRange > 0 ? ((maxAccidentRate - g.accident_rate) / accidentRange) * 30 : 30; 
            const clearanceScore = clearanceRange > 0 ? ((g.clearance_rate - minClearanceRate) / clearanceRange) * 30 : 30; 
            
            const totalScore = crimeScore + accidentScore + clearanceScore;
            return { ...g, totalScore: isNaN(totalScore) ? 0 : totalScore };
        });

        return withScores.sort((a, b) => b.totalScore - a.totalScore);
    }, []);
    
    const nationalTotals = useMemo(() => {
         const totals = securityIndicators.reduce((acc, gov) => {
            acc.crimes += gov.total_crimes;
            acc.accidents += gov.total_accidents;
            acc.population += gov.population;
            acc.weightedClearance += gov.total_crimes * (gov.clearance_rate / 100);
            return acc;
        }, { crimes: 0, accidents: 0, population: 0, weightedClearance: 0 });

        return {
            crimes: totals.crimes,
            accidents: totals.accidents,
            clearance_rate: totals.crimes > 0 ? (totals.weightedClearance / totals.crimes) * 100 : 0
        };
    }, [securityIndicators]);

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير الأمني الاستراتيجي 2024";
            
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
                
                new Paragraph({ text: "1. مقدمة استراتيجية", style: "h2" }),
                new Paragraph({ text: `شهد عام 2024 تسجيل ${nationalTotals.crimes.toLocaleString()} جريمة و ${nationalTotals.accidents.toLocaleString()} حادث سير. يعكس التقرير حالة من الاستقرار الأمني العام، مع معدل كشف للجرائم بلغ ${nationalTotals.clearance_rate.toFixed(1)}%، مما يدل على كفاءة عالية للأجهزة الأمنية. ومع ذلك، تبرز تحديات نوعية تتعلق بالجرائم المستحدثة وحوادث السير التي تستنزف الموارد البشرية والاقتصادية.`, style: "Normal" }),

                new Paragraph({ text: "2. الجريمة: تحليل النوع والتوزيع الجغرافي", style: "h2" }),
                new Paragraph({ text: "الجريمة العامة: تسجل العاصمة والبلقاء معدلات جريمة مرتفعة نسبياً عند قياسها بعدد السكان، وهو انعكاس طبيعي للتحضر والكثافة. ومع ذلك، فإن نسب الاكتشاف المرتفعة (التي تتجاوز 96% في معظم الأقاليم) تؤكد على كفاءة المنظومة الشرطية والتحقيقية.", style: "Normal" }),
                new Paragraph({ text: "التهديد النوعي (المخدرات): يُعد هذا الملف الأخطر استراتيجياً. تظهر بيانات العقبة (معدل 49 جريمة مخدرات لكل 100 ألف نسمة) والمفرق مؤشرات مقلقة للغاية. العقبة كميناء بحري، والمفرق كمنطقة حدودية برية شاسعة، لا تعانيان فقط من 'التعاطي' بل تشكلان خطوط تماس لجرائم 'الاتجار والتهريب'. ارتفاع المعدلات هنا ليس مجرد خلل اجتماعي، بل تهديد للأمن الوطني يتطلب مقاربة تتجاوز المكافحة الشرطية إلى الجهد الاستخباري وضبط الحدود.", style: "Normal" }),

                new Paragraph({ text: "3. السلامة المرورية: حرب الطرق الصامتة", style: "h2" }),
                new Paragraph({ text: "تُشير البيانات إلى أن حوادث السير تستنزف الموارد بشكل يفوق الجرائم الجنائية في بعض المناطق. بينما تسجل العاصمة العدد الأكبر من الحوادث (5,113 حادث)، فإن 'خطورة' الحوادث تتركز في محافظات الجنوب وعلى الطرق الخارجية (العقبة: 49 حادث لكل 100 ألف نسمة)، حيث السرعات العالية والشاحنات الثقيلة تحول أي حادث إلى كارثة مميتة. في المدن المكتظة كإربد والزرقاء، تبرز حوادث 'الدهس' كظاهرة مقلقة تعكس ضعف البنية التحتية للمشاة.", style: "Normal" }),

                new Paragraph({ text: "4. التوصيات الاستراتيجية", style: "h2" }),
                new Paragraph({ text: "أولاً: تعزيز المنظومة الأمنية في العقبة والمفرق بتقنيات مسح متقدمة (X-ray scanners) وزيادة الكوادر الاستخبارية لتفكيك شبكات التهريب.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثانياً: توظيف خوارزميات الذكاء الاصطناعي لتحليل أنماط الجريمة في بؤر التوتر (Hotspots) في العاصمة والزرقاء، وتوجيه الدوريات استباقياً.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثالثاً: توسيع نطاق الرقابة الآلية (الكاميرات الذكية) لرصد المخالفات الخطرة (السرعة، الهاتف) على الطرق الخارجية المؤدية للجنوب.", style: "Normal", bullet: { level: 0 } }),
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
                <title>تقرير الوضع الأمني - 2024</title>
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
                        <h1>التقرير الأمني الاستراتيجي: الجريمة والسلامة العامة</h1>
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
             <div className="flex justify-end items-center no-print gap-4">
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
                <header className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">التقرير الاستراتيجي للوضع الأمني والسلامة العامة 2024</h1>
                    <p className="text-lg text-gray-700 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                        يُقدم هذا التقرير تشخيصاً دقيقاً ومعمقاً للحالة الأمنية في المملكة، مستنداً إلى بيانات مديرية الأمن العام لعام 2024.
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 kpi-card-visual">
                    <Card className="card-container flex flex-col justify-center items-center text-center break-inside-avoid">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300">إجمالي الجرائم (2024)</h3>
                        <p className="text-3xl font-bold text-red-500 my-2">{nationalTotals.crimes.toLocaleString()}</p>
                    </Card>
                     <Card className="card-container flex flex-col justify-center items-center text-center break-inside-avoid">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300">إجمالي حوادث السير (2024)</h3>
                        <p className="text-3xl font-bold text-orange-500 my-2">{nationalTotals.accidents.toLocaleString()}</p>
                    </Card>
                     <Card className="card-container flex flex-col justify-center items-center text-center break-inside-avoid">
                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300">المعدل الوطني لاكتشاف الجرائم</h3>
                        <p className="text-3xl font-bold text-green-500 my-2">{nationalTotals.clearance_rate.toFixed(1)}%</p>
                    </Card>
                </div>

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. مؤشر الأمان المجتمعي المركب</h2>
                    <div className="text-gray-800 dark:text-gray-300 leading-relaxed text-lg">
                        <p>
                            لتوفير أداة تقييم موحدة، قمنا بتطوير "مؤشر الأمان المجتمعي" الذي يدمج ثلاثة أبعاد حرجة: كثافة الجريمة (معدل الجريمة لكل 100 ألف نسمة)، خطورة الطرق (معدل الحوادث)، وفاعلية الردع (معدل اكتشاف الجريمة). يكشف المؤشر عن تفوق أمني لمحافظات <strong>{securityIndicators[0].name_ar}</strong> و<strong>{securityIndicators[1].name_ar}</strong>، بينما تواجه محافظات <strong>{securityIndicators[securityIndicators.length - 1].name_ar}</strong> و<strong>{securityIndicators[securityIndicators.length - 2].name_ar}</strong> تحديات هيكلية تتطلب حزماً أمنية خاصة.
                        </p>
                    </div>
                    <div className="mt-6 no-print" style={{ width: '100%', height: 450 }}>
                        <ResponsiveContainer>
                            <BarChart data={securityIndicators} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name_ar" interval={0} angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12, fill: '#1f2937' }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#1f2937' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem', color: '#fff' }} formatter={(value: number) => [value.toFixed(1), 'الدرجة']} />
                                <Bar dataKey="totalScore" name="درجة الأمان" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="totalScore" position="top" formatter={(value: number) => value.toFixed(1)} style={{ fill: '#1f2937', fontSize: '11px' }} />
                                    {securityIndicators.map((entry) => (<Cell key={entry.name} fill={entry.totalScore > 60 ? '#10b981' : entry.totalScore > 40 ? '#f59e0b' : '#ef4444'} />))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. الجريمة: تحليل النوع والتوزيع الجغرافي</h2>
                    <div className="text-gray-800 dark:text-gray-300 leading-relaxed text-lg">
                        <p className="mb-4">
                            <strong>الجريمة العامة:</strong> تسجل العاصمة والبلقاء معدلات جريمة مرتفعة نسبياً عند قياسها بعدد السكان، وهو انعكاس طبيعي للتحضر والكثافة. ومع ذلك، فإن نسب الاكتشاف المرتفعة (التي تتجاوز 96% في معظم الأقاليم) تؤكد على كفاءة المنظومة الشرطية والتحقيقية وقدرتها على احتواء الجريمة التقليدية.
                        </p>
                        <p>
                            <strong>التهديد النوعي (المخدرات):</strong> يُعد هذا الملف الأخطر استراتيجياً. تظهر بيانات <strong>العقبة</strong> (معدل 49 جريمة مخدرات لكل 100 ألف نسمة) و<strong>المفرق</strong> مؤشرات مقلقة للغاية. العقبة كميناء بحري، والمفرق كمنطقة حدودية برية شاسعة، لا تعانيان فقط من "التعاطي" بل تشكلان خطوط تماس لجرائم "الاتجار والتهريب". ارتفاع المعدلات هنا ليس مجرد خلل اجتماعي، بل تهديد للأمن الوطني يتطلب مقاربة تتجاوز المكافحة الشرطية إلى الجهد الاستخباري وضبط الحدود.
                        </p>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">3. السلامة المرورية: حرب الطرق الصامتة</h2>
                    <div className="text-gray-800 dark:text-gray-300 leading-relaxed text-lg">
                        <p>
                            تُشير البيانات إلى أن حوادث السير تستنزف الموارد البشرية والاقتصادية بشكل يفوق الجرائم الجنائية في بعض المناطق. بينما تسجل العاصمة العدد الأكبر من الحوادث (بسبب الازدحام)، فإن "خطورة" الحوادث تتركز في محافظات الجنوب (معان، العقبة) وعلى الطرق الخارجية، حيث السرعات العالية والشاحنات الثقيلة تحول أي حادث إلى كارثة مميتة. في المدن المكتظة كإربد والزرقاء، تبرز حوادث "الدهس" كظاهرة مقلقة تعكس ضعف البنية التحتية للمشاة والثقافة المرورية.
                        </p>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. التوصيات الاستراتيجية والتدخلات المقترحة</h2>
                    <div className="space-y-6 text-lg">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">أولاً: الأمن الجنائي ومكافحة المخدرات</h3>
                            <ul className="list-disc list-outside mr-6 space-y-2 mt-2 text-gray-800 dark:text-gray-300">
                                <li><strong>استراتيجية الحدود والموانئ:</strong> تعزيز المنظومة الأمنية في العقبة والمفرق بتقنيات مسح متقدمة (X-ray scanners) وزيادة الكوادر الاستخبارية لتفكيك شبكات التهريب قبل وصولها للمجتمع.</li>
                                <li><strong>الشرطة التنبؤية:</strong> توظيف خوارزميات الذكاء الاصطناعي لتحليل أنماط الجريمة في بؤر التوتر (Hotspots) في العاصمة والزرقاء، وتوجيه الدوريات استباقياً لمنع الجريمة قبل وقوعها.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ثانياً: الأمن المجتمعي والوقاية</h3>
                            <ul className="list-disc list-outside mr-6 space-y-2 mt-2 text-gray-800 dark:text-gray-300">
                                <li><strong>تحصين الشباب:</strong> إطلاق برامج توعية غير تقليدية في المدارس والجامعات في المناطق الأكثر تأثراً بالمخدرات، تركز على بناء المهارات الحياتية والحصانة النفسية.</li>
                                <li><strong>العدالة التصالحية:</strong> التوسع في تطبيق العقوبات البديلة للجرائم البسيطة وغير الخطرة، لتقليل العود للجريمة وتخفيف الضغط على مراكز الإصلاح.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ثالثاً: السلامة المرورية الذكية</h3>
                            <ul className="list-disc list-outside mr-6 space-y-2 mt-2 text-gray-800 dark:text-gray-300">
                                <li><strong>هندسة السلامة:</strong> إجراء تدقيق سلامة مرورية (Road Safety Audit) عاجل للنقاط السوداء التي تتكرر فيها حوادث الدهس في إربد والزرقاء، وفصل حركة المشاة عن المركبات.</li>
                                <li><strong>الرقابة الذكية:</strong> توسيع نطاق الرقابة الآلية (الكاميرات الذكية) لرصد المخالفات الخطرة (السرعة، الهاتف، المسارب) على الطرق الخارجية المؤدية للجنوب والمفرق لردع السلوكيات المتهورة.</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Security;
