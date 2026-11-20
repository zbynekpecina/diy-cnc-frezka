# Lineární vedení

Srovnání typů lineárního vedení, doporučené velikosti podle velikosti stroje a přehled cen. Rešerše z 15. 11. 2026. Kandidáti, které jsme našli sami: [kandidati.md](kandidati.md).

> **Aktuální stav:** Osa Y: SBR20 2× 1800 mm (VEVOR, koupeno). Osa X: SBR20 2× 1000 mm (SucceBuy). Vozíky SBR20UU. Osa Z je hotový modul 200 mm (viz [Hotová řešení](../hotova-reseni/katalog.md)).

## Srovnání typů

| Typ | Tuhost a přesnost | Výhody | Nevýhody | Použití |
|---|---|---|---|---|
| V-slot kolečka | nízká | levná, tolerují nepřesný rám | pruží, opotřebovávají se, nutné přeseřizování | jen dřevo a laser (náš prototyp) |
| **Kruhové podepřené tyče SBR16/SBR20** | střední | levné, tolerují méně rovnou plochu | kuličková pouzdra mají vůli, menší tuhost do strany | rozpočtový stroj na dřevo |
| **Profilové HGR15/HGR20** (Hiwin, klony HLTNC/TBI/PMI) | vysoká | předepnuté, 4 řady kuliček, tuhé ve všech směrech | vyžadují rovnou dosedací plochu | stroj i na hliník |
| MGN12/MGN15 | střední | malé a lehké | malý vozík a únosnost | 3D tiskárny, ne portál frézky |

Ustavení HGR: jedna kolejnice je referenční (přitažená k dorazové hraně), druhá se vyrovná úchylkoměrem podle ní. Na ocelovém rámu podlít samonivelačním epoxidem.

## Doporučené velikosti

| Osa | 600×900 mm | 600×600 mm | Velký stroj ~1400×2000 mm |
|---|---|---|---|
| Y (dlouhá, 2 strany) | 2× HGR20 ~1100–1200 mm, 2 vozíky na stranu | 2× HGR20/15 ~850 mm | 2× HGR20 (nebo SBR20) ~2000+ mm, 2 vozíky na stranu |
| X (portál) | 2× HGR20 ~800–850 mm nad sebou | 2× HGR15/20 ~800 mm | 2× HGR20 ~1500–1600 mm nad sebou |
| Z | 2× HGR20/15 ~250–300 mm, 4 vozíky | 2× HGR15 ~250 mm | 2× HGR20 ~300–350 mm, 4 vozíky |

## Ceny a odkazy

| Položka | Cena | URL |
|---|---|---|
| linearnatechnika.cz, kolejnice HR15 / HR20 / HR25 (C) | 854 / 952 / 1 098 Kč/m bez DPH | [kolejnice](https://linearnatechnika.cz/obchod/184/linearni-vedeni) |
| linearnatechnika.cz, vozíky HH20N / HH20L / HH15N | 415 / 537 / 366 Kč bez DPH | [HH](https://linearnatechnika.cz/obchod/185/linearni-vozik-hh) · [HW přírubový](https://linearnatechnika.cz/obchod/186/linearni-vozik-hw) |
| Exvalos (CZ), originál Hiwin HGW20CC | 1 068 Kč/vozík | [exvalos](https://e-shop.exvalos.cz/en/products/linear-technology/profile-rail-linear-guides/page-12) |
| AliExpress, 2× HGR20 + 4× HGH20CA, 300–1000 mm | od 879 Kč | [hledání](https://www.aliexpress.com/w/wholesale-hgr20-1000mm.html) |
| AliExpress, sklad EU, 2× HGR20 + 4 vozíky | od 1 276 Kč | tamtéž |
| AliExpress, originál Hiwin HGR20 + HGW20CC | od ~5 000 Kč/sada | tamtéž |
| AliExpress HLTNC, HGR15 + 4 vozíky, sklad PL | od 887 Kč | [odkaz](https://www.aliexpress.com/item/1005013308708902.html) |
| AliExpress HLTNC, sada HGR15 900 mm | 1 174 Kč | [odkaz](https://www.aliexpress.com/item/1005006571096820.html) |
| AliExpress, SBR20 2× + 4× SBR20UU | 612–2 316 Kč | [hledání](https://www.aliexpress.com/w/wholesale-sbr20-linear-rail-1000mm.html) |
| Allegro VEVOR SBR20 2× 1800 mm | 1 514 Kč | viz [kandidáti](kandidati.md) |
| Fruugo.cz, sady HGR15/HGR20 | 2 149–3 599 Kč | [Fruugo](https://www.fruugo.cz/2pcs-hgr15-hgr20-linear-guide-rail-set-with-4pcs-hghhgw-blocks-for-cnc-router-engraving-900mm/p-389188102-834368972) |

**Odhad pro stroj 600×900 mm:** klony HGR20 4–6 tis. Kč, kvalitnější TBI z linearnatechnika.cz ~10–11 tis. Kč s DPH (~4,4 m kolejnic, 12 vozíků). Velký stroj (~8 m kolejnic) zhruba dvojnásobek.

> **Pozor:** Ceny z AliExpressu jsou uvedeny „od“. Delší kolejnice bývají o 30–100 % dražší.

## SBR20 a HGR20 pro velký stroj

| | SBR20 | HGR20 |
|---|---|---|
| Cena | nejnižší (2× 1800 mm za 1 514 Kč) | zhruba 2–4× vyšší |
| Tuhost a přesnost | na dřevo a river tables dostačuje, výrazně lepší než kolečka | vyšší |
| Vhodnost | dřevo | hliník, dlouhá životnost |

Kompromis z rešerše: SBR20 na dlouhou osu Y, HGR20 na portál X a na Z, kde tuhost rozhoduje nejvíc.

## Doporučení pro náš stroj

- Osa Y i osa X: SBR20 s vozíky SBR20UU (objednáno). Pro obrábění dřeva a srovnávání desek dostačuje.
- Osa Z: lineární vedení je součástí hotového modulu 200 mm, samostatné kolejnice se nekupují.
- Přechod na HGR20 na ose X zvážit, pokud se na portálu projeví vůle pouzder SBR20UU.
