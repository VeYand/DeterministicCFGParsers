import {
	Grammar,
	Symbol,
	EPSILON,
	isTerminal,
	isNonTerminal,
} from '../grammar/grammar'

type FirstSet = Map<string, Set<string>>   // A → { terminal values ∪ ε }
type FollowSet = Map<string, Set<string>>  // A → { terminal values ∪ '$' }

/**
 * Вычисляет FIRST-множества для всех нетерминалов грамматики.
 */
const computeFirst = (grammar: Grammar): FirstSet => {
	const first: FirstSet = new Map()
	// инициализация
	for (const A of Object.keys(grammar)) {
		first.set(A, new Set())
	}

	let changed = true
	while (changed) {
		changed = false

		for (const [A, prods] of Object.entries(grammar)) {
			const firstA = first.get(A)!
			for (const prod of prods) {
				let canBeEpsilon = true

				for (const sym of prod) {
					// eslint-disable-next-line max-depth
					if (isTerminal(sym)) {
						// терминал сразу добавляем
						// eslint-disable-next-line max-depth
						if (!firstA.has(sym.value)) {
							firstA.add(sym.value)
							changed = true
						}
						canBeEpsilon = false
						break
					}
					else {
						// нетерминал B
						const firstB = first.get(sym.name)!
						// eslint-disable-next-line max-depth
						for (const t of firstB) {
							// eslint-disable-next-line max-depth
							if (t !== EPSILON.value && !firstA.has(t)) {
								firstA.add(t)
								changed = true
							}
						}
						// eslint-disable-next-line max-depth
						if (firstB.has(EPSILON.value)) {
							// можем продолжить к следующему символу
							canBeEpsilon = true
						}
						else {
							canBeEpsilon = false
							break
						}
					}
				}

				// если вся правая часть могла дать ε
				if (canBeEpsilon && !firstA.has(EPSILON.value)) {
					firstA.add(EPSILON.value)
					changed = true
				}
			}
		}
	}

	return first
}

/**
 * FIRST для произвольной последовательности символов α
 */
const firstOfSequence = (seq: Symbol[], first: FirstSet): Set<string> => {
	const res = new Set<string>()
	let canBeEpsilon = true

	for (const sym of seq) {
		if (isTerminal(sym)) {
			res.add(sym.value)
			canBeEpsilon = false
			break
		}
		else {
			const firstB = first.get(sym.name)!
			for (const t of firstB) {
				if (t !== EPSILON.value) {
					res.add(t)
				}
			}
			if (firstB.has(EPSILON.value)) {
				canBeEpsilon = true
			}
			else {
				canBeEpsilon = false
				break
			}
		}
	}

	if (canBeEpsilon) {
		res.add(EPSILON.value)
	}
	return res
}

/**
 * Вычисляет FOLLOW-множества для всех нетерминалов грамматики.
 * В начало FOLLOW(start) добавляется маркер '$'.
 */
const computeFollow = (
	grammar: Grammar,
	start: string,
	first: FirstSet,
): FollowSet => {
	const follow: FollowSet = new Map()
	for (const A of Object.keys(grammar)) {
		follow.set(A, new Set())
	}
	// маркер конца
	follow.get(start)!.add('$')

	let changed = true
	while (changed) {
		changed = false

		for (const [A, prods] of Object.entries(grammar)) {
			for (const prod of prods) {
				for (let i = 0; i < prod.length; i++) {
					const sym = prod[i] as Symbol
					// eslint-disable-next-line max-depth
					if (!isNonTerminal(sym)) {
						continue
					}

					const B = sym.name
					const followB = follow.get(B)!
					const beta = prod.slice(i + 1)
					const firstBeta = firstOfSequence(beta, first)

					// добавить FIRST(beta) \ {ε} в FOLLOW(B)
					// eslint-disable-next-line max-depth
					for (const t of firstBeta) {
						// eslint-disable-next-line max-depth
						if (t !== EPSILON.value && !followB.has(t)) {
							followB.add(t)
							changed = true
						}
					}

					// если β ⇒* ε или β пусто, добавить FOLLOW(A)
					// eslint-disable-next-line max-depth
					if (beta.length === 0 || firstBeta.has(EPSILON.value)) {
						const followA = follow.get(A)!
						// eslint-disable-next-line max-depth
						for (const t of followA) {
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

	return follow
}

export {
	computeFirst,
	firstOfSequence,
	computeFollow,
}