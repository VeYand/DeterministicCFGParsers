import {checkProductive, checkReachable} from './grammar/checker'
import {Grammar} from './grammar/grammar'
import {parseGrammar} from './grammar/parser'
import {convertToGreibach, eliminateLeftRecursion, leftFactorGrammar} from './grammar/refactorer'

const inputRecursive = `
S -> S PLUS T | T
T -> T MINUS F | F
F -> LESS S GREATER | IDENTIFIER
`

// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const inputFactor = `
A -> PLUS MINUS
A -> PLUS MINUS IDENTIFIER
A -> BEGIN END DOT
A -> BEGIN END COMMA
`

const parseGrammarAndCheck = (inputGrammar: string): Grammar => {
	let [grammar, firstNonTerminal] = parseGrammar(inputGrammar)

	checkReachable(grammar, firstNonTerminal)
	checkProductive(grammar)

	grammar = eliminateLeftRecursion(grammar)
	grammar = convertToGreibach(grammar)
	grammar = leftFactorGrammar(grammar)

	return grammar
}

const ll = () => {
	const grammar = parseGrammarAndCheck(inputRecursive)

	console.log(JSON.stringify(grammar, null, 2))
}

if (require.main === module) {
	ll()
}

export {}