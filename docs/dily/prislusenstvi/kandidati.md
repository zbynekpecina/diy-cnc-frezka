# Kryty, stůl a příslušenství – kandidáti, které jsme sami našli

## Plexisklo čiré 10 mm, 200 × 300 mm (Allegro)

- Odkaz: https://allegro.cz/produkt/plexi-sklo-cire-10mm-format-200x300mm-d8e551a8-ac47-42ae-9f19-254fa03b9c61?offerId=14997753732
- Screenshot: [obrazky/plexi-10mm-200x300-allegro.jpg](obrazky/plexi-10mm-200x300-allegro.jpg)
- Cena (15. 11. 2026): **315 Kč**, doprava od 55 Kč, **bez možnosti vrácení**
- Materiál: **extrudované** PMMA (Röhm, Německo), tolerance řezu ±1 mm, ochranná fólie
- Tloušťky 1,5 až 10 mm; prodejce řeže laserem a ohýbá na zakázku

### Hodnocení

| | |
|---|---|
| ❌ | **Na nosné díly ne** (deska Z osy, držák motoru, bočnice portálu). PMMA je křehké, praská kolem šroubů a pod vibracemi, při teple teče. Tam patří hliník (plotna 10–15 mm, 6061/7075), ocel nebo aspoň HPL či březová překližka |
| ✅ | Hodí se na **průhledný ochranný štít** kolem vřetena nebo na okénko do krytu (box proti třískám a hluku); na kryt elektroniky nebo panel pro 7" ESP32 displej (stačí 3–5 mm) |
| ⚠️ | Jako **materiál na frézování** je extrudované plexi horší volba: lepí se na nástroj a taje. Na frézování je lepší **lité** PMMA (GS) s jednobřitou frézou ("O-flute") |
| 💡 | Na ochranný štít je bezpečnější **polykarbonát** (PC): nepraská při nárazu odlétlé frézy nebo obrobku. Plexi se může roztříštit |

**Předběžný verdikt:** zatím nekupovat. Až budeme řešit kryt, pořídit polykarbonát 4–6 mm na okna a plexi 3–5 mm na panel displeje.

---

## Energetické (kabelové) řetězy – srovnání kandidátů

| | AliExpress (Shop1104001366) | techfun.cz |
|---|---|---|
| Odkaz | https://www.aliexpress.com/item/1005007435939757.html | https://techfun.cz/produkt/organizator-pro-kabelaz-retezovy/ |
| Screenshot | [obrazky/kabelovy-retez-aliexpress.jpg](obrazky/kabelovy-retez-aliexpress.jpg) | — |
| Cena za 1 m | **153 Kč** (doprava zdarma, 25. 11. – 1. 12.) | **110 Kč** (skladem v ČR) |
| Vnitřní rozměry | 7×7, 7×15, 10×10, 10×15, 10×20, 10×30, **10×40** | 7×7, 10×10, 10×15, 10×20, 15×20, **15×30** |
| Hodnocení | 4,8 ★ / 300 recenzí, 4 000+ prodaných | — |

### Co potřebujeme (podle konceptu v2)
Řetězem poběží **stíněný kabel vřetena 4×1,5 mm²** (Ø ~10–12 mm), **kabely krokových motorů** (4×0,75, Ø ~6–7 mm), **koncové spínače a sonda** (Ø ~4–5 mm) a případně **hadičky vodního chlazení** (2× Ø 8–10 mm).

| Osa | Co vede | Min. vnitřní rozměr | Délka |
|---|---|---|---|
| Z (krátký zdvih) | vřeteno, motor Z, spínač Z, sonda (+ chlazení) | **15×30** (výška 15 kvůli kabelu vřetena) | ~0,4–0,5 m |
| X (portál ~1,5 m) | vše ze Z + motor X, spínač X | **15×30** nebo víc, spíš 18×37 / 18×50 | ~1,0 m |
| Y (~2 m) | vše z X + 2× motor Y, 2× spínač Y | **25×38 / 25×57** | ~1,2–1,3 m na stranu (portál s řetězem jen na jedné straně) |

### Hodnocení
| | |
|---|---|
| ⚠️ | **Výška 10 mm (všechny AliExpress varianty) je pro kabel vřetena Ø 10–12 mm těsná až malá.** Kabel by se třel a řetěz by se rozpínal |
| ✅ | **techfun 15×30 za 110 Kč/m** je levnější a vyšší → vhodný na **osu Z a menší X**. Skladem v ČR |
| ✅ | AliExpress 10×20 / 10×30 se hodí na **signálové kabely zvlášť** (spínače, sonda), pokud vřeteno povedeme samostatným řetězem |
| 🔍 | Pro **osu Y** a pravděpodobně i X bude potřeba **větší řetěz** (18×37, 25×38 nebo s otevíratelnými víčky) → dohledat (Igus je dražší originál, čínské klony od ~200–400 Kč/m [neověřeno]) |
| 💡 | Hlídat **poloměr ohybu** řetězu (R ≥ 8–10× průměr kabelu vřetena, tedy aspoň R 75–100 mm) a kupovat varianty s **otevíratelnými články** (kabely se vkládají shora) |

**Předběžný verdikt:** na osu Z koupit **techfun 15×30** (~1 m, 110 Kč). Na X a Y počkat, až bude jasná konstrukce, a dohledat větší rozměr.

---

## HLTNC – odsávací hubice s kartáčem (spindle shoe dust cover) pro vřeteno Ø65–125 mm (AliExpress, HLTNC Official Store)

- Odkaz: https://www.aliexpress.com/item/1005012726723014.html
- Obrázky: screenshot jen v chatu (nebyl uložen jako soubor) – bílá kovová hubice s objímkou na vřeteno, boční hrdlo pro hadici, kartáč (přírodní/černý), varianty 65–125 mm
- ✅ AliHelper: důvěryhodný; 5,0 ★ / 2 recenze, 25 prodaných, 92 ks skladem
- Cena (15. 11. 2026, výprodej 11.11): **207 Kč** (varianta 90 mm), z 231 Kč; od 2 ks −1 %; doprava **350 Kč** (Economy) → ~557 Kč; doručení 25. 11. – 2. 12.
- Varianty: **65 / 70 / 75 / 80 / 85 / 90 / 100 / 125 mm** (průměr vřetena)
- Materiál: ocel (podle popisu), kartáč; hrdlo pro odsávací hadici (průměr hrdla neuveden – ověřit, typicky ~ 100 mm)

### Hodnocení
| | |
|---|---|
| ✅ | **Odsávání u nástroje je nutné** (favorit má stejnou hubici s kartáčem). Na srovnávání desek vzniká hodně třísek; u vzduchem chlazeného vřetena chrání i ventilátor před prachem |
| ⚠️ | **Objímka je na kulaté vřeteno.** Naše kandidátní **HLTNC 2,2 kW je hranaté (80×73 s patkou)** → kulatá objímka nesedí. Šlo by na varianty: (a) přichytit hubici k **desce osy Z** vlastním držákem, (b) zvolit kulaté vodní/vzduchové vřeteno Ø80 → varianta **80 mm** |
| ⚠️ | Hubice pevně na vřetenu = jede s osou Z; kartáč musí sahat níž než fréza. U srovnávací frézy Ø39 (výška ~61 mm) ověřit, že kartáč dosáhne na materiál |
| ⚠️ | Doprava 350 Kč za drobnost → objednat s dalšími díly HLTNC (část jejich zboží jde z PL zdarma – ale tato položka je z Číny) |
| 💡 | Alternativa: **magnetická / výsuvná hubice** držená na desce Z (komunita často tiskne na 3D tiskárně) – nezávislá na tvaru vřetena |

**Předběžný verdikt:** princip ano, **konkrétní kus až podle vybraného vřetena** (hranaté → vlastní držák, kulaté 80 mm → tato varianta 80 mm).
