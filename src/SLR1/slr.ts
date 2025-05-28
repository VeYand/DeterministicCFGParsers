import {computeFirst, computeFollow} from '../common/grammar/firstfollowset'
import {Grammar, Symbol, isTerminal} from '../common/grammar/grammar'
import {buildLR0Collection, Item} from './lr0'

type ShiftAction = {type: 'shift', to: number}
type ReduceAction = {type: 'reduce', prod: {lhs: string, rhs: Symbol[]}}
type AcceptAction = {type: 'accept'}
type Action = ShiftAction | ReduceAction | AcceptAction

type SLRTable = {
	ACTION: Record<number, Record<string, Action>>,
	GOTO: Record<number, Record<string, number>>,
}

/**
 * Построить SLR(1)-таблицу для заданной грамматики и стартового нетерминала.
 * @param grammar — исходная (не факторизованная, без преобразования в Грейбах) грамматика
 * @param start — стартовый нетерминал
 */
function buildSLRTable(grammar: Grammar, start: string): SLRTable {
	// 1) строим LR(0)-автомат
	const [states, trans] = buildLR0Collection(grammar, start)

	// 2) FIRST / FOLLOW
	const first = computeFirst(grammar)
	const follow = computeFollow(grammar, start, first)

	const ACTION: Record<number, Record<string, Action>> = {}
	const GOTO: Record<number, Record<string, number>> = {}

	// helper: записать в ACTION[i][a], проверяя конфликт, но предпочитая shift над reduce
	function setAction(i: number, a: string, act: Action) {
		ACTION[i] = ACTION[i] || {}
		const prev = ACTION[i]![a]

		if (prev) {
			// Разрешаем только конфликт shift/reduce на ELSE (висячее else)
			if (
				a === 'ELSE'
				&& prev.type === 'reduce'
				&& act.type === 'shift'
			) {
				// разрешаем shift, игнорируя reduce
				ACTION[i]![a] = act
				return
			}

			if (
				prev.type === 'shift'
				&& act.type === 'shift'
				&& act.to === prev.to
			) {
				// разрешаем shift
				ACTION[i]![a] = act
				return
			}

			throw new Error(`SLR(1) conflict in state ${i} on '${a}': `
				+ `${JSON.stringify(prev)} vs ${JSON.stringify(act)}`)
		}

		ACTION[i]![a] = act
	}

	// 3) заполняем ACTION и GOTO
	for (let i = 0; i < states.length; i++) {
		ACTION[i] = {}
		GOTO[i] = {}

		const items = states[i] as Set<Item>

		// --- shift и accept ---
		for (const it of items) {
			// shift: A→α·aβ, где a — терминал
			if (it.dot < it.rhs.length && isTerminal(it.rhs[it.dot]!)) {
				// @ts-expect-error
				const a = it.rhs[it.dot].value
				const key = `${i}|${a}`
				const j = trans.get(key)
				if (j !== undefined) {
					setAction(i, a, {type: 'shift', to: j})
				}
			}
			// accept: S'→S· (точка в конце расширенного старта)
			if (it.lhs === start + '\'' && it.dot === it.rhs.length) {
				setAction(i, '$', {type: 'accept'})
			}
		}

		// --- reduce ---
		for (const it of items) {
			if (it.dot === it.rhs.length && it.lhs !== start + '\'') {
				// A→α·
				const prod = {lhs: it.lhs, rhs: it.rhs}
				// для каждого a ∈ FOLLOW(A)
				for (const a of follow.get(it.lhs)!) {
					// НЕ создаём reduce-пункт для ε-продукции else_part при lookahead 'ELSE'
					// eslint-disable-next-line max-depth
					if (
						it.rhs.length === 0           // ε-продукция
						&& it.lhs === 'else_part'
						&& a === 'ELSE'
					) {
						continue
					}
					setAction(i, a, {type: 'reduce', prod})
				}
			}
		}

		// --- GOTO для нетерминалов ---
		for (const Xstate of Array.from(trans.keys())) {
			const [si, sym] = Xstate.split('|') as [string, string]
			const siNum = Number(si)
			if (siNum === i && grammar[sym]) {
				// sym — нетерминал, поскольку есть правило grammar[sym]
				GOTO[i]![sym] = trans.get(Xstate)!
			}
		}
	}

	return {ACTION, GOTO}
}

export type {
	ShiftAction,
	ReduceAction,
	AcceptAction,
	Action,
	SLRTable,
}

export {
	buildSLRTable,
}