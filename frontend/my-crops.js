// my-crops.js - logic for my-crops.html page

document.addEventListener('DOMContentLoaded', () => {
    const addCropBtn = document.getElementById('add-crop-btn');
    const cropFormModal = document.getElementById('crop-form-modal');
    const cancelCropFormBtn = document.getElementById('cancel-crop-form');
    const cropForm = document.getElementById('crop-form');
    const cropCardsContainer = document.getElementById('crop-cards-container');
    const cropModalTitle = document.getElementById('crop-modal-title');

    const cropDetailsModal = document.getElementById('crop-details-modal');
    const closeDetailsModalBtn = document.getElementById('close-details-modal');
    const editCropBtn = document.getElementById('edit-crop-btn');
    const detailsCropName = document.getElementById('details-crop-name');
    const detailsCropInfo = document.getElementById('details-crop-info');
    const cropPhotoUpload = document.getElementById('crop-photo-upload');
    const analysisPrompt = document.getElementById('analysis-prompt');
    const analysisResult = document.getElementById('analysis-result');

    const cropStateSelect = document.getElementById('crop-state');
    const cropCitySelect = document.getElementById('crop-city');

    const indianStatesAndCities = {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
        "Karnataka": ["Bangalore", "Mysore", "Hubli"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra"],
        "Punjab": ["Amritsar", "Ludhiana", "Chandigarh"]
    };

    let crops = [
        { id: 1, name: 'Wheat', state: 'Punjab', city: 'Amritsar', date: '2024-01-10', status: 'Good' },
        { id: 2, name: 'Rice', state: 'Karnataka', city: 'Mysore', date: '2024-06-15', status: 'Excellent' }
    ];
    let nextCropId = 3;
    let editingCropId = null;

    function populateStates() {
        Object.keys(indianStatesAndCities).forEach(state => {
            const option = new Option(state, state);
            cropStateSelect.add(option);
        });
    }

    cropStateSelect.addEventListener('change', () => {
        const selectedState = cropStateSelect.value;
        cropCitySelect.innerHTML = '<option value="">Select a City</option>';
        if (selectedState && indianStatesAndCities[selectedState]) {
            cropCitySelect.disabled = false;
            indianStatesAndCities[selectedState].forEach(city => {
                const option = new Option(city, city);
                cropCitySelect.add(option);
            });
        } else {
            cropCitySelect.disabled = true;
        }
    });

    function renderCrops() {
        cropCardsContainer.innerHTML = '';
        crops.forEach(crop => {
            const card = document.createElement('div');
            card.className = 'bg-gray-800/50 p-6 rounded-2xl border border-white/10 cursor-pointer hover:border-green-500/40 hover:shadow-[0_0_0_1px_rgba(16,185,129,0.2)] transition';
            card.dataset.cropId = crop.id;
            const statusColors = { 'Excellent':'bg-green-500/20 text-green-400 border border-green-500/30', 'Good':'bg-green-400/15 text-green-300 border border-green-400/30', 'Fair':'bg-yellow-400/15 text-yellow-300 border border-yellow-400/30', 'Poor':'bg-orange-500/15 text-orange-400 border border-orange-500/30', 'Critical':'bg-red-600/15 text-red-500 border border-red-600/30', 'Pending Analysis':'bg-white/10 text-gray-300 border border-white/10' };
            const pill = `<span class="text-xs px-2 py-1 rounded-full ${statusColors[crop.status] || 'bg-white/10 text-gray-300 border border-white/10'}">${crop.status}</span>`;
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <h3 class="font-bold text-lg text-white pointer-events-none">${crop.name}</h3>
                    ${pill}
                </div>
                <p class="text-gray-400 text-sm mt-1 pointer-events-none">Planted: ${crop.date}</p>
                <div class="mt-4 pointer-events-none">
                    <p class="text-sm"><span class="font-medium text-gray-300">Field Location:</span> ${crop.city}, ${crop.state}</p>
                </div>`;
            card.addEventListener('click', () => openDetailsModal(crop.id));
            cropCardsContainer.appendChild(card);
        });
    }

    function openDetailsModal(cropId) {
        const crop = crops.find(c => c.id === cropId);
        editingCropId = crop.id;
        detailsCropName.textContent = crop.name;
        detailsCropInfo.textContent = `Planted on ${crop.date} at ${crop.city}, ${crop.state}`;
        analysisPrompt.style.display = 'block';
        analysisResult.style.display = 'none';
        analysisResult.innerHTML = '<p class="text-center text-lg">Analyzing...</p>';
        cropPhotoUpload.value = '';
        cropDetailsModal.classList.remove('hidden');
    }

    function openCropForm(cropId = null) {
        cropForm.reset();
        cropCitySelect.innerHTML = '<option value="">Select a State First</option>';
        cropCitySelect.disabled = true;
        if (cropId) {
            editingCropId = cropId;
            const crop = crops.find(c => c.id === cropId);
            cropModalTitle.textContent = 'Edit Crop';
            document.getElementById('crop-name').value = crop.name;
            document.getElementById('plant-date').value = crop.date;
            cropStateSelect.value = crop.state;
            cropStateSelect.dispatchEvent(new Event('change'));
            cropCitySelect.value = crop.city;
        } else {
            editingCropId = null;
            cropModalTitle.textContent = 'Add a New Crop';
        }
        cropDetailsModal.classList.add('hidden');
        cropFormModal.classList.remove('hidden');
    }

    addCropBtn.addEventListener('click', () => openCropForm());
    editCropBtn.addEventListener('click', () => openCropForm(editingCropId));
    cancelCropFormBtn.addEventListener('click', () => cropFormModal.classList.add('hidden'));

    cropForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            name: e.target['crop-name'].value,
            state: e.target['crop-state'].value,
            city: e.target['crop-city'].value,
            date: e.target['plant-date'].value,
        };
        if (editingCropId) {
            const idx = crops.findIndex(c => c.id === editingCropId);
            crops[idx] = { ...crops[idx], ...formData };
        } else {
            const newCrop = { id: nextCropId++, ...formData, status: 'Pending Analysis' };
            crops.push(newCrop);
        }
        renderCrops();
        cropFormModal.classList.add('hidden');
        editingCropId = null;
    });

    closeDetailsModalBtn.addEventListener('click', () => cropDetailsModal.classList.add('hidden'));

    cropPhotoUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            analysisPrompt.style.display = 'none';
            analysisResult.style.display = 'block';
            setTimeout(() => {
                const healthLevels = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];
                const randomHealth = healthLevels[Math.floor(Math.random() * healthLevels.length)];
                const idx = crops.findIndex(c => c.id === editingCropId);
                if (idx !== -1) { crops[idx].status = randomHealth; renderCrops(); }
                analysisResult.innerHTML = `
                    <p class="text-center text-gray-300 mb-2">Analysis Complete</p>
                    <p class="text-center text-3xl font-bold">${randomHealth}</p>
                    <p class="text-center text-sm text-gray-400 mt-2">Current Status has been updated.</p>`;
            }, 2000);
        }
    });

    populateStates();
    renderCrops();
});
