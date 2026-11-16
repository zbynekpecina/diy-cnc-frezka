# Komunitní DIY CNC frézky

Rešerše komunitních a komerčních stavebnic z 15. 11. 2026: konstrukce, vedení, pohony, ceny a poučení pro vlastní stavbu.

> **Poznámka:** Rešerše počítala s plochou cca 600 × 900 mm. Náčrt a [favoritní fotografie](favorit-ocelovy-portal.md) ukazovaly velký stroj cca 1400 × 2000 mm. U velkého stroje se mění hlavně pohon X/Y: šrouby delší než cca 1,5 m kmitají, proto řemen nebo hřeben (viz Poučení komunity, bod 5).
>
> **Aktuální stav:** [návrh Custom1](../navrh/nas-navrh.md) má pracovní plochu cca 1550 × 680 mm (dřevo), vedení SBR20 a pohon řemenem GT2.

Legenda: ❓ = nejisté nebo neověřené. Ceny jsou orientační (1 USD ≈ 23 Kč, 1 EUR ≈ 25 Kč, 1 GBP ≈ 29 Kč).

## Shrnutí

- **Nejlepší vzor na hliník: PrintNC V4 „Metalcutter“.** Ocelové jekly, HGR20 a SFU1610.
- **Nepřesnost dosavadního prototypu způsobují V-slot kolečka a ruční frézka**, ne samotné hliníkové profily. Přechod z koleček na lineární vedení je největší zlepšení.
- **Kolečka opouštějí i výrobci.** Sienci LongMill MK3 (2026) přešel na HR15, Rat Rig nahradil KillerBee řadou StrongHold s HG25.
- **FluidNC zvládne všechny navrhované koncepce.** Pro externí drivery je vhodná deska 6-Pack External. Osu Y se dvěma motory umí při homingu srovnat do pravého úhlu (auto-squaring).

## Projekty

### PrintNC (V4: Desktop / Metalcutter / Woodcutter)
- **URL:** https://wiki.printnc.info · r/printnc · generátor kusovníku https://github.com/interias/PrintNC-BOM-Generator · průvodce https://cncrouterinfo.com/guides/printnc-guide/
- **Rám:** ocelové jekly 75×50×3 mm, portál 75×75×4 (Metalcutter), při šířce nad 1200 mm 100×75×4. **Nesvařuje se:** díly se šroubují do závitů řezaných přímo v jeklu, proto stěna nejméně 3 mm.
- **Vedení:** HGR20 / HGW20CC, 2 vozíky na kolejnici v X a Y. Osa Z buď HGR20, nebo 2× HGR15.
- **Převody:** SFU1610 s ložisky BK12/BF12 v X a Y, nad 1500 mm SFU2010. V ose Z SFU1204.
- **Motory:** 4× NEMA23 (X, Y1, Y2, Z), drivery DM542T, napájení 48 V. 4 motory po 3 A potřebují cca 8 A, zdroj LRS-350-48 dává jen 7,3 A.
- **Vřeteno:** vodou chlazené 80 mm, 1,5 nebo 2,2 kW s měničem. Wiki **nedoporučuje vřetena VEVOR**.
- **Řízení:** grblHAL (Flexi-HAL) nebo LinuxCNC + Mesa. FluidNC s externími drivery by mělo fungovat ❓.
- **Cena:** 2500–3000 € bez vřetena (stavitel v Německu); realisticky 40–80 tis. Kč ❓.
- **Hodnocení:** nejtužší DIY router v tomto přehledu, zvládne hliník i ocel. Stavba je náročná, rám je těžký (cca 145 kg).
- **Videa:** [Squaring Steel](https://www.youtube.com/watch?v=4s382BgP_qs) · [Ep.1](https://www.youtube.com/watch?v=m97cVp7hmIE) · [Ep.2](https://www.youtube.com/watch?v=tehWB1yB4VA) · [Ep.4](https://www.youtube.com/watch?v=h4lc_zvNWdc) · [Ep.5](https://www.youtube.com/watch?v=bstXCruuwMU) · [Electronics & First Cuts](https://www.youtube.com/watch?v=xC9R7GBAXLM) · [Y rails prep](https://www.youtube.com/watch?v=smJorJZHpPs)
- **Stavební deník z EU:** https://forum.v1e.com/t/blue-steel-printnc-build-in-oldenburg-germany/52219. Poučení: utahování nesprávných šroubů rozhodí geometrii.

### MPCNC Primo (V1 Engineering)
- https://docs.v1e.com/mpcnc/intro/
- Rám a vedení z trubek EMT a 3D tištěných dílů, pohon řemenem GT2 a šroubem T8, ruční frézka.
- Cena 10–14 tis. Kč. Nízká tuhost, rozumně jen do cca 600×600 mm. **Pro nás nevhodné.**

### LowRider v4 (V1 Engineering)
- https://docs.v1e.com/lowrider/ · [kalkulačka velikosti](https://docs.v1e.com/lowrider/calculator/)
- Stroj se staví na existující stůl: 2 ocelové trubky a desky, osa Z na 4× MGN12, řemeny GT2 10 mm, 5× NEMA17.
- Řízení **FluidNC na desce Jackpot (ESP32)**. Cena 15–20 tis. Kč. Velká plocha (až 1,2 × 2,4 m), na dřevo dobrý, na hliník hraniční.
- **Využitelné:** osa Y se dvěma motory a auto-squaringem, hotové konfigurace FluidNC.
- **Videa:** [LR4 Build playlist](https://www.youtube.com/playlist?list=PLsYbJUL5YAr7_2dCniZjVvph7jY54Ak6p) · [beta test](https://www.youtube.com/watch?v=dBgvDj8Z8W8) · [Modifying LR4](https://www.youtube.com/watch?v=grd3liRM3YE)

### Root 4 / Root 4 Lite
- https://github.com/RootCNC/Root-4-CNC · https://github.com/RootCNC/Root_4_Lite · fórum https://rootcnc.discourse.group
- Ocelový jekl 40×40 a 3D tištěné díly, kuličkové šrouby SFU1605 (Root 4 má plochu 1204 × 1190 mm), auto-squaring.
- Cena od cca 15 tis. Kč. Na hliník kompromis ❓.

### OpenBuilds LEAD 1010/1515
- https://openbuilds.com
- Profily V-slot / C-beam, kolečka, trapézové šrouby. **Stejná koncepce jako dosavadní prototyp, se stejnými limity.**

### WorkBee Z1+ / QueenBee PRO
- https://ooznest.co.uk/product-category/workbee-cnc-machine/
- WorkBee: kolečka a trapézový šroub, cca 46 tis. Kč za 750 × 1000 mm.
- QueenBee PRO: profily s profilovým lineárním vedením, tedy upgrade, o kterém se uvažovalo. Podmínka: profil pod kolejnicí musí být rovný.

### Sienci LongMill MK2 / MK3
- https://sienci.com/2026/05/06/everything-you-need-to-know-about-the-longmill-mk3/
- MK3 (2026) přešel z koleček na vedení HR15 a closed-loop motory.

### Onefinity
- https://www.onefinitycnc.com
- Ocelové tyče, kuličkové šrouby na všech osách, cca 50 tis. Kč a více.

### IndyMill (Nikodem Bartnik)
- https://github.com/nikodembartnik/indymill · https://indystry.cc/indymill
- Profily 2080 a ocelové desky 6–8 mm, lineární vedení, kuličkové šrouby, svařovaný stůl.
- **Koncepce blízká našemu prototypu, profily lze využít.**
- **Videa:** [Assembly](https://www.youtube.com/watch?v=YcuXGD3IoZw) · [Electronics](https://m.youtube.com/watch?v=6M8flHuN3BE) · [Welding table](https://www.youtube.com/watch?v=VSE4KyWP8eM) · [Final test](https://www.youtube.com/watch?v=5jFCecZdbGs) · [verze 2,2 kW](https://www.youtube.com/watch?v=bCvNiljHWt8)

### Rat Rig KillerBee → StrongHold ONE / Pro
- https://ratrig.com/cnc-kits/routers/rat-rig-killerbee.html · https://wiki.ratrig.com
- StrongHold Pro: Al profily, HG25 v X/Y, HG15 v Z, kuličkové šrouby 16 mm se stoupáním 10 mm ❓. Nejbližší komerční vzor, pokud zůstaneme u hliníkových profilů.

### Maslow 4
- https://www.maslowcnc.com/about-maslow4
- Řemeny a kotvy, FluidNC, 1220 × 2440 mm, cca 12 tis. Kč. Přesnost cca 1 mm, **pro nás nevhodné.**

### Fóra a české zdroje
- **c-n-c.cz** (https://www.c-n-c.cz): nejstarší české CNC fórum. Při rešerši se web nepodařilo načíst (chyba certifikátu), **projít ručně**.
- **mycncuk.com:** [jekl + SBR20 + kuličkové šrouby](https://www.mycncuk.com/threads/7936-a-Steel-Box-Section-Build-with-SBR20-Ballscrews-Plus-a-few-questions) (blízké naší kombinaci se SBR20) · [rozteč vozíků na portálu](https://www.mycncuk.com/archive/index.php/t-5277.html)
- **cnczone.com:** sekce DIY CNC Router Table Machines.
- **canadianhobbymetalworkers.com:** [stavba PrintNC](https://canadianhobbymetalworkers.com/threads/my-next-cnc-project-a-printnc-router.3347/page-3)
- **Akademické práce s výpočty** (dimenzování vedení, šroubů a motorů):
  - [VUT Brno – malá frézka na dřevo a plast](https://invenio.nusl.cz/record/502957)
  - [ZČU – portálová frézka z dostupných dílů](https://otik.zcu.cz/bitstream/11025/41668/1/Diplomova%20prace%20-%20Jan%20Ferenc.pdf)
  - [ČVUT SOČ](https://stretech.fs.cvut.cz/2016/sbornik_2016/a-CD-stretech2016/Praha-novovysočanská-douša.pdf)
- **Typická stavba z fór:** svařované jekly 80×80 nebo 60×40 (případně těžké profily, např. [DeLuxCNC 200×96](https://deluxcnc.eu/en/extruded-profiles/1517-aluminum-profile-for-cnc-machines-200x96mm.html)), HGR20, SFU1605/1610 s BK12/BF12, NEMA23 3 Nm, DM542 a vřeteno 1,5–2,2 kW.

### Epoxy-granit a MDF
- **Epoxy-granit** výborně tlumí vibrace, ale má nižší tuhost a je drahý a pracný. Levný kompromis: **vyplnit jekly pískem nebo epoxy-granitem**.
  - [Hackaday – granitové lože](https://hackaday.com/2019/02/25/casting-the-bed-of-a-cnc-machine-in-granite) · [směsi](https://hackaday.com/2019/06/01/experiments-in-creating-the-best-epoxy-granite) · [Video EG router](https://www.youtube.com/watch?v=ZuQmm2X9wd4) · [Profily plněné EG](https://www.youtube.com/watch?v=sXfIGYAtrfA)
- **MDF na rám se nehodí** (prohýbá se, vadí mu vlhkost). Jako **obětní deska stolu (spoil board) je standard.**
- **Ivan Miranda:** výrazné zlepšení tuhosti mu přinesl přechod z tyčí na lineární kolejnice, později přešel na ocelový rám. [Steel CNC](https://www.hackster.io/news/ivan-miranda-made-a-steel-cnc-mill-from-scratch-5254308c70b7) · [3D printed CNC cuts metal](https://www.youtube.com/watch?v=_atw3e0nIrg)
- **Marco Reps:** přesná fréza na LinuxCNC, [centrální mazání](https://www.youtube.com/watch?v=ylt3PYJAyVw) ❓.

### Další videa
- [Super rigid small CNC (steel)](https://www.youtube.com/watch?v=pXgundjXmR8) · [DIY CNC Milling – complete build](https://m.youtube.com/watch?v=Xfm0t0SrAWo)

## Srovnávací tabulka

| Projekt | Rám | Vedení | Pohon | Vřeteno | Řízení | Cena | Hliník | Náročnost |
|---|---|---|---|---|---|---|---|---|
| **PrintNC V4 Metalcutter** | ocel. jekly 75×50×3 | HGR20 | SFU1610 | 1,5–2,2 kW voda | grblHAL / LinuxCNC (FluidNC ❓) | 40–80 tis. Kč | ★★★★★ | vysoká |
| MPCNC Primo | EMT + tisk | trubky | GT2/T8 | ruční frézka | FluidNC/Marlin | 10–14 tis. | ★ | nízká |
| LowRider v4 | trubky + desky | trubky, MGN12 | GT2/T8 | ruční frézka | FluidNC | 15–20 tis. | ★★ | nízká |
| Root 4 | jekl 40×40 | jekl/MGN ❓ | SFU1605 | VFD | ESP32 ❓ | od 15 tis. | ★★–★★★ | střední |
| OpenBuilds LEAD | V-slot | kolečka | trapéz | 710 W | Grbl | 25–55 tis. | ★ | nízká |
| WorkBee Z1+ | V-slot | kolečka | trapéz | 800 W | vlastní | cca 46 tis. | ★–★★ | nízká |
| LongMill MK3 | Al profily | HR15 | ACME | 710 W | Grbl | 35–45 tis. | ★★ | nízká |
| Onefinity | ocel. tyče | tyče | kul. šrouby | volit. | Masso | 50+ tis. | ★★★ | nízká |
| IndyMill | profily + ocel. desky | lin. vedení | kul. šrouby | 0,5–2,2 kW | Arduino | ❓ | ★★★★ | střední |
| StrongHold Pro | Al profily | HG25/HG15 | kul. šrouby | volit. | ❓ | ❓ | ★★★★ | střední |
| Maslow 4 | žádný | řemeny | DC serva | 900 W | FluidNC | cca 12 tis. | ✗ | nízká |
| Stavba z fór | jekly | HGR20 | SFU1605/10 | 1,5–2,2 kW | různé | 30–60 tis. ❓ | ★★★★ | stř.–vys. |

## Poučení komunity

1. **Tuhost portálu je rozhodující.** Průhyb roste se **třetí mocninou rozpětí** (2× delší portál = cca 8× větší průhyb). Kratší rozměr stroje dát na portál. Jeden velký průřez je lepší než několik tenkých profilů. Portál co nejnižší.
2. **Osa Y se dvěma motory a auto-squaringem.** Každá strana má vlastní motor a koncový spínač, FluidNC portál při homingu srovná.
3. **Vyložení osy Z.** Nástroj co nejblíž rovině vedení, vozíky Z co nejdál od sebe. Zbytečně dlouhý zdvih Z snižuje tuhost.
4. **Vedení:** kolečka → tyče (SBR) → MGN → HGR15/20. Kolejnice potřebuje rovný podklad (obrobené plochy, srovnávací lišta, zalití epoxidem).
5. **Pohon:** na hliník kuličkové šrouby (SFU1605 přesnější, SFU1610 rychlejší). **Šroub delší než cca 1500 mm kmitá (whip):** použít Ø20, rotující matici, nebo řemen či hřeben. Ložiska BK/BF a obrobené konce šroubů objednat přesně podle výkresu.
6. **Vřeteno místo ruční frézky.** Vodou chlazené 1,5–2,2 kW, kleština ER11/ER20, malá házivost a moment i v nízkých otáčkách.
7. **Stůl:** pevný podklad a na něm obětní deska MDF 18–25 mm, srovnaná frézou. Na hliník T-drážky nebo závitová mřížka M6/M8.
8. **Odsávání:** hubice s kartáčem a cyklon. Na hliník kryty a chlazení vzduchem nebo mlhou.
9. **Ochrana šroubů a kolejnic:** měchy, stěrače, mazání.
10. **Elektronika:** 48 V pro NEMA23 se zdrojem dimenzovaným na všechny motory, oddělených 24 V pro řízení, stíněné kabely a uzemnění kvůli rušení z měniče. Deska pro FluidNC: [6-Pack External Driver](https://www.tindie.com/products/33366583/6-pack-external-driver-cnc-controller/).
11. **Nejvíc času zabere srovnání do pravého úhlu a vyrovnání kolejnic**, ne samotný rám.

## Doporučené vzory

1. **PrintNC V4 Metalcutter** nebo **favoritní ocelový portál** (svařovaný). Pro velký stroj 1400 × 2000 mm kombinovat s řemenem nebo hřebenem na X/Y.
2. **Hybrid IndyMill / StrongHold**, tedy přestavba současného prototypu: těžké profily (80×80, 160×40) plněné pískem nebo EG, HGR20 místo koleček, kuličkové šrouby, vřeteno. Nejlevnější přechod (cca 20–35 tis. Kč ❓).
3. **LowRider v4** jen v případě, že jde hlavně o dřevo. Spíše jako zdroj konfigurací FluidNC.

**Nedoporučeno:** MPCNC, Maslow a stroje na kolečkách (LEAD, WorkBee, LongMill MK2). Mají stejné omezení jako dosavadní prototyp.

> **Aktuální stav:** Zvolen vlastní [návrh Custom1](../navrh/nas-navrh.md): portál ze svařených jeklů 25×25 na stávající spodní konstrukci, vedení SBR20, osa Z jako hotový modul s kuličkovým šroubem Ø16, FluidNC na klasickém ESP32.
