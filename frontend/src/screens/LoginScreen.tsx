import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '../services/api'; // ✅ backend API
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
  try {
    console.log('Attempting login with:', email, password);
    
    const data = await login(email, password);
    console.log('Login response data:', data);
    
    if (data && data.token) {
      signIn(data.token);
      console.log('Login successful, token saved');
    } else {
      Alert.alert('Login Failed', 'No token received from server');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error message:', error.message);
    
    // Better error message for debugging
    if (error.response?.data?.error) {
      Alert.alert('Login Failed', error.response.data.error);
    } else if (error.message) {
      Alert.alert('Login Failed', error.message);
    } else {
      Alert.alert('Login Failed', 'An unexpected error occurred');
    }
  }
};

  return (
    <View style={s.container}>
      <Text style={s.title}>Login</Text>

      <TextInput
        style={s.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={s.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={isLoading ? 'Please wait…' : 'Sign in'}
        onPress={handleLogin}
      />

      {/* 👇 Signup navigation link */}
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={s.linkText}>Don’t have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  linkText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#007BFF',
    fontWeight: '600',
  },
});