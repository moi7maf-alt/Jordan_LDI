
import React, { useMemo, useState } from 'react';
import Card from './ui/Card';
import { TRAFFIC_ACCIDENTS_2024 } from '../constants/trafficAccidentsData';
import { CRIME_DATA_2024 } from '../constants/crimeData';
import { POPULATION_DATA_2024 } from '../constants/populationData';
import CrimeBreakdownChart from './charts/CrimeBreakdownChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

type ContentBlock = { type: 'h1' | 'h2' | 'h3' | 'p' | 'list-item'; text: string; };

const Security: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const securityIndicators = useMemo(() => {
        // Defines the mapping from a governorate to its constituent police directorates/regions.
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

        // Aggregate police directorate data into governorate-level data.
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
            const accident_rate = (total_accidents / pop.population) * 100000;
            const drug_crime_rate = (total_drug_crimes / pop.population) * 100000;
            // Calculate the weighted average for the clearance rate
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

        // Calculate Safety Score
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


    const generateReportContent = (): ContentBlock[] => [
        { type: 'h1', text: "تقرير تحليلي استراتيجي للوضع الأمني في المملكة" },
        { type: 'p', text: "يقدم هذا التقرير نظرة شاملة ومعمقة على مؤشرات الجريمة والسلامة العامة في محافظات الأردن لعام 2024، بهدف تحديد مواطن القوة والتحديات، وتقديم توصيات استراتيجية لدعم صناع القرار في تعزيز الأمن المجتمعي." },
        
        { type: 'h2', text: "1. مؤشر الأمان المجتمعي وتصنيف المحافظات" },
        { type: 'p', text: "لتقديم رؤية متكاملة، تم تطوير 'مؤشر الأمان المجتمعي' الذي يدمج عدة مقاييس رئيسية: معدل الجريمة (لكل 100 ألف نسمة)، معدل حوادث السير (لكل 100 ألف نسمة)، ومعدل اكتشاف الجرائم. يمنح المؤشر درجة لكل محافظة، مما يتيح تصنيفاً موضوعياً لمستوى الأمان النسبي." },
        { type: 'p', text: `تتصدر القائمة محافظة **${securityIndicators[0].name_ar}** كالأكثر أماناً، تليها **${securityIndicators[1].name_ar}** و **${securityIndicators[2].name_ar}**. هذا الأداء المتميز يعكس انخفاضاً نسبياً في معدلات الجريمة والحوادث، وكفاءة عالية في اكتشاف الجرائم. في المقابل، تظهر محافظات مثل **${securityIndicators[securityIndicators.length - 1].name_ar}** تحديات أكبر تتطلب تدخلاً موجهاً.` },

        { type: 'h2', text: "2. تحليل معمق لمؤشرات الجريمة" },
        { type: 'p', text: "عند تحليل معدلات الجريمة المنسوبة لعدد السكان، تظهر **العاصمة** أعلى معدل، وهو أمر متوقع نظراً للكثافة السكانية والنشاط الاقتصادي. ومع ذلك، يبرز مؤشر 'اكتشاف الجرائم' كفاءة عالية للأجهزة الأمنية في العاصمة، مما يعكس قدرة على التعامل مع حجم الجرائم. اللافت للنظر هو ارتفاع معدل جرائم المخدرات في **العقبة**، والذي قد يرتبط بموقعها كميناء حدودي، مما يجعلها نقطة عبور ومكافحة رئيسية." },
        
        { type: 'h2', text: "3. تحليل السلامة المرورية" },
        { type: 'p', text: "تتركز حوادث السير بشكل كبير في المحافظات ذات الكثافة السكانية العالية والطرق الحيوية مثل **العاصمة** و**إربد**. تحليل أنواع الحوادث يكشف أن حوادث 'الصدم' و'الدهس' تشكل النسبة الأكبر، مما يستدعي التركيز على السلامة داخل المدن وحماية المشاة." },

        { type: 'h2', text: "4. توصيات استراتيجية لتعزيز الأمن المجتمعي" },
        { type: 'h3', text: "أ. تعزيز القدرات الأمنية الموجهة:" },
        { type: 'list-item', text: "توجيه الموارد: تركيز الجهود والموارد البشرية والتقنية في المحافظات ذات معدلات الجريمة الأعلى (مثل العاصمة والزرقاء) مع تحليل جغرافي دقيق 'للبؤر الساخنة' داخل هذه المحافظات." },
        { type: 'list-item', text: "مكافحة المخدرات: تكثيف العمليات الاستخباراتية والرقابية في المنافذ الحدودية والمناطق الاستراتيجية كالعقبة والمفرق لمكافحة جرائم الاتجار." },
        { type: 'h3', text: "ب. الوقاية المجتمعية:" },
        { type: 'list-item', text: "برامج الشباب: إطلاق برامج توعية ومبادرات شبابية في المناطق التي يرتفع بها معدل جرائم الأحداث، بالتعاون مع وزارة التنمية الاجتماعية والمنظمات المحلية." },
        { type: 'list-item', text: "الشراكة المجتمعية: تفعيل دور لجان الشرطة المجتمعية في الأحياء لتعزيز الثقة وفتح قنوات تواصل مباشرة للإبلاغ عن المخاطر الأمنية." },
        { type: 'h3', text: "ج. السلامة المرورية:" },
        { type: 'list-item', text: "هندسة الطرق: مراجعة وتطوير البنية التحتية للطرق في النقاط التي تتكرر بها الحوادث، خاصة فيما يتعلق بممرات المشاة والإشارات الضوئية." },
        { type: 'list-item', text: "حملات توعية: إطلاق حملات إعلامية موجهة ومبتكرة تستهدف السلوكيات الأكثر تسبباً للحوادث (مثل استخدام الهاتف أثناء القيادة) في المحافظات الأكثر تأثراً." },
        { type: 'h3', text: "د. التكنولوجيا والبيانات:" },
        { type: 'list-item', text: "التحليل التنبؤي: الاستثمار في أنظمة تحليل البيانات والذكاء الاصطناعي للتنبؤ بالمناطق والأوقات التي يرتفع فيها احتمال وقوع الجرائم، مما يسمح بتوجيه الدوريات بشكل استباقي وفعال." },
    ];
    
    const analysisText = generateReportContent();

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "تقرير الوضع الأمني في المملكة 2024";
            
            const docStyles: IStylesOptions = {
                default: { document: { run: { font: "Arial", size: 24, rightToLeft: true } } },
                paragraphStyles: [
                    { id: "Normal", name: "Normal", run: { size: 24 }, paragraph: { spacing: { after: 120 }, alignment: AlignmentType.RIGHT } },
                    { id: "h1", name: "h1", run: { size: 32, bold: true, color: "2E74B5" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } } },
                    { id: "h2", name: "h2", run: { size: 28, bold: true, color: "4F81BD" }, paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.RIGHT } },
                    { id: "h3", name: "h3", run: { size: 26, bold: true, color: "1F497D" }, paragraph: { spacing: { before: 180, after: 120 }, alignment: AlignmentType.RIGHT } },
                    { id: "list-item", name: "list-item", run: { size: 24 }, paragraph: { bullet: { level: 0 }, spacing: { after: 120 }, alignment: AlignmentType.RIGHT } },
                ],
            };

            const paragraphs: Paragraph[] = analysisText.map(block => {
                return new Paragraph({
                    children: [new TextRun(block.text)],
                    style: block.type,
                    bidirectional: true,
                });
            });

            // Add KPI summary at the beginning
            const kpiSummary = [
                new Paragraph({ text: `إجمالي الجرائم: ${nationalTotals.crimes.toLocaleString()}`, style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: `إجمالي حوادث السير: ${nationalTotals.accidents.toLocaleString()}`, style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: `معدل الاكتشاف: ${nationalTotals.clearance_rate.toFixed(1)}%`, style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "", style: "Normal" }) // Spacer
            ];

            const doc = new Document({
                styles: docStyles,
                sections: [{ 
                    properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, 
                    children: [ ...kpiSummary, ...paragraphs] 
                }],
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
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                    body {
                        font-family: 'Cairo', sans-serif;
                        direction: rtl;
                        padding: 40px;
                        background: white !important;
                        color: black !important;
                        font-size: 14pt;
                    }
                    * {
                        box-shadow: none !important;
                        background: transparent !important;
                        border-radius: 0 !important;
                        border: none !important;
                    }
                    .grid, .flex { display: block !important; }
                    .no-print, .recharts-wrapper, button { display: none !important; }
                    
                    .card-container {
                        padding: 0 !important;
                        margin: 0 0 20px 0 !important;
                        border-bottom: 1px solid #eee !important;
                    }
                    
                    h1 { font-size: 26pt !important; text-align: center; border-bottom: 2px solid black; margin-bottom: 20px; }
                    h2 { font-size: 20pt !important; border-bottom: 1px solid #ccc; margin-top: 30px; break-after: avoid; }
                    h3 { font-size: 18pt !important; color: #333; margin-top: 20px; break-after: avoid; }
                    p, li { font-size: 14pt !important; line-height: 1.6; text-align: justify; }
                    
                    @page { size: A4; margin: 20mm; }
                </style>
            </head>
        `;

        const htmlContent = `
            <html>
                ${headContent}
                <body>
                    <div class="report-header">
                        <h1>تقرير تحليلي استراتيجي للوضع الأمني في المملكة</h1>
                    </div>
                    <div class="content">
                        ${reportElement.innerHTML}
                    </div>
                     <div class="report-footer" style="text-align: center; margin-top: 50px; font-size: 10pt; color: #666;">
                        وزارة الداخلية - منظومة التحليل التنموي
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                </button>
                <button onClick={handleNativePrint} className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                        طباعة / حفظ PDF (وثيقة نظيفة)
                </button>
            </div>
            
            <div id="report-content" className="space-y-8">
                <header className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{analysisText[0].text}</h1>
                    <p className="text-lg text-gray-700 dark:text-gray-400 mt-2 max-w-3xl mx-auto">{analysisText[1].text}</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{analysisText[2].text}</h2>
                    <div className="prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: `<p>${analysisText[3].text}</p><p>${analysisText[4].text}</p>`}}></div>
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

                <div className="page-break" />

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{analysisText[5].text}</h2>
                    <div className="prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: `<p>${analysisText[6].text}</p>`}}></div>
                </Card>

                <Card className="card-container">
                    <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-4">معدل الجريمة (لكل 100 ألف نسمة)</h3>
                    <div style={{ width: '100%', height: 450 }} className="no-print">
                        <ResponsiveContainer>
                            <BarChart data={[...securityIndicators].sort((a,b) => b.crime_rate - a.crime_rate)} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name_ar" interval={0} angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12, fill: '#1f2937' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#1f2937' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)'}} formatter={(value: number) => [value.toFixed(1), 'معدل الجريمة']} />
                                <Bar dataKey="crime_rate" fill="#be123c" name="معدل الجريمة" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="crime_rate" position="top" formatter={(value: number) => value.toFixed(1)} style={{ fill: '#1f2937', fontSize: '11px' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="card-container">
                    <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-4">معدل اكتشاف الجرائم (%)</h3>
                    <div style={{ width: '100%', height: 450 }} className="no-print">
                        <ResponsiveContainer>
                            <BarChart data={[...securityIndicators].sort((a,b) => b.clearance_rate - a.clearance_rate)} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name_ar" interval={0} angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12, fill: '#1f2937' }} />
                                <YAxis domain={[80, 100]} unit="%" tick={{ fontSize: 12, fill: '#1f2937' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)'}} formatter={(value: number) => [`${value.toFixed(1)}%`, 'معدل الاكتشاف']} />
                                <Bar dataKey="clearance_rate" fill="#059669" name="معدل الاكتشاف" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="clearance_rate" position="top" formatter={(value: number) => `${value.toFixed(1)}%`} style={{ fill: '#1f2937', fontSize: '11px' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="card-container">
                    <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-2">تحليل جرائم المخدرات حسب المنطقة الأمنية (2024)</h3>
                    <div className="no-print">
                        <CrimeBreakdownChart data={CRIME_DATA_2024} key1="drug_trafficking" key2="drug_possession_use" name1="اتجار" name2="حيازة وتعاطي" color1="#9333ea" color2="#c084fc" />
                    </div>
                </Card>
                
                <div className="page-break" />

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{analysisText[7].text}</h2>
                    <div className="prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: `<p>${analysisText[8].text}</p>`}}></div>
                </Card>
                
                <Card className="card-container">
                    <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">معدل حوادث السير (لكل 100 ألف نسمة)</h3>
                    <div style={{ width: '100%', height: 450 }} className="no-print">
                        <ResponsiveContainer>
                            <BarChart data={[...securityIndicators].sort((a,b) => b.accident_rate - a.accident_rate)} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="name_ar" interval={0} angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12, fill: '#1f2937' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#1f2937' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)'}} formatter={(value: number) => [value.toFixed(1), 'معدل الحوادث']} />
                                <Bar dataKey="accident_rate" fill="#f97316" name="معدل الحوادث" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="accident_rate" position="top" formatter={(value: number) => value.toFixed(1)} style={{ fill: '#1f2937', fontSize: '11px' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{analysisText[9].text}</h2>
                    <div className="space-y-4 text-lg">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{analysisText[10].text}</h3>
                            <ul className="list-disc list-outside mr-6 space-y-2 mt-2 text-gray-800 dark:text-gray-300">
                                <li>{analysisText[11].text}</li>
                                <li>{analysisText[12].text}</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{analysisText[13].text}</h3>
                            <ul className="list-disc list-outside mr-6 space-y-2 mt-2 text-gray-800 dark:text-gray-300">
                                <li>{analysisText[14].text}</li>
                                <li>{analysisText[15].text}</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{analysisText[16].text}</h3>
                            <ul className="list-disc list-outside mr-6 space-y-2 mt-2 text-gray-800 dark:text-gray-300">
                                <li>{analysisText[17].text}</li>
                                <li>{analysisText[18].text}</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{analysisText[19].text}</h3>
                            <ul className="list-disc list-outside mr-6 space-y-2 mt-2 text-gray-800 dark:text-gray-300">
                                <li>{analysisText[20].text}</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Security;
