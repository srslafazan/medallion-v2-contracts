import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-watcher";

const config: HardhatUserConfig = {
  solidity: "0.8.26",
  networks: {
    hardhat: {
      loggingEnabled: process.env.LOG_LEVEL === "debug", // Enables detailed logging on the Hardhat network
    },
  },
  // @ts-ignore - We're extending the type definition here
  watcher: {
    test: {
      tasks: ["test"],
      files: ["./contracts", "./test"],
      verbose: process.env.LOG_LEVEL === "debug",
      clearOnStart: true,
    },
    compilation: {
      tasks: ["compile"],
      files: ["./contracts"],
      ignoredFiles: ["**/.vscode"],
      verbose: true,
      clearOnStart: true,
    },
    ci: {
      tasks: [
        "clean",
        { command: "compile", params: { quiet: true } },
        {
          command: "test",
          params: { noCompile: true, testFiles: ["testfile.ts"] },
        },
      ],
    },
  },
};

export default config;
