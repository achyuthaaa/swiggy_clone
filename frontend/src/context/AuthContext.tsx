import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { login as loginApi } from '../services/api';

type AuthContextType = {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start, try to restore a saved token.
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('@token');
        setUserToken(token);
      } catch (e) {
        console.warn('Failed to restore token', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
console.log("JEJEJJEEJ")
  const signIn = async (token: string) => {
    try {
        console.log("HEHEHEHE")
      setIsLoading(true);
    //   const token = await loginApi(email, password);
      console.log("TOKENNNN",token)
      await AsyncStorage.setItem('@token', JSON.stringify(token));
      setUserToken(token);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Login failed', e?.response?.data?.error ?? 'Please check your credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('@token');
      setUserToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(() => ({ userToken, isLoading, signIn, signOut }), [userToken, isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
