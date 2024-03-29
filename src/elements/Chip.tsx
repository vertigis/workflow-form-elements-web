import * as React from "react";
import type { FormElementProps, FormElementRegistration } from "@vertigis/workflow";
import Chip, { ChipProps } from "@vertigis/web/ui/Chip";

type SettableChipProps = Pick<ChipProps, "color" | "size" | "variant">;

interface ChipElementProps extends Omit<FormElementProps, "size">, SettableChipProps {
    text: string;
    tooltip?: string;
}

/**
 * A chip form element.
 * @displayName Chip
 * @description A chip form element
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function ChipElement(props: ChipElementProps): React.ReactElement {
    const { color, size, text, tooltip, variant } = props;
    return <Chip color={color} label={text} size={size} title={tooltip} variant={variant} />;
}

const ChipElementRegistration: FormElementRegistration<ChipElementProps> = {
    component: ChipElement,
    id: "Chip",
};

export default ChipElementRegistration;
