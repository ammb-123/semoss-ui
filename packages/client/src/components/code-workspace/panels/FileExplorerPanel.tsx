import { Actions, DockLocation, TabNode } from 'flexlayout-react';
import { useNotification } from '@semoss/ui';

import { useWorkspace } from '@/hooks';
import { FileExplorer } from '@/components/common';

export const FileExplorerPanel = () => {
    const { workspace } = useWorkspace();

    const notification = useNotification();

    /**
     * Create a new panel and highlight it
     *
     * path - path to file
     */
    const createPanel = (path: string) => {
        try {
            if (!path) {
                return;
            }

            // can can only create panels for files
            if (path.slice(-1) === '/') {
                return;
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
        }
    };

    /**
     * Select a panel and create one if it doesn't exist
     *
     * path - path to file
     */
    const selectPanel = (path: string) => {
        try {
            if (!path) {
                return;
            }

            // can can only select files
            if (path.slice(-1) === '/') {
                return;
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
                createPanel(path);
                return;
            }

            const selectedNodeId = selectedNode.getId();
            model.doAction(Actions.selectTab(selectedNodeId));
        } catch (e) {
            notification.add({
                color: 'error',
                message: e,
            });
        }
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
        <FileExplorer
            type={'app'}
            space={workspace.appId}
            onAddFile={(path) => {
                createPanel(path);
            }}
            onSelectFile={(path) => {
                selectPanel(path);
            }}
            onDeleteFile={(path) => {
                removePanel(path);
            }}
        />
    );
};
