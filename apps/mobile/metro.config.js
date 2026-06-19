// metro.config.js — Expo + Bun monorepo configuration
// See: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Resolve packages from both local and workspace node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Enable symlinks so Bun workspace symlinks are followed correctly
config.resolver.unstable_enableSymlinks = true;

// 4. Force a SINGLE React instance across ALL bundles (main + every lazy
//    sub-bundle loaded by @expo/metro-runtime). extraNodeModules only covers
//    the main bundle; resolveRequest covers everything.
const localModules = path.resolve(projectRoot, "node_modules");
const FORCED_MODULES = {
  react: path.join(localModules, "react", "index.js"),
  "react-dom": path.join(localModules, "react-dom", "index.js"),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    if (moduleName === "react-native" || moduleName === "react-native-web") {
      return {
        filePath: path.join(localModules, "react-native-web", "dist", "index.js"),
        type: "sourceFile",
      };
    }
  } else {
    if (moduleName === "react-native") {
      return {
        filePath: path.join(localModules, "react-native", "index.js"),
        type: "sourceFile",
      };
    }
  }

  if (Object.hasOwn(FORCED_MODULES, moduleName)) {
    return { filePath: FORCED_MODULES[moduleName], type: "sourceFile" };
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
