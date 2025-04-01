import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';

import EditableTabTitle from './editableTabTitle';
import Tooltip from 'sentry/components/tooltip'; // Import Tooltip

const SOFT_CHARACTER_LIMIT = 50;
const HARD_CHARACTER_LIMIT = 128;

describe('EditableTabTitle', () => {
  const defaultProps = {
    isEditing: false,
    label: 'Test Tab Title',
    onChange: jest.fn(),
    setIsEditing: jest.fn(),
    tabKey: 'test-tab',
  };

  it('renders the label', () => {
    render(<EditableTabTitle {...defaultProps} />);
    expect(screen.getByText('Test Tab Title')).toBeInTheDocument();
  });

  it('truncates titles exceeding the soft limit', () => {
    const longTitle = 'This is a very long tab title that exceeds the soft character limit of 50 characters.';
    render(<EditableTabTitle {...defaultProps} label={longTitle} />);
    expect(screen.getByText(`${longTitle.substring(0, SOFT_CHARACTER_LIMIT)}...`)).toBeInTheDocument();
  });

  it('displays the full title in a tooltip on hover', async () => {
    const longTitle = 'This is a very long tab title that exceeds the soft character limit of 50 characters.';
    render(<EditableTabTitle {...defaultProps} label={longTitle} />);
    const truncatedTitle = screen.getByText(`${longTitle.substring(0, SOFT_CHARACTER_LIMIT)}...`);
    fireEvent.mouseEnter(truncatedTitle);
    // Wait for the tooltip to appear (adjust timeout if necessary)
    await new Promise(resolve => setTimeout(resolve, 500));
    expect(screen.getByText(longTitle)).toBeVisible();
  });

  it('allows editing when isEditing is true', () => {
    render(<EditableTabTitle {...defaultProps} isEditing={true} />);
    expect(screen.getByRole('textbox')).toHaveValue('Test Tab Title');
  });

  it('enforces the hard character limit in the input field', () => {
    render(<EditableTabTitle {...defaultProps} isEditing={true} />);
    const input = screen.getByRole('textbox');
    const longInput = 'A'.repeat(HARD_CHARACTER_LIMIT + 1);
    fireEvent.change(input, {target: {value: longInput}});
    expect(input).toHaveValue('A'.repeat(HARD_CHARACTER_LIMIT));
  });

  it('calls onChange with the trimmed and potentially truncated value on blur', () => {
    render(<EditableTabTitle {...defaultProps} isEditing={true} />);
    const input = screen.getByRole('textbox');
    const newValue = '  New Title  ';
    fireEvent.change(input, {target: {value: newValue}});
    fireEvent.blur(input);
    expect(defaultProps.onChange).toHaveBeenCalledWith('New Title');
  });

  it('truncates the saved title to the hard limit', () => {
    render(<EditableTabTitle {...defaultProps} isEditing={true} />);
    const input = screen.getByRole('textbox');
    const longTitle = 'This is a very long title that exceeds the hard character limit of 128 characters.' + 'A'.repeat(HARD_CHARACTER_LIMIT);
    fireEvent.change(input, {target: {value: longTitle}});
    fireEvent.blur(input);
    expect(defaultProps.onChange).toHaveBeenCalledWith(longTitle.substring(0, HARD_CHARACTER_LIMIT));
  });

  it('handles empty title by reverting to original label', () => {
    render(<EditableTabTitle {...defaultProps} isEditing={true} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: '   '}});
    fireEvent.blur(input);
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });
});
