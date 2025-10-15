// import { int, sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { mysqlTable, text, varchar, int, datetime } from "drizzle-orm/mysql-core";

export const notesTable = mysqlTable("notes_table", {
  id: int().primaryKey().autoincrement().notNull(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  // createdAt: datetime().defaultNow().notNull()
});
