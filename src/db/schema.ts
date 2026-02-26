import {mysqlTable, serial, unique, int, varchar, timestamp, text, foreignKey, mysqlEnum} from "drizzle-orm/mysql-core";
import {UserRoles} from "../enums/UserRoles";
import {Gender} from "../enums/Gender";
import {Statuses} from "../enums/Statuses";

export const company = mysqlTable("company", {
    id: int('id').autoincrement().primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    address: varchar("address", {length: 255}),
    description: text("description"),
    logo: varchar("logo", {length: 255}),
    createdAt: timestamp("created_at").defaultNow(),
});

export const users = mysqlTable("users", {
    id: int('id').autoincrement().primaryKey(),
    companyId: int('companyId').references(() => company.id),
    professionId: int('professionId').references(() => professions.id),
    name: varchar("name", {length: 255}).notNull(),
    email: varchar("email", {length: 255}).notNull().unique(),
    phone: varchar("phone", {length: 255}).notNull(),
    password: varchar("password", {length: 255}).notNull(),
    refreshToken: varchar("refresh_token", {length: 255}),
    avatar: varchar("avatar", {length: 255}),
    gender: mysqlEnum('gender', [Gender.MALE, Gender.FEMALE, Gender.UNKNOWN]).notNull().default(Gender.UNKNOWN),
    role: mysqlEnum('role', [UserRoles.ADMIN, UserRoles.USER]).notNull().default(UserRoles.USER),
    status: mysqlEnum('status', [Statuses.PENDING, Statuses.PUBLISHED, Statuses.BLOCKED,Statuses.NOT_ACTIVATED]).notNull().default(Statuses.NOT_ACTIVATED),
    activationToken:varchar('activationToken',{length: 255}),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    projectFk: foreignKey({
        columns: [table.companyId],
        foreignColumns: [company.id],
    }).onDelete("cascade"),
    professionIdFk: foreignKey({
        columns: [table.professionId],
        foreignColumns: [professions.id],
    }).onDelete("cascade"),
}));


export const projects = mysqlTable("projects", {
    id: int('id').autoincrement().primaryKey(),
    companyId: int('id').references(() => company.id),
    title: varchar("title", {length: 255}).notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    companyFk: foreignKey({
        columns: [table.companyId],
        foreignColumns: [company.id],
    }).onDelete("cascade"),
}));

export const projectMembers = mysqlTable("projectMembers", {
    id: int('id').autoincrement().primaryKey(),
    projectId: int('projectId').notNull().references(() => projects.id),
    userId: int('userId').notNull().references(() => users.id),
}, (table) => ({
    projectFk: foreignKey({
        columns: [table.projectId],
        foreignColumns: [projects.id],
    }).onDelete("cascade"),
    userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete("cascade")
}))


export const tasks = mysqlTable("tasks", {
    id: int('id').autoincrement().primaryKey(),
    title: varchar("title", {length: 255}).notNull(),
    projectId: int().notNull(),
    status: mysqlEnum('status', ['pending', 'doing', 'for_check', 'finished']).notNull().default('pending'),
    priority: mysqlEnum('priority', ['urgent', 'high', 'medium', 'low']).notNull().default('medium'),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    projectFk: foreignKey({
        columns: [table.projectId],
        foreignColumns: [projects.id],
    }).onDelete("cascade")
}));

export const taskFiles = mysqlTable("taskFiles", {
    id: int('id').autoincrement().primaryKey(),
    taskId: int().notNull(),
    file: varchar("file", {length: 255}).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    taskFk: foreignKey({
        columns: [table.taskId],
        foreignColumns: [tasks.id],
    }).onDelete("cascade")
}));


export const taskMembers = mysqlTable("taskMembers", {
    id: int('id').autoincrement().primaryKey(),
    taskId: int('taskId').notNull().references(() => tasks.id),
    userId: int('userId').notNull().references(() => users.id),
}, (table) => ({
    taskFk: foreignKey({
        columns: [table.taskId],
        foreignColumns: [tasks.id],
    }).onDelete("cascade"),
    userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete("cascade")
}))

export const skills = mysqlTable("skills", {
    id: int('id').autoincrement().primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    companyId: int('companyId').notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
        uniqueCompanySkill: unique("skills_company_name_unique").on(
            table.name,
            table.companyId
        ),
        companyFk: foreignKey({
            columns: [table.companyId],
            foreignColumns: [company.id],
        }).onDelete("cascade"),

    }
));


export const memberSkills = mysqlTable("memberSkills", {
    memberId: int().notNull(),
    skillId: int().notNull()
}, (table) => ({
    memberFk: foreignKey({
        columns: [table.memberId],
        foreignColumns: [users.id],
    }).onDelete("cascade"),
    skillFk: foreignKey({
        columns: [table.skillId],
        foreignColumns: [skills.id],
    }).onDelete("cascade")
}));


export const professions = mysqlTable("professions", {
    id: int('id').autoincrement().primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    companyId: int().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    projectFk: foreignKey({
        columns: [table.companyId],
        foreignColumns: [company.id],
    }).onDelete("cascade"),
    uniqueCompanyProfession: unique("professions_company_name_unique").on(
        table.name,
        table.companyId
    ),
}));






