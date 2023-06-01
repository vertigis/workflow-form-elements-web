import Box, { BoxProps } from "@vertigis/web/ui/Box";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import Input, { InputProps } from "@vertigis/web/ui/Input";
import React, { useState, useEffect } from "react";
import Table, { TableProps } from "@vertigis/web/ui/Table";
import TableBody from "@vertigis/web/ui/TableBody";
import TableCell, { TableCellProps } from "@vertigis/web/ui/TableCell";
import TableFooter from "@vertigis/web/ui/TableFooter";
import TableHead from "@vertigis/web/ui/TableHead";
import TableRow from "@vertigis/web/ui/TableRow";
import IconButton, { IconButtonProps } from "@vertigis/web/ui/IconButton";
import Check from "@vertigis/web/ui/icons/Check";
import Close from "@vertigis/web/ui/icons/Close";
import Edit from "@vertigis/web/ui/icons/Edit";

import { FormatOptions, format } from "@vertigis/arcgis-extensions/utilities/number";

type FooterRow = Record<string, any>;
type RowData = Record<string, any>;
type SettableBoxProps = Pick<BoxProps, "maxHeight" | "maxWidth">;
type SettableTableProps = Pick<TableProps, "size" | "stickyHeader">;

interface Column {
    name: string;
    alias?: string;
    align?: TableCellProps["align"];
    columnCalculation?: "sum" | "average" | ((values: any) => any);
    editable?: boolean;
    type?: "text" | "number";
    numberFormat?: FormatOptions;
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
    onRowEdit?: (row: RowData) => void;
}

//Mimic MUI header style for footer
const FooterCellStyleOverrides: TableCellProps["sx"] = {
    fontFamily: "var(--defaultFont)",
    backgroundColor: "var(--secondaryBackground)",
    fontWeight: "bold",
    color: "var(--secondaryForeground)",
    fontSize: "inherit",
};

//Mimic MUI header style for footer
const TableCellStyleOverrides: TableCellProps["sx"] = {
    fontFamily: "var(--defaultFont)",
    fontSize: "inherit",
};

const InputStyleOverrides: InputProps["sx"] = {
    ".MuiInput-input": {
        borderRadius: "4px !important",
        padding: "5px 8px !important",
        border: "0px !important",
        backgroundColor: "inherit",
        width: "100%",
        height: "auto",
    },
};

const IconButtonStyleOverrides: IconButtonProps["sx"] = {
    // Hack required to override .gcx-forms.defaults
    borderRadius: "50% !important",
    // Hack required to match disabled list item content
    "&.Mui-disabled": {
        opacity: 0.38,
    },
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

const calculateSum = (values: any[]): number => {
    const numericVals = values.filter((x) => typeof x == "number");
    return numericVals.length > 0 ? numericVals.reduce((s: number, a: number) => s + a, 0) : 0;
};

const calculateAverage = (values: any[]): number => {
    const numericVals = values.filter((x) => typeof x == "number");
    const sum = numericVals.length > 0 ? numericVals.reduce((s: number, a: number) => s + a, 0) : 0;
    return sum / numericVals.length || 0;
};

const formatValue = (value: any, column: Column): any => {
    if (column.type === "number" && typeof value === "number") {
        if (column.numberFormat) {
            return format(column.numberFormat, value);
        } else {
            return value;
        }
    } else if (typeof value === "string") {
        return value;
    } else if (value instanceof Date) {
        return value.toDateString();
    } else if (typeof value?.toString === "function") {
        return value.toString();
    }
    return "-";
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
        size,
        stickyHeader,
        footerLabel,
        onMouseEnter,
        onMouseLeave,
        raiseEvent,
        onRowEdit,
    } = props;

    const [data, setData] = useState<RowData[]>([]);
    const [editingRows, setEditingRows] = useState<Record<number, RowData>>({});

    useEffect(() => {
        setData(rows);
    }, [rows]);

    const includeFooter = cols.some((x) => x.columnCalculation);
    const canEdit = cols.some((x) => x.editable);
    const footerRow: FooterRow | undefined = includeFooter
        ? calculateFooterRow(cols, rows)
        : undefined;

    const handleMouseEnter = (event: React.MouseEvent, row: RowData) => {
        raiseEvent("custom", { eventType: "mouseEnter", row });
        onMouseEnter?.(row);
    };

    const handleMouseLeave = (event: React.MouseEvent, row: RowData) => {
        raiseEvent("custom", { eventType: "mouseLeave", row });
        onMouseLeave?.(row);
    };

    const handleCellChange = (value: string | number, row: RowData, column: Column) => {
        if (column.type === "number") {
            row[column.name] = Number(value);
        } else {
            row[column.name] = value;
        }
        setEditingRows({ ...editingRows });
    };

    const handleBeginEdit = (event: React.MouseEvent, index: number) => {
        editingRows[index] = { ...rows[index] };
        setEditingRows({ ...editingRows });
    };

    const handleCompleteEdit = (event: React.MouseEvent, index: number) => {
        rows[index] = editingRows[index];
        delete editingRows[index];
        raiseEvent("custom", { eventType: "rowEdit", row: rows[index] });
        onRowEdit?.(rows[index]);
        calculateFooterRow(cols, rows);
        setData([...rows]);
        setEditingRows({ ...editingRows });
    };

    const handleCancelEdit = (event: React.MouseEvent, index: number) => {
        setData([...data]);
        delete editingRows[index];
        setEditingRows({ ...editingRows });
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
                        <TableCell />
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
                                <TableCell sx={{ ...TableCellStyleOverrides }} key={index}>
                                    {canEdit && editingRows && editingRows[index] ? (
                                        <>
                                            <IconButton
                                                onClick={(event) =>
                                                    handleCompleteEdit(event, index)
                                                }
                                                sx={{
                                                    ...IconButtonStyleOverrides,
                                                }}
                                            >
                                                <Check />
                                            </IconButton>
                                            <IconButton
                                                onClick={(event) => handleCancelEdit(event, index)}
                                                sx={{
                                                    ...IconButtonStyleOverrides,
                                                }}
                                            >
                                                <Close />
                                            </IconButton>
                                        </>
                                    ) : (
                                        canEdit && (
                                            <IconButton
                                                onClick={(event) => handleBeginEdit(event, index)}
                                                sx={{
                                                    ...IconButtonStyleOverrides,
                                                }}
                                            >
                                                <Edit />
                                            </IconButton>
                                        )
                                    )}
                                </TableCell>

                                {cols.map((col, colIndex) => {
                                    const type = col.type === "number" ? "number" : "text";

                                    const value = editingRows[index]
                                        ? editingRows[index][col.name]
                                        : row[col.name];

                                    return (
                                        <TableCell
                                            sx={{ ...TableCellStyleOverrides }}
                                            align={col.align}
                                            key={colIndex}
                                        >
                                            {editingRows[index] && col.editable ? (
                                                <Input
                                                    sx={{ ...InputStyleOverrides }}
                                                    fullWidth={type === "text" ? true : false}
                                                    value={value}
                                                    type={type}
                                                    onChange={(event) =>
                                                        handleCellChange(
                                                            event.target.value,
                                                            editingRows[index],
                                                            col
                                                        )
                                                    }
                                                />
                                            ) : (
                                                formatValue(value, col)
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
                {footerRow && footerLabel && (
                    <TableFooter>
                        <TableRow hover>
                            <TableCell align="center" sx={{ ...FooterCellStyleOverrides }}>
                                {footerLabel}
                            </TableCell>
                            {cols.map((col, index) => {
                                const value = footerRow[col.name];
                                return (
                                    <TableCell
                                        align={col.align}
                                        key={index}
                                        sx={{ ...FooterCellStyleOverrides }}
                                    >
                                        {(!!value || value === 0) && formatValue(value, col)}
                                    </TableCell>
                                );
                            })}
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
