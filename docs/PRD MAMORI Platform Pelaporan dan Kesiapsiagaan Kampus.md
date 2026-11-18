# PRD MAMORI: Platform Pelaporan dan Kesiapsiagaan Kampus

**Versi 1.0 (Draft) | 18 November 2026 | Nama kerja sebelumnya: Civic Pulse**

## 1. Ringkasan Produk

**MAMORI** (*Mahasiswa Monitor Risiko*; dari kata Jepang 守り, "menjaga/melindungi") adalah aplikasi mobile berbasis lokasi untuk **melaporkan dan memantau kondisi kampus sampai selesai**, sekaligus menjadi **alat kesiapsiagaan bencana** kampus sepanjang tahun.

**Tagline:** *Lihat masalah. Laporkan. Pantau sampai selesai.*

**Posisi:** MAMORI membantu kampus mengetahui kerentanannya sebelum bencana, memastikan semua orang terhitung saat bencana, dan mempercepat pemulihan sesudahnya, dimulai dari laporan sehari-hari yang benar-benar diselesaikan.

**Bukan:** media sosial, game berbasis lokasi, aplikasi "lapor bencana", atau pengganti sistem peringatan dini resmi.

**Catatan nama:** kepanjangan "Mahasiswa" dipakai karena mahasiswa adalah pengguna utama. Dosen dan staf tetap pengguna sah (lihat bagian Pengguna).

**Kategori:** Civic Infrastructure dan Campus Disaster Preparedness. **SDG:** 11 (Sustainable Cities and Communities).

## 2. Latar Belakang dan Masalah

**Masalah nyata di kampus:**

1. Kerusakan fasilitas (lampu mati, atap bocor, drainase tersumbat, pohon lapuk) dilaporkan lewat chat grup atau lisan, tersebar, tidak terlacak, dan sering terlupakan.
2. Pelapor tidak pernah tahu apakah laporannya ditindaklanjuti, sehingga berhenti melapor.
3. Pihak pengelola (sarpras, K3) tidak punya data rapi, tidak tahu prioritas, dan menerima laporan duplikat untuk masalah yang sama.
4. Kesiapsiagaan bencana kampus (jalur evakuasi, titik kumpul, APAR, P3K) jarang dipetakan dan dipantau kondisinya.
5. Saat bencana, tidak ada cara cepat untuk mengetahui siapa yang sudah aman.

**Pelajaran dari platform sejenis (LAPOR!, Qlue, FixMyStreet, SeeClickFix):** warga berhenti melapor ketika laporan tidak ditanggapi. Gamifikasi saja tidak menyelamatkan retensi. Loop yang sehat adalah *lapor → ada hasil → puas → lapor lagi*.

## 3. Tujuan dan Non-Tujuan

### Tujuan

| # | Tujuan | Ukuran |
| --- | --- | --- |
| T1 | Membuat pelaporan kondisi kampus cepat dan mudah | Waktu membuat laporan < 60 detik |
| T2 | Membuat laporan berujung perbaikan | ≥25% masalah selesai dalam 30 hari |
| T3 | Memberi data rapi dan bebas duplikat bagi pengelola | Duplikasi < 15% |
| T4 | Meningkatkan kesiapsiagaan bencana kampus | Peta evakuasi lengkap; check-in drill ≥50% dalam 5 menit |
| T5 | Membangun kebiasaan pakai | Retensi minggu-4 ≥20% |

### Non-Tujuan (di luar lingkup versi ini)

- Bukan sistem peringatan dini atau pengganti BMKG/BPBD.
- Bukan media sosial umum: tidak ada fitur hiburan, pesan pribadi, atau konten di luar pelaporan.
- Tidak menjamin laporan ditindaklanjuti; produk menyediakan jalur dan transparansi, bukan jaminan.
- Tidak mencakup area di luar satu kampus pilot pada v1.
- Tidak ada iklan pada tahap awal.

## 4. Pengguna dan Persona

| Peran | Kebutuhan utama | Perilaku di aplikasi |
| --- | --- | --- |
| **Mahasiswa** (pengguna utama) | Melapor cepat, melihat hasilnya, merasa kampus responsif | Membuat laporan, konfirmasi "masih ada", memantau status |
| **Dosen dan tenaga kependidikan** | Melapor masalah di ruang kerja dan kelas | Sama seperti mahasiswa |
| **Pengelola (sarpras/K3)** | Daftar laporan terverifikasi, terprioritas, tanpa duplikat | Memakai dasbor, mengubah status, mengunggah bukti perbaikan |
| **Tim siaga bencana / floor warden** | Mengetahui kondisi jalur evakuasi dan siapa yang aman | Memantau peta risiko, menjalankan drill, melihat check-in |
| **Admin dan moderator** | Menjaga kualitas dan keamanan konten | Memoderasi laporan, mengelola pengguna dan kategori |

**Persona utama:** *Rani, mahasiswa semester 5.* Melihat lampu tangga darurat gedung B mati sudah dua minggu. Ingin melapor tanpa ribet dan tahu apakah ada yang menanganinya.

## 5. Prinsip Produk

1. **Hasil di atas poin.** Penyelesaian masalah adalah hadiah utama, bukan XP.
2. **Aksi di atas scroll.** Interaksi dirancang untuk menyelesaikan masalah, bukan menghabiskan waktu.
3. **Satu tap bila bisa.** Konfirmasi, check-in, dan bantuan harus bisa dilakukan tanpa mengetik.
4. **Offline-first untuk fitur darurat.**
5. **Kampus adalah mitra, bukan penonton.** Tanpa pihak yang menindaklanjuti, produk gagal.
6. **Keselamatan di atas keterlibatan.** Tidak ada insentif yang mendorong orang mendekati bahaya.
7. **Jujur tentang batas.** Selalu beri label sumber dan status verifikasi.

## 6. Lingkup MVP dan Prioritas

| Prioritas | Fitur |
| --- | --- |
| **P0** (wajib; 8-10 minggu) | Lapor dengan foto kamera langsung + GPS + kategori (termasuk "risiko bencana"); peta persebaran dengan deteksi duplikat (Incident vs Report); konfirmasi satu tap "masih ada"; timeline status + notifikasi ke pelapor; dasbor untuk satu mitra pengelola; peta statis titik kumpul dan jalur evakuasi; login dan profil dasar; moderasi dasar |
| **P1** | Check-in "Saya Aman"; tombol "Butuh Bantuan" yang diarahkan ke kontak resmi; peta offline; pengumuman resmi kampus; XP berbasis hasil; reputasi pelapor; leaderboard per area; galeri sebelum/sesudah; penilaian kerusakan pasca-kejadian |
| **P2** | Komentar; feed berurutan kedekatan dan urgensi; integrasi data BMKG/InaRISK; geofencing dan notifikasi lanjutan; simulasi evakuasi bergamifikasi; ekspansi ke kampus lain |

## 7. Kebutuhan Fungsional

### 7.1 Pelaporan (P0)

| ID | Kebutuhan |
| --- | --- |
| F-01 | Pengguna dapat membuat laporan dengan foto yang diambil langsung dari kamera (galeri tidak diizinkan untuk laporan baru). |
| F-02 | Sistem otomatis mengambil koordinat GPS dan stempel waktu saat foto diambil. |
| F-03 | Pengguna memilih kategori: Fasilitas, Kebersihan, Drainase/Banjir, Pohon/Lingkungan, Listrik/Penerangan, **Risiko Bencana**, Lainnya. |
| F-04 | Pengguna dapat menambahkan deskripsi singkat (opsional, maksimal 280 karakter). |
| F-05 | Pengguna dapat menandai tingkat keparahan (Rendah, Sedang, Tinggi) dan apakah masalah menghalangi jalur evakuasi. |
| F-06 | Alur lapor selesai dalam maksimal 4 langkah dan dapat disimpan sebagai draf jika sinyal buruk. |
| F-07 | Sistem memblur otomatis wajah dan plat nomor pada foto sebelum ditampilkan publik. |
| F-08 | Sistem menolak laporan dengan indikasi lokasi palsu (mock location) atau lokasi di luar area kampus pilot. |

### 7.2 Peta dan Deteksi Duplikat (P0)

| ID | Kebutuhan |
| --- | --- |
| F-10 | Peta interaktif menampilkan Incident berdasarkan lokasi, kategori, status, dan keparahan. |
| F-11 | Saat laporan baru dibuat, sistem mencari Incident aktif dalam radius tertentu (usulan awal 25 m) dengan kategori yang sama. |
| F-12 | Jika ada kandidat, pengguna ditanya: "Apakah ini masalah yang sama?" dengan opsi gabung sebagai bukti tambahan atau buat Incident baru. |
| F-13 | Laporan yang digabung dihitung sebagai Report tambahan pada Incident yang sama, bukan Incident baru. |
| F-14 | Sistem membedakan Report yang membawa informasi baru (foto baru, perubahan kondisi) dari duplikat tanpa informasi tambahan; duplikat tanpa informasi baru tidak mendapat poin. |
| F-15 | Moderator dapat menggabung atau memisahkan Incident secara manual. |

### 7.3 Konfirmasi dan Verifikasi (P0)

| ID | Kebutuhan |
| --- | --- |
| F-20 | Pengguna lain dapat menekan "Masih ada di sini" satu tap pada Incident; ini menjadi sinyal prioritas. |
| F-21 | Konfirmasi hanya sah jika pengguna berada dalam radius wajar dari lokasi (verifikasi GPS) atau melampirkan bukti baru. |
| F-22 | Incident berstatus *Terverifikasi* ketika memenuhi aturan: ≥N konfirmasi dari pengguna berbeda, atau diverifikasi moderator/pengelola. |
| F-23 | Setiap Incident menampilkan label sumber verifikasi (komunitas atau resmi). |

### 7.4 Status dan Notifikasi (P0)

| ID | Kebutuhan |
| --- | --- |
| F-30 | Alur status publik: **Dilaporkan → Terverifikasi → Diteruskan → Dikerjakan → Selesai** (plus *Ditolak* dengan alasan). |
| F-31 | Setiap perubahan status dicatat di timeline publik beserta waktu dan pihak yang mengubah. |
| F-32 | Pelapor dan pengonfirmasi mendapat notifikasi push pada setiap perubahan status. |
| F-33 | Incident menampilkan penghitung "hari tanpa respons" sejak status Terverifikasi. |
| F-34 | Pengelola dapat mengunggah foto "sesudah" saat menandai Selesai; pelapor dapat menyetujui atau membuka kembali (*reopen*). |

### 7.5 Dasbor Mitra Pengelola (P0)

| ID | Kebutuhan |
| --- | --- |
| F-40 | Akses berbasis peran untuk pengelola (sarpras, K3). |
| F-41 | Daftar Incident terverifikasi dengan filter kategori, area, keparahan, dan umur. |
| F-42 | Peta dan tabel yang dapat diurutkan berdasarkan prioritas (keparahan, jumlah konfirmasi, hambatan evakuasi). |
| F-43 | Aksi cepat: ubah status, tugaskan ke unit, tambahkan catatan, unggah bukti. |
| F-44 | Laporan mingguan otomatis "10 masalah teratas" lewat email atau PDF. |
| F-45 | Ekspor data (CSV) untuk keperluan internal kampus. |

### 7.6 Kesiapsiagaan (P0 data statis, P1 interaktif)

| ID | Kebutuhan |
| --- | --- |
| F-50 | Peta statis: titik kumpul, jalur evakuasi, APAR, P3K, AED, tangga darurat. (P0) |
| F-51 | Kategori "Risiko Bencana" untuk bahaya laten: retakan dinding, pohon lapuk, jalur evakuasi terhalang, lampu darurat mati. (P0) |
| F-52 | Mode musiman yang menonjolkan risiko relevan (misalnya banjir dan drainase saat musim hujan). (P1) |
| F-53 | Modul edukasi singkat per ancaman utama kampus (apa yang dilakukan saat gempa/kebakaran di gedung ini). (P1) |
| F-54 | Pendaftaran peran relawan dan floor warden; pendataan kebutuhan khusus evakuasi bersifat opsional dengan persetujuan eksplisit. (P1) |

### 7.7 Mode Darurat (P1)

| ID | Kebutuhan |
| --- | --- |
| F-60 | Mode Darurat dapat diaktifkan oleh admin kampus atau manual oleh pengguna; antarmuka disederhanakan. |
| F-61 | **"Saya Aman"**: check-in satu tap dengan antrean offline, terkirim otomatis saat sinyal kembali. |
| F-62 | **"Butuh Bantuan"**: kirim lokasi GPS dan kategori cepat (terjebak, cedera, butuh evakuasi), serta tampilkan tombol panggil ke kontak resmi (112, BPBD, Basarnas, satpam kampus). |
| F-63 | Peta titik kumpul dan jalur evakuasi tersimpan offline. |
| F-64 | Pengumuman resmi satu arah dari tim kampus. |
| F-65 | Saat Mode Darurat aktif: komentar, XP, dan leaderboard dimatikan; laporan tidak terverifikasi tidak tampil sebagai fakta di feed publik. |
| F-66 | Pasca-kejadian: penilaian kerusakan cepat, status gedung (aman / perlu inspeksi / dilarang dimasuki), pendataan kebutuhan (posko, logistik, relawan). |

### 7.8 Gamifikasi (P1)

| ID | Kebutuhan |
| --- | --- |
| F-70 | XP terbesar diberikan saat laporan **terverifikasi dan terselesaikan**, bukan saat diunggah. |
| F-71 | XP tambahan untuk konfirmasi yang berguna, bukti baru, dan foto sebelum/sesudah. |
| F-72 | Laporan duplikat tanpa informasi baru tidak mendapat XP. |
| F-73 | Skor reputasi pelapor: riwayat valid menaikkan bobot; riwayat salah/iseng menurunkan. |
| F-74 | Kuota XP harian untuk mencegah farming. |
| F-75 | Leaderboard per area (gedung/fakultas). |
| F-76 | Hadiah lokal: SKPI/sertifikat kegiatan, voucher kantin, merchandise (bergantung kesepakatan mitra). |
| F-77 | **Tidak ada** bonus penemuan pertama pada kategori bencana atau area berbahaya. |

### 7.9 Moderasi dan Admin (P0 dasar)

| ID | Kebutuhan |
| --- | --- |
| F-80 | Pelaporan konten (*flag*) oleh pengguna. |
| F-81 | Antrean moderasi untuk laporan yang ditandai atau terdeteksi otomatis. |
| F-82 | Moderator dapat menyembunyikan, menggabung, menolak (dengan alasan), dan memblokir pengguna. |
| F-83 | Log audit semua tindakan moderator dan pengelola. |

## 8. Model Data Inti

Satu **Incident** dapat memiliki banyak **Report** dari pengguna berbeda.

| Entitas | Deskripsi | Atribut utama |
| --- | --- | --- |
| **User** | Pengguna aplikasi | id, nama, peran, reputasi, XP, status akun |
| **Incident** | Satu masalah nyata pada satu lokasi | id, kategori, lokasi (titik), keparahan, status, hambatan\_evakuasi, dibuat\_pada, selesai\_pada |
| **Report** | Bukti atau kontribusi pengguna terhadap Incident | id, incident\_id, user\_id, jenis (awal/konfirmasi/bukti-baru/pembaruan), foto, lokasi, waktu, deskripsi, membawa\_info\_baru |
| **Post** | Representasi Incident di Feed | id, incident\_id, urutan\_prioritas |
| **StatusEvent** | Riwayat perubahan status | id, incident\_id, status, oleh, catatan, waktu |
| **Confirmation** | Konfirmasi "masih ada" | id, incident\_id, user\_id, jarak\_ke\_lokasi, waktu |
| **SafetyCheckin** | Check-in "Saya Aman" | id, user\_id, event\_id, waktu, lokasi (opsional) |
| **AssemblyPoint / EvacRoute / SafetyAsset** | Data statis kesiapsiagaan | id, nama, geometri, tipe, status kondisi |
| **EmergencyEvent** | Kejadian darurat atau drill | id, jenis, mulai, selesai, ditetapkan\_oleh |
| **XPLedger** | Catatan poin | id, user\_id, sumber, jumlah, waktu |

**Catatan teknis usulan:** gunakan basis data dengan dukungan geospasial (misalnya PostgreSQL + PostGIS) untuk pencarian radius dan deteksi duplikat.

## 9. Alur Pengguna Utama

**A. Melapor masalah harian**

1. Buka aplikasi → tekan Lapor.
2. Ambil foto langsung; GPS dan waktu terisi otomatis.
3. Pilih kategori dan keparahan; tambahkan deskripsi bila perlu.
4. Sistem menampilkan kandidat duplikat di sekitar → pengguna gabung atau buat baru.
5. Kirim → status *Dilaporkan* → pelapor mendapat notifikasi setiap perubahan status.

**B. Pengelola menindaklanjuti**

1. Dasbor menampilkan antrean terverifikasi berdasarkan prioritas.
2. Pengelola menandai *Diteruskan* atau *Dikerjakan*, menugaskan unit.
3. Setelah selesai, mengunggah foto "sesudah" dan menandai *Selesai*.
4. Pelapor menerima notifikasi dan dapat menyetujui atau membuka kembali.

**C. Saat darurat atau drill**

1. Admin mengaktifkan Mode Darurat → notifikasi masuk dan antarmuka berubah sederhana.
2. Pengguna menekan "Saya Aman" (offline dulu, terkirim saat sinyal ada).
3. Yang butuh bantuan menekan "Butuh Bantuan" → lokasi terkirim dan tombol kontak resmi tampil.
4. Tim siaga memantau jumlah aman dan area yang belum terhitung.
5. Pasca-kejadian: penilaian kerusakan dan pelacakan pemulihan.

## 10. Kebutuhan Non-Fungsional

| Aspek | Target |
| --- | --- |
| **Kinerja** | Peta dan feed termuat < 3 detik pada jaringan 4G; unggah foto dikompresi otomatis |
| **Ketersediaan** | 99,5% pada jam kampus; fitur darurat tidak bergantung pada satu jalur |
| **Offline** | Draf laporan, peta evakuasi, dan check-in dapat dipakai tanpa sinyal |
| **Skalabilitas** | Mendukung minimal 5.000 pengguna per kampus pada pilot |
| **Keamanan** | Enkripsi saat transit dan tersimpan; akses berbasis peran; log audit |
| **Aksesibilitas** | Kontras tinggi, ukuran tombol besar pada Mode Darurat, dukungan pembaca layar dasar |
| **Platform** | Aplikasi mobile (Android lebih dulu, iOS menyusul) dan dasbor web untuk pengelola |
| **Bahasa** | Bahasa Indonesia sebagai default |

## 11. Privasi, Keamanan, dan Etika

- **Kepatuhan UU PDP:** persetujuan lokasi eksplisit saat onboarding, tujuan pemakaian data jelas, hak hapus data.
- **Data lokasi real-time dan status "aman"** adalah data pribadi: retensi singkat setelah kejadian selesai, akses terbatas pada tim berwenang.
- **Perlindungan pihak ketiga:** blur otomatis wajah dan plat nomor; larangan memotret orang dan rumah pribadi.
- **Anti-fraud:** deteksi mock-location, pemeriksaan metadata foto (EXIF), foto hanya dari kamera, kuota harian, reputasi.
- **Hoaks dan SARA:** moderasi dua lapis (otomatis + manusia); laporan bencana berlabel *"Laporan komunitas, belum diverifikasi resmi"*.
- **Keselamatan pengguna:** tidak ada insentif yang mendorong mendekati lokasi bencana atau area berbahaya; XP dimatikan pada Mode Darurat.
- **Batas tanggung jawab:** disclaimer jelas bahwa MAMORI bukan sistem peringatan dini resmi dan tidak menjamin tindak lanjut; kontak darurat resmi selalu diutamakan.
- **Data resmi** (BMKG, InaRISK/BNPB) selalu ditampilkan dengan label sumber.

## 12. Metrik Keberhasilan (Pilot 90 Hari)

| Metrik | Target |
| --- | --- |
| Pengguna aktif | ≥200 |
| Total laporan | ≥300 |
| Laporan terverifikasi dalam 48 jam | ≥60% |
| Masalah selesai dalam 30 hari | ≥25% |
| Retensi minggu-4 | ≥20% |
| Duplikasi setelah deteksi berjalan | <15% |
| Check-in "Saya Aman" saat drill dalam 5 menit | ≥50% |
| Mitra pengelola yang aktif menindaklanjuti | 1 unit (sarpras/K3) |
| Waktu median pembuatan laporan | < 60 detik |

**Aturan keputusan:** bila target inti tidak tercapai setelah 90 hari, hentikan atau lakukan pivot; jangan memperluas ke kampus lain.

## 13. Rencana Pilot dan Peluncuran

**Strategi mengatasi cold start:**

1. Pilih **satu kampus** dan satu kawasan (radius 1-2 km).
2. Rekrut **20-30 kontributor inti** secara manual (BEM, organisasi mahasiswa, tim siaga).
3. **Seed 50-100 laporan awal** lewat survei sendiri sebelum peluncuran agar peta tidak kosong.
4. Gandeng **mitra resmi** (sarpras/K3, BEM) sebelum rilis publik.
5. Jangan luncurkan ke seluruh kampus sebelum kawasan awal mencapai kepadatan minimum.

**Fase:**

| Fase | Durasi | Isi |
| --- | --- | --- |
| Persiapan | Minggu 1-2 | Kesepakatan mitra, survei kampus, pemetaan ancaman utama (InaRISK/BPBD), data titik kumpul dan jalur evakuasi |
| Pembangunan P0 | Minggu 3-10 | Lapor, peta, duplikat, konfirmasi, status, dasbor |
| Beta tertutup | Minggu 11-12 | 20-30 kontributor inti, perbaikan |
| Pilot terbuka | Minggu 13-24 | Peluncuran satu kampus, ukur metrik, jalankan P1 bertahap |
| Drill evakuasi | Minimal 2 kali selama pilot | Uji "Saya Aman", peta offline, jalur bantuan |
| Evaluasi | Akhir pilot | Putuskan lanjut, pivot, atau berhenti |

## 14. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Pengelola tidak menindaklanjuti | Loop utama putus, pengguna pergi | Kesepakatan tertulis dengan mitra; dasbor dan laporan mingguan; penghitung "hari tanpa respons" |
| Cold start (peta kosong) | Aplikasi terlihat mati | Seed laporan, kontributor inti, kawasan sempit |
| Spam, hoaks, laporan iseng | Kepercayaan turun, beban moderasi | Reputasi, kuota, moderasi dua lapis, foto hanya kamera |
| Spoofing GPS demi XP | Data rusak | Deteksi mock-location, EXIF, XP berbobot hasil |
| Fitur darurat gagal saat kejadian nyata | Risiko reputasi dan hukum | Mitra resmi, uji lewat drill, disclaimer, jalur alternatif (SMS, broadcast kampus) |
| Push notifikasi gagal saat jaringan padat | Pesan tidak sampai | Tidak jadi satu-satunya jalur; integrasi pengumuman kampus |
| Pelanggaran privasi | Masalah hukum (UU PDP) | Persetujuan eksplisit, retensi singkat, akses terbatas, blur otomatis |
| Retensi rendah karena bencana jarang | Aplikasi dihapus | Pelaporan harian dan kesiapsiagaan sebagai mesin penggunaan |
| Biaya moderasi | Beban operasional | Moderator komunitas terpercaya, otomatisasi filter |

## 15. Model Bisnis (Jalur yang Direncanakan)

1. **B2B/B2G SaaS:** langganan dasbor untuk kampus, pengelola kawasan, dan kelurahan (jalur utama).
2. **Data insight:** laporan agregat anonim untuk pengelola dan pihak terkait.
3. **CSR/sponsor:** perusahaan yang mendukung SDG 11 (hadiah, kampanye).
4. **Tidak ada iklan** pada tahap awal.

Untuk tugas atau kompetisi akademik, bagian ini cukup dipresentasikan sebagai rencana keberlanjutan.

## 16. Roadmap

| Kuartal | Fokus |
| --- | --- |
| K1 | P0 dan beta tertutup di satu kampus |
| K2 | Pilot terbuka, P1 (check-in, peta offline, XP berbasis hasil), dua drill evakuasi |
| K3 | Evaluasi pilot, integrasi BMKG/InaRISK, komentar dan feed, perbaikan |
| K4 | Ekspansi ke kampus kedua bila target pilot tercapai |

## 17. Pertanyaan Terbuka

1. Kampus mana yang menjadi pilot, dan siapa penanggung jawab resmi di sarpras/K3?
2. Apakah kampus bersedia memberikan data denah gedung, titik kumpul, dan jalur evakuasi?
3. Ancaman utama kampus pilot (gempa, banjir, kebakaran, pohon tumbang, abu vulkanik)? Perlu dipetakan lewat InaRISK dan BPBD.
4. Hadiah lokal apa yang bisa disepakati (SKPI, voucher kantin)?
5. Apakah kampus punya sistem pengumuman darurat (sirene, WhatsApp broadcast) yang bisa diintegrasikan?
6. Siapa yang menjadi moderator dan berapa kapasitasnya?
7. Radius duplikat dan jumlah konfirmasi minimal untuk status *Terverifikasi* perlu diuji ulang selama beta.
8. Apakah tujuan akhir proyek ini kompetisi/tugas akademik atau startup? Ini menentukan kedalaman bagian model bisnis.
