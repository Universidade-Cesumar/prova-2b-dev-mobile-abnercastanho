import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
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

  // SPRINT 3: Estado para o campo de busca
  const [busca, setBusca] = useState('');

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
        Alert.alert("Sucesso", "Material cadastrado!");
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
        Alert.alert("Sucesso", "Material updated!");
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

  // SPRINT 3: Filtro em tempo real
  const produtosFiltrados = produtos.filter(produto => 
    produto.name && produto.name.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>
      
      {/* Formulário de Cadastro/Edição */}
      <View style={styles.formContext}>
        <Text style={styles.label}>Nome do Material:</Text>
        <TextInput
          testID="input-nome"
          style={styles.input}
          placeholder="Ex: Seringa Descartável"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Quantidade:</Text>
        <TextInput
          testID="input-quantidade"
          style={styles.input}
          placeholder="Ex: 50"
          keyboardType="numeric"
          value={quantidade}
          onChangeText={setQuantidade}
        />

        <TouchableOpacity 
          testID="btn-cadastrar" 
          style={idEditando ? styles.buttonEdit : styles.button}
          onPress={idEditando ? salvarEdicao : cadastrarMaterial}
        >
          <Text style={styles.buttonText}>
            {idEditando ? "💾 Salvar Alterações" : "➕ Cadastrar Insumo"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SPRINT 3: Campo de Pesquisa e Dashboard */}
      <View style={styles.searchContext}>
        <Text style={styles.label}>Pesquisar Material:</Text>
        <TextInput
          testID="input-busca"
          style={styles.input}
          placeholder="Digite para filtrar..."
          value={busca}
          onChangeText={setBusca}
        />
        <View style={styles.totalizerBadge}>
          <Text style={styles.totalizerText}>
            Itens localizados: <Text testID="total-itens" style={{ fontWeight: 'bold' }}>{produtosFiltrados.length}</Text>
          </Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Estoque Atual</Text>

      {carregando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#005b96" />
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
  subtitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, color: '#333', borderBottomWidth: 2, borderBottomColor: '#005b96', paddingBottom: 5 },
  formContext: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#dee2e6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#4a5568', marginBottom: 6 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 12, marginBottom: 14, fontSize: 15 },
  button: { backgroundColor: '#005b96', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 5 },
  buttonEdit: { backgroundColor: '#28a745', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  lista: { flex: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#ced4da', borderRadius: 8, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
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
  searchContext: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#dee2e6' },
  totalizerBadge: { backgroundColor: '#e2e8f0', padding: 8, borderRadius: 6, alignItems: 'center', marginTop: 5 },
  totalizerText: { fontSize: 14, color: '#4a5568' },
  // Alerta Visual de Estoque Crítico (< 10)
  itemCritico: { backgroundColor: '#fff5f5', borderColor: '#e53e3e', borderWidth: 2 }
});