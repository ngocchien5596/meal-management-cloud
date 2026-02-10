# Theme Replacement Rules: Viettel Red Migration

This document lists the mapping of legacy color classes to the new Viettel Red brand system. Use these rules to refactor components consistently.

## 1. Color Mapping

| Legacy Class (Blue/Default) | New Class (Viettel Red) | Reasoning |
| :--- | :--- | :--- |
| `bg-blue-600` | `bg-brand` | Standard primary background |
| `hover:bg-blue-700` | `hover:bg-brand-hover` | Primary hover state |
| `active:bg-blue-800` | `active:bg-brand-pressed` | Primary pressed state |
| `text-blue-600` | `text-brand` | Primary text accent / links |
| `border-blue-600` | `border-brand` | Primary border accent |
| `ring-blue-600` | `ring-brand` | Primary focus ring |
| `bg-blue-50` | `bg-brand-soft` | Muted background highlight |
| `border-blue-100` | `border-brand-soft2` | Muted border highlight |

## 2. Structural Colors

| UI Element | Target Tokens | Notes |
| :--- | :--- | :--- |
| Body Background | `bg-app` | Neutral cool gray |
| Card Background | `bg-surface` | Pure white |
| Header Borders | `border-divider` | Very subtle separator |
| Secondary Buttons | `bg-surface border-border text-text-primary` | Standard secondary |
| Input Borders | `border-border` | Default gray border |
| Focus States | `focus:ring-brand/35` | Always use opacity for focus |

## 3. Preservation Rules
- **DO NOT** change `bg-green-*` (Success) unless mapping to `state-success`.
- **DO NOT** change `bg-amber-*` (Warning) unless mapping to `state-warning`.
- **DO NOT** change `bg-red-*` (Danger) if it indicates an error, as it now overlaps with the brand color. Use `state-danger` for semantics.

## 4. Component Refactor (JSX Examples)

### Button Component
```tsx
// Primary
<button className="bg-brand text-text-inverse hover:bg-brand-hover transition-colors rounded-lg px-4 py-2">
  Submit
</button>

// Ghost
<button className="text-brand hover:bg-brand-soft transition-colors rounded-lg px-4 py-2">
  Cancel
</button>
```

### Badge Component
```tsx
// Brand / Danger
<span className="bg-brand-soft text-brand px-2 py-0.5 rounded text-xs font-medium">
  Hot
</span>
```
