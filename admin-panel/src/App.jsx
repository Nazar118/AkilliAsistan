import React, { useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard'; 
import Users from './pages/Users';
import UserDetail  from './pages/UserDetail';
import TaskManagement from './pages/TaskManagement';
import Notifications from './pages/Notifications';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Diğer sayfaları henüz yapmadık, şimdilik boş placeholder koyalım
const Placeholder = ({ title }) => (
  <div style={{ padding: '50px', color: 'white', textAlign: 'center' }}>
    <h1>🚧 {title}</h1>
    <p>Bu modül yapım aşamasında...</p>
  </div>
);

function App() {
 // --- BİLDİRİM DİNLEYİCİ ---
 useEffect(() => {
   const bildirimleriKontrolEt = async () => {
     try {
       const res = await fetch('http://127.0.0.1:5000/bildirimleri-kontrol-et');
       const bildirimler = await res.json();

       bildirimler.forEach(b => {
         // Gelen mesajın türüne göre renkli uyarı ver
         if (b.tur === 'warning') toast.warning(b.mesaj);
         else toast.info(b.mesaj);

         // İsteğe bağlı: Ses çalabiliriz (new Audio('/ping.mp3').play())
       });
     } catch (err) { console.error("Bildirim hatası:", err); }
   };

   // İlk açılışta kontrol et
   bildirimleriKontrolEt();

   // Sonra her 30 saniyede bir tekrar et (Interval)
   const zamanlayici = setInterval(bildirimleriKontrolEt, 30000);

   return () => clearInterval(zamanlayici); // Temizlik
 }, []); 

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#14141c' }}>
        
        {/* SOL TARAFTA SIDEBAR */}
        <Sidebar />

        {/* SAĞ TARAFTA İÇERİK (Sidebar genişliği kadar soldan boşluk bırakıyoruz) */}
        <div style={{ flex: 1, marginLeft: '260px', transition: 'margin 0.3s' }}>
          <Routes>
            {/* Anasayfa Dashboard */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Diğer Rotalar (Yol haritamıza göre) */}
            <Route path="/users" element={<Users />} />  
            <Route path="/users/:id" element={<UserDetail />} />        
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/gamification" element={<Placeholder title="Oyunlaştırma Ayarları" />} />
            <Route path="/stats" element={<Placeholder title="Detaylı İstatistikler" />} />
            <Route path="/settings" element={<Placeholder title="Sistem Ayarları" />} />
          </Routes>
        </div>
        
      </div>
      {/* Toast Mesaj Kutusu (Ekranın sağ üstünde çıkar) */}
      <ToastContainer position="top-right" autoClose={5000} theme="dark" />
    </Router>
  );
}

export default App;