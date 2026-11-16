# Hotová řešení a alternativy – kandidáti, které jsme sami našli

## VEVOR router sled 64" / 1625 mm (ruční přípravek na srovnávání desek)

- Odkaz: https://eur.vevor.com/router-sled-c_10996/vevor-router-sled-64-inches-portable-and-easy-to-adjust-slab-flattening-jig-diy-woodworking-router-sled-for-flattening-slabs-slab-guide-jig-trimming-planing-machine-for-wood-flattening-home-diy-p_010163777189?lang=cs&currency=czk
- Screenshot: [obrazky/vevor-router-sled-1625.jpg](obrazky/vevor-router-sled-1625.jpg)
- Cena (15. 11. 2026): **4 301 Kč** (místo 4 763 Kč, Pre-Black Friday), doprava zdarma, hodnocení 4,5 / 144 recenzí
- Co to je: dvě hliníkové vodicí tyče (6061, stěna 2 mm) délky 1625 mm na červených ocelových nohách, výška nastavitelná 0–135 mm, vozík s deskou pro ruční frézku (horní frézka se upne do saní)
- Ovládání: **čistě ručně** (sáněmi se posouvá rukou)

### Hodnocení

| | |
|---|---|
| ✅ | Rychle a levně řeší **srovnávání velkých desek a river tables** (stejná práce jako na favoritní fotce), bez elektroniky |
| ❌ | **Není to CNC a nedá se na CNC předělat.** Tenkostěnné hliníkové trubky na 1,6 m se pod frézkou prohnou, vozík jezdí po trubkách bez lineárních ložisek a nemá kam přidat motor, šroub ani řemen. Rozpor s požadavkem „nezavřít si cestu k motorizaci“ |
| ❌ | Je to v podstatě stejný princip jako dosavadní prototyp (ruční frézka na vozíku na profilech) se stejnými problémy s přesností |
| 💡 | Má smysl jen jako **dočasné řešení** pro srovnávání desek, než bude CNC hotové. Pak zůstane jako přenosný přípravek na desky, které se na stůl CNC nevejdou |

**Předběžný verdikt:** nekupovat jako základ CNC. Peníze (~4 300 Kč) jsou lepší investice do vedení (např. SBR20 1800 za ~1 500 Kč + díly na osu Z). Koupit jen pokud potřebujete srovnávat desky hned teď.

---

## OpenBuilds V-Slot lineární aktuátor s řemenem + NEMA17 (AliExpress, Niuren 3D Parts Store)

- Odkaz: https://www.aliexpress.com/item/1005009262899272.html
- Screenshot: [obrazky/openbuilds-vslot-belt-actuator-nema17.jpg](obrazky/openbuilds-vslot-belt-actuator-nema17.jpg)
- Cena (15. 11. 2026, výprodej 11.11 do 18. 11.): **2 708 Kč** za variantu 2080–1000 mm s velkou deskou vozíku; doručení 23. 12. – 6. 1.; 4,9 ★ / 10 recenzí, 201 prodaných
- Obsah: profil V-slot 2020/2040/2060/2080 (250/500/1000 mm nebo bez profilu), Delrin V-kolečka s excentry, řemen GT2-2M, řemenice 30 zubů, motor NEMA17 76 oz·in (~0,54 Nm), deska vozíku 3 mm (malá 65,5×65,5 / velká 127×88 mm)
- Zdvih: 1000 mm profil → **855 mm**; 1500 mm → 1355 mm

### Parametry od prodejce (rozhodující)
| | |
|---|---|
| Přesnost | 0,10–0,20 mm, polohování 0,26 mm |
| **Max. síla** | **11 N (2,5 lb)** |
| Max. rychlost | ~10 000 mm/min |

### Hodnocení

| | |
|---|---|
| ❌ | **Na frézování naprosto nevhodné.** Max. síla 11 N odpovídá zhruba 1,1 kg. Řezné síly při frézování dřeva jsou desítky až stovky N, se srovnávací frézou Ø39 ještě víc. Motor by ztrácel kroky a řemen GT2 by pružil |
| ❌ | Je to **přesně princip prototypu v1**: plastová V-kolečka po hliníkovém profilu. Na hliníkovém profilu ji jen dotáhli do hezčího kitu. Přesnost 0,1–0,26 mm je bez zatížení, pod řeznou silou bude výrazně horší |
| ❌ | Deska vozíku 3 mm, NEMA17: na vřeteno 4,2 kg ani na trimovou frézku se to nehodí |
| ✅ | Hodí se na **lehké věci bez řezné síly**: laserový modul, plotter nebo tažný nůž, kamerový slider, posuv senzoru, testovací aktuátor pro ladění FluidNC na ESP32 na stole |
| 💡 | Pokud chcete hned **zkoušet elektroniku a FluidNC**, je levnější koupit jen NEMA17/NEMA23 + driver a točit motorem na stole, než kupovat tento kit |

**Předběžný verdikt:** nekupovat pro frézku. Za ~2 700 Kč je lepší koupit **sadu SFU1605 + BK/BF12 (~900–1 500 Kč) + NEMA23 s DM556 (~700–900 Kč)**, tedy základ motorizované osy Z, která dává řeznou sílu v řádu stovek N.

---

## Funssor DIY ACRO System – mechanický kit (AliExpress, Funssor Official Store)

- Odkaz: https://www.aliexpress.com/item/33031254217.html
- Screenshot: [obrazky/funssor-acro-kit.jpg](obrazky/funssor-acro-kit.jpg)
- Cena (15. 11. 2026): **1 276 Kč** varianta „No Extrusion“ (bez profilů) + doprava 1 859 Kč (!), celkem **~3 135 Kč**; doručení 27. 11. – 5. 12.; 4,6 ★ / 11 recenzí, 69 prodaných, zbývají 4 ks
- Co to je: klon systému **OpenBuilds ACRO**, kartézský XY portál z profilů V-slot 2020/2040 s V-kolečky a řemeny GT2, rohy z melaminu 6 mm, motory NEMA17. Zdvih **300 × 300 mm**, **bez osy Z**. Hmotnost ~1,4 kg (bez profilů)

### Hodnocení

| | |
|---|---|
| ❌ | **Není to frézka.** ACRO je navržený pro **laser a plotter**, tedy bez řezné síly a bez osy Z. Kolečka, GT2 a NEMA17 mají stejné limity jako aktuátor výše (síla v jednotkách až desítkách N) |
| ❌ | Plocha 300 × 300 mm je řádově menší, než potřebujeme (~1400 × 2000) |
| ❌ | Doprava dražší než samotný kit, profily nejsou v ceně |
| ✅ | Jako **samostatný laserový gravírovací stroj** nebo **testovací stolek pro ESP32/FluidNC** (2 osy, levný) je to OK. FluidNC laser mód umí |
| 💡 | Laserový modul lze později přidat i na velkou frézku (FluidNC umí přepínat vřeteno a laser), takže samostatný stroj není nutný |

**Předběžný verdikt:** pro frézku nekupovat. Jen pokud chcete **malý laser** jako samostatný projekt.

---

## Ruční přesný posuvný stolek 1D/2D („High Precision Manual Slide Table“, Yixindianqi Store, AliExpress)

- Odkaz: https://www.aliexpress.com/item/1005011905938129.html
- Screenshoty: [obrazky/manual-slide-table.jpg](obrazky/manual-slide-table.jpg) · [obrazky/manual-slide-table-40A-DB35.jpg](obrazky/manual-slide-table-40A-DB35.jpg)
- Účel podle prodejce: optické experimenty a mikropolohování v laboratoři
- Doprava 230 Kč, doručení 30. 12. – 13. 1.

| Varianta | Stolek | Zdvih | Přesnost | **Nosnost** | Cena |
|---|---|---|---|---|---|
| 20A-DB10 (s pružinou) | 45×12 mm | ±5 mm | – | – | 680 Kč |
| 40A-DB35 | 45×25 mm | 35 mm | 0,02 mm | **39 N (4 kg)** | 1 601 Kč |
| 40A-DB65 | 40×25 mm | 65 mm | 0,02 mm | **39 N (4 kg)** | 1 761 Kč |
| 60A-DB120 | 60×40 mm | 120 mm | 0,02 mm | **28 N (3 kg)** | 2 321 Kč |
| 80A-DB30 | 80 mm | 35 mm | (tabulka u prodejce nečitelná) | ? | 2 881 Kč |

Konstrukce: 2 vodicí tyče, nerezový závitový šroub, ruční kolečko, stupnice, zámek.

### Hodnocení
| | |
|---|---|
| ❌ | **Laboratorní mikropolohovací stolek, ne díl pro frézku.** Nosnost 3–4 kg je **méně než samotné vřeteno (4,2 kg)**, řezné síly ani nepočítaje. Zdvih 10–120 mm |
| ❌ | Přesnost 0,02 mm platí bez zatížení. Ruční šroub bez kuličkové matice, tenké tyče |
| ❌ | Drahé na to, co umí: za 1 600–2 900 Kč je sada **SFU1605 + BK/BF12** (~900–1 500 Kč) s nosností ve stovkách až tisících N |
| 🤔 | Jediné myslitelné využití: **jemné nastavení příslušenství** (např. senzor nástroje, kamera nebo laserový ukazatel pro nulování). To ale zatím nepotřebujeme |

**Předběžný verdikt:** nekupovat.

> Galerie obrázků: OpenBuilds aktuátor → [obrazky/openbuilds-vslot-aktuator/](obrazky/openbuilds-vslot-aktuator/) (9 = hlavní, 10–15 = rozměry desek vozíku, profily 2020–2080, montáž) · ruční stolek Yixindianqi → [obrazky/manual-slide-table-yixindianqi/](obrazky/manual-slide-table-yixindianqi/) (18–26: varianty 20A-DB10 až 80A-DB30, tabulky parametrů, detaily)

---

## ROYI – X Axis Manual Displacement Slide Table, DX20 (AliExpress, ROYI TOOL Store)

- Odkaz: https://www.aliexpress.com/item/1005013136985896.html
- Obrázky: [obrazky/royi-dx20/](obrazky/royi-dx20/) (27 = hlavní DX20-16, 28 = DX20-21, 29 = DX20 bez základny, 30–33 = výkresy DX20-16 / -21 / -35 / -DB16)
- ⚠️ **AliHelper: „tomuto prodejci nedůvěřuje“**, 6 prodaných, 1 hodnocení
- Doprava 125 Kč (zdarma nad 23 006 Kč), doručení 29. 11. – 9. 12.
- Popis prodejce: ruční posuvný stolek s „ball screw feeding“ (v tabulce je ale **závitový šroub z nerezu 304**, ne kuličkový), vodicí tyče GCr15 (ložisková ocel, HRC56, chromované), tělo hliník 6063 černě eloxovaný. Model DX = „D“ vedení tyčemi, „X“ osa X; 20 = velikost stolku 20×20 mm; číslo za pomlčkou = zdvih. Jedna otáčka knoflíku = posuv 0,7 mm. Pro aplikace, kde „přesnost není extrémně vysoká“

| Varianta | Stolek | Zdvih | Vodorovná nosnost | Hmotnost | Cena (1 ks) |
|---|---|---|---|---|---|
| DX20-16 bez základny | 20×20 mm | 16 mm | 29,4 N (3 kg) | 40 g | 796 Kč |
| DX20-21 bez základny | 20×20 mm | 21 mm | 29,4 N | 45 g | 877 Kč |
| DX20-35 bez základny | 20×20 mm | 35 mm | 29,4 N | 50 g | ? |
| DX20-DB16 se základnou a stupnicí | 20×20 mm | 16 mm | 29,4 N | 60 g | ? |
| DX20-DB21 / DB35 | 20×20 mm | 21 / 35 mm | 29,4 N | ? | ? |

Množstevní slevy: od 5 ks ~1 %, od 20 ks ~4 %.

### Hodnocení
| | |
|---|---|
| ❌ | Stejná kategorie jako stolek Yixindianqi výše: **miniaturní optický/laboratorní stolek**. Stolek 20×20 mm, zdvih do 35 mm, nosnost 3 kg |
| ❌ | Nedůvěryhodný prodejce, název slibuje kuličkový šroub, ale specifikace uvádí obyčejný závit |
| ❌ | Žádné využití na frézce (vřeteno 4,2 kg, zdvihy stovky mm) |

**Předběžný verdikt:** nekupovat.

---

## V-Openbuilds gantry deska s V-kolečky pro profil 2020/2040 (AliExpress, 3D-Future Store / SANBrother)

- Odkaz: neposlán (v konverzaci jako „1set 3D Printer Parts V-Openbuildd Wheels V Gantry Plat Set…“) – doplnit
- Obrázky: [obrazky/vslot-gantry-plate-kolecka/](obrazky/vslot-gantry-plate-kolecka/) (34 = varianta jen deska černá, 35 = stříbrná deska s černými B-kolečky)
- ⚠️ **AliHelper: „tomuto prodejci nedůvěřuje“**; 4,8 ★ / 40 recenzí, 399 prodaných
- Doprava 155 Kč, doručení 29. 11. – 5. 12.; balení 17×13×3 cm, 0,12 kg

| Varianta | Cena |
|---|---|
| Only Board Black (jen deska) | 129 Kč |
| Silver with B-wheel (deska + 4 kolečka) | 186 Kč |
| Black with B-wheel / Black with W-wheel / Silver with W-wheel / Only Board Silver | ~129–186 Kč (neuvedeno) |

### Hodnocení
| | |
|---|---|
| ❌ | **Přesně technologie prototypu v1** (plastová V-kolečka po profilu). Pro 3D tiskárny. Na frézku slepá ulička |

**Předběžný verdikt:** nekupovat.

---

## Z-Axis Height Adjuster – ruční zdvihací držák laserového modulu LTB100 (AliExpress, HUAHENGCHI Official Store)

- Odkaz: https://www.aliexpress.com/item/4001163449010.html
- Druhý odkaz na stejný produkt (z konverzace s tátou, stejná cena 896 Kč): https://www.aliexpress.com/item/1005006938420882.html
- Další obrázky: 109 = stránka (LTB100, 4,8 ★ / 9 recenzí, od 2 ks −5 %), 110 = detail, 111–112 = rozměry 48 × 104 / 152 mm a rozteče děr M3/M4/M5, 113 = pohled zepředu
- Obrázky: [obrazky/laser-z-adjuster-huahengchi/](obrazky/laser-z-adjuster-huahengchi/) (36 = stránka produktu, 37 = detail, 38–39 = rozměry a rozteče děr)
- ⚠️ **AliHelper: „tomuto prodejci nedůvěřuje“**; 4,8 ★ / 9 recenzí, 42 prodaných, 15 ks skladem
- Cena (15. 11. 2026, výprodej 11.11): **896 Kč** (z 1 078 Kč), od 2 ks −5 %; doprava zdarma, doručení 29. 11. – 5. 12.
- Varianta: LTB100

### Parametry (od prodejce)
| | |
|---|---|
| Rozměry | 57,4 × 19,7 × 152 mm (deska 48 × 104 mm, rozteč děr 40 mm) |
| Zdvih | **75 mm**, ruční |
| Pohon | šroub **M6×1** s rýhovaným knoflíkem (1 otáčka = 1 mm), 2 vodicí tyčky, aretační šroub |
| Montážní díry | M3 / M4 / M5, rozteče 16 / 20 / 21 / 24 / 26 mm, rastr 20 mm |
| Pro moduly | lasery Ø33 / 40 / 42 / 50 / 63 mm |
| Balení | držák, 4 imbusy, šrouby |

### Hodnocení
| | |
|---|---|
| ❌ | **Pro frézku ne:** určený na lehký laserový modul (~0,5–1 kg). Závit M6 a tenké tyčky neunesou vřeteno 4,2 kg s řeznými silami |
| 🤔 | **Pro budoucí laser na frézce dává smysl.** Ruční doostření výšky laseru vedle vřetena, kdyby se laserový modul montoval na desku osy Z. Kupovat až s laserem |

**Předběžný verdikt:** teď nekupovat. Případně později jako příslušenství k laseru.

---

## TEHIGHAUTO Mini Precision T-type Sliding Table, MGN12H + T8, NEMA17 (AliExpress, TOHIGHER-CNC Store)

- Odkaz: https://www.aliexpress.com/item/1005004934665805.html
- Obrázky: [obrazky/tehighauto-mini-ttype-sliding-table/](obrazky/tehighauto-mini-ttype-sliding-table/) (40–41 = stránka a varianty, 42 = obsah balení + nabízený driver TB6600, 43 = výkres stolu, 44 = výkres motoru NEMA17, 45 = detail vozíku MGN12H, 46 = šroub T8, 47 = kabel motoru, 48 = sestava, 49 = motory)
- ⚠️ **AliHelper: „tomuto prodejci nedůvěřuje“**; 58 prodaných, 89–98 ks skladem
- Doprava **769 Kč** (!), doručení 23. 12. – 6. 1.; od 2 ks −2 %
- Balení: posuvný stůl, spojka, motor NEMA17 s kabelem 1 m (konektor PH2.0-6P / DuPont 2,54-4P). Driver TB6600 (9–42 V DC, max 3,5 A, mikrokrok do 1/32) prodejce nabízí zvlášť

### Varianty a ceny (výprodej 11.11 do 18. 11.)
| Motor | Stoupání | Zdvih | Cena |
|---|---|---|---|
| 0,28 Nm (34 mm) | 2 mm | 200 mm | 1 499 Kč |
| 0,7 Nm (60 mm) | 2 mm | 200 mm | 1 679 Kč |
| 0,42 Nm (40 mm) / 0,56 Nm (48 mm) | 2 / 4 / 8 mm | 50–400 mm | (neuvedeno) |

### Parametry (od prodejce)
| | |
|---|---|
| Nosnost | **vodorovně 15 kg, svisle 5 kg** (max) |
| Deska vozíku | 50 × 40 mm (výkres: 50 × 28/35 mm, 4× M4) |
| Vedení | 1× kolejnice **MGN12**, vozík MGN12H |
| Šroub | **trapézový T8** (Ø 8, stoupání 2 / 4 / 8 mm), samosvorný, „C7“ |
| Opakovatelnost | 0,03 mm; max rychlost 80 mm/s |
| Rozměry | profil 40 × 56 mm, délka = zdvih + 89 mm |
| Motor | NEMA17 hybridní, 1,8°, 0,28 / 0,42 / 0,56 / 0,70 Nm, hřídel Ø5 |

### Hodnocení
| | |
|---|---|
| ➕ | Je to už „správný směr“: profilové vedení MGN12 a hotový modul se šroubem a motorem. Lepší než kolečka a holé tyče |
| ❌ | **Svislá nosnost 5 kg** = jen o kousek víc než vřeteno (4,2 kg), **bez jakékoli rezervy na řezné síly** a klopný moment od vyložení nástroje |
| ❌ | **Jedna kolejnice MGN12** s jedním vozíkem: malá tuhost proti klopení (vřeteno předsazené před vozík) |
| ❌ | **T8 trapézový šroub** (vůle, opotřebení) a **NEMA17 0,28–0,7 Nm**. Na Z s vřetenem a frézou Ø39 slabé |
| ❌ | TB6600 je levný driver, často s falešnými parametry (komunita doporučuje DM542/DM556) |
| ❌ | Doprava 769 Kč → celkem ~2 300–2 450 Kč |
| ✅ | Hodí se jako **Z osa pro laser nebo lehkou trimovou frézku (~1,5 kg)**, případně jako **testovací osa pro ladění ESP32/FluidNC** na stole |

**Srovnání pro osu Z s vřetenem 2,2 kW:** za podobnou cenu (~2 400 Kč) vyjde **sada SFU1605 + BK/BF12 + 2× HGR20 300 mm se 4 vozíky** (~1 700–2 200 Kč) a k ní NEMA23 + DM556 (~700–900 Kč). Nosnost stovky kg, tuhost řádově vyšší. Hotový modul na vřeteno: GX150 (~5 600 Kč), viz [katalog](katalog.md).

**Předběžný verdikt:** pro osu Z frézky nekupovat. Případně levnější varianta jako testovací osa pro ladění elektroniky.

---

## HPV8 OpenBuilds Mini V-Slot lineární modul s řemenem, NEMA17 (AliExpress, Guangzhou LiChi Electromechanical)

- Odkaz: https://www.aliexpress.com/item/1005010543152148.html
- Obrázky: [obrazky/lichi-hpv8-vslot-belt/](obrazky/lichi-hpv8-vslot-belt/) (50 = stránka a varianty, 51 = výkres, 52 = tabulky zatížení, 53 = detaily koleček a řemenu)
- ✅ AliHelper: prodejce důvěryhodný; 5,0 ★ / 1 recenze, 24 prodaných
- Cena (15. 11. 2026, výprodej 11.11 do 18. 11.): **822 Kč** (zdvih 250 mm), od 3 ks −3 %; doprava **342 Kč**, doručení 25. 11. – 4. 12. → celkem ~1 165 Kč
- Varianty zdvihu: 150 / 200 / 250 / 300 / 350 / 400 / 450 / 500 mm; motor HPV8-17HS3401S (NEMA17, 34 mm)
- Balení 5 × 5 × 5 cm, 1,5 kg; deklarováno CE, FCC, RoHS

### Parametry (od prodejce)
| | |
|---|---|
| Typ | „synchronous tape linear module“: profil V-slot 2040, **vozík na 4 V-kolečkách**, motor NEMA17 přímo na vozíku, pastorek s řemenem GT2 (omega) |
| Deska vozíku | 86 × 60 mm, 4× M4 (rozteč 32 × 12) |
| Přesnost polohování | 0,05 mm |
| „Referenční zatížení“ | 10 kg |
| **Vodorovné zatížení podle tabulky** | 1,1–1,9 kg (motor 34 mm), max 4,5 kg (60 mm) podle otáček |
| Svislé zatížení (HPV10 s 1605) | ~0,75–3,1 kg (tabulka obsahuje zjevně chybné hodnoty 45–77 kg u 420 ot/min) |

### Hodnocení
| | |
|---|---|
| ❌ | **Stejná třída jako OpenBuilds aktuátor**: V-kolečka po profilu, řemen GT2 a NEMA17. Tabulka prodejce sama uvádí vodorovnou nosnost **~1–2 kg** se standardním motorem |
| ❌ | Zdvih max 500 mm, na frézu nepoužitelné |
| 💡 | Zajímavý detail: **pohon „omega“ s motorem na vozíku a řemenem napnutým staticky podél profilu**. Stejný princip jako na fotce favorita, ale tam s HTD řemenem, NEMA23 a profilovým vedením. Princip si vzít, díl ne |

**Předběžný verdikt:** nekupovat.

---

## YUN DUAN DXG6042 – lineární modul s kuličkovým šroubem SFU1204/1605/1610 a vedením MGN12 (AliExpress, YUN DUAN Industrial 3nd Store)

- Odkaz: https://www.aliexpress.com/item/1005005310449620.html
- Obrázky: [obrazky/yunduan-dxg6042-ballscrew-module/](obrazky/yunduan-dxg6042-ballscrew-module/) (54 = stránka a varianty)
- ⚠️ **AliHelper: „tomuto prodejci nedůvěřuje“**; 5,0 ★ / 4 recenze, 44 prodaných, 97 ks skladem
- Cena (15. 11. 2026, výprodej 11.11 do 18. 11.): **2 057 Kč** (SFU1605, deska 60×42, zdvih 200 mm), z 2 286 Kč; od 2 ks −2 %; **doprava zdarma**, doručení 23. 12. – 6. 1.
- Varianty zdvihu: 100–1200 mm (100, 200, …, 900, 1000, 1100, 1200); šroub SFU1204 / 1605 / 1610; deska vozíku 60×42 nebo 60×48 mm. **Bez motoru**

### Parametry (od prodejce)
| | |
|---|---|
| Šroub | **kuličkový C7**, SFU1204 / 1605 / 1610 |
| Vedení | **1× kolejnice MGW12R (široká MGN12), vozík MGW12C** |
| Nosnost | vodorovně 60 kg, **svisle 30 kg** |
| Opakovatelnost | 0,02–0,03 mm; max 500 mm/s |
| Konstrukce | hliníkový profil, deska vozíku 60 × 42 / 60 × 48 mm |

### Hodnocení
| | |
|---|---|
| ➕ | **Nejlepší modul z dosud poslaných:** konečně **kuličkový šroub SFU1605** a profilové vedení. Svislá nosnost 30 kg má proti vřetenu 4,2 kg rozumnou rezervu |
| ➕ | Doprava zdarma; zdvih až 1 200 mm (teoreticky i jako osa X malého stroje) |
| ⚠️ | **Jen jedna kolejnice MGW12** (široká verze MGN12) a malá deska 60×42 mm. Vřeteno na držáku je vyložené dopředu, takže klopný moment nese jeden malý vozík. Na frézu Ø39 se srovnáváním je to slabé místo |
| ⚠️ | Deska vozíku 60×42 je menší než patka vřetena HLTNC (110×95). Byla by potřeba **přídavná deska** (hliník 10–15 mm), která páku ještě zvětší |
| ⚠️ | Nedůvěryhodný prodejce, jen 4 recenze |
| ⚖️ | Pro srovnání: GX150 (2× HGR20 + SFU1605, šířka 150 mm) ~5 600 Kč, nebo vlastní Z z dílů ~2 400–3 000 Kč (2 kolejnice HGR20 + 4 vozíky + SFU1605 + deska) |

**Předběžný verdikt:** **použitelné pro osu Z s menším vřetenem nebo s ruční frézkou** (zdvih 200–300 mm, SFU1605). Pro vřeteno 2,2 kW se srovnávací frézou Ø39 je lepší **vlastní Z se dvěma kolejnicemi HGR15/20** nebo modul šířky 150 mm. Zatím ponechat jako **záložní kandidát**.

---

## Universal V-Slot Gantry Plate 20 / 20–80 / 100 mm (AliExpress, AUTOMATION PARTS Store)

- Odkaz: https://www.aliexpress.com/item/1005010240669849.html
- Obrázky: [obrazky/vslot-gantry-plate-automation-parts/](obrazky/vslot-gantry-plate-automation-parts/) (55 = stránka s výkresem a tabulkou rozměrů)
- ✅ AliHelper: důvěryhodný; 5,0 ★ / 5 recenzí, 52 prodaných; Choice
- Cena (15. 11. 2026, výprodej 11.11): **207 Kč** (varianta 20–80 mm), doprava zdarma nad 220 Kč, doručení 27. 11. – 2. 12.; max 20 ks na zákazníka
- Varianty: 20 mm / 20–80 mm / 100 mm (pro šířku profilu)
- Rozměry (20–80): **127 × 88 × 3 mm**, rastr děr 20 mm, díry Ø7,1 / 5 / 5,1, drážky 3 mm; hliník 6063-T5 černě eloxovaný; 0,18 kg
- Jen holá deska, bez koleček

### Hodnocení
| | |
|---|---|
| ❌ | Deska vozíku pro **V-kolečka** (systém OpenBuilds), tloušťka **3 mm** – na frézku příliš tenká a celý systém koleček je slepá ulička |
| 🤔 | Jedině jako **montážní/adaptérová destička** pro lehké věci (elektronika, koncáky, držák kabelů). Na to stačí i kus plechu |

**Předběžný verdikt:** nekupovat.

---

## BULK-MAN 3D – V-Slot Linear Actuator End Mount / Motor Plate PL10-2 (AliExpress, BULK-MAN 3D TECH Store)

- Odkaz: https://www.aliexpress.com/item/1005006946773875.html
- Obrázky: [obrazky/bulkman-vslot-end-mount-pl10-2/](obrazky/bulkman-vslot-end-mount-pl10-2/) (56 = stránka produktu)
- ✅ AliHelper: důvěryhodný; 4,8 ★ / 19 recenzí, 143 prodaných; Choice
- Cena (15. 11. 2026): **104 Kč / ks**, od 2 ks 99,69 Kč; doprava zdarma nad 220 Kč, doručení 26. 11. – 2. 12.
- Co to je: ohýbaná koncová deska (end mount) pro V-slot lineární aktuátor (C-beam) s přírubou pro motor **NEMA17 / NEMA23** ❓ na čele; hliník 6063-T5 černě eloxovaný; rozměry **86,33 × 54,9 mm, tloušťka 1,6 mm** (dle popisu)

### Hodnocení
| | |
|---|---|
| ❌ | Tloušťka 1,6 mm a koncept V-slot aktuátoru (C-beam se šroubem T8): na frézku nepoužitelné jako nosný díl |
| 🤔 | Případně jako **levný provizorní držák motoru** pro testování elektroniky na stole |

**Předběžný verdikt:** nekupovat. Držák motoru pro naši osu Z bude součástí sady BK12 / desky Z (NEMA23).

---

## BULK-MAN 3D – OpenBuilds Double Wide C-Beam Gantry Cart PL16-VW (jen vozík, bez profilu) (AliExpress, BULK-MAN 3D TECH Store)

- Odkaz: https://www.aliexpress.com/item/1005012221394976.html
- Obrázky: [obrazky/bulkman-cbeam-double-gantry-pl16/](obrazky/bulkman-cbeam-double-gantry-pl16/) (80 = stránka, 81 = obsah sady, 82 = výkres desky, 83 = vozík na profilu C-beam 4080, 84 = ilustrační sestava s NEMA23 a šroubem – v sadě jen vozík)
- ✅ AliHelper: důvěryhodný; 27 prodaných; Choice
- Cena (15. 11. 2026, výprodej 11.11): **675 Kč** (z 753 Kč), doprava zdarma, doručení 26. 11. – 2. 12.
- Varianty: Black Wheel / White Wheel
- **Bez profilu** (pro C-beam 4080 / dvojitý C-beam), bez šroubu a motoru

### Obsah sady
1× deska Double Gantry (6061-T5, **77,5 × 155 × 6 mm**), 8× Mini V-kolečko, 4× distanc 6 mm, 4× excentrický distanc 6 mm, 8× šroub M5×25, **1× ACME anti-backlash matice (blok)**, 2× šroub M5×20, 2× distanc 3 mm, 2× pojistná matice M5. Navrženo pro pohon **trapézovým šroubem** (ACME/T8) uvnitř C-profilu

### Hodnocení
| | |
|---|---|
| ➕ | Z OpenBuilds dílů nejtužší varianta (deska 6 mm, 8 koleček, C-beam) – na **trimovou frézku** se z ní staví malé stroje (OpenBuilds C-Beam Machine) |
| ❌ | Pořád **plastová V-kolečka po hliníkovém profilu** = princip prototypu v1. Plus T8/ACME matice s vůlí |
| ❌ | Bez profilu C-beam (dražší profil ~1 000+ Kč/m) a šroubu – celkem by to vyšlo dráž než sada SFU1605 + HGR20 |
| ❌ | Na vřeteno 2,2 kW (4,2 kg) a srovnávací frézu Ø39 nevhodné |

**Předběžný verdikt:** nekupovat.

---

## BULK-MAN 3D – OpenBuilds Mini V-Wheel Gantry Plate, Standard Size (AliExpress, BULK-MAN 3D TECH Store)

- Odkaz: https://www.aliexpress.com/item/1005009742497229.html (v konverzaci jako „Openbuilds Mini V-Wheel Gantry Plate“)
- Obrázky: [obrazky/bulkman-mini-vwheel-plate/](obrazky/bulkman-mini-vwheel-plate/) (85 = varianta 1 ks, 86 = 4 ks)
- ✅ AliHelper: důvěryhodný; 5,0 ★ / 1 recenze, 39 prodaných; Choice
- Cena (15. 11. 2026, výprodej 11.11): **123 Kč / 1 ks** (od 2 ks 116 Kč), **327 Kč / 4 ks** (od 2 balení 321 Kč); doprava zdarma nad 220 Kč, doručení 26. 11. – 2. 12.
- Deska 6063-T5 černě eloxovaná, **6 × 50 × 50 mm**, pro Mini V-kolečka na profil 20 mm (na fotce s řemenem GT2) – samotná deska (kolečka zvlášť ❓)

### Hodnocení
| | |
|---|---|
| ❌ | Nejmenší OpenBuilds vozík (50×50 mm) pro 3D tiskárny a lasery, V-kolečka po profilu 2020 – na frézku nepoužitelné |

**Předběžný verdikt:** nekupovat.

---

## JEEL – Z Axis Module Adjustment Holder pro laserový modul 33/40/51/60 mm (AliExpress, JEEL Store, Brand+)

- Odkaz: https://www.aliexpress.com/item/1005003172212659.html (v konverzaci s tátou dříve jako neidentifikovaný odkaz)
- Obrázky: [obrazky/jeel-laser-z-module/](obrazky/jeel-laser-z-module/) (87 = stránka, 88 = pohled zepředu, 89 = výkres čelní desky 58×98, 90 = výkres zadní desky 60 mm, 91 = detail, 92 = platební podmínky prodejce, 93–94 = s laserem 40 W na profilu 2020 – **laser není součástí**)
- Prodejce: JEEL Store (Brand+, značka CRONOS); 4,0 ★ / 2 recenze, 24 prodaných; 55 ks skladem
- Cena (15. 11. 2026, výprodej 11.11): **691 Kč** (z 833 Kč), varianta **No motor**; doprava zdarma, doručení 28. 11. – 5. 12.
- Parametry: **účinný zdvih 55 mm**, akrylát (plexi) 5–6 mm, montáž na profil **2020** (V-kolečka), ruční kolečko + trapézový šroub, 2 vodicí tyčky; čelní deska 58 × 98 mm (rozteče 16/20/48/52 mm, drážky), zadní deska 60 mm (díry 46 a 30 mm). Balení 15×20×15 cm, 1 kg
- Obsah: 1× Z modul (bez motoru), 4× šroub pro uchycení laseru

### Hodnocení
| | |
|---|---|
| ❌ | **Konstrukce z plexi (akrylátu)** – na frézku vůbec ne (viz hodnocení plexi: křehké, praská u šroubů) |
| ❌ | Zdvih 55 mm, pro laser na profil 2020 (V-kolečka) |
| 🤔 | Jen pro **samostatný diodový laser** na profilech 2020. Pro laser na naší frézce (FluidNC umí laser i vřeteno) by laser jezdil s osou Z frézky a doostřoval se jí – tento modul by nebyl potřeba |

**Předběžný verdikt:** nekupovat.

---

## ✅ Lineární modul 200 mm s kuličkovým šroubem Ø16 a 2 vodicími tyčemi, ruční kolo s aretací (Allegro, weibacar) – osa Z

- Odkaz (nabídka): https://allegro.cz/nabidka/linearni-vozik-lozisko-voditko-cnc-200mm-2osy-18760345169
- Obrázky: [obrazky/allegro-weibacar-modul-z-200mm-sfu1605/](obrazky/allegro-weibacar-modul-z-200mm-sfu1605/)
- Název nabídky: LINEÁRNÍ VOZÍK LOŽISKO VODÍTKO CNC 200mm 2osý (model 1012210003112, EAN 0792172890540, celní kód 84821090, „žádná značka“)
- Prodejce: **weibacar** (Super prodejce, firma, 97,8 % doporučuje), odesílá se ze **skladu Allegro**, faktura s DPH
- Cena (15. 11. 2026): **1 597 Kč** (místo 1 682 Kč, −5 %, platí do 30. 11. 2026), skladem 2 ks. Doprava **od 115 Kč**, zdarma s Allegro Smart. Splátky 3× 532 Kč
- Doručení: předpoklad st 18. 11. – čt 19. 11. 2026; vrácení zdarma 14 dní, Allegro bezpečný nákup
- Stejný produkt od jiných prodejců: 7 nabídek, nejlevnější **1 355 Kč**, nejdražší 3 151 Kč (ověřit, jestli jde opravdu o stejný kus a jaké je poštovné)
- Hodnocení: 5,00 (1 hodnocení). Recenze (24. 7. 2026, přeloženo z polštiny): „Za tyhle peníze není nic lepšího. Na vodítku je minimální vůle, ale v mém případě to nevadí. Ruční kolo jsem nahradil krokovým motorem s držákem z 3D tiskárny.“ Klady: cena, stabilní konstrukce. Zápory: minimální vůle na vodítku
- Parametry (z popisu, strojový překlad):
  - lineární posuvný stůl, hliníková slitina, černě eloxované díly, CNC obrobené
  - efektivní zdvih **cca 200 mm**
  - **kuličkový šroub Ø16** (pravděpodobně SFU1605), vedení 2× tvrzená chromovaná optická osa s lineárními ložisky
  - zatížení **vodorovně 20 kg, svisle 10 kg** (přibližně)
  - opakovatelnost polohování 0,03–0,05 mm
  - ovládání ruční klikou (kolem) s aretací
  - rozměry z nákresu: 20 / 9 / 50 / 32 / 56 / 80 / 25 / 15 / 12 / 82 / 60 / 50 / 30 mm (šířka modulu ~80–82 mm, vozík ~60 × 50 mm)
  - balení: 1× lineární stolek, 1× aretační klíč, 1× ruční kolo, 1× návod
- V košíku (15. 11.): spolu s plexi 10 mm 200×300 (3DM_Plastics, 315 Kč + 55 Kč), VEVOR SBR20 1800 (1 514 Kč) a SucceBuy SBR20 1000 (893 Kč) → hodnota produktů **4 319 Kč**, doprava od **170 Kč**, celkem **4 489 Kč** (4 zásilky)

### Hodnocení

| | |
|---|---|
| ➕ | O ~1 200 Kč levnější než GGP5080 z AliExpressu (2 910 Kč s dopravou) a se stejnou koncepcí: 2 tyče + kuličkový šroub Ø16, zdvih 200 mm |
| ➕ | Ruční kolo s aretací → osa Z jde používat hned ručně, motor se dá dodělat později |
| ➕ | Sklad Allegro, doručení za 3–4 dny |
| ➖ | Bez držáku motoru – pro NEMA23 dokoupit/vyrobit přírubu a spojku (místo ručního kola) |
| ➖ | Svislé zatížení jen ~10 kg; vřeteno 2,2 kW má 5–6 kg + řezné síly → stačí, ale bez rezervy. Tyče Ø12–16 mm mají v ložiskách malou vůli (viz recenze) |
| ⚠️ | Ověřit průměr vodicích tyčí, rozteč děr vozíku (kvůli přírubě vřetena) a čep šroubu pro spojku |

**Předběžný verdikt:** ✅ bereme na **osu Z** místo GGP5080 – stejné řešení, levnější a hned dostupné. Zvážit levnější nabídku téhož produktu za 1 355 Kč.

---

## TEHIGHAUTO GGP5080 / GGP-YR90 – posuvný stůl s kuličkovým šroubem SFU1204/1605/1610 a 2 kruhovými tyčemi (AliExpress, TOHIGHER PRIME Store)

- Odkaz: https://www.aliexpress.com/item/1005011619914764.html
- Obrázky: [obrazky/tehighauto-ggp5080-ggp-yr90/](obrazky/tehighauto-ggp5080-ggp-yr90/) (95 = stránka a varianty; 96 = parametry GGP5080; 97 = parametry GGP-YR90; 98 = verze s ručním kolem a stupnicí; 99–100 = výkres GGP5080; 101 = výkres M-GGP5080 s ručním kolem; 102 = výkres GGP-YR90; 103 = výkres M-GGP-YR90; 104 = tyče, matice, ložiska; 105–106 = ložiska XUDZ, šroub, spojka; 107 = detaily; 108 = sestavy XYZ)
- ⚠️ **AliHelper: „tomuto prodejci nedůvěřuje“**; 5,0 ★ / 3 recenze, 11 prodaných, 188 ks skladem
- Cena (15. 11. 2026): **2 111 Kč** (GGP5080, SFU1610, zdvih 200 mm) + doprava **799 Kč** → **~2 910 Kč**; od 2 ks −2 %; doručení 23. 12. – 6. 1.
- Varianty: typ GGP5080 / GGP-YR90 / M-GGP5080 (ruční kolo) / M-GGP-YR90 (ruční kolo se stupnicí a aretací); šroub SFU1204 / 1605 / 1610; zdvih 50–500 mm (600–1000 vyprodáno)
- Obsah (Only Slide Table): stůl + spojka 8×8 mm pro NEMA23 (5 / 14 mm na přání). Bez motoru

### Parametry
| | GGP5080 | GGP-YR90 (vylepšená) |
|---|---|---|
| Vedení | **2× kruhová tyč Ø12 mm** | **2× kruhová tyč Ø16 mm** |
| Šroub | SFU1204 / 1605 / 1610, C7 | SFU1605 / 1610, C7 |
| Deska vozíku | 50 × 80 mm (4× M5) | 45 × 90 / 110 mm (4× M5/M6) |
| Nosnost vodorovně / svisle | 40 / **20 kg** | 60 / **30 kg** |
| Opakovatelnost | 0,05 mm | ±0,03 (resp. ±0,3 dle tabulky ❓) |
| Celková délka | zdvih + 120 mm | zdvih + 158 / 187 mm |
| Šířka / výška | 80 × 56–68 mm | 90 × 72–80 mm |
| Motor | NEMA17/23 | NEMA23 (servo 60 mm na přání) |
| Ložiska | „Japonská XUDZ“ | dtto |
| Max rychlost | 100 mm/s (1605: 250, 1610: 500 mm/s) | |

### Hodnocení
| | |
|---|---|
| ➕ | Kuličkový šroub SFU1605/1610 C7, příruba NEMA23, verze s **ručním kolem se stupnicí a aretací** (M-) – hezky odpovídá etapě „ručně → motor“ |
| ❌ | **Vedení = kruhové tyče Ø12 / Ø16 podepřené jen na koncích** – „kulatina se prohýbá“. U zdvihu 200 mm je průhyb malý, ale tyče v kluzných/kuličkových pouzdrech jsou proti klopení výrazně měkčí než 2× HGR20 |
| ❌ | Malá deska 50×80 / 45×110 mm: vřeteno (patka 110×95) by šlo jen přes přídavnou desku → páka |
| ❌ | Nedůvěryhodný prodejce, doprava 799 Kč, dodání až po Vánocích → ~2 900 Kč |
| ⚖️ | Za ~2 900 Kč: **vlastní Z = HLTNC sada SFU1605 (1 354 Kč) + 2× HGR20 300 mm se 4 vozíky (~900–1 300 Kč)** – tužší a rychleji doma (sklad PL) |

**Předběžný verdikt:** nekupovat pro vřeteno 2,2 kW. **M-GGP-YR90** (Ø16, SFU1605, ruční kolo) by šla pro **lehčí ruční frézku/laser** jako ručně stavitelná osa Z.

---

## Twotrees – ruční Z-držák laserové hlavy (AliExpress, Shop1103617776 Store)

- Odkaz: https://www.aliexpress.com/item/1005012386167875.html
- Obrázky: [obrazky/twotrees-laser-z-bracket/](obrazky/twotrees-laser-z-bracket/) (114 = stránka, 115 = detail, 116–117 = rozměry 115,8 × 36 × 24,5 mm, 118 = horní/spodní čelo, 119 = rozteče děr přední/zadní (M3, 16/40 mm), 120 = na profilu s V-kolečky)
- ⚠️ **AliHelper: „tomuto prodejci nedůvěřuje“**; 1 prodaný kus
- Cena (15. 11. 2026, výprodej 11.11): **258 Kč** (z 325 Kč), max 1 ks za tuto cenu; doprava **196 Kč** → ~455 Kč; doručení 25. 11. – 2. 12.
- Parametry: ohýbaný ocelový/hliníkový plech, 2 tyčky + závit M6 s rýhovaným knoflíkem, aretační šroub, zdvih ~76 mm (deska 54 × 40 mm, zadní 83 × 36 mm), 0,5 kg

### Hodnocení
| | |
|---|---|
| ❌ | Stejná kategorie jako HUAHENGCHI LTB100 a JEEL: **ruční doostření laseru**, ne osa frézky |
| 💡 | Pokud by se někdy řešil laser: tento je nejlevnější (~455 Kč s dopravou), ale nedůvěryhodný prodejce; HUAHENGCHI má víc recenzí |

**Předběžný verdikt:** nekupovat (laser teď neřešíme).

---

## XHC / Juxinhc – křížový válečkový stolek VRU2 (cross roller guide) VRU2035–VRU2125 (AliExpress, Juxinhc Store)

- Odkaz: https://www.aliexpress.com/item/1005011919719411.html
- Obrázky: [obrazky/juxinhc-vru2-cross-roller/](obrazky/juxinhc-vru2-cross-roller/) (149 = stránka; černý stolek s deskou a dvěma lištami s křížovými válečky)
- ⚠️ AliHelper: „tomuto prodejci nedůvěřuje“; 13 prodaných, 195 ks skladem
- Cena (15. 11. 2026, výprodej 11.11): **1 075 Kč** (VRU2-35), z 1 282 Kč; od 3 ks −2 %; doprava zdarma, doručení 30. 11. – 9. 12.
- Varianty (podle zdvihu / délky): **VRU2-35 / 50 / 65 / 80 / 95 / 110 / 125** (číslo ≈ délka lišty v mm, zdvih jen několik desítek mm)
- Popis: stolek bez pohonu (jen vedení), 2 lišty s **křížovými válečky** (cross roller), horní a spodní deska s otvory; balení 40 × 20 × 20 cm, 0,4 kg

### Hodnocení
| | |
|---|---|
| ➕ | Křížové válečky = velmi přesné a tuhé vedení **na krátké zdvihy** (měřicí a optické stolky, přesné posuvy) |
| ❌ | **Zdvih jen desítky mm** (VRU2-125 ≈ max ~80 mm) – na žádnou osu frézky nestačí |
| ❌ | Bez pohonu; za 1 075 Kč malý laboratorní díl |
| 🤔 | Použitelné leda pro **přesný mikroposuv přípravku** (např. senzor délky nástroje) – zatím nepotřebujeme |

**Předběžný verdikt:** nekupovat.

---

## OpenBuilds Z-axis T8 Lead Screw 4080 C-Beam lineární aktuátor 150/200/250 mm (AliExpress, AUTOMATION PARTS Store / BULK-MAN 3D)

- Odkaz: https://www.aliexpress.com/item/1005008300169781.html (z konverzace s tátou: „10% Openbuilds Z-axis T8 Lead Screw 4080 C-Beam…“)
- Obrázky: [obrazky/openbuilds-cbeam-z-t8/](obrazky/openbuilds-cbeam-z-t8/) (151 = stránka; stříbrná a černá verze, L = 150/200/250 mm)
- ✅ AliHelper: důvěryhodný; **4,6 ★ / 15 recenzí, 95 prodaných**; 493 ks skladem; doprava zdarma, doručení 29. 11. – 5. 12.
- Cena (15. 11. 2026): **958 Kč** (lead 2 mm, L 200 mm, stříbrná)
- Varianty: šroub **T8 se stoupáním 2 / 4 / 8 mm**; délka **150 / 200 / 250 mm**; barva stříbrná / černá
- Konstrukce: profil **C-beam 4080** (40×80), vozík (deska) na **V-kolečkách** uvnitř C-profilu, trapézový šroub T8 s maticí, koncové desky, spojka; **bez motoru** (příruba NEMA17/23 ❓)

### Hodnocení
| | |
|---|---|
| ➕ | Z OpenBuilds Z-os nejlepší kompromis: kompaktní, levný, kompletní, důvěryhodný prodejce. Na **trimovou frézku (Makita) a lehké práce** v komunitě běžně používaný |
| ❌ | **V-kolečka + T8** = princip prototypu v1 (pružení koleček, vůle matice). Zdvih jen ~70–170 mm |
| ❌ | **Na vřeteno 2,2 kW (4,25 kg) a srovnávací frézu Ø39 slabé** – kolečka po hliníku pod bočními silami povolí |
| ⚖️ | Za ~960 Kč je to levnější než HGR20 400 mm (~1 100–1 300 Kč) + SFU1605 sada (1 354 Kč), ale řádově měkčí |

**Předběžný verdikt:** nekupovat pro naši osu Z s vřetenem 2,2 kW. Lepší: **vlastní Z = 2× HGR20 400 mm (CNCWZCS) + sada SFU1605 (HLTNC PL) + deska 15 mm**, celkem ~3 000–3 500 Kč.
