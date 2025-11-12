# System Patterns: Foundation Health NDC Calculator

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │         SvelteKit Frontend (Svelte)              │   │
│  │  ┌──────────────┐  ┌──────────────────────────┐ │   │
│  │  │   UI Layer   │  │    Component Library      │ │   │
│  │  │  (+page)     │  │  (Button, Input, Card)    │ │   │
│  │  └──────────────┘  └──────────────────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Requests
                          ▼
┌─────────────────────────────────────────────────────────┐
│              SvelteKit Server (Node.js)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │         API Route Handlers                       │   │
│  │  ┌──────────────┐  ┌──────────────────────────┐ │   │
│  │  │ /api/normalize│  │  /api/calculate          │ │   │
│  │  └──────────────┘  └──────────────────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Business Logic Layer                     │   │
│  │  ┌──────────────┐  ┌──────────────────────────┐ │   │
│  │  │ SIG Parser   │  │  Calculations             │ │   │
│  │  │ Validators   │  │  NDC Matcher              │ │   │
│  │  └──────────────┘  └──────────────────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         API Integration Layer                    │   │
│  │  ┌──────────────┐  ┌──────────────────────────┐ │   │
│  │  │ RxNorm API   │  │  FDA NDC Directory API    │ │   │
│  │  └──────────────┘  └──────────────────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ External API Calls
                          ▼
┌─────────────────────────────────────────────────────────┐
│              External APIs                               │
│  ┌──────────────┐  ┌──────────────────────────┐       │
│  │ RxNorm API   │  │  FDA NDC Directory API    │       │
│  │ (Drug Norm)  │  │  (NDC Lookup)            │       │
│  └──────────────┘  └──────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Component Hierarchy

```
PageLayout
└── Container
    └── +page.svelte (Main Calculator)
        ├── Form
        │   ├── FormField (Drug Name/NDC)
        │   │   └── Input
        │   ├── FormField (SIG)
        │   │   └── Input
        │   ├── FormField (Days Supply)
        │   │   └── Input
        │   └── Button (Submit)
        ├── Alert (Errors)
        └── Results Section
            ├── ResultCard
            └── NDCResultTable
                └── Table Rows (MatchedNDC[])
```

### Component Organization

```
src/lib/
├── components/
│   ├── ui/              # Base UI components (reusable)
│   │   ├── Button.svelte
│   │   ├── Input.svelte
│   │   ├── Select.svelte
│   │   ├── Card.svelte
│   │   └── Alert.svelte
│   ├── patterns/         # Pattern components (domain-specific)
│   │   ├── FormField.svelte
│   │   ├── ResultCard.svelte
│   │   └── NDCResultTable.svelte
│   └── layout/          # Layout components
│       ├── Container.svelte
│       └── PageLayout.svelte
├── constants/           # Design system constants
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
├── types/              # TypeScript type definitions
│   ├── prescription.ts
│   ├── ndc.ts
│   └── api.ts
└── utils/              # Business logic & utilities
    ├── api/
    │   ├── rxnorm.ts
    │   └── fda-ndc.ts
    ├── sig-parser.ts
    ├── calculations.ts
    └── validators.ts
```

## Key Technical Decisions

### Design Patterns

1. **Component-First Development**
   - Build UI components before business logic
   - Enables visual testing and iteration
   - Creates reusable component library

2. **Separation of Concerns**
   - UI components in `components/`
   - Business logic in `utils/`
   - Type definitions in `types/`
   - Constants in `constants/`

3. **Server-Side API Routes**
   - API calls happen server-side (SvelteKit routes)
   - Keeps API keys secure
   - Enables server-side caching if needed

4. **Type Safety**
   - TypeScript throughout
   - Strong typing for API responses
   - Type-safe component props

### Data Flow

```
User Input
  │
  ▼
Form Validation (validators.ts)
  │
  ▼
API Route Handler (+server.ts)
  │
  ├─► Drug Normalization (rxnorm.ts) ──► RxNorm API
  │   └─► Returns: { rxcui, normalizedName }
  │
  ├─► NDC Lookup (fda-ndc.ts) ──► FDA NDC API
  │   └─► Search by: brand_name, generic_name (multiple strategies)
  │   └─► Returns: NDC[] array
  │
  ├─► SIG Parsing (sig-parser.ts)
  │   └─► Extracts: { quantity, frequency, unit }
  │
  ├─► Quantity Calculation (calculations.ts)
  │   └─► Calculates: totalQuantity = quantity × frequency × daysSupply
  │
  └─► NDC Matching (calculations.ts)
      └─► Finds optimal matches, calculates overfill/underfill
  │
  ▼
PrescriptionResult
  │
  ▼
UI Display (ResultCard + NDCResultTable)
```

## Component Relationships

### Base Components → Pattern Components
- `FormField` uses `Input` or `Select`
- `ResultCard` uses `Card`
- `NDCResultTable` uses `Card` for container

### Pattern Components → Page
- `+page.svelte` uses `FormField`, `Button`, `Alert`, `ResultCard`, `NDCResultTable`
- `+page.svelte` uses `Container` and `PageLayout` for layout

### Constants Usage
- All components import constants from `constants/` for consistent styling
- Colors, typography, spacing used throughout

## API Integration Patterns

### RxNorm API Integration
- **Location**: `src/lib/utils/api/rxnorm.ts`
- **Function**: `normalizeDrugName(drugName: string)`
- **Returns**: `{ rxcui: string, normalizedName: string }`
- **Error Handling**: Returns error object on failure

### FDA NDC Directory API Integration
- **Location**: `src/lib/utils/api/fda-ndc.ts`
- **Endpoint**: `https://api.fda.gov/drug/ndc.json`
- **Functions**: 
  - `getNdcsByDrugName(drugName: string)` - Find NDCs by product name (primary method)
  - `getNdcsByNdc(ndc: string)` - Find NDC by code
  - `getNdcsByRxcui(rxcui: string)` - Deprecated (FDA API doesn't support RxCUI search)
- **Search Strategy**: Tries multiple search queries:
  1. `brand_name:"drugName"` (exact match with quotes)
  2. `generic_name:"drugName"` (exact match with quotes)
  3. `brand_name:drugName` (without quotes)
  4. `generic_name:drugName` (without quotes)
  5. Partial searches (first word only)
- **Response Structure**: Handles actual FDA API structure:
  - `brand_name`, `generic_name`, `product_name` fields
  - `packaging[]` array with `description` field for package size
  - `openfda.rxcui[]` array (available but not used for search)
- **Returns**: `NDC[]` array
- **Error Handling**: Returns empty array if no matches found, error object on network failures

## Calculation Patterns

### SIG Parsing
- **Location**: `src/lib/utils/sig-parser.ts`
- **Input**: SIG string (e.g., "Take 1 tablet by mouth twice daily")
- **Output**: `{ quantity: number, frequency: number, unit: string }`
- **Pattern**: Regex-based parsing with fallback handling

### Quantity Calculation
- **Location**: `src/lib/utils/calculations.ts`
- **Formula**: `totalQuantity = quantity × frequency × daysSupply`
- **Returns**: Total quantity with unit

### NDC Matching
- **Location**: `src/lib/utils/calculations.ts`
- **Algorithm**: Find NDCs where package size matches or minimizes overfill/underfill
- **Returns**: `MatchedNDC[]` sorted by optimal match

## Error Handling Patterns

### Validation Errors
- Client-side validation before API calls
- Display inline error messages using `Alert` component
- Prevent form submission on validation errors

### API Errors
- Server-side error handling in route handlers
- Return structured error responses
- Display user-friendly error messages in UI

### Network Errors
- Timeout handling (2 second limit)
- Retry logic (if needed)
- Graceful degradation with error messages

