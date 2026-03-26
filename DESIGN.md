# DESIGN.md - TARA DELIVERY Design System

This document defines the visual language, component library, and design principles for the TARA DELIVERY platform.

---

## Creative North Star: "The Urban Pulse"

This design system moves beyond the generic "delivery app" template. In the vibrant, bustling context of Yaoundé, **"The Urban Pulse"** represents a fusion of **Logistical Precision** and **Local Vitality**. 

We reject the "boxed-in" look of standard apps. Instead, we embrace an editorial layout characterized by **Tonal Layering**, **High-Contrast Typography**, and **Intentional Asymmetry**. The goal is to feel as reliable as a premium courier yet as energetic as the streets of Cameroon. We use deep forest greens to signal growth and trust, punctuated by high-voltage ambers that command immediate action.

---

## Design Principles

1. **Mobile-first** - Designed primarily for mobile users in Yaoundé; desktop is secondary
2. **Fast & clear** - Minimal UI with clear hierarchy; users are often on slow connections
3. **Locally relevant** - French language, XAF currency, Cameroonian phone formats, local neighborhoods
4. **Accessible** - High contrast ratios, clear touch targets (min 44px), readable text sizes
5. **Consistent** - Shared design tokens across web and mobile apps
6. **Premium Editorial** - Asymmetrical layouts, tonal depth, and intentional whitespace create a bespoke feel

---

## Color Palette & The "No-Line" Rule

Our palette is rooted in Material Design 3 logic but executed with a high-end, bespoke finish.

### Core Palette

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#00503a` | Deep, authoritative green. Brand identity and core structural elements. |
| **Primary Container** | `#006a4e` | Lighter green for tonal depth and hover states. |
| **Secondary** | `#7c5800` | Deep brown accent, inspired by local energy. |
| **Secondary Container (CTA)** | `#feb700` | High-voltage amber. Your primary conversion tool for "Commander" or "Payer." |
| **Tertiary Fixed Dim** | `#216e39` | For status badges (delivered, success). |
| **On Tertiary Fixed** | `#ffffff` | Text on tertiary surfaces. |
| **On Surface** | `#191c1b` | All "black" text—maintains tonal warmth instead of pure #000000. |
| **Outline Variant** | `#bec9c2` | Ghost borders (15% opacity only). |

### Surface Hierarchy

| Token | Hex | Usage |
|-------|-----|-------|
| **Background** | `#faf9f7` | Base page color. |
| **Surface** | `#f8faf7` | Primary card backgrounds and surfaces. |
| **Surface Container Low** | `#f2f4f2` | Sections and grouped elements. |
| **Surface Container Highest** | `#e1e3e1` | Elevated floating elements (modals, sticky bars). |

### The "No-Line" Mandate

**Strict Rule:** Prohibit the use of 1px solid borders for sectioning. Boundaries must be defined **solely through background color shifts**. Example: a delivery tracking card (`surface_container_highest`) should sit directly on the `background` without a stroke. This creates a modern, "seamless" interface that feels expensive and custom-built.

If accessibility requires a container definition on low-contrast screens, use `outline_variant` (#bec9c2) at **15% opacity only**. It should be felt, not seen.

### Signature Textures & Glassmorphism

**The Gradient Pulse:** For primary CTAs, use a subtle linear gradient from `primary` (#00503a) to `primary_container` (#006a4e) at a 135-degree angle. This adds "soul" to the button, making it feel tactile.

**Frosted Glass:** For floating navigation bars or "Sticky" status updates, use `surface` at 80% opacity with a `backdrop-blur` of 12px. This allows the vibrant map or list content to bleed through, softening the UI.

### Semantic & Status Colors

| Purpose | Color | Usage |
|---------|-------|-------|
| Success | `tertiary_fixed` (#216e39) | Delivered, payment success, online status |
| Warning | `secondary_container` (#feb700) | Pending, processing states |
| Error | `error` (#b3261e) | Cancelled, failed, validation errors |
| Info | `primary` (#00503a) | Confirmed, informational states |
| Neutral | `outline_variant` (#bec9c2) | Disabled, offline, secondary text |

---

## Typography: Editorial Authority

We pair **Manrope** (Display/Headline) with **Inter** (Body/Label) to balance character with extreme legibility.

### Font Families

| Role | Font | Variable | Usage |
|------|------|----------|-------|
| **Display & Headlines** | Manrope | `--font-manrope` | Large promotional headers, "Bienvenue" screens. Wider apertures feel modern and inviting. |
| **Body & Labels** | Inter | `--font-inter` | "Détails de la commande," addresses, all body text. High x-height ensures readability on mid-range mobile devices. |

Both fonts are loaded via `next/font/google` with `display: "swap"` for performance.

### Font Configuration (Tailwind)

```js
fontFamily: {
  sans: ["var(--font-inter)", "system-ui", "sans-serif"],
  display: ["var(--font-manrope)", "system-ui", "sans-serif"],
}
```

### Type Scale & Hierarchy

**Hierarchy Note:** Always maintain a **2:1 ratio** between Headline and Body size to ensure a clear "Editorial" scan-path.

| Element | Size | Weight | Font | Usage |
|---------|------|--------|------|-------|
| Hero heading | `text-5xl` / `text-6xl` | 700 | Manrope | Landing page hero |
| Page heading | `text-2xl` / `text-4xl` | 700 | Manrope | Section titles, "Commandes" |
| Card heading | `text-lg` | 700 | Manrope | Card titles |
| Subheading | `text-base` | 700 | Manrope | Section subtitles |
| Title Small | `text-sm` (14px) | 700 | Inter Bold | Button text ("COMMANDER") |
| Title Medium | `text-base` (16px) | 700 | Inter Bold | Prices, important metadata |
| Body | `text-sm` (14px) | 400 | Inter | Default body text |
| Small / Label | `text-xs` (12px) | 500 | Inter | Labels, badges, metadata |
| Mono | `font-mono` | 500 | System mono | Order numbers, codes |

### Heading Styles

All headings (`h1`-`h6`) automatically use Manrope with `font-weight: 700` and `line-height: 1.25` via the base layer CSS.

---

## Elevation & Depth: Tonal Layering

Traditional drop shadows are too "heavy" for a modern African tech aesthetic. We use **Ambient Elevation**.

### The Layering Principle

To lift an element, move up the surface scale:

- **Base:** `surface` (#f8faf7)
- **Section:** `surface_container_low` (#f2f4f2)
- **Card:** `surface_container_highest` (#e1e3e1)

### Ambient Shadows

If a card must float (e.g., a "Suivre mon livreur" modal), use a shadow tinted with `on_surface` at **5% opacity** with a **24px blur**. It should look like a soft glow, not a dark smudge.

### The Ghost Border

If accessibility requires a container definition on low-contrast screens, use `outline_variant` (#bec9c2) at **15% opacity**. It should be felt, not seen.

---

## Spacing & Layout

### Asymmetrical Spacing (Editorial Feel)

Use asymmetrical margins to create an editorial feel:
- More padding at the top of a screen than the bottom
- Variable gap spacing for visual interest
- If in doubt, increase spacing from `spacing-4` to `spacing-6`

### Container Widths

| Context | Max Width | Class |
|---------|----------|-------|
| Landing page | `max-w-7xl` (80rem) | Full marketing pages |
| Admin panel | `max-w-7xl` | Dashboard with sidebar |
| Customer/Rider views | `max-w-4xl` (56rem) | Mobile-optimized pages |
| Forms & modals | `max-w-2xl` (42rem) | Order creation, auth forms |
| Auth pages | `max-w-md` (28rem) | Login/register cards |

### Page Layout Classes

```css
.page-container {
  max-width: 80rem; /* max-w-7xl */
  margin: 0 auto;
  padding: 2rem 1rem; /* py-8 px-4 */
}
```

### Standard Spacing

Use Tailwind's spacing scale consistently:
- **Gap between cards/sections**: `space-y-6` or `gap-6`
- **Card internal padding**: `p-4` to `p-6`
- **Form field spacing**: `space-y-4`
- **Button groups**: `gap-3`
- **Inline icon gap**: `gap-2`

---

## Components & UI Patterns

### Buttons (Les Boutons)

#### Primary Button (`.btn-primary`)
```html
<button class="btn-primary">
  COMMANDER
</button>
```
- **Gradient:** Linear gradient from `primary` (#00503a) to `primary_container` (#006a4e) at 135-degree angle
- **Text:** Inter Bold, All-caps (\"COMMANDER\")
- **Roundedness:** `md` (0.75rem)
- **Shadow:** Minimal, tinted with `on_surface` at 5% opacity, 24px blur
- **Disabled:** 50% opacity
- **Interaction:** Subtle scale on active for tactile feedback

#### Secondary Button (`.btn-secondary`)
```html
<button class="btn-secondary">Ajouter au panier</button>
```
- **Background:** `secondary_container` (#feb700)
- **Text:** `on_secondary_container` (#6b4b00), Bold
- **High-priority actions:** Ajouter, Continuer, important CTAs
- **No border needed** (follows No-Line rule)

#### Ghost Button (`.btn-ghost`)
```html
<button class="btn-ghost">Connexion</button>
```
- No background or border
- Text color: `primary`
- Used in navigation and secondary navigation

#### Danger Button (`.btn-danger`)
```html
<button class="btn-danger">Supprimer</button>
```
- **Background:** `error` (#b3261e)
- **Text:** White
- Used for destructive actions only

### Order Cards (Cartes de Commande)

```html
<div class="order-card">
  <div class="restaurant-header">
    <h3>Restaurant Name</h3>
  </div>
  <div class="order-items">
    <!-- items here -->
  </div>
  <div class="order-footer">
    <span class="badge badge-in-transit">En route</span>
    <span class="price">2.500 XAF</span>
  </div>
</div>
```

- **No borders.** Background: `surface_container_low` (#f2f4f2)
- **Internal padding:** `spacing-4` (1rem)
- **Item separation:** `spacing-2` (0.5rem) gap between restaurant name and status badge
- **No dividers.** Use background shifts or whitespace
- **Currency:** Always \"0.000 XAF\" using `title-md` (Inter Bold) for prominence
- **Minimum roundedness:** `DEFAULT` (0.5rem) for \"Friendly Professionalism\"

### Status Badges (Badges d'État)

```html
<span class="badge badge-en-cours">En cours</span>
<span class="badge badge-livré">Livré</span>
```

- **En cours:** `primary_container` background with `on_primary_container` text
- **Livré:** `tertiary_fixed_dim` background with `on_tertiary_fixed` text
- **Shape:** Pill-shaped (Rounded: `full`)
- **Padding:** `px-3 py-1` for compact badges

### Address Inputs (Saisie d'Adresse)

```html
<input 
  class="address-input" 
  placeholder=\"Quartier, Rue, ou Point de repère\" 
/>
```

- **No box border.** Background: `surface_container_highest` (#e1e3e1)
- **Focus state:** `sm` (0.25rem) **bottom-only accent** in `primary` (#00503a)
- **Placeholder:** \"Quartier, Rue, ou Point de repère\" (French)
- **Padding:** `px-4 py-3`
- **Roundedness:** `md` (0.75rem)
- **Cursor:** Text input, clear visual affordance

### Payment Method Selectors (Moyens de Paiement)

```html
<div class="payment-method">
  <input type="radio" id="mtn" name="payment" value="mtn" />
  <label for="mtn">MTN MoMo</label>
</div>
```

- **Touch target:** Min-height 56px
- **Default:** `surface_container` background
- **Selected state:** 
  - Background shifts to `primary_fixed` (#9ef4d0)
  - Subtle `primary` ghost border (15% opacity)
  - Immediate trustworthy visual feedback
- **Methods:** Orange Money, MTN MoMo, Cash on Delivery

### Loading Spinner

```html
<div class="spinner"></div>
```

- 20x20px `primary` (#00503a) ring animation
- Scale with `scale-150` for larger contexts
- Uses `primary` color instead of orange

---

## Animations

### Keyframes

```js
animation: {
  "slide-up": "slide-up 0.3s ease-out",    // Page transitions
  "fade-in": "fade-in 0.2s ease-out",       // Subtle reveals
  "pulse-slow": "pulse 3s ease infinite",    // Status indicators
}
```

### Usage

- **`animate-slide-up`**: Applied to page step transitions (e.g., multi-step order form)
- **`animate-pulse`**: Live status dots (e.g., "En route" indicator)
- **`transition-all duration-150`**: Default for interactive elements

---

## Icons

Using [Lucide React](https://lucide.dev/) consistently across the project.

### Common Icon Usage

| Icon | Component | Context |
|------|-----------|---------|
| `Package` | `<Package />` | Orders, deliveries, brand logo |
| `MapPin` | `<MapPin />` | Delivery addresses, locations |
| `CreditCard` | `<CreditCard />` | Payments |
| `Zap` | `<Zap />` | Express delivery, speed |
| `Shield` | `<Shield />` | Security features |
| `Clock` | `<Clock />` | Time estimates, pending |
| `CheckCircle` | `<CheckCircle />` | Success, completion |
| `Bell` | `<Bell />` | Notifications |
| `LogOut` | `<LogOut />` | Sign out |
| `Navigation` | `<Navigation />` | Rider navigation, GPS |
| `ArrowRight` | `<ArrowRight />` | CTA buttons, navigation |
| `Loader2` | `<Loader2 />` | Loading states (with `animate-spin`) |
| `Eye` / `EyeOff` | | Password visibility toggle |
| `Plus` / `Trash2` | | Add/remove items |

### Icon Sizes

- **Inline with text**: `w-4 h-4`
- **Card header icons**: `w-5 h-5`
- **Feature cards**: `w-6 h-6`
- **Empty states**: `w-12 h-12`

---

## Do's and Don'ts

### Do

- **Do** use asymmetrical margins (e.g., more padding at the top of a screen than the bottom) to create an editorial feel
- **Do** use `XAF` consistently. Place the currency **after** the amount (e.g., 2.500 XAF)
- **Do** prioritize \"Breathing Room.\" If in doubt, increase spacing from `spacing-4` to `spacing-6`
- **Do** leverage the tonal layering system for elevation (shift surface colors rather than adding shadows)
- **Do** use the 135-degree gradient on primary buttons for the signature \"Pulse\" feeling
- **Do** apply frosted glass (80% opacity + backdrop-blur 12px) for floating navigation and sticky status bars

### Don't

- **Don't** use pure black (#000000). Use `on_surface` (#191c1b) for all \"black\" text to maintain tonal warmth
- **Don't** use divider lines (1px borders) to separate list items. Use background color shifts or simply 16px of vertical whitespace
- **Don't** use harsh 90-degree corners. The minimum roundedness is `DEFAULT` (0.5rem) to maintain \"Friendly Professionalism\"
- **Don't** add visible borders in dark or saturated colors. Use ghost borders (15% opacity) only when accessibility requires definition
- **Don't** exceed 5% opacity for ambient shadows. Soft glows, not dark smudges
- **Don't** use the amber secondary color (#feb700) for anything other than high-priority CTAs (Commander, Payer)

---

## Page Layouts

### Landing Page

```
┌─────────────────────────────────────┐
│ Header (sticky, glass-blur)         │
├─────────────────────────────────────┤
│ Hero (gradient pulse, asymmetrical) │
├─────────────────────────────────────┤
│ Features (editorial grid)           │
├─────────────────────────────────────┤
│ How it Works (3-step)               │
├─────────────────────────────────────┤
│ CTA (primary gradient button)       │
├─────────────────────────────────────┤
│ Footer (deep green bg)              │
└─────────────────────────────────────┘
```

### Customer Dashboard

```
┌─────────────────────────────────────┐
│ Header (sticky, primary brand)      │
├─────────────────────────────────────┤
│ Welcome banner (tonal gradient)     │
│ [+ Nouvelle livraison]              │
├─────────────────────────────────────┤
│ Quick stats (3-col grid)            │
├─────────────────────────────────────┤
│ Active orders (no-border cards)     │
├─────────────────────────────────────┤
│ Order history (clean list)          │
└─────────────────────────────────────┘
```

### Admin Dashboard

```
┌──────────┬──────────────────────────┐
│ Sidebar  │ Header (page title)      │
│ (dark)   ├──────────────────────────┤
│          │ Stat cards (3x2 grid)    │
│ Nav      ├──────────────────────────┤
│ items    │ Charts (tonal accents)   │
│          ├──────────────────────────┤
│ User     │ Recent orders table      │
│ info     │                          │
└──────────┴──────────────────────────┘
```

### Rider Dashboard

```
┌─────────────────────────────────────┐
│ Header (primary bg, status toggle)  │
├─────────────────────────────────────┤
│ Stats (3-col: deliveries/rating/$)  │
├─────────────────────────────────────┤
│ Active deliveries (action cards)    │
├─────────────────────────────────────┤
│ Available orders (surface layer)    │
└─────────────────────────────────────┘
```

---

## Scrollbar

Custom scrollbar for WebKit browsers (using primary green):

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #bec9c2; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #00503a; }
```

---

## Responsive Breakpoints

Using Tailwind's default breakpoints:

| Breakpoint | Min Width | Usage |
|-----------|----------|-------|
| `sm` | 640px | Stack to side-by-side buttons |
| `md` | 768px | Show desktop nav, 2-col grids |
| `lg` | 1024px | 3-col grids, admin sidebar |
| `xl` | 1280px | Max content widths |

### Mobile-first Approach

- Default styles target mobile
- Use `md:` and `lg:` prefixes for larger screens
- Navigation items hidden on mobile (`hidden md:flex`)
- Admin sidebar is always visible (desktop-only admin panel)

---

## Email Templates

HTML email templates follow the same brand guidelines:

- **Header**: Primary gradient (#00503a to #006a4e)
- **Body**: White background, 600px max width
- **CTA buttons**: `secondary_container` (#feb700) with dark text, rounded `md` (0.75rem)
- **Info boxes**: Light green background (#f4faf8) with left primary border
- **Footer**: Light gray background, small text
- **Font**: Inter / Arial fallback (web-safe for email)

---

## Design Tokens Summary (for Mobile)

When implementing the mobile app (Expo React Native), use these tokens:

```typescript
export const colors = {
  primary: '#00503a',
  primary_container: '#006a4e',
  secondary: '#7c5800',
  secondary_container: '#feb700',
  on_secondary_container: '#6b4b00',
  tertiary_fixed: '#216e39',
  on_tertiary_fixed: '#ffffff',
  on_surface: '#191c1b',
  background: '#faf9f7',
  surface: '#f8faf7',
  surface_container_low: '#f2f4f2',
  surface_container_highest: '#e1e3e1',
  outline_variant: '#bec9c2',
  error: '#b3261e',
};

export const typography = {
  display: 'Manrope',
  body: 'Inter',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};
```
