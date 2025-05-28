import {writeFileSync} from 'fs'
import {Grammar, isTerminal, Production} from '../grammar/grammar'

/**
 * Сохраняет грамматику в файл.
 * @param grammar — объект Grammar
 * @param start — стартовый нетерминал
 * @param outPath — путь к выходному файлу
 */
const dumpGrammarToFile = (grammar: Grammar, start: string, outPath: string): void => {
	const lines: string[] = []

	lines.push(`(start = ${start})`)
	for (const [A, prods] of Object.entries(grammar)) {
		const rhs = prods.map(p => formatProd(p)).join(' | ')
		lines.push(`${A} -> ${rhs}`)
	}

	writeFileSync(outPath, lines.join('\n'), 'utf-8')
}

const formatProd = (prod: Production): string =>
	prod.map(sym => (isTerminal(sym) ? `"${sym.value}"` : sym.name)).join(' ')

export {
	dumpGrammarToFile,
}