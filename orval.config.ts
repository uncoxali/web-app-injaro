import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "https://api.injaro.info/swagger/?format=openapi",
    },
    output: {
      target: "./src/lib/api/generated.ts",
      client: "react-query",
      baseUrl: "https://api.injaro.info",
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
});
