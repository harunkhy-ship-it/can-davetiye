# Can'ın 2. Yaş Günü Davetiyesi

Dosyalar: `index.html`, `style.css`, `app.js`, `config.js`, `apps-script.gs`

Tarih, saat, adres ve metinleri değiştirmek için sadece `config.js` dosyasını düzenleyin.

## 1) Yanıtları Google Sheets'e toplama

1. [sheets.google.com](https://sheets.google.com) üzerinden yeni bir tablo oluşturun (adı: "Can Davetiye Yanıtları").
2. **Uzantılar → Apps Script** menüsünü açın.
3. Açılan editördeki her şeyi silin, `apps-script.gs` içeriğini yapıştırın ve kaydedin.
4. **Dağıt → Yeni dağıtım → Tür: Web uygulaması**
   - Şu kullanıcı olarak yürüt: **Ben**
   - Erişimi olan kişiler: **Herkes**
5. **Dağıt**'a basın, izin isteklerini onaylayın ve çıkan **Web uygulaması URL'sini** kopyalayın.
6. `config.js` içindeki `scriptUrl: ''` alanına bu adresi yapıştırın.

Her yanıt tabloya "Yanıtlar" sayfasında satır olarak düşer. Aynı kişi yanıtını değiştirirse satırı güncellenir.

> Apps Script kodunu sonradan değiştirirseniz **Dağıt → Dağıtımları yönet → düzenle → Yeni sürüm** yapmanız gerekir.

## 2) GitHub Pages'te yayınlama

1. GitHub'da yeni bir **public** depo açın (örn. `can-davetiye`).
2. Bu klasördeki dosyaları depoya yükleyin (Add file → Upload files).
3. **Settings → Pages → Branch: `main` / `(root)` → Save**.
4. Birkaç dakika sonra adres hazır olur: `https://KULLANICI-ADINIZ.github.io/can-davetiye/`
5. Bu linki WhatsApp'tan paylaşın.

## 3) Yayından önce kontrol

- Linki telefondan açıp bir deneme yanıtı gönderin; tabloya düştüğünü kontrol edin.
- "Takvime ekle" bağlantılarını deneyin (konum etkinliğin içinde görünmeli).
- Deneme satırını tablodan silin.
- Tarayıcıda kayıtlı yanıtı sıfırlamak için: sayfada "Yanıtımı değiştirmek istiyorum" butonunu kullanın ya da gizli pencerede açın.
