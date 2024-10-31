import { Notebook } from '@/components/notebook';
import { observer } from 'mobx-react-lite';

export const NotebookPanel = observer((props) => {
    return <Notebook />;
});
