# Product Context: Foundation Health NDC Calculator

## Why This Project Exists

### Problem Statement
Pharmacy staff need to quickly determine:
1. How much medication is needed for a prescription based on SIG and days supply
2. Which NDC codes from the FDA database best match the required quantity
3. Whether there are any issues with inactive NDCs or quantity mismatches (overfill/underfill)

### Current Pain Points
- Manual calculation of prescription quantities is time-consuming and error-prone
- Finding appropriate NDC matches requires searching through FDA database manually
- No easy way to identify optimal package sizes that minimize waste
- Difficult to spot inactive NDCs that shouldn't be used

### Solution
An automated calculator that:
- Parses prescription instructions (SIG) to extract dosing information
- Calculates total quantity needed automatically
- Searches FDA NDC database to find matching products
- Identifies optimal matches that minimize overfill/underfill
- Highlights potential issues (inactive NDCs, quantity mismatches)

## How It Should Work

### User Experience
1. **Input Form**: Simple form with three fields:
   - Drug Name or NDC (text input)
   - SIG - Prescription instructions (text input, e.g., "Take 1 tablet by mouth twice daily")
   - Days Supply (number input)

2. **Processing**: 
   - Show loading indicator during API calls
   - Disable form inputs during processing
   - Display progress for multi-step operations

3. **Results Display**:
   - **Summary Card**: Shows normalized drug name, total quantity needed, and unit
   - **Results Table**: Shows matched NDCs with:
     - NDC code
     - Product name
     - Package size
     - Packages needed
     - Overfill/Underfill amount
     - Status (active/inactive, optimal match indicator)

4. **Error Handling**:
   - Clear error messages for validation failures
   - User-friendly messages for API errors
   - Actionable guidance for fixing issues

### User Experience Goals
- **Fast**: Results in under 2 seconds
- **Simple**: Minimal input required, clear results
- **Reliable**: Handles errors gracefully
- **Accessible**: Works on all devices, screen readers supported
- **Clear**: Results are easy to understand at a glance

## Target Users
- Pharmacy technicians
- Pharmacists
- Pharmacy staff who need to process prescriptions

## Use Cases

### Primary Use Case
**Scenario**: Pharmacy receives prescription for "Lisinopril 10mg, Take 1 tablet by mouth twice daily, 30 days supply"

**Steps**:
1. Enter "Lisinopril" in drug name field
2. Enter "Take 1 tablet by mouth twice daily" in SIG field
3. Enter "30" in days supply field
4. Click calculate

**Expected Result**:
- System calculates: 1 tablet × 2 times/day × 30 days = 60 tablets needed
- System finds NDC matches for Lisinopril 10mg tablets
- System shows optimal matches (e.g., 60-tablet bottles, or 2 × 30-tablet bottles)
- System highlights any inactive NDCs or quantity mismatches

### Secondary Use Case
**Scenario**: User has an NDC code and wants to verify it matches prescription requirements

**Steps**:
1. Enter NDC code directly
2. Enter SIG and days supply
3. Click calculate

**Expected Result**:
- System validates the NDC
- System calculates required quantity
- System shows if the NDC package size matches or if there's overfill/underfill

