import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import {
  createMcpHandler,
  McpServer,
} from "npm:@modelcontextprotocol/server@^2.0.0";
import { z } from "npm:zod@^4.3.6";
import { listArticles } from "./application/list-articles.ts";
import { getArticle } from "./application/get-article.ts";
import { searchArticles } from "./application/search-articles.ts";
import { createArticle } from "./application/create-article.ts";
import { updateArticle } from "./application/update-article.ts";
import { deleteArticle } from "./application/delete-article.ts";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

const articleInput = z.object({
  title: z.string().trim().min(1).max(500),
  content: z.string().trim().min(1).max(100_000),
});

const articleIdInput = z.object({
  id: z.number().int().positive(),
});

function jsonResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value) }],
  };
}

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(corsHeaders)) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function isAuthorized(req: Request): boolean {
  const expectedToken = Deno.env.get("KNOWLEDGE_MCP_TOKEN");
  const authorization = req.headers.get("authorization");

  if (!expectedToken || !authorization?.startsWith("Bearer ")) {
    return false;
  }

  return secretsMatch(authorization.slice("Bearer ".length), expectedToken);
}

function secretsMatch(received: string, expected: string): boolean {
  const receivedBytes = new TextEncoder().encode(received);
  const expectedBytes = new TextEncoder().encode(expected);

  if (receivedBytes.length !== expectedBytes.length) return false;

  let difference = 0;
  for (let index = 0; index < expectedBytes.length; index += 1) {
    difference |= receivedBytes[index] ^ expectedBytes[index];
  }

  return difference === 0;
}

function registerArticleTools(server: McpServer): void {
  server.registerTool(
    "list_articles",
    {
      description: "List knowledge base articles without returning embeddings.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(20),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ limit }) => {
      return jsonResult(await listArticles.execute({ limit }));
    },
  );

  server.registerTool(
    "get_article",
    {
      description: "Get one knowledge base article by ID.",
      inputSchema: articleIdInput,
      annotations: { readOnlyHint: true },
    },
    async ({ id }) => {
      return jsonResult(await getArticle.execute({ id }));
    },
  );

  server.registerTool(
    "search_articles",
    {
      description:
        "Search article titles and content by keyword using case-insensitive LIKE matching.",
      inputSchema: z.object({
        query: z.string().trim().min(1).max(200),
        limit: z.number().int().min(1).max(50).default(20),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ query, limit }) => {
      return jsonResult(await searchArticles.execute({ query, limit }));
    },
  );

  server.registerTool(
    "create_article",
    {
      description: "Create a knowledge base article.",
      inputSchema: articleInput,
    },
    async ({ title, content }) => {
      return jsonResult(await createArticle.execute({ title, content }));
    },
  );

  server.registerTool(
    "update_article",
    {
      description: "Update an article by ID.",
      inputSchema: articleIdInput.extend({
        title: z.string().trim().min(1).max(500).optional(),
        content: z.string().trim().min(1).max(100_000).optional(),
      }).refine(
        (input) => input.title !== undefined || input.content !== undefined,
        "At least title or content must be provided",
      ),
    },
    async ({ id, title, content }) => {
      return jsonResult(await updateArticle.execute({ id, title, content }));
    },
  );

  server.registerTool(
    "delete_article",
    {
      description: "Delete a knowledge base article by ID.",
      inputSchema: articleIdInput,
    },
    async ({ id }) => {
      return jsonResult(await deleteArticle.execute({ id }));
    },
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!Deno.env.get("KNOWLEDGE_MCP_TOKEN")) {
    return errorResponse("KNOWLEDGE_MCP_TOKEN is not set", 500);
  }

  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "WWW-Authenticate": "Bearer",
      },
    });
  }

  try {
    const handler = createMcpHandler(() => {
      const server = new McpServer({
        name: "knowledge-base",
        version: "0.1.0",
      });

      registerArticleTools(server);
      return server;
    });

    return withCors(await handler.fetch(req));
  } catch (error) {
    console.error("Knowledge MCP request failed:", error);
    return errorResponse(
      error instanceof Error ? error.message : "MCP request failed",
      500,
    );
  }
});
