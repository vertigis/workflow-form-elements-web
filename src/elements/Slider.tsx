import * as React from "react";
import { FormElementProps, FormElementRegistration } from "@geocortex/workflow/runtime";
import Box, { BoxProps } from "@vertigis/web/ui/Box";
import Slider, { SliderProps } from "@vertigis/web/ui/Slider";

type SettableBoxProps = Pick<BoxProps, "maxWidth">;
type SettableSliderProps = Pick<
    SliderProps,
    | "color"
    | "marks"
    | "max"
    | "min"
    | "orientation"
    | "size"
    | "step"
    | "track"
    | "valueLabelDisplay"
    | "valueLabelFormat"
>;

interface SliderElementProps
    extends FormElementProps<number | number[]>,
    SettableBoxProps,
    SettableSliderProps {
    tooltip?: string;
}

/**
 * A slider form element.
 * @displayName Slider
 * @description A slider form element that allows users to make selections from a range of values.
 * @supportedApps GWV
 * @param props The props that will be provided by the Workflow runtime.
 */
function SliderElement(props: SliderElementProps): React.ReactElement {
    const {
        enabled,
        marks,
        max,
        maxWidth,
        min,
        orientation,
        setValue,
        size,
        step,
        tooltip,
        track,
        value,
        valueLabelDisplay,
        valueLabelFormat,
    } = props;

    const handleChange = (event: Event, value: number | number[]) => {
        setValue(value);
    };

    return (
        <Box
            maxWidth={maxWidth}
            sx={{
                paddingLeft: (theme) => theme.spacing(1.5),
                paddingRight: (theme) => theme.spacing(1.5),
                // Hack required to override .gcx-forms.defaults
                ["& span.MuiSlider-thumb"]: {
                    display: "flex",
                    fontSize: "small",
                },
            }}
        >
            <Slider
                disabled={!enabled}
                marks={marks}
                min={min}
                max={max}
                onChange={handleChange}
                orientation={orientation}
                size={size}
                step={step}
                title={tooltip}
                track={track}
                value={value}
                valueLabelDisplay={valueLabelDisplay}
                valueLabelFormat={valueLabelFormat}
            />
        </Box>
    );
}

const SkeletonElementRegistration: FormElementRegistration<SliderElementProps> = {
    component: SliderElement,
    id: "Slider",
};

export default SkeletonElementRegistration;
