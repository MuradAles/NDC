# Examples: Multi-Pack Optimization & Special Dosage Forms

## 1. Multi-Pack Optimization

### Example 1: Exact Match with Multi-Pack

**Input:**
- Drug: Lisinopril
- SIG: "Take 1 tablet twice daily"
- Days Supply: 60 days

**Calculation:**
- Quantity Needed: 1 tablet × 2 times/day × 60 days = **120 tablets**

**Available packages:** 30, 60, 100 tablets

**Result:**
- ✅ **2×60 tablets** = 120 (exact match, optimal)
- ✅ **4×30 tablets** = 120 (exact match, optimal)
- ✅ **Multi-pack: 2×30 + 1×60** = 120 (exact match, multi-pack badge)

### Example 2: Minimizing Overfill

**Input:**
- Drug: Metformin
- SIG: "Take 1 tablet twice daily"
- Days Supply: 42.5 days (rounds to 43)

**Calculation:**
- Quantity Needed: 1 tablet × 2 times/day × 43 days = **86 tablets** (rounds to 85)

**Available packages:** 30, 60, 100 tablets

**Result:**
- ❌ **3×30 tablets** = 90 (5 overfill)
- ❌ **1×100 tablets** = 100 (15 overfill)
- ✅ **Multi-pack: 1×30 + 1×60** = 90 (5 overfill, best option)

---

## 2. Special Dosage Form Handling

### Example 3: Liquid Medications

**Input:**
- Drug: Amoxicillin Suspension
- SIG: "Take 5 mL by mouth three times daily"
- Days Supply: 10 days
- Dosage Form: "Liquid" or "Suspension"
- Unit: "ml"

**Calculation:**
- Base: 5 mL × 3 times/day × 10 days = 150 mL
- **Liquid handling:** Rounds to 2 decimal places, then rounds up
- Result: **150 mL** (exact)

### Example 4: Insulin

**Input:**
- Drug: Humalog Insulin
- SIG: "Inject 10 units before meals"
- Days Supply: 30 days
- Dosage Form: "Pen" or "Insulin"
- Unit: "unit" or "u"

**Calculation:**
- Base: 10 units × 3 meals/day × 30 days = 900 units
- **Insulin handling:** Rounds to nearest unit
- Result: **900 units**
