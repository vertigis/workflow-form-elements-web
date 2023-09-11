import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import CircularProgress, { CircularProgressProps } from "@vertigis/web/ui/CircularProgress";

type SettableCircularProgressProps = Pick<
    CircularProgressProps,
    "color" | "size" | "thickness" | "variant"
>;

interface CircularProgressElementProps
    extends FormElementProps<number | undefined>,
        SettableCircularProgressProps {
    tooltip?: string;
}

/**
 * A circular progress indicator form element.
 * @displayName Circular Progress
 * @description A circular progress indicator form element.
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function CircularProgressElement(props: CircularProgressElementProps): React.ReactElement {
    const { color, size, thickness, tooltip, value, variant } = props;
    return (
        <CircularProgress
            color={color}
            size={size}
            thickness={thickness}
            title={tooltip}
            value={value}
            variant={variant}
        />
    );
}

const CircularProgressElementRegistration: FormElementRegistration<CircularProgressElementProps> = {
    component: CircularProgressElement,
    id: "CircularProgress",
};

export default CircularProgressElementRegistration;
