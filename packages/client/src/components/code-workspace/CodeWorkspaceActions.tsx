import { observer } from 'mobx-react-lite';
import { styled, IconButton, Stack, Tooltip } from '@semoss/ui';
import { ShareRounded } from '@mui/icons-material';
import { useWorkspace } from '@/hooks';
import { ShareOverlay } from '@/components/workspace';

const StyledShareIcon = styled(ShareRounded)(({ theme }) => ({
    color: 'rgba(0, 0, 0, 0.54)',
}));

export const CodeWorkspaceActions = observer(() => {
    const { workspace } = useWorkspace();

    return (
        <Stack direction="row" spacing={1.25} alignItems={'center'}>
            <Tooltip title={'Share App'}>
                <IconButton
                    size="small"
                    onClick={() => {
                        workspace.openOverlay(() => (
                            <ShareOverlay
                                appId={workspace.appId}
                                onClose={() => workspace.closeOverlay()}
                            />
                        ));
                    }}
                >
                    <StyledShareIcon fontSize={'small'} />
                </IconButton>
            </Tooltip>
        </Stack>
    );
});
