import React, { useEffect, useState } from 'react';
import { FaBell, FaSave, FaClock, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const Notifications = () => {
  const [kurallar, setKurallar] = useState([]);
  const [ayarlar, setAyarlar] = useState({ reminder_delay: "10", max_daily_notif: "5" });
  const [yukleniyor, setYukleniyor] = useState(true);

  // Verileri Çek
  useEffect(() => {
    const veriCek = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/bildirim-ayarlari');
        const data = await res.json();
        setKurallar(data.kurallar);
        setAyarlar(data.ayarlar);
        setYukleniyor(false);
      } catch (err) { console.error(err); }
    };
    veriCek();
  }, []);

  // Kural Güncelle (Mesaj veya Aktiflik)
  const kuralGuncelle = async (id, yeniVeri) => {
    // Önce ekranda hızlıca güncelle (Optimistic Update)
    setKurallar(prev => prev.map(k => k.id === id ? { ...k, ...yeniVeri } : k));

    // Sonra backend'e kaydet
    await fetch(`http://127.0.0.1:5000/kural-guncelle/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(yeniVeri)
    });
  };

  // Genel Ayarları Kaydet
  const ayarKaydet = async () => {
    await fetch('http://127.0.0.1:5000/ayar-guncelle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ayarlar)
    });
    alert("Genel ayarlar kaydedildi! ✅");
  };

  if (yukleniyor) return <div style={{padding:'40px', color:'white'}}>Yükleniyor...</div>;

  return (
    <div style={{ padding: '30px', color: 'white', fontFamily: '"Segoe UI", sans-serif' }}>
      
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, fontWeight: '300' }}>🔔 Bildirim & <strong style={{ fontWeight: 'bold', color: '#ff9a9e' }}>Motivasyon</strong></h1>
        <small style={{ color: '#888' }}>Sistemin seninle nasıl konuşacağını buradan ayarla.</small>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        
        {/* SOL: SENARYOLAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, color: '#aab' }}>💬 Mesaj Senaryoları</h3>
          
          {kurallar.map((kural) => (
            <div key={kural.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#ff9a9e' }}>{kural.label}</span>
                <div 
                  onClick={() => kuralGuncelle(kural.id, { is_active: !kural.is_active })}
                  style={{ cursor: 'pointer', color: kural.is_active ? '#2af598' : '#444', fontSize: '1.5rem' }}
                >
                  {kural.is_active ? <FaToggleOn /> : <FaToggleOff />}
                </div>
              </div>
              
              <textarea
                value={kural.message}
                onChange={(e) => kuralGuncelle(kural.id, { message: e.target.value })} // Her harfte state günceller (Debounce eklenebilir ama şimdilik gerek yok)
                style={{ ...inputStyle, minHeight: '60px', opacity: kural.is_active ? 1 : 0.5 }}
                disabled={!kural.is_active}
              />
              <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                İpucu: Görev adını göstermek için <b>{'{baslik}'}</b> yazabilirsin.
              </small>
            </div>
          ))}
        </div>

        {/* SAĞ: ZAMANLAMA AYARLARI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, color: '#aab' }}>⚙️ Zamanlama Ayarları</h3>
          
          <div style={cardStyle}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}><FaClock /> İkinci Hatırlatma (Dk)</label>
              <input 
                type="number" 
                value={ayarlar.reminder_delay}
                onChange={(e) => setAyarlar({...ayarlar, reminder_delay: e.target.value})}
                style={inputStyle} 
              />
              <small style={{color:'#666'}}>İlk bildirimden kaç dakika sonra tekrar hatırlatılsın?</small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}><FaBell /> Günlük Maks. Bildirim</label>
              <input 
                type="number" 
                value={ayarlar.max_daily_notif}
                onChange={(e) => setAyarlar({...ayarlar, max_daily_notif: e.target.value})}
                style={inputStyle} 
              />
            </div>

            <button onClick={ayarKaydet} style={buttonStyle}>
              <FaSave /> AYARLARI KAYDET
            </button>
          </div>
          
          {/* Bilgi Kutusu */}
          <div style={{ ...cardStyle, background: 'rgba(102, 126, 234, 0.1)', border: '1px solid #667eea' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#667eea' }}>ℹ️ Nasıl Çalışır?</h4>
            <p style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.5' }}>
              Burada yazdığın mesajlar, sistem arka planda çalışırken otomatik olarak tetiklenir. 
              Eğer "Aktif" butonunu kapatırsan o senaryo için bildirim almazsın.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

// Stiller
const cardStyle = { background: '#1e1e2f', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', border: '1px solid #2c2c3e' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #444', background: '#14141c', color: 'white', fontSize:'0.9rem', fontFamily: 'inherit' };
const labelStyle = { display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px', fontWeight:'bold', color:'#ddd' };
const buttonStyle = { width: '100%', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: '#667eea', color: 'white', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' };

export default Notifications;