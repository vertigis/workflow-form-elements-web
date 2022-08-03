import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import DynamicIcon from "@vertigis/web/ui/DynamicIcon";
import Tab, { TabProps } from "@vertigis/web/ui/Tab";
import Tabs, { TabsProps } from "@vertigis/web/ui/Tabs";

type SettableTabProps = Pick<TabProps, "disabled" | "label" | "title">;

type SettableTabsProps = Pick<
    TabsProps,
    "indicatorColor" | "orientation" | "scrollButtons" | "textColor" | "variant"
>;

interface TabItem extends SettableTabProps {
    icon?: string;
}

interface TabsElementProps
    extends FormElementProps<SettableTabProps | undefined>,
        SettableTabsProps {
    tabs: TabItem[];
}

/**
 * A tab control form element.
 * @displayName Tabs
 * @description A tab control form element.
 * @param props The props that will be provided by the Workflow runtime.
 */
function TabsElement(props: TabsElementProps): React.ReactElement | null {
    const {
        enabled,
        indicatorColor,
        orientation,
        scrollButtons,
        setValue,
        tabs = [],
        textColor,
        value,
        variant,
    } = props;

    const handleChange = (event: React.SyntheticEvent, value: any) => {
        setValue(value);
    };

    if (tabs.length === 0) {
        // The Tabs component gets into a bad state if it renders with zero tabs
        return null;
    }

    return (
        <Tabs
            disabled={!enabled}
            indicatorColor={indicatorColor}
            onChange={handleChange}
            orientation={orientation}
            scrollButtons={scrollButtons}
            sx={{
                // Hack required to override .gcx-forms.defaults
                ["& button"]: {
                    borderRadius: "0 !important",
                    marginRight: "0 !important",
                    ["& span"]: {
                        display: "inline-flex !important",
                    },
                },
            }}
            textColor={textColor}
            value={value}
            variant={variant}
        >
            {tabs.map((item, index) => (
                <Tab
                    icon={item.icon && <DynamicIcon src={item.icon} />}
                    key={index}
                    disabled={item.disabled}
                    label={item.label}
                    title={item.title}
                    value={item}
                />
            ))}
        </Tabs>
    );
}

const TabsElementRegistration: FormElementRegistration<TabsElementProps> = {
    component: TabsElement,
    id: "Tabs",
};

export default TabsElementRegistration;
