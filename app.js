(function () {
  "use strict";
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  window.osStore = store;

  // ---------- navigation ----------
  var pages = {};
  document.querySelectorAll("main > section.page").forEach(function (s) {
    var id = s.id === "p2" ? "p2" : s.id.replace(/^p-/, "");
    pages[id] = s;
  });
  var navBtns = document.querySelectorAll("#nav button[data-p]");
  function show(id, push) {
    if (!pages[id]) id = "overview";
    Object.keys(pages).forEach(function (k) { pages[k].hidden = k !== id; });
    navBtns.forEach(function (b) {
      if (b.getAttribute("data-p") === id) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    store.set("os2-tab", id);
    if (push) { try { history.replaceState(null, "", "#" + id); } catch (e) {} }
    window.scrollTo(0, 0);
    document.getElementById("main").scrollTop = 0;
    if (id === "exam" && window.examEnsure) window.examEnsure();
  }
  navBtns.forEach(function (b) {
    b.addEventListener("click", function () { show(b.getAttribute("data-p"), true); });
  });
  document.addEventListener("click", function (e) {
    var sc = e.target.closest("a[data-scroll]");
    if (sc) { e.preventDefault(); var t = document.getElementById(sc.getAttribute("data-scroll")); if (t) t.scrollIntoView({ block: "start" }); return; }
    var a = e.target.closest("a[data-go]");
    if (a) { e.preventDefault(); show(a.getAttribute("data-go"), true); }
  });
  window.addEventListener("hashchange", function () { show(location.hash.slice(1), false); });
  var start = location.hash.slice(1) || store.get("os2-tab") || "overview";
  show(start, false);

  // ---------- checklist ----------
  document.querySelectorAll("#checklist input").forEach(function (cb) {
    cb.checked = store.get("os2-" + cb.id) === "1";
    cb.addEventListener("change", function () { store.set("os2-" + cb.id, cb.checked ? "1" : "0"); });
  });

  // ---------- powers of two ----------
  var pow = document.getElementById("pow");
  for (var i = 0; i <= 16; i++) {
    var d = document.createElement("div");
    d.innerHTML = "<b>2^" + i + "</b><span>" + Math.pow(2, i).toLocaleString("en-US") + "</span>";
    pow.appendChild(d);
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---------- stride tracer ----------
  document.getElementById("stGo").addEventListener("click", function () {
    var out = document.getElementById("stOut");
    var K = parseInt(document.getElementById("stK").value, 10);
    var N = Math.min(60, parseInt(document.getElementById("stN").value, 10) || 0);
    var jobs = document.getElementById("stJobs").value.split(",").map(function (p) {
      var m = p.trim().match(/^([^:]+):\s*(\d+)$/);
      return m ? { n: m[1].trim(), t: parseInt(m[2], 10), pass: 0, runs: 0 } : null;
    });
    if (!K || N < 1 || jobs.some(function (j) { return !j || j.t <= 0; })) {
      out.innerHTML = '<p class="err">Use the form A:100, B:50 with positive tickets, a positive constant and at least one pick.</p>';
      return;
    }
    jobs.forEach(function (j) { j.stride = K / j.t; });
    var fmt = function (x) { return Number.isInteger(x) ? x : x.toFixed(2); };
    var h = '<div class="tw"><table><tr><th>Pick</th>' + jobs.map(function (j) { return '<th class="num">pass ' + esc(j.n) + ' (stride ' + fmt(j.stride) + ')</th>'; }).join("") + "<th>Runs</th></tr>";
    for (var k = 1; k <= N; k++) {
      var best = jobs[0];
      jobs.forEach(function (j) { if (j.pass < best.pass - 1e-9) best = j; });
      h += "<tr><td>" + k + "</td>" + jobs.map(function (j) { return '<td class="num">' + fmt(j.pass) + "</td>"; }).join("") + "<td>" + esc(best.n) + "</td></tr>";
      best.pass += best.stride; best.runs++;
    }
    h += "</table></div><p>Runs: " + jobs.map(function (j) { return esc(j.n) + " × " + j.runs; }).join(", ") + "</p>";
    out.innerHTML = h;
  });

  // ---------- address splitter ----------
  function log2(n) { var b = 0; while ((1 << b) < n && b < 52) b++; return (Math.pow(2, b) === n) ? b : -1; }
  function parseNum(s) { s = String(s).trim(); if (/^0x[0-9a-f]+$/i.test(s)) return parseInt(s, 16); if (/^\d+$/.test(s)) return parseInt(s, 10); return NaN; }
  function bin(n, w) { var s = n.toString(2); while (s.length < w) s = "0" + s; return s; }
  function bytes(n) {
    if (n >= 1073741824 && n % 1073741824 === 0) return (n / 1073741824) + " GB";
    if (n >= 1048576 && n % 1048576 === 0) return (n / 1048576) + " MB";
    if (n >= 1024 && n % 1024 === 0) return (n / 1024) + " KB";
    return n.toLocaleString("en-US") + " B";
  }
  document.getElementById("spGo").addEventListener("click", function () {
    var out = document.getElementById("spOut");
    var vb = parseInt(document.getElementById("spBits").value, 10);
    var ps = parseInt(document.getElementById("spPage").value, 10);
    var pte = parseInt(document.getElementById("spPte").value, 10);
    var va = parseNum(document.getElementById("spVa").value);
    var ob = log2(ps);
    if (!(vb >= 4 && vb <= 48) || ob < 0 || ob >= vb || !(pte >= 1)) {
      out.innerHTML = '<p class="err">Page size must be a power of two smaller than the address space, and VA bits between 4 and 48.</p>';
      return;
    }
    var vpnb = vb - ob, pages = Math.pow(2, vpnb), per = Math.floor(ps / pte);
    var h = '<div class="tw"><table>' +
      "<tr><td>Offset bits</td><td class='mono'>log2(" + ps + ") = " + ob + "</td></tr>" +
      "<tr><td>VPN bits</td><td class='mono'>" + vb + " − " + ob + " = " + vpnb + "</td></tr>" +
      "<tr><td>Virtual pages</td><td class='mono'>2^" + vpnb + " = " + pages.toLocaleString("en-US") + "</td></tr>" +
      "<tr><td>Linear table size</td><td class='mono'>" + pages.toLocaleString("en-US") + " × " + pte + " B = " + bytes(pages * pte) + "</td></tr>";
    var pib = log2(per);
    if (pib > 0 && pib < vpnb) {
      var pdb = vpnb - pib;
      h += "<tr><td>Two-level split</td><td class='mono'>" + per + " PTEs per page → PT index " + pib + " bits, PD index " + pdb + " bits → " + pdb + " | " + pib + " | " + ob + "</td></tr>";
    }
    h += "</table></div>";
    if (!isNaN(va)) {
      if (va >= Math.pow(2, vb)) {
        h += '<p class="err">Address ' + esc(document.getElementById("spVa").value) + " doesn't fit in " + vb + " bits.</p>";
      } else {
        var vpn = Math.floor(va / ps), off = va % ps;
        var b = bin(va, vb);
        h += '<div class="bits"><span class="f1">' + b.slice(0, vpnb) + "<small>VPN = " + vpn + " (0x" + vpn.toString(16).toUpperCase() + ")</small></span>" +
          '<span class="f3">' + b.slice(vpnb) + "<small>offset = " + off + " (0x" + off.toString(16).toUpperCase() + ")</small></span></div>";
        if (pib > 0 && pib < vpnb) {
          var pd = Math.floor(vpn / per), pt = vpn % per;
          h += "<p class='mono'>PD index " + pd + " · PT index " + pt + " · offset " + off + "</p>";
        }
        h += "<p>Physical address = PFN × " + ps + " + " + off + ".</p>";
      }
    }
    out.innerHTML = h;
  });

  // ---------- replacement tracer ----------
  function simulate(refs, n, pol) {
    var frames = [], use = [], loadT = [], lastT = [], hand = 0, rows = [], faults = 0;
    refs.forEach(function (p, t) {
      var idx = frames.indexOf(p), ev = null, hit = idx >= 0, note = "";
      if (hit) {
        lastT[idx] = t; use[idx] = 1;
      } else {
        faults++;
        if (frames.length < n) {
          idx = frames.length; frames.push(p); use.push(1); loadT.push(t); lastT.push(t);
        } else {
          if (pol === "FIFO") {
            idx = 0; for (var i = 1; i < n; i++) if (loadT[i] < loadT[idx]) idx = i;
          } else if (pol === "LRU") {
            idx = 0; for (var j = 1; j < n; j++) if (lastT[j] < lastT[idx]) idx = j;
          } else if (pol === "OPT") {
            var far = -1; idx = 0;
            for (var k = 0; k < n; k++) {
              var nx = refs.indexOf(frames[k], t + 1); if (nx < 0) nx = Infinity;
              if (nx > far) { far = nx; idx = k; }
            }
          } else {
            var cleared = [];
            while (use[hand] === 1) { use[hand] = 0; cleared.push(frames[hand]); hand = (hand + 1) % n; }
            idx = hand; hand = (hand + 1) % n;
            if (cleared.length) note = "cleared " + cleared.join(", ");
          }
          ev = frames[idx]; frames[idx] = p; use[idx] = 1; loadT[idx] = t; lastT[idx] = t;
        }
      }
      rows.push({ p: p, hit: hit, ev: ev, f: frames.slice(), u: use.slice(), hand: hand, note: note });
    });
    return { rows: rows, faults: faults };
  }
  window.osSimulate = simulate;
  document.getElementById("rpGo").addEventListener("click", function () {
    var out = document.getElementById("rpOut");
    var refs = document.getElementById("rpRef").value.trim().split(/[\s,]+/).filter(Boolean);
    var n = parseInt(document.getElementById("rpN").value, 10);
    var pol = document.getElementById("rpPol").value;
    if (!refs.length || !(n >= 1 && n <= 8)) { out.innerHTML = '<p class="err">Enter page numbers separated by spaces and 1–8 frames.</p>'; return; }
    var r = simulate(refs, n, pol);
    var h = '<div class="tw"><table><tr><th>Ref</th><th>Result</th><th>Evicts</th>';
    for (var i = 0; i < n; i++) h += '<th>F' + i + "</th>";
    h += (pol === "Clock" ? "<th>Hand after</th><th>Notes</th>" : "") + "</tr>";
    r.rows.forEach(function (row) {
      h += "<tr><td class='mono'>" + esc(row.p) + "</td><td class='" + (row.hit ? "hit'>hit" : "miss'>fault") + "</td><td class='mono'>" + (row.ev == null ? "" : esc(row.ev)) + "</td>";
      for (var i = 0; i < n; i++) {
        var v = row.f[i] == null ? "–" : esc(row.f[i]) + (pol === "Clock" && row.f[i] != null ? "<sub>" + row.u[i] + "</sub>" : "");
        h += "<td class='mono'>" + v + "</td>";
      }
      if (pol === "Clock") h += "<td class='mono'>F" + row.hand + "</td><td>" + esc(row.note) + "</td>";
      h += "</tr>";
    });
    h += "</table></div><p><b>" + r.faults + "</b> faults, <b>" + (refs.length - r.faults) + "</b> hits out of " + refs.length + " references.</p>";
    out.innerHTML = h;
  });

  document.getElementById("stGo").click();
  document.getElementById("spGo").click();
  document.getElementById("rpGo").click();
})();
