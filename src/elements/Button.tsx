import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import Button, { ButtonProps } from "@vertigis/web/ui/Button";
import DynamicIcon, { DynamicIconProps } from "@vertigis/web/ui/DynamicIcon";

type SettableButtonProps = Pick<
    ButtonProps,
    "buttonStyle" | "color" | "emphasis" | "href" | "size" | "variant"
>;

interface ButtonElementProps extends FormElementProps<ButtonProps["value"]>, SettableButtonProps {
    endIcon?: DynamicIconProps["src"];
    startIcon?: DynamicIconProps["src"];
    text: string;
    tooltip?: string;
}

/**
 * A Workflow element built using React.
 * @displayName Button
 * @description foo
 * @param props The props that will be provided by the Workflow runtime.
 */
function ButtonElement(props: ButtonElementProps): React.ReactElement {
    const {
        color,
        enabled,
        endIcon,
        href,
        raiseEvent,
        size,
        startIcon,
        text,
        value,
        variant,
        tooltip,
    } = props;

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
