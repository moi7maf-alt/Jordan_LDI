
import { GoogleGenAI } from "@google/genai";
import { ChatMessageSource } from "../types";

// FIX: Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface ChatResponse {
    text: string;
    sources: ChatMessageSource[];
}

export const getChatResponse = async (prompt: string): Promise<ChatResponse> => {
    try {
        // FIX: Use the generateContent method with the googleSearch tool for grounded responses.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        // FIX: Correctly access the response text.
        const text = response.text;
        
        // FIX: Extract grounding chunks for sources, ensuring it's an array.
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: ChatMessageSource[] = groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Untitled',
            }))
            .filter((source: ChatMessageSource) => source.uri);

        return { text, sources };

    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        throw new Error("Failed to communicate with the AI assistant. Please try again later.");
    }
};

export const generateReportSummary = async (topic: string): Promise<string> => {
    try {
        const fullPrompt = `Generate a concise analytical report on the following topic related to Jordan's development: "${topic}". The report should be well-structured, data-driven (using hypothetical but realistic data points if necessary), and provide actionable insights. The output should be in Arabic.`;
        
        // FIX: Use the generateContent method for text generation.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                temperature: 0.5,
            }
        });

        // FIX: Correctly access the response text.
        return response.text;
    } catch (error) {
        console.error("Error generating report from Gemini:", error);
        throw new Error("Failed to generate the report. Please check the topic and try again.");
    }
};

export interface GovernorateReportData {
    governorateName: string;
    population?: number;
    density?: number;
    unemploymentRate?: number;
    nationalUnemploymentRate?: number;
    avgIncome?: number;
    studentTeacherRatio?: number;
    studentClassroomRatio?: number;
    rentedSchoolsPercentage?: number;
    waterPerCapita?: number;
    sanitationCoverage?: number;
    trafficAccidents?: number;
    teacherPostGraduatePercentage?: number;
    moeSchoolPercentage?: number;
    vocationalIndustrialStudents?: number;
    vocationalIndustrialFemaleRatio?: number;
    vocationalAgriculturalStudents?: number;
    vocationalAgriculturalFemaleRatio?: number;
    // New Health Data
    totalBeds?: number;
    bedsPer10k?: number;
    totalHealthCenters?: number;
    comprehensiveHealthCenters?: number;
    primaryHealthCenters?: number;
    gpTreatmentRate?: number;
    totalMoHDoctors?: number;
    totalMoHNurses?: number;
    doctorsPer10k?: number;
    nursesPer10k?: number;
    cancerRatePer100k?: number;
    infantMortality?: number;
}

export const generateGovernorateReport = async (data: GovernorateReportData): Promise<string> => {
    try {
        const prompt = `
أنت باحث استراتيجي أول في التخطيط التنموي. قم بإعداد "وثيقة تنموية شاملة ومعمقة" لمحافظة **${data.governorateName}**.

**التعليمات الصارمة:**
1.  **الأسلوب:** أكاديمي رصين، بحثي مكثف، ولغة تخطيط استراتيجي عالية المستوى.
2.  **بدون مقدمات:** ابدأ التقرير فوراً بالعنوان الرئيسي ومحتوى القسم الأول. **لا تكتب عبارات مثل "بصفتي خبيراً..." أو "يسعدني إعداد هذا التقرير" أو "إليك التقرير التالي" أو أي مقدمات شخصية.** ادخل في صلب الموضوع مباشرة.
3.  **الحجم:** توسع في الشرح والتحليل قدر الإمكان (لا تختصر). كل قسم يجب أن يحتوي على تحليل معمق للأرقام وتداعياتها.
4.  **البيانات:** استخدم البيانات المرفقة أدناه كنقاط انطلاق للتحليل، واربطها بالسياق الديموغرافي والاقتصادي للمحافظة.

**البيانات المرجعية:**
*   ديموغرافيا: السكان ${data.population?.toLocaleString()} نسمة، الكثافة ${data.density?.toFixed(1)} نسمة/كم².
*   الاقتصاد: البطالة ${data.unemploymentRate?.toFixed(1)}% (الوطني ${data.nationalUnemploymentRate?.toFixed(1)}%)، الدخل ${data.avgIncome?.toLocaleString()} دينار.
*   التعليم: طالب/معلم ${data.studentTeacherRatio?.toFixed(1)}، اكتظاظ ${data.studentClassroomRatio?.toFixed(1)}، مدارس مستأجرة ${data.rentedSchoolsPercentage?.toFixed(1)}%.
*   الصحة: ${data.bedsPer10k?.toFixed(1)} سرير/10 آلاف، ${data.doctorsPer10k?.toFixed(1)} طبيب/10 آلاف، وفيات الرضع ${data.infantMortality || 'N/A'}.
*   البنية التحتية: مياه ${data.waterPerCapita?.toFixed(1)} م³، صرف صحي ${data.sanitationCoverage?.toFixed(1)}%، حوادث ${data.trafficAccidents}.

**هيكلية التقرير المطلوبة (التزم بالعناوين بدقة):**

### 1. الخصائص الديموغرافية والسكانية
(اكتب فقرة مطولة ومفصلة تحلل الحجم السكاني للمحافظة (${data.population}) مقارنة بمساحتها والكثافة السكانية (${data.density}). ناقش الهيكل العمري المتوقع (مجتمع فتي)، معدلات الإعالة، وأثر النمو السكاني واللجوء السوري (إن وجد) على الضغط على الموارد والخدمات. ناقش اتجاهات الهجرة الداخلية من وإلى المحافظة).

### 2. واقع القطاعات الخدمية والاجتماعية
(تحليل شامل ومدمج للقطاعات التالية: التعليم، الصحة، الإدارة المحلية، والتنمية الاجتماعية).
*   **التعليم:** حلل كفاءة النظام التعليمي (نسب المعلمين، المدارس المستأجرة) وأثرها على جودة المخرجات.
*   **الصحة:** قيم كفاية الخدمات الصحية (الأسرة، الأطباء) ومدى تغطيتها للتجمعات السكانية.
*   **التنمية الاجتماعية:** ناقش جيوب الفقر والحاجة لبرامج الرعاية والحماية الاجتماعية.

### 3. واقع القطاعات الإنتاجية والاقتصادية
(تحليل موسع للقطاعات المولدة للدخل: الزراعة، السياحة، الصناعة، والتكنولوجيا).
*   ناقش معدلات البطالة (${data.unemploymentRate}%) في سياق ضعف القاعدة الإنتاجية.
*   حلل الميزات النسبية للمحافظة (هل هي زراعية، صناعية، أم سياحية؟) وكيفية استغلالها حالياً.
*   قيم بيئة الاستثمار ودعم المشاريع الصغيرة والمتوسطة.

### 4. واقع قطاعات البنية التحتية
(تحليل فني لقطاعات: المياه، الطاقة، الطرق والنقل، والصرف الصحي).
*   ناقش الأمن المائي وحصة الفرد (${data.waterPerCapita}) وتحديات التزود.
*   قيم تغطية الصرف الصحي (${data.sanitationCoverage}%) وأثرها البيئي.
*   حلل وضع شبكات الطرق والسلامة المرورية بناءً على عدد الحوادث (${data.trafficAccidents}).

### 5. التحليل الاستراتيجي (SWOT Analysis)
(قم بفصل كل جزء في فقرة مستقلة ومفصلة):
*   **نقاط القوة (Strengths):** الموارد البشرية والطبيعية والميزات التنافسية الكامنة.
*   **نقاط الضعف (Weaknesses):** التحديات الهيكلية، نقص التمويل، ضعف البنية التحتية.
*   **الفرص (Opportunities):** المشاريع الوطنية، التوجهات العالمية، الاستثمارات المحتملة.
*   **التهديدات (Threats):** التغير المناخي، شح التمويل، الهجرات، التحديات الإقليمية.

### 6. الخطة التنموية المقترحة (2025-2030)
(هام جداً: لا تستخدم الجداول. قم بصياغة الخطة على شكل **كتل نصية مرتبة عمودياً** لكل مبادرة، بحيث تكون واضحة ومفصلة. التزم بالتنسيق التالي بدقة وكرره لـ 5 مبادرات على الأقل):

**الهدف الاستراتيجي:** (صغ هدفاً استراتيجياً دقيقاً)
**المشروع/البرنامج المقترح:** (اذكر اسم المشروع وتفاصيله)
**مؤشر قياس الأداء (KPI):** (مؤشر رقمي لقياس النجاح)
**الإطار الزمني:** (مثال: 2025-2026)

---

**الهدف الاستراتيجي:** ...
(وهكذا لباقي المبادرات)

**ملاحظة:** يجب أن يكون المحتوى غنياً جداً بالتحليل، ولا تستخدم عبارات عامة، بل اربط كل تحليل بالأرقام المتوفرة وخصوصية المحافظة.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.4, // Slightly higher for creative planning but still grounded
            }
        });

        return response.text;
    } catch (error) {
        console.error(`Error generating report for ${data.governorateName}:`, error);
        throw new Error(`Failed to generate the report for ${data.governorateName}. Please try again.`);
    }
};

export interface ComparativeGovData {
    name_ar: string;
    population: number;
    density: number;
    student_teacher_ratio: number;
    rented_schools_percentage: number;
    beds_per_100k: number;
    unemployment_rate: number;
    avg_income: number;
    water_per_capita: number;
    sanitation_coverage: number;
    crime_rate: number;
    accident_rate: number;
}

export const generateComparativeAnalysis = async (gov1: ComparativeGovData, gov2: ComparativeGovData): Promise<string> => {
    try {
        const prompt = `
أنت خبير استراتيجي في التنمية المحلية المستدامة ومخطط حضري متخصص في الشأن الأردني.

**المهمة:**
إعداد تحليل مقارن وموجز للفجوات التنموية بين محافظتين أردنيتين: **${gov1.name_ar}** و **${gov2.name_ar}**. يجب أن يركز التحليل على تحديد الأسباب الجذرية للفجوات (هيكلية, جغرافية, تاريخية) وتوضيح أثرها المباشر على السكان والتنمية.

**بيانات مرجعية:**

**المحافظة 1: ${gov1.name_ar}**
*   عدد السكان: ${gov1.population.toLocaleString()}
*   الكثافة السكانية: ${gov1.density.toFixed(1)} نسمة/كم²
*   نسبة طالب/معلم (حكومي): ${gov1.student_teacher_ratio.toFixed(1)}
*   نسبة المدارس المستأجرة: ${gov1.rented_schools_percentage.toFixed(1)}%
*   سرير مستشفى لكل 100 ألف نسمة: ${gov1.beds_per_100k.toFixed(1)}
*   معدل البطالة: ${gov1.unemployment_rate.toFixed(1)}%
*   متوسط دخل الفرد السنوي: ${gov1.avg_income.toLocaleString()} دينار
*   حصّة الفرد من المياه: ${gov1.water_per_capita.toFixed(1)} م³/سنوياً
*   تغطية الصرف الصحي: ${gov1.sanitation_coverage.toFixed(1)}%
*   معدل الجريمة لكل 100 ألف: ${gov1.crime_rate.toFixed(1)}
*   معدل حوادث السير لكل 100 ألف: ${gov1.accident_rate.toFixed(1)}

**المحافظة 2: ${gov2.name_ar}**
*   عدد السكان: ${gov2.population.toLocaleString()}
*   الكثافة السكانية: ${gov2.density.toFixed(1)} نسمة/كم²
*   نسبة طالب/معلم (حكومي): ${gov2.student_teacher_ratio.toFixed(1)}
*   نسبة المدارس المستأجرة: ${gov2.rented_schools_percentage.toFixed(1)}%
*   سرير مستشفى لكل 100 ألف نسمة: ${gov2.beds_per_100k.toFixed(1)}
*   معدل البطالة: ${gov2.unemployment_rate.toFixed(1)}%
*   متوسط دخل الفرد السنوي: ${gov2.avg_income.toLocaleString()} دينار
*   حصّة الفرد من المياه: ${gov2.water_per_capita.toFixed(1)} م³/سنوياً
*   تغطية الصرف الصحي: ${gov2.sanitation_coverage.toFixed(1)}%
*   معدل الجريمة لكل 100 ألف: ${gov2.crime_rate.toFixed(1)}
*   معدل حوادث السير لكل 100 ألف: ${gov2.accident_rate.toFixed(1)}

**التنسيق المطلوب للناتج (JSON):**
أريد منك أن تُرجع كائن JSON يحتوي على مفاتيح للقطاعات التالية: \`education\`, \`health\`, \`economy\`, \`water\`, \`security\`.
قيمة كل مفتاح يجب أن تكون نصاً باللغة العربية يحلل الفجوة في ذلك القطاع، مع الإشارة إلى الأرقام المذكورة، وشرح السبب الجذري، وتوضيح الأثر. استخدم تنسيق Markdown لكتابة النص مع تمييز الكلمات الهامة.

**مثال على القيمة لمفتاح 'education':**
"الفجوة الحقيقية تظهر في البنية التحتية، حيث نسبة المدارس المستأجرة في **${gov1.rented_schools_percentage > gov2.rented_schools_percentage ? gov1.name_ar : gov2.name_ar}** أعلى بكثير. **السبب الجذري** هو التفاوت التاريخي في الاستثمار بالبنية التحتية التعليمية. **الأثر**: بيئة تعليمية أقل استقراراً في المحافظة ذات النسبة الأعلى، مما يؤثر على جودة المخرجات التعليمية."

ابدأ الإجابة مباشرة بكائن الـ JSON. لا تضف أي مقدمات أو ملاحظات خارجية.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.3,
            }
        });

        return response.text;
    } catch (error) {
        console.error(`Error generating comparative analysis for ${gov1.name_ar} and ${gov2.name_ar}:`, error);
        throw new Error(`Failed to generate the analysis. Please try again.`);
    }
};


export const generateProjectAnalysis = async (projectIdea: string, governorate: string): Promise<string> => {
    try {
        const prompt = `
أنت خبير في التخطيط الاستراتيجي والتنمية المحلية في الأردن. قم بتحليل فكرة المشروع التنموي التالية لمحافظة ${governorate}:

**فكرة المشروع: "${projectIdea}"**

**المطلوب:** إعداد تقرير موجز ومنظم باللغة العربية باستخدام تنسيق Markdown. يجب أن يغطي التقرير النقاط التالية:

1.  **ملخص المشروع وتحليل SWOT:**
    *   **الملخص:** وصف موجز للمشروع وأهدافه الرئيسية.
    *   **نقاط القوة:** ما هي الميزات الداخلية التي تدعم نجاح المشروع؟ (مثال: توافر موارد، دعم مجتمعي).
    *   **نقاط الضعف:** ما هي التحديات الداخلية التي قد تواجه المشروع؟ (مثال: نقص الكفاءات، بنية تحتية ضعيفة).
    *   **الفرص:** كيف يمكن للمشروع الاستفادة من العوامل الخارجية؟ (مثال: توجهات حكومية، طلب سوقي جديد).
    *   **التهديدات:** ما هي المخاطر الخارجية التي قد تؤثر على المشروع؟ (مثال: منافسة، تغييرات تشريعية).

2.  **الأثر المتوقع على مؤشرات التنمية الرئيسية (تقديري):**
    *   **الاقتصاد والتوظيف:** كيف سيؤثر المشروع على معدل البطالة، ودخل الأسر، وتنوع الأنشطة الاقتصادية في المحافظة؟
    *   **رأس المال البشري:** هل سيساهم المشروع في تحسين مخرجات التعليم أو الخدمات الصحية؟
    *   **البنية التحتية والبيئة:** ما هو التأثير المتوقع على الخدمات والبنية التحتية، وهل هناك اعتبارات بيئية؟

3.  **تحديات محتملة وتوصيات:**
    *   اذكر 2-3 تحديات رئيسية قد تواجه تنفيذ المشروع.
    *   قدم 2-3 توصيات عملية ومحددة لضمان نجاح المشروع وتعظيم أثره الإيجابي.

استخدم عناوين واضحة ونقاطاً لتقديم تحليل سهل القراءة ومباشر.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.6,
            }
        });

        return response.text;
    } catch (error) {
        console.error(`Error generating project analysis for ${governorate}:`, error);
        throw new Error('Failed to generate the project analysis. Please try again.');
    }
};
