---
name: NewsGate Design System
colors:
  surface: '#131316'
  surface-dim: '#131316'
  surface-bright: '#39393c'
  surface-container-lowest: '#0e0e11'
  surface-container-low: '#1b1b1e'
  surface-container: '#1f1f22'
  surface-container-high: '#2a2a2d'
  surface-container-highest: '#353438'
  on-surface: '#e4e1e6'
  on-surface-variant: '#cfc4c5'
  inverse-surface: '#e4e1e6'
  inverse-on-surface: '#303033'
  outline: '#988e90'
  outline-variant: '#4c4546'
  surface-tint: '#c6c6c6'
  primary: '#c6c6c6'
  on-primary: '#303030'
  primary-container: '#000000'
  on-primary-container: '#757575'
  inverse-primary: '#5e5e5e'
  secondary: '#b4c5ff'
  on-secondary: '#002a78'
  secondary-container: '#0053db'
  on-secondary-container: '#cdd7ff'
  tertiary: '#c3c0ff'
  on-tertiary: '#1d00a5'
  tertiary-container: '#000000'
  on-tertiary-container: '#655efb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#e2dfff'
  tertiary-fixed-dim: '#c3c0ff'
  on-tertiary-fixed: '#0f0069'
  on-tertiary-fixed-variant: '#3323cc'
  background: '#131316'
  on-background: '#e4e1e6'
  surface-variant: '#353438'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  data-point:
    fontFamily: JetBrains Mono
    fontSize: 14px
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
  container-max: 1440px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 16px
  bento-gap: 16px
  section-padding: 64px
---

## Brand & Style
The design system is engineered for a "Bloomberg for Everyone" experience—balancing the high-density information requirements of a professional terminal with the cinematic, immersive quality of premium consumer media. The brand personality is authoritative, immediate, and sophisticated. 

The aesthetic leans heavily into **Cinematic Glassmorphism** and **Bento-style modularity**. It utilizes a "Darkroom" philosophy where the background recedes into a deep Zinc-900 abyss, allowing content modules (Bento Boxes) to appear as glowing, high-definition data tiles. The emotional response should be one of "controlled urgency"—the user feels they are at the center of global events, equipped with the most precise and high-end tools available.

## Colors
The palette is rooted in a deep, monochromatic foundation to maximize contrast and reduce visual noise. The primary background is Zinc-900, providing a softer, more premium "ink" feel than pure black, while pure #000000 is reserved for high-contrast voids and deep shadows.

Vibrant Electric Blue and Indigo are used sparingly as functional accents—signaling real-time updates, active states, and breaking news indicators. Gradients between these two colors suggest motion and "live" energy. Secondary information uses Zinc-400 to maintain a clear hierarchy, ensuring the user's eye is always drawn to the most critical headlines first.

## Typography
This design system employs a tiered typographic strategy to handle high information density. 

**Inter** is utilized for headlines in its "Black" (900) weight, creating an authoritative, editorial impact that mimics high-end financial broadsheets. 
**Work Sans** provides the necessary legibility for long-form news reading, offering a grounded and neutral tone. 
**JetBrains Mono** (or similar monospaced utility font) is introduced for metadata, timestamps, and stock tickers, reinforcing the "terminal" aesthetic and technical precision of the platform.

## Layout & Spacing
The layout follows a **Bento Box Grid** model. This is a 12-column fluid system that organizes content into distinct, modular tiles of varying sizes. Each "box" acts as an independent container for a news story, a data visualization, or a live feed.

Spacing is governed by a strict 8px rhythm. While the grid is dense, "breathable" margins (48px on desktop) ensure the content feels premium rather than cluttered. On mobile, the Bento grid collapses into a single-column stack, but maintains the distinctive tile-based visual language.

## Elevation & Depth
Depth is created through **Glassmorphism** rather than traditional drop shadows. Surfaces utilize `backdrop-blur-xl` (24px - 40px blur) to simulate frosted layers floating over the background.

To enhance the "cinematic" feel, Bento boxes feature a `1px` inner border (stroke) with a subtle gradient glow. This glow should be `white` at 10% opacity for standard modules, and `Electric Blue` at 30% opacity for "Breaking News" or "Live" modules. This "border-light" technique makes elements appear as if they are backlit, similar to a high-end physical interface or a digital cockpit.

## Shapes
The shape language is defined by the **3xl rounded corners** (24px) of the Bento boxes. This extreme roundness contrasts with the sharp, authoritative typography, creating a modern and approachable "high-tech" look. 

Smaller UI components like buttons and input fields use a more conservative `rounded-lg` (8px) to maintain a sense of functional precision. Interactive "chips" or category tags use a full-pill radius to distinguish them from structural modules.

## Components
- **Bento Cards:** The primary container. Must include a `backdrop-filter: blur(20px)`, a `1px` Zinc-800 border, and a subtle inner-glow.
- **Action Buttons:** Primary buttons use the Electric Blue-to-Indigo gradient with white text. Secondary buttons are ghost-style with a Zinc-700 border.
- **Live Indicators:** A pulsing 8px dot using the Electric Blue accent, paired with monospaced "LIVE" text.
- **News Lists:** High-density rows within Bento boxes. Headlines are bold white; metadata (time, source) is in Zinc-400 Work Sans.
- **Data Visualizations:** Charts should use the accent blue and indigo. Grid lines in charts should be kept to a minimum (Zinc-800) to maintain the clean, dark aesthetic.
- **Input Fields:** Search bars and filters should be semi-transparent Zinc-800 with a subtle focus glow in Electric Blue.