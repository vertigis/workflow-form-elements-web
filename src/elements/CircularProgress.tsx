import * as React from "react";
import type { FormElementProps, FormElementRegistration } from "@vertigis/workflow";
import CircularProgress, { CircularProgressProps } from "@vertigis/web/ui/CircularProgress";

type SettableCircularProgressProps = Pick<CircularProgressProps, "color" | "thickness" | "variant">;
type OverrideProps = Pick<CircularProgressProps, "size">;

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
    const { color, thickness, tooltip, value, variant } = props;
    const { size } = props as OverrideProps;
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
