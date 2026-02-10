# Design System: Viettel Red (Meal Management)

## 1. Core Palette (Primary)
Based on official Viettel brand identity.

| Name | HEX | RGB | Use Case |
| :--- | :--- | :--- | :--- |
| **Primary (VT Red)** | `#E61E23` | `230 30 35` | Primary CTA, Headers, Brand Indicators |
| **Primary Hover** | `#D81B20` | `216 27 32` | Button hover states |
| **Primary Pressed** | `#C5161B` | `197 22 27` | Button active/pressed states |
| **Primary Soft** | `#FDE8E9` | `253 232 233` | Background highlights, Active tab backgrounds |
| **Primary Soft 2** | `#FAD1D3` | `250 209 211` | Border highlights, Muted backgrounds |

## 2. Global Tokens

### A. Typography
- **Text Primary**: `#111827` (Slate 900)
- **Text Secondary**: `#374151` (Slate 700)
- **Text Muted**: `#6B7280` (Slate 500)
- **Text Inverse**: `#FFFFFF`

### B. Surfaces
- **App BG**: `#F6F7FB` (Cool Gray)
- **Surface**: `#FFFFFF`
- **Surface 2**: `#F3F4F6` (Gray 100)

### C. Borders
- **Border**: `#E5E7EB` (Gray 200)
- **Divider**: `#EEF2F7` (Light Gray)

### D. States
- **Success**: `#16A34A` (Green 600)
- **Warning**: `#F59E0B` (Amber 500)
- **Danger**: `#E61E23` (Same as Brand)
- **Info**: `#2563EB` (Blue 600)

## 3. Component Standards

### Buttons
- **Primary**: `bg-brand text-white hover:bg-brand-hover active:bg-brand-pressed focus:ring-brand/35`
- **Secondary**: `bg-white border-border text-slate-900 hover:bg-surface-2`
- **Ghost**: `bg-transparent text-brand hover:bg-brand-soft`
- **Danger**: `bg-brand text-white hover:bg-brand-hover` (Brand is Red)

### Layout Indicators
- **Active Tab**: `bg-brand-soft text-brand border-b-2 border-brand`
- **Sidebar Active**: `bg-brand-soft text-brand border-r-4 border-brand`

## 4. Focus & Interaction
- **Focus Ring**: `ring-offset-2 ring-brand/35 opacity-100`
- **Transitions**: `200ms ease-in-out`
