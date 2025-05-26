import {Grammar, Symbol, isTerminal} from '../common/grammar/grammar'
import {tokenize, Token} from '../common/lexer/lexer'
import {dumpSLRTableCsvToFile} from './print'
import {buildSLRTable} from './slr'

/**
 * Выполняет SLR(1)-анализ входного текста.
 *
 * @param grammar — исходная грамматика
 * @param start   — стартовый нетерминал
 * @param input   — исходный текст для разбора
 * @param debug   — вывод отладочной информации (стек состояний, операций)
 * @returns true, если разбор успешен; иначе бросает ошибку с позицией и описанием
 */
function parseSLR(
	grammar: Grammar,
	start: string,
	input: string,
	debug = false,
): boolean {
	// 1) лексический разбор
	const tokens: Token[] = tokenize(input)
	let pos = 0

	// 2) строим SLR-таблицу
	const {ACTION, GOTO} = buildSLRTable(grammar, start)

	// 3) инициализируем стеки: состояний и семантический (опционально)
	const stateStack: number[] = [0]
	const symbolStack: Symbol[] = []

	if (debug) {
		dumpSLRTableCsvToFile({ACTION, GOTO}, 'slr_action.csv', 'slr_goto.csv')
	}

	// 4) основной цикл
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const state = stateStack[stateStack.length - 1] as number
		const look = tokens[pos]?.type as string

		const act = ACTION[state]?.[look]
		if (!act) {
			throw new Error(`Parse error at token #${pos} ("${tokens[pos]?.text}"): `
				+ `no action in state ${state} on '${look}'`)
		}

		if (act.type === 'shift') {
			// SHIFT: кладём символ и новое состояние
			if (debug) {
				console.log(`shift '${look}', to state ${act.to}`)
			}
			symbolStack.push({type: 'terminal', value: look})
			stateStack.push(act.to)
			pos++
			continue
		}

		if (act.type === 'reduce') {
			// REDUCE: убираем |rhs| символов и состояний, затем кладём lhs и переходим по GOTO
			const {lhs, rhs} = act.prod
			if (debug) {
				console.log(`reduce by ${lhs} -> ${rhs.map(s => (isTerminal(s) ? s.value : s.name)).join(' ')}`)
			}
			// pop RHS
			for (let i = 0; i < rhs.length; i++) {
				symbolStack.pop()
				stateStack.pop()
			}
			// push LHS
			symbolStack.push({type: 'nonterminal', name: lhs})
			const gotoState = GOTO[stateStack[stateStack.length - 1]!]![lhs]
			if (gotoState === undefined) {
				throw new Error(`Parse error: no GOTO from state ${stateStack[stateStack.length - 1]} on '${lhs}'`)
			}
			if (debug) {
				console.log(`goto state ${gotoState}`)
			}
			stateStack.push(gotoState)
			continue
		}

		if (act.type === 'accept') {
			if (debug) {
				console.log('accept')
			}
			return true
		}

		// неожиданный тип
		throw new Error(`Internal parser error: unexpected action ${JSON.stringify(act)}`)
	}
}

export {
	parseSLR,
}