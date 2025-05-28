import {checkProductive, checkReachable} from '../common/grammar/checker'
import {parseGrammar} from '../common/grammar/parser'
import {dumpGrammarToFile} from '../common/utils/print'
import {parseSLR} from './runner'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const inputGrammarPascal = `
program -> PROGRAM identifier SEMICOLON block DOT

block -> var_declaration BEGIN statement_sequence END

var_declaration -> VAR var_list | ε
var_list -> identifier_list COLON type SEMICOLON var_list_tail
identifier_list -> identifier COMMA identifier_list | identifier
type -> ARRAY LEFT_BRACKET number DOT DOT number RIGHT_BRACKET OF primitive_type | primitive_type
var_list_tail -> var_list | ε
primitive_type -> INT | CHAR

statement_sequence -> non_empty_statement_sequence | ε
non_empty_statement_sequence -> non_empty_statement
non_empty_statement -> statement | non_empty_statement SEMICOLON statement

statement -> assignment | if_statement | for_loop | compound_statement | writeln_call

assignment -> variable ASSIGN expression
variable -> identifier | identifier LEFT_BRACKET expression RIGHT_BRACKET

if_statement -> IF condition THEN statement else_part
else_part -> ELSE statement | ε
compound_statement -> BEGIN statement_sequence END

for_loop -> FOR identifier ASSIGN number TO expression DO statement

writeln_call -> WRITELN LEFT_PAREN expression RIGHT_PAREN

expression -> simple_expression | simple_expression relop simple_expression
simple_expression -> term addop simple_expression | term
term -> factor mulop term | factor
factor -> number | variable | LEFT_PAREN expression RIGHT_PAREN | addop factor

condition -> expression
relop -> EQ | NOT_EQ | LESS | LESS_EQ | GREATER | GREATER_EQ
addop -> PLUS | MINUS | OR
mulop -> MULTIPLICATION | DIV | MOD | AND
number -> INTEGER
identifier -> IDENTIFIER
`


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const inputPascalProgram = `
PROGRAM SortArray;
VAR
	a: ARRAY[1..5] OF INT;
	i, j, t: INT;
BEGIN
	a[1] := 5;
	a[2] := 3;
	a[3] := 4;
	a[4] := 1 - -2;
	a[5] := 2;
	
	FOR i := 1 TO 4
	DO
		FOR j := 1 TO 5 - i
		DO
			IF a[j] > a[j + 1]
			THEN
				BEGIN
					t := a[j];
					a[j] := a[j + 1];
					a[j + 1] := t
				END
			ELSE
				BEGIN
				END;
	FOR i := 1 TO 5
	DO
		WRITELN(a[i]);
	IF a
	THEN
	    a := a
END.
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const grammarSR = `
A -> A PLUS
A -> PLUS B
B -> B PLUS
B -> PLUS
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const programSR = `+ +`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const grammarLeft = `
E -> E PLUS EQ | EQ
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const programLeft = `== + == + ==`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const grammarRight = `
L -> EQ | EQ COMMA L
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const programRight = `== , == , ==`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const grammarUnreach = `
S -> EQ
A -> COMMA
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const programUnreach = `==`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const grammarUnprod = `
S -> A
A -> B
B -> C
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const programUnprod = ``

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