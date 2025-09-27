// main.js - logic for main dashboard page

document.addEventListener('DOMContentLoaded', () => {
    // Weather Card Logic
    const locationElement = document.getElementById('location');
    const temperatureElement = document.getElementById('temperature');
    const weatherElement = document.getElementById('weather');
    const forecastElement = document.getElementById('forecast');

    const indianStates = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
    const weatherConditions = {
        'Sunny': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-yellow-400"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        'Partly Cloudy': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-400"><path d="M12 22a7 7 0 0 0 4.9-2.1L12 15l-4.9 4.9A7 7 0 0 0 12 22z"/><path d="M17.2 15.2a4.6 4.6 0 0 0-3.5-3.5C14.5 11.2 16 9.2 16 7a5 5 0 0 0-10 0c0 2.2 1.5 4.2 2.3 4.7a4.6 4.6 0 0 0-3.5 3.5H1v1h22v-1h-5.8z"/></svg>',
        'Cloudy': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-500"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
        'Rainy': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-blue-400"><path d="M16 13v8"/><path d="M12 13v8"/><path d="M8 13v8"/><path d="M20 17.5a2.5 2.5 0 0 0-2.24-2.45c0-2.5-1.82-4.55-4.26-4.55-2.31 0-4.11 1.84-4.25 4.23A2.5 2.5 0 0 0 4 17.5Z"/></svg>',
        'Chance of Storms': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-purple-400"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m10.72 11.5-3.22 6.5 6-3-3.22-6.5-2.56 3Z"/></svg>'
    };
    const weatherKeys = Object.keys(weatherConditions);

    const randomCity = indianStates[Math.floor(Math.random() * indianStates.length)];
    const randomTemp = Math.floor(Math.random() * 25) + 5;
    const randomWeatherKey = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
    locationElement.textContent = randomCity;
    temperatureElement.textContent = `${randomTemp}°C`;
    weatherElement.innerHTML = `${weatherConditions[randomWeatherKey]} <span class="ml-2">${randomWeatherKey}</span>`;
    weatherElement.classList.add('flex', 'items-center');

    forecastElement.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
        const day = new Date();
        day.setDate(day.getDate() + i);
        const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
        const futureWeatherKey = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
        const futureTemp = randomTemp - Math.floor(Math.random() * 5) + 2;
        const forecastItem = `\n            <div class="flex items-center justify-between text-sm">\n                <span class="text-gray-400">${dayName}</span>\n                ${weatherConditions[futureWeatherKey]}\n                <span class="font-medium text-white">${futureTemp}°C</span>\n            </div>\n        `;
        forecastElement.insertAdjacentHTML('beforeend', forecastItem);
    }

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
              cityFilter.addEventListener('change', (e)=>{ localStorage.setItem('selectedCity', e.target.value); onChange(); });
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
});
