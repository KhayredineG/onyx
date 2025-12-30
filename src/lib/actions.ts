"use server";

import { db } from "@/db";
import { prompts, promptVersions, tags, promptsToTags } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPrompts() {
    return await db.query.prompts.findMany({
        with: {
            versions: {
                orderBy: [desc(promptVersions.createdAt)],
                limit: 1,
            },
        },
        orderBy: [desc(prompts.updatedAt)],
    });
}

export async function createPrompt(title: string, content: string) {
    const [newPrompt] = await db.insert(prompts).values({ title, content }).returning();

    await db.insert(promptVersions).values({
        promptId: newPrompt.id,
        snapshotContent: content,
    });

    revalidatePath("/");
    return newPrompt;
}

export async function updatePrompt(id: number, content: string, title?: string) {
    const updates: any = { content, updatedAt: new Date() };
    if (title) updates.title = title;

    const [updated] = await db.update(prompts)
        .set(updates)
        .where(eq(prompts.id, id))
        .returning();

    await db.insert(promptVersions).values({
        promptId: id,
        snapshotContent: content,
    });

    revalidatePath("/");
    return updated;
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
