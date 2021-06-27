import Line from "../Line/Line";
import { useState } from "react";
import { fieldType, getAbsentValues } from "../consts";
import { Style, Button, ButtonSearch, StyledDiv } from "./FilterStyle";
import { notification } from "antd";

  /**
   * Open notification
   * @param {string} type
   * @param {string} content
   */
   const openNotification = (type, content) => {
    notification[type]({
      message: "",
      description: `${content}`,
    });
  };
  
const Filter = () => {
  //Set query list from local storage
  const [queryList, setQueryList] = useState(
    JSON.parse(localStorage.getItem("query")) || [
      { field: "", value: [], operator: "" },
    ]
  );
  //Set initial field names
  const initialFields = Object.keys(fieldType).filter((item) => {
    return item !== "State" && item !== "ID";
  });
  const fieldNames = localStorage.getItem("query")
    ? getAbsentValues(initialFields, JSON.parse(localStorage.getItem("query")))
    : initialFields;
  const [fieldList, setFieldList] = useState(fieldNames);


  /**
   * Changing the item in the line
   * @param {number} index
   * @param {string} name
   * @param {string|string[]} value
   * @param {string|undefined} previous
   */
  const changeItem = (index, name, value, previous) => {
    setQueryList((list) => {
      const newList = [...list];
      newList[index][name] = value;
      if (name === "field") {
        resetDependancies(newList, index);
        changeFields(value, previous);
      }
      if (name === "value") {
        changeOthersAfterValueChange(value, previous);
      }
      return newList;
    });
  };

  /**
   * Add new empty line
   */
  const addLine = () => {
    if (fieldList.length === 0) {
      return;
    }
    setQueryList((list) => {
      const newList = [...list];
      newList.push({ field: "", value: [], operator: "" });
      return newList;
    });
  };
  
  /**
   * Delete line
   * @param {event} event
   * @param {number} index
   */
  const deleteLine = (event, index) => {
    if (queryList.length < 2) {
      openNotification("warning", "You can not remove the last line");
      return;
    }
    setQueryList((list) => {
      const newList = [...list];
      const deletedField = newList[index].field;
      const deletedValue = newList[index].value;
      // Add field back to fields list
      addFieldToOptions(deletedField);
      // Delete line from list
      newList.length > 1 && newList.splice(index, 1);
      checkConstrains(deletedField, deletedValue);
      return newList;
    });
  };

  /**
   * Add field to field list after deleting
   * @param {string} deletedField
   */
  function addFieldToOptions(deletedField) {
    setFieldList((fieldList) => {
      let fList = [...fieldList];
      fList.push(deletedField);
      return fList;
    });
  }

  /**
   * Check if query list has line with value
   * @param {string} value 
   * @returns 
   */
  function queryHasValue(value) {
    return queryList.find((item) => item.value.includes(value));
  }

  /**
   * Check if query list has line with field
   * @param {string} field 
   * @returns 
   */
  function queryHasField(field) {
    return queryList.find((item) => item.field === field);
  }

  function TeamInFields() {
    return fieldList.includes("Team");
  }
  /**
   * Update fields after deleting line
   * @param {string} deletedField
   * @param {string} deletedValue
   */
  function checkConstrains(deletedField, deletedValue) {
    if (deletedField === "Team") {
      addField("Created By");
      if (queryHasValue("Backlog")) {
        addField("ID");
      }
    }
    if (deletedField === "Created By" || deletedField === "ID") {
      addField("Team");
    }
    if (deletedValue.includes("Backlog")) {
      if (!TeamInFields()) {
        addField("Team");
      }
      removeFromQuery("ID");
      removeFromFields("ID");
    }
    if (deletedValue.includes("Bug")) {
      removeFromQuery("State");
      removeFromFields("State");
    }
  }

  /**
   * Remove from field list
   * @param {string} name
   */
  function removeFromFields(name) {
    setFieldList((l) => {
      let newList = [...l];
      newList = newList.filter((i) => {
        return i !== name;
      });
      return newList;
    });
  }
  /**
   * Remove line from query list according the name
   * @param {string} name - field name
   */
  function removeFromQuery(name) {
    setQueryList((list) => {
      let newList = [...list];
      newList = newList.filter((i) => {
        return i.field !== name;
      });
      return newList;
    });
  }
  /**
   * Add field to fields list
   * @param {string} name - field name
   */
  function addField(name) {
    setFieldList((l) => {
      let newList = [...l];
      if (!newList.includes(name) && !queryHasField(name)) {
        newList.push(name);
      }
      return newList;
    });
  }

  /**
   * Reset operator and value for the selected index
   * @param {string[]} newList
   * @param {number} index
   */
  function resetDependancies(newList, index) {
    newList[index]["operator"] = "";
    newList[index]["value"] = [];
  }

  /**
   *
   * @param {string[]} values
   * @param {string} value
   * @param {string} field
   */
  function updateFieldPerValue(values, value, field) {
    if (values.includes(value)) {
      addField(field);
    }
  }

  /**
   * Remove field/line after value has been changed
   * @param {string} values
   * @param {string} value
   * @param {string} field
   * @param {string} previous
   */
  function removeFieldPerValue(values, value, field, previous) {
    if (previous.includes(value) && !values.includes(value)) {
      removeFromFields(field);
      removeFromQuery(field);
    }
  }
  /**
   * Change fields after some field in query list has been changed
   * @param {string} values
   * @param {string} previous
   */
  function changeOthersAfterValueChange(values, previous) {
    updateFieldPerValue(values, "Bug", "State");
    updateFieldPerValue(values, "Backlog", "ID");
    removeFieldPerValue(values, "Backlog", "ID", previous);
    removeFieldPerValue(values, "Bug", "State", previous);
    if (previous.includes("Backlog") && !values.includes("Backlog")) {
      addField("Team");
    }
  }

  /**
   * Update other fields and query list according the value
   * @param {string} value
   */
  function updateFields(value) {
    switch (value) {
      case "ID":
      case "Created By": {
        removeFromFields("Team");
        removeFromQuery("Team");
        break;
      }
      case "Team": {
        removeFromFields("Created By");
        removeFromQuery("Created By");
        removeFromFields("ID");
        removeFromQuery("ID");
        break;
      }
      default:
        break;
    }
  }
  /**
   * Changing the field list after editing field in line
   * @param {string} value
   * @param {string} prev
   */
  function changeFields(value, prev) {
    if (prev !== "") {
      addField(prev);
    }
    removeFromFields(value);
    updateFields(value);
    if (prev === "Team") {
      addField("Created By");
      if (queryHasValue("Backlog")) {
        addField("ID");
      }
    }
    if (prev === "Created By" || prev === "ID") {
      addField("Team");
    }
  }

  /**
   * Save query to localstorage
   */
  const search = () => {
    setQueryList((list) => {
      localStorage.setItem("query", JSON.stringify(list));
      return list;
    });
    openNotification("success", "The query has been saved!");
  };

  return (
    <Style>
      {queryList.map((item, index) => (
        <Line
          field={item.field}
          onDelete={deleteLine}
          key={index}
          operator={item.operator}
          onChange={changeItem}
          value={item.value}
          index={index}
          fieldList={fieldList}
        />
      ))}
      <StyledDiv>
        {fieldList.length > 0 && (
          <Button onClick={addLine}>+ Add Criteria</Button>
        )}
      </StyledDiv>
      <StyledDiv>
        <ButtonSearch onClick={search}>Search</ButtonSearch>
      </StyledDiv>
    </Style>
  );
};
export default Filter;
