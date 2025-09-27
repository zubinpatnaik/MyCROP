// crops.js - logic for crops.html page

document.addEventListener('DOMContentLoaded', async () => {
    const pricesContainer = document.getElementById('prices-container');
    const cityFilterWrap = document.getElementById('city-filter-wrap');
    const cityFilter = document.getElementById('city-filter');

    function render(latestPrices){
        pricesContainer.innerHTML = '';
        latestPrices.forEach(item => {
            const up = item.pct >= 0; const arrow = up ? '▲' : '▼'; const color = up ? 'text-green-400' : 'text-red-400';
            const price = item.last.Price.toFixed(2);
            const dateStr = item.last.Date.toLocaleDateString();
            const pctStr = `${up?'+':''}${item.pct.toFixed(1)}%`;
            const changeStr = `${up?'+':''}${item.change.toFixed(2)}`;
            const card = `
                <div class="bg-gray-800/50 p-6 rounded-2xl border border-white/10 hover:border-green-500/40 transition">
                    <div class="flex items-start justify-between">
                        <h3 class="font-bold text-lg text-white">${item.crop}</h3>
                        <span class="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10">Latest</span>
                    </div>
                    <div class="mt-3 flex items-baseline space-x-2">
                        <p class="font-mono text-2xl font-semibold ${color}">₹${price}</p>
                        <span class="text-sm ${color}">${arrow} ${pctStr}</span>
                    </div>
                    <p class="text-gray-400 text-xs mt-1">Change: <span class="${color}">${changeStr}</span> since last month</p>
                    <p class="text-gray-400 text-xs mt-2">as of ${dateStr}</p>
                </div>`;
            pricesContainer.insertAdjacentHTML('beforeend', card);
        });
    }

    function buildLatest(data){
        const groups = d3.group(data, d => d.Crop);
        const latestPrices = [];
        for (const [crop, rows] of groups) {
            const sorted = rows.slice().sort((a,b)=>a.Date-b.Date);
            const last = sorted[sorted.length-1];
            const prev = sorted[sorted.length-2];
            const change = prev && prev.Price ? last.Price - prev.Price : 0;
            const pct = prev && prev.Price ? (change/prev.Price)*100 : 0;
            latestPrices.push({ crop, last, prev, change, pct });
        }
        return latestPrices.sort((a,b)=>a.crop.localeCompare(b.crop));
    }

    function averageAcrossCities(rows){
        const map = new Map();
        for(const r of rows){
            const key = r.Crop + '|' + r.Date.toISOString().slice(0,10);
            if(!map.has(key)) map.set(key, { Crop:r.Crop, Date:r.Date, sum:r.Price, count:1 });
            else { const m = map.get(key); m.sum += r.Price; m.count += 1; }
        }
        return Array.from(map.values()).map(v => ({ Crop:v.Crop, Date:v.Date, Price: v.sum / v.count }));
    }

    function rebuildFromExcel(){
        const original = window._excelPriceRows || [];
        if(!original.length){ return; }
        const chosen = cityFilter ? cityFilter.value : '__ALL__';
        let working;
        if(chosen && chosen !== '__ALL__'){
            working = original.filter(r => r.City === chosen);
        } else {
            working = averageAcrossCities(original);
        }
        const normalized = working.map(r => ({ Crop:r.Crop, Date:new Date(r.Date), Price:+r.Price }));
        render(buildLatest(normalized));
    }

    function populateCityFilter(cities){
        if(!cities.length){ cityFilterWrap.classList.add('hidden'); return; }
        const stored = localStorage.getItem('selectedCity') || '__ALL__';
        cityFilter.innerHTML = '<option value="__ALL__">All Cities (avg)</option>' + cities.map(c=>`<option value="${c}">${c}</option>`).join('');
        cityFilterWrap.classList.remove('hidden');
        if([...cityFilter.options].some(o=>o.value===stored)) cityFilter.value = stored;
        cityFilter.addEventListener('change', (e)=>{ localStorage.setItem('selectedCity', e.target.value); rebuildFromExcel(); });
    }

    async function tryExcel(){
        if(!(window.ExcelDataLoader && typeof ExcelDataLoader.loadExcel === 'function')) throw new Error('Excel loader not ready');
        const { rows, cities } = await ExcelDataLoader.loadExcel();
        window._excelPriceRows = rows; // keep raw
        populateCityFilter(cities);
        rebuildFromExcel();
    }

    async function fallbackCsv(){
        if (typeof d3 === 'undefined') throw new Error('D3 not loaded');
        const raw = await d3.csv('crops.csv');
        const data = raw.map(d => ({ Crop:d.Crop, Date:new Date(d.Date), Price:+d.Price }));
        render(buildLatest(data));
    }

    try {
        await tryExcel().catch(err => { console.info('Excel price load failed, fallback CSV', err.message); return fallbackCsv(); });
    } catch(e){
        console.error('Price load fatal:', e);
        pricesContainer.innerHTML = '<p class="text-red-500">Could not load crop prices.</p>';
    }
});
