import * as React from "react";
import clsx from "clsx";
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
import ListItemButton from "@vertigis/web/ui/ListItemButton";
import { UIContext } from "@vertigis/web/ui/UIContext";
import { BrandingService } from "@vertigis/web/branding/BrandingService";
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
    brandingService: BrandingService,
    handleMouseEnter: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleMouseLeave: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleItemClick: (node: any) => void,
    handleFolderClick: (node: any) => void,
    handleSecondaryActionClick: (event: React.MouseEvent, node: TreeElementNode) => void
) {
    const isDense = brandingService.density === "compact";
    const isFolder = Array.isArray(node.children);
    const isNode = !node.children;
    const m = 1.5 * level;
    const icon = (
        <ChevronDownIcon
            fontSize="small"
            className="gcx-layer-tree-node-expand-button"
            sx={{
                transform: `rotate(${node.open ? 0 : -90}deg)`,
                transition: "transform 0.2s ease-in-out",
            }}
        />
    );
    return (
        <React.Fragment>
            <ListItemButton
                key={node.key}
                className={clsx(FOCUSABLE_LIST_ITEM_CLASS, {
                    "gcx-layer-tree-node-compact": isDense,
                })}
                sx={{ paddingLeft: (theme) => theme.spacing(m) }}
                onMouseEnter={(event) => handleMouseEnter(event, node)}
                onMouseLeave={(event) => handleMouseLeave(event, node)}
            >
                <ListItemIcon
                    className="layer-tree-item-icon-container"
                    sx={{ alignItems: "center", minWidth: 70 }}
                    data-testid="layer-tree-item-icon-container"
                >
                    {isNode && showCheckBoxes && (
                        <Checkbox
                            className="gcx-layer-tree-node-checked-toggle"
                            checked={node.checked}
                            tabIndex={-1}
                            disableRipple
                            onClick={() => handleItemClick(node)}
                        />
                    )}
                    {node.icon && <DynamicIcon src={node.icon} fontSize="small" sx={{ ml: 1 }} />}
                </ListItemIcon>

                {node.link ? (
                    <Link rel="noreferrer" target="_blank" href={node.link}>
                        <ListItemText
                            className={"gcx-layer-tree-node-title"}
                            primary={node.primary}
                            secondary={node.secondary}
                        />
                    </Link>
                ) : (
                    <ListItemText
                        sx={{ overflow: "hidden" }}
                        className={"gcx-layer-tree-node-title"}
                        primary={node.primary}
                        secondary={node.secondary}
                        onClick={(event) => handleSecondaryActionClick(event, node)}
                    />
                )}
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
                            showCheckBoxes,
                            level + 1,
                            brandingService,
                            handleMouseEnter,
                            handleMouseLeave,
                            handleItemClick,
                            handleFolderClick,
                            handleSecondaryActionClick
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
    brandingService: BrandingService,
    handleMouseEnter: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleMouseLeave: (event: React.MouseEvent, node: TreeElementNode) => void,
    handleItemClick: (node: any) => void,
    handleFolderClick: (node: any) => void,
    handleSecondaryActionClick: (event: React.MouseEvent, node: TreeElementNode) => void
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
                brandingService,
                handleMouseEnter,
                handleMouseLeave,
                handleItemClick,
                handleFolderClick,
                handleSecondaryActionClick
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
        value,
        showCheckBoxes,
        onClick,
        onMouseEnter,
        onMouseLeave,
        raiseEvent,
        setValue,
    } = props;
    const [items, setItems] = React.useState(props.items);

    const { brandingService } = React.useContext(UIContext);

    const handleMouseEnter = (event: React.MouseEvent, node: TreeElementNode) => {
        raiseEvent("custom", { eventType: "mouseEnter", node });
        onMouseEnter?.(node);
    };

    const handleMouseLeave = (event: React.MouseEvent, node: TreeElementNode) => {
        raiseEvent("custom", { eventType: "mouseLeave", node });
        onMouseLeave?.(node);
    };

    const handleSecondaryActionClick = (event: React.MouseEvent, node: any) => {
        raiseEvent("custom", { eventType: "secondaryAction", node });
    };

    const handleFolderClick = (node: TreeElementNode) => {
        if (node.children && node.children.length > 0) {
            node.open = !node.open;
            setItems([...items]);
        }
    };

    const handleItemClick = (node: TreeElementNode) => {
        if (showCheckBoxes) {
            node.checked = !node.checked;
            setValue(filterTree(items));
        } else {
            setValue([node]);
        }

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
                    showCheckBoxes,
                    0,
                    brandingService,
                    handleMouseEnter,
                    handleMouseLeave,
                    handleItemClick,
                    handleFolderClick,
                    handleSecondaryActionClick
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
export const FOCUSABLE_LIST_ITEM_CLASS = "gcx-layer-tree-node";
export const FOCUSABLE_LIST_ITEM_SELECTOR = `.${FOCUSABLE_LIST_ITEM_CLASS}`;
