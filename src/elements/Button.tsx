import * as React from "react";
import type { FormElementProps, FormElementRegistration } from "@vertigis/workflow";
import Button, { ButtonProps } from "@vertigis/web/ui/Button";
import DynamicIcon, { DynamicIconProps } from "@vertigis/web/ui/DynamicIcon";

type SettableButtonProps = Pick<
    ButtonProps,
    "buttonStyle" | "color" | "emphasis" | "href" | "variant"
>;
type OverrideProps = Pick<ButtonProps, "size">;

interface ButtonElementProps extends FormElementProps<ButtonProps["value"]>, SettableButtonProps {
    endIcon?: DynamicIconProps["src"];
    startIcon?: DynamicIconProps["src"];
    text: string;
    tooltip?: string;
}

/**
 * A button form element.
 * @displayName Button
 * @description A button form element.
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function ButtonElement(props: ButtonElementProps): React.ReactElement {
    const { color, enabled, endIcon, href, raiseEvent, startIcon, text, value, variant, tooltip } =
        props;
    const { size } = props as OverrideProps;

    const handleClick = (_event: React.MouseEvent<HTMLButtonElement>) => {
        raiseEvent("clicked" as any, value);
    };

    return (
        <Button
            color={color}
            disabled={!enabled}
            href={href}
            onClick={handleClick}
            size={size}
            sx={{
                // Hack required to override .gcx-forms.defaults
                ["& span"]: {
                    display: "inline-flex !important",
                },
            }}
            endIcon={endIcon && <DynamicIcon src={endIcon} />}
            startIcon={startIcon && <DynamicIcon src={startIcon} />}
            title={tooltip}
            value={value}
            variant={variant}
        >
            {text}
        </Button>
    );
}

const ButtonElementRegistration: FormElementRegistration<ButtonElementProps> = {
    component: ButtonElement,
    id: "Button",
};

export default ButtonElementRegistration;
