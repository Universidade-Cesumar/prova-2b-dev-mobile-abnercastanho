# Sistema de Almoxarifado - Enfermagem (Sprint 1)

Projeto desenvolvido para a disciplina de Desenvolvimento Mobile com o objetivo de modernizar e controlar o inventário e o fluxo de insumos médicos do almoxarifado hospitalar.

## 🚀 Tecnologias Utilizadas
* **React Native / Expo**: Estrutura principal do aplicativo mobile.
* **JavaScript (ES6)**: Lógica de programação e manipulação de estados.
* **MockAPI**: Plataforma para simulação do servidor backend e banco de dados.

## 📌 Funcionalidades Implementadas
* **Formulário de Cadastro**: Inputs para capturar o nome do insumo e a quantidade, integrados com validação de campos vazios.
* **Listagem em Tempo Real**: Uso do componente `FlatList` para renderizar os itens salvos diretamente no banco em nuvem.
* **Consumo de API**: Integração dos métodos HTTP `GET` (para carregar a lista ao iniciar o app) e `POST` (para injetar novos dados via formulário).
* **Contrato de Testes**: Aplicação correta dos atributos `testID` em todos os elementos obrigatórios exigidos.

## 🛠️ Como Executar o Projeto

1. Certifique-se de ter o Node.js e o Expo CLI instalados na máquina.
2. No terminal, acesse a pasta do projeto:
   ```bash
   cd sysalmoxarifado