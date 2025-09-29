# MYCROP Dashboard

A lightweight, static, CSV‑driven farm intelligence dashboard. Provides:

- Multi‑crop price trend visualization (Chart.js + D3 CSV parsing)
- Latest crop price cards with change indicators
- Farmer dashboard (weather mock, crop health simulation, ticker)
- Simple local crop registry with modal detail & mock health analysis
- Developer utilities: chart test page and CSV debug page

## Tech Stack
- HTML + Tailwind CSS (CDN) for layout & styling utilities
- Custom shared styles: `global.css`
- D3.js v7 (CDN) for CSV loading & data wrangling
- Chart.js (CDN) for multi‑series line chart
- Vanilla JavaScript modules (no build step)

## File Map
| Area | HTML | Script | Notes |
|------|------|--------|-------|
| Main dashboard | `main.html` | `main.js` | Chart, ticker, health simulation |
| Crop prices overview | `crops.html` | `crops.js` | Latest price cards with delta |
| My crops (registry) | `my-crops.html` | `my-crops.js` | CRUD + image analysis mock |
| Chart dev test | `test-chart.html` | `test-chart.js` | Isolated Chart.js sanity test |
| CSV debug utility | `debug-csv.html` | `debug-csv.js` | Loads & inspects `crops.csv` |
| Shared styles | — | `global.css` | Background + scrollbar |
| Data source | — | `crops.csv` | Monthly 2024 crop prices |

Removed legacy files: `script.js`, `style.css` (now superseded by refactor).

## Running Locally
Because everything is static, you just need a simple HTTP server so the CSV can be fetched (browsers block `file://` XHR).

### Python (recommended)
```powershell
python -m http.server 8000
```
Then open: http://localhost:8000/main.html

### Node (alternative)
```powershell
npx serve . -l 8000
```

## Data Expectations
`crops.csv` columns:
```
Crop,Date,Price
Wheat,2024-01-15,21.50
...
```
- Date parsed as `new Date(d.Date)`
- Price coerced via `+d.Price`

If CSV fails to load, `main.js` supplies a fallback dataset covering all known crops so the chart always renders.

## Using the Excel Source (New)
If you now maintain prices in the workbook `combined_crop_data_citywise.xlsx`, convert it into the required `crops.csv` format before (re)loading the site.

1. Ensure Python dependencies are installed (from repo root):
	```powershell
	pip install -r backend/requirements.txt
	```
2. Place / update the Excel file at: `frontend/combined_crop_data_citywise.xlsx`.
3. Run the conversion script (from `backend/` or repo root):
	```powershell
	python backend/convert_excel_to_csv.py
	```
4. The script will generate / overwrite `frontend/crops.csv` with columns:
	```
	Crop,Date,Price
	```
	- Date normalized to ISO (YYYY-MM-DD)
	- If multiple city columns exist, their numeric values are averaged into a single Price per Crop+Date.
5. Refresh the browser (hard refresh Ctrl+F5) to see updated charts & price cards.

Script logic overview:
- Auto-detects crop & date columns from several common header variants.
- Detects multiple numeric city price columns and averages them; if only one price-like column exists, uses it directly.
- Aggregates duplicate (Crop,Date) rows by mean.

If your sheet uses different header names, adjust lists in `backend/convert_excel_to_csv.py`:
```python
CROP_COL_CANDIDATES = ["Crop", "crop", "Crop Name"]
DATE_COL_CANDIDATES = ["Date", "Month"]
```

## Quick Regeneration Shortcut
Add a simple PowerShell alias in your profile for repeated use:
```powershell
function regen-crops { python "$PWD/backend/convert_excel_to_csv.py" }
```
Then run `regen-crops` anytime you update the workbook.

## City Filtering (Chart & Price Cards)
If the data originates from the Excel file with multiple city columns OR the CSV contains a `City` column, a city dropdown appears:

- Selecting a specific city displays only that city's prices.
- Selecting “All Cities (avg)” computes the mean price across all cities per crop per date.
- If no city data is present, the selector is hidden.

To enable via CSV directly, include a `City` column:
```
Crop,Date,Price,City
Wheat,2024-01-15,21.5,Delhi
Wheat,2024-01-15,22.1,Mumbai
```
The app will treat each row separately and let the user choose a city or average.

### Persistence
The last selected city is saved in `localStorage` (key: `selectedCity`) and automatically restored on both the dashboard and price pages.

## Extending
- Add another crop: append rows to `crops.csv` matching existing date cadence.
- Add a new page: create `page.html` + `page.js`, link `global.css` and required CDNs.
- Add computed metrics: extend data grouping logic in `crops.js` or `main.js`.

## Future Improvements
- Persist “My Crops” in localStorage
- Real weather API integration
- Accessibility review & semantic markup enhancements
- Replace random health/status generation with ML/vision model API
- Add unit tests with a lightweight harness (e.g., Vitest + jsdom) if build tooling introduced

## License
Currently unspecified. Add a LICENSE file if you intend public distribution.

---
Refactor completed: all inline scripts/styles externalized for maintainability.
