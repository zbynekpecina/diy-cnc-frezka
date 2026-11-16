# Vřetena a frekvenční měniče

Srovnání vřeten podle chlazení a výkonu, konkrétní nabídky, podpora měničů ve FluidNC a požadavky na elektroinstalaci. Rešerše z 15. 11. 2026. Kandidáti, které jsme našli sami: [kandidati.md](kandidati.md) · koupená fréza: [nastroje-frezy.md](../prislusenstvi/nastroje-frezy.md).

> **Aktuální stav:** Objednáno 15. 11. 2026 za 4 053 Kč: vřeteno HLTNC 2,2 kW GDZ80x73 ER20 (vzduchem chlazené) + měnič EV210 s RS485 (Modbus). Záloha: EUCNC 2,2 kW. Měnič se řídí svorkami: otáčky 0–10 V přes převodník z PWM, start relé na X1, chyba TA/TC přes optočlen do FluidNC. Modbus master na RS485 je 7" displej ESP32-P4 s vlastním firmwarem.

> **Pozor:** Koupená srovnávací fréza má stopku 8 mm → vřeteno musí mít kleštinu ER16 nebo ER20. Vřetena s ER11 (max. 7 mm) nevyhovují.

## Chlazení vzduchem a vodou

| | Vzduchem chlazené | Vodou chlazené |
|---|---|---|
| Hluk | vyšší (ventilátor na hřídeli píská) | výrazně nižší |
| Nízké otáčky (hliník, velké frézy) | horší chlazení | chladí nezávisle na otáčkách |
| Příslušenství | žádné | čerpadlo, hadice, nádrž/chladič, nemrznoucí směs |
| Riziko | rozfoukává a nasává prach | nezapnuté čerpadlo = zničené vřeteno (blokace průtokovým spínačem) |
| Údržba | minimální | výměna kapaliny, úniky |

## Výkonové třídy

Platí pro vřetena 230 V 1F do měniče, 400 Hz, 24 000 ot/min.

| Výkon | Průměr | Kleština | Max. stopka | Hmotnost | Použití |
|---|---|---|---|---|---|
| 0,8 kW | 65 mm voda | ER11 | 7 mm ❌ | ~2 kg | lehký portál |
| 1,5 kW | 65 mm voda / 80 mm vzduch | ER11 / ER16 | 7 / 10 mm | ~3–4 kg | hobby optimum (pro nás jen verze ER16) |
| **2,2 kW** | 80 mm | **ER20** | **13 mm** ✅ | ~4–6 kg | tuhý portál; pro srovnávání velkých desek ideální |

- Ložiska: požadovat 4 ložiska a házivost ≤ 0,01 mm.
- **Pro ČR: měnič s 1F vstupem 220–240 V a vřeteno 220 V** (ne 110 V, ne 380 V).

## Konkrétní nabídky

| Produkt | Obchod | Cena | Poznámka |
|---|---|---|---|
| HLTNC 2,2 kW vzduch, hranaté, ER20 + EV210 | [AliExpress](https://www.aliexpress.com/item/1005009648374545.html) | ~4 620 Kč s dopravou | zvolená sada (objednáno za 4 053 Kč) |
| Sady 0,8 / 1,5 / 2,2 / 3 kW | [CNC1SHOP.CZ](https://www.caucau.cz/vretena-sady/) | 12 250 / 14 979 / 17 769 Kč | ČR, typ měniče neuveden |
| Vřeteno 800 W voda 65 mm ER11 | [DeluxCNC.eu (SK)](https://deluxcnc.eu/cs/vretena/28-vreteno-kapalinou-chlazene-800w.html) | 224 € | ER11 ❌ |
| GDZ80F-1.5B4 vzduch 80 mm ER11 | [StepperOnline](https://www.omc-stepperonline.com/spindle-motor-air-cooled-220v-1-5kw-24000rpm-400hz-er11-collet-wood-engraving-milling-machine-stepperonline-cnc-vfd-motor-220v-ac-spindle-4-bearings-gdz80f-1-5b4) | ~81 USD | ER11 ❌ |
| Sada 1,5 kW vzduch, hranaté + EV51 | [StepperOnline](https://www.omc-stepperonline.com/220v-1-5kw-80x73x175-5mm-air-cooled-spindle-motor-and-2hp-1-5kw-7-0a-variable-frequency-drive-kit-vsk-asl1-5b) | ~177 USD | ověřený prodejce |
| **GDZ80-2.2B voda 80 mm ER20** | [StepperOnline](https://www.omc-stepperonline.com/spindle-motor-water-cooled-220v-2-2kw-24000rpm-400hz-er20-collet-wood-engraving-milling-machine-stepperonline-cnc-vfd-motor-220v-ac-spindle-gdz80-2-2b) | ověřit | vodní alternativa (jako na fotce favorita) |
| Sada 2,2 kW voda + Huanyang + ER20 | [RatRig EU](https://ratrig.com/products/spindle-kit-2-2kw-with-vfd-er20-collet-set-water-cooled-by-huanyang) | ~321 € (vyprodáno) | Huanyang přímo podporuje FluidNC |
| AliExpress 2,2 kW ER20 + VFD, sklad DE | [AliExpress](https://www.aliexpress.com/item/1005012830524211.html) | od 4 144 Kč | |
| AliExpress, sada ze skladu PL | [AliExpress](https://www.aliexpress.com/item/1005012959385098.html) | 5 061 Kč | |
| AliExpress G-Penny s měničem Huanyang | [AliExpress](https://www.aliexpress.com/item/32253760001.html) | od 6 453 Kč | |
| Sady 2,2 kW voda + VFD + čerpadlo | [eBay.de](https://www.ebay.de/itm/155736851543) | ~250–320 € | |
| HF-Spindel 8022 voda 2,2 kW ER20 | [Sorotec](https://www.sorotec.de/shop/HF-Motorspindle-8022-water-cooled-2-2-kW-ER20.html) | výrazně dražší | prémiová EU |

Značky: GDZ (StepperOnline, Changsheng) je nejlépe zdokumentovaná; HQD má pověst lepší kvality [neověřeno]; Mophorn a VEVOR jsou přeprodejci; „Huanyang“ bývá klon.

## Měniče (VFD) a podpora ve FluidNC

FluidNC (ověřeno ve zdrojovém kódu) podporuje `Huanyang`, `H2A`, `H100`, `YL620`, `NowForever`, `DeltaMS300`, `SiemensV20`, `DanfossVLT2800`, `FolinnBD600`, `MollomG70` a obecný `ModbusVFD`. Od verze 4.0.2 se VFD popisují pomocí „Modbus command templates“, takže neznámý měnič (např. EV210) lze přidat, pokud je k dispozici mapa jeho Modbus registrů.

| Měnič | RS485 | FluidNC | grblHAL | Poznámka |
|---|---|---|---|---|
| **Huanyang HY02D223B** | ano (protokol HY) | `Huanyang` ✅ | ✅ | nejrozšířenější; PD001=2, PD002=2, PD004=400, PD005=400, PD011=100–120, PD163=1, PD164=1, PD165=3 |
| Huanyang P2A | ano | `H2A` | ✅ [neověřeno] | |
| Huanyang GT | Modbus RTU | `ModbusVFD` [neověřeno] | [neověřeno] | některé kusy vyžadují úpravu |
| **YL620-A** | ano | `YL620` ✅ | ✅ | levný, dobře zdokumentovaný |
| H100 | ano | `H100` ✅ | ✅ | |
| Nowforever | ano | ✅ | [neověřeno] | kvalitnější čínský |
| Delta MS300 | ano | ✅ | [neověřeno] | značkový |
| Fuling DZB | ano | `ModbusVFD` [neověřeno] | MODVFD | |
| **EV210 (sada HLTNC)** | ano (485+/−) | `ModbusVFD` [neověřeno], nutná mapa registrů z manuálu | MODVFD [neověřeno] | u nás řízení svorkami: 0–10 V na AI, start na X1 |
| Schneider ATV12HU15M2 | Modbus | obecný | obecný | ~393 €, průmyslová kvalita |

Kritéria výběru: výstup až 400 Hz, vstup 1F 230 V, proud ≥ jmenovitý proud vřetena, dostupná mapa registrů.

RS485 modul pro FluidNC: [Isolated RS485 module (Tindie)](https://www.tindie.com/products/33366583/isolated-rs485-cnc-io-module) nebo [Elecrow RS485 CNC I/O](https://elecrow.com/rs485-cnc-i-o-module.html), 9600 8N1. Při nefunkční komunikaci bývají prohozené vodiče A/B.

> **Aktuální stav:** Modbus z FluidNC se pro EV210 nepoužívá. Modbus master je displej ESP32-P4; FluidNC ovládá měnič svorkami (0–10 V, relé na X1, chybový kontakt TA/TC přes optočlen).

## Elektroinstalace a bezpečnost (230 V, ČR)

| Položka | Nutnost | Detail |
|---|---|---|
| Uzemnění PE | **nutné** | vřeteno 4. vodičem na PE měniče, uzemnit i rám stroje |
| Stíněný kabel vřetena 4× 1–1,5 mm² | **silně doporučené** | stínění na PE u měniče, vést odděleně od signálů. Nestíněný kabel způsobuje chyby Modbusu a ruší ESP32 |
| Kabel RS485 | doporučené | kroucený stíněný pár, zakončení 120 Ω |
| Jistič | nutný | 1,5 kW ~10–15 A, 2,2 kW ~15–20 A ze sítě; **C16** (B16 může při nabíjecím rázu vypínat) [neověřeno], podle manuálu měniče |
| **Proudový chránič 30 mA** | povinný na zásuvkových okruzích | typ **AC je nevhodný**; minimum **A**, doporučený **F** (pro 1F měniče): [ABB](https://new.abb.com/low-voltage/cs/nizke-napeti/produkty/modularni-pristroje/proudove-chranice/standardni-proudove-chranice-rccb), [VIOX](https://viox.com/cs/rccb-type-ac-vs-a-vs-f-vs-b/) |
| EMI filtr | doporučený | 1F 10–20 A před měnič (např. [TE Corcom](https://cz.rs-online.com/web/p/silnoproude-filtry/7821047)); zvyšuje svodový proud, chránič typu F je odolnější |
| Ferity | volitelné | na USB a RS485 |
| Odborná práce | — | nový okruh nebo zásah do rozvaděče patří elektrikáři s oprávněním (vyhl. 194/2022 Sb.) [neověřeno] |

## Alternativa: ruční nebo ohraňovací frézka

| Motor | Krk | Otáčky | Cena | Poznámka |
|---|---|---|---|---|
| Makita RT0702C 710 W | 65 mm [neověřeno] | 10–30 tis. ot/min | od [4 850 Kč](https://www.hornbach.cz/p/kombinovana-frezka-makita-rt0702cx2j-700w-s-prislusenstvim-a-kufrem-makpac/10519609/) | spolehlivá; kleština max. 8 mm |
| Katsu (klon) | ~65 mm | 10–30 tis. ot/min | ~50–70 € | horší ložiska |
| AMB 1050 FME-1 (dříve Kress) | 43 mm | 5–25 tis. ot/min | ~250–300 €; verze DI s 0–10 V [~492 €](https://aio.lv/en/product--amb-am06081054--10904059.md) | nejlepší router pro CNC |

Spínání ve FluidNC: `RelaySpindle` / `OnOffSpindle` → SSR (zero-cross, ≥ 25 A) nebo stykač 16 A AC-3. Spínat fázi, nikdy PE.

## Doporučení pro náš stroj

- Vřeteno HLTNC 2,2 kW ER20 se vzduchovým chlazením + EV210 (objednáno). ER20 pojme srovnávací frézu se stopkou 8 mm. Záloha: EUCNC 2,2 kW.
- Řízení měniče svorkami z FluidNC (0–10 V, start X1, chyba TA/TC); Modbus master na RS485 je displej ESP32-P4.
- Elektroinstalace: PE, stíněný kabel vřetena, chránič typu A nebo F, jistič C16 podle manuálu EV210.
- Vřeteno 2,2 kW s měničem je za podobnou cenu výrazně lepší než další ruční frézka.
