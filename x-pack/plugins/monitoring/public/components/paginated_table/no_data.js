import React from 'react';
import { DEFAULT_NO_DATA_MESSAGE } from '../../../common/constants';

export function NoData(props) {
  const colSpan = props.columns.length;
  const message = props.message || DEFAULT_NO_DATA_MESSAGE;
  return (
    <tbody>
      <tr>
        <td colSpan={ colSpan } className="loading">
          <span>{ message }</span>
        </td>
      </tr>
    </tbody>
  );
}
