import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import EventHeader from './EventHeader';
import { ViewType } from '../../screens/OrganizationEvents/OrganizationEvents';

describe('EventHeader', () => {
  const viewType = ViewType.MONTH;
  const handleChangeView = jest.fn();
  const showInviteModal = jest.fn();

  it('renders correctly', () => {
    const { getByTestId } = render(
      <EventHeader
        viewType={viewType}
        handleChangeView={handleChangeView}
        showInviteModal={showInviteModal}
      />,
    );

    expect(getByTestId('event-header')).toBeInTheDocument();
    expect(getByTestId('searchLastName')).toBeInTheDocument();
    expect(getByTestId('selectMonth')).toBeInTheDocument();
    expect(getByTestId('selectDay')).toBeInTheDocument();
    expect(getByTestId('createEventModalBtn')).toBeInTheDocument();
  });

  it('calls handleChangeView with selected view type', () => {
    const { getByTestId } = render(
      <EventHeader
        viewType={viewType}
        handleChangeView={handleChangeView}
        showInviteModal={showInviteModal}
      />,
    );

    fireEvent.click(getByTestId('selectDay'));
    expect(handleChangeView).toHaveBeenCalledWith(ViewType.DAY);
  });

  it('calls showInviteModal when create event button is clicked', () => {
    const { getByTestId } = render(
      <EventHeader
        viewType={viewType}
        handleChangeView={handleChangeView}
        showInviteModal={showInviteModal}
      />,
    );

    fireEvent.click(getByTestId('createEventModalBtn'));
    expect(showInviteModal).toHaveBeenCalled();
  });
});
