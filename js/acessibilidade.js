document.addEventListener('DOMContentLoaded', () => {
    const sintetizador = window.speechSynthesis;
    const anuncioAcao = document.getElementById('anuncio-acao');
    let vozPtBr = null;

    // Carrega as vozes e tenta definir uma voz em português
    const configurarVozes = () => {
        const vozes = sintetizador.getVoices();
        vozPtBr = vozes.find(voz => voz.lang === 'pt-BR' || voz.lang === 'pt_BR');
    };

    configurarVozes();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = configurarVozes;
    }

    // Função central para falar o texto
    const falarTexto = (texto) => {
        if (!texto) return;
        
        sintetizador.cancel(); // Interrompe a fala atual se houver
        
        const fala = new SpeechSynthesisUtterance(texto);
        fala.lang = 'pt-BR';
        if (vozPtBr) fala.voice = vozPtBr;
        fala.rate = 1.1; 
        
        sintetizador.speak(fala);
    };

    // Função auxiliar para remover emojis e símbolos que atrapalham o leitor
    const removerEmojis = (texto) => {
        // Expressão regular para remover a maioria dos emojis visuais
        return texto.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{25B6}]/gu, '');
    };

    // 1. Escuta o foco do teclado em toda a página (Quando o usuário usa o Tab)
    document.addEventListener('focusin', (e) => {
        const alvo = e.target;

        if (alvo.matches('.card, .flow-block, .btn, .navb, .chip, .mission')) {
            let textoParaLer = '';

            // Regras Específicas para limpar a fala nos botões problemáticos
            if (alvo.id === 'hint') {
                textoParaLer = 'Dica';
            } else if (alvo.id === 'go' || alvo.id === 'flowGo' || alvo.classList.contains('execute-btn')) {
                textoParaLer = 'Executar';
            } else {
                // Comportamento padrão para os demais elementos
                textoParaLer = alvo.getAttribute('aria-label') || alvo.getAttribute('title') || alvo.innerText;
                if (textoParaLer) {
                    textoParaLer = removerEmojis(textoParaLer).replace(/\s+/g, ' ').trim();
                }
            }
            
            if (textoParaLer) {
                falarTexto(textoParaLer);
            }
        }
    });

    // 2. Escuta os cliques (Para botões e paleta)
    document.addEventListener('click', (e) => {
        const alvo = e.target.closest('.card, .flow-block, .btn');
        
        if (!alvo) return;

        // Regra para a leitura do texto da Dica
        if (alvo.id === 'hint') {
            // Pequeno atraso (150ms) para dar tempo de o script 'game.js' atualizar a div '#hx' com o texto real
            setTimeout(() => {
                const elementoDica = document.getElementById('hx');
                
                if (elementoDica && elementoDica.innerText) {
                    // Tira a palavra "Dica:" se já tiver no texto, para não gaguejar, e fala.
                    const textoLimpo = elementoDica.innerText.replace(/\s+/g, ' ').trim();
                    falarTexto("A dica é: " + textoLimpo);
                }
            }, 150);
            return; // Interrompe para não seguir com outros scripts de clique de acessibilidade abaixo
        }

        // Comportamento original para quando se clica em um bloco na paleta (Avançar, Pular, etc.)
        if (alvo.closest('#pal, #flowPalette')) {
            let nomeComando = alvo.getAttribute('aria-label') || alvo.innerText;
            nomeComando = removerEmojis(nomeComando).replace(/\s+/g, ' ').trim();

            const mensagem = `${nomeComando} adicionado à sequência.`;
            falarTexto(mensagem);
            
            // Atualiza a div oculta para leitores de tela nativos
            if (anuncioAcao) {
                anuncioAcao.textContent = mensagem;
                setTimeout(() => { anuncioAcao.textContent = ''; }, 1000);
            }
        }
    });
});