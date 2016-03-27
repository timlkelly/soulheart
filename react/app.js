/* eslint react/prop-types: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';

import Contributors from './components/Contributors';


ReactDOM.render(
  <div>
    <Contributors label="Contributors (Async)" />
    {/*
    <SelectedValuesField label="Option Creation (tags mode)" options={FLAVOURS} allowCreate hint="Enter a value that's NOT in the list, then hit return" />
    */}
  </div>,
  document.getElementById('example')
);
