import {ESLint} from 'eslint'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    const eslint = new ESLint({
        fix: true,
        overrideConfigFile: path.resolve(__dirname, 'eslintrc.json'),
    });

    const results = await eslint.lintFiles([
        'src/**/*.ts',
    ]);

    await ESLint.outputFixes(results)

    const formatter = await eslint.loadFormatter('stylish')
    const resultText = formatter.format(results)

    console.log(resultText)
})().catch((error) => {
    process.exitCode = 1
    console.error(error)
})