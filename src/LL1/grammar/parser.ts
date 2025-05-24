import {TOKEN_TYPES} from '../lexer'
import {
	Grammar,
	Symbol,
	EPSILON,
	newTerminal,
	newNonTerminal,
} from './grammar'

const LINE_SEPARATOR = /\r?\n/
const ARROW = '->'
const ALT_SEPARATOR = '|'
const NONTERMINAL_NAME_REGEX = /^[A-Za-z][A-Za-z0-9_]*$/

/**
 * Собираем set имён всех терминальных токенов из лексера:
 * например 'BEGIN', 'END', 'IDENTIFIER', '+', 'DIVIDE' и т.д.
 */
const TERMINAL_NAMES = new Set<string>(
	TOKEN_TYPES.map(t => t.name),
)

/**
 * Формат:
 * S -> BEGIN stmt_list END
 * expr -> term expr2
 * expr2 -> PLUS term expr2 | ε
 *
 * Терминалы распознаются по наличию в TERMINAL_NAMES,
 * всё остальное — нетерминалы.
 */
const parseGrammar = (input: string): [Grammar, string] => {
	const grammar: Grammar = {}

	const lines = input
		.split(LINE_SEPARATOR)
		.map(l => l.trim())
		.filter(l => l && !l.startsWith('//') && !l.startsWith('#'))

	if (lines.length === 0) {
		throw new Error('Empty grammar')
	}

	let firstNonTerminal: string | null = null

	for (const rawLine of lines) {
		const [lhsRaw, rhsRaw] = rawLine.split(ARROW).map(s => s.trim())
		if (!lhsRaw || !rhsRaw) {
			throw new Error(`Invalid rule (missing '->'): "${rawLine}"`)
		}

		// Проверяем, что LHS — корректное имя нетерминала
		if (!NONTERMINAL_NAME_REGEX.test(lhsRaw)) {
			throw new Error(`Invalid nonterminal on LHS: "${lhsRaw}"`)
		}
		const ntName = lhsRaw

		if (firstNonTerminal === null) {
			firstNonTerminal = ntName
		}

		// Разделяем альтернативы через |
		const alternatives = rhsRaw.split(ALT_SEPARATOR).map(a => a.trim())
		if (alternatives.length === 0) {
			throw new Error(`No alternatives in rule: "${rawLine}"`)
		}

		for (const alt of alternatives) {
			const symbols = parseSymbols(alt)
			if (!grammar[ntName]) {
				grammar[ntName] = []
			}
			grammar[ntName]?.push(symbols)
		}
	}

	if (firstNonTerminal === null) {
		throw new Error('No nonterminals found in grammar')
	}

	return [grammar, firstNonTerminal]
}

/**
 * Разбирает одну правую часть, возвращает массив Symbol.
 * По пробелам, без <>.
 * Если лексема есть в TERMINAL_NAMES — это терминал,
 * если совпадает с EPSILON.value — ε,
 * иначе — нетерминал.
 */
function parseSymbols(seq: string): Symbol[] {
	const symbols: Symbol[] = []
	for (const tok of seq.split(/\s+/)) {
		if (!tok) {
			continue
		}

		// ε-продукция
		if (tok === EPSILON.value) {
			symbols.push(EPSILON)
			continue
		}

		// терминал?
		if (TERMINAL_NAMES.has(tok)) {
			symbols.push(newTerminal(tok))
			continue
		}

		// проверим, что имя валидно как нетерминал
		if (!NONTERMINAL_NAME_REGEX.test(tok)) {
			throw new Error(`Invalid symbol "${tok}" in production "${seq}"`)
		}

		symbols.push(newNonTerminal(tok))
	}

	if (symbols.length === 0) {
		throw new Error(`Empty production in segment: "${seq}"`)
	}

	return symbols
}

export {
	parseGrammar,
}
