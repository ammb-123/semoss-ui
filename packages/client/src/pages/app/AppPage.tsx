import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
    Avatar,
    styled,
    Stack,
    Typography,
    useNotification,
    IconButton,
    Button,
} from '@semoss/ui';
import { EditOutlined, Home } from '@mui/icons-material';

import { Env } from '@/env';
import { WorkspaceStore } from '@/stores';
import { useRootStore } from '@/hooks';
import { LoadingScreen } from '@/components/ui';
import { BlocksRenderer } from '@/components/blocks-workspace';
import { CodeRenderer } from '@/components/code-workspace';

const StyledViewport = styled('div')(() => ({
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
}));

const StyledContent = styled('div')(({ theme }) => ({
    position: 'relative',
    flex: '1',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
}));

export const AppPage = observer(() => {
    // App ID Needed for pixel calls
    const { appId } = useParams();
    const { configStore } = useRootStore();

    const notification = useNotification();
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState<WorkspaceStore>(undefined);

    useEffect(() => {
        // clear out the old app
        setWorkspace(undefined);

        configStore
            .createWorkspace(appId)
            .then((loadedWorkspace) => {
                setWorkspace(loadedWorkspace);
            })
            .catch((e) => {
                notification.add({
                    color: 'error',
                    message: e.message,
                });

                navigate('/');
            });
    }, [appId]);

    // hide the screen while it loads
    if (!workspace) {
        return <LoadingScreen.Trigger description="Initializing app" />;
    }

    return (
        <StyledViewport>
            <Stack
                direction={'row'}
                justifyContent={'space-between'}
                alignItems={'center'}
                padding={1}
                spacing={1}
            >
                <Stack
                    direction={'row'}
                    justifyContent={'flex-start'}
                    alignItems={'center'}
                    padding={0}
                    spacing={2}
                >
                    <IconButton
                        edge="start"
                        color="default"
                        aria-label="menu"
                        onClick={() => navigate('/')}
                    >
                        <Home />
                    </IconButton>
                    <Stack direction="row" alignItems={'center'} spacing={1}>
                        <Avatar
                            variant="rounded"
                            src={`${Env.MODULE}/api/project-${workspace.appId}/projectImage/download`}
                        />
                        <Typography variant={'subtitle1'}>
                            {workspace.metadata.project_name}
                        </Typography>
                    </Stack>
                    {alert}
                </Stack>
                <Stack flex={1}>&nbsp;</Stack>
                <Button
                    variant="contained"
                    size={'small'}
                    color="primary"
                    disabled={
                        !(
                            workspace.role === 'OWNER' ||
                            workspace.role === 'EDIT'
                        )
                    }
                    onClick={() => {
                        navigate('edit');
                    }}
                    endIcon={<EditOutlined fontSize="inherit" />}
                >
                    Edit
                </Button>
            </Stack>
            <StyledContent>
                {workspace.type === 'BLOCKS' ? (
                    <BlocksRenderer appId={appId} />
                ) : null}
                {workspace.type === 'CODE' ? (
                    <CodeRenderer appId={appId} />
                ) : null}
            </StyledContent>
        </StyledViewport>
    );
});
