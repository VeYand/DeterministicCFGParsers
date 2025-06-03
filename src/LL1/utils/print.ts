import {writeFileSync} from 'fs'
import {run} from '../../../trash/ll/run'
import {Grammar} from '../../common/grammar/grammar'

const dumpParseTableCsvToFile = (grammar: Grammar): void => {
	const lines: string[] = []

	for (const key of Object.keys(grammar)) {
		for (const prod of grammar[key]!) {
			const symbols = prod.map(symbol => (symbol.type === 'terminal' ? symbol.value : `<${symbol.name}>`))
			lines.push(`<${key}> -> ${symbols.join(' ')}`)
		}
	}

	writeFileSync('ll/temp.txt', lines.join('\n'), 'utf-8')
	run('ll/temp.txt', 'll/ll_table.csv')
}

export {
	dumpParseTableCsvToFile,
}