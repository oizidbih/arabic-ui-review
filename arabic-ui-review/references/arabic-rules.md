# Arabic Language Rules Reference

This file defines every rule category the skill checks. For each string, work through the categories in order. Report each violation with: the category code, the error, and the suggested fix.

---

## 1. الإملاء (Spelling)

### 1.0 توطئة
General spelling correctness. Verify each word is written according to standard Arabic orthography before checking specific sub-rules.

### 1.1 الهمزات (Hamzas)

#### 1.1.1 الهمزة في بداية الكلمة (Initial hamza)
- **همزة الوصل**: written without a hamza mark (ا) — used in: ال، اسم، ابن، امرأة، verb patterns افتعل/انفعل/استفعل, and some nouns (اثنان، أيمن in oaths).
- **همزة القطع**: always written with hamza mark (أ/إ/آ) — used in all other initial positions.
- Common errors: writing إسم instead of اسم، writing ابتكار without mark is correct (همزة وصل), writing اُمّ instead of أُمّ.

#### 1.1.2 الهمزة المتوسطة (Medial hamza)
Seat is determined by the strongest vowel rule (كسرة > ضمة > فتحة > سكون):
- On ي if hamza or preceding/following vowel is kasra: سئل، بئر
- On و if hamza or surrounding vowel is damma: مؤمن، يؤجّل
- On ا if hamza or surrounding vowel is fatha and no kasra/damma: سأل، مسألة
- Floating (no seat) if preceded by long vowel or sukun and followed by fatha/sukun: جزء، شيء، مروءة
- Common errors: مسئله instead of مسألة، يأجل instead of يؤجّل

#### 1.1.3 الهمزة المتطرفة (Final hamza)
Seat determined by the last vowel before it:
- On ي if preceded by kasra: يجيء، شاطئ
- On و if preceded by damma: تكافؤ
- On ا if preceded by fatha: قرأ، ملجأ
- Floating if preceded by sukun: جزء، بطء، ضوء
- Common errors: يجيئ instead of يجيء، بطأ instead of بطء

### 1.2 الهاء والتاء المربوطة
- **تاء مربوطة** (ة): used in feminine nouns/adjectives, most broken plurals of feminine origin, verbal nouns of certain patterns.
- **هاء** (ه): used at end of pronouns and some proper nouns.
- Error example: فاطمه → فاطمة، رحمه → رحمة

### 1.3 التاء المربوطة والتاء المفتوحة
- **تاء مربوطة** (ة) pronounced as ه in pause, as ت in construct state (إضافة): مدرسةُ المدينة.
- **تاء مفتوحة** (ت) always pronounced as ت: بيت، قالت، ذهبتُ.
- Error example: بيتة → بيت، ذهبة → ذهبت

### 1.4 الحروف المتقاربة صوتياً (Phonetically similar letters)
Flag confusion between:
- ذ / ز / ظ : ذهب vs زهب, يظهر vs يذهر
- س / ص : صواب vs سواب, سيف vs صيف
- ض / ظ : ضهر instead of ظهر, ظلام vs ضلام
- ث / س / ذ : ثمر vs سمر
- ح / هـ : حال vs هال
- ع / ء : علم vs ألم
- ق / ك : قلب vs كلب (in non-standard use)

### 1.5 الحروف المتشابهة من حيث الشكل (Visually similar letters)
Flag confusion between:
- ر / ز : ربّ vs زبّ
- و / ر : (in handwriting/fonts) 
- ب / ت / ث / ن / ي : context-dependent
- ح / ج / خ : without dots
- ع / غ : عين vs غين
- ف / ق : فقر — both present
- د / ذ : دار vs ذار

### 1.6 أخطاء إملائية متنوعة (Miscellaneous spelling errors)
- ألف التفريق (واو الجماعة): كتبوا not كتبوأ; never write alef after ة، ي، long vowels.
- الألف اللينة: متى/على (on ى) vs رجا/دعا (on ا) — determined by origin and conjugation.
- نون التوكيد الخفيفة vs تنوين: distinct usage.
- Common word errors: هاذا → هذا، ذالك → ذلك، لاكن → لكن، إلاّ → إلا (no shadda on lam), أن لا → ألا (when merged).

### 1.7 الأخطاء في أسماء الأعلام والكيانات (Proper nouns)
- Verify spelling of person names, city names, country names, organization names against standard Arabic usage.
- Flag inconsistent spelling of the same proper noun within the same text.
- Flag Arabicized proper nouns that deviate from established conventions.

### 1.8 الأخطاء في كتابة الكلمات الأجنبية (Foreign words)
- Verify that loanwords follow established Arabic transliteration conventions.
- Flag inconsistent transliteration (e.g. كمبيوتر vs حاسوب — note which is preferred in context).
- Suggest the established Arabic equivalent if one exists (see Section 4.3).

---

## 2. التفقيط (Spelling out numbers)

### 2.1 تفقيط المبالغ المالية الصحيحة (Whole monetary amounts)
Rules for writing out whole currency amounts in Arabic words:
- Use المذكر/المؤنث agreement with the currency unit.
- Apply عكس التذكير والتأنيث rule for numbers 3–10 with the مفرد المعدود.
- Numbers 11–12: agree with the معدود.
- Numbers 13–19: عكس for tens digit, same for units.
- Multiples of 10 (20–90): same gender as معدود.
- Example: 15 ريالاً → خمسة عشر ريالاً (ريال is masculine → digit agrees).

### 2.2 تفقيط المبالغ المالية الكسرية (Fractional monetary amounts)
- Use و to connect whole and fractional parts.
- Apply correct case/agreement to fractional currency unit (هللة، فلس، سنت etc.).
- Example: 15.50 ريالاً → خمسة عشر ريالاً وخمسون هللة.

---

## 3. القواعد (Grammar)

### 3.1 الحالات الإعرابية (Case endings)

#### 3.1.1 قواعد الأعداد — الحالة الإعرابية للاسم المعدود (تمييز العدد)
- Numbers 3–10: تمييز is مجرور جمع: ثلاثةُ كتبٍ.
- Numbers 11–99: تمييز is منصوب مفرد: أحد عشر كتاباً.
- Hundreds/thousands: تمييز is مجرور مفرد: مئةُ كتابٍ، ألفُ رجلٍ.
- Flag wrong case or number form on the تمييز.

#### 3.1.2 الفعل المضارع
- **المنصوب**: after أن/لن/كي/لـ + أن/حتى/لام التعليل — ends in فتحة: لن يذهبَ.
- **المجزوم**: after لم/لمّا/لا الناهية/لام الأمر — ends in سكون or drops weak letter: لم يذهبْ.
- **المرفوع**: default state — ends in ضمة: يذهبُ.
- Flag wrong vowel/ending for the syntactic context.

#### 3.1.3 الأسماء والصفات في حالة الجر (Genitives)
- **جمع المذكر السالم**: في حالة الجر → ين: المعلمين.
- **المثنى**: في حالة الجر → ين: الكتابين.
- **الاسم المفرد المذكر**: في حالة الجر → كسرة: في البيتِ.
- **الأعداد في حالة الجر**: apply number agreement rules in genitive context.

#### 3.1.4 إنّ وأخواتها
- إنّ، أنّ، كأنّ، لكنّ، ليت، لعلّ — take nominative-subject (اسم منصوب) and predicate (خبر مرفوع).
- **اسم إنّ**: منصوب — إنّ الطالبَ مجتهدٌ.
- **صفة اسم إنّ**: تتبع اسم إنّ في النصب والتعريف والتذكير/التأنيث والإفراد/الجمع.
- **بدل اسم إنّ**: منصوب.
- **اسم إنّ المؤخر**: when خبر precedes اسم — still منصوب.
- **خبر إنّ**: مرفوع.
- Flag wrong case on any element.

#### 3.1.5 كان وأخواتها
- كان، أصبح، أمسى، بات، ظلّ، صار، ليس، مازال، مادام، مابرح — اسم مرفوع، خبر منصوب.
- **اسم كان**: مرفوع — كان الطالبُ مجتهداً.
- **خبر كان**: منصوب.
- All sub-types (صفة، بدل، مؤخر) follow the same case agreement as listed.
- Flag wrong case on any element.

#### 3.1.6 الممنوع من الصرف (Diptotes)
These nouns take فتحة for both accusative and genitive (no tanwin, no kasra in genitive):
- Adjectives on أفعل pattern: أحمر، أكبر.
- Proper nouns of certain patterns: عمر، زينب، مساجد.
- Plurals on أفاعل/مفاعل: مساجد، أساتذة.
- Flag: في مساجدٍ → في مساجدَ (no tanwin kasra).

#### 3.1.7 الكلمات التي تتغير كتابتها بتغير إعرابها
- ذو/ذي/ذا — changes with case.
- أبو/أبي/أبا — changes with case.
- حيث — مبني، not declined.
- Flag inconsistent form relative to syntactic position.

#### 3.1.8 الاسم النكرة وجمع التكسير
- Indefinite nouns take tanwin; broken plurals may be ممنوع من الصرف.
- Flag missing tanwin on indefinite nouns; flag wrong tanwin type on diptotes.

#### 3.1.9 الجملة الاسمية (Nominal sentence)
- مبتدأ: مرفوع. خبر: مرفوع.
- Flag مبتدأ or خبر with wrong case.

### 3.2 الموافقات (Agreement)

#### 3.2.1 الموافقة بين العدد والمعدود — التذكير والتأنيث
- Numbers 3–10: opposite gender to معدود — ثلاثة رجال، ثلاث نساء.
- Numbers 11–12: same gender — أحد عشر رجلاً، إحدى عشرة امرأة.
- Numbers 13–19: units opposite, tens same.
- Numbers 20–99: no gender distinction on the number.
- Flag gender mismatch.

#### 3.2.2 الموافقة بين العدد والمعدود — الإفراد والجمع
- Numbers 3–10: معدود is plural (جمع): ثلاثة كتب.
- Numbers 11 and above: معدود is singular منصوب: أحد عشر كتاباً.
- Flag wrong form of معدود.

#### 3.2.3 الموافقة بين كلا / كلتا وما يضاف إليهما
- كلا + مذكر، كلتا + مؤنث — كلا الرجلين، كلتا المرأتين.
- They take dual inflection: كلاهما/كلتاهما (nominative), كليهما/كلتيهما (accusative/genitive).
- Flag mismatch.

#### 3.2.4 الموافقة بين أحد / إحدى وما يضاف إليهما
- أحد + مذكر — أحد الرجال.
- إحدى + مؤنث — إحدى النساء.
- Flag mismatch.

#### 3.2.5 الموافقة بين ذات / ذو وما يسبقهما
- ذو/ذا/ذي agree in gender/case with the noun they accompany and take إضافة.
- ذات is the feminine form.
- Flag mismatch or wrong case form.

---

## 4. الصياغة (Style and Phrasing)

### 4.1 إعادة الصياغة
Identify sentences that are grammatically acceptable but stylistically poor. Suggest a clearer, more natural Arabic reformulation.

### 4.2 اقتراح تعديل التراكيب الشائعة رغم عدم فصاحتها
Flag expressions widely used but considered non-classical/non-فصيح. Suggest the فصيح alternative.
Examples: "قام بـ + مصدر" → use the verb directly (كتب الدرس، لا: قام بكتابة الدرس).

### 4.3 اقتراح المقابل الفصيح للكلمات الأجنبية
Suggest the established Arabic equivalent for loanwords where one exists:
- كمبيوتر → حاسوب, تلفون → هاتف, إيميل → بريد إلكتروني.

### 4.4 اقتراح المقابل الفصيح للكلمات العامية
Flag dialectal words and suggest the فصيح equivalent:
- شوية → قليلاً, كتير → كثيراً, مش → ليس, هيك → هكذا.

### 4.5 اقتراح البديل الأكثر فصاحة
Where multiple standard options exist, suggest the most classical/formal one appropriate to the register.

### 4.6 اقتراح بدائل مكافئة للتعبيرات الفصيحة
Provide synonymous formal alternatives to add variety or precision.

### 4.7 اقتراح بدائل أفصح للأفعال المرتبطة بحروف الجر
Flag verbs incorrectly paired with prepositions. Suggest فصيح verb+preposition pairs:
- تحدّث عن (not في), اهتمّ بـ (not في), أسهم في (not بـ).

### 4.8 اقتراح بدائل أفصح للأسماء المرتبطة بحروف الجر
Correct noun+preposition collocations that deviate from فصيح usage.

### 4.9 اقتراح بدائل أصح للاشتقاقات (Derivation errors)
Flag incorrect use of derived forms: wrong مصدر، wrong اسم فاعل/مفعول، wrong صيغة مبالغة.
Example: مُحادَثة vs مُحادِثة (passive vs active participle) — ensure correct form for context.

### 4.10 اقتراح بدائل أفصح لحالات التوكيد
Suggest more correct/eloquent forms for emphasis structures (توكيد لفظي/معنوي).

### 4.11 اقتراح بدائل أفصح لبعض التراكيب اللغوية
Flag awkward constructions; suggest standard Arabic syntax alternatives.

### 4.12 اقتراح حذف حروف الجر التي تتعدى الأفعال بدونها
Flag verbs that are directly transitive but are incorrectly used with a preposition:
- شكر لـ → شكر (شكرته, not شكر له), عالج → (يعالج المرض, not يعالج من المرض in standard use).

---

## 5. التشكيل (Diacritics)

### 5.1 التشكيل الكلي (Full diacritization)
If the text is fully voweled: verify every letter's diacritic is correct per grammar rules. Flag any incorrect short vowel, sukun, or shadda.

### 5.2 تشكيل أواخر الكلمات (End-of-word diacritization)
Verify the final vowel/tanwin of each word matches its إعراب:
- مرفوع: ضمة/تنوين ضم.
- منصوب: فتحة/تنوين فتح.
- مجرور: كسرة/تنوين كسر.
- مجزوم/مبني: سكون.
- Flag any mismatch.

### 5.3 التشكيل الجزئي (Partial diacritization)
In partially-voweled text: flag diacritics that are present but incorrect; suggest corrections. Do not flag missing diacritics unless they cause ambiguity.

---

## 6. النص القرآني (Quranic Text)

### 6.1 تحديد النص القرآني داخل المحتوى
- Identify strings that contain or quote Quranic text.
- Flag any deviation from the رسم العثماني (Uthmanic script) — the spelling in the Quran differs from standard Arabic orthography in specific ways (e.g. الصلوة، الزكوة، يأيّها).
- Do NOT apply standard spelling rules (section 1) to identified Quranic text — the Quranic spelling is authoritative.
- Flag missing quotation markers or أقواس التنصيص around Quranic quotes in UI context.

---

## 7. علامات الترقيم (Punctuation)

Arabic punctuation mirrors meaning-based pauses and structures. Use Arabic-specific marks: ، (Arabic comma), ؛ (Arabic semicolon), ؟ (Arabic question mark).

### 7.1 أولاً: الفاصلة ،

- **بعد القوسين الهلاليين**: place ، after closing ) if the sentence continues.
- **قبل العطف**: before و/أو/ثم when joining long clauses.
- **قبل حروف الجر**: before long prepositional phrases that interrupt the sentence flow.
- **قبل الكلمات والعبارات الدالة على الظرفية**: before ظروف like عندما، حين، بينما، إذ، لما.
- **قبل بعض الحروف ذات الدلالة الخاصة**: before لكن، بل، أمّا، غير أنّ.
- **قبل الأفعال المعطوفة**: separate clauses in compound sentences.
- **قبل الأفعال المنفية**: before negative verb clauses in compound sentences.
- **قبل إن وأخواتها**: before إنّ، أنّ، كأنّ when they introduce a clause.
- **قبل الشرط**: before إذا، لو، إن الشرطية when introducing a conditional clause.
- **قبل الضمائر المنفصلة**: when a detached pronoun begins a new clause.
- **قبل أسماء الإشارة**: when هذا/هذه/ذلك etc. begin a new clause.
- **قبل الأسماء الموصولة**: before الذي/التي/الذين etc. introducing a relative clause.
- **قبل الحروف المصدرية**: before أن/أنّ/ما when introducing noun clauses.
- **قبل الاستدراك**: before لكن، غير أنّ، إلا أنّ.
- **قبل الكلمات ذات الاستخدام المتكرر**: separate repeated parallel structures.
- **قبل الكلمات الدالة على الربط**: before نتيجةً لذلك، بناءً على ذلك، وعليه.
- **قبل الكلمات التي يكثر اقترانها بالأفعال**: before common adverbial expressions.
- **بعد الكلمات الدالة على الجواب**: after نعم، لا، بلى، كلا.
- **قبل الكلمات الدالة على تفسير**: before أي، يعني، أعني، أو (explanatory).

### 7.2 ثانياً: الفاصلة المنقوطة ؛
- **قبل الكلمات الدالة على الترتّب والسببية**: before إذن، لذلك، ومن ثَمّ، وبالتالي، فـ (causative), لهذا.

### 7.3 ثالثاً: النقطة .
- **في نهاية الفقرة**: a full stop at the end of every complete paragraph/sentence.
- **قبل أمّا**: a full stop before أمّا when it opens a new topic.

### 7.4 رابعاً: الشرطتان الأفقيتان — —
- **حول الجمل الدعائية المعترضة**: surround parenthetical phrases like رحمه الله، صلى الله عليه وسلم when embedded mid-sentence — e.g.: قال النبي —صلى الله عليه وسلم— كذا.

### 7.5 خامساً: النقطتان الرأسيتان :
- **بعد الكلمات الدالة على التنصيص أو التعدد**: after قال، يلي، كالتالي، ما يلي، أولاً، ثانياً etc. when introducing a list or quotation.

### 7.6 سادساً: علامة الاستفهام ؟
- **بعد السؤال**: required after every direct question.

### 7.7 سابعاً: علامة التعجب !
- **علامة التعجب**: after exclamatory sentences.

---

## Checking order and output format

When reviewing a string, check categories in this order:
1. الإملاء (1.1–1.8)
2. التفقيط (2.1–2.2) — only if the string contains numbers/amounts
3. القواعد (3.1–3.2)
4. الصياغة (4.1–4.12)
5. التشكيل (5.1–5.3) — only if the string contains diacritics
6. النص القرآني (6.1) — identify first, then skip spelling rules for that portion
7. علامات الترقيم (7.1–7.7)

For each violation found, report:
```json
{
  "rule": "1.1.2",
  "rule_name": "الهمزة المتوسطة",
  "severity": "error|warning|info",
  "found": "مسئله",
  "suggested_fix": "مسألة",
  "explanation": "الهمزة المتوسطة مسبوقة بفتحة → مقعدها الألف"
}
```

Severity guide:
- **error**: spelling errors, wrong case endings, wrong hamza, Quranic text deviation
- **warning**: grammar agreement issues, wrong preposition collocations, punctuation errors
- **info**: style suggestions, classical alternatives, diacritization improvements
