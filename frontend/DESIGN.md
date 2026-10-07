# NetGuard Frontend Design System Specification

> Reference: `frontend/reference/design-reference.png`  
> Mode: Bright, airy, premium SaaS landing page inside a 16:9 desktop browser container.

---

## 1. Color Tokens

### 1.1 Palette & System Tokens

| Token Name | Hex / Value | Role / Usage | Constraints & Rules |
| :--- | :--- | :--- | :--- |
| `--bg-pearl-white` | `#F6F5F1` | Primary background (center & left) | Smooth organic ombré base |
| `--bg-peach` | `#FAE7D5` | Bottom-left background wash | Blended organic shape; no hard lines |
| `--bg-aqua-1` | `#E7F7F2` | Aqua gradient step 1 | Fades into pearl-white center |
| `--bg-aqua-2` | `#D3E8E2` | Aqua gradient step 2 | Mid-tone aqua blend |
| `--bg-aqua-3` | `#C9EEE4` | Aqua gradient step 3 | Outer aqua wash |
| `--bg-aqua-4` | `#A9D2C7` | Aqua gradient step 4 | Far right edge accent |
| `--panel-white` | `#FFFFFF` | Card & Header background | Pure white with soft shadow |
| `--text-primary` | `#2A2B2E` | Warm Charcoal (Headings, primary text, solid buttons) | Primary high-contrast text |
| `--text-muted` | `#6B6D70` | Warm Gray (Subtitles, body copy, descriptions) | Secondary readable text |
| `--border-subtle` | `#EDEEEA` | Card & Header outer border | 1px clean crisp line |
| `--border-badge` | `#DADBD6` | Shield tile & outline border | 1px border on badge tile |
| `--border-charcoal` | `#2A2B2E` | Secondary button outline, active nav underline | 1px crisp charcoal outline |
| `--shadow-header` | `0 8px 30px rgba(42, 43, 46, 0.04)` | Header elevation | Floating soft shadow |
| `--shadow-card` | `0 12px 32px rgba(42, 43, 46, 0.05)` | Component card elevation | Floating soft shadow |

### 1.2 Status & Traffic Class Tokens

| Class / Semantic Role | Hex Code | Visual Application | Strict Restrictions |
| :--- | :--- | :--- | :--- |
| **Normal** (Good / Neutral) | `#7C7F86` | Slate Gray distribution bar; Normal packets | Neutral slate tone |
| **DoS** (Bad / Critical) | `#E03434` | Bright Red distribution bar; DoS attack packets | **Strictly used in ONLY 2 places:** DoS bar & DoS packets. Keep off aqua background. |
| **Probe** (Warning) | `#E9A02A` | Amber distribution bar, Card 2 accent, Probe packets | Warning/Scanner indicators |
| **R2L** (Exploit / Accent) | `#8B45E8` | Purple distribution bar, Card 3 accent, R2L packets | Privilege & remote exploit flows |
| **U2R** (Privilege Escalation) | `#F2761C` | Orange distribution bar, U2R attack packets | Root elevation indicators |
| **Packet Neutral** | `#C9CCC5` | Light gray packets along topology links | Normal baseline packets |

### 1.3 Card Bottom Gradient Tints

- **Card 1 (Capture Traffic):** Bottom fade from `#FFFFFF` to `#F6F5F1` (pearl-white/warm gray).
- **Card 2 (Detect Anomalies):** Bottom fade from `#FFFFFF` to `#FAE7D5` (soft peach).
- **Card 3 (Get Instant Alerts):** Bottom fade from `#FFFFFF` to `#F3EEFC` (soft lilac).
- **Card 4 (Attack Class Distribution):** Solid `#FFFFFF` background.

### 1.4 Dark Mode Evaluation
- **Visual Evidence:** The reference image demonstrates **strictly a Light Mode** interface ("Bright, airy, premium SaaS style with rounded corners, thin light borders and soft shadows. No blue, no black, no dark backgrounds.").
- **Dark Mode Status:** There is **no dark mode depicted** in the reference image. If dark mode is required in future releases, it must be designed as an inverted token set while maintaining brand warmth. For this implementation, Light Mode is the authoritative design.

---

## 2. Typography

### 2.1 Font Families
- **Headings & Display:** Clean Geometric Sans-Serif (e.g. `Plus Jakarta Sans`, `Inter`, or `Outfit`, fallback `sans-serif`).
- **Body & Labels:** Readable Humanist Sans-Serif (e.g. `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`).
- **Technical / Browser Address:** Monospace / Compact Sans (e.g. `'SF Mono'`, `'JetBrains Mono'`, `monospace`).

### 2.2 Type Hierarchy Scale

| Element | Font Size | Weight | Line Height | Letter Spacing | Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Browser URL** | `13px` / `0.8125rem` | `400` (Regular) | `1.0` | `0` | `#6B6D70` |
| **Brand Wordmark** | `18px` / `1.125rem` | `700` (Bold) | `1.2` | `-0.01em` | `#2A2B2E` |
| **Nav Links** | `14px` / `0.875rem` | `500` (Medium) | `1.4` | `0` | `#2A2B2E` |
| **Hero Headline** | `46px` – `48px` / `3rem` | `700` – `800` (Bold) | `1.15` | `-0.025em` | `#2A2B2E` |
| **Hero Subtitle** | `17px` – `18px` / `1.125rem` | `400` (Regular) | `1.55` | `0` | `#6B6D70` |
| **CTA Buttons** | `14px` – `15px` / `0.9375rem` | `600` (Semi-Bold) | `1.2` | `0` | White / Charcoal |
| **Card Step Numbers** | `32px` – `36px` / `2.25rem` | `700` (Bold) | `1.0` | `-0.02em` | `#C9CCC5` / `#E9A02A` / `#8B45E8` |
| **Card Title** | `18px` / `1.125rem` | `600` (Semi-Bold) | `1.3` | `-0.01em` | `#2A2B2E` |
| **Card Body Copy** | `13px` – `14px` / `0.875rem` | `400` (Regular) | `1.5` | `0` | `#6B6D70` |
| **Distribution Title**| `16px` / `1rem` | `600` (Semi-Bold) | `1.3` | `-0.01em` | `#2A2B2E` |
| **Chart Bar Labels** | `13px` / `0.8125rem` | `500` (Medium) | `1.2` | `0` | `#2A2B2E` |

---

## 3. Layout Architecture

### 3.1 Dimensions & Grid
- **Viewport Frame:** 16:9 aspect ratio desktop canvas, simulated inside a desktop browser window.
- **Maximum Content Width:** `1320px` to `1400px` centered container.
- **Container Padding:** `24px` to `40px` horizontal padding.
- **Hero Grid:** 2-column layout:
  - **Left (Text & CTAs):** `50%` - `52%` width.
  - **Right (Isometric Topology):** `48%` - `50%` width.
- **Cards Row Grid:** 4 equal-width columns (`repeat(4, 1fr)`), `gap: 20px` to `24px`.

### 3.2 Spacing Scale
- `2xs`: `4px`
- `xs`: `8px`
- `sm`: `12px`
- `md`: `16px`
- `lg`: `20px`
- `xl`: `24px`
- `2xl`: `32px`
- `3xl`: `48px`
- `4xl`: `64px`

### 3.3 Border Radius System
- **Browser Window Outer:** `16px`
- **Header Floating Bar:** `20px` – `24px` (pill-like capsule)
- **Buttons (CTAs & Nav Pills):** `9999px` (fully rounded pill)
- **Component Cards:** `20px`
- **Step Circle / Badges:** `9999px` (perfect circle)
- **Chart Progress Bars:** `9999px` (fully rounded capsule ends)
- **Isometric Node Tiles:** `12px` – `14px` rounded isometric planes

### 3.4 Page Structure (Top to Bottom)

1. **Browser Frame Header:**
   - Window controls on left (3 macOS-style dots: red, amber, green).
   - Centered light pill URL bar: `localhost:3000` with subtle reload icon.
2. **Floating Top Navigation Bar:**
   - Elevated pure white capsule bar floating over the ombré background.
   - Left: Shield-and-padlock badge tile + bold wordmark **NetGuard**.
   - Center: Nav links (`Home` with active charcoal underline, `Detection`, `Analytics`, `About`).
   - Right: Pill group (`Live` pill with charcoal outline, `Logs`, `Settings`).
3. **Hero Section:**
   - **Left Column:**
     - Main headline: *"Find out which attacks your model misses"*
     - Subtitle: *"Detect, analyse and stop network intrusions with intelligent monitoring and real-time insights."*
     - Button row: Solid charcoal *"Start Monitoring"* button + Outlined white *"See How It Works"* button.
   - **Right Column:**
     - Clean isometric 2.5D networking topology canvas.
     - Top cloud, router, 2 switches, wireless access point, 3 rack servers, database cylinder, laptops/phones.
     - Light gray interconnection lines carrying glowing animated packet pills (Red, Amber, Purple, Orange, Light Gray).
     - Strictly no shield, lock, or security glyphs within the diagram.
4. **Cards Row (4 Columns):**
   - **Card 1 (Capture Traffic):** Pearl-gray circle "1", charcoal network-node icon, title, description, charcoal arrow, pearl fade.
   - **Card 2 (Detect Anomalies):** Amber circle "2", amber magnifier icon, title, description, amber arrow, peach fade.
   - **Card 3 (Get Instant Alerts):** Lilac circle "3", purple bell/alert icon, title, description, purple arrow, lilac fade.
   - **Card 4 (Attack Class Distribution):** Charcoal bar-chart icon, title, 5 proportional horizontal pill bars with labels (Normal, DoS, Probe, R2L, U2R). **No numbers or percentages.**

---

## 4. Component List & Visual Rules

### 4.1 Header Bar
- **Surface:** `#FFFFFF` with `border: 1px solid #EDEEEA` and `box-shadow: 0 8px 30px rgba(42, 43, 46, 0.04)`.
- **Dimensions:** Height ~`64px`, `border-radius: 20px`, internal padding `12px 24px`.
- **Layout:** Flex row with `justify-content: space-between` and `align-items: center`.
- **Brand Group:**
  - White tile (~`36px × 36px`, rounded `10px`, soft shadow).
  - Inside: Shield-and-padlock badge with subtle gradient (`#FFFFFF` to `#EDEEEA`), outline `#DADBD6`, warm charcoal icon `#2A2B2E`.
  - Wordmark: "NetGuard" in 700 bold `#2A2B2E`.
- **Nav Links:**
  - Font size `14px`, font weight `500`.
  - Active item ("Home") features a `2px` solid `#2A2B2E` bottom indicator bar centered beneath text.
  - Inactive links: warm charcoal `#2A2B2E` or muted `#6B6D70`, transitioning on hover.
- **Right Pill Group:**
  - "Live": White pill with `1px solid #2A2B2E`, text `#2A2B2E`, padding `6px 16px`, rounded `9999px`.
  - "Logs", "Settings": Subtle pills or action links in warm gray/charcoal.

### 4.2 Buttons
- **Primary CTA ("Start Monitoring"):**
  - Background: `#2A2B2E` (Warm Charcoal).
  - Text: `#FFFFFF` (White), font weight `600`, size `15px`.
  - Shape: Rounded pill (`border-radius: 9999px`).
  - Padding: `12px 26px`.
  - Border: None.
  - Shadow: `0 4px 14px rgba(42, 43, 46, 0.15)`.
- **Secondary CTA ("See How It Works"):**
  - Background: `#FFFFFF` (Pure White).
  - Text: `#2A2B2E` (Warm Charcoal), font weight `600`, size `15px`.
  - Shape: Rounded pill (`border-radius: 9999px`).
  - Padding: `12px 26px`.
  - Border: `1px solid #2A2B2E`.
  - Shadow: None or subtle `0 2px 8px rgba(42, 43, 46, 0.04)`.

### 4.3 Isometric Topology Diagram
- **Style:** Clean 2.5D isometric vector perspective (~30° projection angle).
- **Devices:**
  - Cloud (top upstream flow)
  - Core Router
  - 2 Distribution Switches
  - Wireless Access Point
  - 3 Rack Server units
  - Database Cylinder
  - Client Edge Workstations (laptops, phones)
- **Device Node Appearance:** White rounded isometric 2.5D tiles with soft drop shadow, crisp subtle `#E5E7EB` edge highlights, and warm gray glyphs.
- **Connector Lines:** Thin (`1.5px` – `2px`), slightly curved light-gray paths (`#C9CCC5` / `#D1D5DB`).
- **Animated Traffic Packets:**
  - Rounded elongated capsule packets (`18px × 8px` isometric oriented).
  - Colors:
    - Normal: Slate Gray `#7C7F86` / Light Gray `#C9CCC5`
    - DoS: Bright Red `#E03434` (with subtle red glow)
    - Probe: Amber `#E9A02A`
    - R2L: Purple `#8B45E8`
    - U2R: Orange `#F2761C`
  - Strict Rule: **No shield, lock, or security badges anywhere in the diagram.**

### 4.4 Feature Cards (Cards 1 – 3)
- **Container:** Pure white `#FFFFFF`, `border-radius: 20px`, `border: 1px solid #EDEEEA`, `padding: 24px 22px`.
- **Shadow:** `0 10px 25px rgba(42, 43, 46, 0.04)`.
- **Header Element:** Numbered indicator ("1", "2", "3") styled in distinct tinted circles:
  - Card 1: Pearl-gray circle (`#E5E7EB`), charcoal network node icon.
  - Card 2: Amber-tinted circle (`#FEF3C7`), amber magnifier icon (`#E9A02A`).
  - Card 3: Lilac-tinted circle (`#F3EEFC`), purple alert icon (`#8B45E8`).
- **Title:** `18px`, `font-weight: 600`, color `#2A2B2E`, margin-top `16px`.
- **Description:** `13.5px`, `font-weight: 400`, color `#6B6D70`, line-height `1.5`.
- **Bottom Action / Arrow:** Right-facing navigation arrow matching card accent color.
- **Gradient Bottom Wash:** Subtle interior linear-gradient fade toward bottom of card (Pearl-gray on 1, Peach on 2, Lilac on 3).

### 4.5 Attack Class Distribution Card (Card 4)
- **Container:** Pure white `#FFFFFF`, `border-radius: 20px`, `border: 1px solid #EDEEEA`, `padding: 24px 22px`.
- **Header:** Small charcoal bar-chart icon (`#2A2B2E`) + Title "Attack Class Distribution" (`16px`, `font-weight: 600`).
- **Bar Rows (5 items):**
  - Layout: Horizontal flex/grid row with label on left (`width: 60px`, `13px` font weight `500`, `#2A2B2E`) and colored bar on right.
  - Row Spacing: `10px` vertical gap.
  - Bar Geometry: Height `8px` – `10px`, fully rounded capsule ends (`border-radius: 9999px`).
  - Bar Lengths (Proportional representation):
    1. **Normal:** `#7C7F86` (Slate Gray) — Medium-long bar (~`65%` track width)
    2. **DoS:** `#E03434` (Bright Red) — Longest bar (~`85%` track width)
    3. **Probe:** `#E9A02A` (Amber) — Medium bar (~`35%` track width)
    4. **R2L:** `#8B45E8` (Purple) — Short bar (~`22%` track width)
    5. **U2R:** `#F2761C` (Orange) — Shortest bar (~`15%` track width)
  - **Strict Rule: NO numbers, percentages, or value tooltips rendered on the bars.**

### 4.6 Tables (Future / Internal View Specification)
- While the landing page mockup contains no table, any supplementary detection/log tables within NetGuard must adhere to:
  - Header: Warm pearl background `#F6F5F1`, font weight `600`, color `#2A2B2E`, uppercase `11px` tracking.
  - Rows: Pure white `#FFFFFF` with `1px solid #EDEEEA` dividers.
  - Cell padding: `12px 16px`.
  - Attack labels inside table must reuse the exact class tokens (`#7C7F86`, `#E03434`, `#E9A02A`, `#8B45E8`, `#F2761C`).

---

## 5. Elements Not Determinable from Image (Explicit Gaps)

In strict accordance with design fidelity principles, the following aspects cannot be definitively determined from the visual mockup alone:

1. **Exact Proprietary Font Family:**
   - The reference uses a clean geometric grotesque sans-serif for headings and humanist sans for body text. Whether it is Inter, Plus Jakarta Sans, Outfit, General Sans, or SF Pro cannot be determined with 100% certainty from raster pixels.
2. **Dark Mode Specifications:**
   - The design is strictly and exclusively rendered in Light Mode. No dark theme color pairings, inverted shadows, or dark background values exist in the visual reference.
3. **Micro-Interaction & Hover States:**
   - Hover transformations for buttons (scale, brightness change), card hover elevations, and nav link hover styles are not shown.
4. **Interactive Topology Animation Dynamics:**
   - Exact animation duration, velocity, easing curves, and packet spawning frequency across the isometric nodes are not determinable from a static PNG.
5. **Responsive Breakpoints (<1024px):**
   - The mockup exclusively presents a desktop 16:9 viewport (~1440px+). Tablet stacking order, mobile menu layout (e.g. drawer vs accordion), and diagram responsiveness are not depicted.
6. **Underlying Data Scale for the Distribution Chart:**
   - The bar lengths show relative visual proportions, but no underlying sample size, dataset partition (NSL-KDD train vs test), or exact percentages are provided.
7. **Secondary Navigation Page Layouts:**
   - The layout, routes, and content for the "Detection", "Analytics", "About", "Logs", and "Settings" views are not shown.
