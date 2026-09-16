import fs from 'node:fs';
import path from 'node:path';

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

function getDatabaseContent(modelId) {
  try {
    const possiblePaths = [
      path.join(process.cwd(), 'databases', `${modelId}.md`),
      path.join(process.cwd(), '_promt-gen', 'databases', `${modelId}.md`)
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf8');
      }
    }
  } catch (e) {
    console.error('Error reading database file:', e);
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try { bodyData = JSON.parse(bodyData); } catch (e) {}
    } else if (!bodyData) {
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
      }
      try { bodyData = JSON.parse(raw); } catch (e) { bodyData = {}; }
    }

    const { targetModel = 'seedream-5.0', nvidiaModel = 'meta/llama-3.2-11b-vision-instruct', userPrompt = '', apiKey = '' } = bodyData || {};

    if (!userPrompt || !userPrompt.trim()) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Пожалуйста, опишите вашу задумку для генерации промта.' }));
    }

    const databaseContent = getDatabaseContent(targetModel);
    if (!databaseContent) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: `База знаний для модели "${targetModel}" не найдена.` }));
    }

    const effectiveKey = (apiKey && apiKey.trim()) || process.env.NVIDIA_API_KEY || '';

    if (!effectiveKey) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        result: `### 1. Reference Map\n(Демо-режим: укажите ключ NVIDIA_API_KEY в Vercel Environment Variables)\n\n### 2. Final Prompt\n\`\`\`text\nA cinematic photograph portraying ${userPrompt}. Shot with natural light, sharp focus throughout. No text in the frame.\n\`\`\`\n\n### 3. Рекомендуемые параметры запуска\n- **Endpoint:** bytedance/seedream/v5/pro/text-to-image\n- **Формат:** png\n\n### 4. Стоимость и рекомендации\n- Для боевой генерации добавьте ключ NVIDIA_API_KEY в настройках Vercel.`,
        isDemo: true,
        modelUsed: `${nvidiaModel} (Demo)`,
        targetModel
      }));
    }

    const fewShotExample = targetModel === 'gpt-image-2.5'
      ? `### 1. Reference Map
Image 1: Character reference image. Inherit facial structure, hairstyle, clothing design, colors, and art style. Do not inherit original background, pose, or lighting.

### 2. Final Prompt
\`\`\`text
PURPOSE A character turnaround model sheet presenting the subject across four full-body orthogonal views in a single horizontal frame.
SUBJECT Image 1 is the reference character. Recreate this exact character in four standing poses arranged left to right: front view, left profile, right profile, and rear back view. Faithfully preserve the exact character design, facial structure, hairstyle, proportions, clothing, color palette, and visual art style from Image 1 across all four poses.
ENVIRONMENT A solid, uniform dark charcoal matte background (#1a1a1a) with no gradients, no scenery, and no decorative patterns.
COMPOSITION Single horizontal row with all four full-length figures standing at eye level on the same ground plane, evenly spaced from left to right, full body visible from head to toe with comfortable margins at top and bottom.
LIGHTING Neutral, balanced studio lighting evenly illuminating each figure with soft ambient fill; minimal soft contact shadows directly under the feet, no dramatic rim lighting.
MATERIALS Exact match to the textures and material rendering of Image 1, maintaining consistent shading and line work across all angles.
EXCLUDE No text, no labels, no captions, no numbers, no arrows, no character names, no extra props or floating graphic elements anywhere in the frame.
\`\`\`

### 3. Рекомендуемые параметры запуска
- **Endpoint:** \`openai/gpt-image-2.5/flare/edit\`
- **Разрешение:** \`1920 × 1080\` (16:9)
- **Качество:** \`high\`
- **Формат:** \`png\`

### 4. Стоимость и рекомендации
- **Стоимость:** ~$0.039 за изображение 1080p на качестве high.
- **Рекомендация:** Загрузите исходный рисунок в первый слот референсов Image 1.`
      : `### 1. Reference Map
Image 1: Исходное изображение персонажа. Наследовать анатомию, черты лица, прическу, костюм, цветовую гамму и художественную стилистику. Не наследовать исходный фон и позу.

### 2. Final Prompt
\`\`\`text
A professional character turnaround model sheet showcasing the subject from Image 1 in four full-body orthogonal standing views arranged side-by-side in a single horizontal frame from left to right: front view, left side profile, right side profile, and back rear view. The character stands upright at eye level on an even studio floor against an unbroken solid dark matte charcoal background. Exact match to the character design, proportions, facial likeness, outfit, and textures from Image 1 across all four perspectives. Neutral, evenly balanced studio illumination with soft ambient fill, subtle grounding contact shadows beneath the shoes, crisp photographic focus throughout. No text, no labels, no watermark, no extraneous decorative elements in the frame.
\`\`\`

### 3. Рекомендуемые параметры запуска
- **Endpoint:** \`bytedance/seedream/v5/pro/edit\`
- **Разрешение:** \`1920 × 1080\` (16:9)
- **Формат:** \`png\`
- **Ссылки:** \`image_urls: [Image 1]\`

### 4. Стоимость и рекомендации
- **Стоимость:** ~$0.135 за изображение (разрешение >1536px).
- **Рекомендация:** Для экономии можно выставить 1536 × 864, снизив стоимость до $0.0675.`;

    const systemPrompt = `You are an elite, world-class prompt engineer specializing in visual AI generation for ${targetModel}.
Your mission is to convert the user's raw idea into a flawless, production-ready prompt strictly based on the following PROMPT DATABASE.

==================== OFFICIAL PROMPT DATABASE FOR ${targetModel.toUpperCase()} ====================
${databaseContent}
==============================================================================================

CRITICAL MANDATORY RULES:
1. STRICT LANGUAGE REQUIREMENT:
   - SECTION 2 ("### 2. Final Prompt") MUST ALWAYS BE 100% IN NATURAL, PROFESSIONAL ENGLISH INSIDE THE CODE BLOCK.
   - NEVER TRANSLATE OR WRITE THE CODE BLOCK PROMPT IN RUSSIAN. Visual AI generators fail when given Russian.
   - Sections 1, 3, and 4 must be in clear Russian for the user.
2. NO RAW FORMULA LABELS IN SEEDREAM:
   - For Seedream 5.0, write a single cohesive, photographic narrative paragraph in English. Do NOT write "* ASSET TYPE:", "* CAMERA:", "* LIGHTING:".
   - For GPT Image 2.5, use the uppercase modular format: PURPOSE, SUBJECT, ENVIRONMENT, COMPOSITION, LIGHTING, MATERIALS, EXCLUDE.
3. CHARACTER TURNAROUND / MODEL SHEETS:
   - If the user asks for 4 views (front, left, right, back), NEVER split them into separate bullet points or multiple prompts!
   - Write ONE unified prompt describing a character turnaround model sheet displaying all 4 standing poses in a single horizontal row on a solid dark background.
4. FORBIDDEN AI BUZZWORDS:
   - NEVER use "photorealistic", "hyperrealistic", "8k", "masterpiece".
   - Specify real-world optics (lens focal length, aperture), tactile physical materials, and coherent light sources.
5. CLEAN HEADINGS:
   - Section 3 heading is strictly: "### 3. Рекомендуемые параметры запуска".
   - Never mention third-party platform names.

STRICT 4-SECTION OUTPUT FORMAT:
### 1. Reference Map
(Опишите назначение референсов Image 1, Image 2 и границы наследования, либо "Прямая генерация без входных референсов")

### 2. Final Prompt
\`\`\`text
<THE PROFESSIONAL PROMPT IN ENGLISH HERE>
\`\`\`

### 3. Рекомендуемые параметры запуска
- **Endpoint:** <exact endpoint name>
- **Разрешение:** <recommended size/preset>
- **Качество:** <recommended quality tier>
- **Формат:** <png or jpeg>

### 4. Стоимость и рекомендации
- <price estimate>
- <1-2 production tips>

EXAMPLE FOR REFERENCE:
${fewShotExample}

Output ONLY the 4 sections. No introductory or concluding conversational chatter.`;

    const nvidiaPayload = {
      model: nvidiaModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `User creative request:\n"${userPrompt}"\n\n[MANDATORY: Write Section 2 (### 2. Final Prompt) STRICTLY in ENGLISH in the code block. Do NOT write the final prompt in Russian. Sections 1, 3, and 4 should be in Russian.]` 
        }
      ],
      temperature: 0.35,
      top_p: 0.9,
      max_tokens: 700
    };

    const nvidiaRes = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveKey}`
      },
      body: JSON.stringify(nvidiaPayload),
      signal: AbortSignal.timeout(60000)
    });

    if (!nvidiaRes.ok) {
      const errText = await nvidiaRes.text();
      let userFriendlyMsg = `Ошибка NVIDIA API (${nvidiaRes.status}): ${errText}`;
      if (nvidiaRes.status === 401 || nvidiaRes.status === 403) {
        userFriendlyMsg = `Неверный или неактивный API ключ NVIDIA (${nvidiaRes.status}). Проверьте ваш ключ на build.nvidia.com.`;
      } else if (nvidiaRes.status === 429 || nvidiaRes.status === 529) {
        userFriendlyMsg = `Сервер NVIDIA временно перегружен (код ${nvidiaRes.status}). Попробуйте повторить запрос через 5–10 секунд.`;
      }

      res.statusCode = nvidiaRes.status;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: userFriendlyMsg }));
    }

    const nvidiaData = await nvidiaRes.json();
    const generatedContent = nvidiaData.choices?.[0]?.message?.content || 'Не удалось получить ответ от модели.';

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      result: generatedContent,
      isDemo: false,
      modelUsed: nvidiaModel,
      targetModel
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: `Внутренняя ошибка сервера: ${err.message}` }));
  }
}
