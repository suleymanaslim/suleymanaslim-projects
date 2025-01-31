import { workoutTimer } from './workout.js';
import { statsManager } from './stats.js';
import { MeasurementManager } from './measurements.js';

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
        this.workoutTimer = workoutTimer;
        this.statsManager = statsManager;
        this.measurementManager = new MeasurementManager();
        this.init();
    }

    init() {
        this.initializeServiceWorker();
        this.initializeTabs();
        console.log('App başlatıldı');
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

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Tüm tabları ve içerikleri gizle
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Seçilen tabı ve içeriğini göster
                button.classList.add('active');
                document.getElementById(tabName).classList.add('active');

                // Stats tab'ı için özel işlem
                if (tabName === 'stats') {
                    this.statsManager.loadStats();
                }
            });
        });
    }
}

// App'i başlat
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 