import { mysqlTable, serial, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: int('id').autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    refreshToken: varchar("refresh_token", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
});
