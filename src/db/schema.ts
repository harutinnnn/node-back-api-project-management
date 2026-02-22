import {mysqlTable, serial, int, varchar, timestamp, text} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: int('id').autoincrement().primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    email: varchar("email", {length: 255}).notNull().unique(),
    password: varchar("password", {length: 255}).notNull(),
    refreshToken: varchar("refresh_token", {length: 255}),
    createdAt: timestamp("created_at").defaultNow(),
});


export const projects = mysqlTable("projects", {
    id: int('id').autoincrement().primaryKey(),
    title: varchar("title", {length: 255}).notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const projectMembers = mysqlTable("projectMembers", {
    id: int('id').autoincrement().primaryKey(),
    projectId: int('projectId').notNull().references(() => projects.id),
    userId: int('userId').notNull().references(() => users.id),
})





