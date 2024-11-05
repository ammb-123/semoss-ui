import React from 'react';
import { Icon, TreeView, styled } from '@semoss/ui';
import { ExpandMore, ChevronRight } from '@mui/icons-material';

import { usePixel } from '@/hooks';
import { LoadingScreen } from '@/components/ui';

import { FileExplorerItem } from './FileExplorerItem';

const StyledTreeView = styled(TreeView)(({ theme }) => ({
    width: '100%',
    maxHeight: '100%',
    gap: theme.spacing(3),
    '.MuiTreeItem-content': {
        padding: theme.spacing(0.5),
    },
}));

interface FileExplorerProps {
    /** Type of file opened */
    type: 'app' | 'insight';

    /** Space where the file is located */
    space: string;

    /** Trigger a callback when an file is selected */
    onSelect: (path: string) => void;

    /** Trigger a callback when delete file is clicked */
    onTrashClick: (path: string) => void;

    /** Trigger a callback when a file starts dragging */
    onDragFileStart: (path: string) => void;
}

export const FileExplorer = (props: FileExplorerProps) => {
    const {
        type,
        space,
        onSelect = () => null,
        onTrashClick = () => null,
        onDragFileStart = () => null,
    } = props;

    const getAssets = usePixel<
        {
            lastModified: string;
            name: string;
            path: string;
            type: 'directory' | 'file';
        }[]
    >(
        type === 'app'
            ? `BrowseAsset(filePath=["version/assets"], space=["${space}"]);`
            : '',
    );

    const initLoadComplete = getAssets.status === 'SUCCESS';

    const [expanded, setExpanded] = React.useState<string[]>([]);
    const [selected, setSelected] = React.useState<string[]>([]);

    /**
     * Triggered when a node is selected
     * @param selected - newly selected values
     */
    const handleOnNodeSelect = (selected: string[]) => {
        // trigger the callback on the first one
        onSelect(selected[0] || '');

        // set the selected values
        setSelected(selected);
    };

    /**
     * Triggered when a item is toggled
     * @param expanded - newly expanded values
     */
    const handleOnNodeToggle = (expanded: string[]) => {
        // set the expanded values
        setExpanded(expanded);
    };

    if (!initLoadComplete) {
        return (
            <LoadingScreen.Trigger description="Retrieving files from application..." />
        );
    }

    return (
        <StyledTreeView
            multiSelect
            expanded={expanded}
            selected={selected}
            onNodeToggle={(e, v) => {
                handleOnNodeToggle(v);
            }}
            onNodeSelect={(e, v) => {
                handleOnNodeSelect(v);
            }}
            defaultCollapseIcon={
                <Icon color={'disabled'}>
                    <ExpandMore />
                </Icon>
            }
            defaultExpandIcon={
                <Icon color={'disabled'}>
                    <ChevronRight />
                </Icon>
            }
        >
            <LoadingScreen>
                {getAssets.status === 'INITIAL' ||
                getAssets.status === 'LOADING' ? (
                    <LoadingScreen.Trigger />
                ) : getAssets.status === 'SUCCESS' ? (
                    getAssets.data.map((n) => {
                        return (
                            <FileExplorerItem
                                key={n.path}
                                type={type}
                                space={space}
                                name={n.name}
                                path={n.path}
                                isDirectory={n.type === 'directory'}
                                lastModified={n.lastModified}
                                expanded={expanded}
                                selected={selected}
                                onDragStart={(filePath) => {
                                    onDragFileStart(filePath);
                                }}
                                onTrashClick={(filePath) => {
                                    onTrashClick(filePath);
                                }}
                            />
                        );
                    })
                ) : null}
            </LoadingScreen>
        </StyledTreeView>
    );
};
