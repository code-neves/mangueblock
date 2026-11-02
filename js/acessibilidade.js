document.addEventListener('DOMContentLoaded', () => {
    const sintetizador = window.speechSynthesis;
    const anuncioAcao = document.getElementById('anuncio-acao');
    let vozPtBr = null;
    
    // Controla se o áudio está ligado ou desligado (Inicia ligado)
    let vozAtiva = true;

    const configurarVozes = () => {
        const vozes = sintetizador.getVoices();
        vozPtBr = vozes.find(voz => voz.lang === 'pt-BR' || voz.lang === 'pt_BR' || voz.lang === 'pt-PT');
    };

    configurarVozes();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = configurarVozes;
    }

    const falarTexto = (texto) => {
        if (!vozAtiva || !texto) return;
        
        sintetizador.cancel(); 
        
        const fala = new SpeechSynthesisUtterance(texto);
        fala.lang = 'pt-BR';
        if (vozPtBr) fala.voice = vozPtBr;
        fala.rate = 1.1; 
        
        sintetizador.speak(fala);
    };

    const removerEmojis = (texto) => {
        return texto.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{25B6}]/gu, '');
    };

    // =========================================================================
    // INJEÇÃO DA OPÇÃO DE ÁUDIO COM O MESMO ESTILO VISUAL DO PROJETO
    // =========================================================================
    const injetarMenuAudiodescricao = () => {
        const apf = document.getElementById('apf');
        if (!apf) return;
        
        // Verifica se já inserimos para não duplicar botões
        if (document.getElementById('fieldset-audiodescricao')) return;

        // Cria a estrutura igual às opções "Sons", "Contraste", etc.
        const fieldset = document.createElement('fieldset');
        fieldset.id = 'fieldset-audiodescricao';

        const legend = document.createElement('legend');
        legend.textContent = 'Audiodescrição (Voz)';
        fieldset.appendChild(legend);

        // --- Botão "Desligada" ---
        const labelOff = document.createElement('label');
        labelOff.className = 'opt';
        
        const inputOff = document.createElement('input');
        inputOff.type = 'radio';
        inputOff.name = 'audiodesc_radio'; // Nome único para agrupar os botões
        inputOff.value = 'off';
        inputOff.checked = !vozAtiva;
        
        const spanOff = document.createElement('span');
        spanOff.textContent = 'Desligada';
        
        labelOff.appendChild(inputOff);
        labelOff.appendChild(spanOff);

        // --- Botão "Ligada" ---
        const labelOn = document.createElement('label');
        labelOn.className = 'opt';
        
        const inputOn = document.createElement('input');
        inputOn.type = 'radio';
        inputOn.name = 'audiodesc_radio';
        inputOn.value = 'on';
        inputOn.checked = vozAtiva;
        
        const spanOn = document.createElement('span');
        spanOn.textContent = 'Ligada';
        
        labelOn.appendChild(inputOn);
        labelOn.appendChild(spanOn);

        // Junta tudo e insere no menu
        fieldset.appendChild(labelOff);
        fieldset.appendChild(labelOn);
        apf.appendChild(fieldset);

        // Eventos para alterar o estado da voz
        inputOff.addEventListener('change', (e) => {
            if (e.target.checked) {
                vozAtiva = false;
                sintetizador.cancel(); // Cala a voz instantaneamente
            }
        });

        inputOn.addEventListener('change', (e) => {
            if (e.target.checked) {
                vozAtiva = true;
                falarTexto("Audiodescrição ligada.");
            }
        });
    };

    // Usamos um MutationObserver. Se outro ficheiro do jogo apagar o nosso menu 
    // ao reconstruir o HTML, este observador volta a injetá-lo automaticamente.
    const apfNode = document.getElementById('apf');
    if (apfNode) {
        const observer = new MutationObserver(() => {
            injetarMenuAudiodescricao();
        });
        // Fica de olho nas mudanças dentro da janela de acessibilidade
        observer.observe(apfNode, { childList: true });
        
        // Tenta injetar logo no arranque
        injetarMenuAudiodescricao();
    }

    // =========================================================================
    // EVENTOS DE NAVEGAÇÃO E CLIQUES 
    // =========================================================================
    document.addEventListener('focusin', (e) => {
        if (!vozAtiva) return; 
        
        const alvo = e.target;
        if (alvo.matches('.card, .flow-block, .btn, .navb, .chip, .mission')) {
            let textoParaLer = '';

            if (alvo.id === 'hint') {
                textoParaLer = 'Dica';
            } else if (alvo.id === 'go' || alvo.id === 'flowGo' || alvo.classList.contains('execute-btn')) {
                textoParaLer = 'Executar';
            } else {
                textoParaLer = alvo.getAttribute('aria-label') || alvo.getAttribute('title') || alvo.innerText;
                if (textoParaLer) {
                    textoParaLer = removerEmojis(textoParaLer).replace(/\s+/g, ' ').trim();
                }
            }
            
            if (textoParaLer) falarTexto(textoParaLer);
        }
    });

    document.addEventListener('click', (e) => {
        const alvo = e.target.closest('.card, .flow-block, .btn');
        if (!alvo) return;

        if (alvo.id === 'hint') {
            setTimeout(() => {
                const elementoDica = document.getElementById('hx');
                if (elementoDica && elementoDica.innerText) {
                    const textoLimpo = elementoDica.innerText.replace(/\s+/g, ' ').trim();
                    falarTexto("A dica é: " + textoLimpo);
                }
            }, 150);
            return;
        }

        if (vozAtiva && alvo.closest('#pal, #flowPalette')) {
            let nomeComando = alvo.getAttribute('aria-label') || alvo.innerText;
            nomeComando = removerEmojis(nomeComando).replace(/\s+/g, ' ').trim();

            const mensagem = `${nomeComando} adicionado à sequência.`;
            falarTexto(mensagem);
            
            if (anuncioAcao) {
                anuncioAcao.textContent = mensagem;
                setTimeout(() => { anuncioAcao.textContent = ''; }, 1000);
            }
        }
    });
});