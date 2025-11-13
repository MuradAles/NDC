# Foundation Health - NDC Calculator

A web application for calculating prescription quantities and finding optimal NDC (National Drug Code) matches from the FDA database.

## Features

- **Drug Normalization**: Normalize drug names using RxNorm API
- **Quantity Calculation**: Parse SIG (prescription instructions) and calculate total quantity needed
- **NDC Matching**: Find optimal NDC matches from FDA database
- **Results Display**: Show matched NDCs with package sizes, quantities needed, and warnings

## Technology Stack

- **Framework**: SvelteKit 2.47.1
- **Language**: TypeScript 5.9.3
- **Styling**: CSS (minimal dependencies)
- **APIs**: 
  - RxNorm API (drug normalization)
  - FDA NDC Directory API (NDC lookup)

## Getting Started

### Prerequisites

- Node.js (compatible with SvelteKit 2.47.1)
- npm (comes with Node.js)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Environment variables (optional):
   - Copy `.env.example` to `.env` and add your keys:
   ```bash
   cp .env.example .env
   ```
   - **OpenAI API Key** (optional but recommended):
     - Enables AI-powered search suggestions when drugs aren't found
     - Get from: https://platform.openai.com/api-keys
     - Add to `.env`: `OPENAI_API_KEY=your_key_here`
   - **RxNorm API Key** (optional):
     - Better drug normalization (works without it, but key recommended)
     - Get from: https://uts.nlm.nih.gov/uts/
     - Add to `.env`: `RXNORM_API_KEY=your_key_here`
   - **FDA NDC Directory API**: Public, no key needed

### Development

Start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

1. Enter either a **Drug Name** (e.g., "Lisinopril") or an **NDC Code** (e.g., "12345-678-90")
2. Enter the **SIG** (prescription instructions), e.g., "Take 1 tablet by mouth twice daily"
3. Enter the **Days Supply** (number of days)
4. Click **Calculate**
5. View the results showing:
   - Total quantity needed
   - Matched NDCs with package sizes
   - Optimal matches highlighted
   - Warnings for inactive NDCs and overfills/underfills

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/              # Base UI components
│   │   ├── patterns/        # Pattern components
│   │   └── layout/          # Layout components
│   ├── constants/           # Design system constants
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Business logic & utilities
│       ├── api/             # API integrations
│       ├── calculations.ts  # Calculation logic
│       ├── sig-parser.ts    # SIG parser
│       └── validators.ts    # Input validators
├── routes/
│   ├── +page.svelte         # Main calculator UI
│   └── api/                 # API route handlers
│       ├── normalize/       # Drug normalization endpoint
│       └── calculate/       # Calculation endpoint
└── app.css                  # Global styles
```

## API Endpoints

### POST `/api/normalize`
Normalize a drug name to RxCUI code.

**Request:**
```json
{
  "drugName": "Lisinopril"
}
```

**Response:**
```json
{
  "rxcui": "29046",
  "normalizedName": "Lisinopril"
}
```

### POST `/api/calculate`
Calculate prescription quantity and find optimal NDC matches.

**Request:**
```json
{
  "drugName": "Lisinopril",
  "sig": "Take 1 tablet by mouth twice daily",
  "daysSupply": 30
}
```

**Response:**
```json
{
  "rxcui": "29046",
  "drugName": "Lisinopril",
  "totalQuantity": 60,
  "unit": "tablet",
  "matchedNdcs": [...],
  "warnings": []
}
```

## API Integration

### RxNorm API
- **Endpoint**: `https://rxnav.nlm.nih.gov/REST/rxcui.json?name={drugName}`
- **Authentication**: None required (public API)
- **Rate Limit**: 20 requests per second per IP
- **Documentation**: https://lhncbc.nlm.nih.gov/RxNav/APIs/

### FDA NDC Directory API
- **Endpoint**: `https://api.fda.gov/drug/ndc.json`
- **Authentication**: None required (public API)
- **Documentation**: https://open.fda.gov/apis/drug/ndc/

## Deployment

### GitHub Pages

This project is configured for GitHub Pages deployment using GitHub Actions.

1. **Enable GitHub Pages**:
   - Go to your repository Settings > Pages
   - Under "Source", select "GitHub Actions"

2. **Push to main branch**:
   - The GitHub Actions workflow will automatically build and deploy on every push to `main`
   - The site will be available at `https://<username>.github.io/<repository-name>/`

3. **Manual deployment**:
   - You can also trigger deployment manually from the Actions tab

**Note**: This app uses client-side API calls (FDA and RxNorm APIs are public), so it works perfectly with static hosting.

### GCP Deployment

1. Build the production version:
```bash
npm run build
```

2. Deploy to GCP (Cloud Run or App Engine)
3. No environment variables needed - both APIs are public!

## Development Notes

- Uses Svelte 5 runes syntax (`$props`, `$state`)
- Component-first development approach
- Minimal dependencies (SvelteKit built-ins)
- TypeScript throughout for type safety
- Client-side API calls (FDA and RxNorm APIs are public, no keys needed)

## License

Private - Foundation Health
