import { pgTable, serial, text, boolean, timestamp, integer, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
});

export const turmas = pgTable("turmas", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull().unique(),
  modalidade: varchar("modalidade", { length: 50 }).notNull(),
  turno: varchar("turno", { length: 50 }),
  curso: varchar("curso", { length: 50 }),
  serie: varchar("serie", { length: 50 }),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  cod: varchar("cod", { length: 20 }),
  nome: text("nome").notNull(),
  paed: boolean("paed").default(false).notNull(),
  turma: varchar("turma", { length: 50 }),
  turno: varchar("turno", { length: 20 }),
  serie: varchar("serie", { length: 50 }),
  curso: varchar("curso", { length: 50 }),
  modalidade: varchar("modalidade", { length: 20 }),
});

export const classifications = pgTable("classifications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  classId: varchar("class_id", { length: 50 }).notNull(),
});

export const observations = pgTable("observacoes", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  texto: text("texto").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forwardings = pgTable("encaminhamentos", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  texto: text("texto").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
