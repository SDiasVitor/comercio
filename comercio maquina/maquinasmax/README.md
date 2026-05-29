# MáquinasMax — Documentação do Projeto

Plataforma de compra, venda e aluguel de máquinas pesadas.  
Front-end estático em HTML, CSS e JavaScript puro.

---

## Estrutura de Pastas

```
maquinasmax/
├── index.html                        # Página inicial (catálogo)
├── css/
│   └── style.css                     # Design system global
├── js/
│   ├── main.js                       # Utilitários, filtros, chat, máscaras
│   └── payment.js                    # Gerenciador de pagamentos (PIX, Cartão, Boleto)
└── pages/
    ├── auth/                         # Autenticação
    │   ├── login.html
    │   ├── cadastro.html
    │   ├── cadastro-credenciais.html
    │   ├── verificar-email.html
    │   ├── email-verificado.html
    │   ├── esqueci-senha.html
    │   └── senha-enviada.html
    ├── catalogo/                     # Detalhes de produto
    │   └── venda.html
    ├── checkout/                     # Carrinho e pagamento
    │   ├── locacoes.html
    │   └── pagamento.html
    ├── anuncios/                     # Área do anunciante
    │   ├── pagina-prestador.html
    │   ├── pagina-anunciar.html
    │   ├── pagina-meus-anuncios.html
    │   └── pagina-meus-alugueis.html
    └── perfil/                       # Área do usuário
        ├── minha-conta.html
        ├── meus-dados.html
        ├── meus-pedidos.html
        ├── avaliacoes.html
        ├── carteira.html
        ├── endereco.html
        ├── favoritos.html
        ├── protocolos.html
        └── suporte.html
```

---

## Tecnologias

- HTML5, CSS3, JavaScript (ES6+)
- Google Fonts — Inter
- Dados persistidos via `localStorage` e `sessionStorage`
- Sem dependências externas (exceto SDK do MercadoPago referenciado em payment.js)

---

## Como Rodar

Basta abrir o arquivo `index.html` em qualquer navegador moderno.  
Não é necessário servidor ou instalação de dependências.

---

## Histórico de Alterações

---

### v1.1.0 — Correção de dados dos produtos
**Arquivo:** `pages/catalogo/venda.html`  
**Motivo:** Array `PRODUTOS` estava dessincronizado com os cards do `index.html`, exibindo preço e vendedor incorretos na página de detalhe.

| ID | Campo    | Antes (errado)          | Depois (correto)           |
|----|----------|-------------------------|----------------------------|
| 4  | Vendedor | Pedro Construtora       | Obra Pesada S.A.           |
| 4  | Preço    | R$ 5.000 /dia           | R$ 4.200 /dia              |
| 5  | Vendedor | Ana Máquinas            | Equipamentos Ltda          |
| 5  | Preço    | R$ 180.000              | R$ 220.000                 |
| 6  | Nome     | Compactador Betoneira MB 2428 | Caminhão Betoneira MB 2428 |
| 6  | Vendedor | Roberto Equipamentos    | Frota Brasil               |
| 6  | Preço    | R$ 2.500 /dia           | R$ 900 /dia                |

---

### v1.2.0 — Correção do fluxo Carrinho → Pagamento
**Arquivos:** `pages/checkout/locacoes.html` e `pages/checkout/pagamento.html`  
**Motivo:** Carrinho vazio exibia alerta mas ainda redirecionava para pagamento. Total e quantidade de itens na tela de pagamento eram valores fixos no HTML, sem refletir o carrinho real.

#### locacoes.html
- Botão "Ir para Pagamento" era um `<a href="pagamento.html">` — o navegador seguia o link antes do JavaScript poder bloqueá-lo.
- Substituído por `<button id="btn-pagamento">` com listener dedicado.
- Agora verifica o `localStorage` antes de navegar: se carrinho vazio, exibe aviso e permanece na página.

#### pagamento.html
- Total "R$ 860.000" e quantidade "2" eram hardcoded no HTML.
- Substituídos por elementos com IDs (`#resumo-total`, `#resumo-itens`) preenchidos dinamicamente ao carregar.
- Adicionada proteção: se o usuário acessar `pagamento.html` diretamente com carrinho vazio, é redirecionado automaticamente de volta ao carrinho com aviso.

---

## Observações

- O login redireciona para `pages/perfil/minha-conta.html` via `sessionStorage`.
- Anúncios criados pelo usuário são salvos em `localStorage` sob a chave `meus_anuncios_maquinasmax`.
- O carrinho é salvo em `localStorage` sob a chave `carrinho_maquinasmax`.
- Em produção, substituir `YOUR_MERCADOPAGO_PUBLIC_KEY` em `payment.js` pela chave real do MercadoPago.
- **Bug conhecido em payment.js (linha 239):** variável `bandElement` deveria ser `brandElement` — causa silêncio na detecção de bandeira do cartão. Pendente de correção.

---

### v1.3.0 — Reescrita completa do carrinho
**Arquivo:** `pages/checkout/locacoes.html`  
**Motivo:** O `<tbody>` continha 3 linhas hardcoded no HTML (Escavadeira, Trator, Betoneira) com valores fixos. A função JavaScript só sobrescrevia o tbody quando havia itens no localStorage — quando vazio, o `return` antecipado deixava os dados fictícios visíveis, causando exibição de total incorreto (R$ 1.000,00 ou R$ 864.500) mesmo com carrinho vazio.

**Correções aplicadas:**
- Removidas todas as linhas hardcoded do `<tbody>` — agora começa vazio com `id="carrinho-tbody"`
- Total e botão "Ir para Pagamento" ficam **ocultos** (`display: none`) quando carrinho está vazio
- Total e botão aparecem **dinamicamente** somente quando há itens no carrinho
- Botão "Ir para Pagamento" continua bloqueado por JavaScript caso carrinho esteja vazio
