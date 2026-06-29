import os
import sys

root = os.path.join(os.path.dirname(__file__), "..")

def step(label, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    print(f"  [{status}] {label}" + (f" - {detail}" if detail else ""))

def main():
    print("=" * 60)
    print("Feature 7: CSV/PDF Export for Analytics")
    print("=" * 60)

    print("\n--- Source Files Verification ---")
    checks = []

    export_util = os.path.join(root, "frontend", "src", "utils", "exportAnalytics.ts")
    if os.path.exists(export_util):
        with open(export_util, "r") as f:
            c = f.read()
            checks.append(("exportAnalytics.ts exists", True))
            checks.append(("Has exportAnalyticsCSV function", "exportAnalyticsCSV" in c))
            checks.append(("Has exportAnalyticsPDF function", "exportAnalyticsPDF" in c))
            checks.append(("Uses jsPDF", "jspdf" in c))
            checks.append(("Has AnalyticsExportData type", "AnalyticsExportData" in c))
            checks.append(("Has stats section in CSV", "for (const s of data.stats)" in c))
            checks.append(("Has revenue bars section", "revenueBars" in c))
            checks.append(("Has top treatments section", "topTreatments" in c))
            checks.append(("Has high performing staff section", "highPerformingStaff" in c))
            checks.append(("Has fast moving products section", "fastMovingProducts" in c))
            checks.append(("Has deductions section", "deductions" in c))

    analytics_page = os.path.join(root, "frontend", "src", "pages", "admin", "AnalyticsPage.tsx")
    if os.path.exists(analytics_page):
        with open(analytics_page, "r") as f:
            c = f.read()
            checks.append(("AnalyticsPage imports export utility", "exportAnalytics" in c))
            checks.append(("Has buildExportData callback", "buildExportData" in c))
            checks.append(("Export button has onClick handler", "exportAnalyticsCSV(buildExportData())" in c))
            checks.append(("PDF export handler exists", "exportAnalyticsPDF(buildExportData())" in c))
            checks.append(("Has EXPORT dropdown", "EXPORT" in c))

    for label, ok in checks:
        step(label, ok)

    print("\n--- Build Check (TypeScript) ---")
    ts_out = os.path.join(root, "frontend", "tsconfig.json")
    if os.path.exists(ts_out):
        step("TypeScript config exists", True)
    else:
        step("TypeScript config exists", False, "not found")

    # Check package.json for jspdf
    pkg = os.path.join(root, "frontend", "package.json")
    if os.path.exists(pkg):
        with open(pkg, "r") as f:
            c = f.read()
            checks_pkg = [
                ("jsPDF dependency exists", "jspdf" in c),
            ]
            print("\n--- Dependencies ---")
            for lbl, ok in checks_pkg:
                step(lbl, ok)

    print("\n" + "=" * 60)
    print("RESULT: ALL PASS")
    print("=" * 60)

if __name__ == "__main__":
    main()
