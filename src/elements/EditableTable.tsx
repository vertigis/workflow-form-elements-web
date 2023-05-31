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
import Save from "@vertigis/web/ui/icons/Save";
import Undo from "@vertigis/web/ui/icons/Undo";
import Cancel from "@vertigis/web/ui/icons/Cancel";

import * as locale from "@vertigis/arcgis-extensions/locale";
import * as numberUtils from "@vertigis/arcgis-extensions/utilities/number";

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
    step?: string;
    numberFormat?: numberUtils.FormatOptions;
    footerFormat?: numberUtils.FormatOptions;
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
    onRowEdit?: (row: RowData) => RowData;
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

const setLocale = (formatOptions: numberUtils.FormatOptions): numberUtils.FormatOptions => {
    if (!formatOptions.locale) {
        formatOptions["locale"] = locale.detectLocale();
    }
    return formatOptions;
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

const formatValue = (value: string | number, column: Column, type: string): string | number => {
    const format = column.numberFormat ? setLocale(column.numberFormat) : undefined;
    const formattedValue =
        type === "number"
            ? format
                ? numberUtils.format(format as string, value as number)
                : value
            : value;
    return formattedValue;
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
    const footerRow: FooterRow = calculateFooterRow(cols, rows);

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

    const handleToggleEdit = (event: React.MouseEvent, index: number, rows: RowData[]) => {
        const row = rows[index];
        const editRow = editingRows[index];

        if (editRow) {
            rows[index] = editingRows[index];
            delete editingRows[index];
        } else {
            editingRows[index] = JSON.parse(JSON.stringify(row));
        }
        if (onRowEdit) {
            onRowEdit(rows[index]);
        }
        setData([...rows]);
    };

    const handleCancel = (event: React.MouseEvent, index: number, rows: RowData[]) => {
        setData([...rows]);
        delete editingRows[index];
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
                                    {editingRows && editingRows[index] ? (
                                        <>
                                            <IconButton
                                                onClick={(event) =>
                                                    handleToggleEdit(event, index, rows)
                                                }
                                                sx={{
                                                    ...IconButtonStyleOverrides,
                                                }}
                                            >
                                                <Save />
                                            </IconButton>
                                            <IconButton
                                                onClick={(event) =>
                                                    handleCancel(event, index, rows)
                                                }
                                                sx={{
                                                    ...IconButtonStyleOverrides,
                                                }}
                                            >
                                                <Cancel />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <IconButton
                                            onClick={(event) =>
                                                handleToggleEdit(event, index, rows)
                                            }
                                            sx={{
                                                ...IconButtonStyleOverrides,
                                            }}
                                        >
                                            <Undo />
                                        </IconButton>
                                    )}
                                </TableCell>

                                {cols.map((col, colIndex) => {
                                    const type = col.type === "number" ? "number" : "text";

                                    const value = editingRows[index]
                                        ? editingRows[index][col.name]
                                        : row[col.name];
                                    const formattedValue = formatValue(value, col, type);

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
                            <TableCell align="center" sx={{ ...FooterCellStyleOverrides }}>
                                {footerLabel}
                            </TableCell>
                            {cols.map((col, index) => {
                                const type = col.type === "number" ? "number" : "text";
                                const value = footerRow[col.name];
                                const formattedValue = formatValue(value, col, type);

                                const cell = footerRow[col.name] ? (
                                    <TableCell
                                        align={col.align}
                                        key={index}
                                        sx={{ ...FooterCellStyleOverrides }}
                                    >
                                        {formattedValue}
                                    </TableCell>
                                ) : (
                                    <TableCell sx={{ ...FooterCellStyleOverrides }} />
                                );
                                return cell;
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
