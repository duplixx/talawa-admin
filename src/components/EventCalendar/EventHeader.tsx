import React, { useState } from 'react';
import { Button, Dropdown, Form } from 'react-bootstrap';
import { Search } from '@mui/icons-material';
import styles from './EventCalendar.module.css';
import { ViewType } from '../../screens/OrganizationEvents/OrganizationEvents';

interface InterfaceEventHeaderProps {
  viewType: ViewType;
  handleChangeView: (item: any) => void;
  showInviteModal: () => void;
}

function eventHeader({
  viewType,
  handleChangeView,
  showInviteModal,
}: InterfaceEventHeaderProps): JSX.Element {
  const [fullName, setFullName] = useState('');

  return (
    <div className={styles.calendar}>
      <div className={styles.calendar__header}>
        <div className={styles.input}>
          <Form.Control
            type="text"
            id="searchLastName"
            placeholder="Search Event Name"
            autoComplete="off"
            required
            className={styles.inputField}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Button
            className={`position-absolute z-10 bottom-0 end-0 d-flex justify-content-center align-items-center `}
            style={{ marginBottom: '10px' }}
          >
            <Search />
          </Button>
        </div>
        <div className={styles.flex_grow}></div>
        <div className={styles.space}>
          <div>
            <Dropdown onSelect={handleChangeView} className={styles.selectType}>
              <Dropdown.Toggle id="dropdown-basic" className={styles.dropdown}>
                {viewType || ViewType.MONTH}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  eventKey={ViewType.MONTH}
                  data-testid="selectMonth"
                >
                  {ViewType.MONTH}
                </Dropdown.Item>
                <Dropdown.Item eventKey={ViewType.DAY} data-testid="selectDay">
                  {ViewType.DAY}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div>
            <Dropdown onSelect={handleChangeView} className={styles.selectType}>
              <Dropdown.Toggle id="dropdown-basic" className={styles.dropdown}>
                Event Type
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="Events" data-testid="selectMonth">
                  Events
                </Dropdown.Item>
                <Dropdown.Item eventKey="Workshops" data-testid="selectDay">
                  Workshops
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <Button
            variant="success"
            className={styles.addbtn}
            onClick={showInviteModal}
            data-testid="createEventModalBtn"
          >
            Create Event
          </Button>
        </div>
      </div>
    </div>
  );
}

export default eventHeader;
