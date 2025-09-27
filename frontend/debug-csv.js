// debug-csv.js - dev CSV debug page

document.addEventListener('DOMContentLoaded', () => {
    const debugInfo = document.getElementById('debug-info');
    const cropList = document.getElementById('crop-list');

    function updateDebug(message) {
        debugInfo.innerHTML += '<p>' + message + '</p>';
        console.log(message);
    }

    updateDebug('Starting CSV load test...');
    if (typeof d3 !== 'undefined') {
        updateDebug('D3.js version: ' + d3.version);
        d3.csv('crops.csv').then(raw => {
            updateDebug('✅ CSV loaded successfully!');
            updateDebug('Total rows: ' + raw.length);
            if (raw.length > 0) {
                updateDebug('First row structure: ' + JSON.stringify(raw[0]));
                const data = raw.map(d => ({ Crop:d.Crop, Date:new Date(d.Date), Price:+d.Price }));
                const uniqueCrops = [...new Set(data.map(d => d.Crop))];
                updateDebug('Unique crops found: ' + uniqueCrops.length);
                updateDebug('Crops: ' + uniqueCrops.join(', '));
                cropList.innerHTML = uniqueCrops.map(crop => {
                    const cropData = data.filter(d => d.Crop === crop);
                    const avg = (cropData.reduce((s,d)=>s+d.Price,0)/cropData.length).toFixed(2);
                    return `<div class="crop-item"><strong>${crop}</strong><br>Data points: ${cropData.length}<br>Avg Price: ₹${avg}</div>`;
                }).join('');
            } else {
                updateDebug('❌ CSV is empty');
            }
        }).catch(error => {
            updateDebug('❌ CSV loading failed: ' + error.message);
        });
    } else {
        updateDebug('❌ D3.js not loaded');
    }
});
