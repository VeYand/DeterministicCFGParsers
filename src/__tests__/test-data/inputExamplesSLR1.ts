
const conditionTests = {
	'grammar1' : `
        S -> A B C
        A -> A a | e
        B -> B b | e
        C -> C c | e
    `,
	'grammar2': `
        E -> E + T
        E -> T
        T -> T * F | F
        F -> ( E )
    `,
    'grammar3' : `
        F -> S
        S -> id = E | while E do S
        E -> E + E | id
    `,
	'grammar4': `
        F -> function I ( I ) G end
        G -> I := E | I := E ; G
        E -> E * I | E + I | I
        I -> a | b
    `,
    'grammar5' : `
        S -> A B
        A -> a | c A
        B -> b | b A
    `,
	'grammar6': `
        F -> C
        C -> f C | f B | a B | a d | f a
        B -> B a | B b | c
    `,
    'grammar7' : `
        Z -> S
        S -> S * i | i
    `,
	'grammar8': `
        S -> S A
        S -> A
        A -> ( S ) | ( )
    `,
    'grammar9': `
        S -> E
        E -> E + T | T
        T -> T * F | F
        F -> - F
        F -> ( E )
        F -> id | num
    `,
}


export default conditionTests