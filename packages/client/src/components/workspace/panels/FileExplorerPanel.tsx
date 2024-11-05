import { useEffect, useState } from 'react';
import { Actions, DockLocation, Layout, TabNode } from 'flexlayout-react';
import { useNotification, styled, IconButton, Stack } from '@semoss/ui';
import {
    CreateNewFolderOutlined,
    NoteAddOutlined,
    FileUpload,
    Refresh,
} from '@mui/icons-material';

import { useWorkspace } from '@/hooks';
import {
    FileExplorer,
    AddFileOverlay,
    CreateFileOverlay,
    DeleteFileOverlay,
} from '@/components/common';

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

const EXPLORER_TYPE = 'app';

interface FileExplorerPanelProps {
    /** Current layoutobject */
    layout: Layout;
}

export const FileExplorerPanel = (props: FileExplorerPanelProps) => {
    const { layout } = props;

    const { workspace } = useWorkspace();

    const notification = useNotification();

    // files to add
    const [selectedPath, setSelectedPath] = useState<string>('');
    const [fileUploadPath, setFileUploadPath] = useState<string>('');

    // temporary fix for dead refresh button should be removed
    const [counter, setCounter] = useState(0);

    // set the uploadPath based on the selected item
    useEffect(() => {
        let path = 'version/assets/';

        // if selected, get the directory
        if (selectedPath) {
            if (selectedPath.slice(-1) === '/') {
                path = selectedPath;
            } else {
                // try to remove the file name and get the directory
                path = selectedPath.split('/').slice(0, -1).join('/');
            }
        }

        setFileUploadPath(path);
    }, [selectedPath]);

    /**
     * Refresh the files
     */
    const refreshFiles = () => {
        // increment the counter
        setCounter(counter + 1);
    };

    /**
     * Open the add modal
     */
    const handleOpenAddFile = () => {
        workspace.openOverlay(() => (
            <AddFileOverlay
                type={EXPLORER_TYPE}
                space={workspace.appId}
                onClose={(success, uploadPath) => {
                    if (success) {
                        // create the panel
                        createPanel(uploadPath);

                        // refresh the content
                        refreshFiles();
                    }

                    // close the overlay
                    workspace.closeOverlay();
                }}
                uploadPath={fileUploadPath}
            />
        ));
    };

    /**
     * Open the add modal
     */
    const handleCreateAddFile = (
        /** Mode of add file */
        mode: 'directory' | 'file',
    ) => {
        workspace.openOverlay(() => (
            <CreateFileOverlay
                type={EXPLORER_TYPE}
                space={workspace.appId}
                onClose={(success, uploadPath) => {
                    if (success) {
                        // create the panel
                        createPanel(uploadPath);

                        // refresh the content
                        refreshFiles();
                    }

                    // close the overlay
                    workspace.closeOverlay();
                }}
                uploadPath={fileUploadPath}
                mode={mode}
            />
        ));
    };

    /**
     * Select a panel and create one if it doesn't exist
     *
     * path - path to file
     */
    const handleOnSelectFile = (path: string) => {
        // try to select a panel, if it doesn't exist create it. Save the path
        const IsSelected = selectPanel(path);
        if (!IsSelected) {
            createPanel(path);
        }

        // set the path
        setSelectedPath(path);
    };

    /**
     * Open the delete modal
     */
    const handleOnTrashClick = (fileDeletePath: string) => {
        workspace.openOverlay(() => (
            <DeleteFileOverlay
                type={EXPLORER_TYPE}
                space={workspace.appId}
                onClose={(success) => {
                    if (success) {
                        // trigger the delete file callback if successful
                        removePanel(fileDeletePath);

                        // refresh the content
                        refreshFiles();
                    }
                }}
                fileDeletePath={fileDeletePath}
            />
        ));
    };

    /**
     * Handle dragging of an item
     *
     * path - path of the notebook
     */
    const handleItemDrag = (path: string) => {
        try {
            // can can only drag in files into the workspace
            if (path.slice(-1) === '/') {
                return;
            }

            // get the model
            const model = workspace.selectedLayout?.model;
            if (!model) {
                throw new Error('Missing model');
            }

            // get the name
            const name = path.split('/').pop();

            // add to layout
            layout.addTabWithDragAndDrop(name, {
                type: 'tab',
                name: name,
                component: 'file-viewer',
                config: {
                    path: path,
                },
                enableClose: true,
            });
        } catch (e) {
            notification.add({
                color: 'error',
                message: e,
            });
        }
    };

    /** Helpers */
    /**
     * Create a new panel and highlight it
     *
     * path - path to file
     */
    const createPanel = (path: string): boolean => {
        try {
            if (!path) {
                return false;
            }

            // can can only create panels for files
            if (path.slice(-1) === '/') {
                return false;
            }

            // get the model
            const model = workspace.selectedLayout?.model;
            if (!model) {
                throw new Error('Missing model');
            }

            // where to add the node
            const addId =
                model.getActiveTabset()?.getId() ||
                model.getRoot().getChildren()[0]?.getId() ||
                '';

            // get the name
            const name = path.split('/').pop();

            // create and select the panel
            model.doAction(
                Actions.addNode(
                    {
                        type: 'tab',
                        name: name,
                        component: 'file-viewer',
                        config: {
                            path: path,
                        },
                        enableClose: true,
                    },
                    addId,
                    DockLocation.CENTER,
                    -1,
                    true,
                ),
            );
        } catch (e) {
            notification.add({
                color: 'error',
                message: e,
            });

            return false;
        }

        return true;
    };

    /**
     * Select a panel if it is there. Return false if not selected.
     *
     * path - path to file
     */
    const selectPanel = (path: string): boolean => {
        try {
            if (!path) {
                return false;
            }

            // can can only select files
            if (path.slice(-1) === '/') {
                return false;
            }

            let selectedNode: TabNode | null = null;

            // get the model
            const model = workspace.selectedLayout?.model;
            if (!model) {
                throw new Error('Missing model');
            }

            // visit the notes, and see if it exists
            model.visitNodes((node) => {
                // check if it is a tabNode
                if (node instanceof TabNode) {
                    // it needs to be a file-viewer
                    const component = node.getComponent();
                    if (component !== 'file-viewer') {
                        return;
                    }

                    // path and space need to match
                    const config = node.getConfig();
                    if (path !== config.path) {
                        return;
                    }

                    selectedNode = node;
                }
            });

            // create a new panel if there is no node
            if (!selectedNode) {
                return false;
            }

            const selectedNodeId = selectedNode.getId();
            model.doAction(Actions.selectTab(selectedNodeId));
        } catch (e) {
            notification.add({
                color: 'error',
                message: e,
            });

            return false;
        }

        return true;
    };

    /**
     * Remove a panel
     */
    const removePanel = (path: string) => {
        try {
            if (!path) {
                return;
            }

            const nodesToBeRemoved: TabNode[] = [];

            // get the model
            const model = workspace.selectedLayout?.model;
            if (!model) {
                throw new Error('Missing model');
            }

            // visit the notes, and see if it exists
            model.visitNodes((node) => {
                // check if it is a tabNode
                if (node instanceof TabNode) {
                    // it needs to be a file-viewer
                    const component = node.getComponent();
                    if (component !== 'file-viewer') {
                        return;
                    }

                    // path and space need to match
                    const config = node.getConfig();
                    if (config.path.indexOf(path) !== 0) {
                        return;
                    }

                    nodesToBeRemoved.push(node);
                }
            });

            // delete the tabs
            for (const n of nodesToBeRemoved) {
                const id = n.getId();
                model.doAction(Actions.deleteTab(id));
            }
        } catch (e) {
            notification.add({
                color: 'error',
                message: e,
            });
        }
    };

    return (
        <StyledContainer>
            <StyledActions>
                <IconButton
                    size={'small'}
                    color={'default'}
                    title={'Refresh'}
                    onClick={() => {
                        refreshFiles();
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
                <FileExplorer
                    type={EXPLORER_TYPE}
                    space={workspace.appId}
                    onSelect={(path) => {
                        handleOnSelectFile(path);
                    }}
                    onTrashClick={(path) => {
                        handleOnTrashClick(path);
                    }}
                    onDragFileStart={(path) => {
                        handleItemDrag(path);
                    }}
                />
            </StyledContent>
        </StyledContainer>
    );
};
