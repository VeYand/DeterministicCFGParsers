import conditionTests from '__tests__/test-data/inputExamples'
import {checkProductive, checkReachable} from '../common/grammar/checker'
import {parseGrammar} from '../common/grammar/parser'
import {convertToGreibach, eliminateLeftRecursion, leftFactorGrammar} from '../common/grammar/refactorer'
import {parseInput} from './table/driver'
import {dumpGrammarToFile} from './utils/print'

const inputGrammarPascal = conditionTests.pascalConditionTests['Hard Pascal'].grammar

const inputPascalProgram = conditionTests.pascalConditionTests['Hard Pascal'].input

/** Full LL(1) pipeline: grammar-string + input-string → success boolean */
const runLL1 = (grammarText: string, inputText: string, debug = true): boolean => {
	let [grammar, start] = parseGrammar(grammarText)

	if (debug) {
		dumpGrammarToFile(grammar, start, 'original_grammar.txt')
	}

	checkReachable(grammar, start)
	checkProductive(grammar)

	grammar = eliminateLeftRecursion(grammar)
	grammar = convertToGreibach(grammar)
	grammar = leftFactorGrammar(grammar)

	if (debug) {
		dumpGrammarToFile(grammar, start, 'prepared_grammar.txt')
	}

	return parseInput(grammar, start, inputText, debug)
}


if (require.main === module) {
	runLL1(inputGrammarPascal, inputPascalProgram)
}

export {}