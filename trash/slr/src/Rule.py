from typing import List, Optional
from dataclasses import dataclass
from Symbol import Symbol

EMPTY_SYMBOL = "e"
END_SYMBOL = "#"

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


def is_non_terminal(s: str, rules: List[Rule]) -> bool:
    return any(rule.non_terminal == s for rule in rules)


def get_index_of_nonterminal(rules: List[Rule], non_terminal: str) -> Optional[int]:
    for i, rule in enumerate(rules):
        if rule.non_terminal == non_terminal:
            return i
    return None


def get_rules_with_nonterminal(rules: List[Rule], non_terminal: str) -> List[Rule]:
    return [rule for rule in rules if non_terminal in rule.right_part]


def get_nonterminal_rules(rules: List[Rule], non_terminal: str) -> List[Rule]:
    return [rule for rule in rules if rule.non_terminal == non_terminal]