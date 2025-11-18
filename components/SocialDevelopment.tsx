import React, { useState } from 'react';
import Card from './ui/Card';
import { Document, Packer, Paragraph, TextRun, AlignmentType, IStylesOptions } from 'docx';
import saveAs from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { GOVERNORATE_COLORS } from '../constants/colors';
import { 
    TOTAL_BENEFICIARIES_2024,
    EMERGENCY_AID_2024,
    TRAINING_PROGRAM_2024,
    EMPLOYMENT_PROGRAM_2024
} from '../constants/socialDevelopmentData';

const KpiCard: React.FC<{ title: string; value: string; icon: string; }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 p-4 rounded-xl text-center shadow-sm h-full flex flex-col justify-center">
        <div className="text-3xl mb-2">{icon}</div>
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
    <div className="bg-gray-50 p-4 rounded-xl border flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start">
          <p className="font-semibold text-gray-700 text-sm h-12">{title}</p>
          <div className={`text-2xl ${trendColor}`}>{icon}</div>
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

type ContentBlock = { type: 'h1' | 'h2' | 'h3' | 'p' | 'list-item'; text: string; };

const SocialDevelopment: React.FC = () => {
    const [isExportingDocx, setIsExportingDocx] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const generateReportContent = (): ContentBlock[] => [
        { type: 'h1', text: "تحليلات التنمية الاجتماعية" },
        { type: 'p', text: "نظرة متكاملة على برامج وزارة التنمية الاجتماعية وصندوق المعونة الوطنية وتأثيرها." },
        
        { type: 'h2', text: "تحليل استراتيجي لمؤشرات وزارة التنمية الاجتماعية (2021-2024)" },
        { type: 'p', text: "يقدم هذا القسم تحليلاً للاتجاهات الرئيسية في مؤشرات الأداء لوزارة التنمية الاجتماعية خلال السنوات الأربع الماضية، بهدف تقييم الأثر وتحديد الأولويات الاستراتيجية المستقبلية لتعزيز الحماية والرعاية الاجتماعية في المملكة." },
        
        { type: 'h3', text: "الأسرة والطفولة" },
        { type: 'p', text: "يُظهر القطاع نجاحاً ملحوظاً في برامج الرعاية البديلة واللاحقة، مع زيادة مطردة في دمج الأطفال في أسر راعية وارتفاع كبير في عدد خريجي دور الرعاية المندمجين في المجتمع. لكن، يبرز تحدٍ مقلق في انخفاض عدد الأطفال المستفيدين من الحضانات رغم زيادة عددها، مما يستدعي دراسة الأسباب سواء كانت تتعلق بالتكلفة أو الجودة." },
        
        { type: 'h3', text: "الجمعيات ومنظمات المجتمع المدني" },
        { type: 'p', text: "يواجه قطاع الجمعيات تحديات استدامة واضحة, حيث يتناقص العدد التراكمي للجمعيات المسجلة بالتزامن مع ارتفاع كبير في عدد الجمعيات التي يتم حلها سنوياً... هذا الاتجاه يستدعي مراجعة البيئة التشغيلية للجمعيات وتقديم الدعم الفني والإداري لضمان استمراريتها." },
        
        { type: 'h3', text: "التمكين الاقتصادي والمشاريع الإنتاجية" },
        { type: 'p', text: "رغم الزيادة الكبيرة في أعداد المستفيدين من برامج التدريب والتوعية، هناك تراجع مقلق في عدد الأسر المستفيدة من مشاريع الأسر المنتجة، مما يتطلب إعادة تقييم لآليات تحويل التدريب إلى مشاريع مستدامة." },

        { type: 'h3', text: "شؤون الأحداث والحماية" },
        { type: 'p', text: "تُظهر المؤشرات نجاحاً واضحاً في سياسات العدالة التصالحية، مع انخفاض كبير في قضايا الأحداث المحولة للمحاكم وزيادة في إعادة دمجهم أسرياً. لكن، الارتفاع المستمر في أعداد الموقوفين يضع ضغطاً كبيراً على الموارد." },

        { type: 'h3', text: "مكافحة التسول" },
        { type: 'p', text: "تم تحقيق نجاح كبير في الحد من ظاهرة التسول، مع انخفاض ملحوظ في أعداد المضبوطين، خاصة بين الأطفال. هذا النجاح يتزامن مع زيادة في عدد من يتلقون خدمات إيوائية، مما يدل على تحول من مجرد الضبط إلى تقديم الرعاية." },

        { type: 'h2', text: "توصيات استراتيجية" },
        { type: 'list-item', text: "التركيز على التمكين الاقتصادي واستدامة الأسر المنتجة: ربط التدريب بالإنتاج ومعالجة أسباب انخفاض عدد المشاريع." },
        { type: 'list-item', text: "دعم الجمعيات وزيادة استدامتها: دراسة أسباب الانحلال وتسهيل إجراءات التسجيل." },
        { type: 'list-item', text: "دعم الرعاية البديلة وخدمات الطفولة: معالجة انخفاض الإقبال على الحضانات وتعزيز نجاح الرعاية اللاحقة." },
        { type: 'list-item', text: "التخفيف من الضغط على مرافق الرعاية والحماية: إدارة الزيادة في مراكز الإصلاح والتحول نحو الإجراءات اللامركزية." },
        { type: 'list-item', text: "تثبيت نجاح مكافحة التسول: التركيز على الرعاية اللاحقة للمتسولين ودراسة أسباب الحاجة الطارئة." },

        { type: 'h2', text: "تحليل برامج شبكة الأمان الاجتماعي: صندوق المعونة الوطنية 2024" },
        { type: 'p', text: "يُمثل صندوق المعونة الوطنية الركيزة الأساسية لشبكة الأمان الاجتماعي في الأردن... يهدف هذا التقرير إلى تحليل إنجازات الصندوق وتوزيع برامجه وتأثيرها." },
        { type: 'p', text: "إجمالي الأسر المستفيدة: 239,177. إجمالي الأفراد: 1,117,253. إجمالي المعونة الشهرية: 20.7 مليون د.أ. نسبة الأسر التي ترأسها نساء: 71%." },

        { type: 'h3', text: "برامج التحويلات النقدية الدورية" },
        { type: 'p', text: "تتركز غالبية الأسر المستفيدة في المحافظات ذات الكثافة السكانية الأعلى كالعاصمة وإربد والزرقاء. اللافت للنظر أن 71% من الأسر المستفيدة ترأسها نساء، و 44% من إجمالي الأفراد المستفيدين هم من الأطفال، مما يؤكد الدور الحيوي للصندوق في دعم الفئات الأكثر هشاشة." },

        { type: 'h3', text: "برامج الاستجابة للصدمات" },
        { type: 'p', text: "لتعزيز مرونة الأسر في مواجهة الأزمات، يقدم الصندوق حزمة من برامج الاستجابة الطارئة، مع توزيع يتماشى مع الكثافة السكانية." },

        { type: 'h3', text: "برامج التمكين الاقتصادي: من الإغاثة إلى الإنتاج" },
        { type: 'p', text: "بهدف تحقيق الاستدامة، يعمل الصندوق على نقل الأسر من دائرة الاعتماد على المعونة إلى الإنتاج. في عام 2024، التحق 1,195 فرداً بالتدريب وتم تشغيل 1,740 مستفيداً، مما أدى إلى تخريج 399 أسرة من برامج المعونة." },
    ];


    const handleExportDocx = async () => {
        setIsExportingDocx(true);
        try {
            const content = generateReportContent();
            const title = content.find(c => c.type === 'h1')?.text || "Social Development Report";
            
            const docStyles: IStylesOptions = {
                default: { document: { run: { font: "Arial", size: 24, rightToLeft: true } } },
                paragraphStyles: [
                    { id: "Normal", name: "Normal", basedOn: "Normal", next: "Normal", run: { size: 24 }, paragraph: { spacing: { after: 120 } } },
                    { id: "h1", name: "h1", basedOn: "Normal", next: "Normal", run: { size: 40, bold: true, color: "1E3A8A" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } } },
                    { id: "h2", name: "h2", basedOn: "Normal", next: "Normal", run: { size: 32, bold: true, color: "1E40AF" }, paragraph: { spacing: { before: 240, after: 120 } } },
                    { id: "h3", name: "h3", basedOn: "Normal", next: "Normal", run: { size: 28, bold: true, color: "1D4ED8" }, paragraph: { spacing: { before: 180, after: 100 } } },
                ],
            };

            const paragraphs: Paragraph[] = content.map((block) => {
                let style = block.type.startsWith('h') ? block.type : 'Normal';
                let bullet = block.type === 'list-item' ? { level: 0 } : undefined;
                
                return new Paragraph({
                    children: [new TextRun(block.text)],
                    style: style,
                    bullet: bullet,
                    bidirectional: true,
                    alignment: block.type === 'h1' ? AlignmentType.CENTER : AlignmentType.RIGHT,
                });
            });

            const doc = new Document({
                styles: docStyles,
                sections: [{ properties: { page: { margin: { top: 1134, right: 850, bottom: 1134, left: 850 } } }, children: paragraphs }],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `تقرير-التنمية-الاجتماعية.docx`);

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
            const margin = 15;
            const contentWidth = pdfWidth - margin * 2;
            const pageContentHeight = pdfHeight - margin * 2;
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / contentWidth;
            const scaledImgHeight = imgHeight / ratio;
            let heightLeft = scaledImgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, scaledImgHeight);
            heightLeft -= pageContentHeight;

            while (heightLeft > 0) {
                position -= pageContentHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position + margin, contentWidth, scaledImgHeight);
                heightLeft -= pageContentHeight;
            }
            pdf.save('report-social-development.pdf');
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    {isExportingDocx ? 'جاري التصدير...' : 'تصدير (DOCX)'}
                </button>
                <button 
                    onClick={handleExportPdf} 
                    disabled={isExportingPdf}
                    className="px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-amber-600 focus:z-10 focus:ring-4 focus:ring-gray-100 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    {isExportingPdf ? 'جاري التصدير...' : 'تصدير (PDF)'}
                </button>
            </div>
            
            <header className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">تحليلات التنمية الاجتماعية</h1>
                <p className="text-lg text-gray-500 mt-1">نظرة متكاملة على برامج وزارة التنمية الاجتماعية وصندوق المعونة الوطنية وتأثيرها.</p>
            </header>

            <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">تحليل استراتيجي لمؤشرات وزارة التنمية الاجتماعية (2021-2024)</h2>
                <p className="text-gray-600 leading-relaxed">
                    يقدم هذا القسم تحليلاً للاتجاهات الرئيسية في مؤشرات الأداء لوزارة التنمية الاجتماعية خلال السنوات الأربع الماضية، بهدف تقييم الأثر وتحديد الأولويات الاستراتيجية المستقبلية لتعزيز الحماية والرعاية الاجتماعية في المملكة.
                </p>
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4"><span className="text-2xl mr-2">👨‍👩‍👧‍👦</span>الأسرة والطفولة</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <TrendKpiCard title="دور الحضانة المسجلة" trendText="ارتفاع طفيف" startValue={1180} endValue={1228} icon="🏫" trend="up" positive="good" />
                    <TrendKpiCard title="الأطفال المستفيدون من الحضانات" trendText="انخفاض كبير" startValue={51185} endValue={42980} icon="👧" trend="down" positive="bad" />
                    <TrendKpiCard title="خريجو الرعاية المندمجون" trendText="ارتفاع كبير" startValue={109} endValue={358} icon="🎓" trend="up" positive="good" />
                    <TrendKpiCard title="الأطفال في أسر راعية" trendText="ارتفاع مطرد" startValue={1652} endValue={1901} icon="❤️" trend="up" positive="good" />
                </div>
                <div className="mt-4 pt-4 border-t text-gray-600">
                    <p>يُظهر القطاع نجاحاً ملحوظاً في برامج الرعاية البديلة واللاحقة، مع زيادة مطردة في دمج الأطفال في أسر راعية وارتفاع كبير في عدد خريجي دور الرعاية المندمجين في المجتمع. لكن، يبرز تحدٍ مقلق في انخفاض عدد الأطفال المستفيدين من الحضانات رغم زيادة عددها، مما يستدعي دراسة الأسباب سواء كانت تتعلق بالتكلفة أو الجودة.</p>
                </div>
            </Card>
            
            <Card>
                <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4"><span className="text-2xl mr-2">🤝</span>الجمعيات ومنظمات المجتمع المدني</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <TrendKpiCard title="الجمعيات المسجلة (تراكمي)" trendText="انخفاض مستمر" startValue={6610} endValue={6112} icon="🏛️" trend="down" positive="bad" />
                    <TrendKpiCard title="الجمعيات المنحلة (سنوياً)" trendText="ارتفاع كبير" startValue={294} endValue={584} icon="📉" trend="up" positive="bad" />
                    <TrendKpiCard title="فروع الجمعيات الأجنبية (سنوياً)" trendText="انخفاض كبير" startValue={12} endValue={6} icon="🌍" trend="down" positive="neutral" />
                </div>
                 <div className="mt-4 pt-4 border-t text-gray-600">
                    <p>يواجه قطاع الجمعيات تحديات استدامة واضحة، حيث يتناقص العدد التراكمي للجمعيات المسجلة بالتزامن مع ارتفاع كبير في عدد الجمعيات التي يتم حلها سنوياً. ويعود هذا التراجع لأسباب منها تراجع الدعم الموجه للجمعيات من المنظمات الدولية بسبب توتر الأوضاع الإقليمية وانفراجة أزمة اللجوء السوري التي بدأت بالحل التدريجي. هذا الاتجاه يستدعي مراجعة البيئة التشغيلية للجمعيات وتقديم الدعم الفني والإداري لضمان استمراريتها.</p>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4"><span className="text-2xl mr-2">💡</span>التمكين الاقتصادي والمشاريع الإنتاجية</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     <TrendKpiCard title="الأسر المستفيدة من مشاريع الأسر المنتجة" trendText="انخفاض حاد" startValue={203} endValue={81} icon="💼" trend="down" positive="bad" />
                     <TrendKpiCard title="المستفيدون من التدريب والتوعية" trendText="ارتفاع كبير" startValue={38622} endValue={47146} icon="📈" trend="up" positive="good" />
                     <TrendKpiCard title="الأسر المستفيدة من المساعدات الطارئة" trendText="ارتفاع كبير جداً" startValue={320} endValue={3711} icon="🆘" trend="up" positive="neutral" />
                </div>
                 <div className="mt-4 pt-4 border-t text-gray-600">
                    <p>رغم الزيادة الكبيرة في أعداد المستفيدين من برامج التدريب والتوعية، هناك تراجع مقلق في عدد الأسر المستفيدة من مشاريع الأسر المنتجة، مما يتطلب إعادة تقييم لآليات تحويل التدريب إلى مشاريع مستدامة. من جهة أخرى، القفزة الهائلة في المساعدات الطارئة قد تعكس تحسناً في الوصول للخدمة أو زيادة في الحالات الطارئة.</p>
                </div>
            </Card>

            <Card>
                 <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4"><span className="text-2xl mr-2">🛡️</span>شؤون الأحداث والحماية</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     <TrendKpiCard title="الأحداث الموقوفون الذين تم خدمتهم" trendText="ارتفاع مستمر" startValue={1560} endValue={1984} icon="⚖️" trend="up" positive="bad" />
                     <TrendKpiCard title="الأحداث المعاد دمجهم مع أسرهم" trendText="ارتفاع مستمر" startValue={1815} endValue={2278} icon="🏠" trend="up" positive="good" />
                     <TrendKpiCard title="قضايا الأحداث المحولة للمحاكم" trendText="انخفاض كبير" startValue={4431} endValue={2471} icon="📄" trend="down" positive="good" />
                     <TrendKpiCard title="نزلاء مراكز الإصلاح الحاصلون على خدمات" trendText="ارتفاع حاد" startValue={5218} endValue={9199} icon="🏢" trend="up" positive="neutral" />
                </div>
                 <div className="mt-4 pt-4 border-t text-gray-600">
                    <p>تُظهر المؤشرات نجاحاً واضحاً في سياسات العدالة التصالحية، مع انخفاض كبير في قضايا الأحداث المحولة للمحاكم وزيادة في إعادة دمجهم أسرياً. لكن، الارتفاع المستمر في أعداد الموقوفين والزيادة الحادة في نزلاء مراكز الإصلاح الذين يتلقون خدمات يضع ضغطاً كبيراً على الموارد ويتطلب التوسع في برامج العقوبات البديلة.</p>
                </div>
            </Card>

            <Card>
                 <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4"><span className="text-2xl mr-2">🚫</span>مكافحة التسول</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     <TrendKpiCard title="إجمالي المتسولين المضبوطين" trendText="انخفاض كبير" startValue={13558} endValue={7453} icon="📉" trend="down" positive="good" />
                     <TrendKpiCard title="المتسولون الأحداث المضبوطون" trendText="انخفاض كبير" startValue={7981} endValue={4056} icon="🧒" trend="down" positive="good" />
                     <TrendKpiCard title="المستفيدون من الخدمات الإيوائية" trendText="ارتفاع مستمر" startValue={1788} endValue={2903} icon="🛌" trend="up" positive="good" />
                </div>
                 <div className="mt-4 pt-4 border-t text-gray-600">
                    <p>تم تحقيق نجاح كبير في الحد من ظاهرة التسول، مع انخفاض ملحوظ في أعداد المضبوطين، خاصة بين الأطفال. هذا النجاح يتزامن مع زيادة في عدد من يتلقون خدمات إيوائية، مما يدل على تحول من مجرد الضبط إلى تقديم الرعاية، وهي استراتيجية أكثر استدامة.</p>
                </div>
            </Card>

             <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">توصيات استراتيجية</h2>
                <div className="space-y-4 text-gray-700">
                    <div>
                        <h4 className="font-semibold text-lg">1. التركيز على التمكين الاقتصادي واستدامة الأسر المنتجة</h4>
                        <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                            <li><strong>معالجة انخفاض الأسر المنتجة:</strong> إجراء دراسة معمقة لسبب الانخفاض الحاد في عدد الأسر المستفيدة، وتحديد ما إذا كان السبب في التمويل، التدريب، التسويق، أم صعوبة الاستمرارية.</li>
                            <li><strong>ربط التدريب بالإنتاج:</strong> التأكد من أن هذه التدريبات تؤدي بشكل مباشر إلى زيادة عدد الأسر المنتجة وتوليد فرص عمل، لضمان تحويل الجهد التدريبي إلى أثر اقتصادي ملموس.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-lg">2. دعم الجمعيات وزيادة استدامتها</h4>
                        <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                            <li><strong>دراسة أسباب الانحلال:</strong> مع ارتفاع عدد الجمعيات المنحلة سنوياً، يجب تطوير برنامج دعم فني وإداري للجمعيات لتعزيز حوكمتها، إدارتها المالية، وقدرتها على الحصول على التمويل، لضمان استدامتها.</li>
                            <li><strong>تسهيل إجراءات التسجيل:</strong> مراجعة التشريعات والإجراءات الخاصة بتسجيل الجمعيات لتشجيع مبادرات المجتمع المحلي بدلاً من الانخفاض المستمر في العدد التراكمي.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-lg">3. دعم الرعاية البديلة وخدمات الطفولة</h4>
                        <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                            <li><strong>معالجة انخفاض الإقبال على دور الحضانة:</strong> يجب دراسة أسباب انخفاض عدد الأطفال المستفيدين من دور الحضانة، رغم زيادة عدد الدور المسجلة. قد يتعلق الأمر بالتكلفة، الجودة، أو الحاجة لتوزيع جغرافي أفضل، مع إطلاق حملات توعية لأهمية الحضانة المبكرة.</li>
                            <li><strong>تعزيز نجاح الرعاية اللاحقة:</strong> البناء على النجاح الواضح في دمج الخريجين من دور الرعاية، وتوسيع نطاق برامج الرعاية اللاحقة لتشمل الدعم المهني والنفسي لأكبر عدد ممكن.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-lg">4. التخفيف من الضغط على مرافق الرعاية والحماية</h4>
                        <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                             <li><strong>إدارة الزيادة في مراكز الإصلاح:</strong> الارتفاع الحاد في عدد المستفيدين داخل مراكز الإصلاح والتأهيل يتطلب زيادة الموارد المخصصة للخدمات الاجتماعية داخل هذه المراكز، والتوسع في برامج العقوبات البديلة لتقليل الاكتظاظ.</li>
                            <li><strong>التحول نحو الإجراءات اللامركزية:</strong> الاستمرار في سياسات خفض قضايا الأحداث المحولة للمحاكم، والتركيز على الحلول المجتمعية والوساطة الأسرية، لتعزيز المؤشر الإيجابي الخاص بانخفاض القضايا.</li>
                        </ul>
                    </div>
                      <div>
                        <h4 className="font-semibold text-lg">5. تثبيت نجاح مكافحة التسول</h4>
                        <ul className="list-disc list-outside mr-6 mt-2 space-y-1">
                            <li><strong>التركيز على الرعاية اللاحقة للمتسولين:</strong> مع الانخفاض الكبير في أعداد الضبط، يجب مضاعفة الجهود على برامج التمكين والرعاية اللاحقة للأسر التي كانت تمارس التسول، لضمان عدم عودتها لهذه الممارسة.</li>
                             <li><strong>دراسة أسباب الحاجة الطارئة:</strong> زيادة عدد الأسر المستفيدة من المساعدات الطارئة تتطلب دراسة هذا المؤشر لتحديد الأسباب الهيكلية التي تدفع الأسر للحاجة الطارئة، ومن ثم تطوير برامج وقائية للحد من هذه الظروف.</li>
                        </ul>
                    </div>
                </div>
            </Card>

            <div className="pt-8 border-t border-gray-200">
                <header className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">تحليل برامج شبكة الأمان الاجتماعي: صندوق المعونة الوطنية 2024</h2>
                    <p className="text-lg text-gray-500 mt-1">نظرة على برامج صندوق المعونة الوطنية وتأثيرها على الأسر المستفيدة.</p>
                </header>

                <Card className="mt-6">
                    <div className="text-gray-600 leading-relaxed space-y-4 mt-4 text-base">
                        <p>يُمثل صندوق المعونة الوطنية الركيزة الأساسية لشبكة الأمان الاجتماعي في الأردن، حيث يقدم دعماً نقدياً وتمكينياً للأسر الأكثر فقراً واحتياجاً. في عام 2024، واصل الصندوق توسيع نطاق برامجه لتعزيز الحماية الاجتماعية وتحسين المستوى المعيشي للمستفيدين، تماشياً مع التوجيهات الملكية السامية. يهدف هذا التقرير إلى تحليل إنجازات الصندوق وتوزيع برامجه وتأثيرها.</p>
                    </div>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <KpiCard title="إجمالي الأسر المستفيدة" value="239,177" icon="👨‍👩‍👧‍👦" />
                    <KpiCard title="إجمالي الأفراد المستفيدين" value="1,117,253" icon="👥" />
                    <KpiCard title="إجمالي المعونة الشهرية" value="20.7 مليون د.أ" icon="💰" />
                    <KpiCard title="نسبة الأسر التي ترأسها نساء" value="71%" icon="👩‍👧‍👦" />
                </div>

                <Card className="card-container mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">1. برامج التحويلات النقدية الدورية</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">توزيع الأفراد المستفيدين حسب المحافظة</h3>
                            <div style={{ height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[...TOTAL_BENEFICIARIES_2024].sort((a,b) => b.individuals - a.individuals)} layout="vertical" margin={{ left: 10, right: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                        <XAxis type="number" tickFormatter={(val) => `${(val / 1000).toFixed(0)} ألف`} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                        <YAxis type="category" dataKey="governorate" width={80} tick={{ fontSize: 12, fill: '#374151' }} />
                                        <Tooltip formatter={(val: number) => [val.toLocaleString(), "عدد الأفراد"]} />
                                        <Bar dataKey="individuals" name="عدد الأفراد" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                            {[...TOTAL_BENEFICIARIES_2024].sort((a,b) => b.individuals - a.individuals).map((entry) => (
                                                <Cell key={entry.governorate} fill={GOVERNORATE_COLORS[entry.governorate.replace('اربد', 'Irbid').replace('العاصمة', 'Amman').replace('الزرقاء', 'Zarqa').replace('البلقاء', 'Balqa').replace('المفرق', 'Mafraq').replace('الكرك', 'Karak').replace('مادبا', 'Madaba').replace('جرش', 'Jarash').replace('عجلون', 'Ajloun').replace('معان', 'Maan').replace('العقبة', 'Aqaba').replace('الطفيلة', 'Tafilah')] || '#3b82f6'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">جنس رب الأسرة</h3>
                                <div style={{ height: 180 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={[{name: 'أنثى', value: 71}, {name: 'ذكر', value: 29}]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                                                <Cell fill="#ec4899" />
                                                <Cell fill="#60a5fa" />
                                            </Pie>
                                            <Tooltip formatter={(val: number) => `${val}%`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">الفئة العمرية للأفراد المستفيدين</h3>
                                <div style={{ height: 180 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={[{name: 'أطفال (0-17)', value: 44}, {name: 'بالغون (18+)', value: 56}]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                                                <Cell fill="#a78bfa" />
                                                <Cell fill="#a8a29e" />
                                            </Pie>
                                            <Tooltip formatter={(val: number) => `${val}%`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="card-container mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">2. برامج الاستجابة للصدمات</h2>
                    <p className="text-gray-600 mb-6">لتعزيز مرونة الأسر في مواجهة الأزمات، يقدم الصندوق حزمة من برامج الاستجابة الطارئة.</p>
                    <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">توزيع أسر المعونات الطارئة حسب المحافظة (2024)</h3>
                    <div style={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[...EMERGENCY_AID_2024].sort((a,b) => b.count - a.count)} margin={{ top: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="governorate" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip formatter={(val: number) => [val.toLocaleString(), "عدد الأسر"]} />
                                <Bar dataKey="count" name="عدد الأسر" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="card-container mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">3. برامج التمكين الاقتصادي: من الإغاثة إلى الإنتاج</h2>
                    <p className="text-gray-600 mb-6">بهدف تحقيق الاستدامة، يعمل الصندوق على نقل الأسر من دائرة الاعتماد على المعونة إلى الإنتاج. في عام 2024، تم تحقيق إنجازات ملموسة في هذا المجال.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-8">
                        <KpiCard title="أفراد التحقوا بالتدريب" value="1,195" icon="🎓" />
                        <KpiCard title="مستفيدون تم تشغيلهم" value="1,740" icon="💼" />
                        <KpiCard title="أسر تم تخريجها من المعونة" value="399" icon="🎉" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">توزيع المتدربين حسب المحافظة</h3>
                            <div style={{ height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[...TRAINING_PROGRAM_2024].sort((a,b) => b.total - a.total)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                        <XAxis dataKey="governorate" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="male" name="ذكور" stackId="a" fill="#60a5fa" />
                                        <Bar dataKey="female" name="إناث" stackId="a" fill="#ec4899" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">توزيع من تم تشغيلهم حسب المحافظة</h3>
                            <div style={{ height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[...EMPLOYMENT_PROGRAM_2024].sort((a,b) => b.total - a.total)}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                        <XAxis dataKey="governorate" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="male" name="ذكور" stackId="a" fill="#60a5fa" />
                                        <Bar dataKey="female" name="إناث" stackId="a" fill="#ec4899" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SocialDevelopment;