import * as React from "react";

import Box, { BoxProps } from "@vertigis/web/ui/Box";
import Checkbox from "@vertigis/web/ui/Checkbox";
import ChevronDownIcon from "@vertigis/web/ui/icons/ChevronDown";
import Collapse from "@vertigis/web/ui/Collapse";
import DynamicIcon, { DynamicIconProps } from "@vertigis/web/ui/DynamicIcon";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import IconButton, { IconButtonProps } from "@vertigis/web/ui/IconButton";
import Link from "@vertigis/web/ui/Link";
import List, { ListProps } from "@vertigis/web/ui/List";
import ListItemIcon from "@vertigis/web/ui/ListItemIcon";
import ListItemText from "@vertigis/web/ui/ListItemText";
import ListItem from "@vertigis/web/ui/ListItem";

/**
 * Properties for the `Tree` component.
 */
export declare type TreeViewProps = {
    showCheckBoxes?: boolean;
};

const IconButtonStyleOverrides: IconButtonProps["sx"] = {
    // Hack required to override .gcx-forms.defaults
    borderRadius: "50% !important",
    // Hack required to match disabled list item content
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
    primary: string;
    secondary?: string;
    link?: string;
    icon?: DynamicIconProps["src"];
    checked?: boolean;
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

function flattenNodes(node: TreeElementNode, collection: TreeElementNode[]) {
    if (node.checked) {
        collection.push(node);
    }
    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            flattenNodes(child, collection);
        }
    } else {
        return;
    }
}

function filterTree(nodes: TreeElementNode[]) {
    const children: TreeElementNode[] = [];
    for (const node of nodes) {
        flattenNodes(node, children);
    }
    return children;
}

function renderChild(
    node: TreeElementNode,
    index: number,
    value: TreeElementNode[] | undefined,
    showCheckBoxes: boolean | undefined,
    level: number,
    handleMouseEnter: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleMouseLeave: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleItemClick: (node: any) => void
) {
    const isFolder = Array.isArray(node.children);
    const isNode = !node.children;
    const m = 1.5 * level;
    const icon = (
        <ChevronDownIcon
            fontSize="small"
            sx={{
                transform: `rotate(${node.open ? 0 : -90}deg)`,
                transition: "transform 0.2s ease-in-out",
            }}
        />
    );
    return (
        <React.Fragment>
            <ListItem key={node.key} sx={{ paddingLeft: (theme) => theme.spacing(m) }}>
                {isNode && showCheckBoxes && (
                    <ListItemIcon>
                        <Checkbox
                            edge="start"
                            checked={node.checked}
                            tabIndex={-1}
                            disableRipple
                            onClick={() => handleItemClick(node)}
                        />
                    </ListItemIcon>
                )}
                {node.icon && (
                    <ListItemIcon sx={IconButtonStyleOverrides}>
                        <DynamicIcon src={node.icon} />
                    </ListItemIcon>
                )}
                {node.link ? (
                    <Link href={node.link}>
                        <ListItemText primary={node.primary} secondary={node.secondary} />
                    </Link>
                ) : (
                    <ListItemText primary={node.primary} secondary={node.secondary} />
                )}
                {isFolder && node.children && (
                    <IconButton onClick={() => handleItemClick(node)}>{icon}</IconButton>
                )}
            </ListItem>
            {isFolder && node.children && (
                <Collapse in={node.open}>
                    <List>
                        {renderList(
                            node.children,
                            value,
                            showCheckBoxes,
                            level + 1,
                            handleMouseEnter,
                            handleMouseLeave,
                            handleItemClick
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
    handleMouseEnter: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleMouseLeave: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleItemClick: (node: any) => void
) {
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
                handleItemClick
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

    const handleMouseEnter = (event: React.MouseEvent, node: TreeElementNode) => {
        raiseEvent("custom", { eventType: "mouseEnter", node });
        onMouseEnter?.(node);
    };

    const handleMouseLeave = (event: React.MouseEvent, node: TreeElementNode) => {
        raiseEvent("custom", { eventType: "mouseLeave", node });
        onMouseLeave?.(node);
    };

    const handleItemClick = (node: TreeElementNode) => {
        if (node.children && node.children.length > 0) {
            node.open = !node.open;
            setToggle(!toggle);
        } else if (showCheckBoxes) {
            node.checked = !node.checked;
            setValue(filterTree(items));
        } else {
            setValue([node]);
        }

        raiseEvent("clicked" as any, node);
        onClick?.(node);
    };

    const [toggle, setToggle] = React.useState(false);

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
                {renderList(
                    items,
                    value,
                    showCheckBoxes,
                    0,
                    handleMouseEnter,
                    handleMouseLeave,
                    handleItemClick
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
