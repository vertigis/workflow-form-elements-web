import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import List, { ListProps } from "@vertigis/web/ui/List";
import ListItem from "@vertigis/web/ui/ListItem";
import ListItemIcon from "@vertigis/web/ui/ListItemIcon";
import { ListItemTextProps } from "@vertigis/web/ui/ListItemText";
import { IconButtonProps } from "@vertigis/web/ui/IconButton";
import DynamicIcon, { DynamicIconProps } from "@vertigis/web/ui/DynamicIcon";
import Collapse from "@vertigis/web/ui/Collapse";
import Box, { BoxProps } from "@vertigis/web/ui/Box";
import Button from "@vertigis/web/ui/Button";
import Typography from "@vertigis/web/ui/Typography";
import Checkbox, { CheckboxProps } from "@vertigis/web/ui/Checkbox";

/**
 * Properties for the `Tree` component.
 */
export declare type TreeViewProps = {
    showCheckBoxes?: boolean;
};

const IconButtonStyleOverrides: IconButtonProps["sx"] = {
    // Hack required to override .gcx-forms.defaults
    paddingLeft: "0rem !important",
    marginRight: "0rem !important",
    // Hack required to match disabled list Node content
    "&.Mui-disabled": {
        opacity: 0.38,
    },
};

const NoCheckIconButtonStyleOverrides: IconButtonProps["sx"] = {
    // Hack required to override .gcx-forms.defaults
    paddingLeft: "3rem !important",
    // Hack required to match disabled list Node content
    "&.Mui-disabled": {
        opacity: 0.38,
    },
};

const TreeStyleOverrides: BoxProps["sx"] = {
    // Hack required to override .gcx-forms.defaults
    marginTop: "0 !important",
    ["& ul"]: {
        margin: "(0rem, 0rem, 0rem) !important",
    },
};

const CheckBoxStyleOverrides: CheckboxProps["sx"] = {
    marginRight: "0rem !important",
    paddingRight: "0rem !important",
    paddingLeft: "1.0rem !important",
    minWidth: "0rem !important",

    // Hack required to match disabled list Node content
    "&.Mui-disabled": {
        opacity: 0.38,
    },
};

type SettableBoxProps = Pick<BoxProps, "maxHeight" | "maxWidth">;

type SettableTreeProps = Pick<ListProps, "dense" | "subheader">;

type SettableCheckBoxProps = Pick<TreeViewProps, "showCheckBoxes">;

interface TreeElementNode {
    key: string;
    open: boolean;
    primary: ListItemTextProps["primary"];
    link?: string;
    icon?: DynamicIconProps["src"];
    checked?: boolean;
    tooltip?: string;
    children?: TreeElementNode[];
}
interface TreeElementProps
    extends FormElementProps<TreeElementNode[] | undefined>,
        SettableBoxProps,
        SettableTreeProps,
        SettableCheckBoxProps {
    items: TreeElementNode[];
    onClick?: (node: TreeElementNode) => void;
    onMouseEnter?: (node: TreeElementNode) => void;
    onMouseLeave?: (node: TreeElementNode) => void;
}

function filterTree(nodes: TreeElementNode[]): TreeElementNode[] {
    let children: TreeElementNode[] = [];
    const flattenMembers = nodes.map((m: TreeElementNode) => {
        if (m.children && m.children.length) {
            children = [...children, ...m.children];
        }
        return m;
    });

    return flattenMembers.concat(children.length ? filterTree(children) : children);
}

function renderChild(
    node: TreeElementNode,
    index: number,
    value: TreeElementNode[] | undefined,
    showCheckBoxes: boolean | undefined,
    level: number,
    handleMouseEnter: (event: React.MouseEvent<HTMLLIElement, MouseEvent>, node: any) => void,
    handleMouseLeave: (event: React.MouseEvent<HTMLLIElement, MouseEvent>, node: any) => void,
    handleItemClick: (node: any) => void,
    handleKeyDown: (event: React.KeyboardEvent, node: any) => void
): JSX.Element {
    const isFolder = Array.isArray(node.children);
    const isNode = !node.children;
    const m = 1.2 * level;
    return (
        <React.Fragment>
            <ListItem
                sx={
                    isFolder || isNode
                        ? { marginLeft: `${m}rem !important`, marginRight: "0rem !important" }
                        : undefined
                }
                disablePadding
                key={index}
                onMouseEnter={(event) => handleMouseEnter(event, node)}
                onMouseLeave={(event) => handleMouseLeave(event, node)}
                onClick={() => handleItemClick(node)}
                onKeyDown={isNode ? (event) => handleKeyDown(event, node) : undefined}
            >
                {isNode && showCheckBoxes && (
                    <ListItemIcon
                        sx={{
                            marginRight: "0rem !important",
                        }}
                    >
                        <Checkbox
                            sx={CheckBoxStyleOverrides}
                            edge="start"
                            checked={node.checked}
                            tabIndex={-1}
                            disableRipple
                        />
                    </ListItemIcon>
                )}
                <Button
                    sx={showCheckBoxes ? IconButtonStyleOverrides : NoCheckIconButtonStyleOverrides}
                    variant="text"
                    href={node.link && node.link}
                    startIcon={node.icon && <DynamicIcon src={node.icon} />}
                >
                    <Typography
                        text={node.primary?.toLocaleString()}
                        title={node.tooltip}
                    ></Typography>
                </Button>
            </ListItem>
            {isFolder && node.children && (
                <Collapse in={node.open}>
                    <List sx={TreeStyleOverrides}>
                        {renderList(
                            node.children,
                            value,
                            showCheckBoxes,
                            level + 1,
                            handleMouseEnter,
                            handleMouseLeave,
                            handleItemClick,
                            handleKeyDown
                        )}
                    </List>
                </Collapse>
            )}
        </React.Fragment>
    );
}

function renderList(
    nodes: TreeElementNode[],
    value: TreeElementNode[] | undefined,
    showCheckBoxes: boolean | undefined,
    level: number,
    handleMouseEnter: (event: React.MouseEvent<HTMLLIElement, MouseEvent>, node: any) => void,
    handleMouseLeave: (event: React.MouseEvent<HTMLLIElement, MouseEvent>, node: any) => void,
    handleItemClick: (node: any) => void,
    handleKeyDown: (event: React.KeyboardEvent, node: any) => void
): JSX.Element[] {
    const listItems: JSX.Element[] = [];
    nodes.forEach((node, index) => {
        listItems.push(
            renderChild(
                node,
                index,
                value,
                showCheckBoxes,
                level,
                handleMouseEnter,
                handleMouseLeave,
                handleItemClick,
                handleKeyDown
            )
        );
    });

    return listItems;
}

/**
 * A tree view form element.
 * @displayName Tree
 * @description A tree view form element.
 * @param props The props that will be provided by the Workflow runtime.
 */
function TreeElement(props: TreeElementProps): React.ReactElement {
    const {
        dense,
        maxHeight,
        maxWidth,
        subheader,
        items,
        value,
        showCheckBoxes,
        onClick,
        onMouseEnter,
        onMouseLeave,
        raiseEvent,
        setValue,
    } = props;

    const handleMouseEnter = (event: React.MouseEvent<HTMLLIElement>, node: TreeElementNode) => {
        raiseEvent("custom", { eventType: event.type, node });
        onMouseEnter?.(node);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLLIElement>, node: TreeElementNode) => {
        raiseEvent("custom", { eventType: event.type, node });
        onMouseLeave?.(node);
    };

    const handleItemClick = (node: TreeElementNode) => {
        if (node.children && node.children.length > 0) {
            node.open = !node.open;
            setToggle(!toggle);
        } else if (showCheckBoxes) {
            node.checked = !node.checked;
            const filtered = filterTree(items);
            setValue(filtered?.filter((x) => x.checked));
        } else {
            setValue([node]);
        }

        raiseEvent("clicked" as any, node);
        onClick?.(node);
    };

    const handleKeyDown = (event: React.KeyboardEvent, node) => {
        if (event.key?.toLowerCase() === "a" && event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            if (node.children && node.children.length > 0) {
                node.open = !node.open;
                setToggle(!toggle);
            } else {
                node.checked = !node.checked;
                const filtered = filterTree(items);
                setValue(filtered?.filter((x) => x.checked));
            }
        }
    };

    const [toggle, setToggle] = React.useState(false);

    return (
        <Box maxHeight={maxHeight} maxWidth={maxWidth} sx={TreeStyleOverrides}>
            <List sx={TreeStyleOverrides} dense={dense} subheader={subheader}>
                {renderList(
                    items,
                    value,
                    showCheckBoxes,
                    0,
                    handleMouseEnter,
                    handleMouseLeave,
                    handleItemClick,
                    handleKeyDown
                )}
            </List>
        </Box>
    );
}

/**
 * A tree view.
 */

const TreeElementRegistration: FormElementRegistration<TreeElementProps> = {
    component: TreeElement,
    getInitialProperties: () => ({
        items: [],
        value: [],
    }),
    id: "Tree",
};

export default TreeElementRegistration;
