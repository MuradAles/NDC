# Technical Context: Foundation Health NDC Calculator

## Technology Stack

### Core Framework
- **SvelteKit**: Full-stack framework for Svelte
  - Version: ^2.47.1
  - Purpose: Server-side rendering, API routes, file-based routing
  - Why: Minimal dependencies, built-in features, excellent performance

### Language
- **TypeScript**: Type-safe JavaScript
  - Version: ^5.9.3
  - Purpose: Type safety, better IDE support, fewer runtime errors
  - Configuration: `tsconfig.json`

### Build Tools
- **Vite**: Build tool and dev server
  - Version: ^7.1.10
  - Purpose: Fast development, optimized production builds
- **Svelte Check**: Type checking for Svelte
  - Version: ^4.3.3
  - Purpose: Validate Svelte component types

### Styling
- **CSS**: Native CSS with Svelte `<style>` blocks
  - Approach: Component-scoped styles
  - Global styles: `src/app.css`
  - Design system: Constants in `src/lib/constants/` (used in JavaScript, not CSS)
  - **Important**: Svelte doesn't support JavaScript template literals in CSS
  - **Solution**: Use hardcoded CSS values (e.g., `gap: 1rem` instead of `gap: ${spacing.md}`)
  - Why: Minimal dependencies, no CSS framework needed

### Deployment
- **Target**: Google Cloud Platform (GCP)
- **Adapter**: `@sveltejs/adapter-auto` (^7.0.0)
  - Note: May need to switch to `@sveltejs/adapter-node` or `@sveltejs/adapter-cloud-run` for GCP

## Development Setup

### Prerequisites
- Node.js (version compatible with SvelteKit 2.47.1)
- npm (comes with Node.js)

### Project Structure
```
NDC/
├── src/
│   ├── lib/              # Reusable code
│   │   ├── components/   # Svelte components
│   │   ├── constants/    # Design system constants
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   ├── routes/           # SvelteKit routes
│   │   ├── +page.svelte  # Main page
│   │   ├── +layout.svelte # Layout wrapper
│   │   └── api/          # API route handlers
│   ├── app.css           # Global styles
│   ├── app.d.ts          # Type definitions
│   └── app.html          # HTML template
├── static/               # Static assets
├── package.json          # Dependencies
├── svelte.config.js      # SvelteKit configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run check`: Type check with svelte-check
- `npm run check:watch`: Type check in watch mode

## External APIs

### RxNorm API
- **Endpoint**: `https://rxnav.nlm.nih.gov/REST/rxcui.json?name={drugName}`
- **Method**: GET
- **Purpose**: Normalize drug names to RxCUI codes
- **Response**: JSON with RxCUI and normalized name
- **Authentication**: None required (public API)
- **Rate Limits**: Unknown (use responsibly)
- **Error Handling**: Drug not found, API timeout

### FDA NDC Directory API
- **Endpoint**: `https://api.fda.gov/drug/ndc.json` ✅ Confirmed working
- **Method**: GET
- **Query Parameters**:
  - `search=product_ndc:{ndc}` - Search by NDC code
  - `search=brand_name:"{name}"` - Search by brand name (with quotes)
  - `search=generic_name:"{name}"` - Search by generic name (with quotes)
  - `search=brand_name:{name}` - Search by brand name (without quotes)
  - `search=generic_name:{name}` - Search by generic name (without quotes)
  - `limit=100` - Limit results (default: 1)
- **Note**: FDA API does NOT support RxCUI search (`search=rxcuis:{rxcui}` returns 404)
- **Purpose**: Retrieve NDC data including package sizes, active status
- **Response Structure**: 
  - `results[]` array with NDC records
  - Each record has: `product_ndc`, `brand_name`, `generic_name`, `packaging[]`, `dosage_form`, `active_ingredients[]`
  - Package size in `packaging[].description` (e.g., "30 TABLET in 1 BOTTLE")
- **Authentication**: No API key required (public API)
- **Rate Limits**: Unknown (use responsibly)
- **Error Handling**: 
  - Returns empty array if no matches found
  - Returns error object on network failures
  - Implements multiple search strategies for better results

## Environment Variables

### Required (if applicable)
- `RXNORM_API_KEY`: RxNorm API key (optional but recommended)
  - Get from: https://uts.nlm.nih.gov/uts/
  - Free registration required
- `FDA_API_KEY`: Not required - FDA NDC Directory API is public (no key needed)

### Configuration
- Store in `.env` file for local development
- Use SvelteKit's `$env` module for server-side access
- Never expose API keys in client-side code

## Technical Constraints

### Dependencies
- **Minimal Dependencies**: Keep external libraries to a minimum
- **Current Dependencies**: Only SvelteKit and TypeScript tooling
- **No UI Framework**: Use native CSS and Svelte components
- **No State Management Library**: Use Svelte's built-in reactivity

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- No IE11 support needed

### Performance Requirements
- API calls complete in < 2 seconds
- UI remains responsive during processing
- No blocking operations
- Fast initial page load

## Development Workflow

### Component Development
1. Create component file in appropriate directory
2. Define TypeScript types for props
3. Implement component logic
4. Add styles in `<style>` block
5. Import and use constants from `constants/`
6. Test component in isolation if possible

### API Integration
1. Create utility function in `utils/api/`
2. Define TypeScript types for API responses
3. Implement error handling
4. Test with real API calls
5. Create server route handler if needed

### Testing Strategy
- Manual testing with real drug names
- Test various SIG formats
- Test error scenarios
- Test responsive design
- No automated tests in MVP (can add later)

## Build & Deployment

### Build Process
1. `npm run build` - Creates production build
2. SvelteKit compiles Svelte components
3. Vite optimizes and bundles assets
4. Output in `.svelte-kit/` directory

### GCP Deployment
- **Options**: Cloud Run, App Engine, Cloud Functions
- **Adapter**: May need to switch from `adapter-auto` to specific GCP adapter
- **Environment Variables**: Configure in GCP console
- **Domain**: Set up custom domain if needed

## Known Technical Considerations

### API Rate Limits
- FDA API may have rate limits - implement caching if needed
- RxNorm API is public but should be used responsibly
- **Current Implementation**: No caching yet (can be added if needed)

### CORS
- External APIs may have CORS restrictions
- All API calls are made server-side (SvelteKit routes) ✅
- No CORS issues encountered

### Error Handling
- Network timeouts: Handled gracefully
- API failures: Graceful error messages with fallback strategies
- Invalid inputs: Client-side validation before API calls
- **FDA API 404**: Handled with multiple search strategies (brand_name, generic_name, with/without quotes)

### Type Safety
- All API responses are typed ✅
- Component props are typed ✅
- TypeScript strict mode enabled ✅

### Svelte 5 Runes
- Using Svelte 5 runes syntax: `$props()`, `$state()`
- Components use `{@render children()}` for slots
- No `export let` props (using `$props()` instead)

### CSS Limitations
- **Important**: Svelte doesn't support `${variable}` in CSS
- All CSS values are hardcoded (e.g., `1rem`, `#1976d2`)
- Design system constants are available in JavaScript but not directly in CSS
- Only one `<style>` block per component allowed

