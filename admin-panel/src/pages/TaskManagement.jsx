import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaTags, FaClipboardList, FaClock, FaChartPie } from 'react-icons/fa';
// YENİ: Grafik Kütüphaneleri
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TaskManagement = () => {
  const [aktifSekme, setAktifSekme] = useState('kategoriler'); 
  const [yenile, setYenile] = useState(0);

  // --- KATEGORİ & ŞABLON STATE'LERİ ---
  const [kategoriler, setKategoriler] = useState([]);
  const [sablonlar, setSablonlar] = useState([]);
  
  // --- İSTATİSTİK STATE'İ ---
  const [istatistikler, setIstatistikler] = useState({ populer_gorevler: [], kategori_dagilimi: [] });

  // Form State'leri (Kategori & Şablon için ortak alanlar)
  const [katAd, setKatAd] = useState("");
  const [katRenk, setKatRenk] = useState("#667eea"); 
  const [duzenlenenKatId, setDuzenlenenKatId] = useState(null);

  const [sabBaslik, setSabBaslik] = useState("");
  const [sabNeden, setSabNeden] = useState("");
  const [sabSure, setSabSure] = useState("");
  const [sabKatId, setSabKatId] = useState("");

  // --- VERİ ÇEKME ---
  const verileriGetir = async () => {
    try {
      const resKat = await fetch('http://127.0.0.1:5000/kategoriler');
      setKategoriler(await resKat.json());

      const resSab = await fetch('http://127.0.0.1:5000/sablonlar');
      setSablonlar(await resSab.json());

      // YENİ: İstatistikleri Çek
      const resStat = await fetch('http://127.0.0.1:5000/gorev-istatistikleri');
      setIstatistikler(await resStat.json());

    } catch (error) { console.error("Hata:", error); }
  };

  useEffect(() => {
    // eslint-disable-next-line
    verileriGetir();
  }, [yenile]);

  // --- KATEGORİ İŞLEMLERİ ---
  const kategoriKaydet = async (e) => {
    e.preventDefault();
    if (!katAd) return alert("Kategori adı giriniz");
    const url = duzenlenenKatId ? `http://127.0.0.1:5000/kategori-guncelle/${duzenlenenKatId}` : 'http://127.0.0.1:5000/kategori-ekle';
    const method = duzenlenenKatId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ad: katAd, renk: katRenk }) });
    setKatAd(""); setKatRenk("#667eea"); setDuzenlenenKatId(null); setYenile(prev => prev + 1);
  };

  const kategoriSil = async (id) => {
    if (confirm("Silmek istediğine emin misin?")) {
      await fetch(`http://127.0.0.1:5000/kategori-sil/${id}`, { method: 'DELETE' });
      setYenile(prev => prev + 1);
    }
  };

  // --- ŞABLON İŞLEMLERİ ---
  const sablonKaydet = async (e) => {
    e.preventDefault();
    if (!sabBaslik) return alert("Başlık giriniz");
    await fetch('http://127.0.0.1:5000/sablon-ekle', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baslik: sabBaslik, neden: sabNeden, sure: sabSure, kategori_id: sabKatId })
    });
    setSabBaslik(""); setSabNeden(""); setSabSure(""); setSabKatId(""); setYenile(prev => prev + 1);
  };

  const sablonSil = async (id) => {
    if (confirm("Silinecek mi?")) {
      await fetch(`http://127.0.0.1:5000/sablon-sil/${id}`, { method: 'DELETE' });
      setYenile(prev => prev + 1);
    }
  };

  return (
    <div style={{ padding: '30px', color: 'white', fontFamily: '"Segoe UI", sans-serif' }}>
      
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, fontWeight: '300' }}>📝 Görev <strong style={{ fontWeight: 'bold', color: '#667eea' }}>Yönetimi</strong></h1>
        <small style={{ color: '#888' }}>Kategorileri, şablonları yönet ve analizleri incele.</small>
      </div>

      {/* SEKME BUTONLARI */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button onClick={() => setAktifSekme('kategoriler')} style={aktifSekme === 'kategoriler' ? activeTabStyle : tabStyle}>
          <FaTags /> Kategori Yönetimi
        </button>
        <button onClick={() => setAktifSekme('sablonlar')} style={aktifSekme === 'sablonlar' ? activeTabStyle : tabStyle}>
          <FaClipboardList /> Görev Şablonları
        </button>
        <button onClick={() => setAktifSekme('istatistikler')} style={aktifSekme === 'istatistikler' ? activeTabStyle : tabStyle}>
          <FaChartPie /> İstatistikler
        </button>
      </div>

      {/* --- 1. KATEGORİ SEKMESİ --- */}
      {aktifSekme === 'kategoriler' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: '#2af598' }}>{duzenlenenKatId ? "Düzenle" : "Yeni Kategori"}</h3>
            <form onSubmit={kategoriKaydet} style={{ display: 'grid', gap: '15px' }}>
              <input type="text" value={katAd} onChange={e => setKatAd(e.target.value)} placeholder="Kategori Adı" style={inputStyle} />
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <input type="color" value={katRenk} onChange={e => setKatRenk(e.target.value)} style={{ width: '50px', height: '40px', border:'none', background:'transparent', cursor:'pointer' }} />
                <span>{katRenk}</span>
              </div>
              <button type="submit" style={buttonStyle}>{duzenlenenKatId ? "GÜNCELLE" : "EKLE"}</button>
            </form>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', alignContent:'start' }}>
            {kategoriler.map((kat) => (
              <div key={kat.id} style={{ ...cardStyle, borderLeft: `5px solid ${kat.renk}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{fontWeight:'bold'}}>{kat.ad}</span>
                <div style={{display:'flex', gap:'5px'}}>
                   <button onClick={() => {setKatAd(kat.ad); setKatRenk(kat.renk); setDuzenlenenKatId(kat.id)}} style={iconBtn}><FaEdit color='#ffcc00'/></button>
                   <button onClick={() => kategoriSil(kat.id)} style={iconBtn}><FaTrash color='#ff4d4f'/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- 2. ŞABLON SEKMESİ --- */}
      {aktifSekme === 'sablonlar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, color: '#a3a3ff' }}>Yeni Şablon</h3>
            <form onSubmit={sablonKaydet} style={{ display: 'grid', gap: '15px' }}>
              <select value={sabKatId} onChange={e => setSabKatId(e.target.value)} style={inputStyle}>
                <option value="">Kategori Seçiniz (Opsiyonel)</option>
                {kategoriler.map(k => <option key={k.id} value={k.id}>{k.ad}</option>)}
              </select>
              <input type="text" value={sabBaslik} onChange={e => setSabBaslik(e.target.value)} placeholder="Başlık" style={inputStyle} required />
              <input type="text" value={sabNeden} onChange={e => setSabNeden(e.target.value)} placeholder="Motivasyon Mesajı" style={inputStyle} />
              <input type="number" value={sabSure} onChange={e => setSabSure(e.target.value)} placeholder="Süre (Dk)" style={inputStyle} />
              <button type="submit" style={{...buttonStyle, background: '#a3a3ff'}}>ŞABLONU KAYDET</button>
            </form>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', alignContent:'start' }}>
            {sablonlar.map((sab) => (
              <div key={sab.id} style={{ ...cardStyle, borderTop: `4px solid ${sab.kategori.renk}` }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                    <span style={{fontSize:'0.8rem', background: sab.kategori.renk, padding:'2px 8px', borderRadius:'4px', color:'#000', fontWeight:'bold'}}>{sab.kategori.ad}</span>
                    <button onClick={() => sablonSil(sab.id)} style={{...iconBtn, background:'transparent'}}><FaTrash color='#666'/></button>
                </div>
                <h4 style={{ margin: '10px 0 5px 0' }}>{sab.baslik}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa' }}>"{sab.neden}"</p>
                <div style={{marginTop:'10px', fontSize:'0.85rem', color:'#2af598', display:'flex', alignItems:'center', gap:'5px'}}>
                    <FaClock /> {sab.sure ? `${sab.sure} dk` : 'Süre Yok'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- 3. YENİ: İSTATİSTİK SEKMESİ --- */}
      {aktifSekme === 'istatistikler' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* Grafik 1: En Çok Eklenen Görevler (Bar Chart) */}
            <div style={{ ...cardStyle, height: '400px' }}>
                <h3 style={{ textAlign:'center', color:'#ccc' }}>🔥 En Çok Tekrar Eden 5 Görev</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={istatistikler.populer_gorevler} layout="vertical">
                        <XAxis type="number" stroke="#888" />
                        <YAxis dataKey="ad" type="category" width={150} stroke="#ccc" tick={{fontSize: 12}} />
                        <Tooltip contentStyle={{backgroundColor:'#333', border:'none'}} />
                        <Bar dataKey="sayi" fill="#8884d8" barSize={30} radius={[0, 10, 10, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Grafik 2: Kategori Dağılımı (Pie Chart) */}
            <div style={{ ...cardStyle, height: '400px' }}>
                <h3 style={{ textAlign:'center', color:'#ccc' }}>🎨 Kategori Yoğunluğu</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                        <Pie
                            data={istatistikler.kategori_dagilimi}
                            dataKey="sayi"
                            nameKey="ad"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {istatistikler.kategori_dagilimi.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.renk} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor:'#333', border:'none'}} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            
        </div>
      )}

    </div>
  );
};

// Stiller
const cardStyle = { background: '#1e1e2f', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #444', background: '#14141c', color: 'white', fontSize:'0.9rem' };
const buttonStyle = { width: '100%', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', background: '#2af598', color: 'black' };
const iconBtn = { background: '#27293d', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' };
const tabStyle = { padding: '10px 20px', background: 'transparent', border: '1px solid #444', color: '#888', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem' };
const activeTabStyle = { ...tabStyle, background: '#667eea', color: 'white', border: '1px solid #667eea', fontWeight: 'bold' };

export default TaskManagement;