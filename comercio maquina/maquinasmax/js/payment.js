/* ========================================
   MAQUINASMAX - PAYMENT.JS
   Integração com MercadoPago e PIX
   ======================================== */

class PagamentoManager {
    constructor() {
        this.publicKey = 'YOUR_MERCADOPAGO_PUBLIC_KEY'; // Substituir em produção
        this.valorTotal = 0;
        this.metodoPagamento = null;
        this.inicializar();
    }

    inicializar() {
        // Carregar MercadoPago SDK
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        document.body.appendChild(script);

        // Event listeners
        document.querySelectorAll('input[name="pay"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.selecionarMetodo(e.target.value));
        });

        document.querySelector('button[type="submit"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.processarPagamento();
        });
    }

    selecionarMetodo(metodo) {
        this.metodoPagamento = metodo;
        this.atualizarUI(metodo);
    }

    atualizarUI(metodo) {
        // Remover conteúdo anterior
        const container = document.getElementById('payment-options');
        if (!container) return;

        let html = '';

        switch(metodo) {
            case 'CARTAO':
                html = this.gerarFormCartao();
                break;
            case 'PIX':
                html = this.gerarFormPIX();
                break;
            case 'BOLETO':
                html = this.gerarFormBoleto();
                break;
        }

        container.innerHTML = html;
        this.inicializarValidadores();
    }

    gerarFormCartao() {
        return `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h4 style="margin-bottom: 15px; color: var(--dark);">Dados do Cartão</h4>
                
                <div class="input-group">
                    <label>Número do Cartão</label>
                    <input type="text" id="cardNumber" placeholder="0000 0000 0000 0000" maxlength="19" required>
                    <small id="cardBrand" style="color: var(--primary); margin-top: 5px;"></small>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                    <div class="input-group">
                        <label>Validade (MM/AA)</label>
                        <input type="text" id="cardExpiry" placeholder="12/25" maxlength="5" required>
                    </div>
                    <div class="input-group">
                        <label>CVV</label>
                        <input type="text" id="cardCVV" placeholder="123" maxlength="4" required>
                    </div>
                </div>

                <div class="input-group">
                    <label>Nome do Titular</label>
                    <input type="text" id="cardHolder" placeholder="NOME SOBRENOME" required>
                </div>

                <div class="input-group">
                    <label>Parcelas</label>
                    <select id="installments" required>
                        <option value="1">1x (à vista)</option>
                        <option value="2">2x sem juros</option>
                        <option value="3">3x sem juros</option>
                        <option value="6">6x sem juros</option>
                        <option value="12">12x com juros</option>
                    </select>
                </div>

                <div class="input-group">
                    <label>CPF do Titular</label>
                    <input type="text" id="cardCPF" placeholder="000.000.000-00" required>
                </div>

                <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid var(--primary);">
                    <p style="font-size: 13px; color: #666; margin: 0;">
                        🔒 Seus dados de pagamento são protegidos por criptografia SSL 256-bit
                    </p>
                </div>
            </div>
        `;
    }

    gerarFormPIX() {
        return `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="color: #666; margin-bottom: 15px; font-size: 14px;">
                        ✓ PIX é a forma mais rápida e segura<br>
                        Saldo debitado em instantes
                    </p>
                    
                    <div id="qrcode" style="display: flex; justify-content: center; margin: 20px 0; min-height: 250px; background: #fafafa; border-radius: 8px; align-items: center; border: 2px dashed #ddd;">
                        <div style="text-align: center;">
                            <p style="color: #999; margin: 0; font-size: 14px;">QR Code será gerado após confirmação</p>
                        </div>
                    </div>

                    <input type="text" id="pixKey" placeholder="Sua chave PIX (CPF, Email ou Telefone)" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 15px; font-size: 14px;">

                    <button type="button" id="generatePixBtn" class="btn-laranja" style="width: 100%; padding: 12px; margin-top: 10px;">
                        Gerar QR Code
                    </button>
                </div>

                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #32BCAD;">
                    <p style="font-size: 13px; color: #666; margin: 0;">
                        📱 Abra seu app de banco e use o QR Code para pagar
                    </p>
                </div>
            </div>
        `;
    }

    gerarFormBoleto() {
        return `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <div class="input-group">
                    <label>CPF</label>
                    <input type="text" id="boletoCPF" placeholder="000.000.000-00" required>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 15px;">
                    <h4 style="margin-bottom: 15px; color: var(--dark);">Informações do Boleto</h4>
                    <ul style="list-style: none; padding: 0; font-size: 14px; color: #666; line-height: 1.8;">
                        <li>✓ Boleto gerado imediatamente</li>
                        <li>✓ Válido por 3 dias úteis</li>
                        <li>✓ Compensação em até 2 dias úteis</li>
                        <li>✓ Enviado por email</li>
                        <li>✓ Pague em qualquer banco ou lotérica</li>
                    </ul>
                </div>

                <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #444;">
                    <p style="font-size: 13px; color: #666; margin: 0;">
                        📧 Você receberá o boleto por email e poderá baixá-lo aqui
                    </p>
                </div>
            </div>
        `;
    }

    inicializarValidadores() {
        if (this.metodoPagamento === 'CARTAO') {
            this.inicializarCartao();
        } else if (this.metodoPagamento === 'PIX') {
            this.inicializarPIX();
        }
    }

    inicializarCartao() {
        const cardNumber = document.getElementById('cardNumber');
        const cardExpiry = document.getElementById('cardExpiry');
        const cardCVV = document.getElementById('cardCVV');
        const cardCPF = document.getElementById('cardCPF');

        // Formatar número do cartão
        cardNumber?.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = formattedValue;
            
            // Detectar bandeira
            this.detectarBandeira(value);
        });

        // Formatar validade
        cardExpiry?.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });

        // CVV apenas números
        cardCVV?.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });

        // Formatar CPF
        cardCPF?.addEventListener('input', (e) => mascaraCPF(e.target));
    }

    inicializarPIX() {
        const generatePixBtn = document.getElementById('generatePixBtn');
        const pixKey = document.getElementById('pixKey');

        generatePixBtn?.addEventListener('click', () => {
            const key = pixKey?.value.trim();
            
            if (!key) {
                alert('Por favor, insira sua chave PIX');
                return;
            }

            this.gerarQRCodePIX(key);
        });
    }

    detectarBandeira(numero) {
        let bandeira = '';
        
        if (/^4/.test(numero)) bandeira = '💳 Visa';
        else if (/^5[1-5]/.test(numero)) bandeira = '💳 MasterCard';
        else if (/^3[47]/.test(numero)) bandeira = '💳 American Express';
        else if (/^36|^38/.test(numero)) bandeira = '💳 Diners Club';
        else if (/^50/.test(numero)) bandeira = '💳 Aura';

        const brandElement = document.getElementById('cardBrand');
        if (brandElement) bandElement.textContent = bandeira;
    }

    gerarQRCodePIX(chave) {
        // Simular geração de QR Code
        const qrcodeDiv = document.getElementById('qrcode');
        
        qrcodeDiv.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <svg width="250" height="250" style="border: 1px solid #ddd; background: white; padding: 10px; border-radius: 8px;">
                    <!-- QR Code simulado -->
                    <rect width="250" height="250" fill="white"/>
                    <rect x="10" y="10" width="60" height="60" fill="black"/>
                    <rect x="180" y="10" width="60" height="60" fill="black"/>
                    <rect x="10" y="180" width="60" height="60" fill="black"/>
                    <text x="125" y="130" text-anchor="middle" font-size="20" fill="black">PIX</text>
                </svg>
                <p style="margin-top: 15px; color: #666; font-size: 14px;">
                    Chave: <strong>${chave}</strong>
                </p>
                <p style="color: #999; font-size: 12px; margin-top: 5px;">
                    Use seu app de banco para escanear
                </p>
            </div>
        `;
    }

    async processarPagamento() {
        if (!this.metodoPagamento) {
            alert('Selecione uma forma de pagamento');
            return;
        }

        let dados = {
            valor: this.valorTotal,
            metodo: this.metodoPagamento,
            timestamp: new Date().toISOString()
        };

        switch(this.metodoPagamento) {
            case 'CARTAO':
                if (!this.validarCartao()) return;
                dados = {
                    ...dados,
                    cartao: {
                        numero: document.getElementById('cardNumber').value,
                        validade: document.getElementById('cardExpiry').value,
                        cvv: document.getElementById('cardCVV').value,
                        titular: document.getElementById('cardHolder').value,
                        cpf: document.getElementById('cardCPF').value,
                        parcelas: document.getElementById('installments').value
                    }
                };
                break;

            case 'PIX':
                if (!document.getElementById('pixKey').value.trim()) {
                    alert('Insira sua chave PIX');
                    return;
                }
                dados = {
                    ...dados,
                    chave_pix: document.getElementById('pixKey').value
                };
                break;

            case 'BOLETO':
                if (!document.getElementById('boletoCPF').value.trim()) {
                    alert('Insira seu CPF');
                    return;
                }
                dados = {
                    ...dados,
                    cpf: document.getElementById('boletoCPF').value
                };
                break;
        }

        await this.enviarPagamento(dados);
    }

    validarCartao() {
        const numero = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const validade = document.getElementById('cardExpiry').value;
        const cvv = document.getElementById('cardCVV').value;
        const titular = document.getElementById('cardHolder').value;

        if (numero.length < 13) {
            alert('Número do cartão inválido');
            return false;
        }

        if (!validade.match(/^\d{2}\/\d{2}$/)) {
            alert('Validade inválida (MM/AA)');
            return false;
        }

        if (cvv.length < 3) {
            alert('CVV inválido');
            return false;
        }

        if (titular.trim().length < 5) {
            alert('Nome do titular deve ter pelo menos 5 caracteres');
            return false;
        }

        // Validar se o cartão não expirou
        const [mes, ano] = validade.split('/');
        const dataValidade = new Date(2000 + parseInt(ano), parseInt(mes) - 1);
        
        if (dataValidade < new Date()) {
            alert('Cartão expirado');
            return false;
        }

        return true;
    }

    async enviarPagamento(dados) {
        try {
            // Mostrar loading
            const btnSubmit = document.querySelector('button[type="submit"]');
            const btnOriginal = btnSubmit.textContent;
            btnSubmit.disabled = true;
            btnSubmit.textContent = '⏳ Processando...';

            // Simular envio (em produção, seria para um backend real)
            console.log('Enviando dados de pagamento:', dados);

            // Simular delay de processamento
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Sucesso
            this.mostrarSucesso(dados.metodo);

            // Restaurar botão
            btnSubmit.disabled = false;
            btnSubmit.textContent = btnOriginal;

        } catch (error) {
            console.error('Erro ao processar pagamento:', error);
            alert('Erro ao processar pagamento. Tente novamente.');
        }
    }

    mostrarSucesso(metodo) {
        const mensagens = {
            'CARTAO': '✓ Pagamento aprovado com sucesso! Sua compra foi confirmada.',
            'PIX': '✓ QR Code gerado! Escaneie para confirmar o pagamento.',
            'BOLETO': '✓ Boleto gerado! Você receberá por email em breve.'
        };

        alert(mensagens[metodo]);

        // Redirecionar após sucesso
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 2000);
    }
}

// Inicializar gerenciador de pagamento quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const pagamento = new PagamentoManager();
    
    // Carregar valor total da página (se existir)
    const precoElement = document.getElementById('preco-produto');
    if (precoElement) {
        const preco = parseFloat(precoElement.textContent.replace(/[^\d,]/g, '').replace(',', '.'));
        pagamento.valorTotal = preco;
    }
});

console.log('✓ Payment.js carregado');
