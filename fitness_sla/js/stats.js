class StatsManager {
    constructor() {
        this.charts = {};
        this.currentTab = null;
        this.measurements = [];
        
        // İsimleri düzelt
        this.fixExerciseNames();
        
        // DOMContentLoaded event'ini bekle
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Tab değişikliğini dinle
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                if (tabId === 'stats' && this.currentTab !== 'stats') {
                    this.currentTab = 'stats';
                    this.loadStats();
                } else if (tabId !== 'stats') {
                    this.currentTab = tabId;
                    this.destroyCharts();
                }
            });
        });

        // Filtre değişikliklerini dinle
        const filters = ['statsType', 'statsPeriod'];
        filters.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.loadStats());
            }
        });
    }

    loadStats() {
        this.destroyCharts();
        const type = document.getElementById('statsType')?.value || 'all';
        const period = document.getElementById('statsPeriod')?.value || 'all';

        // Vücut ölçümleri seçildiğinde
        if (type === 'measurements') {
            this.loadMeasurements();
            this.updateMeasurementStats();
            
            // Hareket bazlı istatistikleri gizle
            const exerciseStats = document.querySelector('.exercise-stats');
            if (exerciseStats) {
                exerciseStats.style.display = 'none';
            }
            
            // Antrenman sıklığı ve kardiyo grafiklerini gizle
            const frequencyChart = document.querySelector('[id="workoutFrequencyChart"]')?.parentNode;
            const cardioChart = document.querySelector('[id="cardioPerformanceChart"]')?.parentNode;
            if (frequencyChart) frequencyChart.style.display = 'none';
            if (cardioChart) cardioChart.style.display = 'none';
        } else {
            // Diğer seçenekler için grafikleri göster
            const frequencyChart = document.querySelector('[id="workoutFrequencyChart"]')?.parentNode;
            const cardioChart = document.querySelector('[id="cardioPerformanceChart"]')?.parentNode;
            if (frequencyChart) frequencyChart.style.display = 'block';
            if (cardioChart) cardioChart.style.display = 'block';

            const workouts = this.getFilteredWorkouts(type, period);
            this.updateSummaryStats(workouts);
            this.createCharts(workouts);
            
            // Hareket detaylarını göster/gizle
            const exerciseStats = document.querySelector('.exercise-stats');
            if (exerciseStats) {
                if (type !== 'all' && type !== 'measurements') {
                    this.updateExerciseStats(workouts);
                    exerciseStats.style.display = 'block';
                } else {
                    exerciseStats.style.display = 'none';
                }
            }
        }
    }

    loadMeasurements() {
        this.measurements = JSON.parse(localStorage.getItem('measurements') || '[]')
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                try {
                    chart.destroy();
                } catch (e) {
                    console.warn('Chart destroy error:', e);
                }
            }
        });
        this.charts = {};

        // Canvas'ları temizle
        ['workoutFrequencyChart', 'cardioPerformanceChart', 'bodyStatsChart'].forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const parent = canvas.parentNode;
                canvas.remove();
                const newCanvas = document.createElement('canvas');
                newCanvas.id = id;
                parent.appendChild(newCanvas);
            }
        });
    }

    createCharts(workouts) {
        // Antrenman sıklığı grafiği
        this.createWorkoutFrequencyChart(workouts);
        
        // Kardiyo performans grafiği
        this.createCardioChart(workouts);
        
        // Vücut ölçümü grafiğini oluştur
        this.loadMeasurements();
        this.createBodyStatsCharts();
    }

    createWorkoutFrequencyChart(workouts) {
        const canvas = document.getElementById('workoutFrequencyChart');
        if (!canvas) return;

        // Canvas'ı temizle ve yeniden oluştur
        const parent = canvas.parentNode;
        canvas.remove();
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'workoutFrequencyChart';
        parent.appendChild(newCanvas);

        const ctx = newCanvas.getContext('2d');
        const typeCount = workouts.reduce((acc, workout) => {
            acc[workout.type] = (acc[workout.type] || 0) + 1;
            return acc;
        }, {});

        this.charts.frequency = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeCount).map(type => {
                    switch(type) {
                        case 'göğüs': return 'Göğüs Antrenmanı';
                        case 'sırt': return 'Sırt Antrenmanı';
                        case 'bacak': return 'Bacak Antrenmanı';
                        default: return type;
                    }
                }),
                datasets: [{
                    data: Object.values(typeCount),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Antrenman Dağılımı'
                    }
                }
            }
        });
    }

    createCardioChart(workouts) {
        const canvas = document.getElementById('cardioPerformanceChart');
        if (!canvas) return;

        // Canvas'ı temizle ve yeniden oluştur
        const parent = canvas.parentNode;
        canvas.remove();
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'cardioPerformanceChart';
        parent.appendChild(newCanvas);

        const ctx = newCanvas.getContext('2d');
        const cardioData = workouts
            .filter(workout => workout.cardio?.completed)
            .map(workout => ({
                x: new Date(workout.date).getTime(),
                y: workout.cardio.duration || 0
            }))
            .sort((a, b) => a.x - b.x);

        if (cardioData.length === 0) return;

        this.charts.cardio = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Kardiyo Süresi (dk)',
                    data: cardioData,
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255,99,132,0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'dd/MM/yyyy'
                        },
                        title: {
                            display: true,
                            text: 'Tarih'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Süre (dk)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createBodyStatsCharts() {
        // Yağ oranı değişimi grafiği
        this.createFatPercentageChart();
        // Kas kütlesi değişimi grafiği
        this.createMuscleChart();
    }

    createFatPercentageChart() {
        const canvas = document.getElementById('bodyStatsChart');
        if (!canvas || this.measurements.length < 2) return;

        const ctx = canvas.getContext('2d');
        const data = this.measurements.map(m => ({
            x: new Date(m.date).getTime(),
            y: m.bodyFat || (m.bodyFat === 0 ? 0 : null)
        })).filter(d => d.y !== null).sort((a, b) => a.x - b.x);

        if (data.length === 0) return;

        this.charts.fatPercentage = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Vücut Yağ Oranı (%)',
                    data: data,
                    borderColor: '#FF6384',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'dd/MM/yyyy'
                        },
                        title: {
                            display: true,
                            text: 'Tarih'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Yağ Oranı (%)'
                        }
                    }
                }
            }
        });
    }

    createMuscleChart() {
        const canvas = document.getElementById('muscleStatsChart');
        if (!canvas || this.measurements.length < 2) return;

        const ctx = canvas.getContext('2d');
        const data = this.measurements.map(m => ({
            x: new Date(m.date).getTime(),
            y: this.calculateTotalMuscle(m)
        })).filter(d => d.y > 0).sort((a, b) => a.x - b.x);

        if (data.length === 0) return;

        this.charts.muscleStats = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Toplam Kas Kütlesi (kg)',
                    data: data,
                    borderColor: '#36A2EB',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'dd/MM/yyyy'
                        },
                        title: {
                            display: true,
                            text: 'Tarih'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Kas Kütlesi (kg)'
                        }
                    }
                }
            }
        });
    }

    calculateTotalMuscle(measurement) {
        // Ölçüm nesnesinin yapısını kontrol et
        if (measurement.leftArm) {
            // Yeni veri yapısı
            return (
                parseFloat(measurement.leftArm.muscle || 0) +
                parseFloat(measurement.rightArm.muscle || 0) +
                parseFloat(measurement.torso.muscle || 0) +
                parseFloat(measurement.leftLeg.muscle || 0) +
                parseFloat(measurement.rightLeg.muscle || 0)
            );
        } else {
            // Eski veri yapısı
            return (
                parseFloat(measurement.leftArmMuscle || 0) +
                parseFloat(measurement.rightArmMuscle || 0) +
                parseFloat(measurement.torsoMuscle || 0) +
                parseFloat(measurement.leftLegMuscle || 0) +
                parseFloat(measurement.rightLegMuscle || 0)
            );
        }
    }

    updateSummaryStats(workouts) {
        const type = document.getElementById('statsType')?.value;
        
        const elements = {
            totalWorkouts: document.getElementById('totalWorkouts'),
            totalDuration: document.getElementById('totalDuration'),
            totalCalories: document.getElementById('totalCalories'),
            totalCardio: document.getElementById('totalCardio')
        };

        // Vücut ölçümleri seçiliyse farklı başlıklar göster
        if (type === 'measurements') {
            if (this.measurements.length > 0) {
                const latest = this.measurements[this.measurements.length - 1];
                const first = this.measurements[0];
                
                this.updateMeasurementSummaryCards(elements, latest, first);
            }
        } else {
            // Antrenman istatistikleri için başlıkları güncelle
            if (elements.totalWorkouts) {
                elements.totalWorkouts.previousElementSibling.textContent = 'Toplam Antrenman';
            }
            if (elements.totalDuration) {
                elements.totalDuration.previousElementSibling.textContent = 'Toplam Süre';
            }
            if (elements.totalCalories) {
                elements.totalCalories.previousElementSibling.textContent = 'Yakılan Kalori';
            }
            if (elements.totalCardio) {
                elements.totalCardio.previousElementSibling.textContent = 'Kardiyo Süresi';
            }

            // Antrenman istatistiklerini hesapla ve göster
            this.calculateAndDisplayWorkoutStats(workouts, elements);
        }
    }

    getFilteredWorkouts(type, period) {
        const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        if (!workouts.length) return [];

        return workouts.filter(workout => {
            if (!workout?.date) return false;

            const workoutDate = new Date(workout.date);
            const now = new Date();

            // Tip filtresi
            if (type !== 'all' && workout.type !== type) return false;

            // Zaman filtresi
            switch (period) {
                case 'week':
                    return workoutDate >= new Date(now - 7 * 24 * 60 * 60 * 1000);
                case 'month':
                    return workoutDate.getMonth() === now.getMonth() && 
                           workoutDate.getFullYear() === now.getFullYear();
                case 'year':
                    return workoutDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    }

    updateExerciseStats(workouts) {
        const container = document.getElementById('exerciseProgress');
        if (!container) return;

        const exerciseStats = this.calculateExerciseStats(workouts);
        
        // Debug için hareket isimlerini konsola yazdır
        console.log('Mevcut hareketler:', Object.keys(exerciseStats));

        // Hareket resimlerinin eşleştirmesi - tam olarak workout.js'deki isimlerle eşleşmeli
        const exerciseImageMap = {
            'Incline Dumbbell Bench Press': 'incline-db-press',
            'Flat Dumbbell Bench Press': 'flat-db-press',
            'Chest Press': 'chest-press',
            'Chest Fly': 'chest-fly',
            'Dumbbell Overhead Press': 'overhead-press',
            
            // Sırt hareketleri
            'T Bar Row': 't-bar-row',
            'Back Row': 'back-row',
            'Lat Pulldown': 'lat-pulldown',
            'Supported Pull Up': 'pull-up',
            'Biceps Dropset': 'biceps-dropset',
            'Biceps Superset': 'biceps-superset',
            'Lateral Raise': 'lateral-raise',
            'Triceps Pushdown Rope': 'triceps-rope',
            'Triceps Pushdown Bar': 'triceps-bar',
            'Skull Crusher': 'skull-crusher',
            
            // Bacak hareketleri
            'Deadlift': 'deadlift',
            'Hack Squat': 'hack-squat',
            'Leg Extension': 'leg-extension',
            'Leg Curl': 'leg-curl',
            'Abduction': 'abduction'
        };
        
        container.innerHTML = Object.values(exerciseStats).map(stats => {
            const failureRate = ((stats.failureSets / stats.totalWorkouts) * 100).toFixed(1);
            const previousMax = stats.previousMaxWeight ? 
                `<div class="previous-max">Önceki: ${stats.previousMaxWeight} kg</div>` : '';
            
            // Hareket adını direkt olarak kullan (case-sensitive)
            const imagePath = `./assets/images/exercises/${exerciseImageMap[stats.name]}.png`;
            
            console.log(`${stats.name} için resim yolu:`, imagePath); // Debug için

            return `
            <div class="exercise-progress-card">
                <div class="exercise-header">
                    <div class="exercise-image">
                        <img src="${imagePath}" 
                             alt="${stats.name}"
                             style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                    <div class="exercise-title">
                        <h4>${stats.name}</h4>
                        <div class="weight-progress">
                            <div class="current-max">${stats.maxWeight} kg</div>
                            ${previousMax}
                        </div>
                    </div>
                </div>
                <div class="exercise-stats">
                    <div class="stat-item">
                        <div class="stat-value">${(stats.totalSets / stats.totalWorkouts).toFixed(1)}</div>
                        <div class="stat-label">Ortalama Set</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${(stats.totalReps / stats.totalSets).toFixed(1)}</div>
                        <div class="stat-label">Ortalama Tekrar</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${failureRate}%</div>
                        <div class="stat-label">Tükeniş Oranı</div>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${failureRate}%"></div>
                </div>
            </div>`;
        }).join('');
    }

    calculateExerciseStats(workouts) {
        const stats = {};
        
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (!stats[exercise.name]) {
                    stats[exercise.name] = {
                        name: exercise.name,
                        maxWeight: 0,
                        previousMaxWeight: 0,
                        totalSets: 0,
                        totalReps: 0,
                        failureSets: 0,
                        totalWorkouts: 0
                    };
                }

                const exerciseStats = stats[exercise.name];
                exerciseStats.totalWorkouts++;

                exercise.sets.forEach(set => {
                    exerciseStats.totalSets++;
                    exerciseStats.totalReps += set.reps;
                    
                    if (set.weight > exerciseStats.maxWeight) {
                        exerciseStats.previousMaxWeight = exerciseStats.maxWeight;
                        exerciseStats.maxWeight = set.weight;
                    }
                    
                    if (set.failure) {
                        exerciseStats.failureSets++;
                    }
                });
            });
        });

        return stats;
    }

    updateMeasurementStats() {
        if (this.measurements.length > 0) {
            const latest = this.measurements[this.measurements.length - 1];
            const first = this.measurements[0];

            // Özet kartlarını güncelle
            const elements = {
                totalWorkouts: document.getElementById('totalWorkouts'),
                totalDuration: document.getElementById('totalDuration'),
                totalCalories: document.getElementById('totalCalories'),
                totalCardio: document.getElementById('totalCardio')
            };

            if (elements.totalWorkouts) {
                elements.totalWorkouts.textContent = `${latest.weight.toFixed(1)} kg`;
                elements.totalWorkouts.previousElementSibling.textContent = 'Güncel Kilo';
            }

            if (elements.totalDuration) {
                const weightChange = latest.weight - first.weight;
                const sign = weightChange > 0 ? '+' : '';
                elements.totalDuration.textContent = `${sign}${weightChange.toFixed(1)} kg`;
                elements.totalDuration.previousElementSibling.textContent = 'Kilo Değişimi';
            }

            if (elements.totalCalories) {
                const fatChange = latest.bodyFat - first.bodyFat;
                const sign = fatChange > 0 ? '+' : '';
                elements.totalCalories.textContent = `${sign}${fatChange.toFixed(1)}%`;
                elements.totalCalories.previousElementSibling.textContent = 'Yağ Oranı Değişimi';
            }

            if (elements.totalCardio) {
                const latestMuscle = this.calculateTotalMuscle(latest);
                const firstMuscle = this.calculateTotalMuscle(first);
                const muscleChange = latestMuscle - firstMuscle;
                const sign = muscleChange > 0 ? '+' : '';
                elements.totalCardio.textContent = `${sign}${muscleChange.toFixed(1)} kg`;
                elements.totalCardio.previousElementSibling.textContent = 'Kas Kütlesi Değişimi';
            }

            // Grafikleri oluştur
            this.createBodyStatsCharts();
        }
    }

    createBodyCompositionChart() {
        const canvas = document.getElementById('bodyStatsChart');
        if (!canvas || this.measurements.length < 2) return;

        const ctx = canvas.getContext('2d');
        const latest = this.measurements[this.measurements.length - 1];
        const first = this.measurements[0];

        // Bölgesel yağ değişimleri
        const regions = {
            'Sol Kol': {
                fat: latest.leftArmFatPercentage - first.leftArmFatPercentage,
                muscle: latest.leftArmMuscle - first.leftArmMuscle
            },
            'Sağ Kol': {
                fat: latest.rightArmFatPercentage - first.rightArmFatPercentage,
                muscle: latest.rightArmMuscle - first.rightArmMuscle
            },
            'Gövde': {
                fat: latest.torsoFatPercentage - first.torsoFatPercentage,
                muscle: latest.torsoMuscle - first.torsoMuscle
            },
            'Sol Bacak': {
                fat: latest.leftLegFatPercentage - first.leftLegFatPercentage,
                muscle: latest.leftLegMuscle - first.leftLegMuscle
            },
            'Sağ Bacak': {
                fat: latest.rightLegFatPercentage - first.rightLegFatPercentage,
                muscle: latest.rightLegMuscle - first.rightLegMuscle
            }
        };

        this.charts.bodyComposition = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(regions),
                datasets: [
                    {
                        label: 'Yağ Değişimi (%)',
                        data: Object.values(regions).map(r => r.fat.toFixed(1)),
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 1
                    },
                    {
                        label: 'Kas Değişimi (kg)',
                        data: Object.values(regions).map(r => r.muscle.toFixed(1)),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgb(54, 162, 235)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Değişim'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                const sign = value > 0 ? '+' : '';
                                return `${label}: ${sign}${value}`;
                            }
                        }
                    }
                }
            }
        });
    }

    calculateAndDisplayWorkoutStats(workouts, elements) {
        if (!Object.values(elements).every(el => el)) return;

        // Toplam antrenman sayısı
        elements.totalWorkouts.textContent = workouts.length;

        // Toplam süre
        const totalMinutes = workouts.reduce((total, workout) => {
            if (!workout.duration) return total;
            const [hours, minutes] = workout.duration.split(':').map(Number);
            return total + (hours * 60) + minutes;
        }, 0);
        elements.totalDuration.textContent = 
            `${Math.floor(totalMinutes / 60)} saat ${totalMinutes % 60} dk`;

        // Toplam kalori
        const totalCalories = workouts.reduce((total, workout) => 
            total + (workout.cardio?.calories || 0), 0);
        elements.totalCalories.textContent = `${totalCalories} kcal`;

        // Toplam kardiyo
        const totalCardio = workouts.reduce((total, workout) => 
            total + (workout.cardio?.duration || 0), 0);
        elements.totalCardio.textContent = `${totalCardio} dk`;
    }

    // Stats.js'e bir fonksiyon ekleyelim
    fixExerciseNames() {
        const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                // Yanlış yazılmış isimleri düzelt
                if (exercise.name === 'Incline Dumbell Bench Press') {
                    exercise.name = 'Incline Dumbbell Bench Press';
                }
                if (exercise.name === 'Flat Dumbell Bench Press') {
                    exercise.name = 'Flat Dumbbell Bench Press';
                }
            });
        });
        
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }
}

// Global instance'ı oluştur
window.addEventListener('DOMContentLoaded', () => {
    window.statsManager = new StatsManager();
}); 