import {DIGIT, EXPONENT, LETTER, LETTER_OR_DIGIT, NUMBER, SPACE} from './const'

class TokenType {
	constructor(
		public name: string,
		public regex: string,
	) {
	}

	toString() {
		return this.name
	}
}

const TOKEN_TYPES: TokenType[] = [
	new TokenType('BLOCK_COMMENT', '{{.*}}'),
	new TokenType('LINE_COMMENT', '//.*\\n'),
	new TokenType('ARRAY', '(A|a)(R|r)(R|r)(A|a)(Y|y)'),
	new TokenType('BEGIN', '(B|b)(E|e)(G|g)(I|i)(N|n)'),
	new TokenType('ELSE', '(E|e)(L|l)(S|s)(E|e)'),
	new TokenType('END', '(E|e)(N|n)(D|d)'),
	new TokenType('IF', '(I|i)(F|f)'),
	new TokenType('OF', '(O|o)(F|f)'),
	new TokenType('OR', '(O|o)(R|r)'),
	new TokenType('PROGRAM', '(P|p)(R|r)(O|o)(G|g)(R|r)(A|a)(M|m)'),
	new TokenType('PROCEDURE', '(P|p)(R|r)(O|o)(C|c)(E|e)(D|d)(U|u)(R|r)(E|e)'),
	new TokenType('THEN', '(T|t)(H|h)(E|e)(N|n)'),
	new TokenType('TYPE', '(T|t)(Y|y)(P|p)(E|e)'),
	new TokenType('INT', '(I|i)(N|n)(T|t)'),
	new TokenType('REAL', '(R|r)(E|e)(A|a)(L|l)'),
	new TokenType('CHAR', '(C|c)(H|h)(A|a)(R|r)'),
	new TokenType('LOOP', '(L|l)(O|o)(O|o)(P|p)'),
	new TokenType('WHILE', '(W|w)(H|h)(I|i)(L|l)(E|e)'),
	new TokenType('DO', '(D|d)(O|o)'),
	new TokenType('TO', '(T|t)(O|o)'),
	new TokenType('WRITE', '(W|w)(R|r)(I|i)(T|t)(E|e)'),
	new TokenType('WRITELN', '(W|w)(R|r)(I|i)(T|t)(E|e)(L|n)(N|n)'),
	new TokenType('FOR', '(F|f)(O|o)(R|r)'),
	new TokenType('VAR', '(V|v)(A|a)(R|r)'),
	new TokenType('READ', '(R|r)(E|e)(A|a)(D|d)'),
	new TokenType('VAR', '(V|v)(A|a)(R|r)'),
	new TokenType('AND', '(A|a)(N|n)(D|d)'),
	new TokenType('DIV', '(D|d)(I|i)(V|v)'),
	new TokenType('MOD', '(M|m)(O|o)(D|d)'),
	new TokenType('MULTIPLICATION', '\\*'),
	new TokenType('PLUS', '\\+'),
	new TokenType('MINUS', '-'),
	new TokenType('NOT', '(N|n)(O|o)(T|t)'),
	new TokenType('TRUE', '(T|t)(R|r)(U|u)(E|e)'),
	new TokenType('FALSE', '(F|f)(A|a)(L|l)(S|s)(E|e)'),
	new TokenType('DIVIDE', '/'),
	new TokenType('SEMICOLON', ';'),
	new TokenType('COMMA', ','),
	new TokenType('LEFT_PAREN', '\\('),
	new TokenType('RIGHT_PAREN', '\\)'),
	new TokenType('LEFT_BRACKET', '\\['),
	new TokenType('RIGHT_BRACKET', '\\]'),
	new TokenType('EQ', '=='),
	new TokenType('LESS_EQ', '<='),
	new TokenType('GREATER_EQ', '>='),
	new TokenType('NOT_EQ', '!='),
	new TokenType('GREATER', '>'),
	new TokenType('LESS', '<'),
	new TokenType('ASSIGN', ':='),
	new TokenType('COLON', ':'),
	new TokenType('DOT', '\\.'),
	new TokenType('IDENTIFIER', `(${LETTER}|_)(${LETTER_OR_DIGIT}|_)*`),
	new TokenType('STRING', '\'.*\''),
	new TokenType('FLOAT', `${DIGIT}*(${EXPONENT}|(\\.${DIGIT}+(${EXPONENT}|ε)))`),
	new TokenType('INTEGER', NUMBER),
	new TokenType('SPACE', SPACE),
	new TokenType('BAD_STRING', '\'.*'),
	new TokenType('BAD_BLOCK_COMMENT', '{.*'),
	new TokenType('#', '#'),
	new TokenType('BAD', '.*'),
]

export {
	TokenType,
	TOKEN_TYPES,
}