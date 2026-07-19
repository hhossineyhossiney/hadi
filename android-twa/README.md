# Fanixo Android TWA

نسخه رسمی Android فَنی‌اکسو با Trusted Web Activity و پکیج `ir.fanixo.app`.

## خروجی عمومی

- APK: `/public/downloads/fanixo-android-1.0.0.apk`
- لینک پایدار: `https://www.fanixo.ir/download/android`
- حداقل Android: 5.0 / API 21
- Target SDK: 35
- Version: `1.0.0 (1)`

## ساخت مجدد

پیش‌نیازها:

- JDK 17
- Android SDK / Build Tools
- Bubblewrap CLI
- Keystore اصلی فَنی‌اکسو (خارج از Git)

```bash
cd android-twa
npx @bubblewrap/cli update --manifest ./twa-manifest.json --skipVersionUpgrade

export BUBBLEWRAP_KEYSTORE_PASSWORD='...'
export BUBBLEWRAP_KEY_PASSWORD='...'

npx @bubblewrap/cli build \
  --skipPwaValidation \
  --manifest ./twa-manifest.json \
  --signingKeyPath /secure/path/fanixo-release.keystore \
  --signingKeyAlias fanixo
```

## امضای انتشار

Keystore و رمزها عمداً داخل Repository قرار ندارند. برای اینکه به‌روزرسانی نسخه‌های بعدی روی نسخه قبلی نصب شود، همه نسخه‌ها باید با همان Keystore اصلی امضا شوند.

Fingerprint عمومی گواهی:

```text
SHA-256: 2D:F0:65:54:51:94:D5:DF:B1:4C:4F:BC:35:AC:92:3D:15:0F:E1:1C:52:B9:68:44:77:C0:03:B8:8A:6C:E4:3E
```

فایل Digital Asset Links در مسیر زیر قرار دارد:

```text
/public/.well-known/assetlinks.json
```

## انتشار Google Play

برای Google Play از خروجی `app-release-bundle.aab` استفاده شود. انتشار در فروشگاه نیازمند حساب Google Play Console مالک محصول است.
