import {computeFirst, firstOfSequence, computeFollow} from '../../common/grammar/firstfollowset'
import {
	Grammar,
	Production,
	EPSILON,
	isTerminal,
} from '../../common/grammar/grammar'

/**
 * Тип ячейки таблицы: production или undefined
 */
type ParseTable = Record<string, Record<string, Production | undefined>>

/**
 * Строит LL(1)-таблицу разбора.
 *
 * @param grammar — подготовленная (без левой рец., факторизованная) грамматика
 * @param start — стартовый нетерминал
 * @returns table[A][t] = продакшн A → α, или undefined, если правило не задано
 * @throws Error при конфликте (двойном заполнении одной ячейки)
 */
const buildLL1ParseTable = (
	grammar: Grammar,
	start: string,
): ParseTable => {
	const first = computeFirst(grammar)
	const follow = computeFollow(grammar, start, first)

	const table: ParseTable = {}
	// Инициализация пустых строк
	for (const A of Object.keys(grammar)) {
		table[A] = {}
	}

	for (const [A, prods] of Object.entries(grammar)) {
		for (const prod of prods) {
			// FIRST(α)
			const firstAlpha = firstOfSequence(prod, first)

			// Для каждого терминала t != ε добавляем в table[A][t]
			for (const t of firstAlpha) {
				if (t === EPSILON.value) {
					continue
				}
				if (table[A]![t]) {
					throw new Error(`LL(1) conflict: table[${A}][${t}] is already set to production ${formatProd(table[A]![t]!)}; cannot assign ${formatProd(prod)}`)
				}
				table[A]![t] = prod
			}

			// Если ε ∈ FIRST(α), то для каждого b ∈ FOLLOW(A) добавляем prod
			if (firstAlpha.has(EPSILON.value)) {
				for (const b of follow.get(A)!) {
					// eslint-disable-next-line max-depth
					if (table[A]![b]) {
						throw new Error(`LL(1) ε-conflict: table[${A}][${b}] is already set to production ${formatProd(table[A]![b]!)}; cannot assign ${formatProd(prod)}`)
					}
					table[A]![b] = prod
				}
			}
		}
	}

	return table
}

/**
 * Утилита: форматирование Production в строку для сообщений об ошибках
 */
const formatProd = (prod: Production): string => prod
	.map(s => (isTerminal(s) ? `"${s.value}"` : s.name))
	.join(' ')

export type {
	ParseTable,
}

export {
	buildLL1ParseTable,
}