import { HtmlTagDescriptor, Plugin } from 'vite';

/**
 * module 配置自动完成
 */
declare const modulesConfig: {
    react: {
        var: string;
        jsdeliver: {
            path: string;
        };
    };
    'react-dom': {
        var: string;
        alias: string[];
        jsdeliver: {
            path: string;
        };
    };
    'react-router-dom': {
        var: string;
        jsdeliver: {
            path: string;
        };
    };
    antd: {
        var: string;
        jsdeliver: {
            path: string;
            css: string;
        };
    };
    vue: {
        var: string;
        jsdeliver: {
            path: string;
        };
    };
    'vue-router': {
        var: string;
        jsdeliver: {
            path: string;
        };
    };
    'vue-router@3': {
        var: string;
        jsdeliver: {
            name: string;
            path: string;
        };
    };
    vue2: {
        var: string;
        jsdeliver: {
            name: string;
            path: string;
        };
    };
    moment: {
        var: string;
        jsdeliver: {
            path: string;
        };
    };
    dayjs: {
        var: string;
        jsdeliver: {
            path: string;
        };
    };
    axios: {
        var: string;
        jsdeliver: {
            path: string;
        };
    };
    lodash: {
        var: string;
        jsdeliver: {
            path: string;
        };
    };
};
type ModuleName = keyof typeof modulesConfig;
type GetModuleFunc$1 = (prodUrl: string) => Module;
declare function autoComplete$1(name: ModuleName): GetModuleFunc$1;
declare function autoComplete$1(name: ModuleName[]): GetModuleFunc$1[];

type GetModuleFunc = (prodUrl: string) => Module;
interface Module {
    name: string;
    var: string;
    path: string | string[];
    /** Alias ​​of name, for example "react-dom/client" is an alias of "react-dom" */
    alias?: string[];
    css?: string | string[];
    prodUrl?: string;
}
interface Options {
    prodUrl?: string;
    modules: (ModuleName | Module | Module[] | GetModuleFunc | GetModuleFunc[])[];
    /** Enabled in dev mode, default is false */
    enableInDevMode?: boolean;
    /** Generate the external script tag */
    generateScriptTag?: (name: string, scriptUrl: string) => Omit<HtmlTagDescriptor, 'tag' | 'children'>;
    /** Generate the external css link tag  */
    generateCssLinkTag?: (name: string, cssUrl: string) => Omit<HtmlTagDescriptor, 'tag' | 'children'>;
}

declare function PluginImportToCDN(options: Options): Plugin[];
/**
 * @deprecated Pass the package name directly in options.modules instead.
 */
declare const autoComplete: typeof autoComplete$1;

export { type Options, PluginImportToCDN as Plugin, autoComplete, PluginImportToCDN as default };
