from typing import List, Dict, Set, Optional, Tuple
from dataclasses import dataclass
from io import TextIOBase

EMPTY_SYMBOL = "ε"
END_SYMBOL = "#"
END_SYMBOL_IN_TABLE = "R"


# Symbol.py
@dataclass
class Symbol:
    name: str
    num_of_rule: Optional[int] = None
    num_of_right_part: Optional[int] = None

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Symbol):
            return NotImplemented
        return (self.name == other.name and
                self.num_of_rule == other.num_of_rule and
                self.num_of_right_part == other.num_of_right_part)


# Rule.py
@dataclass
class Rule:
    non_terminal: str
    right_part: List[str]
    direction_symbols: List[Symbol] = None

    def __post_init__(self):
        if self.direction_symbols is None:
            self.direction_symbols = []

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Rule):
            return NotImplemented
        return (self.non_terminal == other.non_terminal and
                self.right_part == other.right_part and
                self.direction_symbols == other.direction_symbols)


# Table.py
@dataclass
class TableStr:
    symbols: List[Symbol]
    next_symbols: Dict[str, List[Symbol]]


@dataclass
class Table:
    symbols: Set[str]
    strings: List[TableStr]


# GetDirectionSymbols.py
def add_new_symbols(current: List[Symbol], new: List[Symbol]) -> bool:
    has_change = False
    for symbol in new:
        if symbol not in current:
            current.append(symbol)
            has_change = True
    return has_change


def define_non_terminal_direction_symbols(non_terminal: str, rules: List[Rule]) -> List[Symbol]:
    direction_symbols = []
    for rule in rules:
        if rule.non_terminal == non_terminal:
            direction_symbols.extend(rule.direction_symbols)
    return direction_symbols


def get_direction_symbols_after_non_terminal(
        rule: Rule,
        num_of_rule: int,
        non_terminal: str,
        rules: List[Rule],
        checked_rules: Set[int]
) -> List[Symbol]:
    direction_symbols = []
    right_part = rule.right_part
    try:
        index = right_part.index(non_terminal)
        while index != -1:
            next_index = index + 1
            if next_index >= len(right_part):
                symbols = define_direction_symbols_after_non_terminal(
                    checked_rules, rule.non_terminal, rules
                )
                direction_symbols.extend(symbols)
            else:
                next_symbol = right_part[next_index]
                if is_non_terminal(next_symbol, rules):
                    symbols = define_non_terminal_direction_symbols(next_symbol, rules)
                    direction_symbols.extend(symbols)

                symbol = Symbol(
                    name=next_symbol,
                    num_of_rule=num_of_rule,
                    num_of_right_part=next_index
                )
                direction_symbols.append(symbol)

            try:
                index = right_part.index(non_terminal, next_index)
            except ValueError:
                index = -1
    except ValueError:
        pass

    return direction_symbols


def define_direction_symbols_after_non_terminal(
        checked_rules: Set[int],
        non_terminal: str,
        rules: List[Rule]
) -> List[Symbol]:
    direction_symbols = []
    for i, rule in enumerate(rules):
        if i in checked_rules:
            continue
        new_checked = checked_rules.copy()
        new_checked.add(i)
        symbols = get_direction_symbols_after_non_terminal(
            rule, i, non_terminal, rules, new_checked
        )
        direction_symbols.extend(symbols)
    return direction_symbols


def define_direction_symbols(rules: List[Rule]) -> None:
    has_changes = False
    for i, rule in enumerate(rules):
        if not rule.right_part:
            raise ValueError("Right part is empty")

        if len(rule.right_part) == 1 and rule.right_part[0] == EMPTY_SYMBOL:
            symbols = define_direction_symbols_after_non_terminal(set(), rule.non_terminal, rules)
            has_changes = add_new_symbols(rule.direction_symbols, symbols) or has_changes
            continue

        if is_non_terminal(rule.right_part[0], rules):
            symbols = define_non_terminal_direction_symbols(rule.right_part[0], rules)
            has_changes = add_new_symbols(rule.direction_symbols, symbols) or has_changes

        symbol = Symbol(
            name=rule.right_part[0],
            num_of_rule=i,
            num_of_right_part=0
        )
        has_changes = add_new_symbols(rule.direction_symbols, [symbol]) or has_changes

    if has_changes:
        define_direction_symbols(rules)


# Helper functions
def is_non_terminal(s: str, rules: List[Rule]) -> bool:
    return any(rule.non_terminal == s for rule in rules)


def get_nonterminal_rules(rules: List[Rule], non_terminal: str) -> List[Rule]:
    return [rule for rule in rules if rule.non_terminal == non_terminal]


def get_rules_with_nonterminal(rules: List[Rule], non_terminal: str) -> List[Rule]:
    return [rule for rule in rules if non_terminal in rule.right_part]


# CreateTable.py
def add_symbols_from_right_part(rule: Rule, symbols: Set[str]) -> None:
    symbols.update(rule.right_part)


def get_all_symbols(grammar: List[Rule]) -> Set[str]:
    symbols = set()
    for rule in grammar:
        symbols.add(rule.non_terminal)
        add_symbols_from_right_part(rule, symbols)
    return symbols


def add_direction_symbols(table_str: TableStr, direction_symbols: List[Symbol], grammar: List[Rule]) -> None:
    for symbol in direction_symbols:
        if symbol.name in table_str.next_symbols:
            if symbol not in table_str.next_symbols[symbol.name]:
                table_str.next_symbols[symbol.name].append(symbol)
        else:
            table_str.next_symbols[symbol.name] = [symbol]


def add_end_direction_symbols(table_str: TableStr, direction_symbols: List[Symbol], num_of_rule: int) -> None:
    for symbol in direction_symbols:
        end_symbol = Symbol(name=END_SYMBOL_IN_TABLE, num_of_rule=num_of_rule)
        if symbol.name in table_str.next_symbols:
            if end_symbol not in table_str.next_symbols[symbol.name]:
                table_str.next_symbols[symbol.name].append(end_symbol)
        else:
            table_str.next_symbols[symbol.name] = [end_symbol]


def has_state_in_table(table_strs: List[TableStr], symbols_of_state: List[Symbol]) -> bool:
    for table_str in table_strs:
        if table_str.symbols == symbols_of_state:
            return True
    return False


def define_next_symbols(grammar: List[Rule], num_of_rule: int, num_of_right_part: int, table_str: TableStr) -> None:
    symbol_name = grammar[num_of_rule].right_part[num_of_right_part]
    symbol = Symbol(
        name=symbol_name,
        num_of_rule=num_of_rule,
        num_of_right_part=num_of_right_part
    )

    if is_non_terminal(symbol.name, grammar):
        direction_symbols = [symbol]
        rules = get_nonterminal_rules(grammar, symbol_name)
        for rule in rules:
            direction_symbols.extend(rule.direction_symbols)
        add_direction_symbols(table_str, direction_symbols, grammar)

    if symbol.name == END_SYMBOL:
        add_end_direction_symbols(table_str, [symbol], symbol.num_of_rule)
        return

    add_direction_symbols(table_str, [symbol], grammar)


def add_info_in_string(table_str: TableStr, symbols: List[Symbol], grammar: List[Rule]) -> None:
    for s in symbols:
        if s.num_of_rule is None or s.num_of_right_part is None or s.name == END_SYMBOL:
            continue

        table_str.symbols.append(s)
        is_end_of_rule = len(grammar[s.num_of_rule].right_part) - 1 == s.num_of_right_part

        if is_end_of_rule:
            direction_symbols = define_direction_symbols_after_non_terminal(
                set(), grammar[s.num_of_rule].non_terminal, grammar
            )
            add_end_direction_symbols(table_str, direction_symbols, s.num_of_rule)
            continue

        define_next_symbols(grammar, s.num_of_rule, s.num_of_right_part + 1, table_str)


def add_new_strings(table: Table, num_of_str: int, grammar: List[Rule]) -> None:
    table_str = table.strings[num_of_str]
    new_strs = []

    for next_symbol_name, next_symbols in table_str.next_symbols.items():
        if (has_state_in_table(table.strings, next_symbols) or
                has_state_in_table(new_strs, next_symbols)):
            continue

        new_str = TableStr(symbols=[], next_symbols={})
        add_info_in_string(new_str, next_symbols, grammar)

        if new_str.symbols:
            new_strs.append(new_str)

    table.strings.extend(new_strs)

    if num_of_str + 1 < len(table.strings):
        add_new_strings(table, num_of_str + 1, grammar)


def create_table(grammar: List[Rule]) -> Table:
    table = Table(symbols=set(), strings=[])
    table.symbols = get_all_symbols(grammar)

    first_str = TableStr(symbols=[], next_symbols={})
    symbol_of_first_str = Symbol(name=grammar[0].non_terminal)
    first_str.symbols.append(symbol_of_first_str)
    add_direction_symbols(first_str, grammar[0].direction_symbols, grammar)

    ok_symbol = Symbol(name="OK")
    first_str.next_symbols[grammar[0].non_terminal] = [ok_symbol]

    for i in range(1, len(grammar)):
        rule = grammar[i]
        if len(rule.right_part) == 1 and rule.right_part[0] == END_SYMBOL:
            end_symbol = Symbol(name=END_SYMBOL_IN_TABLE, num_of_rule=i)
            first_str.next_symbols[END_SYMBOL] = [end_symbol]
            continue

        if rule.non_terminal == symbol_of_first_str.name:
            add_direction_symbols(first_str, rule.direction_symbols, grammar)

    table.strings.append(first_str)
    add_new_strings(table, 0, grammar)

    return table


# PrintTable.py
def print_names_of_columns(table: Table, output: TextIOBase) -> None:
    output.write("\t")
    for s in table.symbols:
        output.write(f"'{s}'\t")
    output.write("\n")


def print_symbols(symbols: List[Symbol], output: TextIOBase) -> None:
    for i, symbol in enumerate(symbols):
        output.write(f"'{symbol}'")
        if i + 1 != len(symbols):
            output.write(", ")
    output.write("\t")


def print_next_symbols(table_str: TableStr, symbols: Set[str], output: TextIOBase) -> None:
    for s in symbols:
        if s not in table_str.next_symbols:
            output.write("\t")
        else:
            print_symbols(table_str.next_symbols[s], output)


def print_table(table: Table, output: TextIOBase) -> None:
    print_names_of_columns(table, output)
    for table_str in table.strings:
        print_symbols(table_str.symbols, output)
        print_next_symbols(table_str, table.symbols, output)
        output.write("\n")


# ReadGrammar.py
def read_right_part(right_part_str: str, non_terminal: str, rules: List[Rule]) -> None:
    right_parts = right_part_str.split("|")
    right_parts = [part.strip() for part in right_parts]
    for part in right_parts:
        rule = Rule(
            non_terminal=non_terminal,
            right_part=part.split()
        )
        rules.append(rule)


def get_right_part_without_nonterminal(rule: Rule, non_terminal: str) -> List[str]:
    return [s for s in rule.right_part if s != non_terminal]


def add_alternative_rules_without_empty_rule(
        rules: List[Rule],
        new_rules: List[Rule],
        non_terminal: str,
        has_changes: bool
) -> bool:
    rules_with_empty = get_rules_with_nonterminal(rules, non_terminal)

    for rule in rules_with_empty:
        if len(rule.right_part) == 1:
            has_changes = add_alternative_rules_without_empty_rule(
                rules, new_rules, rule.non_terminal, has_changes
            )
            continue

        new_rule = Rule(
            non_terminal=rule.non_terminal,
            right_part=get_right_part_without_nonterminal(rule, non_terminal)
        )

        if new_rule not in rules and new_rule not in new_rules:
            has_changes = True
            new_rules.append(new_rule)

    return has_changes


def remove_rules_with_empty_symbol(rules: List[Rule]) -> List[Rule]:
    return [rule for rule in rules if not (
            len(rule.right_part) == 1 and rule.right_part[0] == EMPTY_SYMBOL
    )]


def find_alternative_rules_without_empty_symbol(rules: List[Rule]) -> List[Rule]:
    new_rules = []
    has_changes = False

    for rule in rules:
        if len(rule.right_part) == 1 and rule.right_part[0] == EMPTY_SYMBOL:
            new_rules.append(rule)
            has_changes = add_alternative_rules_without_empty_rule(
                rules, new_rules, rule.non_terminal, has_changes
            )
        else:
            new_rules.append(rule)

    if has_changes:
        return find_alternative_rules_without_empty_symbol(new_rules)
    return new_rules


def read_grammar(input_file: TextIOBase) -> List[Rule]:
    rules = []
    for line in input_file:
        if "->" not in line:
            continue
        non_terminal, right_part = line.split("->", 1)
        non_terminal = non_terminal.strip()
        read_right_part(right_part.strip(), non_terminal, rules)

    rules = find_alternative_rules_without_empty_symbol(rules)
    rules = remove_rules_with_empty_symbol(rules)
    define_direction_symbols(rules)

    return rules