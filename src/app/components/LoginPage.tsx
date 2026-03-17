import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Package, Loader2 } from 'lucide-react';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');
  
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const { login, cadastrar } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    
    if (isLogin) {
      // Fluxo de Login com Supabase
      const { error } = await login(matricula, senha);
      if (error) setErro(error);
    } else {
      // Fluxo de Cadastro com Supabase
      if (senha.length < 6) {
        setErro('O Supabase exige que a senha tenha pelo menos 6 caracteres.');
        setCarregando(false);
        return;
      }

      const { error } = await cadastrar(nome, matricula, senha);
      if (error) {
        setErro(error);
      }
      // Se não houver erro, o Supabase já fará o login automático e mudará a tela
    }
    
    setCarregando(false);
  };

  const alternarModo = () => {
    setIsLogin(!isLogin);
    setErro('');
    setNome('');
    setMatricula('');
    setSenha('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Package className="size-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Sistema de Pedidos</CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Faça login com sua matrícula para acessar' 
              : 'Crie sua conta para solicitar materiais'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Ex: Guilherme Calixto"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                type="text"
                placeholder="Ex: 12345"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value.trim())} // O trim remove espaços em branco sem querer
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            {erro && (
              <Alert variant="destructive">
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={carregando}>
              {carregando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aguarde...
                </>
              ) : (
                isLogin ? 'Entrar' : 'Cadastrar'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? (
              <p>
                Não tem uma conta?{' '}
                <button type="button" onClick={alternarModo} className="text-blue-600 font-semibold hover:underline">
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p>
                Já tem uma conta?{' '}
                <button type="button" onClick={alternarModo} className="text-blue-600 font-semibold hover:underline">
                  Faça login
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}