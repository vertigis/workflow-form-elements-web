import * as React from "react";
import type { FormElementProps, FormElementRegistration } from "@vertigis/workflow";
import ToggleButton, { ToggleButtonProps } from "@vertigis/web/ui/ToggleButton";
import DynamicIcon, { DynamicIconProps } from "@vertigis/web/ui/DynamicIcon";

type SettableToggleButtonProps = Pick<ToggleButtonProps, "color" | "selected">;
type OverrideProps = Pick<ToggleButtonProps, "size">;

interface ToggleButtonElementProps
    extends FormElementProps<ToggleButtonProps["value"]>,
    SettableToggleButtonProps {
    icon?: DynamicIconProps["src"];
    text: string;
    tooltip?: string;
}

/**
 * A toggle button form element.
 * @displayName Toggle Button
 * @description A toggle button form element.
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function ToggleButtonElement(props: ToggleButtonElementProps): React.ReactElement {
    const { color, enabled, icon, raiseEvent, selected, setProperty, text, value, tooltip } =
        props;
    const { size } = props as OverrideProps;

    const handleChange = (event: React.MouseEvent<HTMLElement>, value: any) => {
        setProperty("selected" as any, !selected);
        raiseEvent("changed" as any, selected ? undefined : value);
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>, value: any) => {
        raiseEvent("clicked" as any, value);
    };

    return (
        <ToggleButton
            color={color}
            disabled={!enabled}
            onChange={handleChange}
            onClick={handleClick}
            selected={selected}
            size={size}
            sx={{
                // Hack required to override .gcx-forms.defaults
                ["& span"]: {
                    display: "inline-flex !important",
                },
            }}
            title={tooltip}
            value={value}
        >
            {icon ? <DynamicIcon alt={text} src={icon} /> : text}
        </ToggleButton>
    );
}

const ToggleButtonElementRegistration: FormElementRegistration<ToggleButtonElementProps> = {
    component: ToggleButtonElement,
    id: "ToggleButton",
};

export default ToggleButtonElementRegistration;
