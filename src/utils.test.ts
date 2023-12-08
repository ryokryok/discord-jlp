import { afterAll, afterEach, beforeAll, describe, test, expect } from "vitest";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import { KouseiResponse, yahooKousei } from "./utils";

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

describe("yahooKousei", async () => {
  const APP_ID = "yahooApp";
  test("expected that return KouseiResponse", async () => {
    const result = await yahooKousei("セキュリティー,食べれる", APP_ID);
    expect(result).toEqual(MockKouseiResponse);
  });
});
