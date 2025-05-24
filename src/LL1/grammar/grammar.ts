type Terminal = {type: 'terminal', value: string}
type NonTerminal = {type: 'nonterminal', name: string}
type Symbol = Terminal | NonTerminal

const EPSILON: Terminal = {type: 'terminal', value: 'ε'}

type Production = Symbol[]

type Grammar = {
	[nonTerminal: string]: Production[],
}

const newTerminal = (value: string): Terminal => ({type: 'terminal', value})
const newNonTerminal = (name: string): NonTerminal => ({type: 'nonterminal', name})

export type {
	Terminal,
	NonTerminal,
	Symbol,
	Grammar,
}

export {
	EPSILON,
	newTerminal,
	newNonTerminal,
}
