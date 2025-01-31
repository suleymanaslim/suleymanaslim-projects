import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js'
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js'
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js'

const firebaseConfig = {
  apiKey: "AIzaSyBoeSxhQ_czw-UbU-jatj3Np1J2eZmN240",
  authDomain: "fitness-tracker-20f50.firebaseapp.com",
  projectId: "fitness-tracker-20f50",
  storageBucket: "fitness-tracker-20f50.firebasestorage.app",
  messagingSenderId: "606303231056",
  appId: "1:606303231056:web:41e91a17205c13660d8555",
  measurementId: "G-291SXW4RMW"
};

let app;
let db;
let auth;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firebase başarıyla başlatıldı');
} catch (error) {
    console.error('Firebase başlatma hatası:', error);
}

export class FirebaseManager {
    constructor() {
        console.log('FirebaseManager başlatılıyor...');
        this.init();
    }

    async init() {
        try {
            const userCredential = await signInAnonymously(auth);
            console.log('Anonim giriş başarılı. User ID:', userCredential.user.uid);
        } catch (error) {
            console.error('Anonim giriş hatası:', error.code, error.message);
        }
    }

    async saveExercise(exerciseData) {
        if (!auth.currentUser) {
            const error = 'Kullanıcı girişi yapılmamış!';
            console.error(error);
            throw new Error(error);
        }

        try {
            console.log('Egzersiz kaydediliyor:', exerciseData);
            const docRef = await addDoc(collection(db, 'exercises'), {
                ...exerciseData,
                userId: auth.currentUser.uid,
                timestamp: new Date().toISOString()
            });
            console.log('Egzersiz başarıyla kaydedildi. Doc ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Egzersiz kaydetme hatası:', error.code, error.message);
            throw error;
        }
    }

    async getExercises() {
        if (!auth.currentUser) {
            const error = 'Kullanıcı girişi yapılmamış!';
            console.error(error);
            throw new Error(error);
        }

        try {
            console.log('Egzersizler getiriliyor...');
            const q = query(
                collection(db, 'exercises'),
                where('userId', '==', auth.currentUser.uid),
                orderBy('timestamp', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const exercises = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Egzersizler başarıyla getirildi. Toplam:', exercises.length);
            return exercises;
        } catch (error) {
            console.error('Egzersiz getirme hatası:', error.code, error.message);
            throw error;
        }
    }

    // Firebase bağlantı durumunu kontrol et
    checkConnection() {
        const database = getDatabase();
        const connectedRef = ref(database, '.info/connected');
        onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                console.log('Firebase bağlantısı aktif');
            } else {
                console.log('Firebase bağlantısı kesildi');
            }
        });
    }
}

// Global hata yakalayıcı
window.addEventListener('unhandledrejection', function(event) {
    console.error('Yakalanmamış Promise hatası:', event.reason);
});

// Firebase durumunu kontrol et
auth?.onAuthStateChanged((user) => {
    if (user) {
        console.log('Kullanıcı oturumu açık. User ID:', user.uid);
    } else {
        console.log('Kullanıcı oturumu kapalı');
    }
});