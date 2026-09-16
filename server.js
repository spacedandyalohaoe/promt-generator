import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically load .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length > 0) {
      const k = key.trim();
      const v = vals.join('=').trim().replace(/^["']|["']$/g, '');
      if (!process.env[k]) {
        process.env[k] = v;
      }
    }
  });
}

const PORT = process.env.PORT || 3000;
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

// Top NVIDIA NIM models recommended for prompt engineering
const NVIDIA_MODELS = [
  {
    id: 'meta/llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11B Vision Instruct',
    badge: 'Быстрый • Рекомендуется',
    desc: 'Мгновенный отклик (~1-2 сек): стабильно генерирует промты по строгим правилам и оптике без задержек'
  },
  {
    id: 'z-ai/glm-5.3-flash',
    name: 'GLM 5.3 Flash',
    badge: 'Быстрый • Анализ',
    desc: 'Высокоскоростная модель для сложных сцен, композиций и мульти-референсов'
  },
  {
    id: 'meta/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B Vision Instruct',
    badge: '90B Флагман (Очередь)',
    desc: 'Крупная 90B модель (на бесплатном тарифе NVIDIA возможен таймаут из-за очередей)'
  },
  {
    id: 'deepseek-ai/deepseek-v4-flash-0731',
    name: 'DeepSeek V4 Flash',
    badge: 'Reasoning (Очередь)',
    desc: 'Продвинутый логический анализ (на бесплатном тарифе NVIDIA возможен таймаут из-за очередей)'
  }
];

const TARGET_MODELS = [
  {
    id: 'seedream-5.0',
    name: 'Seedream 5.0 Pro',
    vendor: 'ByteDance',
    badge: 'Diffusion',
    icon: '🎨',
    desc: 'Кинематографичный свет, сложный многослойный рендеринг, 14 языков, до 10 ref'
  },
  {
    id: 'gpt-image-2.5',
    name: 'GPT Image 2.5 (Flare / Sunburst)',
    vendor: 'OpenAI',
    badge: 'Autoregressive',
    icon: '⚡',
    desc: 'Модульные блоки, честный альфа-канал, точнейшая типографика, до 16 ref'
  }
];

// Helper to read database file
function getDatabaseContent(modelId) {
  const dbPath = path.join(__dirname, 'databases', `${modelId}.md`);
  if (fs.existsSync(dbPath)) {
    return fs.readFileSync(dbPath, 'utf8');
  }
  return null;
}

// Fallback mock prompt generator when no API key is provided
function generateMockResponse(targetModel, userPrompt) {
  if (targetModel === 'gpt-image-2.5') {
    return `### 1. Reference Map
*(Прямая генерация без входных референсов. Если используете референс, укажите Image 1)*

### 2. Final Prompt
\`\`\`text
PURPOSE A high-end visual asset tailored to the creative brief: "${userPrompt}".
SUBJECT An intricately designed main subject embodying the core intent: ${userPrompt}, characterized by balanced proportions, authentic surface details, and clear spatial hierarchy.
ENVIRONMENT A grounded, physically realistic setting tailored specifically to the subject, with coherent depth planes, subtle textural contrast, and ambient atmosphere.
COMPOSITION Centered eye-level framing with deliberate negative space, natural leading lines, and balanced weight distribution throughout the frame.
LIGHTING Directional key lighting paired with soft diffuse fill, accentuating volumetric contours with realistic contact shadows and natural specular reflections.
MATERIALS Authentic material rendering with tactile surface properties, micro-texture nuances, and believable physical wear without synthetic sheen.
EXCLUDE No text, no watermark, no extraneous clutter, no synthetic plastic sheen, no distorted anatomy.
\`\`\`

### 3. Рекомендуемые параметры запуска
- **Endpoint:** \`openai/gpt-image-2.5/flare/text-to-image\` *(или \`sunburst\` для 4K детализации)*
- **\`image_size\`:** \`landscape_16_9\` (1920 × 1080)
- **\`quality\`:** \`high\`
- **\`background\`:** \`opaque\`
- **\`output_format\`:** \`png\`

### 4. Стоимость и рекомендации
- **Стоимость:** **$0.03960** за кадр 1080p на качестве \`high\`.
- **Режим демо:** *Ответ сгенерирован встроенным демо-шаблоном.*`;
  } else {
    return `### 1. Reference Map
*(Прямая генерация без входных изображений)*

### 2. Final Prompt
\`\`\`text
A cinematic photograph portraying ${userPrompt}. The scene features a central subject with crisp textural definition, set within a physically grounded environment with authentic depth of field. Soft directional daylight enters from the upper left, casting gentle natural shadows across tactile surfaces. Shot on a 50mm lens at f/2.2, fine film grain, natural color science, rich micro-contrast. No text, no watermark, no floating elements in the frame.
\`\`\`

### 3. Рекомендуемые параметры запуска
- **Endpoint:** \`bytedance/seedream/v5/pro/text-to-image\`
- **\`image_size\`:** \`landscape_16_9\` (1536 × 864)
- **\`output_format\`:** \`png\`

### 4. Стоимость и рекомендации
- **Стоимость:** **$0.0675** (размер ≤ 1536px попадает в базовый тариф).
- **Режим демо:** *Ответ сгенерирован встроенным демо-шаблоном.*`;
  }
}

// MIME types for static server
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // API: Get models meta
  if (req.method === 'GET' && pathname === '/api/models') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      targetModels: TARGET_MODELS,
      nvidiaModels: NVIDIA_MODELS,
      hasServerKey: !!process.env.NVIDIA_API_KEY
    }));
    return;
  }

  // API: Generate prompt
  if (req.method === 'POST' && pathname === '/api/generate') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const { targetModel = 'seedream-5.0', nvidiaModel = 'meta/llama-3.2-11b-vision-instruct', userPrompt = '', apiKey = '' } = data;

        if (!userPrompt.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Пожалуйста, опишите вашу задумку для генерации промта.' }));
          return;
        }

        const databaseContent = getDatabaseContent(targetModel);
        if (!databaseContent) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `База знаний для модели "${targetModel}" не найдена.` }));
          return;
        }

        const effectiveKey = (apiKey && apiKey.trim()) || process.env.NVIDIA_API_KEY || '';

        // If no API key provided, return rich mock response with guidance
        if (!effectiveKey) {
          const mockResult = generateMockResponse(targetModel, userPrompt);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            result: mockResult,
            isDemo: true,
            modelUsed: `${nvidiaModel} (Demo Preview)`,
            targetModel
          }));
          return;
        }

        // Tailored few-shot example depending on target model
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

        // System prompt with full database injection and strict rules
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
   - Never mention third-party platform names like fal.ai.

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

        // Call NVIDIA NIM API
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

        console.log(`[API] Calling NVIDIA NIM with model: ${nvidiaModel} for target: ${targetModel}...`);
        const startTime = Date.now();

        const nvidiaRes = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveKey}`
          },
          body: JSON.stringify(nvidiaPayload),
          signal: AbortSignal.timeout(120000)
        });

        console.log(`[API] NVIDIA responded in ${Date.now() - startTime}ms, status: ${nvidiaRes.status}`);

        if (!nvidiaRes.ok) {
          const errText = await nvidiaRes.text();
          let parsedError = errText;
          try {
            const errJson = JSON.parse(errText);
            parsedError = errJson.error?.message || errJson.detail || errText;
          } catch (e) {}

          let userFriendlyMsg = `Ошибка NVIDIA API (${nvidiaRes.status}): ${parsedError}`;
          if (nvidiaRes.status === 401 || nvidiaRes.status === 403) {
            userFriendlyMsg = `Неверный или неактивный API ключ NVIDIA (${nvidiaRes.status}). Проверьте ваш ключ на build.nvidia.com (он должен начинаться с "nvapi-").`;
          } else if (nvidiaRes.status === 429 || nvidiaRes.status === 529) {
            userFriendlyMsg = `Сервер NVIDIA временно перегружен (код ${nvidiaRes.status}). Попробуйте повторить запрос через 5–10 секунд.`;
          }

          res.writeHead(nvidiaRes.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: userFriendlyMsg, details: errText }));
          return;
        }

        const nvidiaData = await nvidiaRes.json();
        const generatedContent = nvidiaData.choices?.[0]?.message?.content || 'Не удалось получить ответ от модели.';

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          result: generatedContent,
          isDemo: false,
          modelUsed: nvidiaModel,
          targetModel
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Внутренняя ошибка сервера: ${err.message}` }));
      }
    });
    return;
  }

  // Static file serving from public/
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err2, fallback) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fallback);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Prompt Generator Web App is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📂 Databases loaded: seedream-5.0.md, gpt-image-2.5.md\n`);
});
