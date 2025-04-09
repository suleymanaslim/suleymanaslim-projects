import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, Eraser, HelpCircle, CheckCircle, XCircle, Gauge, ChevronDown, ChevronUp, Edit, BookOpen, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const STORAGE_KEY = 'gno-calculator-courses-v1';

const primaryColor = "bg-blue-600 hover:bg-blue-700 text-white";
const secondaryColor = "bg-gray-200 hover:bg-gray-300 text-gray-800";
const dangerColor = "bg-red-600 hover:bg-red-700 text-white";

const getStoredCourses = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [{ name: '', akts: '', vize: '', final: '' }];
};
  
const semesters = {
    // 1. Sınıf
    "1-1": [
        { name: "Eğitime Giriş", akts: 3 },
        { name: "Eğitim Sosyolojisi", akts: 3 },
        { name: "Atatürk İlkeleri ve İnkılap Tarihi 1", akts: 3 },
        { name: "Yabancı Dil 1", akts: 3 },
        { name: "Türk Dili 1", akts: 5 },
        { name: "Bilişim Teknolojileri", akts: 5 },
        { name: "Okuma Becerileri 1", akts: 2 },
        { name: "Yazma Becerileri 1", akts: 2 },
        { name: "Dinleme ve Sesletim 1", akts: 2 },
        { name: "Sözlü İletişim Becerileri 1", akts: 2 }
    ],
    "1-2": [
        { name: "Eğitim Felsefesi", akts: 3 },
        { name: "Atatürk İlkeleri ve İnkılap Tarihi 2", akts: 3 },
        { name: "Yabancı Dil 2", akts: 3 },
        { name: "Türk Dili 2", akts: 5 },
        { name: "Okuma Becerileri 2", akts: 2 },
        { name: "Yazma Becerileri 2", akts: 3 },
        { name: "Dinleme ve Sesletim 2", akts: 3 },
        { name: "Sözlü İletişim Becerileri 2", akts: 3 },
        { name: "İngilizcenin Yapısı", akts: 2 }
    ],

    // 2. Sınıf
    "2-1": [
        { name: "Öğretim Teknolojileri", akts: 3 },
        { name: "Öğretim İlke ve Yöntemleri", akts: 3 },
        { name: "Seçmeli 1 (MB) Giriş Yapınız", akts: 4 },
        { name: "Seçmeli 1 (GK) Giriş Yapınız", akts: 3 },
        { name: "Seçmeli 1 (AE) Giriş Yapınız", akts: 4 },
        { name: "İngilizce Öğrenme ve Öğretim Yaklaşımları", akts: 3 },
        { name: "İngiliz Edebiyatı 1", akts: 4 },
        { name: "Dilbilimi 1", akts: 3 },
        { name: "Eleştirel Okuma ve Yazma", akts: 3 }
    ],
    "2-2": [
        { name: "Türk Eğitim Tarihi", akts: 3 },
        { name: "Eğitimde Araştırma Yöntemleri", akts: 3 },
        { name: "Seçmeli 2 (MB) Giriş Yapınız", akts: 4 },
        { name: "Seçmeli 2 (GK) Giriş Yapınız", akts: 3 },
        { name: "Seçmeli 2 (AE) Giriş Yapınız", akts: 4 },
        { name: "İngilizce Öğretim Programları", akts: 3 },
        { name: "İngiliz Edebiyatı 2", akts: 4 },
        { name: "Dilbilimi 2", akts: 3 },
        { name: "Dil Edinimi", akts: 3 }
    ],

    // 3. Sınıf
    "3-1": [
        { name: "Sınıf Yönetimi", akts: 3 },
        { name: "Eğitimde Ahlâk ve Etik", akts: 3 },
        { name: "Seçmeli 3 (MB) Giriş Yapınız", akts: 4 },
        { name: "Seçmeli 3 (GK) Giriş Yapınız", akts: 3 },
        { name: "Seçmeli 3 (AE) Giriş Yapınız", akts: 4 },
        { name: "Çocuklara Yabancı Dil Öğretimi 1", akts: 5 },
        { name: "İngilizce Dil Becerilerinin Öğretimi 1", akts: 5 },
        { name: "Dil ve Edebiyat Öğretimi 1", akts: 3 }
    ],
    "3-2": [
        { name: "Öğretmenlik Uygulaması 1", akts: 10 },
        { name: "Özel Eğitim ve Kaynaştırma", akts: 3 },
        { name: "Seçmeli 4 (MB) Giriş Yapınız", akts: 4 },
        { name: "Seçmeli 4 (GK) Giriş Yapınız", akts: 3 },
        { name: "Seçmeli 4 (AE) Giriş Yapınız", akts: 4 },
        { name: "Çocuklara Yabancı Dil Öğretimi 2", akts: 5 },
        { name: "İngilizce Dil Becerilerinin Öğretimi 2", akts: 5 },
        { name: "Dil ve Edebiyat Öğretimi 2", akts: 5 }
    ],

    // 4. Sınıf
    "4-1": [
        { name: "Öğretmenlik Uygulaması 1", akts: 10 },
        { name: "Özel Eğitim ve Kaynaştırma", akts: 3 },
        { name: "Seçmeli 5 (MB) Giriş Yapınız", akts: 4 },
        { name: "Seçmeli 5 (AE) Giriş Yapınız", akts: 4 },
        { name: "Topluma Hizmet Uygulamaları", akts: 3 },
        { name: "İngilizce Öğretiminde Ders İçeriği Geliştirme", akts: 3 },      
        { name: "Çeviri", akts: 3 }

    ],
    "4-2": [
        { name: "Öğretmenlik Uygulaması 2", akts: 15 },
        { name: "Okullarda Rehberlik", akts: 3 },
        { name: "Seçmeli 6 (MB) Giriş Yapınız", akts: 4 },
        { name: "Seçmeli 6 (AE) Giriş Yapınız", akts: 4 },
        { name: "İngilizce Öğretiminde Sınav Hazırlama", akts: 4 }
    ]
};

export default function GnoCalculator() {
    const [courses, setCourses] = useState(getStoredCourses);
    const [showHelp, setShowHelp] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [deleteMode, setDeleteMode] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null); 
    const [showSemesterModal, setShowSemesterModal] = useState(false);
    const [gno, setGno] = useState(0);
    const [showFloatingGno, setShowFloatingGno] = useState(false);
    const [notification, setNotification] = useState(null);
    const [expandedCourses, setExpandedCourses] = useState({});
    const [editingCourse, setEditingCourse] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [showBottomNav, setShowBottomNav] = useState(true);

    // Detect if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Detect keyboard open on mobile
    useEffect(() => {
        if (!isMobile) return;
        
        const handleResize = () => {
            // If the viewport height decreases significantly, keyboard might be open
            const keyboardOpen = window.innerHeight < window.outerHeight * 0.75;
            setIsKeyboardOpen(keyboardOpen);
            setShowBottomNav(!keyboardOpen);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isMobile]);

    // Toggle expanded state for a course
    const toggleCourseExpanded = (index) => {
        setExpandedCourses(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Handle editing course name
    const startEditingCourse = (index) => {
        setEditingCourse(index);
    };

    const stopEditingCourse = () => {
        setEditingCourse(null);
    };

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        
        setTimeout(() => {
          setNotification(null);
        }, 3000);
    };

    const scrollToTop = () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
    };

    useEffect(() => {
        const handleScroll = () => {
          const scrollPosition = window.scrollY;
          if (scrollPosition > 150) { 
            setShowFloatingGno(true);
          } else {
            setShowFloatingGno(false);
          }
        };
        
        window.addEventListener('scroll', handleScroll);
        
        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Removed export/import functions as requested
    
    const addSemester = (key) => {
        const newCourses = semesters[key].map((d) => ({
          name: d.name,
          akts: d.akts,
          vize: '',
          final: ''
        }));
      
        const hasOnlyEmptyCourse =
          courses.length === 1 &&
          !courses[0].name &&
          !courses[0].akts &&
          !courses[0].vize &&
          !courses[0].final;
      
        setCourses((prev) => {
          const updated = hasOnlyEmptyCourse ? [] : [...prev];
          return [...updated, ...newCourses];
        });

        const donemAdi = key.split("-")[0] + ". Sınıf " + (key.split("-")[1] === "1" ? "Güz Dönemi" : "Bahar Dönemi");
        showNotification(`${donemAdi} dersleri eklendi!`, "success");
    };
      
    const handleInputChange = (index, field, value) => {
        if ((field === 'vize' || field === 'final' || field === 'akts') && Number(value) < 0) {
            value = "0";
        }
        
        if ((field === 'vize' || field === 'final') && Number(value) > 100) {
            value = "100";
        }

        if ((field === 'akts') && Number(value) > 30) {
            value = "30";
        }

        const updatedCourses = [...courses];
        updatedCourses[index][field] = value;
        setCourses(updatedCourses);
    };

    const addCourse = () => {
        setCourses([...courses, { name: '', akts: '', vize: '', final: '' }]);
        
        // Auto-expand the newly added course on mobile
        if (isMobile) {
            const newIndex = courses.length;
            setExpandedCourses(prev => ({
                ...prev,
                [newIndex]: true
            }));
            
            // Scroll to the new course
            setTimeout(() => {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    };

    const calculateAverage = (vize, final) => {
        const avg = vize * 0.3 + final * 0.7;
        return Math.round(avg);
    };

    const getLetterGrade = (score, gno) => {
        if (score >= 90) return { letter: 'AA', point: 4.0, status: '✅ Başarılı' };
        if (score >= 80) return { letter: 'BA', point: 3.5, status: '✅ Başarılı' };
        if (score >= 70) return { letter: 'BB', point: 3.0, status: '✅ Başarılı' };
        if (score >= 65) return { letter: 'CB', point: 2.5, status: '✅ Başarılı' };
        if (score >= 60) return { letter: 'CC', point: 2.0, status: '✅ Başarılı' };
        if (score >= 50) {
            return gno >= 2.5
                ? { letter: 'DB', point: 1.5, status: '❓ Şartlı Geçiş' }
                : { letter: 'DD', point: 1.5, status: '⛔ Başarısız' };
        }
        if (score >= 30) return { letter: 'FD', point: 1.0, status: '⛔ Başarısız' };
        return { letter: 'FF', point: 0.0, status: '⛔ Başarısız' };
    };

    const calculateGno = () => {
        let totalPoints = 0;
        let totalCredits = 0;

        courses.forEach(({ akts, vize, final }) => {
            if (vize === '' || final === '' || isNaN(Number(vize)) || isNaN(Number(final))) {
                return; 
            }
            const avg = calculateAverage(Number(vize), Number(final));
            const { point } = getLetterGrade(avg, 0);
            totalPoints += point * Number(akts);
            totalCredits += Number(akts);
        });

        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    };

    // Remove a course with swipe gesture
    const handleSwipeLeft = (index) => {
        setSelectedIndex(index);
        setDeleteMode('course');
        setShowClearModal(true);
    };

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
        const updatedGno = calculateGno();
        setGno(updatedGno);
    }, [courses]);

    // Render Course on Mobile
    const renderMobileCourse = (course, index) => {
        const vize = Number(course.vize);
        const final = Number(course.final);
        const avg = !isNaN(vize) && !isNaN(final) ? calculateAverage(vize, final) : null;
        const grade = avg !== null ? getLetterGrade(avg, gno) : null;
        const isExpanded = expandedCourses[index];
        const isEditing = editingCourse === index;

        return (
            <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md p-4 space-y-3 border border-gray-100 transition-all"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(event, info) => {
                    if (info.offset.x < -100) {
                        handleSwipeLeft(index);
                    }
                }}
            >
                <div className="flex justify-between items-center overflow-hidden">
                    {isEditing ? (
                        <input
                            type="text"
                            className="flex-1 border border-blue-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={course.name}
                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                            onBlur={stopEditingCourse}
                            autoFocus
                            onFocus={(e) => e.target.select()}
                        />
                    ) : (
                        <div className="flex flex-1 items-center">
                        {/* Collapsed state - shows short version */}
                        {!isExpanded && (
                            <div className="flex flex-1 items-center">
                                <div className="flex-1 font-medium">
                                    {course.name.length > 30 
                                        ? course.name.substring(0, 25) + "..." 
                                        : course.name || "Ders Adı"}
                                </div>
                                <button 
                                    onClick={() => startEditingCourse(index)}
                                    className="ml-1 p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                                >
                                    <Edit size={16} />
                                </button>
                            </div>
                        )}
                        {/* Expanded state - shows full course name */}
                        {isExpanded && (
                            <div className="w-full font-medium mb-2">
                                <div className="flex justify-between items-center">
                                    <div>{course.name || "Ders Adı"}</div>
                                    <button 
                                        onClick={() => startEditingCourse(index)}
                                        className="ml-1 p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                                    >
                                        <Edit size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    )}
                    <button 
                        onClick={() => toggleCourseExpanded(index)}
                        className="ml-2 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                    >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
                
                {isExpanded ? (
                    <>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-600 font-medium block">AKTS</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    inputMode="numeric"
                                    className="border border-gray-300 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
                                    value={course.akts}
                                    onChange={(e) => handleInputChange(index, 'akts', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-600 font-medium block">Vize</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    inputMode="numeric"
                                    className="border border-gray-300 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
                                    value={course.vize}
                                    onChange={(e) => handleInputChange(index, 'vize', e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-600 font-medium block">Final</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    inputMode="numeric"
                                    className="border border-gray-300 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg"
                                    value={course.final}
                                    onChange={(e) => handleInputChange(index, 'final', e.target.value)}
                                />
                            </div>
                            
                            <button
                                onClick={() => {
                                    setSelectedIndex(index);
                                    setDeleteMode('course');
                                    setShowClearModal(true);
                                }}
                                className="h-12 flex items-center justify-center border border-red-200 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition mt-6"
                            >
                                <Trash2 size={20} className="inline-block"/>
                            </button>
                        </div>
                        
                        {grade && (
                            <>
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                    <div className="flex flex-col justify-between items-center rounded-lg bg-blue-50 text-blue-600 p-3 shadow-sm">
                                        <span className="text-xs text-gray-600">Ortalama</span>
                                        <span className="text-lg font-bold">{avg}</span>
                                    </div>
                                    <div className="flex flex-col justify-between items-center rounded-lg bg-yellow-50 text-yellow-600 p-3 shadow-sm">
                                        <span className="text-xs text-gray-600">Harf</span>
                                        <span className="text-lg font-bold">{grade?.letter}</span>
                                    </div>
                                    <div className="flex flex-col justify-between items-center rounded-lg bg-violet-50 text-violet-600 p-3 shadow-sm">
                                        <span className="text-xs text-gray-600">Katsayı</span>
                                        <span className="text-lg font-bold">{grade?.point}</span>
                                    </div>
                                </div>
                                
                                <div className={`p-3 rounded-lg font-medium text-white text-center flex items-center justify-center gap-1 ${
                                    grade.status.includes('✅') ? 'bg-green-500' :
                                    grade.status.includes('❓') ? 'bg-yellow-500' :
                                    'bg-red-500'
                                }`}>
                                    {grade.status.includes('✅') ? <CheckCircle size={18} /> :
                                    grade.status.includes('❓') ? <HelpCircle size={18} /> :
                                    <XCircle size={18} />}
                                    {grade.status.replace(/^./, '')}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="bg-gray-100 text-gray-700 rounded px-2 py-1 mr-2">{course.akts || "-"} AKTS</span>
                        {course.vize && course.final ? (
                            <span className="bg-blue-50 text-blue-700 rounded px-2 py-1">
                                {avg}{avg ? ` (${grade?.letter})` : ''}
                            </span>
                        ) : (
                            <span className="text-gray-400">Not girilmemiş</span>
                        )}
                    </div>
                )}
            </motion.div>
        );
    };

    // Render Course on Desktop
    const renderDesktopCourse = (course, index) => {
        const vize = Number(course.vize);
        const final = Number(course.final);
        const avg = !isNaN(vize) && !isNaN(final) ? calculateAverage(vize, final) : null;
        const grade = avg !== null ? getLetterGrade(avg, gno) : null;

        return (
            <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md p-5 space-y-3 border border-gray-100 transition-all hover:shadow-lg"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                        type="text"
                        placeholder="Ders Adı"
                        className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={course.name}
                        onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="AKTS"
                        min="1"
                        max="30"
                        className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={course.akts}
                        onChange={(e) => handleInputChange(index, 'akts', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Vize"
                        min="0"
                        max="100"
                        className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={course.vize}
                        onChange={(e) => handleInputChange(index, 'vize', e.target.value)}
                    />
                    <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Final"
                        className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={course.final}
                        onChange={(e) => handleInputChange(index, 'final', e.target.value)}
                    />
                </div>
                
                {grade && (
                    <>
                        <div className="grid grid-cols-4 gap-1 text-sm mt-2 items-center">
                            <div className="h-14 flex flex-col justify-between items-center text-sm font-medium w-full rounded-lg bg-blue-50 text-blue-600 py-1 shadow-sm">
                                <span className="text-xs text-gray-600">Ortalama</span>
                                <span>{avg}</span>
                            </div>
                            <div className="h-14 flex flex-col justify-between items-center text-sm font-medium w-full rounded-lg bg-yellow-50 text-yellow-600 py-1 shadow-sm">
                                <span className="text-xs text-gray-600">Harf Notu</span>
                                <span>{grade?.letter}</span>
                            </div>
                            <div className="h-14 flex flex-col justify-between items-center text-sm font-medium w-full rounded-lg bg-violet-50 text-violet-600 py-1 shadow-sm">
                                <span className="text-xs text-gray-600">Katsayı</span>
                                <span>{grade?.point}</span>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedIndex(index);
                                    setDeleteMode('course');
                                    setShowClearModal(true);
                                }}
                                className="h-14 flex items-center justify-center border border-black-500 text-red-500 rounded hover:bg-red-50 transition"
                            >
                                <Trash2 size={18} color="black" className="inline-block"/>
                            </button>
                        </div>
                        
                        <div className={`mt-2 px-3 py-2 rounded-md font-medium text-white text-sm text-center transition-all flex items-center justify-center gap-1 ${
                            grade.status.includes('✅') ? 'bg-green-500 hover:bg-green-600' :
                            grade.status.includes('❓') ? 'bg-yellow-500 hover:bg-yellow-600' :
                            'bg-red-500 hover:bg-red-600'
                            }`}>
                            {grade.status.includes('✅') ? <CheckCircle size={16} /> :
                            grade.status.includes('❓') ? <HelpCircle size={16} /> :
                            <XCircle size={16} />}
                            {grade.status.replace(/^./, '')}
                        </div>
                    </>
                )}
            </motion.div>
        );
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="bg-white border border-blue-100 text-blue-700 rounded-lg shadow-md px-4 py-3 mb-6 flex items-center justify-center gap-2">
                <Gauge size={24} className="text-blue-500" />
                <span className="text-gray-600 font-medium">Genel Not Ortalaması:</span>
                <span className="text-blue-700 font-bold text-xl">{gno}</span>
            </div>
            
            {isMobile && (
                <div className="mb-4 px-4">
                    <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md border border-blue-100">
                        <span className="font-medium">İpucu:</span> Sola kaydırarak dersleri silebilirsiniz.
                    </p>
                </div>
            )}

            {/* Help button moved to bottom navbar */}
            
            <AnimatePresence>
                {showHelp && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-[100]"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white max-w-lg w-full rounded-xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto m-4"
                        >
                            <button
                                onClick={() => setShowHelp(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                            >
                                <XCircle size={20} />
                            </button>
                            <h2 className="text-2xl font-bold mb-4 text-center">Yardım & Bilgilendirme</h2>
                            <div className="text-sm text-gray-700 space-y-3">
                                <p><strong>📘 Vize Notları İle Ortalama:</strong> Eğer sadece vize notlarınız açıklandıysa, final notunuza vize notlarınızı girerek geçici bir ortalama hesaplayabilirsiniz.</p>
                                <p><strong>❓ Şartlı Geçiş (DB):</strong> Dönem ortalaman 2.5 ve üzeriyse, 50-59 arası notlarla dersten geçmiş sayılırsın.</p>
                                <p><strong>⛔ \"DD\" Harf Notu:</strong> Ortalaman 2.5 altındaysa 50-59 arası notlar başarısız sayılır.</p>
                                <p><strong>🧼 Veriler Silinmedi:</strong> Bilgilerin otomatik olarak kaydedilir. 'Temizle' butonuna basarak silebilirsin.</p>
                                <p><strong>💾 Verileri Yedekleme:</strong> Sağ üstteki ayarlar menüsünden verilerinizi dışa aktarabilir ve içe aktarabilirsiniz.</p>
                                <p><strong>📱 Mobil Kullanım:</strong> Mobil cihazlarda dersi detaylandırmak için karta tıklayabilir, sola kaydırarak silebilirsiniz.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="space-y-6 mb-10">
                <button
                    onClick={() => setShowSemesterModal(true)}
                    className={`${isMobile ? '' : 'fixed'} ${isMobile ? 'w-full' : 'bottom-6 right-6 z-50'} bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-1`}
                >
                    <PlusCircle size={18} />
                    Dönem Ekle
                </button>
                
                <AnimatePresence>
                    {showSemesterModal && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[100]"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-white rounded-xl w-full max-w-lg shadow-xl p-6 relative space-y-4 max-h-[90vh] overflow-y-auto m-4"
                            >
                                <button
                                    onClick={() => setShowSemesterModal(false)}
                                    className="absolute top-3 right-4 text-gray-600 hover:text-black"
                                >
                                    <XCircle size={20} />
                                </button>

                                <h2 className="text-xl font-bold text-center text-blue-700 mb-4">
                                    Dönem Seç (İngilizce Öğretmenliği)
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((sinif) => (
                                        <div key={sinif} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
                                                {sinif}. Sınıf
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[1, 2].map((yariyil) => {
                                                    const key = `${sinif}-${yariyil}`;
                                                    return (
                                                        <button
                                                            key={key}
                                                            onClick={() => {
                                                                addSemester(key);
                                                                setShowSemesterModal(false);
                                                            }}
                                                            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <PlusCircle size={16} />
                                                            {yariyil === 1 ? "Güz Dönemi" : "Bahar Dönemi"}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <div className="space-y-4 px-4">
                {courses.map((course, index) => (
                    isMobile ? 
                    renderMobileCourse(course, index) : 
                    renderDesktopCourse(course, index)
                ))}
            </div>

            {isMobile && showBottomNav ? (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around z-40">
                    <button
                        onClick={() => {
                            setDeleteMode('all');
                            setShowClearModal(true);
                        }}
                        className="flex flex-col items-center justify-center p-2 text-red-600"
                    >
                        <Eraser size={22} />
                        <span className="text-xs mt-1">Temizle</span>
                    </button>
                    
                    <button
                        onClick={() => setShowHelp(true)}
                        className="flex flex-col items-center justify-center p-2 text-blue-600"
                    >
                        <HelpCircle size={22} />
                        <span className="text-xs mt-1">Yardım</span>
                    </button>
                    
                    <button
                        onClick={() => setShowSemesterModal(true)}
                        className="flex flex-col items-center justify-center p-2 text-blue-600"
                    >
                        <BookOpen size={22} />
                        <span className="text-xs mt-1">Dönem Ekle</span>
                    </button>
                </div>
            ) : (
                <div className="flex gap-4 mt-8 justify-center">
                    <button
                        onClick={() => {
                            setDeleteMode('all');
                            setShowClearModal(true);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-md shadow hover:bg-red-700 transition-all flex items-center gap-2"
                    >
                        <Eraser size={18} />
                        Temizle
                    </button>
                    
                    <button
                        onClick={() => setShowHelp(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-all flex items-center gap-2"
                    > 
                        <HelpCircle size={18}/>
                        Yardım
                    </button>
                    
                    <button
                        onClick={() => setShowSemesterModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-all flex items-center gap-2"
                    > 
                        <BookOpen size={18}/>
                        Dönem Ekle
                    </button>
                </div>
            )}

            <AnimatePresence>
                {showClearModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[100]"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative max-h-[90vh] overflow-y-auto m-4"
                        >
                            <h2 className="text-xl font-bold mb-4 text-center">Emin misiniz?</h2>
                            <p className="text-center text-gray-700 mb-6">
                                {deleteMode === 'all'
                                    ? 'Tüm girilen veriler silinecek. Bu işlem geri alınamaz.'
                                    : 'Bu dersi silmek istediğinize emin misiniz?'}
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => {
                                        if (deleteMode === 'all') {
                                            localStorage.removeItem('gno-calculator-courses-v1');
                                            setCourses([{ name: '', akts: '', vize: '', final: '' }]);
                                            showNotification("Tüm dersler temizlendi!");
                                        } else if (deleteMode === 'course' && selectedIndex !== null) {
                                            const updated = [...courses];
                                            updated.splice(selectedIndex, 1);
                                            setCourses(updated);
                                            showNotification("Ders başarıyla silindi!");
                                        }
                                        setShowClearModal(false);
                                        setSelectedIndex(null);
                                        setDeleteMode(null);
                                    }}
                                    className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 min-w-[120px]"
                                >
                                    Evet, Sil
                                </button>
                                <button
                                    onClick={() => {
                                        setShowClearModal(false);
                                        setSelectedIndex(null);
                                        setDeleteMode(null);
                                    }}
                                    className="bg-gray-300 text-gray-800 px-4 py-3 rounded-md hover:bg-gray-400 min-w-[120px]"
                                >
                                    Vazgeç
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence> 
                {showFloatingGno && ( 
                    <motion.div initial={{ opacity: 0, scale: 0.8, x: 100 }} animate={{ opacity: 1, scale: 1, x: -8 }} exit={{ opacity: 0, scale: 0.8, x: 50 }} transition={{ type: "spring", stiffness: 400, damping: 45 }} onClick={scrollToTop} className="fixed bottom-24 right-8 z-10 flex items-center justify-center gap-1 bg-white border border-blue-100 text-blue-700 rounded-full shadow-md px-5 py-2 text-m font-semibold cursor-pointer hover:bg-blue-50" > 
                    <Gauge size={16} className="text-blue-500" /> <span className="font-bold">{gno}</span> 
                    </motion.div> )} 
            </AnimatePresence>
            
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`fixed bottom-28 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg text-white z-50 flex items-center justify-center gap-2 min-w-[200px] ${
                            notification.type === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                        {notification.type === "success" ? 
                            <CheckCircle size={18} /> : 
                            <XCircle size={18} />
                        }
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Extra bottom padding for mobile with bottom nav */}
            {isMobile && showBottomNav && <div className="h-16"></div>}
        </div>
    );
}