# GPT IMAGE 2.5 — PROMPT DATABASE

> Финальная база. Всё лаконично. Для ИИ и людей.

---

## MODEL INFO

- **Name:** GPT Image 2.5 (Variants: `Flare` & `Sunburst`)
- **Developer:** OpenAI
- **Type:** Native Autoregressive Multimodal / Diffusion Transformer
- **Release:** September 8, 2026
- **Variants:**
  - **Flare:** Оптимизирован под скорость (до 50% ниже задержка по сравнению с GPT Image 2 при равном/лучшем качестве). Для драфтов, итераций, соцсетей.
  - **Sunburst:** Оптимизирован под точность и микроструктуру (длиннее инференс, сохранение мелких деталей, 4K макро, сложные правки).
- **Strengths:** Прецизионный рендеринг типографики, нативная поддержка прозрачного фона (Alpha channel PNG/WebP), многораундовый последовательный эдитинг с сохранением идентичности (до 16 ref-изображений), photorealism без пластикового AI-блеска.
- **Ratios:** Пресеты: `square_hd`, `square`, `portrait_4_3`, `portrait_16_9`, `landscape_4_3`, `landscape_16_9`, `auto` (или кастом `{width, height}`: кратны 16, ratio ≤ 3:1).
- **Resolution:** До 3840px по длинной стороне (от 655 360 до 8 294 400 пикселей). *Разрешения > 3.68M px (4K) экспериментальны.*
- **Quality Tiers:** `low`, `medium`, `high`, `xhigh`, `max` (по умолчанию `high`).
- **Transparency:** Возврат честного альфа-канала при `background: "transparent"` и формате `png` / `webp`.

---

## PROMPT FORMULA (Modular Blocks)

Для GPT Image 2.5 рекомендуется модульная блочная структура. Каждый блок имеет единую зону ответственности:

```
[PURPOSE / ASSET TYPE] + [SUBJECT + ACTION] + [ENVIRONMENT] + [COMPOSITION & FRAMING] + [LIGHTING & ATMOSPHERE] + [MATERIALS & SURFACES] + [ON-IMAGE TEXT] + [CONSTRAINTS / EXCLUDE]
```

### Block Definitions

1. **PURPOSE / ASSET TYPE** — задаёт дефолты композиции и стиль: `PURPOSE A photograph for an interiors catalogue, horizontal crop, product held in the right two-thirds.`
2. **SUBJECT** — главный объект + пропорции, геометрия, поза, действие: `SUBJECT A brass desk lamp with a ribbed shade on a walnut writing desk.`
3. **ENVIRONMENT** — физическое окружение (НЕ настроение): `ENVIRONMENT Against a limewashed wall in pale grey green, scuffed studio table.`
4. **COMPOSITION & FRAMING** — ракурс, дистанция, распределение масс, зарезервированное место под текст/дизайн: `COMPOSITION Eye level, 50mm equivalent, left third kept clear and evenly lit so a caption can sit there.`
5. **LIGHTING & ATMOSPHERE** — физические источники света, направление, жесткость, тени, практические лампы: `LIGHTING Late afternoon sun entering low from the left, one hard shadow thrown by the lamp arm across the desk, the bulb switched off.`
6. **MATERIALS & SURFACES** — конкретная физика материалов, фактура, следы износа, стыки: `MATERIALS Unlacquered brass carrying a warm patina and fingerprints near the switch, a fabric-wrapped cord running off the back edge.`
7. **ON-IMAGE TEXT** — точный текст в `"двойных кавычках"` + регистр, гарнитура, позиция, количество повторений: `TEXT Title reads "PARALLEL HARBOUR" in heavy geometric sans across the top. No other text.`
8. **CONSTRAINTS / EXCLUDE** — жесткие запреты: `EXCLUDE No text anywhere in the frame, no people, no visible logos.`

---

## RULES

### DO
- **Пиши блоками с явными метками (`PURPOSE`, `SUBJECT`, `LIGHT`, `MATERIALS`, `CAMERA`, `EXCLUDE`)** — это позволяет менять свет или материал во второй итерации, не переписывая весь бриф.
- **Ставь Purpose в первую строку** — это мгновенно фиксирует тип кадра и пространственную логику.
- **Всегда бери текст в `"двойные кавычки"`** и указывай шрифт (sans, serif, mono) и точное местоположение.
- **Описывай видимую физику** — направление лучей, длину теней, блики, патину, швы, пыль.
- **The Preservation Rule для правок (Edit):**
  - Чётко назови изменение (`Change only the lamp. Swap brass for matte black...`).
  - Чётко перечисли неизменяемые зоны (`Desk, wall, notebook, shadow direction and clear left third stay exactly as they are.`).
- **Один шаг редактирования на один проход** — не смешивай замену объекта и изменение освещения в один запрос.
- **Нумеруй референсы в массиве `image_urls`** (`Image 1 is ..., Image 2 is ...`). Модель поддерживает до 16 входных изображений.
- **Настоящий Alpha-канал** — используй `background: "transparent"` + `output_format: "png"` для мгновенного получения вырезанного объекта без ореолов.

### DON'T
- ❌ **Keyword soup** (`photorealistic, 8k, masterpiece, hyperrealistic, trending on artstation`) — забивают токены и дают синтетический вид.
- ❌ **Расплывчатые формулировки** (`a beautiful lamp, cozy atmosphere, cinematic feeling`) — замени на конкретный свет и материалы.
- ❌ **Оценка мелкого текста на драфтах (`low`)** — мелкий шрифт, схема или таблица требуют качества `high`, `xhigh` или `max`.
- ❌ **Многосоставные правки за один вызов** (`Change the lamp to black, make it night time, and add a cat`) — приводит к потере контроля.
- ❌ **Забывать повторять ограничения в последующих раундах правок** — в каждом следующем вызове Edit ограничения нужно декларировать заново.

### ANTI-AI-LOOK RULE
Вместо абстрактных слов о реализме задавай оптические и материальные дефекты реального мира:
- ❌ `hyperrealistic 8k detailed texture`
- ✅ `Unvarnished chalk white board, visible paper grain, micro-scuffs near the press stud, two interlocking passes of waxed linen thread with individual twist visible.`

---

## PROMPT TEMPLATES

### 1. Template: Modular Block Production Prompt (Baseline)
```
PURPOSE A [product / architectural / editorial] photograph for [USE CASE], [ASPECT RATIO / CROP], subject positioned in the [PLACEMENT].
SUBJECT [DETAILED DESCRIPTION OF MAIN SUBJECT — geometry, dimensions, colors, parts].
ENVIRONMENT [PHYSICAL SETTING — surfaces, walls, background objects, room depth].
COMPOSITION [CAMERA ANGLE & FRAMING — eye level / top-down / low angle], [LENS FEEL — 35mm / 50mm / 85mm], [EMPTY ZONES HELD FOR COPY OR TITLES].
LIGHTING [KEY LIGHT SOURCE & DIRECTION], [FILL & SHADOW QUALITY], [PRACTICAL LIGHTS].
MATERIALS [SPECIFIC PHYSICAL SURFACES — brushed metal, open grain wood, leather patina, linen texture].
EXCLUDE No text, no logos, no extraneous background elements.
```

### 2. Template: Cinematic Frame with Negative Space for Titles
```
A wide [day / night] exterior / interior of [ENVIRONMENT], viewed from [CAMERA ANGLE / DISTANCE] so that [FOREGROUND ELEMENT] frames the [POSITION]. [ATMOSPHERIC CONDITIONS — rain, dust, fog, twilight]. [PRIMARY LIGHT SOURCES — sodium lamps, headlights, neon], creating [REFLECTION / SHADOW DETAILS]. Deep uncluttered shadow across the [bottom third / left half] kept completely clear so titles can sit over it, [COLOR PALETTE — amber against cold blue], fine film grain, no text anywhere in the image.
```

### 3. Template: Product Photography (Catalogue & E-Commerce)
```
A product photograph for a catalogue, [square / vertical] crop, subject standing alone on [BACKDROP / SURFACE — chalk white paper / honed stone] with generous margin on all sides. [PRODUCT DESCRIPTION — form, finish, parts]. The wordmark "[BRAND NAME]" [laser etched / embossed / printed] in [FONT STYLE] across [POSITION], with "[SUB-LABEL]" below it in smaller type. [KEY LIGHT DIRECTION AND QUALITY], [CONTACT SHADOW DETAIL], [SPECULAR HIGHLIGHTS ON EDGES]. Tack-sharp focus across the product, accurate true-to-life colors, no props, no reflections of studio softboxes, no text beyond the marks named.
```

### 4. Template: Dense Typography / Packaging / Tracklist
```
An overhead photograph of [PACKAGING / RECORD SLEEVE / BOOK COVER] lying on [SURFACE], printed on [PAPER / MATERIAL TYPE]. A prominent title across the [POSITION] reads "[MAIN TITLE]" in [FONT STYLE, e.g. heavy geometric sans]. Beneath it, [LAYOUT TYPE, e.g. a two-column list] in [FONT TYPE, e.g. small monospaced capitals], reading:
Column 1: "[LINE 1]", "[LINE 2]", "[LINE 3]"
Column 2: "[LINE 4]", "[LINE 5]", "[LINE 6]".
A credit block [POSITION] in tiny type reads "[CREDIT LINE 1]", "[CREDIT LINE 2]". A [barcode / seal / logo mark] in [CORNER]. Clean alignment, crisp legible type at every scale, every word spelled exactly as written, no other text in the frame.
```

### 5. Template: Technical Illustration / Exploded Diagram with Parts Key
```
A technical illustration of an exploded [MECHANISM / OBJECT] on [BACKGROUND TONE — warm off-white], drawn as a clean line diagram with flat two-tone shading in [COLOR 1] and one [ACCENT COLOR] note. Components arranged along a single [horizontal / vertical] axis in assembly sequence, evenly spaced, each connected by a thin leader line numbered 1 to [N]: [COMPONENT LIST]. A parts key down the [right / bottom] in small sans capitals, numbered 1 to [N] to match the callouts:
1. "[PART NAME 1]"
2. "[PART NAME 2]"
3. "[PART NAME 3]".
A title block [POSITION] reads "[DIAGRAM TITLE]" over "[SCALE / VERSION]". Every label spelled exactly as written, perfectly sharp diagrammatic lines, no additional text.
```

### 6. Template: Transparent Background Cutout (Alpha PNG)
```
Return only [SUBJECT], keyed out to full transparency. Hold the body geometry, proportions, edges and [SPECIFIC DETAILS / TEXT MARKS] exactly as described. Edges tack-sharp with clean anti-aliasing and no background halo, fringe, or spill light. Center the subject with even margin. Eliminate all background surfaces, ground shadows and reflections. Pure transparency behind the subject, nothing painted in.
```
*(API Call: `background: "transparent"`, `output_format: "png"`)*

### 7. Template: Grounded Edit (Single-Pass Regional Swap)
```
Change only the [TARGET ELEMENT]. Swap [ORIGINAL ATTRIBUTE] for [NEW ATTRIBUTE — material, color, state], holding the exact same geometry, scale and position. Keep [LIST OF UNCHANGED ELEMENTS — surfaces, surrounding objects, lighting direction, background] exactly as they are.
```

### 8. Template: Multi-Reference Composite (Up to 16 Inputs)
```
Image 1 is the [BASE SCENE, e.g. environment or desk setup] and Image 2 is the [OBJECT TO INSERT / SUBJECT]. The environment, perspective, lighting direction, and background of Image 1 are completely fixed. Place [SUBJECT FROM IMAGE 2] into [TARGET POSITION IN IMAGE 1], scaled proportionally against [REFERENCE OBJECT]. Match the lighting angle, warmth, and cast shadow to the existing light in Image 1. Preserve [IDENTIFYING DETAILS / BRAND TEXT FROM IMAGE 2]. Change nothing else in the scene.
```

---

## REFERENCE PROMPTS (from official research & benchmarks)

### Ref 1: Interiors Catalogue — Brass Desk Lamp
```
PURPOSE A photograph for an interiors catalogue, horizontal crop, product held in the right two-thirds.
SUBJECT A brass desk lamp with a ribbed shade on a walnut writing desk, against a limewashed wall in pale grey green.
MATERIALS Unlacquered brass carrying a warm patina and fingerprints near the switch, a fabric-wrapped cord running off the back edge, a closed notebook and a glass of water beside it.
LIGHT Late afternoon sun entering low from the left, one hard shadow thrown by the lamp arm across the desk, the bulb switched off.
CAMERA AND FRAME Photorealistic, eye level, 50mm equivalent, the left third of the wall kept clear and evenly lit so a caption can sit there.
EXCLUDE No text anywhere in the frame.
```

### Ref 2: Record Sleeve — Dense Typography
```
An overhead photograph of a 12 inch record sleeve on a scuffed studio table under one soft overhead light, back of the sleeve facing up, printed on unvarnished chalk white board. A heavy geometric sans title across the top reads "PARALLEL HARBOUR". Beneath it a two column tracklist in small monospaced capitals, reading "1. LOW TIDE", "2. SALT ROOM", "3. NINE FATHOM", "4. DRY DOCK", "5. PARALLEL HARBOUR" on the left and "6. BREAKWATER", "7. COLD STORE", "8. NIGHT FERRY", "9. HARBOUR LIGHT", "10. OUTBOUND" on the right. A three line credit block bottom left in tiny type reads "Recorded at Ashgrove Studio", "Mixed by R. Halloran", "PARALLEL 004". A barcode block bottom right. No other text.
```

### Ref 3: Exploded Bicycle Hub — Technical Diagram
```
A technical illustration of an exploded rear bicycle hub on warm off white, drawn as a clean line diagram with flat two tone shading in graphite and one rust orange accent. Components along a single horizontal axis in assembly order, evenly spaced, each with a numbered leader line: axle, drive side bearing, freehub body, six pawls with springs, ratchet ring, lock ring, hub shell with twenty four flanged spoke holes, non drive bearing, end cap. A parts key down the right side in small sans capitals, numbered 1 to 9 to match the callouts, reading "AXLE", "BEARING, DRIVE", "FREEHUB BODY", "PAWL AND SPRING", "RATCHET RING", "LOCK RING", "HUB SHELL", "BEARING, NON DRIVE", "END CAP". A title block lower left reads "REAR HUB, EXPLODED" over "SCALE 1:1". Every label spelled as written, no other text.
```

### Ref 4: Roadside Service Station — Cinematic Wide
```
A wide night exterior of a shuttered roadside service station on a high desert highway, viewed from across the road at a low angle so the forecourt canopy slices across the upper frame. Two sodium lamps still burning over empty pumps, shop windows dark, a single pickup at the lot edge with its cab light on. Wet asphalt holding reflections after rain, distant hills reduced to flat silhouette, no moon. Deep uncluttered shadow across the bottom third so titles can sit over it, muted amber against cold blue, fine grain, no text in the image.
```

### Ref 5: Ferry Saloon — Low-Light Practicals
```
A photorealistic interior frame from a ferry's lower saloon at night, upright crop, camera at seated eye level looking down the cabin. Rows of worn ochre vinyl benches, condensation tracking down the windows, a vending machine glowing at the far end as the single bright source, overhead strip lights off. One raincoat folded on a seat in the middle distance, a paper cup tipped on the floor against the swell. Colour pulled green in the shadows and warm at the machine, handheld framing with a slight lean, visible grain, nobody in the frame.
```

### Ref 6: Stainless Steel Flask — Studio E-Commerce
```
A product photograph for a catalogue, square crop, subject standing alone on an unbroken sweep of chalk white paper with room on all sides. A brushed stainless vacuum flask upright under a matte charcoal lid, the wordmark "CARRICK" laser etched into the steel in narrow capitals with "500 ML" below it in smaller type, and a small "18-8" stamp near the base. Broad soft light from the front left, one crisp contact shadow, a faint specular line down the right edge of the steel. Accurate colour, no props, no studio reflections in the metal, no text beyond the three marks named.
```

### Ref 7: Lifestyle E-Commerce — Product in Use
```
The same brushed stainless flask in use on a granite kitchen counter, horizontal crop, flask left of centre with its lid off and resting beside it. A folded tea towel, a bowl of clementines and a half open paper coffee bag occupy the right of the frame at shallower focus, with "CARRICK" still readable on the flask body. Direct morning sun through a window on the right throwing a long shadow toward the camera, warm neutral colour, nothing else in shot.
```

### Ref 8: Leather Cardholder — 4K Micro-Detail Macro on Sunburst
```
A product detail photograph for a listing page, framed tight on the corner of a tan vegetable-tanned leather cardholder lying flat on slate, lit by soft light from the upper left with a weak fill from the right. The pebbled grain reads differently across the curve of the edge, and the burnished edge paint sits slightly proud of the leather with one faint brush mark left in it. Saddle stitching runs as two interlocking passes of waxed linen thread, every stitch separately visible, the thread showing its twist. A brass press stud at the top of the frame carries fine machining circles and a shallow scuff. Accurate colour, natural leather sheen, no text or logo anywhere in the frame.
```

### Ref 9: Edit Pass 1 — Targeted Material Swap
```
Change only the lamp. Swap the brass for powder coated matte black across the shade and the arm, holding the same shape, the same position and the same switch. Desk, wall, notebook, glass, shadow direction and the clear left third all stay exactly as they are.
```

### Ref 10: Edit Pass 2 — Lighting / Time-of-Day Transition
```
Change only the time of day. Move the room to late evening with the lamp switched on and pooling warm light across the desk, window light gone, the wall falling into shadow. Lamp geometry, desk, objects on it and framing stay identical, and the left third of the wall stays clear.
```

### Ref 11: Multi-Reference Composite — Scene + Product
```
Image 1 is the original desk lamp frame, taken before either edit round, and image 2 is the product. Desk, wall, lamp, light direction and the empty left third of image 1 are all fixed. Stand the flask from image 2 on the right of the desk behind the notebook, scaled correctly against the lamp for a 500 ml flask, lit by the same low sun from the left, casting a shadow that matches the one already on the desk. Keep "CARRICK" readable and change nothing else.
```

### Ref 12: Pure Alpha Cutout — Transparent PNG
```
Return only the flask, keyed out to full transparency. Hold the body geometry, the lid proportions and the etched wordmark exactly as they arrived. Edges clean through the brushed steel and the charcoal lid, with no light halo along them. Centre the subject with even margin. Studio sweep and contact shadow both go, and nothing gets painted in behind.
```

---

## API & Спецификация

### Endpoints
| Действие / Режим | Endpoint Path |
|---------------|--------------|
| **Flare (Text-to-Image)** | `openai/gpt-image-2.5/flare/text-to-image` |
| **Flare (Edit)** | `openai/gpt-image-2.5/flare/edit` |
| **Sunburst (Text-to-Image)** | `openai/gpt-image-2.5/sunburst/text-to-image` |
| **Sunburst (Edit)** | `openai/gpt-image-2.5/sunburst/edit` |

### Тарифы (за изображение)
| Размер | low | medium | high | xhigh | max |
|------|-----|--------|------|-------|-----|
| **1024 × 768** | $0.00402 | $0.00903 | $0.03612 | $0.06420 | $0.14445 |
| **1024 × 1024** | $0.00588 | $0.01317 | $0.05268 | $0.09366 | $0.21072 |
| **1024 × 1536** | $0.00474 | $0.01029 | $0.04116 | $0.07377 | $0.16464 |
| **1920 × 1080** | $0.00441 | $0.01029 | $0.03960 | $0.07041 | $0.15840 |
| **2560 × 1440** | $0.00615 | $0.01434 | $0.05529 | $0.09828 | $0.22110 |
| **3840 × 2160 (4K)** | $0.01113 | $0.02595 | $0.10008 | $0.17790 | $0.40026 |

*Примечание:* Стоимость Flare и Sunburst одинакова на идентичных разрешениях и уровнях качества.

### Стратегия оптимизации стоимости
1. **Прототипирование:** Запускай Flare на `low` ($0.004–$0.005) для калибровки композиции и света.
2. **Финальный кадр:** Запускай отобранный бриф на `high` ($0.036–$0.055).
3. **Sunburst @ xhigh/max:** Включай только для крупноформатной печати, макро-деталей или микротекста.
4. **Правки:** Делай через Edit-эндпоинт по одной правке за раз, явно декларируя зафиксированные зоны.

---

## РАБОТА С МУЛЬТИ-РЕФЕРЕНСАМИ

При использовании эндпоинтов редактирования (`openai/gpt-image-2.5/flare/edit` и `openai/gpt-image-2.5/sunburst/edit`):
- Входной массив `image_urls` принимает **до 16 изображений**, индексируемых от 1: `Image 1`, `Image 2` ... `Image 16`.
- В промте каждый референс адресуется явно с назначением роли и запретов на утечку:
  ```text
  Image 1 is the base scene. Desk, wall, lighting, and left third are fixed.
  Image 2 defines only the product flask. Place it on the right of the desk, scaled for 500ml. Do not use its original background.
  ```
- Опциональная маска передаётся в поле `mask_url` для ограничения правок строго заданной областью.

---

## PRE-FLIGHT VALIDATION CHECKLIST

Перед отправкой промта модели или выводом пользователю проверь:

1. **Выбор варианта и эндпоинта:**
   - Быстрый драфт / итерации / социальные форматы → `flare/text-to-image` или `flare/edit`
   - Макроструктура, сложные шрифты, 4K, схемы → `sunburst/text-to-image` или `sunburst/edit`
   - Есть референсы / обтравка / правка → строго `edit`
2. **Токены референсов (в Edit):**
   - Все `Image N` строго соответствуют элементам в `image_urls` (до 16 штук).
   - Для каждого референса назначена конкретная роль.
3. **Модульная формула соблюдена:**
   - `PURPOSE` указан в первой строке (задаёт ракурс и контекст).
   - Физика света и материалов описана конкретно (без слов `photorealistic`, `8k`).
4. **Текст и шрифты:**
   - Каждая фраза или слово взяты в `"двойные кавычки"`.
   - Указаны регистр, шрифт (sans, serif, mono) и позиция.
   - Если текст мелкий или плотный — качество установлено не ниже `high`.
5. **The Preservation Shift (в Edit):**
   - Ровно **одно изменение** на текущий проход (One change per pass).
   - Все стабильные зоны явно перечислены как неизменные (`Keep X, Y, Z unchanged`).
6. **Прозрачность (если нужен cutout):**
   - Задано `background: "transparent"` и `output_format: "png"` или `"webp"`.
7. **Технические параметры:**
   - Стороны кратны 16, длинная сторона ≤ 3840px, ratio ≤ 3:1.
   - Размер ≤ 3 686 400 пикселей (если не требуется эксперимент 4K).

---

## AGENT OUTPUT PROTOCOL

Когда ИИ генерирует промт по запросу пользователя, ответ формируется строго по стандарту:

1. **Reference Map** *(только если используются референсы)*:
   ```text
   Image 1: [Роль, наследуемые черты / исключаемые детали]
   Image 2: [Роль, наследуемые черты / исключаемые детали]
   ```
2. **Final Prompt:**
   Один чистый монолитный блок кода (markdown code-block на английском языке), отформатированный по модульным блокам (`PURPOSE`, `SUBJECT`, `LIGHT`...), готовый для генератора изображений.
3. **Рекомендуемые параметры запуска:**
   - Endpoint: `openai/gpt-image-2.5/flare/...` или `sunburst/...`
   - `image_size`: [пресет или WxH]
   - `quality`: `low` / `medium` / `high` / `xhigh` / `max`
   - `background`: `auto` / `transparent` / `opaque`
   - `output_format`: `png` / `jpeg` / `webp`
   - `image_urls`: [массив ссылок при edit]
4. **Стоимость и рекомендации:**
   - Примерная стоимость запроса по тарифной сетке.
   - 1-2 критических замечания (например, качество для шрифта).
