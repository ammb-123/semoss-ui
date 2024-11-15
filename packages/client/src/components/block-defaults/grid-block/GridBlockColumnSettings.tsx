import { observer } from 'mobx-react-lite';

import { useBlockSettings } from '@/hooks';

import { GridBlockDef } from './grid-block.types';
import { BaseSettingSection, JsonSettings } from '@/components/block-settings';

interface GridBlockColumnSettingsProp {
    /** Id of the block */
    id: string;
}

export const GridBlockColumnSettings = observer(
    ({ id }: GridBlockColumnSettingsProp) => {
        const { data } = useBlockSettings<GridBlockDef>(id);

        return (
            <>
                {data.source === 'CUSTOM' ? (
                    <BaseSettingSection label="JSON">
                        <JsonSettings<GridBlockDef>
                            id={id}
                            path=""
                            height="300px"
                        />
                    </BaseSettingSection>
                ) : null}
                {data.source === 'FRAME' ? (
                    <BaseSettingSection label="Frame">
                        FrameSelect
                    </BaseSettingSection>
                ) : null}
            </>
        );
    },
);
