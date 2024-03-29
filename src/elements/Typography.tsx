import * as React from "react";
import type { FormElementProps, FormElementRegistration } from "@vertigis/workflow";
import Typography, { TypographyProps } from "@vertigis/web/ui/Typography";

type SettableTypographyProps = Pick<TypographyProps, "align" | "color" | "text" | "variant">;

interface TypographyElementProps extends FormElementProps, SettableTypographyProps {
    tooltip?: string;
}

/**
 * A typography form element.
 * @displayName Typography
 * @description A typography form element.
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function TypographyElement(props: TypographyElementProps): React.ReactElement {
    const { align, color, text, tooltip, variant } = props;
    return <Typography align={align} color={color} text={text} title={tooltip} variant={variant} />;
}

const TypographyElementRegistration: FormElementRegistration<TypographyElementProps> = {
    component: TypographyElement,
    id: "Typography",
};

export default TypographyElementRegistration;
