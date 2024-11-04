import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
    Avatar,
    styled,
    Stack,
    Typography,
    Tooltip,
    useNotification,
    IconButton,
} from '@semoss/ui';
import { Drawer } from '@mui/material';
import { Home, InfoOutlined, Menu, MenuOpen } from '@mui/icons-material';

import { Env } from '@/env';
import { THEME } from '@/constants';
import { WorkspaceContext } from '@/contexts';
import { WorkspaceStore } from '@/stores';
import { usePixel, useRootStore } from '@/hooks';
import { WorkspaceOverlay } from './WorkspaceOverlay';
import { WorkspaceLoading } from './WorkspaceLoading';
import { WorkspaceTabs } from './WorkspaceTabs';
import { Layout, TabNode } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import './flexlayout-tabs.css';

const StyledViewport = styled('div')(() => ({
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
}));

const StyledMain = styled('div', {
    shouldForwardProp: (prop) => prop !== 'drawerOpen',
})<{
    drawerOpen: boolean;
}>(({ theme, drawerOpen }) => ({
    position: 'relative',
    flex: '1',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    width: drawerOpen ? 'calc(100% - 240px)' : '100%',
    marginLeft: drawerOpen ? '240px' : '0',
    transition: 'margin 0.3s ease, width 0.3s ease',
    overflow: 'hidden',
}));

const StyledContent = styled('div')(() => ({
    position: 'relative',
    flex: '1',
    height: '100%',
    width: '100%',
    overflow: 'auto',
    minHeight: 0,
}));

const StyledMenuOpenIcon = styled(MenuOpen)(({ theme }) => ({
    color: 'rgba(0, 0, 0, 0.54)',
}));

const StyledMenuIcon = styled(Menu)(({ theme }) => ({
    color: 'rgba(0, 0, 0, 0.54)',
}));

const StyledHomeIcon = styled(Home)(({ theme }) => ({
    color: 'rgba(0, 0, 0, 0.54)',
}));

const StyledHeaderLogo = styled(Link)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
}));

const StyledHeaderLogoImg = styled('img')(({ theme }) => ({
    width: theme.spacing(3),
}));

type WorkspaceProps = {
    /** End items to render in the top bar */
    endTopbar?: React.ReactNode;

    /** Alert to display in topbar */
    alert?: React.ReactNode;

    /** Footer to render */
    footer?: React.ReactNode;

    /** Workspace to render */
    workspace: WorkspaceStore;

    /** Factor method */
    factory: (node: TabNode, layout: Layout) => React.ReactNode;
};

export const Workspace = observer((props: WorkspaceProps) => {
    const {
        endTopbar: endTopbar = null,
        alert,
        footer = null,
        workspace,
        factory = () => null,
    } = props;
    const { configStore } = useRootStore();
    const notification = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const editMode = location.pathname.includes('/edit');

    const [drawerOpen, setDrawerOpen] = useState(false);

    const layoutRef = useRef<Layout>(null);

    // build the model from the layout
    const model = workspace.selectedLayout?.model;

    const validateDependencies = usePixel(
        'ValidateUserProjectDependencies(project="' + workspace.appId + '");',
    );

    useEffect(() => {
        if (validateDependencies.status !== 'SUCCESS') {
            return;
        } else if (validateDependencies.data !== null) {
            const needsAccess = [];
            Object.entries(validateDependencies.data).forEach((kv) => {
                const hasAccess = kv[1];

                if (!hasAccess) {
                    needsAccess.push(kv[0]);
                }
            });
            if (needsAccess.length) {
                notification.add({
                    color: 'warning',
                    message:
                        needsAccess.join(', ') +
                        '- are dependencies you do not have access to',
                });
            }
        }
    }, [validateDependencies.status, validateDependencies.data]);

    const toggleDrawer = (open) => (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setDrawerOpen(open);
    };

    const themeMap = useMemo(() => {
        const theme = configStore.store.config['theme'];

        if (theme && theme['THEME_MAP']) {
            try {
                return JSON.parse(theme['THEME_MAP'] as string);
            } catch {
                return {};
            }
        }

        return {};
    }, [Object.keys(configStore.store.config).length]);

    return (
        <WorkspaceContext.Provider
            value={{
                workspace: workspace,
            }}
        >
            <WorkspaceOverlay />
            <StyledViewport>
                <StyledMain drawerOpen={drawerOpen}>
                    <Stack
                        direction={'row'}
                        gap={1}
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        padding={1}
                    >
                        <Stack
                            direction={'row'}
                            gap={1}
                            justifyContent={'flex-start'}
                            alignItems={'center'}
                            padding={0}
                        >
                            {editMode ? (
                                <IconButton
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    onClick={toggleDrawer(!drawerOpen)}
                                >
                                    {drawerOpen ? (
                                        <StyledMenuOpenIcon fontSize="small" />
                                    ) : (
                                        <StyledMenuIcon fontSize="small" />
                                    )}
                                </IconButton>
                            ) : (
                                <IconButton
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    onClick={() => navigate('/')}
                                >
                                    <StyledHomeIcon />
                                </IconButton>
                            )}
                            <Avatar
                                variant="rounded"
                                src={`${Env.MODULE}/api/project-${workspace.appId}/projectImage/download`}
                            />
                            <Typography variant={'h6'}>
                                {workspace.metadata.project_name}
                            </Typography>
                            <Tooltip
                                title={
                                    <Stack direction="column" spacing={0}>
                                        <div>App ID: {workspace.appId}</div>
                                        <div>
                                            Created:
                                            {
                                                workspace.metadata
                                                    .project_date_created
                                            }
                                        </div>
                                    </Stack>
                                }
                            >
                                <InfoOutlined fontSize={'small'} />
                            </Tooltip>
                            {alert}
                        </Stack>
                        {endTopbar}
                    </Stack>
                    <StyledContent>
                        <WorkspaceLoading />
                        {model ? (
                            <Layout
                                ref={layoutRef}
                                model={model}
                                factory={(node) => {
                                    return factory(node, layoutRef.current);
                                }}
                            />
                        ) : null}
                    </StyledContent>
                    {footer}
                </StyledMain>
            </StyledViewport>
            <Drawer
                anchor="left"
                open={drawerOpen}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                    hideBackdrop: true, // Hide the backdrop
                }}
                PaperProps={{
                    style: {
                        position: 'absolute',
                        height: '100%',
                        width: '240px',
                        zIndex: 1200,
                    },
                }}
                variant="persistent"
            >
                <Stack p={2} direction="column" gap={1}>
                    <StyledHeaderLogo to={'/'}>
                        {themeMap.isLogoUrl ? (
                            <StyledHeaderLogoImg src={themeMap.logo} />
                        ) : THEME.logo ? (
                            <StyledHeaderLogoImg src={THEME.logo} />
                        ) : null}
                        <Typography variant={'h6'}>
                            {themeMap.name ? themeMap.name : THEME.name}
                        </Typography>
                    </StyledHeaderLogo>
                    <WorkspaceTabs />
                </Stack>
            </Drawer>
        </WorkspaceContext.Provider>
    );
});
