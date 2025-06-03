from typing import List, TextIO
from Rule import Rule, get_rules_with_nonterminal, EMPTY_SYMBOL
from GetDirectionSymbols import define_direction_symbols


class GrammarError(Exception):
    pass


class UnreachableSymbolError(GrammarError):
    pass


class UnproductiveSymbolError(GrammarError):
    pass


class AmbiguousGrammarError(GrammarError):
    pass


def is_reachable(grammar: List[Rule], start_symbol: str = None) -> bool:
    if not grammar:
        return True

    if start_symbol is None:
        start_symbol = grammar[0].non_terminal

    all_non_terminals = {rule.non_terminal for rule in grammar}

    reachable = {start_symbol}
    changed = True

    while changed:
        changed = False
        for rule in grammar:
            if rule.non_terminal in reachable:
                for symbol in rule.right_part:
                    if symbol in all_non_terminals and symbol not in reachable:
                        reachable.add(symbol)
                        changed = True

    unreachable = all_non_terminals - reachable
    if unreachable:
        print(f"Недостижимые нетерминалы: {', '.join(sorted(unreachable))}")
        return False
    return True


def is_productive(grammar: List[Rule], token_types_name: List[str]) -> bool:
    token_types_name.append('ε')
    all_non_terminals = {rule.non_terminal for rule in grammar}

    productive = set()

    # Шаг 1: Находим сразу продуктивные правила (состоящие только из терминалов)
    for rule in grammar:
        if all(symbol in token_types_name for symbol in rule.right_part):
            productive.add(rule.non_terminal)

    # Шаг 2: Итеративно расширяем множество продуктивных нетерминалов
    changed = True
    while changed:
        changed = False
        for rule in grammar:
            if rule.non_terminal not in productive:
                # Проверяем, все ли символы в правой части продуктивны или терминалы
                all_productive = True
                for symbol in rule.right_part:
                    if symbol not in token_types_name and symbol not in productive:
                        all_productive = False
                        break

                if all_productive:
                    productive.add(rule.non_terminal)
                    changed = True

    # Шаг 3: Проверяем наличие непродуктивных нетерминалов
    unproductive = all_non_terminals - productive

    # Дополнительная проверка для циклических зависимостей
    if unproductive:
        # Строим граф зависимостей между нетерминалами
        dependency_graph = {nt: set() for nt in all_non_terminals}
        for rule in grammar:
            for symbol in rule.right_part:
                if symbol in all_non_terminals:
                    dependency_graph[rule.non_terminal].add(symbol)

        # Проверяем, есть ли в непродуктивных нетерминалах те,
        # которые зависят только от других непродуктивных
        new_unproductive = set()
        for nt in unproductive:
            # Если все зависимости ведут к другим непродуктивным
            if all(dep in unproductive for dep in dependency_graph[nt]):
                new_unproductive.add(nt)

        if new_unproductive:
            # Формируем сообщение об ошибке с указанием проблемных нетерминалов
            raise UnproductiveSymbolError(
                f"Грамматика содержит непродуктивные нетерминалы: {', '.join(sorted(new_unproductive))}\n"
                f"Эти нетерминалы образуют циклическую зависимость без выхода на терминалы"
            )

    return len(unproductive) == 0


def has_shift_reduce_conflict(grammar: List[Rule]) -> bool:
    for rule in grammar:
        if rule.right_part.count(rule.non_terminal) > 1:
            return True
    return False


def is_unambiguous(grammar: List[Rule]) -> bool:
    return not has_shift_reduce_conflict(grammar)


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


def read_grammar(input_file: TextIO, token_types_name: List[str]) -> List[Rule]:
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

    if not is_reachable(rules):
        raise UnreachableSymbolError("Грамматика содержит недостижимые нетерминалы")

    if not is_productive(rules, token_types_name):
        raise UnproductiveSymbolError("Грамматика содержит непродуктивные нетерминалы")

    if not is_unambiguous(rules):
        raise AmbiguousGrammarError("Грамматика может быть неоднозначной")

    return rules
