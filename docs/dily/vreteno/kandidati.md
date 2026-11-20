# Vřeteno a VFD – kandidáti, které jsme sami našli

## ✅ KOUPENO: HLTNC EU CNC (sklad Německo): vřeteno 2,2 kW GDZ80x73-2.2 ER20 + měnič EV210 s RS485 (AliExpress) – **vybraná sada „F“**

- Odkaz: https://www.aliexpress.com/item/1005011656854811.html
- Obrázky: [obrazky/hltnc-eu-de-2.2kw-ev210/](obrazky/hltnc-eu-de-2.2kw-ev210/) (01 = stránka nabídky; 02 = galerie: obsah sady, svorkovnice, parametry, schéma zapojení)
- **Manuál měniče EV210 (82 stran, i Modbus):** PDF (u prodejce), totožný s odkazem prodejce na Google Drive (https://drive.google.com/file/d/1pspuUKvI0xf223TL7njRkUH-Sau6p7h1/view?usp=drive_link)
- Název: EU Shipped 2.2KW Spindle Motor 24000RPM Air Cooled Single-phase 220V + Frequency Converter Input Frequency 50/60Hz For Milling
- Prodejce: **HLTNC EU CNC Store (Trader)**, 5,0 ★ / 7 recenzí, 45 prodaných. ⚠️ AliHelper: „tomuto prodejci nedůvěřuje“ (nový obchod)
- Cena (15. 11. 2026, akce 11.11): **4 053 Kč** (před slevou 4 904 Kč), DPH v ceně, bez cla, **doprava zdarma z Německa**, doručení **21.–26. 11.**. Zbýval **poslední kus**, akce do 18. 11.
- Obsah: vřeteno GDZ80x73-2.2 se svorkovnicí + měnič **EV210-0022G-S2** (1F 220 V). **Kleštiny ani klíč ER20A v sadě nejsou** – dokoupit.
- Vřeteno a patka jsou stejné jako u starší nabídky HLTNC níže (24 000 ot/min při 400 Hz, 6,5 A, ER20, patka 110 × 95, díry 30 + 35 + 35 + 35), takže 3D model i deska Z platí beze změn.
- Nastavení podle prodejce: P0-10=400, P0-12=400, P1-04=400, P1-05=24000, P7-03=H.401F, P7-12=20, P7-06=0.6000, pak RUN až do dosažení otáček
- Recenze (7× 5 ★): „Looks good so far. **fully controllable via max485**“ (19. 9. 2026), „Very fast delivery, equipment as described“, „Very nice spindle… perfect packing“
- Otázka kupujícího „er20?“ – prodejce: „Yes, it is er20. **this is a 3.5 kw** air-cooled spindle“ → **rozpor** s nabídkou (2,2 kW + měnič 2,2 kW), nejspíš šablonová odpověď. Před objednáním potvrdit zprávou:
  > Hello, please confirm before I order: the kit contains the 2.2 kW GDZ80x73-2.2 spindle (220 V, 400 Hz, ~6.5 A, ER20) and the EV210-0022G-S2 inverter with RS485, correct? Your Q&A answer mentions a 3.5 kW spindle. Are ER20 collets and the ER20A wrench included? Thank you.

### RS485 / Modbus podle manuálu EV210 (příloha 1, str. 68–75)
| | |
|---|---|
| Komunikace (skupina Pd) | Pd-00 rychlost: **výchozí 6 = 19 200 Bd** (5 = 9 600); Pd-01 formát: **výchozí 1 = 8-E-1** (3 = 8-N-1); Pd-02 adresa **1**; Pd-05 = 1 standardní Modbus RTU; Pd-04 timeout 0 = vypnuto |
| Přepnutí na řízení po sběrnici | **P0-02 = 2** (příkazy z komunikace), **P0-03 = 9** (frekvence z komunikace) |
| 1000H (zápis) | žádaná hodnota v % maximální frekvence: **10000 = 100,00 %** (−10000…10000) |
| 2000H (zápis) | příkaz: 1 = chod vpřed, 2 = vzad, 5 = volný doběh, **6 = zastavení s rampou**, 7 = reset poruchy |
| 3000H (čtení) | stav: 1 = vpřed, 2 = vzad, 3 = stojí |
| 1001H… (čtení) | 1001H frekvence, 1002H napětí DC sběrnice, 1004H proud, 1005H výkon, 1007H otáčky |
| 8000H (čtení) | kód poruchy (0 = bez poruchy, 2–4 nadproud, 9 podpětí, 0x10 chyba komunikace…) |
| Parametry | adresa = 0xF000 + skupina/číslo (P3-12 → 0xF30C); zápis jen do RAM 0x0000+ (šetří EEPROM) |

Adresy 1000H / 2000H / 3000H odpovídají protokolu **H2A**, který FluidNC podporuje (`H2A` / obecný `ModbusVFD`). Maximální otáčky nastavit ve FluidNC ručně (24 000), protože EV210 má parametry na 0xF0xx. Ověří se až na stole.

### Hodnocení
| | |
|---|---|
| ✅ | Stejné vřeteno jako dražší sady, k tomu měnič s **RS485 ověřeným v recenzi** – otáčky, start a stop z FluidNC bez převodníku 0–10 V |
| ✅ | 24 000 ot/min (400 Hz) – rezerva pro malé frézy; srovnávací frézu Ø39 stejně pojedeme ~12 000–16 000 |
| ✅ | Z Německa, doprava zdarma, bez cla, 21.–26. 11. |
| ✅ | Svorkovnice na vřetenu → snadno připojit vlastní stíněný kabel |
| ➖ | Bez kleštin a klíče: dokoupit **1 kvalitní kleštinu ER20 (třída UP/AA) na stopku frézy** (8 mm pro koupenou Ø39, případně 12 mm / ½"), **klíč ER20A** a **plochý klíč 21 mm** |
| ⚠️ | Nový obchod (7 recenzí, AliHelper nedůvěřuje) – kryje ochrana kupujícího; rozbalení natočit na video |
| ⚠️ | Rozpor 3,5 kW v Q&A – potvrdit zprávou výše. Když prodejce trvá na 3,5 kW s měničem 2,2 kW, vzít EUCNC / HLTNC Eur (PL, 4 360 Kč, 15 kleštin, bez RS485) |

### Srovnání nabídek (15. 11. 2026)
| | Cena | Celkem s kvalitní kleštinou a klíči (odhad) | Odkud | Dodání | Měnič | RS485 | Kleštiny | Recenze |
|---|---|---|---|---|---|---|---|---|
| A: EUCNC | 3 814 Kč | ~4 200 Kč | PL | 19.–24. 11. | HS320 | ❌ | 13 | 11 |
| B: HLTNC (CN) | ~4 620 Kč + možné clo | ~5 100 Kč | CN | 20. 12. – 26. 1. | EV210 | ✅ | 0 | 10 |
| C: HLTNC Eur (PL) | 4 360 Kč | ~4 700 Kč | PL | 19.–22. 11. | HS320 | ❌ | 15 | 70 |
| D: HLTNC Eur (PL) | 5 193 Kč | ~5 500 Kč | PL | 21.–26. 11. | HS320 | ❌ | 13 | 8 prodaných |
| E: HTNC 3,5 kW | 6 976 Kč | ~7 300 Kč | PL | 21.–27. 11. | HS320-4.0 | ❌ | 13 | 1 |
| **F: HLTNC EU CNC (DE)** | **4 053 Kč** | **~4 500 Kč** | DE | 21.–26. 11. | **EV210** | ✅ ověřeno | 0 | 7 |

**Předběžný verdikt:** ✅✅✅ **kupujeme sadu F** (po potvrzení 2,2 kW + EV210). Záloha: sada C. Nahrazuje EUCNC jako hlavního kandidáta.

---

## HLTNC sada: vzduchem chlazené hranaté vřeteno 2,2 kW GDZ80x73-2.2 + měnič EV210 + klíč ER20A (AliExpress)

- Odkaz: https://www.aliexpress.com/item/1005009648374545.html
- Prodejce: HLTNC Automation Store (Trader), 5,0 ★ / 10 recenzí, 51 prodaných kusů
- Testovací video prodejce: https://www.youtube.com/watch?v=v14uGhhOnDs
- Návod k měniči EV210 (Google Drive od prodejce): https://drive.google.com/file/d/1pspuUKvI0xf223TL7njRkUH-Sau6p7h1/view?usp=drive_link
- Obrázky: [obrazky/hltnc-2.2kw-er20-ev210/](obrazky/hltnc-2.2kw-er20-ev210/) (153 = stránka; 154 = obsah sady; 155 = vlastnosti; 156–157 = **výkres vřetena GDZ80x73-2.2** (patka 110 × 95, díry Ø7 30+35+35+35, drážka 80 × 6, ER20 M25×1,5, nos Ø58,5); 158 = **jumpery a schéma zapojení měniče EV210**)
- Aktualizace 15. 11.: AliHelper **„prodejci důvěřuje“** (HLTNC Automation Store, Brand+); 5,0 ★ / 10 recenzí, 51 prodaných, 929 ks; doprava Economy 1 600,55 Kč, **doručení 6. – 20. 1.** (odeslání do 14 dní)
- **Varianta, kterou chceme: „2.2KW 220V“** (měnič EV210-0022G-**S2**), ne 380V (T4)
- Cena (15. 11. 2026, výprodej 11.11): **3 020 Kč + doprava 1 600 Kč = ~4 620 Kč**, DPH v ceně. Doručení 20. 12. až 26. 1.

### Parametry vřetena (z obrázků prodejce)
| | |
|---|---|
| Model | GDZ80x73-2.2, vzduchem chlazené, **hranaté s přírubou** (ventilátor na zadní straně) |
| Výkon / otáčky | 2,2 kW, 24 000 ot/min při 400 Hz |
| Napětí / proud | 220 V / 6,5 A (ve 380V verzi 5 A) |
| Kleština | **ER20** (M25×1,5), stopky nástrojů až 13 mm, takže i 12 mm a ½" |
| Rozměry | délka 257 mm, výška 103 mm, šířka 82 mm, patka 110 × 95 mm; hřídel/čelo Ø58,5 |
| Montáž | patka se **4 otvory Ø7 na každé straně (rozteč 30 + 35 + 35 + 35 mm)** + drážka; přišroubuje se přímo na desku osy Z, **nepotřebuje držák 80 mm** |
| Hmotnost | 4,2 kg |
| Svorkovnice | svorkovnice na vřetenu (U, V, W + PE), kabel se dá snadno vyměnit za stíněný |

### Zapojení a jumpery měniče EV210 (z obrázku 158) – **RS485 potvrzeno**
| Jumper | Volba |
|---|---|
| J1 | zemnění řídicí desky: ⏚ / OFF (výchozí OFF) |
| J2 | analogový výstup AO: AVO = 0–10 V / ACO = 0–20 mA |
| J4 | potenciometr: P-I = na panelu (výchozí) / P-E = externí |
| J5 | analogový vstup AI: **AVI = 0–10 V** / ACI = 0–20 mA |

Svorky: R / S(L1) / T(L2) vstup, U / V / W / ⏚ motor, P− / P+ / PB brzdný odpor, **X1–X4 + COM** digitální vstupy (start/směr), **+10V / AI / GND** (potenciometr 5–10 kΩ nebo 0–10 V z řídicí desky), **AO / GND** analogový výstup, **485+ / 485−** RS485, **TA / TC** relé, J11 externí panel. Na displeji kombinace LED: Hz+A = otáčky, A+V = čas, Hz+V = %, Hz+A+V = teplota.

### Parametry měniče EV210-0022G-S2
| | |
|---|---|
| Vstup | **1F 220 V ±10 %**, 50/60 Hz, takže jde do běžné zásuvky 230 V |
| Výstup | 3F 0–220 V, 9,6 A, 2,2 kW |
| Rozměry | 72 × 146 × 105 mm, 685 g |
| Řízení | ovládací panel s potenciometrem, **analogový vstup AI 0–10 V / 0–20 mA**, digitální vstupy X1–X4 (start, směr), **RS485 (485+/485−)**, reléový výstup TA/TC, svorky P+/PB pro brzdný odpor, port RJ45 pro externí panel |
| Nastavení podle prodejce | P0-10=400, P0-12=400, P1-04=400, P1-05=24000, P7-03=H.401F, P7-12=20, P7-06=0.6000; tovární reset PP-01=2 |

### ⚡ K „chceme 1F 230 V, nechceme 3F“
- Vřeteno je **vždy třífázový motor**. Tři fáze ale vyrábí **měnič**: ze zásuvky 1F 230 V do měniče, z měniče 3 vodiče do vřetena. **Třífázovou přípojku nepotřebujete.**
- Proto je nutné objednat variantu **220V** (měnič S2, vstup 1PH 220 V). Varianta 380V (měnič T4) potřebuje 400 V přípojku.
- Odběr: 2,2 kW měnič na 1F bere ze sítě při plném zatížení odhadem 15–20 A ❓. Doporučuji **samostatný okruh s jističem 16 A, charakteristika C** (B16 může při rozběhu vyhazovat) a **proudový chránič typu A nebo F** (měniče svádějí do PE unikající proud, obyčejný chránič 30 mA typu AC může padat). V praxi hobby frézování málokdy jede na plný výkon.
- **Uzemnění je povinné** (PE svorka měniče i vřetena), mezi měnič a vřeteno patří **stíněný 4žilový kabel** (stínění na PE na straně měniče). Jinak ruší ESP32, koncáky i USB.
- Na vstup doporučuji **síťový EMI filtr** (např. 20 A jednofázový), v sadě není.

### Hodnocení

| | |
|---|---|
| ➕ | Velmi dobrá cena za kompletní sadu 2,2 kW (vřeteno + měnič + klíč), typicky 6–9 tis. Kč v EU |
| ➕ | **Bez vody**: žádné čerpadlo, nádrž, hadice ani riziko zamrznutí v nevytápěné dílně |
| ➕ | Hranatá patka: snadná a tuhá montáž na desku osy Z, odpadá držák |
| ➕ | ER20: pevnější a větší nástroje než ER11, vhodné na srovnávací frézy i velké stopky |
| ➕ | Měnič má **RS485 i analogový vstup 0–10 V**, takže jde řídit z ESP32 (viz níže) |
| ➖ | **Hlučnější** než vodní vřeteno, protože na hřídeli je ventilátor. Na fotce favorita je vodní, to je tišší |
| ➖ | Ventilátor **nasává prach**: na dřevo nutné dobré odsávání u nástroje, jinak se zanáší |
| ➖ | **Při nízkých otáčkách se chladí hůř** (ventilátor sedí na hřídeli). Dlouhodobě nejet pod ~8 000 ot/min. Asynchronní vřeteno má navíc v nízkých otáčkách malý moment, na hliník velkými frézami je to slabší |
| ➖ | Měnič **EV210 není v seznamu přímo podporovaných měničů FluidNC** (Huanyang, H2A, YL620, H100, NowForever…). Rešerše ale potvrdila, že FluidNC má **obecný `ModbusVFD`** a od verze 4.0.2 „Modbus command templates“, takže **s mapou registrů z manuálu EV210 jde RS485 rozchodit**. Záloha, která jde vždy: **analogově** (ESP32 PWM → převodník PWM/0–10 V → AI, start přes relé nebo optočlen na X1) |
| ✅ | **ER20 upne koupenou srovnávací frézu se stopkou 8 mm** ([nástroje](../prislusenstvi/nastroje-frezy.md)). **Kleština není v sadě, dokoupit ER20 8 mm (nebo sadu).** |
| ➖ | Neznámá značka, jen 10 recenzí, brzdný odpor není součástí (u frézky obvykle stačí nastavit delší dobu doběhu) |
| ⚠️ | Hmotnost 4,2 kg je pro Z osu motorem NEMA23 se SFU1605 v pohodě |

### Předběžný verdikt
⬇️ **Aktualizace 15. 11.: náhradník** – levnější, rychlejší a s kleštinami je **EUCNC 2,2 kW** (níže). Původně: **dobrý kandidát** a cenově velmi zajímavý. Zbývá rozhodnout **vzduch vs. voda**:
- **Vzduch (tahle sada):** jednodušší, bez údržby, do nevytápěné dílny; hlučnější, víc prachu do vřetena.
- **Voda (jako na fotce favorita):** tišší, lépe chlazené i v nízkých otáčkách; navíc čerpadlo, nádrž, hlídání průtoku a nemrznoucí kapalina.

Před objednáním si od prodejce vyžádat **manuál EV210 s tabulkou Modbus registrů** (je na Google Drive výše) a ověřit, zda jde o standardní Modbus RTU. Pak lze rozhodnout, jestli půjde řízení přes RS485 z FluidNC, nebo analogově.

---

## HTNC sada 0,8 kW kulaté vzduchem chlazené vřeteno ER11 + měnič 1,5 kW HS320 + držák 65 mm (AliExpress, sklad PL)

- Odkaz: https://www.aliexpress.com/item/1005011584424689.html
- Obrázky: [obrazky/htnc-0.8kw-er11-kit/](obrazky/htnc-0.8kw-er11-kit/) (64 = stránka; 65–66 = vlastnosti; 67 = varianty sad 01/02; 68–69 = parametry vřetena; 70–71 = výkres vřetena + držák 65 mm; 72 = kleštiny ER11; 73–74 = měniče HS320 / YL586K; 75–77 = zapojení měniče s řadiči Mach3/NVUM/DDCS (analog 0–10 V); 78–79 = zapojení vřetena + obsah balení)
- ⚠️ **AliHelper: „má pochybnosti o tomto prodejci“**; 4,9 ★ / 13 recenzí, 105 prodaných; zbývá 5 ks
- Cena (15. 11. 2026): **4 262 Kč** (varianta 220 V), doprava zdarma z Polska, bez cla, doručení 19. – 22. 11.

### Parametry
| | |
|---|---|
| Vřeteno | HFT65-0.8-ER11, **0,8 kW**, 24 000 ot/min, 400 Hz, 220 V / 3 A (110 V / 5 A), **Ø65 × 180 mm** (celkem 223 mm), 2,48 kg, 4 ložiska, konektor 4pin (U/V/W/PE) |
| Kleština | **ER11** (matice M14×0,75), sada kleštin Ø1–7 mm (+ dárek Ø4, Ø6) – **max 7 mm** |
| Měnič (220 V) | **HS320-1.5S1-220V**: 1F 220 V vstup, 1,5 kW, 7,0 A, 78 × 150 × 120 mm, 0,8 kg; svorky X1–X5, AVI/ACI (0–10 V / 4–20 mA), +10 V, AO1, TA/TB/TC, P+/PB. Nastavení pro analog: F0-02 = 1, F0-03 = 2 |
| Držák | hliník 65 mm, 102 × 62 × 50 mm, 4 díry |
| Balení | vřeteno, měnič, držák, klíč ER11A, kleštiny, konektor |

### Hodnocení
| | |
|---|---|
| ❌ | **ER11 neupne naši koupenou srovnávací frézu se stopkou 8 mm** (max 7 mm). Hlavní důvod proti |
| ❌ | **0,8 kW je na srovnávací frézu Ø39 mm málo** – výkonově srovnatelné s Parkside, kterou chceme nahradit kvůli výkonu |
| ❌ | **Dražší než HLTNC 2,2 kW ER20** (~4 620 Kč i s dopravou) – za podobné peníze 2,75× výkon a ER20 |
| ➕ | Sklad v PL (rychle), kompletní sada s držákem, lehké (2,5 kg); měnič HS320 má **analogový vstup 0–10 V** (ESP32 → PWM/0–10 V) |
| ❓ | RS485 u HS320 nezmíněno – nepodporovaný ve FluidNC přímo |

**Předběžný verdikt:** **nekupovat.** Pro náš účel (srovnávání desek, fréza Ø39 / stopka 8) je jasně lepší 2,2 kW s ER20 (**EUCNC**, případně HLTNC).

---

## ⭐⭐ EUCNC sada 2,2 kW hranaté vzduchem chlazené vřeteno HTZ80x73-2.2 ER20 + měnič HS320 2,2 kW + 13 kleštin, sklad Polsko (AliExpress)

- Odkaz: https://www.aliexpress.com/item/1005013148503286.html (název nabídky: „EU Shipping 2.2KW AC 200-240V Air Cooled Square Spindle… No VAT No Tariff“)
- Obrázky: [obrazky/eucnc-2.2kw-er20-hs320/](obrazky/eucnc-2.2kw-er20-hs320/) (129 = stránka; 130 = obsah balení; 131 = ventilátor; 132 = **výkres vřetena**; 133 = tabulka parametrů; 134 = měnič HS320 + rozměry; 135 = schéma zapojení; 136–137 = klíč a kleštiny ER20 1–13 mm)
- Popis produktu (PDF od prodejce, jen marketingový popis, **ne manuál měniče**): PDF (u prodejce)
- ⚠️ AliHelper: „tomuto prodejci nedůvěřuje“; dodavatel 4,9 ★ / 11 recenzí, 82 prodejů
- Cena (15. 11. 2026): **3 814 Kč**, **doprava zdarma z Polska**, cena vč. DPH, bez cla; doručení **19. – 24. 11.** (73,7 % do 5 dní); max 3 ks za tuto cenu

### Obsah sady
1× vřeteno 2,2 kW 220 V, 1× měnič **HS320-2.2S1-220V** (přednastavený), **1× externí ovládací panel + 3 m kabel**, **13× kleština ER20 (Ø1–13 mm, tedy i 8 mm pro naši srovnávací frézu)**, 1× klíč ER20A

### Parametry
| Vřeteno | |
|---|---|
| Model | **HTZ80x73-2.2**, vzduchem chlazené, hranaté s patkou |
| Výkon / napětí / proud | 2,2 kW / AC 200–240 V / 8,5 A |
| Frekvence / otáčky | 0–**300 Hz** → max **18 000 ot/min** |
| Kleština | ER20 (M25×1,5, matice SW21) |
| Rozměry | délka 256 mm, tělo 166 mm, nos Ø60, výška 73 mm (osa 36,5), patka **110 / 95 mm, díry 30 + 35 + 35 + 35 mm** – **stejné jako HLTNC** |
| Konektor | **průmyslový konektor s třmenem (typ Harting HAN)** – piny 1/2/3 = U/V/W + PE |
| Hmotnost | 4,25 kg (sada 6,5 kg) |

| Měnič HS320-2.2S1-220V | |
|---|---|
| Vstup | **1F 220 V**, 50/60 Hz |
| Výstup | 2,2 kW, 9,0 A |
| Rozměry | 86 × 136 × 162–173 mm, 1,0 kg |
| Svorky | N, L, W, V, U, PE, +DB (brzdný odpor); řídicí svorky jako u HS320 v sadě HTNC 0,8 kW: X1–X5, **AVI/ACI 0–10 V / 4–20 mA**, +10 V, AO1, relé TA/TB/TC |
| RS485 | ❓ **neuvedeno** → počítat s **analogovým řízením 0–10 V** z ESP32 (PWM → 0–10 V převodník) + start přes X1 |

### Srovnání s dosavadním kandidátem HLTNC (EV210)
| | **EUCNC (HS320)** | HLTNC (EV210) |
|---|---|---|
| Cena celkem | **3 814 Kč** | ~4 620 Kč (3 020 + 1 600 doprava) |
| Dodání | **19. – 24. 11. (PL)** | 6. – 20. 1. (Čína) |
| Max otáčky | 18 000 (300 Hz) | 24 000 (400 Hz) |
| Kleštiny | **13 ks ER20 1–13 mm v ceně** | žádné (dokoupit ~300–600 Kč) |
| Externí panel + 3 m kabel | **ano** | ne |
| RS485 | ❓ neuvedeno | **ano – potvrzeno schématem (485+/−)** |
| Konektor vřetena | průmyslový HAN | svorkovnice |
| Montáž | patka 110/95, stejné rozteče | patka 110/95 |
| Prodejce | 11 recenzí | HLTNC, 10 recenzí |

### Hodnocení
| | |
|---|---|
| ✅ | **Levnější, rychleji doma, kleštiny i 8 mm v ceně** – přímo použitelné pro koupenou srovnávací frézu |
| ✅ | **18 000 ot/min stačí**: pro srovnávací frézu Ø39 chceme ~12 000–16 000, pro 6–8 mm frézy do dřeva 16 000–18 000. 24 000 využije hlavně malé frézy (gravírování) |
| ✅ | Externí panel na 3 m kabelu → měnič v rozvaděči, ovládání na stroji |
| ✅ | 1F 230 V vstup (požadavek „žádné 3F“) |
| ⚠️ | **RS485 neověřeno** – řídit analogově (pro FluidNC běžné, `PWM` → 0–10 V modul + relé na X1). Zeptat se prodejce na manuál HS320 a Modbus |
| ⚠️ | Vzduchem chlazené: hlučnější, nasává prach → odsávání nutné (viz hubice) |
| ⚠️ | V popisu rozpor „do not exceed 24000 RPM“ vs. 18 000 / 300 Hz → **nastavit max 300 Hz** (už přednastaveno) |

**Předběžný verdikt:** ⬇️ **Aktualizace 15. 11.: záloha** – vybraná je sada **HLTNC EU CNC (DE) s měničem EV210 a RS485** (nahoře). Původně: ✅✅ hlavní kandidát (nahrazoval HLTNC EV210 z Číny). Před objednáním se zeptat prodejce: (1) má HS320 RS485/Modbus? (2) poslat manuál měniče.

---

## Držák vřetena / frézky (spindle mount clamp) Ø43 / 52 / 65 / 71 / 80 mm na profil (AliExpress, AUTOMATION PARTS Store)

- Odkaz: https://www.aliexpress.com/item/1005010264743655.html (název nabídky: „Router Spindle Mount Clamp Diameter 43/52/65/71/80mm“)
- Obrázky: [obrazky/automation-parts-spindle-clamp/](obrazky/automation-parts-spindle-clamp/) (146 = stránka; varianta 65 mm na hliníkových profilech)
- ✅ AliHelper: důvěryhodný; 5,0 ★ / 2 recenze, 37 prodaných; **Choice**, doprava zdarma, doručení 27. 11. – 2. 12.; max 20 ks
- Cena (15. 11. 2026, výprodej 11.11): **365 Kč** (varianta 71 mm), z 394 Kč
- Varianty: **43 / 52 / 65 / 71 / 80 mm**
- Materiál: hliník 6063-T5 černě eloxovaný, objímka se stahovacím šroubem, montáž 2 šrouby na čelní desku (profil 2040/2080 na fotce)

### K čemu by se hodil (podle průměru krku)
| Průměr | Pro co |
|---|---|
| 43 mm | eurokrk – AMB/Kress, Parkside? (ověřit) |
| 52 mm | malá vřetena 300–500 W |
| 65 mm | **Makita RT0700**, Katsu, vřetena 0,8–1,5 kW |
| 71 mm | Makita 3709, DeWalt DWP611 |
| 80 mm | kulatá vřetena 1,5–2,2 kW |

### Hodnocení
| | |
|---|---|
| ❌ | **Pro naše kandidátní vřeteno (EUCNC / HLTNC 2,2 kW, hranaté s patkou) nepotřebujeme** – to se šroubuje přímo patkou na desku osy Z |
| ⚠️ | Úzká objímka (~25–30 mm výšky) se 2 šrouby uchycení = slabé místo pro vřeteno 2,2 kW; vhodné spíš pro lehkou frézku |
| 🤔 | Hodil by se pro **přechodnou fázi**, pokud bychom nejdřív dali na novou osu Z **ruční frézku Parkside** (změřit průměr krku Parkside! často 43 mm eurokrk) |

**Předběžný verdikt:** zatím nekupovat. Pokud se rozhodne, že na novou osu Z půjde dočasně Parkside, **změřit průměr krku** a koupit odpovídající variantu.
