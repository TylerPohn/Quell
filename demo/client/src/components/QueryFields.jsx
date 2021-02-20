import React, { useState, useEffect, useRef } from 'react';
import QueryField from './QueryField';
import DropdownItem from './DropdownItem';
import CitiesFields from './CitiesFields';
// imported images
import Minus from '../images/buttons/minus-button.svg';
import MinusHover from '../images/buttons/minus-button-hover.svg';
import Plus from '../images/buttons/plus-button.svg';
import PlusHover from '../images/buttons/plus-button-hover.svg';

/*
  - This component renders each field in your query
  - It is called from DemoInput in the container folder
  - It is recursively called when you add the "cities" field in the "countries" query
*/

// I don't know where in the file to set queryingCities equal to true so that it doesn't render ID after that
// maybe just set a timer?? so that it runs after the first time we build the recursive queryFields component

const QueryFields = (props) => {
  const { initialField, type, sub, outputFunction } = props; // import props

  const [queryList, setQueryList] = useState(['id']);
  const [availableList, setAvailableList] = useState([]);
  const [plusDropdown, togglePlusDropdown] = useState(false);
  const [subQuery, setSubQuery] = useState(sub); // is true when we render this recursively for the "cities" field inside "countries" query
  const [citiesFields, setCitiesFields] = useState(['id']);

  // ====================================================================== //
  // ======= Functionality to close dropdowns when clicking outside ======= //
  // ====================================================================== //

  // attach "ref = {ref}" to the dropdown
  const ref = useRef(null);

  // makes it so when you click outside of a dropdown it goes away
  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      togglePlusDropdown(false);
    }
  };

  // listens for clicks on the body of the dom
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  // ========================================================== //
  // ======= Functionality to initialize dropdowns, etc ======= //
  // ========================================================== //

  // initializes the available fields list based on the initialField prop
  useEffect(() => {
    setAvailableList(initialAvailableList());
  }, []);

  // ====== Lists of Fields ====== //

  const cityFields = [
    { country_id: 'string' },
    // { id: "string" }, // commented out because we're making it an immutable field
    { name: 'string' },
    { population: 'string' },
  ];

  const countryFields = [
    // { id: "string" },
    { name: 'string' },
    { capital: 'string' },
    { cities: cityFields }, // if field is array, point to the list of fields
  ];

  // decides whether to populate dropdowns with Country or City fields, based on type prop
  const initialAvailableList = () => {
    if (type === 'Country') return convertIntoList(countryFields);
    if (type === 'City') return convertIntoList(cityFields);
  };

  // Takes the items list and returns something like: [ id, name, capital, cities ]
  const convertIntoList = (itemList) => {
    const output = itemList.map((obj) => {
      // creates array based on keys of objects in fields array
      let key = Object.keys(obj)[0];
      return key;
    });
    const noDuplicates = []; // get rid of potential duplicates
    output.forEach((el) => {
      queryList.forEach((qEl) => {
        if (el !== qEl) noDuplicates.push(el);
      });
    });
    return noDuplicates;
  };

  // ==================================== //
  // ======= Buttons Functionality ====== //
  // ==================================== //

  //======= Minus button ========//
  function deleteItem(item) {
    // THIS UNINTENTIONALLY RESETS CITIES
    // remove item from queryList
    const newList = [...queryList];
    const index = newList.indexOf(item);
    newList.splice(index, 1);
    setQueryList(newList);
    // add item to availableList
    const newAvailableList = [...availableList];
    newAvailableList.push(item);
    setAvailableList(newAvailableList);
    // calls a function that prepares the query for actually being sent
    if (sub) {
      outputFunction(0, newList, 0);
    } else {
      outputFunction(newList, 0, 0);
    }
  }

  //======= Plus button ========//
  function addItem(item) {
    // add item to queryList
    const newList = [...queryList];
    newList.push(item);
    setQueryList(newList);
    // remove item from availableList
    const newAvailablelist = [...availableList];
    const index = newAvailablelist.indexOf(item);
    newAvailablelist.splice(index, 1);
    setAvailableList(newAvailablelist);
    // close the plus dropdown
    togglePlusDropdown(false);
    // call a function that prepares the query for actually being sent
    if (sub) {
      outputFunction(0, newList, 0);
    } else {
      outputFunction(newList, 0, 0);
    }
  }

  // Add item to cities field
  // Delete item from cities field
  const modifyCitiesFields = (item, addOrDelete) => {
    const newFields = [...citiesFields];
    if (addOrDelete === 'add') {
      newFields.push(item);
    }
    if (addOrDelete === 'delete') {
      const index = newFields.indexOf(item);
      newFields.splice(index, 1);
    }
    setCitiesFields(newFields);
  };

  // Fires when you click plus -- only show plus dropdown if there's something in the list
  const dropPlus = () => {
    if (availableList.length > 0) {
      togglePlusDropdown(!plusDropdown);
    }
  };

  // =========================== //
  // ===== RENDER / RETURN ===== //
  // =========================== //

  // prepare some characters
  const ob = '{',
    cb = '}',
    tab = <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>,
    space = <span>&nbsp;</span>;

  // Render the query list to the DOM
  const queriedItems = queryList.map((item, i) => {
    // if querying "cities", need to open up a new pair of brackets and recursively call QueryFields to generate cities fields
    if (item === 'cities' && !sub) {
      return (
        <div key={i}>
          <div className="queryLine">
            {tab}
            {tab}
            <button className="minus-button" onClick={() => deleteItem(item)}>
              <div className="plus-minus-icons">
                <img src={Minus} />
                <img src={MinusHover} className="hover-button" />
              </div>
            </button>
            {space}cities{space}
            {ob}
          </div>
          <div className="queryLine">
            <CitiesFields
              citiesFields={citiesFields}
              type={'City'}
              outputFunction={outputFunction}
              sub={true}
              modifyCitiesFields={modifyCitiesFields}
            />
            {/* {queryingCities &&
            <QueryFields
              type={'City'}
              outputFunction={outputFunction}
              sub={true}
            />
            }
            {!queryingCities &&
              <QueryFields
                type={'City'}
                outputFunction={outputFunction}
                sub={true}
              />
            } */}
          </div>
          <div className="queryLine">
            {tab}
            {tab}
            {cb}
          </div>
        </div>
      );
    }
    // else (what normally happens)
    return (
      <QueryField
        item={item}
        key={`${type}Field${i}`}
        deleteItem={deleteItem}
        sub={sub}
      />
    );
  });

  // Render dropdown menu from the available list
  const dropdown = availableList.map((item, i) => {
    return (
      <DropdownItem func={addItem} item={item} key={`Available${type}${i}`} />
    );
  });

  // note: the "sub" tags are conditionally rendered only when we're in the cities field INSIDE the countries query
  return (
    <>
      {/* List all the chosen query fields */}
      <div className="queryLinesContainer">{queriedItems}</div>

      {tab}
      {tab}
      {sub && <>{tab}</>}
      {/* Render plus sign, which opens a dropdown */}
      <button className="plus-button" onClick={dropPlus}>
        <div className="plus-minus-icons">
          <img src={Plus} />
          <img src={PlusHover} className="hover-button" />
        </div>
        {plusDropdown && (
          <div className="dropdown-menu" ref={ref}>
            {dropdown}
          </div>
        )}
      </button>
    </>
  );
};

export default QueryFields;
