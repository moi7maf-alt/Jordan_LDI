
import { GoogleGenAI } from "@google/genai";
import { ChatMessageSource } from "../types";

// Lazy initialization of the GoogleGenAI client
let aiInstance: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI => {
    if (!aiInstance) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined. Please ensure it is set in your environment.");
        }
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
};

interface ChatResponse {
    text: string;
    sources: ChatMessageSource[];
}

// Cache configuration
const CACHE_PREFIX = 'gemini_cache_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const getCache = <T>(key: string): T | null => {
    try {
        const cached = localStorage.getItem(CACHE_PREFIX + key);
        if (!cached) return null;
        
        const { value, expiry } = JSON.parse(cached);
        if (new Date().getTime() > expiry) {
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        console.log(`[Gemini Cache] Hit for key: ${key}`);
        return value as T;
    } catch (e) {
        return null;
    }
};

const setCache = <T>(key: string, value: T): void => {
    try {
        const item = {
            value,
            expiry: new Date().getTime() + CACHE_TTL,
        };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
        console.log(`[Gemini Cache] Saved for key: ${key}`);
    } catch (e) {
        // If localStorage is full, clear old cache items
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            clearOldCache();
        }
    }
};

const clearOldCache = () => {
    console.log('[Gemini Cache] Clearing old cache due to storage limits');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(key);
        }
    }
};

export const getChatResponse = async (prompt: string): Promise<ChatResponse> => {
    const cacheKey = `chat_${prompt.substring(0, 100)}`;
    const cached = getCache<ChatResponse>(cacheKey);
    if (cached) return cached;

    const result = await withRetry(async () => {
        const ai = getAiInstance();
        const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const text = response.text;
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: ChatMessageSource[] = groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Untitled',
            }))
            .filter((source: ChatMessageSource) => source.uri);

        return { text, sources };
    }, 3, 2000);

    setCache(cacheKey, result);
    return result;
};

export const generateReportSummary = async (topic: string): Promise<string> => {
    const cacheKey = `report_summary_${topic}`;
    const cached = getCache<string>(cacheKey);
    if (cached) return cached;

    const result = await withRetry(async () => {
        const ai = getAiInstance();
        const fullPrompt = `Generate a concise analytical report on the following topic related to Jordan's development: "${topic}". The report should be well-structured, data-driven (using hypothetical but realistic data points if necessary), and provide actionable insights. The output should be in Arabic.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: fullPrompt,
            config: {
                temperature: 0.5,
            }
        });

        return response.text;
    });

    setCache(cacheKey, result);
    return result;
};

export interface GovernorateReportData {
    governorateName: string;
    population?: number;
    density?: number;
    unemploymentRate?: number;
    unemploymentNote?: string;
    nationalUnemploymentRate?: number;
    nationalStudentTeacherRatio?: number;
    nationalBedsPer10k?: number;
    nationalWaterPerCapita?: number;
    nationalSanitationCoverage?: number;
    avgIncome?: number;
    nationalAvgIncome?: number;
    nationalGPRate?: number;
    nationalNurseRate?: number;
    nationalInfantMortality?: number;
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
    // Health Rates (per 1000 pop)
    specialistRate?: number;
    gpRate?: number;
    dentistRate?: number;
    pharmacistRate?: number;
    nurseRate?: number;
    // Additional Data
    livestock?: {
        sheep?: number;
        goats?: number;
        cattle?: number;
        camels?: number;
    };
    economicDev?: {
        total_projects?: number;
        total_investment?: number;
        job_opportunities?: number;
    };
}

export interface GovernorateReportResponse {
    report: string;
    allocations: {
        name: string;
        value: number;
        color: string;
    }[];
    allocationJustification: string; // مبررات توزيع المخصصات
    swot: {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
    };
    strategicPlan: {
        vision: string;
        mission: string;
        goals: {
            goal: string;
            projects: {
                name: string;
                justification: string; // مبرر المشروع بناءً على البيانات
                kpi: string; // مؤشر قياس الأداء
            }[];
        }[];
    };
}

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        const isQuotaError = 
            error.message?.includes('429') || 
            error.message?.includes('quota') ||
            error.message?.includes('RESOURCE_EXHAUSTED') ||
            error.status === 'RESOURCE_EXHAUSTED' ||
            JSON.stringify(error).toLowerCase().includes('quota') ||
            JSON.stringify(error).includes('RESOURCE_EXHAUSTED') ||
            JSON.stringify(error).includes('429');

        if (retries > 0 && isQuotaError) {
            console.warn(`Gemini API Quota exceeded. Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }

        if (isQuotaError) {
            throw new Error("لقد تجاوزت الحصة المسموح بها لاستخدام الذكاء الاصطناعي (Quota Exceeded). يرجى الانتظار قليلاً ثم المحاولة مرة أخرى، أو التحقق من خطة الدفع الخاصة بك.");
        }
        
        console.error("Gemini API Error:", error);
        throw error;
    }
};

export const generateGovernorateReport = async (data: GovernorateReportData): Promise<GovernorateReportResponse> => {
    const cacheKey = `gov_report_${data.governorateName}`;
    const cached = getCache<GovernorateReportResponse>(cacheKey);
    if (cached) return cached;

    const result = await withRetry(async () => {
        const ai = getAiInstance();
        const prompt = `
أنت **خبير في التخطيط التنموي والتحليل الإحصائي**، ومكلف بإعداد **تقرير بحثي تنموي شامل وموسع** لمحافظة **${data.governorateName}**.

**الهدف:** تقديم تحليل علمي رصين يحول البيانات الإحصائية إلى رؤية استراتيجية متكاملة، تهدف إلى رصد الفجوات التنموية وتوجيه السياسات العامة والاستثمارات بأسلوب مهني رفيع.

**التعليمات الصارمة لضمان المصداقية والعمق:**
1.  **المقدمة:** يجب أن تكون المقدمة بأسلوب التقارير البحثية الرصينة، تركز على أهمية التقرير وأهدافه التنموية للمحافظة، **دون الإشارة** إلى صفة "كبير مستشاري" أو استخدام عبارات مثل "أضع بين أيديكم". ابدأ مباشرة بتوضيح السياق التنموي والهدف من الدراسة.
2.  **المنهجية:** استخدم أسلوب التحليل الرباعي (SWOT) والتحليل القطاعي المعمق. يجب أن يكون النص غنياً بالمصطلحات التنموية (مثل: الميزة التنافسية، الفجوة التنموية، الاستدامة المالية، رأس المال البشري).
3.  **البيانات:** **ممنوع تماماً اختراع أرقام**. استخدم البيانات المرفقة أدناه كمرجعية وحيدة للأرقام. حلل "الأثر المتوقع" بناءً على الواقع الجغرافي والاقتصادي المعروف للمحافظة في الأردن.
4.  **الهيكل التفصيلي للتقرير (يجب أن يظهر في حقل "report"):**
    *   **■ المشهد الديموغرافي والاجتماعي (2025):** تحليل الكثافة السكانية وأثرها على الضغط الخدمي.
    *   **■ الواقع الاقتصادي وسوق العمل (2024):** تحليل معمق لمعدلات البطالة (الوطنية والمحلية) وأسباب التفاوت، مع تحليل متوسط الدخل والقوة الشرائية.
    *   **■ قطاع التعليم ورأس المال البشري:** تحليل الاكتظاظ، المدارس المستأجرة، والتعليم المهني وأثره على مخرجات سوق العمل.
    *   **■ المنظومة الصحية والخدمات الطبية:** تحليل كفاية الأسرة والكوادر الطبية مقارنة بالمعايير.
    *   **■ البنية التحتية والموارد المستدامة:** تحليل حصة الفرد من المياه، تغطية الصرف الصحي، والسلامة المرورية.
    *   **■ القطاعات الواعدة (الزراعة، السياحة، الصناعة):** استعراض الميزة التنافسية للمحافظة.
    *   **■ المقارنة المعيارية (Benchmarking Analysis):** مقارنة أداء المحافظة بالمتوسط الوطني في المؤشرات الرئيسية (البطالة، التعليم، الصحة، المياه).
    *   **■ التنبؤ بالاحتياجات المستقبلية (Future Needs 2030):** تقدير الاحتياجات من المدارس، المستشفيات، والمياه بناءً على النمو السكاني المتوقع.
    *   **■ خارطة الفرص الاستثمارية (Investment Opportunity Map):** اقتراح 3 مشاريع كبرى ذات ميزة تنافسية عالية بناءً على موارد المحافظة.
    *   **■ مصفوفة المخاطر التنموية (Development Risk Matrix):** تحديد المخاطر (اقتصادية، اجتماعية، بيئية) واقتراح سياسات التخفيف.
    *   **■ التوصيات الاستراتيجية والمشاريع المقترحة:** حلول عملية لمعالجة نقاط الضعف المرصودة.

4.  **المشاريع:** يجب أن يكون كل مشروع مقترح "استجابة مباشرة" لرقم ضعيف في البيانات.

**البيانات المرجعية الدقيقة:**
*   **السكان (تقدير 2025):** ${data.population?.toLocaleString()} نسمة | الكثافة: ${data.density?.toFixed(1)} نسمة/كم².
*   **الاقتصاد (2024):** البطالة ${data.unemploymentRate?.toFixed(1)}% (الوطني ${data.nationalUnemploymentRate?.toFixed(1)}%) ${data.unemploymentNote ? `| ملاحظة: ${data.unemploymentNote}` : ''} | الدخل: ${data.avgIncome?.toLocaleString()} دينار (الوطني: ${data.nationalAvgIncome?.toLocaleString()} دينار).
*   **التعليم:** طالب/معلم: ${data.studentTeacherRatio?.toFixed(1)} (الوطني: ${data.nationalStudentTeacherRatio?.toFixed(1)}) | اكتظاظ: ${data.studentClassroomRatio?.toFixed(1)} | مدارس مستأجرة: ${data.rentedSchoolsPercentage?.toFixed(1)}%.
*   **الصحة:** ${data.bedsPer10k?.toFixed(1)} سرير/10 آلاف (الوطني: ${data.nationalBedsPer10k?.toFixed(1)}) | ${data.doctorsPer10k?.toFixed(1)} طبيب/10 آلاف | وفيات الرضع: ${data.infantMortality || 'غير متوفر'} (الوطني: ${data.nationalInfantMortality || '14.0'}).
*   **الكوادر (لكل 1000):** اختصاص (${data.specialistRate?.toFixed(4)}) | عام (${data.gpRate?.toFixed(4)} | الوطني: ${data.nationalGPRate?.toFixed(4)}) | أسنان (${data.dentistRate?.toFixed(4)}) | تمريض (${data.nurseRate?.toFixed(1)} | الوطني: ${data.nationalNurseRate?.toFixed(1)}).
*   **الثروة الحيوانية:** ضأن (${data.livestock?.sheep?.toLocaleString()}) | ماعز (${data.livestock?.goats?.toLocaleString()}) | أبقار (${data.livestock?.cattle?.toLocaleString()}) | إبل (${data.livestock?.camels?.toLocaleString()}).
*   **التنمية الاقتصادية:** عدد المشاريع (${data.economicDev?.total_projects}) | حجم الاستثمار (${data.economicDev?.total_investment?.toLocaleString()} دينار) | فرص العمل المستحدثة (${data.economicDev?.job_opportunities}).
*   **البنية التحتية:** مياه: ${data.waterPerCapita?.toFixed(1)} م³ (الوطني: ${data.nationalWaterPerCapita?.toFixed(1)}) | صرف صحي: ${data.sanitationCoverage?.toFixed(1)}% (الوطني: ${data.nationalSanitationCoverage?.toFixed(1)}) | حوادث: ${data.trafficAccidents}.

**المطلوب ناتج JSON بالهيكل التالي:**
{
  "report": "نص التقرير التنموي الشامل (Markdown). يجب أن يكون التقرير مفصلاً ودقيقاً، يغطي كافة الفصول الـ 11 المذكورة أعلاه بعمق. ركز على التحليل الاستراتيجي والربط بين الأرقام وتقديم رؤية تدعم اتخاذ القرار.",
  "allocations": [
    {"name": "القطاعات الاجتماعية والخدمية", "value": number, "color": "#E0F2FE"},
    {"name": "القطاعات الاقتصادية والإنتاجية", "value": number, "color": "#DCFCE7"},
    {"name": "البنية التحتية والاستدامة البيئية", "value": number, "color": "#FFF9E5"}
  ],
  "allocationJustification": "تحليل استراتيجي لمبررات توزيع الميزانية بناءً على الأولويات القصوى المكتشفة، مع مراعاة دمج 'التشغيل' ضمن القطاعات الاقتصادية والإنتاجية، ودمج 'التدريب' ضمن القطاعات الاجتماعية والخدمية (التعليم).",
  "swot": {
    "strengths": ["نقاط قوة حقيقية مستمدة من البيانات والجغرافيا"],
    "weaknesses": ["نقاط ضعف مستمدة من الأرقام الضعيفة في البيانات"],
    "opportunities": ["فرص مرتبطة برؤية التحديث الاقتصادي 2033"],
    "threats": ["تحديات خارجية مثل التغير المناخي أو الهجرات القسرية"]
  },
  "strategicPlan": {
    "vision": "رؤية طموحة للمحافظة (2026-2033)",
    "mission": "رسالة مؤسسية واضحة",
    "goals": [
      {
        "goal": "هدف استراتيجي كبير",
        "projects": [
          {
            "name": "اسم مشروع تنموي ضخم", 
            "justification": "ربط المشروع مباشرة ببيانات المحافظة (مثلاً: سد الفجوة في قطاع X)",
            "kpi": "مؤشر أداء رقمي قابل للقياس"
          }
        ]
      }
    ]
  }
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt,
            config: {
                temperature: 0.3,
                responseMimeType: 'application/json',
            }
        });

        return JSON.parse(response.text) as GovernorateReportResponse;
    });

    setCache(cacheKey, result);
    return result;
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
    const cacheKey = `comp_analysis_${gov1.name_ar}_${gov2.name_ar}`;
    const cached = getCache<string>(cacheKey);
    if (cached) return cached;

    const result = await withRetry(async () => {
        const ai = getAiInstance();
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
            model: 'gemini-flash-latest',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.3,
            }
        });

        return response.text;
    });

    setCache(cacheKey, result);
    return result;
};


export const generateProjectAnalysis = async (projectIdea: string, governorate: string): Promise<string> => {
    const cacheKey = `proj_analysis_${projectIdea}_${governorate}`;
    const cached = getCache<string>(cacheKey);
    if (cached) return cached;

    const result = await withRetry(async () => {
        const ai = getAiInstance();
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
            model: 'gemini-flash-latest',
            contents: prompt,
            config: {
                temperature: 0.6,
            }
        });

        return response.text;
    });

    setCache(cacheKey, result);
    return result;
};

export interface AlignmentAnalysisResponse {
    score: number;
    justification: string;
    report: string;
}

export const analyzeEconomicVisionAlignment = async (projectIdea: string, governorate: string): Promise<AlignmentAnalysisResponse> => {
    const cacheKey = `vision_alignment_${projectIdea}_${governorate}`;
    const cached = getCache<AlignmentAnalysisResponse>(cacheKey);
    if (cached) return cached;

    const result = await withRetry(async () => {
        const ai = getAiInstance();
        
        // Get governorate context from constants if possible
        // Note: We can't easily import ECONOMIC_VISION_DATA here without circular dependency if we are not careful, 
        // but we can pass it from the component or just rely on Gemini's knowledge supplemented by the prompt.
        
        const prompt = `
أنت خبير استراتيجي متخصص في "رؤية التحديث الاقتصادي الأردنية (2022-2033)". 
مهمتك هي تحليل مدى مواءمة مشروع لا مركزي مقترح في محافظة ${governorate} مع ركائز وأهداف الرؤية.

**التعليمات الصارمة:**
1. **البيانات الحقيقية:** يجب أن يكون التحليل مبرراً ببيانات حقيقية مرتبطة بمحافظة ${governorate} (مثل الميزة التنافسية، التحديات التنموية، القطاعات الواعدة) وليس مجرد افتراضات عامة.
2. **درجة المواءمة:** يجب تحديد درجة مواءمة رقمية دقيقة من 100.

**البيانات المرجعية للرؤية:**
- الركائز الاستراتيجية: (1) إطلاق الإمكانات الاقتصادية، (2) تحسين نوعية الحياة.
- محركات النمو الثمانية: الأردن وجهة عالمية، الصناعات عالية القيمة، الخدمات المستقبلية، الاستدامة الخضراء، البيئة الاستثمارية، الموارد المستدامة، الخدمات اللوجستية والنقل، نوعية الحياة.
- المستهدفات الكلية: تشغيل مليون شاب، استثمار 30 مليار، نمو 5.6%، زيادة دخل الفرد 3%.

**فكرة المشروع المقترح:** "${projectIdea}"

**المطلوب منك إعداد تقرير تحليلي مفصل باللغة العربية يتضمن المحاور التالية:**

1. **تحليل الارتباط بالركيزتين الأساسيتين:**
   * **إطلاق الإمكانات الاقتصادية:** كيف يساهم المشروع في تسريع الاستثمار وتطوير القطاعات الإنتاجية؟
   * **تحسين نوعية الحياة:** كيف يحسن المشروع رفاه المواطن، حماية البيئة، أو الخدمات الأساسية؟

2. **محركات النمو الثمانية:**
   * حدد أي من المحركات الثمانية يخدمها هذا المشروع بشكل مباشر.

3. **المواءمة مع الميزة التنافسية للمحافظة:**
   * افحص مدى مواءمة المشروع مع "الميزة التنافسية" لمحافظة ${governorate} و"القطاعات الواعدة" فيها.

4. **التوصيات الاستراتيجية:**
   * كيف يمكن تطوير المشروع لزيادة أثره التنموي.

**يجب أن يكون الناتج بصيغة JSON حصراً بالهيكل التالي:**
{
  "score": number (درجة المواءمة من 100),
  "justification": "نص قصير (جملة أو جملتين) يبرر الدرجة بناءً على البيانات الحقيقية للمحافظة",
  "report": "التقرير التحليلي الكامل بتنسيق Markdown"
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt,
            config: {
                temperature: 0.4,
                responseMimeType: 'application/json',
            }
        });

        const result = JSON.parse(response.text);
        return {
            score: result.score || 0,
            justification: result.justification || '',
            report: result.report || response.text
        };
    });

    setCache(cacheKey, result);
    return result;
};
