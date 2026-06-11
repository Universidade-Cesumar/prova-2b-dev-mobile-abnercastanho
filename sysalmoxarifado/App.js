import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';

export default function App() {
  // Estados para controlar os campos do formulario
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  
  // Estados para gerenciar a lista e o loading da tela
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estado para armazenar o ID do item selecionado para edicao
  const [idEditando, setIdEditando] = useState(null);

  // URL do recurso 'materiais' do seu MockAPI
  const urlAPI = 'https://6a2b36d8b687a7d5cbc4f58b.mockapi.io/materiais';

  // Requisicao GET para puxar os produtos cadastrados
  const buscarEstoque = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch(urlAPI);
      const dados = await resposta.json();
      setProdutos(dados);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Nao foi possivel carregar o estoque.");
    } finally {
      setCarregando(false);
    }
  };

  // Requisicao POST para cadastrar um novo insumo
  const cadastrarMaterial = async () => {
    if (!nome.trim() || !quantidade.trim()) {
      Alert.alert("Aviso", "Preencha todos os campos antes de cadastrar.");
      return;
    }

    try {
      const novoInsumo = {
        name: nome,
        quantidade: Number(quantidade)
      };

      const resposta = await fetch(urlAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
      Alert.alert("Erro", "Falha ao enviar o cadastro.");
    }
  };

  // Requisicao PUT para atualizar um material existente
  const salvarEdicao = async () => {
    if (!nome.trim() || !quantidade.trim()) {
      Alert.alert("Aviso", "Preencha todos os campos antes de salvar.");
      return;
    }

    try {
      const materialAtualizado = {
        name: nome,
        quantidade: Number(quantidade)
      };

      const resposta = await fetch(`${urlAPI}/${idEditando}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(materialAtualizado)
      });

      if (resposta.ok) {
        Alert.alert("Sucesso", "Material atualizado com sucesso!");
        setNome('');
        setQuantidade('');
        setIdEditando(null);
        buscarEstoque();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao atualizar o material.");
    }
  };

  // Requisicao HTTP DELETE para remover o material da API
  const excluirMaterial = async (id) => {
    try {
      const resposta = await fetch(`${urlAPI}/${id}`, {
        method: 'DELETE'
      });

      if (resposta.ok) {
        Alert.alert("Sucesso", "Material removido do estoque!");
        buscarEstoque();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Nao foi possivel excluir o material.");
    }
  };

  // Preenche o formulario com o item selecionado da lista
  const selecionarParaEdicao = (item) => {
    setIdEditando(item.id);
    setNome(item.name);
    setQuantidade(item.quantidade ? item.quantidade.toString() : '0');
  };

  // useEffect para rodar a busca assim que o app abrir
  useEffect(() => {
    buscarEstoque();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>
      
      {/* Container do Form */}
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

      <Text style={styles.subtitle}>Estoque Atual</Text>

      {carregando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#005b96" />
          <Text style={{ marginTop: 10 }}>Buscando dados no servidor...</Text>
        </View>
      ) : (
        <FlatList
          testID="lista-materiais"
          data={produtos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              {/* Informacoes do Material */}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNome}>{item.name}</Text>
                <View style={styles.badgeQtd}>
                  <Text style={styles.itemQtdText}>Qtd: {item.quantidade || 0}</Text>
                </View>
              </View>
              
              {/* Container de Botoes de Acao */}
              <View style={styles.actionsContainer}>
                {/* 🆕 BOTÃO DE EDITAR (Lápis) */}
                <TouchableOpacity style={styles.editCardButton} onPress={() => selecionarParaEdicao(item)}>
                  <Text style={styles.actionButtonText}>📝 Editar</Text>
                </TouchableOpacity>

                {/* BOTÃO DE EXCLUIR (Lixeira) */}
                <TouchableOpacity style={styles.deleteButton} onPress={() => excluirMaterial(item.id)}>
                  <Text style={styles.actionButtonText}>🗑️ Excluir</Text>
                </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#f4f6f9', paddingTop: 50, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#005b96' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, color: '#333', borderBottomWidth: 2, borderBottomColor: '#005b96', paddingBottom: 5 },
  formContext: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#dee2e6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#495057', marginBottom: 6 },
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ced4da', borderRadius: 6, padding: 12, marginBottom: 14, fontSize: 15 },
  button: { backgroundColor: '#005b96', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 5 },
  buttonEdit: { backgroundColor: '#28a745', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  lista: { flex: 1 },
  // 🆕 CARDS MAIS VISÍVEIS: Fundo branco puro com borda cinza escura e sombra destacada
  itemRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 16, 
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ced4da',
    borderRadius: 8,
    marginBottom: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  itemNome: { fontSize: 16, fontWeight: 'bold', color: '#212529' },
  badgeQtd: { backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 6, alignSelf: 'flex-start' },
  itemQtdText: { fontSize: 13, fontWeight: 'bold', color: '#005b96' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  
  // 🆕 ESTILOS DOS BOTÕES DE AÇÃO INTERNOS
  actionsContainer: { flexDirection: 'row', alignItems: 'center' },
  editCardButton: { backgroundColor: '#ffc107', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  deleteButton: { backgroundColor: '#dc3545', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  actionButtonText: { color: '#212529', fontWeight: 'bold', fontSize: 13 }
});