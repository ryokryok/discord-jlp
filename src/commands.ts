import {
  ApplicationCommandOptionType,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const KOUSEI_COMMAND = {
  name: "kousei",
  description: "日本語文の校正作業を支援します。",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "text",
      description: "校正したいテキストを入力します",
      required: true,
      autocomplete: false,
    },
  ],
} satisfies RESTPostAPIApplicationCommandsJSONBody;
