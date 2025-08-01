# PP Neue Montreal Design System

A modern, typography-first design system built around glassmorphism aesthetics, fluid responsive design, and sophisticated interactive states. Built for performance with hardware-accelerated animations and modern CSS features.

## Core Philosophy

**Typography-Driven**: PP Neue Montreal font family as the foundation with precise letter-spacing and fluid scaling
**Glassmorphism**: Backdrop blur effects with layered transparency and inset glows
**Performance-First**: Hardware acceleration, will-change properties, and optimized transforms
**Accessibility**: Focus-visible states, reduced motion support, proper semantic structure

---

## Foundation

### Typography Scale

```css
/* Display: Hero sections */
font-size: clamp(2rem, 1rem + 5vw, 6rem)
letter-spacing: -0.02em
line-height: 1

/* Headlines: H1-H4 decreasing scale */
H1: clamp(2rem, 1.25rem + 3.75vw, 5rem)
H2: clamp(2rem, 1.5rem + 2.5vw, 4rem)
H3: clamp(1.625rem, 1.2813rem + 1.7188vw, 3rem)
H4: clamp(1.5rem, 1.3125rem + .9375vw, 2.25rem)

/* Body Text */
Regular: clamp(1rem, .9375rem + .3125vw, 1.25rem)
Small: clamp(.75rem, .7188rem + .1563vw, .875rem)
line-height: 130%
letter-spacing: -0.02em
```

### Color System

```css
--color-bg-light: #F5F5F5
--color-bg-dark: #191B18
--color-bg-light-grey: #D8D8D8
--color-text-dark: #191B18
--color-text-light: #F5F5F5
```

### Breakpoint System

```css
560px → 768px → 1024px → 1280px → 1536px
Container max-widths scale with breakpoints
```

---

## Component Guidelines

### Buttons

#### Primary Button (.button-primary)

```css
/* Structure */
min-height: 3.25em
border-radius: 1.25em
padding: responsive

/* Shadow System */
Default: 0 0 3px 2px #fff3 inset, 0 0 12px 4px #ffffff20 inset, 0 4px 3px -4px #00000080
Hover: 0 0 16px 2px #ffffff4d inset, 0 0 #0000001a

/* Icon Animation */
SVG translates 0.25em right on hover
Transition: 0.2s ease-in-out
```

#### Secondary Button (.button-secondary)

```css
/* Minimal Design */
Shadow: 0 4px 3px -4px #0000001a
Hover: Shadow disappears
Same icon animation pattern
```

#### Book Button (.button-book)

```css
/* Complex Glassmorphism */
Shadow: 0 0 12px 4px #ffffff40 inset, 0 4px 3px -4px #00000080
Profile icon scales to 1.1 with spring animation
Spring timing: cubic-bezier(.65, .05, .36, 1)
```

### Cards

#### Header Card (.header-card)

```css
/* Adaptive Glassmorphism */
--padding: .5em (default) → 1em (open/hover)
--header-fill: rgba(255,255,255,.25) → rgba(255,255,255,.5)

/* Backdrop System */
backdrop-filter: blur(4px) → blur(12px)
Border-radius: clamp(1em, calc((var(--padding) * 2 + 3.5em) / 2), 2.25em)

/* Menu Animation */
CSS Grid: grid-template-rows: 0fr → 1fr
Pure CSS with :has(#menu-toggle:checked)
```

#### Pricing Cards

```css
/* Dark Variant */
background: var(--color-bg-dark) + noise texture (25% opacity)
box-shadow: 0 0 3em .5em inset color-mix(in srgb, #FFFFFF 30%, transparent)

/* Light Variant */
background: #d8d8d8
box-shadow: 0 0 3em .5em inset color-mix(in srgb, #ffffff 50%, transparent)
```

#### Case Study Cards (.casecard_wrap)

```css
/* Hover Mechanics */
clip-path: inset(0) → inset(.5em)
Image scale: 1 → 1.125
Backdrop overlay slides from top: 100% → 0

/* Staggered Content Animation */
opacity: 0 → 1
filter: blur(8px) → blur(0px)
transform: translateY(12px) → translateY(0)
Timing: .6s cubic-bezier(.65, .05, .36, 1)

/* Mobile Adaptation */
@media (max-width: 560px): Complete layout restructure
```

### Interactive Components

#### FAQ Accordion (.faq-accordion)

```css
/* Grid Animation */
grid-template-rows: 0fr → 1fr
Timing: 0.3s ease-out

/* Icon System */
Background: color-mix(in srgb, var(--color-bg-dark) 15%, transparent)
Hover/Open: 25% opacity
SVG rotation: 90deg with transform-origin center

/* Sibling Dimming */
:has() selector dims non-hovered items to 50% opacity
```

#### Tab System

```css
/* Stacked Layout */
CSS Grid: all panels in same cell
Z-index management: active gets z-index: 2
Transform: inactive panels scale(.95) translateY(-5%)
Pure CSS with hidden radio inputs
```

### Specialized Effects

#### Text Gradients

```css
/* Implementation */
-webkit-background-clip: text
-webkit-text-fill-color: transparent
background-image: url("/assets/noise.webp")
background-size: 200% auto
background-position: 0 50%
```

#### Glassmorphism System

```css
/* Blur Levels */
Standard: backdrop-filter: blur(4px)
Enhanced: backdrop-filter: blur(12px)

/* Color Mixing */
color-mix(in srgb, #FFFFFF X%, transparent)
Multiple inset shadows for depth
```

#### Animation Patterns

```css
/* Performance Optimizations */
will-change: transform, opacity, box-shadow
transform3d(0,0,0) for hardware acceleration

/* Timing Functions */
Standard: cubic-bezier(.4, 0, .2, 1)
Bouncy: cubic-bezier(.65, .05, .36, 1)
Spring: linear(0, -.004 4.9%, -.02 9.4%, ...)

/* Staggered Reveals */
Opacity: 0 → 1
Blur: 8px → 0px
Transform: translateY(12px) → translateY(0)
Delays: Staggered timing for child elements
```

### Layout System

#### CSS Grid Patterns

```css
/* Responsive Grids */
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))
gap: clamp(.5rem, 2vw, 2rem)

/* Masonry Layouts */
grid-template-columns: repeat(3, 1fr)
Selective spanning: grid-column: span 2
Responsive breakdowns at 1024px, 768px
```

#### Container System

```css
/* Responsive Containers */
width: 100%
max-width: responsive breakpoint values
margin: 0 auto
padding: responsive scaling
```

### Accessibility Features

#### Focus Management

```css
:focus-visible {
  outline: 2px solid currentColor
  outline-offset: 2px
}

/* Remove focus for mouse users */
:focus:not(:focus-visible) {
  outline: none
}
```

#### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable animations */
  *, *::before, *::after {
    animation-duration: 0.01ms !important
    transition-duration: 0.01ms !important
  }
}
```

This design system prioritizes modern CSS features like `color-mix()`, `:has()`, `clamp()`, and CSS Grid while maintaining performance through careful use of hardware acceleration and optimized animation properties.
