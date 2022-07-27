import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import List, { ListProps } from "@vertigis/web/ui/List";
import ListItem, { ListItemProps } from "@vertigis/web/ui/ListItem";
import ListItemButton from "@vertigis/web/ui/ListItemButton";
import ListItemIcon from "@vertigis/web/ui/ListItemIcon";
import ListItemText, { ListItemTextProps } from "@vertigis/web/ui/ListItemText";
import IconButton, { IconButtonProps } from "@vertigis/web/ui/IconButton";
import DynamicIcon, { DynamicIconProps } from "@vertigis/web/ui/DynamicIcon";
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
    icon?: DynamicIconProps["src"];
    divider: ListItemProps["divider"];
    primary: ListItemTextProps["primary"];
    disabled?: boolean;
    secondary?: ListItemTextProps["primary"];
    secondaryIcon?: DynamicIconProps["src"];
}

interface ListElementProps
    extends FormElementProps<ListElementItem | undefined>,
        SettableBoxProps,
        SettableListProps {
    enableDelete?: boolean;
    items: ListElementItem[];
}

/**
 * A list form element.
 * @displayName List
 * @description A list form element.
 * @param props The props that will be provided by the Workflow runtime.
 */
function ListElement(props: ListElementProps): React.ReactElement {
    const {
        enableDelete,
        dense,
        items = [],
        maxHeight,
        maxWidth,
        raiseEvent,
        setProperty,
        setValue,
        subheader,
        value,
    } = props;

    const handleItemClick = (event: React.MouseEvent<HTMLElement>, item: any) => {
        setValue(item);
        raiseEvent("clicked" as any, item);
    };

    const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>, item: any) => {
        setProperty(
            "items",
            items.filter((x) => x !== item)
        );
        if (value === item) {
            setValue(undefined);
        }
        raiseEvent("custom", { eventType: "delete", item });
    };

    const handleSecondaryActionClick = (event: React.MouseEvent<HTMLButtonElement>, item: any) => {
        raiseEvent("custom", { eventType: "secondaryAction", item });
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
            <List dense={dense} subheader={subheader}>
                {items.map((item, index) => (
                    <ListItem
                        disablePadding
                        divider={item.divider}
                        key={index}
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
                            selected={value === item}
                        >
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

const ListElementRegistration: FormElementRegistration<ListElementProps> = {
    component: ListElement,
    getInitialProperties: () => ({
        items: [],
    }),
    id: "List",
};

export default ListElementRegistration;
