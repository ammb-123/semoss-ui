import { observer } from 'mobx-react-lite';
import { Box, Select } from '@semoss/ui';

import { useBlockSettings } from '@/hooks';

import { GridBlockDef } from './grid-block.types';
import { BaseSettingSection, JsonSettings } from '@/components/block-settings';

interface GridBlockSourceSettingsProps {
    /** Id of the block */
    id: string;
}

export const GridBlockSourceSettings = observer(
    ({ id }: GridBlockSourceSettingsProps) => {
        const { data, setData } = useBlockSettings<GridBlockDef>(id);

        /**
         * Handle changing of the source
         *
         * source - new source for the grid
         */
        const handleSourceOnChange = (source: 'CUSTOM' | 'FRAME') => {
            // update data
            setData('source', source);

            if (source === 'CUSTOM') {
                // noop
            } else if (source === 'FRAME') {
                console.warn('TODO ::: Update the context menu');
            }
        };

        return (
            <BaseSettingSection label={'Source'}>
                <Select
                    size="small"
                    variant="outlined"
                    sx={{ width: '100%' }}
                    onChange={(e) => {
                        const val = e.target.value;
                        // update the data
                        if (val === 'CUSTOM') {
                            setData('source', 'CUSTOM');
                        } else if (val === 'FRAME') {
                            setData('source', 'FRAME');
                        }
                    }}
                    value={data.source}
                    placeholder="Select source"
                    fullWidth={true}
                >
                    <Select.Item value={'CUSTOM'}>Custom</Select.Item>
                    <Select.Item value={'fRAME'}>Frame</Select.Item>
                </Select>
            </BaseSettingSection>
        );
    },
);
