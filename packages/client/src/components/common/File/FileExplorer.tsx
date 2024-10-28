import React, { useEffect, useState, useRef } from 'react';
import { Icon, IconButton, TreeView, styled, Stack } from '@semoss/ui';
import {
    ExpandMore,
    ChevronRight,
    CreateNewFolderOutlined,
    NoteAddOutlined,
    FileUpload,
    Refresh,
} from '@mui/icons-material/';

import { usePixel } from '@/hooks';
import { LoadingScreen } from '@/components/ui';

import { AddFileModal } from './AddFileModal';
import { CreateFileModal } from './CreateFileModal';
import { DeleteFileModal } from './DeleteFileModal';
import { FileExplorerNode } from './FileExplorerNode';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: theme.palette.background.paper,
}));

const StyledActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: theme.palette.secondary.light,
}));

const StyledContent = styled('div')(({ theme }) => ({
    flex: '1',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
}));

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

    /** Trigger a callback when a file is added */
    onAddFile: (path: string) => void;

    /** Trigger a callback when an file is selected */
    onSelectFile: (path: string) => void;

    /** Trigger a callback when an file is deleted */
    onDeleteFile: (path: string) => void;

    /** Trigger a callback when a file starts dragging */
    onDragFileStart: (path: string) => void;
}

export const FileExplorer = (props: FileExplorerProps) => {
    const {
        type,
        space,
        onAddFile = () => null,
        onSelectFile = () => null,
        onDeleteFile = () => null,
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

    // files to add
    const [fileUploadPath, setFileUploadPath] = useState<string>('');
    const [IsAddFileOpen, setIsAddFileOpen] = useState<boolean>(false);
    const [isDeleteFileOpen, setIsDeleteFileOpen] = useState(false);
    const [fileToBeDeleted, setFileToBeDeleted] = useState<string>('');
    const [IsCreateFileOpen, setIsCreateFileOpen] = useState<boolean>(false);
    const [createFileMode, SetCreateFileMode] = useState<'directory' | 'file'>(
        'directory',
    );

    // temporary fix for dead refresh button should be removed
    const [counter, setCounter] = useState(0);

    // set the uploadPath based on the selected item
    useEffect(() => {
        let path = '';
        if (type === 'app') {
            path = 'version/assets/';
        } else if (type === 'insight') {
            console.warn('TODO');
            // path = 'version/assets';
        }

        // if selected, get the directory
        const s = selected[0];
        if (s) {
            if (s.slice(-1) === '/') {
                path = s;
            } else {
                // try to remove the file name and get the directory
                path = s.split('/').slice(0, -1).join('/');
            }
        }

        setFileUploadPath(path);
    }, [selected]);

    /**
     * Refresh content
     */
    const refreshContent = () => {
        // refresh the assets
        getAssets.refresh();

        // increment the counter
        setCounter(counter + 1);
    };

    /**
     * Open the add modal
     */
    const handleOpenAddFile = () => {
        setIsAddFileOpen(true);
    };

    /**
     * Open the add modal
     */
    const handleCreateAddFile = (
        /** Mode of add file */
        mode: 'directory' | 'file',
    ) => {
        SetCreateFileMode(mode);
        setIsCreateFileOpen(true);
    };

    /**
     * Open the delete modal
     */
    const handleOnTrashClick = (path: string) => {
        setFileToBeDeleted(path);
        setIsDeleteFileOpen(true);
    };

    /**
     * Triggered when a node is selected
     * @param selected - newly selected values
     */
    const handleOnSelectedFile = (selected: string[]) => {
        // trigger the callback on the first one
        onSelectFile(selected[0] || '');

        // set the selected values
        setSelected(selected);
    };

    /**
     * Triggered when a item is toggled
     * @param expanded - newly expanded values
     */
    const handleOnExpandedFile = (expanded: string[]) => {
        // set the expanded values
        setExpanded(expanded);
    };

    /**
     * Triggered when a file is added
     * @param success - true or false if it was successful
     * @param uploadPath - if true, path where the file was uploaded
     */
    const handleOnAddFile = (success: boolean, uploadPath: string) => {
        if (success) {
            onAddFile(uploadPath);

            // refresh the content
            refreshContent();
        }

        // reset
        setIsAddFileOpen(false);
    };

    /**
     * Triggered when a file is added
     * @param success - true or false if it was successful
     * @param uploadPath - if true, path where the file was uploaded
     */
    const handleOnCreateFile = (success: boolean, uploadPath: string) => {
        if (success) {
            onAddFile(uploadPath);

            // refresh the content
            refreshContent();
        }

        // reset
        setIsCreateFileOpen(false);
    };

    /**
     * When a file is deleted
     */
    const handleOnDeleteFile = async (success: boolean) => {
        if (success) {
            // trigger the delete file callback if successful
            onDeleteFile(fileToBeDeleted);

            // refresh the content
            refreshContent();
        }

        // reset
        setIsDeleteFileOpen(false);
        setFileToBeDeleted('');
    };

    if (!initLoadComplete) {
        return (
            <LoadingScreen.Trigger description="Retrieving files from application..." />
        );
    }

    return (
        <StyledContainer>
            <StyledActions>
                <IconButton
                    size={'small'}
                    color={'default'}
                    title={'Refresh'}
                    onClick={() => {
                        refreshContent();
                    }}
                >
                    <Refresh fontSize="inherit" />
                </IconButton>
                <Stack direction="row" alignItems={'center'} spacing={0}>
                    <IconButton
                        title={`Upload file(s) to ${fileUploadPath}`}
                        size={'small'}
                        color={'default'}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAddFile();
                        }}
                    >
                        <FileUpload fontSize="inherit" />
                    </IconButton>
                    <IconButton
                        title={`Create new file at ${fileUploadPath}`}
                        size={'small'}
                        color={'default'}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCreateAddFile('file');
                        }}
                    >
                        <NoteAddOutlined fontSize="inherit" />
                    </IconButton>
                    <IconButton
                        title={`Create new folder at ${fileUploadPath}`}
                        size={'small'}
                        color={'default'}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCreateAddFile('directory');
                        }}
                    >
                        <CreateNewFolderOutlined fontSize="inherit" />
                    </IconButton>
                </Stack>
            </StyledActions>
            <StyledContent key={counter}>
                <StyledTreeView
                    multiSelect
                    expanded={expanded}
                    selected={selected}
                    onNodeToggle={(e, v) => {
                        handleOnExpandedFile(v);
                    }}
                    onNodeSelect={(e, v) => {
                        handleOnSelectedFile(v);
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
                                    <FileExplorerNode
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
                                            handleOnTrashClick(filePath);
                                        }}
                                    />
                                );
                            })
                        ) : null}
                    </LoadingScreen>
                </StyledTreeView>
            </StyledContent>

            <AddFileModal
                open={IsAddFileOpen}
                onClose={(success, uploadPath) => {
                    handleOnAddFile(success, uploadPath);
                }}
                type={type}
                space={space}
                uploadPath={fileUploadPath}
            />

            <CreateFileModal
                open={IsCreateFileOpen}
                onClose={(success, uploadPath) => {
                    handleOnCreateFile(success, uploadPath);
                }}
                type={type}
                space={space}
                uploadPath={fileUploadPath}
                mode={createFileMode}
            />

            <DeleteFileModal
                open={isDeleteFileOpen}
                onClose={(success) => handleOnDeleteFile(success)}
                type={type}
                space={space}
                fileDeletePath={fileToBeDeleted}
            />
        </StyledContainer>
    );
};
