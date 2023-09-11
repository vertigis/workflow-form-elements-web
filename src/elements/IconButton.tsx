import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import IconButton, { IconButtonProps } from "@vertigis/web/ui/IconButton";
import DynamicIcon, { DynamicIconProps } from "@vertigis/web/ui/DynamicIcon";

type SettableDynamicIconProps = Pick<DynamicIconProps, "src">;

type SettableIconButtonProps = Pick<IconButtonProps, "color" | "size">;

interface IconButtonElementProps
    extends FormElementProps<IconButtonProps["value"]>,
        SettableDynamicIconProps,
        SettableIconButtonProps {
    tooltip?: string;
}

/**
 * An icon button form element.
 * @displayName Icon Button
 * @description An icon button form element.
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function IconButtonElement(props: IconButtonElementProps): React.ReactElement {
    const { color, enabled, raiseEvent, size, src, value, tooltip } = props;

    const handleClick = (_event: React.MouseEvent<HTMLButtonElement>) => {
        raiseEvent("clicked" as any, value);
    };

    return (
        <IconButton
            color={color}
            disabled={!enabled}
            onClick={handleClick}
            size={size}
            sx={{
                // Hack required to override .gcx-forms.defaults
                borderRadius: "50% !important",
            }}
            title={tooltip}
            value={value}
        >
            <DynamicIcon src={src} />
        </IconButton>
    );
}

const IconButtonElementRegistration: FormElementRegistration<IconButtonElementProps> = {
    component: IconButtonElement,
    getInitialProperties: () => ({ src: "cog" }),
    id: "IconButton",
};

export default IconButtonElementRegistration;
