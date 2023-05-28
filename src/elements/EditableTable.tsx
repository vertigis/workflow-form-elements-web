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
type RowData = Record<string, any>;
type SettableBoxProps = Pick<BoxProps, "maxHeight" | "maxWidth">;
type SettableTableProps = Pick<TableProps, "size" | "stickyHeader">;

interface Column {
    name: string;
    alias?: string;
    align?: TableCellProps["align"];
    format?: (value: any, row: RowData) => any;
    footerFormat?: (value: any, row: RowData) => any;
    parse?: (value: any, row: RowData, column: Column) => any;
    columnCalculation?: "sum" | "average" | ((values: any) => any);
    editable?: boolean;
    type?: "text" | "number" | string;
}

interface EditableTableElementProps
    extends FormElementProps<RowData[]>,
        SettableBoxProps,
        SettableTableProps {
    cols: Column[];
    rows: RowData[];
    footerLabel?: string;
    onMouseEnter?: (row: RowData) => void;
    onMouseLeave?: (row: RowData) => void;
    rowCalculation?: (data: RowData[], row: RowData) => void;
}

//Mimic MUI header style for footer
const TableCellStyleOverrides: TableCellProps["sx"] = {
    fontFamily: "var(--defaultFont)",
    backgroundColor: "var(--secondaryBackground)",
    fontWeight: "bold",
    color: "var(--secondaryForeground)",
};

const calculateFooterRow = (cols: Column[], rows: RowData[]): FooterRow => {
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
 * @description A table form element that allows for inline editing and tabular calculation.
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

    const illegalCols = cols.filter(
        (x) => !!x.type && ["text", "number", "date", "time", undefined].indexOf(x.type) === -1
    );
    if (illegalCols.length > 0) {
        for (const illegalCol of illegalCols) {
            const type = illegalCol.type as string;
            console.log(
                `Unsupported column type ${type} in column ${illegalCol.name}.  Supported types: text, number.`
            );
            illegalCol.type = undefined;
        }
    }
    const includeFooter = cols.some((x) => x.columnCalculation);
    const footerRow: FooterRow = calculateFooterRow(cols, rows);

    const handleMouseEnter = (event: React.MouseEvent, row: RowData) => {
        raiseEvent("custom", {
            eventType: "mouseEnter",
            rowData: { rows: data, row: row },
        });
        onMouseEnter?.(row);
    };

    const handleMouseLeave = (event: React.MouseEvent, row: RowData) => {
        raiseEvent("custom", {
            eventType: "mouseLeave",
            rowData: { rows: data, row: row },
        });
        onMouseLeave?.(row);
    };

    const handleCellChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        row: RowData,
        column: Column
    ) => {
        if (column?.parse) {
            row[column.name] = column.parse(event.target.value, row, column);
        } else if (event.target.type === "number") {
            row[column.name] = Number(event.target.value);
        } else {
            row[column.name] = event.target.value;
        }
        raiseEvent("custom", {
            eventType: "cellChange",
            rowData: { rows: data, row: row, column: column },
        });
        setData([...data]);
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
                        {includeFooter && footerLabel && <TableCell />}
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
                            <TableRow
                                hover
                                key={index}
                                onMouseEnter={(event) => handleMouseEnter(event, row)}
                                onMouseLeave={(event) => handleMouseLeave(event, row)}
                            >
                                {includeFooter && footerLabel && <TableCell />}

                                {cols.map((col, index) => {
                                    const value = row[col.name];
                                    const formattedValue = col.format
                                        ? col.format(value, row)
                                        : value;
                                    return (
                                        <TableCell align={col.align} key={index}>
                                            {col.editable ? (
                                                <Input
                                                    fullWidth={col.type === "text" ? true : false}
                                                    type={col.type}
                                                    value={formattedValue}
                                                    onChange={(event) =>
                                                        handleCellChange(event, row, col)
                                                    }
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
                {includeFooter && footerLabel && (
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
                                        {col.footerFormat
                                            ? col.footerFormat(footerRow[col.name], footerRow)
                                            : col.format
                                            ? col.format(footerRow[col.name], footerRow)
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
