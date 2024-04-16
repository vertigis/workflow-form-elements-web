import * as React from "react";
import type { FormElementProps, FormElementRegistration } from "@vertigis/workflow";
import Link, { LinkProps } from "@vertigis/web/ui/Link";

type SettableLinkProps = Pick<
    LinkProps,
    "href" | "showExternalLinkIcon" | "target" | "underline" | "variant"
>;

interface LinkElementProps extends FormElementProps, SettableLinkProps {
    text: string;
    tooltip?: string;
    onClick?: () => void;
    component?: any;
}

/**
 * A hyperLink form element.
 * @displayName Link
 * @description A hyperlink form element.
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function LinkElement(props: LinkElementProps): React.ReactElement {
    const {
        href,
        showExternalLinkIcon,
        target,
        text,
        tooltip,
        underline,
        variant,
        raiseEvent,
        onClick,
        component,
    } = props;

    const handleClick = () => {
        raiseEvent("clicked" as any, undefined);
        onClick?.();
    };

    return (
        <Link
            href={href}
            rel="noreferrer"
            showExternalLinkIcon={showExternalLinkIcon}
            target={target}
            title={tooltip}
            underline={underline}
            variant={variant}
            onClick={handleClick}
            component={component}
        >
            {text}
        </Link>
    );
}

const LinkElementRegistration: FormElementRegistration<LinkElementProps> = {
    component: LinkElement,
    id: "Link",
};

export default LinkElementRegistration;
