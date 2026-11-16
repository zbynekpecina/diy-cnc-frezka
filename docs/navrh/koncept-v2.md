# Koncept v2

První návrh velkého stroje s ocelovým rámem pro desky 800 × 1800 mm. Rozhodnutí se zapisují do [rozhodnuti.md](rozhodnuti.md).

> **Aktuální stav (15. 11. 2026):** Koncept v2 nahradil [návrh Custom](nas-navrh.md). Stroj se staví na stávající spodní konstrukci (Al profily 40×40, deska 1800 × 750 mm), portál je ze svařených jeklů 25×25, osa Y SBR20 2× 1800 mm, osa X SBR20 2× 1000 mm, pracovní plocha cca 1550 × 680 mm. Tato stránka zůstává jako podklad.

Vychází z: [prototyp v1](prototyp-v1.md) · [favorit z komunity](../inspirace/favorit-ocelovy-portal.md) · [komunitní projekty](../inspirace/komunitni-projekty.md) · [katalogy dílů](../dily/)

## Cíl

- Hlavní práce: **srovnávání desek a river tables**, frézování dřeva a plastů, příležitostně hliník.
- **Obrobek (deska): 800 × 1800 mm**, rozhodnuto 15. 11. 2026.
- **Portál s přesahem: vnitřní světlost cca 1000 mm**, aby vřeteno s frézou dojelo za kraj desky.
- Řízení: **ESP32 + FluidNC 4.1.x**, 7" displej ESP32-S3 jako pendant (FluidTouch).
- Napájení: **jen 1F 230 V**.

> **Aktuální stav:** FluidNC poběží na klasickém ESP32, jako displej je zvolen 7" ESP32-P4 s RS485 (Modbus k měniči).

## Rozměry stroje

Odvozeno z desky 800 × 1800 mm.

```
              ← vnitřní světlost portálu ~1000 →
        ┌──┬──────────────────────────────────────┬──┐  ← příčník portálu, kolejnice X 1200 mm
        │  │   ┌──────────────────────────────┐   │  │
        │  │   │                              │   │  │
        │  │   │      deska 800 × 1800        │   │  │  ← dráha Y ≥ 1880 mm
        │  │   │                              │   │  │
        │  │   └──────────────────────────────┘   │  │
        │  │ ← 100 → (upínky, odsávání)   ← 100 → │  │
        └──┴──────────────────────────────────────┴──┘
   rám ~1300 × 2400 mm, kolejnice Y ~2200 mm
```

| Rozměr | Hodnota | Zdůvodnění |
|---|---|---|
| Obrobek | 800 × 1800 mm | zadání |
| **Zdvih X** (vřeteno) | **≥ 880 mm** | 800 mm + 2 × 20 mm (poloměr frézy Ø39) + 2 × 20 mm rezerva, aby fréza přejela přes hranu |
| **Vnitřní světlost portálu** | **cca 1000–1050 mm** | 800 mm + cca 100 mm na každé straně na upínky, odsávací hubici a vozík osy Z |
| **Kolejnice X** | **1200 mm** (HGR20) | zdvih (cca 900 mm) + rozteč vozíků osy Z (cca 200 mm) + rezerva. S kolejnicí 1000 mm by zdvih vyšel cca 800 mm a fréza by na kraj desky nedojela s rezervou. HGR20 1200 mm mají skladem CNCWZCS (DE) i HLTNC (PL). |
| **Zdvih Y** | **≥ 1880 mm** | 1800 mm + 2 × 40 mm |
| **Kolejnice Y** | **cca 2200 mm** | zdvih + rozteč vozíků portálu (cca 250–300 mm). VEVOR SBR20 1800 mm je krátké, proto SucceBuy **SBR20 2200 mm** (sklad CZ) nebo HGR20 složené ze dvou kusů. |
| **Rám** | cca 1300 × 2400 mm | kolejnice + podélníky; výška pracovní plochy cca 850–900 mm |
| **Pohon Y** | řemen HTD 15 mm nebo hřeben | šroub délky cca 2,1 m kmitá (SFU2010 by šel jen do cca 5 m/min) |
| **Průhyb příčníku** | jekl 100×50×4 na 1,1 m: cca 20–40 µm při 150 N | viz kalkulačka na webu; pro dřevo dostačující |

## Koncept

Vychází z [favorita z komunity](../inspirace/favorit-ocelovy-portal.md).

| Blok | Návrh | Alternativa | Katalog |
|---|---|---|---|
| Rám | svařovaný **ocelový rám z jeklů** 100×50×4 / 80×40×3, cca 1300 × 2400 mm, nohy s nivelací | šroubované jekly (PrintNC) | [konstrukce](../dily/konstrukce/katalog.md) |
| Portál | ocelové bočnice + příčník z jeklu 100×50×4 až 120×60×4, světlost cca 1000 mm, nízký | — | tamtéž |
| Vedení Y (cca 2,2 m) | **SBR20 2× 2200 mm** (SucceBuy, sklad CZ) | HGR20 složené | [vedení](../dily/vedeni/katalog.md) |
| Vedení X (1,2 m) | **HGR20 2× 1200 mm**, 2 kolejnice nad sebou na čele portálu | SBR20 (levnější varianta) | tamtéž |
| Osa Z | 2× HGR20 400 mm + **SFU1605**, zdvih 150–200 mm | modul GX150 | [hotové osy Z](../dily/hotova-reseni/katalog.md) |
| Pohon Y | **2 motory** (každá strana vlastní), **řemen HTD (omega) nebo hřeben** | — | [převody](../dily/prevody/katalog.md) |
| Pohon X | řemen HTD nebo hřeben (případně SFU1610 1200 mm, na 1,2 m ještě použitelné) | — | tamtéž |
| Motory | 4× NEMA23 3 Nm + DM556T, zdroj 48 V 600 W | AC serva později | [motory](../dily/motory/katalog.md) |
| Vřeteno | **2,2 kW, ER20**, měnič 1F 230 V; kandidát **EUCNC** (3 814 Kč, sklad PL, 13 kleštin) | HLTNC (RS485 potvrzeno) | [vřetena](../dily/vreteno/kandidati.md) |
| Řízení | **6x CNC Controller (ESP32, FluidNC)** + modul RS485 | PiBot S3, grblHAL | [řízení](../dily/elektronika/katalog.md) |
| HMI | 7" ESP32-S3 + FluidTouch | vlastní pendant | tamtéž |
| CAM | Estlcam (2,5D), Fusion Personal (3D) | — | [software](../dily/software/katalog.md) |
| Stůl | obětní deska MDF 25 mm cca 1000 × 2000 mm na rámu, srovnaná frézou; upínky | T-drážky později | — |
| Ostatní | odsávací hubice s kartáčem, energetické řetězy, nouzové tlačítko (E-stop), chránič typu A/F | — | [příslušenství](../dily/prislusenstvi/) |

> **Aktuální stav:** Objednáno vřeteno HLTNC 2,2 kW GDZ80x73 ER20 (vzduchem chlazené) + měnič EV210 s RS485 za 4 053 Kč. EUCNC 2,2 kW zůstává jako záloha. Pohony: NEMA23 + DM556, řemen GT2.

## Etapy

Postup tak, aby žádná etapa neblokovala další.

| Etapa | Obsah | Poznámka |
|---|---|---|
| **0** | Rám + portál + vedení X/Y. Posuv X a Y zatím **ručně** (portál se tlačí), držáky motorů a dráhy řemene nebo hřebenu už připravené. | Geometrie a rovinnost jsou základ. |
| **1** | **Motorizovaná osa Z** (SFU1605 + NEMA23) + vřeteno 2,2 kW + měnič + deska FluidNC + E-stop + homing Z + sonda | První řízená osa: hloubku řídí ESP32. |
| **2** | Motor na osu X (řemen nebo hřeben) | Automatické srovnávání po řádcích. |
| **3** | 2 motory na osu Y + auto-squaring | Plné 3osé CNC. |
| **4** | 7" pendant, odsávání, kryty, T-drážky, případně closed-loop motory nebo serva | |

## Otevřené otázky

1. ~~Rozměr pracovní plochy~~ → 800 × 1800 mm, portál cca 1000 mm (rozhodnuto).
2. **Svařovat, nebo šroubovat?** Je k dispozici svářečka?
3. **Vřeteno chlazené vzduchem, nebo vodou?** Je dílna vytápěná? Jaký hluk je přijatelný?
4. **SBR20, nebo HGR20 na ose Y?** Cena vs. tuhost a obrábění hliníku. Zjistit cenu SucceBuy SBR20 2200 mm.
5. **Řemen, nebo hřeben** na osách X a Y?
6. **Který 7" displej** se použije (Elecrow CrowPanel / Sunton 8048S070 / Waveshare)?
7. Celkový rozpočet?

> **Aktuální stav:** Otázky 2–6 jsou vyřešené v [Našem návrhu](nas-navrh.md): portál se svařuje z jeklů 25×25, vřeteno je vzduchem chlazené, na obou osách je SBR20, pohon řemenem GT2, displej 7" ESP32-P4. Otevřený zůstává celkový rozpočet.
