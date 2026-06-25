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
  const [focoNome, setFocoNome] = useState(false);
  const [focoQtd, setFocoQtd] = useState(false);
  const [focoBusca, setFocoBusca] = useState(false);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏥 Almoxarifado - Enfermagem</Text>
      </View>
      
      <View style={styles.contentLayout}>
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
            <Text style={{ marginTop: 10 }}>Buscando dados no servidor...</Text>
          </View>
        ) : (
          <FlatList
            testID="lista-materiais"
            data={produtosFiltrados}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View 
                style={[
                  styles.itemRow, 
                  item.quantidade < 10 ? styles.itemCritico : null
                ]}
                accessibilityLabel={item.quantidade < 10 ? "estoque-critico" : undefined}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.itemNome}>{item.name}</Text>
                  <View style={styles.badgeQtd}>
                    <Text style={styles.itemQtdText}>Saldo: {item.quantidade || 0} un</Text>
                  </View>
                </View>
                
                <View style={styles.controlsBlock}>
                  <View style={styles.rowActions}>
                    <TextInput
                      testID="input-retirada"
                      style={styles.inputRetirada}
                      placeholder="Qtd"
                      keyboardType="numeric"
                      value={retiradas[item.id] || ''}
                      onChangeText={(valor) => handleAlterarRetirada(item.id, valor)}
                    />
                    <TouchableOpacity 
                      testID="btn-baixar" 
                      style={styles.downloadButton} 
                      onPress={() => processarBaixaEstoque(item)}
                    >
                      <Text style={styles.btnTextWhite}>🔻 Baixar</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rowActions}>
                    <TouchableOpacity 
                      style={styles.editCardButton} 
                      onPress={() => selecionarParaEdicao(item)}
                    >
                      <Text style={styles.actionButtonText}>📝 Editar</Text>
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
            )}
            style={styles.lista}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12
  },
  inputFocado: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff'
  },
  inputIcon: { marginRight: 8, fontSize: 16 },
  input: { flex: 1, paddingVertical: 10, fontSize: 15, color: '#1e293b', borderWidth: 0, outlineStyle: 'none' },
  button: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonEdit: { backgroundColor: '#10b981', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnCentralizado: { alignSelf: 'center', marginTop: 8, minWidth: 180, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  

  searchContext: { 
    backgroundColor: '#ffffff', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#e2e8f0',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 6, 
    elevation: 2 
  },
  searchHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  labelBusca: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  totalizerBadge: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  totalizerText: { fontSize: 12, color: '#ffffff', fontWeight: '500' },

  // Estilos da Lista Herdados (Que serão modificados no Bloco 3)
  lista: { flex: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#ced4da', borderRadius: 8, marginBottom: 12, alignItems: 'center' },
  itemNome: { fontSize: 16, fontWeight: 'bold', color: '#212529' },
  badgeQtd: { backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 6, alignSelf: 'flex-start' },
  itemQtdText: { fontSize: 13, fontWeight: 'bold', color: '#005b96' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  controlsBlock: { width: '50%', alignItems: 'stretch' },
  rowActions: { flexDirection: 'row', marginBottom: 6, gap: 4 },
  inputRetirada: { flex: 1, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 13, textAlign: 'center' },
  downloadButton: { backgroundColor: '#fd7e14', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  editCardButton: { flex: 1, backgroundColor: '#ffc107', paddingVertical: 6, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  deleteButton: { flex: 1, backgroundColor: '#dc3545', paddingVertical: 6, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  btnTextWhite: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  actionButtonText: { color: '#212529', fontWeight: 'bold', fontSize: 12 },
  itemCritico: { backgroundColor: '#fff5f5', borderColor: '#ef4444' }
});