/* Progresso salvo, modo de jogo e ajustes de acessibilidade (localStorage). */
let save = { done: {}, xp: 0 };

try {
    save = JSON.parse(localStorage.getItem('pp')) || save;
} catch (e) {}

const persist = () => {
    try {
        localStorage.setItem('pp', JSON.stringify(save));
    } catch (e) {}
};

const RM = matchMedia('(prefers-reduced-motion:reduce)');
const ST = {
    fs: 1,
    hc: 0,
    mo: 0,
    snd: 0,
    inputMode: 'digital', // 'digital' (na tela) ou 'physical' (cartões / câmera)
};

try {
    Object.assign(ST, JSON.parse(localStorage.getItem('pp2')));
} catch (e) {}

const slowF = () => (ST.mo || RM.matches ? 0.3 : 1);

const OPT = [
    [
        'fs',
'Tamanho do texto',
[
    [1, '100%'],
[1.25, '125%'],
[1.5, '150%'],
[2, '200%'],
],
    ],
[
    'hc',
'Contraste',
[
    [0, 'Padrão'],
[1, 'Alto'],
],
],
[
    'mo',
'Animações do jogo',
[
    [0, 'Normais'],
[1, 'Reduzidas'],
],
],
[
    'snd',
'Sons',
[
    [0, 'Desligados'],
[1, 'Ligados'],
],
],
];

function buildAP() {
    const f = $('apf');
    if (!f) return;
    f.innerHTML = '';

    OPT.forEach(([k, l, o]) => {
        const s = document.createElement('fieldset');
        s.innerHTML = '<legend>' + l + '</legend>';
        o.forEach(([v, t]) => {
            const lb = document.createElement('label');
            lb.className = 'opt';
            lb.innerHTML =
            '<input type="radio" name="' +
            k +
            '"' +
            (ST[k] === v ? ' checked' : '') +
            '><span>' +
            t +
            '</span>';
            lb.firstChild.onchange = () => {
                ST[k] = v;
                applyST();
                if (k === 'snd' && typeof pip === 'function') pip();
            };
                s.append(lb);
        });
        f.append(s);
    });
}

function applyST() {
    const h = document.documentElement;
    h.style.setProperty('--fs', ST.fs);
    h.dataset.hc = ST.hc;

    try {
        localStorage.setItem('pp2', JSON.stringify(ST));
    } catch (e) {}

    if (typeof layout === 'function') layout();
}

if ($('apb'))
    $('apb').onclick = () => {
        buildAP();
        $('ap').showModal();
    };
if ($('apx')) $('apx').onclick = () => $('ap').close();
