import React, { useMemo, useState } from 'react';
import Card from './ui/Card';
import { TRAFFIC_ACCIDENTS_2024 } from '../constants/trafficAccidentsData';
import { CRIME_DATA_2024 } from '../constants/crimeData';
import { POPULATION_DATA_2024 } from '../constants/populationData';
import CrimeBreakdownChart from './charts/CrimeBreakdownChart';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

type ContentBlock = { type: 'h1' | 'h2' | 'h3' | 'p' | 'list-item'; text: string; };

const Security: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

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

        // Calculate Safety Score based on the corrected data
        // Normalize scores: (max - value) / (max - min) for negative indicators, (value - min) / (max - min) for positive indicators
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
            // Handle division by zero if all values are the same
            const crimeRange = maxCrimeRate - minCrimeRate;
            const accidentRange = maxAccidentRate - minAccidentRate;
            const clearanceRange = maxClearanceRate - minClearanceRate;

            const crimeScore = crimeRange > 0 ? ((maxCrimeRate - g.crime_rate) / crimeRange) * 40 : 40; // Higher score for lower crime rate (weight 40%)
            const accidentScore = accidentRange > 0 ? ((maxAccidentRate - g.accident_rate) / accidentRange) * 30 : 30; // Higher score for lower accident rate (weight 30%)
            const clearanceScore = clearanceRange > 0 ? ((g.clearance_rate - minClearanceRate) / clearanceRange) * 30 : 30; // Higher score for higher clearance rate (weight 30%)
            
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

            const paragraphs = analysisText.map((block, index) => {
                let style = "Normal";
                let bullet = undefined;
                if (block.type.startsWith('h')) style = block.type;
                if (block.type === 'list-item') bullet = { level: 0 };
                
                return new Paragraph({
                    children: [new TextRun(block.text)],
                    style: style,
                    bullet: bullet,
                    bidirectional: true,
                    alignment: (block.type === 'h1' && index === 0) ? AlignmentType.CENTER : AlignmentType.RIGHT,
                });
            });

            const doc = new Document({
                styles: docStyles,
                sections: [{ properties: { page: { margin: { top: 1134, right: 850, bottom: 1134, left: 850 } } }, children: paragraphs }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `تحليل-الوضع-الأمني.docx`);
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
            
            pdf.save('report-security.pdf');
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExportingPdf(false);
        }
    };

    return (
        <div className="space-y-8" id="report-content">
             <div data-html2canvas-ignore="true" className="flex justify-between items-center no-print">
                 <div>{/* Placeholder for alignment */}</div>
                <div className="flex items-center gap-4">
                    <button onClick={handleExportDocx} disabled={isExportingDocx} className="px-4 py-2 text-sm font-medium text-black bg-amber-500 rounded-lg hover:bg-amber-600 focus:ring-4 focus:outline-none focus:ring-amber-300 disabled:bg-gray-400 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                    </button>
                    <button onClick={handleExportPdf} disabled={isExportingPdf} className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-slate-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                         {isExportingPdf ? 'جاري التصدير...' : 'تصدير (PDF)'}
                    </button>
                </div>
            </div>
            
            <header className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{analysisText[0].text}</h1>
                <p className="text-lg text-gray-700 dark:text-gray-400 mt-2 max-w-3xl mx-auto">{analysisText[1].text}</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="card-container flex flex-col justify-center items-center text-center">
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300">إجمالي الجرائم (2024)</h3>
                    <p className="text-3xl font-bold text-red-500 my-2">{nationalTotals.crimes.toLocaleString()}</p>
                </Card>
                 <Card className="card-container flex flex-col justify-center items-center text-center">
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300">إجمالي حوادث السير (2024)</h3>
                    <p className="text-3xl font-bold text-orange-500 my-2">{nationalTotals.accidents.toLocaleString()}</p>
                </Card>
                 <Card className="card-container flex flex-col justify-center items-center text-center">
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300">المعدل الوطني لاكتشاف الجرائم</h3>
                    <p className="text-3xl font-bold text-green-500 my-2">{nationalTotals.clearance_rate.toFixed(1)}%</p>
                </Card>
            </div>

            <Card className="card-container">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{analysisText[2].text}</h2>
                <div className="prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: `<p>${analysisText[3].text}</p><p>${analysisText[4].text}</p>`}}></div>
                <div className="mt-6" style={{ width: '100%', height: 450 }}>
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
                <div style={{ width: '100%', height: 450 }}>
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
                 <div style={{ width: '100%', height: 450 }}>
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
                 <CrimeBreakdownChart data={CRIME_DATA_2024} key1="drug_trafficking" key2="drug_possession_use" name1="اتجار" name2="حيازة وتعاطي" color1="#9333ea" color2="#c084fc" />
            </Card>
            
            <div className="page-break" />

            <Card className="card-container">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{analysisText[7].text}</h2>
                 <div className="prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: `<p>${analysisText[8].text}</p>`}}></div>
            </Card>
            
            <Card className="card-container">
                <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">معدل حوادث السير (لكل 100 ألف نسمة)</h3>
                 <div style={{ width: '100%', height: 450 }}>
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
    );
};

export default Security;