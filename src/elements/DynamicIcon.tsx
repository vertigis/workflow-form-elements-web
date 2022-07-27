import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import DynamicIcon, { DynamicIconProps } from "@vertigis/web/ui/DynamicIcon";

type SettableDynamicIconProps = Pick<DynamicIconProps, "alt" | "color" | "fontSize" | "src">;

interface DynamicIconElementProps extends FormElementProps, SettableDynamicIconProps {
    tooltip?: string;
}

/**
 * An icon form element.
 * @displayName Dynamic Icon
 * @description An icon form element.
 * @param props The props that will be provided by the Workflow runtime.
 */
function DynamicIconElement(props: DynamicIconElementProps): React.ReactElement {
    const { alt, color, fontSize, src, tooltip } = props;
    return <DynamicIcon alt={alt} color={color} fontSize={fontSize} src={src} title={tooltip} />;
}

const DynamicIconElementRegistration: FormElementRegistration<DynamicIconElementProps> = {
    component: DynamicIconElement,
    getInitialProperties: () => ({ src: "cog" }),
    id: "DynamicIcon",
};

export default DynamicIconElementRegistration;
