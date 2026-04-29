from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import urllib.parse
from datetime import datetime, date, timedelta
import random # Rastgele veri üretmek için

app = Flask(__name__)
CORS(app)

# --- SQL SERVER BAĞLANTISI ---
params = urllib.parse.quote_plus(
    'DRIVER={ODBC Driver 17 for SQL Server};'
    'SERVER=NAZAR\\SQLEXPRESS;' 
    'DATABASE=AkilliAsistanDB;'
    'Trusted_Connection=yes;'
)

app.config['SQLALCHEMY_DATABASE_URI'] = f"mssql+pyodbc:///?odbc_connect={params}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# --- MODELLER ---

# 1. YENİ: Kullanıcı Modeli
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), default="User") # Admin veya User
    avatar = db.Column(db.String(200), nullable=True) # Profil resmi linki
    last_login = db.Column(db.DateTime, default=datetime.now)
    # İlişki: Bir kullanıcının birden çok görevi olabilir
    tasks = db.relationship('Task', backref='user', lazy=True)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(20), nullable=False)

# --- YENİ: Şablon Modeli ---
class TaskTemplate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    reason = db.Column(db.String(200), nullable=True) 
    duration = db.Column(db.Integer, nullable=True)
    # Hangi kategoride görünecek?
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    category = db.relationship('Category', backref=db.backref('templates', lazy=True))

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    reason = db.Column(db.String(200), nullable=True) 
    duration = db.Column(db.Integer, nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    category = db.relationship('Category', backref=db.backref('tasks', lazy=True))
    
    # YENİ: Kullanıcı Bağlantısı (Boş olabilir şimdilik)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

# --- YENİ: Bildirim Kuralları ---
class NotificationRule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    scenario = db.Column(db.String(50), unique=True, nullable=False) # Kod tarafındaki adı (örn: task_due)
    label = db.Column(db.String(100), nullable=False) # Ekranda görünecek ad (örn: Görev Zamanı Geldiğinde)
    message = db.Column(db.String(500), nullable=False) # Mesaj içeriği
    is_active = db.Column(db.Boolean, default=True) # Açık/Kapalı

# --- YENİ: Bildirim Geçmişi (Hafıza) ---
class NotificationLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    scenario = db.Column(db.String(50), nullable=False) # Hangi kural? (örn: task_due)
    sent_at = db.Column(db.DateTime, default=datetime.now)    

# --- YENİ: Genel Ayarlar (Zamanlama vb.) ---
class SystemSetting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False) # örn: reminder_delay
    value = db.Column(db.String(100), nullable=False) # örn: 10    

# --- BAŞLANGIÇ VERİLERİ (SEED) ---
@app.before_request
def initialize_data():
    db.create_all()
    
    # 1. Kategoriler Yoksa Ekle
    if Category.query.count() == 0:
        db.session.add_all([
            Category(name="Genel", color="#8884d8"),
            Category(name="İş", color="#0088FE"),
            Category(name="Ders", color="#00C49F"),
            Category(name="Sağlık", color="#FFBB28"),
        ])
        db.session.commit()


    # 3. Bildirim Kuralları Yoksa Ekle
    if NotificationRule.query.count() == 0:
        rules = [
            NotificationRule(scenario="task_due", label="Görev Zamanı Geldiğinde", message="Hadi bakalım, '{baslik}' zamanı! 🚀"),
            NotificationRule(scenario="delay_10min", label="10 Dk Gecikince", message="Hey! '{baslik}' görevine hala başlamadın mı? 👀"),
            NotificationRule(scenario="postponed", label="Ertelendiğinde", message="Tamamdır, '{baslik}' görevini erteledim ama unutma!"),
            NotificationRule(scenario="daily_goal", label="Günlük Hedef Tamamlanınca", message="Tebrikler! Bugün harika iş çıkardın. 🎉"),
            NotificationRule(scenario="streak_7day", label="7 Günlük Seri Yapınca", message="🔥 İNANILMAZ! 7 gündür durdurulamıyorsun!"),
        ]
        db.session.add_all(rules)
        db.session.commit()
    

    # 4. Sistem Ayarları Yoksa Ekle
    if SystemSetting.query.count() == 0:
        settings = [
            SystemSetting(key="reminder_delay", value="10"), # İkinci hatırlatma süresi (dk)
            SystemSetting(key="max_daily_notif", value="5"), # Günlük maks bildirim
        ]
        db.session.add_all(settings)
        db.session.commit()    

    # 2. Kullanıcılar Yoksa Ekle (Test için sahte kullanıcılar)
    if User.query.count() == 0:
        users = [
            User(name="Nazar (Admin)", email="nazar@admin.com", role="Admin", avatar="https://i.pravatar.cc/150?u=nazar"),
            User(name="Ahmet Yılmaz", email="ahmet@mail.com", role="User", avatar="https://i.pravatar.cc/150?u=ahmet"),
            User(name="Ayşe Demir", email="ayse@mail.com", role="User", avatar="https://i.pravatar.cc/150?u=ayse"),
            User(name="Mehmet Öz", email="mehmet@mail.com", role="User", avatar="https://i.pravatar.cc/150?u=mehmet"),
        ]
        db.session.add_all(users)
        db.session.commit()
        
        # Mevcut görevleri Admin'e ata (Sahipsiz kalmasınlar)
        admin = User.query.first()
        for gorev in Task.query.all():
            gorev.user_id = admin.id
        db.session.commit()

# --- ROTALAR ---

@app.route('/', methods=['GET'])
def home():
    return jsonify({"mesaj": "Sistem Aktif - Kullanıcı Modülü", "durum": "OK"})

# 1. KULLANICI LİSTESİ (Detaylı Bilgi ile)
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    liste = []
    for u in users:
        toplam = len(u.tasks)
        biten = len([t for t in u.tasks if t.is_completed])
        oran = int((biten / toplam) * 100) if toplam > 0 else 0
        
        liste.append({
            "id": u.id,
            "ad": u.name,
            "email": u.email,
            "rol": u.role,
            "avatar": u.avatar,
            "son_giris": u.last_login.strftime("%d.%m.%Y"),
            "basari_orani": oran,
            "toplam_gorev": toplam
        })
    return jsonify(liste)

# 2. TEK KULLANICI DETAYI (Grafik Verisi Eklendi!)
@app.route('/users/<int:id>', methods=['GET'])
def get_user_detail(id):
    u = db.session.get(User, id)
    if not u: return jsonify({"hata": "Bulunamadı"}), 404

    # 1. Genel İstatistikler
    toplam = len(u.tasks)
    biten = len([t for t in u.tasks if t.is_completed])
    devam = toplam - biten
    
    # En Aktif Saat
    saatler = [t.created_at.hour for t in u.tasks if t.created_at is not None]
    en_aktif_saat = max(set(saatler), key=saatler.count) if saatler else 0
    aktif_saat_str = f"{en_aktif_saat}:00 - {en_aktif_saat+1}:00"

    # 2. YENİ: Kişiye Özel Son 7 Gün Grafiği
    bugun = date.today()
    grafik_verisi = []
    tr_gunler = {0: 'Pzt', 1: 'Sal', 2: 'Çar', 3: 'Per', 4: 'Cum', 5: 'Cmt', 6: 'Paz'}

    for i in range(6, -1, -1):
        hedef_gun = bugun - timedelta(days=i)
        
        # Sadece BU KULLANICIYA ait ve o gün biten görevleri say
        sayi = Task.query.filter(
            Task.user_id == id, # <--- Kilit Nokta: Sadece bu kullanıcı
            Task.is_completed == True,
            Task.completed_at != None,
            db.func.cast(Task.completed_at, db.Date) == hedef_gun
        ).count()
        
        grafik_verisi.append({
            "gun": tr_gunler[hedef_gun.weekday()],
            "tamamlanan": sayi
        })

    return jsonify({
        "profil": {
            "ad": u.name,
            "email": u.email,
            "avatar": u.avatar,
            "rol": u.role
        },
        "istatistikler": {
            "toplam": toplam,
            "biten": biten,
            "devam_eden": devam,
            "aktif_saat": aktif_saat_str
        },
        "grafik": grafik_verisi # <--- Yeni Veri Paketi
    })
# --- DİĞER STANDART ROTALAR (Aynen kaldı) ---
@app.route('/kategoriler', methods=['GET'])
def get_categories():
    kategoriler = Category.query.all()
    return jsonify([{"id": k.id, "ad": k.name, "renk": k.color} for k in kategoriler])

@app.route('/gorevler', methods=['GET'])
def get_tasks():
    tum_gorevler = Task.query.order_by(Task.id.desc()).all()
    liste = []
    for gorev in tum_gorevler:
        tarih_str = gorev.created_at.strftime("%Y-%m-%d") if gorev.created_at else ""
        kategori_bilgisi = {"ad": "Genel", "renk": "#888"}
        if gorev.category:
            kategori_bilgisi = {"ad": gorev.category.name, "renk": gorev.category.color}
        
        # Kullanıcı bilgisini de ekleyelim
        kullanici_adi = gorev.user.name if gorev.user else "Bilinmiyor"

        liste.append({
            "id": gorev.id,
            "baslik": gorev.title,
            "neden": gorev.reason,
            "sure": gorev.duration,
            "tamamlandi_mi": gorev.is_completed,
            "tarih": tarih_str,
            "kategori": kategori_bilgisi,
            "kullanici": kullanici_adi
        })
    return jsonify(liste)

@app.route('/gorev-ekle', methods=['POST'])
def add_task():
    data = request.json
    # Şimdilik varsayılan olarak ilk kullanıcıya (Admin) atayalım
    ilk_user = User.query.first()
    yeni_gorev = Task(
        title=data['baslik'], reason=data['neden'], duration=data['sure'],
        category_id=data.get('kategori_id'),
        user_id=ilk_user.id if ilk_user else None
    )
    db.session.add(yeni_gorev)
    db.session.commit()
    return jsonify({"mesaj": "Eklendi"})

@app.route('/gorev-guncelle/<int:id>', methods=['PUT'])
def update_task(id):
    gorev = db.session.get(Task, id)
    data = request.json
    if gorev:
        gorev.title = data['baslik']
        gorev.reason = data['neden']
        gorev.duration = data['sure']
        if 'kategori_id' in data: gorev.category_id = data['kategori_id']
        db.session.commit()
        return jsonify({"mesaj": "Güncellendi"})
    return jsonify({"hata": "Yok"}), 404

@app.route('/gorev-sil/<int:id>', methods=['DELETE'])
def delete_task(id):
    gorev = db.session.get(Task, id)
    if gorev:
        db.session.delete(gorev)
        db.session.commit()
        return jsonify({"mesaj": "Silindi"})
    return jsonify({"hata": "Yok"}), 404

@app.route('/gorev-tamamla/<int:id>', methods=['POST'])
def complete_task(id):
    gorev = db.session.get(Task, id)
    if gorev:
        if gorev.is_completed:
            gorev.is_completed = False
            gorev.completed_at = None
        else:
            gorev.is_completed = True
            gorev.completed_at = datetime.now()
        db.session.commit()
        return jsonify({"mesaj": "Durum değişti"})
    return jsonify({"hata": "Yok"}), 404

@app.route('/dashboard-ozet', methods=['GET'])
def dashboard_stats():
    toplam_gorev = Task.query.count()
    tamamlanan = Task.query.filter_by(is_completed=True).count()
    bugun = date.today()
    bugun_tamamlanan = Task.query.filter(Task.is_completed == True, Task.completed_at != None, db.func.cast(Task.completed_at, db.Date) == bugun).count()
    oran = 0
    if toplam_gorev > 0: oran = int((tamamlanan / toplam_gorev) * 100)
    return jsonify({"toplam_kullanici": User.query.count(), "bugun_tamamlanan": bugun_tamamlanan, "tamamlama_orani": oran, "toplam_gorev": toplam_gorev})

@app.route('/grafik-verisi', methods=['GET'])
def get_graph_data():
    bugun = date.today()
    son_7_gun_verisi = []
    tr_gunler = {0: 'Pzt', 1: 'Sal', 2: 'Çar', 3: 'Per', 4: 'Cum', 5: 'Cmt', 6: 'Paz'}
    for i in range(6, -1, -1):
        hedef_gun = bugun - timedelta(days=i)
        sayi = Task.query.filter(Task.is_completed == True, Task.completed_at != None, db.func.cast(Task.completed_at, db.Date) == hedef_gun).count()
        son_7_gun_verisi.append({"gun": tr_gunler[hedef_gun.weekday()], "tamamlanan": sayi})
    return jsonify(son_7_gun_verisi)

# --- YENİ: KATEGORİ YÖNETİMİ ROTALARI ---

@app.route('/kategori-ekle', methods=['POST'])
def add_category():
    data = request.json
    # Aynı isimde kategori var mı kontrol et
    mevcut = Category.query.filter_by(name=data['ad']).first()
    if mevcut:
        return jsonify({"hata": "Bu kategori zaten var"}), 400
        
    yeni_kat = Category(name=data['ad'], color=data['renk'])
    db.session.add(yeni_kat)
    db.session.commit()
    return jsonify({"mesaj": "Kategori eklendi"})

@app.route('/kategori-sil/<int:id>', methods=['DELETE'])
def delete_category(id):
    kat = db.session.get(Category, id)
    if kat:
        # Önce bu kategoriye ait görevleri "Genel"e veya Boşa çekmemiz lazım, yoksa hata verir.
        # Şimdilik o görevlerin kategorisini boşaltıyoruz (None yapıyoruz)
        bagli_gorevler = Task.query.filter_by(category_id=id).all()
        for g in bagli_gorevler:
            g.category_id = None
        
        db.session.delete(kat)
        db.session.commit()
        return jsonify({"mesaj": "Silindi"})
    return jsonify({"hata": "Bulunamadı"}), 404

@app.route('/kategori-guncelle/<int:id>', methods=['PUT'])
def update_category(id):
    kat = db.session.get(Category, id)
    data = request.json
    if kat:
        kat.name = data['ad']
        kat.color = data['renk']
        db.session.commit()
        return jsonify({"mesaj": "Güncellendi"})
    return jsonify({"hata": "Bulunamadı"}), 404

# --- ŞABLON ROTALARI ---

@app.route('/sablonlar', methods=['GET'])
def get_templates():
    sablonlar = TaskTemplate.query.all()
    liste = []
    for s in sablonlar:
        kat_bilgi = {"id": 0, "ad": "Genel", "renk": "#888"}
        if s.category:
            kat_bilgi = {"id": s.category.id, "ad": s.category.name, "renk": s.category.color}
            
        liste.append({
            "id": s.id,
            "baslik": s.title,
            "neden": s.reason,
            "sure": s.duration,
            "kategori": kat_bilgi
        })
    return jsonify(liste)

@app.route('/sablon-ekle', methods=['POST'])
def add_template():
    data = request.json
    yeni = TaskTemplate(
        title=data['baslik'],
        reason=data['neden'],
        duration=data['sure'],
        category_id=data.get('kategori_id')
    )
    db.session.add(yeni)
    db.session.commit()
    return jsonify({"mesaj": "Şablon eklendi"})

@app.route('/sablon-sil/<int:id>', methods=['DELETE'])
def delete_template(id):
    s = db.session.get(TaskTemplate, id)
    if s:
        db.session.delete(s)
        db.session.commit()
        return jsonify({"mesaj": "Silindi"})
    return jsonify({"hata": "Bulunamadı"}), 404

# --- YENİ: İSTATİSTİK ROTASI ---
@app.route('/gorev-istatistikleri', methods=['GET'])
def task_stats():
    # 1. En Çok Tekrar Eden 5 Görev İsmi
    # (SQL: SELECT title, COUNT(id) FROM task GROUP BY title ORDER BY COUNT DESC LIMIT 5)
    en_cok_gorevler = db.session.query(Task.title, db.func.count(Task.id))\
        .group_by(Task.title)\
        .order_by(db.func.count(Task.id).desc())\
        .limit(5).all()
    
    top_gorev_listesi = [{"ad": t[0], "sayi": t[1]} for t in en_cok_gorevler]

    # 2. Kategori Kullanım Oranları
    # (Hangi kategoride kaç görev var?)
    kategori_analizi = db.session.query(Category.name, Category.color, db.func.count(Task.id))\
        .join(Task, Category.id == Task.category_id)\
        .group_by(Category.name, Category.color)\
        .all()
    
    kategori_listesi = [{"ad": k[0], "renk": k[1], "sayi": k[2]} for k in kategori_analizi]

    return jsonify({
        "populer_gorevler": top_gorev_listesi,
        "kategori_dagilimi": kategori_listesi
    })

# --- BİLDİRİM ROTALARI ---

@app.route('/bildirim-ayarlari', methods=['GET'])
def get_notification_settings():
    # Kurallar
    kurallar = NotificationRule.query.all()
    kural_listesi = [{"id": k.id, "scenario": k.scenario, "label": k.label, "message": k.message, "is_active": k.is_active} for k in kurallar]
    
    # Ayarlar
    ayarlar = SystemSetting.query.all()
    ayar_sozlugu = {a.key: a.value for a in ayarlar}
    
    return jsonify({"kurallar": kural_listesi, "ayarlar": ayar_sozlugu})

@app.route('/kural-guncelle/<int:id>', methods=['PUT'])
def update_rule(id):
    kural = db.session.get(NotificationRule, id)
    data = request.json
    if kural:
        kural.message = data.get('message', kural.message)
        kural.is_active = data.get('is_active', kural.is_active)
        db.session.commit()
        return jsonify({"mesaj": "Kural güncellendi"})
    return jsonify({"hata": "Bulunamadı"}), 404

@app.route('/ayar-guncelle', methods=['POST'])
def update_setting():
    data = request.json
    for key, value in data.items():
        ayar = SystemSetting.query.filter_by(key=key).first()
        if ayar:
            ayar.value = str(value)
    db.session.commit()
    return jsonify({"mesaj": "Ayarlar kaydedildi"})

# --- BİLDİRİM KONTROL ROTASI (BEKÇİ) ---
@app.route('/bildirimleri-kontrol-et', methods=['GET'])
def check_notifications():
    # 1. Ayarları ve Kuralları Çek
    kurallar = {k.scenario: k for k in NotificationRule.query.filter_by(is_active=True).all()}
    if not kurallar: return jsonify([]) # Hiç kural açık değilse boş dön

    yeni_bildirimler = []
    su_an = datetime.now()

    # Devam eden görevleri bul
    aktif_gorevler = Task.query.filter_by(is_completed=False).all()

    for gorev in aktif_gorevler:
        # Görevin bitmesi gereken zamanı hesapla (Oluşturma + Süre)
        # Eğer süre yoksa varsayılan 30 dk sayalım
        sure = gorev.duration if gorev.duration else 30
        bitis_zamani = gorev.created_at + timedelta(minutes=sure)
        
        # --- SENARYO 1: Zamanı Geldi (task_due) ---
        if 'task_due' in kurallar and su_an >= bitis_zamani:
            # Daha önce bu bildirimi attık mı?
            log = NotificationLog.query.filter_by(task_id=gorev.id, scenario='task_due').first()
            if not log:
                # Bildirim Oluştur
                mesaj = kurallar['task_due'].message.replace("{baslik}", gorev.title)
                yeni_bildirimler.append({"id": gorev.id, "mesaj": mesaj, "tur": "info"})
                
                # Hafızaya Yaz
                db.session.add(NotificationLog(task_id=gorev.id, scenario='task_due'))

        # --- SENARYO 2: 10 dk Gecikti (delay_10min) ---
        gecikme_zamani = bitis_zamani + timedelta(minutes=10)
        if 'delay_10min' in kurallar and su_an >= gecikme_zamani:
            log = NotificationLog.query.filter_by(task_id=gorev.id, scenario='delay_10min').first()
            if not log:
                mesaj = kurallar['delay_10min'].message.replace("{baslik}", gorev.title)
                yeni_bildirimler.append({"id": gorev.id, "mesaj": mesaj, "tur": "warning"})
                db.session.add(NotificationLog(task_id=gorev.id, scenario='delay_10min'))

    db.session.commit()
    return jsonify(yeni_bildirimler)

if __name__ == '__main__':
    app.run(debug=True, port=5000)