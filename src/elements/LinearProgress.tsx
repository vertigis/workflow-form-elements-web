import React from "react";
import type { FormElementProps, FormElementRegistration } from "@vertigis/workflow";
import LinearProgress, { LinearProgressProps } from "@vertigis/web/ui/LinearProgress";
import Box, { BoxProps } from "@vertigis/web/ui/Box";

type SettableBoxProps = Pick<BoxProps, "maxWidth">;
type SettableLinearProgressProps = Pick<LinearProgressProps, "color" | "variant">;

interface LinearProgressElementProps
    extends FormElementProps<number | undefined>,
        SettableBoxProps,
        SettableLinearProgressProps {
    tooltip?: string;
}

/**
 * A linear progress indicator form element.
 * @displayName Linear Progress
 * @description A linear progress indicator.
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function LinearProgressElement(props: LinearProgressElementProps): React.ReactElement {
    const { color, maxWidth, tooltip, value, variant } = props;
    return (
        <Box maxWidth={maxWidth}>
            <LinearProgress color={color} title={tooltip} value={value} variant={variant} />
        </Box>
    );
}

const LinearProgressElementRegistration: FormElementRegistration<LinearProgressElementProps> = {
    component: LinearProgressElement,
    id: "LinearProgress",
};

export default LinearProgressElementRegistration;
