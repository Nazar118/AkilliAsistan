# 🤖 Akıllı Asistan - Merkezi Yönetim Sistemi

> 🚧 **Durum: Aktif Geliştirme Aşamasında**
> *Bu proje şu anda geliştirilme sürecindedir ve yeni özellikler eklenmeye devam etmektedir.*

Akıllı Asistan, süreçleri optimize eden, bildirim saatlerini kontrol eden ve verileri gerçek zamanlı işleyen modern bir yönetim projesidir. Bu proje, hızlı bir önyüz deneyimi ve güçlü bir veri işleme altyapısı sunar.

## 📸 Ekran Görüntüleri

### 🖥️ Yönetim Paneli (Dark Mode)
![Dashboard](images/dashboard.png)

## 🏗️ Sistem Mimarisi

- **`admin-panel/` (Frontend):** Kullanıcıların etkileşime girdiği şık, modern ve hızlı arayüz katmanı.
- **`backend/` (Sunucu):** Arka planda verileri işleyen, bildirimleri yöneten ve veritabanıyla iletişim kuran API katmanı.
- **`mobile-app/` (Mobil):** Sistemle taşınabilir entegrasyon sağlayan mobil uygulama katmanı.

## 🛠️ Kullanılan Teknolojiler

### 🎨 Frontend (Önyüz)
- **Ana Dil & Kütüphane:** JavaScript, React.js (JSX Component Mimarisi)
- **Derleyici (Build Tool):** Vite (Ultra hızlı geliştirme ortamı)
- **Tasarım:** CSS (Özel Dark Mode Teması)
- **Yardımcı Araçlar:** - `recharts` (Performans ve veri grafikleri)
  - `react-toastify` (Dinamik kullanıcı bildirimleri)
  - `react-router-dom` (SPA sayfa yönlendirmeleri)

### 🧠 Backend (Arkayüz)
- **Ana Dil:** Python
- **Framework:** Flask (Hafif ve hızlı REST API)

### 🗄️ Veritabanı
- **Veritabanı Motoru:** Microsoft SQL Server
- **ORM & Bağlantı:** SQLAlchemy, PyODBC (Karmaşık SQL sorgularının Python nesneleri ile yönetimi)

## ⚙️ Kurulum (Geliştiriciler İçin)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

1. Repoyu klonlayın:
```bash
git clone [https://github.com/Nazar118/AkilliAsistan.git](https://github.com/Nazar118/AkilliAsistan.git)