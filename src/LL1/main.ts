import {checkProductive, checkReachable} from './grammar/checker'
import {parseGrammar} from './grammar/parser'
import {convertToGreibach, eliminateLeftRecursion, leftFactorGrammar} from './grammar/refactorer'
import {parseInput} from './table/driver'

const inputGrammarPascal = `
S -> IDENTIFIER
`

const inputPascalProgram = `
myVar
`

/** Full LL(1) pipeline: grammar-string + input-string → success boolean */
const runLL1 = (grammarText: string, inputText: string): boolean => {
	let [grammar, start] = parseGrammar(grammarText)
	checkReachable(grammar, start)
	checkProductive(grammar)

	grammar = eliminateLeftRecursion(grammar)
	grammar = convertToGreibach(grammar)
	grammar = leftFactorGrammar(grammar)

	return parseInput(grammar, start, inputText)
}


if (require.main === module) {
	runLL1(inputGrammarPascal, inputPascalProgram)
}

export {}