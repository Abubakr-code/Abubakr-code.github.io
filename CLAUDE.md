# ARMORIX 3D — Loyiha Konteksti va Ko'rsatmalari

## 1. Loyiha Haqida Qisqacha (Overview)
Armorix — bu manba kodidagi zaifliklarni (CWE/OWASP), xotira xatolarini (Buffer Overflow, Use-After-Free) va noto'g'ri konfiguratsiyalarni internetga ulanmasdan (100% oflayn / air-gapped) tahlil qiluvchi avtonom kiberxavfsizlik statik kod tahlili (SAST) platformasining interaktiv 3D veb-sayti (landing page).

## 2. Texnologiyalar Steki (Tech Stack)
- **Freyemvork:** React 19 + Vite 6
- **3D Grafika:** Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) + maxsus CSS animatsiyalari (`src/index.css`)
- **Animatsiyalar:** GSAP 3 (`gsap`, `@gsap/react`, `ScrollTrigger`)
- **Ikonkalar:** Lucide React (`lucide-react`)
- **Ko'p tillilik (i18n):** `i18next`, `react-i18next`, `i18next-browser-languagedetector`
  - Qo'llab-quvvatlanuvchi tillar: O'zbekcha (`uz.json`), Ruscha (`ru.json`), Inglizcha (`en.json`)

## 3. Loyiha Arxitekturasi va Fayllar Tuzilishi
Dizayn yo'nalishi: "paper & signal" — och qog'oz fon (`paper #f4f4f1`), qora matn (`ink`), **bitta aksent** (`accent #2448ff`), kondensatsiyalangan raqamlar (Anton), sarlavhalar Bricolage Grotesque, matn Outfit, CTA Source Serif 4 italic. 3D faqat zarrachalar (points) orqali. Qizil/yashil (`threat`, `mint`) faqat laboratoriya ichida.

- `src/App.jsx` — Preloader, Navbar va raqamlangan bo'limlar.
- `src/sections/`:
  - `Hero.jsx` — chapda badge, so'z ticker, sarlavha, CTA; o'ngda zarrachali 3D qalqon (`ParticleShield`); pastda integratsiyalar tasmasi + 2 ta raqam.
  - `About.jsx` — 01 "Armorix nima?" + 4 ta raqamlangan karta.
  - `ForDevs.jsx` — 02 "Kim uchun": auditoriya faqat dasturchilar (web/full-stack, frilanser, open-source) — bank/davlat emas; pentest narxi bilan solishtirish, "localhost ≠ himoyalangan" bloki. Boshqa AI/raqobatchilar bilan solishtirish jadvali QO'YILMASIN.
  - `Numbers.jsx` — 03 pin qilingan bo'lim: ulkan raqamlar (0 B, 15,482, 1M+, 100%) + zarrachalar shakldan shaklga o'tadi (`NumbersScene`).
  - `Steps.jsx` — 04 gorizontal scroll qilinadigan 5 qadam.
  - `Why.jsx` — 05 sticky sarlavha + faollashuvchi raqamlangan ro'yxat.
  - `Experience.jsx` — 06 "Ichkarida": sticky katta raqam + terminal + imkoniyatlar.
  - `TechStack.jsx` — 07 oq plitkalarda 10 ta 3D logo (bitta WebGL kontekst, drei `View`, `frameloop="demand"`).
  - `TaintLab.jsx` — 08 qora bo'lim: interaktiv taint-oqim laboratoriyasi (3D AST graf).
  - `Contact.jsx` — 09 O'rnatish: CLI panel (7/12) va zarrachali noutbuk (`DevLaptop`, 5/12) xl'da bir xil balandlikda (640px); paket hajmi (MB) ko'rsatilmaydi.
  - `Footer.jsx` — qora; katta ARMORIX zarrachalardan (`footer/ParticleWordmark`, additive glow, sichqonchaga reaksiya).
- `src/components/` — `NavBar` (UZ | RU | EN ichida), `SectionLabel` ("01  BIR JUMLADA"), `Preloader`, `SoundToggle` (pastki-chap musiqa tugmasi).
- `src/audio/ambient.js` — Web Audio API bilan generatsiya qilinadigan fon musiqasi (fayl va tarmoqsiz); faqat foydalanuvchi bosganda yoqiladi, tanlov `localStorage.armorix_sound`da.
- `src/components/three/` — `SceneCanvas` (ekrandan tashqarida to'xtaydi, dpr ≤ 1.5), `materials.js` (PALETTE, `createDotMaterial` — och fonga mos yumaloq nuqtalar), `MorphScene` (GPU'da 6 tagacha shakl orasida morf; `stage` ref shaklni, `progress` ref scroll'dagi kamera burilishini boshqaradi), `shapes.js` (airgap, tree, neural, patch, coins, hourglass, laptop, packageCube, codePage, taint, report, waves, memory, infinity, seal).
- `src/hooks/useAutoStage.js` — bo'lim ko'rinib turganda 3D shaklni avtomatik almashtiradi, hover qilinganda to'xtatadi.
- **Har bir bo'limda 3D bor** (About, Kim uchun, Jarayon, Nega, Ichkarida — `MorphScene`; Hero qalqoni scroll'da aylanib pastga to'kiladi). Yassi shakllar qirrasi bilan ko'rinmasligi uchun scroll burilishi ±0.5 rad bilan cheklangan.
- **Tungi/kunduzgi rejim:** `src/theme.js` (OS sozlamasiga ergashadi, navbar'dagi quyosh/oy tugmasi tanlovni `localStorage.armorix_theme`ga saqlaydi; `index.html`dagi inline skript birinchi paintdan oldin `.dark` klassini qo'yadi). Ranglar `index.css`dagi `.dark { --color-* }` orqali almashadi — yangi rang qo'shsang, ikkala rejim uchun ham yoz. Doim qorong'i yuzalar (terminal, lab, footer) `bg-night`; `bg-ink` ustida matn `text-paper`. 3D nuqtalar `darkUniform` orqali avtomatik moslashadi (`createDotMaterial({ themed: false })` — qora fondagi sahnalar uchun).
- **Grain (donacha) teksturasi:** `App.jsx`dagi `.grain` — butun sahifa ustida statik SVG shovqin (animatsiyasiz, blend-mode'siz, FPS'ga ta'sir qilmaydi). Kuchi `index.css`da: kunduzi `opacity: 0.22`, tunda `0.16`.
- **Kursor:** `components/CustomCursor.jsx` — skaner ko'rinishi (ko'k nuqta + 4 ta burchak qavs). Link/tugma ustida kengayadi, `data-cursor="drag"` joyda aylanuvchi punktir halqa. Faqat sichqonchali qurilmalarda (`pointer: fine`), telefon va reduced-motion'da oddiy kursor. Uslublar `index.css`dagi `.cursor-*`.
- `html, body { overflow-x: clip }` — `hidden` QO'YMANG, u `position: sticky`ni buzadi (Preloader ham `body.style.overflow = ""` qiladi).
- `src/components/models/` — `hero_models/`, `numbers/`, `lab/`, `tech_logos/`, `contact/`.
- `src/constants/` — `index.js` (nav, bo'lim ma'lumotlari, tech, exp), `labSamples.js`.
- `public/images/integrations/` — simple-icons (CC0) monoxrom logolar.
- `src/locales/` — `uz.json`, `ru.json`, `en.json`.

### Tezlik qoidalari (qotmasligi uchun)
- `backdrop-filter` va `@react-three/postprocessing` ishlatmang.
- Yangi 3D sahnalar `SceneCanvas` orqali; iloji bo'lsa zarrachalar (`createDotMaterial`) bilan, og'ir material/soyasiz.
- Doimiy ishlaydigan global 3D fon qo'shmang.
- Brauzer ~16 ta WebGL kontekstga ruxsat beradi; ko'p kichik sahnalar uchun `View`.

## 4. Qat'iy Qoidalar va Konvensiyalar (CRITICAL GUIDELINES)

### A. Professional DevSecOps Leksikoni (Marketing shiorlariga cheklov):
- Saytda quruq, takroriy shiorlar ishlatilmasin: **"juda xavfsiz"**, **"xavfsiz tizim"**, **"favqulodda xavfsizlik"** kabi so'zlar qat'iyan man etiladi.
- Ularning o'rniga aniq texnik atamalar ishlatilsin:
  - *"AST-asosidagi statik kod tahlili"*, *"Air-gapped izolyatsiya"*, *"CWE-120 / CWE-416 aniqlash"*, *"Nol-tarmoq telemetriyasi"*, *"Lokal neyron dvigatel"*, *"Kriptografik audit hisoboti"*, *"Avtomatlashtirilgan kod yamoqlari (patch)"*.

### B. 3D Modellar va Matnlar Moslashuvi (Layout Balance):
- **Hero bo'limi:** Chap tomondagi matn bloki qat'iy ravishda `xl:max-w-[50%]` chegarasida bo'lishi shart. Matnlar (sarlavhalar, tavsiflar) HECH QACHON o'ng tarafdagi 3D xona/kompyuter modeli ustiga chiqib ketmasligi kerak.
- Sarlavha shrift o'lchamlari doimo responsive bo'lsin (`text-[26px] sm:text-[34px] md:text-[42px] xl:text-[48px] 2xl:text-[54px]`).
- Slider (`.slide`) va uning ichidagi har bir so'z elementi (`.wrapper span`) bir xil balandlikka (`overflow-hidden`) ega bo'lishi shart.
- Deploy (`#contact`) bo'limida menyu (navbar) sarlavhani to'sib qo'ymasligi uchun `scroll-mt-24 pt-28` saqlanishi kerak.

### C. Ko'p Tillilik Sinxronligi (i18n Parity):
- Har qanday yangi matn yoki o'zgarish bir vaqtning o'zida barcha 3 ta tilda kiritilishi shart:
  - `src/locales/uz.json` (O'zbek)
  - `src/locales/ru.json` (Rus)
  - `src/locales/en.json` (Ingliz)
- Har bir til uchun terminologiya sohaning rasmiy DevSecOps standartlariga to'g'ri kelishi shart.

### D. Kod Standartlari:
- Loyihani yig'ish (build): `npm run build` buyrug'i 0 ta xato va ogohlantirishsiz o'tishi kerak.
- Tailwind CSS v4 ishlatilmoqda — eski Tailwind v3 direktivalaridan foydalanmang.
- 3D sahnadagi `Canvas` resurslarini tejang va ortiqcha re-renderlarni cheklang.
