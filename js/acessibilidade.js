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
    // EVENTOS DE NAVEGAÇÃO, CLIQUES E HOVER (COM DELAY DE 0.9s)
    // =========================================================================
    
    let timeoutHover = null;
    
    // Seletores de texto que queremos que sejam lidos
    const selectorTexto = 'p, h1, h2, h3, h4, h5, h6, span, a, button, li, label, .card, .flow-block, .navb, .chip, .mission, .eyebrow, .theme-code, .stage-skill, .stage-description';

    // Função que extrai o texto limpo do elemento
    const extrairTexto = (alvo) => {
        let textoParaLer = alvo.getAttribute('aria-label') || alvo.getAttribute('title') || alvo.innerText;
        if (!textoParaLer && alvo.value) textoParaLer = alvo.value;
        
        if (textoParaLer) {
            return removerEmojis(textoParaLer).replace(/\s+/g, ' ').trim();
        }
        return '';
    };

    // Função central que decide o que falar
    const executarLeitura = (alvo, isClick = false) => {
        if (!vozAtiva) return;

        // 1. Caso especial: Botão de Dica
        if (alvo.id === 'hint') {
            if (isClick) {
                const elementoDica = document.getElementById('hx');
                if (elementoDica && elementoDica.innerText) {
                    const textoLimpo = elementoDica.innerText.replace(/\s+/g, ' ').trim();
                    falarTexto("A dica é: " + textoLimpo);
                } else {
                    falarTexto("Dica");
                }
            } else {
                falarTexto("Dica");
            }
            return;
        }

        const texto = extrairTexto(alvo);
        if (!texto) return;

        // 2. Caso especial: Blocos de comando sendo adicionados (Apenas se for clique)
        if (isClick && alvo.closest('#pal, #flowPalette')) {
            const mensagem = `${texto} adicionado à sequência.`;
            falarTexto(mensagem);
            if (anuncioAcao) {
                anuncioAcao.textContent = mensagem;
                setTimeout(() => { anuncioAcao.textContent = ''; }, 1000);
            }
        } else {
            // 3. Leitura normal (Hover ou clique em outros textos)
            falarTexto(texto);
        }
    };

    // --- 1. Leitura por Foco (Teclado) ---
    // Teclado é imediato, pois o usuário pressionou Tab intencionalmente
    document.addEventListener('focusin', (e) => {
        if (!vozAtiva) return;
        if (e.target === document.body) return;
        
        const alvo = e.target.closest(selectorTexto);
        if (alvo) {
            clearTimeout(timeoutHover); // Cancela o timer do mouse se estiver pendente
            executarLeitura(alvo, false);
        }
    });

    // --- 2. Leitura por Hover (Passar o mouse) ---
    document.addEventListener('mouseover', (e) => {
        if (!vozAtiva) return;
        
        const alvo = e.target.closest(selectorTexto);
        if (alvo) {
            // Limpa o timer anterior para não haver conflito de áudios
            clearTimeout(timeoutHover);
            
            // Inicia o delay de 0.9 segundos (900ms)
            timeoutHover = setTimeout(() => {
                executarLeitura(alvo, false);
            }, 900);
        }
    });

    // --- 3. Cancelar o áudio se o mouse sair do elemento rápido ---
    document.addEventListener('mouseout', (e) => {
        const alvo = e.target.closest(selectorTexto);
        if (alvo) {
            clearTimeout(timeoutHover);
        }
    });

    // --- 4. Leitura por Clique ---
    document.addEventListener('click', (e) => {
        const alvo = e.target.closest(selectorTexto);
        if (!alvo) return;

        // Limpa o timeout do hover para não disparar duas vezes
        clearTimeout(timeoutHover);
        
        // Aplica o mesmo delay de 0.9s para o clique
        timeoutHover = setTimeout(() => {
            executarLeitura(alvo, true);
        }, 900);
    });
});