import { observer } from 'mobx-react-lite';

import { useBlockSettings } from '@/hooks';

import { GridBlockDef } from './GridBlock';
import { BaseSettingSection, JsonSettings } from '@/components/block-settings';

interface GridBlockColumnSettingsProp {
    /** Id of the block */
    id: string;
}

export const GridBlockColumnSettings = observer(
    ({ id }: GridBlockColumnSettingsProp) => {
        const { data } = useBlockSettings<GridBlockDef>(id);

        return (
            <BaseSettingSection label="Data">
                <JsonSettings id={id} path={''} height="300px" />
            </BaseSettingSection>
        );
    },
);
