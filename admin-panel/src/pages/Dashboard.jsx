import React, { useEffect, useState } from 'react'
import "../App.css"; // CSS dosyasını bir üst klasörden al
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Dashboard = () => {
  // --- STATE TANIMLARI ---
  const [gorevler, setGorevler] = useState([])
  const [filtrelenmisGorevler, setFiltrelenmisGorevler] = useState([]) 
  const [kategoriler, setKategoriler] = useState([]) 
  const [sablonlar, setSablonlar] = useState([]) // YENİ: Şablonları tutacak
  
  const [ozet, setOzet] = useState({ toplam_gorev: 0, bugun_tamamlanan: 0, tamamlama_orani: 0 })
  const [grafikVerisi, setGrafikVerisi] = useState([])
  
  const [tarih, setTarih] = useState(new Date());
  const [yenileme, setYenileme] = useState(0)

  // Form Verileri
  const [baslik, setBaslik] = useState("")
  const [neden, setNeden] = useState("")
  const [sure, setSure] = useState("")
  const [kategoriId, setKategoriId] = useState("") 
  
  const [duzenlenenId, setDuzenlenenId] = useState(null) 

  // --- YARDIMCI FONKSİYONLAR ---
  const filterTasksByDate = (tumGorevler, secilenTarih) => {
    const secilen = secilenTarih.toLocaleDateString('en-CA'); 
    const filtre = tumGorevler.filter(g => g.tarih === secilen)
    setFiltrelenmisGorevler(filtre)
  }

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const veriCek = async () => {
      try {
        // 1. Kategorileri Çek
        const resKat = await fetch('http://127.0.0.1:5000/kategoriler')
        const dataKat = await resKat.json()
        setKategoriler(dataKat)
        if(dataKat.length > 0 && !kategoriId) setKategoriId(dataKat[0].id)

        // 2. Şablonları Çek (YENİ)
        const resSab = await fetch('http://127.0.0.1:5000/sablonlar')
        const dataSab = await resSab.json()
        setSablonlar(dataSab)

        // 3. Görevleri Çek
        const resGorevler = await fetch('http://127.0.0.1:5000/gorevler')
        const dataGorevler = await resGorevler.json()
        setGorevler(dataGorevler)
        filterTasksByDate(dataGorevler, tarih)

        // 4. İstatistikleri Çek
        const resOzet = await fetch('http://127.0.0.1:5000/dashboard-ozet')
        setOzet(await resOzet.json())

        const resGrafik = await fetch('http://127.0.0.1:5000/grafik-verisi')
        setGrafikVerisi(await resGrafik.json())
      } catch (error) { console.error("Hata:", error) }
    }
    veriCek()
    // eslint-disable-next-line
  }, [yenileme, tarih]) 

  const takvimDegisti = (yeniTarih) => {
    setTarih(yeniTarih)
    filterTasksByDate(gorevler, yeniTarih)
  }

  // --- CRUD İŞLEMLERİ ---
  const formIslemi = async (e) => {
    e.preventDefault()
    const veri = { baslik, neden, sure, kategori_id: kategoriId }

    if (duzenlenenId) {
        await fetch(`http://127.0.0.1:5000/gorev-guncelle/${duzenlenenId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veri)
        })
        setDuzenlenenId(null) 
    } else {
        await fetch('http://127.0.0.1:5000/gorev-ekle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veri)
        })
    }
    setBaslik(""); setNeden(""); setSure(""); 
    setYenileme(prev => prev + 1)
  }

  const gorevSil = async (id) => {
    if(!confirm("Silmek istediğine emin misin?")) return;
    await fetch(`http://127.0.0.1:5000/gorev-sil/${id}`, { method: 'DELETE' }); 
    setYenileme(prev => prev + 1)
  }

  const gorevTamamla = async (id) => {
    await fetch(`http://127.0.0.1:5000/gorev-tamamla/${id}`, { method: 'POST' }); 
    setYenileme(prev => prev + 1)
  }

  const gorevDuzenleModunaGec = (gorev) => {
    setBaslik(gorev.baslik)
    setNeden(gorev.neden)
    setSure(gorev.sure)
    // Kategoriyi bulup seç
    const kat = kategoriler.find(k => k.ad === gorev.kategori.ad)
    if(kat) setKategoriId(kat.id)
    setDuzenlenenId(gorev.id)
  }

  // YENİ: Şablondan Form Doldurma Fonksiyonu
  const sablonSec = (sablon) => {
    setBaslik(sablon.baslik)
    setNeden(sablon.neden || "") // Eğer boşsa boş string ata
    setSure(sablon.sure || "")
    if(sablon.kategori && sablon.kategori.id !== 0) {
        setKategoriId(sablon.kategori.id)
    }
  }

  return (
    <div style={{ padding: '30px', color: 'white', fontFamily: '"Segoe UI", sans-serif' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontWeight: '300', fontSize: '1.8rem' }}>🚀 Akıllı Asistan <strong style={{fontWeight:'bold', color: '#667eea'}}>Kokpiti</strong></h1>
        <div style={{ fontSize: '0.9rem', color: '#888' }}>Hoşgeldin, Nazar</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        
        {/* --- SOL KOLON --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* İstatistikler */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div style={cardStyle}><h4 style={cardTitle}>Toplam Hedef</h4><p style={{...cardVal, color:'#a3a3ff'}}>{ozet.toplam_gorev}</p></div>
            <div style={cardStyle}><h4 style={cardTitle}>Bugün Biten</h4><p style={{...cardVal, color:'#2af598'}}>{ozet.bugun_tamamlanan}</p></div>
            <div style={cardStyle}><h4 style={cardTitle}>Başarı Oranı</h4><p style={{...cardVal, color:'#ff9a9e'}}>%{ozet.tamamlama_orani}</p></div>
          </div>

          {/* Grafik */}
          <div style={{ ...cardStyle, height: '350px', padding: '20px 20px 0 0' }}>
            <h3 style={{ marginLeft: '20px', marginTop: 0, color: '#ccc', fontSize: '1rem' }}>📈 Haftalık Performans</h3>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={grafikVerisi}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="gun" stroke="#555" tick={{fontSize: 12}} />
                <YAxis stroke="#555" />
                <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px' }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <Area type="monotone" dataKey="tamamlanan" stroke="#8884d8" fillOpacity={1} fill="url(#colorPv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Görev Listesi */}
          <div style={{ ...cardStyle, padding: '20px' }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', borderBottom: '1px solid #333', paddingBottom:'10px'}}>
                <h3 style={{ margin:0 }}>📋 Görev Listesi</h3>
                <span style={{fontSize:'0.8rem', color:'#888'}}>{tarih.toLocaleDateString('tr-TR')}</span>
            </div>
            
            <div style={{ display: 'grid', gap: '10px' }}>
              {filtrelenmisGorevler.length === 0 && <p style={{color:'#666', textAlign:'center'}}>Bu tarihte görev yok.</p>}
              
              {filtrelenmisGorevler.map((gorev) => (
                <div key={gorev.id} style={{ 
                    background: '#1f1f2e', 
                    borderLeft: `4px solid ${gorev.kategori ? gorev.kategori.renk : '#888'}`, 
                    padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                  <div style={{ opacity: gorev.tamamlandi_mi ? 0.5 : 1 }}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <h4 style={{ margin: 0, textDecoration: gorev.tamamlandi_mi ? 'line-through' : 'none', color: 'white' }}>{gorev.baslik}</h4>
                        <span style={{fontSize:'0.7rem', padding:'2px 8px', borderRadius:'10px', background: gorev.kategori.renk, color:'#000', fontWeight:'bold'}}>
                            {gorev.kategori.ad}
                        </span>
                    </div>
                    <small style={{ color: '#888' }}>{gorev.neden} • {gorev.sure} dk • {gorev.kullanici}</small>
                  </div>
                  <div style={{display:'flex', gap:'5px'}}>
                     <button onClick={() => gorevTamamla(gorev.id)} style={{...miniBtn, background: gorev.tamamlandi_mi ? '#444' : '#2af598', color: gorev.tamamlandi_mi ? '#ccc' : '#000'}}>
                        {gorev.tamamlandi_mi ? '↩️' : '✅'}
                     </button>
                     {!gorev.tamamlandi_mi && <button onClick={() => gorevDuzenleModunaGec(gorev)} style={{...miniBtn, background: '#ffcc00'}}>✏️</button>}
                     <button onClick={() => gorevSil(gorev.id)} style={{...miniBtn, background: '#ff4d4f'}}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- SAĞ KOLON --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ ...cardStyle, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>📅 Filtrele</h3>
            <Calendar onChange={takvimDegisti} value={tarih} className="dark-calendar" />
          </div>

          {/* Form Alanı */}
          <div style={{ ...cardStyle, padding: '20px', background: duzenlenenId ? 'linear-gradient(145deg, #4a3b00, #2e2500)' : 'linear-gradient(145deg, #1f1f2e, #161621)', border: duzenlenenId ? '1px solid #ffcc00' : 'none' }}>
            
            {/* YENİ: Hazır Şablonlar Alanı */}
            {!duzenlenenId && sablonlar.length > 0 && (
                <div style={{marginBottom:'20px'}}>
                    <h4 style={{marginTop:0, fontSize:'0.9rem', color:'#aaa'}}>✨ Hazır Şablon Kullan</h4>
                    <div style={{display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'5px'}}>
                        {sablonlar.map(s => (
                            <button 
                                key={s.id} 
                                onClick={() => sablonSec(s)}
                                style={{
                                    border: `1px solid ${s.kategori.renk}`, 
                                    background:'transparent', 
                                    color: 'white',
                                    padding:'5px 10px', 
                                    borderRadius:'15px', 
                                    cursor:'pointer', 
                                    fontSize:'0.8rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {s.baslik}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <h3 style={{ marginTop: 0, color: duzenlenenId ? '#ffcc00' : '#fff', fontSize: '1rem' }}>
                {duzenlenenId ? '✏️ Görevi Düzenle' : '➕ Hızlı Ekle'}
            </h3>
            <form onSubmit={formIslemi} style={{ display: 'grid', gap: '12px' }}>
              
              <select value={kategoriId} onChange={(e) => setKategoriId(e.target.value)} style={inputStyle}>
                  {kategoriler.map(k => (
                      <option key={k.id} value={k.id}>{k.ad}</option>
                  ))}
              </select>

              <input type="text" placeholder="Görev Başlığı" value={baslik} onChange={(e) => setBaslik(e.target.value)} required style={inputStyle} />
              <input type="text" placeholder="Motivasyonun ne?" value={neden} onChange={(e) => setNeden(e.target.value)} required style={inputStyle} />
              <input type="number" placeholder="Süre (Dk)" value={sure} onChange={(e) => setSure(e.target.value)} required style={inputStyle} />
              
              <div style={{display:'flex', gap:'10px'}}>
                  <button type="submit" style={{...buttonStyle, background: duzenlenenId ? '#ffcc00' : '#00d26a', color: duzenlenenId ? 'black' : 'white'}}>
                    {duzenlenenId ? 'GÜNCELLE' : 'KAYDET'}
                  </button>
                  {duzenlenenId && (
                      <button type="button" onClick={() => {setDuzenlenenId(null); setBaslik(""); setNeden(""); setSure("")}} style={{...buttonStyle, background:'#444'}}>
                          İPTAL
                      </button>
                  )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

const cardStyle = { background: '#27293d', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', padding: '20px' }
const cardTitle = { margin: 0, opacity: 0.7 }
const cardVal = { fontSize: '2.5rem', fontWeight: 'bold', margin: '5px 0' }
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #444', background: '#14141c', color: 'white', fontSize: '0.9rem' }
const buttonStyle = { padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }
const miniBtn = { border:'none', padding:'8px 12px', borderRadius:'5px', cursor:'pointer', color:'#000', fontSize:'1rem' }

export default Dashboard