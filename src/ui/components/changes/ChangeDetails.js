import React from "react";

import ChangeRowsReason from "./ChangeRowsReason";

const ChangeDetails = ({ details }) => {
  return (
    <tr>
      <td />
      <td colSpan={3}>
        <table className="table-change-details">
          <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Previous => Next</th>
          </tr>
          </thead>
          <tbody>
          {details.props && <ChangeRowsReason data={details.props} type="Props" />}
          {details.state && <ChangeRowsReason data={details.state} type="State" />}
          {details.hooks && <ChangeRowsReason data={details.hooks} type="Hooks" />}
          </tbody>
        </table>
      </td>
    </tr>
  );
};

export default ChangeDetails;