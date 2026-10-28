/* Разбор — модели устройств, часть 2: Apple Watch и AirPods Pro. */
(() => {
  'use strict';
  const D = window.RAZBOR_DEVICES;
  const H = window.RAZBOR_ART;

  /* ── Apple Watch ──────────────────────────── */
  const WW = 190, WH = 230, WR = 50;

  const ring = (r, c, frac, w) => {
    const L = 2 * Math.PI * r;
    return `<circle cx="95" cy="150" r="${r}" fill="none" stroke="${c}" stroke-opacity=".22" stroke-width="${w}"/><circle cx="95" cy="150" r="${r}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${(L * frac).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 95 150)"/>`;
  };

  D.watch = {
    id: 'watch', name: 'Apple Watch', accent: '#86D99A', maxScale: 1.3,
    tag: 'Компьютер, датчики здоровья и аккумулятор в корпусе размером 4–5 сантиметров.',
    facts: ['9 модулей', 'Корпус 4–5 см'],
    cam: { A: { tilt: 82, turn: -20 }, E: { tilt: 60, turn: -30 } },
    shadow: { A: [240, 110, -306], E: [260, 640, -150] },
    root: {
      key: 'watchbody', w: WW, h: WH, A: { rx: -90 }, E: { rx: 0 },
      children: [
        {
          key: 'crystal', name: 'Защитное стекло', short: 'Стекло', zA: 23, zE: 480,
          desc: 'Изогнутое стекло экрана. В алюминиевых моделях это прочное стекло Ion-X, в титановых и стальных — сапфир.',
          facts: ['Ion-X или сапфир'],
          anchor: [150, 52],
          art: u => H.glass(u, WW, WH, WR)
        },
        {
          key: 'display', name: 'Дисплей LTPO OLED Always-On', short: 'Дисплей', zA: 21, zE: 410,
          desc: 'Экран снижает частоту обновления до 1 Гц и поэтому может не гаснуть, почти не тратя батарею. Время и кольца активности видны всегда.',
          facts: ['LTPO OLED', 'До 1 Гц'],
          anchor: [95, 150],
          art: () => `<rect x="4" y="4" width="182" height="222" rx="46" fill="#020203"/>
<text class="x-clock" x="95" y="68" text-anchor="middle" font-family="${H.sans}" font-size="44" font-weight="600" fill="#fff">10:09</text>
<text class="x-dshort" x="95" y="88" text-anchor="middle" font-family="${H.mono}" font-size="10" fill="#ddae4b">СР 28</text>
${ring(48, '#ff375f', .78, 11)}${ring(35, '#a6ff3a', .62, 11)}${ring(22, '#3ad7ff', .9, 11)}`
        },
        {
          key: 'case', name: 'Корпус и Digital Crown', short: 'Корпус', zA: 0, zE: 320,
          desc: 'Алюминиевый или титановый корпус. Колёсико Digital Crown прокручивает интерфейс с тактильными щелчками, под ним боковая кнопка.',
          facts: ['Digital Crown', 'Боковая кнопка'],
          anchor: [186, 84],
          thick: {
            n: 10, depth: 44, bw: 8, r: WR, color: H.shade(220, 8, 22, 42),
            extra: (k, i) => (i >= 3 && i <= 6) ? `<rect x="189" y="64" width="12" height="38" rx="4" fill="hsl(220,6%,${i % 2 ? 50 : 38}%)"/><rect x="189" y="140" width="4" height="40" rx="2" fill="hsl(220,6%,34%)"/>` : ''
          }
        },
        {
          key: 'sip', name: 'Система в корпусе S-серии', short: 'Чип S', zA: 8, zE: 240,
          desc: 'Процессор, память, датчики движения и беспроводные модули собраны в один герметичный модуль SiP. Так всё помещается в корпус часов.',
          facts: ['SiP', 'Всё в одном модуле'],
          anchor: [95, 71],
          art: u => `${H.ghost(WW, WH, WR)}<defs>${H.metal(u, 'm', '#dcdfe3', '#9da2a8', '#c8cbd0')}</defs>
<rect x="40" y="30" width="110" height="84" rx="10" fill="#141920" stroke="#2c3a48" stroke-width="1.2"/>
<rect x="64" y="40" width="62" height="62" rx="7" fill="url(#${u}m)"/>
<text x="95" y="77" text-anchor="middle" font-family="${H.sans}" font-size="14" font-weight="700" fill="#26282c">S·SiP</text>
${H.grid(46, 38, 2, 7, 7, 9, 4, 2.6, H.chips)}${H.grid(132, 38, 2, 7, 7, 9, 4, 2.6, H.chips)}
<path class="flow" d="M95 102V120H60" fill="none" stroke="#c9a14a" stroke-width="1.2"/>`
        },
        {
          key: 'battery', name: 'Аккумулятор', short: 'Аккумулятор', zA: 2, zE: 185,
          desc: 'Плоская литий-ионная батарея занимает почти всю площадь под экраном. Часы заряжаются по воздуху через заднюю крышку.',
          facts: ['Литий-ион', 'Беспроводная зарядка'],
          anchor: [95, 157],
          art: u => `${H.ghost(WW, WH, WR)}<defs>${H.foil(u, 'b')}</defs>
<rect x="34" y="122" width="122" height="70" rx="12" fill="url(#${u}b)" stroke="#4d5159"/>
<rect x="46" y="134" width="70" height="22" rx="4" fill="#ece9e3"/><text x="54" y="149" font-family="${H.mono}" font-size="10" font-weight="600" fill="#1c1917">Li-ion</text>
<rect x="46" y="168" width="98" height="8" rx="4" fill="#2b2e34"/><rect class="chg" x="46" y="168" width="98" height="8" rx="4" fill="#7fdc8c"/>`
        },
        {
          key: 'taptic', name: 'Taptic Engine и динамик', short: 'Taptic Engine', zA: -4, zE: 140,
          desc: 'Вибромотор деликатно постукивает по запястью при уведомлениях. Рядом динамик для звонков и Siri.',
          facts: ['Тактильные сигналы', 'Динамик'],
          anchor: [59, 208],
          art: () => `${H.ghost(WW, WH, WR)}<rect x="22" y="198" width="74" height="20" rx="5" fill="#2b2d33" stroke="#4d5159"/><rect class="buzz" x="30" y="206" width="58" height="4" rx="2" fill="#c9a14a"/>
<rect x="104" y="198" width="64" height="20" rx="6" fill="#24262b" stroke="#4d5159"/>${H.dots(112, 204, 8, 2, 6.8, 7, 1.5, '#0b0b0d')}`
        },
        {
          key: 'sensors', name: 'Датчики здоровья', short: 'Датчики', zA: -14, zE: 80,
          desc: 'Зелёные светодиоды и фотодиоды измеряют пульс по току крови в сосудах, а электроды в задней крышке и колёсике снимают ЭКГ.',
          facts: ['Пульс', 'ЭКГ'],
          anchor: [135, 115],
          art: () => {
            let leds = '';
            for (let i = 0; i < 8; i++) {
              const a = i / 8 * Math.PI * 2, x = (95 + Math.cos(a) * 40).toFixed(1), y = (115 + Math.sin(a) * 40).toFixed(1);
              leds += i % 2
                ? `<rect x="${(x - 5).toFixed(1)}" y="${(y - 5).toFixed(1)}" width="10" height="10" rx="2" fill="#1d2430" stroke="#46546b"/>`
                : `<circle cx="${x}" cy="${y}" r="10" fill="#39ff8a" fill-opacity=".18"/><circle class="led" cx="${x}" cy="${y}" r="5.5" fill="#39ff8a"/>`;
            }
            return `${H.ghost(WW, WH, WR)}<circle cx="95" cy="115" r="70" fill="#111316" stroke="#2c3038"/><circle cx="95" cy="115" r="62" fill="none" stroke="#9aa1aa" stroke-width="3" stroke-opacity=".7"/>${leds}<circle cx="95" cy="115" r="16" fill="#ff4f4f" fill-opacity=".14"/><circle cx="95" cy="115" r="9" fill="#ff4f4f" fill-opacity=".85"/>`;
          }
        },
        {
          key: 'back', name: 'Задняя крышка', short: 'Задняя крышка', zA: -22.6, zE: 0,
          desc: 'Купол из стекла и керамики с линзами Френеля над датчиками. Через него же часы заряжаются от магнитной шайбы.',
          facts: ['Линзы Френеля', 'Зарядка через крышку'],
          anchor: [95, 60],
          art: u => {
            let rings = '';
            for (let r = 20; r <= 76; r += 8) rings += `<circle cx="95" cy="115" r="${r}" fill="none" stroke="#fff" stroke-opacity=".07"/>`;
            const wins = [0, 1, 2, 3].map(i => {
              const a = i * Math.PI / 2 + Math.PI / 4;
              return `<circle cx="${(95 + Math.cos(a) * 40).toFixed(1)}" cy="${(115 + Math.sin(a) * 40).toFixed(1)}" r="7" fill="#05060a" stroke="#3a3f48"/>`;
            }).join('');
            return `<defs><radialGradient id="${u}d" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#2a2f37"/><stop offset="1" stop-color="#0e1013"/></radialGradient></defs>
<rect x="2" y="2" width="186" height="226" rx="48" fill="#262a31" stroke="#3b4049"/><circle cx="95" cy="115" r="84" fill="url(#${u}d)" stroke="#4a505a"/>${rings}${wins}`;
          }
        },
        {
          key: 'band', name: 'Спортивный ремешок', short: 'Ремешок', w: 120, h: 600, zA: -27, zE: -110,
          desc: 'Ремешок из фторэластомера застёгивается на кнопку с петлёй. Снимается одним нажатием на защёлку на корпусе.',
          facts: ['Фторэластомер', 'Быстрая замена'],
          anchor: [60, 520],
          art: u => `<defs><linearGradient id="${u}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#23304a"/><stop offset=".5" stop-color="#34446a"/><stop offset="1" stop-color="#22304a"/></linearGradient></defs>
<rect x="0" y="0" width="120" height="600" rx="56" fill="url(#${u}s)" stroke="#3f5078"/>
${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="60" cy="${430 + i * 22}" r="4" fill="#141c2c"/>`).join('')}<rect x="44" y="40" width="32" height="8" rx="4" fill="#9aa3b5"/>`
        }
      ]
    }
  };

  /* ── AirPods Pro ──────────────────────────── */
  const AW = 240, AH = 196, AR = 62;

  const bud = (cx, flip) => `<ellipse cx="${cx}" cy="52" rx="31" ry="27" fill="#f6f6f8" stroke="#d6d7dc"/>
<ellipse cx="${cx + flip * 10}" cy="44" rx="15" ry="12" fill="#e4e5e9"/><ellipse cx="${cx - flip * 8}" cy="58" rx="7" ry="4" fill="#2a2a2e"/>
<rect x="${cx - 12}" y="70" width="24" height="104" rx="12" fill="#f8f8fa" stroke="#d6d7dc"/>
<rect x="${cx - 6}" y="160" width="12" height="7" rx="3.5" fill="#2a2a2e"/><rect x="${cx - 4}" y="176" width="8" height="5" rx="2" fill="#c9a14a"/>`;

  const shellFace = (u, id, cx) => `<defs><radialGradient id="${u}${id}" cx="${cx}" cy=".3" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#eeeef1"/><stop offset="1" stop-color="#d9d9de"/></radialGradient></defs>
<rect x="1" y="1" width="238" height="194" rx="61" fill="url(#${u}${id})" stroke="#c9cad0"/><path d="M4 64H236" stroke="#c4c5cb" stroke-width="1.5"/>`;

  D.airpods = {
    id: 'airpods', name: 'AirPods Pro', accent: '#E9DCC4', maxScale: 1.45,
    tag: 'Кейс — тоже устройство: своя батарея, плата, динамик и катушка беспроводной зарядки.',
    facts: ['8 модулей', 'Кейс с поиском'],
    cam: { A: { tilt: 80, turn: -22 }, E: { tilt: 60, turn: -30 } },
    shadow: { A: [280, 130, -110], E: [290, 250, -60] },
    root: {
      key: 'casebody', w: AW, h: AH, A: { rx: -90 }, E: { rx: 0 },
      children: [
        {
          key: 'front', name: 'Кейс: передняя часть', short: 'Передняя часть', zA: 41, zE: 540,
          desc: 'Глянцевый корпус с индикатором состояния: зелёный — заряжено, оранжевый — идёт зарядка или заряда меньше, чем на один полный цикл.',
          facts: ['Индикатор заряда'],
          anchor: [120, 132],
          art: u => `${shellFace(u, 'f', '.35')}<circle cx="120" cy="132" r="8" fill="#3ddc84" fill-opacity=".18"/><circle class="led" cx="120" cy="132" r="3.2" fill="#3ddc84"/>`
        },
        {
          key: 'buds', name: 'Наушники AirPods Pro', short: 'Наушники', zA: 18, zE: 440,
          desc: 'В каждом наушнике чип H-серии, микрофоны для шумоподавления и динамик. Заряжаются через контакты на конце ножки.',
          facts: ['Активное шумоподавление', 'Чип H-серии'],
          anchor: [72, 52],
          art: () => `${H.ghost(AW, AH, AR)}${bud(72, -1)}${bud(168, 1)}`
        },
        {
          key: 'shell', name: 'Корпус кейса и шарнир', short: 'Корпус', zA: 0, zE: 330,
          desc: 'Боковины кейса и стальной шарнир крышки. Магниты притягивают наушники в гнёзда и защёлкивают крышку.',
          facts: ['Магниты', 'Шарнир'],
          anchor: [4, 130],
          thick: {
            n: 12, depth: 80, bw: 9, r: AR, color: H.shade(240, 6, 84, 97),
            extra: () => '<rect x="0" y="63" width="9" height="2" fill="#b9bac0"/><rect x="231" y="63" width="9" height="2" fill="#b9bac0"/>'
          }
        },
        {
          key: 'board', name: 'Плата кейса', short: 'Плата', zA: -10, zE: 240,
          desc: 'Управляет зарядкой наушников и батареи кейса. Чип сверхширокополосной связи помогает найти кейс в приложении «Локатор».',
          facts: ['Контроллер заряда', 'Поиск в «Локаторе»'],
          anchor: [107, 157],
          art: () => `${H.ghost(AW, AH, AR)}<rect x="84" y="140" width="72" height="34" rx="6" fill="#15301f" stroke="#2f6b4a"/>
<rect x="96" y="146" width="22" height="22" rx="3" fill="#2a2d33"/><text x="107" y="161" text-anchor="middle" font-family="${H.mono}" font-size="9" font-weight="600" fill="#c9cdd3">U</text>
<rect x="124" y="146" width="16" height="10" rx="2" fill="#1c1e22"/>${H.grid(124, 160, 4, 2, 6, 6, 3.6, 2.4, H.chips)}
<path class="flow" d="M84 157H60V120" fill="none" stroke="#c9a14a" stroke-width="1.2"/><path class="flow" d="M156 157H180V120" fill="none" stroke="#c9a14a" stroke-width="1.2"/>`
        },
        {
          key: 'battery', name: 'Аккумулятор кейса', short: 'Аккумулятор', zA: -18, zE: 190,
          desc: 'Запаса батареи кейса хватает на несколько полных зарядок наушников.',
          facts: ['Литий-ион'],
          anchor: [120, 113],
          art: u => `${H.ghost(AW, AH, AR)}<defs>${H.foil(u, 'b')}</defs>
<rect x="40" y="92" width="160" height="42" rx="9" fill="url(#${u}b)" stroke="#4d5159"/>
<rect x="52" y="100" width="64" height="18" rx="3" fill="#ece9e3"/><text x="60" y="113" font-family="${H.mono}" font-size="9" font-weight="600" fill="#1c1917">Li-ion</text>
<rect x="124" y="106" width="64" height="7" rx="3.5" fill="#2b2e34"/><rect class="chg" x="124" y="106" width="64" height="7" rx="3.5" fill="#7fdc8c"/>`
        },
        {
          key: 'speaker', name: 'Динамик и порт USB-C', short: 'Динамик', zA: -24, zE: 140,
          desc: 'Динамик в кейсе подаёт звук, когда кейс ищут через «Локатор». Снизу разъём USB-C.',
          facts: ['Сигнал поиска', 'USB-C'],
          anchor: [60, 171],
          art: () => `${H.ghost(AW, AH, AR)}<rect x="40" y="160" width="40" height="22" rx="7" fill="#24262b" stroke="#4d5159"/>${H.dots(47, 166, 5, 2, 6.5, 9, 1.5, '#0b0b0d')}
<rect x="96" y="182" width="48" height="12" rx="6" fill="#0d0d0f" stroke="#8a8f96" stroke-width="1.5"/><rect x="108" y="186.5" width="24" height="3" rx="1.5" fill="#c9a14a"/>`
        },
        {
          key: 'coil', name: 'Катушка беспроводной зарядки', short: 'Катушка', zA: -32, zE: 80,
          desc: 'Заряжает кейс от зарядок Qi и MagSafe, а кейсы с USB-C — ещё и от зарядки Apple Watch.',
          facts: ['Qi', 'MagSafe'],
          anchor: [180, 100],
          art: () => `${H.ghost(AW, AH, AR)}${H.coil(120, 100, 16, 52, 4, 2.2)}<circle cx="120" cy="100" r="60" fill="none" stroke="#8f959d" stroke-width="7" stroke-dasharray="12 3.4"/>`
        },
        {
          key: 'back', name: 'Кейс: задняя часть', short: 'Задняя часть', zA: -41, zE: 0,
          desc: 'Задняя половина кейса с креплением шарнира крышки.',
          facts: ['Пластик', 'Шарнир'],
          anchor: [40, 150],
          art: u => `${shellFace(u, 'k', '.6')}<rect x="92" y="56" width="56" height="14" rx="5" fill="#c9cbd0" stroke="#aeb0b6"/>`
        }
      ]
    }
  };
})();
