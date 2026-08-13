/* ============================================================
   REGISTERDRIFT
   Generativ grafikk bygget som simulering av et trykkverksted:
   transparente plater, feilslått register, platemerke, papirfiber.

   Brukes både av viewer.html (global p5) og render.mjs (instans-p5).
   Alt går gjennom tegnVerk(p, cfg). Samme cfg gir alltid samme verk.
   ============================================================ */
(function (global) {
  // ---------- palettfamilier ----------
  const PALETTER = [
    { navn: "Nordlys",    papir: "#f3efe4", blekk: ["#1b2a4a", "#1f6f6a", "#8fb43a", "#e8c34a"] },
    { navn: "Okerjord",   papir: "#f6f1e3", blekk: ["#8a5a24", "#c98a3a", "#5b3a1e", "#d9c08a"] },
    { navn: "Grafitt",    papir: "#f2f0ea", blekk: ["#17181a", "#5c5f66", "#a8a49a", "#b8402c"] },
    { navn: "Havdis",     papir: "#f1f2ee", blekk: ["#3a5566", "#7d99a6", "#c4cfd2", "#b0603c"] },
    { navn: "Sommerhage", papir: "#f7f3e6", blekk: ["#5d6b32", "#c98a90", "#d8ab35", "#8fa07a"] },
    { navn: "Vinterlys",  papir: "#f2f1f0", blekk: ["#4a4560", "#8f9ab5", "#cfd6de", "#c9a95e"] },
    { navn: "Brent",      papir: "#f6efe4", blekk: ["#8f2f22", "#4d1b18", "#d2632c", "#dbb98a"] },
    { navn: "Skog",       papir: "#f3f2e8", blekk: ["#22402c", "#4f7043", "#8b7346", "#b9c39a"] },
  ];

  const HENDER = ["flyt", "felt", "risse", "korn", "bolge"];
  const KONVOLUTTER = ["horisont", "masse", "diagonal", "sokkel"];
  const FORMATER = [
    { w: 1200, h: 1560 }, // stående
    { w: 1400, h: 1400 }, // kvadrat
    { w: 1600, h: 1180 }, // liggende
    { w: 1040, h: 1560 }, // høyt
  ];

  // ---------- deterministisk hash av en tekststreng ----------
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    // murmur3 fmix32: uten denne korrelerer lave bits naar strengene
    // slutter paa samme tegn, og alle "-1"-verk fikk samme konvolutt.
    h ^= h >>> 16; h = Math.imul(h, 2246822507);
    h ^= h >>> 13; h = Math.imul(h, 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  }

  /* En kunstnerhånd er fast: palett, hånd og lagtall følger navnet,
     ikke frøet. To verk av samme kunstner leser derfor som to trykk
     fra samme hånd, ikke som to filer fra samme generator. */
  function hand(slug) {
    const h = hash(slug);
    return {
      palett: PALETTER[h % PALETTER.length],
      hand: HENDER[(h >>> 4) % HENDER.length],
      plater: 3 + ((h >>> 8) % 3),
      drift: 4 + ((h >>> 11) % 14),
    };
  }

  /* Konvolutt og format tvinges til aa vaere ulike mellom verk 1 og 2.
     Uten det ble de to trykkene til samme kunstner nesten identiske,
     fordi hand og palett allerede er felles. */
  function cfgFor(slug, nr) {
    const k = hand(slug);
    const b = hash(slug);
    const h = hash(slug + ":" + nr);
    const skift = (nr - 1) * (1 + (b >>> 20) % 3);
    return {
      seed: (h % 900000) + 1000,
      ...k,
      konvolutt: KONVOLUTTER[(b + skift) % KONVOLUTTER.length],
      format: FORMATER[((b >>> 6) + skift) % FORMATER.length],
      tetthet: 0.8 + ((h >>> 13) % 65) / 100,
    };
  }

  // ---------- form-konvolutt: hvor blekket har rett til å ligge ----------
  // et lite gulv gjoer at blekket ogsaa finnes utenfor kjernen.
  // Uten det floet verkene som smaa vignetter midt i papiret.
  const gulv = (v) => Math.max(0, v) * 0.86 + 0.14;

  function lagKonvolutt(p, w, h, type) {
    const m = Math.min(w, h);
    if (type === "horisont") {
      const y0 = h * (0.4 + p.random(-0.1, 0.16));
      const tj = m * p.random(0.28, 0.5);
      return (x, y) => {
        const d = Math.abs(y - y0);
        return gulv(1 - Math.pow(d / tj, 1.5));
      };
    }
    if (type === "masse") {
      const cx = w * (0.5 + p.random(-0.12, 0.12));
      const cy = h * (0.47 + p.random(-0.1, 0.1));
      const rx = w * p.random(0.42, 0.62);
      const ry = h * p.random(0.4, 0.6);
      return (x, y) => {
        const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
        return gulv(1 - Math.pow(d, 1.7));
      };
    }
    if (type === "diagonal") {
      const a = p.random(-0.9, 0.9) + (p.random() < 0.5 ? Math.PI / 4 : -Math.PI / 4);
      const nx = Math.cos(a), ny = Math.sin(a);
      const off = p.random(-0.12, 0.12) * m;
      const tj = m * p.random(0.34, 0.58);
      return (x, y) => {
        const d = Math.abs((x - w / 2) * nx + (y - h / 2) * ny - off);
        return gulv(1 - Math.pow(d / tj, 1.4));
      };
    }
    // sokkel: tyngden ligger nede, luft over
    const y0 = h * p.random(0.5, 0.7);
    const topp = y0 - m * 0.5;
    return (x, y) => {
      if (y < topp) return 0.06;
      const t = (y - topp) / (h - topp);
      return Math.min(1, 0.3 + t * 1.1);
    };
  }

  // prøvetaking mot konvolutten, med avvisning
  function punkt(p, w, h, k, marg) {
    for (let i = 0; i < 40; i++) {
      const x = p.random(marg, w - marg);
      const y = p.random(marg, h - marg);
      if (p.random() < k(x, y)) return { x, y };
    }
    return { x: w / 2, y: h / 2 };
  }

  // ============================================================
  //  HENDENE. Hver tegner ett lag inn i g, i én blekkfarge.
  // ============================================================

  function handFlyt(p, g, w, h, k, blekk, tetthet, lag) {
    const n = Math.round(190 * tetthet);
    const skala = 0.0011 + p.random(0, 0.0016);
    const sving = p.random(1.6, 3.4);
    g.noFill();
    for (let i = 0; i < n; i++) {
      let { x, y } = punkt(p, w, h, k, w * 0.06);
      const len = Math.round(p.random(120, 520));
      const bredde = p.random(2.5, 16) * (1 + lag * 0.2);
      const a = p.random(45, 130);
      for (let s = 0; s < len; s++) {
        const vinkel = p.noise(x * skala, y * skala, lag * 12.7) * Math.PI * 2 * sving;
        const nx = x + Math.cos(vinkel) * 3.2;
        const ny = y + Math.sin(vinkel) * 3.2;
        const fade = 1 - s / len;
        const kk = k(nx, ny);
        if (kk <= 0.02) break;
        g.strokeWeight(bredde * fade * (0.4 + kk));
        g.stroke(blekk.levels[0], blekk.levels[1], blekk.levels[2], a * fade * kk);
        g.line(x, y, nx, ny);
        x = nx; y = ny;
        if (x < 0 || x > w || y < 0 || y > h) break;
      }
    }
  }

  function handFelt(p, g, w, h, k, blekk, tetthet, lag) {
    const n = Math.round(p.random(3, 6) * tetthet) + 1;
    g.noStroke();
    // hele plata vippes litt, ellers leser flatene som rutet toey
    g.push();
    g.translate(w / 2, h / 2);
    g.rotate(p.random(-0.5, 0.5));
    g.translate(-w / 2, -h / 2);
    for (let i = 0; i < n; i++) {
      const c = punkt(p, w, h, k, w * 0.05);
      const bw = w * p.random(0.22, 0.95);
      const bh = h * p.random(0.08, 0.6);
      const a = p.random(95, 190);
      g.fill(blekk.levels[0], blekk.levels[1], blekk.levels[2], a);
      // revet kant: mange småsteg langs hver side
      g.beginShape();
      const steg = 26;
      for (let s = 0; s <= steg; s++) {
        const t = s / steg;
        g.vertex(c.x - bw / 2 + bw * t, c.y - bh / 2 + p.random(-1, 1) * bh * 0.05);
      }
      for (let s = 0; s <= steg; s++) {
        const t = s / steg;
        g.vertex(c.x + bw / 2 + p.random(-1, 1) * bw * 0.02, c.y - bh / 2 + bh * t);
      }
      for (let s = 0; s <= steg; s++) {
        const t = s / steg;
        g.vertex(c.x + bw / 2 - bw * t, c.y + bh / 2 + p.random(-1, 1) * bh * 0.05);
      }
      for (let s = 0; s <= steg; s++) {
        const t = s / steg;
        g.vertex(c.x - bw / 2 + p.random(-1, 1) * bw * 0.02, c.y + bh / 2 - bh * t);
      }
      g.endShape(g.CLOSE);
    }
    g.pop();
  }

  function handRisse(p, g, w, h, k, blekk, tetthet, lag) {
    g.noFill();
    const roter = Math.round(p.random(5, 11) * tetthet) + 2;
    function gren(x, y, vinkel, len, dyp, vekt) {
      if (dyp <= 0 || len < 5) return;
      const nx = x + Math.cos(vinkel) * len;
      const ny = y + Math.sin(vinkel) * len;
      const kk = k((x + nx) / 2, (y + ny) / 2);
      if (kk > 0.03) {
        g.strokeWeight(Math.max(0.5, vekt));
        g.stroke(blekk.levels[0], blekk.levels[1], blekk.levels[2], p.random(120, 235) * Math.min(1, kk + 0.35));
        // litt skjelving i linja, som en tørrnål som graver
        const seg = 7;
        let px = x, py = y;
        g.beginShape();
        g.vertex(px, py);
        for (let s = 1; s <= seg; s++) {
          const t = s / seg;
          const jx = x + (nx - x) * t + p.random(-1, 1) * len * 0.035;
          const jy = y + (ny - y) * t + p.random(-1, 1) * len * 0.035;
          g.vertex(jx, jy);
        }
        g.endShape();
      }
      const antall = p.random() < 0.72 ? 2 : 3;
      for (let i = 0; i < antall; i++) {
        gren(
          nx, ny,
          vinkel + p.random(-0.72, 0.72),
          len * p.random(0.58, 0.84),
          dyp - 1,
          vekt * 0.72
        );
      }
    }
    for (let r = 0; r < roter; r++) {
      const s = punkt(p, w, h, k, w * 0.1);
      gren(s.x, s.y, p.random(0, Math.PI * 2), Math.min(w, h) * p.random(0.14, 0.26), 6, p.random(4, 11));
    }
  }

  function handKorn(p, g, w, h, k, blekk, tetthet, lag) {
    const m = Math.min(w, h);
    const B = blekk.levels;
    g.noStroke();

    /* Akvatint bygges i to trinn, og rekkefolgen er hele poenget.
       Forst brede myke masser som gir tonen sin form, deretter det
       fine kornet som gir den overflate. Bare korn ble stovtaake. */
    const masser = Math.round(300 * tetthet) + 60;
    const skala = 0.0016 + p.random(0, 0.0022);
    for (let i = 0; i < masser; i++) {
      const q = punkt(p, w, h, k, -m * 0.05);
      const kk = k(q.x, q.y);
      const st = p.noise(q.x * skala, q.y * skala, lag * 5.1);
      // lavfrekvent terskel: noen partier av plata skal aldri ta blekk
      const apen = p.noise(q.x * 0.0007, q.y * 0.0007, lag * 3.3);
      if (apen < 0.42) continue;
      const r = m * p.random(0.04, 0.26) * (0.5 + st);
      g.fill(B[0], B[1], B[2], p.random(9, 32) * (0.3 + kk) * (apen - 0.3));
      g.ellipse(q.x, q.y, r * p.random(0.7, 1.4), r * p.random(0.7, 1.4));
    }

    // det fine kornet
    const n = Math.round(70000 * tetthet);
    for (let i = 0; i < n; i++) {
      const x = p.random(w), y = p.random(h);
      const kk = k(x, y);
      if (kk <= 0.05) continue;
      const st = p.noise(x * skala * 1.7, y * skala * 1.7, lag * 9.4);
      if (p.random() > kk * st * 1.9) continue;
      g.fill(B[0], B[1], B[2], p.random(50, 190) * Math.min(1, kk + 0.2));
      const r = p.random(0.8, 3.8);
      g.ellipse(x, y, r, r);
    }
  }

  function handBolge(p, g, w, h, k, blekk, tetthet, lag) {
    const linjer = Math.round(p.random(70, 150) * tetthet);
    const f1 = p.random(0.004, 0.013), f2 = p.random(0.002, 0.02);
    const a1 = h * p.random(0.03, 0.12), a2 = h * p.random(0.01, 0.06);
    const ph = p.random(0, Math.PI * 2);
    g.noFill();
    for (let i = 0; i < linjer; i++) {
      const base = (h * (i + 0.5)) / linjer + p.random(-3, 3);
      g.strokeWeight(p.random(1.1, 5.2));
      g.beginShape();
      let synlig = false;
      for (let x = 0; x <= w; x += 5) {
        const y =
          base +
          Math.sin(x * f1 + ph + i * 0.16) * a1 +
          Math.sin(x * f2 - ph * 1.7 + i * 0.31) * a2;
        const kk = k(x, y);
        if (kk <= 0.03) {
          if (synlig) { g.endShape(); g.beginShape(); synlig = false; }
          continue;
        }
        if (!synlig) {
          g.stroke(blekk.levels[0], blekk.levels[1], blekk.levels[2], p.random(110, 240) * Math.min(1, kk + 0.15));
          synlig = true;
        }
        g.vertex(x, y);
      }
      g.endShape();
    }
  }

  const TEGNERE = { flyt: handFlyt, felt: handFelt, risse: handRisse, korn: handKorn, bolge: handBolge };

  // ============================================================
  //  HOVEDFUNKSJON
  // ============================================================
  function tegnVerk(p, cfg) {
    const w = p.width, h = p.height;
    p.randomSeed(cfg.seed);
    p.noiseSeed(cfg.seed);

    const pal = cfg.palett;
    const marg = Math.min(w, h) * 0.055;

    // --- papir ---
    p.background(p.color(pal.papir));
    p.noStroke();
    const pc = p.color(pal.papir);
    for (let i = 0; i < 2600; i++) {
      const x = p.random(w), y = p.random(h);
      const n = p.noise(x * 0.0022, y * 0.0022);
      const d = (n - 0.5) * 16;
      p.fill(
        p.red(pc) + d, p.green(pc) + d, p.blue(pc) + d,
        p.random(6, 22)
      );
      p.ellipse(x, y, p.random(20, 110), p.random(20, 110));
    }

    // --- konvolutt, delt av alle platene ---
    const kRaa = lagKonvolutt(p, w, h, cfg.konvolutt);
    /* Kantfall. Uten dette ble trykkflaten kuttet tvert i margen og leste
       som et pastet rektangel, tydeligst paa de tonale hendene. Litt stoy
       i fallet, saa kanten ikke blir en perfekt ramme. */
    const fall = Math.min(w, h) * 0.13;
    const k = (x, y) => {
      const dx = Math.min(x, w - x), dy = Math.min(y, h - y);
      const d = Math.min(dx, dy) - marg * 0.35;
      const st = 0.72 + p.noise(x * 0.0026, y * 0.0026) * 0.56;
      const kant = Math.max(0, Math.min(1, d / (fall * st)));
      return kRaa(x, y) * kant * kant;
    };
    const tegn = TEGNERE[cfg.hand];

    // --- platene ---
    for (let lag = 0; lag < cfg.plater; lag++) {
      const g = p.createGraphics(w, h);
      g.clear();
      const blekk = p.color(pal.blekk[lag % pal.blekk.length]);
      blekk.levels = [p.red(blekk), p.green(blekk), p.blue(blekk)];
      tegn(p, g, w, h, k, blekk, cfg.tetthet * (1 - lag * 0.1), lag);

      // registerdriften: liten nok til å virke utilsiktet
      const dx = p.random(-cfg.drift, cfg.drift);
      const dy = p.random(-cfg.drift, cfg.drift);
      const rot = p.random(-0.004, 0.004);
      p.push();
      p.blendMode(p.MULTIPLY);
      p.translate(w / 2 + dx, h / 2 + dy);
      p.rotate(rot);
      p.image(g, -w / 2, -h / 2);
      p.pop();
      g.remove();
    }
    p.blendMode(p.BLEND);

    // --- platemerke: den svakt pregede kanten fra intaglioplata ---
    p.noFill();
    p.strokeWeight(1.4);
    p.stroke(0, 0, 0, 26);
    p.rect(marg, marg, w - marg * 2, h - marg * 2);
    p.strokeWeight(3);
    p.stroke(255, 255, 255, 34);
    p.rect(marg - 2.4, marg - 2.4, w - marg * 2 + 4.8, h - marg * 2 + 4.8);

    // margen skal være renere enn trykkflaten
    p.noStroke();
    p.fill(p.red(pc), p.green(pc), p.blue(pc), 105);
    p.rect(0, 0, w, marg);
    p.rect(0, h - marg, w, marg);
    p.rect(0, 0, marg, h);
    p.rect(w - marg, 0, marg, h);

    // --- korn over alt blekket, ikke under ---
    for (let i = 0; i < 9000; i++) {
      const x = p.random(w), y = p.random(h);
      p.fill(p.random() < 0.5 ? 255 : 0, p.random(3, 11));
      p.ellipse(x, y, p.random(0.6, 1.9), p.random(0.6, 1.9));
    }
  }

  global.REGISTERDRIFT = { PALETTER, HENDER, KONVOLUTTER, FORMATER, hash, hand, cfgFor, tegnVerk };
})(typeof window !== "undefined" ? window : globalThis);
