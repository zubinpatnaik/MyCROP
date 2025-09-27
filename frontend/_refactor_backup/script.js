const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Wheat',
            data: [65, 59, 80, 81, 56, 55, 40, 58, 70, 85, 90, 78],
            borderColor: '#2ECC71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#2ECC71'
        }, {
            label: 'Rice',
            data: [28, 48, 40, 19, 86, 27, 90, 65, 55, 42, 30, 22],
            borderColor: '#8A63D2',
            backgroundColor: 'rgba(138, 99, 210, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#8A63D2'
        }, {
            label: 'Potato',
            data: [45, 25, 50, 52, 58, 75, 78, 60, 65, 55, 42, 55],
            borderColor: '#39A1F7',
            backgroundColor: 'rgba(57, 161, 247, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#39A1F7'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: '#30363D'
                },
                ticks: {
                    color: '#8B949E'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#8B949E'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    color: '#C9D1D9',
                    usePointStyle: true,
                    boxWidth: 6
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const locationElement = document.getElementById('location');
    const temperatureElement = document.getElementById('temperature');
    const weatherElement = document.getElementById('weather');

    const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Dubai'];
    const weatherConditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Chance of Storms'];

    // Generate random weather data
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomTemp = Math.floor(Math.random() * 25) + 5; // Temp between 5°C and 29°C
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

    // Display the random data
    locationElement.textContent = randomCity;
    temperatureElement.textContent = `${randomTemp}°C`;
    weatherElement.textContent = randomWeather;
});