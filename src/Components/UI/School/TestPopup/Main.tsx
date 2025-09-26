import React, { useMemo, useState } from 'react';
import ModalFrame from '../../Contacts/ContactPopup/ModalFrame';
import Button from '../../Button';
import { Test } from '../../../../utils/interfaces/interfaces';
import EditForm from './EditForm';
import { ViewDetails as ViewDetailsComponent } from './index';

export interface TestPopupProps {
  test?: Test | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (test: Test) => void;
  onDelete?: () => void;
  startInEdit?: boolean;
}

const TestPopupMain: React.FC<TestPopupProps> = ({
  test,
  isOpen,
  onClose,
  onSave,
  onDelete,
  startInEdit,
}) => {
  const initialEdit = useMemo(() => (!!test ? !!startInEdit : true), [test, startInEdit]);
  const [isEditing, setIsEditing] = useState<boolean>(initialEdit);
  const [canSave, setCanSave] = useState<boolean>(false);
  const [draft, setDraft] = useState<Test | null>(test || null);

  const title = test ? (isEditing ? 'Edit Test' : 'Test Details') : 'New Test';

  return (
    <ModalFrame
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footerLeft={
        <>
          {test && !isEditing && (
            <Button text="Edit" variant="outline" onClick={() => setIsEditing(true)} />
          )}
          {test && !isEditing && onDelete && (
            <Button text="Delete" variant="outline" action="delete" onClick={onDelete} />
          )}
        </>
      }
      footerRight={
        <>
          {isEditing ? (
            <>
              <Button
                text="Cancel"
                variant="outline"
                onClick={() => (test ? setIsEditing(false) : onClose())}
              />
              <Button
                text="Save"
                variant="primary"
                className={!canSave ? 'opacity-50 cursor-not-allowed' : ''}
                onClick={() => {
                  if (canSave && draft) onSave?.(draft);
                }}
              />
            </>
          ) : (
            <Button text="Close" variant="outline" onClick={onClose} />
          )}
        </>
      }
    >
      {isEditing ? (
        <EditForm
          test={test || null}
          onDraftChange={(d: Test) => setDraft(d)}
          onValidityChange={(v: boolean) => setCanSave(v)}
        />
      ) : (
        <ViewDetailsComponent test={test!} />
      )}
    </ModalFrame>
  );
};

export default TestPopupMain;
