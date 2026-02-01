
# Simplify Footer

## Overview
Remove all footer content except for the VALENTINA logo and the tagline "Making valentine matchmaking better. Your favorite love matching app ❤️"

## Changes

### File: `src/pages/LandingPage.tsx`

**Current Footer Structure (lines 351-396):**
- 4-column grid with Logo, Platform links, Resources links, Legal links
- Bottom section with copyright and additional taglines

**New Footer Structure:**
- Single centered layout with:
  - VALENTINA logo
  - Tagline: "Making valentine matchmaking better. Your favorite love matching app ❤️"

### Implementation Details

Replace the entire footer section with a minimal, centered design:

```jsx
{/* Footer */}
<footer className="relative z-10 section-footer py-12">
  <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
    <Logo size="sm" />
    <p className="text-sm text-muted-foreground mt-4">
      Making valentine matchmaking better. Your favorite love matching app ❤️
    </p>
  </div>
</footer>
```

## Summary
| Item | Action |
|------|--------|
| Platform links column | Remove |
| Resources links column | Remove |
| Legal links column | Remove |
| Copyright line | Remove |
| "Made with ❤️ for hopeless romantics" line | Remove |
| Logo + tagline | Keep (centered) |

This creates a clean, minimal footer with just the brand identity and tagline.
