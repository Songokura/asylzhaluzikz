/* ============================================================
   ASYL.ZHALUZI.KZ - скрипт страницы.
   Плиты и рулонная штора (герой: интро поднимает полотно с текстом,
   дальше штора сматывается по скроллу; плиты: кадр открывается по --open) ·
   шнур-индикатор прокрутки · перевод RU/KZ (словарь kk - assets/lang/kk.js по клику,
   ?lang= сильнее localStorage) ·
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
/* Цены «от» за м² - от клиента 15.09.2026. Из этого же объекта читает калькулятор.
   Казахские названия моделей - в assets/lang/kk.js (names). */
var PRICES = {
  "mini":            { ru:"Рулонные роллшторы в системе Mini", p: 4500 },
  "klassicheskie":   { ru:"Классические роллшторы",            p: 6000 },
  "den-noch":        { ru:"Роллшторы День-Ночь",               p: 9000 },
  "blackout":        { ru:"Роллшторы Блэкаут",                 p: 9000 },
  "kassetnye":       { ru:"Кассетные роллшторы",               p:16500 },
  "vertikalnye":     { ru:"Вертикальные жалюзи",               p: 4500 },
  "gorizontalnye":   { ru:"Горизонтальные жалюзи",             p: 8500 },
  "plisse":          { ru:"Жалюзи Плиссе",                     p: 9000 },
  "dikey-tyul":      { ru:"Дикей тюль",                        p: 9500 },
  "moskitnye-setki": { ru:"Москитные сетки Плиссе",            p:17500 }
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
   Разметка русская. Казахский текст живёт только в assets/lang/kk.js и грузится
   по кнопке KZ, по ?lang=kk или по сохранённому выбору: проверка Google Ads видит
   русский сайт. Ключа нет - строка остаётся русской. */
var KZ = null;          /* заполняется из assets/lang/kk.js */
var KK_SRC = (function(){
  var cs = document.currentScript, m = cs && cs.src.match(/[?&]v=([^&]+)/);
  return "assets/lang/kk.js" + (m ? "?v=" + m[1] : "");
})();
function loadKK(done){
  if (window.SITE_KK) { KZ = window.SITE_KK.dict; return done(true); }
  var sc = document.createElement("script");
  sc.src = KK_SRC;
  sc.onload = function(){ KZ = window.SITE_KK ? window.SITE_KK.dict : null; done(!!KZ); };
  sc.onerror = function(){ done(false); };
  document.head.appendChild(sc);
}
function KKS(){ return window.SITE_KK || {}; }

/* готовые тексты WhatsApp: название модели - отдельной строкой */
var WA_TXT = {
ru:{
  hero:"Здравствуйте! Пишу с сайта ASYL.ZHALUZI.KZ. Интересуют жалюзи / рулонные шторы:\n",
  zamer:"Здравствуйте! Хочу записаться на бесплатный замер. Адрес и удобное время: ",
  card:"Здравствуйте! Хочу узнать цену:\n{t}\nРазмеры окна и адрес: ",
  who:"Здравствуйте! Нужны жалюзи / рулонные шторы.\nОбъект: {t}\nАдрес и число окон: ",
  kontakty:"Здравствуйте! Пишу с сайта ASYL.ZHALUZI.KZ. Вопрос: "
}
};

var TICK = ["Роллшторы Mini","Классические роллшторы","День-Ночь","Блэкаут","Кассетные роллшторы","Вертикальные жалюзи","Горизонтальные жалюзи","Плиссе","Дикей тюль","Москитные сетки плиссе","Бесплатный замер и монтаж"];

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
function pick(k, kk){ return (kk && KZ && KZ[k] !== undefined) ? KZ[k] : RU[k]; }
function curLang(){ return root.lang === "kk" ? "kk" : "ru"; }
function T(k){ return pick(k, curLang() === "kk") || ""; }
function plain(html){ var d = document.createElement("div"); d.innerHTML = html; return d.textContent; }
function fmt(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
function priceText(p, kk){ return kk ? (fmt(p) + KKS().from) : ("от " + fmt(p) + " ₸/м²"); }

/* цены «от» из одного объекта - в карточки, плиты и лид героя */
function fillPrices(){
  var kk = curLang() === "kk", min = Infinity;
  Object.keys(PRICES).forEach(function(k){ if (PRICES[k].p < min) min = PRICES[k].p; });
  document.querySelectorAll("[data-price]").forEach(function(el){
    var m = PRICES[el.dataset.price]; if (m) el.textContent = priceText(m.p, kk);
  });
  document.querySelectorAll("[data-price-min]").forEach(function(el){ el.textContent = kk ? (fmt(min) + KKS().from) : (fmt(min) + " ₸/м²"); });
}

/* текст заявки собирается из названия модели на текущем языке */
function setWaLinks(){
  var L = curLang();
  document.querySelectorAll("[data-wa]").forEach(function(a){
    var W = L === "kk" ? KKS().wa : WA_TXT.ru;
    var key = a.dataset.wa, t = W[key] || W.hero;
    if (t.indexOf("{t}") > -1) t = t.replace("{t}", a.dataset.waTitle ? plain(T(a.dataset.waTitle)).trim() : "");
    a.href = "https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent(t);
    a.target = "_blank"; a.rel = "noopener";
  });
}

function applyLang(lang){
  /* казахский словарь - отдельным файлом, только по явному выбору человека */
  if (lang === "kk" && !KZ) { loadKK(function(ok){ applyLang(ok ? "kk" : "ru"); }); return; }
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
  var list = curLang() === "kk" ? KKS().tick : TICK;
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
function mName(k, kk){ return (kk && KKS().names && KKS().names[k]) || PRICES[k].ru; }
function calcOptions(){
  if (!calcModel) return;
  var kk = curLang() === "kk", cur = calcModel.value;
  calcModel.innerHTML = "";
  Object.keys(PRICES).forEach(function(k){
    var o = document.createElement("option");
    o.value = k; o.textContent = mName(k, kk) + " · " + priceText(PRICES[k].p, kk);
    calcModel.appendChild(o);
  });
  if (cur && PRICES[cur]) calcModel.value = cur;
}
function calcRun(){
  if (!calc) return;
  var kk = curLang() === "kk";
  var mk = PRICES[calcModel.value] ? calcModel.value : "klassicheskie", m = PRICES[mk];
  var w = Math.min(400, Math.max(30, parseFloat(calc.w.value) || 0));
  var h = Math.min(400, Math.max(30, parseFloat(calc.h.value) || 0));
  var n = Math.min(50, Math.max(1, parseInt(calc.n.value, 10) || 1));
  var area = Math.max(.5, w * h / 10000) * n;                 /* минимум 0,5 м² на окно */
  var sum = Math.ceil(area * m.p / 100) * 100;
  calcState = {m: m, name: mName(mk, kk), w: w, h: h, n: n, area: area, sum: sum};
  calcSum.textContent = kk ? (fmt(sum) + KKS().sumFrom) : ("от " + fmt(sum) + " ₸");
  var okn = kk ? KKS().win : (n === 1 ? " окно" : (n < 5 ? " окна" : " окон"));
  calcSub.textContent = calcState.name + " · " + n + okn + " · " + area.toFixed(1).replace(".", ",") + " м²";
}
if (calc) {
  calc.addEventListener("input", calcRun);
  calc.addEventListener("change", calcRun);
  calc.addEventListener("submit", function(e){
    e.preventDefault();
    calcRun();
    var s = calcState, kk = curLang() === "kk";
    var t = kk
      ? KKS().calcMsg(s, fmt)
      : "Здравствуйте! Расчёт из калькулятора на сайте:\n" + s.name + "\nОкна: " + s.n + " шт, " + s.w + "×" + s.h + " см (" + s.area.toFixed(1) + " м²)\nОриентировочно: от " + fmt(s.sum) + " ₸\nХочу записаться на бесплатный замер.";
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
    ? KKS().formMsg(name, phone, msg)
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
