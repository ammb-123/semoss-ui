import { CSSProperties, useState } from "react";
import { observer } from "mobx-react-lite";
import { useBlock } from "../../../hooks";
import { BlockDef, BlockComponent } from "../../../store";
import { iconMap } from "../../../constants";

export interface IconBlockDef extends BlockDef<"icon"> {
    widget: "icon";
    data: {
        icon: string;
        style: CSSProperties;
        color: "primary" | "secondary" | "success" | "warning" | "error";
        src: string;
        title: string;
    };
    slots: never;
}

export const IconBlock: BlockComponent = observer(({ id }) => {
    const { attrs, data /* listeners */ } = useBlock<IconBlockDef>(id);

    // const iconProps = {
    //     color: data.color,
    //     sx: {
    //         width: data.style.width,
    //         maxWidth: data.style.maxWidth,
    //         height: data.style.height,
    //         maxHeight: data.style.maxHeight
    //     }
    // }

    // const ICON = iconMap[data.icon];
    // console.log("ICON: ", ICON);
    // const renderedIcon = React.createElement(
    //     ICON, iconProps
    // )

    const displayIcon = (key: string) => {
        const Icon = iconMap[key] || iconMap["Default"];
        const color = data.color || "primary";
        const width = data.style.width ?? null;
        const maxWidth = data.style.maxWidth ?? null;
        const height = data.style.height ?? null;
        const maxHeight = data.style.maxHeight ?? null;

        return (
            <Icon color={color} sx={{ width, maxWidth, height, maxHeight }} />
        );
    };

    return (
        <div
            {...attrs}
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "fit-content",
                width: "fit-content",
                paddingInline: "10px",
            }}
        >
            {displayIcon(data.icon)}
        </div>
    );
});
