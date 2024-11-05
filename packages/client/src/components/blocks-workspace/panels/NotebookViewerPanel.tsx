import { observer } from 'mobx-react-lite';
import { Actions, TabNode } from 'flexlayout-react';
import { useNotification } from '@semoss/ui';

import { useWorkspace } from '@/hooks';
import { Notebook } from '@/components/notebook/Notebook';

interface NotebookViewerPanelProps {
    /** Id of the notebook */
    id: string;
}

export const NotebookViewerPanel = observer(
    (props: NotebookViewerPanelProps) => {
        const { id } = props;

        return <Notebook id={id} />;
    },
);
