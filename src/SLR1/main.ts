import {checkProductive, checkReachable} from '../common/grammar/checker'
import {parseGrammar} from '../common/grammar/parser'
import {dumpGrammarToFile} from '../common/utils/print'
import {parseSLR} from './runner'

const inputGrammarPascal = `
S -> IDENTIFIER ASSIGN E
E -> E PLUS T | T
T -> T MINUS F | F
F -> LEFT_PAREN E RIGHT_PAREN | IDENTIFIER | INTEGER
`


const inputPascalProgram = `
x := 5 + y - 3
`

const runSLR1 = (grammarText: string, inputText: string, debug = true) => {
	const [grammar, start] = parseGrammar(grammarText)

	if (debug) {
		dumpGrammarToFile(grammar, start, 'slr/original_grammar.txt')
	}

	checkReachable(grammar, start)
	checkProductive(grammar)


	const ok = parseSLR(grammar, start, inputText, debug)
	console.log('Parse success:', ok)
}


if (require.main === module) {
	runSLR1(inputGrammarPascal, inputPascalProgram)
}

export {}