---
name: Luminous Enterprise
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f1ff'
  surface-container: '#f0ecf9'
  surface-container-high: '#eae6f3'
  surface-container-highest: '#e5e0ed'
  on-surface: '#1c1b24'
  on-surface-variant: '#474555'
  inverse-surface: '#312f39'
  inverse-on-surface: '#f3effc'
  outline: '#787586'
  outline-variant: '#c8c4d7'
  surface-tint: '#5643de'
  primary: '#5441dc'
  on-primary: '#ffffff'
  primary-container: '#6d5df6'
  on-primary-container: '#fffcff'
  inverse-primary: '#c6c0ff'
  secondary: '#5d5d67'
  on-secondary: '#ffffff'
  secondary-container: '#e3e1ed'
  on-secondary-container: '#64636d'
  tertiary: '#712be2'
  on-tertiary: '#ffffff'
  tertiary-container: '#8b4cfc'
  on-tertiary-container: '#fffcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4dfff'
  primary-fixed-dim: '#c6c0ff'
  on-primary-fixed: '#150066'
  on-primary-fixed-variant: '#3d22c6'
  secondary-fixed: '#e3e1ed'
  secondary-fixed-dim: '#c7c5d1'
  on-secondary-fixed: '#1a1b23'
  on-secondary-fixed-variant: '#46464f'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#fcf8ff'
  on-background: '#1c1b24'
  surface-variant: '#e5e0ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.3'
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.5'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

Sistem desain ini dirancang untuk menciptakan kesan profesional, efisien, dan modern bagi platform SaaS enterprise. Kepribadian brand ini berfokus pada **kepercayaan (trust)** dan **kecepatan (agility)**, memberikan rasa aman bagi pelaku bisnis dalam mengelola operasional mereka.

Gaya visual utama menggunakan pendekatan **Corporate Modern** dengan sentuhan **Minimalisme**. Estetika ini menekankan pada kebersihan ruang (whitespace), tipografi premium yang sangat terbaca, dan penggunaan warna aksen yang berani di atas latar belakang netral yang lembut. Kita menghindari efek dekoratif yang berlebihan seperti glassmorphism untuk memastikan performa visual tetap tajam, fungsional, dan memiliki kontras tinggi yang memudahkan navigasi pengguna.

## Colors

Palet warna didominasi oleh gradien ungu yang dinamis sebagai identitas utama, memberikan energi pada elemen interaktif.

- **Primary:** Ungu elektrik (#6D5DF6 ke #5B46F5) digunakan untuk aksi utama (CTA), ikon aktif, dan elemen branding.
- **Secondary/Soft Purple:** Digunakan untuk latar belakang kontainer atau state "hover" yang halus guna menciptakan kedalaman tanpa mengganggu fokus.
- **Neutral:** Menggunakan skala abu-abu dengan undertone biru (Slate) untuk menjaga tampilan tetap bersih. Teks utama menggunakan biru gelap hampir hitam (#0F172A) untuk kontras maksimal.
- **Semantic:** Gunakan hijau untuk keberhasilan, merah untuk kesalahan, dan kuning untuk peringatan, semuanya dalam saturasi yang setara dengan warna primer untuk konsistensi visual.

## Typography

Sistem ini menggunakan **Inter** sebagai satu-satunya keluarga font untuk memastikan konsistensi dan keterbacaan tingkat tinggi yang diperlukan dalam aplikasi data-intensive.

- **Hierarki:** Gunakan bobot `Bold (700)` untuk judul besar agar terlihat menonjol. Gunakan `Medium (500)` untuk label input dan tombol.
- **Kontras:** Teks judul menggunakan warna Slate 900, sedangkan teks body menggunakan Slate 600 untuk menciptakan pemisahan visual yang jelas.
- **Bahasa:** Pastikan penggunaan istilah dalam Bahasa Indonesia tetap ringkas dan konsisten (misal: "Masuk" bukan "Login", "Daftar" bukan "Sign Up").

## Layout & Spacing

Sistem ini menggunakan **Fluid Grid** berbasis 12 kolom untuk desktop, yang bertransisi menjadi 4 kolom pada perangkat mobile. 

- **Grid:** Gunakan margin luar 24px pada mobile dan hingga 80px pada desktop layar lebar. Gutters dijaga tetap pada 24px untuk memberikan ruang nafas antar elemen data.
- **Rhythm:** Gunakan kelipatan 4px atau 8px untuk semua padding dan margin internal guna menjaga harmoni visual.
- **Density:** Area dashboard enterprise menggunakan padding menengah (`md`) untuk menampilkan lebih banyak informasi, sementara halaman pemasaran atau login menggunakan padding besar (`xl`) untuk kesan premium dan lega.

## Elevation & Depth

Kedalaman visual dicapai melalui **Tonal Layering** dan **Ambient Shadows**, bukan melalui efek dekoratif yang berat.

1. **Flat Surface:** Latar belakang utama aplikasi menggunakan putih bersih (#FFFFFF).
2. **Elevated Surface:** Gunakan bayangan yang sangat lembut (soft shadows) untuk kartu dan dropdown. Spesifikasi: `0px 4px 20px rgba(15, 23, 42, 0.05)`.
3. **Ghost Borders:** Untuk elemen form, gunakan border tipis 1px dengan warna Slate 200 sebagai pengganti bayangan untuk menjaga kebersihan visual.
4. **Active State:** Saat elemen ditekan atau aktif, gunakan gradien primer untuk memberikan kesan elemen tersebut "terangkat" secara visual dari permukaan.

## Shapes

Bahasa bentuk dalam sistem desain ini sangat ramah namun tetap profesional, dengan penggunaan radius sudut yang signifikan.

- **Small Elements:** Tombol kecil dan input field menggunakan `rounded-lg` (8px - 12px).
- **Large Elements:** Kartu, modal, dan penampung konten utama menggunakan `rounded-xl` (16px) hingga `rounded-2xl` (24px).
- **Icons:** Ikon harus ditempatkan di dalam kontainer persegi dengan sudut membulat yang konsisten dengan gaya tombol.

## Components

### Buttons
- **Primary:** Menggunakan gradien ungu (#6D5DF6 ke #5B46F5) dengan teks putih. Sudut membulat 12px.
- **Secondary:** Border ungu 1px dengan latar belakang putih atau transparan.
- **Hover State:** Berikan sedikit pencerahan pada warna atau penambahan bayangan halus saat pointer berada di atas tombol.

### Input Fields
- Gunakan label di atas input dengan bobot `Medium`.
- Border default Slate 200, berubah menjadi Ungu Primer saat fokus.
- Sertakan ikon di dalam input (seperti email atau kunci) untuk membantu pengenalan cepat.

### Cards
- Latar belakang putih dengan border halus 1px (#F1F5F9).
- Radius sudut 24px (`rounded-2xl`).
- Gunakan padding internal 24px atau 32px untuk menjaga spasi yang elegan.

### Chips & Badges
- Digunakan untuk status (misal: "Aktif", "Tertunda").
- Gunakan latar belakang warna pastel (saturasi rendah) dengan teks warna gelap yang serasi.
- Bentuk pill-shaped (radius penuh).

### Lists
- Gunakan garis pemisah tipis 1px antar item atau kontainer kartu individual dengan spasi `sm`.
- Pastikan interaksi hover memberikan highlight warna ungu sangat muda (#F5F3FF).