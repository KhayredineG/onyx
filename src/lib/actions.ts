"use server";

import { db } from "@/db";
import { prompts, promptVersions, tags, promptsToTags } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPrompts() {
    const allPrompts = await db.query.prompts.findMany({
        with: {
            versions: {
                orderBy: [desc(promptVersions.createdAt)],
                limit: 1,
            },
            promptsToTags: {
                with: {
                    tag: true,
                },
            },
        },
        orderBy: [desc(prompts.updatedAt)],
    });

    return allPrompts.map((p) => ({
        ...p,
        tags: p.promptsToTags.map((pt) => pt.tag.name),
        isArchived: p.isArchived,
    }));
}

export async function createPrompt(title: string, content: string, author: string = "System") {
    const [newPrompt] = await db.insert(prompts).values({ title, content, author }).returning();

    await db.insert(promptVersions).values({
        promptId: newPrompt.id,
        snapshotContent: content,
    });

    revalidatePath("/");
    return newPrompt;
}

export async function updatePrompt(id: number, content: string, title?: string, author?: string) {
    try {
        const updates: any = { content, updatedAt: new Date() };
        if (title) updates.title = title;
        if (author) updates.author = author;

        const [updated] = await db.update(prompts)
            .set(updates)
            .where(eq(prompts.id, id))
            .returning();

        if (!updated) {
            throw new Error("Prompt not found or update failed");
        }

        await db.insert(promptVersions).values({
            promptId: id,
            snapshotContent: content,
        });

        revalidatePath("/");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Failed to update prompt:", error);
        return { success: false, error: error.message };
    }
}

export async function deletePrompt(id: number) {
    await db.delete(prompts).where(eq(prompts.id, id));
    revalidatePath("/");
}

export async function getPromptVersions(promptId: number) {
    return await db.query.promptVersions.findMany({
        where: eq(promptVersions.promptId, promptId),
        orderBy: [desc(promptVersions.createdAt)],
    });
}

export async function getTags() {
    return await db.query.tags.findMany({
        orderBy: [desc(tags.name)],
    });
}

export async function addTagToPrompt(promptId: number, tagName: string) {
    let tag = await db.query.tags.findFirst({
        where: eq(tags.name, tagName),
    });

    if (!tag) {
        const [newTag] = await db.insert(tags).values({ name: tagName }).returning();
        tag = newTag;
    }

    try {
        await db.insert(promptsToTags).values({
            promptId,
            tagId: tag.id,
        });
    } catch (e) {
        // Ignore duplicate key errors if tag already linked
    }

    revalidatePath("/");
}

export async function removeTagFromPrompt(promptId: number, tagName: string) {
    const tag = await db.query.tags.findFirst({
        where: eq(tags.name, tagName),
    });

    if (tag) {
        await db.delete(promptsToTags)
            .where(
                and(
                    eq(promptsToTags.promptId, promptId),
                    eq(promptsToTags.tagId, tag.id)
                )
            );
    }

    revalidatePath("/");
}

export async function toggleArchivePrompt(id: number, currentStatus: boolean) {
    await db.update(prompts)
        .set({ isArchived: !currentStatus })
        .where(eq(prompts.id, id));

    revalidatePath("/");
}
