import {writeFileSync} from 'fs'
import {Grammar, isTerminal, Production} from '../../common/grammar/grammar'
import {ParseTable} from '../table/table'

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

/**
 * Сохраняет LL(1) таблицу разбора в CSV-файл.
 * @param table — таблица LL(1)
 * @param outPath — путь к файлу
 */
const dumpParseTableCsvToFile = (table: ParseTable, outPath: string): void => {
	const lines: string[] = []
	lines.push(['NonTerminal', 'Lookahead', 'Production'].join(','))

	for (const [A, row] of Object.entries(table)) {
		for (const [t, prod] of Object.entries(row)) {
			if (!prod) {
				continue
			}

			const rhs = prod.map(sym =>
				(sym.type === 'terminal'
					? sym.value === 'ε' ? 'ε' : sym.value
					: sym.name),
			).join(' ')

			const rhsCsv = `"${rhs.replace(/"/g, '""')}"`
			lines.push([A, t, rhsCsv].join(','))
		}
	}

	writeFileSync(outPath, lines.join('\n'), 'utf-8')
}

const formatProd = (prod: Production): string =>
	prod.map(sym => (isTerminal(sym) ? `"${sym.value}"` : sym.name)).join(' ')

export {
	dumpGrammarToFile,
	dumpParseTableCsvToFile,
}