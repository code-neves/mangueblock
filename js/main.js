/* Navegação entre telas, modal de seleção de modo e inicialização. */
const VIEWS = ['landing', 'catalog', 'play'];
let pendingMission = null;

function syncHeaderMissionControls(inMission) {
    const progress = $('worldStepProgress');
    const actions = $('missionActions');
    const progressSlot = $('headerStepProgressSlot');
    const actionsSlot = $('headerMissionActions');
    if (progress && progressSlot && progress.parentElement !== progressSlot) progressSlot.append(progress);
    if (actions && actionsSlot && actions.parentElement !== actionsSlot) actionsSlot.append(actions);
    if (progress) {
        progress.hidden = !inMission;
        if (!inMission) {
            const fill = $('worldStepFill');
            const bar = progress.querySelector('[role="progressbar"]');
            const label = $('worldStepLabel');
            if (fill) fill.style.width = '0%';
            if (bar) bar.setAttribute('aria-valuenow', '0');
            if (label) label.textContent = '';
        }
    }
    if (actionsSlot) actionsSlot.hidden = !inMission;
}

function show(name) {
    document.querySelector('.wrap')?.classList.toggle('is-playing', name === 'play');
    document.querySelector('.wrap')?.classList.toggle('is-catalog', name === 'catalog');
    VIEWS.forEach((v) => {
        if ($(v)) $(v).hidden = v !== name;
    });
    if ($('logo')) {
        $('logo').setAttribute('aria-label', name === 'play' ? 'Voltar às Missões' : 'Mangueblock, ir para o início');
    }
    if ($('logoText')) $('logoText').textContent = name === 'play' ? 'Voltar' : 'Mangueblock';
    syncHeaderMissionControls(name === 'play');

    document.querySelectorAll('.navb').forEach((b) => {
        const on = b.dataset.go === (name === 'play' ? 'catalog' : name);
        on
            ? b.setAttribute('aria-current', 'page')
            : b.removeAttribute('aria-current');
    });

    if (name === 'catalog') renderCatalog();
    if (name === 'play' && typeof layout === 'function') layout();
}

const updateXP = () => {
    if ($('xp')) {
        $('xp').innerHTML = svg('star', 16) + save.xp;
        $('xp').setAttribute('aria-label', `Estrelas conquistadas: ${save.xp}`);
    }
};

/* Modal de escolha de modo antes da missão */
function promptMissionMode(m) {
    pendingMission = m;
    const dialog = $('modeSelectDialog');

    if (m.fis) {
        openMission(m, 'physical');
        return;
    }

    if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
    } else {
        openMission(m, ST.inputMode || 'digital');
    }
}

if ($('chooseDigitalBtn')) {
    $('chooseDigitalBtn').onclick = () => {
        const dialog = $('modeSelectDialog');
        if (dialog) dialog.close();
        openMission(pendingMission || cur, 'digital');
    };
}

if ($('choosePhysicalBtn')) {
    $('choosePhysicalBtn').onclick = () => {
        const dialog = $('modeSelectDialog');
        if (dialog) dialog.close();
        openMission(pendingMission || cur, 'physical');
    };
}

if ($('closeModeDialog')) {
    $('closeModeDialog').onclick = () => {
        const dialog = $('modeSelectDialog');
        if (dialog) dialog.close();
    };
}

if ($('openModeSelectBtn')) {
    $('openModeSelectBtn').onclick = () => {
        pendingMission = cur;
        const dialog = $('modeSelectDialog');
        if (dialog) dialog.showModal();
    };
}

/* Navegação e Eventos Globais */
function navigateTo(name) {
    if (name === 'catalog' && $('play') && !$('play').hidden && typeof leaveMission === 'function') {
        leaveMission();
        return;
    }
    show(name);
}

document
.querySelectorAll('[data-go]')
.forEach((b) => (b.onclick = () => navigateTo(b.dataset.go)));

if ($('logo')) $('logo').onclick = () => navigateTo($('play') && !$('play').hidden ? 'catalog' : 'landing');
if ($('start')) $('start').onclick = () => show('catalog');
if ($('start2')) $('start2').onclick = () => show('catalog');

if ($('logoMark')) $('logoMark').innerHTML = svg('logo', 22);
if ($('apIcon')) $('apIcon').innerHTML = svg('access', 18);
if ($('backIcon')) $('backIcon').innerHTML = svg('back', 18);

if (typeof fillIcons === 'function') fillIcons();

/* Inicialização */
buildCatalog();
updateXP();
applyST();
show('landing');
