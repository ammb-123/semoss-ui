import { observer } from 'mobx-react-lite';
import { ToggleButtonGroup, ToggleButton, Stack } from '@semoss/ui';

import { useWorkspace } from '@/hooks';

export const WorkspaceTabs = observer(() => {
    const { workspace } = useWorkspace();

    // if there are no other layouts, no need to show this
    if (workspace.availableLayouts.length <= 1) {
        return null;
    }

    return (
        <>
            <Stack direction="row" alignItems={'center'}>
                <ToggleButtonGroup
                    color="primary"
                    size={'small'}
                    value={workspace.selectedLayout?.id}
                    exclusive={true}
                >
                    {workspace.availableLayouts.map((a) => {
                        const Tab = a.tab;

                        return (
                            <ToggleButton
                                key={a.id}
                                size={'small'}
                                value={a.id}
                                onClick={() => workspace.selectLayout(a.id)}
                            >
                                <Stack
                                    direction="row"
                                    alignItems={'center'}
                                    spacing={1}
                                >
                                    <Tab />
                                    <span>{a.name}</span>
                                </Stack>
                            </ToggleButton>
                        );
                    })}
                </ToggleButtonGroup>
            </Stack>
        </>
    );
});
