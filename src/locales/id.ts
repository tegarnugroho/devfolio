import { en } from './en'

const projectDescriptions: Record<string, string> = {
  'Table Parser - Flutter Package':'Mengubah data terstruktur dari tabel menjadi model yang siap digunakan di Dart dan Flutter. Efisien dan andal.',
  'VSCode Clone Personal Website':'Website pribadi berbasis Flutter Web dengan antarmuka terinspirasi Visual Studio Code, navigasi sidebar, panel terminal, dan tema gelap untuk pengalaman yang unik.',
  'Stationary POS - Retail Point-of-Sale System':'Solusi POS berbasis Windows untuk memproses transaksi, mencatat pembelian, mengelola stok, menampilkan informasi pelanggan, dan mendukung berbagai metode pembayaran. Dibangun dengan Flutter, Clean Architecture, BLoC Cubit, dan integrasi WebSocket real-time.',
  'EAA Pad - Self-Checkout Ordering App':'Aplikasi self-checkout berbasis Windows untuk memesan makanan dan minuman, dengan dukungan aksesibilitas berupa panduan suara dan penanda visual. Dibangun dengan Flutter, Clean Architecture, dan BLoC Cubit.',
  'ANKER Store App - Flexible Retail Commerce Solution':'Aplikasi toko retail yang skalabel dengan integrasi backend dan arsitektur headless. Dapat digunakan di ponsel, tablet, serta terminal checkout dan self-checkout.',
  'Excel Translator - Excel to Localization Files(Flutter Package)':'Mengubah lembar terjemahan Excel menjadi file lokalisasi untuk aplikasi Flutter secara otomatis. Praktis, cepat, dan konsisten.',
  'Danafix - Online Loan Application':'Aplikasi pengajuan pinjaman online dengan unggah dokumen, pemantauan status real-time, dan pengelolaan data yang aman untuk proses pengajuan yang mudah.',
  'Tribelio - Brand & Influencer Platform':'Platform bagi brand dan influencer untuk membangun komunitas melalui konten eksklusif, pengelolaan keanggotaan, pemantauan interaksi, dan monetisasi audiens.',
  'Cicle - Remote Team Tool':'Platform kolaborasi untuk tim remote dengan fitur manajemen proyek, komunikasi, dan berbagi file yang terintegrasi.',
  'IZILOH - Innovative Laundry App':'Aplikasi layanan laundry dengan penjadwalan, pelacakan real-time, dan pembayaran yang aman untuk pengalaman yang praktis.',
  'Waroong Retjeh - Restaurant App':'Aplikasi restoran dengan pemesanan online, reservasi meja, dan pengelolaan menu untuk pengalaman bersantap yang nyaman.',
  'Flambe - Food Delivery App':'Aplikasi pesan antar makanan dengan pemesanan online, pelacakan real-time, dan pembayaran yang aman.',
  'NU Card - Electronic Wallet App':'Aplikasi dompet digital dengan pembayaran yang aman, riwayat transaksi, dan fitur pengelolaan keuangan.',
  'ValtHub - Secrets & Environment Manager':'Platform pengelolaan secrets dan environment variables yang aman untuk tim pengembang. Kelola secrets berdasarkan proyek dan environment, berkolaborasi dengan tim, bandingkan konfigurasi, dan akses konfigurasi remote melalui API key dengan hak akses terbatas.',
  'Codeary - Developer Blog & Content Platform':'Platform blog bagi pengembang untuk berbagi artikel teknis, tutorial, dan pengalaman pengembangan software. Dilengkapi dashboard admin untuk mengelola konten, analitik, draft, publikasi, dan pengguna.',
}

function projectDescription(title: string): string {
  const description = projectDescriptions[title]
  if (!description) throw new Error(`Missing Indonesian project translation: ${title}`)
  return description
}

export const id = {
  ...en,
  language: { label: 'Bahasa', en: 'Ganti ke bahasa Inggris', id: 'Ganti ke bahasa Indonesia' },
  site: {
    ...en.site, language: 'id', title: 'Tegar - Pengembang Flutter',
    description: 'Portofolio profesional Tegar, pengembang Flutter yang berfokus pada aplikasi mobile modern.',
    socialDescription: 'Portofolio full-stack developer yang dibangun dengan Vue 3 dan TypeScript.',
    portfolioName: 'Portofolio Tegar', manifestDescription: 'Portofolio Tegar, pengembang Flutter.',
  },
  navigation: {
    ...en.navigation,
    items: en.navigation.items.map((item, index) => ({ ...item, label: ['Tentang', 'Keahlian', 'Proyek', 'Tulisan', 'Kontak'][index] })),
    home: { ...en.navigation.home, label: 'Beranda' },
    menuHeading: 'Navigasi', connectHeading: 'Mari Terhubung', menuMotto: 'Bangun karya yang lebih baik.',
    shortcutsLabel: 'Pintasan bagian', openLabel: 'Buka navigasi', closeLabel: 'Tutup navigasi',
    nextSectionLabel: 'Ke bagian berikutnya', previousSectionLabel: 'Ke bagian sebelumnya', topLabel: 'Kembali ke atas',
    themeLabel: (theme: 'light' | 'dark') => `Ganti ke tema ${theme === 'dark' ? 'gelap' : 'terang'}`,
  },
  hero: {
    ...en.hero,
    description: 'Saya membangun aplikasi lintas platform yang andal, dengan fokus pada performa, UI yang intuitif, dan arsitektur yang mudah dikembangkan.',
    projectsLabel: 'Lihat Proyek', contactLabel: 'Kontak', motto: ['Bangun', 'Karya', 'Lebih Baik'],
  },
  about: {
    ...en.about, title: 'Tentang', eyebrow: 'Sekilas tentang saya', greeting: 'Halo, saya Tegar Nugroho',
    paragraphs: [
      'Saya pengembang Flutter yang berfokus pada aplikasi yang mudah diakses dan berperforma tinggi.',
      'Saya mengutamakan arsitektur yang bersih dan kode yang mudah dirawat agar setiap produk terasa lancar, konsisten, dan mudah dikembangkan.',
      'Saya telah merilis berbagai proyek mobile, web, dan desktop dengan perhatian pada performa, konsistensi, dan skalabilitas.',
      'Di Wolkk, saya bekerja secara remote untuk membangun solusi lintas platform yang memadukan desain yang jelas dengan implementasi teknis yang kuat.',
    ],
    startedLabel: 'Bergabung sejak 2023', alternateImageAlt: 'Ilustrasi alternatif Tegar Nugroho',
    sliderLabel: 'Perbandingan potret: geser ke kiri atau kanan', sliderValue: (percent: number) => `${percent} persen potret asli`,
  },
  skills: {
    ...en.skills, eyebrow: 'Keahlian', title: 'Teknologi yang Saya Gunakan',
    description: 'Tools dan teknologi untuk membangun aplikasi lintas platform berperforma tinggi dengan arsitektur yang bersih dan mudah dirawat.',
    groups: en.skills.groups.map((group, index) => ({ ...group,
      label: ['Bahasa & Platform', 'Framework & State', 'Networking', 'Data & Penyimpanan', 'Tools Pengembangan'][index],
      description: [
        'Bahasa dan platform utama untuk membangun aplikasi lintas platform.',
        'Framework dan state management untuk aplikasi yang skalabel dan mudah dirawat.',
        'Tools untuk koneksi jaringan dan komunikasi real-time.',
        'Solusi penyimpanan lokal dan strategi caching.',
        'Tools pengembangan untuk alur kerja yang lebih produktif.',
      ][index],
    })),
  },
  projects: {
    ...en.projects, eyebrow: 'Proyek', title: 'Karya Pilihan',
    description: 'Kumpulan proyek yang saya bangun, mulai dari aplikasi mobile dan desktop hingga pengalaman web.',
    note: ['Berfokus pada solusi untuk masalah nyata', 'dengan desain yang bersih dan kode yang mudah dirawat.'],
    previousLabel: '‹ Sebelumnya', nextLabel: 'Berikutnya ›', previousPageLabel: 'Halaman sebelumnya', nextPageLabel: 'Halaman berikutnya',
    pageLabel: (page: number, total: number) => `Halaman ${page} dari ${total}`,
    detailsLabel: 'Lihat detail proyek', detailsHint: 'Lihat detail +', projectDetailsLabel: (title: string) => `Lihat detail proyek ${title}`,
    screenshotAlt: (title: string) => `Tangkapan layar ${title}`, imageCount: (count: number) => `${count} gambar`, liveLabel: 'Kunjungi', codeLabel: 'Kode',
    items: en.projects.items.map(project => ({ ...project, description: projectDescription(project.title) })),
  },
  showcase: {
    ...en.showcase, previousImageLabel: 'Gambar sebelumnya', nextImageLabel: 'Gambar berikutnya', closeLabel: 'Tutup dialog proyek', galleryLabel: 'Galeri gambar',
    fallbackTitle: 'Galeri proyek', fallbackProject: 'Proyek', descriptionLabel: 'Deskripsi proyek', stackLabel: 'Tech stack',
    projectLabel: 'Lihat Proyek', codeLabel: 'Lihat Kode', unavailableLabel: 'Gambar tidak tersedia.', retryLabel: 'Coba lagi',
    zoomLabel: 'Perbesaran gambar', zoomInLabel: 'Perbesar', zoomOutLabel: 'Perkecil', resetZoomLabel: 'Atur ulang perbesaran gambar',
    zoomHint: 'Cubit untuk memperbesar · Geser untuk menjelajah', imageLabel: (index: number) => `Lihat gambar ${index}`,
    screenshotAlt: (title: string, index: number, total: number) => `Tangkapan layar ${title}, gambar ${index} dari ${total}`,
  },
  contact: {
    ...en.contact, eyebrow: 'Kontak', title: 'Mari Terhubung', description: 'Terbuka untuk proyek open source dan kolaborasi komunitas.',
  },
  footer: { ...en.footer, clue: 'Masih ada yang bisa kamu temukan.' },
  writing: {
    ...en.writing, eyebrow: 'Tulisan', title: 'Pemikiran, catatan & kode.',
    description: 'Saya menulis tentang Flutter, software engineering, dan hal-hal yang saya pelajari selama berkarya.',
    sourceLabel: 'Dari Codeary', viewAllLabel: 'Lihat semua di Codeary', loadingLabel: 'Tulisan terbaru',
    errorLabel: 'Tulisan terbaru belum bisa dimuat saat ini.', emptyLabel: 'Tulisan baru akan segera hadir.',
    articleLabel: (title: string) => `Baca ${title} di Codeary (dibuka di tab baru)`,
  },
  blueprint: {
    ...en.blueprint,
    mobileLabel: 'PONSEL', tabletLabel: 'TABLET', desktopLabel: 'DESKTOP',
    labels: { NAVIGATION: 'NAVIGASI', FOOTER: 'FOOTER', MODAL: 'DIALOG', GALLERY_VIEWPORT: 'AREA_GALERI', PROJECT_INFO: 'INFO_PROYEK', THUMBNAILS: 'PRATINJAU_GAMBAR', PROJECT_CARD: 'KARTU_PROYEK', PROJECT_IMAGE: 'GAMBAR_PROYEK', ABOUT_CONTENT: 'KONTEN_TENTANG', PROFILE_MEDIA: 'MEDIA_PROFIL', CONTACT_LINKS: 'TAUTAN_KONTAK', HERO_CONTENT: 'KONTEN_BERANDA', HERO_TITLE: 'JUDUL_BERANDA', HERO_DESCRIPTION: 'DESKRIPSI_BERANDA', PRIMARY_CTA: 'AKSI_UTAMA', SKILL_GROUP: 'KELOMPOK_KEAHLIAN', ARTICLE_ROW: 'BARIS_ARTIKEL', CODEARY_LINK: 'TAUTAN_CODEARY', WRITING_SECTION: 'BAGIAN_TULISAN' },
    status: 'Aktif', exitLabel: 'Keluar dari Blueprint', viewportLabel: 'Area tampilan',
    breakpointLabel: 'Breakpoint', scrollLabel: 'Gulir', gridLabel: 'Grid',
  },
} satisfies typeof en
