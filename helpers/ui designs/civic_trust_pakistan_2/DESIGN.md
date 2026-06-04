---
name: Civic Trust Pakistan
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
  on-surface-variant: '#404a3b'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#707a6a'
  outline-variant: '#bfcab7'
  surface-tint: '#106e09'
  primary: '#004b00'
  on-primary: '#ffffff'
  primary-container: '#006600'
  on-primary-container: '#88e274'
  inverse-primary: '#81db6e'
  secondary: '#2b694e'
  on-secondary: '#ffffff'
  secondary-container: '#b0f1ce'
  on-secondary-container: '#327054'
  tertiary: '#7b0d4c'
  on-tertiary: '#ffffff'
  tertiary-container: '#9a2a64'
  on-tertiary-container: '#ffb9d4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf987'
  primary-fixed-dim: '#81db6e'
  on-primary-fixed: '#002200'
  on-primary-fixed-variant: '#005300'
  secondary-fixed: '#b0f1ce'
  secondary-fixed-dim: '#94d4b3'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#0b5138'
  tertiary-fixed: '#ffd9e5'
  tertiary-fixed-dim: '#ffb0cf'
  on-tertiary-fixed: '#3d0023'
  on-tertiary-fixed-variant: '#851753'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  h3:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
  caption:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base-unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is anchored in the principles of institutional integrity, transparency, and digital progress. It targets Pakistani citizens and administrative officials, requiring a UI that feels authoritative yet accessible. 

The aesthetic follows a **Corporate / Modern** style with **Minimalist** leanings. It prioritizes clarity over decoration, using ample whitespace to reduce cognitive load in complex bureaucratic processes. The visual language conveys stability through structured grids and a restrained palette, ensuring the portal feels like a dependable public utility rather than a commercial product.

## Colors
This design system utilizes a palette rooted in national identity. The **Primary Green** (#006600) serves as the main brand touchpoint for buttons and headers, while the **Sidebar Green** (#064E35) provides deep structural contrast for navigation.

Backgrounds utilize a clean **White** for primary content areas and **Light Grey** (#F9FAFB) for secondary sections and page scaffolding. State-specific colors are calibrated for high legibility against these light backgrounds:
- **Priority:** High (Red), Medium (Amber), Low (Green).
- **Status:** Submitted (Grey), In Progress (Blue), Resolved (Green).

## Typography
The design system exclusively employs **Public Sans**, an institutional typeface designed for legibility and accessibility. Headlines use heavier weights and tighter letter-spacing to command attention. Body text is optimized for long-form reading with a generous 1.5x to 1.6x line height. Labels and metadata utilize semi-bold weights at smaller sizes to maintain hierarchy without cluttering the interface.

## Layout & Spacing
The layout follows a **Fixed Grid** model for desktop, centered within a 1280px container to ensure readability on large displays. A 12-column system is used for dashboard layouts, while forms are restricted to an 8-column central span to prevent excessive line lengths. 

Spacing follows a strict 4px linear scale. Internal component padding typically uses `md` (16px), while section margins use `2xl` (48px) to create the "clean" and "modern" breathing room required for a professional government portal.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows. 
- **Level 0 (Background):** #F9FAFB.
- **Level 1 (Cards/Surface):** White (#FFFFFF) with a 1px border in #E5E7EB.
- **Level 2 (Dropdowns/Modals):** White with a soft, neutral ambient shadow (0px 4px 20px rgba(0, 0, 0, 0.05)) to distinguish interactive layers from the page surface.

The sidebar uses a solid, flat color (#064E35) to anchor the application structure, creating a clear vertical silhouette.

## Shapes
The design system adopts a **Soft** shape language (0.25rem / 4px). This subtle rounding maintains the "Professional" and "Institutional" requirement, appearing more modern than sharp corners while remaining more serious than fully rounded or pill-shaped designs. Buttons, input fields, and status badges all follow this consistent 4px radius.

## Components
- **Buttons:** Primary buttons use the Deep Government Green (#006600) with white text. Secondary buttons use a ghost style with a 1px border.
- **Badges:** Priority and Status badges use a "soft-fill" approach: a pale background tint of the status color with high-contrast bold text of the same hue (e.g., High Priority: Light Red background, Dark Red text).
- **Input Fields:** Use a 1px border in #D1D5DB, shifting to the Primary Green on focus. Labels are always positioned above the field for maximum accessibility.
- **Sidebar:** Navigation items use a subtle hover state (10% white overlay) and a 4px left-border accent to indicate the active page.
- **Cards:** White containers with subtle borders. Used for grouping citizen requests, service links, and data visualizations.
- **Data Tables:** Clean, row-based layout with #F9FAFB zebra-striping and no vertical borders to emphasize horizontal flow.