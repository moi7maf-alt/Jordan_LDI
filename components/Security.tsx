
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

    const reportContent = [
        {
            title: "1. الملخص التنفيذي والأثر الاستراتيجي",
            content: `يُعد الاستقرار الأمني الركيزة الأساسية للتنمية المستدامة والبيئة الحاضنة للاستثمار. شهد عام 2024 تسجيل ${nationalTotals.crimes.toLocaleString()} جريمة و ${nationalTotals.accidents.toLocaleString()} حادث سير على المستوى الوطني. ورغم الكفاءة العملياتية العالية للأجهزة الأمنية التي حققت معدل كشف قياسي للجرائم بلغ ${nationalTotals.clearance_rate.toFixed(1)}%، إلا أن التقرير يرصد تحولات هيكلية في "نوعية الجريمة". يظهر تصاعد في الجرائم المرتبطة بالمخدرات والجرائم الإلكترونية، مما يعكس تطوراً في الأساليب الجرمية يتطلب استجابة أمنية ذكية. الأثر الاستراتيجي لهذه التحولات يتمثل في ارتفاع "الكلفة الاقتصادية للجريمة وحوادث السير" (استنزاف الموارد الصحية، تعطل القوى العاملة)، مما يستوجب تحولاً استراتيجياً من "الأمن التقليدي" إلى "الأمن الوقائي الشامل".`
        },
        {
            title: "2. الإطار العام للقطاع والمشهد الديموغرافي",
            content: `ترتبط الخريطة الأمنية ارتباطاً وثيقاً بالكثافة السكانية والنشاط الاقتصادي. يتركز النشاط الجرمي "الكمي" (السرقات، المشاجرات) في مراكز الثقل السكاني (العاصمة، الزرقاء، إربد) نتيجة الاكتظاظ والضغط على الخدمات. في المقابل، تظهر المناطق الحدودية والصحراوية (المفرق، معان، العقبة) تحديات أمنية "نوعية" ترتبط بالتهريب والاتجار بالمخدرات، مستفيدة من اتساع الرقعة الجغرافية وقلة الكثافة السكانية. ديموغرافياً، تشكل فئة الشباب (18-30 سنة) النسبة الأكبر من مرتكبي الجرائم وضحايا حوادث السير، مما يربط الملف الأمني بملفات البطالة والفراغ، ويجعل من "الاستثمار في الشباب" أداة للوقاية الأمنية.`
        },
        {
            title: "3. تحليل الأداء التنموي والمؤشرات الرئيسية (KPIs)",
            content: `يكشف مؤشر "معدل الجريمة لكل 100 ألف نسمة" عن تباينات مناطقية تستدعي الانتباه. تسجل **العقبة** أعلى معدل جريمة وطني (49 جريمة لكل 100 ألف نسمة)، وهو رقم يعكس طبيعتها كمنطقة اقتصادية وسياحية ونقطة عبور، مما يجعلها بيئة نشطة للجرائم المالية والتهريب. تليها مناطق البادية (35-42 جريمة)، مما يشير لتحديات ضبط الأمن في المناطق المفتوحة. في المقابل، تحافظ محافظات الشمال والوسط (إربد، عجلون، السلط) على معدلات جريمة منخفضة (11-14 جريمة)، مما يعكس فعالية الضبط الاجتماعي وتماسك البنية العشائرية كعامل مساند للأمن الرسمي. نسبة اكتشاف الجريمة (Clearance Rate) تظل مرتفعة جداً (فوق 90%) في كافة المحافظات، مما يؤكد كفاءة التحقيق الجنائي.`
        },
        {
            title: "4. دراسة الأبعاد التنموية وكفاءة الموارد",
            content: `تمثل حوادث السير "حرباً صامتة" تستنزف الموارد الوطنية. سجلت العاصمة 5,113 حادثاً في عام واحد، وهو رقم يعكس أزمة مرورية خانقة وسلوكيات قيادة متهورة. لكن الخطورة الحقيقية (معدلات الوفيات والإصابات البليغة) تتركز على الطرق الخارجية في محافظات الجنوب (الصحراوي) والمفرق. الحوادث في هذه المناطق غالباً ما تكون مميتة بسبب السرعات العالية وحركة الشحن. كفاءة إدارة الموارد الأمنية تتطلب إعادة توجيه دوريات السير والردار نحو "النقاط السوداء" على الطرق الخارجية بدلاً من التركيز المفرط على المخالفات البسيطة داخل المدن، واستخدام التكنولوجيا لتعويض النقص البشري في تغطية الطرق الطويلة.`
        },
        {
            title: "5. تحليل الفجوات والمخاطر والبيئة التنافسية",
            content: `**فجوة المخدرات:** تُظهر البيانات ارتفاعاً مقلقاً في قضايا المخدرات في المناطق الحدودية (المفرق، العقبة، الرمثا). الخطر لا يكمن فقط في التعاطي، بل في تحول هذه المناطق إلى ممرات للتهريب الإقليمي، مما يهدد الأمن الاجتماعي والاقتصادي.\n**الفجوة التكنولوجية:** بينما تتمتع العاصمة بمنظومة رقابة إلكترونية متطورة (كاميرات ذكية، غرف سيطرة)، تفتقر العديد من المدن والمناطق الصناعية في المحافظات لهذه التجهيزات، مما يسهل ارتكاب الجرائم الليلية (السرقات) دون رصد.\n**المخاطر:** الجرائم الإلكترونية (الابتزاز، الاحتيال المالي) التي تنمو بتسارع يفوق الجرائم التقليدية، وتستهدف فئات المجتمع كافة دون اعتبار للجغرافيا.`
        },
        {
            title: "6. الأولويات والتوجهات الاستراتيجية للقطاع",
            content: `تتمثل الأولويات الاستراتيجية في:\n1. **الأمن الذكي:** التوسع في نشر منظومات المراقبة الذكية (Smart CCTV) وتحليل البيانات الضخمة للتنبؤ بالجريمة قبل وقوعها (Predictive Policing) في المناطق الساخنة.\n2. **تحصين الحدود:** تعزيز المنظومة الأمنية والتقنية في المعابر والمناطق الحدودية (خاصة في الشمال والشرق) لمكافحة تهريب المخدرات والسلاح.\n3. **السلامة المرورية المستدامة:** معالجة "النقاط السوداء" هندسياً على الطرق، وتغليظ العقوبات على المخالفات الخطرة (السرعة الجنونية، قطع الإشارة) للحد من النزيف البشري.`
        },
        {
            title: "7. التوصيات التخطيطية ومتطلبات التنفيذ",
            content: `لتعزيز المنظومة الأمنية الشاملة، يوصى بتبني الإجراءات التالية:
* **استراتيجية وطنية لمكافحة المخدرات:** إطلاق حملة وطنية شاملة (أمنية، توعوية، علاجية) تركز على المناطق الحدودية والجامعات، وإنشاء مراكز علاج إدمان متخصصة في أقاليم الشمال والجنوب لتوفير العلاج والسرية.
* **وحدات الجرائم الإلكترونية في المحافظات:** إنشاء أقسام متخصصة للجرائم الإلكترونية في كافة مديريات الشرطة بالمحافظات، مزودة بكوادر فنية وبرمجيات حديثة، لسرعة الاستجابة لشكاوى المواطنين وحمايتهم من الابتزاز.
* **منظومة التنبؤ المروري الاستباقي:** الانتقال من "رصد المخالفات" إلى "منع الحوادث" عبر استخدام الذكاء الاصطناعي لتحليل بيانات المرور والطقس لتحديد "بؤر الخطر اللحظية"، وتوجيه الدوريات والتحذيرات للسائقين بشكل استباقي.
* **الشرطة المجتمعية:** تفعيل دور لجان الأحياء والشرطة المجتمعية في المناطق المكتظة (الزرقاء، مخيمات اللاجئين) لرصد الظواهر السلبية وحل النزاعات الصغيرة ودياً قبل تفاقمها.
* **الإنارة الأمنية:** تخصيص موازنات من مجالس المحافظات لإنارة الطرق الفرعية والمناطق الصناعية والتجارية المعزولة بأنظمة LED ذكية، للحد من فرص ارتكاب جرائم السرقة والاعتداء.
* **التأهيل والإصلاح:** التوسع في برامج التدريب المهني والتشغيل داخل مراكز الإصلاح والتأهيل، وتفعيل العقوبات البديلة (الخدمة المجتمعية) لغير الخطرين، لضمان عدم عودتهم للجريمة.`
        }
    ];

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير القطاعي الشامل: الوضع الأمني 2024";
            
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
                <title>تقرير الوضع الأمني - 2024</title>
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
                        <h1>التقرير القطاعي الشامل: الوضع الأمني 2024</h1>
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
                <header className="text-center border-b border-gray-200 dark:border-gray-700 pb-8 no-print">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">التقرير الاستراتيجي للوضع الأمني والسلامة العامة 2024</h1>
                    <p className="text-lg text-gray-700 dark:text-gray-400 mt-2 max-w-3xl mx-auto">
                        تشخيص دقيق للحالة الأمنية، أنماط الجريمة، وتحديات السلامة المرورية.
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 kpi-card-visual mt-6">
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
                        )}
                        {idx === 2 && (
                            <div className="mt-6 no-print" style={{ width: '100%', height: 450 }}>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">مؤشر الأمان المركب حسب المحافظة</h3>
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
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Security;
