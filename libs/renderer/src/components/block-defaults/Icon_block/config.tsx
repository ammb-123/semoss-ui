import { BlockConfig } from "../../../store";
import {
    buildDimensionsSection,
    buildListener,
} from "../block-defaults.shared";
import { IconBlockDef, IconBlock } from "./IconBlock";
import { InsertEmoticon } from "@mui/icons-material";
import { BLOCK_TYPE_DISPLAY } from "../block-defaults.constants";
import { SelectInputSettings } from "../../block-settings";
import {
    inputOptions,
    IconSelectSettings,
} from "../../block-settings/custom/IconSelectSettings";

export const config: BlockConfig<IconBlockDef> = {
    widget: "icon",
    type: BLOCK_TYPE_DISPLAY,
    data: {
        style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "200px",
            //position: "relative",
            //variant: "Outlined",
        },

        color: "primary",
        icon: "Default",

        src: "",
        title: "",
    },
    listeners: {
        //onClick: [],
    },
    slots: {},
    render: IconBlock,
    icon: InsertEmoticon,

    contentMenu: [
        {
            name: "Select Icon",
            children: [
                {
                    description: "Icon",
                    render: ({ id }) => (
                        <IconSelectSettings
                            id={id}
                            label="Icon"
                            path="icon"
                            options={inputOptions}
                        />
                    ),
                },
            ],
        },
        {
            name: "on Click",
            children: [...buildListener("onClick")],
        },
    ],
    styleMenu: [
        {
            name: "",
            children: [
                {
                    description: "Color",
                    render: ({ id }) => (
                        <SelectInputSettings
                            id={id}
                            label="Color"
                            path="color"
                            options={[
                                {
                                    value: "primary",
                                    display: "primary",
                                },
                                {
                                    value: "secondary",
                                    display: "secondary",
                                },
                                {
                                    value: "success",
                                    display: "success",
                                },
                                {
                                    value: "warning",
                                    display: "warning",
                                },
                                {
                                    value: "error",
                                    display: "error",
                                },
                            ]}
                        />
                    ),
                },
            ],
        },
        buildDimensionsSection(),
    ],
};
