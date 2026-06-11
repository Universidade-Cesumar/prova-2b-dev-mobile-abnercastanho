import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function App() {
  // Estados para controlar o texto dos inputs do formulário
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>
      
      {/* Formulário de Cadastro de Insumos - Sprint 1 */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#005b96' },
  formContext: { backgroundColor: '#f1f1f1', padding: 15, borderRadius: 8, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 12, fontSize: 15 },
  button: { backgroundColor: '#013a63', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});