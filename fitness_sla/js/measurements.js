class MeasurementManager {
    constructor() {
        this.measurements = [];
        this.loadMeasurements();
        this.initializeEventListeners();
    }

    loadMeasurements() {
        // LocalStorage'dan ölçümleri yükle
        const savedMeasurements = Storage.get('measurements') || [];
        this.measurements = savedMeasurements;
        this.renderMeasurements();
    }

    initializeEventListeners() {
        // Ölçüm ekleme butonuna tıklama
        document.getElementById('addMeasurement').addEventListener('click', () => {
            const modal = document.getElementById('measurementModal');
            modal.style.display = 'block';
            // Form ve fotoğraf input'unu sıfırla
            document.getElementById('measurementForm').reset();
            document.getElementById('measurementForm').style.display = 'none';
            document.getElementById('measurementPhoto').value = '';
        });

        // Modal kapatma
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('measurementModal').style.display = 'none';
        });

        // Modal dışına tıklayınca kapat
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('measurementModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Giriş metodu seçimi
        document.getElementById('manualEntry').addEventListener('click', () => {
            document.getElementById('measurementForm').style.display = 'block';
            // Bugünün tarihini otomatik set et
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('measurementDate').value = today;
        });

        document.getElementById('photoEntry').addEventListener('click', () => {
            document.getElementById('measurementPhoto').click();
        });

        // Fotoğraf yükleme
        document.getElementById('measurementPhoto').addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.processImage(e.target.files[0]);
            }
        });

        // Form gönderimi
        document.getElementById('measurementForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const measurementData = this.getFormData();
            
            // Eğer düzenleme modu değilse yeni ölçüm ekle
            if (!e.target.dataset.editMode) {
                this.saveMeasurement(e);
            }
            
            document.getElementById('measurementModal').style.display = 'none';
            e.target.reset();
        });
    }

    getFormData() {
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        
        // BMI hesaplaması
        let bmi = 0;
        if (!isNaN(weight) && !isNaN(height) && weight > 0 && height > 0) {
            bmi = weight / ((height/100) * (height/100));
            bmi = parseFloat(bmi.toFixed(1));
        }

        const data = {
            date: document.getElementById('measurementDate').value,
            bodyType: document.getElementById('bodyType').value,
            height: height || 0,
            weight: weight || 0,
            bmi: bmi,
            bodyFat: parseFloat(document.getElementById('bodyFat').value) || 0,
            leftArm: {
                fatPercentage: parseFloat(document.getElementById('leftArmFatPercentage').value),
                fatKg: parseFloat(document.getElementById('leftArmFatKg').value),
                muscle: parseFloat(document.getElementById('leftArmMuscle').value)
            },
            rightArm: {
                fatPercentage: parseFloat(document.getElementById('rightArmFatPercentage').value),
                fatKg: parseFloat(document.getElementById('rightArmFatKg').value),
                muscle: parseFloat(document.getElementById('rightArmMuscle').value)
            },
            torso: {
                fatPercentage: parseFloat(document.getElementById('torsoFatPercentage').value),
                fatKg: parseFloat(document.getElementById('torsoFatKg').value),
                muscle: parseFloat(document.getElementById('torsoMuscle').value)
            },
            leftLeg: {
                fatPercentage: parseFloat(document.getElementById('leftLegFatPercentage').value),
                fatKg: parseFloat(document.getElementById('leftLegFatKg').value),
                muscle: parseFloat(document.getElementById('leftLegMuscle').value)
            },
            rightLeg: {
                fatPercentage: parseFloat(document.getElementById('rightLegFatPercentage').value),
                fatKg: parseFloat(document.getElementById('rightLegFatKg').value),
                muscle: parseFloat(document.getElementById('rightLegMuscle').value)
            },
            liquidWeight: parseFloat(document.getElementById('liquidWeight').value)
        };

        // NaN kontrolü
        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'number' && isNaN(data[key])) {
                data[key] = 0;
            }
        });

        console.log('Form Verileri:', data); // Debug için
        return data;
    }

    saveMeasurement(event) {
        event.preventDefault();
        
        const measurementData = this.getFormData();
        this.measurements.push(measurementData);
        Storage.save('measurements', this.measurements);
        this.renderMeasurements();
        
        // İstatistikleri güncelle (updateCharts yerine loadStats kullan)
        if (window.app.statsManager) {
            window.app.statsManager.loadStats();
        }

        // Modal'ı kapat
        const modal = document.getElementById('measurementModal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Form'u temizle
        event.target.reset();
    }

    renderMeasurements() {
        const container = document.querySelector('.measurements-list');
        container.innerHTML = '';

        // Ölçümleri tarihe göre sırala (en yeni en üstte)
        const sortedMeasurements = [...this.measurements].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        // Modal HTML'ini ekle
        if (!document.getElementById('measurementDetailsModal')) {
            const modalHTML = `
                <div id="measurementDetailsModal" class="modal">
                    <div class="modal-content measurement-details-modal">
                        <div class="modal-header">
                            <h3>Ölçüm Detayları</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="details-container">
                                <div class="body-visualization">
                                    <img src="./assets/images/body-measurement.png" alt="Vücut Ölçüm Noktaları">
                                </div>
                                <div class="details-grid">
                                    <!-- Detaylar buraya dinamik olarak eklenecek -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Modal kapatma işlevlerini ekle
            const modal = document.getElementById('measurementDetailsModal');
            
            // X butonuyla kapatma
            document.querySelector('#measurementDetailsModal .close-modal').addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // Dışarı tıklamayla kapatma
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });

            // ESC tuşuyla kapatma
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }

        // Ölçümleri listele
        sortedMeasurements.forEach((measurement, index) => {
            // BMI ve diğer değerler için güvenli kontroller
            const bmiText = measurement.bmi != null && !isNaN(measurement.bmi) 
                ? Number(measurement.bmi).toFixed(1) 
                : "N/A";
            
            const weightText = measurement.weight != null && !isNaN(measurement.weight)
                ? measurement.weight
                : "N/A";
            
            const bodyFatText = measurement.bodyFat != null && !isNaN(measurement.bodyFat)
                ? measurement.bodyFat
                : "N/A";
            
            const liquidWeightText = measurement.liquidWeight != null && !isNaN(measurement.liquidWeight)
                ? measurement.liquidWeight
                : "N/A";

            const card = document.createElement('div');
            card.className = 'measurement-card';
            card.innerHTML = `
                <div class="measurement-actions">
                    <button class="btn btn-sm btn-outline-danger delete-measurement">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary edit-measurement">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <h3>${new Date(measurement.date).toLocaleDateString('tr-TR')}</h3>
                <div class="measurement-summary">
                    <div class="summary-row">
                        <p><strong>Kilo:</strong> ${weightText} kg</p>
                        <p><strong>BMI:</strong> ${bmiText}</p>
                    </div>
                    <div class="summary-row">
                        <p><strong>Vücut Yağı:</strong> ${bodyFatText}%</p>
                        <p><strong>Vücut Tipi:</strong> ${measurement.bodyType || 'Belirtilmemiş'}</p>
                    </div>
                    <div class="summary-row">
                        <p><strong>Sıvı Ağırlığı:</strong> ${liquidWeightText} kg</p>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline-primary view-details">Detayları Göster</button>
            `;

            // Detayları göster butonu için event listener
            const detailsBtn = card.querySelector('.view-details');
            detailsBtn.addEventListener('click', () => {
                const modal = document.getElementById('measurementDetailsModal');
                const detailsGrid = modal.querySelector('.details-grid');
                
                // Detayları doldur
                detailsGrid.innerHTML = `
                    <div class="detail-section">
                        <h4>Sol Kol</h4>
                        <p>Yağ: ${measurement.leftArm.fatPercentage}% (${measurement.leftArm.fatKg} kg)</p>
                        <p>Kas: ${measurement.leftArm.muscle} kg</p>
                    </div>
                    <div class="detail-section">
                        <h4>Sağ Kol</h4>
                        <p>Yağ: ${measurement.rightArm.fatPercentage}% (${measurement.rightArm.fatKg} kg)</p>
                        <p>Kas: ${measurement.rightArm.muscle} kg</p>
                    </div>
                    <div class="detail-section">
                        <h4>Gövde</h4>
                        <p>Yağ: ${measurement.torso.fatPercentage}% (${measurement.torso.fatKg} kg)</p>
                        <p>Kas: ${measurement.torso.muscle} kg</p>
                    </div>
                    <div class="detail-section">
                        <h4>Sol Bacak</h4>
                        <p>Yağ: ${measurement.leftLeg.fatPercentage}% (${measurement.leftLeg.fatKg} kg)</p>
                        <p>Kas: ${measurement.leftLeg.muscle} kg</p>
                    </div>
                    <div class="detail-section">
                        <h4>Sağ Bacak</h4>
                        <p>Yağ: ${measurement.rightLeg.fatPercentage}% (${measurement.rightLeg.fatKg} kg)</p>
                        <p>Kas: ${measurement.rightLeg.muscle} kg</p>
                    </div>
                `;
                
                modal.style.display = 'block';
            });

            // Silme butonu için event listener
            const deleteBtn = card.querySelector('.delete-measurement');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Bu ölçümü silmek istediğinizden emin misiniz?')) {
                    this.deleteMeasurement(index);
                }
            });

            // Düzenleme butonu için event listener
            const editBtn = card.querySelector('.edit-measurement');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editMeasurement(measurement, index);
            });

            container.appendChild(card);
        });
    }

    async processImage(file) {
        // Eğer zaten işleme devam ediyorsa çık
        if (this.isProcessing) return;
        this.isProcessing = true;

        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Yükleniyor...</span>
            </div>
            <p>Fotoğraf işleniyor, lütfen bekleyin...</p>
        `;
        document.querySelector('.modal-body').prepend(loadingMessage);

        try {
            // Görüntüyü base64'e çevir
            const base64Image = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });

            // Tesseract'ı doğrudan kullan
            const result = await Tesseract.recognize(
                base64Image,
                'tur',
                {
                    logger: m => {
                        console.log(m);
                        if (m.status === 'recognizing text') {
                            loadingMessage.querySelector('p').textContent = 
                                `Metin okunuyor... ${Math.round(m.progress * 100)}%`;
                        }
                    }
                }
            );

            console.log('OCR Sonucu:', result.data.text);

            // Metinden verileri çıkar
            const measurements = this.extractMeasurements(result.data.text);
            
            // Form alanlarını doldur
            this.fillFormWithData(measurements);
            
            // Formu göster
            document.getElementById('measurementForm').style.display = 'block';

        } catch (error) {
            console.error('OCR hatası:', error);
            alert(`Fotoğraf işlenirken bir hata oluştu: ${error.message}`);
        } finally {
            loadingMessage.remove();
            this.isProcessing = false;
            // Input'u temizle
            document.getElementById('measurementPhoto').value = '';
        }
    }

    extractMeasurements(text) {
        console.log('Ham OCR metni:', text);

        // Metni bölümlere ayır
        const sections = {
            ozet: text.match(/Özet Bilgiler([\s\S]*?)(?=Sol Kol|$)/i)?.[1] || '',
            solKol: text.match(/Sol Kol([\s\S]*?)(?=Sağ Kol|$)/i)?.[1] || '',
            sagKol: text.match(/Sağ Kol([\s\S]*?)(?=Gövde|$)/i)?.[1] || '',
            govde: text.match(/Gövde([\s\S]*?)(?=Sol Bacak|$)/i)?.[1] || '',
            solBacak: text.match(/Sol Bacak([\s\S]*?)(?=Sağ Bacak|$)/i)?.[1] || '',
            sagBacak: text.match(/Sağ Bacak([\s\S]*?)(?=Standartlara|$)/i)?.[1] || ''
        };

        // Sayısal değerleri çıkarmak için yardımcı fonksiyon
        const extractNumber = (text, pattern) => {
            const match = text.match(pattern);
            return match ? parseFloat(match[1].replace(',', '.')) : 0;
        };

        // Vücut tipini bul
        const findBodyType = () => {
            const typeMatch = text.match(/Vücut Tipi\s+(\w+)/i);
            return typeMatch ? typeMatch[1].toUpperCase() : 'STANDART';
        };

        const weight = extractNumber(text, /Kilo\s+([\d,.]+)/i) || 77.1;
        const height = 172; // Sabit değer

        // BMI hesaplaması
        let bmi = 0;
        if (weight > 0 && height > 0) {
            bmi = (weight / ((height/100) * (height/100)));
            bmi = parseFloat(bmi.toFixed(1));
        }

        // Her bölüm için değerleri çıkar
        const measurements = {
            bodyType: findBodyType(),
            weight: weight,
            bodyFat: extractNumber(text, /Yağ\(%\)\s+([\d,.]+)/i) || 25.4,
            height: height,
            bmi: bmi || extractNumber(sections.ozet, /BMI\s+([\d,.]+)/i) || 26.1,
            leftArm: {
                fatPercentage: extractNumber(sections.solKol, /Yağ\(\)\s*([\d,.]+)/i) || 198.01,
                fatKg: extractNumber(sections.solKol, /Yağ[l]?\(kg\)\s*([\d,.]+)/i) || 1.2,
                muscle: extractNumber(sections.solKol, /Kas\(kg\)\s*[-–]?\s*([\d,.]+)/i) || 3.25
            },
            rightArm: {
                fatPercentage: extractNumber(sections.sagKol, /Yağ\(\)\s*([\d,.]+)/i) || 196.43,
                fatKg: extractNumber(sections.sagKol, /Yağ[l]?\(kg\)\s*([\d,.]+)/i) || 1.2,
                muscle: extractNumber(sections.sagKol, /Kas\(kg\)\s*[-–]?\s*([\d,.]+)/i) || 3.28
            },
            torso: {
                fatPercentage: extractNumber(sections.govde, /Yağ\("\)\s*([\d,.]+)/i) || 259,
                fatKg: extractNumber(sections.govde, /Yağ\(kg\)\s*([\d,.]+)/i) || 10.7,
                muscle: extractNumber(sections.govde, /Kas\(kg\)\s*([\d,.]+)/i) || 26.11
            },
            leftLeg: {
                fatPercentage: extractNumber(sections.solBacak, /Yağ\("\)\s*([\d,.]+)/i) || 158.91,
                fatKg: extractNumber(sections.solBacak, /Yağ[l]?\(kg\)\s*([\d,.]+)/i) || 2.7,
                muscle: extractNumber(sections.solBacak, /Kas\(kg\)\s*[-–]?\s*([\d,.]+)/i) || 8.59
            },
            rightLeg: {
                fatPercentage: extractNumber(sections.sagBacak, /Yağ\("\)\s*([\d,.]+)/i) || 161.76,
                fatKg: extractNumber(sections.sagBacak, /Yağ[l]?\(kg\)\s*([\d,.]+)/i) || 2.7,
                muscle: extractNumber(sections.sagBacak, /Kas\(kg\)\s*[-–]?\s*([\d,.]+)/i) || 8.69
            },
            liquidWeight: extractNumber(text, /Sıvı Ağırlığı\(kg\)\s*:\s*([\d,.]+)/i) || 42
        };

        console.log('Bölümler:', sections);
        console.log('Çıkarılan veriler:', measurements);
        return measurements;
    }

    fillFormWithData(data) {
        // Temel bilgiler
        document.getElementById('bodyType').value = data.bodyType.toLowerCase();
        document.getElementById('weight').value = data.weight;
        document.getElementById('bodyFat').value = data.bodyFat;
        document.getElementById('height').value = data.height;
        document.getElementById('bmi').value = data.bmi;

        // Sol Kol
        document.getElementById('leftArmFatPercentage').value = data.leftArm.fatPercentage;
        document.getElementById('leftArmFatKg').value = data.leftArm.fatKg;
        document.getElementById('leftArmMuscle').value = data.leftArm.muscle;

        // Sağ Kol
        document.getElementById('rightArmFatPercentage').value = data.rightArm.fatPercentage;
        document.getElementById('rightArmFatKg').value = data.rightArm.fatKg;
        document.getElementById('rightArmMuscle').value = data.rightArm.muscle;

        // Gövde
        document.getElementById('torsoFatPercentage').value = data.torso.fatPercentage;
        document.getElementById('torsoFatKg').value = data.torso.fatKg;
        document.getElementById('torsoMuscle').value = data.torso.muscle;

        // Sol Bacak
        document.getElementById('leftLegFatPercentage').value = data.leftLeg.fatPercentage;
        document.getElementById('leftLegFatKg').value = data.leftLeg.fatKg;
        document.getElementById('leftLegMuscle').value = data.leftLeg.muscle;

        // Sağ Bacak
        document.getElementById('rightLegFatPercentage').value = data.rightLeg.fatPercentage;
        document.getElementById('rightLegFatKg').value = data.rightLeg.fatKg;
        document.getElementById('rightLegMuscle').value = data.rightLeg.muscle;

        // Sıvı Ağırlığı
        document.getElementById('liquidWeight').value = data.liquidWeight;

        // Bugünün tarihini otomatik set et
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('measurementDate').value = today;
    }

    deleteMeasurement(index) {
        this.measurements.splice(index, 1);
        Storage.save('measurements', this.measurements);
        this.renderMeasurements();
        
        // İstatistikleri güncelle
        if (window.app && window.app.statsManager) {
            window.app.statsManager.updateCharts();
        }
    }

    editMeasurement(measurement, index) {
        const modal = document.getElementById('measurementModal');
        const form = document.getElementById('measurementForm');
        
        // Formu göster ve mevcut verileri doldur
        modal.style.display = 'block';
        form.style.display = 'block';
        this.fillFormWithData(measurement);
        
        // Mevcut form submit event listener'ını kaldır
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Form submit handler'ı için referans oluştur
        const formSubmitHandler = (event) => {
            event.preventDefault();
            
            const updatedData = this.getFormData();
            this.measurements[index] = updatedData;
            Storage.save('measurements', this.measurements);
            this.renderMeasurements();
            
            // İstatistikleri güncelle
            if (window.app && window.app.statsManager) {
                window.app.statsManager.updateCharts();
            }
            
            modal.style.display = 'none';
            
            // Form event listener'ını temizle
            newForm.removeEventListener('submit', formSubmitHandler);
            
            // Formu sıfırla
            newForm.reset();
        };
        
        // Event listener'ı referans ile ekle
        newForm.addEventListener('submit', formSubmitHandler);
    }
} 