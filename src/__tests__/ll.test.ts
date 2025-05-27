import { runLL1 } from '../LL1/main'
import conditionTests from './test-data/inputExamples'

const normalize = (str: string) => str.replace(/\s+/g, ' ').trim()

describe('LL(1) Pascal Condition Tests (should NOT parse, non-productive)', () => {
	const tests = conditionTests.pascalConditionTests

	for (const [name, { grammar, input }] of Object.entries(tests)) {
		test(name, () => {
			expect(() => runLL1(normalize(grammar), normalize(input), false))
				.toThrow(/non-productive/i)
		})
	}
})

describe('LL(1) Left Recursion Elimination Tests (should NOT parse, non-productive)', () => {
	const tests = conditionTests.leftRecursionTests

	for (const [name, { grammar, description }] of Object.entries(tests)) {
		test(description || name, () => {
			expect(() => runLL1(normalize(grammar), '', false))
				.toThrow(/non-productive/i)
		})
	}
})

describe('LL(1) Left Factoring Tests (should NOT parse, non-productive)', () => {
	const tests = conditionTests.leftFactoringTests

	for (const [name, { grammar, description }] of Object.entries(tests)) {
		test(description || name, () => {
			expect(() => runLL1(normalize(grammar), '', false))
				.toThrow(/non-productive/i)
		})
	}
})

describe('Unreachable Nonterminals (should throw error)', () => {
	const tests = conditionTests.unreachableTests

	for (const [name, { grammar, description }] of Object.entries(tests)) {
		test(description || name, () => {
			expect(() => runLL1(normalize(grammar), '', false))
				.toThrow(/non-productive|unproductive/i)
		})
	}
})

describe('Unproductive Nonterminals (should throw error)', () => {
	const tests = conditionTests.unproductiveTests

	for (const [name, { grammar, description }] of Object.entries(tests)) {
		test(description || name, () => {
			expect(() => runLL1(normalize(grammar), '', false))
				.toThrow(/non-productive|unproductive/i)
		})
	}
})
