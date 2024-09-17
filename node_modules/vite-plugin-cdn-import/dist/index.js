var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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

// src/index.ts
import externalGlobals from "rollup-plugin-external-globals";
import { viteExternalsPlugin } from "vite-plugin-externals";
import fs from "fs";
import path from "path";

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
  const pkgFile = path.join(pwd, "node_modules", name, "package.json");
  if (fs.existsSync(pkgFile)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
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
function getModuleInfo(module, prodUrl) {
  prodUrl = module.prodUrl || prodUrl;
  let v = module;
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
            externalGlobals(externalMap)
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
      viteExternalsPlugin(externalMap, {
        enforce: "pre"
      })
    );
  }
  return plugins;
}
var autoComplete2 = autoComplete_default;
var src_default = PluginImportToCDN;
export {
  PluginImportToCDN as Plugin,
  autoComplete2 as autoComplete,
  src_default as default
};
