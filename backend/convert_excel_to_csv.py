"""Convert combined_crop_data_citywise.xlsx into frontend/crops.csv

Assumptions (adjust if your real sheet differs):
- Excel file path: ../frontend/combined_crop_data_citywise.xlsx relative to this script or same repo root
- We expect at least columns identifying crop name, date, and price.
- If the workbook is city-wise (multiple cities' price columns), we'll take the average across cities per crop+date.
- Output CSV schema required by frontend JS: Crop,Date,Price (Date in ISO YYYY-MM-DD, Price as decimal)

If your actual column names differ, edit the COLUMN_GUESSES list or provide a mapping.
"""
from __future__ import annotations
import pandas as pd
from pathlib import Path
import sys

# ---------- Configuration ----------
EXCEL_FILENAME = "combined_crop_data_citywise.xlsx"
OUTPUT_CSV = Path("../frontend/crops.csv")  # relative to backend/ directory
# Potential column name variants
CROP_COL_CANDIDATES = ["Crop", "crop", "Crop Name", "Crop_Name"]
DATE_COL_CANDIDATES = ["Date", "date", "Month", "month", "Date Recorded"]
# Price columns may be per city; collect all numeric columns except crop/date


def find_column(possible_names: list[str], df: pd.DataFrame) -> str:
    for name in possible_names:
        if name in df.columns:
            return name
    raise ValueError(f"None of the possible columns {possible_names} found in spreadsheet columns: {list(df.columns)}")


def load_excel(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Excel file not found: {path.resolve()}")
    # Read all sheets and concatenate if multiple
    xls = pd.ExcelFile(path)
    frames = []
    for sheet in xls.sheet_names:
        frames.append(pd.read_excel(xls, sheet_name=sheet))
    df = pd.concat(frames, ignore_index=True)
    return df


def melt_and_aggregate(df: pd.DataFrame) -> pd.DataFrame:
    crop_col = find_column(CROP_COL_CANDIDATES, df)
    date_col = find_column(DATE_COL_CANDIDATES, df)

    # Identify numeric price columns (exclude crop/date)
    exclude = {crop_col, date_col}
    numeric_cols = [c for c in df.columns if c not in exclude and pd.api.types.is_numeric_dtype(df[c])]
    if not numeric_cols:
        # maybe there's already a single price column with a standard name
        price_col_candidates = ["Price", "price", "Avg Price", "Average Price", "Rate", "Value"]
        price_col = find_column(price_col_candidates, df)
        df_simple = df[[crop_col, date_col, price_col]].copy()
        df_simple.rename(columns={crop_col: "Crop", date_col: "Date", price_col: "Price"}, inplace=True)
        return df_simple

    # Compute row-wise mean across all numeric price columns (treat 0 or NaN appropriately)
    price_series = df[numeric_cols].replace(0, pd.NA).astype(float).mean(axis=1, skipna=True)

    out = pd.DataFrame({
        "Crop": df[crop_col],
        "Date": df[date_col],
        "Price": price_series
    })
    return out


def normalize(out: pd.DataFrame) -> pd.DataFrame:
    # Drop rows with missing essentials
    out = out.dropna(subset=["Crop", "Date", "Price"]).copy()
    # Parse date -> ISO date (no time)
    out["Date"] = pd.to_datetime(out["Date"], errors="coerce")
    out = out.dropna(subset=["Date"]).copy()
    out["Date"] = out["Date"].dt.date.astype(str)
    # Aggregate: average price per crop per date
    grouped = out.groupby(["Crop", "Date"], as_index=False)["Price"].mean()
    # Sort by date
    grouped.sort_values(["Crop", "Date"], inplace=True)
    return grouped


def main():
    script_dir = Path(__file__).parent
    excel_path = script_dir.parent / "frontend" / EXCEL_FILENAME
    try:
        df_raw = load_excel(excel_path)
        processed = melt_and_aggregate(df_raw)
        final = normalize(processed)
        OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
        final.to_csv(OUTPUT_CSV, index=False)
        print(f"✅ Generated {OUTPUT_CSV.resolve()} with {len(final)} rows and columns {list(final.columns)}")
    except Exception as e:
        print(f"❌ Conversion failed: {e}")
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
