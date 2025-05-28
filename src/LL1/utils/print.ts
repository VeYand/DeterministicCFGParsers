import {writeFileSync} from 'fs'
import {ParseTable} from '../table/table'

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

export {
	dumpParseTableCsvToFile,
}