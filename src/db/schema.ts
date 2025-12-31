import { sql, relations } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const prompts = sqliteTable("prompts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    author: text("author").default("System"),
    isArchived: integer("is_archived", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const promptsRelations = relations(prompts, ({ many }) => ({
    versions: many(promptVersions),
    promptsToTags: many(promptsToTags),
}));

export const tags = sqliteTable("tags", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
    promptsToTags: many(promptsToTags),
}));

export const promptsToTags = sqliteTable("prompts_to_tags", {
    promptId: integer("prompt_id")
        .notNull()
        .references(() => prompts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
        .notNull()
        .references(() => tags.id, { onDelete: "cascade" }),
});

export const promptsToTagsRelations = relations(promptsToTags, ({ one }) => ({
    prompt: one(prompts, {
        fields: [promptsToTags.promptId],
        references: [prompts.id],
    }),
    tag: one(tags, {
        fields: [promptsToTags.tagId],
        references: [tags.id],
    }),
}));

export const promptVersions = sqliteTable("prompt_versions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    promptId: integer("prompt_id")
        .notNull()
        .references(() => prompts.id, { onDelete: "cascade" }),
    snapshotContent: text("snapshot_content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const promptVersionsRelations = relations(promptVersions, ({ one }) => ({
    prompt: one(prompts, {
        fields: [promptVersions.promptId],
        references: [prompts.id],
    }),
}));
