/* Catálogo de mundos e etapas de cada aventura. */
let catalogQuery = '';
let catalogYear = 'all';
let catalogLayout = 'grid';
let selectedThemeId = null;

const catalogNorm = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const schoolYear = (years) => {
  const grades = years.filter((year) => year > 0);
  const range = grades.length > 1
    ? `${grades[0]}º ao ${grades[grades.length - 1]}º ano`
    : grades.length
      ? `${grades[0]}º ano`
      : '';
  return years.includes(0) && range ? `Educação Infantil · ${range}` : years.includes(0) ? 'Educação Infantil' : range;
};

const missionsForTheme = (theme) => theme.stages
  .map((stage) => ({ ...stage, mission: M.find((mission) => mission.id === stage.missionId) }))
  .filter((stage) => stage.mission);

const curriculumSummary = (theme, limit = 3) => {
  const codes = theme.bnccCodes || [];
  const shown = codes.slice(0, limit).join(' · ');
  const extra = codes.length > limit ? ` +${codes.length - limit}` : '';
  return `<span class="theme-curriculum"><span class="theme-curriculum-axis">${(theme.axes || ['Computação']).join(' · ')}</span>
    <span class="theme-curriculum-focus">${theme.focus || theme.subtitle}</span>
    <span class="theme-curriculum-codes">BNCC ${shown}${extra}</span></span>`;
};

const worldArtScenes = {
  'aventura-mangue': '<rect x="330" y="154" width="62" height="62" fill="#f0c64d"/><rect x="415" y="176" width="62" height="62" fill="#f0c64d"/><rect x="500" y="154" width="62" height="62" fill="#f0c64d"/><rect x="585" y="176" width="62" height="62" fill="#f0c64d"/><rect x="455" y="82" width="24" height="104" fill="#865a3b"/><rect x="410" y="72" width="112" height="32" fill="#277c48"/><rect x="390" y="104" width="152" height="42" fill="#1f6843"/><rect x="425" y="146" width="82" height="24" fill="#277c48"/><rect x="585" y="95" width="96" height="96" fill="#f4c64e"/><path d="M610 170V112h48l-14 22 14 20h-48" fill="#30445e"/>',
  'padroes-do-mangue': '<rect x="270" y="112" width="82" height="82" fill="#d9edbd"/><rect x="362" y="112" width="82" height="82" fill="#c7e5a4"/><rect x="454" y="112" width="82" height="82" fill="#d9edbd"/><rect x="546" y="112" width="82" height="82" fill="#c7e5a4"/><circle cx="311" cy="153" r="20" fill="#eb9b55"/><path d="M403 171q-24-27 0-40 24 13 0 40z" fill="#2c8757"/><circle cx="495" cy="153" r="20" fill="#eb9b55"/><path d="M587 171q-24-27 0-40 24 13 0 40z" fill="#2c8757"/><path d="M274 224h355" stroke="#355b4d" stroke-width="7" stroke-dasharray="12 12"/><path d="M604 211l24 13-24 13" fill="none" stroke="#355b4d" stroke-width="7"/>',
  'trilhas-do-cotidiano': '<path d="M270 226h120v-78h115v78h130v-82h98" fill="none" stroke="#f0c64d" stroke-width="18" stroke-dasharray="3 19" stroke-linecap="square"/><rect x="284" y="192" width="44" height="34" fill="#fff"/><rect x="403" y="114" width="44" height="34" fill="#fff"/><rect x="520" y="192" width="44" height="34" fill="#fff"/><rect x="686" y="103" width="12" height="124" fill="#30445e"/><path d="M698 108h78l-19 24 19 24h-78z" fill="#e9782f"/><path d="M303 204l9 9 17-19M422 126l9 9 17-19M539 204l9 9 17-19" fill="none" stroke="#277c48" stroke-width="7"/>',
  'sentinelas-do-estuario': '<path d="M448 216V138M448 160l-112-62M448 160l112-62" fill="none" stroke="#30445e" stroke-width="10"/><rect x="272" y="66" width="112" height="76" fill="#d8edc9"/><path d="M294 105l17 17 36-40" fill="none" stroke="#277c48" stroke-width="11"/><rect x="512" y="66" width="112" height="76" fill="#fde0d1"/><path d="M548 86l42 42m0-42l-42 42" stroke="#d9534f" stroke-width="11"/><rect x="413" y="208" width="70" height="24" fill="#30445e"/><rect x="386" y="238" width="124" height="18" fill="#30445e"/><circle cx="448" cy="74" r="22" fill="#f0c64d"/>',
  'mares-em-repeticao': '<path d="M333 155a104 82 0 0 1 188-28" fill="none" stroke="#2585a0" stroke-width="15"/><path d="M510 108l25 17-30 9" fill="#2585a0"/><path d="M565 177a104 82 0 0 1-188 28" fill="none" stroke="#2585a0" stroke-width="15"/><path d="M388 224l-25-17 30-9" fill="#2585a0"/><rect x="421" y="132" width="54" height="54" fill="#f0c64d"/><path d="M313 263q28-18 56 0t56 0t56 0t56 0t56 0t56 0" fill="none" stroke="#fff" stroke-width="8"/>',
  'resgate-do-manguezal': '<rect x="298" y="153" width="112" height="86" fill="#d98c4c"/><rect x="286" y="137" width="136" height="25" fill="#a85d36"/><path d="M311 177h84v62h-84z" fill="#e6ab69"/><path d="M353 178v60m-42-30h84" stroke="#a85d36" stroke-width="7"/><rect x="520" y="181" width="18" height="64" fill="#84583c"/><rect x="477" y="145" width="102" height="34" fill="#2d8858"/><rect x="460" y="178" width="136" height="32" fill="#246b49"/><rect x="490" y="209" width="76" height="24" fill="#2d8858"/><path d="M620 223h92" stroke="#30445e" stroke-width="8" stroke-dasharray="12 10"/><path d="M685 204l28 19-28 19" fill="none" stroke="#30445e" stroke-width="8"/>',
  'cartografos-da-restinga': '<rect x="300" y="70" width="300" height="208" fill="#f5f7ed" stroke="#30445e" stroke-width="8"/><path d="M360 74v200m60-200v200m60-200v200m60-200v200M304 122h292m-292 52h292m-292 52h292" stroke="#9ab5a5" stroke-width="4"/><path d="M330 246h60v-52h60v-52h60v-52h60" fill="none" stroke="#e9782f" stroke-width="11"/><circle cx="330" cy="246" r="12" fill="#277c48"/><circle cx="570" cy="90" r="14" fill="#f0c64d"/><rect x="620" y="88" width="105" height="66" fill="#fff" stroke="#30445e" stroke-width="6"/><path d="M638 108h67M638 128h46" stroke="#2585a0" stroke-width="7"/>',
  'mensagens-da-lagoa': '<rect x="290" y="82" width="308" height="184" fill="#213b4b"/><rect x="306" y="98" width="276" height="152" fill="#d9f0e6"/><rect x="326" y="118" width="32" height="32" fill="#2585a0"/><rect x="366" y="118" width="32" height="32" fill="#2585a0"/><rect x="406" y="118" width="32" height="32" fill="#f0c64d"/><rect x="446" y="118" width="32" height="32" fill="#2585a0"/><rect x="486" y="118" width="32" height="32" fill="#2585a0"/><rect x="526" y="118" width="32" height="32" fill="#f0c64d"/><rect x="326" y="158" width="32" height="32" fill="#f0c64d"/><rect x="406" y="158" width="32" height="32" fill="#2585a0"/><rect x="486" y="158" width="32" height="32" fill="#f0c64d"/><path d="M329 223h225" stroke="#2585a0" stroke-width="8" stroke-dasharray="10 12"/><path d="M602 166h88" stroke="#30445e" stroke-width="8"/><path d="M676 148l22 18-22 18" fill="none" stroke="#30445e" stroke-width="8"/>',
  'oficina-de-ferramentas': '<rect x="292" y="83" width="336" height="170" fill="#30445e"/><rect x="312" y="103" width="296" height="120" fill="#cdeee6"/><rect x="346" y="129" width="76" height="64" fill="#2585a0"/><rect x="365" y="145" width="38" height="32" fill="#fff"/><path d="M448 133h124m-124 25h100m-100 25h76" stroke="#277c48" stroke-width="8"/><rect x="414" y="253" width="92" height="15" fill="#30445e"/><rect x="442" y="268" width="36" height="16" fill="#30445e"/><circle cx="338" cy="238" r="9" fill="#e9782f"/><circle cx="368" cy="238" r="9" fill="#f0c64d"/><path d="M652 110v106m-25-81h50m-50 38h50" stroke="#8b674b" stroke-width="9"/>',
  'guardioes-dos-dados': '<path d="M450 70l104 38v68c0 62-42 101-104 126-62-25-104-64-104-126v-68z" fill="#2585a0"/><path d="M450 91l81 29v55c0 45-29 76-81 99-52-23-81-54-81-99v-55z" fill="#e0f1e6"/><rect x="416" y="150" width="68" height="55" fill="#f0c64d"/><path d="M430 150v-16a20 20 0 0 1 40 0v16" fill="none" stroke="#30445e" stroke-width="10"/><circle cx="450" cy="174" r="7" fill="#30445e"/><rect x="289" y="122" width="72" height="18" fill="#fff"/><rect x="289" y="153" width="96" height="18" fill="#fff"/><rect x="545" y="214" width="88" height="18" fill="#fff"/><rect x="574" y="245" width="59" height="18" fill="#fff"/><path d="M306 254q18-36 36 0m-20-34v34" fill="none" stroke="#277c48" stroke-width="8"/>',
  'comunidade-do-futuro': '<rect x="296" y="182" width="95" height="72" fill="#f0c64d"/><path d="M286 184l58-49 58 49" fill="#e9782f"/><rect x="326" y="207" width="22" height="47" fill="#fff"/><rect x="414" y="174" width="110" height="80" fill="#d5e9ed"/><path d="M425 187h88m-88 20h88m-88 20h88m-66-43v60m35-60v60" stroke="#2585a0" stroke-width="6"/><path d="M603 104v146m0-146l-54 46m54-46 54 46m-54-46V47" stroke="#30445e" stroke-width="9"/><circle cx="603" cy="104" r="13" fill="#e9782f"/><rect x="585" y="249" width="36" height="18" fill="#30445e"/><path d="M300 278h360" stroke="#277c48" stroke-width="8" stroke-dasharray="14 12"/>'
};

const themeArtwork = (theme) => {
  const palette = {
    'aventura-mangue':['#e5f2f3','#7bc3ca','#a6d58d'],
    'padroes-do-mangue':['#edf3dc','#82c5bd','#afd387'],
    'trilhas-do-cotidiano':['#f7eddc','#86c6cd','#b3d68e'],
    'sentinelas-do-estuario':['#e8eff3','#72b7c4','#a5cb92'],
    'mares-em-repeticao':['#e4f3f3','#64b7c5','#a9d28a'],
    'resgate-do-manguezal':['#f5ebda','#82c2bd','#a5ce82'],
    'cartografos-da-restinga':['#edf0df','#80c3c5','#b8d681'],
    'mensagens-da-lagoa':['#e8f3ef','#6ebbc2','#aed38c'],
    'oficina-de-ferramentas':['#e8f1ec','#76b8c4','#aed18a'],
    'guardioes-dos-dados':['#e7f0ec','#70b8c2','#9fca8a'],
    'comunidade-do-futuro':['#f3f0df','#79c3c4','#b3d98c']
  }[theme.id] || ['#e7f2ef','#7bc3c7','#a8d28c'];
  const [sky, water, land] = palette;
  const scene = worldArtScenes[theme.id] || worldArtScenes['aventura-mangue'];
  return `<svg viewBox="0 0 900 360" preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true" focusable="false">
    <rect width="900" height="360" fill="${sky}"/>
    <rect x="90" y="44" width="90" height="16" fill="#fff"/><rect x="66" y="60" width="138" height="14" fill="#fff"/>
    <rect x="665" y="58" width="104" height="16" fill="#fff"/><rect x="640" y="74" width="154" height="14" fill="#fff"/>
    <rect y="278" width="900" height="82" fill="${water}"/><path d="M0 278h150l30-17h128l30 17h132l28-17h136l25 17h111l30-16h100v26H0z" fill="${land}"/>
    <path d="M18 313h92m25 20h74m515-18h89m24 20h58" stroke="#e9ffff" stroke-width="6" stroke-dasharray="18 13" opacity=".8"/>
    <rect x="110" y="186" width="20" height="76" fill="#805940"/><rect x="78" y="163" width="84" height="27" fill="#278653"/><rect x="62" y="190" width="116" height="31" fill="#1e7047"/><rect x="87" y="220" width="67" height="23" fill="#2d915b"/>
    <rect x="778" y="193" width="18" height="68" fill="#805940"/><rect x="747" y="171" width="82" height="25" fill="#278653"/><rect x="730" y="196" width="116" height="29" fill="#1e7047"/><rect x="758" y="224" width="64" height="19" fill="#2d915b"/>
    ${scene}
    <rect x="8" y="8" width="884" height="344" fill="none" stroke="#fff" stroke-width="8" opacity=".7"/>
  </svg>`;
};

function buildCatalog() {
  const fy = $('fy');
  if (!fy) return;

  const years = [['all', 'Todos'], ['0', 'Infantil'], ...[1, 2, 3, 4, 5].map((year) => [String(year), `${year}º ano`])];
  fy.innerHTML = years.map(([value, label]) =>
    `<button class="chip" type="button" data-year="${value}" aria-pressed="${value === catalogYear}">${label}</button>`
  ).join('');
  fy.querySelectorAll('[data-year]').forEach((button) => {
    button.onclick = () => {
      catalogYear = button.dataset.year;
      renderCatalog();
    };
  });

  if ($('q')) $('q').oninput = (event) => {
    catalogQuery = event.target.value.trim();
    renderCatalog();
  };
  if ($('srIcon')) $('srIcon').innerHTML = svg('search', 18);
  $('worldGridView').innerHTML = svg('grid', 18);
  $('worldListView').innerHTML = svg('list', 18);
  $('worldGridView').onclick = () => setCatalogLayout('grid');
  $('worldListView').onclick = () => setCatalogLayout('list');
  setCatalogLayout(catalogLayout);
  if ($('themeBack')) $('themeBack').onclick = closeTheme;
  renderCatalog();
}

function setCatalogLayout(layout) {
  catalogLayout = layout;
  const list = $('list');
  if (list) list.dataset.layout = layout;
  $('worldGridView')?.setAttribute('aria-pressed', String(layout === 'grid'));
  $('worldListView')?.setAttribute('aria-pressed', String(layout === 'list'));
}

function renderCatalog() {
  const home = $('catalogHome');
  const detail = $('themeDetail');
  if (!home || !detail) return;

  if (selectedThemeId) {
    const theme = THEMES.find((item) => item.id === selectedThemeId);
    if (theme) {
      home.hidden = true;
      detail.hidden = false;
      renderThemeDetail(theme);
      return;
    }
    selectedThemeId = null;
  }

  home.hidden = false;
  detail.hidden = true;
  const list = $('list');
  const query = catalogNorm(catalogQuery);
  const visibleThemes = THEMES.filter((theme) => {
    const stages = missionsForTheme(theme);
    const matchesYear = catalogYear === 'all' || stages.some(({ mission }) => mission.years.includes(Number(catalogYear)));
    const searchable = catalogNorm([theme.title, theme.subtitle, theme.description, theme.focus, ...(theme.axes || []), ...(theme.bnccCodes || []), ...stages.map(({ mission, skill }) => `${mission.t} ${mission.d} ${skill}`)].join(' '));
    return matchesYear && (!query || searchable.includes(query));
  });

  $('fy')?.querySelectorAll('[data-year]').forEach((button) =>
    button.setAttribute('aria-pressed', String(button.dataset.year === catalogYear))
  );
  if ($('cnt')) $('cnt').textContent = `${visibleThemes.length} ${visibleThemes.length === 1 ? 'mundo' : 'mundos'}`;
  list.innerHTML = '';

  if (!visibleThemes.length) {
    list.innerHTML = '<div class="theme-empty"><p>Nenhum mundo encontrado.</p><button class="btn w" id="clearCatalogFilters" type="button">Limpar busca e filtros</button></div>';
    $('clearCatalogFilters').onclick = () => {
      catalogQuery = '';
      catalogYear = 'all';
      $('q').value = '';
      renderCatalog();
    };
    return;
  }

  visibleThemes.forEach((theme) => {
    const stages = missionsForTheme(theme);
    const completed = stages.filter(({ mission }) => save.done[mission.id]).length;
    const gradeSet = [...new Set(stages.flatMap(({ mission }) => mission.years))].sort((a, b) => a - b);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'theme-card';
    card.innerHTML = `<span class="theme-card-art">${themeArtwork(theme)}<span class="theme-art-badge">${svg(theme.icon, 20)} MUNDO</span></span>
      <span class="theme-card-copy"><span class="theme-card-meta">${schoolYear(gradeSet)} <span>·</span> ${stages.length} etapas</span>
      <strong>${theme.title}</strong><span class="theme-card-description">${theme.subtitle}</span>${curriculumSummary(theme)}
      <span class="theme-card-bottom"><span>${completed} de ${stages.length} etapas concluídas</span><span class="theme-open">Explorar <span aria-hidden="true">→</span></span></span></span>`;
    card.onclick = () => openTheme(theme.id);
    list.append(card);
  });
}

function openTheme(themeId) {
  selectedThemeId = themeId;
  renderCatalog();
  $('themeBack')?.focus({ preventScroll: true });
  $('catalog').scrollTo({ top: 0, behavior: 'smooth' });
}

function closeTheme() {
  selectedThemeId = null;
  renderCatalog();
  $('catalog').scrollTo({ top: 0, behavior: 'smooth' });
}

function renderThemeDetail(theme) {
  const stages = missionsForTheme(theme);
  const completed = stages.filter(({ mission }) => save.done[mission.id]).length;
  const gradeSet = [...new Set(stages.flatMap(({ mission }) => mission.years))].sort((a, b) => a - b);

  const allCodes = (theme.bnccCodes || []).map(code => `<span class="theme-code">${code}</span>`).join('');
  $('themeHero').innerHTML = `<div class="theme-hero-copy"><p class="eyebrow">MUNDO · ${schoolYear(gradeSet)}</p>
    <h1 id="themeTitle">${theme.title}</h1><p>${theme.description}</p>
    <div class="theme-hero-curriculum"><span class="theme-curriculum-axis">${(theme.axes || ['Computação']).join(' · ')}</span>
      <strong>${theme.focus || theme.subtitle}</strong><span class="theme-code-heading">Objetivos BNCC cobertos</span><span class="theme-code-list">${allCodes}</span></div>
    <span class="theme-hero-count">${stages.length} etapas · dificuldade crescente</span>
    </div>`;
  $('themeProgress').textContent = `${completed} de ${stages.length} concluídas`;
  $('themeStages').innerHTML = '';

  stages.forEach(({ mission, level, skill }, index) => {
    const stars = save.done[mission.id] || 0;
    const difficulty = ['INICIANTE', 'INTERMEDIÁRIA', 'DESAFIO'][Math.min(index, 2)];
    const stage = document.createElement('button');
    stage.type = 'button';
    stage.className = `stage-card${stars ? ' is-complete' : ''}`;
    stage.innerHTML = `<span class="stage-number">${String(index + 1).padStart(2, '0')}</span>
      <span class="stage-card-icon" style="--stage-color:${mission.col}">${svg(mission.icon, 32)}</span>
      <span class="stage-card-copy"><span class="stage-difficulty">${difficulty}</span><strong>${mission.t}</strong>
      <span class="stage-level">${level}</span><span class="stage-description">${mission.d}</span>
      <span class="stage-skill">${skill} <span>·</span> ${mission.sol.length} comandos</span></span>
      <span class="stage-action">${stars ? `${svg('star', 15)} ${stars}/3` : 'Jogar etapa'} <span aria-hidden="true">→</span></span>`;
    stage.onclick = () => {
      if (typeof promptMissionMode === 'function') promptMissionMode(mission);
      else openMission(mission);
    };
    $('themeStages').append(stage);
  });
}
