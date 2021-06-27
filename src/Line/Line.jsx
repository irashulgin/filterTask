import React, { useState } from "react";
import "antd/dist/antd.css";
import { fieldType } from "../consts";
import { StyleDiv, Button } from "./LineStyle";
import SelectField from "../SelectField/SelectField";

const Line = ({
  field,
  value,
  index,
  operator,
  onDelete,
  onChange,
  fieldList,
}) => {
  const type = field || "";
  if (field !== "") {
    fieldList = fieldList.filter((i) => {
      return i !== field;
    });
  }
  const [operatorList, setOperatorList] = useState(
    fieldType[type]?.operators ?? []
  );
  const [valuesList, setValuesList] = useState(fieldType[type]?.values ?? []);
  const changeFieldType = (type, previosType) => {
    setOperatorList(fieldType[type].operators);
    setValuesList(fieldType[type].values);
    onChange(index, "field", type, previosType);
  };
  return (
    <StyleDiv>
      <SelectField
        placeholder="Field"
        items={fieldList}
        value={field}
        onChange={(e) => changeFieldType(e, field)}
      />
      <SelectField
        placeholder="Operator"
        items={operatorList}
        value={operator}
        onChange={(e) => {
          onChange(index, "operator", e);
        }}
      />
      <SelectField
        items={valuesList}
        placeholder="Value"
        value={value}
        mode="multiple"
        onChange={(e) => onChange(index, "value", e, value)}
      />
      <Button onClick={(e) => onDelete(e, index)}>x</Button>
    </StyleDiv>
  );
};

export default Line;
