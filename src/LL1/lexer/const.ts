const LETTER_LOWER = '(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)'
const LETTER_UPPER = '(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)'
const LETTER = `(${LETTER_LOWER}|${LETTER_UPPER})`
const DIGIT_NO_ZERO = '(1|2|3|4|5|6|7|8|9)'
const DIGIT = `(0|${DIGIT_NO_ZERO})`
const NUMBER = `(${DIGIT}|${DIGIT_NO_ZERO}${DIGIT}*)`
const LETTER_OR_DIGIT = `(${LETTER}|${DIGIT})`
const SPACE = `( |\\n|\\t|\\r)`
const DIVIDER = `(${SPACE}|"|\\(|\\)|\\+|-|;|:|,|\\.|\\[|\\]|\\{|\\}|\\*|/|'|\\xa0|<|>|=)`
const EXPONENT = `(E(\\+|-|ε)${DIGIT}+)`

export {
	LETTER_LOWER,
	LETTER_UPPER,
	LETTER,
	DIGIT_NO_ZERO,
	DIGIT,
	NUMBER,
	LETTER_OR_DIGIT,
	SPACE,
	DIVIDER,
	EXPONENT,
}