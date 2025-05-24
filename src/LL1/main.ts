import {checkProductive, checkReachable} from './grammar/checker'
import {Grammar} from './grammar/grammar'
import {parseGrammar} from './grammar/parser'
import {eliminateLeftRecursion} from './grammar/refactorer'

const input = `
S -> S PLUS T | T
T -> T MINUS F | F
F -> LESS S GREATER | IDENTIFIER
`

const parseGrammarAndCheck = (inputGrammar: string): Grammar => {
	let [grammar, firstNonTerminal] = parseGrammar(inputGrammar)

	checkReachable(grammar, firstNonTerminal)
	checkProductive(grammar)

	grammar = eliminateLeftRecursion(grammar)

	return grammar
}

const ll = () => {
	const grammar = parseGrammarAndCheck(input)

	console.log(JSON.stringify(grammar, null, 2))
}

if (require.main === module) {
	ll()
}

export {}