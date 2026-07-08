# 🎨 زبرخان آموزش — Luxury Design System

## Color Palette

### Primary Colors
| Name | HEX | Usage |
|------|-----|-------|
| Primary 50 | `#F5F3FF` | Lightest primary backgrounds |
| Primary 100 | `#EDE9FE` | Subtle primary highlights |
| Primary 200 | `#DDD6FE` | Primary borders, dividers |
| Primary 300 | `#C4B5FD` | Primary icons muted |
| Primary 400 | `#A78BFA` | Primary icons |
| Primary 500 | `#8B5CF6` | Primary buttons, links |
| Primary 600 | `#7C3AED` | Primary buttons hover |
| Primary 700 | `#6D28D9` | Primary text emphasis |
| Primary 800 | `#5B21B6` | Dark primary elements |
| Primary 900 | `#4C1D95` | Deepest primary |

### Secondary Colors (Teal/Cyan Accent)
| Name | HEX | Usage |
|------|-----|-------|
| Secondary 50 | `#F0FDFA` | Light secondary backgrounds |
| Secondary 100 | `#CCFBF1` | Secondary highlights |
| Secondary 400 | `#2DD4BF` | Secondary accents, badges |
| Secondary 500 | `#14B8A6` | Secondary buttons |
| Secondary 600 | `#0D9488` | Secondary hover |

### Accent Color (Gold/Amber for luxury feel)
| Name | HEX | Usage |
|------|-----|-------|
| Accent 50 | `#FFFBEB` | Accent backgrounds |
| Accent 100 | `#FEF3C7` | Accent highlights |
| Accent 400 | `#FBBF24` | Stars, ratings |
| Accent 500 | `#F59E0B` | Price tags, featured badges |
| Accent 600 | `#D97706` | Accent hover |

### Background Colors
| Name | HEX | Usage |
|------|-----|-------|
| BG Primary | `#FAFAFA` | Main page background |
| BG Secondary | `#F4F4F5` | Section alternates |
| BG Elevated | `#FFFFFF` | Cards, modals |
| BG Dark | `#0F0F12` | Footer, dark sections |
| BG Dark Elevated | `#18181B` | Dark cards |

### Surface Colors
| Name | HEX | Usage |
|------|-----|-------|
| Surface | `#FFFFFF` | Card backgrounds |
| Surface Hover | `#FAFAFA` | Card hover state |
| Surface Active | `#F3F4F6` | Card active/pressed |
| Surface Muted | `#F4F4F5` | Input backgrounds |
| Surface Dark | `#27272A` | Dark mode surfaces |

### Card Colors
| Name | HEX | Usage |
|------|-----|-------|
| Card BG | `#FFFFFF` | Default card |
| Card Border | `#E4E4E7` | Card border |
| Card Border Hover | `#C4B5FD` | Card border on hover |
| Card Shadow | `rgba(15, 15, 18, 0.04)` | Default card shadow |
| Card Shadow Hover | `rgba(124, 58, 237, 0.08)` | Card shadow on hover |

### Text Colors
| Name | HEX | Usage | WCAG |
|------|-----|-------|------|
| Text Primary | `#18181B` | Headings, primary text | AAA on white |
| Text Secondary | `#52525B` | Body text, descriptions | AA on white |
| Text Tertiary | `#A1A1AA` | Placeholders, hints | AA on #F4F4F5 |
| Text Inverse | `#FFFFFF` | Text on dark backgrounds | AAA |
| Text Muted | `#71717A` | Disabled, secondary info | AA |

### Border Colors
| Name | HEX | Usage |
|------|-----|-------|
| Border Default | `#E4E4E7` | Default borders |
| Border Strong | `#D4D4D8` | Focused borders |
| Border Light | `#F4F4F5` | Subtle dividers |
| Border Primary | `#C4B5FD` | Primary themed borders |

### Semantic Colors
| Name | HEX | Usage |
|------|-----|-------|
| Success 50 | `#F0FDF4` | Success backgrounds |
| Success 500 | `#22C55E` | Success text, icons |
| Success 600 | `#16A34A` | Success buttons |
| Warning 50 | `#FFFBEB` | Warning backgrounds |
| Warning 500 | `#F59E0B` | Warning text, badges |
| Warning 600 | `#D97706` | Warning buttons |
| Error 50 | `#FEF2F2` | Error backgrounds |
| Error 500 | `#EF4444` | Error text |
| Error 600 | `#DC2626` | Error buttons |

### Hover & Active Colors
| Name | HEX | Usage |
|------|-----|-------|
| Hover Primary | `#6D28D9` | Primary button hover |
| Hover Secondary | `#0D9488` | Secondary button hover |
| Hover Surface | `#FAFAFA` | Surface hover |
| Active Primary | `#5B21B6` | Primary button active |
| Active Surface | `#F3F4F6` | Surface active |

### Gradient Definitions
```css
/* Hero / CTA gradient */
--gradient-hero: linear-gradient(135deg, #7C3AED 0%, #4C1D95 50%, #0F0F12 100%);

/* Card accent gradient */
--gradient-card: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);

/* Button gradient */
--gradient-button: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);

/* Dark section gradient */
--gradient-dark: linear-gradient(180deg, #18181B 0%, #0F0F12 100%);

/* Subtle background gradient */
--gradient-subtle: linear-gradient(180deg, #FAFAFA 0%, #F5F3FF 100%);
```

### Shadow Colors
| Name | Value | Usage |
|------|-------|-------|
| Shadow XS | `0 1px 2px rgba(15, 15, 18, 0.04)` | Subtle elevation |
| Shadow SM | `0 1px 3px rgba(15, 15, 18, 0.06), 0 1px 2px rgba(15, 15, 18, 0.04)` | Cards default |
| Shadow MD | `0 4px 6px -1px rgba(15, 15, 18, 0.06), 0 2px 4px -2px rgba(15, 15, 18, 0.04)` | Elevated cards |
| Shadow LG | `0 10px 15px -3px rgba(15, 15, 18, 0.06), 0 4px 6px -4px rgba(15, 15, 18, 0.04)` | Modals, dropdowns |
| Shadow XL | `0 20px 25px -5px rgba(15, 15, 18, 0.08), 0 8px 10px -6px rgba(15, 15, 18, 0.04)` | Hero elements |
| Shadow Glow | `0 0 40px rgba(124, 58, 237, 0.12)` | Primary glow effect |
| Shadow Glow Strong | `0 0 60px rgba(124, 58, 237, 0.2)` | Strong glow |

---

## Component Specifications

### Border Radius
| Element | Radius |
|---------|--------|
| Buttons | `14px` |
| Cards | `24px` |
| Inputs | `16px` |
| Badges | `9999px` (pill) |
| Avatars | `16px` |
| Modals | `28px` |
| Images | `20px` |

### Shadows by Component
| Component | Shadow |
|-----------|--------|
| Card default | `0 2px 8px rgba(15, 15, 18, 0.04)` |
| Card hover | `0 12px 32px rgba(124, 58, 237, 0.08), 0 4px 12px rgba(15, 15, 18, 0.04)` |
| Button primary | `0 4px 14px rgba(124, 58, 237, 0.25)` |
| Button hover | `0 6px 20px rgba(124, 58, 237, 0.35)` |
| Navbar scrolled | `0 1px 3px rgba(15, 15, 18, 0.06)` |
| Input focus | `0 0 0 3px rgba(139, 92, 246, 0.15)` |

### Specific Color Assignments
| Element | Color |
|---------|-------|
| Header background (scrolled) | `rgba(255, 255, 255, 0.8)` + backdrop-blur |
| Footer background | `#0F0F12` |
| Menu items | `#52525B` → hover `#7C3AED` |
| Links default | `#8B5CF6` |
| Links hover | `#6D28D9` |
| Form inputs bg | `#F4F4F5` |
| Input focus border | `#8B5CF6` |
| Input focus ring | `rgba(139, 92, 246, 0.15)` |
| Price original | `#18181B` |
| Price discount | `#EF4444` |
| Badge discount | `#FEF2F2` bg, `#DC2626` text |
| Badge featured | `#F5F3FF` bg, `#7C3AED` text |
| Badge verified | `#F0FDFA` bg, `#0D9488` text |
| Star filled | `#FBBF24` |
| Star empty | `#E4E4E7` |
| Icon default | `#A1A1AA` |
| Icon primary | `#8B5CF6` |
| Add to cart button | `#8B5CF6` bg, `#FFFFFF` text |
| WhatsApp button | `#10B981` bg, `#FFFFFF` text |
