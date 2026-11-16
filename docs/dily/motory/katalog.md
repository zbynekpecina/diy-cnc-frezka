# Motory a drivery

Srovnání krokových motorů a serv pro osy X, Y a Z, driverů a napájení včetně kompatibility s FluidNC. Rešerše z 15. 11. 2026.

> **Aktuální stav:** Pohony se budou montovat později: 4× NEMA23 + DM556 (X, Y1, Y2, Z), řemen GT2 a řemenice. Osa Z má zatím ruční kolo. Řízení: FluidNC na klasickém ESP32.

Všechny uvedené pohony se řídí signály **STEP/DIR**, fungují tedy s ESP32 a FluidNC přes desku s výstupy pro externí drivery.

## Srovnání pohonů

| Typ | Příklad | Napájení | Výhody | Nevýhody | Cena |
|---|---|---|---|---|---|
| **Krokový motor NEMA23 3 Nm (open-loop)** | StepperOnline 23HS45-4204S 4,2 A + driver DM556T | 24–48 V DC | levný, jednoduchý, dobře drží osu Z | řízení o ztrátě kroků neví; moment klesá nad ~800 ot/min | sada motor + DM556T **37 USD** ([StepperOnline](https://www.omc-stepperonline.com/1-axis-stepper-cnc-kit-3-0nm-425oz-in-4-2a-nema-23-stepper-motor-and-driver-dm556t.html)); motor 28,70 USD ([motor](https://www.omc-stepperonline.com/nema-23-bipolar-3nm-425oz-in-4-2a-57x57x114mm-4-wires-stepper-motor-cnc.html)); AliExpress sada od 636–872 Kč ([hledání](https://www.aliexpress.com/w/wholesale-nema23-3nm-dm556-kit.html)) |
| **Krokový motor closed-loop** | StepperOnline CL57T + 23HS45 s enkodérem; JMC iHSS57; Lichuan LCDA357H | 24–48 V DC | neztrácí kroky, tišší, hlásí chybu (ALM) | dražší | sada CL57T 3 Nm od 73 USD ([StepperOnline](https://www.omc-stepperonline.com/ts-series-3-0-nm-424-92oz-in-1-axis-closed-loop-stepper-cnc-kit-nema-23-motor-driver-w-2m-cable-1-cl57t-s30a)); AliExpress HLTNC od 925 Kč, JMC od 1 820 Kč ([hledání](https://www.aliexpress.com/w/wholesale-nema23-closed-loop-stepper-3nm-kit.html)) |
| Integrované DC servo | JMC iHSV57-30-18-36 (180 W, 0,6 Nm) | 24–50 V DC | servo a driver v jednom | malý moment v nízkých otáčkách | Welectron 129 € ([odkaz](https://welectron.com/JMC-iHSV57-30-18-36-Integrated-Servo-Motor)); AliExpress ~2 600 Kč ([hledání](https://www.aliexpress.com/w/wholesale-jmc-ihsv57.html)) |
| AC servo 400 W 1,27 Nm (příruba 60 mm, hřídel 14 mm) | StepperOnline T6/A6, Lichuan A4, Leadshine | 230 V AC | nejvyšší dynamika, moment do 3 000 ot/min | jiná příruba a spojka; pro osu Z verze s brzdou | T6 175 USD ([T6](https://www.omc-stepperonline.com/t6-series-400w-ac-servo-motor-kit-3000rpm-1-27nm-17-bit-encoder-ip65-t6-rs400h2a3-m17s)); AliExpress od 1 116–3 430 Kč ([hledání](https://www.aliexpress.com/w/wholesale-400w-ac-servo-motor-kit-pulse-1.27nm.html)); Lichuan s brzdou ~215 USD ([odkaz](https://bestsuppliers.com/products/zfcnfs9hykvi/lichuan-servo-motor-400w-with-brake-60stm01330-servo-driver-kit-cnc-servos-system-braking-for-z-axis)) |

## České obchody

| Obchod | Sortiment a ceny | URL |
|---|---|---|
| linearnatechnika.cz | NEMA23 1,85/3 Nm od 1 082 Kč, DM542 384 Kč, DM556 435 Kč, DM556D 1 129 Kč, DM860A 1 655 Kč | [kategorie](https://linearnatechnika.cz/obchod/krokove-motory) |
| dratek.cz | NEMA23 57HD6013-03 849 Kč | [odkaz](https://dratek.cz/880-cnc/) |
| primadilna.cz | elektro a CNC komponenty | [odkaz](https://www.primadilna.cz/Elektro-a-CNC-komponenty-c35_0_1.htm) |
| cncshop.cz | servo-krokové motory Leadshine CS-M | [odkaz](https://cncshop.cz/cs-motory_c) |

## Drivery

| Driver | Parametry | Hodnocení |
|---|---|---|
| DM542 | do 4,2 A / 50 V | pro motor 4,2 A na hranici |
| **DM556T** | 5,6 A, 20–50 V DC | doporučený pro NEMA23 3 Nm ✅ |
| DM860 | do 80 V | pro NEMA34, pro NEMA23 zbytečný |

## Napájení

- Zdroj 48 V DC, pro 3–4 osy 400–600 W (Mean Well LRS-600-48 nebo levnější).
- Při 48 V mají krokové motory ve vyšších otáčkách výrazně větší moment než při 24 nebo 36 V.
- 4 motory po ~3 A ≈ 8 A; zdroj 350 W (7,3 A) nestačí.

## Kompatibilita s ESP32 a FluidNC

- ESP32 má výstupy **3,3 V**, optočleny driverů obvykle vyžadují **5 V** → deska s převodníky úrovní, např. **6-Pack External Driver** (Bart Dring, autor FluidNC): [V1E fórum](https://forum.v1e.com/t/using-6-pack-for-external-drivers-jackpot-board/43551) · [Tindie](https://www.tindie.com/products/26985). Alternativy: PiBot ([Tindie](https://www.tindie.com/products/pibot/pibot-fluidnc-esp32-6-axis-cnc-controller-v47b/)), Corgi ([Elecrow](https://www.elecrow.com/corgi-esp32-6-axis-cnc-controller-for-fluidnc.html)).
- U serva nastavit elektronickou převodovku na **1 000–2 500 pulzů/ot**, jinak ESP32 nestíhá.
- Rozlišení: šroub 1605 + mikrokrok 1/8 = 320 kroků/mm (0,003 mm/krok).

## Příprava na motorizaci

1. Šrouby kupovat rovnou s obrobenými konci pro BK12. Zpočátku točit klikou přes stejnou spojku, motor se později jen nasadí.
2. Držáky motorů navrhnout pro NEMA23 (rozteč 47,14 mm, osazení 38,1 mm) a nechat místo pro přírubu 60 mm (servo: rozteč 70 mm, osazení 50 mm, hřídel 14 mm). Případně použít vyměnitelný mezikus HM12-57.
3. Zdroj 48 V + DM556T/CL57T zvládnou open-loop i closed-loop. AC serva potřebují 230 V a vlastní jištění; počítat s nimi v rozvaděči.
4. **Osa Y se dvěma motory**, každý s vlastním koncovým spínačem (FluidNC: ganged axis + auto-squaring).
5. Řídicí deska se **4–6 výstupy** pro externí drivery (X, Y1, Y2, Z + rezerva).

## Doporučení pro náš stroj

- 4× NEMA23 3 Nm + DM556T (X, Y1, Y2, Z); na osu Y případně closed-loop CL57T.
- Zdroj 48 V 600 W.
- Rozpočet ~4–6 tis. Kč (open-loop).
- Osa Z: modul s ručním kolem a šroubem Ø16; držák motoru NEMA23 připravit podle bodu 2 výše.
