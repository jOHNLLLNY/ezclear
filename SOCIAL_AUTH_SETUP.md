# 🔐 Налаштування Google і Facebook аутентифікації

## 📋 Environment Variables

Додайте ці змінні в ваш `.env` файл:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your_google_client_id_ios
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_google_client_id_android
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your_google_client_id_web

# Facebook OAuth
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

## 🔧 Налаштування Google OAuth

### 1. Google Cloud Console
1. Перейдіть на [Google Cloud Console](https://console.cloud.google.com)
2. Створіть новий проект або виберіть існуючий
3. Увімкніть Google+ API
4. Перейдіть до Credentials → Create Credentials → OAuth 2.0 Client IDs

### 2. Створіть Client IDs для кожної платформи:

**iOS Client ID:**
- Application type: iOS
- Bundle ID: `com.yourcompany.ezclear` (з app.json)

**Android Client ID:**
- Application type: Android
- Package name: `com.yourcompany.ezclear`
- SHA-1 certificate fingerprint: отримайте командою:
  ```bash
  expo credentials:manager
  ```

**Web Client ID:**
- Application type: Web application
- Authorized redirect URIs: `https://yourproject.supabase.co/auth/v1/callback`

### 3. Налаштування в Supabase
1. Перейдіть в Supabase Dashboard → Authentication → Providers
2. Увімкніть Google provider
3. Додайте ваш Web Client ID та Client Secret

## 📘 Налаштування Facebook OAuth

### 1. Facebook Developers
1. Перейдіть на [Facebook Developers](https://developers.facebook.com)
2. Створіть новий додаток або виберіть існуючий
3. Додайте Facebook Login product

### 2. Налаштування платформ:

**iOS:**
- Bundle ID: `com.yourcompany.ezclear`
- Single Sign On: Enabled

**Android:**
- Package Name: `com.yourcompany.ezclear`
- Class Name: `com.yourcompany.ezclear.MainActivity`
- Key Hashes: отримайте командою:
  ```bash
  expo credentials:manager
  ```

### 3. Налаштування в Supabase
1. Перейдіть в Supabase Dashboard → Authentication → Providers
2. Увімкніть Facebook provider
3. Додайте ваш Facebook App ID та App Secret
4. Redirect URL: `https://yourproject.supabase.co/auth/v1/callback`

## 🚀 Налаштування app.json

Додайте схему URL в `app.json`:

```json
{
  "expo": {
    "scheme": "ez-clear",
    "platforms": ["ios", "android", "web"],
    "ios": {
      "bundleIdentifier": "com.yourcompany.ezclear"
    },
    "android": {
      "package": "com.yourcompany.ezclear"
    }
  }
}
```

## 🔍 Тестування

### Google Auth Test:
1. Натисніть "Continue with Google"
2. Виберіть Google акаунт
3. Підтвердіть дозволи
4. Повинен автоматично увійти в додаток

### Facebook Auth Test:
1. Натисніть "Continue with Facebook"
2. Увійдіть в Facebook акаунт
3. Підтвердіть дозволи
4. Повинен автоматично увійти в додаток

## 🐛 Troubleshooting

### Google Auth помилки:
- `DEVELOPER_ERROR`: Неправильний Client ID або SHA-1
- `SIGN_IN_CANCELLED`: Користувач скасував вхід
- `SIGN_IN_FAILED`: Проблеми з налаштуванням

### Facebook Auth помилки:
- `App ID not found`: Неправильний Facebook App ID
- `Invalid redirect URI`: Неправильний Redirect URL в Supabase
- `App not live`: Facebook додаток не опублікований

### Загальні помилки:
- Перевірте environment variables
- Перевірте Bundle ID / Package Name
- Перевірте налаштування в Supabase Dashboard
- Очистіть кеш: `expo start -c`

## 📱 Додаткові налаштування

### Для production:
1. Опублікуйте Facebook додаток
2. Додайте production redirect URLs
3. Налаштуйте App Store Connect / Google Play Console
4. Оновіть Bundle IDs для production

### Безпека:
1. Обмежте OAuth redirect URLs
2. Використовуйте HTTPS для всіх URLs
3. Налаштуйте правильні CORS налаштування
4. Регулярно оновлюйте Client Secrets

