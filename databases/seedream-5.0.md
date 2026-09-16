# SEEDREAM 5.0 — PROMPT DATABASE

> Финальная база. Всё лаконично. Для ИИ и людей.

---

## MODEL INFO

- **Name:** Seedream 5.0 (Pro / Lite)
- **Developer:** ByteDance Seed Team
- **Type:** Latent Diffusion, Text-to-Image + Image Editing
- **Release:** July 8, 2026
- **Strengths:** design reasoning, multilingual text (14 lang), photoreal, grounded editing, layer separation, multi-ref compositing (up to 10)
- **Ratios:** 1:16 → 16:1 (presets: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 9:21, 21:9)
- **Resolution:** 1024–2048px (tiers: ≤1536px = cheap, >1536px = 2x cost)
- **Text rendering:** 14 languages incl. Chinese, Japanese, Korean, Arabic (RTL), Russian, French, German, Spanish

---

## PROMPT FORMULA

```
[ASSET TYPE] + [SUBJECT + ACTION] + [ENVIRONMENT] + [COMPOSITION] + [CAMERA + LIGHTING] + [MATERIALS] + [TEXT IN "QUOTES"] + [CONSTRAINTS]
```

### Block definitions:

1. **ASSET TYPE** — формат: `cinematic still`, `product photo`, `infographic`, `UI mockup`, `editorial portrait`, `documentary photograph`
2. **SUBJECT** — кто/что + возраст/цвет/одежда/поза/действие
3. **ENVIRONMENT** — физическое место (НЕ mood-слова). Конкретика: `rain-slicked cobblestone street in a northern European city at dusk`
4. **COMPOSITION** — ракурс + фрейминг: `centered`, `rule of thirds`, `low angle`, `top-down flat-lay`, `eye level`, `straight-on`
5. **CAMERA + LIGHTING** — линза (`35mm`, `85mm f/1.4`, `100mm macro f9`), DoF (`shallow`/`deep`), свет (`soft directional from upper left`, `hard rim light from behind`), grain, тени
6. **MATERIALS** — поверхности: `brushed brass`, `full-grain leather`, `honed black soapstone`, `hand-glazed zellige tile`
7. **TEXT** — точная копия в `"двойных кавычках"` + шрифт/стиль/позиция: `reads "MARONNE" in embossed gold serif`
8. **CONSTRAINTS** — 1-2 запрета: `No text in the frame`, `no floating objects`, `no visible logos`

---

## RULES

### DO
- Natural language (brief a photographer, not keyword list)
- Front-load important info (hierarchy = weight)
- Sweet spot: 30-100 words
- Text always in "double quotes"
- Describe spatial relations (`to the left of`, `behind`, `above`)
- Specific materials (`brushed aluminum` not `metal`)
- Iterate one block at a time on failure
- Assign roles to ref images (`Image 1 for identity, Image 2 for style`)
- Use physical camera parameters to get realism

### DON'T
- ❌ Keyword soup: `photorealistic, 8k, best quality, masterpiece, hyperrealistic`
- ❌ Vague: `a nice picture`, `beautiful scene`
- ❌ Negative prompts (model handles internally)
- ❌ Mood words in Environment block
- ❌ Manual step-count tweaking
- ❌ Full regeneration (use region editing instead)

### ANTI-AI-LOOK RULE
Replace generic quality tags with specific optics:
- ❌ `photorealistic portrait, 8k, best quality`
- ✅ `Shot on a 35mm lens at f2.0, shallow depth of field, fine cinematic grain, natural skin texture with subtle imperfections`

---

## PROMPT TEMPLATES

### Template: Cinematic Portrait
```
A cinematic [film still / portrait] of [SUBJECT DESCRIPTION] [ACTION/POSE] in/on [ENVIRONMENT]. [LIGHTING DESCRIPTION — warm/cool, direction, source]. In the [soft-focus/sharp] background, [BACKGROUND DETAILS]. Shot on a [FOCAL LENGTH]mm lens at f[APERTURE], [shallow/deep] depth of field, [grain type], [skin/texture note], [mood word]. No text in the frame.
```

### Template: Product Photography
```
A [premium/cinematic] [product/hero/advertising] shot of [PRODUCT DESCRIPTION] on/against [SURFACE/BACKDROP]. [PRODUCT DETAILS — texture, finish, position]. [KEY LIGHT — direction, quality] [FILL LIGHT — direction, quality]. [TEXT ON PRODUCT in "quotes" with style]. [Camera: FOCAL + APERTURE], [focus details], [color tone]. No other text in the frame.
```

### Template: Infographic / Data Viz
```
A high-resolution [educational/business] infographic in [orientation] on [background gradient/color], titled "[TITLE]" in [font style] across the [position]. [LAYOUT DESCRIPTION — zones, bands, columns]. [DATA ELEMENTS — each with exact labels in "quotes"]. [LEGEND/SCALE]. Consistent margins, [dividing rules], crisp legible type at every size, every label spelled exactly as written.
```

### Template: UI / Dashboard
```
A [desktop/mobile] [web dashboard/app screen] for [PRODUCT TYPE], [theme], rendered like a polished production interface. The layout includes [TOP BAR with "text"]. Below, [GRID/LAYOUT]: [ZONE 1 details]; [ZONE 2 details]; [ZONE 3 details]. [INTERACTIVE ELEMENTS]. Use [color palette] with [accent color] for interactive elements. Crisp, legible type at every size.
```

### Template: Multilingual Scene
```
[SCENE TYPE — photograph/illustration] of [ENVIRONMENT]. [SIGNS/TEXT ELEMENTS] each displaying text in a different language: [LANGUAGE 1] reading "[TEXT]", [LANGUAGE 2] reading "[TEXT]", [LANGUAGE 3] reading "[TEXT]". [ENVIRONMENTAL DETAILS — reflections, atmosphere]. Shot on [LENS], [DoF], [color grading], [grain]. No other text beyond the signs described.
```

### Template: Grounded Edit
```
[CHANGE INSTRUCTION — specific region/element]. Keep [LIST OF UNCHANGED ELEMENTS] exactly as they are.
```

### Template: Annotation-Frame Edit
```
[COLOR] box on [REGION]: [CHANGE DESCRIPTION].
[COLOR] box on [REGION]: [CHANGE DESCRIPTION].
...
Keep everything else exactly the same, including [LIST KEY PRESERVED ELEMENTS].
```

### Template: Multi-Reference Composite
```
Compose a single [OUTPUT TYPE] from the references, in a [PERSPECTIVE]. [IMAGE N] as [ROLE — background/subject/texture/logo]. [IMAGE N] placed [POSITION + ANGLE]. [IMAGE N] applied as [TREATMENT]. [UNIFIED LIGHTING — direction, shadows, grade]. [CAMERA — focal equiv, focus]. No text beyond [SPECIFIED TEXT].
```

---

## REFERENCE PROMPTS (эталонные примеры)

### GEN-01: Film Still — Woman on Rain Street
```
A cinematic film still of a middle-aged woman in a coarse tweed coat standing on a rain-slicked cobblestone street in a northern European city at dusk. She is turned slightly toward the camera, her face lit by the warm glow of a nearby shop window on the left, while cool blue evening light catches the wet wool of her shoulder on the right. In the soft-focus background, wet streets reflect amber streetlights and distant tram wires cut across the twilight sky. Shot on a 35mm lens at f2.0, shallow depth of field, fine cinematic grain, natural skin texture with subtle imperfections, a quiet introspective mood. No text in the frame.
```

### GEN-02: Sci-Fi — Geologist on Alien Planet
```
A frame from a hard science-fiction film, a lone geologist in a scuffed white pressure suit crouched on a cracked rust-red expanse, one gloved hand resting beside a seam of pale blue mineral that glows faintly from within. Behind her, a half-buried landing craft tilts at an angle, its hull scorched and streaked with dust. Two suns hang low on the horizon, a large amber one and a smaller white one, so every rock throws two overlapping shadows in slightly different directions. Thin atmospheric haze catches the light and softens the far distance. Shot wide on a 40mm lens, deep focus, a muted desaturated palette with the mineral's blue as the only cool note, fine cinematic grain, the emptiness pressing in around her. No text in the frame.
```

### GEN-03: Ad Hero — Chocolate Break
```
A premium advertising hero shot of a single square of dark chocolate snapping in half in mid-air, centered against a deep espresso-brown studio background. A fine burst of cocoa powder and a few cacao nibs scatter around the break, frozen sharp, a thin thread of molten chocolate stretched between the two halves. A hard rim light from behind rakes the powder and the glossy fracture, while a soft warm key from the lower left reveals the matte bloom across the chocolate's face. On the wrapper resting below, the brand reads "MARONNE" in an embossed gold serif, with a smaller line beneath it reading "72% single origin, Piura". Studio product photography, 100mm macro at f9, tack-sharp on the fracture and the gold type, deep controlled shadow, no other text in the frame.
```

### GEN-04: Infographic — Ocean Layers
```
A high-resolution educational infographic in portrait orientation on a deep navy-to-black vertical gradient, titled "THE FIVE LAYERS OF THE OCEAN" in clean white sans-serif across the top. The frame is divided into five stacked horizontal bands, the water darkening from top to bottom, each carrying its zone name above a depth range: "SUNLIGHT" with "0 to 200m", "TWILIGHT" with "200 to 1000m", "MIDNIGHT" with "1000 to 4000m", "ABYSS" with "4000 to 6000m", and "TRENCH" with "6000 to 11000m". Each band holds one accurately drawn creature beside a short label: a sailfish, a lanternfish, a giant squid, a tripod fish, and a snailfish. A slim vertical gauge down the right edge shows pressure rising with depth, marked at three points. A small legend in the lower left maps a light dot to "sunlight reaches here" and a dark dot to "no light". Consistent margins, thin dividing rules between bands, crisp legible type at every size, every label and number spelled exactly as written.
```

### GEN-05: Interior — Modern Kitchen
```
A photorealistic straight-on daytime photograph of a mid-sized modern kitchen, shot at eye level with soft natural light from a large window on the left. A run of flat-front sage-green lower cabinets with brushed brass handles lines the back wall, under a white subway-tile backsplash and a shelf of open oak. A kitchen island with a white marble waterfall countertop stands in the center of the frame, three black leather bar stools tucked under its near edge. Two clear-glass globe pendant lights hang above the island. A stainless range and hood stand against the back wall, a small potted herb rests on the windowsill, wide oak floorboards run underfoot. Clean architectural-photography look, sharp throughout, neutral white balance. No text in the frame.
```

### GEN-06: Extreme Sport — Mountain Biker
```
A documentary photograph of a downhill mountain biker launching off a steep rock drop in a Pacific Northwest forest, mud spraying from the rear tire in a frozen arc. The rider's full-face helmet and mud-caked jersey show hard use. Overcast daylight filters through towering Douglas firs, creating flat, diffused lighting that wraps evenly around the action without harsh shadows. Shot on a 70-200mm telephoto at the long end, f2.8, fast shutter freezing every droplet, shallow depth of field blurring the mossy trunk behind the rider. Muted green-and-earth tones, fine documentary grain, a sense of speed and weight. No text in the frame.
```

### GEN-07: Dashboard UI — FleetPulse
```
A desktop web dashboard for a logistics analytics tool, dark theme, rendered like a polished production interface. The layout includes a top bar reading "FleetPulse" on the left and user avatar on the right. Below, a 3-column grid: left column has a large map view with colored route lines and pin markers; center column shows two stacked cards, a line chart of delivery times over 30 days and a donut chart of fleet utilization with a "78%" label in the center; right column lists five active alerts in card format, each with a colored severity dot, a short title, and a timestamp. A floating "Export PDF" button in the bottom right corner. Use a dark neutral palette with a teal accent for interactive elements. Crisp, legible type at every size.
```

### GEN-08: E-Commerce — Leather Boots
```
A cinematic e-commerce hero shot of a single pair of tan leather boots on a weathered dark oak crate, centered in a moody studio with a charcoal textured backdrop. The boots stand upright and slightly angled toward each other, their full-grain leather catching a warm directional key light from the upper left that highlights every crease, stitch, and pull-tab. A subtle fill from the right softens the shadows without flattening them. The crate's rough grain and iron corner brackets add tactile contrast. Below the crate, a torn kraft-paper tag reads "HALSTED" in an inked stamp serif and "Handcrafted — Batch 27" in smaller type beneath. Shallow depth of field keeps the tag readable but the far backdrop soft. Warm amber-and-walnut tones, studio product photography on medium format, no other text in the frame.
```

### GEN-09: Multilingual — Neon Night Market
```
A cinematic night photograph looking down a narrow rain-soaked night-market alley in an East Asian city. Stacked neon and LED signs line both walls, each sign displaying text in a different language and script: a top sign in Simplified Chinese reading "老王炒面", a sign below it in Japanese katakana reading "ラーメン天国", a vertical Korean sign reading "서울포차", and a small English sandwich board at street level reading "Cold Beer Here". The wet pavement mirrors every colour: magenta, electric blue, warm amber, and green. A lone figure with an umbrella walks away from the camera in the middle distance. Shot on a 35mm lens at f1.8, shallow depth of field, the farthest signs blooming into soft bokeh. Humid atmosphere, visible drizzle streaks in the light spills, cinematic colour grading leaning toward teal-and-orange, fine grain. No other text in the frame beyond the signs described.
```

### EDIT-01: Simple Text Swap
```
Change only the small line under the logo to read "85% single origin, Chuao". Keep the "MARONNE" wordmark, the chocolate, the cocoa burst, the gold type style, and the lighting exactly as they are.
```

### EDIT-02: Annotation-Frame (5 Regions)
```
Red boxes on the lower cabinets: refinish them from sage green to deep matte navy, keep the brass handles and the same layout.
Blue box on the backsplash: replace the white subway tile with small hand-glazed zellige tile in warm terracotta, same area.
Yellow box on the two glass pendants: swap them for one long linear brass pendant centered over the island.
Green box on the bar stools: change the three black leather stools to pale oak stools with woven rush seats, same positions.
Purple box on the island countertop: change the white marble to honed black soapstone, keep the waterfall edge.
Keep everything else exactly the same, including the window light, the oak floor, the open shelving, and the range.
```

### EDIT-03: Multi-Ref Composite (6→1)
```
Compose a single premium e-commerce hero for a leather-goods brand from the references, in a top-down flat-lay. Lay the walnut surface from image 2 as the full background. Place the tan leather cardholder from image 1 slightly right of center, angled a few degrees. Deboss the "HALSTED" wordmark from image 3 into the front face of the cardholder as blind embossing that follows the grain, no ink. Fan the black cards and banknote from image 4 so they rise just out of the cardholder's pocket. Slide the charcoal felt from image 5 under the cardholder as a soft mat, its edge running diagonally out of the lower-left corner. Rest the brass key from image 6 in the open upper-right space, catching the light. Soft directional daylight from the upper left, one consistent shadow direction across every object, a warm neutral grade, enough depth of field that the cardholder and the debossed logo stay tack-sharp. Photorealistic top-down product photography, 50mm equivalent, no text beyond the debossed logo.
```

---

## API & Спецификация

### Endpoints
| Действие | Path |
|--------|------|
| Генерация с нуля | `bytedance/seedream/v5/pro/text-to-image` |
| Правка / Референсы | `bytedance/seedream/v5/pro/edit` |

### Тарифы
| Разрешение | Стоимость |
|------|-----------|
| ≤1536px | $0.0675 |
| >1536px | $0.135 |
| Доп. референс (со 2-го) | +$0.0045 |

---

## РАБОТА С МУЛЬТИ-РЕФЕРЕНСАМИ

При работе с несколькими референсами (`image_urls`) в endpoint `bytedance/seedream/v5/pro/edit`:
- Массив `image_urls` индексируется от 1: `image 1` (или `@Image1`), `image 2` (или `@Image2`).
- Для каждого референса в промте обязательно задавай явную роль и границы наследования:
  ```text
  Image 1 (or @Image1) defines <identity / structure>. Do not inherit <background / incidental details>.
  Image 2 (or @Image2) defines <surface material / texture / color>.
  ```
- Избегай расплывчатого слова «соответственно» (respectively). Каждое соотношение связывай явно.

---

## PRE-FLIGHT VALIDATION CHECKLIST

Перед отправкой промта модели или пользователю проверь:

1. **Соответствие задачи эндпоинту:**
   - Чистая генерация с нуля → `text-to-image`
   - Наличие референсов / правка / замена / композит → `edit`
2. **Токены и массивы референсов:**
   - Каждый упоминаемый референс (`image 1`, `image 2`) строго соответствует своему индексу в массиве `image_urls`.
   - Не превышен лимит: до 10 референсов для Seedream 5.0 Pro.
3. **Формула соблюдена:**
   - Назначение кадра (`ASSET TYPE`) задано в первой строке.
   - Физика света и материалов описана конкретно (без общих слов).
4. **Текст в кадре:**
   - Все надписи взяты в `"двойные кавычки"` с указанием шрифта, регистра и позиции.
5. **Изоляция правок (в режиме Edit):**
   - Явно названо, что меняется.
   - Явно перечислены все элементы, которые остаются фиксированными (`Keep X, Y, Z exactly as they are`).
6. **Ограничения (Constraints):**
   - Указаны 1–2 ключевых запрета (`No text in the frame`, `no floating objects`).
7. **Технические параметры:**
   - Соотношение сторон поддерживается (от 1:16 до 16:1).
   - Если важна экономия — размер ≤ 1536px ($0.0675 вместо $0.135).

---

## AGENT OUTPUT PROTOCOL

Когда ИИ генерирует промт по запросу пользователя, ответ формируется строго по стандарту:

1. **Reference Map** *(только если используются референсы)*:
   ```text
   Image 1: [Роль и что берем / что исключаем]
   Image 2: [Роль и что берем / что исключаем]
   ```
2. **Final Prompt:**
   Один чистый монолитный блок кода (markdown code-block на английском языке), готовый для вставки в генератор изображений.
3. **Рекомендуемые параметры запуска:**
   - Endpoint: `bytedance/seedream/v5/pro/...`
   - `image_size`: [рекомендуемый пресет или WxH]
   - `output_format`: `png` или `jpeg`
   - `image_urls`: [список входных ссылок при edit]
4. **Стоимость и рекомендации:**
   - Расчетная стоимость генерации.
   - 1-2 коротких примечания при наличии критических нюансов.
