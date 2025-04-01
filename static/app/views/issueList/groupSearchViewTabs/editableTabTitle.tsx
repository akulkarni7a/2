import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useTheme} from '@emotion/react';
import styled from '@emotion/styled';

import {GrowingInput} from 'sentry/components/growingInput';
import {TabsContext} from 'sentry/components/tabs';
import Tooltip from 'sentry/components/tooltip';

const SOFT_CHARACTER_LIMIT = 50;
const HARD_CHARACTER_LIMIT = 128;

interface EditableTabTitleProps {
  isEditing: boolean;
  label: string;
  onChange: (newLabel: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  tabKey: string;
}

function EditableTabTitle({
  label,
  onChange,
  isEditing,
  tabKey,
  setIsEditing,
}: EditableTabTitleProps) {
  const [inputValue, setInputValue] = useState(label);
  const {tabListState} = useContext(TabsContext);

  useEffect(() => {
    setInputValue(label);
  }, [label]);

  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const isEmpty = !inputValue.trim();

  const isSelected = tabListState?.selectedKey === tabKey;

  const memoizedStyles = useMemo(() => {
    return {fontWeight: isSelected ? theme.fontWeightBold : theme.fontWeightNormal};
  }, [isSelected, theme.fontWeightBold, theme.fontWeightNormal]);

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    e.stopPropagation();
    e.preventDefault();
    let trimmedInputValue = inputValue.trim();
    if (!isEditing) {
      return;
    }

    if (isEmpty) {
      setInputValue(label);
      setIsEditing(false);
      return;
    }
+    if (trimmedInputValue.length > HARD_CHARACTER_LIMIT) {
+      trimmedInputValue = trimmedInputValue.substring(0, HARD_CHARACTER_LIMIT);
+    }
+    if (trimmedInputValue !== label) {
+      onChange(trimmedInputValue);
+      setInputValue(trimmedInputValue);
+    }
+    setIsEditing(false);
+  };

  const handleOnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setInputValue(label.trim());
      setIsEditing(false);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') {
      e.stopPropagation();
    }
  };

  useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else {
      inputRef.current?.blur();
    }
  }, [isEditing, inputRef]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= HARD_CHARACTER_LIMIT) {
      setInputValue(e.target.value);
    }
  };

  return isSelected ? (
    <StyledGrowingInput
      value={inputValue}
      onChange={handleOnChange}
      onKeyDown={handleOnKeyDown}
      onDoubleClick={() => isSelected && setIsEditing(true)}
      onBlur={handleOnBlur}
      ref={inputRef}
      style={memoizedStyles}
      isEditing={isEditing}
      onFocus={e => e.target.select()}
      onPointerDown={e => {
        e.stopPropagation();
      }}
      onMouseDown={e => {
        e.stopPropagation();
      }}
    />
  ) : (
    <Tooltip title={label}>
      <div style={{height: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
        {label.length > SOFT_CHARACTER_LIMIT ? `${label.substring(0, SOFT_CHARACTER_LIMIT)}...` : label}
      </div>
    </Tooltip>
  );
}

export default EditableTabTitle;

const StyledGrowingInput = styled(GrowingInput)<{
  isEditing: boolean;
}>`
  position: relative;
  border: none;
  padding: 0;
  background: transparent;
  min-height: 0px;
  height: 20px;
  border-radius: 0px;
  cursor: ${p => (p.isEditing ? 'text' : 'pointer')};

  &,
  &:focus,
  &:active,
  &:hover {
    box-shadow: none;
  }
`;
