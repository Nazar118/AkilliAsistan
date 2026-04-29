import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTasks, FaUsers, FaBell, FaGamepad, FaChartPie, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const menuItems = [
    { path: "/", name: "Dashboard", icon: <FaHome /> },
    { path: "/users", name: "Kullanıcı Yönetimi", icon: <FaUsers /> },
    { path: "/tasks", name: "Görev Yönetimi", icon: <FaTasks /> },
    { path: "/notifications", name: "Bildirim & Motivasyon", icon: <FaBell /> },
    { path: "/gamification", name: "Oyunlaştırma", icon: <FaGamepad /> },
    { path: "/stats", name: "İstatistikler", icon: <FaChartPie /> },
    { path: "/settings", name: "Ayarlar", icon: <FaCog /> },
  ];

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      background: '#1e1e2f', // Koyu Sidebar rengi
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      borderRight: '1px solid #2c2c3e',
      position: 'fixed', // Sabit durması için
      left: 0,
      top: 0
    }}>
      {/* --- LOGO ALANI --- */}
      <div style={{ marginBottom: '40px', textAlign: 'center', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          🚀 Akıllı<span style={{ color: '#667eea' }}>Asistan</span>
        </h2>
        <small style={{ color: '#888' }}>Admin Paneli</small>
      </div>

      {/* --- MENÜ LİNKLERİ --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '12px 15px',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#aab', // Seçiliyse beyaz, değilse gri
              background: isActive ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' : 'transparent', // Eczanem Pro efekti
              borderRadius: '10px',
              fontWeight: isActive ? 'bold' : 'normal',
              transition: 'all 0.3s'
            })}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* --- ÇIKIŞ BUTONU --- */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid #333', paddingTop: '20px' }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          width: '100%', padding: '12px', background: '#ff4d4f', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
        }}>
          <FaSignOutAlt /> Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default Sidebar;