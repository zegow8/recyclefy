// ==========================================
// STATE
// ==========================================
let currentRole = null; // 'user', 'admin', 'superadmin'
let currentPage = 'login';

// ==========================================
// DATA DUMMY
// ==========================================
const dummyData = {
  user: {
    name: 'Lytayay',
    koin: 520,
    totalSetor: 3,
    totalUnitSampah: 144,
    totalBerat: 31100,
  },
  admin: {
    name: 'Admin Cempaka Putih',
    wilayah: 'Cempaka Putih',
    sampahHariIni: 25,
    totalSampah: 1250,
    barangProduksi: 45,
    menungguAcc: 12,
    sudahDiAcc: 33,
  },
  superadmin: {
    name: 'Super Admin',
    totalUser: 6,
    totalAdmin: 3,
    barangNungguAcc: 5,
    totalStok: 9,
    totalTransaksi: 2,
    totalKoin: 3125,
    totalJenisSampah: 10,
    totalResep: 9,
  },
};

// ==========================================
// MENU PER ROLE
// ==========================================
const menus = {
  user: [
    { label: 'Home', page: 'home-user' },
    { label: 'Aktivitas', page: 'aktivitas-user' },
    { label: 'Toko', page: 'toko-user' },
    { label: 'Setor Sampah', page: 'setor-user' },
    { label: 'Keranjang', page: 'keranjang-user' },
    { label: 'Riwayat Setor', page: 'riwayat-setor-user' },
    { label: 'Riwayat Beli', page: 'riwayat-beli-user' },
    { label: 'Profile', page: 'profile-user' },
  ],
  admin: [
    { label: 'Dashboard', page: 'dashboard-admin' },
    { label: 'Riwayat Sampah', page: 'riwayat-sampah-admin' },
    { label: 'Stok Sampah', page: 'stok-sampah-admin' },
    { label: 'Produksi', page: 'produksi-admin' },
    { label: 'Barang Produksi', page: 'barang-produksi-admin' },
    { label: 'Riwayat Produksi', page: 'riwayat-produksi-admin' },
  ],
  superadmin: [
    { label: 'Dashboard', page: 'dashboard-superadmin' },
    { label: 'User', page: 'user-superadmin' },
    { label: 'Kelola Sampah', page: 'kelola-sampah-superadmin' },
    { label: 'Kelola Resep', page: 'kelola-resep-superadmin' },
    { label: 'Kelola Wilayah', page: 'kelola-wilayah-superadmin' },
    { label: 'Stok', page: 'stok-superadmin' },
    { label: 'Transaksi', page: 'transaksi-superadmin' },
  ],
};

// ==========================================
// FUNGSI NAVIGASI
// ==========================================
function goTo(page) {
  currentPage = page;
  render();
  window.scrollTo(0, 0);
}

function loginAs(role) {
  currentRole = role;
  if (role === 'user') goTo('home-user');
  else if (role === 'admin') goTo('dashboard-admin');
  else if (role === 'superadmin') goTo('dashboard-superadmin');
}

function logout() {
  currentRole = null;
  goTo('login');
}

// ==========================================
// RENDER NAVBAR
// ==========================================
function renderNavbar() {
  const navbar = document.getElementById('navbar');
  const menuContainer = document.getElementById('navbar-menu');
  const badgeKoin = document.getElementById('badge-koin');

  if (!currentRole || currentPage === 'login') {
    navbar.style.display = 'none';
    return;
  }

  navbar.style.display = 'block';

  // Render menu
  menuContainer.innerHTML = menus[currentRole].map(item => `
    <a href="#" onclick="goTo('${item.page}')" class="${currentPage === item.page ? 'active' : ''}">
      ${item.label}
    </a>
  `).join('');

  // Render badge koin
  if (currentRole === 'user') {
    badgeKoin.style.display = 'inline-block';
    badgeKoin.textContent = `🪙 ${dummyData.user.koin}`;
  } else {
    badgeKoin.style.display = 'none';
  }
}

// ==========================================
// RENDER HALAMAN
// ==========================================
function render() {
  renderNavbar();
  const main = document.getElementById('main-content');

  if (currentPage === 'login') {
    main.innerHTML = renderLoginPage();
    return;
  }

  // Halaman berdasarkan role
  if (currentPage === 'home-user') main.innerHTML = renderHomeUser();
  else if (currentPage === 'aktivitas-user') main.innerHTML = renderAktivitasUser();
  else if (currentPage === 'toko-user') main.innerHTML = renderTokoUser();
  else if (currentPage === 'setor-user') main.innerHTML = renderSetorUser();
  else if (currentPage === 'keranjang-user') main.innerHTML = renderKeranjangUser();
  else if (currentPage === 'riwayat-setor-user') main.innerHTML = renderRiwayatSetorUser();
  else if (currentPage === 'riwayat-beli-user') main.innerHTML = renderRiwayatBeliUser();
  else if (currentPage === 'profile-user') main.innerHTML = renderProfileUser();
  
  else if (currentPage === 'dashboard-admin') main.innerHTML = renderDashboardAdmin();
  else if (currentPage === 'riwayat-sampah-admin') main.innerHTML = renderRiwayatSampahAdmin();
  else if (currentPage === 'stok-sampah-admin') main.innerHTML = renderStokSampahAdmin();
  else if (currentPage === 'produksi-admin') main.innerHTML = renderProduksiAdmin();
  else if (currentPage === 'barang-produksi-admin') main.innerHTML = renderBarangProduksiAdmin();
  else if (currentPage === 'riwayat-produksi-admin') main.innerHTML = renderRiwayatProduksiAdmin();
  
  else if (currentPage === 'dashboard-superadmin') main.innerHTML = renderDashboardSuperadmin();
  else if (currentPage === 'user-superadmin') main.innerHTML = renderUserSuperadmin();
  else if (currentPage === 'kelola-sampah-superadmin') main.innerHTML = renderKelolaSampahSuperadmin();
  else if (currentPage === 'kelola-resep-superadmin') main.innerHTML = renderKelolaResepSuperadmin();
  else if (currentPage === 'kelola-wilayah-superadmin') main.innerHTML = renderKelolaWilayahSuperadmin();
  else if (currentPage === 'stok-superadmin') main.innerHTML = renderStokSuperadmin();
  else if (currentPage === 'transaksi-superadmin') main.innerHTML = renderTransaksiSuperadmin();
}

// ==========================================
// HALAMAN LOGIN
// ==========================================
function renderLoginPage() {
  return `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">Recycle<span>fy</span></h1>
          <p class="auth-subtitle">Selamat datang kembali!</p>
        </div>
        <form class="auth-form" onsubmit="event.preventDefault();">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" placeholder="Masukkan email Anda">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" placeholder="Masukkan password">
          </div>
          <button type="button" class="btn-auth" onclick="alert('Demo: pilih role di bawah untuk masuk')">Login</button>
        </form>
        <div class="auth-demo">
          <p class="demo-title">Pilih Role Demo:</p>
          <button class="demo-btn" onclick="loginAs('user')">
            <div class="demo-role">👤 USER</div>
            <div class="demo-email">rainawr@gmail.com</div>
          </button>
          <button class="demo-btn" onclick="loginAs('admin')">
            <div class="demo-role">🏢 ADMIN WILAYAH</div>
            <div class="demo-email">cempakaputih@recyclefy.com</div>
          </button>
          <button class="demo-btn" onclick="loginAs('superadmin')">
            <div class="demo-role">👑 SUPER ADMIN</div>
            <div class="demo-email">superadmin@recyclefy.com</div>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// HALAMAN USER
// ==========================================
function renderHomeUser() {
  return `
    <div class="container">
      <h1 class="page-title">Selamat Datang di Recyclefy, ${dummyData.user.name}! 👋</h1>
      <p class="page-subtitle">Platform pengelolaan sampah berbasis komunitas untuk Jakarta Pusat</p>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info"><h3>User Aktif</h3><p class="stat-number">6</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info"><h3>Sampah Dikelola</h3><p class="stat-number">31.1 kg</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🛍️</div>
          <div class="stat-info"><h3>Produk Daur Ulang</h3><p class="stat-number">9</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📍</div>
          <div class="stat-info"><h3>Wilayah</h3><p class="stat-number">3</p></div>
        </div>
      </div>

      <h2 class="page-title">🗑️ Jenis Sampah yang Diterima</h2>
      <div class="grid-3x4">
        ${['Botol Plastik Bekas', 'Kardus Bekas', 'Kertas Motif Bekas', 'Koran Bekas'].map(nama => `
          <div class="grid-card">
            <div class="grid-image">🗑️</div>
            <div class="grid-info">
              <h3>${nama}</h3>
              <p>Bahan daur ulang berkualitas</p>
              <p class="price">🪙 25 Poin/unit</p>
              <button class="btn-primary" onclick="goTo('setor-user')">Setor</button>
            </div>
          </div>
        `).join('')}
      </div>

      <h2 class="page-title">🛍️ Produk Daur Ulang</h2>
      <div class="grid-3x4">
        ${['Tas Recycled', 'Dompet Kertas', 'Pot Bunga', 'Hiasan Gantung'].map(nama => `
          <div class="grid-card">
            <div class="grid-image">📦</div>
            <div class="grid-info">
              <h3>${nama}</h3>
              <p>Produk daur ulang berkualitas</p>
              <p class="price">🪙 150 Poin</p>
              <button class="btn-primary" onclick="goTo('toko-user')">Lihat</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderAktivitasUser() {
  return `
    <div class="container">
      <h1 class="page-title">📊 Aktivitas Saya</h1>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🪙</div>
          <div class="stat-info"><h3>Total Poin</h3><p class="stat-number">${dummyData.user.koin}</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💸</div>
          <div class="stat-info"><h3>Poin Terpakai</h3><p class="stat-number">30</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-info"><h3>Total Setor</h3><p class="stat-number">${dummyData.user.totalSetor}</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info"><h3>Total Unit Sampah</h3><p class="stat-number">${dummyData.user.totalUnitSampah}</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚖️</div>
          <div class="stat-info"><h3>Total Berat</h3><p class="stat-number">${dummyData.user.totalBerat} g</p></div>
        </div>
      </div>

      <h2 class="page-title">📦 Status Pesanan</h2>
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-card"><div class="stat-icon">🟡</div><div class="stat-info"><h3>DIPESAN</h3><p class="stat-number">1</p></div></div>
        <div class="stat-card"><div class="stat-icon">🔵</div><div class="stat-info"><h3>DIKIRIM</h3><p class="stat-number">1</p></div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><h3>SELESAI</h3><p class="stat-number">1</p></div></div>
      </div>
    </div>
  `;
}

function renderTokoUser() {
  const produk = [
    { nama: 'Tas Recycled', harga: 150, stok: 5, desc: 'Tas dari botol plastik daur ulang' },
    { nama: 'Dompet Kertas', harga: 100, stok: 3, desc: 'Dompet dari kertas daur ulang' },
    { nama: 'Pot Bunga', harga: 50, stok: 10, desc: 'Pot dari kaleng bekas' },
    { nama: 'Hiasan Gantung CD', harga: 800, stok: 3, desc: 'Hiasan dari CD bekas' },
  ];
  return `
    <div class="container">
      <h1 class="page-title">🛍️ Toko Barang</h1>
      <p class="page-subtitle">Tukarkan poinmu dengan produk daur ulang berkualitas!</p>
      <div class="grid-3x4">
        ${produk.map(p => `
          <div class="grid-card">
            <div class="grid-image">📦</div>
            <div class="grid-info">
              <h3>${p.nama}</h3>
              <p>${p.desc}</p>
              <p class="price">🪙 ${p.harga} Poin</p>
              <p>Stok: ${p.stok}</p>
              <button class="btn-primary" onclick="alert('Demo: pembelian produk')">Pesan Sekarang</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderSetorUser() {
  const sampah = [
    { nama: 'Botol Plastik Bekas', berat: 500, poin: 25 },
    { nama: 'CD Bekas', berat: 150, poin: 30 },
    { nama: 'Galon Kosong Bekas', berat: 700, poin: 80 },
    { nama: 'Kardus Bekas', berat: 1000, poin: 40 },
    { nama: 'Kertas Motif Bekas', berat: 100, poin: 100 },
    { nama: 'Koran Bekas', berat: 500, poin: 500 },
    { nama: 'Sedotan Plastik Bekas', berat: 50, poin: 50 },
    { nama: 'Sendok Plastik Bekas', berat: 100, poin: 100 },
  ];
  return `
    <div class="container">
      <h1 class="page-title">🗑️ Setor Sampah</h1>
      <p class="page-subtitle">Pilih jenis sampah yang ingin disetor</p>
      <div class="grid-3x4">
        ${sampah.map(s => `
          <div class="grid-card">
            <div class="grid-image">🗑️</div>
            <div class="grid-info">
              <h3>${s.nama}</h3>
              <p>⚖️ ${s.berat} g</p>
              <p class="price">🪙 ${s.poin} Poin</p>
              <button class="btn-primary" onclick="alert('Demo: sampah ditambahkan ke keranjang')">Setor</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderKeranjangUser() {
  return `
    <div class="container">
      <h1 class="page-title">🛒 Keranjang Sampah</h1>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>Jenis Sampah</th><th>Kuantitas</th><th>Poin</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            <tr><td>CD Bekas</td><td>1</td><td>30</td><td><button class="btn-primary" style="padding:4px 12px; width:auto;">Hapus</button></td></tr>
            <tr><td>Galon Kosong Bekas</td><td>20</td><td>1600</td><td><button class="btn-primary" style="padding:4px 12px; width:auto;">Hapus</button></td></tr>
          </tbody>
        </table>
        <div style="margin-top:20px; text-align:right;">
          <p style="font-size:18px; font-weight:700; margin-bottom:12px;">Total Poin: 🪙 1630</p>
          <button class="btn-primary" style="width:auto; padding:12px 32px;">SERAHKAN SAMPAH</button>
        </div>
      </div>
    </div>
  `;
}

function renderRiwayatSetorUser() {
  return `
    <div class="container">
      <h1 class="page-title">📋 Riwayat Setor</h1>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>ID Setoran</th><th>Tanggal</th><th>Jenis Sampah</th><th>Unit</th><th>Berat</th><th>Poin</th><th>Wilayah</th></tr>
          </thead>
          <tbody>
            <tr><td><b>#1</b></td><td>31/7/2026</td><td>CD Bekas</td><td>1</td><td>150 g</td><td>30</td><td>Cempaka Putih</td></tr>
            <tr><td><b>#1</b></td><td>31/7/2026</td><td>Galon Kosong</td><td>20</td><td>200 g</td><td>200</td><td>Cempaka Putih</td></tr>
            <tr><td><b>#2</b></td><td>28/7/2026</td><td>Kardus Bekas</td><td>1</td><td>1000 g</td><td>40</td><td>Kemayoran</td></tr>
            <tr><td><b>#3</b></td><td>27/7/2026</td><td>Koran Bekas</td><td>5</td><td>2500 g</td><td>2500</td><td>Sumur Batu</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderRiwayatBeliUser() {
  return `
    <div class="container">
      <h1 class="page-title">🛍️ Riwayat Beli</h1>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>Tanggal</th><th>Produk</th><th>Jumlah</th><th>Total Poin</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr><td>25/7/2026</td><td>Tas Recycled</td><td>2</td><td>300</td><td><span class="status-badge dipesan">🟡 DIPESAN</span></td></tr>
            <tr><td>24/7/2026</td><td>Dompet Kertas</td><td>1</td><td>100</td><td><span class="status-badge dikirim">🔵 DIKIRIM</span></td></tr>
            <tr><td>23/7/2026</td><td>Pot Bunga</td><td>3</td><td>150</td><td><span class="status-badge selesai">✅ SELESAI</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderProfileUser() {
  return `
    <div class="container">
      <h1 class="page-title">👤 Profile Saya</h1>
      <div class="table-wrapper" style="max-width:600px;">
        <form onsubmit="event.preventDefault(); alert('Demo: profile diupdate')">
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Nama Lengkap</label>
            <input type="text" class="form-input" value="${dummyData.user.name}">
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" value="lytayay@gmail.com" disabled>
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Nomor Telepon</label>
            <input type="tel" class="form-input" value="081547184307">
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Alamat</label>
            <textarea class="form-input" rows="3">Jl. Contoh No. 123, Jakarta Pusat</textarea>
          </div>
          <button type="submit" class="btn-auth">Simpan Perubahan</button>
        </form>
      </div>
    </div>
  `;
}

// ==========================================
// HALAMAN ADMIN WILAYAH
// ==========================================
function renderDashboardAdmin() {
  return `
    <div class="container">
      <h1 class="page-title">👋 Halo, ${dummyData.admin.name}!</h1>
      <p class="page-subtitle">Dashboard Admin Wilayah ${dummyData.admin.wilayah}</p>

      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">📥</div><div class="stat-info"><h3>Sampah Masuk Hari Ini</h3><p class="stat-number">${dummyData.admin.sampahHariIni} kg</p></div></div>
        <div class="stat-card"><div class="stat-icon">📦</div><div class="stat-info"><h3>Total Sampah</h3><p class="stat-number">${dummyData.admin.totalSampah} kg</p></div></div>
        <div class="stat-card"><div class="stat-icon">🔨</div><div class="stat-info"><h3>Barang Diproduksi</h3><p class="stat-number">${dummyData.admin.barangProduksi}</p></div></div>
        <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-info"><h3>Menunggu ACC</h3><p class="stat-number">${dummyData.admin.menungguAcc}</p></div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><h3>Sudah Di-ACC</h3><p class="stat-number">${dummyData.admin.sudahDiAcc}</p></div></div>
      </div>

      <h2 class="page-title">📋 User Setor Terbaru</h2>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Tanggal</th><th>User</th><th>Jenis</th><th>Berat</th><th>Poin</th></tr></thead>
          <tbody>
            <tr><td>31/7/2026</td><td>Lytayay</td><td>CD Bekas</td><td>150 g</td><td>30</td></tr>
            <tr><td>28/7/2026</td><td>Rainn</td><td>Botol HDPE</td><td>5000 g</td><td>300</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderRiwayatSampahAdmin() {
  return `
    <div class="container">
      <h1 class="page-title">📋 Riwayat Sampah</h1>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Tanggal</th><th>User</th><th>Jenis Sampah</th><th>Total Berat</th><th>Total Poin</th><th>Aksi</th></tr></thead>
          <tbody>
            <tr><td>31/7/2026</td><td>Lytayay</td><td>Kardus, Galon, CD</td><td>1850 g</td><td>150</td><td><button class="btn-primary" style="padding:4px 12px; width:auto;">Lihat</button></td></tr>
            <tr><td>28/7/2026</td><td>Rainn</td><td>CD, Botol, Kardus</td><td>4350 g</td><td>735</td><td><button class="btn-primary" style="padding:4px 12px; width:auto;">Lihat</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderStokSampahAdmin() {
  const stok = [
    { nama: 'Botol Plastik Bekas', stok: 25, berat: '5000 g' },
    { nama: 'Kardus Bekas', stok: 15, berat: '3000 g' },
    { nama: 'CD Bekas', stok: 30, berat: '4500 g' },
    { nama: 'Koran Bekas', stok: 10, berat: '2000 g' },
  ];
  return `
    <div class="container">
      <h1 class="page-title">📦 Stok Sampah</h1>
      <div class="grid-3x4">
        ${stok.map(s => `
          <div class="grid-card">
            <div class="grid-image">🗑️</div>
            <div class="grid-info">
              <h3>${s.nama}</h3>
              <p>Stok: ${s.stok} unit</p>
              <p class="price">${s.berat}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderProduksiAdmin() {
  const resep = [
    { nama: 'Tas Recycled', bahan: 'Kaleng (3), Botol (5)', harga: 150 },
    { nama: 'Dompet Kertas', bahan: 'Kertas (4), Plastik (2)', harga: 100 },
    { nama: 'Pot Bunga', bahan: 'Kaleng (2), Kaca (1)', harga: 50 },
    { nama: 'Hiasan Gantung CD', bahan: 'CD Bekas (5), Tali Nilon (2)', harga: 800 },
  ];
  return `
    <div class="container">
      <h1 class="page-title">🔨 Produksi</h1>
      <div class="grid-3x4">
        ${resep.map(r => `
          <div class="grid-card">
            <div class="grid-image">📦</div>
            <div class="grid-info">
              <h3>${r.nama}</h3>
              <p>📋 ${r.bahan}</p>
              <p class="price">🪙 ${r.harga}</p>
              <button class="btn-primary" onclick="alert('Demo: produksi barang')">BUAT BARANG</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderBarangProduksiAdmin() {
  return `
    <div class="container">
      <h1 class="page-title">📦 Barang Produksi</h1>
      <div class="grid-3x4">
        ${['Tas Recycled', 'Dompet Kertas', 'Pot Bunga', 'Hiasan Gantung'].map(nama => `
          <div class="grid-card">
            <div class="grid-image">📦</div>
            <div class="grid-info">
              <h3>${nama}</h3>
              <p>Stok: 3 unit</p>
              <p class="price">🪙 150 Poin</p>
              <button class="btn-primary" onclick="alert('Demo: kirim ke superadmin')">Serahkan ke Superadmin</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderRiwayatProduksiAdmin() {
  return `
    <div class="container">
      <h1 class="page-title">📋 Riwayat Produksi</h1>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Tanggal</th><th>Nama Barang</th><th>Jumlah</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>29/7/2026</td><td>Kotak Tisu</td><td>1</td><td><span class="status-badge pending">🟡 Pending</span></td></tr>
            <tr><td>29/7/2026</td><td>Hiasan Gantung CD</td><td>3</td><td><span class="status-badge pending">🟡 Pending</span></td></tr>
            <tr><td>29/7/2026</td><td>Celengan Hewan</td><td>4</td><td><span class="status-badge pending">🟡 Pending</span></td></tr>
            <tr><td>29/7/2026</td><td>Hiasan Dinding</td><td>1</td><td><span class="status-badge tersedia">🟢 Tersedia</span></td></tr>
            <tr><td>28/7/2026</td><td>Tas Recycled</td><td>2</td><td><span class="status-badge selesai">🔵 Selesai</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================
// HALAMAN SUPER ADMIN
// ==========================================
function renderDashboardSuperadmin() {
  return `
    <div class="container">
      <h1 class="page-title">👑 Dashboard Super Admin</h1>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-info"><h3>Total User</h3><p class="stat-number">${dummyData.superadmin.totalUser}</p></div></div>
        <div class="stat-card"><div class="stat-icon">🏢</div><div class="stat-info"><h3>Total Admin</h3><p class="stat-number">${dummyData.superadmin.totalAdmin}</p></div></div>
        <div class="stat-card"><div class="stat-icon">⏳</div><div class="stat-info"><h3>Barang Nunggu ACC</h3><p class="stat-number">${dummyData.superadmin.barangNungguAcc}</p></div></div>
        <div class="stat-card"><div class="stat-icon">📦</div><div class="stat-info"><h3>Total Stok</h3><p class="stat-number">${dummyData.superadmin.totalStok}</p></div></div>
        <div class="stat-card"><div class="stat-icon">🛒</div><div class="stat-info"><h3>Total Transaksi</h3><p class="stat-number">${dummyData.superadmin.totalTransaksi}</p></div></div>
        <div class="stat-card"><div class="stat-icon">🪙</div><div class="stat-info"><h3>Total Koin</h3><p class="stat-number">${dummyData.superadmin.totalKoin}</p></div></div>
        <div class="stat-card"><div class="stat-icon">🗑️</div><div class="stat-info"><h3>Jenis Sampah</h3><p class="stat-number">${dummyData.superadmin.totalJenisSampah}</p></div></div>
        <div class="stat-card"><div class="stat-icon">📋</div><div class="stat-info"><h3>Total Resep</h3><p class="stat-number">${dummyData.superadmin.totalResep}</p></div></div>
      </div>

      <h2 class="page-title">📊 Status Pesanan</h2>
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-card"><div class="stat-icon">🟡</div><div class="stat-info"><h3>DIPESAN</h3><p class="stat-number">1</p></div></div>
        <div class="stat-card"><div class="stat-icon">🔵</div><div class="stat-info"><h3>DIKIRIM</h3><p class="stat-number">1</p></div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><h3>SELESAI</h3><p class="stat-number">1</p></div></div>
      </div>
    </div>
  `;
}

function renderUserSuperadmin() {
  return `
    <div class="container">
      <h1 class="page-title">👥 Kelola User</h1>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Total Setor</th><th>Poin</th><th>Aksi</th></tr></thead>
          <tbody>
            <tr><td>Super Admin</td><td>superadmin@recyclefy.com</td><td>SUPER_ADMIN</td><td>0</td><td>0</td><td>-</td></tr>
            <tr><td>Admin Cempaka Putih</td><td>cempakaputih@recyclefy.com</td><td>ADMIN</td><td>0</td><td>0</td><td><button class="btn-primary" style="padding:4px 12px; width:auto;">Hapus</button></td></tr>
            <tr><td>Rainn</td><td>rainnawr@gmail.com</td><td>USER</td><td>12</td><td>3530</td><td><button class="btn-primary" style="padding:4px 12px; width:auto;">Hapus</button></td></tr>
            <tr><td>Lytayay</td><td>lytayay@gmail.com</td><td>USER</td><td>3</td><td>370</td><td><button class="btn-primary" style="padding:4px 12px; width:auto;">Hapus</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderKelolaSampahSuperadmin() {
  const sampah = [
    { nama: 'Botol Plastik Bekas', berat: 500, poin: 25 },
    { nama: 'CD Bekas', berat: 150, poin: 30 },
    { nama: 'Galon Kosong Bekas', berat: 700, poin: 80 },
    { nama: 'Kardus Bekas', berat: 1000, poin: 40 },
  ];
  return `
    <div class="container">
      <h1 class="page-title">🗑️ Kelola Jenis Sampah</h1>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Foto</th><th>Nama Sampah</th><th>Berat (g)</th><th>Poin</th><th>Aksi</th></tr></thead>
          <tbody>
            ${sampah.map(s => `
              <tr>
                <td>📦</td>
                <td>${s.nama}</td>
                <td>${s.berat}</td>
                <td>${s.poin}</td>
                <td>
                  <button class="btn-primary" style="padding:4px 12px; width:auto;">Edit</button>
                  <button class="btn-primary" style="padding:4px 12px; width:auto; background:#D32F2F;">Hapus</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderKelolaResepSuperadmin() {
  const resep = [
    { nama: 'Tas Tenteng Koran', bahan: 'Koran Bekas (10)', harga: 1100 },
    { nama: 'Gantungan Kunci Tutup Botol', bahan: 'Tutup Botol (3)', harga: 200 },
    { nama: 'Celengan Hewan Botol Plastik', bahan: 'Botol (2), Tutup Botol (1)', harga: 350 },
    { nama: 'Tempat Sampah Tutup Botol', bahan: 'Tutup Botol (25), Kardus (1)', harga: 850 },
  ];
  return `
    <div class="container">
      <h1 class="page-title">📋 Kelola Resep Daur Ulang</h1>
      <div class="grid-3x4">
        ${resep.map(r => `
          <div class="grid-card">
            <div class="grid-image">📦</div>
            <div class="grid-info">
              <h3>${r.nama}</h3>
              <p>Bahan: ${r.bahan}</p>
              <p class="price">🪙 ${r.harga} Poin</p>
              <button class="btn-primary" style="background:#D32F2F;">Hapus</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderKelolaWilayahSuperadmin() {
  const wilayah = [
    { nama: 'Kemayoran', admin: 1, produksi: 12, sampah: 45 },
    { nama: 'Sumur Batu', admin: 1, produksi: 8, sampah: 30 },
    { nama: 'Cempaka Putih', admin: 1, produksi: 20, sampah: 60 },
  ];
  return `
    <div class="container">
      <h1 class="page-title">📍 Kelola Wilayah</h1>
      <div class="grid-3x4">
        ${wilayah.map(w => `
          <div class="grid-card">
            <div class="grid-image">🏢</div>
            <div class="grid-info">
              <h3>${w.nama}</h3>
              <p>Total Admin: ${w.admin}</p>
              <p>Total Produksi: ${w.produksi}</p>
              <p class="price">Total Sampah: ${w.sampah} g</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderStokSuperadmin() {
  return `
    <div class="container">
      <h1 class="page-title">📦 Manajemen Stok</h1>
      
      <h2 class="page-title">📥 Kiriman dari Admin Wilayah</h2>
      <div class="table-wrapper" style="margin-bottom:24px;">
        <table class="table">
          <thead><tr><th>Wilayah</th><th>Admin</th><th>Barang</th><th>Jumlah</th><th>Aksi</th></tr></thead>
          <tbody>
            <tr>
              <td>Cempaka Putih</td>
              <td>Admin Cempaka Putih</td>
              <td>Tempat Tisu Bekas</td>
              <td>3</td>
              <td>
                <button class="btn-primary" style="padding:4px 12px; width:auto;">✅ Setujui</button>
                <button class="btn-primary" style="padding:4px 12px; width:auto; background:#D32F2F;">❌ Tolak</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="page-title">📊 Stok Barang Tersedia</h2>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Foto</th><th>Produk</th><th>Stok</th><th>Terjual</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>📦</td><td>Tempat Tisu Bekas</td><td>3</td><td>0</td><td><span class="status-badge tersedia">✅ Tersedia</span></td></tr>
            <tr><td>📦</td><td>Hiasan Gantung CD</td><td>5</td><td>2</td><td><span class="status-badge tersedia">✅ Tersedia</span></td></tr>
            <tr><td>📦</td><td>Tas Recycled</td><td>0</td><td>10</td><td><span class="status-badge pending">❌ Habis</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderTransaksiSuperadmin() {
  return `
    <div class="container">
      <h1 class="page-title">💰 Riwayat Transaksi</h1>
      <div class="table-wrapper">
        <table class="table">
          <thead><tr><th>Tanggal</th><th>User</th><th>Produk</th><th>Jumlah</th><th>Total Poin</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>28/7/2026</td><td>Lytayay</td><td>Tempat Tisu Bekas</td><td>3</td><td>30</td><td><span class="status-badge selesai">✅ SELESAI</span></td></tr>
            <tr><td>27/7/2026</td><td>Rainn</td><td>Hiasan Gantung CD</td><td>1</td><td>800</td><td><span class="status-badge dikirim">🔵 DIKIRIM</span></td></tr>
            <tr><td>26/7/2026</td><td>Lytayay</td><td>Tas Recycled</td><td>2</td><td>300</td><td><span class="status-badge dipesan">🟡 DIPESAN</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  render();
});