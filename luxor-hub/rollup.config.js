import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        noEmit: false,
        declaration: false,
        sourceMap: false,
        inlineSourceMap: false,
      },
    }),
    postcss({
      extract: true,
      minimize: false,
      modules: false,
    }),
  ],
};
