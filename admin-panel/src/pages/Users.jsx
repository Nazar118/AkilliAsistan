import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaEnvelope, FaClock, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  // 👇 EKSİK OLAN SATIR BURAYA GELİYOR:
  const navigate = useNavigate(); 
  
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Backend'den kullanıcıları çek
    fetch('http://127.0.0.1:5000/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div style={{ padding: '30px', color: 'white', fontFamily: '"Segoe UI", sans-serif' }}>
      
      {/* ÜST BAŞLIK */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, fontWeight: '300' }}>👥 Kullanıcı <strong style={{ fontWeight: 'bold', color: '#667eea' }}>Yönetimi</strong></h1>
        <small style={{ color: '#888' }}>Sistemdeki kayıtlı personeller ve performansları</small>
      </div>

      {/* KULLANICI KARTLARI IZGARASI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
        
        {users.map((user) => (
          <div key={user.id} style={cardStyle}>
            
            {/* Profil Kısmı */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <img 
                src={user.avatar} 
                alt={user.ad} 
                style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #667eea' }} 
              />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user.ad}</h3>
                <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '3px 8px', 
                    borderRadius: '10px', 
                    background: user.rol === 'Admin' ? '#ff4d4f' : '#1890ff', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                  {user.rol}
                </span>
              </div>
            </div>

            {/* Bilgiler */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#aaa', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaEnvelope /> {user.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaClock /> Son Giriş: <span style={{ color: '#fff' }}>{user.son_giris}</span>
              </div>
            </div>

            {/* Performans Çubuğu */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaChartLine /> Başarı Oranı</span>
                <span style={{ fontWeight: 'bold', color: user.basari_orani > 50 ? '#2af598' : '#ff6b6b' }}>%{user.basari_orani}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                    width: `${user.basari_orani}%`, 
                    height: '100%', 
                    background: user.basari_orani > 50 ? 'linear-gradient(90deg, #2af598, #009efd)' : 'linear-gradient(90deg, #ff9a9e, #ff6b6b)',
                    borderRadius: '4px'
                  }}>
                </div>
              </div>
            </div>

            {/* Detay Butonu */}
            <button style={buttonStyle} onClick={() => navigate(`/users/${user.id}`)}>
              Detayları Gör
            </button>

          </div>
        ))}

      </div>
    </div>
  );
};

// Stiller
const cardStyle = {
  background: '#1e1e2f',
  padding: '25px',
  borderRadius: '15px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  transition: 'transform 0.2s',
  border: '1px solid #2c2c3e'
};

const buttonStyle = {
  width: '100%',
  marginTop: '20px',
  padding: '10px',
  background: 'transparent',
  border: '1px solid #667eea',
  color: '#667eea',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'all 0.3s'
};

export default Users;