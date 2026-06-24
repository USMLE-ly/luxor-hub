import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Custom plugin: compile .ts/.tsx to JS using tsc BEFORE rollup parses
function typescriptPrecompile() {
  const ts = require('typescript');
  const sourceCache = new Map();

  return {
    name: 'ts-precompile',
    resolveId(id, importer) {
      if (!id.startsWith('.') && !id.startsWith('@') && !id.startsWith('/')) return null;
      // Let the resolve plugin handle actual resolution
      return null;
    },
    load(id) {
      if (!id.match(/\.tsx?$/)) return null;
      // Don't actually load here — let transform handle it
      return null;
    },
    transform(code, id) {
      if (!id.match(/\.tsx?$/)) return null;

      let compilerOptions = {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        sourceMap: false,
        inlineSourceMap: false,
        inlineSources: false,
        skipLibCheck: true,
        strict: false,
        noEmit: false,
        allowJs: true,
        esModuleInterop: true,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        allowImportingTsExtensions: true,
        isolatedModules: true,
        declaration: false,
      };

      const result = ts.transpileModule(code, {
        compilerOptions,
        fileName: id,
      });

      return {
        code: result.outputText,
        map: null,
      };
    }
  };
}

export default {
  input: 'src/main.tsx',
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: 'assets/index.js',
    chunkFileNames: 'assets/[name].js',
    assetFileNames: 'assets/[name][extname]',
    sourcemap: false,
  },
  plugins: [
    typescriptPrecompile(),
    alias({
      entries: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
      ],
    }),
    replace({
      preventAssignment: true,
      delimiters: ['', ''],
      values: {
        'import.meta.env.VITE_PUBLIC_API_URL': JSON.stringify(process.env.VITE_PUBLIC_API_URL || 'https://python--libyausmle.replit.app'),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
        'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''),
      },
    }),
    resolve({
      browser: true,
      extensions: ['.mjs', '.js', '.ts', '.tsx', '.json', '.jsx'],
    }),
    commonjs(),
    postcss({
      extract: true,
      minimize: false,
      modules: false,
    }),
  ],
};
