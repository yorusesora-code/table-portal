/* Table portal — 共通スクリプト（依存なし） */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var yen = function (n) { return "¥" + Math.round(n).toLocaleString("ja-JP"); };
  var CFG = window.TABLE_CONFIG || {};

  function track(name, params) {
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event: name }, params || {})); } catch (e) {}
  }

  /* ---- header：スクロールエッジ／モバイル追従CTA ---- */
  var hd = $("[data-hd]"), mcta = $("[data-mcta]");
  var onScroll = function () {
    var y = window.scrollY;
    if (hd) hd.classList.toggle("is-scrolled", y > 4);
    if (mcta) {
      var nearEnd = window.innerHeight + y > document.documentElement.scrollHeight - 420;
      var hide = document.body.classList.contains("page-contact");
      mcta.classList.toggle("is-on", y > 520 && !nearEnd && !hide);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- mobile sheet ---- */
  var burger = $("[data-burger]"), sheet = $("[data-sheet]");
  function closeSheet() {
    if (!sheet || sheet.hidden) return;
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
    if (reduce) { sheet.hidden = true; return; }
    sheet.classList.add("is-closing");
    sheet.addEventListener("animationend", function h() { sheet.hidden = true; sheet.classList.remove("is-closing"); sheet.removeEventListener("animationend", h); });
  }
  if (burger && sheet) {
    burger.addEventListener("click", function () {
      if (sheet.hidden) { sheet.hidden = false; sheet.classList.remove("is-closing"); burger.setAttribute("aria-expanded", "true"); document.body.classList.add("is-locked"); }
      else closeSheet();
    });
    sheet.addEventListener("click", function (e) { if (e.target.closest("a")) closeSheet(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1080) closeSheet(); });
  }

  /* ---- reveal（一度だけ） ---- */
  var rvs = $$(".rv");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    rvs.forEach(function (el) { io.observe(el); });
  } else rvs.forEach(function (el) { el.classList.add("in"); });

  /* ---- FAQ：開閉を高さ補間でなめらかに ---- */
  $$(".faq__i").forEach(function (d) {
    if (d.open) d.classList.add("is-open");
    d.querySelector("summary").addEventListener("click", function (e) {
      e.preventDefault();
      if (d.open) {
        d.classList.remove("is-open");
        if (reduce) { d.open = false; return; }
        setTimeout(function () { if (!d.classList.contains("is-open")) d.open = false; }, 320);
      } else {
        d.open = true;
        requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add("is-open"); }); });
        track("faq_open", { q: d.querySelector(".faq__t").textContent });
      }
    });
  });

  /* ---- 制作事例フィルタ（URLに状態を残す） ---- */
  var wf = $("[data-works-filter]"), wl = $("[data-works-list]");
  if (wf && wl) {
    var cards = $$(".wcard", wl), countEl = $("[data-count]", wf), emptyEl = $("[data-empty]");
    var state = { genre: [], plan: [], service: [], purpose: [] };
    var params = new URLSearchParams(location.search);
    Object.keys(state).forEach(function (k) { var v = params.get(k); if (v) state[k] = v.split(","); });
    var apply = function (animate) {
      var n = 0;
      cards.forEach(function (c) {
        var ok = Object.keys(state).every(function (k) {
          if (!state[k].length) return true;
          var have = (c.getAttribute("data-" + k) || "").split(" ");
          return state[k].some(function (v) { return have.indexOf(v) > -1; });
        });
        c.classList.toggle("is-out", !ok);
        c.classList.remove("is-in");
        if (ok) { c.style.setProperty("--i", n); n++; if (animate && !reduce) { void c.offsetWidth; c.classList.add("is-in"); } }
      });
      countEl.textContent = n;
      if (emptyEl) emptyEl.hidden = n > 0;
      $$(".chip[data-f]", wf).forEach(function (b) {
        b.setAttribute("aria-pressed", state[b.dataset.f].indexOf(b.dataset.v) > -1 ? "true" : "false");
      });
      var q = new URLSearchParams();
      Object.keys(state).forEach(function (k) { if (state[k].length) q.set(k, state[k].join(",")); });
      var qs = q.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
    };
    wf.addEventListener("click", function (e) {
      var b = e.target.closest(".chip[data-f]");
      if (b) {
        var arr = state[b.dataset.f], i = arr.indexOf(b.dataset.v);
        if (i > -1) arr.splice(i, 1); else arr.push(b.dataset.v);
        apply(true); track("works_filter", { f: b.dataset.f, v: b.dataset.v });
      }
      if (e.target.closest("[data-reset]")) { Object.keys(state).forEach(function (k) { state[k] = []; }); apply(true); }
    });
    apply(false);
  }

  /* ---- Before/After（スマホ時のタブ） ---- */
  $$("[data-ba]").forEach(function (ba) {
    var tabs = $$("[data-ba-tab]", ba), figs = { before: $(".ba__f--before", ba), after: $(".ba__f--after", ba) };
    var set = function (k) {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t.dataset.baTab === k ? "true" : "false"); });
      Object.keys(figs).forEach(function (f) { figs[f].classList.toggle("is-on", f === k); });
    };
    tabs.forEach(function (t) { t.addEventListener("click", function () { set(t.dataset.baTab); }); });
    set("after");
  });

  /* ---- 見積りシミュレーター ---- */
  var est = $("[data-estimator]");
  if (est) {
    var o = function (k) { return $('[data-o="' + k + '"]', est); };
    var last = 0;
    var calc = function () {
      var plan = $('input[name="est-plan"]:checked', est);
      var inc = plan.dataset.inc;
      var opt = 0, names = [], incNames = [];
      $$(".chk", est).forEach(function (lab) {
        var cb = $("input", lab), idx = cb.dataset.incIdx;
        var included = idx !== undefined && inc.charAt(+idx) === "1";
        lab.classList.toggle("is-included", included);
        cb.disabled = included;
        var price = $(".chk__p", lab);
        if (!price.dataset.orig) price.dataset.orig = price.textContent;
        price.textContent = included ? "プランに含む" : price.dataset.orig;
        if (included) incNames.push(cb.dataset.name);
        else if (cb.checked) { opt += +cb.value; names.push(cb.dataset.name); }
      });
      var sub = +plan.dataset.price + opt;
      var disc = Math.min(sub, +$('input[name="est-camp"]:checked', est).value);
      var total = sub - disc;
      o("plan").textContent = yen(+plan.dataset.price);
      o("opt").textContent = yen(opt);
      o("disc").textContent = disc ? "−" + yen(disc) : "¥0";
      o("total").textContent = yen(total);
      o("tax").textContent = total ? "税込 " + yen(total * 1.1) : "お支払いは不要です";
      o("incl").hidden = !incNames.length;
      o("incl").textContent = incNames.length ? "プランに含まれるもの：" + incNames.join("・") : "";
      if (total !== last && !reduce) { var t = o("total"); t.classList.remove("bump"); void t.offsetWidth; t.classList.add("bump"); }
      last = total;
      var q = new URLSearchParams({ plan: plan.value });
      if (names.length) q.set("options", names.join("|"));
      if (disc) q.set("delivery", disc === 100000 ? "2" : "1");
      o("cta").href = "/contact/?" + q.toString();
    };
    est.addEventListener("change", function (e) {
      var t = e.target;
      if (t.dataset.exclusive && t.checked) $$('[data-exclusive="' + t.dataset.exclusive + '"]', est).forEach(function (x) { if (x !== t) x.checked = false; });
      calc();
    });
    calc();
  }

  /* ---- 節約シミュレーター（Table Shift LP から移植） ---- */
  var sim = $("[data-simulator]");
  if (sim) {
    var s = function (k) { return $('[data-s="' + k + '"]', sim); };
    var elFee = $("#sim-fee", sim), elYears = $("#sim-years", sim);
    var horizon = 5;
    var planFor = function (m) {
      if (m <= 20000) return { name: "スタンダード", reason: "月1〜2万円帯の、同等のリニューアルに" };
      if (m <= 40000) return { name: "アップグレード", reason: "月3〜4万円帯の、デザイン刷新＋集客強化に" };
      return { name: "プレミアム", reason: "月5万円以上・観光地や多店舗の本格集客に" };
    };
    var setFill = function (el) { el.style.setProperty("--pct", ((el.value - el.min) / (el.max - el.min) * 100) + "%"); };
    var animateNum = function (el, to) {
      if (reduce) { el.textContent = yen(to); return; }
      var from = parseInt((el.textContent || "0").replace(/[^0-9]/g, ""), 10) || 0, start = null;
      var frame = function (ts) { if (!start) start = ts; var p = Math.min((ts - start) / 500, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = yen(from + (to - from) * e); if (p < 1) requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
    };
    var update = function (anim) {
      var m = +elFee.value, yrs = +elYears.value, H = horizon;
      setFill(elFee); setFill(elYears);
      s("feeText").textContent = yen(m);
      s("yearsText").textContent = yrs >= 20 ? "20年+" : yrs + "年";
      var p = planFor(m), keep = m * 12 * H, sunk = m * 12 * yrs;
      s("hLabel").textContent = H + "年"; s("hN").textContent = H + "年";
      s("dayWaste").textContent = "1日あたり" + yen(m / 30);
      s("sunkYears").textContent = yrs >= 20 ? "20年以上" : yrs + "年";
      s("planName").textContent = p.name;
      s("planReason").textContent = p.reason;
      s("barKeep").style.width = "100%";
      ["keep", "barKeepVal", "sunk", "perMonth"].forEach(function (k, i) {
        var v = [keep, keep, sunk, m][i];
        if (anim) animateNum(s(k), v); else s(k).textContent = yen(v);
      });
    };
    elFee.addEventListener("input", function () { update(true); });
    elYears.addEventListener("input", function () { update(true); });
    $$(".simx-toggle", sim).forEach(function (g) {
      g.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        $$("button", g).forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        if (b.dataset.h) horizon = +b.dataset.h;
        update(true);
      });
    });
    update(false);
    if ("IntersectionObserver" in window && !reduce) {
      ["keep", "sunk", "barKeepVal", "perMonth"].forEach(function (k) { s(k).textContent = "¥0"; });
      s("barKeep").style.width = "0";
      var sio = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { update(true); sio.disconnect(); track("sim_view"); }
      }, { threshold: .3 });
      sio.observe(sim);
    }
  }

  /* ---- お問い合わせフォーム ---- */
  var form = $("[data-contact-form]");
  if (form) {
    var p2 = new URLSearchParams(location.search);
    var setRadio = function (name, val) { var r = form.querySelector('input[name="' + name + '"][value="' + val + '"]'); if (r) r.checked = true; };
    if (p2.get("service")) setRadio("hp", p2.get("service") === "shift" ? "old" : "none");
    if (p2.get("plan")) setRadio("plan", p2.get("plan"));
    if (p2.get("delivery")) setRadio("delivery", p2.get("delivery") === "2" ? "both" : "one");
    var notes = [];
    if (p2.get("options")) notes.push("【見積りで選んだオプション】" + p2.get("options").split("|").join("、"));
    if (p2.get("ref")) notes.push("【見ていた事例】" + p2.get("ref"));
    if (p2.get("topic") === "diagnosis") notes.push("【Table Shift 無料診断を希望】");
    if (p2.get("topic") === "opening") notes.push("【開業準備の集客（HP・デリバリー）の相談】");
    if (p2.get("topic") === "instagram") notes.push("【Instagramと合わせたHPの相談】");
    if (p2.get("topic") === "ubereats") notes.push("【Uber Eats 新規出店の相談（当社経由の出店特典を希望）】");
    if (notes.length) form.message.value = notes.join("\n") + "\n";
    // 代理店コード：?agent=XXXX で自動入力（代理店が自分のリンクを配布できる）
    var agentBox = $("[data-agent-box]", form), agentCode = form.agent_code;
    var agentFromUrl = p2.get("agent") || (function () { try { return sessionStorage.getItem("table_agent"); } catch (e) { return null; } })();
    var linkAgent = function () { agentBox.classList.toggle("is-linked", /^[A-Za-z0-9-]{4,12}$/.test(agentCode.value.trim())); };
    if (agentFromUrl) { agentCode.value = agentFromUrl; form.via_agent.checked = true; }
    agentCode.addEventListener("input", function () { if (agentCode.value) form.via_agent.checked = true; linkAgent(); });
    linkAgent();

    var validate = function () {
      var ok = true;
      $$("[data-req]", form).forEach(function (row) {
        var inputs = $$("input,select,textarea", row), bad;
        var first = inputs[0];
        if (first.type === "radio") bad = !inputs.some(function (i) { return i.checked; });
        else if (first.type === "checkbox") bad = !first.checked;
        else if (first.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(first.value.trim());
        else bad = !first.value.trim();
        row.classList.toggle("has-err", bad);
        inputs.forEach(function (i) { if (i.type !== "radio" && i.type !== "checkbox") i.classList.toggle("is-invalid", bad); });
        if (bad && ok) { ok = false; first.focus({ preventScroll: true }); row.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); }
      });
      return ok;
    };
    form.addEventListener("change", function (e) { var row = e.target.closest("[data-req]"); if (row && row.classList.contains("has-err")) validate(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = data[k] ? data[k] + "," + v : v; });
      data.page = location.href;
      var btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "送信中…";
      var done = function () {
        track("contact_submit", { plan: data.plan || "", hp: data.hp || "", agent: data.agent_code ? "yes" : "no" });
        form.hidden = true; $("[data-form-done]").hidden = false;
        window.scrollTo({ top: $("[data-form-done]").getBoundingClientRect().top + window.scrollY - 120, behavior: reduce ? "auto" : "smooth" });
      };
      if (!CFG.formEndpoint) { setTimeout(done, 500); return; }
      fetch(CFG.formEndpoint, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "text/plain;charset=utf-8" } })
        .then(done).catch(function () { btn.disabled = false; btn.textContent = "送信する"; alert("送信に失敗しました。時間をおいて再度お試しいただくか、メールでご連絡ください。"); });
    });
  }
  // どのページから来ても ?agent= を覚えておく（同一タブ内）
  try { var ag = new URLSearchParams(location.search).get("agent"); if (ag) sessionStorage.setItem("table_agent", ag); } catch (e) {}

  /* ---- 代理店フォーム（資料請求／申込） ---- */
  $$("[data-simple-form]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = $$("[required]", f).filter(function (i) { return i.type === "checkbox" ? !i.checked : !i.value.trim(); });
      $$("[required]", f).forEach(function (i) { i.classList.toggle("is-invalid", bad.indexOf(i) > -1); });
      if (bad.length) { bad[0].focus(); return; }
      var data = {}; new FormData(f).forEach(function (v, k) { data[k] = v; }); data.form = f.dataset.simpleForm;
      var fin = function () { f.hidden = true; var d = f.nextElementSibling; if (d) d.hidden = false; track("partner_" + f.dataset.simpleForm); };
      if (!CFG.formEndpoint) return fin();
      fetch(CFG.formEndpoint, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "text/plain;charset=utf-8" } }).then(fin).catch(fin);
    });
  });
})();
