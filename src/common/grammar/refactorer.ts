import {EPSILON, Grammar, isTerminal, newNonTerminal, Production, Symbol} from './grammar'

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

/**
 * Преобразует грамматику в «нестрогую» нормальную форму Грейбаха:
 * — каждая правая часть начинается либо с терминала, либо с ε;
 * — за первым терминалом может идти любая череда нетерминалов.
 *
 * Требования к входной грамматике:
 * 1. Нет недостижимых/непродуктивных нетерминалов
 * 2. Нет левой рекурсии (в том числе косвенной)
 *
 * @param orig — исходная грамматика
 * @param depthLimit — ограничитель глубины развёртывания, по умолчанию 20
 */
const convertToGreibach = (
	orig: Grammar,
	depthLimit = 20,
): Grammar => {
	const result: Grammar = {}
	const nts = Object.keys(orig)

	// Проверяем базовые предпосылки
	for (const A of nts) {
		const prods = orig[A]
		if (!prods || prods.length === 0) {
			throw new Error(`Nonterminal "${A}" has no productions`)
		}
	}

	// Рекурсивная функция: разворачивает продукцию пока не начнётся с терминала/ε
	function expand(prod: Production, depth = 0): Production[] {
		if (depth > depthLimit) {
			throw new Error(`Depth limit (${depthLimit}) exceeded in GNF conversion`)
		}
		// Если пустая или уже с терминала — оставляем как есть
		if (
			prod.length === 0
			|| (prod[0]?.type === 'terminal' && prod[0].value !== EPSILON.value)
			|| (prod[0]?.type === 'terminal' && prod[0].value === EPSILON.value)
		) {
			return [prod]
		}
		// Начинается с нетерминала — подставляем все его альтернативы
		if (prod[0]?.type === 'nonterminal') {
			const B = prod[0].name
			const tail = prod.slice(1)
			const Bprods = orig[B]
			if (!Bprods) {
				throw new Error(`Nonterminal "${B}" not found in grammar`)
			}
			const expanded: Production[] = []
			for (const gamma of Bprods) {
				// gamma может быть ε
				if (gamma.length === 1 && gamma[0]?.type === 'terminal' && gamma[0].value === EPSILON.value) {
					// B → ε, тогда получаем просто tail
					expanded.push([...tail])
				}
				else {
					expanded.push([...gamma, ...tail])
				}
			}
			// Рекурсивно обрабатываем полученные
			return expanded.flatMap(p => expand(p, depth + 1))
		}

		// Любой другой случай — ошибка
		throw new Error(`Cannot expand production: ${JSON.stringify(prod)}`)
	}

	// Собираем новые правила
	for (const A of nts) {
		result[A] = []
		for (const prod of orig[A]!) {
			const exps = expand(prod)
			for (const e of exps) {
				if (e.length === 0) {
					// ε-разрешаем только если это ε-продукция исходного
					// eslint-disable-next-line max-depth
					if (!prod.some(s => isTerminal(s) && s.value === EPSILON.value)) {
						throw new Error(`Unexpected empty production for ${A}`)
					}
					result[A]?.push([EPSILON])
				}
				else if (isTerminal(e[0]!)) {
					result[A]?.push(e)
				}
				else {
					// если после развёртки всё ещё нетерминал впереди — ошибка
					throw new Error(
						`Production for ${A} does not start with terminal/ε even after expansion: ${JSON.stringify(
							e,
						)}`,
					)
				}
			}
		}
		if (result[A]?.length === 0) {
			throw new Error(`No valid GNF productions generated for "${A}"`)
		}
	}

	return result
}


/**
 * Выполняет левую факторизацию грамматики:
 * для каждого нетерминала A, у которого есть ≥2 продукции с общим префиксом,
 * выделяет этот префикс в отдельный нетерминал AFact…
 *
 * Особые случаи:
 * - ε-продукции ([]) всегда сохраняются без изменений.
 * - Если общий префикс пуст, факторизация не выполняется.
 * - Генерируем имена AFact, AFact1, …, избегая коллизий.
 * - Итеративно повторяем до тех пор, пока больше нигде не будет факторов.
 */
const leftFactorGrammar = (orig: Grammar): Grammar => {
	// Копия входа, чтобы не мутировать
	let current = {...orig}
	const existingNT = new Set(Object.keys(orig))

	// Ключ для символа в Map
	const symbolKey = (s: Symbol): string =>
		(s.type === 'terminal'
			? `T:${s.value}`
			: `N:${s.name}`)

	// Проверка равенства символов
	const symbolEqual = (a: Symbol, b: Symbol): boolean =>
		a.type === b.type
		&& (a.type === 'terminal'
			? a.value === (b as any).value
			: a.name === (b as any).name)

	let changed: boolean

	do {
		changed = false
		const next: Grammar = {}

		for (const A of Object.keys(current)) {
			const prods = current[A]!
			if (prods.length < 2) {
				// нечего факторизовать
				next[A] = [...prods]
				continue
			}

			// Разделяем ε-продукции отдельно
			const epsProds = prods.filter(p => p.length === 1 && p[0]?.type === 'terminal' && p[0].value === EPSILON.value)
			const nonEps = prods.filter(p => !(p.length === 1 && p[0]?.type === 'terminal' && p[0].value === EPSILON.value))

			// Группируем по первому символу
			const groups = new Map<string, Production[]>()
			for (const p of nonEps) {
				if (p.length === 0) {
					continue
				}
				const key = symbolKey(p[0]!)
				const arr = groups.get(key) ?? []
				arr.push(p)
				groups.set(key, arr)
			}

			const factProds: Production[] = []
			const addedNTs: [string, Production[]][] = []

			for (const group of groups.values()) {
				if (group.length === 1) {
					// одиночная продукция переходит как есть
					factProds.push(group[0]!)
					continue
				}

				// Найдём самый длинный общий префикс
				let prefix = group[0] as Production
				for (const p of group.slice(1)) {
					let i = 0
					// eslint-disable-next-line max-depth
					while (
						i < prefix.length
						&& i < p.length
						&& symbolEqual(prefix[i]!, p[i]!)
					) {
						i++
					}
					prefix = prefix.slice(0, i)
					// eslint-disable-next-line max-depth
					if (prefix.length === 0) {
						break
					}
				}
				if (prefix.length === 0) {
					// ничего не факторизуем, переливаем группу
					factProds.push(...group)
					continue
				}

				// Факторизуем по prefix
				changed = true
				// создаём новый нетерминал
				let factName = `${A}Fact`
				let idx = 1
				while (existingNT.has(factName)) {
					factName = `${A}Fact${idx++}`
				}
				existingNT.add(factName)
				const factNT = newNonTerminal(factName)

				// A → prefix factNT
				factProds.push([...prefix, factNT])

				// factNT → остатки (или ε)
				const factBodies: Production[] = group.map(p => {
					const suffix = p.slice(prefix.length)
					return suffix.length === 0
						? [EPSILON]
						: suffix
				})
				addedNTs.push([factName, factBodies])
			}

			// Собираем новые продукции A
			next[A] = [
				...factProds,
				...epsProds,  // ε-продукции в конец
			]

			// Добавляем новые нетерминалы
			for (const [ntName, bodies] of addedNTs) {
				next[ntName] = bodies
			}
		}

		current = next
	} while (changed)

	return current
}


export {
	eliminateLeftRecursion,
	convertToGreibach,
	leftFactorGrammar,
}
