import {Grammar} from './grammar'

/**
 * Проверка достижимости нетерминалов: из стартового можно достичь все
 */
const checkReachable = (grammar: Grammar, start: string): void => {
	const visited = new Set<string>()
	const stack = [start]
	while (stack.length) {
		const A = stack.pop()!
		if (!visited.has(A)) {
			visited.add(A)
			const prods = grammar[A] || []
			for (const prod of prods) {
				for (const sym of prod) {
					// eslint-disable-next-line max-depth
					if (sym.type === 'nonterminal') {
						const B = sym.name
						// eslint-disable-next-line max-depth
						if (!visited.has(B)) {
							stack.push(B)
						}
					}
				}
			}
		}
	}
	const nonTerms = Object.keys(grammar)
	const unreachable = nonTerms.filter(a => !visited.has(a))
	if (unreachable.length) {
		throw new Error(`Unreachable nonterminals: ${unreachable.join(', ')}`)
	}
}

/**
 * Проверка продуктивности: существуют продукции, дающие только терминалы и ε.
 */
const checkProductive = (grammar: Grammar): void => {
	const productive = new Set<string>()
	let changed: boolean
	do {
		changed = false
		for (const [A, prods] of Object.entries(grammar)) {
			if (productive.has(A)) {
				continue
			}
			for (const prod of prods) {
				// продукция продуктивна, если все символы терминалы или уже продуктивные нетерминалы
				let ok = true
				for (const sym of prod) {
					// eslint-disable-next-line max-depth
					if (sym.type === 'nonterminal') {
						// eslint-disable-next-line max-depth
						if (!productive.has(sym.name)) {
							ok = false
							break
						}
					}
					// терминал или ε всегда ок
				}
				if (ok) {
					productive.add(A)
					changed = true
					break
				}
			}
		}
	} while (changed)

	const nonTerms = Object.keys(grammar)
	const unproductive = nonTerms.filter(a => !productive.has(a))
	if (unproductive.length) {
		throw new Error(`Non-productive nonterminals: ${unproductive.join(', ')}`)
	}
}

export {
	checkReachable,
	checkProductive,
}
