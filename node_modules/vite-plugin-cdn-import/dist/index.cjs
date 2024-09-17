"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Plugin: () => PluginImportToCDN,
  autoComplete: () => autoComplete2,
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_rollup_plugin_external_globals = __toESM(require("rollup-plugin-external-globals"), 1);
var import_vite_plugin_externals = require("vite-plugin-externals");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);

// src/autoComplete.ts
var isDev = process.env.NODE_ENV === "development";
var modulesConfig = {
  react: {
    var: "React",
    jsdeliver: {
      path: isDev ? "umd/react.development.js" : "umd/react.production.min.js"
    }
  },
  "react-dom": {
    var: "ReactDOM",
    alias: ["react-dom/client"],
    jsdeliver: {
      path: isDev ? "umd/react-dom.development.js" : "umd/react-dom.production.min.js"
    }
  },
  "react-router-dom": {
    var: "ReactRouterDOM",
    jsdeliver: {
      path: "dist/umd/react-router-dom.production.min.js"
    }
  },
  antd: {
    var: "antd",
    jsdeliver: {
      path: "dist/antd.min.js",
      css: "dist/reset.min.css"
    }
  },
  vue: {
    var: "Vue",
    jsdeliver: {
      path: isDev ? "dist/vue.runtime.global.js" : "dist/vue.runtime.global.prod.js"
    }
  },
  "vue-router": {
    var: "VueRouter",
    jsdeliver: {
      path: "dist/vue-router.global.min.js"
    }
  },
  "vue-router@3": {
    var: "VueRouter",
    jsdeliver: {
      name: "vue-router",
      path: "dist/vue-router.min.js"
    }
  },
  vue2: {
    var: "Vue",
    jsdeliver: {
      name: "vue",
      path: isDev ? "dist/vue.runtime.js" : "dist/vue.runtime.min.js"
    }
  },
  moment: {
    var: "moment",
    jsdeliver: {
      path: "moment.min.js"
    }
  },
  dayjs: {
    var: "dayjs",
    jsdeliver: {
      path: "dayjs.min.js"
    }
  },
  axios: {
    var: "axios",
    jsdeliver: {
      path: "dist/axios.min.js"
    }
  },
  lodash: {
    var: "_",
    jsdeliver: {
      path: "lodash.min.js"
    }
  }
};
function isJsdeliver(prodUrl) {
  return prodUrl.includes("//cdn.jsdelivr.net");
}
function isUnpkg(prodUrl) {
  return prodUrl.includes("//unpkg.com");
}
function isCdnjs(prodUrl) {
  return prodUrl.includes("//cdnjs.cloudflare.com");
}
function genModuleByName(name) {
  const config = modulesConfig[name];
  if (!config) {
    throw new Error(`The configuration of module ${name} does not exist `);
  }
  return (prodUrl) => {
    if (isCdnjs(prodUrl)) {
      throw new Error(
        `The configuration of module ${name} in ${prodUrl} does not exist `
      );
    } else {
      if (!(isJsdeliver(prodUrl) || isUnpkg(prodUrl))) {
        console.warn(
          "Unknown CDN, please ensure that this CDN supports jsdelivr rules"
        );
      }
      return __spreadValues({
        name,
        var: config.var,
        alias: config.alias
      }, config.jsdeliver);
    }
  };
}
function autoComplete(name) {
  if (Array.isArray(name)) {
    return name.map(genModuleByName);
  } else {
    return genModuleByName(name);
  }
}
var autoComplete_default = autoComplete;

// src/index.ts
var isDev2 = process.env.NODE_ENV === "development";
function getModuleVersion(name) {
  const pwd = process.cwd();
  const pkgFile = import_path.default.join(pwd, "node_modules", name, "package.json");
  if (import_fs.default.existsSync(pkgFile)) {
    const pkgJson = JSON.parse(import_fs.default.readFileSync(pkgFile, "utf8"));
    return pkgJson.version;
  }
  return "";
}
function isFullPath(path2) {
  return path2.startsWith("http:") || path2.startsWith("https:") || path2.startsWith("//") ? true : false;
}
function renderUrl(url, data) {
  const { path: path2 } = data;
  if (isFullPath(path2)) {
    url = path2;
  }
  return url.replace(/\{name\}/g, data.name).replace(/\{version\}/g, data.version).replace(/\{path\}/g, path2);
}
function getModuleInfo(module2, prodUrl) {
  prodUrl = module2.prodUrl || prodUrl;
  let v = module2;
  const version = getModuleVersion(v.name);
  let pathList = [];
  if (!Array.isArray(v.path)) {
    pathList.push(v.path);
  } else {
    pathList = v.path;
  }
  const data = __spreadProps(__spreadValues({}, v), {
    version
  });
  pathList = pathList.map((p) => {
    if (!version && !isFullPath(p)) {
      throw new Error(
        `modules: ${data.name} package.json file does not exist`
      );
    }
    return renderUrl(prodUrl, __spreadProps(__spreadValues({}, data), {
      path: p
    }));
  });
  let css = v.css || [];
  if (!Array.isArray(css) && css) {
    css = [css];
  }
  const cssList = !Array.isArray(css) ? [] : css.map(
    (c) => renderUrl(prodUrl, __spreadProps(__spreadValues({}, data), {
      path: c
    }))
  );
  return __spreadProps(__spreadValues({}, v), {
    version,
    pathList,
    cssList
  });
}
function PluginImportToCDN(options) {
  const {
    modules = [],
    prodUrl = "https://cdn.jsdelivr.net/npm/{name}@{version}/{path}",
    enableInDevMode = false,
    generateCssLinkTag,
    generateScriptTag
  } = options;
  let isBuild = false;
  const data = modules.map((_m) => {
    const m = typeof _m === "string" ? autoComplete_default(_m) : _m;
    const list = (Array.isArray(m) ? m : [m]).map(
      (v) => typeof v === "function" ? v(prodUrl) : v
    );
    return list.map((v) => getModuleInfo(v, prodUrl));
  }).flat();
  const externalMap = {};
  data.forEach((v) => {
    externalMap[v.name] = v.var;
    if (Array.isArray(v.alias)) {
      v.alias.forEach((alias) => {
        externalMap[alias] = v.var;
      });
    }
  });
  const plugins = [
    {
      name: "vite-plugin-cdn-import",
      enforce: "pre",
      config(_, { command }) {
        isBuild = command === "build";
        let userConfig = {
          build: {
            rollupOptions: {
              plugins: []
            }
          }
        };
        if (isBuild) {
          userConfig.build.rollupOptions.plugins = [
            (0, import_rollup_plugin_external_globals.default)(externalMap)
          ];
        }
        return userConfig;
      },
      transformIndexHtml(html) {
        if (!isBuild && !enableInDevMode) {
          return html;
        }
        const descriptors = [];
        data.forEach((v) => {
          v.pathList.forEach((url) => {
            const cusomize = (generateScriptTag == null ? void 0 : generateScriptTag(v.name, url)) || {};
            const attrs = __spreadValues({
              src: url,
              crossorigin: "anonymous"
            }, cusomize.attrs);
            descriptors.push(__spreadProps(__spreadValues({
              tag: "script"
            }, cusomize), {
              attrs
            }));
          });
          v.cssList.forEach((url) => {
            const cusomize = (generateCssLinkTag == null ? void 0 : generateCssLinkTag(v.name, url)) || {};
            const attrs = __spreadValues({
              href: url,
              rel: "stylesheet",
              crossorigin: "anonymous"
            }, cusomize.attrs);
            descriptors.push(__spreadProps(__spreadValues({
              tag: "link"
            }, cusomize), {
              attrs
            }));
          });
        });
        return descriptors;
      }
    }
  ];
  if (isDev2 && enableInDevMode) {
    plugins.push(
      (0, import_vite_plugin_externals.viteExternalsPlugin)(externalMap, {
        enforce: "pre"
      })
    );
  }
  return plugins;
}
var autoComplete2 = autoComplete_default;
var src_default = PluginImportToCDN;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Plugin,
  autoComplete
});
