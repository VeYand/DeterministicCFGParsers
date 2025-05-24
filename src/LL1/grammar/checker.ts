import {
	Grammar,
	Symbol,
	EPSILON, Production,
} from './grammar'

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

/**
 * LL(1) проверка: FIRST пересечения и FIRST/ FOLLOW для ε
 */
const checkLL1 = (grammar: Grammar, start: string): void => {
	const nonTerms = Object.keys(grammar)

	// Compute FIRST sets
	const FIRST = new Map<string, Set<string>>()
	// initialize
	for (const A of nonTerms) {
		FIRST.set(A, new Set())
	}
	let changed = true
	while (changed) {
		changed = false
		for (const [A, prods] of Object.entries(grammar)) {
			const firstA = FIRST.get(A)!
			for (const prod of prods) {
				let derivesEmpty = true
				for (const sym of prod) {
					// eslint-disable-next-line max-depth
					if (sym.type === 'terminal') {
						// eslint-disable-next-line max-depth
						if (!firstA.has(sym.value)) {
							firstA.add(sym.value)
							changed = true
						}
						derivesEmpty = false
						break
					}
					else {
						const firstB = FIRST.get(sym.name)!
						// eslint-disable-next-line max-depth
						for (const t of firstB) {
							// eslint-disable-next-line max-depth
							if (t !== EPSILON.value && !firstA.has(t)) {
								firstA.add(t)
								changed = true
							}
						}
						// eslint-disable-next-line max-depth
						if (!firstB.has(EPSILON.value)) {
							derivesEmpty = false
							break
						}
					}
				}
				if (derivesEmpty && !firstA.has(EPSILON.value)) {
					firstA.add(EPSILON.value)
					changed = true
				}
			}
		}
	}

	// Compute FOLLOW sets
	const FOLLOW = new Map<string, Set<string>>()
	for (const A of nonTerms) {
		FOLLOW.set(A, new Set())
	}
	FOLLOW.get(start)!.add('$')
	changed = true
	while (changed) {
		changed = false
		for (const [A, prods] of Object.entries(grammar)) {
			for (const prod of prods) {
				for (let i = 0; i < prod.length; i++) {
					const sym = prod[i]
					// eslint-disable-next-line max-depth
					if (sym?.type === 'nonterminal') {
						const followB = FOLLOW.get(sym.name)!
						// FIRST of rest
						const restFirst = new Set<string>()
						let emptyRest = true
						// eslint-disable-next-line max-depth
						for (let j = i + 1; j < prod.length; j++) {
							const s2 = prod[j] as Symbol
							// eslint-disable-next-line max-depth
							if (s2.type === 'terminal') {
								restFirst.add(s2.value)
								emptyRest = false
								break
							}
							// eslint-disable-next-line max-depth
							for (const t of FIRST.get(s2.name)!) {
								// eslint-disable-next-line max-depth
								if (t === EPSILON.value) {
									continue
								}
								restFirst.add(t)
							}
							// eslint-disable-next-line max-depth
							if (!FIRST.get(s2.name)!.has(EPSILON.value)) {
								emptyRest = false
								break
							}
						}
						// eslint-disable-next-line max-depth
						for (const t of restFirst) {
							// eslint-disable-next-line max-depth
							if (!followB.has(t)) {
								followB.add(t)
								changed = true
							}
						}
						// eslint-disable-next-line max-depth
						if (emptyRest) {
							// eslint-disable-next-line max-depth
							for (const t of FOLLOW.get(A)!) {
								// eslint-disable-next-line max-depth
								if (!followB.has(t)) {
									followB.add(t)
									changed = true
								}
							}
						}
					}
				}
			}
		}
	}

	// Проверяем пары альтернатив для каждого нетерминала
	for (const [A, prods] of Object.entries(grammar)) {
		for (let i = 0; i < prods.length; i++) {
			for (let j = i + 1; j < prods.length; j++) {
				const fi = firstOfString(prods[i] as Production, FIRST)
				const fj = firstOfString(prods[j] as Production, FIRST)
				// пересечение FIRST
				const inter = [...fi].filter(x => fj.has(x) && x !== EPSILON.value)
				if (inter.length) {
					throw new Error(
						`LL(1) conflict in ${A}: FIRST sets of alternatives ${i} and ${j} intersect on ${inter}`,
					)
				}
				// ε ∈ fi => fi_noε ∩ FOLLOW(A) = ∅
				if (fi.has(EPSILON.value)) {
					const followA = FOLLOW.get(A)!
					const conflict = [...fj].filter(x => followA.has(x))
					// eslint-disable-next-line max-depth
					if (conflict.length) {
						throw new Error(
							`LL(1) ε-conflict in ${A}: FOLLOW intersects FIRST of alt ${j} on ${conflict}`,
						)
					}
				}
				if (fj.has(EPSILON.value)) {
					const followA = FOLLOW.get(A)!
					const conflict = [...fi].filter(x => followA.has(x))
					// eslint-disable-next-line max-depth
					if (conflict.length) {
						throw new Error(
							`LL(1) ε-conflict in ${A}: FOLLOW intersects FIRST of alt ${i} on ${conflict}`,
						)
					}
				}
			}
		}
	}
}

// вспомогательная: first множества для строки символов
function firstOfString(seq: Symbol[], first: Map<string, Set<string>>): Set<string> {
	const res = new Set<string>()
	for (const sym of seq) {
		if (sym.type === 'terminal') {
			res.add(sym.value)
			return res
		}
		const fs = first.get(sym.name)!
		for (const t of fs) {
			res.add(t)
		}
		if (!fs.has(EPSILON.value)) {
			return res
		}
	}
	res.add(EPSILON.value)
	return res
}

export {
	checkReachable,
	checkProductive,
	checkLL1,
}
