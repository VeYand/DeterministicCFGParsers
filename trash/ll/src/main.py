import sys
from build_parsing_table import build_parsing_table
from grammar import calculate_directing_sets
from grammar_utils import parse_grammar
from table import write_table


def task3(input_path: str):
    with open(input_path, "r", encoding="utf-8") as f:
        grammar, axiom_nonterminal = parse_grammar(f.readlines())
    return calculate_directing_sets(grammar, axiom_nonterminal)

def task4() -> None:
    if len(sys.argv) != 3:
        print(f'Usage: python {sys.argv[0]} <input-file> <output-file>')
        return

    grammar = task3(sys.argv[1])
    table = build_parsing_table(grammar, list(grammar.rules.keys())[0])
    write_table(table, sys.argv[2])



if __name__ == "__main__":
    task4()
