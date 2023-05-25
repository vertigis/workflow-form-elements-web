import Box, { BoxProps } from "@vertigis/web/ui/Box";
import Edit from "@vertigis/web/ui/icons/Edit";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import IconButton, { IconButtonProps } from "@vertigis/web/ui/IconButton";
import Input from "@vertigis/web/ui/Input";
import React, { useState, useEffect, CSSProperties } from "react";
import Save from "@vertigis/web/ui/icons/Save";
import Table, { TableProps } from "@vertigis/web/ui/Table";
import TableBody from "@vertigis/web/ui/TableBody";
import TableCell, { TableCellProps } from "@vertigis/web/ui/TableCell";
import TableFooter from "@vertigis/web/ui/TableFooter";
import TableHead from "@vertigis/web/ui/TableHead";
import TableRow from "@vertigis/web/ui/TableRow";
import DynamicIcon from "@vertigis/web/ui/DynamicIcon/DynamicIcon";

type Total = Record<string, any>;
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
    includeTotal?: boolean;
    editable: boolean;
    type: string;
    name: string;
}

interface EditableTableElementProps
    extends FormElementProps<Row[]>,
        SettableBoxProps,
        SettableTableProps {
    cols: Column[];
    rows: Row[];
    editTooltip?: string;
    saveTooltip?: string;
    includeTotals?: boolean;
    footerLabel?: string;
    footerStyle?: CSSProperties;
    saveIcon?: string;
    editIcon?: string;
    onMouseEnter?: (row: Row) => void;
    onMouseLeave?: (row: Row) => void;
    onChange?: (data: Row[], row: Row) => void;
}

const IconButtonStyleOverrides: IconButtonProps["sx"] = {
    // Hack required to override .gcx-forms.defaults
    borderRadius: "50% !important",
    // Hack required to match disabled list item content
    "&.Mui-disabled": {
        opacity: 0.38,
    },
};

const calculateTotals = (cols: Column[], rows: Row[]): Total => {
    const totalCols = cols.filter((x) => x.includeTotal);
    const total: Total = {};
    for (const col of totalCols) {
        const vals = rows.map((x) => x[col.name]);
        const numericVals = vals.filter((x) => typeof x == "number");
        const sum =
            numericVals.length > 0 ? numericVals.reduce((s: number, a: number) => s + a, 0) : 0;
        total[col.name] = sum;
    }
    return total;
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
        onChange,
        raiseEvent,
        setValue,
        size,
        editTooltip,
        saveTooltip,
        stickyHeader,
        footerLabel,
        footerStyle,
        saveIcon,
        editIcon,
    } = props;
    const [data, setData] = useState(rows);
    setValue(data);
    useEffect(() => {
        setData(rows);
    }, [rows]);

    const includeTotals = cols.some((x) => x.includeTotal);
    const totalData: Total = calculateTotals(cols, rows);
    const footerLbl = footerLabel ?? "Total";
    const editIconSrc: string = editIcon ?? "edit";
    const saveIconSrc: string = saveIcon ?? "save";
    const editTitle = editTooltip ?? "Edit";
    const saveTitle = saveTooltip ?? "Save";

    const handleEditToggleClick = (event: React.MouseEvent, row: Row) => {
        if (row.isEditing) {
            raiseEvent("custom", {
                eventType: "rowChange",
                rowData: { rows: data, row: row },
            });
        }
        row.isEditing = !row.isEditing;
        setData([...data]);
        setValue(data);
    };

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
        if ((event.target as any).type === "number") {
            const regex = /^[0-9\b]+$/;
            if (event.target.value === "" || regex.test(event.target.value)) {
                row[column.name] = Number(event.target.value);
            }
            row[column.name] = Number(event.target.value);
        } else if (column?.parse) {
            row[column.name] = column.parse(event, row, column);
        } else {
            row[column.name] = event.target.value;
        }
        if (onChange) {
            onChange(data, row);
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
                            <TableRow hover key={index}>
                                <TableCell align="center" sx={{ p: 0 }}>
                                    {
                                        <IconButton
                                            onClick={(event) => handleEditToggleClick(event, row)}
                                            title={row.isEditing ? saveTitle : editTitle}
                                            sx={{
                                                ...IconButtonStyleOverrides,
                                            }}
                                        >
                                            {row.isEditing ? (
                                                saveIcon ? (
                                                    <DynamicIcon
                                                        src={
                                                            row.isEditing
                                                                ? saveIconSrc
                                                                : editIconSrc
                                                        }
                                                        tabIndex={-1}
                                                    />
                                                ) : (
                                                    <Save titleAccess={saveTooltip} tabIndex={-1} />
                                                )
                                            ) : editIcon ? (
                                                <DynamicIcon src={editIcon} />
                                            ) : (
                                                <Edit titleAccess={editTooltip} tabIndex={-1} />
                                            )}
                                        </IconButton>
                                    }
                                </TableCell>
                                {cols.map((col, index) => {
                                    const value = row[col.name];
                                    const formattedValue = col.format ? col.format(value) : value;
                                    const inputProps = {};
                                    if (
                                        (col.type === "checkbox" || col.type === "radio") &&
                                        typeof value === "boolean"
                                    ) {
                                        inputProps["checked"] = value;
                                    }
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
                                            {col.editable && row.isEditing ? (
                                                <Input
                                                    readOnly={false}
                                                    type={col.type}
                                                    value={value}
                                                    defaultValue={value}
                                                    onChange={(event) =>
                                                        handleCellChange(event, row, col)
                                                    }
                                                    inputProps={inputProps}
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
                {includeTotals && (
                    <TableFooter>
                        <TableRow hover>
                            <TableCell align="center" sx={footerStyle}>
                                {footerLbl}
                            </TableCell>
                            {cols.map((col, index) =>
                                totalData[col.name] ? (
                                    <TableCell align={col.align} key={index} sx={footerStyle}>
                                        {col.format
                                            ? col.format(totalData[col.name])
                                            : totalData[col.name]}
                                    </TableCell>
                                ) : (
                                    <TableCell sx={footerStyle} />
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
        value: [],
    }),
    id: "EditableTable",
};

export default EditableTableRegistration;
