import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import Box, { BoxProps } from "@vertigis/web/ui/Box";
import Checkbox from "@vertigis/web/ui/Checkbox";
import Table, { TableProps } from "@vertigis/web/ui/Table";
import TableBody from "@vertigis/web/ui/TableBody";
import TableCell, { TableCellProps } from "@vertigis/web/ui/TableCell";
import TableHead from "@vertigis/web/ui/TableHead";
import TableRow from "@vertigis/web/ui/TableRow";

interface Column {
    alias?: string;
    align?: TableCellProps["align"];
    format?: (value: any, row: RowData) => any;
    name: string;
}

type RowData = Record<string, any>;

type SettableBoxProps = Pick<BoxProps, "maxHeight" | "maxWidth">;
type SettableTableProps = Pick<TableProps, "size" | "stickyHeader">;

interface TableElementProps
    extends FormElementProps<RowData[]>,
        SettableBoxProps,
        SettableTableProps {
    cols: Column[];
    onClick?: (row: RowData) => void;
    onMouseEnter?: (row: RowData) => void;
    onMouseLeave?: (row: RowData) => void;
    rows: RowData[];
    selectable?: boolean;
}

/**
 * A table form element.
 * @displayName Table
 * @description A table form element.
 * @param props The props that will be provided by the Workflow runtime.
 */
function TableElement(props: TableElementProps): React.ReactElement | null {
    const {
        cols,
        maxHeight,
        maxWidth,
        onClick,
        onMouseEnter,
        onMouseLeave,
        raiseEvent,
        rows,
        setValue,
        size,
        selectable,
        stickyHeader,
        value,
    } = props;

    const handleSelectAllClick = (event: React.ChangeEvent, checked: boolean) => {
        setValue(checked ? [...rows] : []);
    };

    const handleClick = (event: React.MouseEvent, row: RowData) => {
        if (selectable) {
            if (value.includes(row)) {
                setValue(value.filter((x) => x !== row));
            } else {
                setValue([...value, row]);
            }
        }
        raiseEvent("clicked" as any, row);
        onClick?.(row);
    };

    const handleMouseEnter = (event: React.MouseEvent, row: RowData) => {
        raiseEvent("custom", { eventType: "mouseEnter", row });
        onMouseEnter?.(row);
    };

    const handleMouseLeave = (event: React.MouseEvent, row: RowData) => {
        raiseEvent("custom", { eventType: "mouseLeave", row });
        onMouseLeave?.(row);
    };

    return (
        <Box maxHeight={maxHeight} maxWidth={maxWidth} sx={{ overflow: "auto" }}>
            <Table
                size={size}
                stickyHeader={stickyHeader}
                sx={{
                    // Hack required to override .gcx-forms.defaults
                    ["& span"]: {
                        display: "inline-flex !important",
                    },
                }}
            >
                <TableHead>
                    <TableRow>
                        {selectable && (
                            <TableCell align="center" sx={{ p: 0 }}>
                                <Checkbox
                                    indeterminate={value.length > 0 && value.length < rows.length}
                                    checked={rows.length > 0 && value.length === rows.length}
                                    onChange={handleSelectAllClick}
                                />
                            </TableCell>
                        )}
                        {cols.map((col) => (
                            <TableCell align={col.align} key={col.name}>
                                {col.alias ?? col.name}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => {
                        const isSelected = value.includes(row);
                        return (
                            <TableRow
                                hover
                                key={index}
                                onClick={(event) => handleClick(event, row)}
                                onMouseEnter={(event) => handleMouseEnter(event, row)}
                                onMouseLeave={(event) => handleMouseLeave(event, row)}
                                selected={isSelected}
                            >
                                {selectable && (
                                    <TableCell align="center" sx={{ p: 0 }}>
                                        <Checkbox checked={isSelected} />
                                    </TableCell>
                                )}
                                {cols.map((col, index) => {
                                    const value = row[col.name];
                                    const formattedValue = col.format
                                        ? col.format(value, row)
                                        : value;
                                    return (
                                        <TableCell align={col.align} key={index}>
                                            {formattedValue}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
}

const TableElementRegistration: FormElementRegistration<TableElementProps> = {
    component: TableElement,
    getInitialProperties: () => ({
        cols: [],
        rows: [],
        value: [],
    }),
    id: "Table",
};

export default TableElementRegistration;
