const BASE_URL = "https://jlp.yahooapis.jp/";

export type KouseiRequestBody = {
  id: string;
  jsonrpc: "2.0";
  method: "jlp.kouseiservice.kousei";
  params: {
    q: string;
  };
};

export type KouseiResponse = {
  id: string;
  jsonrpc: "2.0";
  result: {
    suggestions: {
      length: number;
      note: string;
      offset: number;
      rule: string;
      suggestion: string;
      word: string;
    }[];
  };
};

export const yahooKousei = async (text: string, appid: string): Promise<KouseiResponse> => {
  const url = `${BASE_URL}/KouseiService/V2/kousei?appid=${appid}`;
  const body = {
    id: "japanese-analyzer",
    jsonrpc: "2.0",
    method: "jlp.kouseiservice.kousei",
    params: {
      q: text,
    },
  } satisfies KouseiRequestBody;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // @ts-ignore
  return res.json();
};

/**
 * format suggestions to markdown text for Discord
 * @param originalText
 * @param suggestions
 * @returns
 *
 * output format
 *
 * rule
 * 補足: note
 * ```diff
 * + before
 * - after
 * ```
 */
export const formatSuggestions = (
  originalText: string,
  suggestions: KouseiResponse["result"]["suggestions"],
): string => {
  return `> ${originalText}\n${suggestions
    .map(
      (s) =>
        `\`\`\`diff\n${s.rule}${s.note && `\n補足: ${s.note}`}\n- ${s.word}\n+ ${
          s.suggestion
        }\`\`\``,
    )
    .join("")}`;
};
