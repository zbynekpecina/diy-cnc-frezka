# Převody: šroub, řemen, hřeben

Srovnání převodů pro osy X, Y a Z, kritické otáčky kuličkových šroubů, uložení a ceny. Rešerše z 15. 11. 2026.

> **Aktuální stav:** Osa Z je hotový modul 200 mm s kuličkovým šroubem Ø16 a ručním kolem (motor NEMA23 později). Pro osy X a Y je plánován řemen GT2 s řemenicemi; pohony se budou montovat až později.

## Přehled převodů

| Převod | Přesnost a vůle | Rychlost | Použití |
|---|---|---|---|
| Trapézový šroub TR8 | vůle v matici, velké tření, opotřebení | nízká | jen malé stroje, na hliník ne |
| **Kuličkový šroub SFU1605 / 1610 / 2005 / 2010, C7** | C7 = ±0,05 mm / 300 mm; vůle matice SFU 0,02–0,05 mm (DFU bez vůle) | omezená kritickými otáčkami | X, Y, Z do délky ~1,2–1,5 m; vždy pro Z |
| Řemen GT2 | pruží | vysoká | podle rešerše lasery, ne frézka |
| **Řemen HTD 5M/15 mm nebo AT5 s ocelovým kordem** (pohon „omega“ jako na fotce favorita) | na dřevo dostačující | vysoká | dlouhé osy na dřevo |
| **Hřeben a pastorek** (modul 1–1,5, šikmé zuby) s redukcí 1:3–1:5 | dobrá | vysoká | osy delší než 1,5 m |

> **Pozor:** Rešerše hodnotí řemen GT2 jako nevhodný pro frézku (pruží). Plán pro osy X a Y s GT2 je s tímto závěrem v rozporu; před nákupem pohonů porovnat s řemenem HTD 5M / AT5 s ocelovým kordem.

## Kritické otáčky šroubu

n_kr = λ · d_r / L² · 10⁷ [ot/min]; λ = 15,1 pro uložení BK + BF (pevné–podepřené), 21,9 pro pevné–pevné. Počítat s 80 % výsledku. Zdroje: [THK](https://www.thk.com/in/en/products/ball_screw/selection/0007) · [Thomson](https://thomsonlinear.com/en/training/ball_screws/critical_speed) · [Misumi](https://us.misumi-ec.com/maker/misumi/mech/product/bs/choice/choice04.html)

| Šroub | L = 800 mm | L = 1150 mm | L = 1500 mm | L = 2000 mm (odhad) |
|---|---|---|---|---|
| SFU1605 | ~2 400 ot/min → 12 m/min | ~1 180 → 5,9 m/min | ~690 → 3,5 m/min | ~390 → 2 m/min ❌ |
| SFU1610 | 24 m/min | 11,8 m/min | 6,9 m/min | ~3,9 m/min |
| SFU2005 | 16 m/min | 7,7 m/min | 4,5 m/min | ~2,5 m/min ❌ |
| SFU2010 | 32 m/min | 15 m/min | 9 m/min | ~5 m/min |

Závěr pro dlouhé osy: šroub délky ~2 m je nevhodný (pomalý, drahý, kmitá). Pro osy X a Y řemen nebo hřeben s pastorkem, kuličkový šroub jen pro osu Z (SFU1605 ~300–400 mm).

## Uložení a spojky šroubů

- Šroub 16 mm: **BK12** u motoru (pevné, úhlová ložiska) a **BF12** na druhém konci. Šroub 20 mm: BK15 a BF15.
- Matice SFU se k vozíku připojuje přes domek **DSG16H**.
- Spojka čelisťová (pavoučí) nebo lamelová. Konec šroubu pro BK12 má čep 10 mm, hřídel NEMA23 8 nebo 6,35 mm → spojka 8×10, pro případné servo 14×10.

## Ceny a odkazy

| Položka | Cena | URL |
|---|---|---|
| linearnatechnika.cz, TBI 16×05 / 16×10 / 20×05 / 20×10 C7 | 781 / 854 / 1 025 / 1 025 Kč/m bez DPH, obrobení konců na zakázku | [šrouby](https://linearnatechnika.cz/obchod/701/kulickovy-sroub-tbi-motion) · [matice](https://linearnatechnika.cz/obchod/702/kulickova-matice-sfusfnu-tbi-motion) · [domky](https://linearnatechnika.cz/obchod/712/upinaci-domec-pre-kulickove-matice-dsg) |
| AliExpress, sada SFU1605 + BK/BF12 + DSG16H + spojka | od ~875–2 216 Kč | [hledání](https://www.aliexpress.com/w/wholesale-sfu1605-ball-screw-kit-bk12-bf12.html) |
| AliExpress, sada SFU1605 C5 | od 1 413 Kč | [odkaz](https://www.aliexpress.com/item/1005001587890246.html) |
| AliExpress, sklad EU, sada SFU1605 1200 mm | 1 485 Kč | [odkaz](https://www.aliexpress.com/item/1005001580537910.html) |
| AliExpress HLTNC, SFU1605/1610 C7 s obrobenými konci | od 370 Kč | [odkaz](https://www.aliexpress.com/item/1005007711913100.html) |
| AliExpress HLTNC, BK12/BF12 + DSG16H + spojka (PL) | 586 Kč | [odkaz](https://www.aliexpress.com/item/1005013541436151.html) |
| AliExpress, SFU2005 C7 + BK/BF | od 1 181 Kč | [odkaz](https://www.aliexpress.com/item/1005010217227182.html) |
| AliExpress, 2× HGR20 + 4× HGH20CA + SFU1605 + BK/BF12 + domek | od 1 701 Kč / 2 144 Kč | [odkaz 1](https://www.aliexpress.com/item/1005008505610982.html) · [odkaz 2](https://www.aliexpress.com/item/4000826764501.html) |
| AliExpress, 3osý kit 6× HGR20 + 3× SFU1605 (400/700/1000) | ~7 700 Kč | [hledání](https://www.aliexpress.com/w/wholesale-hgr20-1000mm.html) |
| VEVOR EU, RM1605 + BK/BF12 + spojka | [neověřeno] | [vevor](https://eur.vevor.com/linear-guide-rail-c_10531/rm1605-1500mm-anti-backlashed-ballscrew-bf12-bk12-stamina-cnc-axis-c7-standard-p_010231176274) |
| Dold Mechatronik SFU1605 | [neověřeno] | [Dold](https://www.dold-mechatronik.de/Kugelumlaufspindel-SFU1605-3) |

## Zbývá dohledat

- [ ] Hřebeny a pastorky (modul 1 / 1,25 / 1,5, šikmé zuby) + planetová převodovka nebo řemenová redukce pro NEMA23: ceny CZ/EU a AliExpress.
- [ ] Řemen HTD 5M / AT5 15–25 mm s ocelovým kordem v metráži + řemenice a napínáky pro pohon „omega“.
## Doporučení pro náš stroj

- Osa Z: kuličkový šroub Ø16 v hotovém modulu 200 mm, zatím ruční kolo. Při motorizaci použít spojku podle průměru hřídele NEMA23 a čepu šroubu.
- Osy X a Y: plánován řemen GT2. Před nákupem ověřit, zda pružnost GT2 na délce 1800 mm vyhoví; alternativou je HTD 5M / AT5 s ocelovým kordem.
- Kuličkový šroub na osu Y (1800 mm) nepoužívat: kritické otáčky omezí rychlost pod 3,5 m/min.
