import {
  APIInteraction,
  APIInteractionResponse,
  APIInteractionResponsePong,
  ApplicationCommandOptionType,
  InteractionResponseType,
  InteractionType,
} from "discord-api-types/v10";
import { verifyKey } from "discord-interactions";
import { Hono, MiddlewareHandler } from "hono";
import { KOUSEI_COMMAND } from "./commands";
import { formatSuggestions, yahooKousei } from "./utils";

type Env = {
  DISCORD_PUBLIC_KEY: string;
  DISCORD_APPLICATION_ID: string;
  YAHOO_APP_ID: string;
};

const app = new Hono<{ Bindings: Env }>();

const verifyKeyMiddleware = (): MiddlewareHandler<{ Bindings: Env }> => async (c, next) => {
  const signature = c.req.header("X-Signature-Ed25519");
  const timestamp = c.req.header("X-Signature-Timestamp");
  const body = await c.req.raw.clone().text();
  const isValidRequest =
    signature && timestamp && verifyKey(body, signature, timestamp, c.env.DISCORD_PUBLIC_KEY);
  if (!isValidRequest) {
    console.log("Invalid request signature");
    return c.text("Bad request signature", 401);
  }
  return await next();
};

app.get("/", (c) => c.text("Hello Hono!"));

app.post("/api/interactions", verifyKeyMiddleware(), async (c) => {
  const message = await c.req.json<APIInteraction>();
  if (message.type === InteractionType.Ping) {
    // The `PING` message is used during the initial webhook handshake, and is
    // required to configure the webhook in the developer portal.
    console.log("Handling Ping request");
    return c.json<APIInteractionResponsePong>({ type: InteractionResponseType.Pong });
  }

  if (message.type === InteractionType.ApplicationCommand) {
    // Most user commands will come as `APPLICATION_COMMAND`.
    switch (message.data.name.toLowerCase()) {
      //APIChatInputApplicationCommandInteractionData
      case KOUSEI_COMMAND.name.toLowerCase(): {
        if ("options" in message.data) {
          const option = message.data.options?.at(0);
          if (option?.type === ApplicationCommandOptionType.String && option.value) {
            const { result } = await yahooKousei(option.value, c.env.YAHOO_APP_ID);
            return c.json<APIInteractionResponse>({
              type: InteractionResponseType.ChannelMessageWithSource,
              data: {
                content: formatSuggestions(option.value, result.suggestions),
              },
            });
          }
        }
        console.error("Cannot get value from command");
        return c.json({ error: "Unknown Value" }, 400);
      }

      default:
        console.error("Unknown Command");
        return c.json({ error: "Unknown Type" }, 400);
    }
  }

  console.error("Unknown Type");
  return c.json({ error: "Unknown Type" }, 400);
});

export default app;
