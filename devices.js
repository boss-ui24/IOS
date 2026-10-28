/* Разбор — модели устройств, часть 1: общие помощники, iPhone, MacBook Pro.
   Каждая деталь: zA — высота в собранном виде, zE — в разобранном,
   art(u) — SVG-рисунок слоя в координатах устройства (u — префикс для id). */
(() => {
  'use strict';
  const D = window.RAZBOR_DEVICES = window.RAZBOR_DEVICES || {};
  const H = window.RAZBOR_ART = {};

  H.sans = 'Inter, Arial, sans-serif';
  H.mono = 'JetBrains Mono, ui-monospace, monospace';
  H.ghost = (w, h, r) => `<rect class="ghost" x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="5 7"/>`;
  H.grid = (x, y, cols, rows, dx, dy, w, h, fill) => {
    let s = '';
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      s += `<rect x="${(x + i * dx).toFixed(1)}" y="${(y + j * dy).toFixed(1)}" width="${w}" height="${h}" rx=".6" fill="${typeof fill === 'function' ? fill(i, j) : fill}"/>`;
    }
    return s;
  };
  H.dots = (x, y, cols, rows, dx, dy, r, fill) => {
    let s = '';
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) s += `<circle cx="${(x + i * dx).toFixed(1)}" cy="${(y + j * dy).toFixed(1)}" r="${r}" fill="${fill}"/>`;
    return s;
  };
  H.metal = (u, id, a, b, c) => `<linearGradient id="${u}${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
  H.foil = (u, id) => `<linearGradient id="${u}${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3d44"/><stop offset="1" stop-color="#1f2125"/></linearGradient>`;
  H.glass = (u, w, h, r) => `<defs><linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8e8ff" stop-opacity=".30"/><stop offset=".45" stop-color="#ffffff" stop-opacity=".06"/><stop offset="1" stop-color="#a9c2e6" stop-opacity=".22"/></linearGradient><clipPath id="${u}c"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r - 1}"/></clipPath></defs>
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r - 1}" fill="url(#${u}g)" stroke="#8fa6c4" stroke-opacity=".75" stroke-width="1.5"/>
<g clip-path="url(#${u}c)"><path d="M${w * .24} -10H${w * .68}L${w * .16} ${h + 10}H${-w * .28}Z" fill="#fff" opacity=".10"/><path d="M${w * .8} -10H${w * .9}L${w * .38} ${h + 10}H${w * .28}Z" fill="#fff" opacity=".07"/></g>`;
  H.lens = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2b2e35" stroke="#5a5e65" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="${r * .74}" fill="#07080c"/><circle cx="${cx}" cy="${cy}" r="${r * .52}" fill="#131b38"/><circle cx="${cx}" cy="${cy}" r="${r * .3}" fill="#2c4290"/><circle cx="${(cx - r * .26).toFixed(1)}" cy="${(cy - r * .28).toFixed(1)}" r="${(r * .13).toFixed(1)}" fill="#d4e3ff" fill-opacity=".85"/>`;
  H.coil = (cx, cy, r0, r1, step, w) => {
    let s = '';
    for (let r = r0, i = 0; r <= r1; r += step, i++) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${i % 2 ? '#d58c57' : '#a85b31'}" stroke-width="${w}"/>`;
    return s;
  };
  H.shade = (hue, sat, l0, l1) => k => `hsl(${hue},${sat}%,${(l0 + Math.sin(k * Math.PI) * (l1 - l0)).toFixed(1)}%)`;
  H.chips = (i, j) => ((i * 3 + j * 5) % 4 ? '#3b3f46' : '#b89a6a');
  H.screw = (x, y, r = 4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#9aa0a8" stroke="#5d626a" stroke-width=".8"/><path d="M${x - r * .5} ${y}h${r}M${x} ${y - r * .5}v${r}" stroke="#4a4e55" stroke-width="1.1"/>`;
  H.shield = (u, x, y, w, h) => `<defs><pattern id="${u}sh" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".9" fill="#7d838b"/></pattern></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#a9aeb5" stroke="#6f747c"/><rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="2" fill="url(#${u}sh)"/>`;

  /* ── iPhone ───────────────────────────────── */
  const PW = 250, PH = 520, PR = 44;

  D.iphone = {
    id: 'iphone', name: 'iPhone', accent: '#7C93D8', maxScale: 1.25,
    tag: 'Около десятка основных модулей в корпусе толщиной меньше сантиметра.',
    facts: ['10 модулей', 'Толщина меньше 1 см'],
    cam: { A: { tilt: 80, turn: -18 }, E: { tilt: 62, turn: -28 } },
    shadow: { A: [300, 70, -268], E: [330, 600, -100] },
    root: {
      key: 'body', w: PW, h: PH, A: { rx: -90 }, E: { rx: 0 },
      children: [
        {
          key: 'glass', name: 'Передняя панель Ceramic Shield', short: 'Ceramic Shield', zA: 13.8, zE: 520,
          desc: 'Стекло с вплавленными нанокристаллами керамики. Защищает экран от падений и царапин и пропускает свет без искажений.',
          facts: ['Стекло и керамика', 'Олеофобное покрытие'],
          anchor: [204, 120],
          art: u => H.glass(u, PW, PH, PR)
        },
        {
          key: 'display', name: 'OLED-дисплей Super Retina XDR', short: 'OLED-дисплей', zA: 12, zE: 450,
          desc: 'Каждый пиксель светится сам, поэтому чёрный — это просто выключенные пиксели. В Pro-моделях частота обновления меняется от 1 до 120 Гц.',
          facts: ['OLED', 'ProMotion до 120 Гц', 'Dynamic Island'],
          anchor: [125, 300],
          art: u => `<defs><linearGradient id="${u}w" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#1d1d1f"/><stop offset="1" stop-color="#0a0a0b"/></linearGradient>
<radialGradient id="${u}r" cx=".78" cy=".28" r=".55"><stop offset="0" stop-color="#ffffff" stop-opacity=".07"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
<clipPath id="${u}c"><rect x="7" y="7" width="236" height="506" rx="37"/></clipPath></defs>
<rect x="3" y="3" width="244" height="514" rx="41" fill="#050506"/>
<g clip-path="url(#${u}c)"><rect width="250" height="520" fill="url(#${u}w)"/><rect width="250" height="520" fill="url(#${u}r)"/></g>
<rect x="88" y="19" width="74" height="22" rx="11" fill="#000"/>
<text class="x-date" x="125" y="84" text-anchor="middle" font-family="${H.sans}" font-size="13" font-weight="600" fill="#fff" fill-opacity=".85">среда, 28 октября</text>
<text class="x-clock" x="125" y="148" text-anchor="middle" font-family="${H.sans}" font-size="70" font-weight="300" fill="#fff" letter-spacing="-2">9:41</text>
<circle cx="54" cy="462" r="18" fill="#000" fill-opacity=".3"/><circle cx="196" cy="462" r="18" fill="#000" fill-opacity=".3"/>
<rect x="90" y="499" width="70" height="4.5" rx="2.25" fill="#fff" fill-opacity=".85"/>`
        },
        {
          key: 'truedepth', name: 'Камера TrueDepth и Face ID', short: 'Face ID', zA: 9, zE: 330,
          desc: 'Проектор наносит на лицо больше 30 000 невидимых точек, инфракрасная камера считывает их и строит карту глубины. Так телефон узнаёт владельца даже в темноте.',
          facts: ['Инфракрасный свет', 'Карта глубины'],
          anchor: [172, 29],
          art: () => `${H.ghost(PW, PH, PR)}<g transform="translate(78 14)"><rect width="94" height="30" rx="15" fill="#15161a" stroke="#34373e"/>
<circle cx="16" cy="15" r="7.5" fill="#09090b" stroke="#3d4048"/><circle cx="16" cy="15" r="3" fill="#2b3d6b"/><circle cx="37" cy="15" r="4.5" fill="#2a1820"/>
<circle cx="57" cy="15" r="6.5" fill="#09090b" stroke="#3d4048"/><circle cx="57" cy="15" r="2.6" fill="#4f6bd6"/>
<circle cx="78" cy="15" r="6.5" fill="#170e13" stroke="#3d4048"/><circle cx="78" cy="15" r="2.4" fill="#b2456a"/></g>
<path d="M125 44v26h-24v46" fill="none" stroke="#c9a14a" stroke-width="4" stroke-linejoin="round" opacity=".85"/>`
        },
        {
          key: 'frame', name: 'Рамка корпуса', short: 'Рамка', zA: 0, zE: 270,
          desc: 'Несущий контур телефона: на нём кнопки, антенны и крепления всех модулей. В Pro-моделях разных лет рамку делали из нержавеющей стали, титана и алюминия.',
          facts: ['Кнопки и антенны', 'Несущая конструкция'],
          anchor: [PW - 3.5, 300],
          thick: {
            n: 10, depth: 26, bw: 7, r: PR, color: H.shade(30, 5, 42, 72),
            extra: (k, i) => (i === 4 || i === 5) ? `<g fill="hsl(30,5%,58%)"><rect x="-3.5" y="112" width="4" height="26" rx="2"/><rect x="-3.5" y="160" width="4" height="46" rx="2"/><rect x="-3.5" y="216" width="4" height="46" rx="2"/><rect x="249.5" y="178" width="4" height="72" rx="2"/><rect x="249.5" y="330" width="3.5" height="40" rx="1.75" fill="hsl(30,4%,38%)"/></g>` : ''
          }
        },
        {
          key: 'board', name: 'Логическая плата с чипом A-серии', short: 'Плата и чип', zA: 4, zE: 200,
          desc: 'Двухэтажная «сэндвич»-плата: на ней процессор, память, модем и контроллер питания. Чип A-серии объединяет CPU, графику и Neural Engine.',
          facts: ['Двухслойная плата', 'CPU · GPU · Neural Engine'],
          anchor: [72, 80],
          art: u => `${H.ghost(PW, PH, PR)}<defs>${H.metal(u, 'm', '#e1e3e6', '#9ea2a8', '#cdd0d4')}</defs>
<path d="M30 24H130Q140 24 140 34V140Q140 150 150 150H222Q232 150 232 160V244Q232 254 222 254H30Q20 254 20 244V34Q20 24 30 24Z" fill="#0f2a24" stroke="#2f6b5a" stroke-width="1.5"/>
<g fill="none" stroke="#c9a14a" stroke-width="1.2" stroke-linecap="round" opacity=".85"><path class="flow" d="M108 70H126V156H178"/><path class="flow" d="M108 100H122V200H150"/><path class="flow" d="M60 116V150H96V170"/><path class="flow" d="M84 116V140H200V166"/><path class="flow" d="M36 80H26V230H40"/></g>
<rect x="36" y="44" width="72" height="72" rx="8" fill="#1a1c20" stroke="#3d4047"/><rect x="42" y="50" width="60" height="60" rx="5" fill="url(#${u}m)"/>
<text x="72" y="86" text-anchor="middle" font-family="${H.sans}" font-size="16" font-weight="700" fill="#26282c">A·PRO</text>
${H.grid(116, 36, 3, 10, 7, 10, 4, 2.6, H.chips)}
<rect x="32" y="164" width="62" height="40" rx="4" fill="#17191d" stroke="#34373e"/><text x="63" y="188" text-anchor="middle" font-family="${H.mono}" font-size="9" fill="#7d838c">NAND</text>
<rect x="104" y="166" width="46" height="46" rx="4" fill="#1c1e22" stroke="#34373e"/><rect x="111" y="173" width="32" height="32" rx="3" fill="url(#${u}m)" opacity=".85"/>
<rect x="160" y="162" width="36" height="28" rx="3" fill="#1c1e22" stroke="#34373e"/>${H.shield(u, 202, 158, 26, 54)}
<rect x="160" y="208" width="44" height="10" rx="2" fill="#c9a14a"/><rect x="30" y="218" width="56" height="10" rx="2" fill="#c9a14a"/>
${H.grid(100, 228, 12, 2, 9, 9, 5, 3, H.chips)}${H.screw(29, 33)}${H.screw(131, 33)}${H.screw(222, 244)}${H.screw(29, 244)}`
        },
        {
          key: 'cameras', name: 'Модуль камер', short: 'Камеры', zA: 2, zE: 160,
          desc: 'Три камеры: основная, сверхширокоугольная и телефото, плюс сканер LiDAR и вспышка. Объективы закрыты сапфировым стеклом.',
          facts: ['3 камеры', 'LiDAR', 'Сапфир'],
          anchor: [184, 68],
          art: () => `${H.ghost(PW, PH, PR)}<rect x="130" y="14" width="108" height="108" rx="28" fill="#191a1e" stroke="#363940"/>
${H.lens(158, 42, 19)}${H.lens(158, 94, 19)}${H.lens(210, 68, 19)}
<circle cx="211" cy="28" r="6" fill="#efe3c2"/><circle cx="211" cy="28" r="3" fill="#fff8e6"/><circle cx="211" cy="108" r="6" fill="#0b0b0d" stroke="#3d4048"/><circle cx="184" cy="68" r="2.4" fill="#0b0b0d"/>`
        },
        {
          key: 'battery', name: 'Аккумулятор', short: 'Аккумулятор', zA: -1, zE: 110,
          desc: 'Литий-ионная батарея занимает почти половину внутреннего объёма. Контроллер питания следит за температурой и зарядом, чтобы она дольше сохраняла ёмкость.',
          facts: ['Литий-ион', 'Беспроводная и USB-C зарядка'],
          anchor: [125, 430],
          art: u => `${H.ghost(PW, PH, PR)}<defs>${H.foil(u, 'b')}</defs>
<rect x="110" y="250" width="30" height="16" rx="3" fill="#c9a14a"/>
<rect x="56" y="452" width="24" height="24" rx="4" fill="#141416"/><rect x="170" y="452" width="24" height="24" rx="4" fill="#141416"/>
<rect x="26" y="262" width="198" height="200" rx="14" fill="url(#${u}b)" stroke="#4d5159" stroke-width="1.2"/>
<rect x="44" y="286" width="162" height="72" rx="6" fill="#ece9e3"/>
<text x="58" y="314" font-family="${H.mono}" font-size="15" font-weight="600" fill="#1c1917">Li-ion</text>
<text x="58" y="334" font-family="${H.mono}" font-size="7.6" fill="#57534e">ЛИТИЙ-ИОННЫЙ</text><text x="58" y="345" font-family="${H.mono}" font-size="7.6" fill="#57534e">АККУМУЛЯТОР</text>
<g fill="#1c1917">${[0, 3, 5, 9, 11, 14, 18, 20, 23, 27, 30, 32, 36, 39].map((x, i) => `<rect x="${150 + x}" y="298" width="${i % 3 ? 1.4 : 2.4}" height="34"/>`).join('')}</g>
<rect x="44" y="384" width="162" height="10" rx="5" fill="#2b2e34"/><rect class="chg" x="44" y="384" width="162" height="10" rx="5" fill="#7fdc8c"/>
<text x="44" y="416" font-family="${H.mono}" font-size="8" fill="#9aa0a8">ЗАРЯД</text>`
        },
        {
          key: 'taptic', name: 'Taptic Engine, динамик и порт', short: 'Taptic Engine', zA: -4, zE: 70,
          desc: 'Линейный вибромотор даёт точную тактильную отдачу: щелчки, удары, лёгкие толчки. Рядом нижний динамик и разъём USB-C.',
          facts: ['Линейный вибромотор', 'USB-C'],
          anchor: [60, 489],
          art: () => `${H.ghost(PW, PH, PR)}<rect x="24" y="472" width="72" height="34" rx="6" fill="#2b2d33" stroke="#4d5159"/><rect x="31" y="479" width="58" height="20" rx="3" fill="#3a3d44"/><rect class="buzz" x="36" y="487" width="48" height="4" rx="2" fill="#c9a14a"/>
<rect x="100" y="490" width="50" height="17" rx="8.5" fill="#0d0d0f" stroke="#8a8f96" stroke-width="1.5"/><rect x="110" y="496.5" width="30" height="4" rx="2" fill="#c9a14a"/>
<rect x="156" y="472" width="70" height="34" rx="8" fill="#24262b" stroke="#4d5159"/>${H.dots(166, 481, 9, 3, 6.4, 7.5, 1.6, '#0b0b0d')}${H.screw(101, 478, 3.4)}${H.screw(230, 466, 3.4)}`
        },
        {
          key: 'magsafe', name: 'Катушка MagSafe', short: 'MagSafe', zA: -9, zE: 20,
          desc: 'Медная катушка беспроводной зарядки и кольцо магнитов, которые точно выравнивают зарядку, чехол или кошелёк на задней панели.',
          facts: ['Медь', 'Неодимовые магниты'],
          anchor: [199, 330],
          art: () => `${H.ghost(PW, PH, PR)}${H.coil(125, 330, 24, 64, 4, 2.3)}
<circle cx="125" cy="330" r="74" fill="none" stroke="#8f959d" stroke-width="9" stroke-dasharray="15.2 4"/>
<rect x="114" y="416" width="22" height="26" rx="3" fill="#8f959d"/><path d="M125 306V292H166V262" fill="none" stroke="#c9a14a" stroke-width="3" stroke-linejoin="round"/>`
        },
        {
          key: 'back', name: 'Задняя панель', short: 'Задняя панель', zA: -13.8, zE: -60,
          desc: 'Матовое стекло на задней стороне пропускает поле беспроводной зарядки: через сплошной металл оно бы не прошло.',
          facts: ['Матовое стекло', 'Прозрачна для зарядки'],
          anchor: [60, 440],
          art: u => `<defs><linearGradient id="${u}k" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4a66"/><stop offset="1" stop-color="#1d2738"/></linearGradient></defs>
<rect x="2" y="2" width="246" height="516" rx="42" fill="url(#${u}k)" stroke="#53648a" stroke-width="1.2"/>
<rect x="126" y="10" width="116" height="116" rx="30" fill="#2c3a54" stroke="#5b6d92"/>
<circle cx="158" cy="42" r="21" fill="#141b29"/><circle cx="158" cy="94" r="21" fill="#141b29"/><circle cx="210" cy="68" r="21" fill="#141b29"/><circle cx="211" cy="28" r="7" fill="#141b29"/><circle cx="211" cy="108" r="7" fill="#141b29"/>
<circle cx="125" cy="330" r="74" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="10"/>`
        }
      ]
    }
  };

  /* ── MacBook Pro ──────────────────────────── */
  const BW = 420, BD = 298;

  const keyboard = () => {
    const x0 = 54, gap = 3, unit = (366 - x0 + gap) / 14.5;
    const rows = [
      { y: 30, h: 11, k: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { y: 45, h: 20, k: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5] },
      { y: 68, h: 20, k: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { y: 91, h: 20, k: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75] },
      { y: 114, h: 20, k: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25] },
      { y: 137, h: 20, k: [1, 1, 1, 1.25, 5, 1.25, 1, 3] }
    ];
    const key = (x, y, w, h) => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="2.4" fill="#17181b" stroke="#fff3d6" stroke-opacity=".22" stroke-width=".8"/>`;
    let s = '<rect x="50" y="26" width="320" height="135" rx="8" fill="#0c0c0e"/>';
    rows.forEach((r, ri) => {
      let x = x0;
      r.k.forEach((kw, ki) => {
        const w = kw * unit - gap;
        if (ri === 5 && ki === r.k.length - 1) {
          const cw = unit - gap, hh = (r.h - 2) / 2;
          s += key(x, r.y + hh + 2, cw, hh) + key(x + unit, r.y, cw, hh) + key(x + unit, r.y + hh + 2, cw, hh) + key(x + unit * 2, r.y + hh + 2, cw, hh);
        } else s += key(x, r.y, w, r.h);
        if (ri === 0 && ki === r.k.length - 1) s += `<circle cx="${(x + w / 2).toFixed(1)}" cy="${r.y + r.h / 2}" r="3.6" fill="none" stroke="#8a8f97" stroke-width="1"/>`;
        x += kw * unit;
      });
    });
    return s;
  };

  const fan = (cx, cy) => {
    let blades = '';
    for (let i = 0; i < 11; i++) blades += `<path d="M${cx} ${cy - 12}q9 -10 2 -30l-6 1q3 16 -4 27z" transform="rotate(${(i * 360 / 11).toFixed(1)} ${cx} ${cy})" fill="#3a3e45"/>`;
    return `<circle cx="${cx}" cy="${cy}" r="46" fill="#15171a" stroke="#40444b" stroke-width="2"/><g class="spin" style="transform-origin:${cx}px ${cy}px">${blades}<circle cx="${cx}" cy="${cy}" r="13" fill="#2b2e34" stroke="#4b4f56"/></g>`;
  };

  D.mac = {
    id: 'mac', name: 'MacBook Pro', accent: '#9FB6CF', maxScale: 1.2,
    tag: 'Ноутбук на чипе M: процессор, графика и память в одном корпусе, а под клавиатурой и трекпадом почти всё место отдано аккумулятору и охлаждению.',
    facts: ['12 модулей', 'Корпус unibody'],
    cam: { A: { tilt: 66, turn: -24 }, E: { tilt: 60, turn: -10 } },
    shadow: { A: [520, 400, -16], E: [1040, 420, -40] },
    root: {
      key: 'mac', w: BW, h: BD,
      children: [
        {
          key: 'base', A: {}, E: { tx: -236 },
          children: [
            {
              key: 'topcase', name: 'Верхний корпус', short: 'Верхний корпус', zA: 0, zE: 470,
              desc: 'Цельный алюминиевый корпус, выфрезерованный из одного блока металла. В нём вырезы под клавиатуру и трекпад, а по бокам решётки динамиков.',
              facts: ['Алюминий', 'Unibody'],
              anchor: [26, 94],
              thick: { n: 7, depth: 18, bw: 5, r: 16, color: H.shade(210, 6, 60, 80), faceZ: 9.5 },
              art: u => `<defs><linearGradient id="${u}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dfe2e6"/><stop offset=".55" stop-color="#c5c9ce"/><stop offset="1" stop-color="#d6d9dd"/></linearGradient>
<pattern id="${u}p" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".95" fill="#3a3d42"/></pattern></defs>
<path fill-rule="evenodd" fill="url(#${u}t)" stroke="#a9aeb4" d="M16 0H404Q420 0 420 16V282Q420 298 404 298H16Q0 298 0 282V16Q0 0 16 0ZM58 26H362Q370 26 370 34V155Q370 163 362 163H58Q50 163 50 155V34Q50 26 58 26ZM144 178H276Q284 178 284 186V274Q284 282 276 282H144Q136 282 136 274V186Q136 178 144 178Z"/>
<rect x="14" y="26" width="24" height="136" rx="4" fill="url(#${u}p)"/><rect x="382" y="26" width="24" height="136" rx="4" fill="url(#${u}p)"/>`
            },
            {
              key: 'keyboard', name: 'Клавиатура Magic Keyboard с Touch ID', short: 'Клавиатура', zA: 8, zE: 400,
              desc: 'Ножничный механизм с коротким ходом и подсветкой каждой клавиши. В правом верхнем углу сканер отпечатка Touch ID.',
              facts: ['Ножничный механизм', 'Подсветка', 'Touch ID'],
              anchor: [357, 36],
              art: () => `${H.ghost(BW, BD, 16)}${keyboard()}`
            },
            {
              key: 'trackpad', name: 'Трекпад Force Touch', short: 'Трекпад', zA: 8.6, zE: 345,
              desc: 'Стеклянная панель не нажимается механически: датчики силы фиксируют давление, а Taptic Engine имитирует щелчок вибрацией.',
              facts: ['Датчики силы', 'Тактильный отклик'],
              anchor: [210, 230],
              art: u => `${H.ghost(BW, BD, 16)}<defs><linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d3d6da"/><stop offset="1" stop-color="#b4b8be"/></linearGradient></defs>
<rect x="138" y="180" width="144" height="100" rx="8" fill="url(#${u}g)" stroke="#9ea3a9"/><rect class="buzz" x="176" y="262" width="68" height="9" rx="3" fill="#4a4e55"/>
<g fill="#6b7078"><circle cx="152" cy="194" r="3.5"/><circle cx="268" cy="194" r="3.5"/><circle cx="152" cy="266" r="3.5"/><circle cx="268" cy="266" r="3.5"/></g>`
            },
            {
              key: 'cooling', name: 'Система охлаждения', short: 'Охлаждение', zA: 3, zE: 200,
              desc: 'Вентиляторы и медная тепловая трубка забирают тепло от чипа и выгоняют его через решётки у задней кромки корпуса.',
              facts: ['Медная тепловая трубка', 'Активное охлаждение'],
              anchor: [62, 76],
              art: () => `${H.ghost(BW, BD, 16)}<path d="M104 74C150 98 270 98 316 74" fill="none" stroke="#b66f3f" stroke-width="12" stroke-linecap="round"/><path d="M104 74C150 98 270 98 316 74" fill="none" stroke="#e7a36d" stroke-width="4" stroke-linecap="round"/>
<rect x="186" y="66" width="48" height="44" rx="5" fill="#c27a48" stroke="#8a5330"/>${fan(62, 76)}${fan(358, 76)}
${H.grid(22, 8, 12, 1, 6.5, 0, 3, 14, '#5b5f66')}${H.grid(322, 8, 12, 1, 6.5, 0, 3, 14, '#5b5f66')}`
            },
            {
              key: 'board', name: 'Логическая плата с чипом M4', short: 'Плата и чип M4', zA: 1, zE: 150,
              desc: 'Процессор, графика, Neural Engine и единая память собраны в одном корпусе. Данным не нужно ходить между отдельными чипами, поэтому система быстрая и экономная.',
              facts: ['Единая память', 'SSD на плате'],
              anchor: [210, 86],
              art: u => `${H.ghost(BW, BD, 16)}<defs>${H.metal(u, 'm', '#e3e5e8', '#a2a6ac', '#cfd2d6')}</defs>
<rect x="112" y="16" width="196" height="140" rx="10" fill="#10161d" stroke="#2c3a48" stroke-width="1.5"/>
<g fill="none" stroke="#c9a14a" stroke-width="1.2" stroke-linecap="round" opacity=".85"><path class="flow" d="M150 84H126V30"/><path class="flow" d="M270 84H294V30"/><path class="flow" d="M210 124V146H140"/><path class="flow" d="M228 124V140H290"/><path class="flow" d="M192 50V24H160"/></g>
<rect x="146" y="48" width="128" height="76" rx="6" fill="#1c2a22" stroke="#355244"/>
<rect x="152" y="54" width="22" height="64" rx="3" fill="#0d0e10" stroke="#2c2f35"/><rect x="246" y="54" width="22" height="64" rx="3" fill="#0d0e10" stroke="#2c2f35"/>
<rect x="180" y="54" width="60" height="64" rx="4" fill="url(#${u}m)"/><text x="210" y="93" text-anchor="middle" font-family="${H.sans}" font-size="20" font-weight="700" fill="#26282c">M4</text>
<rect x="118" y="24" width="20" height="28" rx="2" fill="#17191d" stroke="#2f333a"/><rect x="118" y="60" width="20" height="28" rx="2" fill="#17191d" stroke="#2f333a"/>
<text x="128" y="100" text-anchor="middle" font-family="${H.mono}" font-size="7" fill="#7d838c">SSD</text>
<rect x="282" y="24" width="20" height="20" rx="2" fill="#1c1e22"/><rect x="282" y="52" width="20" height="20" rx="2" fill="#1c1e22"/>
${H.grid(150, 132, 14, 2, 8.5, 8, 4.5, 3, H.chips)}${H.shield(u, 276, 80, 28, 40)}${H.screw(120, 148)}${H.screw(300, 148)}${H.screw(160, 24)}`
            },
            {
              key: 'battery', name: 'Аккумулятор', short: 'Аккумулятор', zA: -2, zE: 100,
              desc: 'Плоские литий-полимерные ячейки уложены вдоль передней части корпуса, под трекпадом и подставками для ладоней.',
              facts: ['Литий-полимер', 'Несколько ячеек'],
              anchor: [210, 255],
              art: u => `${H.ghost(BW, BD, 16)}<defs>${H.foil(u, 'b')}</defs>
${[[24, 168, 100, 54], [24, 230, 100, 54], [134, 172, 152, 50], [134, 230, 152, 50], [296, 168, 100, 54], [296, 230, 100, 54]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="url(#${u}b)" stroke="#50545c"/>`).join('')}
<rect x="150" y="186" width="120" height="22" rx="4" fill="#ece9e3"/><text x="160" y="201" font-family="${H.mono}" font-size="10" font-weight="600" fill="#1c1917">Li-Po</text>
<rect x="204" y="193" width="56" height="8" rx="4" fill="#2b2e34"/><rect class="chg" x="204" y="193" width="56" height="8" rx="4" fill="#7fdc8c"/>
<g fill="#c9a14a"><rect x="124" y="194" width="10" height="4"/><rect x="286" y="194" width="10" height="4"/><rect x="124" y="254" width="10" height="4"/><rect x="286" y="254" width="10" height="4"/></g>`
            },
            {
              key: 'speakers', name: 'Динамики', short: 'Динамики', zA: -3, zE: 55,
              desc: 'Сабвуферы стоят парами и гасят вибрации друг друга, поэтому корпус не дребезжит даже на громком звуке.',
              facts: ['Сабвуферы с компенсацией', 'Пространственное аудио'],
              anchor: [21, 104],
              art: u => `${H.ghost(BW, BD, 16)}<defs><pattern id="${u}p" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.1" fill="#0a0a0b"/></pattern></defs>
${[6, 384].map(x => `<rect x="${x}" y="18" width="30" height="142" rx="8" fill="#1f2125" stroke="#3d4148"/><rect x="${x + 5}" y="26" width="20" height="50" rx="4" fill="url(#${u}p)"/><circle cx="${x + 15}" cy="104" r="10" fill="#2c2f35" stroke="#4b4f56"/><circle cx="${x + 15}" cy="104" r="4" fill="#15171a"/><circle cx="${x + 15}" cy="136" r="10" fill="#2c2f35" stroke="#4b4f56"/><circle cx="${x + 15}" cy="136" r="4" fill="#15171a"/>`).join('')}`
            },
            {
              key: 'bottom', name: 'Нижняя крышка', short: 'Нижняя крышка', zA: -10, zE: 0,
              desc: 'Алюминиевая пластина закрывает внутренности снизу. Резиновые ножки приподнимают корпус и не дают ему скользить по столу.',
              facts: ['Алюминий', 'Резиновые ножки'],
              anchor: [34, 264],
              art: u => `<defs><linearGradient id="${u}d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9ccd1"/><stop offset="1" stop-color="#aeb2b8"/></linearGradient></defs>
<rect x="0" y="0" width="420" height="298" rx="16" fill="url(#${u}d)" stroke="#9a9fa6"/>
${[[34, 34], [386, 34], [34, 264], [386, 264]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#3b3e44"/><circle cx="${x}" cy="${y}" r="7" fill="#4a4e55"/>`).join('')}
${H.grid(70, 6, 40, 1, 7, 0, 3.6, 2, '#8d9298')}${[[60, 18], [360, 18], [110, 286], [210, 286], [310, 286], [10, 100], [410, 100], [10, 200], [410, 200]].map(([x, y]) => H.screw(x, y, 3.2)).join('')}`
            }
          ]
        },
        {
          key: 'lidgroup', origin: '50% 100%', A: { ty: -BD, tz: 6, rx: -72 }, E: { tx: 236, ty: 0, tz: -10, rx: 0 },
          children: [
            {
              key: 'screen', name: 'Дисплей Liquid Retina XDR', short: 'Дисплей XDR', zA: 3, zE: 230,
              desc: 'Экран высокой яркости и контраста: до 1600 нит в HDR и частота до 120 Гц. Вырез сверху оставлен под камеру.',
              facts: ['До 1600 нит в HDR', 'ProMotion 120 Гц'],
              anchor: [146, 120],
              art: u => `<defs><linearGradient id="${u}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#232325"/><stop offset="1" stop-color="#0c0c0d"/></linearGradient>
<clipPath id="${u}c"><rect x="10" y="10" width="400" height="270" rx="8"/></clipPath></defs>
<rect x="1" y="1" width="418" height="296" rx="15" fill="#060607" stroke="#2a2b2f"/>
<g clip-path="url(#${u}c)"><rect x="10" y="10" width="400" height="270" fill="url(#${u}w)"/>
<rect x="10" y="10" width="400" height="13" fill="#fff" fill-opacity=".16"/>
<g transform="translate(46 44)"><rect width="200" height="128" rx="9" fill="#f7f5f2" fill-opacity=".94"/><path d="M9 0H191Q200 0 200 9V22H0V9Q0 0 9 0Z" fill="#e9e6e1"/>
<circle cx="13" cy="11" r="4" fill="#ff5f57"/><circle cx="26" cy="11" r="4" fill="#febc2e"/><circle cx="39" cy="11" r="4" fill="#28c840"/>
<rect x="14" y="36" width="96" height="9" rx="3" fill="#1c1917" fill-opacity=".78"/><rect x="14" y="54" width="170" height="5" rx="2.5" fill="#1c1917" fill-opacity=".25"/><rect x="14" y="66" width="150" height="5" rx="2.5" fill="#1c1917" fill-opacity=".25"/><rect x="14" y="78" width="160" height="5" rx="2.5" fill="#1c1917" fill-opacity=".25"/><rect x="14" y="96" width="60" height="20" rx="10" fill="#a16207"/></g>
<g transform="translate(270 70)"><rect width="110" height="84" rx="9" fill="#1b1917" fill-opacity=".85"/><text class="x-clock" x="14" y="36" font-family="${H.sans}" font-size="24" font-weight="600" fill="#fff">9:41</text><text x="14" y="58" font-family="${H.mono}" font-size="8" fill="#ddae4b">РАЗБОР</text></g>
<rect x="120" y="248" width="180" height="24" rx="8" fill="#fff" fill-opacity=".22"/>
${['#ff6b5a', '#ffb340', '#4cd964', '#5ac8fa', '#007aff', '#af52de', '#ff2d55', '#e6e6e6'].map((c, i) => `<rect x="${128 + i * 21.5}" y="252" width="16" height="16" rx="4.5" fill="${c}"/>`).join('')}</g>
<path d="M186 10H234V18Q234 24 228 24H192Q186 24 186 18Z" fill="#060607"/>`
            },
            {
              key: 'miniled', name: 'Подсветка mini-LED', short: 'Mini-LED', zA: 1.6, zE: 150,
              desc: 'Тысячи крошечных светодиодов разбиты на зоны локального затемнения. Каждая зона гаснет отдельно, поэтому чёрный на экране почти настоящий.',
              facts: ['Тысячи светодиодов', 'Локальное затемнение'],
              anchor: [100, 220],
              art: u => {
                let zones = '';
                for (let j = 0; j < 8; j++) for (let i = 0; i < 12; i++) zones += `<rect class="zone" x="${(10 + i * 33.33).toFixed(1)}" y="${(10 + j * 33.75).toFixed(1)}" width="33.4" height="33.8" fill="#000" style="animation-delay:-${(((i * 7 + j * 13) % 17) * 0.2).toFixed(1)}s"/>`;
                return `<defs><pattern id="${u}l" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.15" fill="#fff4d8"/></pattern>
<radialGradient id="${u}h" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff2cf" stop-opacity=".35"/><stop offset="1" stop-color="#fff2cf" stop-opacity="0"/></radialGradient></defs>
<rect x="10" y="10" width="400" height="270" rx="8" fill="#0a0a0d" stroke="#2a2b30"/><rect x="10" y="10" width="400" height="270" fill="url(#${u}l)"/><rect x="10" y="10" width="400" height="270" fill="url(#${u}h)"/>${zones}`;
              }
            },
            {
              key: 'facecam', name: 'Камера FaceTime', short: 'Камера', zA: 0.8, zE: 95,
              desc: 'Камера спрятана в вырезе над экраном. Картинку обрабатывает сигнальный процессор изображений внутри чипа M.',
              facts: ['Вырез в экране', 'Обработка в чипе'],
              anchor: [210, 12],
              art: () => `${H.ghost(BW, BD, 15)}<rect x="180" y="5" width="60" height="15" rx="7.5" fill="#15161a" stroke="#34373e"/>
<circle cx="210" cy="12.5" r="4.5" fill="#09090b"/><circle cx="210" cy="12.5" r="2" fill="#3f58ad"/><circle class="led" cx="226" cy="12.5" r="1.6" fill="#2fd16d"/>
<path d="M190 20V40H150V60" fill="none" stroke="#c9a14a" stroke-width="3" stroke-linejoin="round"/>`
            },
            {
              key: 'lid', name: 'Крышка дисплея', short: 'Крышка', zA: 0, zE: 0,
              desc: 'Тонкая алюминиевая крышка держит матрицу. Шарнир позволяет открыть ноутбук одной рукой и держит экран под любым углом.',
              facts: ['Алюминий', 'Шарнир'],
              anchor: [40, 40],
              thick: { n: 3, depth: 5, bw: 4, r: 15, color: H.shade(210, 6, 66, 80), faceZ: -2.6 },
              art: u => `<defs><linearGradient id="${u}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d4d6d9"/><stop offset="1" stop-color="#bfc3c8"/></linearGradient></defs>
<rect x="0" y="0" width="420" height="298" rx="15" fill="url(#${u}a)" stroke="#a7acb2"/><rect x="40" y="288" width="340" height="7" rx="3.5" fill="#8f949b"/>`
            }
          ]
        }
      ]
    }
  };
})();
