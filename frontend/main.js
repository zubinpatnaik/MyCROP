// main.js - logic for main dashboard page

document.addEventListener('DOMContentLoaded', () => {
    // Weather Card Logic
    const locationElement = document.getElementById('location');
    const temperatureElement = document.getElementById('temperature');
    const weatherElement = document.getElementById('weather');
    const forecastElement = document.getElementById('forecast');

    const indianCities = ['Mumbai','Delhi','Bangalore','Kolkata','Chennai','Hyderabad','Pune','Ahmedabad','Jaipur','Lucknow'];

    // Monthly average temperatures (°C) rough approximations (Jan..Dec)
    const monthlyAverages = {
        Mumbai:     [24,25,27,29,30,29,28,28,28,28,27,25],
        Delhi:      [14,16,22,28,33,34,31,30,29,24,19,15],
        Bangalore:  [21,23,25,27,27,25,24,24,24,23,22,21],
        Kolkata:    [18,20,26,29,31,30,29,29,29,27,23,19],
        Chennai:    [25,26,28,30,33,32,31,31,30,29,27,25],
        Hyderabad:  [20,22,26,29,32,30,28,28,28,26,23,20],
        Pune:       [18,20,24,27,30,27,25,24,24,23,20,18],
        Ahmedabad:  [20,22,27,32,35,34,32,31,31,29,24,21],
        Jaipur:     [15,18,24,30,34,34,32,31,30,27,21,16],
        Lucknow:    [14,16,22,28,33,33,31,30,29,26,20,15]
    };

    const weatherConditions = {
        'Sunny': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-yellow-400"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        'Partly Cloudy': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-400"><path d="M12 22a7 7 0 0 0 4.9-2.1L12 15l-4.9 4.9A7 7 0 0 0 12 22z"/><path d="M17.2 15.2a4.6 4.6 0 0 0-3.5-3.5C14.5 11.2 16 9.2 16 7a5 5 0 0 0-10 0c0 2.2 1.5 4.2 2.3 4.7a4.6 4.6 0 0 0-3.5 3.5H1v1h22v-1h-5.8z"/></svg>',
        'Cloudy': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-500"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
        'Rain Showers': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-blue-400"><path d="M16 13v6"/><path d="M12 13v8"/><path d="M8 13v5"/><path d="M20 17.5a2.5 2.5 0 0 0-2.24-2.45c0-2.5-1.82-4.55-4.26-4.55-2.31 0-4.11 1.84-4.25 4.23A2.5 2.5 0 0 0 4 17.5Z"/></svg>',
        'Thunderstorms': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-purple-400"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m10.72 11.5-3.22 6.5 6-3-3.22-6.5-2.56 3Z"/></svg>'
    };

    function getRealisticTemperature(city, date){
        const month = date.getMonth(); // 0-11
        const baseSeries = monthlyAverages[city] || monthlyAverages['Delhi'];
        const base = baseSeries[month];
        // Diurnal + random variance (±2.5°C approx)
        const variance = (Math.random()*5 - 2.5);
        // Slight warming in late afternoon (simulate 2-4 PM range)
        const hour = date.getHours();
        const diurnal = (hour >= 14 && hour <= 16) ? 1.5 : (hour < 7 ? -1 : 0);
        return Math.round((base + variance + diurnal) * 10)/10;
    }

    function deriveCondition(temp, month){
        const monsoon = month >=5 && month <=8; // Jun-Sep (0 index)
        if(monsoon){
            if(Math.random()<0.15) return 'Thunderstorms';
            if(Math.random()<0.55) return 'Rain Showers';
            return Math.random()<0.5 ? 'Cloudy' : 'Partly Cloudy';
        }
        if(temp >= 33) return 'Sunny';
        if(temp >= 30) return 'Partly Cloudy';
        if(temp >= 26) return 'Cloudy';
        return Math.random()<0.4 ? 'Partly Cloudy' : 'Sunny';
    }

    function renderWeather(city){
        const now = new Date();
        const currentTemp = getRealisticTemperature(city, now);
        const condition = deriveCondition(currentTemp, now.getMonth());
        locationElement.textContent = city;
        temperatureElement.textContent = `${currentTemp}°C`;
        weatherElement.innerHTML = `${weatherConditions[condition]} <span class="ml-2">${condition}</span>`;
        weatherElement.classList.add('flex','items-center');
        forecastElement.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const day = new Date(); day.setDate(day.getDate()+i); day.setHours(15);
            const t = getRealisticTemperature(city, day);
            const cond = deriveCondition(t, day.getMonth());
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            const forecastItem = `\n            <div class="flex items-center justify-between text-sm">\n                <span class="text-gray-400">${dayName}</span>\n                ${weatherConditions[cond]}\n                <span class="font-medium text-white">${t}°C</span>\n            </div>\n        `;
            forecastElement.insertAdjacentHTML('beforeend', forecastItem);
        }
    }

    // Initial render (use stored city if exists, else random)
    const storedCity = localStorage.getItem('selectedCity');
    const initialCity = storedCity && indianCities.includes(storedCity) ? storedCity : indianCities[Math.floor(Math.random()*indianCities.length)];
    renderWeather(initialCity);

    // Crop Health Logic
    const healthStatusText = document.getElementById('health-status-text');
    const healthBar = document.getElementById('health-bar');
    const fieldAddress = document.getElementById('field-address');
    const fieldSize = document.getElementById('field-size');

    const healthLevels = {
        'Critical': { percentage: '10%', color: 'bg-red-600' },
        'Poor': { percentage: '30%', color: 'bg-yellow-500' },
        'Fair': { percentage: '50%', color: 'bg-yellow-400' },
        'Good': { percentage: '75%', color: 'bg-green-400' },
        'Excellent': { percentage: '100%', color: 'bg-green-500' }
    };
    const healthKeys = Object.keys(healthLevels);
    const addresses = [
        '123 Green Valley, Punjab',
        '456 Harvest Lane, Haryana',
        '789 Farm Road, Uttar Pradesh',
        '101 Fertile Field, Madhya Pradesh',
        '212 Orchard Ave, Maharashtra'
    ];

    const randomHealthKey = healthKeys[Math.floor(Math.random() * healthKeys.length)];
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
    const randomSize = (Math.random() * 20 + 5).toFixed(1);

    healthStatusText.textContent = randomHealthKey;
    healthBar.style.width = healthLevels[randomHealthKey].percentage;
    healthBar.className = `h-2.5 rounded-full ${healthLevels[randomHealthKey].color}`;
    fieldAddress.textContent = randomAddress;
    fieldSize.textContent = `${randomSize} hectares`;

    // Farmer Info Logic
    const farmerPfp = document.getElementById('farmer-pfp');
    const farmerName = document.getElementById('farmer-name');
    const farmerId = document.getElementById('farmer-id');
    const welcomeHeader = document.getElementById('welcome-header');

    const fixedFarmerName = 'Zubin Patnaik';
    const randomFarmerId = `WAK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    farmerPfp.src = '1741538149835.jpg';
    farmerName.textContent = fixedFarmerName;
    farmerId.textContent = `ID: ${randomFarmerId}`;
    welcomeHeader.textContent = `Welcome, ${fixedFarmerName}`;

    // File Upload Logic (guard)
    const fileUploadInput = document.getElementById('file-upload');
    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                console.log('File selected:', file.name);
                alert(`You selected: ${file.name}`);
            }
        });
    }

    // Chart + CSV Logic
    const headerSubtitle = document.getElementById('header-subtitle');
    const cropTicker = document.getElementById('crop-ticker');
    const cropTickerWrap = document.getElementById('crop-ticker-wrap');

    const chartColors = [
        '#34d399', '#818cf8', '#a78bfa', '#f87171', '#fbbf24',
        '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'
    ];

    function initChart() {
        const canvas = document.getElementById('lastYearChart');
        if (!canvas) { headerSubtitle.textContent = 'Chart canvas not found'; return; }
        const ctx = canvas.getContext('2d');
        if (!ctx) { headerSubtitle.textContent = 'Chart context error'; return; }

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top', align: 'start', labels: { color: '#9ca3af', usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 12, font: { family: 'Poppins', size: 11 } } } },
            elements: { line: { tension: 0.2, borderWidth: 2 }, point: { radius: 2, hitRadius: 6, hoverRadius: 4 } },
            interaction: { mode: 'index', intersect: false },
            scales: { y: { beginAtZero: false, grid: { color: 'rgba(107,114,128,0.3)' }, ticks: { color: '#9ca3af', font: { size: 11 } }, title: { display: true, text: 'Price (₹ per Quintal)', color: '#9ca3af', font: { size: 12 } } }, x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } } }
        };

        if (typeof Chart === 'undefined') { headerSubtitle.textContent = 'Chart library not loaded'; return; }

        const chart = new Chart(ctx, { type: 'line', data: { labels: [], datasets: [] }, options: chartOptions });

        loadCropData(chart);
    }

    function loadCropData(chart) {
        const fallbackData = [
            {Crop:'Wheat',Date:new Date('2024-01-15'),Price:21.50},{Crop:'Wheat',Date:new Date('2024-03-15'),Price:21.80},{Crop:'Wheat',Date:new Date('2024-06-15'),Price:22.90},{Crop:'Wheat',Date:new Date('2024-09-15'),Price:23.00},{Crop:'Wheat',Date:new Date('2024-12-15'),Price:24.00},
            {Crop:'Rice',Date:new Date('2024-01-15'),Price:34.00},{Crop:'Rice',Date:new Date('2024-03-15'),Price:34.20},{Crop:'Rice',Date:new Date('2024-06-15'),Price:35.50},{Crop:'Rice',Date:new Date('2024-09-15'),Price:35.80},{Crop:'Rice',Date:new Date('2024-12-15'),Price:37.00},
            {Crop:'Potato',Date:new Date('2024-01-15'),Price:17.00},{Crop:'Potato',Date:new Date('2024-03-15'),Price:17.20},{Crop:'Potato',Date:new Date('2024-06-15'),Price:19.00},{Crop:'Potato',Date:new Date('2024-09-15'),Price:19.20},{Crop:'Potato',Date:new Date('2024-12-15'),Price:21.00},
            {Crop:'Sugarcane',Date:new Date('2024-01-15'),Price:3.10},{Crop:'Sugarcane',Date:new Date('2024-03-15'),Price:3.12},{Crop:'Sugarcane',Date:new Date('2024-06-15'),Price:3.25},{Crop:'Sugarcane',Date:new Date('2024-09-15'),Price:3.28},{Crop:'Sugarcane',Date:new Date('2024-12-15'),Price:3.40},
            {Crop:'Jowar',Date:new Date('2024-01-15'),Price:28.00},{Crop:'Jowar',Date:new Date('2024-03-15'),Price:28.20},{Crop:'Jowar',Date:new Date('2024-06-15'),Price:29.50},{Crop:'Jowar',Date:new Date('2024-09-15'),Price:29.80},{Crop:'Jowar',Date:new Date('2024-12-15'),Price:31.00},
            {Crop:'Maize',Date:new Date('2024-01-15'),Price:20.50},{Crop:'Maize',Date:new Date('2024-03-15'),Price:20.70},{Crop:'Maize',Date:new Date('2024-06-15'),Price:21.60},{Crop:'Maize',Date:new Date('2024-09-15'),Price:21.80},{Crop:'Maize',Date:new Date('2024-12-15'),Price:22.80},
            {Crop:'Barley',Date:new Date('2024-01-15'),Price:23.00},{Crop:'Barley',Date:new Date('2024-03-15'),Price:23.20},{Crop:'Barley',Date:new Date('2024-06-15'),Price:24.20},{Crop:'Barley',Date:new Date('2024-09-15'),Price:24.30},{Crop:'Barley',Date:new Date('2024-12-15'),Price:25.30},
            {Crop:'Soybean',Date:new Date('2024-01-15'),Price:48.00},{Crop:'Soybean',Date:new Date('2024-03-15'),Price:48.20},{Crop:'Soybean',Date:new Date('2024-06-15'),Price:50.00},{Crop:'Soybean',Date:new Date('2024-09-15'),Price:50.20},{Crop:'Soybean',Date:new Date('2024-12-15'),Price:52.00},
            {Crop:'Mustard',Date:new Date('2024-01-15'),Price:52.00},{Crop:'Mustard',Date:new Date('2024-03-15'),Price:52.30},{Crop:'Mustard',Date:new Date('2024-06-15'),Price:53.80},{Crop:'Mustard',Date:new Date('2024-09-15'),Price:53.90},{Crop:'Mustard',Date:new Date('2024-12-15'),Price:55.20},
            {Crop:'Gram',Date:new Date('2024-01-15'),Price:41.00},{Crop:'Gram',Date:new Date('2024-03-15'),Price:41.20},{Crop:'Gram',Date:new Date('2024-06-15'),Price:42.40},{Crop:'Gram',Date:new Date('2024-09-15'),Price:42.50},{Crop:'Gram',Date:new Date('2024-12-15'),Price:43.80}
        ];

        function processData(data) {
            if (!data || !data.length) { headerSubtitle.textContent = 'No crop data available'; return; }
            const dataSorted = data.slice().sort((a,b)=>a.Date-b.Date);
            const labelDates = Array.from(new Set(dataSorted.map(d => new Date(d.Date.getFullYear(), d.Date.getMonth(), 1).getTime()))).sort((a,b)=>a-b).map(ms=>new Date(ms));
            const labels = labelDates.map(dt => dt.toLocaleString('default',{month:'short'}));

            const cropsMap = new Map();
            dataSorted.forEach(row => {
                const key = row.Crop;
                if (!cropsMap.has(key)) cropsMap.set(key, []);
                cropsMap.get(key).push(row);
            });
            const cropNames = Array.from(cropsMap.keys());

            const datasets = cropNames.map((cropName, index) => {
                const rows = cropsMap.get(cropName);
                const byMonth = new Map();
                rows.forEach(r => {
                    const k = new Date(r.Date.getFullYear(), r.Date.getMonth(), 1).getTime();
                    byMonth.set(k, r.Price);
                });
                const series = labelDates.map(dt => byMonth.get(dt.getTime()) ?? null);
                const color = chartColors[index % chartColors.length];
                return { label: cropName, data: series, borderColor: color, backgroundColor: color + '20', tension: 0.2, spanGaps: true, pointRadius: 2, pointHoverRadius: 5, fill: false, borderWidth: 2 };
            });

            chart.data.labels = labels;
            chart.data.datasets = datasets;
            chart.update();
            headerSubtitle.textContent = 'CROP PRICE TRENDS (₹ per Quintal)';
            buildTicker(cropsMap);
            try { updateQuickAnalysis(dataSorted); } catch(e){ console.warn('Quick analysis failed', e); }
        }

        function buildTicker(cropsMap) {
            if (!cropTicker) return;
            try {
                const latestPerCrop = Array.from(cropsMap.entries()).map(([name, rows]) => {
                    const s = rows.slice().sort((a,b)=>a.Date-b.Date);
                    const last = s[s.length-1];
                    const prev = s[s.length-2];
                    const pct = prev && prev.Price ? ((last.Price - prev.Price)/prev.Price)*100 : 0;
                    return { name, last:last.Price, pct };
                });
                const items = latestPerCrop.map(item => {
                    const up = item.pct >= 0; const arrow = up ? '▲' : '▼'; const color = up ? 'text-green-400' : 'text-red-400';
                    const pct = `${up?'+':''}${item.pct.toFixed(1)}%`; const price = `₹${item.last.toFixed(2)}`;
                    return `<span class="mx-8 ${color} font-semibold text-sm md:text-base tracking-wide">${item.name.toUpperCase()} ${arrow} ${pct} <span class="text-gray-300 font-normal ml-1">${price}</span></span>`;
                });
                cropTicker.innerHTML = items.join('');
                let offset = cropTickerWrap ? cropTickerWrap.clientWidth : 0; const speed = 1.2;
                function animate() { offset -= speed; cropTicker.style.transform = `translateX(${offset}px)`; const total = cropTicker.offsetWidth; if (offset + total < 0) offset = cropTickerWrap.clientWidth; requestAnimationFrame(animate); }
                animate();
            } catch (e) { console.warn('Ticker build failed', e); }
        }

        // New: Try Excel first if loader present
        const cityFilterWrap = document.getElementById('city-filter-wrap');
        const cityFilter = document.getElementById('city-filter');

        function populateCityFilter(cities, onChange){
            if(!cities.length){ cityFilterWrap.classList.add('hidden'); return; }
              const stored = localStorage.getItem('selectedCity') || '__ALL__';
              cityFilter.innerHTML = '<option value="__ALL__">All Cities (avg)</option>' + cities.map(c=>`<option value="${c}">${c}</option>`).join('');
            cityFilterWrap.classList.remove('hidden');
              if([...cityFilter.options].some(o=>o.value===stored)) cityFilter.value = stored;
            cityFilter.addEventListener('change', (e)=>{ 
                localStorage.setItem('selectedCity', e.target.value); 
                onChange(); 
                // Update weather using a concrete city when not averaging
                const cityForWeather = e.target.value === '__ALL__' ? (localStorage.getItem('selectedCityFallbackCity') || 'Delhi') : e.target.value;
                if(cityForWeather && cityForWeather !== '__ALL__'){
                    localStorage.setItem('selectedCityFallbackCity', cityForWeather);
                    if(typeof renderWeather === 'function') renderWeather(cityForWeather);
                }
            });
        }

        async function tryExcel(){
            if(!(window.ExcelDataLoader && typeof window.ExcelDataLoader.loadExcel === 'function')) throw new Error('Excel loader missing');
            const { rows, cities } = await window.ExcelDataLoader.loadExcel();
            if(!rows.length) throw new Error('No rows from Excel');
            // Keep original rows for filtering
            window._excelCropRows = rows;
            populateCityFilter(cities, () => rebuildFromExcel(chart));
            rebuildFromExcel(chart);
        }

        function rebuildFromExcel(chart){
            const rows = window._excelCropRows || [];
            if(!rows.length){ return; }
            const cityFilter = document.getElementById('city-filter');
            const chosen = cityFilter ? cityFilter.value : '__ALL__';
            let filtered;
            if(chosen && chosen !== '__ALL__') {
                filtered = rows.filter(r => r.City === chosen);
            } else if(chosen === '__ALL__') {
                // Average across cities per Crop+Date
                const map = new Map();
                for(const r of rows){
                    const key = r.Crop + '|' + r.Date.toISOString().slice(0,10);
                    if(!map.has(key)) map.set(key, { Crop:r.Crop, Date:r.Date, sum:r.Price, count:1 });
                    else { const m = map.get(key); m.sum += r.Price; m.count += 1; }
                }
                filtered = Array.from(map.values()).map(v => ({ Crop:v.Crop, Date:v.Date, Price: v.sum / v.count }));
            } else { filtered = rows; }
            // Normalize shape for processData
            const data = filtered.map(r => ({ Crop:r.Crop, Date:new Date(r.Date), Price:+r.Price }));
            processData(data);
        }

        try {
            tryExcel().catch(excelErr => {
                console.info('Excel load failed, falling back to CSV:', excelErr.message);
                // Fallback to CSV
                if (typeof d3 !== 'undefined') {
                    d3.csv('crops.csv').then(raw => {
                        if (raw && raw.length) {
                            // Detect optional City column for filtering
                            const hasCityCol = Object.keys(raw[0]).some(k => k.toLowerCase() === 'city');
                            if (hasCityCol) {
                                const mapped = raw.map(d => ({
                                    Crop: d.Crop,
                                    Date: new Date(d.Date),
                                    Price: +d.Price,
                                    City: d.City || d.city || null
                                }));
                                const cities = [...new Set(mapped.map(r => r.City).filter(Boolean))].sort();
                                if (cities.length) {
                                    window._excelCropRows = mapped; // reuse same storage & rebuild logic
                                    populateCityFilter(cities, () => rebuildFromExcel(chart));
                                    rebuildFromExcel(chart);
                                } else {
                                    const data = mapped.map(r => ({ Crop:r.Crop, Date:r.Date, Price:r.Price }));
                                    processData(data);
                                }
                            } else {
                                const data = raw.map(d => ({ Crop:d.Crop, Date:new Date(d.Date), Price:+d.Price }));
                                processData(data);
                            }
                        } else { processData(fallbackData); }
                    }).catch(err => { console.warn('CSV load failed, using fallback', err); processData(fallbackData); });
                } else { processData(fallbackData); }
            });
        } catch(e){ processData(fallbackData); }
    }

    // Initialize chart after slight delay
    setTimeout(initChart, 50);

        // ================= Quick Market Analysis Logic =================
        function updateQuickAnalysis(rows){
                const card = document.getElementById('quick-analysis-card');
                const grid = document.getElementById('qa-metrics');
                const updated = document.getElementById('qa-updated');
                if(!card || !grid || !rows || !rows.length) return;
                // Group by crop, track last 2 prices
                const byCrop = new Map();
                rows.forEach(r => {
                        const key = r.Crop;
                        if(!byCrop.has(key)) byCrop.set(key, []);
                        byCrop.get(key).push(r);
                });
                let summaries = [];
                byCrop.forEach((arr, crop) => {
                        const sorted = arr.slice().sort((a,b)=>a.Date-b.Date);
                        const last = sorted[sorted.length-1];
                        const prev = sorted[sorted.length-2];
                        const change = prev ? (last.Price - prev.Price) : 0;
                        const pct = prev && prev.Price ? (change/prev.Price)*100 : 0;
                        const avg = sorted.reduce((s,x)=>s+x.Price,0)/sorted.length;
                        summaries.push({ crop, last:last.Price, change, pct, avg });
                });
                if(!summaries.length){ grid.innerHTML = '<div class="col-span-2 text-gray-400">No data</div>'; return; }
                const topGainer = summaries.reduce((a,b)=> b.pct > a.pct ? b : a, summaries[0]);
                const topLoser = summaries.reduce((a,b)=> b.pct < a.pct ? b : a, summaries[0]);
                const highestPrice = summaries.reduce((a,b)=> b.last > a.last ? b : a, summaries[0]);
                const overallAvg = summaries.reduce((s,x)=> s + x.last, 0)/summaries.length;
                const formatPct = v => `${v>=0?'+':''}${v.toFixed(1)}%`;
                grid.innerHTML = `
                        <div>
                            <p class="text-gray-400 mb-0.5">Top Gainer</p>
                            <p class="font-semibold text-green-400 text-sm">${topGainer.crop} <span class="text-xs">${formatPct(topGainer.pct)}</span></p>
                        </div>
                        <div>
                            <p class="text-gray-400 mb-0.5">Top Loser</p>
                            <p class="font-semibold text-red-400 text-sm">${topLoser.crop} <span class="text-xs">${formatPct(topLoser.pct)}</span></p>
                        </div>
                        <div>
                            <p class="text-gray-400 mb-0.5">Highest Price</p>
                            <p class="font-semibold text-white text-sm">${highestPrice.crop} <span class="text-xs text-gray-400">₹${highestPrice.last.toFixed(2)}</span></p>
                        </div>
                        <div>
                            <p class="text-gray-400 mb-0.5">Overall Avg</p>
                            <p class="font-semibold text-white text-sm">₹${overallAvg.toFixed(2)}</p>
                        </div>
                `;
                if(updated) updated.textContent = new Date().toLocaleTimeString();
        }
    
    // ================= Satellite Field Health Widget (re-added) =================
    const satUpload = document.getElementById('satellite-upload');
    const satBaseCanvas = document.getElementById('satellite-base');
    const satOverlayCanvas = document.getElementById('satellite-overlay');
    const satLoading = document.getElementById('satellite-loading');
    const satToggleBtn = document.getElementById('toggle-overlay');
    const satStats = document.getElementById('satellite-stats');
    
    if (satUpload && satBaseCanvas && satOverlayCanvas) {
        const baseCtx = satBaseCanvas.getContext('2d');
        const overlayCtx = satOverlayCanvas.getContext('2d');
        let overlayVisible = true;
        const DEFAULT_SATELLITE_IMAGE = 'Screenshot 2025-09-30 110916.png'; // adjust name if needed
    const SATELLITE_OVERLAY_ENABLED = true; // overlay enabled by default; user can toggle visibility
        let userLoaded = false;

        function classifyValue(v){
            if (v < 0.05) return 0;      // red
            if (v < 0.25) return 1;      // yellow
            return 2;                    // green
        }
        function colorForClass(c){
            switch(c){
                case 0: return [220,38,38,180];
                case 1: return [234,179,8,170];
                default: return [34,197,94,170];
            }
        }
        function computeIndexAndRender(img){
            const maxWidth = 600;
            const scale = img.width > maxWidth ? maxWidth / img.width : 1;
            const w = Math.floor(img.width * scale);
            const h = Math.floor(img.height * scale);
            satBaseCanvas.width = w; satBaseCanvas.height = h;
            satOverlayCanvas.width = w; satOverlayCanvas.height = h;
            baseCtx.drawImage(img, 0, 0, w, h);
            if(!SATELLITE_OVERLAY_ENABLED){
                // If you ever flip flag to false, still show base image but keep button disabled
                satOverlayCanvas.style.display = 'none';
                if(satStats) satStats.textContent = 'Overlay disabled';
                if(satToggleBtn){ satToggleBtn.disabled = true; satToggleBtn.textContent = 'Overlay: Off'; }
                return;
            }
            const imageData = baseCtx.getImageData(0,0,w,h);
            const { data } = imageData;
            const overlayImage = overlayCtx.createImageData(w,h);
            let counts = [0,0,0];
            const stride = (w*h > 400000) ? 2 : 1;
            for (let y=0; y<h; y+=stride){
                for (let x=0; x<w; x+=stride){
                    const i = (y*w + x)*4;
                    const r = data[i];
                    const g = data[i+1];
                    const v = (g - r) / (g + r + 1e-6);
                    const cls = classifyValue(v);
                    counts[cls]++;
                    const [cr,cg,cb,ca] = colorForClass(cls);
                    overlayImage.data[i] = cr; overlayImage.data[i+1] = cg; overlayImage.data[i+2] = cb; overlayImage.data[i+3] = ca;
                }
            }
            overlayCtx.putImageData(overlayImage,0,0);
            const total = counts.reduce((a,b)=>a+b,0) || 1;
            const pct = counts.map(c=> (100*c/total).toFixed(1));
            if(satStats) satStats.textContent = `Healthy ${pct[2]}% | Moderate ${pct[1]}% | Poor ${pct[0]}%`;
            if(satToggleBtn){ satToggleBtn.disabled = false; satToggleBtn.textContent = 'Overlay: On'; }
        }
        function loadSatelliteFile(file){
            const url = URL.createObjectURL(file);
            const img = new Image();
            if(satLoading) satLoading.classList.remove('hidden');
            img.onload = () => { try { computeIndexAndRender(img); } finally { URL.revokeObjectURL(url); if(satLoading) satLoading.classList.add('hidden'); } };
            img.onerror = () => { if(satLoading) satLoading.classList.add('hidden'); };
            img.src = url;
        }
        satUpload.addEventListener('change', (e)=>{
            const file = e.target.files && e.target.files[0];
            if(file){ userLoaded = true; loadSatelliteFile(file); }
        });
        if(satToggleBtn){
            satToggleBtn.addEventListener('click', ()=>{
                overlayVisible = !overlayVisible;
                satOverlayCanvas.style.display = overlayVisible ? 'block' : 'none';
                satToggleBtn.textContent = `Overlay: ${overlayVisible ? 'On' : 'Off'}`;
            });
        }
        // Auto-load default image if available
        setTimeout(()=>{
            if(!userLoaded && DEFAULT_SATELLITE_IMAGE){
                fetch(DEFAULT_SATELLITE_IMAGE, { method: 'HEAD' })
                    .then(r => { if(r.ok){ const img = new Image(); if(satLoading) satLoading.classList.remove('hidden'); img.onload=()=>{ computeIndexAndRender(img); if(satLoading) satLoading.classList.add('hidden'); }; img.onerror=()=>{ if(satLoading) satLoading.classList.add('hidden'); }; img.src = DEFAULT_SATELLITE_IMAGE; }} )
                    .catch(()=>{});
            }
        }, 300);
    }

    // ================= Crop Image Diagnosis (disease prediction) =================
    const diagUpload = document.getElementById('diagnosis-upload');
    const diagPreview = document.getElementById('diagnosis-preview');
    const diagPlaceholder = document.getElementById('diagnosis-placeholder');
    const diagLoading = document.getElementById('diagnosis-loading');
    const diagResult = document.getElementById('diagnosis-result');
    const diagHealthWrap = document.getElementById('diagnosis-health');
    const diagHealthText = document.getElementById('diagnosis-health-text');
    const diagHealthBar = document.getElementById('diagnosis-health-bar');
    const diagReset = document.getElementById('diagnosis-reset');

    // Determine API base:
    // Priority: window.CROP_API_BASE (manual override) > file:// fallback to localhost:5001 > localhost hostnames > relative (same origin deploy)
    const API_BASE = (function(){
        try {
            if (window.CROP_API_BASE) return window.CROP_API_BASE.replace(/\/$/, '');
            if (location.protocol === 'file:') return 'http://localhost:5001';
            if (['localhost','127.0.0.1'].includes(location.hostname)) return 'http://localhost:5001';
            return ''; // deployed: assume reverse proxy / same origin
        } catch { return 'http://localhost:5001'; }
    })();
    console.log('[Diagnosis] Using API_BASE =', API_BASE || '(relative)');

    function resetDiagnosis(){
        if(diagPreview){ diagPreview.src=''; diagPreview.classList.add('hidden'); }
        if(diagPlaceholder) diagPlaceholder.classList.remove('hidden');
        if(diagResult) diagResult.innerHTML = '<p class="text-[11px]">Prediction result will appear here.</p>';
        if(diagHealthWrap){ diagHealthWrap.classList.add('hidden'); }
        if(diagHealthBar){ diagHealthBar.style.width = '0'; diagHealthBar.className = 'h-2 w-0 bg-green-400 transition-all duration-700'; }
        if(diagHealthText) diagHealthText.textContent = '--';
        if(diagReset) diagReset.disabled = true;
        if(diagUpload) diagUpload.value = '';
    }
    if(diagReset){ diagReset.addEventListener('click', ()=> resetDiagnosis()); }
    resetDiagnosis();

    function classifyHealthColor(score){
        if(score >= 80) return 'bg-green-500';
        if(score >= 60) return 'bg-green-400';
        if(score >= 40) return 'bg-yellow-400';
        if(score >= 20) return 'bg-orange-400';
        return 'bg-red-500';
    }

    async function runDiagnosis(file){
        if(!file || !diagResult) return;
        if(diagLoading) diagLoading.classList.remove('hidden');
        diagResult.innerHTML = '<p class="text-[11px] text-gray-400">Uploading & analyzing...</p>';
        try {
            const formData = new FormData();
            formData.append('file', file, file.name);
            const endpoint = `${API_BASE}/predict`;
            let resp;
            try {
                resp = await fetch(endpoint, { method:'POST', body: formData });
            } catch(networkErr){
                throw new Error('Failed to contact backend. Make sure the API is running on '+API_BASE+' (python backend/api.py)');
            }
            if(!resp.ok){
                // Differentiate 404 vs others
                if(resp.status === 404){
                    throw new Error('Endpoint /predict not found (did the server start with the new api.py?)');
                }
                throw new Error(`Server error ${resp.status}`);
            }
            const data = await resp.json();
            if(data.error) throw new Error(data.error);
            const { prediction, confidence, health_score } = data;
            const confPct = (confidence*100).toFixed(2);
            diagResult.innerHTML = `
                <p class="mb-1"><span class="text-gray-400">Predicted Disease:</span> <span class="font-semibold text-white">${prediction || 'Unknown'}</span></p>
                <p class="mb-1"><span class="text-gray-400">Model Confidence:</span> <span class="font-semibold text-white">${confPct}%</span></p>
                <p class="text-[10px] text-gray-500">Confidence is model's softmax probability. Health score is placeholder.</p>
            `;
            if(typeof health_score === 'number' && diagHealthWrap && diagHealthBar && diagHealthText){
                const hs = Math.max(0, Math.min(100, health_score));
                diagHealthWrap.classList.remove('hidden');
                diagHealthText.textContent = `${hs.toFixed(1)}%`;
                diagHealthBar.style.width = `${hs}%`;
                diagHealthBar.className = `h-2 rounded-full transition-all duration-700 ${classifyHealthColor(hs)}`;
            }
            if(diagReset) diagReset.disabled = false;
        } catch(err){
            console.error('[Diagnosis] Prediction failed:', err);
            const hints = `
                <ul class='mt-1 list-disc list-inside text-[10px] text-gray-500 space-y-0.5'>
                  <li>Start backend: python backend/api.py</li>
                  <li>If opened via file://, we assume http://localhost:5001</li>
                  <li>Override manually: window.CROP_API_BASE = 'http://localhost:5001'</li>
                  <li>Check /health in browser: ${API_BASE}/health</li>
                </ul>`;
            diagResult.innerHTML = `<p class="text-red-400 text-[11px]">Error: ${err.message}</p>${hints}`;
        } finally {
            if(diagLoading) diagLoading.classList.add('hidden');
        }
    }

    if(diagUpload){
        diagUpload.addEventListener('change', (e)=>{
            const file = e.target.files && e.target.files[0];
            if(!file) return;
            // preview
            const url = URL.createObjectURL(file);
            if(diagPreview){
                diagPreview.src = url;
                diagPreview.onload = () => { URL.revokeObjectURL(url); };
                diagPreview.classList.remove('hidden');
            }
            if(diagPlaceholder) diagPlaceholder.classList.add('hidden');
            runDiagnosis(file);
        });
    }
});
