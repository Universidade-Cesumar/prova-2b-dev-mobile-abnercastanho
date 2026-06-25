import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
// IMPORTANDO A FUNÇÃO SEPARADA DO ARQUIVO UTILS
import { validarRetirada } from './utils/validacoes';
// Garante que o Alert funcione no Navegador Web se não estiver no celular
import { Platform } from 'react-native';
if (Platform.OS === 'web') {
  Alert.alert = (title, message) => alert(`${title}\n\n${message}`);
}

export default function App() {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [retiradas, setRetiradas] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [idEditando, setIdEditando] = useState(null);
  const [busca, setBusca] = useState('');

  // Estados para simular o foco colorido nos inputs 
  const [focoNome, setFocoNome] = useState(false);
  const [focoQtd, setFocoQtd] = useState(false);
  const [focoBusca, setFocoBusca] = useState(false);

  // Detecta a largura da tela para responsividade 
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const urlAPI = 'https://6a2b36d8b687a7d5cbc4f58b.mockapi.io/materiais';

  const buscarEstoque = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch(urlAPI);
      const dados = await resposta.json();
      setProdutos(dados);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Conexão", "Não foi possível carregar o estoque. Verifique sua rede.");
    } finally {
      setCarregando(false);
    }
  };

  const cadastrarMaterial = async () => {
    if (!nome.trim() || !quantidade.trim()) {
      Alert.alert("Aviso", "Preencha todos os campos antes de cadastrar.");
      return;
    }

    try {
      const novoInsumo = { name: nome, quantidade: Number(quantidade) };
      const resposta = await fetch(urlAPI, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoInsumo)
      });

      if (resposta.ok) {
        Alert.alert("Sucesso", "Material cadastrado com sucesso!");
        setNome('');
        setQuantidade('');
        buscarEstoque();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Conexão", "Falha ao enviar o cadastro para o servidor.");
    }
  };

  const salvarEdicao = async () => {
    if (!nome.trim() || !quantidade.trim()) {
      Alert.alert("Aviso", "Preencha todos os campos antes de salvar.");
      return;
    }

    try {
      const materialAtualizado = { name: nome, quantidade: Number(quantidade) };
      const resposta = await fetch(`${urlAPI}/${idEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialAtualizado)
      });

      if (resposta.ok) {
        Alert.alert("Sucesso", "Material atualizado!");
        setNome('');
        setQuantidade('');
        setIdEditando(null);
        buscarEstoque();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Conexão", "Falha ao atualizar o material no servidor.");
    }
  };

  const processarBaixaEstoque = async (item) => {
    const qtdRetirarTexto = retiradas[item.id] || '';
    const qtdRetirar = Number(qtdRetirarTexto);

    if (!validarRetirada(item.quantidade, qtdRetirar)) {
      Alert.alert(
        "Quantidade Indisponível", 
        `Não é possível realizar a baixa. O saldo atual é de ${item.quantidade || 0} un, mas você tentou retirar ${qtdRetirarTexto || 0} un.`
      );
      return;
    }

    try {
      const estoqueAtualizado = {
        name: item.name,
        quantidade: Number(item.quantidade) - qtdRetirar
      };

      const resposta = await fetch(`${urlAPI}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estoqueAtualizado)
      });

      if (resposta.ok) {
        Alert.alert("Sucesso", `Retirada realizada!`);
        setRetiradas(prev => ({ ...prev, [item.id]: '' }));
        buscarEstoque();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Conexão", "Não foi possível processar a baixa no servidor.");
    }
  };

  const excluirMaterial = async (id) => {
    try {
      const resposta = await fetch(`${urlAPI}/${id}`, { method: 'DELETE' });
      if (resposta.ok) {
        Alert.alert("Sucesso", "Material removido do estoque!");
        buscarEstoque();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Conexão", "Não foi possível excluir o material do servidor.");
    }
  };

  const handleAlterarRetirada = (id, valor) => {
    setRetiradas(prev => ({ ...prev, [id]: valor }));
  };

  const selecionarParaEdicao = (item) => {
    setIdEditando(item.id);
    setNome(item.name);
    setQuantidade(item.quantidade ? item.quantidade.toString() : '0');
  };

  useEffect(() => {
    buscarEstoque();
  }, []);

  const produtosFiltrados = produtos.filter(produto => 
    produto.name && produto.name.toLowerCase().includes(busca.toLowerCase())
  );

  // Helper para definir cores, fundos e textos baseado nas regras de saldo
  const obterEstiloEstoque = (qtd) => {
    if (qtd === 0) return { cor: '#ef4444', fundo: '#fef2f2', label: 'Esgotado' };
    if (qtd <= 20) return { cor: '#f59e0b', fundo: '#fffbeb', label: 'Estoque Baixo' };
    return { cor: '#10b981', fundo: '#ecfdf5', label: 'Estoque Seguro' };
  };

  return (
    <View style={styles.container}>
      {/* 1. HEADER / TÍTULO FIXO  */}
      <View style={styles.header}>
        <Text style={styles.title}>Almoxarifado - Enfermagem</Text>
      </View>
      
      <View style={styles.contentLayout}>
        {/* 2. CARDS DE FORMULÁRIO  */}
        <View style={styles.formContext}>
          <Text style={styles.sectionHeader}>📋 Gerenciamento de Insumos</Text>
          
          <View style={[styles.formGrid, { flexDirection: isMobile ? 'column' : 'row' }]}>
            <View style={[styles.inputGroup, !isMobile && { marginRight: 15 }]}>
              <Text style={styles.label}>Nome do Material:</Text>
              <View style={[styles.inputWrapper, focoNome && styles.inputFocado]}>
                <Text style={styles.inputIcon}>📦</Text>
                <TextInput
                  testID="input-nome"
                  style={styles.input}
                  placeholder="Ex: Seringa Descartável"
                  placeholderTextColor="#94a3b8"
                  value={nome}
                  onChangeText={setNome}
                  onFocus={() => setFocoNome(true)}
                  onBlur={() => setFocoNome(false)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantidade:</Text>
              <View style={[styles.inputWrapper, focoQtd && styles.inputFocado]}>
                <Text style={styles.inputIcon}>🔢</Text>
                <TextInput
                  testID="input-quantidade"
                  style={styles.input}
                  placeholder="Ex: 50"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={quantidade}
                  onChangeText={setQuantidade}
                  onFocus={() => setFocoQtd(true)}
                  onBlur={() => setFocoQtd(false)}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            testID="btn-cadastrar" 
            style={[idEditando ? styles.buttonEdit : styles.button, styles.btnCentralizado]}
            onPress={idEditando ? salvarEdicao : cadastrarMaterial}
          >
            <Text style={styles.buttonText}>
              {idEditando ? "💾 Salvar Alterações" : "➕ Cadastrar Insumo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* BARRA DE BUSCA */}
        <View style={styles.searchContext}>
          <View style={styles.searchHeaderRow}>
            <Text style={styles.labelBusca}>Filtrar Inventário</Text>
            <View style={styles.totalizerBadge}>
              <Text style={styles.totalizerText}>
                Itens: <Text testID="total-itens" style={{ fontWeight: 'bold' }}>{produtosFiltrados.length}</Text>
              </Text>
            </View>
          </View>
          <View style={[styles.inputWrapper, focoBusca && styles.inputFocado]}>
            <Text style={styles.inputIcon}>🔍</Text>
            <TextInput
              testID="input-busca"
              style={styles.input}
              placeholder="Digite o nome do material para pesquisar..."
              placeholderTextColor="#94a3b8"
              value={busca}
              onChangeText={setBusca}
              onFocus={() => setFocoBusca(true)}
              onBlur={() => setFocoBusca(false)}
            />
          </View>
        </View>

        <Text style={styles.subtitle}>Estoque Atual</Text>

        {carregando ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={{ marginTop: 12, color: '#64748b', fontWeight: '500' }}>Buscando dados no servidor hospitalar...</Text>
          </View>
        ) : (
          <FlatList
            testID="lista-materiais"
            data={produtosFiltrados}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              // Cálculo dinâmico para estilização das bordas, badges e regras críticas
              const infoEstoque = obterEstiloEstoque(item.quantidade || 0);
              const esCritico = item.quantidade < 10;
              
              return (
                /* Cards  */
                <View 
                  style={[
                    styles.itemRow, 
                    { borderLeftColor: infoEstoque.cor },
                    esCritico ? styles.itemCritico : null
                  ]}
                  accessibilityLabel={esCritico ? "estoque-critico" : undefined}
                >
                  <View style={styles.itemInfoBlock}>
                    <Text style={styles.itemNome}>{item.name}</Text>
                    
                    {/* Badge de saldo colorido conforme volume */}
                    <View style={[styles.badgeQtd, { backgroundColor: infoEstoque.fundo, borderColor: infoEstoque.cor }]}>
                      <Text style={[styles.itemQtdText, { color: infoEstoque.cor }]}>
                        Saldo: {item.quantidade || 0} un ({infoEstoque.label})
                      </Text>
                    </View>
                  </View>
                  
                  {/* Bloco de controles e ações com suporte a quebra responsiva automática (Flex wrap) */}
                  <View style={[styles.controlsBlock, { width: isMobile ? '100%' : '50%', marginTop: isMobile ? 12 : 0 }]}>
                    
                    {/* Input de baixa rápida alinhado à direita do card */}
                    <View style={styles.rowActions}>
                      <TextInput
                        testID="input-retirada"
                        style={styles.inputRetirada}
                        placeholder="Qtd"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={retiradas[item.id] || ''}
                        onChangeText={(valor) => handleAlterarRetirada(item.id, valor)}
                      />
                      <TouchableOpacity 
                        testID="btn-baixar" 
                        style={styles.downloadButton} 
                        onPress={() => processarBaixaEstoque(item)}
                      >
                        <Text style={styles.btnTextWhite}>⬇️ Baixar</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Botões compactos de Gerenciamento com ícones embutidos */}
                    <View style={styles.rowActions}>
                      <TouchableOpacity 
                        style={styles.editCardButton} 
                        onPress={() => selecionarParaEdicao(item)}
                      >
                        <Text style={styles.actionButtonText}>✏️ Editar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        testID="btn-excluir" 
                        style={styles.deleteButton} 
                        onPress={() => excluirMaterial(item.id)}
                      >
                        <Text style={styles.btnTextWhite}>🗑️ Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
            style={styles.lista}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Tipografia e Cores Gerais 
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  contentLayout: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: { 
    backgroundColor: '#1a3a5c', 
    paddingVertical: 18, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderBottomWidth: 3,
    borderBottomColor: '#2563eb'
  },
  title: { fontSize: 22, fontWeight: '800', color: '#ffffff', textAlign: 'center', letterSpacing: 0.5 },
  subtitle: { fontSize: 18, fontWeight: '700', marginVertical: 15, color: '#1e293b', borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 6 },
  
  // Estrutura de Formulários 
  formContext: { 
    backgroundColor: '#ffffff', 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 3 
  },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 15 },
  formGrid: { justifyContent: 'space-between' },
  inputGroup: { flex: 1, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12 },
  inputFocado: { borderColor: '#2563eb', backgroundColor: '#ffffff' },
  inputIcon: { marginRight: 8, fontSize: 16 },
  input: { flex: 1, paddingVertical: 10, fontSize: 15, color: '#1e293b', borderWidth: 0, outlineStyle: 'none' },
  button: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonEdit: { backgroundColor: '#10b981', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnCentralizado: { alignSelf: 'center', marginTop: 8, minWidth: 180, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  
  // Painel de Busca 
  searchContext: { backgroundColor: '#ffffff', padding: 18, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  searchHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  labelBusca: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  totalizerBadge: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  totalizerText: { fontSize: 12, color: '#ffffff', fontWeight: '500' },

  // cards do inventário e botões compactos
  lista: { flex: 1 },
  itemRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'space-between', 
    padding: 16, 
    backgroundColor: '#ffffff', 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderLeftWidth: 6, // Espessura reservada para a cor dinâmica do saldo
    borderRadius: 10, 
    marginBottom: 12, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 5, 
    elevation: 2 
  },
  itemInfoBlock: { flex: 1, minWidth: 180 },
  itemNome: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  badgeQtd: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, marginTop: 4, alignSelf: 'flex-start' },
  itemQtdText: { fontSize: 12, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  
  // Controles de Baixa Rápida e Ações Compactas
  controlsBlock: { alignItems: 'stretch' },
  rowActions: { flexDirection: 'row', marginBottom: 6, gap: 6 },
  inputRetirada: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 13, fontWeight: '600', color: '#1e293b', textAlign: 'center' },
  
  // Botões de Ação com cores corporativas do setor e leve elevação (Shadow)
  downloadButton: { backgroundColor: '#f97316', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6, justifyContent: 'center', alignItems: 'center', shadowColor: '#f97316', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2 },
  editCardButton: { flex: 1, backgroundColor: '#f59e0b', paddingVertical: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center', shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2 },
  deleteButton: { flex: 1, backgroundColor: '#ef4444', paddingVertical: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2 },
  btnTextWhite: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  actionButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  
  // Estilo Crítico (< 10) mantendo a integridade da regra da Sprint 3
  itemCritico: { backgroundColor: '#fff5f5', borderColor: '#ef4444' }
});