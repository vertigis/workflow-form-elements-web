import * as React from "react";
import type { FormElementProps, FormElementRegistration } from "@vertigis/workflow";
import Avatar, { AvatarProps } from "@vertigis/web/ui/Avatar";

type SettableAvatarProps = Pick<AvatarProps, "alt" | "color" | "src" | "variant">;

interface AvatarElementProps extends FormElementProps, SettableAvatarProps {
    text?: string;
    tooltip?: string;
}

/**
 * An avatar form element.
 * @displayName Avatar
 * @description An avatar form element.
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function AvatarElement(props: AvatarElementProps): React.ReactElement {
    const { alt, color, src, text, tooltip, variant } = props;
    return (
        <Avatar alt={alt} color={color} src={src} title={tooltip} variant={variant}>
            {text}
        </Avatar>
    );
}

const AvatarElementRegistration: FormElementRegistration<AvatarElementProps> = {
    component: AvatarElement,
    id: "Avatar",
};

export default AvatarElementRegistration;
