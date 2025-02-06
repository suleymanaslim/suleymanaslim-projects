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
        this.currentTab = 'dashboard';
        this.quotes = [
            { text: "Başarı bir yolculuktur, varış noktası değil.", author: "Arthur Ashe" },
            { text: "Limit sadece zihninde.", author: "Arnold Schwarzenegger" },
            { text: "Acı geçici, vazgeçmek kalıcı.", author: "Lance Armstrong" },
            { text: "Mükemmel olmana gerek yok, başlamana gerek var.", author: "Zig Ziglar" },
            { text: "Yarının için bugün çalış.", author: "Jim Rohn" },
            { text: "Her şampiyon önce bir hayalperestti.", author: "Muhammad Ali" },
            { text: "Başarı her gün tekrarlanan küçük çabaların toplamıdır.", author: "Robert Collier" }
        ];        
    }

    init() {
        this.showLoadingScreen();
        this.statsManager = window.statsManager || new StatsManager();
        this.measurementManager = new MeasurementManager();
        this.workoutTimer = window.workoutTimer || new WorkoutTimer();
        this.initializeServiceWorker();
        this.initializeTabs();
    }

    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {})
                .catch(error => {});
        }
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        const navTabs = document.querySelector('.nav-tabs');

        let currentTabIndex = 0;

        const switchTab = (index) => {
            // Eğer antrenman modundaysa ve dashboard tab'ı değilse, geçişe izin verme
            if (document.body.classList.contains('workout-mode') && 
                tabButtons[index].dataset.tab !== 'dashboard') {
                Swal.fire({
                    title: 'Uyarı',
                    text: 'Antrenman devam ederken sadece dashboard sekmesini kullanabilirsiniz.',
                    icon: 'warning',
                    confirmButtonText: 'Tamam',
                    confirmButtonColor: '#FCCD00'
                });
                return;
            }

            // Tab değiştirme işlemleri
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.display = 'none';
            });
            tabContents.forEach(content => content.classList.remove('active'));

            currentTabIndex = index;
            tabButtons[currentTabIndex].classList.add('active');
            tabButtons[currentTabIndex].style.display = 'block';
            tabContents[currentTabIndex].classList.add('active');

            if (tabButtons[currentTabIndex].dataset.tab === 'stats' && this.statsManager) {
                this.statsManager.loadStats();
            }

            localStorage.setItem('activeTab', tabButtons[currentTabIndex].dataset.tab);
        };

        // Ok tuşlarına tıklama
        navTabs.addEventListener('click', (e) => {
            const rect = navTabs.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            
            // Tıklama alanını üçe böl: sol ok, orta, sağ ok
            if (clickX < width * 0.3) {
                // Sol ok tıklandı
                const prevIndex = (currentTabIndex - 1 + tabButtons.length) % tabButtons.length;
                switchTab(prevIndex);
            } else if (clickX > width * 0.7) {
                // Sağ ok tıklandı
                const nextIndex = (currentTabIndex + 1) % tabButtons.length;
                switchTab(nextIndex);
            }
            // Orta kısma tıklanırsa hiçbir şey yapma
        });

        // Sayfa yüklendiğinde antrenman kontrolü
        const workoutState = localStorage.getItem('workoutTimerState');
        if (workoutState) {
            const state = JSON.parse(workoutState);
            if (state.isRunning) {
                const dashboardIndex = Array.from(tabButtons)
                    .findIndex(btn => btn.dataset.tab === 'dashboard');
                switchTab(dashboardIndex);
                return;
            }
        }

        // Aktif tab'ı localStorage'dan al
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab) {
            const savedIndex = Array.from(tabButtons).findIndex(btn => btn.dataset.tab === savedTab);
            if (savedIndex !== -1) {
                switchTab(savedIndex);
                return;
            }
        }

        // İlk tab'ı aktif et
        switchTab(0);
    }

    showLoadingScreen() {
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        document.getElementById('motivationalQuote').textContent = randomQuote.text;
        document.getElementById('quoteAuthor').textContent = `- ${randomQuote.author}`;

        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            const container = document.querySelector('.container');
            
            loadingScreen.style.animation = 'fadeOut 0.5s ease-out forwards';
            container.style.display = 'block';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 2500);
    }
}

// Global app instance'ı oluştur
window.app = new App();

// Sadece init'i çağır
document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
}); 