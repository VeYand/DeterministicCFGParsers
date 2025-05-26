import {checkProductive, checkReachable} from '../common/grammar/checker'
import {parseGrammar} from '../common/grammar/parser'
import {convertToGreibach, eliminateLeftRecursion, leftFactorGrammar} from '../common/grammar/refactorer'
import {parseInput} from './table/driver'
import {dumpGrammarToFile} from './utils/print'

const inputGrammarPascal = `
Program  -> PROGRAM IDENTIFIER SEMICOLON Block DOT

Block    -> Decls BEGIN Stmts END

Decls    -> VAR VarList | ε
VarList  -> IDENTIFIER COLON Type SEMICOLON VarList | IDENTIFIER COLON Type SEMICOLON

Type     -> INT | REAL | CHAR

Stmts  -> Stmt StmtsTail
StmtsTail -> SEMICOLON Stmt StmtsTail | ε
Stmt     -> IDENTIFIER ASSIGN Expr | IF Expr THEN Stmt | WHILE Expr DO Stmt

Expr     -> Term Expr2
Expr2    -> PLUS Term Expr2 | MINUS Term Expr2 | ε

Term     -> Factor Term2
Term2    -> MULTIPLICATION Factor Term2 | DIVIDE Factor Term2 | ε

Factor   -> LEFT_PAREN Expr RIGHT_PAREN | IDENTIFIER | INTEGER | REAL
`


const inputPascalProgram = `
PROGRAM Demo;
VAR x: INT;
BEGIN
  x := 10;
  x := x + 5 * (x - 2)
END.
`

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