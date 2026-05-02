# i18n File Formats by Framework

## React / Next.js

### react-i18next / i18next
```
public/locales/ar/translation.json
src/locales/ar.json
src/i18n/ar.json
```
Format: nested JSON
```json
{
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء"
  },
  "errors": {
    "required": "هذا الحقل مطلوب"
  }
}
```

### react-intl (FormatJS)
```
src/messages/ar.json
lang/ar.json
```
Format: flat JSON with message descriptors
```json
{
  "app.common.save": "حفظ",
  "app.errors.required": "هذا الحقل مطلوب"
}
```

---

## Vue.js / Nuxt

### vue-i18n
```
src/locales/ar.json
src/i18n/ar.yaml
locales/ar.json
```
Format: JSON or YAML, nested or flat

---

## Angular

### @ngx-translate
```
src/assets/i18n/ar.json
assets/i18n/ar.json
```
Format: nested JSON

### Angular built-in i18n
```
src/locale/messages.ar.xlf
```
Format: XLIFF
```xml
<trans-unit id="greeting">
  <source>Hello</source>
  <target>مرحبا</target>
</trans-unit>
```

---

## Flutter / Dart

### flutter_localizations + arb
```
lib/l10n/app_ar.arb
l10n/intl_ar.arb
```
Format: ARB (Application Resource Bundle)
```json
{
  "@@locale": "ar",
  "helloWorld": "مرحبا بالعالم",
  "@helloWorld": {
    "description": "Greeting"
  }
}
```

---

## iOS / Swift / Objective-C

```
ar.lproj/Localizable.strings
ar.lproj/InfoPlist.strings
```
Format: `.strings`
```
"greeting" = "مرحبا";
"cancel_button" = "إلغاء";
```

Or `.stringsdict` for plurals:
```xml
<key>items_count</key>
<dict>
  <key>NSStringLocalizedFormatKey</key>
  <string>%#@items@</string>
  ...
</dict>
```

---

## Android / Kotlin / Java

```
res/values-ar/strings.xml
res/values-ar-rSA/strings.xml
```
Format: XML
```xml
<resources>
  <string name="app_name">التطبيق</string>
  <string name="greeting">مرحبا</string>
  <plurals name="items_count">
    <item quantity="one">عنصر واحد</item>
    <item quantity="other">%d عناصر</item>
  </plurals>
</resources>
```

---

## Python (Django)

```
locale/ar/LC_MESSAGES/django.po
locale/ar/LC_MESSAGES/django.mo
```
Format: GNU gettext `.po`
```po
msgid "Save"
msgstr "حفظ"

msgid "Cancel"
msgstr "إلغاء"
```

---

## Ruby on Rails

```
config/locales/ar.yml
```
Format: YAML
```yaml
ar:
  common:
    save: "حفظ"
    cancel: "إلغاء"
```

---

## PHP (Laravel)

```
lang/ar/validation.php
lang/ar/auth.php
resources/lang/ar/messages.php
```
Format: PHP arrays
```php
return [
    'required' => 'هذا الحقل مطلوب.',
    'email' => 'يجب أن يكون البريد الإلكتروني صالحاً.',
];
```

---

## Elixir / Phoenix

```
priv/gettext/ar/LC_MESSAGES/default.po
priv/gettext/ar/LC_MESSAGES/errors.po
```
Format: GNU gettext `.po`

---

## Key comparison logic

When comparing Arabic translations against a reference language:

1. Parse both files into flat key→value maps
2. Keys in reference but not in Arabic → **missing**
3. Keys in Arabic but not in reference → **extra** (possibly orphaned)
4. Keys in both but Arabic value is empty → **empty**
5. Keys in both but Arabic value == key name → **untranslated**
6. Extract `{variable}`, `%s`, `{{var}}`, `%(var)s` from reference value and check they appear in Arabic value → **placeholder mismatch**
