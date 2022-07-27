import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import Pagination, { PaginationProps } from "@vertigis/web/ui/Pagination";

type SettablePaginationProps = Pick<
    PaginationProps,
    | "boundaryCount"
    | "color"
    | "count"
    | "hideNextButton"
    | "hidePrevButton"
    | "page"
    | "shape"
    | "showFirstButton"
    | "showLastButton"
    | "siblingCount"
    | "size"
    | "variant"
>;

interface PaginationElementProps extends FormElementProps, SettablePaginationProps {}

/**
 * A pagination form element that enables the user to select a specific page from a range of pages.
 * @displayName Pagination
 * @description A pagination form element that enables the user to select a specific page from a range of pages.
 * @param props The props that will be provided by the Workflow runtime.
 */
function PaginationElement(props: PaginationElementProps): React.ReactElement {
    const {
        boundaryCount,
        color,
        count,
        enabled,
        hideNextButton,
        hidePrevButton,
        page,
        raiseEvent,
        setProperty,
        shape,
        showFirstButton,
        showLastButton,
        siblingCount,
        size,
        variant,
    } = props;

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setProperty("page", value);
        raiseEvent("changed" as any, value);
    };

    return (
        <Pagination
            boundaryCount={boundaryCount}
            color={color}
            count={count}
            disabled={!enabled}
            hideNextButton={hideNextButton}
            hidePrevButton={hidePrevButton}
            onChange={handleChange}
            page={page}
            shape={shape}
            showFirstButton={showFirstButton}
            showLastButton={showLastButton}
            siblingCount={siblingCount}
            size={size}
            sx={{
                // Hack required to override .gcx-forms.defaults
                ["& button"]: {
                    borderRadius: "50% !important",
                    marginRight: "3px !important",
                },
            }}
            variant={variant}
        />
    );
}

const PaginationElementRegistration: FormElementRegistration<PaginationElementProps> = {
    component: PaginationElement,
    // The Pagination component gets into a bad state if you change from uncontrolled to controlled.
    // The page prop determines this, but it can only be set by a subworkflow on load.
    getInitialProperties: () => ({ count: 1, page: 1 }),
    id: "Pagination",
};

export default PaginationElementRegistration;
