import {checkProductive, checkReachable} from './grammar/checker'
import {Grammar} from './grammar/grammar'
import {parseGrammar} from './grammar/parser'

const input = `
S -> BEGIN stmt_list END
stmt_list -> BEGIN
`

const parseGrammarAndCheck = (inputGrammar: string): Grammar => {
	const [grammar, firstNonTerminal] = parseGrammar(inputGrammar)

	checkReachable(grammar, firstNonTerminal)
	checkProductive(grammar)

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