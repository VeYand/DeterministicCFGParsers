import {writeFileSync} from 'fs'
import {run} from '../../trash/slr/run'
import {Grammar} from '../common/grammar/grammar'

function dumpSLRTableCsvToFile(grammar: Grammar): void {
	const lines: string[] = []

	for (const key of Object.keys(grammar)) {
		for (const prod of grammar[key]!) {
			const symbols = prod.map(symbol => (symbol.type === 'terminal' ? symbol.value : `${symbol.name}`))
			lines.push(`${key} -> ${symbols.join(' ')}`)
		}
	}

	writeFileSync('slr/temp.txt', lines.join('\n'), 'utf-8')
	run('slr/temp.txt', 'slr/slr_table.csv')
}

export {
	dumpSLRTableCsvToFile,
}