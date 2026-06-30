---
name: Cognitive Enterprise
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#424655'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#737687'
  outline-variant: '#c3c6d8'
  surface-tint: '#0053db'
  primary: '#0050d6'
  on-primary: '#ffffff'
  primary-container: '#2a6af9'
  on-primary-container: '#fefcff'
  inverse-primary: '#b4c5ff'
  secondary: '#595f68'
  on-secondary: '#ffffff'
  secondary-container: '#dae0ea'
  on-secondary-container: '#5d636c'
  tertiary: '#9e3e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dde3ed'
  secondary-fixed-dim: '#c1c7d1'
  on-secondary-fixed: '#161c23'
  on-secondary-fixed-variant: '#414750'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2e00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 24px
---

## Brand & Style

The design system is engineered for high-density AI observability and enterprise data management. It draws inspiration from modern productivity suites, prioritizing a "Zen" interface that reduces cognitive load. The aesthetic is **High-Signal Minimalism**: a synthesis of clean layouts, restrained ornamentation, and functional clarity.

The target audience consists of data scientists, operations managers, and developers who require rapid information processing without visual fatigue. The emotional response is one of **calculated calm and precision**. By utilizing expansive white space and a "containers-within-containers" logic, the system ensures that complex data sets remain legible and actionable.

## Colors

The palette is built on a foundation of neutral cool grays to keep the focus on content. 

- **Background Strategy**: Use `#F5F6F7` for the application canvas to create a soft contrast against the `#FFFFFF` components.
- **Primary Accent**: `#3370FF` is reserved strictly for primary actions, active states, and critical progress indicators.
- **Neutral Hierarchy**: Use a spectrum of grays for text—`#1F2329` for headings, `#646A73` for secondary descriptions, and `#8F959E` for placeholder or disabled states.
- **Semantic Colors**: Use muted versions of green, orange, and red for status indicators to ensure they provide signal without disrupting the visual harmony.

## Typography

This design system utilizes **Inter** for its neutral, systematic character and exceptional legibility at small sizes—essential for data-heavy dashboards. 

For technical data points, AI model parameters, or log entries, **JetBrains Mono** is employed to provide a distinct visual "mode" for raw data versus UI labels. 

On mobile devices, scale `headline-lg` down to `24px` and increase vertical rhythm by adding 4px to standard `body-md` line heights to improve touch-target readability.

## Layout & Spacing

The system follows a **Fluid Grid with Fixed Constraints**. 

- **Grid**: A 12-column system is used for the main content area. In dashboard views, a 4-column span is standard for metric widgets, and an 8-column span is used for primary data visualizations.
- **Sidebar**: A fixed-width left navigation (240px) provides persistent access to high-level modules.
- **Density**: Use "Comfortable" spacing (`24px`) for marketing or landing pages, and "Compact" spacing (`12px`) for data-rich observability tables.
- **Responsiveness**: At the 768px breakpoint (Tablet), the sidebar collapses into a hamburger menu or bottom bar. At 480px (Mobile), all grid columns collapse into a single-column stack with horizontal margins reduced to `16px`.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Soft Ambient Shadows**. 

1.  **Level 0 (Base)**: The `#F5F6F7` background.
2.  **Level 1 (Card)**: Pure white `#FFFFFF` surfaces with a 1px border of `#E8E9EB`. No shadow is used at this level to maintain a flat, clean look.
3.  **Level 2 (Dropdown/Pop-over)**: Surface with a subtle shadow: `0px 4px 12px rgba(31, 35, 41, 0.08)`.
4.  **Level 3 (Modals)**: Surface with a more pronounced shadow: `0px 8px 24px rgba(31, 35, 41, 0.12)`.

Avoid heavy blurs or colorful glows. The goal is to simulate physical paper sheets stacked neatly on a gray desk.

## Shapes

The design system uses a **Rounded** shape language to soften the industrial nature of enterprise software.

- **Standard Elements**: Buttons, inputs, and small cards use a `6px` radius (standardized as `rounded-md`).
- **Large Containers**: Main dashboard widgets and modal containers use a `10px` or `12px` radius.
- **System Icons**: Icons should follow the same radius logic—avoiding sharp 90-degree corners in favor of slightly softened terminals.

## Components

- **Buttons**: 
    - *Primary*: Solid `#3370FF` with white text.
    - *Secondary/Ghost*: Transparent background with `#3370FF` text and border.
    - *Tertiary*: No border, `#646A73` text that shifts to primary color on hover.
- **Input Fields**: Height set to `32px` for compact views and `40px` for standard forms. Borders are `#E8E9EB`, turning `#3370FF` on focus.
- **Data Tables**: Zero-border containers where rows are separated by 1px `#F2F3F5` lines. Hover states for rows should use a very light tint of the primary color (`#F0F5FF`).
- **Chips/Tags**: Small, `20px` height, with a light gray background and `#646A73` text. For AI status, use "Dot" indicators next to text labels.
- **Cards**: Use `#FFFFFF` with a 1px border. Title areas should be separated by a subtle horizontal rule or a slight gray header background.
- **AI Observability Widgets**: Use Sparklines for trend data and Monospaced fonts for model IDs and confidence scores to denote technical precision.