import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Refresh } from '@mui/icons-material';
import { styled, IconButton } from '@semoss/ui';

import { useWorkspace } from '@/hooks';

import { CodeRenderer } from '../CodeRenderer';

const StyledPanel = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '100%',
}));

const StyledActions = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: theme.palette.secondary.light,
}));

export const RendererPanel = observer(() => {
    // App ID Needed for pixel calls
    const { workspace } = useWorkspace();

    // temporary fix for dead refresh button should be removed
    const [counter, setCounter] = useState(0);

    return (
        <StyledPanel>
            <StyledActions>
                <IconButton
                    size={'small'}
                    color={'default'}
                    title={'Refresh'}
                    onClick={() => {
                        // refreshApp();
                        setCounter(counter + 1);
                    }}
                >
                    <Refresh fontSize="inherit" />
                </IconButton>
            </StyledActions>
            <CodeRenderer appId={workspace.appId} key={counter} />
        </StyledPanel>
    );
});
