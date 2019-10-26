import React from "react";
import PropTypes from "prop-types";

function Checkbox(props) {
  const { data, handleSelect, id } = props;

  return (
    <div>
      <input type="checkbox" onChange={handleSelect} id={id} />
      <label name={data.name}>{data.name}</label>
    </div>
  );
}

Checkbox.propTypes = {
  data: PropTypes.object.isRequired,
  handleSelect: PropTypes.func.isRequired,
  id: PropTypes.number.isRequired
};

export default Checkbox;
