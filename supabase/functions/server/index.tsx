import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e214d17d/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== ROTAS DE MATERIAIS ====================

// GET todos os materiais
app.get("/make-server-e214d17d/materiais", async (c) => {
  try {
    const materiais = await kv.getByPrefix("material:");
    return c.json(materiais || []);
  } catch (error) {
    console.error("Erro ao buscar materiais:", error);
    return c.json({ error: "Erro ao buscar materiais" }, 500);
  }
});

// POST criar novo material
app.post("/make-server-e214d17d/materiais", async (c) => {
  try {
    const body = await c.req.json();
    const { nome, categoria, quantidade } = body;

    if (!nome || !categoria || quantidade === undefined) {
      return c.json({ error: "Campos obrigatórios: nome, categoria, quantidade" }, 400);
    }

    const id = `material:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const material = {
      id,
      nome,
      categoria,
      quantidade: Number(quantidade),
      dataRegistro: new Date().toISOString(),
    };

    await kv.set(id, material);
    return c.json(material, 201);
  } catch (error) {
    console.error("Erro ao criar material:", error);
    return c.json({ error: "Erro ao criar material" }, 500);
  }
});

// PATCH atualizar quantidade de um material
app.patch("/make-server-e214d17d/materiais/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log("PATCH /materiais/:id - ID recebido:", id);
    
    const body = await c.req.json();
    console.log("PATCH /materiais/:id - Body:", body);
    const { quantidade } = body;

    if (quantidade === undefined) {
      console.error("PATCH /materiais/:id - Quantidade não fornecida");
      return c.json({ error: "Campo obrigatório: quantidade" }, 400);
    }

    const material = await kv.get(id);
    console.log("PATCH /materiais/:id - Material encontrado:", material);
    
    if (!material) {
      console.error("PATCH /materiais/:id - Material não encontrado:", id);
      return c.json({ error: "Material não encontrado" }, 404);
    }

    const materialAtualizado = {
      ...material,
      quantidade: Number(quantidade),
    };

    console.log("PATCH /materiais/:id - Salvando material atualizado:", materialAtualizado);
    await kv.set(id, materialAtualizado);
    
    console.log("PATCH /materiais/:id - Material atualizado com sucesso");
    return c.json(materialAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar material:", error);
    return c.json({ error: "Erro ao atualizar material" }, 500);
  }
});

// DELETE excluir um material
app.delete("/make-server-e214d17d/materiais/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const material = await kv.get(id);
    if (!material) {
      return c.json({ error: "Material não encontrado" }, 404);
    }

    await kv.del(id);
    return c.json({ message: "Material excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir material:", error);
    return c.json({ error: "Erro ao excluir material" }, 500);
  }
});

// ==================== ROTAS DE EMPRÉSTIMOS ====================

// GET todos os empréstimos
app.get("/make-server-e214d17d/emprestimos", async (c) => {
  try {
    console.log("GET /emprestimos - Buscando empréstimos");
    const emprestimos = await kv.getByPrefix("emprestimo:");
    console.log("GET /emprestimos - Empréstimos encontrados:", emprestimos?.length || 0);
    return c.json(emprestimos || []);
  } catch (error) {
    console.error("Erro ao buscar empréstimos:", error);
    return c.json({ error: "Erro ao buscar empréstimos" }, 500);
  }
});

// POST criar novo empréstimo
app.post("/make-server-e214d17d/emprestimos", async (c) => {
  try {
    const body = await c.req.json();
    console.log("POST /emprestimos - Body recebido:", body);
    
    const {
      materialSolicitado,
      categoria,
      data,
      nomeFuncionario,
      matricula,
      responsavelEntrega,
      responsavelEntregaId,
    } = body;

    if (!materialSolicitado || !categoria || !data || !nomeFuncionario || !matricula || !responsavelEntrega || !responsavelEntregaId) {
      console.error("POST /emprestimos - Campos obrigatórios faltando");
      return c.json({ error: "Campos obrigatórios faltando" }, 400);
    }

    const id = `emprestimo:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const emprestimo = {
      id,
      materialSolicitado,
      categoria,
      data,
      nomeFuncionario,
      matricula,
      responsavelEntrega,
      responsavelEntregaId,
      status: 'pendente',
      dataRegistro: new Date().toISOString(),
    };

    console.log("POST /emprestimos - Salvando empréstimo:", emprestimo);
    await kv.set(id, emprestimo);
    console.log("POST /emprestimos - Empréstimo salvo com sucesso");
    
    return c.json(emprestimo, 201);
  } catch (error) {
    console.error("Erro ao criar empréstimo:", error);
    return c.json({ error: "Erro ao criar empréstimo" }, 500);
  }
});

// PATCH marcar empréstimo como devolvido
app.patch("/make-server-e214d17d/emprestimos/:id/devolver", async (c) => {
  try {
    const id = c.req.param("id");
    console.log("PATCH /emprestimos/:id/devolver - ID:", id);
    
    const body = await c.req.json();
    console.log("PATCH /emprestimos/:id/devolver - Body:", body);
    
    const { responsavelDevolucao, responsavelDevolucaoId } = body;

    if (!responsavelDevolucao || !responsavelDevolucaoId) {
      console.error("PATCH /emprestimos/:id/devolver - Campos obrigatórios faltando");
      return c.json({ error: "Campos obrigatórios: responsavelDevolucao, responsavelDevolucaoId" }, 400);
    }

    const emprestimo = await kv.get(id);
    console.log("PATCH /emprestimos/:id/devolver - Empréstimo encontrado:", emprestimo);
    
    if (!emprestimo) {
      console.error("PATCH /emprestimos/:id/devolver - Empréstimo não encontrado");
      return c.json({ error: "Empréstimo não encontrado" }, 404);
    }

    const emprestimoAtualizado = {
      ...emprestimo,
      status: 'devolvido',
      dataDevolucao: new Date().toISOString(),
      responsavelDevolucao,
      responsavelDevolucaoId,
    };

    console.log("PATCH /emprestimos/:id/devolver - Salvando empréstimo atualizado:", emprestimoAtualizado);
    await kv.set(id, emprestimoAtualizado);
    console.log("PATCH /emprestimos/:id/devolver - Empréstimo atualizado com sucesso");
    
    return c.json(emprestimoAtualizado);
  } catch (error) {
    console.error("Erro ao marcar empréstimo como devolvido:", error);
    return c.json({ error: "Erro ao marcar empréstimo como devolvido" }, 500);
  }
});

Deno.serve(app.fetch);