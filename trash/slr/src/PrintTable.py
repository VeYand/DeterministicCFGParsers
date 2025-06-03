from typing import List, Set, TextIO
from Table import Table, TableStr
from Symbol import Symbol


def print_csv_header(table: Table, output: TextIO) -> None:
    """Печатает заголовок CSV с именами столбцов"""
    columns = [''] + [f"'{s}'" for s in table.symbols]
    output.write(";".join(columns) + "\n")


def format_symbols(symbols: List[Symbol]) -> str:
    """Форматирует список символов в CSV-строку"""
    return ",".join(f"'{symbol}'" for symbol in symbols)


def print_csv_row(table_str: TableStr, symbols: Set[str], output: TextIO) -> None:
    """Печатает строку таблицы в CSV-формате"""
    # Основные символы
    output.write(format_symbols(table_str.symbols))

    # Ячейки переходов
    for s in symbols:
        if s not in table_str.next_symbols:
            output.write(";")
        else:
            output.write(";" + format_symbols(table_str.next_symbols[s]))

    output.write("\n")


def export_to_csv(table: Table, output: TextIO) -> None:
    """Экспортирует всю таблицу в CSV формате"""
    print_csv_header(table, output)
    for table_str in table.strings:
        print_csv_row(table_str, table.symbols, output)