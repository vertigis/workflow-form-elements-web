import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import Chip, { ChipProps } from "@vertigis/web/ui/Chip";

type SettableChipProps = Pick<ChipProps, "color" | "size" | "variant">;

interface ChipElementProps extends FormElementProps, SettableChipProps {
    text: string;
    tooltip?: string;
}

/**
 * A chip form element.
 * @displayName Chip
 * @description A chip form element
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
