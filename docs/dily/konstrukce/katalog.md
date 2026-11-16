# Konstrukce a rám

Srovnání materiálů rámu a portálu, dodavatelů hliníkových profilů a orientační tuhosti průřezů. Rešerše z 15. 11. 2026.

> **Aktuální stav:** Stavíme variantu Custom1. Základ tvoří stávající spodní konstrukce z hliníkových solárních profilů 40×40 s deskou 1800×750 mm na dřevěném stole. Portál je ze svařených jeklů 25×25, pod kolejnice a na vozíky je pásovina 50×6, vozík X je z plexiskla 300×200×10 mm. Pracovní plocha je cca 1 550 × 680 mm, materiál dřevo.

Rešerše počítala s plochou 600×900 mm. Pro velký stroj (~1400×2000 mm) platí stejné principy s průřezy o stupeň většími. Značka [neověřeno] znamená, že cenu nebo údaj se nepodařilo ověřit.

## Srovnání materiálů rámu

| Řešení | Tuhost | Tlumení | Výroba | Cena rámu | Hodnocení |
|---|---|---|---|---|---|
| V-slot 20/40 (OpenBuilds) | nízká | nízké | nejsnazší | nízká | původní prototyp, na hliník nevhodné |
| Item/Bosch profily 40×80, 80×80 (drážka 8) / 45×90, 90×90 (drážka 10) | střední až dobrá | nízké | snadná: řez na míru, šroubování | střední až vyšší | pohodlné; s profily 80×80 / 90×90 použitelné i na hliník |
| **Ocelové jekly (styl PrintNC, favorit rešerše), 80×40×3, 100×50×4** | **vysoká** (ocel E = 210 GPa, hliník 70 GPa) | lze zlepšit výplní (písek, epoxid) | řezání, vrtání nebo svařování, vyrovnání ploch pod kolejnice | **nízká** | **nejlepší poměr cena/tuhost** |
| MDF / překližka (torzní box) | nízká až střední | dobré | jednoduchá | nejnižší | jen na dřevo a do ~600×600 mm, citlivé na vlhkost |
| Epoxidový granit | střední | výborné | náročná, nutné formy | střední | pro první velký stroj nevhodné |

### Orientační tuhost v ohybu (relativní EI)

| Průřez | I | Hmotnost | Relativní EI |
|---|---|---|---|
| Hliník Item 80×40 | 101 cm⁴ | 4,5 kg/m | 7 100 |
| Ocelový jekl 80×40×3 | ~56 cm⁴ | 5,4 kg/m | 11 700 (1,6×) |
| Ocelový jekl 100×50×4 | ~144 cm⁴ | ~8,6 kg/m | 30 000 (~4×) |

Pro portál o délce ~1,4 m je rozumné minimum jekl 100×50×4, lépe 120×60×4 nebo dva profily nad sebou.

## Systém drážek hliníkových profilů

- Drážka 8 v rastru 40 (40×40, 40×80, 80×80): typ I (Item), typ B (Bosch).
- **Drážka 10 v rastru 45** (45×90, 90×90): silnější T-matice M8, pro CNC vhodnější.

## Dodavatelé profilů

| Dodavatel | Sortiment | Cena | URL |
|---|---|---|---|
| kompresory-vzduchotechnika.cz (CZ) | BH 45-10 45×90 lehký 3,06 kg/m; 40×80; 90×90 těžký | ~39,8 €/m (45×90), ~36 €/m (40×80) | [45x90](https://www.kompresory-vzduchotechnika.cz/en/hlinikovy-profil-bh-45-10--45x90--lehky) · [40x80](https://www.kompresory-vzduchotechnika.cz/hlinikovy-profil-bh-40-10--40x80) · [90x90](https://www.kompresory-vzduchotechnika.cz/en/hlinikovy-profil-bh-45-10--90x90--tezky) |
| item24 (CZ) | originál Item 80×40, 80×80 | po přihlášení [neověřeno], nejdražší | [80x40](https://www.item24.com/cs-cz/profil-8-80x40-natur-2604) · [80x80](https://www.item24.com/cs-cz/profil-8-80x80-lekki-kolor-naturalny-45302) |
| Dold Mechatronik (DE) | 40×80, 80×80, 45×90 B, řez na míru | 45×90 ~69 €/m | [45x90L B](https://www.dold-mechatronik.de/Aluminiumprofil-45x90L-B-Typ-Nut-10) · [80x80L I](https://www.dold-mechatronik.de/Aluminiumprofil-80x80L-I-Typ-Nut-8) · [40x80L](https://www.dold-mechatronik.de/Aluminiumprofil-40x80L-I-Typ-Nut-8) |
| systeal.com (EU) | 45×90 drážka 10, těžký | 43,89 € bez DPH | [odkaz](https://www.systeal.com/en/45-series-profiles/1300-aluminium-profile-45x90-10mm-slot-heavy.html) |
| myaluprofil.de / motedis | 45×90 B, 40×80 I | [neověřeno] | [myaluprofil](https://www.myaluprofil.de/Aluminium-profile-45x90-groove-10-light-B-type-2N.html) · [motedis](https://www.motedis.es/en/Profile-45x90L-B-Type-slot-10) |
| linearnatechnika.cz (CZ/SK) | profily a příslušenství | [neověřeno] | [kategorie](https://linearnatechnika.cz/obchod/hlinikovy-profily-a-prislusenstvi) |
| Misumi CZ | HFS8, HFS10 | [neověřeno] | [misumi](https://cz.misumi-ec.com/vona2/detail/110302690560) |
| DeLuxCNC | těžký CNC profil 200×96 pro HGR20 + SFU16 | [neověřeno] | [odkaz](https://deluxcnc.eu/en/extruded-profiles/1517-aluminum-profile-for-cnc-machines-200x96mm.html) |
| ehlinik.cz | L a U profily, jekly, kulatiny (viz [kandidáti](kandidati.md)) | 129 Kč/m L 40×40×2 | — |
| **Ocel (jekly)** | místní železářství, velkoobchod hutním materiálem (Ferona apod.) | [neověřeno], odhad 4–8 tis. Kč za rám 600×900 mm | poptat |

## Obecné zásady

- **Velký stroj (~1400×2000 mm):** svařovaný ocelový rám z jeklů 100×50×4 až 120×80×4 na vlastních nohách, příčník portálu 120×60×4 nebo větší, bočnice portálu z ocelové desky 10 mm nebo hliníkové 15–20 mm. Dvě kolejnice X nad sebou na čele portálu s roztečí ≥ 100 mm.
- **Stroj 600×900 mm:** jekl 100×50×4 / 80×80×4 nebo profily 90×90 + 45×90 těžké.
- **Světlá výška pod portálem jen nezbytná** (např. 100–150 mm na desky). Každý centimetr navíc prodlužuje páku.
- Plochy pod kolejnice vyrovnat frézovanými pásy, podložkami nebo zalitím samonivelačním epoxidem.

## Doporučení pro náš stroj

- Rám: stávající konstrukce ze solárních profilů 40×40 s deskou 1800×750 mm. Svařovaný ocelový rám podle obecných zásad se nestaví.
- Portál: svařené jekly 25×25, pásovina 50×6 pod kolejnice a na vozíky. Průřez je pod minimem z rešerše (100×50×4); jde o vědomý kompromis pro obrábění dřeva a srovnávání desek.
- Plochy pod kolejnice SBR20 vyrovnat podložkami.

> **Pozor:** Světlou výšku pod portálem držet jen na nezbytné hodnotě. U lehkého portálu z jeklů 25×25 se delší páka projeví víc než u masivního rámu.
