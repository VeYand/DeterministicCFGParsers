import {writeFileSync} from 'fs'
import {SLRTable} from './slr'

function dumpSLRTableCsvToFile(table: SLRTable, actionPath: string, gotoPath: string): void {
	// 1) ACTION
	const actionLines: string[] = []
	actionLines.push(['state', 'lookahead', 'action', 'target/prod'].join(','))

	for (const [stateStr, row] of Object.entries(table.ACTION)) {
		const state = Number(stateStr)
		for (const [a, act] of Object.entries(row)) {
			let actType: string
			let detail: string

			switch (act.type) {
				case 'shift':
					actType = 'shift'
					detail = act.to.toString()
					break
				case 'reduce':
					actType = 'reduce'
					// prod: A -> α
					detail = `${act.prod.lhs} -> ${act.prod.rhs.map(s => (s.type === 'terminal' ? s.value : s.name)).join(' ')}`
					// экранируем кавычки
					detail = `"${detail.replace(/"/g, '""')}"`
					break
				case 'accept':
					actType = 'accept'
					detail = ''
					break
			}
			actionLines.push([state.toString(), a, actType, detail].join(','))
		}
	}

	writeFileSync(actionPath, actionLines.join('\n'), 'utf-8')

	// 2) GOTO
	const gotoLines: string[] = []
	gotoLines.push(['state', 'nonterminal', 'to_state'].join(','))

	for (const [stateStr, row] of Object.entries(table.GOTO)) {
		const state = Number(stateStr)
		for (const [nt, to] of Object.entries(row)) {
			gotoLines.push([state.toString(), nt, to.toString()].join(','))
		}
	}

	writeFileSync(gotoPath, gotoLines.join('\n'), 'utf-8')
}

export {
	dumpSLRTableCsvToFile,
}