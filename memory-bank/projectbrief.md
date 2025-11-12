# Project Brief: Foundation Health NDC Calculator

## Project Overview

**Project Name:** NDC Packaging & Quantity Calculator  
**Organization:** Foundation Health  
**Purpose:** Calculate prescription quantities and find optimal NDC (National Drug Code) matches for pharmacy operations

## Core Requirements

### Primary Goal
Build a web application that helps pharmacy staff calculate the total quantity of medication needed for a prescription and identify the best matching NDC codes from the FDA database.

### Key Functionality
1. **Drug Normalization**: Accept drug name or NDC input and normalize via RxNorm API
2. **Quantity Calculation**: Parse SIG (prescription instructions) and calculate total quantity needed based on days supply
3. **NDC Matching**: Find optimal NDC matches from FDA database that best fit the calculated quantity
4. **Results Display**: Show matched NDCs with package sizes, quantities needed, and overfill/underfill warnings

### User Flow
1. User inputs: Drug Name (or NDC), SIG, Days Supply
2. System normalizes drug name via RxNorm API
3. System retrieves available NDCs from FDA NDC Directory API
4. System parses SIG to extract quantity per dose and frequency
5. System calculates total quantity needed (quantity × frequency × days)
6. System finds optimal NDC matches that minimize overfill/underfill
7. System displays results with warnings for inactive NDCs and quantity mismatches

## Success Criteria

### Functional Requirements
- ✅ User can input drug name or NDC
- ✅ System normalizes drug name via RxNorm
- ✅ System retrieves valid NDCs from FDA
- ✅ System calculates total quantity needed
- ✅ System finds optimal NDC matches
- ✅ System highlights inactive NDCs and overfills/underfills
- ✅ Results displayed in clear, readable format

### Performance Requirements
- API calls complete in < 2 seconds
- UI remains responsive during processing
- No blocking operations

### Quality Requirements
- Clean, maintainable code structure
- TypeScript types throughout
- Error handling for all edge cases
- Accessible UI components
- Responsive design (mobile/tablet/desktop)

## Out of Scope (MVP)
- Multi-pack optimization algorithms (basic version only)
- Advanced SIG parsing (complex instructions)
- Integration with pharmacy management systems
- User authentication
- Historical data storage
- Advanced analytics

## Project Constraints
- Minimal dependencies (use SvelteKit built-ins)
- Component-first development approach
- TypeScript throughout
- GCP deployment target

