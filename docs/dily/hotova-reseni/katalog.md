# Hotové stroje, kity a osy Z

Srovnání hotových modulů osy Z a cen hotových strojů a kitů jako měřítko pro vlastní stavbu. Rešerše z 15. 11. 2026.

> **Aktuální stav:** Osa Z je hotový modul se zdvihem 200 mm, kuličkovým šroubem Ø16 a ručním kolem; motor NEMA23 se doplní později. Výběr modulu: [kandidati.md](kandidati.md).

## Hotové moduly osy Z

Kritéria výběru:

- Vřeteno 2,2 kW váží 4,2–5 kg. Deska osy Z by měla být široká aspoň 120–150 mm a mít 2× HGR15/20 se 4 vozíky.
- Úzké moduly „80 mm“ (ZBX80) jsou určeny pro lehká vřetena a boční síly nesnesou.
- Užitečný zdvih 120–200 mm.
- Držák vřetena se obvykle kupuje zvlášť. Hranaté vřeteno HLTNC se šroubuje přímo, viz [kandidáti vřeten](../vreteno/kandidati.md).

| Modul | Specifikace | Cena | URL |
|---|---|---|---|
| **MHCN GX150** | HGR20 + SFU1605, zdvih 100–350 mm, šířka 150 mm, pro krokový motor i servo | od 5 591 Kč | [odkaz](https://www.aliexpress.com/item/1005005315857133.html) |
| Heavy duty, šířka 150 mm | 2× HGR20, 4 vozíky, SFU1605/2005 | od 6 119 Kč | [odkaz](https://www.aliexpress.com/item/1005008012262775.html) |
| Lineární stůl HGR20 + SFU1605/1610 | zdvih 100–2000 mm | od 4 201 Kč / 6 404 Kč | [odkaz 1](https://www.aliexpress.com/item/4000014380783.html) · [odkaz 2](https://www.aliexpress.com/item/1005002089768597.html) |
| MHTNC HGH20CA + HGR20 + SFU1605/1610 | zdvih 100–2000 mm | od 5 366 Kč | [odkaz](https://www.aliexpress.com/item/1005009262962241.html) |
| ZBX80 1605 + NEMA23 (sklad EU), lehčí | šířka 80 mm | od 3 233 Kč | [odkaz](https://www.aliexpress.com/item/1005007052638445.html) |
| Dvoukolejnicový stůl 80 mm | SFU1204/1605/1610 | od 1 900 Kč | [odkaz](https://www.aliexpress.com/item/1005004448331661.html) |

**Alternativa – vlastní osa Z:** deska 6061/7075 15–20 mm, 2× HGR20 300 mm, 4× HGH20CA, SFU1605 300 mm, BK12/BF12, DSG16H. Díly ~1,7–2,2 tis. Kč + desky z laseru nebo vodního paprsku ~1,5–3 tis. Kč [odhad].

## Hotové stroje a kity

| Stroj | Plocha (mm) | Vedení / převod | Cena | Poznámka | URL |
|---|---|---|---|---|---|
| Ooznest WorkBee Z1+ 1000×1000 | ~1000×1000 | V-kolečka, trapézový šroub | 1 775 € | stejný princip jako náš prototyp | [odkaz](https://nettiverstas.fi/en/product/ooznest-workbee-z1+-cnc-kone-1000x1000-musta/WB-CNC-Z1-10001000-B) |
| OpenBuilds LEAD 1010 | ~730×810 | V-kolečka, trapézový šroub | 1 104–1 840 USD + clo | | [odkaz](https://www.robotshop.com/products/openbuilds-lead-cnc-machine-1010-black-40-x-40-inches) |
| Sienci LongMill MK2.5 / MK3 | až 1270×860 | kolečka (MK3: HR15) | 1 139–1 920 USD | bez frézky | [odkaz](https://sienci.com/product-category/longmill/) |
| Onefinity Journeyman Elite | 1220×810 | tyče 20 mm, kuličkové šrouby | 3 650–4 295 USD | | [odkaz](https://onefinitycnc.com/product-page/journeymanelite) |
| Shapeoko 5 Pro 4×4 | ~1200×1200 | kolejnice HG, řemeny | ~3 800–4 550 USD | | [odkaz](https://shop.carbide3d.com/products/shapeoko5) |
| Čínská 6040 s VFD | 600×400 | 1605, SBR/HGR | eBay ~966 €, AliExpress 27–48 tis. Kč | kolísavá kvalita, Mach3/LPT | [eBay](https://www.ebay.de/itm/177492464596) · [AliExpress](https://www.aliexpress.com/w/wholesale-cnc-6040-router-1.5kw-ball-screw.html) |
| Čínský rám 6040/8060 bez elektroniky | 600×400 / 800×600 | HGR, 1605 | 13,7–24,6 tis. Kč | osadit vlastním FluidNC | [odkaz 1](https://www.aliexpress.com/item/1005008375626303.html) · [odkaz 2](https://www.aliexpress.com/item/1005013414017013.html) |

Kity s kolečky za 30–45 tis. Kč náš problém neřeší. Tuhé hotové stroje (Onefinity, Shapeoko 5) stojí 80–100+ tis. Kč a jsou menší, než potřebujeme (cílová pracovní plocha cca 1 550 × 680 mm).

## Kandidáti, které jsme našli sami

Viz [kandidati.md](kandidati.md) (VEVOR router sled).

## Doporučení pro náš stroj

- Vlastní stavba místo hotového stroje.
- Osa Z: hotový modul 200 mm se šroubem Ø16 a ručním kolem; osa Z je první etapa motorizace (NEMA23). Rešerše jako nejrychlejší cestu doporučovala moduly GX150 / heavy duty 150 mm se zdvihem 150–200 mm, přenositelné na nový portál.
- Při montáži vřetena 2,2 kW (4,2–5 kg) ověřit, že modul unese hmotnost a boční síly při srovnávání frézou Ø39.
