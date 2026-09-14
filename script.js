/* ============================================================
   ASYL.ZHALUZI.KZ - скрипт страницы.
   Плиты и рулонная штора (герой: интро поднимает полотно с текстом,
   дальше штора сматывается по скроллу; плиты: кадр открывается по --open) ·
   шнур-индикатор прокрутки · перевод RU/KZ (?lang= сильнее localStorage) ·
   меню · бегущая лента · лента работ с кнопками · калькулятор ·
   WhatsApp с названием модели · форма в WhatsApp. Библиотек нет.
   ============================================================ */
(function(){
"use strict";

/* ---------------- ЗАГЛУШКИ ДАННЫХ (единственное место) ----------------
   🟠 Телефон и WhatsApp клиент не прислал - заменить здесь, всё остальное
   (tel:, wa.me, текст номера в шапке, меню, контактах, панели) подставится само. */
var CONTACT = {
  phone: "+77000000000",          /* tel: */
  phoneView: "+7 700 000 00 00",  /* как показываем */
  wa: "77000000000",              /* wa.me/ */
  ig: "asyl.zhaluzi.kz"
};
/* 🟠 Цены «от» за м² - ориентир по рынку Алматы до подтверждения клиентом
   (см. _project/company-info.md). Из этого же объекта читает калькулятор. */
var PRICES = {
  "rulonnye":      { ru:"Рулонные шторы",         kk:"Рулондық перделер",     p: 6000 },
  "den-noch":      { ru:"День-ночь (зебра)",      kk:"Күн-түн (зебра)",       p:11000 },
  "blackout":      { ru:"Блэкаут",                kk:"Блэкаут",               p:12000 },
  "kassetnye":     { ru:"Кассетные UNI",          kk:"Кассеталық UNI",        p:14000 },
  "vertikalnye":   { ru:"Вертикальные жалюзи",    kk:"Тік жалюзи",            p: 6500 },
  "gorizontalnye": { ru:"Горизонтальные жалюзи",  kk:"Көлденең жалюзи",       p:10000 },
  "plisse":        { ru:"Плиссе",                 kk:"Плиссе",                p:12000 },
  "fotopechat":    { ru:"Фотопечать",             kk:"Фотобасып шығару",      p: 9000 }
};

var RED = matchMedia("(prefers-reduced-motion: reduce)").matches;
var HAS_IO = typeof IntersectionObserver === "function";
var root = document.documentElement;

/* ---------------- КОНВЕРСИИ GOOGLE ADS ----------------
   Ярлыки задаёт index.html (window.AZ_CONV). Клики по телефону и WhatsApp
   ловим делегированием, переход не блокируем. Пустой ярлык - событие не шлём. */
function conv(key){
  var id = (window.AZ_CONV || {})[key];
  if (!id || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {send_to: id, value: 1.0, currency: "USD"});
}
document.addEventListener("click", function(e){
  var a = e.target.closest ? e.target.closest("a[href]") : null;
  if (!a) return;
  var h = a.getAttribute("href") || "";
  if (h.indexOf("tel:") === 0) conv("phone");
  else if (h.indexOf("wa.me") > -1) conv("contact");
}, true);

/* ---------------- КАЗАХСКИЙ СЛОВАРЬ ----------------
   Разметка русская. Ключа нет - строка остаётся русской. */
var KZ = {
"m.title":"Алматыда тапсырыспен жалюзи мен рулондық перделер - ASYL.ZHALUZI.KZ",
"m.desc":"Алматы мен облыста тапсырыспен рулондық перделер, күн-түн, блэкаут, тік және көлденең жалюзи, плиссе. Тегін өлшеу және монтаж, бағасы 6 000 ₸/м²-ден, маталардың кең таңдауы. Күн сайын 9:00-22:00, нарықта 7 жыл.",
"m.ogt":"Алматыда тапсырыспен жалюзи мен рулондық перделер - ASYL.ZHALUZI.KZ",
"m.ogd":"Тегін өлшеу және монтаж, бағасы 6 000 ₸/м²-ден, маталар мен модельдердің кең таңдауы. Күн сайын 9:00-22:00, Алматы және облыс.",
"a.home":"ASYL.ZHALUZI.KZ, басты бетке","a.nav":"Сайт бөлімдері","a.lang":"Сайт тілі","a.call":"Қоңырау шалу","a.menu":"Мәзір","a.prev":"Артқа","a.next":"Алға","a.lane":"Жұмыстар фотосы",
"a.ig":"ASYL.ZHALUZI.KZ Instagram парақшасы: @asyl.zhaluzi.kz","a.ig2":"ASYL.ZHALUZI.KZ Instagram парақшасы",
"nav.md":"Модельдер мен бағалар","nav.ru":"Рулондық","nav.dn":"Күн-түн","nav.vt":"Тік жалюзи","nav.rb":"Жұмыстар","nav.kl":"Калькулятор","nav.vp":"Сұрақтар","nav.kn":"Байланыс",
"b.zamer":"Тегін өлшеу","b.models":"Модельдер мен бағалар","b.price":"Бағасын білу",
"ig.menu":"Жұмыстар: Instagram","ig.hero":"Жұмыстар: Instagram","ig.gal":"Көбірек жұмыс: Instagram","ig.con":"Жұмыстар: Instagram",

"h.kick":"Алматы және облыс · тапсырыспен жалюзи мен ролл-перделер · 7 жыл",
"h.h1a":"Жалюзи мен рулондық перделер","h.h1b":"Алматыда тапсырыспен",
"h.lead":"Өлшеу мен монтаж - <b>тегін</b>. Бағасы <b data-price-min>6 000 ₸/м²-ден</b>, маталар мен модельдердің кең таңдауы. Күн сайын 9:00-22:00.",
"h.hint":"Айналдырыңыз - перде көтеріледі",

"md.k":"Каталог","md.h":"Модельдер мен <em>«бастап»</em> бағалар","md.l":"Бағасы м² үшін, матасы мен механизмімен. Өлшеу мен монтаж - тегін, нақты бағасы - өлшеуден кейін.",
"md.n":"«Бастап» бағалар шамамен, матасы мен терезе өлшеміне байланысты. Нақты құнын тегін өлшеуде айтамыз.",
"c1.h":"Рулондық перделер","c1.p":"Классика: жақтауға мини немесе қорапқа","c1.a":"Ашық қонақ бөлме терезесіндегі ақ рулондық перде",
"c2.h":"Күн-түн (зебра)","c2.p":"Жолақтар жарықты бір қимылмен реттейді","c2.a":"Ас үй терезесіндегі күн-түн перде",
"c3.h":"Блэкаут","c3.p":"Жатын бөлме мен балалар бөлмесіне толық қараңғылау","c3.a":"Заманауи терезедегі сұр блэкаут рулондық перде",
"c4.h":"Кассеталық UNI","c4.p":"Қорап пен бағыттауыштар, мата әйнекке тығыз","c4.a":"Терезе ойығындағы кассеталық рулондық перде",
"c5.h":"Тік жалюзи","c5.p":"Үлкен терезелер мен кеңселерге мата ламельдері","c5.a":"Тік мата жалюзи, ламельдер ірі планда",
"c6.h":"Көлденең жалюзи","c6.p":"Алюминий 25 мм: ас үй, балкон, кеңсе","c6.a":"Терезеден көрінісі бар ақ көлденең алюминий жалюзи",
"c7.h":"Плиссе","c7.p":"Стандартты емес және мансарда терезелеріне қатпарлы","c7.a":"Бежевый плиссе перде ірі планда",
"c8.h":"Фотобасып шығару","c8.p":"Сіздің суретіңіз немесе каталогтағы принт","c8.a":"Кофе принтті рулондық перделер, ASYL.ZHALUZI.KZ жұмысы",

"p1.k":"Рулондық перделер","p1.h":"Кез келген терезеге <em>рулондық перделер</em>","p1.p":"Жақтауға мини немесе қорапқа. Маталар - жеңіл жарық сүзгісінен блэкаутқа дейін.","p1.a":"Терезедегі бежевый рулондық перде және көк кресло",
"p2.k":"Күн-түн","p2.h":"Күн-түн: жарық <em>бір қимылмен</em>","p2.p":"Екі жолақты мата жылжиды - жұмсақ жарықтан толық көлеңкеге дейін. Ас үй мен қонақ бөлмеге сұранысты.","p2.a":"Терезесінде күн-түн перде бар ақ жатын бөлме",
"p3.k":"Тік жалюзи","p3.h":"Үлкен терезелерге <em>тік жалюзи</em>","p3.p":"89 және 127 мм мата ламельдері: бұрылады және шетке жиналады. Кеңселер, панорамалық терезелер, эркерлер.","p3.a":"Күн сәулесіндегі жылы түсті тік мата жалюзи",

"dk.k":"Кімге","dk.h":"Пәтерлер, үйлер, <em>кеңселер, коммерция</em>","dk.l":"Модель мен матаны бөлмеге қарай таңдаймыз - балалар бөлмесінен келіссөз бөлмесіне дейін.",
"w1.h":"Пәтерлер","w1.p":"Жатын бөлме, ас үй, балалар бөлмесі","w1.a":"Терезесінде ашық түсті перде бар пәтердің қонақ бөлмесі",
"w2.h":"Үйлер","w2.p":"Панорамалық және мансарда терезелері","w2.a":"Биік терезелері бар жеке үйдің қонақ бөлмесі",
"w3.h":"Кеңселер","w3.p":"Бүкіл қабатқа бір стиль","w3.a":"Терезелерінде рулондық перделер бар жарық кеңсе",
"w4.h":"Коммерция","w4.p":"Кафе, салондар, дүкендер, клиникалар","w4.a":"Үлкен терезелерінде рулондық перделер бар кафе залы",

"pc.k":"Неге біз","pc.h":"Сіздің жарығыңыз - <em>сіздің ережеңіз</em>","pc.l":"7 жыл бойы Алматы мен облыста жалюзи мен ролл-перделер орнатамыз. Келеміз, өлшейміз, өлшемге сай тігеміз және орнатамыз - өлшеу мен орнатуға қосымша ақысыз.","pc.a":"Қабырғадағы жалюзиден түскен жылы жарық жолақтары",
"f1":"жыл нарықта","f2":"өлшеу мен монтаж","f3":"каталогтағы модель","f4":"күн сайын, демалыссыз","f5b":"Алматы","f5":"және Алматы облысы",

"rb.k":"Біздің жұмыстар","rb.h":"Біз безендірген <em>терезелер</em>","rb.l":"Алматы мен облыстағы нысандардан фото - өңдеусіз, сол күйінде.",
"g1":"Рулондық · қонақ бөлме","g2":"Рулондық · жақтау ашық","g3":"Тік · арка","g4":"Рулондық · эркер ас үй","g5":"Күн-түн · ас үй","g6":"Принтті рулондық","g7":"Принт · ірі план","g8":"Принт · жақтау ашық","g9":"Күн-түн · жабық","g10":"Күн-түн · жарық",

"kk.k":"Қалай жұмыс істейміз","kk.h":"Өтінімнен монтажға дейін - <em>төрт қадам</em>",
"s1.h":"Өтінім","s1.p":"WhatsApp, қоңырау немесе сайттағы форма.",
"s2.h":"Тегін өлшеу","s2.p":"Келеміз, өлшейміз, мата үлгілерін көрсетеміз.",
"s3.h":"Дайындау","s3.p":"Сіздің өлшеміңіз бен таңдаған матаңызға сай тігеміз.",
"s4.h":"Монтаж","s4.p":"Тегін орнатамыз және қалай қолдануды көрсетеміз.",

"kl.k":"Калькулятор","kl.h":"Құнын бір минутта <em>шамалаңыз</em>","kl.l":"«Бастап» баға бойынша бағдар. Нақты сомасын тегін өлшеуден кейін айтамыз.",
"kl.model":"Модель","kl.w":"Терезе ені, см","kl.hh":"Терезе биіктігі, см","kl.n":"Терезе саны","kl.res":"Шамамен","kl.send":"Есепті WhatsApp-қа жіберу",

"vp.k":"Сұрақтар","vp.h":"Жиі қойылатын <em>сұрақтар</em>",
"q1.q":"Өлшеу қанша тұрады?","q1.a":"Ештеңе. Алматы мен Алматы облысында өлшеу мен монтаж тегін.",
"q2.q":"Матаны қалай таңдаймын?","q2.a":"Өлшеу кезінде: мата мен түс үлгілерін терезеңіздің жанында көрсетеміз - жарық сүзгісінен блэкаутқа дейін.",
"q3.q":"Бұрғылаусыз орнатуға бола ма?","q3.a":"Мини-рулондық перделерге жақтауға бұрғылаусыз бекіту бар. Сіздің терезеңізге қайсысы сай келетінін өлшеуде айтамыз.",
"q4.q":"м² бағасына не кіреді?","q4.a":"Мата, механизм, өлшеу мен монтаж. Қорытынды сомасы мата мен өлшемге байланысты - өлшеуден кейін есептейміз.",
"q5.q":"Қала сыртына шығасыздар ма?","q5.a":"Иә, Алматы және Алматы облысы бойынша жұмыс істейміз.",

"kn.k":"Тегін өлшеу","kn.h":"Өтінім қалдырыңыз - <em>өлшеуге келеміз</em>","kn.l":"Жұмыс уақытында WhatsApp-та жауап береміз: күн сайын 9:00-22:00.","kn.a":"Терезе алдындағы ашық түсті рулондық перде мен өсімдік",
"z.name":"Аты","z.nameph":"Сізге қалай жүгінуге болады","z.phone":"Телефон","z.what":"Не керек","z.whatph":"3 терезеге рулондық, Алмалы ауданы",
"z.agree":"Өтінім бойынша байланысу үшін дербес деректерімді өңдеуге келісемін.","z.send":"WhatsApp-қа жіберу",
"z.ok":"Рақмет! Дайын хабарламасы бар WhatsApp ашылады - жұмыс уақытында жауап береміз.","z.err":"Атыңызды, телефоныңызды көрсетіп, келісімді растаңыз.",
"z.note":"Түймені басқан соң дайын хабарламасы бар WhatsApp ашылады - ол сіздің нөміріңізден кетеді.",
"c.ph":"Телефон · WhatsApp","c.hr":"Кесте","c.hrv":"9:00-22:00, күн сайын","c.geo":"География","c.geov":"Алматы және Алматы облысы - өлшеуге шығамыз",
"ft.slog":"Сіздің жарығыңыз - сіздің ережеңіз","ft.copy":"© 2026 ASYL.ZHALUZI.KZ · Алматыдағы жалюзи мен рулондық перделер · күн сайын 9:00-22:00",
"bar.call":"Қоңырау"
};

/* готовые тексты WhatsApp: название модели - отдельной строкой */
var WA_TXT = {
ru:{
  hero:"Здравствуйте! Пишу с сайта ASYL.ZHALUZI.KZ. Интересуют жалюзи / рулонные шторы:\n",
  zamer:"Здравствуйте! Хочу записаться на бесплатный замер. Адрес и удобное время: ",
  card:"Здравствуйте! Хочу узнать цену:\n{t}\nРазмеры окна и адрес: ",
  who:"Здравствуйте! Нужны жалюзи / рулонные шторы.\nОбъект: {t}\nАдрес и число окон: ",
  kontakty:"Здравствуйте! Пишу с сайта ASYL.ZHALUZI.KZ. Вопрос: "
},
kk:{
  hero:"Сәлеметсіз бе! ASYL.ZHALUZI.KZ сайтынан жазып отырмын. Жалюзи / рулондық перделер қызықтырады:\n",
  zamer:"Сәлеметсіз бе! Тегін өлшеуге жазылғым келеді. Мекенжай мен ыңғайлы уақыт: ",
  card:"Сәлеметсіз бе! Бағасын білгім келеді:\n{t}\nТерезе өлшемі мен мекенжай: ",
  who:"Сәлеметсіз бе! Жалюзи / рулондық перделер керек.\nНысан: {t}\nМекенжай мен терезе саны: ",
  kontakty:"Сәлеметсіз бе! ASYL.ZHALUZI.KZ сайтынан жазып отырмын. Сұрақ: "
}};

var TICK = ["Рулонные шторы","День-ночь","Блэкаут","Кассетные UNI","Вертикальные жалюзи","Горизонтальные жалюзи","Плиссе","Фотопечать","Бесплатный замер и монтаж"];
var TICK_KZ = ["Рулондық перделер","Күн-түн","Блэкаут","Кассеталық UNI","Тік жалюзи","Көлденең жалюзи","Плиссе","Фотобасып шығару","Тегін өлшеу және монтаж"];

/* ---------------- КОНТАКТЫ ИЗ КОНСТАНТЫ ---------------- */
document.querySelectorAll("[data-tel]").forEach(function(a){ a.href = "tel:" + CONTACT.phone; });
document.querySelectorAll("[data-phone]").forEach(function(el){ el.textContent = CONTACT.phoneView; });

/* ---------------- ПЕРЕВОД ---------------- */
var RU = {};
function snapshot(){
  document.querySelectorAll("[data-i]").forEach(function(el){ if (RU[el.dataset.i] === undefined) RU[el.dataset.i] = el.innerHTML; });
  document.querySelectorAll("[data-i-alt]").forEach(function(el){ RU[el.dataset.iAlt] = el.alt; });
  document.querySelectorAll("[data-i-aria]").forEach(function(el){ RU[el.dataset.iAria] = el.getAttribute("aria-label"); });
  document.querySelectorAll("[data-i-c]").forEach(function(el){ RU[el.dataset.iC] = el.getAttribute("content"); });
  document.querySelectorAll("[data-i-ph]").forEach(function(el){ RU[el.dataset.iPh] = el.getAttribute("placeholder"); });
  var t = document.querySelector("title[data-i-t]"); if (t) RU[t.dataset.iT] = t.textContent;
}
function pick(k, kk){ return (kk && KZ[k] !== undefined) ? KZ[k] : RU[k]; }
function curLang(){ return root.lang === "kk" ? "kk" : "ru"; }
function T(k){ return pick(k, curLang() === "kk") || ""; }
function plain(html){ var d = document.createElement("div"); d.innerHTML = html; return d.textContent; }
function fmt(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
function priceText(p, kk){ return kk ? (fmt(p) + " ₸/м²-ден") : ("от " + fmt(p) + " ₸/м²"); }

/* цены «от» из одного объекта - в карточки, плиты и лид героя */
function fillPrices(){
  var kk = curLang() === "kk", min = Infinity;
  Object.keys(PRICES).forEach(function(k){ if (PRICES[k].p < min) min = PRICES[k].p; });
  document.querySelectorAll("[data-price]").forEach(function(el){
    var m = PRICES[el.dataset.price]; if (m) el.textContent = priceText(m.p, kk);
  });
  document.querySelectorAll("[data-price-min]").forEach(function(el){ el.textContent = kk ? (fmt(min) + " ₸/м²-ден") : (fmt(min) + " ₸/м²"); });
}

/* текст заявки собирается из названия модели на текущем языке */
function setWaLinks(){
  var L = curLang();
  document.querySelectorAll("[data-wa]").forEach(function(a){
    var key = a.dataset.wa, t = WA_TXT[L][key] || WA_TXT[L].hero;
    if (t.indexOf("{t}") > -1) t = t.replace("{t}", a.dataset.waTitle ? plain(T(a.dataset.waTitle)).trim() : "");
    a.href = "https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent(t);
    a.target = "_blank"; a.rel = "noopener";
  });
}

function applyLang(lang){
  var kk = lang === "kk";
  root.setAttribute("lang", kk ? "kk" : "ru");
  document.querySelectorAll("[data-i]").forEach(function(el){
    var v = pick(el.dataset.i, kk); if (v !== undefined) el.innerHTML = v;
  });
  document.querySelectorAll("[data-i-alt]").forEach(function(el){
    var v = pick(el.dataset.iAlt, kk); if (v !== undefined) el.alt = v;
  });
  document.querySelectorAll("[data-i-aria]").forEach(function(el){
    var v = pick(el.dataset.iAria, kk); if (v !== undefined) el.setAttribute("aria-label", v);
  });
  document.querySelectorAll("[data-i-c]").forEach(function(el){
    var v = pick(el.dataset.iC, kk); if (v !== undefined) el.setAttribute("content", v);
  });
  document.querySelectorAll("[data-i-ph]").forEach(function(el){
    var v = pick(el.dataset.iPh, kk); if (v !== undefined) el.setAttribute("placeholder", v);
  });
  var t = document.querySelector("title[data-i-t]");
  if (t) { var tv = pick(t.dataset.iT, kk); if (tv !== undefined) t.textContent = tv; }
  var og = document.querySelector('meta[property="og:locale"]');
  if (og) og.setAttribute("content", kk ? "kk_KZ" : "ru_RU");
  document.querySelectorAll(".lang button").forEach(function(b){
    var on = b.getAttribute("data-lang") === (kk ? "kk" : "ru");
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  try { localStorage.setItem("az-lang", kk ? "kk" : "ru"); } catch(e){}
  fillPrices();
  setWaLinks();
  fillTicker();
  calcOptions();
  calcRun();
  requestAnimationFrame(function(){ fitText(); measureHero(); update(); });
}
/* ?lang=kk в URL сильнее localStorage: русское объявление не должно открыть казахскую версию */
function initLang(){
  var url = new URLSearchParams(location.search).get("lang");
  var saved = null;
  try { saved = localStorage.getItem("az-lang"); } catch(e){}
  var lang = (url === "kk" || url === "ru") ? url : (saved === "kk" ? "kk" : "ru");
  applyLang(lang);
}
document.querySelectorAll(".lang button").forEach(function(b){
  b.addEventListener("click", function(){ applyLang(b.getAttribute("data-lang")); });
});

/* дисплейные строки в одну строку: казахский длиннее - ужимаем, пока не влезет */
function fitText(){
  document.querySelectorAll(".h1 span").forEach(function(el){
    el.style.fontSize = "";
    if (getComputedStyle(el).whiteSpace !== "nowrap") return;
    var box = el.parentElement.clientWidth;
    if (!box) return;
    var size = parseFloat(getComputedStyle(el).fontSize), base = size;
    while (el.scrollWidth > box + 1 && size > base * 0.5) {
      size *= 0.95;
      el.style.fontSize = size + "px";
    }
  });
}

/* ---------------- БЕГУЩАЯ ЛЕНТА ----------------
   Копий столько, чтобы дорожка была шире двух экранов; шаг цикла - одна копия. */
function fillTicker(){
  var el = document.getElementById("ticker"); if (!el) return;
  var list = curLang() === "kk" ? TICK_KZ : TICK;
  var one = list.map(function(t){ return "<b>" + t + "</b>"; }).join("");
  el.innerHTML = one;
  var w = el.scrollWidth || 1000;
  var need = Math.max(2, Math.ceil((innerWidth * 2) / w) + 1);
  var html = "";
  for (var i = 0; i < need; i++) html += one;
  el.innerHTML = html;
  el.style.setProperty("--tkw", w + "px");
  el.style.setProperty("--tkd", Math.max(18, w / 50) + "s");
}
var rsTimer;
addEventListener("resize", function(){
  measureHero(); update();
  clearTimeout(rsTimer);
  rsTimer = setTimeout(function(){ fillTicker(); fitText(); measureHero(); update(); lanes.forEach(function(l){ l.state(); }); }, 200);
});
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fillTicker(); fitText(); measureHero(); update(); });

/* ---------------- МЕНЮ ---------------- */
var burger = document.getElementById("burger");
var mnav = document.getElementById("mnav");
function closeMenu(){
  document.body.classList.remove("menu-open");
  if (burger) burger.setAttribute("aria-expanded", "false");
}
if (burger) burger.addEventListener("click", function(){
  var open = document.body.classList.toggle("menu-open");
  burger.setAttribute("aria-expanded", open ? "true" : "false");
});
if (mnav) mnav.addEventListener("click", function(e){ if (e.target.closest("a")) closeMenu(); });
addEventListener("keydown", function(e){ if (e.key === "Escape") closeMenu(); });

/* ---------------- ЯКОРЯ ---------------- */
var HH = function(){ return parseFloat(getComputedStyle(root).getPropertyValue("--hh")) || 70; };
document.addEventListener("click", function(e){
  var a = e.target.closest('a[href^="#"]'); if (!a) return;
  var id = a.getAttribute("href").slice(1); if (!id) return;
  var t = document.getElementById(id); if (!t) return;
  e.preventDefault();
  closeMenu();
  var top = t.getBoundingClientRect().top + scrollY - (t.classList.contains("pw") ? 0 : HH() + 10);
  scrollTo({ top: Math.max(0, top), behavior: RED ? "auto" : "smooth" });
  try { history.pushState(null, "", "#" + id); } catch(err){}
});

/* ---------------- ШАПКА ---------------- */
var hdr = document.getElementById("hdr");
function hdrState(){ if (hdr) hdr.classList.toggle("solid", scrollY > 40); }

/* ---------------- ПЛИТЫ И ШТОРА ----------------
   Один слушатель scroll через rAF. На каждую обёртку .pw пишем
   --enter / --exit / --stay; на герое --cov (штора: 1 опущена … 0 поднята),
   на плитах --open (кадр открывается по въезду). */
function clamp(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
function easeInOut(t){ return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function easeOut(t){ return 1 - Math.pow(1 - t, 3); }
var pws = [].slice.call(document.querySelectorAll(".pw"));
var heroPw = document.getElementById("top");
var hero = document.getElementById("hero");
var heroTxt = document.querySelector(".hero-txt");
var bar = document.getElementById("bar");
var cord = document.getElementById("cord");
var kont = document.getElementById("kontakty");
var cov0 = .56, introK = 1, introDone = true;

/* сколько полотна нужно опустить, чтобы текст встал над утяжелителем и не ушёл под вал */
function measureHero(){
  if (!hero || !heroTxt) return;
  var zone = hero.clientHeight - HH();
  if (zone < 100) return;
  var need = heroTxt.offsetHeight + 46 + 48;
  cov0 = Math.min(.86, Math.max(.5, need / zone));
  if (RED) heroPw.style.setProperty("--cov", cov0.toFixed(3));
}
/* ?cov=0.3 / ?open=0.5 в URL - только для проверки промежуточных фаз скриншотом (checks/) */
var DBG = new URLSearchParams(location.search);
var dbgCov = parseFloat(DBG.get("cov")), dbgOpen = parseFloat(DBG.get("open"));
function heroCov(stay){
  var c;
  if (!isNaN(dbgCov)) c = dbgCov;
  else if (!introDone) c = 1 - (1 - cov0) * easeOut(introK);
  else c = cov0 * (1 - easeInOut(clamp(stay / .85)));
  heroPw.style.setProperty("--cov", c.toFixed(4));
}
function update(){
  var H = innerHeight || root.clientHeight;
  pws.forEach(function(pw){
    var r = pw.getBoundingClientRect();
    var enter = clamp(1 - r.top / H);
    var exit  = clamp(1 - r.bottom / H);
    var stay  = r.height > H + 1 ? clamp(-r.top / (r.height - H)) : enter;
    pw.style.setProperty("--enter", enter.toFixed(3));
    pw.style.setProperty("--exit",  exit.toFixed(3));
    pw.style.setProperty("--stay",  stay.toFixed(3));
    pw.classList.toggle("gone", exit >= 1);
    pw.classList.toggle("on", enter > 0.6);
    if (pw === heroPw) heroCov(stay);
    else pw.style.setProperty("--open", (!isNaN(dbgOpen) ? dbgOpen : easeOut(clamp((enter - .3) / .62))).toFixed(3));
  });
  hdrState();
  /* липкая панель: после 55 % первого экрана, прячется на контактах */
  var onKont = kont && kont.getBoundingClientRect().top < H * 0.6;
  if (bar) bar.classList.toggle("show", scrollY > H * 0.55 && !onKont);
  /* шнур-индикатор: бусина едет по шнуру вместе с прокруткой */
  if (cord) {
    var max = root.scrollHeight - H;
    root.style.setProperty("--sp", (max > 0 ? clamp(scrollY / max) : 0).toFixed(4));
    cord.classList.toggle("show", scrollY > H * 0.4 && !onKont);
  }
}
if (RED) {
  root.classList.add("no-plate");
  root.classList.add("no-intro");
  if (hero) hero.classList.add("on");
  measureHero();
  addEventListener("scroll", function(){ hdrState(); if (bar) bar.classList.toggle("show", scrollY > innerHeight * 0.55); }, {passive:true});
  hdrState();
} else {
  var tick = false;
  addEventListener("scroll", function(){
    if (tick) return; tick = true;
    requestAnimationFrame(function(){ tick = false; update(); });
  }, {passive:true});
  addEventListener("load", function(){ measureHero(); update(); });
  measureHero();
  /* интро 1250 мс: штора поднимается из полностью опущенного положения и выносит текст на место.
     Пропускаем при хэше / прокрутке - человек из рекламы сразу видит собранный экран. */
  var skip = location.hash || scrollY > 80;
  if (skip) {
    root.classList.add("no-intro");
    if (hero) hero.classList.add("on");
    update();
  } else {
    introK = 0; introDone = false; update();
    var t0 = null;
    var step = function(ts){
      if (introDone) return;
      if (t0 === null) t0 = ts;
      var p = clamp((ts - t0) / 1250);
      introK = p;
      if (p > .35 && hero) hero.classList.add("on");
      update();
      if (p < 1) requestAnimationFrame(step);
      else { introDone = true; update(); }
    };
    requestAnimationFrame(function(){ requestAnimationFrame(step); });
    /* страховка: если rAF не тикает (фоновая вкладка), собрать экран по таймеру */
    setTimeout(function(){ if (hero) hero.classList.add("on"); }, 700);
    setTimeout(function(){ if (!introDone) { introDone = true; introK = 1; update(); } }, 2400);
  }
}
/* страховка: пересчитать плиты после догрузки шрифтов и картинок (и под виртуальным временем headless) */
[1500, 3000, 5000].forEach(function(ms){ setTimeout(function(){ measureHero(); update(); }, ms); });
window.plateSync = function(){ introDone = true; introK = 1; if (hero) hero.classList.add("on"); measureHero(); update(); };
addEventListener("hashchange", function(){ root.classList.add("no-intro"); });

/* ---------------- ПОЯВЛЕНИЕ В КАТАЛОЖНЫХ СЕКЦИЯХ ---------------- */
if (HAS_IO) {
  if (!RED) root.classList.add("js");
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:"0px 0px -6% 0px"});
  document.querySelectorAll(".rv").forEach(function(el){ io.observe(el); });
  setTimeout(function(){ document.querySelectorAll(".rv:not(.in)").forEach(function(el){
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in");
  }); }, 1500);
} else {
  document.querySelectorAll(".rv").forEach(function(el){ el.classList.add("in"); });
}

/* ---------------- ЛЕНТЫ С КНОПКАМИ ----------------
   Шаг - ровно одна карточка (ширина + gap из стилей), крайняя кнопка гаснет,
   обе прячутся, если всё влезло. Ленте tabindex=0 - листается стрелками. */
var lanes = [];
document.querySelectorAll(".lane-w").forEach(function(w){
  var lane = w.querySelector(".lane"), prev = w.querySelector(".lbtn.prev"), next = w.querySelector(".lbtn.next");
  if (!lane || !prev || !next) return;
  function stepW(){
    var c = lane.firstElementChild; if (!c) return 300;
    var cs = getComputedStyle(lane);
    var gap = parseFloat(cs.columnGap || cs.gap) || 14;
    return c.getBoundingClientRect().width + gap;
  }
  function state(){
    var max = lane.scrollWidth - lane.clientWidth;
    var none = max <= 1;
    prev.hidden = none; next.hidden = none;
    prev.disabled = lane.scrollLeft <= 1;
    next.disabled = lane.scrollLeft >= max - 1;
  }
  prev.addEventListener("click", function(){ lane.scrollBy({left: -stepW(), behavior: RED ? "auto" : "smooth"}); });
  next.addEventListener("click", function(){ lane.scrollBy({left: stepW(), behavior: RED ? "auto" : "smooth"}); });
  lane.addEventListener("scroll", state, {passive:true});
  lane.addEventListener("keydown", function(e){
    if (e.key === "ArrowRight") { e.preventDefault(); next.click(); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); prev.click(); }
  });
  state();
  addEventListener("load", state);
  lanes.push({state: state});
});

/* ---------------- КАЛЬКУЛЯТОР ----------------
   Площадь окон × цена «от» за м² выбранной модели. Только ориентир. */
var calc = document.getElementById("calc"), calcModel = document.getElementById("calc-model");
var calcSum = document.getElementById("calc-sum"), calcSub = document.getElementById("calc-sub");
var calcState = null;
function calcOptions(){
  if (!calcModel) return;
  var kk = curLang() === "kk", cur = calcModel.value;
  calcModel.innerHTML = "";
  Object.keys(PRICES).forEach(function(k){
    var o = document.createElement("option");
    o.value = k; o.textContent = PRICES[k][kk ? "kk" : "ru"] + " · " + priceText(PRICES[k].p, kk);
    calcModel.appendChild(o);
  });
  if (cur && PRICES[cur]) calcModel.value = cur;
}
function calcRun(){
  if (!calc) return;
  var kk = curLang() === "kk";
  var m = PRICES[calcModel.value] || PRICES.rulonnye;
  var w = Math.min(400, Math.max(30, parseFloat(calc.w.value) || 0));
  var h = Math.min(400, Math.max(30, parseFloat(calc.h.value) || 0));
  var n = Math.min(50, Math.max(1, parseInt(calc.n.value, 10) || 1));
  var area = Math.max(.5, w * h / 10000) * n;                 /* минимум 0,5 м² на окно */
  var sum = Math.ceil(area * m.p / 100) * 100;
  calcState = {m: m, w: w, h: h, n: n, area: area, sum: sum};
  calcSum.textContent = kk ? (fmt(sum) + " ₸-ден") : ("от " + fmt(sum) + " ₸");
  var okn = kk ? " терезе" : (n === 1 ? " окно" : (n < 5 ? " окна" : " окон"));
  calcSub.textContent = (kk ? m.kk : m.ru) + " · " + n + okn + " · " + area.toFixed(1).replace(".", ",") + " м²";
}
if (calc) {
  calc.addEventListener("input", calcRun);
  calc.addEventListener("change", calcRun);
  calc.addEventListener("submit", function(e){
    e.preventDefault();
    calcRun();
    var s = calcState, kk = curLang() === "kk";
    var t = kk
      ? "Сәлеметсіз бе! Сайттағы калькулятордан есеп:\n" + s.m.kk + "\nТерезе: " + s.n + " дана, " + s.w + "×" + s.h + " см (" + s.area.toFixed(1) + " м²)\nШамамен: " + fmt(s.sum) + " ₸-ден\nТегін өлшеуге жазылғым келеді."
      : "Здравствуйте! Расчёт из калькулятора на сайте:\n" + s.m.ru + "\nОкна: " + s.n + " шт, " + s.w + "×" + s.h + " см (" + s.area.toFixed(1) + " м²)\nОриентировочно: от " + fmt(s.sum) + " ₸\nХочу записаться на бесплатный замер.";
    conv("lead");
    window.open("https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent(t), "_blank", "noopener");
  });
}

/* ---------------- ФОРМА → WhatsApp ---------------- */
var form = document.getElementById("form");
if (form) form.addEventListener("submit", function(e){
  e.preventDefault();
  var ok = document.getElementById("fmok"), err = document.getElementById("fmerr");
  if (form.company && form.company.value) return;          /* honeypot */
  var name = form.name.value.trim(), phone = form.phone.value.trim(), msg = form.msg.value.trim();
  if (!name || phone.replace(/\D/g, "").length < 10 || !form.agree.checked) { err.hidden = false; ok.hidden = true; return; }
  err.hidden = true;
  var L = curLang();
  var t = (L === "kk"
    ? "Сәлеметсіз бе! ASYL.ZHALUZI.KZ сайтынан тегін өлшеуге өтінім.\nАты: " + name + "\nТелефон: " + phone + (msg ? "\nНе керек: " + msg : "")
    : "Здравствуйте! Заявка на бесплатный замер с сайта ASYL.ZHALUZI.KZ.\nИмя: " + name + "\nТелефон: " + phone + (msg ? "\nЧто нужно: " + msg : ""));
  ok.hidden = false;
  conv("lead");
  window.open("https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent(t), "_blank", "noopener");
});

/* ---------------- СТАРТ ---------------- */
snapshot();
initLang();
fillTicker();
fitText();
hdrState();
})();
