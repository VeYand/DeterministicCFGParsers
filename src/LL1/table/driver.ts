import {
	Grammar,
	Symbol,
	EPSILON,
	isTerminal,
	isNonTerminal, Production,
} from '../../common/grammar/grammar'
import {Token, tokenize} from '../../common/lexer/lexer'
import {dumpParseTableCsvToFile} from '../utils/print'
import {ParseTable, buildLL1ParseTable} from './table'

/**
 * Выполняет LL(1) анализ входного текста.
 *
 * @param grammar — подготовленная грамматика (после всех трансформаций)
 * @param start — стартовый нетерминал
 * @param inputText — исходная строка для разбора
 * @param debug
 * @returns true, если разбор успешен
 * @throws Error с подробным описанием позиции и ожиданий при ошибке
 */
const parseInput = (
	grammar: Grammar,
	start: string,
	inputText: string,
	debug: boolean,
): boolean => {
	// 1. Лексический анализ
	const tokens: Token[] = tokenize(inputText)
	let cur = 0

	// 2. Построение таблицы разбора
	const table: ParseTable = buildLL1ParseTable(grammar, start)

	if (debug) {
		dumpParseTableCsvToFile(table, 'll/ll_table.csv')
	}

	// 3. Инициализация стека: [ '$', start ]
	const stack: Symbol[] = [
		{type: 'terminal', value: '$'},
		{type: 'nonterminal', name: start},
	]

	// 4. Главный цикл разбора
	while (stack.length > 0) {
		const top = stack.pop()!
		const look = tokens[cur] as Token

		if (isTerminal(top)) {
			// Если ε — просто пропустить
			if (top.value === EPSILON.value) {
				continue
			}
			// Если совпадает с текущим токеном
			if (top.value === look.type) {
				cur++
				continue
			}
			// Иначе — ошибка терминала
			throw new Error(
				`Parse error at token #${cur} ("${look.text}"): `
				+ `expected terminal "${top.value}", got "${look.type}".`,
			)
		}

		// Топ — нетерминал
		if (isNonTerminal(top)) {
			const A = top.name
			const prod = table[A]![look!.type] as Production
			if (!prod) {
				throw new Error(
					`Parse error at token #${cur} ("${look.text}"): `
					+ `no rule for nonterminal ${A} with lookahead "${look.type}".`,
				)
			}
			// Раскладываем RHS в стек в обратном порядке
			for (let i = prod.length - 1; i >= 0; i--) {
				stack.push(prod[i]!)
			}
			continue
		}

		// На всякий случай
		throw new Error(`Internal parser error: unexpected symbol on stack ${JSON.stringify(top)}`)
	}

	// 5. Проверка, что все токены потреблены (остался только '$')
	if (cur === tokens.length) {
		return true
	}
	else {
		throw new Error(
			`Parse error: unconsumed input at token #${cur} ("${tokens[cur]?.text}")`,
		)
	}
}

export {
	parseInput,
}