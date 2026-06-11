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

  // URL corrigida para bater com o recurso 'materiais' do seu MockAPI
  const urlAPI = 'https://6a2b36d8b687a7d5cbc4f58b.mockapi.io/materiais';

  // Requisicao GET para puxar os produtos cadastrados
  const buscarEstoque = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch(urlAPI);
      const dados = await resposta.json();
      setProdutos(dados); // Salva o array da API no estado
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Nao foi possivel carregar o estoque.");
    } finally {
      setCarregando(false);
    }
  };

  // Requisicao POST para cadastrar um novo insumo
  const cadastrarMaterial = async () => {
    // Validacao simples para nao mandar campo vazio
    if (!nome.trim() || !quantidade.trim()) {
      Alert.alert("Aviso", "Preencha todos os campos antes de cadastrar.");
      return;
    }

    try {
      // Objeto formatado com as propriedades que a API vai receber
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
        setNome(''); // Limpa o input
        setQuantidade(''); // Limpa o input
        buscarEstoque(); // Atualiza a lista na tela logo apos cadastrar
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao enviar o cadastro.");
    }
  };

  // 🆕 FUNÇÃO NOVA: Preenche o formulario com o item selecionado da lista
  const selecionarParaEdicao = (item) => {
    setIdEditando(item.id);
    setNome(item.name);
    setQuantidade(item.quantidade ? item.quantidade.toString() : '0');
  };

  // useEffect para rodar a busca assim que o app abrir (Ciclo de vida)
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
          style={styles.button}
          onPress={cadastrarMaterial}
        >
          <Text style={styles.buttonText}>Cadastrar Insumo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Estoque Atual (Clique para Editar)</Text>

      {/* Renderizacao condicional para o Indicator de Loading */}
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
            /* 🆕 ADICIONADO: TouchableOpacity envolvendo a linha para permitir o clique de selecao */
            <TouchableOpacity style={styles.itemRow} onPress={() => selecionarParaEdicao(item)}>
              <Text style={styles.itemNome}>{item.name}</Text>
              <Text style={styles.itemQtd}>Qtd: {item.quantidade || 0}</Text>
            </TouchableOpacity>
          )}
          style={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#005b96' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, color: '#333', borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 5 },
  formContext: { backgroundColor: '#f1f1f1', padding: 15, borderRadius: 8, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 12, fontSize: 15 },
  button: { backgroundColor: '#013a63', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  lista: { flex: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  itemNome: { fontSize: 16, fontWeight: '600', color: '#444' },
  itemQtd: { fontSize: 14, fontWeight: 'bold', color: '#005b96' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }
});