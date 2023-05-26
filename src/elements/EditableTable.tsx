import Box, { BoxProps } from "@vertigis/web/ui/Box";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import Input from "@vertigis/web/ui/Input";
import React, { useState, useEffect } from "react";
import Table, { TableProps } from "@vertigis/web/ui/Table";
import TableBody from "@vertigis/web/ui/TableBody";
import TableCell, { TableCellProps } from "@vertigis/web/ui/TableCell";
import TableFooter from "@vertigis/web/ui/TableFooter";
import TableHead from "@vertigis/web/ui/TableHead";
import TableRow from "@vertigis/web/ui/TableRow";

type FooterRow = Record<string, any>;
type Row = Record<string, any>;
type SettableBoxProps = Pick<BoxProps, "maxHeight" | "maxWidth">;
type SettableTableProps = Pick<TableProps, "size" | "stickyHeader">;

interface Column {
    alias?: string;
    align?: TableCellProps["align"];
    format?: (value: any) => any;
    parse?: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        row: Row,
        column: Column
    ) => any;
    props?: any;
    columnCalculation?: "sum" | "average" | ((values: any) => any);
    editable: boolean;
    type: "text" | "number" | "date" | "time" | string;
    name: string;
}

interface EditableTableElementProps
    extends FormElementProps<Row[]>,
    SettableBoxProps,
    SettableTableProps {
    cols: Column[];
    rows: Row[];
    editTooltip: string;
    saveTooltip: string;
    footerLabel?: string;
    onMouseEnter?: (row: Row) => void;
    onMouseLeave?: (row: Row) => void;
    rowCalculation?: (data: Row[], row: Row) => void;
}

//Mimic MUI header style for footer
const TableCellStyleOverrides: TableCellProps["sx"] = {
    fontFamily: "var(--defaultFont)",
    lineHeight: "2.4rem",
    display: "table-cell",
    verticalAlign: "inherit",
    textAlign: "left",
    overflowWrap: "break-word",
    backgroundColor: "var(--secondaryBackground)",
    fontWeight: "bold",
    fontSize: "1.4rem",
    color: "var(--secondaryForeground)",
};

const calculateFooterRow = (cols: Column[], rows: Row[]): FooterRow => {
    const totalCols = cols.filter((x) => x.columnCalculation);
    const total: FooterRow = {};
    for (const col of totalCols) {
        if (col.columnCalculation) {
            const values = rows.map((x) => x[col.name]);
            if (col.columnCalculation === "sum") {
                total[col.name] = calculateSum(values);
            } else if (col.columnCalculation === "average") {
                total[col.name] = calculateAverage(values);
            } else {
                total[col.name] = col.columnCalculation(values);
            }
        }
    }
    return total;
};

const calculateSum = (values): number => {
    const numericVals = values.filter((x) => typeof x == "number");
    return numericVals.length > 0 ? numericVals.reduce((s: number, a: number) => s + a, 0) : 0;
};

const calculateAverage = (values): number => {
    const numericVals = values.filter((x) => typeof x == "number");
    const sum = numericVals.length > 0 ? numericVals.reduce((s: number, a: number) => s + a, 0) : 0;
    return sum / numericVals.length || 0;
};
/**
 * A table form element.
 * @displayName Editable Table
 * @description A table form element that allows editing.
 * @param props The props that will be provided by the Workflow runtime.
 */
function EditableTableElement(props: EditableTableElementProps): React.ReactElement | null {
    const {
        rows,
        cols,
        maxHeight,
        maxWidth,
        onMouseEnter,
        onMouseLeave,
        rowCalculation,
        raiseEvent,
        setValue,
        size,
        stickyHeader,
        footerLabel,
    } = props;
    const [data, setData] = useState(rows);
    setValue(data);
    useEffect(() => {
        setData(rows);
    }, [rows]);

    const illegalCol = cols.some((x) => ["text", "number", "date", "time"].indexOf(x.type) == -1);
    if (illegalCol) {
        throw new Error("Unsupported column.  Column must be of type: text, number, date or time.");
    }
    const includeFooter = cols.some((x) => x.columnCalculation);
    const footerRow: FooterRow = calculateFooterRow(cols, rows);

    const handleMouseEnter = (event: React.MouseEvent, row: Row, column: string) => {
        raiseEvent("custom", {
            eventType: "mouseEnter",
            rowData: { rows: data, row: row, column: column },
        });
        onMouseEnter?.(row);
    };

    const handleMouseLeave = (event: React.MouseEvent, row: Row, column: string) => {
        raiseEvent("custom", {
            eventType: "mouseLeave",
            rowData: { rows: data, row: row, column: column },
        });
        onMouseLeave?.(row);
    };

    const handleCellChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        row: Row,
        column: Column
    ) => {
        if (column?.parse) {
            row[column.name] = column.parse(event, row, column);
        } else if ((event.target as any).type === "number") {
            row[column.name] = Number(event.target.value);
        } else {
            row[column.name] = event.target.value;
        }
        if (rowCalculation) {
            rowCalculation(data, row);
        }
        raiseEvent("custom", {
            eventType: "cellChange",
            rowData: { rows: data, row: row, column: column },
        });
        setData([...data]);
        setValue(data);
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
                        {includeFooter && <TableCell />}
                        {cols.map((col) => (
                            <TableCell align={col.align} key={col.name}>
                                {col.alias ?? col.name}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => {
                        return (
                            <TableRow hover key={index}>
                                {includeFooter && <TableCell />}

                                {cols.map((col, index) => {
                                    const value = row[col.name];
                                    const formattedValue = col.format ? col.format(value) : value;
                                    return (
                                        <TableCell
                                            align={col.align}
                                            key={index}
                                            onMouseEnter={(event) =>
                                                handleMouseEnter(event, row, col.name)
                                            }
                                            onMouseLeave={(event) =>
                                                handleMouseLeave(event, row, col.name)
                                            }
                                        >
                                            {col.editable ? (
                                                <Input
                                                    readOnly={false}
                                                    type={col.type}
                                                    value={formattedValue}
                                                    onChange={(event) =>
                                                        handleCellChange(event, row, col)
                                                    }
                                                    inputProps={col.props}
                                                />
                                            ) : (
                                                formattedValue
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
                {includeFooter && (
                    <TableFooter>
                        <TableRow hover>
                            <TableCell align="center" sx={TableCellStyleOverrides}>
                                {footerLabel}
                            </TableCell>
                            {cols.map((col, index) =>
                                footerRow[col.name] ? (
                                    <TableCell
                                        align={col.align}
                                        key={index}
                                        sx={TableCellStyleOverrides}
                                    >
                                        {col.format
                                            ? col.format(footerRow[col.name])
                                            : footerRow[col.name]}
                                    </TableCell>
                                ) : (
                                    <TableCell sx={TableCellStyleOverrides} />
                                )
                            )}
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </Box>
    );
}

const EditableTableRegistration: FormElementRegistration<EditableTableElementProps> = {
    component: EditableTableElement,
    getInitialProperties: () => ({
        cols: [],
        rows: [],
    }),
    id: "EditableTable",
};

export default EditableTableRegistration;
