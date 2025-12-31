import { Request, Response } from "express";
import prisma from "../db/prisma";
import { generateReply } from "../services/llm.service";

const MAX_MESSAGE_LENGTH = 1000;
const HISTORY_LIMIT = 10;

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export const postMessage = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    // --- Validation ---
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: "Message is too long" });
    }

    // --- Conversation handling ---
    let conversationId = sessionId;

    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: {}
      });
      conversationId = conversation.id;
    }

    // --- Save user message ---
    await prisma.message.create({
      data: {
        conversationId,
        sender: "user",
        text: message.trim()
      }
    });

    // --- Fetch recent history ---
    const previousMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: HISTORY_LIMIT
    });

    const history: HistoryMessage[] = previousMessages.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    }));

    // --- Generate AI reply ---
    const reply = await generateReply(history, message.trim());

    // --- Save AI reply ---
    await prisma.message.create({
      data: {
        conversationId,
        sender: "ai",
        text: reply
      }
    });

    return res.json({
      reply,
      sessionId: conversationId
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
};
