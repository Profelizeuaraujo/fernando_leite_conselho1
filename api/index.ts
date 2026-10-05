import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../src/db/index.js";
import { users, turmas, students, classifications, observations, forwardings } from "../src/db/schema.js";
import { eq, and } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-local-dev";

export interface AuthRequest extends Request {
  user?: any;
}

const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const app = express();

app.use(cors());
app.use(express.json());

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userList = await db.select().from(users).where(eq(users.username, username));
    const user = userList[0];

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user.id, username: user.username, name: user.name } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Users
app.get("/api/users", requireAuth, async (req, res) => {
  try {
    const allUsers = await db.select({ id: users.id, username: users.username, name: users.name }).from(users);
    res.json(allUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", requireAuth, async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await db.insert(users).values({ username, passwordHash, name }).returning({ id: users.id, username: users.username, name: users.name });
    res.json(newUser[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (req.user.id === id) {
      return res.status(400).json({ error: "Não é possível excluir a própria conta." });
    }

    const userToDelete = await db.select().from(users).where(eq(users.id, id));
    if (userToDelete.length > 0 && userToDelete[0].username === 'GestaoFLC') {
      return res.status(400).json({ error: "A conta principal de gestão (GestaoFLC) não pode ser excluída." });
    }

    await db.delete(users).where(eq(users.id, id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Data (Principal)
app.get("/api/data", requireAuth, async (req, res) => {
  try {
    const allTurmas = await db.select().from(turmas);
    const allStudents = await db.select().from(students);
    const allClassifications = await db.select().from(classifications);
    const allObservations = await db.select().from(observations);
    const allForwardings = await db.select().from(forwardings);

    res.json({
      turmas: allTurmas,
      students: allStudents,
      classifications: allClassifications,
      observations: allObservations,
      forwardings: allForwardings
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Turmas
app.post("/api/turmas", requireAuth, async (req, res) => {
  try {
    const newTurma = await db.insert(turmas).values(req.body).returning();
    res.json(newTurma[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/turmas/:id", requireAuth, async (req, res) => {
  try {
    await db.delete(turmas).where(eq(turmas.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Students
app.post("/api/students", requireAuth, async (req, res) => {
  try {
    const newStudent = await db.insert(students).values(req.body).returning();
    res.json(newStudent[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/students/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(classifications).where(eq(classifications.studentId, id));
    await db.delete(observations).where(eq(observations.studentId, id));
    await db.delete(forwardings).where(eq(forwardings.studentId, id));
    await db.delete(students).where(eq(students.id, id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Classifications
app.post("/api/students/:id/classifications", requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const { classId } = req.body;

    const existing = await db.select().from(classifications).where(and(
      eq(classifications.studentId, studentId),
      eq(classifications.classId, classId)
    ));

    if (existing.length > 0) {
      await db.delete(classifications).where(eq(classifications.id, existing[0].id));
      res.json({ action: "removed", classId });
    } else {
      await db.insert(classifications).values({ studentId, classId });
      res.json({ action: "added", classId });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Observações
app.post("/api/students/:id/observacoes", requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const { texto } = req.body;
    const obs = await db.insert(observations).values({ studentId, texto }).returning();
    res.json(obs[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/observacoes/:id", requireAuth, async (req, res) => {
  try {
    await db.delete(observations).where(eq(observations.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Encaminhamentos
app.post("/api/students/:id/encaminhamentos", requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const { texto } = req.body;
    const enc = await db.insert(forwardings).values({ studentId, texto }).returning();
    res.json(enc[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/encaminhamentos/:id", requireAuth, async (req, res) => {
  try {
    await db.delete(forwardings).where(eq(forwardings.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
