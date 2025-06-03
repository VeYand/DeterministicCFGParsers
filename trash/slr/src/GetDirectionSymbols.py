from typing import List, Set
from Symbol import Symbol
from Rule import Rule, is_non_terminal, EMPTY_SYMBOL


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