# Řízení a elektronika

Stav firmwaru FluidNC, srovnání řídicích desek, alternativa grblHAL, 7" displej jako pendant, externí drivery, bezpečnostní prvky a doporučená sestava. Rešerše z 15. 11. 2026.

> **Aktuální stav:** Řízení FluidNC na klasickém ESP32 (na ESP32-P4 FluidNC neběží). 7" displej ESP32-P4 s vlastním portem RS485 slouží jako Modbus master k měniči vřetena a má vlastní firmware (FluidTouch podporuje jen CrowPanel ESP32-S3). Měnič se řídí svorkami: otáčky 0–10 V přes převodník z PWM, start relé na X1, chyba TA/TC přes optočlen do FluidNC.

## FluidNC: stav k 15. 11. 2026

Ověřeno na GitHubu ([releases](https://github.com/bdring/FluidNC/releases)). FluidNC **4.0.0 (3. 1. 2026)** přineslo oficiální podporu ESP32-S3. Aktuální stabilní verze je **4.1.1 (25. 9. 2026)**. Od verze 4.0.4 je podporován i RP2040/RP2350.

| Verze | Datum | Změny |
|---|---|---|
| 4.0.0 | 3. 1. 2026 | ESP32-S3, asynchronní webserver, WebDAV |
| 4.0.3 | 20. 4. 2026 | nativní USB na S3, USB host pro displeje a pendanty |
| 4.0.4 | 5. 8. 2026 | pendanty ESP-NOW, Ethernet, RP2040 – ⚠️ označeno „BAD – DO NOT USE“, nepoužívat |
| **4.1.0 / 4.1.1** | 12. 9. / 25. 9. 2026 | ESP-NOW v `wifi_s3`, vylepšení VFD, PSRAM |

**Omezení ESP32-S3:** chybí Bluetooth serial; otevřená chyba [#1931](https://github.com/bdring/FluidNC/issues/1931) (pád při nahrání ~1 MB G-kódu na větvi main). **Klasické ESP32 (WROOM-32) je stále nejlépe odladěné.** Max. krokovací frekvence ~250 kHz.

**Funkce:** konfigurace v YAML bez kompilace, WebUI přes WiFi, SD karta, až 6 os, 2 motory na osu s auto-squaringem, VFD přes RS485, PWM, 0–10 V, relé, sondy, makra, pendanty (UART / WebSocket / ESP-NOW).

## Řídicí desky pro FluidNC

| Deska | MCU | Drivery | Vstupy | Vřeteno | Cena | Hodnocení |
|---|---|---|---|---|---|---|
| **6x CNC Controller** (Bart Dring) | ESP32-WROOM-32E | **6× externí STEP/DIR/EN, signály 5 V** | 8 izolovaných, HW E-stop, NPN senzory | RS485, 0–10 V, PWM, relé (moduly) | [~49 USD Elecrow / 64 USD Tindie](https://www.cnx-software.com/2025/01/30/fluidnc-compatible-cnc-controller-supports-6-stepper-drivers-web-based-configuration/) | ✅ **nejlepší pro DM542/DM556** |
| 6-Pack External Driver | ESP32 DevKitC | 6× externí | 6 opto | moduly | 55 USD, [vyprodáno](https://www.tindie.com/products/33366583/6-pack-external-driver-cnc-controller/) | předchůdce 6x |
| PiBot V5.77 Carrier | **ESP32-S3** | jen externí | 10 | – | [47,99 USD](https://www.tindie.com/products/pibot/pibot-v577-carrier-esp32-s3-62-axis-cnc/) | S3 + USB host, menší komunita |
| PiBot V4.9 Plus B | ESP32 | – | – | RS485 | [54,99 USD](https://www.elecrow.com/pibot-fluidnc-grbl-cnc-controller-v4-9.html) | |
| Jackpot3 (V1E) | ESP32 | jen vestavěné TMC2209, 9–24 V | 7 | – | [~76 USD](https://www.v1e.com/products/jackpot3-cnc-controller) | ❌ pro externí drivery a 48 V |
| BTT Rodent | ESP32 | vestavěné TMC2160 3 A | – | PWM, RS485 | [69 €](https://eu.biqu.equipment/products/bigtreetech-rodent) | NEMA23 do 3 A bez externích driverů |
| MKS DLC32 V2.1 | ESP32 | patice + slot | – | PWM | ~35–45 USD | spíše pro laser |

## Alternativa: grblHAL

- ESP32 / S3: driver [grblHAL/ESP32](https://github.com/grblHAL/ESP32); I2S na S3 „not yet extensively tested“, přes RMT max. 4 motory.
- **Teensy 4.1:** nejvýkonnější, Ethernet: [T41U5XBB](https://www.tindie.com/products/philba/grblhal-bob-unkit-for-teensy-41-t41u5xbb), Expatria Flexi-HAL.
- RP2040 (PicoBOB), STM32 (BTT SKR, Sienci SLB EXT): [seznam desek](https://github.com/grblhal/controllers).
- Výhody: [Web Builder](https://github.com/grblHAL/drivers), ioSender/gSender, Ethernet. Nevýhody: bez WiFi WebUI, pendant pro 7" displej by bylo nutné napsat.

## 7" ESP32 displej jako pendant (HMI)

| Projekt | HW | Spojení | Stav |
|---|---|---|---|
| **[FluidTouch](https://jeyeager65.github.io/FluidTouch/)** ([GitHub](https://github.com/jeyeager65/FluidTouch)) | **Elecrow CrowPanel 7" Basic/Advance (ESP32-S3, 800×480)**, doporučená verze Advance | WiFi (WebSocket), **ESP-NOW** (FluidNC ≥ 4.1.0), UART, USB CDC | **v1.1.0 z 10. 10. 2026**; jogging, sondy, makra, soubory. Na FluidNC 4.x port 80 místo 81 |
| [FluidDial](https://djos1475.github.io/FluidDial-CYD/) | M5Dial, CYD 2,8" | UART 1 Mbaud / WebSocket | v1.5.2 |
| [CYD pendant s tlačítky](https://www.tindie.com/products/cyberneticsys/fluidnc-fluiddial-cyd-pendant-w-buttons-mount) | CYD | UART | hotový produkt |
| [PiBot CNC Pendant V4.0](https://www.cnx-software.com/2026/02/17/pibot-cnc-pendant-v4-0-a-handheld-bluetooth-and-rj12-controller-for-fluidnc-based-cnc-machines/) | ESP32 | UART | firmware pre-alpha |
| [Fluid-controller](https://github.com/gjkrediet/Fluid-controller) | ESP32 | WiFi/BT | komunitní |

### Možnosti podle typu displeje

- **Elecrow CrowPanel 7" (ESP32-S3):** FluidTouch se nahraje přes web installer (pozor na variantu Basic/Advance). Advance ~30–50 € ([exp-tech](https://exp-tech.de/en/products/dis02170a)).
- **Sunton ESP32-8048S070 (S3 N16R8, GT911):** FluidTouch oficiálně nepodporuje, port je reálný (stejný čip, LVGL). Volných GPIO je málo (IO17/IO18, UART0 IO43/44) → nejjednodušší je **WiFi/WebSocket nebo ESP-NOW**. [pinout](https://esp3d.io/esp3d-tft/version_1x/hardware/esp32-s3/sunton-70-8048/)
- **Waveshare ESP32-S3-Touch-LCD-7:** má RS485 i CAN ([Waveshare](https://waveshare.com/ESP32-S3-Touch-LCD-7.htm)), nutný vlastní port.
- **Vlastní pendant:** textový protokol Grbl (`?` → `<Idle|MPos:...>`, `$J=G91 X1 F500`, realtime `!`, `~`, `0x18`) přes UART nebo WebSocket.

> **Aktuální stav:** Používáme 7" displej s ESP32-P4, který FluidTouch nepodporuje. Displej má vlastní firmware a přes svůj port RS485 je Modbus masterem k měniči.

## Externí drivery (DM542T / DM556T)

- DM542T: [~23 € eBay.de](https://www.ebay.de/itm/204393996963), [17,88 USD StepperOnline](https://www.omc-stepperonline.com/stepper-motor-driver/dm542s.html).
- Optické vstupy vyžadují ~7–16 mA, přímé 3,3 V z ESP32 je na hranici → deska s výstupy 5 V (6x) nebo buffer **74HCT125**.
- FluidNC: `pulse_us: 4–5`, `dir_delay_us: 5`, PUL/DIR často invertovat (`:low`), ENA = disable (invertovat). [wiki](https://github-wiki-see.page/m/Longus/FluidNC/wiki/External-Stepper-Motor-Drivers)

> **Pozor:** Nemíchat externí drivery s logikou 5 V a drivery Trinamic na stejné logice 5 V.

## Koncové spínače, homing, sonda, E-stop, napájení

| Oblast | Doporučení |
|---|---|
| Koncové spínače | mikrospínače **NC** + stíněný kabel, nebo indukční NPN (NJK-5002C, 6–36 V) na izolované vstupy |
| Homing | nejdříve Z nahoru, potom X a Y. Etapa 1: jen Z s jedním spínačem |
| Dvojitá osa Y | `motor0` + `motor1`, **každý s vlastním spínačem**, osu se squaringem dát do **samostatného homing cyklu** ([#19](https://github.com/bdring/FluidNC/issues/19), [#564](https://github.com/bdring/FluidNC/issues/564)) |
| Sonda Z | destička na vstup probe + krokosvorka na frézu, `G38.2 Z-20 F100`; později tool length setter |
| **E-stop** | hřibové tlačítko se **2 NC kontakty**: (1) hardwarově odpojí stykač 48 V driverů a zastaví vřeteno (svorka STOP měniče nebo odpojení napájení); (2) vstup řídicí desky. Samotný softwarový E-stop nestačí |
| Napájení motorů | **Mean Well LRS-350-48** (7,3 A, ~900–1 100 Kč přes TME/GM/RS); pro 4× NEMA23 3 A spíše **LRS-600-48**. Výstup snížit na ~46 V (rezerva pro DM542, max. 50 V) |
| Napájení logiky | samostatný Mean Well LRS-50-24 (deska, relé, senzory), galvanicky oddělený |
| Ovládání vřetena | VFD přes RS485 (nejlepší) nebo 0–10 V + relé na FWD; čerpadlo vodního chlazení přes `coolant: flood_pin` + průtokový spínač |

> **Aktuální stav:** Vřeteno je vzduchem chlazené (čerpadlo odpadá). FluidNC řídí měnič variantou 0–10 V + relé (start na X1), RS485 obsluhuje displej ESP32-P4.

## Doporučená sestava (varianta A: FluidNC na klasickém ESP32)

| Etapa | Komponenta | Orientační cena |
|---|---|---|
| Z | **6x CNC Controller** + FluidNC 4.1.1 | ~1 250–1 600 Kč |
| Z | izolovaný modul RS485 (pro VFD) | ~15–25 USD [neověřeno] |
| Z | DM542T/DM556T + NEMA23 3 Nm + SFU1605 | ~1 500–2 500 Kč |
| Z | LRS-600-48 + LRS-50-24 | ~1 500–2 000 Kč |
| Z | E-stop, stykač, spínače, touch plate, stíněné kabely, EMI filtr | ~1 500–2 500 Kč |
| XY | +3× driver + 3× NEMA23 (X, Y1, Y2), spínače | ~4–6 tis. Kč |
| HMI | 7" displej ESP32-P4 s vlastním firmwarem (původně ESP32-S3 + FluidTouch) | už máme |

Rozšíření ze Z na XYZ znamená jen změnu YAML a zapojení dalších driverů.

**Varianta B:** PiBot V5.77 (ESP32-S3) + FluidNC 4.1.1: nativní USB, ale mladší větev. **Varianta C:** grblHAL na Teensy 4.1: pro serva a Ethernet, bez WiFi.

## Doporučení pro náš stroj

- Řídicí deska: FluidNC 4.1.1 na klasickém ESP32 s výstupy 5 V pro externí drivery (např. 6x CNC Controller). Verzi 4.0.4 nepoužívat.
- Drivery: 4× DM556 (X, Y1, Y2, Z), osa Y se dvěma motory a auto-squaringem.
- Vřeteno: řízení svorkami (0–10 V přes převodník z PWM, start relé na X1, chyba TA/TC přes optočlen na vstup FluidNC).
- HMI: 7" ESP32-P4 s vlastním firmwarem, Modbus master k měniči EV210.
- E-stop hardwarově přes stykač, ne jen softwarově.
