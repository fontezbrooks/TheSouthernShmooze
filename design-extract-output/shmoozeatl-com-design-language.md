# Design Language: The Southern Shmooze | Explore Local Businesses Today

> Extracted from `https://www.shmoozeatl.com/` on June 23, 2026
> 11119 elements analyzed across 15 pages

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#e1ded4` | rgb(225, 222, 212) | hsl(46, 18%, 86%) | 151 |
| Secondary | `#0099dd` | rgb(0, 153, 221) | hsl(198, 100%, 43%) | 24 |
| Accent | `#f1694f` | rgb(241, 105, 79) | hsl(10, 85%, 63%) | 4 |

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#000000` | hsl(0, 0%, 0%) | 19341 |
| `#333333` | hsl(0, 0%, 20%) | 2620 |
| `#ffffff` | hsl(0, 0%, 100%) | 658 |
| `#efece6` | hsl(40, 22%, 92%) | 31 |
| `#bbbbbb` | hsl(0, 0%, 73%) | 11 |
| `#cdd5df` | hsl(213, 22%, 84%) | 3 |
| `#a9a9a9` | hsl(0, 0%, 66%) | 2 |

### Background Colors

Used on large-area elements: `#e1ded4`, `#000000`, `#ffffff`, `#efece6`, `#afafaf`, `#e5e3df`

### Text Colors

Text color palette: `#000000`, `#ffffff`, `#333333`, `#bbbbbb`, `#0d121c`, `#2288dd`, `#f1694f`

### Gradients

```css
background-image: linear-gradient(rgb(0, 0, 0), rgb(0, 0, 0));
```

```css
background-image: linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(30, 30, 30, 0.3) 100%);
```

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#000000` | text, border, background | 19341 |
| `#333333` | text, border | 2620 |
| `#ffffff` | text, border, background | 658 |
| `#e1ded4` | background | 151 |
| `#efece6` | border, background | 31 |
| `#0099dd` | background, border | 24 |
| `#bbbbbb` | text, border | 11 |
| `#2288dd` | text, border | 10 |
| `#0d121c` | text, border | 6 |
| `#f1694f` | text, border | 4 |
| `#cdd5df` | border | 3 |
| `#a9a9a9` | border, background | 2 |
| `#1a73e8` | border | 1 |

## Typography

### Font Families

- **Bitter** — used for body (8600 elements)
- **Shrikhand** — used for all (666 elements)
- **Roboto** — used for body (364 elements)
- **SFico** — used for body (110 elements)
- **Times** — used for body (20 elements)
- **Google Sans Text** — used for body (10 elements)

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 62.08px | 3.88rem | 400 | 65.5565px | -1.2416px | h1, span, strong |
| 56px | 3.5rem | 400 | 24px | normal | div, style |
| 54.4px | 3.4rem | 400 | 76.16px | -1.088px | h1, svg, g, path |
| 52.1px | 3.2563rem | 400 | 24px | normal | span, h1 |
| 48px | 3rem | 400 | 48px | normal | a, div, span, svg |
| 43.648px | 2.728rem | 400 | 48.6064px | -0.87296px | h2, strong |
| 25.216px | 1.576rem | 400 | 29.533px | -0.50432px | h4, strong, a, button |
| 23.68px | 1.48rem | 400 | 28.416px | -0.4736px | div, a |
| 22.144px | 1.384rem | 400 | 33.216px | normal | p, span, strong, a |
| 21px | 1.3125rem | 700 | 24.15px | -0.42px | h2 |
| 19.5px | 1.2188rem | 700 | 23.4px | -0.39px | h3 |
| 19.2px | 1.2rem | 400 | 19.2px | normal | div, nav, a, svg |
| 18px | 1.125rem | 700 | 23.4px | normal | button |
| 16.5px | 1.0313rem | 700 | normal | normal | div, h4 |
| 16.32px | 1.02rem | 400 | 16.32px | normal | div |

### Heading Scale

```css
h1 { font-size: 62.08px; font-weight: 400; line-height: 65.5565px; }
h1 { font-size: 54.4px; font-weight: 400; line-height: 76.16px; }
h1 { font-size: 52.1px; font-weight: 400; line-height: 24px; }
h2 { font-size: 43.648px; font-weight: 400; line-height: 48.6064px; }
h4 { font-size: 25.216px; font-weight: 400; line-height: 29.533px; }
h2 { font-size: 21px; font-weight: 700; line-height: 24.15px; }
h3 { font-size: 19.5px; font-weight: 700; line-height: 23.4px; }
h4 { font-size: 16.5px; font-weight: 700; line-height: normal; }
```

### Body Text

```css
body { font-size: 16px; font-weight: 400; line-height: normal; }
```

### Font Weights in Use

`400` (10803x), `700` (315x), `500` (1x)

## Spacing

**Base unit:** 2px

| Token | Value | Rem |
|-------|-------|-----|
| spacing-1 | 1px | 0.0625rem |
| spacing-4 | 4px | 0.25rem |
| spacing-22 | 22px | 1.375rem |
| spacing-30 | 30px | 1.875rem |
| spacing-32 | 32px | 2rem |
| spacing-35 | 35px | 2.1875rem |
| spacing-38 | 38px | 2.375rem |
| spacing-40 | 40px | 2.5rem |
| spacing-43 | 43px | 2.6875rem |
| spacing-48 | 48px | 3rem |
| spacing-51 | 51px | 3.1875rem |
| spacing-64 | 64px | 4rem |
| spacing-77 | 77px | 4.8125rem |
| spacing-84 | 84px | 5.25rem |
| spacing-139 | 139px | 8.6875rem |
| spacing-146 | 146px | 9.125rem |
| spacing-274 | 274px | 17.125rem |
| spacing-302 | 302px | 18.875rem |
| spacing-323 | 323px | 20.1875rem |
| spacing-369 | 369px | 23.0625rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| xs | 2px | 16 |
| lg | 12px | 3 |
| full | 26px | 17 |
| full | 50px | 12 |
| full | 300px | 58 |

## Box Shadows

**sm** — blur: 0px
```css
box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 1px;
```

**sm** — blur: 0px
```css
box-shadow: rgb(0, 0, 0) 0px 0px 0px 0px;
```

**xs** — blur: 1px
```css
box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 1px 0px, rgba(0, 0, 0, 0.25) 0px 0px 1px 0px;
```

**sm** — blur: 5px
```css
box-shadow: rgb(128, 128, 128) 0px 0px 5px 0px;
```

**sm** — blur: 4px
```css
box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
```

**lg** — blur: 13.5px
```css
box-shadow: rgba(0, 0, 0, 0.12) 0px 18px 13.5px 0px, rgba(0, 0, 0, 0.1) 0px 7.5px 6px 0px, rgba(0, 0, 0, 0.08) 0px 4.5px 3px 0px;
```

## CSS Custom Properties

### Colors

```css
--tweak-summary-block-background-color: hsla(0,0%,100%,1);
--tweak-blog-basic-grid-list-meta-color: hsla(0,0%,0%,1);
--tweak-blog-item-title-color: hsla(0,0%,0%,1);
--portfolio-hover-static-title-color: hsla(0,0%,0%,1);
--secondary-button-font-font-weight: 400;
--tweak-product-basic-item-gallery-controls-color: hsla(0,0%,0%,1);
--list-section-carousel-card-color: hsla(0,0%,100%,1);
--siteBackgroundColor: hsla(46.15,17.81%,85.69%,1);
--tweak-product-basic-item-sale-price-color: hsla(41,23%,92%,1);
--form-field-radio-shape-border-bottom-left-radius: 5px;
--tweak-newsletter-block-button-text-color: hsla(0,0%,100%,1);
--video-grid-basic-title-color: hsla(41,23%,92%,1);
--tweak-blog-alternating-side-by-side-list-meta-color: hsla(0,0%,0%,1);
--tweak-blog-single-column-list-title-color: hsla(0,0%,0%,1);
--solidHeaderBackgroundColor: hsla(0,0%,100%,1);
--toggle-on-color: hsla(0,0%,0%,1);
--course-item-nav-border-color: hsla(0,0%,0%,.25);
--tweak-product-basic-item-breadcumb-nav-color: hsla(0,0%,0%,1);
--social-links-block-secondary-icon-color: hsla(46.15,17.81%,85.69%,1);
--primary-button-font-font-style: normal;
--tweak-blog-alternating-side-by-side-list-excerpt-color: hsla(0,0%,0%,1);
--secondary-button-font-font-size-value: 1;
--tweak-form-block-background-color: hsla(0,0%,100%,1);
--primary-button-padding-y: 2rem;
--form-field-survey-shape-border-top-right-radius: 5px;
--tweak-blog-item-pagination-meta-color: hsla(0,0%,0%,1);
--video-grid-basic-description-color: hsla(41,23%,92%,1);
--backgroundOverlayColor: hsla(46.15,17.81%,85.69%,1);
--tweak-events-item-pagination-date-color: hsla(0,0%,0%,1);
--list-section-banner-slideshow-button-text-color: hsla(0,0%,100%,1);
--list-section-simple-card-description-color: hsla(0,0%,0%,1);
--tweak-newsletter-block-footnote-color: hsla(0,0%,0%,1);
--course-list-grid-layout-course-item-text-color: hsla(0,0%,0%,1);
--safeInverseLightAccent-hsl: 0,0%,0%;
--tweak-video-item-pagination-title-color: hsla(41,23%,92%,1);
--safeDarkAccent-hsl: 0,0%,0%;
--list-section-simple-card-button-background-color: hsla(0,0%,0%,1);
--stack-background-color: hsla(0,0%,100%,1);
--menuOverlayBackgroundColor: hsla(46.15,17.81%,85.69%,1);
--video-preview-badge-font-color: hsla(0,0%,0%,1);
--tweak-summary-block-header-text-color: hsla(0,0%,0%,1);
--course-list-course-progress-bar-color: hsla(20,41.18%,30%,1);
--list-section-simple-title-color: hsla(0,0%,0%,1);
--primary-button-font-font-size: 1rem;
--form-field-survey-shape-border-bottom-left-radius: 5px;
--tweak-form-block-field-input-color-on-background-hsl: 0,0%,0%;
--tweak-form-block-field-border-color: hsla(0,0%,0%,1);
--list-section-simple-card-title-color: hsla(0,0%,0%,1);
--tweak-heading-medium-color-on-background: hsla(0,0%,0%,1);
--menuOverlayButtonBackgroundColor: hsla(0,0%,0%,1);
--tweak-summary-block-primary-metadata-color-on-background: hsla(0,0%,0%,1);
--primary-button-font-line-height: 1.2em;
--image-block-card-inline-link-color: hsla(0,0%,0%,1);
--product-detail-subscriptions-frequency-text-color: hsla(0,0%,0%,1);
--list-section-banner-slideshow-card-title-color: hsla(0,0%,0%,1);
--tweak-marquee-block-heading-color-on-background: hsla(0,0%,0%,1);
--tweak-form-block-field-fill-color-a: 1;
--list-section-banner-slideshow-card-button-text-color: hsla(0,0%,100%,1);
--paragraphLinkColor: hsla(0,0%,0%,1);
--form-field-shape-border-top-right-radius: 0px;
--image-block-card-image-title-separation: 6%;
--gradientHeaderNavigationColor: hsla(0,0%,0%,1);
--tweak-heading-small-color-on-background: hsla(0,0%,0%,1);
--tweak-content-link-block-title-color: hsla(0,0%,0%,1);
--list-section-banner-slideshow-card-button-background-color: hsla(0,0%,0%,1);
--product-detail-subscriptions-button-text-color: hsla(0,0%,100%,1);
--headingMediumColor: hsla(0,0%,0%,1);
--list-section-banner-slideshow-card-description-color: hsla(0,0%,0%,1);
--list-section-title-color: hsla(0,0%,0%,1);
--lightAccent-hsl: 46.15,17.81%,85.69%;
--tweak-summary-block-read-more-color-on-background: hsla(0,0%,0%,1);
--tweak-menu-block-title-color: hsla(0,0%,0%,1);
--list-section-simple-description-color: hsla(0,0%,0%,1);
--secondary-button-font-font-family: "Bitter";
--form-field-radio-shape-border-top-left-radius: 5px;
--image-block-overlap-image-title-bg-color: hsla(46.15,17.81%,85.69%,1);
--form-field-survey-shape-border-bottom-right-radius: 5px;
--form-field-checkbox-shape-border-bottom-left-radius: 5px;
--scheduling-block-button-accent-color: hsla(0,0%,0%,1);
--tweak-blog-side-by-side-list-read-more-color: hsla(0,0%,0%,1);
--image-block-card-image-width: 50%;
--secondary-button-font-text-transform: none;
--tweak-video-item-description-color: hsla(41,23%,92%,1);
--image-block-card-image-title-bg-color: hsla(46.15,17.81%,85.69%,0);
--primaryButtonPadding: 1.2em;
--tweak-blog-single-column-list-excerpt-color: hsla(0,0%,0%,1);
--image-block-collage-image-subtitle-color: hsla(0,0%,0%,1);
--tweak-newsletter-block-footnote-color-on-background: hsla(0,0%,0%,1);
--tertiaryButtonTextColor: hsla(0,0%,100%,1);
--tweak-summary-block-secondary-metadata-color: hsla(0,0%,0%,1);
--darkAccent-hsl: 20,41.18%,30%;
--list-section-carousel-arrow-color: hsla(0,0%,100%,1);
--video-preview-badge-background-color: hsla(0,0%,100%,1);
--tweak-video-item-meta-color: hsla(41,23%,92%,1);
--tweak-product-grid-text-below-list-status-color: hsla(41,23%,92%,1);
--tweak-product-basic-item-title-color: hsla(0,0%,0%,1);
--image-block-stack-image-button-bg-color: hsla(0,0%,0%,1);
--tweak-form-block-field-input-color-on-background: hsla(0,0%,0%,1);
--tweak-newsletter-block-background-color: hsla(0,0%,100%,1);
--tweak-form-block-field-fill-color: hsla(0,0%,100%,1);
--tweak-newsletter-block-title-color-on-background: hsla(0,0%,0%,1);
--tweak-form-block-field-input-color: hsla(0,0%,0%,1);
--portfolio-grid-basic-title-color: hsla(0,0%,0%,1);
--course-list-grid-layout-course-item-background-color: hsla(0,0%,100%,1);
--tweak-product-grid-text-below-list-price-color: hsla(0,0%,0%,1);
--tweak-product-list-stroke-color: hsla(0,0%,0%,1);
--tweak-blog-item-meta-color: hsla(0,0%,0%,1);
--tweak-blog-item-author-profile-color: hsla(0,0%,0%,1);
--image-block-stack-image-title-color: hsla(0,0%,0%,1);
--tweak-text-block-background-color: hsla(0,0%,100%,1);
--tweak-social-links-block-background-color: hsla(0,0%,100%,1);
--tweak-newsletter-block-stroke-color: hsla(0,0%,0%,1);
--tweak-menu-block-item-price-color: hsla(0,0%,0%,1);
--shape-block-stroke-color: hsla(0,0%,0%,1);
--tweak-gallery-lightbox-background-color: hsla(46.15,17.81%,85.69%,1);
--headerDropShadowColor: hsla(0,0%,0%,1);
--headingSmallColor: hsla(0,0%,0%,1);
--tweak-form-block-field-accent-color-on-background-a: 1;
--headerBorderColor: hsla(0,0%,0%,1);
--image-block-collage-image-button-bg-color: hsla(0,0%,0%,1);
--headingExtraLargeColor: hsla(0,0%,0%,1);
--primary-button-rounded-border-bottom-left-radius: 0px;
--tweak-newsletter-block-button-background-color: hsla(0,0%,0%,1);
--tweak-blog-masonry-list-meta-color: hsla(0,0%,0%,1);
--safeInverseDarkAccent-hsl: 0,0%,100%;
--list-section-carousel-arrow-background-color: hsla(0,0%,0%,1);
--tweak-summary-block-excerpt-color-on-background: hsla(0,0%,0%,1);
--product-basic-item-discount-chip-text-color: hsla(0,0%,100%,1);
--tweak-form-block-description-color: hsla(0,0%,0%,1);
--tweak-newsletter-block-button-background-color-on-background: hsla(0,0%,0%,1);
--scheduling-block-button-text-color: hsla(0,0%,100%,1);
--form-field-shape-border-bottom-left-radius: 0px;
--tweak-portfolio-item-pagination-icon-color: hsla(0,0%,0%,1);
--product-basic-item-add-ons-title-color: hsla(0,0%,0%,1);
--tweak-line-block-line-color: hsla(0,0%,0%,1);
--list-section-carousel-description-color: hsla(0,0%,0%,1);
--tertiary-button-rounded-border-top-left-radius: 6.4px;
--course-item-nav-active-lesson-text-color: hsla(0,0%,100%,1);
--list-section-simple-button-text-color: hsla(0,0%,100%,1);
--siteTitleColor: hsla(0,0%,0%,1);
--video-grid-basic-meta-color: hsla(41,23%,92%,1);
--text-highlight-color-on-background: hsla(0,0%,0%,1);
--tweak-product-grid-text-below-list-sale-price-color: hsla(41,23%,92%,1);
--tweak-form-block-caption-color-on-background: hsla(0,0%,0%,1);
--portfolio-hover-follow-title-color: hsla(0,0%,0%,1);
--product-block-text-color-on-background: hsla(0,0%,0%,1);
--tertiary-button-rounded-border-bottom-left-radius: 6.4px;
--tweak-newsletter-block-description-color-on-background: hsla(0,0%,0%,1);
--tweak-quote-block-background-color: hsla(0,0%,100%,1);
--tweak-blog-masonry-list-title-color: hsla(0,0%,0%,1);
--tweak-form-block-field-accent-color-hsl: 41,23%,92%;
--list-section-carousel-card-button-text-color: hsla(0,0%,100%,1);
--tweak-blog-masonry-list-read-more-color: hsla(0,0%,0%,1);
--summary-block-limited-availability-label-color: hsla(0,0%,0%,1);
--stack-stroke-color: hsla(0,0%,0%,1);
--tweak-portfolio-item-pagination-meta-color: hsla(0,0%,0%,1);
--course-item-nav-background-color: hsla(0,0%,100%,1);
--tweak-product-list-background-color: hsla(0,0%,100%,1);
--tweak-summary-block-primary-metadata-color: hsla(0,0%,0%,1);
--tweak-form-block-stroke-color: hsla(0,0%,0%,1);
--tweak-blog-item-pagination-title-color: hsla(0,0%,0%,1);
--solidHeaderNavigationColor: hsla(0,0%,0%,1);
--tweak-marquee-block-paragraph-color: hsla(0,0%,0%,1);
--secondary-button-rounded-border-bottom-right-radius: 45px;
--primary-button-rounded-border-top-right-radius: 0px;
--tweak-form-block-field-border-color-a: 1;
--image-block-poster-image-title-bg-color-v2: hsla(46.15,17.81%,85.69%,0);
--tweak-form-block-field-accessory-color-on-background: hsla(0,0%,0%,1);
--tweak-accordion-block-background-color: hsla(0,0%,100%,1);
--tweak-accordion-block-stroke-color: hsla(0,0%,0%,1);
--secondaryButtonBackgroundColor: hsla(0,0%,0%,1);
--course-list-course-item-text-color: hsla(0,0%,0%,1);
--paragraphLargeColor: hsla(0,0%,0%,1);
--tweak-form-block-field-accent-color: hsla(41,23%,92%,1);
--tweak-form-block-survey-title-color: hsla(0,0%,0%,1);
--tweak-blog-basic-grid-list-excerpt-color: hsla(0,0%,0%,1);
--tweak-form-block-title-color-on-background: hsla(0,0%,0%,1);
--image-block-collage-image-button-text-color: hsla(0,0%,100%,1);
--tweak-form-block-button-background-color-on-background: hsla(0,0%,0%,1);
--tweak-summary-block-secondary-metadata-color-on-background: hsla(0,0%,0%,1);
--product-list-filters-drawer-background-color: hsla(0,0%,100%,1);
--tweak-form-block-field-accessory-color: hsla(0,0%,0%,1);
--tweak-product-quick-view-button-color: hsla(0,0%,0%,1);
--course-item-nav-text-color: hsla(0,0%,0%,1);
--image-block-poster-image-button-bg-color: hsla(0,0%,0%,1);
--primary-button-font-font-weight: 400;
--tweak-product-basic-item-price-color: hsla(0,0%,0%,1);
--tweak-form-block-field-border-color-on-background-a: 1;
--safeLightAccent-hsl: 41,23%,92%;
--tweak-form-block-caption-color: hsla(0,0%,0%,1);
--image-block-overlap-image-button-text-color: hsla(0,0%,100%,1);
--image-block-poster-image-overlay-color: hsla(20,41.18%,30%,1);
--tweak-events-item-pagination-icon-color: hsla(0,0%,0%,1);
--tweak-paragraph-small-color-on-background: hsla(0,0%,0%,1);
--secondary-button-font-font-style: normal;
--tweak-product-basic-item-variant-fields-color: hsla(0,0%,0%,1);
--list-section-carousel-card-title-color: hsla(0,0%,0%,1);
--image-block-stack-inline-link-color: hsla(0,0%,0%,1);
--list-section-carousel-card-button-background-color: hsla(0,0%,0%,1);
--secondary-button-padding-y: 2rem;
--image-block-card-image-button-text-color: hsla(0,0%,100%,1);
--primary-button-padding-x: 3rem;
--tweak-portfolio-item-pagination-title-color: hsla(0,0%,0%,1);
--image-block-collage-inline-link-color: hsla(0,0%,0%,1);
--product-detail-subscriptions-title-color: hsla(0,0%,0%,1);
--tweak-summary-block-read-more-color: hsla(0,0%,0%,1);
--safeInverseAccent-hsl: 0,0%,0%;
--primaryButtonTextColor: hsla(0,0%,100%,1);
--secondary-button-rounded-border-bottom-left-radius: 0px;
--form-field-survey-shape-border-top-left-radius: 5px;
--menuOverlayButtonTextColor: hsla(0,0%,100%,1);
--list-section-banner-slideshow-card-color: hsla(0,0%,100%,1);
--tweak-newsletter-block-description-color: hsla(0,0%,0%,1);
--solidHeaderDropShadowColor: hsla(0,0%,0%,1);
--form-field-checkbox-shape-border-top-right-radius: 5px;
--image-block-overlap-image-title-color: hsla(0,0%,0%,1);
--paragraphMediumColor: hsla(0,0%,0%,1);
--tweak-form-block-field-input-color-a: 1;
--tweak-blog-single-column-list-meta-color: hsla(0,0%,0%,1);
--primaryButtonBackgroundColor: hsla(0,0%,0%,1);
--primary-button-font-letter-spacing: 0em;
--secondary-button-padding-x: 3rem;
--course-list-grid-layout-course-item-hover-background-color: hsla(0,0%,100%,.75);
--tweak-text-block-stroke-color: hsla(0,0%,0%,1);
--tertiary-button-rounded-border-bottom-right-radius: 6.4px;
--tweak-product-basic-item-description-color: hsla(0,0%,0%,1);
--image-block-overlay-color: hsla(0,0%,0%,.5);
--image-block-overlap-image-overlay-color: hsla(20,41.18%,30%,1);
--form-field-shape-border-bottom-right-radius: 15px;
--tweak-social-links-block-stroke-color: hsla(0,0%,0%,1);
--tweak-form-block-field-fill-color-on-background-hsl: 46.15,17.81%,85.69%;
--tweak-newsletter-block-button-text-color-on-background: hsla(0,0%,100%,1);
--gradientHeaderBorderColor: hsla(0,0%,0%,1);
--list-section-carousel-title-color: hsla(0,0%,0%,1);
--tweak-blog-single-column-list-read-more-color: hsla(0,0%,0%,1);
--accent-hsl: 41,23%,92%;
--tweak-accordion-block-icon-color: hsla(0,0%,0%,1);
--image-block-stack-image-button-text-color: hsla(0,0%,100%,1);
--gradientHeaderBackgroundColor: hsla(0,0%,100%,1);
--shape-block-dropshadow-color: hsla(0,0%,100%,1);
--secondary-button-font-line-height: 1.2em;
--headingLinkColor: hsla(0,0%,0%,1);
--list-section-carousel-card-description-color: hsla(0,0%,0%,1);
--product-basic-item-restock-notification-color: hsla(0,0%,0%,1);
--list-section-carousel-button-background-color: hsla(0,0%,0%,1);
--tweak-blog-basic-grid-list-title-color: hsla(0,0%,0%,1);
--tweak-product-grid-text-below-list-title-color: hsla(0,0%,0%,1);
--tweak-product-quick-view-lightbox-overlay-color: hsla(0,0%,100%,1);
--tweak-menu-block-nav-color: hsla(0,0%,0%,1);
--tweak-form-block-field-accent-color-on-background: hsla(41,23%,92%,1);
--tweak-paragraph-medium-color-on-background: hsla(0,0%,0%,1);
--image-block-overlap-image-subtitle-color: hsla(0,0%,0%,1);
--tweak-accordion-block-icon-color-on-background: hsla(0,0%,0%,1);
--tweak-menu-block-item-description-color: hsla(0,0%,0%,1);
--tweak-summary-block-title-color: hsla(0,0%,0%,1);
--image-block-stack-image-subtitle-color: hsla(0,0%,0%,1);
--secondaryButtonTextColor: hsla(0,0%,100%,1);
--navigationLinkColor: hsla(0,0%,0%,1);
--announcement-bar-background-color: hsla(41,23%,92%,1);
--tertiaryButtonBackgroundColor: hsla(0,0%,0%,1);
--tweak-form-block-field-input-color-on-background-a: 1;
--list-section-simple-card-color: hsla(0,0%,100%,1);
--tweak-marquee-block-paragraph-color-on-background: hsla(0,0%,0%,1);
--scheduling-block-scheduler-background-color: hsla(46.15,17.81%,85.69%,1);
--tertiary-button-rounded-border-top-right-radius: 6.4px;
--list-section-banner-slideshow-description-color: hsla(0,0%,0%,1);
--video-grid-category-nav-color: hsla(41,23%,92%,1);
--primary-button-stroke: 3px;
--product-detail-subscriptions-description-text-color: hsla(0,0%,0%,1);
--tweak-accordion-block-divider-color-on-background: hsla(0,0%,0%,1);
--list-section-simple-card-description-link-color: hsla(0,0%,0%,1);
--tweak-product-grid-text-below-list-category-nav-color: hsla(0,0%,0%,1);
--image-block-poster-inline-link-color: hsla(0,0%,100%,1);
--product-detail-subscriptions-button-background-color: hsla(0,0%,0%,1);
--shape-block-background-color: hsla(0,0%,100%,1);
--course-item-nav-active-lesson-background-color: hsla(20,41.18%,30%,1);
--scheduling-block-header-text-color: hsla(0,0%,0%,1);
--tweak-quote-block-text-color: hsla(0,0%,0%,1);
--tweak-form-block-field-accent-color-a: 1;
--tweak-form-block-title-color: hsla(0,0%,0%,1);
--image-block-poster-image-button-text-color: hsla(0,0%,100%,1);
--list-section-banner-slideshow-arrow-background-color: hsla(0,0%,0%,1);
--product-list-filter-dropdown-label-color: hsla(0,0%,0%,1);
--primary-button-font-font-family: "Bitter";
--tweak-quote-block-text-color-on-background: hsla(0,0%,0%,1);
--tweak-gallery-icon-background-color: hsla(46.15,17.81%,85.69%,1);
--course-list-grid-layout-chapter-divider-color: hsla(0,0%,0%,1);
--list-section-carousel-card-description-link-color: hsla(0,0%,0%,1);
--tweak-heading-extra-large-color-on-background: hsla(0,0%,0%,1);
--tweak-marquee-block-stroke-color: hsla(0,0%,0%,1);
--social-links-block-main-icon-color: hsla(0,0%,0%,1);
--primary-button-rounded-border-top-left-radius: 45px;
--gradientHeaderDropShadowColor: hsla(0,0%,0%,1);
--tweak-form-block-field-fill-color-on-background: hsla(46.15,17.81%,85.69%,1);
--image-block-collage-image-title-bg-color: hsla(46.15,17.81%,85.69%,0);
--product-detail-one-time-purchase-price-text-color: hsla(0,0%,0%,1);
--image-block-card-image-subtitle-color: hsla(0,0%,0%,1);
--section-divider-stroke-color: hsla(0,0%,0%,1);
--scheduling-block-background-color: hsla(46.15,17.81%,85.69%,1);
--secondary-button-rounded-border-top-left-radius: 45px;
--product-list-filters-drawer-text-color: hsla(0,0%,0%,1);
--tweak-menu-block-item-title-color: hsla(0,0%,0%,1);
--tweak-heading-large-color-on-background: hsla(0,0%,0%,1);
--tweak-marquee-block-background-color: hsla(0,0%,100%,1);
--list-section-carousel-button-text-color: hsla(0,0%,100%,1);
--tweak-blog-side-by-side-list-title-color: hsla(0,0%,0%,1);
--form-field-checkbox-shape-border-bottom-right-radius: 5px;
--product-block-stroke-color: hsla(0,0%,0%,1);
--tweak-form-block-button-text-color-on-background: hsla(0,0%,100%,1);
--paragraphSmallColor: hsla(0,0%,0%,1);
--tweak-product-grid-text-below-list-scarcity-color: hsla(0,0%,0%,1);
--image-block-stack-image-title-bg-color: hsla(46.15,17.81%,85.69%,0);
--secondary-button-stroke: 3px;
--solidHeaderBorderColor: hsla(0,0%,0%,1);
--tweak-form-block-option-color-on-background: hsla(0,0%,0%,1);
--product-basic-item-discount-chip-background-color: hsla(0,0%,0%,1);
--image-block-poster-image-subtitle-color: hsla(0,0%,100%,1);
--form-field-radio-border-thickness: 2px;
--portfolio-grid-overlay-overlay-color: hsla(46.15,17.81%,85.69%,1);
--tweak-blog-alternating-side-by-side-list-title-color: hsla(0,0%,0%,1);
--image-block-card-image-button-bg-color: hsla(0,0%,0%,1);
--section-inset-border-color: hsla(46.15,17.81%,85.69%,1);
--tweak-blog-item-comment-meta-color: hsla(0,0%,0%,1);
--tweak-gallery-lightbox-icon-color: hsla(0,0%,0%,1);
--tweak-form-block-description-color-on-background: hsla(0,0%,0%,1);
--form-field-shape-border-top-left-radius: 15px;
--tweak-form-block-field-border-color-on-background: hsla(0,0%,0%,1);
--tweak-video-item-title-color: hsla(41,23%,92%,1);
--text-highlight-color: hsla(0,0%,0%,1);
--tweak-form-block-field-fill-color-hsl: 0,0%,100%;
--tweak-accordion-block-divider-color: hsla(0,0%,0%,1);
--list-section-banner-slideshow-card-description-link-color: hsla(0,0%,0%,1);
--secondary-button-font-font-size: 1rem;
--tweak-quote-block-source-color-on-background: hsla(0,0%,0%,1);
--announcement-bar-text-color: hsla(0,0%,0%,1);
--image-block-collage-image-overlay-color: hsla(20,41.18%,30%,1);
--primary-button-font-font-size-value: 1;
--tweak-marquee-block-heading-color: hsla(0,0%,0%,1);
--list-section-simple-button-background-color: hsla(0,0%,0%,1);
--image-block-overlap-image-button-bg-color: hsla(0,0%,0%,1);
--primary-button-rounded-border-bottom-right-radius: 45px;
--tweak-form-block-button-background-color: hsla(0,0%,0%,1);
--product-block-background-color: hsla(0,0%,100%,1);
--secondary-button-font-letter-spacing: 0em;
--tweak-blog-basic-grid-list-read-more-color: hsla(0,0%,0%,1);
--image-block-card-image-card-separation: 10%;
--tweak-video-item-pagination-icon-color: hsla(41,23%,92%,1);
--image-block-card-image-overlay-color: hsla(20,41.18%,30%,1);
--donation-block-stroke-color: hsla(0,0%,0%,1);
--tweak-blog-masonry-list-excerpt-color: hsla(0,0%,0%,1);
--list-section-banner-slideshow-button-background-color: hsla(0,0%,0%,1);
--donation-block-background-color: hsla(0,0%,100%,1);
--course-list-grid-layout-course-item-border-color: hsla(41,23%,92%,1);
--tweak-events-item-pagination-title-color: hsla(0,0%,0%,1);
--tweak-quote-block-source-color: hsla(0,0%,0%,1);
--form-field-survey-border-thickness: 2px;
--tweak-product-grid-text-below-list-pagination-color: hsla(0,0%,0%,1);
--secondary-button-rounded-border-top-right-radius: 0px;
--form-field-checkbox-border-thickness: 2px;
--tweak-quote-block-stroke-color: hsla(0,0%,0%,1);
--tweak-blog-side-by-side-list-meta-color: hsla(0,0%,0%,1);
--tweak-product-basic-item-scarcity-color: hsla(41,23%,92%,1);
--tweak-blog-side-by-side-list-excerpt-color: hsla(0,0%,0%,1);
--product-detail-subscription-price-text-color: hsla(0,0%,0%,1);
--primary-button-font-text-transform: none;
--list-section-banner-slideshow-arrow-color: hsla(0,0%,100%,1);
--image-block-stack-image-overlay-color: hsla(20,41.18%,30%,1);
--form-field-border-thickness: 2px;
--tweak-gallery-icon-color: hsla(0,0%,0%,1);
--tweak-form-block-field-fill-color-on-background-a: 1;
--tweak-product-quick-view-lightbox-controls-color: hsla(0,0%,0%,1);
--form-field-radio-shape-border-top-right-radius: 5px;
--tweak-summary-block-title-color-on-background: hsla(0,0%,0%,1);
--menuOverlayNavigationLinkColor: hsla(0,0%,0%,1);
--image-block-card-image-button-separation: 6%;
--tweak-form-block-field-border-color-on-background-hsl: 0,0%,0%;
--tweak-summary-block-header-text-color-on-background: hsla(0,0%,0%,1);
--tweak-blog-alternating-side-by-side-list-read-more-color: hsla(0,0%,0%,1);
--course-list-course-chapter-divider-color: hsla(41,23%,92%,1);
--tweak-form-block-survey-title-color-on-background: hsla(0,0%,0%,1);
--tweak-blog-item-comment-text-color: hsla(0,0%,0%,1);
--tweak-paragraph-link-color-on-background: hsla(0,0%,0%,1);
--image-block-card-image-title-color: hsla(0,0%,0%,1);
--tweak-summary-block-stroke-color: hsla(0,0%,0%,1);
--tweak-form-block-field-border-color-hsl: 0,0%,0%;
--form-field-checkbox-shape-border-top-left-radius: 5px;
--toggle-off-color: hsla(20,41.18%,30%,1);
--tweak-product-list-description-text-color: hsla(0,0%,0%,1);
--image-block-poster-image-title-color: hsla(0,0%,100%,1);
--image-block-overlap-inline-link-color: hsla(0,0%,0%,1);
--image-block-collage-background-color: hsla(0,0%,100%,1);
--tweak-paragraph-large-color-on-background: hsla(0,0%,0%,1);
--tweak-newsletter-block-title-color: hsla(0,0%,0%,1);
--tweak-form-block-option-color: hsla(0,0%,0%,1);
--tweak-form-block-field-input-color-hsl: 0,0%,0%;
--tweak-form-block-field-accent-color-on-background-hsl: 41,23%,92%;
--scheduling-block-scheduler-text-color: hsla(0,0%,0%,1);
--form-field-radio-shape-border-bottom-right-radius: 5px;
--portfolio-grid-overlay-title-color: hsla(0,0%,0%,1);
--tweak-blog-item-pagination-icon-color: hsla(0,0%,0%,1);
--list-section-simple-card-button-text-color: hsla(0,0%,100%,1);
--image-block-collage-image-title-color: hsla(0,0%,0%,1);
--list-section-banner-slideshow-title-color: hsla(0,0%,0%,1);
--portfolio-index-background-title-color: hsla(0,0%,0%,1);
--headingLargeColor: hsla(0,0%,0%,1);
--tweak-form-block-button-text-color: hsla(0,0%,100%,1);
--tweak-summary-block-excerpt-color: hsla(0,0%,0%,1);
```

### Spacing

```css
--course-item-lesson-name-font-letter-spacing: -.02em;
--portfolio-grid-overlay-title-font-font-size-value: 2.2;
--menu-block-item-description-font-letter-spacing: 0em;
--portfolio-item-pagination-font-font-size-value: 2.2;
--portfolio-item-pagination-font-font-size: 2.2rem;
--portfolio-index-background-title-font-letter-spacing: -.02em;
--menu-block-item-title-font-font-size: 1.6rem;
--product-basic-item-restock-notification-full-layout-font-font-size-value: 1;
--form-label-spacing-bottom: 4px;
--site-title-font-letter-spacing: -.02em;
--video-item-meta-font-font-size-value: 1;
--course-item-name-mobile-font-font-size-value: 1.3;
--mobile-site-title-font-letter-spacing: -.02em;
--form-field-checkbox-column-gap: 16px;
--list-section-title-text-font-font-size-value: 2.8;
--video-basic-grid-list-excerpt-font-font-size-value: .9;
--blog-side-by-side-list-excerpt-font-font-size: 1rem;
--product-basic-item-restock-notification-wrap-layout-font-font-size-value: 1;
--blog-basic-grid-list-excerpt-font-font-size: .9rem;
--product-block-price-font-font-size: 1.1rem;
--commerce-mini-cart-image-size: 60px;
--product-grid-text-below-price-font-font-size-value: 1;
--product-basic-item-scarcity-full-layout-font-letter-spacing: 0em;
--blog-single-column-list-excerpt-font-letter-spacing: 0em;
--video-basic-grid-list-category-nav-font-letter-spacing: 0em;
--blog-side-by-side-list-title-font-font-size-value: 2.8;
--course-list-course-item-lesson-excerpt-font-font-size: .875rem;
--form-block-caption-text-font-letter-spacing: 0em;
--product-list-description-font-letter-spacing: 0em;
--form-field-spacing-bottom: 20px;
--video-item-title-font-letter-spacing: -.02em;
--blog-grid-masonry-list-title-font-font-size: 2.2rem;
--product-basic-item-add-ons-title-full-layout-font-font-size-value: 1;
--blog-alternating-side-by-side-list-title-font-letter-spacing: -.02em;
--product-grid-text-below-scarcity-font-letter-spacing: 0em;
--events-item-pagination-font-font-size: 2.2rem;
--product-block-description-font-font-size-value: 1;
--product-basic-item-add-ons-title-half-layout-font-font-size-value: 1;
--newsletter-block-footnote-text-font-font-size-value: .9;
--events-item-pagination-date-font-font-size-value: 1;
--image-block-collage-image-content-padding: 10%;
--product-basic-item-description-half-layout-font-font-size: 1rem;
--product-basic-item-variant-fields-wrap-layout-font-letter-spacing: 0em;
--blog-grid-masonry-list-excerpt-font-font-size: .9rem;
--blog-side-by-side-list-meta-font-letter-spacing: 0em;
--newsletter-block-title-text-font-font-size: 2.2rem;
--content-link-block-title-font-font-size: 1rem;
--product-grid-text-below-price-font-font-size: 1rem;
--product-basic-item-description-font-letter-spacing: 0em;
--form-field-radio-size: 25px;
--newsletter-block-description-text-font-font-size-value: 1;
--product-list-clear-filters-button-text-font-font-size-value: 1;
--portfolio-grid-basic-title-font-font-size-value: 1.6;
--product-list-clear-filters-button-text-font-font-size: 1rem;
--portfolio-hover-follow-title-font-letter-spacing: -.02em;
--course-item-side-nav-chapter-meta-font-font-size-value: .8;
--course-item-side-nav-lesson-meta-font-letter-spacing: 0em;
--header-button-font-font-size: 1rem;
--announcement-bar-font-letter-spacing: 0em;
--menu-block-title-font-letter-spacing: -.02em;
--product-grid-text-below-scarcity-font-font-size: 1rem;
--product-basic-item-price-full-layout-font-font-size-value: 1;
--blog-single-column-list-meta-font-letter-spacing: 0em;
--product-block-description-font-letter-spacing: 0em;
--portfolio-index-background-title-font-font-size-value: 4;
--course-list-course-item-lesson-excerpt-font-font-size-value: .875;
--course-item-side-nav-lesson-meta-font-font-size: .8rem;
--course-list-grid-layout-chapter-name-font-font-size-value: 2;
--newsletter-block-button-text-font-font-size-value: 1;
--newsletter-block-field-text-font-letter-spacing: 0em;
--course-list-chapter-item-chapter-name-font-font-size-value: 2;
--product-basic-item-variant-fields-wrap-layout-font-font-size: .75rem;
--course-list-grid-layout-course-item-meta-font-font-size: .75rem;
--course-item-name-mobile-font-letter-spacing: -.02em;
--product-basic-item-title-font-font-size: 2.8rem;
--product-basic-item-title-half-layout-font-letter-spacing: -.02em;
--product-basic-item-title-full-layout-font-letter-spacing: -.02em;
--course-item-side-nav-chapter-meta-font-font-size: .8rem;
--normal-text-size-value: 1;
--header-button-font-letter-spacing: 0em;
--product-basic-item-price-half-layout-font-font-size: 1rem;
--cookie-banner-disclaimer-font-font-size-value: .8;
--site-navigation-font-font-size: 1rem;
--blog-item-pagination-font-font-size-value: 2.2;
--product-basic-item-add-ons-title-full-layout-font-font-size: 1rem;
--course-list-chapter-item-chapter-meta-font-font-size-value: .75;
--blog-item-pagination-font-font-size: 2.2rem;
--tertiary-button-padding-x: 3rem;
--course-item-side-nav-lesson-name-font-font-size-value: 1;
--form-block-description-text-font-font-size-value: .9;
--quote-block-source-font-font-size-value: 1;
--blog-side-by-side-list-title-font-font-size: 2.8rem;
--form-field-radio-row-gap: 16px;
--form-field-radio-column-gap: 16px;
--product-basic-item-restock-notification-wrap-layout-font-letter-spacing: 0em;
--blog-item-title-font-font-size: 4rem;
--form-block-option-text-font-font-size: .9rem;
--product-block-description-font-font-size: 1rem;
--product-grid-text-below-status-font-font-size: 1rem;
--product-basic-item-title-font-letter-spacing: -.02em;
--course-list-grid-layout-course-item-excerpt-font-font-size-value: .875;
--video-preview-badge-font-letter-spacing: 0em;
--blog-side-by-side-list-meta-font-font-size-value: 1;
--form-block-option-text-font-font-size-value: .9;
--course-list-course-description-font-font-size: 1.4rem;
--video-preview-badge-font-font-size-value: 1;
--course-list-grid-layout-course-item-name-font-letter-spacing: -.02em;
--site-navigation-font-font-size-value: 1;
--form-block-select-dropdown-text-font-font-size-value: 1;
--normal-meta-size-value: 1;
--menu-block-nav-font-letter-spacing: 0em;
--course-list-course-item-lesson-name-font-font-size-value: 1.125;
--product-basic-item-restock-notification-half-layout-font-font-size-value: 1;
--product-basic-item-description-wrap-layout-font-font-size-value: 1;
--course-list-grid-layout-course-item-name-font-font-size: 1.125rem;
--newsletter-block-button-text-font-letter-spacing: 0em;
--portfolio-item-pagination-font-letter-spacing: -.02em;
--blog-basic-grid-list-title-font-font-size: 2.2rem;
--form-block-survey-title-text-font-letter-spacing: 0em;
--course-list-chapter-item-chapter-name-font-letter-spacing: -.02em;
--product-basic-item-price-font-font-size-value: 1.6;
--course-list-course-name-font-letter-spacing: -.02em;
--menu-block-item-title-font-font-size-value: 1.6;
--site-title-font-font-size: 1.5rem;
--heading-1-size-value: 4;
--tertiary-button-font-font-size-value: 1;
--product-basic-item-description-full-layout-font-font-size-value: 1;
--form-block-survey-title-text-font-font-size: 1rem;
--blog-single-column-list-title-font-font-size: 4rem;
--product-basic-item-add-ons-title-font-font-size: 1rem;
--product-basic-item-variant-fields-full-layout-font-font-size: .75rem;
--events-item-pagination-date-font-letter-spacing: 0em;
--product-basic-item-description-wrap-layout-font-font-size: 1rem;
--form-block-caption-text-font-font-size-value: .9;
--product-basic-item-add-ons-title-half-layout-font-letter-spacing: 0em;
--blog-item-meta-font-font-size: 1rem;
--course-list-chapter-item-chapter-meta-font-font-size: .75rem;
--product-basic-item-title-full-layout-font-font-size-value: 4;
--events-item-pagination-font-font-size-value: 2.2;
--heading-4-size: 1.6rem;
--product-basic-item-price-full-layout-font-font-size: 1rem;
--heading-font-letter-spacing: -.02em;
--newsletter-block-description-text-font-font-size: 1rem;
--blog-item-author-profile-font-letter-spacing: 0em;
--product-basic-item-variant-fields-font-letter-spacing: 0em;
--blog-grid-masonry-list-excerpt-font-font-size-value: .9;
--product-grid-text-below-title-font-font-size: 1.6rem;
--blog-grid-masonry-list-title-font-letter-spacing: -.02em;
--list-section-title-text-font-font-size: 2.8rem;
--list-section-title-text-font-letter-spacing: -.02em;
--product-basic-item-scarcity-wrap-layout-font-font-size-value: .85;
--product-block-title-font-font-size: 1.3rem;
--product-basic-item-variant-fields-font-font-size-value: 1;
--blog-item-meta-font-letter-spacing: 0em;
--course-list-course-name-font-font-size: 4rem;
--video-item-title-font-font-size: 2.8rem;
--newsletter-block-footnote-text-font-letter-spacing: 0em;
--course-list-grid-layout-chapter-meta-font-font-size-value: .875;
--product-basic-item-variant-fields-half-layout-font-font-size: .75rem;
--form-field-checkbox-row-gap: 16px;
--product-basic-item-title-wrap-layout-font-font-size: 4rem;
--video-basic-grid-list-category-nav-font-font-size: 1rem;
--product-basic-item-price-wrap-layout-font-font-size-value: 1;
--blog-side-by-side-list-excerpt-font-letter-spacing: 0em;
--product-list-clear-filters-button-text-font-letter-spacing: 0em;
--course-list-course-item-lesson-name-font-letter-spacing: 0em;
--product-basic-item-add-ons-title-font-font-size-value: 1;
--body-font-letter-spacing: 0em;
--blog-grid-masonry-list-meta-font-letter-spacing: 0em;
--menu-block-title-font-font-size-value: 2.2;
--form-block-description-text-font-font-size: .9rem;
--course-item-chapter-name-font-letter-spacing: 0em;
--blog-basic-grid-list-excerpt-font-letter-spacing: 0em;
--blog-single-column-list-title-font-letter-spacing: -.02em;
--product-basic-item-description-font-font-size-value: 1;
--form-block-survey-title-text-font-font-size-value: 1;
--form-block-placeholder-text-font-font-size-value: 1;
--product-basic-item-price-wrap-layout-font-font-size: 1rem;
--product-basic-item-add-ons-title-wrap-layout-font-letter-spacing: 0em;
--blog-side-by-side-list-excerpt-font-font-size-value: 1;
--cookie-banner-disclaimer-font-font-size: .8rem;
--small-text-size: .9rem;
--video-item-title-font-font-size-value: 2.8;
--small-text-size-value: .9;
--content-link-block-title-font-letter-spacing: 0em;
--product-basic-item-description-half-layout-font-letter-spacing: 0em;
--course-list-grid-layout-chapter-meta-font-letter-spacing: 0em;
--course-item-chapter-name-font-font-size: 1rem;
--large-text-size-value: 1.4;
--blog-side-by-side-list-title-font-letter-spacing: -.02em;
--form-block-placeholder-text-font-font-size: 1rem;
--blog-single-column-list-excerpt-font-font-size: 1rem;
--course-list-course-description-font-font-size-value: 1.4;
--product-grid-text-below-price-font-letter-spacing: 0em;
--product-list-description-font-font-size: 1rem;
--product-grid-text-below-status-font-letter-spacing: 0em;
--blog-alternating-side-by-side-list-meta-font-letter-spacing: 0em;
--form-field-padding-horizontal: 20px;
--product-basic-item-restock-notification-half-layout-font-letter-spacing: 0em;
--portfolio-grid-overlay-title-font-letter-spacing: -.02em;
--form-field-padding-vertical: 10px;
--heading-4-size-value: 1.6;
--header-button-font-font-size-value: 1;
--blog-single-column-list-title-font-font-size-value: 4;
--product-basic-item-title-half-layout-font-font-size-value: 4;
--video-item-meta-font-font-size: 1rem;
--newsletter-block-footnote-text-font-font-size: .9rem;
--product-grid-text-below-title-font-font-size-value: 1.6;
--blog-side-by-side-list-meta-font-font-size: 1rem;
--menu-block-title-font-font-size: 2.2rem;
--product-grid-text-below-scarcity-font-font-size-value: 1;
--menu-block-item-price-font-letter-spacing: 0em;
--product-basic-item-description-full-layout-font-letter-spacing: 0em;
--menu-block-item-description-font-font-size: 1rem;
--product-basic-item-scarcity-full-layout-font-font-size-value: .85;
--course-item-name-font-letter-spacing: -.02em;
--video-basic-grid-list-excerpt-font-letter-spacing: 0em;
--newsletter-block-description-text-font-letter-spacing: 0em;
--announcement-bar-font-font-size: .9rem;
--video-item-description-font-letter-spacing: 0em;
--video-basic-grid-list-title-font-font-size-value: 1.6;
--product-block-price-font-font-size-value: 1.1;
--events-item-pagination-font-letter-spacing: -.02em;
--normal-meta-size: 1rem;
--menu-block-nav-font-font-size-value: 1;
--mobile-site-title-font-font-size: 1rem;
--course-list-grid-layout-chapter-name-font-letter-spacing: -.02em;
--course-item-side-nav-chapter-meta-font-letter-spacing: 0em;
--product-basic-item-scarcity-half-layout-font-font-size: .85rem;
--heading-3-size: 2.2rem;
--product-list-description-font-font-size-value: 1;
--newsletter-block-title-text-font-font-size-value: 2.2;
--course-list-grid-layout-course-item-name-font-font-size-value: 1.125;
--announcement-bar-font-font-size-value: .9;
--product-block-price-font-letter-spacing: 0em;
--video-item-description-font-font-size-value: 1;
--blog-grid-masonry-list-excerpt-font-letter-spacing: 0em;
--course-item-side-nav-chapter-name-font-font-size: 1.5rem;
--product-basic-item-title-wrap-layout-font-letter-spacing: -.02em;
--video-item-pagination-font-font-size-value: 2.2;
--blog-alternating-side-by-side-list-title-font-font-size: 2.8rem;
--portfolio-index-background-title-font-font-size: 4rem;
--video-basic-grid-list-title-font-letter-spacing: -.02em;
--portfolio-hover-static-title-font-font-size-value: 4;
--form-block-input-text-font-font-size: 1rem;
--course-list-course-item-lesson-meta-font-font-size: .75rem;
--product-basic-item-variant-fields-full-layout-font-letter-spacing: 0em;
--product-basic-item-scarcity-wrap-layout-font-letter-spacing: 0em;
--course-list-grid-layout-chapter-name-font-font-size: 2rem;
--product-basic-item-price-font-letter-spacing: -.02em;
--large-text-size: 1.4rem;
--product-basic-item-add-ons-title-wrap-layout-font-font-size: 1rem;
--blog-item-title-font-font-size-value: 4;
--course-list-course-item-lesson-excerpt-font-letter-spacing: 0em;
--product-block-title-font-font-size-value: 1.3;
--blog-grid-masonry-list-meta-font-font-size-value: 1;
--product-basic-item-restock-notification-font-font-size-value: 1;
--blog-item-author-profile-font-font-size-value: .9;
--course-item-side-nav-lesson-name-font-font-size: 1rem;
--product-basic-item-title-full-layout-font-font-size: 4rem;
--form-block-description-text-font-letter-spacing: 0em;
--product-basic-item-title-wrap-layout-font-font-size-value: 4;
--product-basic-item-description-half-layout-font-font-size-value: 1;
--product-basic-item-add-ons-title-wrap-layout-font-font-size-value: 1;
--product-basic-item-add-ons-title-half-layout-font-font-size: 1rem;
--blog-alternating-side-by-side-list-meta-font-font-size: 1rem;
--blog-basic-grid-list-title-font-font-size-value: 2.2;
--blog-basic-grid-list-excerpt-font-font-size-value: .9;
--form-field-radio-space-between-icon-and-text: 11px;
--heading-2-size: 2.8rem;
--blog-alternating-side-by-side-list-title-font-font-size-value: 2.8;
--portfolio-hover-static-title-font-font-size: 4rem;
--product-basic-item-price-half-layout-font-font-size-value: 1;
--product-basic-item-price-wrap-layout-font-letter-spacing: 0em;
--product-basic-item-restock-notification-full-layout-font-font-size: 1rem;
--product-basic-item-restock-notification-wrap-layout-font-font-size: 1rem;
--blog-basic-grid-list-meta-font-font-size: 1rem;
--course-item-name-mobile-font-font-size: 1.3rem;
--course-list-grid-layout-course-item-meta-font-letter-spacing: 0em;
--blog-basic-grid-list-title-font-letter-spacing: -.02em;
--blog-item-title-font-letter-spacing: -.02em;
--product-basic-item-restock-notification-font-font-size: 1rem;
--video-item-pagination-font-letter-spacing: -.02em;
--form-field-checkbox-padding-horizontal: 30px;
--blog-alternating-side-by-side-list-excerpt-font-letter-spacing: 0em;
--course-item-lesson-name-font-font-size: 4rem;
--form-block-input-text-font-font-size-value: 1;
--quote-block-source-font-letter-spacing: 0em;
--form-block-placeholder-text-font-letter-spacing: 0em;
--product-basic-item-description-full-layout-font-font-size: 1rem;
--course-list-course-name-font-font-size-value: 4;
--form-field-column-gap: 10px;
--course-item-chapter-name-font-font-size-value: 1;
--video-basic-grid-list-title-font-font-size: 1.6rem;
--course-item-name-font-font-size: 2rem;
--product-basic-item-scarcity-wrap-layout-font-font-size: .85rem;
--product-basic-item-variant-fields-wrap-layout-font-font-size-value: .75;
--menu-block-item-price-font-font-size-value: 1;
--menu-block-nav-font-font-size: 1rem;
--video-basic-grid-list-meta-font-letter-spacing: 0em;
--meta-font-letter-spacing: 0em;
--normal-text-size: 1rem;
--form-field-checkbox-space-between-icon-and-text: 11px;
--blog-alternating-side-by-side-list-excerpt-font-font-size-value: 1;
--form-field-survey-size: 25px;
--course-list-grid-layout-chapter-meta-font-font-size: .875rem;
--product-basic-item-add-ons-title-font-letter-spacing: 0em;
--video-item-description-font-font-size: 1rem;
--video-basic-grid-list-meta-font-font-size: 1rem;
--product-basic-item-price-full-layout-font-letter-spacing: 0em;
--portfolio-hover-follow-title-font-font-size: 4rem;
--portfolio-grid-basic-title-font-font-size: 1.6rem;
--course-item-side-nav-chapter-name-font-font-size-value: 1.5;
--base-font-size: 16px;
--product-basic-item-restock-notification-font-letter-spacing: 0em;
--product-basic-item-variant-fields-full-layout-font-font-size-value: .75;
--blog-alternating-side-by-side-list-excerpt-font-font-size: 1rem;
--tertiary-button-padding-y: 2rem;
--course-list-grid-layout-course-item-meta-font-font-size-value: .75;
--quote-block-text-font-font-size-value: 1.4;
--video-item-pagination-font-font-size: 2.2rem;
--course-item-lesson-name-font-font-size-value: 4;
--course-list-course-description-font-letter-spacing: 0em;
--course-list-grid-layout-course-item-excerpt-font-font-size: .875rem;
--newsletter-block-field-text-font-font-size: 1rem;
--site-title-font-font-size-value: 1.5;
--course-item-name-font-font-size-value: 2;
--portfolio-grid-overlay-title-font-font-size: 2.2rem;
--newsletter-block-title-text-font-letter-spacing: -.02em;
--newsletter-block-field-text-font-font-size-value: 1;
--product-basic-item-variant-fields-half-layout-font-letter-spacing: 0em;
--course-list-grid-layout-course-item-excerpt-font-letter-spacing: 0em;
--product-basic-item-variant-fields-half-layout-font-font-size-value: .75;
--course-list-course-item-lesson-meta-font-letter-spacing: 0em;
--video-basic-grid-list-excerpt-font-font-size: .9rem;
--product-basic-item-variant-fields-font-font-size: 1rem;
--product-basic-item-restock-notification-half-layout-font-font-size: 1rem;
--form-field-radio-padding-horizontal: 30px;
--blog-basic-grid-list-meta-font-letter-spacing: 0em;
--form-caption-spacing-bottom: 2px;
--form-block-select-dropdown-text-font-letter-spacing: 0em;
--product-basic-item-restock-notification-full-layout-font-letter-spacing: 0em;
--menu-block-item-title-font-letter-spacing: -.02em;
--blog-basic-grid-list-meta-font-font-size-value: 1;
--course-item-side-nav-chapter-name-font-letter-spacing: -.02em;
--mobile-site-title-font-font-size-value: 1;
--blog-single-column-list-excerpt-font-font-size-value: 1;
--form-description-spacing-bottom: 4px;
--product-basic-item-title-font-font-size-value: 2.8;
--quote-block-text-font-font-size: 1.4rem;
--form-block-title-text-font-letter-spacing: 0em;
--form-block-title-text-font-font-size-value: 1;
--course-list-chapter-item-chapter-meta-font-letter-spacing: 0em;
--product-grid-text-below-title-font-letter-spacing: -.02em;
--form-block-input-text-font-letter-spacing: 0em;
--heading-3-size-value: 2.2;
--blog-item-author-profile-font-font-size: .9rem;
--portfolio-hover-static-title-font-letter-spacing: -.02em;
--menu-block-item-price-font-font-size: 1rem;
--product-basic-item-price-font-font-size: 1.6rem;
--product-basic-item-description-wrap-layout-font-letter-spacing: 0em;
--product-basic-item-title-half-layout-font-font-size: 4rem;
--product-block-title-font-letter-spacing: 0em;
--quote-block-source-font-font-size: 1rem;
--form-field-checkbox-padding-vertical: 15px;
--product-basic-item-price-half-layout-font-letter-spacing: 0em;
--events-item-pagination-date-font-font-size: 1rem;
--quote-block-text-font-letter-spacing: 0em;
--product-basic-item-scarcity-font-font-size-value: 1;
--commerce-mini-cart-image-placeholder-size: 22px;
--product-basic-item-scarcity-font-letter-spacing: 0em;
--blog-item-meta-font-font-size-value: 1;
--video-preview-badge-font-font-size: 1rem;
--tertiary-button-font-letter-spacing: 0em;
--form-field-checkbox-size: 25px;
--blog-grid-masonry-list-meta-font-font-size: 1rem;
--product-basic-item-description-font-font-size: 1rem;
--form-field-radio-padding-vertical: 15px;
--form-block-caption-text-font-font-size: .9rem;
--form-block-option-text-font-letter-spacing: 0em;
--course-list-chapter-item-chapter-name-font-font-size: 2rem;
--blog-alternating-side-by-side-list-meta-font-font-size-value: 1;
--heading-2-size-value: 2.8;
--course-item-side-nav-lesson-name-font-letter-spacing: 0em;
--portfolio-grid-basic-title-font-letter-spacing: -.02em;
--course-list-course-item-lesson-meta-font-font-size-value: .75;
--blog-single-column-list-meta-font-font-size: 1rem;
--content-link-block-title-font-font-size-value: 1;
--form-block-title-text-font-font-size: 1rem;
--blog-grid-masonry-list-title-font-font-size-value: 2.2;
--course-item-side-nav-lesson-meta-font-font-size-value: .8;
--product-basic-item-scarcity-font-font-size: 1rem;
--product-basic-item-scarcity-full-layout-font-font-size: .85rem;
--video-basic-grid-list-category-nav-font-font-size-value: 1;
--heading-1-size: 4rem;
--form-block-select-dropdown-text-font-font-size: 1rem;
--portfolio-hover-follow-title-font-font-size-value: 4;
--newsletter-block-button-text-font-font-size: 1rem;
--cookie-banner-disclaimer-font-letter-spacing: 0em;
--product-basic-item-scarcity-half-layout-font-letter-spacing: 0em;
--site-navigation-font-letter-spacing: 0em;
--tertiary-button-font-font-size: 1rem;
--blog-single-column-list-meta-font-font-size-value: 1;
--product-basic-item-scarcity-half-layout-font-font-size-value: .85;
--video-item-meta-font-letter-spacing: 0em;
--blog-item-pagination-font-letter-spacing: -.02em;
--product-grid-text-below-status-font-font-size-value: 1;
--course-list-course-item-lesson-name-font-font-size: 1.125rem;
--menu-block-item-description-font-font-size-value: 1;
--form-field-dropdown-icon-size: 18px;
--video-basic-grid-list-meta-font-font-size-value: 1;
--product-basic-item-add-ons-title-full-layout-font-letter-spacing: 0em;
--pagePadding: 4vw;
```

### Typography

```css
--tertiary-button-font-font-style: normal;
--product-basic-item-restock-notification-wrap-layout-font-font-style: normal;
--content-link-block-title-font-font-weight: 400;
--product-basic-item-title-half-layout-font-font-family: "Shrikhand";
--quote-block-text-font-font-family: "Bitter";
--quote-block-text-font-font-weight: 400;
--product-basic-item-add-ons-title-half-layout-font-font-weight: 400;
--product-basic-item-description-font-line-height: 1.5em;
--course-list-grid-layout-chapter-meta-font-font-style: normal;
--product-basic-item-restock-notification-wrap-layout-font-text-transform: none;
--course-list-course-description-font-line-height: 1.5em;
--product-basic-item-scarcity-font-line-height: 1.5em;
--video-basic-grid-list-category-nav-font-font-family: "Bitter";
--product-list-clear-filters-button-text-font-text-transform: none;
--form-block-placeholder-text-font-line-height: 1.5em;
--product-list-description-font-text-transform: none;
--blog-grid-masonry-list-title-font-text-transform: none;
--blog-item-author-profile-font-line-height: 1.5em;
--product-basic-item-variant-fields-wrap-layout-font-font-family: "Bitter";
--product-basic-item-add-ons-title-wrap-layout-font-font-weight: 400;
--video-basic-grid-list-title-font-font-weight: 400;
--blog-item-author-profile-font-font-family: "Bitter";
--product-list-clear-filters-button-text-font-font-family: "Bitter";
--mobile-site-title-font-text-transform: none;
--course-item-side-nav-lesson-meta-font-line-height: 1.5em;
--blog-side-by-side-list-excerpt-font-font-family: "Bitter";
--portfolio-item-pagination-font-font-style: normal;
--product-list-clear-filters-button-text-font-line-height: 1.5em;
--newsletter-block-button-text-font-line-height: 1.5em;
--blog-basic-grid-list-meta-font-font-style: normal;
--product-basic-item-variant-fields-font-line-height: 1.5em;
--newsletter-block-description-text-font-font-family: "Bitter";
--menu-block-title-font-font-style: normal;
--heading-font-font-weight: 400;
--course-list-course-item-lesson-meta-font-font-weight: 400;
--blog-alternating-side-by-side-list-title-font-font-family: "Shrikhand";
--product-basic-item-title-full-layout-font-font-weight: 400;
--events-item-pagination-font-text-transform: none;
--blog-basic-grid-list-excerpt-font-font-style: normal;
--form-block-survey-title-text-font-font-style: normal;
--product-basic-item-add-ons-title-half-layout-font-font-family: "Bitter";
--meta-font-text-transform: none;
--course-list-grid-layout-course-item-meta-font-font-weight: 400;
--course-list-course-item-lesson-meta-font-font-style: normal;
--menu-block-item-description-font-font-style: normal;
--blog-single-column-list-excerpt-font-font-style: normal;
--site-title-font-line-height: 1.2em;
--blog-side-by-side-list-meta-font-font-style: normal;
--product-basic-item-variant-fields-font-font-weight: 400;
--video-basic-grid-list-meta-font-text-transform: none;
--product-basic-item-scarcity-font-font-style: normal;
--course-list-course-name-font-font-family: "Shrikhand";
--product-basic-item-restock-notification-full-layout-font-font-weight: 400;
--course-list-grid-layout-chapter-name-font-font-style: normal;
--product-basic-item-variant-fields-font-font-style: normal;
--blog-basic-grid-list-meta-font-line-height: 1.5em;
--course-item-chapter-name-font-font-weight: 400;
--product-basic-item-description-wrap-layout-font-text-transform: none;
--portfolio-hover-follow-title-font-font-family: "Shrikhand";
--product-basic-item-scarcity-font-text-transform: none;
--tertiary-button-font-line-height: 1.2em;
--product-grid-text-below-price-font-line-height: 1.5em;
--video-item-description-font-font-style: normal;
--blog-single-column-list-meta-font-font-style: normal;
--portfolio-grid-overlay-title-font-text-transform: none;
--blog-basic-grid-list-meta-font-font-weight: 400;
--content-link-block-title-font-font-family: "Bitter";
--quote-block-source-font-font-style: normal;
--product-grid-text-below-status-font-font-weight: 400;
--product-grid-text-below-price-font-font-family: "Bitter";
--form-block-description-text-font-text-transform: none;
--newsletter-block-field-text-font-text-transform: none;
--product-basic-item-restock-notification-half-layout-font-line-height: 1.5em;
--course-item-side-nav-lesson-name-font-font-style: normal;
--menu-block-item-description-font-text-transform: none;
--video-preview-badge-font-font-style: normal;
--course-list-grid-layout-course-item-name-font-font-family: "Shrikhand";
--course-list-grid-layout-course-item-name-font-line-height: 1.2em;
--portfolio-hover-follow-title-font-text-transform: none;
--blog-single-column-list-excerpt-font-text-transform: none;
--form-block-select-dropdown-text-font-font-family: "Bitter";
--newsletter-block-button-text-font-font-weight: 400;
--product-basic-item-add-ons-title-font-line-height: 1.5em;
--course-list-chapter-item-chapter-meta-font-font-weight: 400;
--video-item-description-font-font-family: "Bitter";
--product-basic-item-scarcity-half-layout-font-font-family: "Bitter";
--blog-alternating-side-by-side-list-excerpt-font-font-family: "Bitter";
--product-basic-item-variant-fields-wrap-layout-font-line-height: 1.5em;
--site-title-font-font-style: normal;
--blog-side-by-side-list-meta-font-font-family: "Bitter";
--form-block-select-dropdown-text-font-font-style: normal;
--course-list-grid-layout-course-item-meta-font-line-height: 1.5em;
--cookie-banner-disclaimer-font-line-height: 1.5em;
--blog-grid-masonry-list-meta-font-font-family: "Bitter";
--form-block-description-text-font-font-style: normal;
--blog-alternating-side-by-side-list-meta-font-line-height: 1.5em;
--product-basic-item-add-ons-title-wrap-layout-font-font-family: "Bitter";
--product-basic-item-restock-notification-full-layout-font-text-transform: none;
--course-list-course-description-font-font-family: "Bitter";
--blog-alternating-side-by-side-list-excerpt-font-line-height: 1.5em;
--course-item-name-mobile-font-font-weight: 400;
--blog-item-meta-font-font-style: normal;
--video-basic-grid-list-title-font-line-height: 1.2em;
--form-block-option-text-font-line-height: 1.5em;
--product-basic-item-restock-notification-wrap-layout-font-font-family: "Bitter";
--announcement-bar-font-font-family: "Bitter";
--video-basic-grid-list-meta-font-line-height: 1.5em;
--menu-block-nav-font-font-weight: 400;
--product-basic-item-title-half-layout-font-font-weight: 400;
--product-basic-item-price-full-layout-font-font-family: "Bitter";
--product-basic-item-title-full-layout-font-line-height: 1.2em;
--events-item-pagination-font-font-weight: 400;
--video-basic-grid-list-meta-font-font-family: "Bitter";
--product-basic-item-add-ons-title-font-text-transform: none;
--course-list-course-item-lesson-excerpt-font-line-height: 1.5em;
--video-item-meta-font-font-weight: 400;
--events-item-pagination-date-font-font-family: "Bitter";
--form-block-title-text-font-text-transform: none;
--course-list-grid-layout-chapter-meta-font-line-height: 1.5em;
--blog-single-column-list-title-font-text-transform: none;
--newsletter-block-description-text-font-font-style: normal;
--form-block-option-text-font-font-weight: 400;
--menu-block-item-price-font-font-style: normal;
--blog-alternating-side-by-side-list-meta-font-font-family: "Bitter";
--blog-grid-masonry-list-excerpt-font-line-height: 1.5em;
--product-block-description-font-line-height: 1.5em;
--course-item-side-nav-chapter-meta-font-font-style: normal;
--product-basic-item-title-wrap-layout-font-text-transform: none;
--video-basic-grid-list-excerpt-font-font-weight: 400;
--blog-single-column-list-title-font-font-weight: 400;
--list-section-title-text-font-text-transform: none;
--product-list-description-font-font-family: "Bitter";
--product-grid-text-below-scarcity-font-font-style: normal;
--blog-side-by-side-list-excerpt-font-line-height: 1.5em;
--events-item-pagination-date-font-font-weight: 400;
--video-basic-grid-list-excerpt-font-font-style: normal;
--blog-basic-grid-list-title-font-font-weight: 400;
--meta-font-font-weight: 400;
--course-list-chapter-item-chapter-meta-font-font-style: normal;
--product-basic-item-title-full-layout-font-text-transform: none;
--form-block-placeholder-text-font-text-transform: none;
--blog-basic-grid-list-excerpt-font-text-transform: none;
--portfolio-index-background-title-font-text-transform: none;
--course-list-grid-layout-chapter-meta-font-text-transform: none;
--blog-item-title-font-font-style: normal;
--product-basic-item-title-full-layout-font-font-style: normal;
--portfolio-item-pagination-font-font-family: "Shrikhand";
--mobile-site-title-font-font-family: "Shrikhand";
--product-basic-item-title-half-layout-font-font-style: normal;
--header-button-font-text-transform: none;
--product-basic-item-restock-notification-font-font-style: normal;
--course-item-side-nav-chapter-meta-font-text-transform: none;
--video-item-pagination-font-font-style: normal;
--blog-grid-masonry-list-title-font-font-style: normal;
--course-list-grid-layout-chapter-name-font-font-family: "Shrikhand";
--product-grid-text-below-status-font-text-transform: none;
--course-item-side-nav-chapter-name-font-font-family: "Shrikhand";
--portfolio-grid-overlay-title-font-font-weight: 400;
--product-basic-item-price-full-layout-font-text-transform: none;
--course-list-course-description-font-font-style: normal;
--product-basic-item-price-half-layout-font-font-weight: 400;
--blog-grid-masonry-list-meta-font-text-transform: none;
--course-list-grid-layout-chapter-meta-font-font-family: "Bitter";
--form-block-survey-title-text-font-text-transform: none;
--product-grid-text-below-title-font-font-family: "Shrikhand";
--site-navigation-font-font-weight: 400;
--portfolio-index-background-title-font-font-style: normal;
--blog-side-by-side-list-title-font-font-family: "Shrikhand";
--blog-grid-masonry-list-title-font-line-height: 1.2em;
--product-basic-item-add-ons-title-full-layout-font-font-family: "Bitter";
--video-item-title-font-line-height: 1.2em;
--course-list-course-item-lesson-excerpt-font-font-weight: 400;
--menu-block-item-description-font-font-family: "Bitter";
--product-block-description-font-font-family: "Bitter";
--product-basic-item-scarcity-half-layout-font-line-height: 1.5em;
--form-block-title-text-font-font-family: "Bitter";
--menu-block-item-title-font-font-weight: 400;
--course-list-course-description-font-text-transform: none;
--blog-item-pagination-font-font-style: normal;
--product-list-clear-filters-button-text-font-font-style: normal;
--menu-block-item-title-font-line-height: 1.2em;
--course-list-grid-layout-course-item-excerpt-font-text-transform: none;
--product-basic-item-restock-notification-wrap-layout-font-font-weight: 400;
--video-item-pagination-font-font-weight: 400;
--content-link-block-title-font-line-height: 1.5em;
--video-item-pagination-font-font-family: "Shrikhand";
--blog-single-column-list-title-font-line-height: 1.2em;
--form-block-select-dropdown-text-font-font-weight: 400;
--product-basic-item-variant-fields-half-layout-font-line-height: 1.5em;
--product-list-description-font-font-weight: 400;
--menu-block-title-font-font-weight: 400;
--course-list-course-name-font-font-weight: 400;
--form-block-title-text-font-font-weight: 400;
--product-basic-item-restock-notification-font-line-height: 1.5em;
--menu-block-nav-font-text-transform: none;
--blog-alternating-side-by-side-list-meta-font-font-weight: 400;
--form-block-title-text-font-line-height: 1.5em;
--product-basic-item-price-font-font-family: "Shrikhand";
--product-basic-item-restock-notification-half-layout-font-font-style: normal;
--product-basic-item-restock-notification-full-layout-font-font-style: normal;
--product-basic-item-scarcity-half-layout-font-font-style: normal;
--product-basic-item-title-half-layout-font-line-height: 1.2em;
--course-item-side-nav-lesson-meta-font-font-weight: 400;
--product-basic-item-scarcity-font-font-family: "Bitter";
--form-block-survey-title-text-font-font-weight: 400;
--newsletter-block-field-text-font-font-style: normal;
--course-item-side-nav-lesson-name-font-font-weight: 400;
--blog-alternating-side-by-side-list-title-font-font-weight: 400;
--cookie-banner-disclaimer-font-font-weight: 400;
--portfolio-hover-follow-title-font-font-weight: 400;
--course-item-lesson-name-font-text-transform: none;
--site-navigation-font-font-family: "Bitter";
--product-block-description-font-font-style: normal;
--course-item-side-nav-lesson-name-font-line-height: 1.5em;
--header-button-font-font-weight: 400;
--product-block-title-font-font-family: "Bitter";
--menu-block-item-price-font-font-weight: 400;
--blog-item-pagination-font-line-height: 1.2em;
--blog-side-by-side-list-title-font-line-height: 1.2em;
--course-list-chapter-item-chapter-name-font-font-family: "Shrikhand";
--course-item-chapter-name-font-font-family: "Bitter";
--video-preview-badge-font-font-weight: 400;
--product-basic-item-title-wrap-layout-font-line-height: 1.2em;
--form-block-description-text-font-font-family: "Bitter";
--product-basic-item-description-wrap-layout-font-font-family: "Bitter";
--body-font-font-family: "Bitter";
--course-list-grid-layout-course-item-name-font-font-style: normal;
--body-font-line-height: 1.5em;
--course-list-course-name-font-line-height: 1.2em;
--product-basic-item-price-wrap-layout-font-font-style: normal;
--video-basic-grid-list-excerpt-font-font-family: "Bitter";
--product-block-price-font-font-family: "Bitter";
--product-basic-item-restock-notification-full-layout-font-line-height: 1.5em;
--product-basic-item-restock-notification-font-text-transform: none;
--course-list-grid-layout-chapter-name-font-line-height: 1.2em;
--portfolio-hover-follow-title-font-line-height: 1.2em;
--course-item-name-font-text-transform: none;
--course-list-grid-layout-chapter-name-font-text-transform: none;
--site-title-font-font-weight: 400;
--newsletter-block-button-text-font-font-family: "Bitter";
--quote-block-text-font-text-transform: none;
--course-list-course-item-lesson-meta-font-text-transform: none;
--menu-block-item-title-font-text-transform: none;
--meta-font-line-height: 1.5em;
--site-navigation-font-font-style: normal;
--quote-block-text-font-font-style: normal;
--video-preview-badge-font-text-transform: none;
--product-basic-item-variant-fields-wrap-layout-font-font-style: normal;
--heading-font-font-style: normal;
--product-basic-item-variant-fields-full-layout-font-line-height: 1.5em;
--blog-item-meta-font-font-family: "Bitter";
--course-item-name-font-line-height: 1.2em;
--product-basic-item-description-font-text-transform: none;
--course-list-grid-layout-course-item-meta-font-font-family: "Bitter";
--cookie-banner-disclaimer-font-font-style: normal;
--course-item-side-nav-chapter-name-font-font-style: normal;
--video-item-pagination-font-line-height: 1.2em;
--blog-basic-grid-list-title-font-line-height: 1.2em;
--product-basic-item-description-full-layout-font-font-style: normal;
--list-section-title-text-font-font-weight: 400;
--product-basic-item-price-half-layout-font-font-style: normal;
--product-grid-text-below-status-font-font-style: normal;
--product-basic-item-scarcity-half-layout-font-font-weight: 400;
--announcement-bar-font-text-transform: none;
--course-item-side-nav-lesson-name-font-font-family: "Bitter";
--product-basic-item-add-ons-title-half-layout-font-text-transform: none;
--form-block-input-text-font-font-weight: 400;
--product-list-description-font-line-height: 1.5em;
--blog-grid-masonry-list-excerpt-font-font-style: normal;
--course-item-lesson-name-font-font-family: "Shrikhand";
--portfolio-hover-static-title-font-font-weight: 400;
--blog-basic-grid-list-excerpt-font-font-weight: 400;
--blog-item-title-font-font-family: "Shrikhand";
--heading-font-text-transform: none;
--product-basic-item-description-wrap-layout-font-font-style: normal;
--product-basic-item-description-full-layout-font-line-height: 1.5em;
--tertiary-button-font-font-family: "Bitter";
--form-block-placeholder-text-font-font-family: "Bitter";
--form-block-caption-text-font-font-family: "Bitter";
--video-item-description-font-line-height: 1.5em;
--video-basic-grid-list-meta-font-font-style: normal;
--product-block-price-font-font-style: normal;
--course-item-name-font-font-family: "Shrikhand";
--product-basic-item-scarcity-wrap-layout-font-text-transform: none;
--blog-grid-masonry-list-title-font-font-family: "Shrikhand";
--form-block-caption-text-font-font-style: normal;
--blog-item-title-font-line-height: 1.2em;
--product-basic-item-title-wrap-layout-font-font-weight: 400;
--product-basic-item-scarcity-full-layout-font-line-height: 1.5em;
--course-list-course-item-lesson-excerpt-font-text-transform: none;
--blog-grid-masonry-list-title-font-font-weight: 400;
--portfolio-hover-static-title-font-font-style: normal;
--product-basic-item-title-font-font-style: normal;
--product-basic-item-price-half-layout-font-font-family: "Bitter";
--blog-grid-masonry-list-meta-font-font-style: normal;
--product-block-title-font-font-style: normal;
--content-link-block-title-font-text-transform: none;
--portfolio-grid-basic-title-font-line-height: 1.2em;
--portfolio-hover-static-title-font-font-family: "Shrikhand";
--video-preview-badge-font-line-height: 1.5em;
--blog-grid-masonry-list-excerpt-font-text-transform: none;
--menu-block-title-font-line-height: 1.2em;
--course-list-course-item-lesson-excerpt-font-font-family: "Bitter";
--product-list-description-font-font-style: normal;
--course-item-side-nav-chapter-name-font-font-weight: 400;
--product-grid-text-below-price-font-font-style: normal;
--product-basic-item-variant-fields-half-layout-font-font-weight: 400;
--product-grid-text-below-status-font-line-height: 1.5em;
--blog-basic-grid-list-meta-font-text-transform: none;
--blog-alternating-side-by-side-list-title-font-text-transform: none;
--product-basic-item-add-ons-title-wrap-layout-font-font-style: normal;
--course-list-grid-layout-course-item-name-font-font-weight: 400;
--menu-block-nav-font-font-style: normal;
--product-basic-item-add-ons-title-full-layout-font-font-style: normal;
--site-navigation-font-text-transform: none;
--blog-item-pagination-font-font-family: "Shrikhand";
--form-block-caption-text-font-font-weight: 400;
--course-item-side-nav-chapter-name-font-line-height: 1.2em;
--blog-alternating-side-by-side-list-title-font-line-height: 1.2em;
--site-title-font-font-family: "Shrikhand";
--course-list-grid-layout-course-item-excerpt-font-font-family: "Bitter";
--cookie-banner-disclaimer-font-text-transform: none;
--product-basic-item-title-half-layout-font-text-transform: none;
--newsletter-block-title-text-font-font-style: normal;
--body-font-text-transform: none;
--blog-item-meta-font-line-height: 1.5em;
--newsletter-block-title-text-font-font-weight: 400;
--form-block-input-text-font-font-family: "Bitter";
--video-item-pagination-font-text-transform: none;
--announcement-bar-font-line-height: 1.5em;
--portfolio-grid-basic-title-font-font-style: normal;
--course-item-lesson-name-font-font-style: normal;
--course-list-grid-layout-course-item-excerpt-font-line-height: 1.5em;
--blog-single-column-list-title-font-font-style: normal;
--video-item-title-font-text-transform: none;
--cookie-banner-disclaimer-font-font-family: "Bitter";
--newsletter-block-footnote-text-font-font-weight: 400;
--product-basic-item-variant-fields-half-layout-font-font-style: normal;
--content-link-block-title-font-font-style: normal;
--product-basic-item-restock-notification-half-layout-font-text-transform: none;
--newsletter-block-footnote-text-font-font-family: "Bitter";
--blog-side-by-side-list-title-font-font-style: normal;
--blog-item-author-profile-font-font-weight: 400;
--course-list-grid-layout-chapter-meta-font-font-weight: 400;
--blog-side-by-side-list-title-font-font-weight: 400;
--form-block-survey-title-text-font-font-family: "Bitter";
--course-item-side-nav-chapter-meta-font-font-weight: 400;
--portfolio-grid-overlay-title-font-line-height: 1.2em;
--product-basic-item-price-font-font-style: normal;
--blog-side-by-side-list-excerpt-font-font-weight: 400;
--blog-single-column-list-title-font-font-family: "Shrikhand";
--meta-font-font-style: normal;
--form-block-survey-title-text-font-line-height: 1.5em;
--video-item-description-font-text-transform: none;
--product-basic-item-price-full-layout-font-font-weight: 400;
--portfolio-item-pagination-font-text-transform: none;
--heading-font-line-height: 1.2em;
--product-basic-item-restock-notification-half-layout-font-font-weight: 400;
--product-basic-item-restock-notification-font-font-weight: 400;
--newsletter-block-field-text-font-font-weight: 400;
--menu-block-nav-font-line-height: 1.5em;
--portfolio-index-background-title-font-font-weight: 400;
--course-item-name-mobile-font-line-height: 1.2em;
--product-basic-item-title-font-text-transform: none;
--product-grid-text-below-price-font-text-transform: none;
--video-basic-grid-list-category-nav-font-font-style: normal;
--product-basic-item-add-ons-title-wrap-layout-font-line-height: 1.5em;
--blog-single-column-list-meta-font-font-weight: 400;
--form-block-option-text-font-font-family: "Bitter";
--product-block-title-font-font-weight: 400;
--blog-single-column-list-excerpt-font-font-family: "Bitter";
--product-basic-item-price-wrap-layout-font-text-transform: none;
--product-grid-text-below-title-font-text-transform: none;
--form-block-input-text-font-text-transform: none;
--product-basic-item-add-ons-title-half-layout-font-font-style: normal;
--newsletter-block-title-text-font-line-height: 1.2em;
--product-basic-item-description-half-layout-font-text-transform: none;
--video-item-title-font-font-style: normal;
--blog-grid-masonry-list-meta-font-line-height: 1.5em;
--product-grid-text-below-status-font-font-family: "Bitter";
--product-basic-item-description-full-layout-font-font-family: "Bitter";
--video-item-meta-font-font-family: "Bitter";
--product-basic-item-description-full-layout-font-font-weight: 400;
--portfolio-grid-basic-title-font-font-weight: 400;
--form-block-select-dropdown-text-font-text-transform: none;
--product-basic-item-price-font-font-weight: 400;
--portfolio-index-background-title-font-font-family: "Shrikhand";
--portfolio-grid-basic-title-font-font-family: "Shrikhand";
--blog-item-pagination-font-font-weight: 400;
--events-item-pagination-font-font-style: normal;
--heading-font-font-family: "Shrikhand";
--blog-item-author-profile-font-font-style: normal;
--product-basic-item-description-half-layout-font-font-style: normal;
--video-item-meta-font-text-transform: none;
--menu-block-item-description-font-font-weight: 400;
--form-block-description-text-font-line-height: 1.5em;
--course-list-course-item-lesson-name-font-text-transform: none;
--product-basic-item-scarcity-font-font-weight: 400;
--events-item-pagination-font-font-family: "Shrikhand";
--product-basic-item-variant-fields-wrap-layout-font-text-transform: none;
--course-list-grid-layout-course-item-excerpt-font-font-style: normal;
--product-basic-item-scarcity-wrap-layout-font-font-style: normal;
--portfolio-hover-static-title-font-line-height: 1.2em;
--video-basic-grid-list-category-nav-font-line-height: 1.5em;
--product-basic-item-restock-notification-half-layout-font-font-family: "Bitter";
--form-block-select-dropdown-text-font-line-height: 1.5em;
--quote-block-text-font-line-height: 1.5em;
--blog-single-column-list-meta-font-font-family: "Bitter";
--announcement-bar-font-font-weight: 400;
--newsletter-block-footnote-text-font-line-height: 1.5em;
--newsletter-block-title-text-font-text-transform: none;
--newsletter-block-button-text-font-font-style: normal;
--menu-block-item-price-font-line-height: 1.5em;
--product-basic-item-price-full-layout-font-font-style: normal;
--video-basic-grid-list-title-font-font-family: "Shrikhand";
--product-basic-item-price-wrap-layout-font-font-weight: 400;
--mobile-site-title-font-font-weight: 400;
--product-basic-item-add-ons-title-font-font-weight: 400;
--course-item-lesson-name-font-line-height: 1.2em;
--events-item-pagination-date-font-text-transform: none;
--product-basic-item-description-font-font-style: normal;
--blog-alternating-side-by-side-list-meta-font-font-style: normal;
--blog-item-title-font-font-weight: 400;
--newsletter-block-button-text-font-text-transform: none;
--video-basic-grid-list-excerpt-font-line-height: 1.5em;
--blog-single-column-list-excerpt-font-font-weight: 400;
--blog-single-column-list-meta-font-text-transform: none;
--product-basic-item-description-half-layout-font-font-family: "Bitter";
--quote-block-source-font-font-family: "Bitter";
--blog-item-title-font-text-transform: none;
--blog-side-by-side-list-meta-font-text-transform: none;
--blog-alternating-side-by-side-list-excerpt-font-text-transform: none;
--product-grid-text-below-scarcity-font-line-height: 1.5em;
--blog-grid-masonry-list-meta-font-font-weight: 400;
--product-basic-item-variant-fields-full-layout-font-font-family: "Bitter";
--product-basic-item-scarcity-full-layout-font-font-weight: 400;
--blog-grid-masonry-list-excerpt-font-font-family: "Bitter";
--menu-block-item-title-font-font-family: "Shrikhand";
--product-basic-item-add-ons-title-full-layout-font-text-transform: none;
--blog-item-meta-font-text-transform: none;
--product-basic-item-restock-notification-wrap-layout-font-line-height: 1.5em;
--video-item-meta-font-line-height: 1.5em;
--menu-block-item-price-font-font-family: "Bitter";
--site-title-font-text-transform: none;
--video-basic-grid-list-title-font-font-style: normal;
--course-list-chapter-item-chapter-name-font-text-transform: none;
--product-basic-item-title-full-layout-font-font-family: "Shrikhand";
--video-basic-grid-list-category-nav-font-text-transform: none;
--course-list-grid-layout-course-item-meta-font-font-style: normal;
--course-item-side-nav-chapter-name-font-text-transform: none;
--portfolio-hover-static-title-font-text-transform: none;
--portfolio-grid-overlay-title-font-font-family: "Shrikhand";
--product-basic-item-restock-notification-font-font-family: "Bitter";
--course-list-chapter-item-chapter-name-font-line-height: 1.2em;
--blog-side-by-side-list-meta-font-font-weight: 400;
--course-list-chapter-item-chapter-name-font-font-weight: 400;
--form-block-description-text-font-font-weight: 400;
--course-list-course-item-lesson-name-font-line-height: 1.5em;
--course-list-course-item-lesson-meta-font-line-height: 1.5em;
--product-basic-item-price-full-layout-font-line-height: 1.5em;
--product-list-clear-filters-button-text-font-font-weight: 400;
--video-item-description-font-font-weight: 400;
--video-basic-grid-list-meta-font-font-weight: 400;
--product-basic-item-scarcity-full-layout-font-text-transform: none;
--course-list-course-item-lesson-meta-font-font-family: "Bitter";
--blog-single-column-list-excerpt-font-line-height: 1.5em;
--blog-item-pagination-font-text-transform: none;
--product-basic-item-description-wrap-layout-font-line-height: 1.5em;
--course-item-side-nav-chapter-meta-font-line-height: 1.5em;
--course-item-chapter-name-font-line-height: 1.5em;
--events-item-pagination-date-font-line-height: 1.5em;
--course-list-course-name-font-text-transform: none;
--blog-single-column-list-meta-font-line-height: 1.5em;
--header-button-font-font-family: "Bitter";
--product-grid-text-below-title-font-font-style: normal;
--product-basic-item-variant-fields-half-layout-font-text-transform: none;
--product-basic-item-title-font-font-family: "Shrikhand";
--announcement-bar-font-font-style: normal;
--product-block-title-font-text-transform: none;
--blog-alternating-side-by-side-list-excerpt-font-font-style: normal;
--newsletter-block-field-text-font-line-height: 1.5em;
--portfolio-item-pagination-font-font-weight: 400;
--video-item-title-font-font-weight: 400;
--product-grid-text-below-title-font-font-weight: 400;
--product-basic-item-description-half-layout-font-line-height: 1.5em;
--course-item-name-font-font-weight: 400;
--events-item-pagination-date-font-font-style: normal;
--product-basic-item-price-font-line-height: 1.2em;
--tertiary-button-font-text-transform: none;
--events-item-pagination-font-line-height: 1.2em;
--product-grid-text-below-title-font-line-height: 1.2em;
--product-basic-item-variant-fields-font-font-family: "Bitter";
--blog-basic-grid-list-meta-font-font-family: "Bitter";
--form-block-option-text-font-font-style: normal;
--list-section-title-text-font-font-style: normal;
--product-basic-item-variant-fields-wrap-layout-font-font-weight: 400;
--course-list-course-item-lesson-excerpt-font-font-style: normal;
--menu-block-item-description-font-line-height: 1.5em;
--form-block-input-text-font-line-height: 1.5em;
--newsletter-block-title-text-font-font-family: "Shrikhand";
--newsletter-block-description-text-font-font-weight: 400;
--product-basic-item-restock-notification-full-layout-font-font-family: "Bitter";
--product-basic-item-title-wrap-layout-font-font-family: "Shrikhand";
--quote-block-source-font-line-height: 1.5em;
--product-grid-text-below-price-font-font-weight: 400;
--list-section-title-text-font-font-family: "Shrikhand";
--product-basic-item-description-font-font-family: "Bitter";
--product-basic-item-description-font-font-weight: 400;
--blog-side-by-side-list-meta-font-line-height: 1.5em;
--product-basic-item-price-half-layout-font-line-height: 1.5em;
--product-block-price-font-line-height: 1.5em;
--product-basic-item-scarcity-full-layout-font-font-family: "Bitter";
--product-basic-item-scarcity-wrap-layout-font-line-height: 1.5em;
--blog-basic-grid-list-title-font-font-style: normal;
--course-item-name-font-font-style: normal;
--video-basic-grid-list-excerpt-font-text-transform: none;
--blog-side-by-side-list-excerpt-font-text-transform: none;
--course-list-chapter-item-chapter-meta-font-font-family: "Bitter";
--video-basic-grid-list-category-nav-font-font-weight: 400;
--product-basic-item-price-half-layout-font-text-transform: none;
--form-block-placeholder-text-font-font-style: normal;
--course-list-course-item-lesson-name-font-font-style: normal;
--list-section-title-text-font-line-height: 1.2em;
--product-block-description-font-text-transform: none;
--menu-block-item-price-font-text-transform: none;
--product-basic-item-price-font-text-transform: none;
--form-block-caption-text-font-line-height: 1.5em;
--product-basic-item-variant-fields-full-layout-font-font-style: normal;
--product-basic-item-add-ons-title-wrap-layout-font-text-transform: none;
--product-grid-text-below-scarcity-font-text-transform: none;
--menu-block-title-font-text-transform: none;
--product-basic-item-price-wrap-layout-font-line-height: 1.5em;
--product-basic-item-description-wrap-layout-font-font-weight: 400;
--portfolio-grid-basic-title-font-text-transform: none;
--course-item-side-nav-chapter-meta-font-font-family: "Bitter";
--meta-font-font-family: "Bitter";
--mobile-site-title-font-line-height: 1.2em;
--portfolio-item-pagination-font-line-height: 1.2em;
--product-basic-item-add-ons-title-full-layout-font-line-height: 1.5em;
--newsletter-block-description-text-font-text-transform: none;
--product-basic-item-scarcity-half-layout-font-text-transform: none;
--blog-alternating-side-by-side-list-title-font-font-style: normal;
--form-block-caption-text-font-text-transform: none;
--video-preview-badge-font-font-family: "Bitter";
--course-item-side-nav-lesson-meta-font-font-family: "Bitter";
--product-basic-item-scarcity-wrap-layout-font-font-family: "Bitter";
--course-list-course-description-font-font-weight: 400;
--product-basic-item-description-full-layout-font-text-transform: none;
--form-block-placeholder-text-font-font-weight: 400;
--quote-block-source-font-font-weight: 400;
--product-block-title-font-line-height: 1.5em;
--course-list-grid-layout-chapter-name-font-font-weight: 400;
--video-item-title-font-font-family: "Shrikhand";
--blog-basic-grid-list-title-font-font-family: "Shrikhand";
--course-item-side-nav-lesson-name-font-text-transform: none;
--course-list-grid-layout-course-item-excerpt-font-font-weight: 400;
--product-basic-item-title-wrap-layout-font-font-style: normal;
--course-list-chapter-item-chapter-name-font-font-style: normal;
--blog-side-by-side-list-title-font-text-transform: none;
--newsletter-block-footnote-text-font-text-transform: none;
--product-block-description-font-font-weight: 400;
--product-basic-item-add-ons-title-full-layout-font-font-weight: 400;
--product-basic-item-variant-fields-font-text-transform: none;
--newsletter-block-field-text-font-font-family: "Bitter";
--course-item-name-mobile-font-font-family: "Shrikhand";
--course-list-chapter-item-chapter-meta-font-line-height: 1.5em;
--video-item-meta-font-font-style: normal;
--menu-block-item-title-font-font-style: normal;
--form-block-title-text-font-font-style: normal;
--product-basic-item-scarcity-wrap-layout-font-font-weight: 400;
--course-list-course-name-font-font-style: normal;
--menu-block-nav-font-font-family: "Bitter";
--blog-basic-grid-list-excerpt-font-font-family: "Bitter";
--product-basic-item-scarcity-full-layout-font-font-style: normal;
--product-basic-item-price-wrap-layout-font-font-family: "Bitter";
--course-list-grid-layout-course-item-name-font-text-transform: none;
--course-list-course-item-lesson-name-font-font-weight: 400;
--header-button-font-line-height: 1.2em;
--newsletter-block-description-text-font-line-height: 1.5em;
--course-item-side-nav-lesson-meta-font-text-transform: none;
--newsletter-block-footnote-text-font-font-style: normal;
--product-basic-item-add-ons-title-font-font-style: normal;
--course-list-chapter-item-chapter-meta-font-text-transform: none;
--video-basic-grid-list-title-font-text-transform: none;
--blog-basic-grid-list-excerpt-font-line-height: 1.5em;
--course-item-name-mobile-font-text-transform: none;
--product-block-price-font-text-transform: none;
--portfolio-hover-follow-title-font-font-style: normal;
--course-item-name-mobile-font-font-style: normal;
--menu-block-title-font-font-family: "Shrikhand";
--course-item-lesson-name-font-font-weight: 400;
--course-item-chapter-name-font-text-transform: none;
--blog-side-by-side-list-excerpt-font-font-style: normal;
--course-item-side-nav-lesson-meta-font-font-style: normal;
--mobile-site-title-font-font-style: normal;
--site-navigation-font-line-height: 1.5em;
--product-basic-item-variant-fields-full-layout-font-font-weight: 400;
--product-basic-item-add-ons-title-font-font-family: "Bitter";
--product-basic-item-title-font-line-height: 1.2em;
--blog-alternating-side-by-side-list-excerpt-font-font-weight: 400;
--body-font-font-weight: 400;
--form-block-option-text-font-text-transform: none;
--course-list-grid-layout-course-item-meta-font-text-transform: none;
--quote-block-source-font-text-transform: none;
--product-basic-item-description-half-layout-font-font-weight: 400;
--portfolio-index-background-title-font-line-height: 1.2em;
--body-font-font-style: normal;
--product-basic-item-title-font-font-weight: 400;
--blog-item-author-profile-font-text-transform: none;
--course-list-course-item-lesson-name-font-font-family: "Bitter";
--product-basic-item-variant-fields-half-layout-font-font-family: "Bitter";
--form-block-input-text-font-font-style: normal;
--product-grid-text-below-scarcity-font-font-weight: 400;
--blog-item-meta-font-font-weight: 400;
--product-grid-text-below-scarcity-font-font-family: "Bitter";
--course-item-chapter-name-font-font-style: normal;
--blog-basic-grid-list-title-font-text-transform: none;
--portfolio-grid-overlay-title-font-font-style: normal;
--product-basic-item-variant-fields-full-layout-font-text-transform: none;
--header-button-font-font-style: normal;
--blog-alternating-side-by-side-list-meta-font-text-transform: none;
--product-block-price-font-font-weight: 400;
--blog-grid-masonry-list-excerpt-font-font-weight: 400;
--product-basic-item-add-ons-title-half-layout-font-line-height: 1.5em;
--tertiary-button-font-font-weight: 400;
```

### Other

```css
--form-field-dropdown-icon-thickness: 1px;
--image-block-stack-image-button-separation: 4%;
--previous-section-divider-offset: 0px;
--m-scale-y: 1;
--tertiary-button-stroke: 3px;
--m-scale-x: 1;
--m-offset-x: 0px;
--m-rotation-x: 0deg;
--image-block-overlap-image-content-offset: 35%;
--m-0-offset-x: 0px;
--m-scale-z: 1;
--image-block-stack-image-title-separation: 4%;
--m-stable-rotation-y: 0deg;
--tweak-global-animations-animation-delay: .1s;
--white-hsl: 0,0%,100%;
--m-stable-offset-y: 0px;
--m-rotation-z: 0deg;
--m-0-scale-x: 1;
--m-0-scale-y: 1;
--m-stable-scale-y: 1;
--m-stable-offset-z: 0px;
--image-block-overlap-image-button-separation: 5%;
--m-stable-opacity: 1;
--m-opacity: 1;
--m-0-rotation-y: 0deg;
--tweak-global-animations-animation-duration: .1s;
--image-block-collage-image-width: 70%;
--image-block-collage-image-content-width: 40%;
--image-block-poster-image-content-width: 70%;
--m-rotation-y: 0deg;
--m-stable-rotation-x: 0deg;
--image-block-stack-image-content-separation: 7%;
--m-offset-z: 0px;
--image-block-overlap-image-width: 75%;
--m-0-skew-x: 0deg;
--m-skew-x: 0deg;
--course-list-course-item-hover-background: hsla(0,0%,100%,.75);
--m-0-scale-z: 1;
--m-0-rotation-z: 0deg;
--m-stable-skew-y: 0deg;
--m-stable-offset-x: 0px;
--course-list-course-item-background: hsla(0,0%,100%,1);
--m-0-offset-z: 0px;
--black-hsl: 0,0%,0%;
--m-0-opacity: 1;
--m-stable-scale-z: 1;
--image-block-collage-image-button-separation: 5%;
--m-0-offset-y: 0px;
--m-skew-y: 0deg;
--m-stable-rotation-z: 0deg;
--m-0-skew-y: 0deg;
--image-block-collage-image-content-offset: 5%;
--m-offset-y: 0px;
--m-0-rotation-x: 0deg;
--image-block-poster-image-title-separation: 5%;
--m-stable-scale-x: 1;
--image-block-overlap-image-title-separation: 3%;
--m-stable-skew-x: 0deg;
--image-block-poster-image-button-separation: 6%;
--image-block-collage-image-title-separation: 4%;
--maxPageWidth: 2000px;
```

### Semantic

```css
success: [object Object];
warning: [object Object];
error: [object Object];
info: [object Object];
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| 230px | 230px | max-width |
| 240px | 240px | min-width |
| 400px | 400px | max-width |
| sm | 430px | max-width |
| sm | 432px | max-width |
| sm | 433px | min-width |
| 575px | 575px | max-width |
| sm | 576px | min-width |
| sm | 600px | max-width |
| sm | 640px | max-width |
| md | 767px | max-width |
| md | 768px | max-width |
| md | 769px | min-width |
| md | 800px | max-width |
| 880px | 880px | max-width |
| lg | 991px | max-width |
| lg | 992px | min-width |
| lg | 1024px | max-width |
| lg | 1025px | min-width |
| 1099px | 1099px | max-width |
| 1199px | 1199px | max-width |
| xl | 1280px | max-width |
| xl | 1281px | min-width |

## Transitions & Animations

**Easing functions:** `[object Object]`, `[object Object]`, `[object Object]`, `[object Object]`, `[object Object]`, `[object Object]`, `[object Object]`

**Durations:** `0.3s`, `0.14s`, `0.1s`, `0.4s`, `0.25s`, `0.6s`, `0.15s`, `0.075s`, `0.2s`, `0.5s`, `1s`, `0.17s`, `0.35s`

### Common Transitions

```css
transition: all;
transition: background 0.3s ease-in-out, padding 0.14s ease-in-out, transform 0.14s ease-in-out 0.14s;
transition: opacity 0.1s linear;
transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
transition: transform 0.25s cubic-bezier(0.2, 0.6, 0.3, 1), width 0.25s cubic-bezier(0.2, 0.6, 0.3, 1);
transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
transition: visibility 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
transition: background-color 0.15s cubic-bezier(0.33, 1, 0.68, 1), transform 0.15s cubic-bezier(0.33, 1, 0.68, 1);
transition: transform 0.15s cubic-bezier(0.33, 1, 0.68, 1);
```

### Keyframe Animations

**loading-indicator-rotate-spinner**
```css
@keyframes loading-indicator-rotate-spinner {
  100% { transform: rotate(360deg); }
}
```

**loading-indicator-dash**
```css
@keyframes loading-indicator-dash {
  0% { stroke-dasharray: 1, 200;
    stroke-dashoffset: 0; }
  50% { stroke-dasharray: 89, 200;
    stroke-dashoffset: -35; }
  100% { stroke-dasharray: 89, 200;
    stroke-dashoffset: -124; }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (238 instances)

```css
.button {
  background-color: rgb(0, 0, 0);
  color: rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
  padding-top: 1.6px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Cards (14 instances)

```css
.card {
  background-color: rgb(225, 222, 212);
  border-radius: 0px;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Inputs (63 instances)

```css
.input {
  background-color: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  border-color: rgba(0, 0, 0, 0.25);
  border-radius: 0px;
  font-size: 15px;
  padding-top: 3.75px;
  padding-right: 7.5px;
}
```

### Links (1077 instances)

```css
.link {
  color: rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
}
```

### Navigation (2472 instances)

```css
.navigatio {
  background-color: rgb(225, 222, 212);
  color: rgb(0, 0, 0);
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  position: static;
}
```

### Footer (13 instances)

```css
.foote {
  color: rgb(0, 0, 0);
  padding-top: 0px;
  padding-bottom: 0px;
  font-size: 16px;
}
```

### Modals (80 instances)

```css
.modal {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Dropdowns (942 instances)

```css
.dropdown {
  background-color: rgb(225, 222, 212);
  border-radius: 0px;
  border-color: rgb(0, 0, 0);
  padding-top: 0px;
}
```

### Tables (7 instances)

```css
.table {
  border-color: rgb(51, 51, 51);
  cell-style: [object Object];
}
```

### Badges (29 instances)

```css
.badge {
  color: rgb(51, 51, 51);
  font-size: 15px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Tabs (2 instances)

```css
.tab {
  background-color: rgba(0, 0, 0, 0.12);
  color: rgb(0, 0, 0);
  font-size: 15px;
  font-weight: 700;
  padding-top: 9px;
  padding-right: 15px;
  border-color: rgb(0, 0, 0);
  border-radius: 0px;
}
```

### Accordions (155 instances)

```css
.accordion {
  background-color: rgb(0, 0, 0);
  color: rgb(0, 0, 0);
  font-size: 16px;
  padding-top: 0px;
  padding-right: 0px;
  border-color: rgb(0, 0, 0);
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgb(225, 222, 212);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

### Button — 6 instances, 2 variants

**Variant 1** (4 instances)

```css
  background: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  padding: 32px 48px 32px 48px;
  border-radius: 300px;
  border: 3px solid rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

**Variant 2** (2 instances)

```css
  background: rgba(0, 0, 0, 0.12);
  color: rgb(255, 255, 255);
  padding: 10px 10px 10px 10px;
  border-radius: 0px;
  border: 0px none rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 400;
```

### Button — 4 instances, 2 variants

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 1.6px 0px 1.6px 0px;
  border-radius: 0px;
  border: 0px none rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

**Variant 2** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 32px 48px 32px 48px;
  border-radius: 300px;
  border: 3px solid rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

### Input — 7 instances, 2 variants

**Variant 1** (5 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 10px 20px 10px 20px;
  border-radius: 25.84px;
  border: 2px solid rgba(0, 0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

**Variant 2** (2 instances)

```css
  background: rgb(250, 250, 250);
  color: rgb(0, 0, 0);
  padding: 10px 10px 10px 10px;
  border-radius: 25.84px;
  border: 1px solid rgb(169, 169, 169);
  font-size: 16px;
  font-weight: 400;
```

### Input — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 10px 20px 10px 20px;
  border-radius: 25.84px;
  border: 2px solid rgba(0, 0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

### Button — 2 instances, 1 variant

**Variant 1** (2 instances)

```css
  background: rgb(0, 153, 221);
  color: rgb(255, 255, 255);
  padding: 8.5px 22.5px 8.5px 22.5px;
  border-radius: 0px;
  border: 0px none rgb(255, 255, 255);
  font-size: 15px;
  font-weight: 700;
```

## Layout System

**48 grid containers** and **1829 flex containers** detected.

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 100% | 0px |
| 2000px | 51.2px |
| 300px | 0px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 26-column | 36x |
| 2-column | 8x |
| 1-column | 2x |
| 3-column | 2x |

### Grid Templates

```css
grid-template-columns: 40.1875px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 40.1875px;
gap: 11px;
grid-template-columns: 40.1875px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 40.1875px;
gap: 11px;
grid-template-columns: 40.1875px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 40.1875px;
gap: 11px;
grid-template-columns: 40.1875px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 40.1875px;
gap: 11px;
grid-template-columns: 40.1875px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 38.5156px 40.1875px;
gap: 11px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| column/nowrap | 294x |
| row/nowrap | 1478x |
| row/wrap | 56x |
| column/wrap | 1x |

**Gap values:** `0px 10px`, `11px`, `14px normal`, `15px`, `16px`, `22.5px 7.5px`, `7.5px`, `normal 11px`, `normal 7.65608px`, `normal 7px`, `normal 8.50675px`

## Responsive Design

### Viewport Snapshots

| Viewport | Body Font | Nav Visible | Max Columns | Hamburger | Page Height |
|----------|-----------|-------------|-------------|-----------|-------------|
| mobile (375px) | 16px | Yes | 10 | No | 8597px |
| tablet (768px) | 16px | Yes | 26 | No | 10460px |
| desktop (1280px) | 16px | Yes | 26 | No | 7634px |
| wide (1920px) | 16px | Yes | 26 | No | 9770px |

### Breakpoint Changes

**375px → 768px** (mobile → tablet):
- H1 size: `45.232px` → `43.648px`
- Max grid columns: `10` → `26`
- Page height: `8597px` → `10460px`

**768px → 1280px** (tablet → desktop):
- H1 size: `43.648px` → `62.08px`
- Page height: `10460px` → `7634px`

**1280px → 1920px** (desktop → wide):
- H1 size: `62.08px` → `85.12px`
- Page height: `7634px` → `9770px`

## Interaction States

### Button States

**""**
```css
/* Focus */
outline: rgb(255, 255, 255) none 3px → rgb(255, 255, 255) solid 2px;
```

**"Membership"**
```css
/* Focus */
outline: rgb(0, 0, 0) none 3px → rgb(0, 0, 0) solid 2px;
```

**"Directory"**
```css
/* Focus */
outline: rgb(0, 0, 0) none 3px → rgb(0, 0, 0) solid 2px;
```

### Link Hover

```css
outline: rgb(255, 255, 255) none 3px → rgb(255, 255, 255) none 0px;
```

### Input Focus

```css
outline: rgb(0, 0, 0) none 3px → rgba(0, 0, 0, 0) solid 2px;
```

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 79 passing, 0 failing color pairs

### Passing Color Pairs

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `#ffffff` | `#000000` | 21:1 | AAA |
| `#ffffff` | `#0099dd` | 3.18:1 | AA |
| `#333333` | `#e8eaed` | 10.48:1 | AAA |
| `#000000` | `#ffffff` | 21:1 | AAA |

## Design System Score

**Overall: 78/100 (Grade: C)**

| Category | Score |
|----------|-------|
| Color Discipline | 92/100 |
| Typography Consistency | 40/100 |
| Spacing System | 85/100 |
| Shadow Consistency | 90/100 |
| Border Radius Consistency | 90/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 100/100 |

**Strengths:** Tight, disciplined color palette, Well-defined spacing scale, Clean elevation system, Consistent border radii, Strong accessibility compliance, Good CSS variable tokenization

**Issues:**
- 6 font families — consider limiting to 2 (heading + body)
- 23 distinct font sizes — consider a tighter type scale
- 1557 !important rules — prefer specificity over overrides
- 81% of CSS is unused — consider purging
- 70449 duplicate CSS declarations

## Gradients

**2 unique gradients** detected.

| Type | Direction | Stops | Classification |
|------|-----------|-------|----------------|
| linear | — | 2 | brand |
| linear | — | 2 | brand |

```css
background: linear-gradient(rgb(0, 0, 0), rgb(0, 0, 0));
background: linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(30, 30, 30, 0.3) 100%);
```

## Z-Index Map

**54 unique z-index values** across 4 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 10000,1000002 | div.y.u.i.3.-.w.i.d.g.e.t. .s.q.s.-.w.i.d.g.e.t. .s.q.s.-.a.n.n.o.u.n.c.e.m.e.n.t.-.b.a.r, div.y.u.i.3.-.w.i.d.g.e.t. .s.q.s.-.w.i.d.g.e.t. .s.q.s.-.a.n.n.o.u.n.c.e.m.e.n.t.-.b.a.r, div.y.u.i.3.-.w.i.d.g.e.t. .s.q.s.-.w.i.d.g.e.t. .s.q.s.-.a.n.n.o.u.n.c.e.m.e.n.t.-.b.a.r |
| dropdown | 100,999 | div.f.l.o.a.t.i.n.g.-.c.a.r.t. .h.i.d.d.e.n, div.f.l.o.a.t.i.n.g.-.c.a.r.t. .h.i.d.d.e.n, div.f.l.o.a.t.i.n.g.-.c.a.r.t. .h.i.d.d.e.n |
| sticky | 10,97 | header.w.h.i.t.e. .h.e.a.d.e.r. .t.h.e.m.e.-.c.o.l.-.-.p.r.i.m.a.r.y, div.h.e.a.d.e.r.-.n.a.v.-.f.o.l.d.e.r.-.c.o.n.t.e.n.t, div.h.e.a.d.e.r.-.n.a.v.-.f.o.l.d.e.r.-.c.o.n.t.e.n.t |
| base | -97,9 | div, div, div |

**Issues:**
- [object Object]

## SVG Icons

**10 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| sm | 2 |
| md | 4 |
| xl | 4 |

**Icon colors:** `rgb(0, 0, 0)`, `currentColor`, `rgba(0, 0, 0, 0)`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Bitter | google-fonts | 400, 700 | italic, normal |
| Shrikhand | google-fonts | 400 | normal |

**Google Fonts URL:** `https://fonts.googleapis.com/css2?family=Shrikhand:ital,wght@0,400&family=Bitter:ital,wght@0,400;0,700;1,400;1,700`

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| thumbnail | 96 | objectFit: cover, borderRadius: 0px, shape: square |
| general | 8 | objectFit: cover, borderRadius: 0px, shape: square |
| hero | 1 | objectFit: cover, borderRadius: 0px, shape: square |

**Aspect ratios:** 1:1 (71x), 4:3 (13x), 2:3 (8x), 16:9 (3x), 3:4 (3x), 3:2 (2x), 4.72:1 (1x), 2.67:1 (1x)

## Motion Language

**Feel:** mixed · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `instant` | `75ms` | 75 |
| `xs` | `100ms` | 100 |
| `sm` | `170ms` | 170 |
| `md` | `300ms` | 300 |
| `lg` | `500ms` | 500 |
| `xl` | `1s` | 1000 |

### Easing Families

- **ease-in-out** (142 uses) — `ease`
- **linear** (73 uses) — `linear`
- **custom** (364 uses) — `cubic-bezier(0.4, 0, 0.2, 1)`
- **ease-out** (105 uses) — `cubic-bezier(0.2, 0.6, 0.3, 1)`, `cubic-bezier(0.33, 1, 0.68, 1)`, `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- **ease-in** (3 uses) — `cubic-bezier(0.61, 1, 0.88, 1)`

## Component Anatomy

### button — 17 instances

**Slots:** label, icon
**Variants:** primary · link · secondary
**Sizes:** large · medium

| variant | count | sample label |
|---|---|---|
| default | 11 | Membership |
| primary | 4 | Check out our sister companies Grantlant |
| link | 1 | Skip to Content |
| secondary | 1 | Submit |

### input — 8 instances


## Brand Voice

**Tone:** friendly · **Pronoun:** you-only · **Headings:** Title Case (balanced)

### Top CTA Verbs

- **join** (3)
- **submit** (3)
- **business** (2)
- **contact** (1)
- **skip** (1)
- **membership** (1)
- **directory** (1)
- **resources** (1)

### Button Copy Patterns

- "join our facebook community" (3×)
- "submit" (3×)
- "business directory" (2×)
- "check out our sister companies grantlanta lawn (atl landscaping) and peace of mind recycling (atl recycling home pickup service)

skip to content
contact
member" (1×)
- "skip to content" (1×)
- "membership" (1×)
- "directory" (1×)
- "resources" (1×)
- "search" (1×)
- "more" (1×)

### Sample Headings

> Atlanta’s Community for Finding Trusted Local Businesses
> Welcome to The Southern Shmooze
> Let’s Plan Something Awesome
> Businesses You Can Trust
> Atlanta’s Community for Finding Trusted Local Businesses
> Welcome to The Southern Shmooze
> Let’s Plan Something Awesome
> Businesses You Can Trust
> Check out The Shmooze on the news!
> Check out our newsletter & podcast!

## Page Intent

**Type:** `landing` (confidence 0.31)
**Description:** Discover trusted local small businesses in Atlanta with The Southern Shmooze. Join our community, directory, or concierge service to support small businesses today.

Alternates: blog-post (0.35)

## Section Roles

Reading order (top→bottom): nav → pricing-table → pricing-table → nav → pricing → nav → nav → content → testimonials → footer → content → nav

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | nav | — | 0.4 |
| 1 | nav | — | 0.9 |
| 2 | nav | — | 0.9 |
| 3 | nav | — | 0.9 |
| 4 | pricing-table | Atlanta’s Community for Finding Trusted Local Businesses | 0.9 |
| 5 | pricing-table | Atlanta’s Community for Finding Trusted Local Businesses | 0.9 |
| 6 | pricing | Businesses You Can Trust | 0.4 |
| 7 | content | Check out The Shmooze on the news! | 0.3 |
| 8 | testimonials | — | 0.4 |
| 9 | footer | — | 0.95 |
| 10 | content | — | 0.3 |
| 11 | nav | — | 0.9 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.317 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 300px |
| backdrop-filter in use | no |
| Gradients | 2 |

## Imagery Style

**Label:** `photography` (confidence 0.044)
**Counts:** total 105, svg 0, icon 47, screenshot-like 1, photo-like 9
**Dominant aspect:** square-ish
**Radius profile on images:** square

## Component Screenshots

10 retina crops written to `screenshots/`. Index: `*-screenshots.json`.

| Cluster | Variant | Size (px) | File |
|---------|---------|-----------|------|
| button--primary | 0 | 215 × 89 | `screenshots/button-primary-0.png` |
| button--primary | 1 | 242 × 89 | `screenshots/button-primary-1.png` |
| button--default | 0 | 112 × 27 | `screenshots/button-default-0.png` |
| button--default | 1 | 88 × 27 | `screenshots/button-default-1.png` |
| button--default | 2 | 94 × 27 | `screenshots/button-default-2.png` |
| button--primary--medium | 0 | 286 × 62 | `screenshots/button-primary-medium-0.png` |
| input--default | 0 | 237 × 48 | `screenshots/input-default-0.png` |
| input--default | 1 | 237 × 48 | `screenshots/input-default-1.png` |
| input--default | 2 | 484 × 48 | `screenshots/input-default-2.png` |
| button--secondary | 0 | 484 × 91 | `screenshots/button-secondary-0.png` |

Full-page: `screenshots/full-page.png`

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Bitter` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
