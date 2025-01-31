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
    }

    init() {
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
        let currentTab = 'dashboard';

        // Tab değiştirme fonksiyonu
        const switchTab = (tabId) => {
            document.body.scrollIntoView({ behavior: 'smooth' });
            if (currentTab === tabId) return;
            
            console.log('Tab changing from:', currentTab, 'to:', tabId);
            currentTab = tabId;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            const button = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
            const selectedTab = document.getElementById(tabId);

            if (button && selectedTab) {
                button.classList.add('active');
                selectedTab.classList.add('active');
                
                if (tabId === 'stats' && this.statsManager) {
                    this.statsManager.loadStats();
                }
            }
        };

        // Ok tuşlarına tıklama olayı
        navTabs.addEventListener('click', (e) => {
            const activeTab = document.querySelector('.tab-btn.active');
            if (!activeTab) return;
            
            const navRect = navTabs.getBoundingClientRect();
            const clickX = e.clientX - navRect.left;
            
            // Sol ok tıklaması
            if (clickX < 40) {
                const currentIndex = Array.from(tabButtons).indexOf(activeTab);
                const prevIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
                const prevTabId = tabButtons[prevIndex].dataset.tab;
                switchTab(prevTabId);
            }
            // Sağ ok tıklaması
            else if (clickX > navRect.width - 40) {
                const currentIndex = Array.from(tabButtons).indexOf(activeTab);
                const nextIndex = (currentIndex + 1) % tabButtons.length;
                const nextTabId = tabButtons[nextIndex].dataset.tab;
                switchTab(nextTabId);
            }
        });

        // Tab butonlarına tıklama olayı
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = button.dataset.tab;
                switchTab(tabId);
            });
        });

        // Klavye navigasyonu
        document.addEventListener('keydown', (e) => {
            const activeTab = document.querySelector('.tab-btn.active');
            if (!activeTab) return;

            const currentIndex = Array.from(tabButtons).indexOf(activeTab);
            
            if (e.key === 'ArrowLeft') {
                const prevIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
                const prevTabId = tabButtons[prevIndex].dataset.tab;
                switchTab(prevTabId);
            } else if (e.key === 'ArrowRight') {
                const nextIndex = (currentIndex + 1) % tabButtons.length;
                const nextTabId = tabButtons[nextIndex].dataset.tab;
                switchTab(nextTabId);
            }
        });

        // Varsayılan tab'ı aktif et
        switchTab('dashboard');
    }
}

// Global app instance'ı oluştur
window.app = new App();

// Sadece init'i çağır
document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
}); 