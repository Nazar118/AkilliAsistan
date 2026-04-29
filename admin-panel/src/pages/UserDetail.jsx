import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTasks, FaCheckCircle, FaClock, FaHourglassHalf } from 'react-icons/fa';
// YENİ: Grafik Kütüphanesi
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/users/${id}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error("Hata:", err));
  }, [id]);

  if (!user) return <div style={{padding:'50px', color:'white'}}>Yükleniyor...</div>;

  return (
    <div style={{ padding: '30px', color: 'white', fontFamily: '"Segoe UI", sans-serif' }}>
      
      <button onClick={() => navigate('/users')} style={backBtnStyle}>
        <FaArrowLeft /> Kullanıcı Listesine Dön
      </button>

      <div style={{ margin: '20px 0 30px 0', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, fontWeight: '300' }}>👤 Personel <strong style={{ fontWeight: 'bold', color: '#667eea' }}>Detayı</strong></h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* SOL: PROFİL KARTI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <img 
                src={user.profil.avatar} 
                alt={user.profil.ad} 
                style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #667eea', marginBottom: '15px' }} 
                />
                <h2 style={{ margin: '0 0 5px 0' }}>{user.profil.ad}</h2>
                <span style={{ 
                    background: user.profil.rol === 'Admin' ? '#ff4d4f' : '#1890ff', 
                    padding: '5px 15px', borderRadius: '15px', fontSize: '0.9rem', fontWeight: 'bold' 
                }}>
                {user.profil.rol}
                </span>
                <p style={{ color: '#aaa', marginTop: '15px' }}>{user.profil.email}</p>
            </div>
            </div>
            {/* Buraya ileride başka kişisel notlar vs. eklenebilir */}
        </div>

        {/* SAĞ: İSTATİSTİKLER VE GRAFİK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* 1. İstatistik Kutuları */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ ...statCard, borderLeft: '4px solid #a3a3ff' }}>
                    <FaTasks size={24} color="#a3a3ff" />
                    <div><h4 style={{ margin: 0, opacity: 0.7 }}>Toplam Görev</h4><span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user.istatistikler.toplam}</span></div>
                </div>
                <div style={{ ...statCard, borderLeft: '4px solid #2af598' }}>
                    <FaCheckCircle size={24} color="#2af598" />
                    <div><h4 style={{ margin: 0, opacity: 0.7 }}>Tamamlanan</h4><span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user.istatistikler.biten}</span></div>
                </div>
                <div style={{ ...statCard, borderLeft: '4px solid #ffbb28' }}>
                    <FaHourglassHalf size={24} color="#ffbb28" />
                    <div><h4 style={{ margin: 0, opacity: 0.7 }}>Devam Eden</h4><span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user.istatistikler.devam_eden}</span></div>
                </div>
                <div style={{ ...statCard, borderLeft: '4px solid #ff9a9e' }}>
                    <FaClock size={24} color="#ff9a9e" />
                    <div><h4 style={{ margin: 0, opacity: 0.7 }}>En Aktif Saat</h4><span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user.istatistikler.aktif_saat}</span></div>
                </div>
            </div>

            {/* 2. YENİ: Grafik Alanı */}
            <div style={{ ...cardStyle, height: '300px', padding: '20px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#ccc', fontSize: '1rem' }}>📈 Son 7 Günlük Performans</h3>
                <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={user.grafik}>
                    <defs>
                    <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <XAxis dataKey="gun" stroke="#555" tick={{fontSize: 12}} />
                    <YAxis stroke="#555" />
                    <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px' }} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <Area type="monotone" dataKey="tamamlanan" stroke="#667eea" fillOpacity={1} fill="url(#colorUser)" />
                </AreaChart>
                </ResponsiveContainer>
            </div>

        </div>

      </div>
    </div>
  );
};

// --- STİLLER ---
const backBtnStyle = { background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginBottom: '10px' };
const cardStyle = { background: '#1e1e2f', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' };
const statCard = { background: '#27293d', borderRadius: '10px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };

export default UserDetail;