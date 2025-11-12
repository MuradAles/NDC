# Foundation Health - NDC Calculator: Implementation PRD

**Project:** NDC Packaging & Quantity Calculator  
**Organization:** Foundation Health  
**Implementation Approach:** SvelteKit with minimal dependencies

---

## 1. Implementation Overview

### Build Strategy
1. **Phase 1: UI Component Library** - Build reusable components and design system
2. **Phase 2: Core Functionality** - Implement API integrations and calculation logic
3. **Phase 3: Integration & Polish** - Connect UI to backend, error handling, validation

### Technology Stack
- **Framework:** SvelteKit
- **Language:** TypeScript
- **Styling:** CSS (minimal libraries, use SvelteKit built-ins)
- **APIs:** 
  - RxNorm API (drug normalization)
  - FDA NDC Directory API (NDC lookup)
- **Deployment:** GCP (Google Cloud Platform)

---

## 2. Project Structure

```
ndc-calculator/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   ├── Select.svelte
│   │   │   │   ├── Card.svelte
│   │   │   │   └── Alert.svelte
│   │   │   ├── patterns/
│   │   │   │   ├── FormField.svelte
│   │   │   │   ├── ResultCard.svelte
│   │   │   │   └── NDCResultTable.svelte
│   │   │   └── layout/
│   │   │       ├── Container.svelte
│   │   │       └── PageLayout.svelte
│   │   ├── constants/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   └── spacing.ts
│   │   ├── utils/
│   │   │   ├── api/
│   │   │   │   ├── rxnorm.ts
│   │   │   │   └── fda-ndc.ts
│   │   │   ├── calculations.ts
│   │   │   ├── sig-parser.ts
│   │   │   └── validators.ts
│   │   └── types/
│   │       ├── prescription.ts
│   │       ├── ndc.ts
│   │       └── api.ts
│   ├── routes/
│   │   ├── +page.svelte (main calculator UI)
│   │   ├── +page.server.ts (API route handlers)
│   │   └── api/
│   │       ├── normalize/
│   │       │   └── +server.ts
│   │       └── calculate/
│   │           └── +server.ts
│   └── app.css (global styles)
├── static/
└── package.json
```

---

## 3. Phase 1: UI Component Library

### 3.1 Design System Constants

**File: `src/lib/constants/colors.ts`**
```typescript
export const colors = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
  },
  secondary: {
    main: '#dc004e',
    light: '#ff5983',
    dark: '#9a0036',
  },
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  background: {
    default: '#ffffff',
    paper: '#f5f5f5',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
  },
  border: '#e0e0e0',
};
```

**File: `src/lib/constants/typography.ts`**
```typescript
export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};
```

**File: `src/lib/constants/spacing.ts`**
```typescript
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
};
```

### 3.2 Base UI Components

**Components to build:**
1. **Button.svelte** - Primary, secondary, outlined variants
2. **Input.svelte** - Text input with label, error state
3. **Select.svelte** - Dropdown select component
4. **Card.svelte** - Container card with shadow
5. **Alert.svelte** - Success, warning, error, info variants

### 3.3 Pattern Components

**Components to build:**
1. **FormField.svelte** - Wrapper for Input/Select with label and error message
2. **ResultCard.svelte** - Display NDC calculation results
3. **NDCResultTable.svelte** - Table showing matched NDCs with details

### 3.4 Layout Components

**Components to build:**
1. **Container.svelte** - Max-width container with padding
2. **PageLayout.svelte** - Main page layout wrapper

---

## 4. Phase 2: Core Functionality

### 4.1 Type Definitions

**File: `src/lib/types/prescription.ts`**
```typescript
export interface PrescriptionInput {
  drugName?: string;
  ndc?: string;
  sig: string; // e.g., "Take 1 tablet by mouth twice daily"
  daysSupply: number;
}

export interface PrescriptionResult {
  rxcui?: string;
  drugName: string;
  totalQuantity: number;
  unit: string;
  matchedNdcs: MatchedNDC[];
  warnings: string[];
}
```

**File: `src/lib/types/ndc.ts`**
```typescript
export interface NDC {
  productNdc: string;
  productName: string;
  dosageForm: string;
  strength: string;
  packageSize: number;
  unit: string;
  isActive: boolean;
}

export interface MatchedNDC extends NDC {
  quantityNeeded: number;
  packagesNeeded: number;
  overfill?: number;
  underfill?: number;
  isOptimal: boolean;
}
```

### 4.2 API Integration

**File: `src/lib/utils/api/rxnorm.ts`**
- Function: `normalizeDrugName(drugName: string): Promise<RxNormResult>`
- Handles RxNorm API calls
- Returns RxCUI and normalized drug name
- Error handling for API failures

**File: `src/lib/utils/api/fda-ndc.ts`**
- Function: `getNdcsByRxcui(rxcui: string): Promise<NDC[]>`
- Function: `getNdcsByNdc(ndc: string): Promise<NDC[]>`
- Handles FDA NDC Directory API calls
- Filters active/inactive NDCs
- Returns package sizes and units

### 4.3 Calculation Logic

**File: `src/lib/utils/sig-parser.ts`**
- Function: `parseSig(sig: string): ParsedSig`
- Parses SIG strings like:
  - "Take 1 tablet by mouth twice daily"
  - "Take 2 capsules every 12 hours"
  - "1 tablet daily"
- Returns: `{ quantity: number, frequency: number, unit: string }`

**File: `src/lib/utils/calculations.ts`**
- Function: `calculateTotalQuantity(parsedSig: ParsedSig, daysSupply: number): number`
- Function: `findOptimalNdcs(quantity: number, ndcs: NDC[]): MatchedNDC[]`
- Algorithm to select best NDC(s) matching quantity
- Handles multi-pack scenarios
- Calculates overfills/underfills

**File: `src/lib/utils/validators.ts`**
- Function: `validateInput(input: PrescriptionInput): ValidationResult`
- Validates drug name or NDC provided
- Validates SIG format
- Validates days supply > 0

### 4.4 Server Routes

**File: `src/routes/api/normalize/+server.ts`**
- POST endpoint: `/api/normalize`
- Accepts: `{ drugName: string }`
- Returns: `{ rxcui: string, normalizedName: string }`
- Calls RxNorm API

**File: `src/routes/api/calculate/+server.ts`**
- POST endpoint: `/api/calculate`
- Accepts: `PrescriptionInput`
- Returns: `PrescriptionResult`
- Orchestrates: normalization → NDC lookup → calculation → matching

---

## 5. Phase 3: Integration & Polish

### 5.1 Main Calculator UI

**File: `src/routes/+page.svelte`**
- Form with inputs:
  - Drug Name or NDC (text input)
  - SIG (text input)
  - Days Supply (number input)
- Submit button
- Loading state during API calls
- Results display using ResultCard and NDCResultTable
- Error handling and display

### 5.2 Error Handling

**Error Types:**
1. **API Errors** - RxNorm/FDA API failures
2. **Validation Errors** - Invalid input format
3. **Calculation Errors** - No matching NDCs found
4. **Network Errors** - Connection issues

**Error Display:**
- Use Alert component
- Show specific error messages
- Provide actionable guidance

### 5.3 Loading States

- Show spinner/loading indicator during API calls
- Disable form inputs during processing
- Show progress for multi-step operations

### 5.4 Results Display

**ResultCard shows:**
- Drug name (normalized)
- Total quantity needed
- Unit of measurement

**NDCResultTable shows:**
- Matched NDCs in table format
- Columns: NDC, Product Name, Package Size, Packages Needed, Overfill/Underfill, Status
- Highlight optimal matches
- Warn about inactive NDCs
- Show overfill/underfill warnings

---

## 6. Styling Approach

### 6.1 Global Styles

**File: `src/app.css`**
- CSS reset/normalize
- Base typography
- Color variables (from constants)
- Utility classes (if needed)

### 6.2 Component Styles

- Use Svelte `<style>` blocks in each component
- Import constants for colors, spacing, typography
- Use CSS custom properties for theming
- Minimal external CSS libraries

### 6.3 Responsive Design

- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg)
- Responsive tables (scroll on mobile)
- Touch-friendly button sizes

---

## 7. API Integration Details

### 7.1 RxNorm API

**Endpoint:** `https://rxnav.nlm.nih.gov/REST/rxcui.json?name={drugName}`
- Method: GET
- Returns: RxCUI and normalized drug name
- Error handling: Drug not found, API timeout

### 7.2 FDA NDC Directory API

**Endpoint:** `https://api.fda.gov/drug/ndc.json`
- Method: GET
- Query params: `search=product_ndc:{ndc}` or `search=rxcuis:{rxcui}`
- Returns: NDC data including package sizes, active status
- Error handling: NDC not found, API rate limits

### 7.3 API Key Management

- Store API keys in environment variables
- Use SvelteKit's `$env` for server-side access
- Never expose keys in client-side code

---

## 8. Testing Strategy

### 8.1 Unit Tests

- Test SIG parser with various formats
- Test calculation logic with edge cases
- Test NDC matching algorithm
- Test validators

### 8.2 Integration Tests

- Test API integrations (with mocks)
- Test end-to-end calculation flow
- Test error handling paths

### 8.3 Manual Testing

- Test with real drug names
- Test with various SIG formats
- Test error scenarios
- Test responsive design

---

## 9. Deployment

### 9.1 Build Configuration

- SvelteKit adapter for GCP
- Environment variables for API keys
- Production build optimization

### 9.2 GCP Setup

- Cloud Run or App Engine
- Environment variables configuration
- Domain setup (if needed)

---

## 10. Success Criteria

### 10.1 Functional Requirements
- ✅ User can input drug name or NDC
- ✅ System normalizes drug name via RxNorm
- ✅ System retrieves valid NDCs from FDA
- ✅ System calculates total quantity needed
- ✅ System finds optimal NDC matches
- ✅ System highlights inactive NDCs and overfills/underfills
- ✅ Results displayed in clear, readable format

### 10.2 Performance Requirements
- ✅ API calls complete in < 2 seconds
- ✅ UI remains responsive during processing
- ✅ No blocking operations

### 10.3 Quality Requirements
- ✅ Clean, maintainable code structure
- ✅ TypeScript types throughout
- ✅ Error handling for all edge cases
- ✅ Accessible UI components
- ✅ Responsive design works on mobile/tablet/desktop

---

## 11. Out of Scope (MVP)

- Multi-pack optimization algorithms (basic version only)
- Advanced SIG parsing (complex instructions)
- Integration with pharmacy management systems
- User authentication
- Historical data storage
- Advanced analytics

---

This implementation PRD provides a clear roadmap for building the NDC Calculator with a focus on component-first development and minimal dependencies.

