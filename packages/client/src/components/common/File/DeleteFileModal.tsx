import { useState } from 'react';
import { Button, Modal, FileDropzone, Typography, Stack } from '@semoss/ui';
import { useRootStore } from '@/hooks';

interface DeleteFileModalProps {
    /** Track if the model is open */
    open: boolean;

    /** Type of file opened */
    type: 'app' | 'insight';

    /** Space where the file is located */
    space: string;

    /** Path of the deleted file */
    fileDeletePath: string;

    /** Callback that is triggered onClose */
    onClose: (success: boolean) => void;
}

export const DeleteFileModal = (props: DeleteFileModalProps) => {
    const {
        open,
        type,
        space,
        fileDeletePath = '',
        onClose = () => null,
    } = props;

    const { monolithStore } = useRootStore();

    const [isLoading, setIsLoading] = useState(false);
    const [uploadFile, setUploadFiles] = useState<File>(null);

    const fileName = fileDeletePath.split('/').pop();

    /**
     * Add the file to the app
     */
    const deleteFile = async () => {
        try {
            setIsLoading(true);

            if (type === 'app') {
                await monolithStore.runQuery(
                    `DeleteAsset(filePath=["${fileDeletePath}"], space=["${space}"]);`,
                );
            } else if (type === 'insight') {
                throw new Error('TODO');
            }

            onClose(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            setUploadFiles(null);
        }
    };

    return (
        <Modal open={open}>
            <Modal.Title>Are you sure?</Modal.Title>
            <Modal.Content>
                <Stack direction={'column'} spacing={2}>
                    <Typography variant="body2">
                        This will delete <b>{fileName}</b>
                    </Typography>
                    <FileDropzone
                        multiple={false}
                        value={uploadFile}
                        disabled={isLoading}
                        onChange={(newValue: File) => {
                            setUploadFiles(newValue);
                        }}
                    />
                </Stack>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    variant={'outlined'}
                    onClick={() => {
                        onClose(false);
                    }}
                >
                    Close
                </Button>
                <Button
                    color={'error'}
                    variant={'contained'}
                    onClick={() => {
                        deleteFile();
                    }}
                >
                    Confirm
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
