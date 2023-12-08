import { afterAll, afterEach, beforeAll, describe, test, expect } from "vitest";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import { KouseiResponse, formatSuggestions, yahooKousei } from "./utils";

const MockKouseiResponse = {
  id: "1234-1",
  jsonrpc: "2.0",
  result: {
    suggestions: [
      {
        length: 7,
        note: "語末が-tyだが昨今のネット上の慣習に準ず",
        offset: 0,
        rule: "用字",
        suggestion: "セキュリティ",
        word: "セキュリティー",
      },
      {
        length: 4,
        note: "",
        offset: 8,
        rule: "ら抜き",
        suggestion: "食べられる",
        word: "食べれる",
      },
    ],
  },
} satisfies KouseiResponse;

const restHandlers = [
  http.post("https://jlp.yahooapis.jp//KouseiService/V2/kousei?appid=yahooApp", () => {
    return HttpResponse.json(MockKouseiResponse);
  }),
];

const server = setupServer(...restHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

describe("utils.ts", async () => {
  const APP_ID = "yahooApp";
  test("yahooKousei: expected that return KouseiResponse", async () => {
    const result = await yahooKousei("セキュリティー,食べれる", APP_ID);
    expect(result).toEqual(MockKouseiResponse);
  });

  test("formatSuggestions: expected that return only original text", async () => {
    const suggestions = [] satisfies KouseiResponse["result"]["suggestions"];
    const result = formatSuggestions("original text", suggestions);
    expect(result).toBe("> original text\n");
  });
  test("formatSuggestions: expected that return original text and suggestions", async () => {
    const suggestions = [
      { note: "note", rule: "rule", word: "before", offset: 0, length: 0, suggestion: "after" },
    ] satisfies KouseiResponse["result"]["suggestions"];
    const result = formatSuggestions("original text", suggestions);
    expect(result).toBe("> original text\n```diff\nrule\n補足: note\n- before\n+ after```");
  });
  test("formatSuggestions: expected that return original multiple suggestions", async () => {
    const suggestions = [
      {
        note: "note1",
        rule: "rule1",
        word: "before1",
        offset: 0,
        length: 0,
        suggestion: "after1",
      },
      {
        note: "note2",
        rule: "rule2",
        word: "before2",
        offset: 1,
        length: 1,
        suggestion: "after2",
      },
    ] satisfies KouseiResponse["result"]["suggestions"];
    const result = formatSuggestions("original text", suggestions);
    expect(result).toBe(
      "> original text\n```diff\nrule1\n補足: note1\n- before1\n+ after1``````diff\nrule2\n補足: note2\n- before2\n+ after2```",
    );
  });
});
