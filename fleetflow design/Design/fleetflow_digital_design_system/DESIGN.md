---
name: FleetFlow Digital Design System
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system is engineered for a premium, high-fidelity car rental experience. It prioritizes a **Modern SaaS** aesthetic that balances executive sophistication with functional clarity. The visual language is characterized by expansive whitespace, a restrained but authoritative color palette, and high-precision interface elements.

The target audience expects a seamless, professional, and reliable service. To evoke this, the design system utilizes:
- **Refined Minimalism:** Every element serves a purpose, reducing cognitive load during the booking process.
- **Soft Layering:** Depth is communicated through subtle shadows and tonal shifts rather than heavy borders.
- **High-End Precision:** Crisp typography and consistent 16px corner radii create a cohesive, "app-like" feel that signifies quality and modern technology.

## Colors
The color strategy employs a high-contrast foundation for maximum legibility and brand authority.

- **Primary (#0F172A):** Used for core branding, primary headings, and high-emphasis navigation. It provides the "anchor" for the premium feel.
- **Accent (#2563EB):** The functional color for actions, links, and active states. It draws the eye to conversion points.
- **Semantic Palette:** Green, Amber, and Red are reserved strictly for status communication (e.g., "Available," "Pending," "Action Required").
- **Neutral System:** The background (#F8FAFC) provides a cool, clean canvas that allows white surface cards to pop, creating a clear sense of layering and organization.

## Typography
This design system utilizes **Inter** exclusively to achieve a systematic, neutral, and highly readable interface. 

- **Hierarchy:** H1 (48px) is reserved for hero sections and major landing headers. H2 (32px) acts as the primary section header.
- **Readability:** Body text is set at 16px with a generous 1.6 line height to ensure long-form content and vehicle specifications are easily digestible.
- **Functional Labels:** Captions and labels use slightly tighter tracking and heavier weights to distinguish them from narrative text.
- **Scalability:** On mobile devices, the H1 scales down to 32px to maintain visual balance within the narrower viewport.

## Layout & Spacing
The layout follows a **8px linear scale** to ensure mathematical harmony across all components.

- **Grid System:** A 12-column fluid grid is used for desktop (up to 1280px), transitioning to a 4-column grid for mobile devices.
- **Rhythm:** Vertical spacing between sections should primarily use `lg` (48px) or `xl` (80px) to maintain the "premium" airy feel.
- **Consistency:** Card padding is standardized at 24px (`md`) to provide ample breathing room for content.
- **Breakpoints:**
  - Mobile: < 768px (16px margins)
  - Tablet: 768px - 1024px (24px margins)
  - Desktop: > 1024px (Centered container, 32px margins)

## Elevation & Depth
Elevation in this design system is achieved through **Tonal Layering** and **Soft Shadows**. 

- **The Ground:** The background layer (#F8FAFC) is the lowest level.
- **Surface Level:** Cards and containers use the surface color (#FFFFFF) with a very fine 1px border (#E2E8F0) and a soft, multi-layered shadow.
- **Shadow Style:** Use a "Natural" shadow approach: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`. 
- **Interaction:** On hover, cards should subtly lift by increasing the shadow spread and reducing the Y-offset slightly, creating a tactile response.

## Shapes
The shape language is defined by the **Rounded (16px)** standard. This high corner radius softens the corporate "Deep Navy" and "Inter" combination, making the platform feel approachable and modern.

- **Components:** Buttons, Input fields, and Cards all utilize the `rounded-lg` (16px/1rem) setting.
- **Small Elements:** Tooltips and tags may use `rounded-md` (8px) to maintain visual proportions.
- **Icons:** Should feature slightly rounded terminals to match the container language.

## Components
Consistent component styling is vital for the premium feel of the design system.

- **Buttons:**
  - *Primary:* Deep Navy background, white text, 16px corners. No border.
  - *Secondary:* Transparent background, 1px border (#E2E8F0), Deep Navy text.
  - *Action:* Accent Blue background for high-priority conversion (e.g., "Book Now").
- **Input Fields:**
  - Use a subtle light gray stroke (#E2E8F0) and 16px corners.
  - *Focus State:* 2px Accent Blue border with a 4px soft blue outer glow (30% opacity).
- **Cards:**
  - White background, 1px subtle border, 16px corner radius.
  - Standardized 24px internal padding.
- **Status Badges:**
  - Use a "pill" shape (full rounding).
  - Backgrounds should be 10-15% opacity of the semantic color (Success/Warning/Error) with full-saturation text for high legibility.
- **Vehicle Displays:**
  - Use high-aspect-ratio images with the standard 16px corner radius and a light background tint to unify car photography.