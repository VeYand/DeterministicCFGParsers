import {EPSILON, Grammar, newNonTerminal, Production} from './grammar'

/**
 * Убирает немедленную левую рекурсию из грамматики.
 * Если для нетерминала A нет "A → A α" продукций,
 * он копируется без изменений.
 * Обрабатываются следующие кейсы:
 * - неявные ошибки при пустом множестве альтернатив
 * - отсутствие "β" (все продукции левые) ⇒ ошибка
 * - коллизия имени A2 с существующим нетерминалом ⇒ ошибка.
 */
const eliminateLeftRecursion = (orig: Grammar): Grammar => {
	const result: Grammar = {}
	const existingNT = new Set(Object.keys(orig))

	for (const A of Object.keys(orig)) {
		const prods = orig[A]
		if (!prods || prods.length === 0) {
			throw new Error(`Nonterminal "${A}" has no productions`)
		}

		const leftRec: Production[] = []
		const nonLeft: Production[] = []
		for (const prod of prods) {
			// пустая продукция не допускается здесь (ε-нет здесь)
			if (prod.length > 0 && prod[0]?.type === 'nonterminal' && prod[0].name === A) {
				leftRec.push(prod.slice(1))
			}
			else {
				nonLeft.push(prod)
			}
		}

		// отсутствие левой рекурсии -> копируем все руки
		if (leftRec.length === 0) {
			result[A] = [...prods]
			continue
		}

		// должны быть ненулевые β
		if (nonLeft.length === 0) {
			throw new Error(
				`Grammar for "${A}" is left-recursive in all alternatives; cannot eliminate`,
			)
		}

		const AprimeName = `${A}2`
		if (existingNT.has(AprimeName)) {
			throw new Error(`Cannot create ${AprimeName}: name collision with existing nonterminal`)
		}
		existingNT.add(AprimeName)
		const Aprime = newNonTerminal(AprimeName)

		// A -> β A'
		result[A] = nonLeft.map(beta =>
			// если β == [ε], просто A' без дублирования ε
			(beta.length === 1 && beta[0]?.type === 'terminal' && beta[0].value === EPSILON.value
				? [Aprime]
				: [...beta, Aprime]),
		)

		// A' -> α A' | ε
		result[AprimeName] = [
			...leftRec.map(alpha => [...alpha, Aprime]),
			[EPSILON],
		]
	}

	return result
}

export {
	eliminateLeftRecursion,
}
