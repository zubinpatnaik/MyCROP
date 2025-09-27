// excel-loader.js - Loads combined_crop_data_citywise.xlsx and exposes normalized data
// Requires SheetJS (XLSX) global: https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js
// Exports window.ExcelDataLoader with methods:
//   loadExcel(): Promise<{ rows: Array<{Crop:string, Date: Date, Price: number, City?: string}>, cities: string[] }>
// Caching to avoid multiple fetch/parse cycles.

(function(){
  const FILE_PATH = 'combined_crop_data_citywise.xlsx';
  let _cache = null;

  function sniffColumn(candidates, headers){
    for(const c of candidates){ if(headers.includes(c)) return c; }
    return null;
  }

  async function fetchArrayBuffer(path){
    const resp = await fetch(path, { cache:'no-store' });
    if(!resp.ok) throw new Error('HTTP '+resp.status+' fetching '+path);
    return await resp.arrayBuffer();
  }

  function toDate(val){
    if(val == null || val === '') return null;
    if(val instanceof Date) return val;
    // Excel serial?
    if(typeof val === 'number'){ // attempt Excel date serial
      // Excel epoch (assuming 1900-based w/ leap bug). Using SheetJS util if present.
      try { return XLSX.SSF.parse_date_code(val) ? new Date(Date.UTC(1899,11,30) + val*86400000) : null; } catch{ /* */ }
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  function numeric(v){
    const n = +v; return isFinite(n) ? n : null;
  }

  function collectNumericColumns(headers, exclude){
    return headers.filter(h => !exclude.includes(h));
  }

  function normalizeSheet(json){
    if(!json.length) return [];
    const headers = Object.keys(json[0]);
    const cropCol = sniffColumn(['Crop','crop','Crop Name','Crop_Name'], headers) || headers.find(h=>/crop/i.test(h));
    const dateCol = sniffColumn(['Date','date','Month','month','Date Recorded'], headers) || headers.find(h=>/date|month/i.test(h));
    const cityColExplicit = sniffColumn(['City','city','Location','location','Market','market'], headers) || headers.find(h=>/city|market|location/i.test(h));

    if(!cropCol || !dateCol){
      console.warn('excel-loader: missing crop/date columns');
      return [];
    }

    // If explicit City column exists AND a price-like column exists, treat as long format
    if(cityColExplicit){
      const priceCol = sniffColumn(['Price','price','Avg Price','Average Price','Rate','Value'], headers) || headers.find(h=>/price|rate|value/i.test(h));
      if(priceCol){
        const rows = [];
        for(const r of json){
          const crop = (r[cropCol]||'').toString().trim();
          const date = toDate(r[dateCol]);
            const city = (r[cityColExplicit]||'').toString().trim();
          if(!crop || !date || !city) continue;
          const price = numeric(r[priceCol]);
          if(price==null) continue;
          rows.push({ Crop: crop, Date: date, Price: price, City: city });
        }
        return rows;
      }
    }

    // Wide format: multiple city columns each numeric
    const candidateValueCols = headers.filter(h => h!==cropCol && h!==dateCol && h!==cityColExplicit);
    const valueCols = candidateValueCols.filter(col => json.some(r => r[col] !== undefined && r[col] !== '' && !isNaN(+r[col])));

    const rows = [];
    for(const r of json){
      const crop = (r[cropCol]||'').toString().trim();
      const date = toDate(r[dateCol]);
      if(!crop || !date) continue;
      if(valueCols.length === 0){
        // Look for a generic price column
        const priceCol = sniffColumn(['Price','price','Avg Price','Average Price','Rate','Value'], headers);
        if(priceCol){
          const price = numeric(r[priceCol]);
            if(price!=null) rows.push({Crop:crop, Date:date, Price:price});
        }
        continue;
      }
      for(const cityCol of valueCols){
        const price = numeric(r[cityCol]);
        if(price==null) continue;
        rows.push({ Crop: crop, Date: date, Price: price, City: cityCol });
      }
    }

    return rows;
  }

  async function loadExcel(){
    if(_cache) return _cache;
    if(typeof XLSX === 'undefined') throw new Error('SheetJS (XLSX) library not loaded');
    const buf = await fetchArrayBuffer(FILE_PATH);
    const wb = XLSX.read(buf, { type:'array' });
    let allRows = [];
    wb.SheetNames.forEach(name => {
      const ws = wb.Sheets[name];
      if(!ws) return;
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
      const rows = normalizeSheet(json);
      allRows = allRows.concat(rows);
    });

    // Aggregate duplicates (Crop,Date,City) if needed (averaging)
    const keyMap = new Map();
    for(const row of allRows){
      const key = row.Crop+'|'+row.Date.toISOString().slice(0,10)+'|'+(row.City||'');
      if(!keyMap.has(key)) keyMap.set(key, { ...row, sum: row.Price, count:1 });
      else { const k = keyMap.get(key); k.sum += row.Price; k.count += 1; }
    }
    const normalized = Array.from(keyMap.values()).map(v => ({ Crop:v.Crop, Date:new Date(v.Date), Price: v.sum / v.count, City: v.City||null }));

    // Collect city list (excluding null)
    const cities = Array.from(new Set(normalized.map(r => r.City).filter(Boolean))).sort();
    normalized.sort((a,b)=> a.Date - b.Date || a.Crop.localeCompare(b.Crop));
    _cache = { rows: normalized, cities };
    return _cache;
  }

  window.ExcelDataLoader = { loadExcel };
})();
