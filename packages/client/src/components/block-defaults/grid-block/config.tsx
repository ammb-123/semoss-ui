import { BlockConfig } from '@/stores';
import { TableChart } from '@mui/icons-material';

import { QuerySelectionSettings } from '@/components/block-settings';
import {
    buildDimensionsSection,
    buildColorSection,
    buildBorderSection,
} from '../block-defaults.shared';
import { BLOCK_TYPE_DATA } from '../block-defaults.constants';

import { GridBlockDef } from './grid-block.types';
import { GridBlock } from './GridBlock';
import { GridBlockColumnSettings } from './GridBlockColumnSettings';
import { GridBlockSourceSettings } from './GridBlockSourceSettings';

// export the config for the block
export const config: BlockConfig<GridBlockDef> = {
    widget: 'grid',
    type: BLOCK_TYPE_DATA,
    data: {
        source: 'CUSTOM',
        values: [],
        columns: [],
        contextMenu: {
            items: [],
        },
    },
    listeners: {},
    slots: {},
    render: GridBlock,
    icon: TableChart,
    contentMenu: [
        {
            name: 'General',
            children: [
                {
                    description: 'Source',
                    render: ({ id }) => <GridBlockSourceSettings id={id} />,
                },
                {
                    description: 'Columns',
                    render: ({ id }) => <GridBlockColumnSettings id={id} />,
                },
                {
                    description: 'Loading',
                    render: ({ id }) => (
                        <QuerySelectionSettings
                            id={id}
                            label="Loading"
                            path="loading"
                            queryPath="isLoading"
                        />
                    ),
                },
            ],
        },
    ],
    styleMenu: [
        buildDimensionsSection(),
        buildColorSection(),
        buildBorderSection(),
    ],
};
