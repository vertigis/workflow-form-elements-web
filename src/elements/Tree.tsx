import * as React from "react";
import Box from "@vertigis/web/ui/Box";
import Checkbox, { CheckboxProps } from "@vertigis/web/ui/Checkbox";
import ChevronDownIcon from "@vertigis/web/ui/icons/ChevronDown";
import Collapse from "@vertigis/web/ui/Collapse";
import DynamicIcon, { DynamicIconProps } from "@vertigis/web/ui/DynamicIcon";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import IconButton, { IconButtonProps } from "@vertigis/web/ui/IconButton";
import List from "@vertigis/web/ui/List";
import ListItemIcon from "@vertigis/web/ui/ListItemIcon";
import ListItemText from "@vertigis/web/ui/ListItemText";
import ListItemButton from "@vertigis/web/ui/ListItemButton";

const IconButtonStyleOverrides: IconButtonProps["sx"] = {
    // Hack required to override .gcx-forms.defaults
    borderRadius: "50% !important",
    // Hack required to match disabled list item content
    "&.Mui-disabled": {
        opacity: 0.38,
    },
};

interface TreeElementNode {
    primary: string;
    open?: boolean;
    secondary?: string;
    icon?: DynamicIconProps["src"];
    checked?: boolean;
    children?: TreeElementNode[];
    disabled?: boolean;
}
interface TreeElementProps extends FormElementProps<TreeElementNode[] | undefined> {
    items: TreeElementNode[];
    onClick?: (node: TreeElementNode) => void;
    onSecondaryClick?: (node: TreeElementNode) => void;
    onMouseEnter?: (node: TreeElementNode) => void;
    onMouseLeave?: (node: TreeElementNode) => void;
    showCheckboxes?: boolean;
    dense?: boolean;
    subheader?: string;
    maxWidth?: number;
    maxHeight?: number;
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
    value: TreeElementNode[] | undefined,
    showCheckboxes: boolean | undefined,
    level: number,
    dense: boolean | undefined,
    handleMouseEnter: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleMouseLeave: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleItemClick: (node: TreeElementNode) => void,
    handleFolderClick: (node: TreeElementNode) => void
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const TreeCheckbox = (props: CheckboxProps) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [isChecked, setIsChecked] = React.useState(node.checked);

        return (
            <Checkbox
                onClick={() => {
                    setIsChecked(node.checked);
                }}
                checked={node.checked}
                onChange={(event) => {
                    setIsChecked(event.target.checked);
                }}
            />
        );
    };
    return (
        <React.Fragment>
            <ListItemButton
                disabled={node.disabled}
                sx={{
                    paddingLeft: (theme) => theme.spacing(m),
                }}
                onMouseEnter={(event) => handleMouseEnter(event, node)}
                onMouseLeave={(event) => handleMouseLeave(event, node)}
                onClick={() => handleItemClick(node)}
            >
                <ListItemIcon sx={{ alignItems: "center", minWidth: 70 }}>
                    {isNode && showCheckboxes && <TreeCheckbox tabIndex={-1} />}
                    {node.icon && (
                        <DynamicIcon
                            src={node.icon}
                            fontSize="small"
                            sx={IconButtonStyleOverrides}
                        />
                    )}
                </ListItemIcon>
                <ListItemText
                    sx={{ overflow: "hidden" }}
                    primary={node.primary}
                    secondary={node.secondary}
                />
                {isFolder && node.children && (
                    <IconButton
                        sx={IconButtonStyleOverrides}
                        onClick={() => handleFolderClick(node)}
                    >
                        {icon}
                    </IconButton>
                )}
            </ListItemButton>
            {isFolder && node.children && (
                <Collapse in={node.open}>
                    <List>
                        {renderList(
                            node.children,
                            value,
                            showCheckboxes,
                            level + 1,
                            dense,
                            handleMouseEnter,
                            handleMouseLeave,
                            handleItemClick,
                            handleFolderClick
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
    showCheckboxes: boolean | undefined,
    level: number,
    dense,
    handleMouseEnter: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleMouseLeave: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleItemClick: (node: any) => void,
    handleFolderClick: (node: any) => void
) {
    const listItems: JSX.Element[] = [];

    nodes.forEach((node) => {
        listItems.push(
            renderChild(
                node,
                value,
                showCheckboxes,
                level,
                dense,
                handleMouseEnter,
                handleMouseLeave,
                handleItemClick,
                handleFolderClick
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
        maxWidth,
        maxHeight,
        subheader,
        value,
        showCheckboxes,
        dense,
        onClick,
        onMouseEnter,
        onMouseLeave,
        raiseEvent,
        setValue,
    } = props;
    const [items, setItems] = React.useState(props?.items);

    const handleMouseEnter = (event: React.MouseEvent, node: TreeElementNode) => {
        raiseEvent("custom", { eventType: "mouseEnter", node });
        onMouseEnter?.(node);
    };

    const handleMouseLeave = (event: React.MouseEvent, node: TreeElementNode) => {
        raiseEvent("custom", { eventType: "mouseLeave", node });
        onMouseLeave?.(node);
    };

    const handleFolderClick = (node: TreeElementNode) => {
        if (node.children && node.children.length > 0) {
            node.open = !node.open;
            setItems([...items]);
        }
    };

    const handleItemClick = (node: TreeElementNode) => {
        if (showCheckboxes && !node.children) {
            node.checked = !node.checked;
            setValue(filterTree(items));
        } else {
            setValue([node]);
        }
        setItems([...items]);
        raiseEvent("clicked" as any, node);
        onClick?.(node);
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
                {renderList(
                    items,
                    value,
                    showCheckboxes,
                    0,
                    dense,
                    handleMouseEnter,
                    handleMouseLeave,
                    handleItemClick,
                    handleFolderClick
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
