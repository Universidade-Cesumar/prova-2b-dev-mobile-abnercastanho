import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';

export default function App() {
  // Estados para controlar o texto dos inputs do formulário
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');

  // Estados: Lista de produtos e indicador de carregamento
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true); // Começa true para buscar os dados ao abrir


  const urlAPI = 'COLE_AQUI_A_SUA_NOVA_URL_DO_MOCKAPI/produtos';

  // --- FUNÇÃO ASSÍNCRONA (GET): Consumo dos dados do estoque ---
  const buscarEstoque = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch(urlAPI);
      const dados = await resposta.json();
      setProdutos(dados); // Armazena o array recebido no estado local
    } catch (error) {
      console.error("Erro ao buscar dados do servidor:", error);
      Alert.alert("Erro de Conexão", "Não foi possível sincronizar o estoque com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  // --- HOOK (Ciclo de Vida): Executa a busca imediatamente após a montagem da tela ---
  useEffect(() => {
    buscarEstoque();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>
      
      {/* Formulário de Cadastro de Insumos */}
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

        <TouchableOpacity testID="btn-cadastrar" style={styles.button}>
          <Text style={styles.buttonText}>Cadastrar Insumo</Text>
        </TouchableOpacity>
      </View>

      {/* Seção: Título e Lista de Rolagem */}
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
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemQtd}>Qtd: {item.quantidade}</Text>
            </View>
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