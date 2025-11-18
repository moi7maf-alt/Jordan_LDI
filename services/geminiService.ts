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
أنت خبير استراتيجي في التنمية المحلية المستدامة ومخطط حضري متخصص في الشأن الأردني.

**المهمة:**
إعداد تقرير استراتيجي متكامل من جزأين لمحافظة **${data.governorateName}**.
*   **الجزء الأول:** تحليل وتشخيص الوضع الراهن.
*   **الجزء الثاني:** خطة تنموية مقترحة قابلة للتنفيذ.

يجب أن يكون التقرير باللغة العربية، وأن يقدم رؤى قابلة للتنفيذ لتوجيه الخطط التنموية المستقبلية.

**بيانات مرجعية للمحافظة (استخدم هذه الأرقام حصراً في تحليلك عند ذكرها):**
*   **الاقتصاد:**
    *   معدل البطالة (2024): ${data.unemploymentRate?.toFixed(1) || 'غير متوفر'}%
    *   المتوسط الوطني للبطالة (2024): ${data.nationalUnemploymentRate?.toFixed(1) || 'غير متوفر'}%
    *   متوسط دخل الفرد السنوي: ${data.avgIncome?.toLocaleString() || 'غير متوفر'} دينار
*   **التعليم:**
    *   نسبة الطلبة لكل معلم (مدارس حكومية): ${data.studentTeacherRatio?.toFixed(1) || 'غير متوفر'}
    *   نسبة الطلبة لكل شعبة (مدارس حكومية): ${data.studentClassroomRatio?.toFixed(1) || 'غير متوفر'}
    *   نسبة المدارس المستأجرة: ${data.rentedSchoolsPercentage?.toFixed(1) || 'غير متوفر'}%
    *   نسبة المعلمين حملة الشهادات العليا (ماجستير فأعلى): ${data.teacherPostGraduatePercentage?.toFixed(1) || 'غير متوفر'}%
    *   نسبة المدارس الحكومية من إجمالي المدارس: ${data.moeSchoolPercentage?.toFixed(1) || 'غير متوفر'}%
    *   طلاب التعليم المهني الصناعي (2024): ${data.vocationalIndustrialStudents?.toLocaleString() || 'غير متوفر'} (نسبة الإناث: ${data.vocationalIndustrialFemaleRatio?.toFixed(1) || 'غير متوفر'}%)
    *   طلاب التعليم المهني الزراعي (2024): ${data.vocationalAgriculturalStudents?.toLocaleString() || 'غير متوفر'} (نسبة الإناث: ${data.vocationalAgriculturalFemaleRatio?.toFixed(1) || 'غير متوفر'}%)
*   **الصحة (2024):**
    *   إجمالي أسرة المستشفيات (كل القطاعات): ${data.totalBeds?.toLocaleString() || 'غير متوفر'}
    *   معدل الأسرة لكل 10,000 نسمة: ${data.bedsPer10k?.toFixed(1) || 'غير متوفر'}
    *   إجمالي المراكز الصحية: ${data.totalHealthCenters?.toLocaleString() || 'غير متوفر'} (شامل: ${data.comprehensiveHealthCenters}, أولي: ${data.primaryHealthCenters})
    *   معدل مراجعة الطبيب العام لكل مواطن سنوياً: ${data.gpTreatmentRate?.toFixed(1) || 'غير متوفر'}
    *   عدد أطباء وزارة الصحة لكل 10,000 نسمة: ${data.doctorsPer10k?.toFixed(1) || 'غير متوفر'}
    *   عدد كوادر التمريض (وزارة الصحة) لكل 10,000 نسمة: ${data.nursesPer10k?.toFixed(1) || 'غير متوفر'}
    *   معدل وفيات الرضع (لكل 1000 ولادة حية - 2023): ${data.infantMortality?.toFixed(1) || 'غير متوفر'}
    *   معدل حالات السرطان المسجلة لكل 100 ألف نسمة (2022): ${data.cancerRatePer100k?.toFixed(1) || 'غير متوفر'}
*   **البنية التحتية والأمن:**
    *   حصّة الفرد من المياه (م³/سنوياً): ${data.waterPerCapita?.toFixed(1) || 'غير متوفر'}
    *   نسبة تغطية الصرف الصحي: ${data.sanitationCoverage?.toFixed(1) || 'غير متوفر'}%
    *   إجمالي حوادث السير (بإصابات): ${data.trafficAccidents?.toLocaleString() || 'غير متوفر'}

**ملاحظة هامة:** ابدأ التقرير مباشرة بالعنوان الرئيسي "الجزء الأول: تحليل وتشخيص الوضع الراهن". لا تقم بإضافة أي مقدمات أو تحيات.

**الهيكل المطلوب للتقرير (الرجاء الالتزام الصارم بالعناوين التالية المكتوبة بخط عريض وترك سطر فارغ بين كل قسم):**

---

### **الجزء الأول: تحليل وتشخيص الوضع الراهن**

**1. تحليل مؤشرات التنمية الرئيسية**
*   **الوضع الاقتصادي:** حلّل معدل البطالة (مقارنة بالمتوسط الوطني)، متوسط دخل الفرد ومصادره، ومؤشرات التنمية والتشغيل.
*   **رأس المال البشري:**
    *   **التعليم:** حلّل مؤشرات التعليم الكمية (مثل نسبة طالب/معلم، ونسبة طالب/شعبة في المدارس الحكومية، ونسبة المدارس المستأجرة)، ثم حلّل جودة الكادر التعليمي (نسبة حملة الشهادات العليا)، وأخيراً حلّل واقع التعليم المهني (الصناعي والزراعي) مع الإشارة للفجوة بين الجنسين فيه.
    *   **الصحة:** حلل البنية التحتية الصحية من حيث كفاية الأسرة (معدل الأسرة لكل 10,000 نسمة) وتوزيع المراكز الصحية (شامل وأولي). ثم حلل كثافة الكوادر الصحية (أطباء وممرضين لكل 10,000). بعد ذلك، أشر إلى مؤشرات الصحة العامة مثل معدل وفيات الرضع ومعدلات السرطان المسجلة.
*   **البنية التحتية والبيئة:** قيّم الوضع بناءً على مؤشرات المياه (حصة الفرد، مصادر المياه، تغطية الصرف الصحي) وإدارة النفايات الصلبة.
*   **الوضع الأمني والاجتماعي:** أشر إلى أبرز مؤشرات السلامة العامة (الحوادث، الجرائم) والتنمية الاجتماعية.

**2. تحليل SWOT (نقاط القوة، الضعف، الفرص، التهديدات)**
*   **نقاط القوة (Strengths):** بناءً على التحليل الرقمي، حدد المزايا التنافسية والإيجابيات الرئيسية للمحافظة.
*   **نقاط الضعف (Weaknesses):** حدد التحديات الهيكلية الداخلية الرئيسية التي تعيق التنمية.
*   **الفرص (Opportunities):** استكشف الإمكانيات المستقبلية والمشاريع المحتملة التي يمكن استغلالها.
*   **التهديدات (Threats):** حدد العوائق الخارجية أو المخاطر التي قد تؤثر على مستقبل المحافظة.

---

### **الجزء الثاني: الخطة التنموية المقترحة للمحافظة**

**3. الرؤية والرسالة**
*   **الرؤية (Vision):** صياغة رؤية طموحة ومستقبلية للمحافظة بحلول عام 2033، تعكس هويتها وتطلعات سكانها وتنسجم مع رؤية التحديث الاقتصادي الوطنية. (مثال: "محافظة [اسم المحافظة]، وجهة رائدة في السياحة البيئية والزراعة الذكية، تتمتع بمجتمع معرفي مزدهر وجودة حياة عالية.")
*   **الرسالة (Mission):** صياغة رسالة واضحة تحدد الغرض الأساسي للخطة وكيفية تحقيق الرؤية. (مثال: "نعمل على تحقيق التنمية المستدامة من خلال تمكين رأس المال البشري، وتطوير بنية تحتية ذكية، وخلق بيئة استثمارية جاذبة، والحفاظ على مواردنا الطبيعية والثقافية.")

**4. الأهداف الاستراتيجية**
*   بناءً على تحليل SWOT والتحديات الرئيسية، حدد 4-5 أهداف استراتيجية ذكية (محددة، قابلة للقياس، قابلة للتحقيق، ذات صلة، ومحددة زمنياً).
*   يجب أن تترجم هذه الأهداف الرؤية والرسالة إلى غايات عملية، وتنسجم مع المحاور الوطنية (مثل التنويع الاقتصادي، تنمية رأس المال البشري، الاستدامة).
*   (مثال لهدف: "زيادة مساهمة القطاع السياحي في الناتج المحلي للمحافظة بنسبة 50% بحلول عام 2030 من خلال تطوير منتجات سياحية مبتكرة.")

**5. الخطة التنفيذية (مشاريع ومبادرات رائدة)**
*   لكل هدف استراتيجي، اقترح 2-3 مشاريع أو مبادرات عملية وقابلة للتنفيذ تساهم مباشرة في تحقيقه.
*   يجب أن تكون المشاريع مبتكرة وتستفيد من نقاط القوة والفرص المتاحة للمحافظة.
*   صف كل مشروع بإيجاز، موضحاً هدفه، وأثره المتوقع على مؤشرات التنمية.
*   (مثال لمشروع تحت هدف السياحة: "مشروع 'مسار [اسم المحافظة] الأخضر': تطوير وتأهيل مسار سياحي بيئي يربط بين المواقع الطبيعية والأثرية، مع توفير خدمات رقمية للزوار وتدريب مرشدين سياحيين من المجتمع المحلي.")

**الناتج:** تقرير استراتيجي متكامل يساعد في اتخاذ قرارات مستنيرة لتحقيق تنمية حقيقية ومستدامة في محافظة ${data.governorateName}.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.4, // Lower temperature for more factual and structured output
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