// Тесты для Pascal-подобной грамматики с условиями

const pascalConditionTests = {
	'Simple IF': {
		grammar: `
            Program  -> PROGRAM IDENTIFIER SEMICOLON Block DOT
            Block    -> BEGIN Stmts END
            Stmts    -> Stmt StmtsTail
            StmtsTail -> SEMICOLON Stmt StmtsTail | ε
            Stmt     -> IF Expr THEN Stmt ELSE Stmt | IDENTIFIER ASSIGN Expr
            Expr     -> IDENTIFIER | INTEGER
        `,
		input: `
            PROGRAM T; 
            BEGIN 
            IF x THEN 
            y := 1 
            ELSE 
            y := 2 
            END.
        `,
	},
	'Assignment Chain': {
		grammar: `
            Program  -> PROGRAM IDENTIFIER SEMICOLON Block DOT
            Block    -> BEGIN Stmts END
            Stmts    -> Stmt SEMICOLON Stmts | ε
            Stmt     -> IDENTIFIER ASSIGN IDENTIFIER
        `,
		input: `
            PROGRAM T; 
            BEGIN 
            x := y; 
            y := z 
            END.
        `,
	},
	'Nested IF': {
		grammar: `
            Program -> BEGIN Stmt END
            Stmt -> IF IDENTIFIER THEN IF IDENTIFIER THEN Stmt ELSE Stmt
        `,
		input: `
            BEGIN 
            IF x THEN
            IF y THEN 
            z := 1 
            ELSE z := 2 
            END.
        `,
	},
	'Hard Pascal': {
		grammar: `
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
        `,
		input: `
            PROGRAM Demo;
            VAR x: INT;
            BEGIN
            x := 10;
            x := x + 5 * (x - 2)
            END.
        `,
	},
}


// Факторизация (Left Factoring)
const leftFactoringTests = {
	'Classic if-else': {
		grammar: `
            S -> if E then S else S | if E then S\nE -> true | false
        `,
		description: 'Needs factoring due to shared prefix.',
	},
	'Arithmetic': {
		grammar: `
            A -> a b c | a b d
        `,
		description: 'Shared prefix \'a b\' needs factoring.',
	},
	'Command prefix': {
		grammar: `
            C -> print x | print y | print z
        `,
		description: 'All options start with \'print\'.',
	},
}

const leftRecursionTests = {
	'Simple Left Recursion': {
		grammar: `
            A -> A a | b
        `,
		description: 'Direct left recursion.',
	},
	'Indirect Left Recursion': {
		grammar: `
            S -> A a
            A -> S b | c
        `,
		description: 'Indirect left recursion through A -> S.',
	},
	'Multiple Rules': {
		grammar: `
            X -> X Y | Z
            Y -> y
            Z -> z
        `,
		description: 'Left recursive with other branches.',
	},
}

const unreachableTests = {
	'One unreachable': {
		grammar: `
            S -> A
            A -> a
            B -> b
        `,
		description: 'B is unreachable.',
	},
	'Deep unreachable': {
		grammar: `
            S -> A
            A -> B
            B -> b
            C -> c
        `,
		description: 'C is not reachable.',
	},
	'Unused nonterminal': {
		grammar: `
            S -> x
            T -> y
            U -> z
        `,
		description: 'T and U are unused.',
	},
}

const unproductiveTests = {
	'Nonproductive leaf': {
		grammar: `S -> A
            A -> B
            B -> C
            C -> D
            D -> E
            E -> F
            F -> G
            G -> H
            H -> Z
            Z -> ε
            Y -> y
        `,
		description: 'Y is unproductive.',
	},
	'All productive except one': {
		grammar: `
            S -> A
            A -> a
            B -> b
            C -> D
            D -> E
            E -> F
        `,
		description: 'E, F are unproductive.',
	},
	'Dangling dead end': {
		grammar: `
            S -> A
            A -> B
            B -> dead
            C -> useful
        `,
		description: 'C is productive but not used.',
	},
}

const conditionTests = {
	'pascalConditionTests' : pascalConditionTests,
	'leftRecursionTests': leftRecursionTests,
	'leftFactoringTests':leftFactoringTests,
	'unreachableTests': unreachableTests,
	'unproductiveTests': unproductiveTests,
}


export default conditionTests