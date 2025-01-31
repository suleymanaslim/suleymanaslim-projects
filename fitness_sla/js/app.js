import { workoutTimer } from './workout.js';
import { statsManager } from './stats.js';

class Storage {
    static save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static get(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
}

class App {
    constructor() {
        this.workoutTimer = null;
        this.measurementManager = null;
        this.statsManager = null;
        this.init();
    }

    init() {
        // Global nesneleri window'a ata
        window.workoutTimer = workoutTimer;
        window.statsManager = statsManager;
        
        console.log('App başlatıldı');

        this.statsManager = window.statsManager || new StatsManager();
        this.measurementManager = new MeasurementManager();
        this.workoutTimer = window.workoutTimer || new WorkoutTimer();
        this.initializeServiceWorker();
        this.initializeTabs();
    }

    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker başarıyla kaydedildi:', registration);
                })
                .catch(error => {
                    console.log('Service Worker kaydı başarısız:', error);
                });
        }
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        const navTabs = document.querySelector('.nav-tabs');

        // Aktif tab'ı takip etmek için
        let currentTabIndex = 0;

        const switchTab = (index) => {
            // Önceki aktif tab'ı kaldır
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.display = 'none';
            });
            tabContents.forEach(content => content.classList.remove('active'));

            // Yeni tab'ı aktif et
            currentTabIndex = index;
            tabButtons[currentTabIndex].classList.add('active');
            tabButtons[currentTabIndex].style.display = 'block';
            tabContents[currentTabIndex].classList.add('active');

            // Stats tab'ı için özel işlem
            if (tabButtons[currentTabIndex].dataset.tab === 'stats' && this.statsManager) {
                this.statsManager.loadStats();
            }
        };

        // Ok tuşlarına tıklama
        navTabs.addEventListener('click', (e) => {
            const rect = navTabs.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            
            if (clickX < rect.width / 2) {
                // Sol ok tıklandı
                const prevIndex = (currentTabIndex - 1 + tabButtons.length) % tabButtons.length;
                switchTab(prevIndex);
            } else {
                // Sağ ok tıklandı
                const nextIndex = (currentTabIndex + 1) % tabButtons.length;
                switchTab(nextIndex);
            }
        });

        // İlk tab'ı aktif et
        switchTab(0);
    }
}

// App'i başlat
new App(); 