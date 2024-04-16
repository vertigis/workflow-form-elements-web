import * as React from "react";
import type { FormElementProps, FormElementRegistration } from "@vertigis/workflow";
import FormControl from "@vertigis/web/ui/FormControl";
import FormControlLabel, { FormControlLabelProps } from "@vertigis/web/ui/FormControlLabel";
import Switch, { SwitchProps } from "@vertigis/web/ui/Switch";

type SettableSwitchProps = Pick<SwitchProps, "color" | "checked">;
type SettableFormControlLabelProps = Pick<FormControlLabelProps, "labelPlacement">;
type OverrideProps = Pick<SwitchProps, "size"> & Pick<FormControlLabelProps, "label">;

interface SwitchElementProps
    extends FormElementProps<unknown>,
        SettableSwitchProps,
        SettableFormControlLabelProps {
    tooltip?: string;
}

/**
 * A switch form element.
 * @displayName Switch
 * @description A switch form element.
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function SwitchElement(props: SwitchElementProps): React.ReactElement {
    const { checked, color, enabled, labelPlacement, raiseEvent, setProperty, tooltip, value } =
        props;
    const { size, label } = props as OverrideProps;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setProperty("checked", checked);
        raiseEvent("changed" as any, checked ? value : undefined);
    };

    return (
        <FormControl title={tooltip}>
            <FormControlLabel
                control={
                    <Switch
                        checked={checked}
                        color={color}
                        disabled={!enabled}
                        onChange={handleChange}
                        size={size}
                    />
                }
                // Label is supposed to be optional but it fails if absent
                label={label || ""}
                labelPlacement={labelPlacement}
                // Hack required to override .gcx-forms.defaults
                sx={{
                    ["& span"]: {
                        display: "inline-flex !important",
                    },
                }}
            />
        </FormControl>
    );
}

const SwitchElementRegistration: FormElementRegistration<SwitchElementProps> = {
    component: SwitchElement,
    id: "Switch",
};

export default SwitchElementRegistration;
