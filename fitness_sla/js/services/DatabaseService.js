// Dexie'yi import et
import Dexie from 'https://unpkg.com/dexie@latest/dist/modern/dexie.mjs';

class DatabaseService extends Dexie {
    constructor() {
        super('FitnessTrackerDB');
        
        // Veritabanı şemasını tanımla
        this.version(1).stores({
            users: 'id, lastLogin',
            workouts: '++id, userId, date, type',
            measurements: '++id, userId, date'
        });

        // Koleksiyonları tanımla
        this.users = this.table('users');
        this.workouts = this.table('workouts');
        this.measurements = this.table('measurements');

        // Otomatik olarak kullanıcı kontrolü yap
        this.initUser();
    }

    async initUser() {
        let userId = localStorage.getItem('userId');
        
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
            
            // Yeni kullanıcı oluştur
            await this.users.add({
                id: userId,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            });
        } else {
            // Kullanıcının son giriş zamanını güncelle
            await this.users.update(userId, {
                lastLogin: new Date().toISOString()
            });
        }

        // Mevcut verileri taşı
        await this.migrateExistingData(userId);
    }

    async migrateExistingData(userId) {
        try {
            // LocalStorage'dan verileri al
            const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
            const measurements = JSON.parse(localStorage.getItem('measurements') || '[]');

            // Bulk insert için verileri hazırla
            const workoutData = workouts.map(workout => ({
                ...workout,
                userId: userId
            }));

            const measurementData = measurements.map(measurement => ({
                ...measurement,
                userId: userId
            }));

            // Bulk insert işlemlerini gerçekleştir
            if (workoutData.length > 0) {
                await this.workouts.bulkAdd(workoutData);
            }
            if (measurementData.length > 0) {
                await this.measurements.bulkAdd(measurementData);
            }

            // Migrasyon başarılı olduysa localStorage'ı temizle
            localStorage.removeItem('workouts');
            localStorage.removeItem('measurements');
        } catch (error) {
            // Hata durumunda sessizce devam et
        }
    }

    // Antrenman işlemleri
    async saveWorkout(workout) {
        const userId = localStorage.getItem('userId');
        workout.userId = userId;
        return await this.workouts.add(workout);
    }

    async getWorkouts() {
        const userId = localStorage.getItem('userId');
        return await this.workouts
            .where('userId')
            .equals(userId)
            .reverse()
            .sortBy('date');
    }

    // Ölçüm işlemleri
    async saveMeasurement(measurement) {
        const userId = localStorage.getItem('userId');
        measurement.userId = userId;
        return await this.measurements.add(measurement);
    }

    async getMeasurements() {
        const userId = localStorage.getItem('userId');
        return await this.measurements
            .where('userId')
            .equals(userId)
            .reverse()
            .sortBy('date');
    }
}

// Global instance oluştur
window.db = new DatabaseService(); 