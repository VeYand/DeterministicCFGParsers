import {writeFileSync} from 'fs'
import * as fs from 'node:fs'
import {run} from '../../trash/slr/run'
import {Grammar, isTerminal} from '../common/grammar/grammar'
import {Action, buildSLRTable} from './slr'

function dumpSLRTableCsvToFile2(grammar: Grammar): void {
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

/**
 * Дамп SLR-таблицы в CSV с r1, r2… вместо полного текста редьюса.
 */
function dumpSLRTableCsvToFile(
	origGrammar: Grammar,
	start: string,
	prodId: Map<string, number>,
	outPath: string = 'slr/slr_table.csv',
) {
	// 1) сконструируем таблицу
	const grammar = {...origGrammar}
	const {ACTION, GOTO} = buildSLRTable(grammar, start)

	// 3) собрать все терминалы / нетерминалы из таблицы
	const terminals = new Set<string>()
	const nonTerminals = new Set<string>()
	for (const i of Object.keys(ACTION)) {
		for (const t of Object.keys(ACTION[+i]!)) {
			terminals.add(t)
		}
	}
	for (const i of Object.keys(GOTO)) {
		for (const nt of Object.keys(GOTO[+i]!)) {
			nonTerminals.add(nt)
		}
	}
	const termList = [...terminals].sort()
	const ntList = [...nonTerminals].sort()

	// 4) заголовок
	const header = ['State', ...termList.map(t => `A[${t}]`), ...ntList.map(nt => `G[${nt}]`)]
	const rows: string[][] = [header]

	// 5) по каждому состоянию
	const allStates = new Set<number>([
		...Object.keys(ACTION).map(Number),
		...Object.keys(GOTO).map(Number),
	])
	for (const state of [...allStates].sort((a, b) => a - b)) {
		const row: string[] = [String(state)]

		// ACTION-колонки
		for (const t of termList) {
			const act = ACTION[state]?.[t] as Action | undefined
			if (!act) {
				row.push('')
			}
			else if (act.type === 'shift') {
				row.push(`s${act.to}`)
			}
			else if (act.type === 'reduce') {
				// ищем номер продукции
				const key = `${act.prod.lhs}->${act.prod.rhs.map(s => (isTerminal(s) ? s.value : s.name)).join(' ')}`
				const id = prodId.get(key)!
				row.push(`r${id}`)
			}
			else /* accept */ {
				row.push('acc')
			}
		}

		// GOTO-колонки
		for (const nt of ntList) {
			const to = GOTO[state]?.[nt]
			// eslint-disable-next-line no-negated-condition
			row.push(to !== undefined ? String(to) : '')
		}

		rows.push(row)
	}

	// 6) вывести в CSV
	const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
	fs.writeFileSync(outPath, csv, 'utf8')
	console.log(`SLR table with numbered reduces written to ${outPath}`)
}

export {
	dumpSLRTableCsvToFile2,
	dumpSLRTableCsvToFile,
}