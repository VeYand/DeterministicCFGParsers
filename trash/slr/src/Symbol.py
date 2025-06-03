from dataclasses import dataclass
from typing import Optional


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

    def __str__(self) -> str:
        if self.num_of_rule is not None and self.num_of_right_part is not None:
            return f"{self.name}{self.num_of_rule + 1}{self.num_of_right_part + 1}"
        if self.num_of_rule is not None:
            return f"{self.name}{self.num_of_rule + 1}"
        return self.name
