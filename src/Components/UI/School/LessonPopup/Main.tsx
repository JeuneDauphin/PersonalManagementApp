import React, { useMemo, useState } from 'react';
import ModalFrame from '../../Contacts/ContactPopup/ModalFrame';
import Button from '../../Button';
import { Lesson } from '../../../../utils/interfaces/interfaces';
import EditForm from './EditForm';
import ViewDetails from './ViewDetails';

export interface LessonPopupProps {
  lesson?: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (lesson: Lesson) => void;
  onDelete?: () => void;
  startInEdit?: boolean;
}

const LessonPopupMain: React.FC<LessonPopupProps> = ({
  lesson,
  isOpen,
  onClose,
  onSave,
  onDelete,
  startInEdit,
}) => {
  const initialEdit = useMemo(() => (!!lesson ? !!startInEdit : true), [lesson, startInEdit]);
  const [isEditing, setIsEditing] = useState<boolean>(initialEdit);
  const [canSave, setCanSave] = useState<boolean>(false);
  const [draft, setDraft] = useState<Lesson | null>(lesson || null);

  const title = lesson
    ? isEditing
      ? 'Edit Lesson'
      : 'Lesson Details'
    : 'New Lesson';

  return (
    <ModalFrame
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footerLeft={
        <>
          {lesson && !isEditing && (
            <Button text="Edit" variant="outline" onClick={() => setIsEditing(true)} />
          )}
          {lesson && !isEditing && onDelete && (
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
                onClick={() => (lesson ? setIsEditing(false) : onClose())}
              />
              <Button
                text="Save"
                variant="primary"
                className={!canSave ? 'opacity-50 cursor-not-allowed' : ''}
                onClick={() => {
                  if (canSave && draft) {
                    onSave?.(draft);
                  }
                }}
              />
            </>
          ) : (
            <Button text="Close" variant="outline" onClick={onClose} />
          )}
        </>
      }
      headerRight={null}
    >
      {isEditing ? (
        <EditForm
          lesson={lesson || null}
          onDraftChange={(d: Lesson) => setDraft(d)}
          onValidityChange={(v: boolean) => setCanSave(v)}
        />
      ) : (
        <ViewDetails lesson={lesson!} />
      )}
    </ModalFrame>
  );
};

export default LessonPopupMain;
