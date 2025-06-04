import sys
from typing import Optional, NamedTuple, TextIO, List
from ReadGrammar import read_grammar, GrammarError
from CreateTable import create_table
from PrintTable import export_to_csv
from token_type import TOKEN_TYPES


class Args(NamedTuple):
    input_file_name: str
    output_file_name: str


def parse_args() -> Optional[Args]:
    if len(sys.argv) != 3:
        print("Invalid quantity of arguments")
        print("Usage: python main.py <input_file> <output_file>")
        return None

    return Args(input_file_name=sys.argv[1], output_file_name=sys.argv[2])


def generate_token_types_name_from_file() -> List[str]:
    token_types_name = []

    for token_type in TOKEN_TYPES:
        token_types_name.append(token_type.name)

    return token_types_name


def main() -> int:
    args = parse_args()
    if args is None:
        return 1

    try:
        with open(args.input_file_name, 'r') as input_file:
            try:
                grammar = read_grammar(input_file, generate_token_types_name_from_file())
            except GrammarError as e:
                print(f"Ошибка в грамматике: {e}")
                return 1

    except IOError:
        print(f"Input file is not found: {args.input_file_name}")
        return 1

    for k in grammar:
        print(k.non_terminal, " -> ", ' '.join(k.right_part))

    with open(args.output_file_name, 'w') as output_file:
        try:
            table = create_table(grammar)
        except GrammarError as e:
            print(f"Ошибка в грамматике: {e}")
            return 1

        export_to_csv(table, output_file)

    return 0


if __name__ == "__main__":
    sys.exit(main())
