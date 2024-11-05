import { observer } from 'mobx-react-lite';
import { Actions, TabNode } from 'flexlayout-react';
import { useNotification } from '@semoss/ui';

import { useWorkspace } from '@/hooks';
import { FileViewer } from '@/components/common';

interface FileViewerPanelProps {
    /** Path to the file location */
    path: string;
}

export const FileViewerPanel = observer((props: FileViewerPanelProps) => {
    const { path } = props;
    const { workspace } = useWorkspace();
    const notification = useNotification();

    // get the name
    const name = path.split('/').pop();

    /**
     * Triggered when a file is changed
     * @param isModified - isModified
     */
    const onChange = (isModified: boolean) => {
        try {
            // get the model
            const model = workspace.selectedLayout?.model;
            if (!model) {
                throw new Error('Missing model');
            }

            let selectedNode: TabNode | null = null;

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

            if (!selectedNode) {
                return;
            }

            const id = selectedNode.getId();
            if (isModified) {
                model.doAction(Actions.renameTab(id, `${name}*`));
            } else {
                model.doAction(Actions.renameTab(id, `${name}`));
            }
        } catch (e) {
            notification.add({
                color: 'error',
                message: e,
            });
        }
    };

    return (
        <FileViewer
            type={'app'}
            space={workspace.appId}
            path={path}
            agentModelEngine={workspace.agentModelEngine}
            onChange={(isModified) => onChange(isModified)}
        />
    );
});
