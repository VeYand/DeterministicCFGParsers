// Тесты для Pascal-подобной грамматики с условиями
export const pascalConditionTests = [
  {
    name: "Simple IF",
    grammar: `
      Program  -> PROGRAM IDENTIFIER SEMICOLON Block DOT
      Block    -> BEGIN Stmts END
      Stmts    -> Stmt StmtsTail
      StmtsTail -> SEMICOLON Stmt StmtsTail | ε
      Stmt     -> IF Expr THEN Stmt ELSE Stmt | IDENTIFIER ASSIGN Expr
      Expr     -> IDENTIFIER | INTEGER
    `,
    input: `PROGRAM T; BEGIN IF x THEN y := 1 ELSE y := 2 END.`
  },
  {
    name: "Assignment Chain",
    grammar: `
      Program  -> PROGRAM IDENTIFIER SEMICOLON Block DOT
      Block    -> BEGIN Stmts END
      Stmts    -> Stmt SEMICOLON Stmts | ε
      Stmt     -> IDENTIFIER ASSIGN IDENTIFIER
    `,
    input: `PROGRAM T; BEGIN x := y; y := z END.`
  },
  {
    name: "Nested IF",
    grammar: `
      Program -> BEGIN Stmt END
      Stmt -> IF IDENTIFIER THEN IF IDENTIFIER THEN Stmt ELSE Stmt
    `,
    input: `BEGIN IF x THEN IF y THEN z := 1 ELSE z := 2 END.`
  }
];

// Факторизация (Left Factoring)
export const leftFactoringTests = [
  {
    name: "Classic if-else",
    grammar: `S -> if E then S else S | if E then S\nE -> true | false`,
    description: "Needs factoring due to shared prefix."
  },
  {
    name: "Arithmetic",
    grammar: `A -> a b c | a b d`,
    description: "Shared prefix 'a b' needs factoring."
  },
  {
    name: "Command prefix",
    grammar: `C -> print x | print y | print z`,
    description: "All options start with 'print'."
  }
];

// Удаление левой рекурсии
export const leftRecursionTests = [
  {
    name: "Simple Left Recursion",
    grammar: `A -> A a | b`,
    description: "Direct left recursion."
  },
  {
    name: "Indirect Left Recursion",
    grammar: `S -> A a\nA -> S b | c`,
    description: "Indirect left recursion through A -> S."
  },
  {
    name: "Multiple Rules",
    grammar: `X -> X Y | Z\nY -> y\nZ -> z`,
    description: "Left recursive with other branches."
  }
];

// Проверка на недостижимые символы (Unreachable)
export const unreachableTests = [
  {
    name: "One unreachable",
    grammar: `S -> A\nA -> a\nB -> b`,
    description: "B is unreachable."
  },
  {
    name: "Deep unreachable",
    grammar: `S -> A\nA -> B\nB -> b\nC -> c`,
    description: "C is not reachable."
  },
  {
    name: "Unused nonterminal",
    grammar: `S -> x\nT -> y\nU -> z`,
    description: "T and U are unused."
  }
];

// Проверка на непродуктивные символы (Unproductive)
export const unproductiveTests = [
  {
    name: "Nonproductive leaf",
    grammar: `S -> A\nA -> B\nB -> C\nC -> D\nD -> E\nE -> F\nF -> G\nG -> H\nH -> Z\nZ -> ε\nY -> y`,
    description: "Y is unproductive."
  },
  {
    name: "All productive except one",
    grammar: `S -> A\nA -> a\nB -> b\nC -> D\nD -> E\nE -> F`,
    description: "E, F are unproductive."
  },
  {
    name: "Dangling dead end",
    grammar: `S -> A\nA -> B\nB -> dead\nC -> useful`,
    description: "C is productive but not used."
  }
];
