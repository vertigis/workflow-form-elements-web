import * as React from "react";
import type { FormElementProps, FormElementRegistration } from "@vertigis/workflow";
import Alert, { AlertProps } from "@vertigis/web/ui/Alert";
import Box, { BoxProps } from "@vertigis/web/ui/Box";

type SettableBoxProps = Pick<BoxProps, "maxWidth">;
type SettableAlertProps = Pick<AlertProps, "color" | "severity" | "variant">;

interface AlertElementProps extends FormElementProps, SettableBoxProps, SettableAlertProps {
    text: string;
    tooltip?: string;
}

/**
 * An alert form element.
 * @displayName Alert
 * @description An alert form element that displays a short, important message in a way that attracts the user's attention without interrupting the user's task.
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function AlertElement(props: AlertElementProps): React.ReactElement {
    const { color, maxWidth, severity, text, tooltip, variant } = props;
    return (
        <Box maxWidth={maxWidth}>
            <Alert color={color} severity={severity} title={tooltip} variant={variant}>
                {text}
            </Alert>
        </Box>
    );
}

const AlertElementRegistration: FormElementRegistration<AlertElementProps> = {
    component: AlertElement,
    id: "Alert",
};

export default AlertElementRegistration;
