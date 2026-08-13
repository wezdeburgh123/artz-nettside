"""
Lager rettighetsfrie demoverk til ARTZ.

Bildene er abstrakte komposisjoner i nettstedets egen palett, i varierte
formater slik at bildeflaten testes med både høye, brede og kvadratiske
verk. Hvert bilde har ordet DEMO brent inn nede i hjørnet. Det er med
vilje: 13. august 2026 sto oppdiktede verk på forsiden side om side med
et ekte, uten noe som skilte dem. Et merke i selve bildefila kan ikke
falle av underveis.
"""
import math
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

UT = Path("/home/claude/demo")
UT.mkdir(parents=True, exist_ok=True)

# Nettstedets palett, pluss noen dempede toner i samme familie.
PALETTER = [
    ("#efece4", ["#4a5c5a", "#8fa39c", "#c2b8a3", "#2f3634"]),
    ("#f2efe8", ["#5b4b42", "#a8836a", "#cbb9a0", "#332a25"]),
    ("#eceeed", ["#3c4a5c", "#7d93a8", "#b9c4cc", "#232a33"]),
    ("#f1eee6", ["#6b5c3e", "#a99364", "#d0c5a8", "#3a3226"]),
    ("#eeeceb", ["#4c4churn"[:7], "#7a6f66", "#b0a89e", "#2b2724"]),
]
PALETTER[4] = ("#eeeceb", ["#4c443f", "#7a6f66", "#b0a89e", "#2b2724"])

FORMATER = [
    (1400, 1900), (1900, 1400), (1600, 1600), (1200, 1900),
    (1900, 1200), (1500, 1800), (1800, 1500), (1400, 1400),
]


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def bland(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def komposisjon(seed, bredde, hoyde):
    r = random.Random(seed)
    bg_hex, farge_hex = PALETTER[seed % len(PALETTER)]
    bg = hex_rgb(bg_hex)
    farger = [hex_rgb(f) for f in farge_hex]

    bilde = Image.new("RGB", (bredde, hoyde), bg)
    lag = Image.new("RGBA", (bredde, hoyde), (0, 0, 0, 0))
    d = ImageDraw.Draw(lag, "RGBA")

    stil = seed % 4

    if stil == 0:
        # Vannrette felt, som et landskap uten motiv.
        y = 0
        while y < hoyde:
            h = r.randint(hoyde // 14, hoyde // 4)
            f = r.choice(farger)
            d.rectangle([0, y, bredde, y + h], fill=f + (r.randint(40, 130),))
            y += h
    elif stil == 1:
        # Store, overlappende flater.
        for _ in range(r.randint(4, 7)):
            w = r.randint(bredde // 4, int(bredde * 0.8))
            h = r.randint(hoyde // 5, int(hoyde * 0.7))
            x = r.randint(-w // 4, bredde - w // 2)
            y = r.randint(-h // 4, hoyde - h // 2)
            f = r.choice(farger)
            d.rectangle([x, y, x + w, y + h], fill=f + (r.randint(50, 120),))
    elif stil == 2:
        # Sirkler, ulik størrelse.
        for _ in range(r.randint(5, 9)):
            rad = r.randint(min(bredde, hoyde) // 10, min(bredde, hoyde) // 3)
            cx = r.randint(0, bredde)
            cy = r.randint(0, hoyde)
            f = r.choice(farger)
            d.ellipse([cx - rad, cy - rad, cx + rad, cy + rad],
                      fill=f + (r.randint(45, 110),))
    else:
        # Skrå streker, som et raderingsarbeid.
        for _ in range(r.randint(18, 34)):
            x1 = r.randint(-bredde // 3, bredde)
            y1 = r.randint(-hoyde // 3, hoyde)
            lengde = r.randint(hoyde // 4, hoyde)
            vinkel = r.uniform(-0.9, -0.3)
            x2 = x1 + int(math.cos(vinkel) * lengde)
            y2 = y1 - int(math.sin(vinkel) * lengde)
            f = r.choice(farger)
            d.line([x1, y1, x2, y2], fill=f + (r.randint(35, 100),),
                   width=r.randint(2, 14))

    bilde = Image.alpha_composite(bilde.convert("RGBA"), lag).convert("RGB")
    bilde = bilde.filter(ImageFilter.GaussianBlur(0.6))

    # Papirstruktur, så flatene ikke ser digitale ut.
    korn = Image.effect_noise((bredde, hoyde), 14).convert("L")
    bilde = Image.blend(bilde, Image.merge("RGB", (korn, korn, korn)), 0.05)

    return merk(bilde, bredde, hoyde, bg, farger)


def merk(bilde, bredde, hoyde, bg, farger):
    """Brenner inn DEMO. Skal være lesbar, men ikke stjele bildet."""
    d = ImageDraw.Draw(bilde, "RGBA")
    stor = max(14, bredde // 26)
    try:
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", stor)
    except OSError:
        font = ImageFont.load_default()

    tekst = "DEMO"
    boks = d.textbbox((0, 0), tekst, font=font)
    tb, th = boks[2] - boks[0], boks[3] - boks[1]
    luft = stor // 2
    x = bredde - tb - luft * 2
    y = hoyde - th - luft * 2

    d.rectangle([x - luft, y - luft, x + tb + luft, y + th + luft * 1.6],
                fill=bg + (215,))
    d.text((x, y - boks[1]), tekst, font=font,
           fill=bland(hex_rgb("#1c1b19"), bg, 0.25) + (255,))
    return bilde


TITLER = [
    "Komposisjon i grått", "Feltstudie", "Horisont I", "Horisont II",
    "Uten tittel", "Studie i okergult", "Vinterflate", "Nattstykke",
    "Uten tittel", "Bevegelse mot venstre", "Rom med lys", "Stille time",
    "Fragment", "Skygge over vann", "Tre felt", "Etterbilde",
    "Morgen", "Uten tittel",
]

if __name__ == "__main__":
    laget = []
    for i, tittel in enumerate(TITLER):
        b, h = FORMATER[i % len(FORMATER)]
        bilde = komposisjon(i + 1, b, h)
        navn = f"demo-verk-{i + 1:02d}.jpg"
        bilde.save(UT / navn, "JPEG", quality=88, optimize=True)
        laget.append((navn, tittel, b, h))
        print(f"{navn}  {tittel}  {b}x{h}")
    print(f"\n{len(laget)} demoverk i {UT}")
