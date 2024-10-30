import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNotification, styled, Typography, Stack } from '@semoss/ui';
import { runPixel } from '@/api';
import {
    SerializedState,
    StateStore,
    WorkspaceStore,
    MigrationManager,
    STATE_VERSION,
    DesignerStore,
} from '@/stores';
import { DefaultCells } from '@/components/cell-defaults';
import { DefaultBlocks } from '@/components/block-defaults';
import { Blocks } from '@/components/blocks';
import { Notebook } from '@/components/notebook';
import { Designer } from '@/components/designer';
import { Workspace, SettingsPanel } from '@/components/workspace';
import { LoadingScreen } from '@/components/ui';
import { BlocksWorkspaceActions } from './BlocksWorkspaceActions';
import {
    ConstructionOutlined,
    DataObject,
    Settings,
    VerticalSplitOutlined,
} from '@mui/icons-material';
import {
    DEFAULT_MENU,
    VISUALIZATION_MENU,
} from '../designer/designer.constants';
import { DesignerContext } from '@/contexts';
import {
    VariablesPanel,
    BlocksMenuPanel,
    LayersPanel,
    SelectedBlockPanel,
} from './panels';

const StyledMain = styled('div')(({ theme }) => ({
    height: '100%',
    width: '100%',
    overflow: 'hidden',
}));

const StyledFooter = styled('div')(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    height: theme.spacing(4),
    width: '100%',
    background: 'rgba(253, 237, 225, 1)',
}));

const CONFIG: Parameters<WorkspaceStore['configure']>[0] = {
    layout: {
        selected: 'builder',
        available: [
            {
                id: 'builder',
                name: 'Builder',
                tab: () => <VerticalSplitOutlined fontSize="inherit" />,
                data: {
                    global: { tabEnableClose: false },
                    borders: [
                        {
                            type: 'border',
                            location: 'left',
                            className: 'horizontal-text-tabs',
                            children: [
                                {
                                    type: 'tab',
                                    name: 'Variables',
                                    component: 'variables',
                                    config: {},
                                    enableDrag: false,
                                },
                                {
                                    type: 'tab',
                                    name: 'Layers',
                                    component: 'layers',
                                    config: {},
                                    enableDrag: false,
                                },
                                {
                                    type: 'tab',
                                    name: 'Blocks',
                                    component: 'blocks',
                                    config: {},
                                    enableDrag: false,
                                },
                                {
                                    type: 'tab',
                                    name: 'Selected UI',
                                    component: 'selected',
                                    config: {},
                                    enableDrag: false,
                                },
                                {
                                    type: 'tab',
                                    name: 'Viz',
                                    component: 'viz',
                                    config: {},
                                    enableDrag: false,
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
                                weight: 100,
                                selected: 1,
                                children: [
                                    {
                                        type: 'tab',
                                        name: 'Notebook',
                                        component: 'notebook',
                                        config: {},
                                    },
                                    {
                                        type: 'tab',
                                        name: 'Designer',
                                        component: 'designer',
                                        config: {},
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
            {
                id: 'data-science',
                name: 'Data Science',
                tab: () => <DataObject fontSize="inherit" />,
                data: {
                    global: { tabEnableClose: false },
                    borders: [
                        {
                            type: 'border',
                            location: 'left',
                            children: [
                                {
                                    type: 'tab',
                                    name: 'Variables',
                                    component: 'variables',
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
                                weight: 100,
                                selected: 0,
                                children: [
                                    {
                                        type: 'tab',
                                        name: 'Notebook',
                                        component: 'notebook',
                                        config: {},
                                    },
                                    {
                                        type: 'tab',
                                        name: 'Designer',
                                        component: 'designer',
                                        config: {},
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
            {
                id: 'settings',
                name: 'Settings',
                tab: () => <Settings fontSize="inherit" />,
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
        ],
    },
};

const FACTORY: React.ComponentProps<typeof Workspace>['factory'] = (node) => {
    const component = node.getComponent();

    if (component === 'designer') {
        return <Designer />;
    } else if (component === 'notebook') {
        return <Notebook />;
    } else if (component === 'variables') {
        return <VariablesPanel />;
    } else if (component === 'settings') {
        return <SettingsPanel />;
    } else if (component === 'layers') {
        return <LayersPanel />;
    } else if (component === 'selected') {
        return <SelectedBlockPanel />;
    } else if (component === 'blocks') {
        return <BlocksMenuPanel title={'Add Blocks'} items={DEFAULT_MENU} />;
    } else if (component === 'viz') {
        return (
            <BlocksMenuPanel
                title={'Add Visualization'}
                items={VISUALIZATION_MENU}
            />
        );
    }

    return <>{component}</>;
};

const ACTIVE = 'page-1';

interface BlocksWorkspaceProps {
    /** Workspace to render */
    workspace: WorkspaceStore;
}

/**
 * Render the Blocks worksapce
 */
export const BlocksWorkspace = observer((props: BlocksWorkspaceProps) => {
    const { workspace } = props;
    const notification = useNotification();

    const [state, setState] = useState<StateStore>();

    useEffect(() => {
        // set the initial settings
        workspace.configure({
            ...CONFIG,
        });

        // start the loading screen
        workspace.setLoading(true);

        // load the app
        runPixel<[SerializedState]>(
            `GetAppBlocksJson ( project=["${workspace.appId}"]);`,
            'new',
        )
            .then(async ({ pixelReturn, errors, insightId }) => {
                if (errors.length) {
                    throw new Error(errors.join(''));
                }

                // get the output (SerializedState)
                const { output } = pixelReturn[0];

                // assume the output is the current state
                let state = output;

                // run migration if not up to date
                if (state.version !== STATE_VERSION) {
                    const migration = new MigrationManager();
                    state = await migration.run(output);
                }

                // create a new state store
                const s = new StateStore({
                    mode: 'static',
                    insightId: insightId,
                    state: state,
                    cellRegistry: DefaultCells,
                });

                // set it
                setState(s);

                const { errors: errs } = await runPixel(
                    `SetContext("${workspace.appId}");`,
                    insightId,
                );

                if (errs.length) {
                    notification.add({
                        color: 'error',
                        message: errs.join(''),
                    });
                }
            })
            .catch((e) => {
                notification.add({
                    color: 'error',
                    message: e.message,
                });
                console.error(e);
            })
            .finally(() => {
                // close the loading screen
                workspace.setLoading(false);
            });
    }, []);

    /**
     * Have the designer control the blocks
     */
    const designer = useMemo(() => {
        // return the store
        if (state) {
            return new DesignerStore(state, {
                rendered: ACTIVE,
            });
        }
    }, [state]);

    if (!state) {
        return <LoadingScreen.Trigger />;
    }

    return (
        <Blocks state={state} registry={DefaultBlocks}>
            <DesignerContext.Provider
                value={{
                    designer: designer,
                }}
            >
                <Workspace
                    workspace={workspace}
                    // startTopbar={<BlocksWorkspaceTabs />}
                    endTopbar={<BlocksWorkspaceActions />}
                    footer={
                        <StyledFooter>
                            <Stack
                                direction="row"
                                padding={0}
                                spacing={0.5}
                                alignItems={'center'}
                            >
                                <ConstructionOutlined
                                    fontSize="small"
                                    color={'warning'}
                                />
                                <Typography
                                    variant={'caption'}
                                    fontWeight="bold"
                                >
                                    Note:
                                </Typography>
                                <Typography variant={'caption'}>
                                    This feature is currently in alpha.
                                </Typography>
                            </Stack>
                        </StyledFooter>
                    }
                    factory={FACTORY}
                />
            </DesignerContext.Provider>
        </Blocks>
    );
});
