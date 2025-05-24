import {parseGrammar} from './grammar/parser'

const input = `
S -> BEGIN stmt_list END
expr -> term expr2
expr2 -> PLUS term expr2 | ε
`

const ll = () => {
	const grammar = parseGrammar(input)

	console.log(JSON.stringify(grammar, null, 2))
}

if (require.main === module) {
	ll()
}

export {}