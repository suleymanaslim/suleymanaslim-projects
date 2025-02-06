class UserService {
    constructor() {
        this.dbName = 'FitnessTrackerDB';
        this.dbVersion = 1;
        this.db = null;
        this.userId = null;
        this.init();
    }

    async init() {
        this.userId = localStorage.getItem('userId');
        if (!this.userId) {
            this.userId = this.generateUserId();
            localStorage.setItem('userId', this.userId);
        }

        if (this.shouldInitDB()) {
            await this.initDB();
        }
    }

    shouldInitDB() {
        return false;
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    async initDB() {
        // IndexedDB'yi başlat
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Users store
            if (!db.objectStoreNames.contains('users')) {
                const userStore = db.createObjectStore('users', { keyPath: 'id' });
                userStore.createIndex('lastLogin', 'lastLogin', { unique: false });
            }

            // Workouts store - userId ile ilişkili
            if (!db.objectStoreNames.contains('workouts')) {
                const workoutStore = db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
                workoutStore.createIndex('userId', 'userId', { unique: false });
                workoutStore.createIndex('date', 'date', { unique: false });
            }

            // Measurements store - userId ile ilişkili
            if (!db.objectStoreNames.contains('measurements')) {
                const measurementStore = db.createObjectStore('measurements', { keyPath: 'id', autoIncrement: true });
                measurementStore.createIndex('userId', 'userId', { unique: false });
                measurementStore.createIndex('date', 'date', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            this.checkAndCreateUser();
        };
    }

    async checkAndCreateUser() {
        // Local storage'dan userId'yi kontrol et
        let userId = localStorage.getItem('userId');
        
        if (!userId) {
            // Yeni kullanıcı oluştur
            userId = this.generateUserId();
            const user = {
                id: userId,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            try {
                await this.addUser(user);
                localStorage.setItem('userId', userId);
            } catch (error) {
                console.error('Error creating user:', error);
            }
        } else {
            // Mevcut kullanıcının son giriş zamanını güncelle
            this.updateUserLastLogin(userId);
        }

        this.userId = userId;
        this.migrateExistingData(userId);
    }

    async addUser(user) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.add(user);

            request.onsuccess = () => resolve(user);
            request.onerror = () => reject(request.error);
        });
    }

    async updateUserLastLogin(userId) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const request = store.get(userId);

        request.onsuccess = () => {
            const user = request.result;
            if (user) {
                user.lastLogin = new Date().toISOString();
                store.put(user);
            }
        };
    }

    async migrateExistingData(userId) {
        // LocalStorage'daki mevcut verileri IndexedDB'ye taşı
        const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        const measurements = JSON.parse(localStorage.getItem('measurements') || '[]');

        // Her workout'a userId ekle
        for (const workout of workouts) {
            workout.userId = userId;
            await this.addWorkout(workout);
        }

        // Her measurement'a userId ekle
        for (const measurement of measurements) {
            measurement.userId = userId;
            await this.addMeasurement(measurement);
        }

        // Migrasyon tamamlandıktan sonra localStorage'ı temizle
        // localStorage.removeItem('workouts');
        // localStorage.removeItem('measurements');
    }

    async addWorkout(workout) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['workouts'], 'readwrite');
            const store = transaction.objectStore('workouts');
            const request = store.add(workout);

            request.onsuccess = () => resolve(workout);
            request.onerror = () => reject(request.error);
        });
    }

    async addMeasurement(measurement) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['measurements'], 'readwrite');
            const store = transaction.objectStore('measurements');
            const request = store.add(measurement);

            request.onsuccess = () => resolve(measurement);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserWorkouts() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['workouts'], 'readonly');
            const store = transaction.objectStore('workouts');
            const index = store.index('userId');
            const request = index.getAll(this.userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserMeasurements() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['measurements'], 'readonly');
            const store = transaction.objectStore('measurements');
            const index = store.index('userId');
            const request = index.getAll(this.userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Global instance oluştur
window.userService = new UserService(); 