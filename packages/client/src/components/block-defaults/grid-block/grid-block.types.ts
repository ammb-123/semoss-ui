import React from 'react';
import { BlockDef, ListenerActions } from '@/stores';

/** Column Definition */
export type GridColumn = {
    /** Unique key of the column */
    key: string;

    /** Name of the column */
    name: string;

    /** Width of the column */
    width: string;

    /** Hide the column */
    hidden: boolean;
};

/** Row Definition */
export type GridRow = string;

/**
 * All of the common data attributes
 */
interface AbstractData extends Record<string, unknown> {
    /** type of data. Is it pulling from a frame or completely custom  */
    source: 'FRAME' | 'CUSTOM';

    /** Column Definitions */
    columns: GridColumn[];

    /** Track if the table is loading */
    loading?: boolean;

    /** */
    style?: Pick<
        React.CSSProperties,
        | 'background'
        | 'border'
        | 'borderColor'
        | 'borderStyle'
        | 'borderWidth'
        | 'height'
        | 'width'
    >;

    /** */
    contextMenu: {
        /** Custom actions */
        items: {
            /** Name of the item */
            name: string;

            /** Action that will be triggered */
            action: ListenerActions;
        }[];
    };
}

interface FrameData extends AbstractData {
    source: 'FRAME';
    name: string;
}

interface CustomData extends AbstractData {
    source: 'CUSTOM';
    values: Record<string, unknown>[];
}

export interface GridBlockDef extends BlockDef<'grid'> {
    widget: 'grid';
    data: FrameData | CustomData;
}
