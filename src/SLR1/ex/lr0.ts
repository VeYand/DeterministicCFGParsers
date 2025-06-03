// src/SLR0/lr0.ts
import {Grammar, Symbol, isNonTerminal, isTerminal, newNonTerminal} from '../../common/grammar/grammar'

/** LR(0)-элемент (item) A → α·β */
type Item = {
	lhs: string,          // A
	rhs: Symbol[],        // [α..., β...]
	dot: number,          // позиция точки в rhs: 0 ≤ dot ≤ rhs.length
}

/** Упаковка item-а в строку для сравнения/Map */
const itemKey = (it: Item): string =>
	`${it.lhs}->${it.rhs.map(s => (isTerminal(s) ? `'${s.value}'` : s.name)).join(' ')}@${it.dot}`

/** closure(I): если A→α·Bβ и B нетерминал, добавляем все B→·γ */
function closure(grammar: Grammar, items: Item[]): Set<Item> {
	const C = new Map<string, Item>()
	// инициализация
	for (const it of items) {
		C.set(itemKey(it), it)
	}

	let added = true
	while (added) {
		added = false
		for (const it of Array.from(C.values())) {
			// если точка перед нетерминалом B
			if (it.dot < it.rhs.length && isNonTerminal(it.rhs[it.dot]!)) {
				// @ts-expect-error
				const B = it.rhs[it.dot].name
				const prods = grammar[B] || []
				for (const prod of prods) {
					const newIt: Item = {lhs: B, rhs: prod, dot: 0}
					const key = itemKey(newIt)
					// eslint-disable-next-line max-depth
					if (!C.has(key)) {
						C.set(key, newIt)
						added = true
					}
				}
			}
		}
	}

	return new Set(C.values())
}

/**
 * goto(items, x): для всех A→α·Xβ в items берем A→αX·β, собираем и делаем closure
 */
function goto(grammar: Grammar, items: Set<Item>, x: Symbol): Set<Item> {
	const moved: Item[] = []
	for (const it of items) {
		if (it.dot < it.rhs.length) {
			const sym = it.rhs[it.dot] as Symbol
			if ((isTerminal(sym) && isTerminal(x) && sym.value === x.value) || (isNonTerminal(sym) && isNonTerminal(x) && sym.name === x.name)) {
				moved.push({lhs: it.lhs, rhs: it.rhs, dot: it.dot + 1})
			}
		}
	}
	return closure(grammar, moved)
}

/**
 * Построить всю коллекцию LR(0)-состояний C и переходы.
 * Возвращает [C, transitions], где transitions["i|Xvalue"] = j.
 */
function buildLR0Collection(grammar: Grammar, start: string): [
	states: Set<Item>[],
	transitions: Map<string, number>,
] {
	// 1) вначале вводим S' → ·S
	const S1 = start + '\''  // например, если start = S, то S' = S'
	if (grammar[S1]) {
		throw new Error(`collision: augmented start ${S1} already exists`)
	}
	grammar[S1] = [[newNonTerminal(start)]]

	// 2) начальное состояние
	const initItem: Item = {
		lhs: S1,
		rhs: grammar[S1]![0]!,
		dot: 0,
	}
	const I0 = closure(grammar, [initItem])

	const C: Set<Item>[] = [I0]
	const transitions = new Map<string, number>()

	for (let i = 0; i < C.length; i++) {
		const items = C[i] as Set<Item>
		// собрать все возможные X (терминалы+нетерминалы), встречающиеся сразу после точки
		const symbolsAfterDot = new Map<string, Symbol>()
		for (const it of items) {
			if (it.dot < it.rhs.length) {
				const x = it.rhs[it.dot] as Symbol
				const key = isTerminal(x) ? `T:${x.value}` : `N:${x.name}`
				symbolsAfterDot.set(key, x)
			}
		}

		// для каждого X делаем переход
		for (const X of symbolsAfterDot.values()) {
			const J = goto(grammar, items, X)
			if (J.size === 0) {
				continue
			}

			// проверить, не в C ли уже
			let jIndex = C.findIndex(set => {
				const a = Array.from(set).map(itemKey).sort().join('|')
				const b = Array.from(J).map(itemKey).sort().join('|')
				return a === b
			})
			if (jIndex < 0) {
				jIndex = C.length
				C.push(J)
			}

			// запомнить переход i --X--> jIndex
			const symValue = isTerminal(X) ? X.value : X.name
			transitions.set(`${i}|${symValue}`, jIndex)
		}
	}

	return [C, transitions]
}

export type {
	Item,
}
export {
	closure,
	goto,
	buildLR0Collection,
}