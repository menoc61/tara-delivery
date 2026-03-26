# DESIGN.md - TARA DELIVERY Design System

This document defines the visual language, component library, and design principles for the TARA DELIVERY platform.

---

## Design Principles

1. **Mobile-first** - Designed primarily for mobile users in Yaoundé; desktop is secondary
2. **Fast & clear** - Minimal UI with clear hierarchy; users are often on slow connections
3. **Locally relevant** - French language, XAF currency, Cameroonian phone formats, local neighborhoods
4. **Accessible** - High contrast ratios, clear touch targets (min 44px), readable text sizes
5. **Consistent** - Shared design tokens across web and mobile apps

---

## Color Palette

### Brand Colors

The primary brand color is a warm orange that conveys energy, speed, and reliability.

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-50` | `#FFF7ED` | Lightest tint, subtle backgrounds |
| `brand-100` | `#FFEDD5` | Light backgrounds, hover states |
| `brand-200` | `#FED7AA` | Borders, dividers |
| `brand-300` | `#FDBA74` | Disabled states |
| `brand-400` | `#FB923C` | Secondary accents |
| `brand-500` | **`#FF6B2C`** | **Primary brand color** - buttons, links, icons |
| `brand-600` | `#EA580C` | Hover state for primary |
| `brand-700` | `#C2410C` | Active/pressed state |
| `brand-800` | `#9A3412` | Dark accents |
| `brand-900` | `#7C2D12` | Darkest, text on light backgrounds |

### CSS Custom Properties

```css
:root {
  --brand-primary: #FF6B2C;
  --brand-secondary: #FF8C00;
  --brand-dark: #C2410C;
  --surface: #FFFFFF;
  --surface-secondary: #F9FAFB;
  --border: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
}
```

### Surface Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#FFFFFF` | Card backgrounds, primary surfaces |
| `surface-secondary` | `#F9FAFB` | Page backgrounds |
| `surface-tertiary` | `#F3F4F6` | Nested backgrounds, well areas |

### Semantic Colors

| Purpose | Color | Usage |
|---------|-------|-------|
| Success | `emerald-500` (`#10B981`) | Delivered, payment success, online status |
| Warning | `amber-500` (`#F59E0B`) | Pending, processing states |
| Error | `red-500` (`#EF4444`) | Cancelled, failed, validation errors |
| Info | `blue-500` (`#3B82F6`) | Confirmed, informational states |
| Neutral | `gray-500` (`#6B7280`) | Disabled, offline, secondary text |

### Order Status Colors

Each order status has a distinct color for quick visual identification:

| Status | Background | Text | Tailwind Class |
|--------|-----------|------|----------------|
| PENDING | `amber-100` | `amber-800` | `badge-pending` |
| CONFIRMED | `blue-100` | `blue-800` | `badge-confirmed` |
| ASSIGNED | `purple-100` | `purple-800` | `badge-assigned` |
| IN_TRANSIT | `orange-100` | `orange-800` | `badge-in-transit` |
| DELIVERED | `emerald-100` | `emerald-800` | `badge-delivered` |
| CANCELLED | `red-100` | `red-800` | `badge-cancelled` |
| FAILED | `gray-100` | `gray-600` | `badge-failed` |

### Rider Status Colors

| Status | Background | Text | Tailwind Class |
|--------|-----------|------|----------------|
| AVAILABLE | `emerald-100` | `emerald-800` | `status-available` |
| BUSY | `orange-100` | `orange-800` | `status-busy` |
| OFFLINE | `gray-100` | `gray-600` | `status-offline` |

---

## Typography

### Font Families

| Role | Font | Variable | Usage |
|------|------|----------|-------|
| **Body** | Inter | `--font-inter` | All body text, labels, descriptions |
| **Display** | Space Grotesk | `--font-space-grotesk` | Headings, stats, brand text |

Both fonts are loaded via `next/font/google` with `display: "swap"` for performance.

### Font Configuration (Tailwind)

```js
fontFamily: {
  sans: ["var(--font-inter)", "system-ui", "sans-serif"],
  display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
}
```

### Type Scale

| Element | Size | Weight | Font | Usage |
|---------|------|--------|------|-------|
| Hero heading | `text-5xl` / `text-6xl` | 700 | Display | Landing page hero |
| Page heading | `text-2xl` / `text-4xl` | 700 | Display | Section titles |
| Card heading | `text-lg` | 700 | Display | Card titles |
| Subheading | `text-base` | 700 | Display | Section subtitles |
| Body | `text-sm` (14px) | 400 | Sans | Default body text |
| Small / Label | `text-xs` (12px) | 500-600 | Sans | Labels, badges, metadata |
| Mono | `font-mono` | 500 | System mono | Order numbers, codes |

### Heading Styles

All headings (`h1`-`h6`) automatically use Space Grotesk with `font-weight: 700` and `line-height: 1.25` via the base layer CSS.

---

## Spacing & Layout

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

## Components

### Buttons

Four button variants defined in `globals.css`:

#### Primary Button (`.btn-primary`)
```html
<button class="btn-primary">
  Commander <ArrowRight />
</button>
```
- Orange background (`brand-500`)
- White text, semibold
- Rounded `xl` (12px)
- Shadow on hover, scale on active
- Disabled state: 50% opacity

#### Secondary Button (`.btn-secondary`)
```html
<button class="btn-secondary">Retour</button>
```
- White background with gray border
- Gray text
- Used for secondary actions (back, cancel)

#### Ghost Button (`.btn-ghost`)
```html
<button class="btn-ghost">Connexion</button>
```
- No background or border
- Appears on hover
- Used in navigation

#### Danger Button (`.btn-danger`)
```html
<button class="btn-danger">Supprimer</button>
```
- Red background
- Used for destructive actions

### Cards

#### Standard Card (`.card`)
```html
<div class="card p-6">Content</div>
```
- White background
- Rounded `2xl` (16px)
- Subtle shadow (`shadow-card`)
- Light gray border (`border-gray-100`)
- Shadow increases on hover (`shadow-card-hover`)

#### Flat Card (`.card-flat`)
- Same as card but no shadow
- Border only

### Shadow Values

```js
boxShadow: {
  card: "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)",
  "card-hover": "0 4px 12px 0 rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  modal: "0 20px 60px -10px rgba(0,0,0,0.3)",
}
```

### Inputs

#### Text Input (`.input`)
```html
<input class="input" placeholder="Votre email" />
```
- Full width
- Rounded `xl`
- Gray border, brand focus ring (`ring-brand-500/30`)
- `py-3 px-4` padding

#### Input Error (`.input-error`)
```html
<input class="input input-error" />
<p class="text-xs text-red-500 mt-1">Error message</p>
```
- Red border and focus ring

#### Label (`.label`)
```html
<label class="label">Email</label>
```
- `text-sm font-medium text-gray-700 mb-1.5`

### Badges

Status badges with color coding:

```html
<span class="badge badge-pending">En attente</span>
<span class="badge badge-delivered">Livré</span>
```

All badge variants: `badge-pending`, `badge-confirmed`, `badge-assigned`, `badge-in-transit`, `badge-delivered`, `badge-cancelled`, `badge-failed`

### Loading Spinner

```html
<div class="spinner"></div>
```
- 20x20px orange ring animation
- Scale with `scale-150` for larger contexts

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

## Page Layouts

### Landing Page

```
┌─────────────────────────────────────┐
│ Header (fixed, glass-blur backdrop) │
├─────────────────────────────────────┤
│ Hero (gradient bg, phone mockup)    │
├─────────────────────────────────────┤
│ Features (3-column grid of cards)   │
├─────────────────────────────────────┤
│ How it Works (3-step horizontal)    │
├─────────────────────────────────────┤
│ CTA (orange gradient)              │
├─────────────────────────────────────┤
│ Footer (dark bg, 4-column)          │
└─────────────────────────────────────┘
```

### Customer Dashboard

```
┌─────────────────────────────────────┐
│ Header (sticky, brand + actions)    │
├─────────────────────────────────────┤
│ Welcome banner (orange gradient)    │
│ [+ Nouvelle livraison]              │
├─────────────────────────────────────┤
│ Quick stats (3-col grid)            │
├─────────────────────────────────────┤
│ Active orders (card list)           │
├─────────────────────────────────────┤
│ Order history (table/list)          │
└─────────────────────────────────────┘
```

### Admin Dashboard

```
┌──────────┬──────────────────────────┐
│ Sidebar  │ Header (page title)      │
│ (dark)   ├──────────────────────────┤
│          │ Stat cards (3x2 grid)    │
│ Nav      ├──────────────────────────┤
│ items    │ Charts (revenue + pie)   │
│          ├──────────────────────────┤
│ User     │ Recent orders table      │
│ info     │                          │
└──────────┴──────────────────────────┘
```

### Rider Dashboard

```
┌─────────────────────────────────────┐
│ Header (dark bg, status toggle)     │
├─────────────────────────────────────┤
│ Stats (3-col: deliveries/rating/$)  │
├─────────────────────────────────────┤
│ Active deliveries (action cards)    │
├─────────────────────────────────────┤
│ Available orders (bordered cards)   │
└─────────────────────────────────────┘
```

---

## Scrollbar

Custom scrollbar for WebKit browsers:

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
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

- **Header**: Orange gradient (`#FF6B2C` to `#FF8C00`)
- **Body**: White background, 600px max width
- **CTA buttons**: Orange with white text, rounded 8px
- **Info boxes**: Light orange background (`#FFF7F3`) with left orange border
- **Footer**: Light gray background, small text
- **Font**: Segoe UI / Arial fallback (web-safe for email)

---

## Design Tokens Summary (for Mobile)

When implementing the mobile app (Expo React Native), use these tokens:

```typescript
export const colors = {
  brand: {
    primary: '#FF6B2C',
    secondary: '#FF8C00',
    dark: '#C2410C',
    light: '#FFF7ED',
  },
  surface: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    inverse: '#FFFFFF',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  border: '#E5E7EB',
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
