class WorkoutTimer {
    constructor() {
        this.startTime = null;
        this.timer = null;
        this.isRunning = false;
        this.isPaused = false;
        this.workoutType = null;
        this.restTimer = null;
        this.workouts = {
            bacak: [
                { name: 'Deadlift', icon: 'deadlift.png' },
                { name: 'Hack Squat', icon: 'hack-squat.png' },
                { name: 'Leg Extension', icon: 'leg-extension.png' },
                { name: 'Leg Curl', icon: 'leg-curl.png' },
                { name: 'Abduction', icon: 'abduction.png' }
            ],
            göğüs: [
                { name: 'Incline Dumbbell Bench Press', icon: 'incline-db-press.png' },
                { name: 'Flat Dumbbell Bench Press', icon: 'flat-db-press.png' },
                { name: 'Chest Press', icon: 'chest-press.png' },
                { name: 'Chest Fly', icon: 'chest-fly.png' },
                { name: 'Dumbbell Overhead Press', icon: 'overhead-press.png' },
                { name: 'Lateral Raise', icon: 'lateral-raise.png' },
                { name: 'Triceps Pushdown Rope', icon: 'triceps-rope.png' },
                { name: 'Triceps Pushdown Bar', icon: 'triceps-bar.png' },
                { name: 'Skull Crusher', icon: 'skull-crusher.png' }
            ],
            sırt: [
                { name: 'Supported Pull Up', icon: 'pull-up.png' },
                { name: 'T Bar Row', icon: 't-bar-row.png' },
                { name: 'Back Row', icon: 'back-row.png' },
                { name: 'Lat Pulldown', icon: 'lat-pulldown.png' },
                { name: 'Biceps Superset', icon: 'biceps-superset.png', isSuperset: true },
                { name: 'Biceps Dropset', icon: 'biceps-dropset.png', isDropset: true }
            ]
        };
        this.notificationPermission = false;
        
        // DOM elementleri
        this.timerDisplay = document.querySelector('.timer-display');
        this.startButton = document.getElementById('startWorkout');
        this.pauseButton = document.getElementById('pauseWorkout');
        this.stopButton = document.getElementById('stopWorkout');
        this.restTimerDisplay = document.querySelector('.rest-timer');
        this.restModal = document.getElementById('restTimerModal');
        this.restTimeLeft = document.getElementById('restTimeLeft');
        
        this.timerSound = new Audio('./assets/sounds/timer-end.mp3');
        this.timerSound.volume = 0.3; // Ses seviyesini ayarlayabilirsiniz (0.0 - 1.0)
        
        this.requestNotificationPermission();
        this.initializeEventListeners();
        this.loadWorkouts();
        
        // Global window objesine referans ekle
        window.workoutTimer = this;
        
        // currentWorkout'u constructor'da tanımla
        this.currentWorkout = null;

        // Silme butonu event listener'ı
        const clearButton = document.getElementById('clearWorkouts');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.showClearConfirmation());
        }

        this.supabase = window.supabase;
    }
    
    async requestNotificationPermission() {
        if ("Notification" in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === "granted";
        }
    }

    showNotification(title, body) {
        if (this.notificationPermission) {
            new Notification(title, {
                body: body,
                icon: '/assets/icons/timer.png', // İkon ekleyebilirsiniz
                vibrate: [200, 100, 200]
            });
        }
    }
    
    initializeEventListeners() {
        // Antrenman tipi seçimi
        document.querySelectorAll('.workout-type-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.workout-type-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.workoutType = button.dataset.type;
            });
        });

        // Başlat butonu
        document.getElementById('startWorkout').addEventListener('click', () => {
            if (!this.workoutType) {
                this.showAlert('Uyarı', 'Lütfen bir antrenman tipi seçin!', 'warning');
                return;
            }
            this.startWorkout();
        });

        // Duraklat butonu
        document.getElementById('pauseWorkout').addEventListener('click', () => {
            if (this.isRunning) {
                if (this.isPaused) {
                    this.resumeWorkout();
                } else {
                    this.pauseWorkout();
                }
            }
        });

        // Bitir butonu
        document.getElementById('stopWorkout').addEventListener('click', () => {
            if (this.isRunning) {
                this.stopWorkout();
            }
        });

        // Mola butonları
        document.querySelectorAll('.rest-duration-btn').forEach(button => {
            button.addEventListener('click', () => {
                const duration = parseInt(button.dataset.duration);
                this.startRestTimer(duration);
            });
        });

        // Mola kontrolleri
        document.getElementById('cancelRest').addEventListener('click', () => this.stopRestTimer());
        document.getElementById('addMinute').addEventListener('click', () => this.addRestMinute());
    }
    
    startWorkout() {
        document.body.classList.add('workout-mode');
        this.isRunning = true;
        this.startTime = new Date();
        this.updateDisplay();

        document.getElementById('startWorkout').style.display = 'none';
        document.getElementById('pauseWorkout').style.display = 'inline-block';
        document.getElementById('stopWorkout').style.display = 'inline-block';
        document.querySelector('.rest-timer').style.display = 'block';

        this.timer = setInterval(() => this.updateDisplay(), 1000);
    }
    
    pauseWorkout() {
        this.isPaused = true;
        clearInterval(this.timer);
        document.getElementById('pauseWorkout').textContent = 'Devam Et';
        document.getElementById('pauseWorkout').classList.replace('btn-warning', 'btn-success');
    }
    
    resumeWorkout() {
        this.isPaused = false;
        this.timer = setInterval(() => this.updateDisplay(), 1000);
        document.getElementById('pauseWorkout').textContent = 'Duraklat';
        document.getElementById('pauseWorkout').classList.replace('btn-success', 'btn-warning');
    }
    
    stopWorkout() {
        document.body.classList.remove('workout-mode');
        clearInterval(this.timer);
        this.isRunning = false;
        this.showWorkoutSummary();
    }
    
    updateDisplay() {
        if (!this.startTime) return;

        const now = new Date();
        const diff = now - this.startTime;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        document.querySelector('.timer-display').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    startRestTimer(duration) {
        // Eğer mevcut bir mola sayacı varsa, onu temizle
        if (this.restTimer) {
            clearInterval(this.restTimer);
        }

        const modal = document.getElementById('restTimerModal');
        const timeLeftDisplay = document.getElementById('restTimeLeft');
        let timeLeft = duration;

        modal.style.display = 'block';
        
        const updateRestDisplay = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timeLeftDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        updateRestDisplay();

        this.restTimer = setInterval(() => {
            timeLeft--;
            updateRestDisplay();

            if (timeLeft <= 0) {
                this.stopRestTimer();
                // Ses çal
                const audio = new Audio('./assets/sounds/timer-end.mp3');
                audio.play();
            }
        }, 1000);
    }
    
    stopRestTimer() {
        if (this.restTimer) {
            clearInterval(this.restTimer);
            this.restTimer = null;
        }
        document.getElementById('restTimerModal').style.display = 'none';
    }
    
    addRestMinute() {
        const timeLeftDisplay = document.getElementById('restTimeLeft');
        const currentTime = timeLeftDisplay.textContent.split(':');
        let totalSeconds = parseInt(currentTime[0]) * 60 + parseInt(currentTime[1]) + 60;
        
        clearInterval(this.restTimer);
        this.startRestTimer(totalSeconds);
    }
    
    showWorkoutSummary() {
        clearInterval(this.timer);
        this.showNextExercise(0);
    }

    showNextExercise(index) {
        const exercises = this.workouts[this.workoutType];
        if (index >= exercises.length) {
            this.showCardioForm();
            return;
        }

        const exercise = exercises[index];
        let modalHTML = `
            <div class="modal" id="exerciseModal">
                <div class="modal-content exercise-modal">
                    <div class="exercise-header">
                        <h3>${exercise.name}</h3>
                    </div>
                    <div class="exercise-image-container">
                        <img src="./assets/images/exercises/${exercise.icon}" alt="${exercise.name}">
                    </div>
                    <form id="exerciseForm" class="exercise-form">
                        <div class="form-group">
                            <label>Toplam Set Sayısı:</label>
                            <input type="number" name="totalSets" min="1" required>
                        </div>
                        ${exercise.isSuperset ? `
                            <div class="superset-weights">
                                <div class="form-group">
                                    <label>Dambıl Ağırlığı (kg):</label>
                                    <input type="number" name="dumbbellWeight" min="0" step="0.5" required>
                                </div>
                                <div class="form-group">
                                    <label>Bar Ağırlığı (kg):</label>
                                    <input type="number" name="barWeight" min="0" step="0.5" required>
                                </div>
                            </div>
                        ` : `
                            <div class="form-group">
                                <label>Ağırlık (kg):</label>
                                <input type="number" name="weight" min="0" step="0.5" required>
                            </div>
                            <div class="checkbox-container">
                                <label>
                                    <input type="checkbox" name="hasWeightDrop" 
                                           onchange="workoutTimer.toggleWeightDrop(this)">
                                    Ağırlık Düşüşü Uygula
                                </label>
                            </div>
                            <div class="weight-drop-inputs" style="display: none;">
                                <div class="form-group">
                                    <input type="number" name="dropWeight" 
                                           placeholder="Düşülen Ağırlık (kg)" 
                                           min="0" step="0.5">
                                </div>
                                <div class="form-group">
                                    <input type="number" name="dropAfterSet" 
                                           placeholder="Kaçıncı Setten Sonra" 
                                           min="1">
                                </div>
                            </div>
                        `}
                        <div class="checkbox-container">
                            <label>
                                <input type="checkbox" name="toFailure" 
                                       onchange="workoutTimer.toggleFailureCheckbox(this)">
                                Tükeniş
                            </label>
                        </div>
                        <div class="form-group">
                            <input type="number" name="reps" 
                                   placeholder="Tekrar Sayısı">
                        </div>
                        <button type="submit" class="next-exercise-btn">
                            ${index === exercises.length - 1 ? 'Kardiyoya Geç ➔' : 'Sonraki Hareket ➔'}
                        </button>
                    </form>
                </div>
            </div>
        `;

        // Önceki modalı kaldır
        const oldModal = document.getElementById('exerciseModal');
        if (oldModal) oldModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('exerciseModal');
        modal.style.display = 'block';

        // Form submit event listener
        document.getElementById('exerciseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExerciseData(exercise, index);
            modal.remove();
            this.showNextExercise(index + 1);
        });
    }

    showCardioForm() {
        const modalHTML = `
            <div class="modal" id="exerciseModal">
                <div class="modal-content exercise-modal">
                    <div class="exercise-header">
                        <h3>Kardiyo</h3>
                    </div>
                    
                    <div class="exercise-image-container">
                        <img src="./assets/images/exercises/cardio.png" alt="Kardiyo">
                    </div>

                    <form id="cardioForm" class="exercise-form">
                        <div class="checkbox-container">
                            <label>
                                <input type="checkbox" name="didCardio" 
                                       onchange="workoutTimer.toggleCardioInputs(this)">
                                Kardiyo Yapıldı
                            </label>
                        </div>
                        
                        <div class="cardio-inputs" style="display: none;">
                            <div class="form-group">
                                <label>Süre (dakika):</label>
                                <input type="number" name="cardioTime" min="1" disabled>
                            </div>
                            <div class="form-group">
                                <label>Yakılan Kalori:</label>
                                <input type="number" name="cardioCalories" min="1" disabled>
                            </div>
                        </div>
                        
                        <button type="submit" class="next-exercise-btn">
                            Antrenmanı Bitir
                        </button>
                    </form>
                </div>
            </div>`;

        // Önceki modalı kaldır
        const oldModal = document.getElementById('exerciseModal');
        if (oldModal) oldModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('exerciseModal');
        modal.style.display = 'block';

        // Form submit event listener
        document.getElementById('cardioForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCardioData();
            modal.remove();
            this.saveWorkout();
        });
    }

    addSet() {
        const container = document.getElementById('setsContainer');
        const setCount = container.children.length + 1;
        
        const setHTML = `
            <div class="set-input">
                <h4>Set ${setCount}</h4>
                <div class="input-group">
                    <div class="form-group">
                        <label>Kilo (kg):</label>
                        <input type="number" name="weight" min="0" step="0.5" required>
                    </div>
                    <div class="form-group">
                        <label>Tekrar:</label>
                        <div class="rep-input">
                            <input type="number" name="reps" min="1">
                            <label class="checkbox-container">
                                <input type="checkbox" name="toFailure">
                                <span class="checkmark"></span>
                                Tükeniş
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', setHTML);
    }

    saveExerciseData(exercise, index) {
        if (!this.currentWorkout) {
            this.currentWorkout = {
                type: this.workoutType,
                date: new Date().toISOString(),
                startTime: new Date().toISOString(),
                endTime: new Date().toISOString(),
                duration: document.querySelector('.timer-display').textContent,
                exercises: []
            };
        }

        const form = document.getElementById('exerciseForm');
        const totalSets = parseInt(form.querySelector('[name="totalSets"]').value);
        
        if (exercise.isSuperset) {
            // Superset için özel kayıt
            const dumbbellWeight = parseFloat(form.querySelector('[name="dumbbellWeight"]').value);
            const barWeight = parseFloat(form.querySelector('[name="barWeight"]').value);
            
            const sets = Array(totalSets).fill().map(() => ({
                dumbbellWeight: dumbbellWeight,
                barWeight: barWeight,
                isSuperset: true
            }));
            
            this.currentWorkout.exercises.push({
                name: exercise.name,
                icon: exercise.icon,
                isSuperset: true,
                sets: sets
            });
        } else {
            // Normal egzersiz kaydı
            const weight = parseFloat(form.querySelector('[name="weight"]').value);
            const hasWeightDrop = form.querySelector('[name="hasWeightDrop"]').checked;
            const toFailure = form.querySelector('[name="toFailure"]').checked;
            const reps = toFailure ? null : parseInt(form.querySelector('[name="reps"]').value);
            
            let sets = [];
            
            if (hasWeightDrop) {
                const dropWeight = parseFloat(form.querySelector('[name="dropWeight"]').value);
                const dropAfterSet = parseInt(form.querySelector('[name="dropAfterSet"]').value);
                
                // İlk setler (düşüş öncesi)
                for (let i = 0; i < dropAfterSet; i++) {
                    sets.push({
                        weight: weight,
                        reps: reps,
                        toFailure: toFailure
                    });
                }
                
                // Kalan setler (düşüş sonrası)
                for (let i = dropAfterSet; i < totalSets; i++) {
                    sets.push({
                        weight: dropWeight,
                        reps: reps,
                        toFailure: toFailure
                    });
                }
            } else {
                // Tüm setler aynı ağırlık
                sets = Array(totalSets).fill().map(() => ({
                    weight: weight,
                    reps: reps,
                    toFailure: toFailure
                }));
            }
            
            this.currentWorkout.exercises.push({
                name: exercise.name,
                icon: exercise.icon,
                sets: sets
            });
        }

        console.log('Current workout after adding exercise:', this.currentWorkout);
    }

    async loadWorkouts() {
        try {
            const { data: workouts, error } = await this.supabase
                .from('workouts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const container = document.querySelector('.workouts-list');
            if (!container) return;
            
            container.innerHTML = '';
            console.log('Loading workouts:', workouts);

            workouts.forEach(workout => {
                if (!workout || typeof workout !== 'object') {
                    console.log('Invalid workout:', workout);
                    return;
                }

                const date = new Date(workout.date).toLocaleDateString('tr-TR');
                const card = document.createElement('div');
                card.className = 'workout-card';
                
                const typeIcon = {
                    'göğüs': '💪',
                    'sırt': '🏋️',
                    'bacak': '🦵'
                }[workout.type] || '';

                const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
                
                card.innerHTML = `
                    <div class="workout-header" onclick="workoutTimer.toggleWorkoutDetails(this)">
                        <div class="workout-type">
                            <span class="workout-icon">${typeIcon}</span>
                            <span class="workout-name">${workout.type.toUpperCase()} ANTRENMANI</span>
                        </div>
                        <div class="workout-info">
                            <span class="workout-date">${date}</span>
                            <span class="workout-duration">${workout.duration || '00:00:00'}</span>
                        </div>
                    </div>
                    <div class="workout-details">
                        <div class="exercise-list">
                            ${exercises.map(exercise => {
                                if (!exercise || !Array.isArray(exercise.sets)) return '';
                                
                                const setCount = exercise.sets.length;
                                const hasFailure = exercise.sets.some(set => set && set.toFailure);
                                
                                return `
                                    <div class="exercise-item">
                                        <img src="./assets/images/exercises/${exercise.icon}" alt="${exercise.name}" class="exercise-icon">
                                        <div class="exercise-info">
                                            <h4>${exercise.name}</h4>
                                            <div class="sets-summary">
                                                <span>${setCount} set</span>
                                                ${hasFailure ? '<span class="failure-badge">Tükeniş var</span>' : ''}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        ${workout.cardio ? `
                            <div class="cardio-summary">
                                <img src="./assets/images/exercises/cardio.png" alt="Kardiyo" class="cardio-icon">
                                <div class="cardio-info">
                                    ${workout.cardio.completed ? `
                                        <span class="cardio-done">Kardiyo Yapıldı</span>
                                        <span class="cardio-details">
                                            ${workout.cardio.duration} dakika / ${workout.cardio.calories} kalori
                                        </span>
                                    ` : `
                                        <span class="cardio-skipped">Kardiyo Yapılmadı</span>
                                    `}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading workouts:', error);
            this.showError('Hata', 'Antrenmanlar yüklenirken bir hata oluştu');
        }
    }

    toggleWorkoutDetails(header) {
        const details = header.nextElementSibling;
        details.classList.toggle('active');
    }

    async saveWorkout() {
        try {
            if (!this.currentWorkout || !this.currentWorkout.exercises) {
                this.showError('Hata', 'Geçersiz antrenman verisi');
                return;
            }

            // Tarihleri düzgün formatta hazırla
            const workoutData = {
                type: this.workoutType,
                created_at: new Date().toISOString(),
                date: new Date().toISOString(),
                start_time: this.startTime.toISOString(),
                end_time: new Date().toISOString(),
                duration: this.timerDisplay.textContent,
                exercises: this.currentWorkout.exercises,
                cardio: this.currentWorkout.cardio || null
            };

            const { data, error } = await this.supabase
                .from('workouts')
                .insert([workoutData]);

            if (error) {
                console.error('Error details:', error);
                throw error;
            }

            this.showSuccess('Başarılı', 'Antrenman başarıyla kaydedildi');
            this.resetWorkout();
            this.loadWorkouts();
        } catch (error) {
            console.error('Error saving workout:', error);
            this.showError('Hata', 'Antrenman kaydedilirken bir hata oluştu');
        }
    }

    resetWorkout() {
        document.getElementById('startWorkout').style.display = 'inline-block';
        document.getElementById('pauseWorkout').style.display = 'none';
        document.getElementById('stopWorkout').style.display = 'none';
        document.querySelector('.rest-timer').style.display = 'none';
        document.querySelector('.timer-display').textContent = '00:00:00';
        
        this.startTime = null;
        this.workoutType = null;
        this.currentWorkout = null;
        document.querySelectorAll('.workout-type-btn').forEach(btn => btn.classList.remove('active'));
    }

    toggleWeightDrop(checkbox) {
        const container = checkbox.closest('.checkbox-container');
        const inputs = container.nextElementSibling;
        
        if (checkbox.checked) {
            inputs.style.display = 'grid';
            container.style.borderColor = 'var(--primary-color)';
            inputs.querySelectorAll('input').forEach(input => input.disabled = false);
        } else {
            inputs.style.display = 'none';
            container.style.borderColor = 'var(--border-color)';
            inputs.querySelectorAll('input').forEach(input => {
                input.disabled = true;
                input.value = '';
            });
        }
    }

    toggleFailureCheckbox(checkbox) {
        // Doğru input elementini bulmak için düzeltme
        const repsInput = document.querySelector('input[name="reps"]');
        
        if (checkbox.checked) {
            repsInput.readOnly = true;
            repsInput.value = '';
            repsInput.placeholder = 'Tükeniş';
            repsInput.style.backgroundColor = '#f3f4f6';
            repsInput.style.color = '#6b7280';
        } else {
            repsInput.readOnly = false;
            repsInput.placeholder = 'Tekrar Sayısı';
            repsInput.style.backgroundColor = '';
            repsInput.style.color = '';
        }
    }

    toggleCardioInputs(checkbox) {
        const cardioInputs = document.querySelector('.cardio-inputs');
        const inputs = cardioInputs.querySelectorAll('input');
        
        if (checkbox.checked) {
            cardioInputs.style.display = 'block';
            inputs.forEach(input => input.disabled = false);
        } else {
            cardioInputs.style.display = 'none';
            inputs.forEach(input => {
                input.disabled = true;
                input.value = '';
            });
        }
    }

    saveCardioData() {
        const form = document.getElementById('cardioForm');
        const didCardio = form.querySelector('[name="didCardio"]').checked;
        
        if (!this.currentWorkout) return;
        
        this.currentWorkout.cardio = {
            completed: didCardio,
            duration: didCardio ? parseInt(form.querySelector('[name="cardioTime"]').value) : 0,
            calories: didCardio ? parseInt(form.querySelector('[name="cardioCalories"]').value) : 0
        };
    }

    showClearConfirmation() {
        const modalHTML = `
            <div class="modal confirm-modal" id="confirmModal">
                <div class="modal-content">
                    <h3>Antrenmanları Sil</h3>
                    <p>Tüm antrenman kayıtlarınız silinecek. Bu işlem geri alınamaz.</p>
                    <p>Devam etmek istiyor musunuz?</p>
                    <div class="btn-group">
                        <button class="btn btn-secondary" onclick="workoutTimer.closeConfirmModal()">İptal</button>
                        <button class="btn btn-danger" onclick="workoutTimer.clearAllWorkouts()">Sil</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('confirmModal').style.display = 'block';
    }

    closeConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.remove();
        }
    }

    async clearAllWorkouts() {
        this.showConfirm(
            'Antrenmanları Sil',
            'Tüm antrenman kayıtlarınız silinecek. Bu işlem geri alınamaz.',
            async () => {
                try {
                    const { error } = await this.supabase
                        .from('workouts')
                        .delete()
                        .neq('id', 0); // Tüm kayıtları sil

                    if (error) throw error;

                    this.loadWorkouts();
                    this.showSuccess('Başarılı', 'Tüm antrenmanlar başarıyla silindi');
                } catch (error) {
                    this.showError('Hata', 'Antrenmanlar silinirken bir hata oluştu');
                    console.error('Error clearing workouts:', error);
                }
            }
        );
    }

    // Sağa sola kaydırma için
    initializeSwipeNavigation() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', e => {
            if (document.body.classList.contains('workout-mode')) return;
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        document.addEventListener('touchend', e => {
            if (document.body.classList.contains('workout-mode')) return;
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchEndX - touchStartX;
            
            if (Math.abs(diff) < swipeThreshold) return;
            
            const activeTab = document.querySelector('.tab-btn.active');
            if (!activeTab) return;
            
            if (diff > 0) {
                // Sağa kaydırma
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowLeft'}));
            } else {
                // Sola kaydırma
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'ArrowRight'}));
            }
        };
    }

    // Alert fonksiyonunu oluşturalım
    showAlert(title, text, icon = 'info') {
        Swal.fire({
            title: title,
            text: text,
            icon: icon, // 'success', 'error', 'warning', 'info', 'question'
            confirmButtonText: 'Tamam',
            confirmButtonColor: '#2563eb',
            background: 'var(--card-bg)',
            color: 'var(--text-color)'
        });
    }

    // Onay modalı için
    showConfirm(title, text, callback) {
        Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Evet',
            cancelButtonText: 'İptal',
            background: 'var(--card-bg)',
            color: 'var(--text-color)'
        }).then((result) => {
            if (result.isConfirmed) {
                callback();
            }
        });
    }

    // Başarı mesajı için
    showSuccess(title, text) {
        Swal.fire({
            title: title,
            text: text,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: 'var(--card-bg)',
            color: 'var(--text-color)'
        });
    }

    // Hata mesajı için
    showError(title, text) {
        Swal.fire({
            title: title,
            text: text,
            icon: 'error',
            confirmButtonText: 'Tamam',
            confirmButtonColor: '#2563eb',
            background: 'var(--card-bg)',
            color: 'var(--text-color)'
        });
    }
}

// Workout Timer'ı başlat
window.addEventListener('DOMContentLoaded', () => {
    window.workoutTimer = new WorkoutTimer();
}); 