import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import Link, { LinkProps } from "@vertigis/web/ui/Link";

type SettableLinkProps = Pick<
    LinkProps,
    "href" | "showExternalLinkIcon" | "target" | "underline" | "variant"
>;

interface LinkElementProps extends FormElementProps, SettableLinkProps {
    text: string;
    tooltip?: string;
}

/**
 * A hyperLink form element.
 * @displayName Link
 * @description A hyperlink form element.
 * @param props The props that will be provided by the Workflow runtime.
 */
function LinkElement(props: LinkElementProps): React.ReactElement {
    const { href, showExternalLinkIcon, target, text, tooltip, underline, variant } = props;
    return (
        <Link
            href={href}
            rel="noreferrer"
            showExternalLinkIcon={showExternalLinkIcon}
            target={target}
            title={tooltip}
            underline={underline}
            variant={variant}
        >
            {text}
        </Link>
    );
}

const LinkElementElementRegistration: FormElementRegistration<LinkElementProps> = {
    component: LinkElement,
    id: "Link",
};

export default LinkElementElementRegistration;
