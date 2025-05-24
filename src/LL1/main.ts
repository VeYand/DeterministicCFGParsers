import {checkProductive, checkReachable} from './grammar/checker'
import {Grammar} from './grammar/grammar'
import {parseGrammar} from './grammar/parser'
import {eliminateLeftRecursion} from './grammar/refactorer'

const input = `
S -> BEGIN stmt_list recursion END
stmt_list -> BEGIN
recursion -> recursion END | END
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