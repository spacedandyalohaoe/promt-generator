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
    desc: 'Кинематографичный свет, сложная оптика, 14 языков, мульти-реф до 10 фото'
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

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    targetModels: TARGET_MODELS,
    nvidiaModels: NVIDIA_MODELS,
    hasServerKey: !!process.env.NVIDIA_API_KEY
  }));
}
