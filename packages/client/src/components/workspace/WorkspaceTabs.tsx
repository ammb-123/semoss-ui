import { observer } from 'mobx-react-lite';
import {
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Stack,
} from '@mui/material';

import { useWorkspace } from '@/hooks';
import { Typography } from '@semoss/ui';

export const WorkspaceTabs = observer(() => {
    const { workspace } = useWorkspace();

    // if there are no other layouts, no need to show this
    if (workspace.availableLayouts.length <= 1) {
        return null;
    }

    return (
        <Stack direction="column">
            <Typography variant={'body1'} fontWeight={'bold'}>
                Perspectives
            </Typography>
            <List component="nav" aria-label="workspace layouts">
                {workspace.availableLayouts.map((a) => {
                    const Tab = a.tab;

                    return (
                        <ListItem
                            button
                            key={a.id}
                            selected={a.id === workspace.selectedLayout?.id}
                            onClick={() => workspace.selectLayout(a.id)}
                        >
                            <ListItemIcon>
                                <Tab />
                            </ListItemIcon>
                            <ListItemText primary={a.name} />
                        </ListItem>
                    );
                })}
            </List>
        </Stack>
    );
});
