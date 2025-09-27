// crops.js - logic for crops.html page

document.addEventListener('DOMContentLoaded', async () => {
    const pricesContainer = document.getElementById('prices-container');
    try {
        if (typeof d3 === 'undefined') throw new Error('D3 not loaded');
        const data = await d3.csv('crops.csv');
        const groups = d3.group(data.map(d => ({...d, Price:+d.Price, Date:new Date(d.Date)})), d => d.Crop);
        const latestPrices = [];
        for (const [crop, rows] of groups) {
            const sorted = rows.slice().sort((a,b)=>a.Date-b.Date);
            const last = sorted[sorted.length-1];
            const prev = sorted[sorted.length-2];
            const change = prev && prev.Price ? last.Price - prev.Price : 0;
            const pct = prev && prev.Price ? (change/prev.Price)*100 : 0;
            latestPrices.push({ crop, last, prev, change, pct });
        }
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
    } catch (error) {
        console.error('Error loading or parsing CSV:', error);
        pricesContainer.innerHTML = '<p class="text-red-500">Could not load crop prices. Please refresh.</p>';
    }
});
