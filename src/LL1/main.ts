import conditionTests from '__tests__/test-data/inputExamplesLL1'
import {checkProductive, checkReachable} from '../common/grammar/checker'
import {parseGrammar} from '../common/grammar/parser'
import {convertToGreibach, eliminateLeftRecursion, leftFactorGrammar} from '../common/grammar/refactorer'
import {parseInput} from './table/driver'
import {dumpGrammarToFile} from './utils/print'

const inputGrammarPascal = conditionTests.pascalConditionTests['Simple IF'].grammar

const inputPascalProgram = conditionTests.pascalConditionTests['Simple IF'].input

/** Full LL(1) pipeline: grammar-string + input-string → success boolean */
const runLL1 = (grammarText: string, inputText: string, debug = true) => {
	let [grammar, start] = parseGrammar(grammarText)

	if (debug) {
		dumpGrammarToFile(grammar, start, 'll/original_grammar.txt')
	}

	checkReachable(grammar, start)
	checkProductive(grammar)

	grammar = eliminateLeftRecursion(grammar)
	grammar = convertToGreibach(grammar)
	grammar = leftFactorGrammar(grammar)

	if (debug) {
		dumpGrammarToFile(grammar, start, 'll/prepared_grammar.txt')
	}

	const ok = parseInput(grammar, start, inputText, debug)
	console.log('Parse success:', ok)
}


if (require.main === module) {
	runLL1(inputGrammarPascal, inputPascalProgram)
}

export {}