# ПАМЯТКА: Фиксация версии и ключевые инсайты (Style Preservation vs Photorealism)

**Дата фиксации:** 16.09.2026  
**Текущий статус:** Версия заморожена в текущем состоянии («как есть»).

---

## 1. Текущее состояние приложения (`_promt-gen/`)
- **Сервер:** Нативный Node.js HTTP сервер (`server.js`) на порту `3000`, без сторонних npm-зависимостей.
- **Интерфейс:**
  - Левый верхний угол: только лаконичный заголовок `Prompt Studio` (без бейджей, иконок и подзаголовков).
  - Правый верхний угол: полностью чистый (блок API-ключей удален из UI, ключ безопасно работает на бэкенде через `.env` и скрыт от git).
  - Все упоминания `fal.ai` полностью устранены из UI, баз знаний и вывода.
  - «Быстрые примеры» удалены из интерфейса.
- **Модели:**
  - Основная рабочая: `meta/llama-3.2-11b-vision-instruct` (быстрый отклик ~1.5–2с).
  - Альтернативная: `z-ai/glm-5.3-flash`.
  - Модели с длинной очередью (`90B`, `DeepSeek`) помечены статусом `(Очередь)`.

---

## 2. Ключевой инсайт: конфликт стилей (Пиксель-арт против Фотореализма)

### Проведённый натурный эксперимент:
По одному и тому же исходному пиксельному персонажу было отправлено два промта:

1. **Эталонный промт (сохранил пиксельный стиль 1 в 1):**
   > `A character turnaround reference sheet of the character from image 1, shown in four full-body poses arranged in a single horizontal row from left to right: front view, left side view, right side view, and back view. Solid dark charcoal background, no gradients, no environment. Each pose is evenly spaced with identical proportions, preserving the exact outfit, colors, hairstyle, accessories, and body shape from the reference across all four angles. Even flat studio lighting from above with soft fill on both sides, consistent across every pose, no harsh shadows. No text, no labels, no additional objects in the frame.`

2. **Промт Llama 11B (сломал стиль и превратил в живую реалистичную девушку):**
   > `A professional character turnaround model sheet showcasing the subject from the reference image in four full-body orthogonal standing views arranged side-by-side in a single horizontal frame from left to right: front view, left side profile, right side profile, and back rear view. The character stands upright at eye level on an even studio floor against an unbroken solid dark matte charcoal background. Exact match to the character design, proportions, facial likeness, outfit, and textures from the reference image across all four perspectives. Neutral, evenly balanced studio illumination with soft ambient fill, subtle grounding contact shadows beneath the shoes, crisp photographic focus throughout. No text, no labels, no watermark, no extraneous decorative elements in the frame.`

---

## 3. Анализ причин сбоя Llama 11B

1. **Слова-убийцы стиля:**
   - Фраза `crisp photographic focus throughout` и `studio floor with grounding contact shadows` заставили нейросеть трактовать сцену как съемку живого человека на фотоаппарат, проигнорировав 2D/пиксельную природу референса.
2. **Размытие токена референса:**
   - Вместо жесткого эндпоинт-токена `image 1` Ллама написала `the reference image`, что ослабило привязку к исходному медиуму.
3. **Ограничение масштаба модели (11B vs Claude Sonnet):**
   - Небольшие модели оверфиттятся на шаблоны в базе знаний: если в системном промте много примеров с камерами и оптикой, 11B бездумно вставляет их везде, не понимая контекста «сохранить исходный арт-стиль».
   - **Жесткий запрет фото-слов недопустим**, так как сломает генерацию, когда пользователю действительно понадобится честное фото.

---

## 4. План на следующий этап (когда разморозим проект)

1. **Подключение Claude 3.5 / 3.7 Sonnet (Anthropic API) или GPT-4o:**
   - Добавить поддержку прямого ключа Anthropic/OpenAI в `server.js`.
   - Claude Sonnet обладает глубоким семантическим пониманием и безошибочно различает перенос медиума без навязывания паразитных фото-терминов.
2. **Внедрение архитектуры Style Branching (Ветвление стилей):**
   - **Ветка А (Style-Preserving):** При наличии референса и запросе на сохранение стиля — жесткая привязка к `Image 1`, явное `inherits the exact medium and visual art style of Image 1`, исключение любых слов из фото-семантики (`photographic`, `focal length`, `lens`).
   - **Ветка Б (Photorealism):** Полный оптический арсенал (линзы, свет, сенсор, текстура кожи).
   - **Ветка В (Stylization):** Прямое описание шейдеров (пиксель-арт, вектор, аниме, 3D изометрия).
