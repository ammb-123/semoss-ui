import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { WorkspaceStore } from '@/stores';

import {
    Workspace,
    SettingsPanel,
    FileExplorerPanel,
    FileViewerPanel,
} from '@/components/workspace';

import { CodeWorkspaceActions } from './CodeWorkspaceActions';
import { RendererPanel } from './panels';
import { Code, Settings } from '@mui/icons-material';

const DEFAULT_OPTIONS: Parameters<WorkspaceStore['load']>[0] = {
    layout: {
        selected: 'code',
        available: {
            code: {
                id: 'code',
                name: 'Code',
                data: {
                    global: {
                        tabEnableClose: false,
                        tabEnableRename: false,
                    },
                    borders: [
                        {
                            type: 'border',
                            location: 'left',
                            selected: 0,
                            children: [
                                {
                                    id: 'file-explorer',
                                    type: 'tab',
                                    name: 'Files',
                                    component: 'file-explorer',
                                    enableClose: false,
                                    config: {},
                                },
                            ],
                        },
                    ],
                    layout: {
                        type: 'row',
                        weight: 100,
                        children: [
                            {
                                type: 'tabset',
                                weight: 50,
                                selected: 0,
                                enableTabStrip: true,
                                children: [
                                    {
                                        id: 'render',
                                        type: 'tab',
                                        name: 'App',
                                        component: 'renderer',
                                        config: {},
                                    },
                                    {
                                        type: 'tab',
                                        name: 'Settings',
                                        component: 'settings',
                                        config: {},
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
            settings: {
                id: 'settings',
                name: 'Settings',
                data: {
                    global: { tabEnableClose: false },
                    borders: [],
                    layout: {
                        type: 'row',
                        weight: 100,
                        children: [
                            {
                                type: 'tabset',
                                weight: 100,
                                selected: 0,
                                enableTabStrip: false,
                                children: [
                                    {
                                        type: 'tab',
                                        name: 'Settings',
                                        component: 'settings',
                                        config: {},
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        },
    },
};

const FACTORY: React.ComponentProps<typeof Workspace>['factory'] = (
    node,
    layout,
) => {
    const component = node.getComponent();
    const config = node.getConfig();

    if (component === 'file-explorer') {
        return <FileExplorerPanel layout={layout} />;
    } else if (component === 'file-viewer') {
        return <FileViewerPanel path={config.path} />;
    } else if (component === 'renderer') {
        return <RendererPanel />;
    } else if (component === 'settings') {
        return <SettingsPanel />;
    }

    return <>{component}</>;
};

interface CodeWorkspaceProps {
    /** Workspace to render */
    workspace: WorkspaceStore;
}

/**
 * Render the code workspace
 */
export const CodeWorkspace = observer((props: CodeWorkspaceProps) => {
    const { workspace } = props;

    useEffect(() => {
        // try to load from cache, otherwise load default settings
        workspace.load({
            ...DEFAULT_OPTIONS,
        });
    }, []);

    return (
        <>
            <Workspace
                workspace={workspace}
                endTopbar={<CodeWorkspaceActions />}
                factory={FACTORY}
            />
        </>
    );
});
