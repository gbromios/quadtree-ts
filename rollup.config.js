import pkg from './package.json'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import banner2 from 'rollup-plugin-banner2'

export default [
    // CommonJS (for Node) and ES module (for bundlers) build
    {
        input: 'src/index.esm.ts',
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }), // so Rollup can convert TypeScript to JavaScript
        ],
        output: [
            { file: pkg.main, format: 'cjs', preferConst: true },
            { file: pkg.module, format: 'es', preferConst: true },
        ],
    },
]
