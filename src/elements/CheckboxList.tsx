import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import List, { ListProps } from "@vertigis/web/ui/List";
import ListItem from "@vertigis/web/ui/ListItem";
import ListItemButton from "@vertigis/web/ui/ListItemButton";
import ListItemIcon from "@vertigis/web/ui/ListItemIcon";
import ListItemText from "@vertigis/web/ui/ListItemText";
import IconButton, { IconButtonProps } from "@vertigis/web/ui/IconButton";
import Checkbox from "@vertigis/web/ui/Checkbox";
import DynamicIcon from "@vertigis/web/ui/DynamicIcon";
import Box, { BoxProps } from "@vertigis/web/ui/Box";

const IconButtonStyleOverrides: IconButtonProps["sx"] = {
    // Hack required to override .gcx-forms.defaults
    borderRadius: "50% !important",
    // Hack required to match disabled list item content
    "&.Mui-disabled": {
        opacity: 0.38,
    },
};

type SettableBoxProps = Pick<BoxProps, "maxHeight" | "maxWidth">;

type SettableListProps = Pick<ListProps, "dense" | "subheader">;

interface ListElementItem {
    icon?: string;
    divider?: boolean;
    primary: string;
    disabled?: boolean;
    secondary?: string;
    secondaryIcon?: string;
}

interface CheckboxListElementProps
    extends FormElementProps<ListElementItem[]>,
        SettableBoxProps,
        SettableListProps {
    enableDelete?: boolean;
    items: ListElementItem[];
    onClick?: (item: ListElementItem) => void;
    onDelete?: (item: ListElementItem) => void;
    onMouseEnter?: (item: ListElementItem) => void;
    onMouseLeave?: (item: ListElementItem) => void;
}

/**
 * A checkbox list form element.
 * @displayName Checkbox List
 * @description A checkbox list form element.
 * @param props The props that will be provided by the Workflow runtime.
 */
function CheckboxListElement(props: CheckboxListElementProps): React.ReactElement {
    const {
        enableDelete,
        dense,
        items = [],
        maxHeight,
        maxWidth,
        onClick,
        onDelete,
        onMouseEnter,
        onMouseLeave,
        raiseEvent,
        setProperty,
        setValue,
        subheader,
        value,
    } = props;

    const handleItemClick = (event: React.MouseEvent<HTMLElement>, item: any) => {
        if (value.includes(item)) {
            setValue(value.filter((x) => x !== item));
        } else {
            setValue([...value, item]);
        }
        raiseEvent("clicked" as any, item);
        onClick?.(item);
    };

    const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>, item: any) => {
        setProperty(
            "items",
            items.filter((x) => x !== item)
        );
        if (value.includes(item)) {
            setValue(value.filter((x) => x !== item));
        }
        raiseEvent("custom", { eventType: "delete", item });
        onDelete?.(item);
    };

    const handleSecondaryActionClick = (event: React.MouseEvent<HTMLButtonElement>, item: any) => {
        raiseEvent("custom", { eventType: "secondaryAction", item });
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLLIElement>, item: any) => {
        raiseEvent("custom", { eventType: "mouseEnter", item });
        onMouseEnter?.(item);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLLIElement>, item: any) => {
        raiseEvent("custom", { eventType: "mouseLeave", item });
        onMouseLeave?.(item);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key?.toLowerCase() === "a" && event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            // Only toggle the state of enabled items
            if (items.filter((x) => !x.disabled).every((x) => value.includes(x))) {
                setValue(value.filter((x) => x.disabled));
            } else {
                setValue(items.filter((x) => !x.disabled || value.includes(x)));
            }
        }
    };

    return (
        <Box
            maxHeight={maxHeight}
            maxWidth={maxWidth}
            sx={{
                overflowY: "auto",
                // Hack required to override .gcx-forms.defaults
                ["& button"]: {
                    marginRight: "0 !important",
                },
            }}
        >
            <List dense={dense} onKeyDown={handleKeyDown} subheader={subheader}>
                {items.map((item, index) => (
                    <ListItem
                        disablePadding
                        divider={item.divider}
                        key={index}
                        onMouseEnter={(event) => handleMouseEnter(event, item)}
                        onMouseLeave={(event) => handleMouseLeave(event, item)}
                        secondaryAction={
                            <>
                                {item.secondaryIcon && (
                                    <IconButton
                                        disabled={item.disabled}
                                        onClick={(event) => handleSecondaryActionClick(event, item)}
                                        sx={{
                                            ...IconButtonStyleOverrides,
                                        }}
                                    >
                                        <DynamicIcon src={item.secondaryIcon} />
                                    </IconButton>
                                )}
                                {enableDelete && (
                                    <IconButton
                                        disabled={item.disabled}
                                        onClick={(event) => handleDeleteClick(event, item)}
                                        sx={{
                                            ...IconButtonStyleOverrides,
                                        }}
                                    >
                                        <DynamicIcon src="trash" />
                                    </IconButton>
                                )}
                            </>
                        }
                    >
                        <ListItemButton
                            disabled={item.disabled}
                            onClick={(event) => handleItemClick(event, item)}
                            selected={value.includes(item)}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={value.includes(item)}
                                    tabIndex={-1}
                                    disableRipple
                                />
                            </ListItemIcon>
                            {item.icon && (
                                <ListItemIcon>
                                    <DynamicIcon src={item.icon} />
                                </ListItemIcon>
                            )}
                            <ListItemText primary={item.primary} secondary={item.secondary} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

const ListElementRegistration: FormElementRegistration<CheckboxListElementProps> = {
    component: CheckboxListElement,
    getInitialProperties: () => ({
        items: [],
        value: [],
    }),
    id: "CheckboxList",
};

export default ListElementRegistration;
