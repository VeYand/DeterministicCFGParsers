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

const isTerminal = (s: Symbol): s is Terminal => s.type === 'terminal'

const isNonTerminal = (s: Symbol): s is NonTerminal => s.type === 'nonterminal'

export type {
	Terminal,
	NonTerminal,
	Symbol,
	Grammar,
	Production,
}

export {
	EPSILON,
	newTerminal,
	newNonTerminal,
	isTerminal,
	isNonTerminal,
}
