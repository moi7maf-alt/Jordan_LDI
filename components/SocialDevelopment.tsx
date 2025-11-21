
import React, { useState } from 'react';
import Card from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { GOVERNORATE_COLORS } from '../constants/colors';
import { 
    TOTAL_BENEFICIARIES_2024,
    EMERGENCY_AID_2024,
    TRAINING_PROGRAM_2024,
    EMPLOYMENT_PROGRAM_2024
} from '../constants/socialDevelopmentData';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';

const KpiCard: React.FC<{ title: string; value: string; icon: string; }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 p-4 rounded-xl text-center shadow-sm h-full flex flex-col justify-center break-inside-avoid kpi-card-visual">
        <div className="text-3xl mb-2 icon-container">{icon}</div>
        <p className="text-2xl font-bold text-amber-600">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{title}</p>
    </div>
);

interface TrendKpiCardProps {
  title: string;
  trendText: string;
  startValue: number;
  endValue: number;
  unit?: string;
  icon: string;
  trend: 'up' | 'down' | 'stable';
  positive: 'good' | 'bad' | 'neutral';
}

const TrendKpiCard: React.FC<TrendKpiCardProps> = ({ title, trendText, startValue, endValue, unit = '', icon, trend, positive }) => {
  const trendColor = 
    positive === 'good' ? 'text-emerald-500' :
    positive === 'bad' ? 'text-red-500' : 'text-gray-500';
    
  const TrendIcon = 
    trend === 'stable' ? () => <span className="font-bold">→</span> :
    trend === 'up' ? () => <>▲</> : () => <>▼</>;

  return (
    <div className="bg-gray-50 p-4 rounded-xl border flex flex-col justify-between h-full break-inside-avoid kpi-card-visual">
      <div>
        <div className="flex justify-between items-start">
          <p className="font-semibold text-gray-700 text-sm h-12">{title}</p>
          <div className={`text-2xl ${trendColor} icon-container`}>{icon}</div>
        </div>
        <p className={`text-3xl font-bold my-2 ${trendColor}`}>
            {endValue.toLocaleString()} <span className="text-lg font-normal">{unit}</span>
        </p>
      </div>
      <div className="flex justify-between items-baseline text-xs mt-2">
        <span className="text-gray-500">كان {startValue.toLocaleString()} (2021)</span>
        <div className={`flex items-center font-semibold ${trendColor}`}>
          <TrendIcon />
          <span className="mr-1">{trendText}</span>
        </div>
      </div>
    </div>
  );
};

const SocialDevelopment: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);

    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const title = "التقرير الاستراتيجي: التنمية الاجتماعية 2024";
            
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
                
                new Paragraph({ text: "1. الأسرة والطفولة: دمج وحماية", style: "h2" }),
                new Paragraph({ text: "يُظهر القطاع نجاحاً ملحوظاً في برامج الرعاية البديلة، مع ارتفاع عدد خريجي دور الرعاية المندمجين في المجتمع من 109 إلى 358، وزيادة الأطفال في الأسر الراعية إلى 1901 طفل. لكن، يبرز تحدٍ مقلق يتمثل في انخفاض عدد الأطفال المستفيدين من الحضانات إلى 42,980 طفلاً، مما يستدعي مراجعة سياسات دعم الطفولة المبكرة.", style: "Normal" }),

                new Paragraph({ text: "2. مكافحة التسول: من الضبط إلى الرعاية", style: "h2" }),
                new Paragraph({ text: "تم تحقيق نجاح استراتيجي في الحد من ظاهرة التسول، حيث انخفض عدد المتسولين المضبوطين من 13,558 إلى 7,453. هذا الانخفاض الكبير تزامن مع زيادة في أعداد المستفيدين من الخدمات الإيوائية، مما يشير إلى تحول نوعي من سياسات 'الضبط الأمني' إلى 'الرعاية الاجتماعية'.", style: "Normal" }),

                new Paragraph({ text: "3. شبكة الأمان الاجتماعي (صندوق المعونة)", style: "h2" }),
                new Paragraph({ text: "يغطي الصندوق 239,177 أسرة تضم أكثر من 1.1 مليون فرد، بميزانية شهرية تتجاوز 20.7 مليون دينار. الملاحظ أن 71% من هذه الأسر ترأسها نساء، مما يؤكد أن الفقر في الأردن له وجه أنثوي، ويتطلب برامج تمكين اقتصادي موجهة للنساء المعيلات.", style: "Normal" }),

                new Paragraph({ text: "4. التوصيات الاستراتيجية", style: "h2" }),
                new Paragraph({ text: "أولاً: مراجعة البيئة التشريعية للجمعيات لوقف التراجع في أعدادها وتعزيز استدامتها.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثانياً: التوسع في برامج العقوبات البديلة للأحداث لتقليل الاكتظاظ في دور الرعاية.", style: "Normal", bullet: { level: 0 } }),
                new Paragraph({ text: "ثالثاً: ربط المعونات النقدية ببرامج التدريب المهني والتشغيل لنقل الأسر من الاعتمادية إلى الإنتاج.", style: "Normal", bullet: { level: 0 } }),
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
                <title>تقرير التنمية الاجتماعية - 2024</title>
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
                    .no-print, .recharts-wrapper, button, svg, .icon-container, .kpi-card-visual { display: none !important; }
                    
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
                        <h1>التقرير الاستراتيجي: التنمية الاجتماعية والحماية</h1>
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
                    <h1 className="text-3xl font-bold text-gray-900">تحليلات التنمية الاجتماعية</h1>
                    <p className="text-lg text-gray-500 mt-1">نظرة متكاملة على برامج وزارة التنمية الاجتماعية وصندوق المعونة الوطنية وتأثيرها.</p>
                </header>

                <Card className="card-container">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. تحليل استراتيجي لمؤشرات الحماية الاجتماعية (2021-2024)</h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                        يقدم هذا القسم تحليلاً للاتجاهات الرئيسية في مؤشرات الأداء لوزارة التنمية الاجتماعية، بهدف تقييم الأثر وتحديد الأولويات الاستراتيجية المستقبلية لتعزيز الحماية والرعاية الاجتماعية في المملكة.
                    </p>
                </Card>

                <Card className="card-container">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">الأسرة والطفولة</h3>
                    <div className="text-gray-700 leading-relaxed text-lg">
                        <p>
                            يُظهر القطاع نجاحاً ملحوظاً في برامج الرعاية البديلة واللاحقة، مع زيادة مطردة في دمج الأطفال في أسر راعية (وصل العدد إلى <strong>1,901</strong> طفل) وارتفاع كبير في عدد خريجي دور الرعاية المندمجين في المجتمع (من 109 إلى <strong>358</strong>). لكن، يبرز تحدٍ مقلق في انخفاض عدد الأطفال المستفيدين من الحضانات إلى <strong>42,980</strong> طفلاً رغم زيادة عددها، مما يستدعي دراسة الأسباب سواء كانت تتعلق بالتكلفة أو الجودة.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 kpi-card-visual">
                        <TrendKpiCard title="دور الحضانة المسجلة" trendText="ارتفاع طفيف" startValue={1180} endValue={1228} icon="🏫" trend="up" positive="good" />
                        <TrendKpiCard title="الأطفال المستفيدون من الحضانات" trendText="انخفاض كبير" startValue={51185} endValue={42980} icon="👧" trend="down" positive="bad" />
                        <TrendKpiCard title="خريجو الرعاية المندمجون" trendText="ارتفاع كبير" startValue={109} endValue={358} icon="🎓" trend="up" positive="good" />
                        <TrendKpiCard title="الأطفال في أسر راعية" trendText="ارتفاع مطرد" startValue={1652} endValue={1901} icon="❤️" trend="up" positive="good" />
                    </div>
                </Card>
                
                <Card className="card-container">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">الجمعيات ومنظمات المجتمع المدني</h3>
                    <div className="text-gray-700 leading-relaxed text-lg">
                        <p>
                            يواجه قطاع الجمعيات تحديات استدامة واضحة، حيث انخفض العدد التراكمي للجمعيات المسجلة إلى <strong>6,112</strong> جمعية، بالتزامن مع ارتفاع كبير في عدد الجمعيات التي يتم حلها سنوياً (وصلت إلى <strong>584</strong> جمعية). يعود هذا التراجع لأسباب منها تراجع الدعم الدولي وضعف القدرات الإدارية.
                        </p>
                    </div>
                </Card>

                <Card className="card-container">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">مكافحة التسول</h3>
                    <div className="text-gray-700 leading-relaxed text-lg">
                        <p>
                            تم تحقيق نجاح كبير في الحد من ظاهرة التسول، حيث انخفض إجمالي المتسولين المضبوطين من 13,558 إلى <strong>7,453</strong>. هذا الانخفاض الملحوظ، خاصة بين الأطفال، يتزامن مع زيادة في عدد من يتلقون خدمات إيوائية (وصلوا إلى <strong>2,903</strong>)، مما يدل على تحول من سياسة "الضبط" إلى سياسة "الرعاية".
                        </p>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">2. تحليل شبكة الأمان الاجتماعي: صندوق المعونة الوطنية</h2>
                    <div className="text-gray-700 leading-relaxed space-y-4 mt-4 text-lg">
                        <p>
                            يُمثل صندوق المعونة الوطنية الركيزة الأساسية لشبكة الأمان الاجتماعي. في عام 2024، غطى الصندوق <strong>239,177</strong> أسرة (تضم أكثر من 1.1 مليون فرد)، بميزانية شهرية تتجاوز <strong>20.7 مليون دينار</strong>. الملاحظ أن <strong>71%</strong> من الأسر المستفيدة ترأسها نساء، مما يؤكد أن الفقر في الأردن له وجه أنثوي، ويتطلب برامج تمكين اقتصادي موجهة خصيصاً للنساء المعيلات.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 kpi-card-visual">
                        <KpiCard title="إجمالي الأسر المستفيدة" value="239,177" icon="👨‍👩‍👧‍👦" />
                        <KpiCard title="إجمالي الأفراد المستفيدين" value="1,117,253" icon="👥" />
                        <KpiCard title="إجمالي المعونة الشهرية" value="20.7 مليون د.أ" icon="💰" />
                        <KpiCard title="نسبة الأسر التي ترأسها نساء" value="71%" icon="👩‍👧‍👦" />
                    </div>
                </Card>

                <Card className="card-container mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">3. برامج التمكين الاقتصادي: من الإغاثة إلى الإنتاج</h2>
                    <div className="text-gray-700 mb-6 text-lg leading-relaxed">
                        <p>
                            بهدف تحقيق الاستدامة، يعمل الصندوق على نقل الأسر من دائرة الاعتماد على المعونة إلى الإنتاج. تمكن الصندوق من تشغيل <strong>1,740</strong> مستفيد، وتخريج <strong>399</strong> أسرة من نظام المعونة بعد تحسن أوضاعها الاقتصادية.
                        </p>
                    </div>
                </Card>

                <Card className="card-container">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">4. التوصيات الاستراتيجية</h2>
                    <div className="space-y-4 text-gray-700 text-lg">
                        <div>
                            <h4 className="font-semibold text-lg">التركيز على التمكين الاقتصادي</h4>
                            <p>معالجة انخفاض الأسر المنتجة وربط التدريب المهني بفرص تشغيل حقيقية لضمان تحويل الجهد التدريبي إلى أثر اقتصادي ملموس.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">دعم استدامة الجمعيات</h4>
                            <p>تطوير برنامج دعم فني وإداري للجمعيات لتعزيز حوكمتها وقدرتها على الاستمرار، وتسهيل إجراءات التسجيل لتشجيع العمل التطوعي.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">التحول نحو الإجراءات اللامركزية في حماية الأحداث</h4>
                            <p>الاستمرار في سياسات خفض قضايا الأحداث المحولة للمحاكم، والتركيز على الحلول المجتمعية والوساطة الأسرية.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SocialDevelopment;
