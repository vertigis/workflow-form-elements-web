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
import IconButton, { IconButtonProps } from "@vertigis/web/ui/IconButton";
import DynamicIcon from "@vertigis/web/ui/DynamicIcon";

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
}

interface EditableTableElementProps
    extends FormElementProps<RowData[]>,
    SettableBoxProps,
    SettableTableProps {
    cols: Column[];
    rows: RowData[];
    editIcon: string;
    saveIcon: string;
    cancelIcon: string;
    footerLabel?: string;
    onMouseEnter?: (row: RowData) => void;
    onMouseLeave?: (row: RowData) => void;
    rowCalculation?: (value: string | number, row: RowData, column: Column) => RowData;
}

//Mimic MUI header style for footer
const TableCellStyleOverrides: TableCellProps["sx"] = {
    fontFamily: "var(--defaultFont)",
    backgroundColor: "var(--secondaryBackground)",
    fontWeight: "bold",
    color: "var(--secondaryForeground)",
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
        editIcon,
        saveIcon,
        cancelIcon,
        onMouseEnter,
        onMouseLeave,
        raiseEvent,
        rowCalculation,
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

        if (rowCalculation) {
            rowCalculation(row[column.name], row, column);
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
                                <TableCell sx={{ width: "10%" }}>
                                    {editingRows && editingRows[index] ? (
                                        <Box sx={{ maxWidth: "md" }}>
                                            <IconButton
                                                onClick={(event) =>
                                                    handleToggleEdit(event, index, rows)
                                                }
                                                sx={{
                                                    ...IconButtonStyleOverrides,
                                                }}
                                            >
                                                <DynamicIcon src={saveIcon} />
                                            </IconButton>
                                            <IconButton
                                                onClick={(event) =>
                                                    handleCancel(event, index, rows)
                                                }
                                                sx={{
                                                    ...IconButtonStyleOverrides,
                                                }}
                                            >
                                                <DynamicIcon src={cancelIcon} />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Box sx={{ maxWidth: "md" }}>
                                            <IconButton
                                                onClick={(event) =>
                                                    handleToggleEdit(event, index, rows)
                                                }
                                                sx={{
                                                    ...IconButtonStyleOverrides,
                                                }}
                                            >
                                                <DynamicIcon src={editIcon} />
                                            </IconButton>
                                        </Box>
                                    )}
                                </TableCell>

                                {cols.map((col, colIndex) => {
                                    const value = row[col.name];
                                    const type = col.type === "number" ? "number" : "text";

                                    return (
                                        <TableCell align={col.align} key={colIndex}>
                                            {col.editable && editingRows && editingRows[index] ? (
                                                <Input
                                                    fullWidth={false}
                                                    value={editingRows[index][col.name]}
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
                                                value
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
                                        {footerRow[col.name]}
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
