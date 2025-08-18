# 🔧 Troubleshooting Authentication Issues

## Проблема: Користувач не може увійти після реєстрації

### 🎯 Кроки для вирішення:

#### 1. **Перевірка Environment Variables**
```bash
# Переконайтеся, що в .env файлі є:
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 2. **Запустіть діагностику в додатку**
1. Відкрийте екран Create Account
2. Спробуйте зареєструватись
3. Перевірте консоль браузера/додатка для діагностичних повідомлень
4. Знайдіть повідомлення, що починаються з 🔍

#### 3. **Перевірте структуру бази даних в Supabase**
1. Відкрийте Supabase Dashboard
2. Перейдіть в SQL Editor
3. Скопіюйте і виконайте SQL з файлу `database-check.sql`
4. Перевірте результати кожної секції

#### 4. **Можливі причини проблеми:**

**A. Відсутня таблиця `profiles`**
- Виконайте секцію 4 з `database-check.sql`
- Це створить таблицю з правильною структурою

**B. Неправильні RLS політики**
- Виконайте секції 5-6 з `database-check.sql`
- Це налаштує правильні політики безпеки

**C. Відсутній тригер для створення профілю**
- Виконайте секції 8-9 з `database-check.sql`
- Це створить автоматичне створення профілю при реєстрації

**D. Email confirmation включено**
- В Supabase Dashboard: Authentication → Settings
- Вимкніть "Enable email confirmations" для тестування

#### 5. **Тестування після виправлень:**
1. Очистіть кеш додатка: `expo start -c`
2. Спробуйте зареєструватись знову
3. Перевірте консоль для діагностичних повідомлень

#### 6. **Додаткові перевірки:**

**Перевірте підключення до Supabase:**
```javascript
// В консолі браузера:
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)
```

**Перевірте таблицю profiles:**
```sql
-- В Supabase SQL Editor:
SELECT * FROM profiles LIMIT 5;
```

**Перевірте RLS політики:**
```sql
-- В Supabase SQL Editor:
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### 🚨 Якщо проблема залишається:

1. **Перевірте логи в Supabase Dashboard:**
   - Logs → Database
   - Logs → Auth
   - Знайдіть помилки, пов'язані з вашим email

2. **Створіть тестовий акаунт:**
   - Використовуйте простий email (наприклад, test@test.com)
   - Простий пароль (наприклад, Test123!)

3. **Перевірте Network tab в браузері:**
   - Відкрийте Developer Tools
   - Перейдіть на Network tab
   - Спробуйте зареєструватись
   - Знайдіть запити до Supabase і перевірте відповіді

### 📞 Додаткова допомога:

Якщо проблема залишається, надайте:
1. Діагностичні повідомлення з консолі
2. Результати виконання `database-check.sql`
3. Скріншот помилок з Supabase Dashboard
