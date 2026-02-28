import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmprestimos } from '../contexts/EmprestimosContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X } from 'lucide-react';

interface FormularioSaidaProps {
  onFechar: () => void;
}

export function FormularioSaida({ onFechar }: FormularioSaidaProps) {
  const { user } = useAuth();
  const { adicionarEmprestimo } = useEmprestimos();
  
  const [materialSolicitado, setMaterialSolicitado] = useState('');
  const [categoria, setCategoria] = useState<'mecanico' | 'eletrico'>('mecanico');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [nomeFuncionario, setNomeFuncionario] = useState('');
  const [matricula, setMatricula] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    adicionarEmprestimo({
      materialSolicitado,
      categoria,
      data,
      nomeFuncionario,
      matricula,
      responsavelEntrega: user!.nome,
      responsavelEntregaId: user!.id,
    });
    
    onFechar();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Nova Saída de Ferramenta</CardTitle>
              <CardDescription>
                Registre a entrega de uma ferramenta para um funcionário
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onFechar}>
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="material">Material Solicitado *</Label>
              <Input
                id="material"
                placeholder="Ex: Furadeira, Alicate, Multímetro..."
                value={materialSolicitado}
                onChange={(e) => setMaterialSolicitado(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={categoria}
                onValueChange={(value) => setCategoria(value as 'mecanico' | 'eletrico')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mecanico">Mecânico</SelectItem>
                  <SelectItem value="eletrico">Elétrico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeFuncionario">Nome do Funcionário *</Label>
                <Input
                  id="nomeFuncionario"
                  placeholder="Ex: João Silva"
                  value={nomeFuncionario}
                  onChange={(e) => setNomeFuncionario(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula do Funcionário *</Label>
              <Input
                id="matricula"
                placeholder="Ex: 1001"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                required
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="text-sm text-gray-600">Responsável pelo Atendimento</Label>
              <p className="mt-1 font-medium">{user?.nome}</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onFechar} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Registrar Saída
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}