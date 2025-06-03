from typing import List, Dict, Set
from dataclasses import dataclass
from Symbol import Symbol

END_SYMBOL_IN_TABLE = "R"


@dataclass
class TableStr:
    symbols: List[Symbol]
    next_symbols: Dict[str, List[Symbol]]


@dataclass
class Table:
    symbols: Set[str]
    strings: List[TableStr]
