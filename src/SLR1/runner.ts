import {writeFileSync} from 'fs'
import {EPSILON, Grammar, isTerminal, Symbol} from '../common/grammar/grammar'
import {Token, tokenize} from '../common/lexer/lexer'
import {dumpSLRTableCsvToFile} from './print'
import {buildSLRTable} from './slr'

type TraceRow = {
	states: number[],               // стек состояний (индексы)
	symbols: string,               // стек символов (строка через пробел)
	rest: string,                  // что осталось от входа
	action: string,                // действие: sX, rY или acc
}

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
	// 0) нормализуем ε-продукции:
	//    [EPSILON] → [] и выкидываем «ε» из любых остальных правых частей
	for (const A of Object.keys(grammar)) {
		grammar[A] = grammar[A]?.map(rhs => {
			// если единственный символ — ε, делаем пустую продукцию
			if (rhs.length === 1 && rhs[0]?.type === 'terminal' && rhs[0].value === EPSILON.value) {
				return []
			}
			// иначе просто убираем все «ε» из rhs (хотя их там обычно не должно быть)
			return rhs.filter(s => !(s.type === 'terminal' && s.value === EPSILON.value))
		}) ?? []
	}

	const prodId = enumerateProd(grammar)

	if (debug) {
		dumpSLRTableCsvToFile(grammar, start, prodId)
	}

	// 1) лексический разбор
	const tokens: Token[] = tokenize(input)
	let pos = 0

	// 2) строим SLR-таблицу
	const {ACTION, GOTO} = buildSLRTable(grammar, start)

	// 3) инициализируем стеки: состояний и семантический (опционально)
	const stateStack: number[] = [0]
	const symbolStack: Symbol[] = []
	const trace: TraceRow[] = []

	// 4) основной цикл
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const state = stateStack[stateStack.length - 1] as number
		const look = tokens[pos]?.type as string

		const act = ACTION[state]?.[look]
		if (!act) {
			if (debug) {
				trace.push({
					states: [...stateStack],
					symbols: symbolStack.map(s => (isTerminal(s) ? s.value : s.name)).join(' '),
					rest: tokens.slice(pos).map(t => t.text).join(' '),
					action: `<no action>`,
				})
				_dumpTrace(trace)
			}
			throw new Error(`Parse error at token #${pos} ("${tokens[pos]?.text}"): `
				+ `no action in state ${state} on '${look}'`)
		}

		// записываем текущее действие в trace
		if (debug) {
			let actionStr: string
			if (act.type === 'shift') {
				actionStr = `s${act.to}`
			}
			else if (act.type === 'reduce') {
				actionStr = (() => {
					const rhs = act.prod.rhs
					const key = `${act.prod.lhs}->${rhs.map(s => (isTerminal(s) ? s.value : s.name)).join(' ')}`
					return `r${prodId.get(key)} (${key})`

				})()
			}
			else {
				actionStr = 'acc'
			}

			trace.push({
				states: [...stateStack],
				symbols: symbolStack.map(s => (isTerminal(s) ? s.value : s.name)).join(' '),
				rest: tokens.slice(pos).map(t => t.text).join(' '),
				action: actionStr,
			})
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
				_dumpTrace(trace)
			}
			return true
		}

		// неожиданный тип
		throw new Error(`Internal parser error: unexpected action ${JSON.stringify(act)}`)
	}
}

function _dumpTrace(trace: {states: number[], symbols: string, rest: string, action: string}[]) {
	const lines = ['"stack_states","stack_symbols","remaining","action"']
	for (const row of trace) {
		lines.push(`"${row.states.join(' ')}","${row.symbols}","${row.rest}","${row.action}"`)
	}
	writeFileSync('slr/parse_trace.csv', lines.join('\n'), 'utf8')
}

function enumerateProd(grammar: Grammar): Map<string, number> {
	const prodId = new Map<string, number>()
	let nextId = 1
	// ключ продукции – `${lhs}->${rhs.join(' ')}`
	for (const [A, prods] of Object.entries(grammar)) {
		for (const rhs of prods) {
			const key = `${A}->${rhs.map(s => (isTerminal(s) ? s.value : s.name)).join(' ')}`
			if (!prodId.has(key)) {
				prodId.set(key, nextId++)
			}
		}
	}
	return prodId
}

export {
	parseSLR,
}