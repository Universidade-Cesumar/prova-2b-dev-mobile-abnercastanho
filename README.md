<div align="center">

# 🏥 Almoxarifado · Enfermagem

### Sistema de Gerenciamento de Estoque Hospitalar

*Controle inteligente de insumos médicos.*

---

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![REST API](https://img.shields.io/badge/REST_API-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![MockAPI](https://img.shields.io/badge/MockAPI-FF6B6B?style=for-the-badge&logo=json&logoColor=white)

![Sprints](https://img.shields.io/badge/Sprints-3%20Ciclos-blue?style=flat-square)
![Testes](https://img.shields.io/badge/TestIDs-10%20Cobertos-brightgreen?style=flat-square)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-green?style=flat-square)

<br/>



</div>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura e Stack](#️-arquitetura-e-stack)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Executar](#️-como-executar)
- [Regras de Negócio](#-regras-de-negócio)
- [Contratos Técnicos & Cobertura de Testes](#-contratos-técnicos--cobertura-de-testes)
- [Sprints & Evolução](#-sprints--evolução-do-projeto)
- [Licença](#-licença)

---

## 🧭 Sobre o Projeto

O **Almoxarifado - Enfermagem** é um sistema de inventário hospitalar desenvolvido como projeto acadêmico, simulando um cenário real de controle de insumos médicos em um setor de enfermagem.

O sistema permite que profissionais de saúde realizem o gerenciamento completo do estoque — desde o cadastro de novos materiais até o registro de saídas diárias — com **alertas visuais inteligentes** que sinalizam a criticidade de estoque em tempo real, prevenindo desabastecimentos nos plantões.

O projeto foi construído de forma incremental ao longo de **três Sprints**, cada uma adicionando camadas de robustez técnica, refinamento de regras de negócio e melhoria de experiência do usuário.

---

## 🚀 Funcionalidades

### ✅ Implementadas

| # | Funcionalidade | Descrição |
|:---:|:---|:---|
| 1 | **📦 Cadastro de Insumos** | Criação de novos materiais com nome e quantidade inicial via formulário |
| 2 | **✏️ Edição Inline** | Modificação de registros existentes com pré-preenchimento automático dos campos |
| 3 | **🗑️ Exclusão** | Remoção definitiva do registro no servidor através de requisições DELETE |
| 4 | **📉 Baixa Rápida de Estoque** | Saída de materiais por card individual com validação de saldo em tempo real |
| 5 | **🔍 Filtro em Tempo Real** | Pesquisa textual instantânea com badge indicador do total de itens visíveis |
| 6 | **⚠️ Alerta de Estoque Crítico** | Destaque visual automático (fundo claro e borda vermelha) para saldos inferiores a 10 un |
| 7 | **🎨 Semáforo de Status** | Borda lateral colorida por criticidade: 🟢 Seguro (>20) · 🟡 Baixo (1–20) · 🔴 Esgotado (0) |
| 8 | **📱 Layout Responsivo** | Grid adaptável para resoluções Web/Tablet que se empilha em 1 coluna no Mobile |
| 9 | **🔄 Sincronização com API** | Integração assíncrona com API REST externa (MockAPI) usando blocos `try/catch` contra falhas de rede |
| 10 | **♿ Acessibilidade** | Propriedades de acessibilidade injetadas dinamicamente para leitores de tela |

---

## 🛠️ Arquitetura e Stack

### Tecnologias utilizadas

| Camada | Tecnologia | Finalidade |
|:---|:---|:---|
| Framework | `React Native` + `Expo` | Base do app mobile/web |
| Linguagem | `JavaScript (ES2022+)` | Lógica de programação e renderização |
| Estado | `useState` · `useEffect` | Gerenciamento reativo local e ciclo de vida |
| Responsividade | `useWindowDimensions` | Adaptação dinâmica de layout por largura de tela |
| HTTP | `Fetch API` (`async/await`) | Comunicação assíncrona com o backend remoto |
| Backend | `MockAPI REST` | Persistência remota simulada dos insumos |
| Estilização | `StyleSheet` nativo | Estilos performáticos customizados |
| Testes | `Jest` + `testID` | Integração com suítes de automação e testes unitários |

---

## 📂 Estrutura de Pastas

A arquitetura atual preza pela simplicidade e centralização da árvore de renderização no arquivo raiz, desacoplando de forma isolada apenas as funções puras de validação:

```
PROVA-2B-DEV-MOBILE/
│
│
├── 📁 utils/                   # Regras de negócio isoladas e testáveis
│   └── validacoes.js           # Função pura de validação de retiradas de estoque
│
├── App.js                      # Componente raiz, estados, requisições HTTP e UI
├── app.json                    # Configurações de metadados do Expo
├── index.js                    # Ponto de entrada da aplicação
├── jest.config.js              # Configuração da suíte de testes unitários do Jest
├── package.json                # Dependências do projeto e scripts de execução
└── README.md                   # Documentação oficial do sistema
```

---

## ⚙️ Como Executar

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/Universidade-Cesumar/prova-2b-dev-mobile-abnercastanho.git

# 2. Instale as dependências do projeto
npm install

# 3. Inicie o servidor de desenvolvimento do Expo
npx expo start
```

### Execução por plataforma

No terminal aberto pelo Expo, pressione a tecla correspondente à sua plataforma de teste:

| Tecla | Plataforma |
|:---:|:---|
| `w` | Abre no **Navegador Web** |
| `a` | Abre no **Emulador Android** |
| `i` | Abre no **Simulador iOS** *(requer macOS)* |

---

## 📐 Regras de Negócio

As validações críticas foram desacopladas da interface e isoladas em `utils/validacoes.js`, garantindo testabilidade unitária independente via Jest.

### `validarRetirada(estoqueAtual, quantidadeRetirada)`

```javascript
/**
 * Valida se uma retirada de estoque é elegível.
 *
 * @param {number} estoqueAtual        - Volume atual disponível no servidor.
 * @param {number} quantidadeRetirada  - Quantidade pretendida para saída.
 * @returns {boolean} true  → operação permitida
 *                    false → operação bloqueada (viola as regras)
 */
export function validarRetirada(estoqueAtual, quantidadeRetirada) {
  if (isNaN(quantidadeRetirada) || quantidadeRetirada <= 0) return false;
  if (quantidadeRetirada > estoqueAtual) return false;
  return true;
}
```

### Limiares do Semáforo Visual e Criticidade

| Faixa de Saldo | Status | Cor | Comportamento no Card |
|:---|:---|:---:|:---|
| `> 20 unidades` | Estoque Seguro | 🟢 Verde | Borda lateral verde |
| `1 – 20 unidades` | Estoque Baixo | 🟡 Amarelo | Borda lateral amarela |
| `= 0 unidades` | Esgotado | 🔴 Vermelho | Borda lateral vermelha |
| `< 10 unidades` | Estoque Crítico | 🚨 Alerta | Fundo avermelhado + `accessibilityLabel="estoque-critico"` |

---

## 🧪 Contratos Técnicos & Cobertura de Testes

Todos os componentes interativos possuem as tags `testID` ou `accessibilityLabel` rigidamente mapeadas para compatibilidade com o robô de correção automatizada:

| `testID` / `accessibilityLabel` | Tipo | Propósito Técnico |
|:---|:---:|:---|
| `input-nome` | `testID` | Captura do texto com o nome do insumo |
| `input-quantidade` | `testID` | Entrada numérica para a quantidade inicial |
| `btn-cadastrar` | `testID` | Botão disparador do formulário (Cadastro / Salvar Edição) |
| `lista-materiais` | `testID` | Componente `FlatList` que renderiza o inventário |
| `input-busca` | `testID` | Campo de pesquisa textual para filtragem em tempo real |
| `total-itens` | `testID` | Exibição do totalizador de itens retornados pela busca |
| `input-retirada` | `testID` | Entrada de volume para a baixa rápida individual |
| `btn-baixar` | `testID` | Gatilho para processar a subtração do estoque (via PUT) |
| `btn-excluir` | `testID` | Botão para remoção permanente do item (via DELETE) |
| `estoque-critico` | `accessibilityLabel` | Injetado na `View` do card quando o saldo for menor que 10 un |

> **Status de Cobertura: 10 / 10 identificadores homologados no Autograding ✅**

---

## 📅 Sprints & Evolução do Projeto

### Sprint 1 — Fundação e Consumo GET/POST
Criação do ambiente Expo, desenvolvimento do layout básico e integração com o MockAPI para listagem automática via `useEffect` e envio do formulário de cadastro de insumos.

### Sprint 2 — Validações e Persistência PUT/DELETE
Desacoplamento das regras de negócio em arquivo utilitário externo, criação dos fluxos assíncronos para baixa rápida de estoque, edição inline e remoção de registros do servidor.

### Sprint 3 — Dashboard, Responsividade e Resiliência
Implementação do filtro com atualização de contador em tempo real, aplicação do semáforo visual de estoque por cores, estilização condicional de criticidade com tags de acessibilidade e blindagem do app com tratamento `try/catch`.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](./LICENSE) para mais informações.

---

<div align="center">

Desenvolvido por **Abner Caroso**

</div>