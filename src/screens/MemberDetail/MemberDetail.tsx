import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styles from './MemberDetail.module.css';
import { languages } from 'utils/languages';
import { UPDATE_USER_MUTATION } from 'GraphQl/Mutations/mutations';
import { EVENT_DETAILS, USER_DETAILS } from 'GraphQl/Queries/Queries';
import { toast } from 'react-toastify';
import { errorHandler } from 'utils/errorHandler';
import CardItemLoading from 'components/OrganizationDashCards/CardItemLoading';
import { Card, Row, Col } from 'react-bootstrap';
import Loader from 'components/Loader/Loader';
import useLocalStorage from 'utils/useLocalstorage';
import Avatar from 'components/Avatar/Avatar';
import EventsAttendedByMember from './EventsAttendedByMember';
import MemberAttendedEventsModal from './MemberAttendedEventsModal';
import {
  CalendarIcon,
  DatePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import convertToBase64 from 'utils/convertToBase64';
import sanitizeHtml from 'sanitize-html';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  educationGradeEnum,
  maritalStatusEnum,
  genderEnum,
  employmentStatusEnum,
} from 'utils/formEnumFields';
import DynamicDropDown from 'components/DynamicDropDown/DynamicDropDown';
import type { InterfaceEvent } from 'components/EventManagement/EventAttendance/InterfaceEvents';

type MemberDetailProps = {
  id?: string;
};

const MemberDetail: React.FC<MemberDetailProps> = ({ id }): JSX.Element => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'memberDetail',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t: tCommon } = useTranslation('common');
  const location = useLocation();
  const isMounted = useRef(true);
  const { getItem, setItem } = useLocalStorage();
  const [show, setShow] = useState(false);
  const currentUrl = location.state?.id || getItem('id') || id;
  document.title = t('title');
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    appLanguageCode: '',
    image: '',
    gender: '',
    birthDate: '2024-03-14',
    grade: '',
    empStatus: '',
    maritalStatus: '',
    phoneNumber: '',
    address: '',
    state: '',
    city: '',
    country: '',
    pluginCreationAllowed: false,
  });
  // Handle date change
  const handleDateChange = (date: Dayjs | null): void => {
    if (date) {
      setisUpdated(true);
      setFormState((prevState) => ({
        ...prevState,
        birthDate: dayjs(date).format('YYYY-MM-DD'), // Convert Dayjs object to JavaScript Date object
      }));
    }
  };
  const handleEditIconClick = () => {
    fileInputRef.current?.click();
  };
  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const { data: user, loading: loading } = useQuery(USER_DETAILS, {
    variables: { id: currentUrl }, // For testing we are sending the id as a prop
  });
  const userData = user?.user;
  console.log(userData?.user?.registeredEvents);
  const [eventsData, setEventsData] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [isUpdated, setisUpdated] = useState(false);
  const { data: events } = useQuery(EVENT_DETAILS, {
    variables: { id: userData?.user?.eventsAttended._id },
  });
  console.log(events);
  useEffect(() => {
    if (userData && isMounted) {
      setFormState({
        ...formState,
        firstName: userData?.user?.firstName,
        lastName: userData?.user?.lastName,
        email: userData?.user?.email,
        appLanguageCode: userData?.appUserProfile?.appLanguageCode,
        gender: userData?.user?.gender,
        birthDate: userData?.user?.birthDate || '2020-03-14',
        grade: userData?.user?.educationGrade,
        empStatus: userData?.user?.employmentStatus,
        maritalStatus: userData?.user?.maritalStatus,
        phoneNumber: userData?.user?.phone?.mobile,
        address: userData.user?.address?.line1,
        state: userData?.user?.address?.state,
        city: userData?.user?.address?.city,
        country: userData?.user?.address?.countryCode,
        pluginCreationAllowed: userData?.appUserProfile?.pluginCreationAllowed,
        image: userData?.user?.image || '',
      });
      setEventsData(events);
    }
  }, [userData, user]);
  useEffect(() => {
    // check component is mounted or not
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const { name, files } = e.target;
    if (name === 'photo' && files && files[0]) {
      const file = files[0];
      const base64 = await convertToBase64(file);
      setFormState((prevState) => ({
        ...prevState,
        image: base64 as string,
      }));
    } else {
      const { value } = e.target;
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
    setisUpdated(true);
  };
  const handleEventsAttendedModal = (): void => {
    setShow(!show);
  };

  const loginLink = async (): Promise<void> => {
    try {
      // console.log(formState);
      const firstName = formState.firstName;
      const lastName = formState.lastName;
      const email = formState.email;
      // const appLanguageCode = formState.appLanguageCode;
      const image = formState.image;
      // const gender = formState.gender;
      let toSubmit = true;
      if (firstName.trim().length == 0 || !firstName) {
        toast.warning('First Name cannot be blank!');
        toSubmit = false;
      }
      if (lastName.trim().length == 0 || !lastName) {
        toast.warning('Last Name cannot be blank!');
        toSubmit = false;
      }
      if (email.trim().length == 0 || !email) {
        toast.warning('Email cannot be blank!');
        toSubmit = false;
      }
      if (!toSubmit) return;
      try {
        const { data } = await updateUser({
          variables: {
            //! Currently only some fields are supported by the api
            id: currentUrl,
            ...formState,
          },
        });
        /* istanbul ignore next */
        if (data) {
          setisUpdated(false);
          if (getItem('id') === currentUrl) {
            setItem('FirstName', firstName);
            setItem('LastName', lastName);
            setItem('Email', email);
            setItem('UserImage', image);
          }
          toast.success('Successful updated');
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          errorHandler(t, error);
        }
      }
    } catch (error: unknown) {
      /* istanbul ignore next */
      if (error instanceof Error) {
        errorHandler(t, error);
      }
    }
  };
  const resetChanges = (): void => {
    setFormState({
      firstName: userData?.user?.firstName || '',
      lastName: userData?.user?.lastName || '',
      email: userData?.user?.email || '',
      appLanguageCode: userData?.appUserProfile?.appLanguageCode || '',
      image: userData?.user?.image || '',
      gender: userData?.user?.gender || '',
      empStatus: userData?.user?.employmentStatus || '',
      maritalStatus: userData?.user?.maritalStatus || '',
      phoneNumber: userData?.user?.phone?.mobile || '',
      address: userData?.user?.address?.line1 || '',
      country: userData?.user?.address?.countryCode || '',
      city: userData?.user?.address?.city || '',
      state: userData?.user?.address?.state || '',
      birthDate: userData?.user?.birthDate || '2024-03-14',
      grade: userData?.user?.educationGrade || '',
      pluginCreationAllowed:
        userData?.appUserProfile?.pluginCreationAllowed || false,
    });
    setisUpdated(false);
  };
  console.log(userData);
  if (loading) {
    return <Loader />;
  }

  const sanitizedSrc = sanitizeHtml(formState.image, {
    allowedTags: ['img'],
    allowedAttributes: {
      img: ['src', 'alt'],
    },
  });
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {show && (
        <MemberAttendedEventsModal
          eventsAttended={userData?.user?.eventsAttended}
          show={show}
          setShow={setShow}
        />
      )}
      <Row className="g-4 mt-1">
        <Col md={6}>
          <Card className={`${styles.allRound}`}>
            <Card.Header
              className={`bg-success text-white py-3 px-4 d-flex justify-content-between align-items-center ${styles.topRadius}`}
            >
              <h3 className="m-0">{t('personalDetailsHeading')}</h3>
              <Button
                variant="light"
                size="sm"
                disabled
                className="rounded-pill fw-bolder"
              >
                {userData?.appUserProfile?.isSuperAdmin
                  ? 'Super Admin'
                  : userData?.appUserProfile?.adminFor.length > 0
                    ? 'Admin'
                    : 'User'}
              </Button>
            </Card.Header>
            <Card.Body className="py-3 px-3">
              <div className="text-center mb-3">
                {formState?.image ? (
                  <div className="position-relative d-inline-block">
                    <img
                      className="rounded-circle"
                      style={{ width: '55px', aspectRatio: '1/1' }}
                      src={formState.image}
                      alt="User"
                      data-testid="userImagePresent"
                    />
                    <i
                      className="fas fa-edit position-absolute bottom-0 right-0 p-1 bg-white rounded-circle"
                      onClick={handleEditIconClick}
                      style={{ cursor: 'pointer' }}
                      title="Edit profile picture"
                    />
                  </div>
                ) : (
                  <div className="position-relative d-inline-block">
                    <Avatar
                      name={`${formState.firstName} ${formState.lastName}`}
                      alt="User Image"
                      size={150}
                      dataTestId="userImageAbsent"
                      radius={150}
                    />
                    <i
                      className="fas fa-edit position-absolute bottom-0 right-0 p-1 bg-white rounded-circle"
                      onClick={handleEditIconClick}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="orgphoto"
                  name="photo"
                  accept="image/*"
                  onChange={handleChange}
                  data-testid="organisationImage"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
              </div>
              <Row className="g-3">
                <Col md={6}>
                  <label htmlFor="firstName" className="form-label">
                    {tCommon('firstName')}
                  </label>
                  <input
                    id="firstName"
                    value={formState.firstName}
                    className={`form-control ${styles.inputColor}`}
                    type="text"
                    name="firstName"
                    onChange={handleChange}
                    required
                    placeholder={tCommon('firstName')}
                  />
                </Col>
                <Col md={6}>
                  <label htmlFor="lastName" className="form-label">
                    {tCommon('lastName')}
                  </label>
                  <input
                    id="lastName"
                    value={formState.lastName}
                    className={`form-control ${styles.inputColor}`}
                    type="text"
                    name="lastName"
                    onChange={handleChange}
                    required
                    placeholder={tCommon('lastName')}
                  />
                </Col>
                <Col md={6}>
                  <label htmlFor="gender" className="form-label">
                    {t('gender')}
                  </label>
                  <DynamicDropDown
                    formState={formState}
                    setFormState={setFormState}
                    fieldOptions={genderEnum}
                    fieldName="gender"
                  />
                </Col>
                <Col md={6}>
                  <label htmlFor="birthDate" className="form-label">
                    {t('birthDate')}
                  </label>
                  <DatePicker
                    className={`${styles.datebox} w-100`}
                    value={dayjs(formState.birthDate)}
                    onChange={handleDateChange}
                    data-testid="birthDate"
                    slotProps={{
                      textField: {
                        inputProps: {
                          'data-testid': 'birthDate',
                        },
                      },
                    }}
                  />
                </Col>
                <Col md={6}>
                  <label htmlFor="grade" className="form-label">
                    {t('educationGrade')}
                  </label>
                  <DynamicDropDown
                    formState={formState}
                    setFormState={setFormState}
                    fieldOptions={educationGradeEnum}
                    fieldName="grade"
                  />
                </Col>
                <Col md={6}>
                  <label htmlFor="empStatus" className="form-label">
                    {t('employmentStatus')}
                  </label>
                  <DynamicDropDown
                    formState={formState}
                    setFormState={setFormState}
                    fieldOptions={employmentStatusEnum}
                    fieldName="empStatus"
                  />
                </Col>
                <Col md={6}>
                  <label htmlFor="maritalStatus" className="form-label">
                    {t('maritalStatus')}
                  </label>
                  <DynamicDropDown
                    formState={formState}
                    setFormState={setFormState}
                    fieldOptions={maritalStatusEnum}
                    fieldName="maritalStatus"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className={`${styles.allRound}`}>
            <Card.Header
              className={`bg-success text-white py-3 px-4 ${styles.topRadius}`}
            >
              <h3 className="m-0">{t('contactInfoHeading')}</h3>
            </Card.Header>
            <Card.Body className="py-3 px-3">
              <Row className="g-3">
                <Col md={12}>
                  <label htmlFor="email" className="form-label">
                    {tCommon('email')}
                  </label>
                  <input
                    id="email"
                    value={formState.email}
                    className={`form-control ${styles.inputColor}`}
                    type="email"
                    name="email"
                    onChange={handleChange}
                    required
                    placeholder={tCommon('email')}
                  />
                </Col>
                <Col md={12}>
                  <label htmlFor="phoneNumber" className="form-label">
                    {t('phone')}
                  </label>
                  <input
                    id="phoneNumber"
                    value={formState.phoneNumber}
                    className={`form-control ${styles.inputColor}`}
                    type="tel"
                    name="phoneNumber"
                    onChange={handleChange}
                    placeholder={t('phone')}
                  />
                </Col>
                <Col md={12}>
                  <label htmlFor="address" className="form-label">
                    {tCommon('address')}
                  </label>
                  <input
                    id="address"
                    value={formState.address}
                    className={`form-control ${styles.inputColor}`}
                    type="text"
                    name="address"
                    onChange={handleChange}
                  />
                </Col>
                <Col md={12}>
                  <label htmlFor="country" className="form-label">
                    {t('countryCode')}
                  </label>
                  <input
                    id="country"
                    value={formState.country}
                    className={`form-control ${styles.inputColor}`}
                    type="text"
                    name="country"
                    onChange={handleChange}
                    placeholder={t('countryCode')}
                  />
                </Col>
                <Col md={6}>
                  <label htmlFor="city" className="form-label">
                    {t('city')}
                  </label>
                  <input
                    id="city"
                    value={formState.city}
                    className={`form-control ${styles.inputColor}`}
                    type="text"
                    name="city"
                    onChange={handleChange}
                    placeholder={t('city')}
                  />
                </Col>
                <Col md={6}>
                  <label htmlFor="state" className="form-label">
                    {t('state')}
                  </label>
                  <input
                    id="state"
                    value={formState.state}
                    className={`form-control ${styles.inputColor}`}
                    type="text"
                    name="state"
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        {isUpdated && (
          <Col md={12}>
            <Card.Footer className="bg-white border-top-0 d-flex justify-content-end gap-2 py-3 px-2">
              <Button variant="outline-secondary" onClick={resetChanges}>
                Reset Changes
              </Button>
              <Button variant="success" onClick={loginLink}>
                {tCommon('saveChanges')}
              </Button>
            </Card.Footer>
          </Col>
        )}
      </Row>

      {/* Actions */}
      {/* <div className={`personal mt-4 bg-white border ${styles.allRound}`}>
              <div
                className={`d-flex flex-column border-bottom py-3 px-4 ${styles.topRadius}`}
              >
                <h3>{t('actionsHeading')}</h3>
              </div>
              <div className="p-3">
                <div className="toggles">
                  <div className="d-flex flex-row">
                    <input
                      type="checkbox"
                      name="pluginCreationAllowed"
                      className={`mx-2 ${styles.noOutline}`}
                      checked={formState.pluginCreationAllowed}
                      onChange={handleToggleChange} // API not supporting this feature
                      data-testid="pluginCreationAllowed"
                      placeholder="pluginCreationAllowed"
                    />
                    <p className="p-0 m-0">
                      {`${t('pluginCreationAllowed')} (API not supported yet)`}
                    </p>
                  </div>
                </div>
                <div className="buttons d-flex flex-row gap-3 mt-2">
                  <div className={styles.dispflex}>
                    <div>
                      <label>
                        {t('appLanguageCode')} <br />
                        {`(API not supported yet)`}
                        <select
                          className="form-control"
                          data-testid="applangcode"
                          onChange={(e): void => {
                            setFormState({
                              ...formState,
                              appLanguageCode: e.target.value,
                            });
                          }}
                        >
                          {languages.map((language, index: number) => (
                            <option key={index} value={language.code}>
                              {language.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                  <div className="d-flex flex-column">
                    <label htmlFor="">
                      {t('deleteUser')}
                      <br />
                      {`(API not supported yet)`}
                    </label>
                    <Button className="btn btn-danger" data-testid="deleteBtn">
                      {t('deleteUser')}
                    </Button>
                  </div>
                </div>
              </div>
            </div> */}
      {/* <div className="buttons mt-4">
              <Button
                type="button"
                className={styles.greenregbtn}
                value="savechanges"
                onClick={loginLink}
              >
                {tCommon('saveChanges')}
              </Button>
            </div> */}
      <Card className={`${styles.contact} ${styles.allRound} mt-3`}>
        <Card.Header
          className={`bg-primary d-flex justify-content-between align-items-center py-3 px-4 ${styles.topRadius}`}
        >
          <h3 className="text-white m-0">{t('eventsAttended')}</h3>
          <Button
            style={{ borderRadius: '20px' }}
            size="sm"
            variant="light"
            data-testid="viewAllEvents"
            onClick={handleEventsAttendedModal}
          >
            {t('viewAll')}
          </Button>
        </Card.Header>
        <Card.Body
          className={`${styles.cardBody} ${styles.scrollableCardBody}`}
        >
          {loadingEvents ? (
            [...Array(8)].map((_, index) => <CardItemLoading key={index} />)
          ) : userData?.user?.eventsAttended.length === 0 ? (
            <div className={styles.emptyContainer}>
              <h6>{t('noEventsAttended')}</h6>
            </div>
          ) : (
            userData?.user?.eventsAttended
              .slice(0, 5)
              .map((event: InterfaceEvent, index: number) => (
                <EventsAttendedByMember eventsId={event._id} key={index} />
              ))
          )}
        </Card.Body>
      </Card>
    </LocalizationProvider>
  );
};

export const prettyDate = (param: string): string => {
  const date = new Date(param);
  if (date?.toDateString() === 'Invalid Date') {
    return 'Unavailable';
  }
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};
export const getLanguageName = (code: string): string => {
  let language = 'Unavailable';
  languages.map((data) => {
    if (data.code == code) {
      language = data.name;
    }
  });
  return language;
};

export default MemberDetail;
