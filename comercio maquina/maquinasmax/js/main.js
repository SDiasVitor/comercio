/* ========================================
   MAQUINASMAX - MAIN.JS
   Funções gerais e utilidades
   ======================================== */

// ===== VALIDAÇÕES =====

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
}

function validarSenha(senha) {
  return senha.length >= 6;
}

function validarTelefone(telefone) {
  const regex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
  return regex.test(telefone);
}

// ===== MASCARAS DE ENTRADA =====

function mascaraCPF(input) {
  input.value = input.value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function mascaraTelefone(input) {
  input.value = input.value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 15);
}

function mascaraCEP(input) {
  input.value = input.value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
}

// ===== FILTROS DE PRODUTOS =====

function aplicarFiltros() {
  const input = document.getElementById('search-input');
  const cards = document.querySelectorAll('.card');
  const categoriaAtiva = document.querySelector('.categorias a.ativo')?.dataset.cat || 'todos';
  const tipoAtivo = document.querySelector('.filtro-tipo a.ativo')?.dataset.tipo || 'todos';
  const termo = input?.value.trim().toLowerCase() || '';
  
  let visiveis = 0;

  cards.forEach(card => {
    const cat = card.dataset.categoria;
    const tipo = card.dataset.tipo;
    const nome = card.querySelector('.card-nome')?.textContent.toLowerCase() || '';
    const tag = card.querySelector('.card-tag')?.textContent.toLowerCase() || '';

    const catOk = categoriaAtiva === 'todos' || cat === categoriaAtiva;
    const tipoOk = tipoAtivo === 'todos' || tipo === tipoAtivo;
    const termoOk = !termo || nome.includes(termo) || tag.includes(termo);

    const mostra = catOk && tipoOk && termoOk;
    card.style.display = mostra ? '' : 'none';
    if (mostra) visiveis++;
  });

  const semRes = document.getElementById('sem-resultado');
  if (semRes) {
    semRes.style.display = visiveis === 0 ? 'block' : 'none';
  }

  atualizarTitulo(termo, visiveis);
}

function atualizarTitulo(termo, visiveis) {
  const titulo = document.querySelector('.titulo-secao');
  if (!titulo) return;

  let tituloTexto = '';
  if (termo) {
    tituloTexto = `Resultados para "${termo}" (${visiveis})`;
  } else {
    tituloTexto = 'Anúncios Recentes';
  }
  titulo.textContent = tituloTexto;
}

// ===== INICIALIZAÇÃO DE EVENTOS =====

document.addEventListener('DOMContentLoaded', () => {
  // Filtro de categoria
  document.querySelectorAll('.categorias a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.categorias a').forEach(l => l.classList.remove('ativo'));
      link.classList.add('ativo');
      document.getElementById('search-input').value = '';
      aplicarFiltros();
    });
  });

  // Filtro de tipo (Venda/Aluguel)
  document.querySelectorAll('.filtro-tipo a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.filtro-tipo a').forEach(l => l.classList.remove('ativo'));
      link.classList.add('ativo');
      aplicarFiltros();
    });
  });

  // Busca
  const input = document.getElementById('search-input');
  const btnBusca = document.getElementById('btn-buscar');
  
  if (btnBusca) {
    btnBusca.addEventListener('click', e => {
      e.preventDefault();
      aplicarFiltros();
    });
  }

  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') aplicarFiltros();
    });
    input.addEventListener('input', () => {
      if (input.value === '') aplicarFiltros();
    });
  }

  // Máscaras de entrada
  const cpfInput = document.querySelector('input[placeholder*="CPF"]');
  const telInput = document.querySelector('input[type="tel"]');
  const cepInput = document.querySelector('input[placeholder*="CEP"]');

  if (cpfInput) cpfInput.addEventListener('input', e => mascaraCPF(e.target));
  if (telInput) telInput.addEventListener('input', e => mascaraTelefone(e.target));
  if (cepInput) cepInput.addEventListener('input', e => mascaraCEP(e.target));
});

// ===== CHAT =====

class ChatManager {
  constructor() {
    this.modal = document.getElementById('chatModal');
    this.closeBtn = document.querySelector('.chat-close');
    this.sendBtn = document.querySelector('.chat-input button');
    this.input = document.querySelector('.chat-input textarea');
    this.messages = document.querySelector('.chat-messages');
  }

  init() {
    if (!this.modal) return;

    document.getElementById('btn-chat')?.addEventListener('click', () => this.open());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', e => {
      if (e.target === this.modal) this.close();
    });

    this.sendBtn?.addEventListener('click', () => this.enviarMensagem());
    this.input?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.enviarMensagem();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.modal.classList.contains('open')) {
        this.close();
      }
    });
  }

  open() {
    this.modal.classList.add('open');
  }

  close() {
    this.modal.classList.remove('open');
  }

  enviarMensagem() {
    const texto = this.input.value.trim();
    if (!texto) return;

    this.adicionarMensagem(texto, 'right');
    this.input.value = '';

    this.mostrarTyping();

    setTimeout(() => {
      this.removerTyping();
      const resposta = this.gerarRespostaAutomatica();
      this.adicionarMensagem(resposta, 'left');
    }, 1500);
  }

  adicionarMensagem(texto, lado) {
    const div = document.createElement('div');
    div.className = `msg-grupo ${lado}`;
    div.innerHTML = `<div class="msg-balao">${texto}</div>`;
    this.messages.appendChild(div);
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  mostrarTyping() {
    const div = document.createElement('div');
    div.className = 'msg-grupo left';
    div.id = 'typing-indicator';
    div.innerHTML = `<div class="msg-typing"><span class="typing-dots"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span></div>`;
    this.messages.appendChild(div);
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  removerTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  gerarRespostaAutomatica() {
    const respostas = [
      'Obrigado pela mensagem! Entraremos em contato em breve.',
      'Temos muitas opções disponíveis. Posso te ajudar com mais informações?',
      'Qual é a sua necessidade? Posso indicar máquinas para você.',
      'Estou aqui para ajudar! Qual máquina te interessa?',
      'Ótima pergunta! Deixe-me verificar os detalhes para você.'
    ];
    return respostas[Math.floor(Math.random() * respostas.length)];
  }
}

// Inicializar chat
document.addEventListener('DOMContentLoaded', () => {
  const chat = new ChatManager();
  chat.init();
});

// ===== API =====

async function enviarDados(endpoint, dados) {
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados)
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Erro na requisição:', response.status);
    }
  } catch (error) {
    console.error('Erro na integração:', error);
  }
}

// ===== UTILIDADES =====

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
}

console.log('✓ MáquinasMax JS carregado');
